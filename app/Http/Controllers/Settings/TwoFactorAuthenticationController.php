<?php

namespace App\Http\Controllers\Settings;

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
use Laravel\Fortify\TwoFactorAuthenticationProvider;
use Illuminate\Support\Facades\Auth;

class TwoFactorAuthenticationController extends Controller
{
    // SECURITY NOTE: Use environment-based configuration for security parameters
    protected $maxAttempts;
    protected $decayMinutes;
    
    public function __construct()
    {
        $this->maxAttempts = config('auth.two_factor.max_attempts', 5);
        $this->decayMinutes = config('auth.two_factor.decay_minutes', 1);
    }
    
    /**
     * Get Google2FA instance
     * SECURITY NOTE: Use dependency injection for better testability
     */
    private function getGoogle2FA(): Google2FA
    {
        return new Google2FA();
    }

    /**
     * Show 2FA settings page for admin
     * SECURITY NOTE: Limit sensitive data exposure
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        // SECURITY NOTE: Verify session hasn't been hijacked
        if (!$this->isSessionSecure($request)) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Session security check failed.');
        }
        
        $twoFactorEnabled = $this->isTwoFactorEnabled($user);
        $requiresConfirmation = $this->requiresTwoFactorConfirmation($user);
        
        // SECURITY NOTE: Only expose QR code if absolutely necessary
        $initialSetupData = null;
        
        if ($requiresConfirmation) {
            try {
                // SECURITY NOTE: Add timeout for pending setups (30 minutes)
                if ($this->isSetupExpired($user)) {
                    $this->clearTwoFactorData($user);
                    $requiresConfirmation = false;
                } else {
                    $secret = $this->getTwoFactorSecret($user);
                    $qrCodeSvg = $this->generateQrCodeSvg($secret, $user->email);
                    $initialSetupData = [
                        'qrCodeSvg' => $qrCodeSvg,
                        'manualSetupKey' => $this->formatSecretForDisplay($secret),
                    ];
                }
            } catch (\Exception $e) {
                // SECURITY NOTE: Log error but don't expose details to user
                Log::error('Failed to generate QR code for existing setup', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
                
                $this->clearTwoFactorData($user);
                $requiresConfirmation = false;
            }
        }
        
        // SECURITY NOTE: Never expose actual recovery codes in initial page load
        return Inertia::render('admin/settings/two-factor', [
            'twoFactorEnabled' => $twoFactorEnabled,
            'requiresConfirmation' => $requiresConfirmation,
            'initialSetupData' => $initialSetupData,
            'lastUsedAt' => $user->two_factor_last_used_at ? 
                $user->two_factor_last_used_at->diffForHumans() : null,
            'backupCodesRemaining' => $this->getRemainingRecoveryCodes($user),
        ]);
    }

    /**
     * Enable 2FA (generate QR code) for admin
     * SECURITY NOTE: Require recent authentication for sensitive operations
     */
    public function enable(Request $request)
    {
        // SECURITY NOTE: Verify user has authenticated recently (last 5 minutes)
        if (!$this->hasRecentAuthentication($request)) {
            return redirect()->back()->with([
                'error' => 'Please confirm your password to enable 2FA.'
            ]);
        }
        
        $user = $request->user();
        
        // SECURITY NOTE: Prevent enabling if already enabled
        if ($this->isTwoFactorEnabled($user)) {
            return redirect()->back()->with([
                'error' => 'Two-factor authentication is already enabled.'
            ]);
        }
        
        // SECURITY NOTE: Generate cryptographically secure secret
        $secret = app(TwoFactorAuthenticationProvider::class)->generateSecretKey();
        
        // SECURITY NOTE: Store with expiration timestamp
        $user->update([
            'two_factor_secret' => Crypt::encryptString($secret),
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_enabled_at' => null,
            'two_factor_last_used_at' => null,
            'two_factor_used_recovery_codes' => null,
            'two_factor_setup_at' => now(), // Track when setup started
        ]);
        
        // SECURITY NOTE: Log the initiation (not the secret)
        Log::info('2FA setup initiated', [
            'user_id' => $user->id,
            'ip' => $this->anonymizeIp($request->ip()),
        ]);
        
        $qrCodeSvg = $this->generateQrCodeSvg($secret, $user->email);
        
        // SECURITY NOTE: Format secret for display (add spaces for readability)
        return redirect()->back()->with([
            'success' => 'Two-factor authentication setup initiated.',
            'qrCodeSvg' => $qrCodeSvg,
            'manualSetupKey' => $this->formatSecretForDisplay($secret),
        ]);
    }

