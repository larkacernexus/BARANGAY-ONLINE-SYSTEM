<?php

namespace App\Http\Controllers\Residentsettings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ResidentTwoFactorAuthenticationController extends Controller
{
    protected $maxAttempts = 5;
    protected $decayMinutes = 1;
    
    /**
     * Get Google2FA instance
     */
    private function getGoogle2FA(): Google2FA
    {
        return new Google2FA();
    }

    /**
     * Show 2FA settings page for residents
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        // Check if user needs to set up 2FA (if required by system policy)
        $requiresTwoFactor = config('auth.two_factor.required', false);
        $gracePeriod = config('auth.two_factor.grace_period_days', 7);
        $userNeedsToSetup = $requiresTwoFactor && 
                           empty($user->two_factor_confirmed_at) &&
                           $user->created_at->diffInDays(now()) > $gracePeriod;
        
        $twoFactorEnabled = $this->isTwoFactorEnabled($user);
        $requiresConfirmation = $this->requiresTwoFactorConfirmation($user);
        
        // If 2FA is partially setup, generate QR code to show in modal
        $initialSetupData = null;
        
        if ($requiresConfirmation) {
            try {
                $secret = $this->getTwoFactorSecret($user);
                $qrCodeSvg = $this->generateQrCodeSvg($secret, $user->email);
                $initialSetupData = [
                    'qrCodeSvg' => $qrCodeSvg,
                    'manualSetupKey' => $secret,
                ];
            } catch (\Exception $e) {
                Log::error('Failed to generate QR code for existing setup', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Clear invalid setup data
                $this->clearTwoFactorData($user);
            }
        }
        
        return Inertia::render('residentsettings/two-factor', [
            'twoFactorEnabled' => $twoFactorEnabled,
            'requiresConfirmation' => $requiresConfirmation,
            'initialSetupData' => $initialSetupData,
            'requiresTwoFactor' => $requiresTwoFactor,
            'userNeedsToSetup' => $userNeedsToSetup,
            'lastUsedAt' => $user->two_factor_last_used_at ?? null,
            'backupCodesRemaining' => $this->getRemainingRecoveryCodes($user),
        ]);
    }

    /**
     * Enable 2FA (generate QR code) for residents
     */
    public function enable(Request $request)
    {
        $user = $request->user();
        
        // Throttle enable attempts
        $throttleKey = $this->getThrottleKey($user, 'enable_2fa');
        if ($this->hasTooManyAttempts($throttleKey)) {
            $availableIn = $this->availableIn($throttleKey);
            return redirect()->back()->with([
                'error' => 'Too many attempts. Please try again in '.$availableIn.' seconds.'
            ]);
        }
        
        $this->incrementAttempts($throttleKey);
        
        // Check if already enabled and confirmed
        if ($this->isTwoFactorEnabled($user)) {
            return redirect()->back()->with([
                'error' => 'Two-factor authentication is already enabled.'
            ]);
        }
        
        // If user has unconfirmed secret, use it
        if ($this->requiresTwoFactorConfirmation($user)) {
            try {
                $secret = $this->getTwoFactorSecret($user);
            } catch (\Exception $e) {
                Log::warning('Invalid existing 2FA secret, generating new', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                $secret = $this->generateNewSecret($user);
            }
        } else {
            $secret = $this->generateNewSecret($user);
        }
        
        // Generate QR code SVG
        $qrCodeSvg = $this->generateQrCodeSvg($secret, $user->email);
        
        // Clear attempts on successful generation
        $this->clearAttempts($throttleKey);
        
        return redirect()->back()->with([
            'success' => 'Two-factor authentication setup initiated.',
            'qrCodeData' => [
                'qrCodeSvg' => $qrCodeSvg,
                'manualSetupKey' => $secret,
            ]
        ]);
    }

    /**
     * Confirm 2FA setup for residents
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6|regex:/^\d{6}$/',
        ]);
        
        $user = $request->user();
        
        // Throttle confirmation attempts
        $throttleKey = $this->getThrottleKey($user, 'confirm_2fa');
        if ($this->hasTooManyAttempts($throttleKey)) {
            $availableIn = $this->availableIn($throttleKey);
            return redirect()->back()->with([
                'error' => 'Too many failed attempts. Please try again in '.$availableIn.' seconds.'
            ]);
        }
        
        $this->incrementAttempts($throttleKey);
        
        if (!$this->requiresTwoFactorConfirmation($user)) {
            return redirect()->back()->withErrors([
                'code' => 'No pending setup found. Please start over.'
            ])->with([
                'error' => 'No pending setup found.'
            ]);
        }
        
        // Get the secret
        try {
            $secret = $this->getTwoFactorSecret($user);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt 2FA secret', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            $this->clearTwoFactorData($user);
            
            return redirect()->back()->withErrors([
                'code' => 'Setup session expired. Please start over.'
            ])->with([
                'error' => 'Setup session expired.'
            ]);
        }
        
        // Verify code (allow some time drift - 2 means 60 seconds window)
        $valid = $this->getGoogle2FA()->verifyKey($secret, $request->code, 2);
        
        if (!$valid) {
            $remainingAttempts = $this->remainingAttempts($throttleKey);
            return redirect()->back()->withErrors([
                'code' => 'Invalid verification code. Please try again.'
            ])->with([
                'error' => 'Invalid verification code.',
                'attempts_remaining' => $remainingAttempts
            ]);
        }
        
        // Generate recovery codes
        $recoveryCodes = $this->generateRecoveryCodes();
        
        // Save to database
        $user->update([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes)),
            'two_factor_confirmed_at' => now(),
            'two_factor_enabled_at' => now(),
            'two_factor_last_used_at' => null,
        ]);
        
        // Log the 2FA activation
        Log::info('2FA enabled for resident', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        // Clear attempts on success
        $this->clearAttempts($throttleKey);
        
        return redirect()->back()->with([
            'success' => 'Two-factor authentication enabled successfully!',
            'recoveryCodes' => $recoveryCodes,
            'showRecoveryCodes' => true
        ]);
    }

    /**
     * Cancel 2FA setup (for partial setup) - Now with password confirmation
     */
    public function cancelSetup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|current_password',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->with([
                'error' => 'Invalid password.'
            ]);
        }
        
        $user = $request->user();
        
        // Only allow cancel if setup is incomplete
        if ($this->requiresTwoFactorConfirmation($user)) {
            $this->clearTwoFactorData($user);
            
            Log::info('2FA setup cancelled by resident', [
                'user_id' => $user->id,
                'ip' => $request->ip()
            ]);
            
            return redirect()->back()->with([
                'success' => 'Setup cancelled successfully.'
            ]);
        }
        
        return redirect()->back()->with([
            'error' => 'No pending setup to cancel.'
        ]);
    }

    /**
     * Disable 2FA for residents
     */
    public function disable(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|current_password',
            'reason' => 'nullable|string|max:500',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->with([
                'error' => 'Invalid password.'
            ]);
        }
        
        $user = $request->user();
        
        if (!$this->isTwoFactorEnabled($user)) {
            return redirect()->back()->with([
                'error' => 'Two-factor authentication is not enabled.'
            ]);
        }
        
        // Log the reason for disabling
        $reason = $request->input('reason', 'No reason provided');
        Log::info('2FA disabled by resident', [
            'user_id' => $user->id,
            'reason' => $reason,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_used_at' => $user->two_factor_last_used_at,
        ]);
        
        $this->clearTwoFactorData($user);
        
        return redirect()->back()->with([
            'success' => 'Two-factor authentication has been disabled.'
        ]);
    }

    /**
     * Get recovery codes for residents
     */
    public function getRecoveryCodes(Request $request)
    {
        $user = $request->user();
        
        if (!$this->isTwoFactorEnabled($user)) {
            return response()->json([
                'success' => true,
                'data' => ['recoveryCodes' => []]
            ]);
        }
        
        try {
            $recoveryCodes = $this->getDecryptedRecoveryCodes($user);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt recovery codes', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            $recoveryCodes = [];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'recoveryCodes' => $recoveryCodes,
                'remaining' => count($recoveryCodes),
                'used_codes' => $user->two_factor_used_recovery_codes ?? [],
            ]
        ]);
    }

    /**
     * Regenerate recovery codes for residents
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $user = $request->user();
        
        if (!$this->isTwoFactorEnabled($user)) {
            return redirect()->back()->with([
                'error' => 'Two-factor authentication is not enabled.'
            ]);
        }
        
        // Optional: Require password confirmation for security
        if (config('auth.two_factor.require_password_for_recovery_regeneration', true)) {
            $request->validate([
                'password' => 'required|current_password',
            ]);
        }
        
        $recoveryCodes = $this->generateRecoveryCodes();
        
        $user->update([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes)),
            'two_factor_used_recovery_codes' => [], // Clear used codes
        ]);
        
        Log::info('Recovery codes regenerated', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);
        
        return redirect()->back()->with([
            'success' => 'Recovery codes regenerated successfully!',
            'recoveryCodes' => $recoveryCodes,
            'showRecoveryCodes' => true
        ]);
    }

    /**
     * Verify a 2FA code (for API use or additional verification)
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6|regex:/^\d{6}$/',
        ]);
        
        $user = $request->user();
        
        if (!$this->isTwoFactorEnabled($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled.'
            ], 400);
        }
        
        try {
            $secret = $this->getTwoFactorSecret($user);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid setup.'
            ], 400);
        }
        
        $valid = $this->getGoogle2FA()->verifyKey($secret, $request->code, 2);
        
        if ($valid) {
            // Update last used time
            $user->update([
                'two_factor_last_used_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Code verified successfully.'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid verification code.'
        ], 422);
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
        try {
            return Crypt::decryptString($user->two_factor_secret);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt two_factor_secret', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Helper: Get decrypted recovery codes
     */
    private function getDecryptedRecoveryCodes($user): array
    {
        if (empty($user->two_factor_recovery_codes)) {
            return [];
        }
        
        try {
            $codes = json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true);
            
            // Filter out used codes
            $usedCodes = $user->two_factor_used_recovery_codes ?? [];
            return array_diff($codes, $usedCodes);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt recovery codes', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Helper: Get remaining recovery codes count
     */
    private function getRemainingRecoveryCodes($user): int
    {
        try {
            $codes = $this->getDecryptedRecoveryCodes($user);
            return count($codes);
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
        try {
            $appName = config('app.name', 'Barangay System');
            $issuer = config('auth.two_factor.issuer', $appName);
            $qrCodeUrl = $this->getGoogle2FA()->getQRCodeUrl(
                $issuer,
                $email,
                $secret
            );
            
            $size = config('auth.two_factor.qr_code_size', 200);
            $renderer = new ImageRenderer(
                new RendererStyle($size),
                new SvgImageBackEnd()
            );
            
            $writer = new Writer($renderer);
            return $writer->writeString($qrCodeUrl);
        } catch (\Exception $e) {
            Log::error('QR Code generation failed', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return '';
        }
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
            // Generate secure recovery codes
            $codes[] = Str::upper(Str::random($length));
        }
        
        return $codes;
    }

    /**
     * Throttling Methods
     */
    
    /**
     * Get the throttle key for the given user and action
     */
    private function getThrottleKey($user, string $action): string
    {
        return '2fa_throttle:' . $user->id . ':' . $action;
    }

    /**
     * Determine if the user has too many failed attempts.
     */
    private function hasTooManyAttempts(string $throttleKey): bool
    {
        $timerKey = $throttleKey . ':timer';
        
        if (Cache::has($timerKey)) {
            return true;
        }
        
        $attempts = Cache::get($throttleKey, 0);
        return $attempts >= $this->maxAttempts;
    }

    /**
     * Increment the attempt count.
     */
    private function incrementAttempts(string $throttleKey): void
    {
        $timerKey = $throttleKey . ':timer';
        
        Cache::add(
            $timerKey, 
            now()->addMinutes($this->decayMinutes)->getTimestamp(), 
            $this->decayMinutes * 60
        );
        
        $attempts = Cache::get($throttleKey, 0);
        Cache::put($throttleKey, $attempts + 1, $this->decayMinutes * 60);
    }

    /**
     * Clear the attempt count.
     */
    private function clearAttempts(string $throttleKey): void
    {
        Cache::forget($throttleKey);
        Cache::forget($throttleKey . ':timer');
    }

    /**
     * Get the number of attempts remaining.
     */
    private function remainingAttempts(string $throttleKey): int
    {
        $attempts = Cache::get($throttleKey, 0);
        return max(0, $this->maxAttempts - $attempts);
    }

    /**
     * Get the number of seconds until retry is available.
     */
    private function availableIn(string $throttleKey): int
    {
        $timerKey = $throttleKey . ':timer';
        $timer = Cache::get($timerKey);
        
        if (!$timer) {
            return 0;
        }
        
        return max(0, $timer - now()->getTimestamp());
    }
}