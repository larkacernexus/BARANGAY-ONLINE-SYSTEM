<?php

namespace App\Http\Controllers\ResidentSettings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Inertia\Inertia;

class ResidentTwoFactorAuthenticationController extends Controller
{
    protected $maxAttempts;
    protected $decayMinutes;
    
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->maxAttempts = config('auth.two_factor.max_attempts', 5);
        $this->decayMinutes = config('auth.two_factor.decay_minutes', 1);
        
        // LOGIC NOTE: PortalMiddleware already verifies Household Head role
        // No additional middleware needed here
    }
    
    /**
     * Get Google2FA instance
     */
    private function getGoogle2FA(): Google2FA
    {
        $google2fa = new Google2FA();
        
        // SECURITY NOTE: Configure for production use
        $google2fa->setAlgorithm('sha256');
        $google2fa->setWindow(config('auth.two_factor.window', 2));
        
        return $google2fa;
    }

    /**
     * Show 2FA settings page for residents
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        // SECURITY NOTE: Defense-in-depth role verification
        $this->verifyHouseholdHeadRole($user);
        
        // LOGIC NOTE: Check if user needs to set up 2FA
        $requiresTwoFactor = config('auth.two_factor.required', false);
        $gracePeriod = config('auth.two_factor.grace_period_days', 7);
        $userNeedsToSetup = $requiresTwoFactor && 
                           empty($user->two_factor_confirmed_at) &&
                           $user->created_at->diffInDays(now()) > $gracePeriod;
        
        $twoFactorEnabled = $this->isTwoFactorEnabled($user);
        $requiresConfirmation = $this->requiresTwoFactorConfirmation($user);
        
        // SECURITY NOTE: Only expose minimal necessary data
        $initialSetupData = null;
        
        if ($requiresConfirmation) {
            try {
                $secret = $this->getTwoFactorSecret($user);
                $qrCodeSvg = $this->generateQrCodeSvg($secret, $user->email);
                $initialSetupData = [
                    'qrCodeSvg' => $qrCodeSvg,
                    'manualSetupKey' => $this->formatSecretForDisplay($secret),
                ];
            } catch (\Exception $e) {
                Log::error('Failed to generate QR code for existing setup', [
                    'user_id' => $user->id,
                    'error_message' => $e->getMessage()
                ]);
                
                // LOGIC NOTE: Clear invalid setup data
                DB::transaction(function () use ($user) {
                    $this->clearTwoFactorData($user);
                });
            }
        }
        
        return Inertia::render('residentsettings/two-factor', [
            'twoFactorEnabled' => $twoFactorEnabled,
            'requiresConfirmation' => $requiresConfirmation,
            'initialSetupData' => $initialSetupData,
            'requiresTwoFactor' => $requiresTwoFactor,
            'userNeedsToSetup' => $userNeedsToSetup,
            'lastUsedAt' => $user->two_factor_last_used_at?->diffForHumans(),
            'backupCodesRemaining' => $this->getRemainingRecoveryCodes($user),
        ]);
    }

    /**
     * Enable 2FA (generate QR code)
     */
    public function enable(Request $request)
    {
        $user = $request->user();
        
        // SECURITY NOTE: Defense-in-depth role verification
        $this->verifyHouseholdHeadRole($user);
        
        // SECURITY NOTE: Rate limiting
        $rateLimitKey = 'enable-2fa:' . $user->id . ':' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($rateLimitKey, $this->maxAttempts)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            
            Log::warning('2FA enable rate limit exceeded', [
                'user_id' => $user->id,
                'ip' => $request->ip()
            ]);
            
            return back()->with('error', "Too many attempts. Try again in {$seconds} seconds.");
        }
        
        RateLimiter::hit($rateLimitKey, $this->decayMinutes * 60);
        
        // Check if already enabled
        if ($this->isTwoFactorEnabled($user)) {
            return back()->with('error', 'Two-factor authentication is already enabled.');
        }
        
        DB::beginTransaction();
        
        try {
            // Handle existing unconfirmed secret
            if ($this->requiresTwoFactorConfirmation($user)) {
                try {
                    $secret = $this->getTwoFactorSecret($user);
                    
                    if (!$this->validateSecretFormat($secret)) {
                        throw new \Exception('Invalid secret format');
                    }
                } catch (\Exception $e) {
                    Log::warning('Invalid existing 2FA secret, generating new', [
                        'user_id' => $user->id
                    ]);
                    $secret = $this->generateNewSecret($user);
                }
            } else {
                $secret = $this->generateNewSecret($user);
            }
            
            $qrCodeSvg = $this->generateQrCodeSvg($secret, $user->email);
            
            DB::commit();
            RateLimiter::clear($rateLimitKey);
            
            return back()->with([
                'success' => 'Scan the QR code with your authenticator app.',
                'qrCodeData' => [
                    'qrCodeSvg' => $qrCodeSvg,
                    'manualSetupKey' => $this->formatSecretForDisplay($secret),
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('2FA enable failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->with('error', 'Failed to initialize 2FA setup. Please try again.');
        }
    }

    /**
     * Confirm 2FA setup
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6|regex:/^[0-9]{6}$/',
        ]);
        
        $user = $request->user();
        
        // SECURITY NOTE: Defense-in-depth role verification
        $this->verifyHouseholdHeadRole($user);
        
        // SECURITY NOTE: Rate limiting for confirmation
        $rateLimitKey = 'confirm-2fa:' . $user->id . ':' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            return back()->with('error', "Too many failed attempts. Try again in {$seconds} seconds.");
        }
        
        RateLimiter::hit($rateLimitKey, 300);
        
        if (!$this->requiresTwoFactorConfirmation($user)) {
            return back()->withErrors(['code' => 'No pending setup found.']);
        }
        
        try {
            $secret = $this->getTwoFactorSecret($user);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt 2FA secret', ['user_id' => $user->id]);
            
            DB::transaction(function () use ($user) {
                $this->clearTwoFactorData($user);
            });
            
            return back()->with('error', 'Setup session expired. Please start over.');
        }
        
        $google2fa = $this->getGoogle2FA();
        $valid = $google2fa->verifyKey($secret, $request->code);
        
        if (!$valid) {
            Log::warning('Invalid 2FA confirmation code', [
                'user_id' => $user->id,
                'ip' => $request->ip()
            ]);
            
            return back()->withErrors(['code' => 'Invalid verification code.']);
        }
        
        DB::beginTransaction();
        
        try {
            $recoveryCodes = $this->generateRecoveryCodes();
            
            // SECURITY NOTE: Hash recovery codes before storage
            $hashedRecoveryCodes = array_map(function ($code) {
                return Hash::make($code);
            }, $recoveryCodes);
            
            $user->update([
                'two_factor_recovery_codes' => Crypt::encryptString(json_encode($hashedRecoveryCodes)),
                'two_factor_confirmed_at' => now(),
                'two_factor_enabled_at' => now(),
                'two_factor_last_used_at' => null,
            ]);
            
            Log::info('2FA enabled for user', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'role' => $user->role->name ?? 'unknown'
            ]);
            
            DB::commit();
            RateLimiter::clear($rateLimitKey);
            
            return back()->with([
                'success' => 'Two-factor authentication enabled successfully!',
                'recoveryCodes' => $recoveryCodes,
                'showRecoveryCodes' => true,
                'warning' => 'Save these recovery codes securely. They will not be shown again.'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('2FA confirmation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->with('error', 'Failed to complete 2FA setup. Please try again.');
        }
    }

    /**
     * Cancel 2FA setup
     */
    public function cancelSetup(Request $request)
    {
        $request->validate([
            'password' => 'required|string|current_password',
        ]);
        
        $user = $request->user();
        
        // SECURITY NOTE: Defense-in-depth role verification
        $this->verifyHouseholdHeadRole($user);
        
        if (!$this->requiresTwoFactorConfirmation($user)) {
            return back()->with('error', 'No pending setup to cancel.');
        }
        
        DB::transaction(function () use ($user, $request) {
            $this->clearTwoFactorData($user);
            
            Log::info('2FA setup cancelled', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'role' => $user->role->name ?? 'unknown'
            ]);
        });
        
        return back()->with('success', 'Setup cancelled successfully.');
    }

    /**
     * Disable 2FA
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|string|current_password',
            'confirmation' => 'required|accepted',
        ]);
        
        $user = $request->user();
        
        // SECURITY NOTE: Defense-in-depth role verification
        $this->verifyHouseholdHeadRole($user);
        
        if (!$this->isTwoFactorEnabled($user)) {
            return back()->with('error', 'Two-factor authentication is not enabled.');
        }
        
        // SECURITY NOTE: Require 2FA code to disable if configured
        if (config('auth.two_factor.require_2fa_to_disable', true)) {
            $request->validate([
                'two_factor_code' => 'required|string|size:6',
            ]);
            
            if (!$this->verifyTwoFactorCode($user, $request->two_factor_code)) {
                Log::warning('Failed 2FA verification during disable', [
                    'user_id' => $user->id,
                    'ip' => $request->ip()
                ]);
                
                return back()->withErrors(['two_factor_code' => 'Invalid verification code.']);
            }
        }
        
        DB::beginTransaction();
        
        try {
            Log::warning('2FA disabled - SECURITY EVENT', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'role' => $user->role->name ?? 'unknown',
                'timestamp' => now()->toIso8601String()
            ]);
            
            $this->clearTwoFactorData($user);
            
            DB::commit();
            
            return back()->with([
                'success' => 'Two-factor authentication has been disabled.',
                'warning' => 'Your account security has been reduced.'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('2FA disable failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->with('error', 'Failed to disable 2FA. Please try again.');
        }
    }

    /**
     * Regenerate recovery codes
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $request->validate([
            'password' => 'required|string|current_password',
            'confirmation' => 'required|accepted',
        ]);
        
        $user = $request->user();
        
        // SECURITY NOTE: Defense-in-depth role verification
        $this->verifyHouseholdHeadRole($user);
        
        if (!$this->isTwoFactorEnabled($user)) {
            return back()->with('error', 'Two-factor authentication is not enabled.');
        }
        
        // SECURITY NOTE: Verify 2FA code for this sensitive operation
        if (config('auth.two_factor.require_2fa_for_recovery_regeneration', true)) {
            $request->validate([
                'two_factor_code' => 'required|string|size:6',
            ]);
            
            if (!$this->verifyTwoFactorCode($user, $request->two_factor_code)) {
                return back()->withErrors(['two_factor_code' => 'Invalid verification code.']);
            }
        }
        
        DB::beginTransaction();
        
        try {
            $recoveryCodes = $this->generateRecoveryCodes();
            
            $hashedRecoveryCodes = array_map(function ($code) {
                return Hash::make($code);
            }, $recoveryCodes);
            
            $user->update([
                'two_factor_recovery_codes' => Crypt::encryptString(json_encode($hashedRecoveryCodes)),
                'two_factor_used_recovery_codes' => null,
            ]);
            
            Log::warning('Recovery codes regenerated', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'role' => $user->role->name ?? 'unknown'
            ]);
            
            DB::commit();
            
            return back()->with([
                'success' => 'Recovery codes regenerated successfully!',
                'recoveryCodes' => $recoveryCodes,
                'showRecoveryCodes' => true,
                'warning' => 'Previous recovery codes are now invalid.'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Recovery codes regeneration failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->with('error', 'Failed to regenerate recovery codes. Please try again.');
        }
    }

    /**
     * Verify user has Household Head role
     * 
     * SECURITY NOTE: Defense-in-depth check
     */
    private function verifyHouseholdHeadRole($user): void
    {
        if (!$user->role || $user->role->name !== 'Household Head') {
            Log::warning('Unauthorized 2FA access attempt', [
                'user_id' => $user->id,
                'role' => $user->role->name ?? 'none',
                'ip' => request()->ip()
            ]);
            
            abort(403, 'Only Household Heads can manage 2FA settings.');
        }
    }

    /**
     * Helper: Check if 2FA is fully enabled
     */
    private function isTwoFactorEnabled($user): bool
    {
        return !empty($user->two_factor_secret) && 
               !empty($user->two_factor_confirmed_at);
    }

    /**
     * Helper: Check if 2FA requires confirmation
     */
    private function requiresTwoFactorConfirmation($user): bool
    {
        return !empty($user->two_factor_secret) && 
               empty($user->two_factor_confirmed_at);
    }

    /**
     * Helper: Get decrypted 2FA secret
     */
    private function getTwoFactorSecret($user): string
    {
        if (empty($user->two_factor_secret)) {
            throw new \Exception('No 2FA secret found');
        }
        
        return Crypt::decryptString($user->two_factor_secret);
    }

    /**
     * Helper: Get remaining recovery codes count
     */
    private function getRemainingRecoveryCodes($user): int
    {
        if (!$this->isTwoFactorEnabled($user) || empty($user->two_factor_recovery_codes)) {
            return 0;
        }
        
        try {
            $hashedCodes = json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true);
            $usedCodes = $user->two_factor_used_recovery_codes ?? [];
            
            return count($hashedCodes) - count($usedCodes);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Helper: Generate new 2FA secret and store it
     */
    private function generateNewSecret($user): string
    {
        $google2fa = $this->getGoogle2FA();
        $secret = $google2fa->generateSecretKey(32);
        
        $user->update([
            'two_factor_secret' => Crypt::encryptString($secret),
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_enabled_at' => null,
            'two_factor_last_used_at' => null,
            'two_factor_used_recovery_codes' => null,
        ]);
        
        return $secret;
    }

    /**
     * Helper: Clear all 2FA data
     */
    private function clearTwoFactorData($user): void
    {
        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_enabled_at' => null,
            'two_factor_last_used_at' => null,
            'two_factor_used_recovery_codes' => null,
        ]);
    }

    /**
     * Generate QR code SVG
     */
    private function generateQrCodeSvg(string $secret, string $email): string
    {
        $appName = $this->sanitizeStringForUrl(config('app.name', 'Application'));
        $issuer = $this->sanitizeStringForUrl(config('auth.two_factor.issuer', $appName));
        $sanitizedEmail = filter_var($email, FILTER_SANITIZE_EMAIL);
        
        $qrCodeUrl = $this->getGoogle2FA()->getQRCodeUrl(
            $issuer,
            $sanitizedEmail,
            $secret
        );
        
        $size = config('auth.two_factor.qr_code_size', 200);
        $renderer = new ImageRenderer(
            new RendererStyle($size),
            new SvgImageBackEnd()
        );
        
        $writer = new Writer($renderer);
        return $writer->writeString($qrCodeUrl);
    }

    /**
     * Generate recovery codes
     */
    private function generateRecoveryCodes(): array
    {
        $count = config('auth.two_factor.recovery_codes_count', 8);
        $length = config('auth.two_factor.recovery_code_length', 10);
        
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $bytes = random_bytes(ceil($length / 2));
            $code = strtoupper(substr(bin2hex($bytes), 0, $length));
            $codes[] = implode('-', str_split($code, 5));
        }
        
        return $codes;
    }

    /**
     * Verify 2FA code for current user
     */
    private function verifyTwoFactorCode($user, string $code): bool
    {
        try {
            $secret = $this->getTwoFactorSecret($user);
            return $this->getGoogle2FA()->verifyKey($secret, $code);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Validate secret format
     */
    private function validateSecretFormat(string $secret): bool
    {
        return preg_match('/^[A-Z2-7]+=*$/', $secret) && strlen($secret) >= 16;
    }

    /**
     * Format secret for display to user
     */
    private function formatSecretForDisplay(string $secret): string
    {
        return implode(' ', str_split($secret, 4));
    }

    /**
     * Sanitize string for URL inclusion
     */
    private function sanitizeStringForUrl(string $input): string
    {
        return preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $input);
    }
}