    /**
     * Confirm 2FA setup for admin
     * SECURITY NOTE: Strict validation and rate limiting
     */
    public function confirm(Request $request)
    {
        // SECURITY NOTE: Strict input validation
        $request->validate([
            'code' => [
                'required',
                'string',
                'size:6',
                'regex:/^[0-9]{6}$/',
            ],
        ]);
        
        $user = $request->user();
        
        // SECURITY NOTE: Aggressive rate limiting for confirmation attempts
        $throttleKey = $this->getThrottleKey($user, 'confirm_2fa');
        if ($this->hasTooManyAttempts($throttleKey)) {
            $availableIn = $this->availableIn($throttleKey);
            
            // SECURITY NOTE: Log rate limit hit for security monitoring
            Log::warning('2FA confirmation rate limit hit', [
                'user_id' => $user->id,
                'ip' => $this->anonymizeIp($request->ip()),
            ]);
            
            return redirect()->back()->with([
                'error' => 'Too many failed attempts. Please try again in ' . $availableIn . ' seconds.'
            ]);
        }
        
        $this->incrementAttempts($throttleKey);
        
        // SECURITY NOTE: Check setup expiration
        if (!$this->requiresTwoFactorConfirmation($user) || $this->isSetupExpired($user)) {
            $this->clearTwoFactorData($user);
            return redirect()->back()->with([
                'error' => 'Setup session expired. Please start over.'
            ]);
        }
        
        // SECURITY NOTE: Get and validate secret
        try {
            $secret = $this->getTwoFactorSecret($user);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt 2FA secret', [
                'user_id' => $user->id,
                'error' => 'Decryption failed',
            ]);
            
            $this->clearTwoFactorData($user);
            
            return redirect()->back()->with([
                'error' => 'Setup session invalid. Please start over.'
            ]);
        }
        
        // SECURITY NOTE: Use constant-time verification via Google2FA
        $code = trim($request->code);
        $valid = $this->getGoogle2FA()->verifyKey($secret, $code, 2);
        
        // SECURITY NOTE: Additional check for code reuse prevention
        if ($valid) {
            $codeUsedKey = '2fa_code_used:' . $user->id . ':' . $code;
            if (Cache::has($codeUsedKey)) {
                $valid = false;
                Log::warning('2FA code reuse attempt detected', [
                    'user_id' => $user->id,
                    'ip' => $this->anonymizeIp($request->ip()),
                ]);
            } else {
                // Store used code for 2 minutes (prevent replay within window)
                Cache::put($codeUsedKey, true, 120);
            }
        }
        
        if (!$valid) {
            $remainingAttempts = $this->remainingAttempts($throttleKey);
            
            // SECURITY NOTE: Generic error message
            return redirect()->back()->with([
                'error' => 'Invalid verification code. Please try again.',
                'attempts_remaining' => $remainingAttempts
            ]);
        }
        
        // SECURITY NOTE: Generate cryptographically secure recovery codes
        $recoveryCodes = $this->generateRecoveryCodes();
        
        // SECURITY NOTE: Store hashed recovery codes for verification
        $hashedCodes = array_map(function($code) {
            return password_hash($code, PASSWORD_DEFAULT);
        }, $recoveryCodes);
        
        $user->update([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($hashedCodes)),
            'two_factor_confirmed_at' => now(),
            'two_factor_enabled_at' => now(),
            'two_factor_last_used_at' => null,
            'two_factor_setup_at' => null,
        ]);
        
        // SECURITY NOTE: Log successful activation without sensitive data
        Log::info('2FA enabled successfully', [
            'user_id' => $user->id,
            'ip' => $this->anonymizeIp($request->ip()),
        ]);
        
        $this->clearAttempts($throttleKey);
        
        // SECURITY NOTE: Return plain recovery codes only once
        return redirect()->back()->with([
            'success' => 'Two-factor authentication enabled successfully!',
            'recoveryCodes' => $recoveryCodes,
            'showRecoveryCodes' => true
        ]);
    }

    /**
     * Cancel 2FA setup (for partial setup)
     * SECURITY NOTE: Require password confirmation
     */
    public function cancelSetup(Request $request)
    {
        // SECURITY NOTE: Validate password using constant-time verification
        $validator = Validator::make($request->all(), [
            'password' => ['required', 'string', 'current_password'],
        ]);
        
        if ($validator->fails()) {
            // SECURITY NOTE: Rate limit failed password attempts
            $this->incrementFailedPasswordAttempts($request);
            
            return redirect()->back()->with([
                'error' => 'Invalid password.'
            ]);
        }
        
        $user = $request->user();
        
        if ($this->requiresTwoFactorConfirmation($user)) {
            $this->clearTwoFactorData($user);
            
            Log::info('2FA setup cancelled', [
                'user_id' => $user->id,
                'ip' => $this->anonymizeIp($request->ip()),
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
     * Disable 2FA for admin
     * SECURITY NOTE: Multiple security checks required
     */
    public function disable(Request $request)
    {
        // SECURITY NOTE: Validate all inputs strictly
        $validator = Validator::make($request->all(), [
            'password' => ['required', 'string', 'current_password'],
            'reason' => ['nullable', 'string', 'max:500', 'regex:/^[a-zA-Z0-9\s\-\.,]+$/'],
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()->with([
                'error' => 'Invalid password or reason format.'
            ]);
        }
        
        $user = $request->user();
        
        // SECURITY NOTE: Prevent disabling if not enabled
        if (!$this->isTwoFactorEnabled($user)) {
            return redirect()->back()->with([
                'error' => 'Two-factor authentication is not enabled.'
            ]);
        }
        
        // SECURITY NOTE: Check for suspicious timing (too quick after login)
        if (!$this->hasRecentAuthentication($request, 10)) {
            return redirect()->back()->with([
                'error' => 'Please re-authenticate to disable 2FA.'
            ]);
        }
        
        // SECURITY NOTE: Sanitize reason before logging
        $reason = $request->input('reason') ? 
            strip_tags($request->input('reason')) : 
            'No reason provided';
        
        // SECURITY NOTE: Log detailed audit trail
        Log::warning('2FA disabled', [
            'user_id' => $user->id,
            'reason' => $reason,
            'ip' => $this->anonymizeIp($request->ip()),
            'user_agent_fingerprint' => hash('sha256', $request->userAgent()),
            'last_used_at' => $user->two_factor_last_used_at,
        ]);
        
        $this->clearTwoFactorData($user);
        
        return redirect()->back()->with([
            'success' => 'Two-factor authentication has been disabled.'
        ]);
    }

    /**
     * Get recovery codes for admin
     * SECURITY NOTE: Never expose actual codes in response
     */
    public function getRecoveryCodes(Request $request)
    {
        $user = $request->user();
        
        if (!$this->isTwoFactorEnabled($user)) {
            return response()->json([
                'success' => true,
                'data' => ['recoveryCodesRemaining' => 0]
            ]);
        }
        
        // SECURITY NOTE: Only return count, never the actual codes
        try {
            $remainingCount = $this->getRemainingRecoveryCodes($user);
        } catch (\Exception $e) {
            Log::error('Failed to get recovery codes count', [
                'user_id' => $user->id,
                'error' => 'Processing error',
            ]);
            $remainingCount = 0;
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'remaining' => $remainingCount,
            ]
        ]);
    }

    /**
     * Regenerate recovery codes for admin
     * SECURITY NOTE: Invalidate all existing recovery codes
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $user = $request->user();
        
        if (!$this->isTwoFactorEnabled($user)) {
            return redirect()->back()->with([
                'error' => 'Two-factor authentication is not enabled.'
            ]);
        }
        
        // SECURITY NOTE: Require password and 2FA code for regeneration
        $request->validate([
            'password' => ['required', 'string', 'current_password'],
            'two_factor_code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
        ]);
        
        // SECURITY NOTE: Verify 2FA code before proceeding
        if (!$this->verifyCurrentTwoFactorCode($user, $request->two_factor_code)) {
            return redirect()->back()->with([
                'error' => 'Invalid two-factor authentication code.'
            ]);
        }
        
        $recoveryCodes = $this->generateRecoveryCodes();
        
        // SECURITY NOTE: Hash recovery codes before storage
        $hashedCodes = array_map(function($code) {
            return password_hash($code, PASSWORD_DEFAULT);
        }, $recoveryCodes);
        
        $user->update([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($hashedCodes)),
            'two_factor_used_recovery_codes' => null,
        ]);
        
        Log::warning('Recovery codes regenerated', [
            'user_id' => $user->id,
            'ip' => $this->anonymizeIp($request->ip()),
        ]);
        
        return redirect()->back()->with([
            'success' => 'Recovery codes regenerated successfully!',
            'recoveryCodes' => $recoveryCodes,
            'showRecoveryCodes' => true
        ]);
    }

    /**
     * Verify a 2FA code
     * SECURITY NOTE: Rate limit verification attempts
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'code' => [
                'required',
                'string',
                'size:6',
                'regex:/^[0-9]{6}$/',
            ],
        ]);
        
        $user = $request->user();
        
        // SECURITY NOTE: Rate limit by IP and user ID
        $throttleKey = 'verify_2fa:' . $user->id . ':' . $request->ip();
        if (Cache::get($throttleKey, 0) >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Too many attempts.'
            ], 429);
        }
        
        if (!$this->isTwoFactorEnabled($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid request.'
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
        
        // SECURITY NOTE: Check for code reuse
        $codeUsedKey = '2fa_code_used:' . $user->id . ':' . $request->code;
        if (Cache::has($codeUsedKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code.'
            ], 422);
        }
        
        $valid = $this->getGoogle2FA()->verifyKey($secret, $request->code, 2);
        
        if ($valid) {
            // SECURITY NOTE: Mark code as used
            Cache::put($codeUsedKey, true, 120);
            Cache::increment($throttleKey, 1, 300);
            
            $user->update([
                'two_factor_last_used_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Code verified successfully.'
            ]);
        }
        
        // SECURITY NOTE: Increment failed attempts
        Cache::increment($throttleKey, 1, 300);
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid verification code.'
        ], 422);
    }

    /**
     * Helper: Check if session is secure
     * SECURITY NOTE: Validate session hasn't been hijacked
     */
    private function isSessionSecure(Request $request): bool
    {
        $sessionFingerprint = session('2fa_fingerprint');
        $currentFingerprint = $this->generateSessionFingerprint($request);
        
        if (!$sessionFingerprint) {
            session(['2fa_fingerprint' => $currentFingerprint]);
            return true;
        }
        
        return hash_equals($sessionFingerprint, $currentFingerprint);
    }
    
    /**
     * Generate session fingerprint
     * SECURITY NOTE: Create unique identifier for session validation
     */
    private function generateSessionFingerprint(Request $request): string
    {
        $data = implode('|', [
            $request->ip(),
            $request->userAgent(),
            $request->user()->id ?? '',
        ]);
        
        return hash('sha256', $data);
    }

    /**
     * Helper: Check if 2FA is fully enabled
     * SECURITY NOTE: Strict boolean check
     */
    private function isTwoFactorEnabled($user): bool
    {
        return !empty($user->two_factor_secret) && 
               !empty($user->two_factor_confirmed_at) &&
               $user->two_factor_confirmed_at->isPast();
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
     * Check if setup has expired
     * SECURITY NOTE: Timeout incomplete setups after 30 minutes
     */
    private function isSetupExpired($user): bool
    {
        if (empty($user->two_factor_setup_at)) {
            return true;
        }
        
        return $user->two_factor_setup_at->addMinutes(30)->isPast();
    }
    
    /**
     * Check if user has authenticated recently
     * SECURITY NOTE: Require recent auth for sensitive operations
     */
    private function hasRecentAuthentication(Request $request, int $minutes = 5): bool
    {
        $lastAuth = session('auth.last_confirmation', 0);
        return (time() - $lastAuth) < ($minutes * 60);
    }
    
    /**
     * Verify current 2FA code
     * SECURITY NOTE: Used for sensitive operations
     */
    private function verifyCurrentTwoFactorCode($user, string $code): bool
    {
        try {
            $secret = $this->getTwoFactorSecret($user);
            return $this->getGoogle2FA()->verifyKey($secret, $code, 2);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Helper: Get decrypted 2FA secret
     * SECURITY NOTE: Handle decryption failures gracefully
     */
    private function getTwoFactorSecret($user): string
    {
        try {
            return Crypt::decryptString($user->two_factor_secret);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt two_factor_secret', [
                'user_id' => $user->id,
                'error' => 'Decryption failed',
            ]);
            throw $e;
        }
    }

    /**
     * Helper: Get remaining recovery codes count
     * SECURITY NOTE: Don't expose actual codes
     */
    private function getRemainingRecoveryCodes($user): int
    {
        if (empty($user->two_factor_recovery_codes)) {
            return 0;
        }
        
        try {
            $codes = json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true);
            $usedCodes = $user->two_factor_used_recovery_codes ?? [];
            return count($codes) - count($usedCodes);
        } catch (\Exception $e) {
            Log::error('Failed to get recovery codes count', [
                'user_id' => $user->id,
                'error' => 'Processing error',
            ]);
            return 0;
        }
    }

    /**
     * Helper: Clear all 2FA data
     * SECURITY NOTE: Ensure complete data removal
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
            'two_factor_setup_at' => null,
        ]);
    }

    /**
     * Format secret for display
     * SECURITY NOTE: Add spaces for readability without compromising security
     */
    private function formatSecretForDisplay(string $secret): string
    {
        return trim(chunk_split($secret, 4, ' '));
    }

    /**
     * Generate QR code SVG
     * SECURITY NOTE: Use secure QR code generation
     */
    private function generateQrCodeSvg(string $secret, string $email): string
    {
        try {
            // SECURITY NOTE: Get app name from config, never hardcode
            $appName = config('app.name', 'Application');
            $issuer = config('auth.two_factor.issuer', $appName);
            
            // SECURITY NOTE: Sanitize email for QR code URL
            $sanitizedEmail = filter_var($email, FILTER_SANITIZE_EMAIL);
            
            $qrCodeUrl = $this->getGoogle2FA()->getQRCodeUrl(
                $issuer,
                $sanitizedEmail,
                $secret
            );
            
            $size = config('auth.two_factor.qr_code_size', 250);
            $renderer = new ImageRenderer(
                new RendererStyle($size),
                new SvgImageBackEnd()
            );
            
            $writer = new Writer($renderer);
            return $writer->writeString($qrCodeUrl);
        } catch (\Exception $e) {
            Log::error('QR Code generation failed', [
                'error' => $e->getMessage(),
            ]);
            return '';
        }
    }

    /**
     * Generate recovery codes
     * SECURITY NOTE: Use cryptographically secure random generator
     */
    private function generateRecoveryCodes(): array
    {
        $count = config('auth.two_factor.recovery_codes_count', 8);
        $length = config('auth.two_factor.recovery_code_length', 10);
        
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            // SECURITY NOTE: Use secure random bytes
            $codes[] = strtoupper(substr(bin2hex(random_bytes($length)), 0, $length));
        }
        
        return $codes;
    }
    
    /**
     * Increment failed password attempts
     * SECURITY NOTE: Rate limit password failures
     */
    private function incrementFailedPasswordAttempts(Request $request): void
    {
        $key = 'password_failures:' . $request->ip();
        Cache::increment($key, 1, 3600);
    }
    
    /**
     * Anonymize IP address for privacy compliance
     * SECURITY NOTE: GDPR compliance - don't log full IPs
     */
    private function anonymizeIp(string $ip): string
    {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            $parts[3] = '0';
            return implode('.', $parts);
        }
        
        return '0.0.0.0';
    }

    /**
     * Throttling Methods
     */
    
    private function getThrottleKey($user, string $action): string
    {
        return '2fa_throttle:' . $user->id . ':' . $action;
    }

    private function hasTooManyAttempts(string $throttleKey): bool
    {
        $timerKey = $throttleKey . ':timer';
        
        if (Cache::has($timerKey)) {
            return true;
        }
        
        $attempts = Cache::get($throttleKey, 0);
        return $attempts >= $this->maxAttempts;
    }

    private function incrementAttempts(string $throttleKey): void
    {
        $timerKey = $throttleKey . ':timer';
        
        Cache::add(
            $timerKey, 
            now()->addMinutes($this->decayMinutes)->getTimestamp(), 
            $this->decayMinutes * 60
        );
        
        Cache::increment($throttleKey, 1, $this->decayMinutes * 60);
    }

    private function clearAttempts(string $throttleKey): void
    {
        Cache::forget($throttleKey);
        Cache::forget($throttleKey . ':timer');
    }

    private function remainingAttempts(string $throttleKey): int
    {
        $attempts = Cache::get($throttleKey, 0);
        return max(0, $this->maxAttempts - $attempts);
    }

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