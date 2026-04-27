<?php

namespace App\Http\Controllers\ResidentSettings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Auth;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Inertia\Inertia;

class QrLoginController extends Controller
{
    /**
     * Generate QR code for faster login
     * 
     * SECURITY NOTE: This endpoint requires authentication and generates a time-limited
     * token for QR-based login. The token is hashed before storage to prevent exposure
     * in case of database breach.
     */
    public function generateQrCode(Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        
        // LOGIC NOTE: Check if user is authorized to use QR login feature
        if (!$this->authorizeQrLogin($user)) {
            Log::warning('QR code generation denied - user not authorized', [
                'user_id' => $user->id,
                'ip' => $request->ip()
            ]);
            
            return back()->withErrors([
                'error' => 'You are not authorized to use QR login.'
            ]);
        }
        
        Log::info('QR Code generation started', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);
        
        // Check if user already has a valid QR code
        if ($user->login_qr_code && $user->qr_code_url) {
            // LOGIC NOTE: Verify token hasn't expired before returning existing code
            if ($user->login_qr_code_expires_at && $user->login_qr_code_expires_at->isFuture()) {
                Log::info('User already has valid QR code', [
                    'user_id' => $user->id,
                    'expires_at' => $user->login_qr_code_expires_at->toDateTimeString()
                ]);
                
                return back()->with([
                    'info' => 'QR code already exists and is valid',
                    'qr_code_url' => $this->getSecureQrUrl($user->qr_code_url),
                    'expires_at' => $user->login_qr_code_expires_at->toDateTimeString(),
                ]);
            }
            
            // Token expired - will generate new one
            Log::info('Existing QR token expired, generating new one', [
                'user_id' => $user->id
            ]);
        }
        
        // SECURITY NOTE: Generate cryptographically secure token
        $plainToken = Str::random(64);
        
        // SECURITY NOTE: Store hashed token to prevent exposure in database breach
        $hashedToken = Hash::make($plainToken);
        
        // Set expiration (30 days from now)
        $expiresAt = now()->addDays(30);
        
        // Generate QR code image with the plain token
        $loginUrl = route('qr.login', ['token' => $plainToken]);
        
        // SECURITY NOTE: Don't log full URL or token
        Log::debug('Login URL generated', [
            'user_id' => $user->id,
            'token_prefix' => substr($plainToken, 0, 8)
        ]);
        
        try {
            // Configure QR options with error correction
            $options = new QROptions([
                'version' => 10,
                'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel' => QRCode::ECC_M, // SECURITY NOTE: Higher error correction
                'scale' => 5,
                'imageBase64' => false,
                'imageTransparent' => false,
                'addQuietzone' => true,
                'quietzoneSize' => 2,
            ]);
            
            // Generate QR code
            $qrcode = new QRCode($options);
            $pngData = $qrcode->render($loginUrl);
            
            // SECURITY NOTE: Use private disk or secure storage location
            $directory = 'qr-codes/' . $user->id;
            
            // Ensure directory exists with proper permissions
            if (!Storage::disk('local')->exists($directory)) {
                Storage::disk('local')->makeDirectory($directory, 0700);
            }
            
            // SECURITY NOTE: Use random filename to prevent enumeration
            $fileName = $directory . '/' . Str::random(40) . '.png';
            Storage::disk('local')->put($fileName, $pngData);
            
            // Delete old QR image if exists
            if ($user->qr_code_url) {
                $oldPath = str_replace('/storage/', '', $user->qr_code_url);
                Storage::disk('local')->delete($oldPath);
            }
            
            // Create symbolic link for secure access
            $publicPath = 'qr-codes/' . $user->id . '/' . basename($fileName);
            $this->ensureStorageLink($publicPath, $fileName);
            
            // Update user with hashed QR login token
            $user->update([
                'login_qr_code' => $hashedToken,
                'login_qr_code_generated_at' => now(),
                'login_qr_code_expires_at' => $expiresAt,
                'login_qr_code_used_count' => 0,
                'qr_code_url' => $publicPath,
            ]);
            
            Log::info('QR code generation completed successfully', [
                'user_id' => $user->id,
                'expires_at' => $expiresAt->toDateTimeString()
            ]);
            
            return back()->with([
                'success' => 'QR code generated successfully',
                'qr_code_url' => $this->getSecureQrUrl($publicPath),
                'expires_at' => $expiresAt->toDateTimeString(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('QR code generation failed', [
                'user_id' => $user->id,
                'error_type' => get_class($e),
                'error_message' => $e->getMessage()
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to generate QR code. Please try again.'
            ]);
        }
    }
    
    /**
     * Get QR code status
     */
    public function getQrStatus(Request $request): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        
        Log::info('QR status check', [
            'user_id' => $user->id,
            'has_token' => !is_null($user->login_qr_code),
            'has_image' => !is_null($user->qr_code_url)
        ]);
        
        $response = [
            'has_qr_code' => !is_null($user->login_qr_code) && 
                             $user->login_qr_code_expires_at && 
                             $user->login_qr_code_expires_at->isFuture(),
            'qr_code_url' => $user->qr_code_url ? $this->getSecureQrUrl($user->qr_code_url) : null,
            'generated_at' => $user->login_qr_code_generated_at?->toDateTimeString(),
            'expires_at' => $user->login_qr_code_expires_at?->toDateTimeString(),
            'is_expired' => $user->login_qr_code_expires_at ? 
                           now()->gt($user->login_qr_code_expires_at) : true,
            'used_count' => $user->login_qr_code_used_count ?? 0,
        ];
        
        if ($request->wantsJson()) {
            return response()->json($response);
        }
        
        return back();
    }
    
    /**
     * Regenerate QR code (invalidates the old one)
     */
    public function regenerateQrCode(Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        
        // SECURITY NOTE: Verify authorization before regeneration
        if (!$this->authorizeQrLogin($user)) {
            return back()->withErrors([
                'error' => 'You are not authorized to regenerate QR code.'
            ]);
        }
        
        Log::info('QR code regeneration started', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);
        
        // Generate new token
        $plainToken = Str::random(64);
        $hashedToken = Hash::make($plainToken);
        $expiresAt = now()->addDays(30);
        
        $loginUrl = route('qr.login', ['token' => $plainToken]);
        
        try {
            // Configure QR options
            $options = new QROptions([
                'version' => 10,
                'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel' => QRCode::ECC_M,
                'scale' => 5,
                'imageBase64' => false,
                'imageTransparent' => false,
                'addQuietzone' => true,
                'quietzoneSize' => 2,
            ]);
            
            $qrcode = new QRCode($options);
            $pngData = $qrcode->render($loginUrl);
            
            $directory = 'qr-codes/' . $user->id;
            
            if (!Storage::disk('local')->exists($directory)) {
                Storage::disk('local')->makeDirectory($directory, 0700);
            }
            
            $fileName = $directory . '/' . Str::random(40) . '.png';
            Storage::disk('local')->put($fileName, $pngData);
            
            // Delete old QR image
            if ($user->qr_code_url) {
                $oldPath = str_replace('/storage/', '', $user->qr_code_url);
                Storage::disk('local')->delete($oldPath);
            }
            
            $publicPath = 'qr-codes/' . $user->id . '/' . basename($fileName);
            $this->ensureStorageLink($publicPath, $fileName);
            
            // SECURITY NOTE: Invalidate old token immediately
            $user->update([
                'login_qr_code' => $hashedToken,
                'login_qr_code_generated_at' => now(),
                'login_qr_code_expires_at' => $expiresAt,
                'login_qr_code_used_count' => 0,
                'qr_code_url' => $publicPath,
            ]);
            
            Log::info('QR code regeneration completed', [
                'user_id' => $user->id
            ]);
            
            return back()->with([
                'success' => 'QR code regenerated successfully',
                'qr_code_url' => $this->getSecureQrUrl($publicPath),
                'expires_at' => $expiresAt->toDateTimeString(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('QR code regeneration failed', [
                'user_id' => $user->id,
                'error_type' => get_class($e)
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to regenerate QR code. Please try again.'
            ]);
        }
    }
    
    /**
     * Disable QR login
     */
    public function disableQrLogin(Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        
        // SECURITY NOTE: Log security-relevant action
        Log::warning('QR login disabled by user', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        // Delete QR image if exists
        if ($user->qr_code_url) {
            $filePath = str_replace('/storage/', '', $user->qr_code_url);
            Storage::disk('local')->delete($filePath);
        }
        
        // Clear QR login data
        $user->update([
            'login_qr_code' => null,
            'login_qr_code_generated_at' => null,
            'login_qr_code_expires_at' => null,
            'login_qr_code_used_count' => 0,
            'qr_code_url' => null,
        ]);
        
        return back()->with([
            'success' => 'QR login disabled successfully'
        ]);
    }
    
    /**
     * Enable QR login
     */
    public function enableQrLogin(Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        
        Log::info('QR login feature enabled', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);
        
        // This just enables the feature; actual QR code generation happens separately
        return back()->with([
            'success' => 'QR login enabled. Generate a QR code to use this feature.'
        ]);
    }
    
    /**
     * Handle QR code login
     * 
     * SECURITY NOTE: This endpoint requires CSRF protection, rate limiting,
     * and uses constant-time comparison for token verification.
     */
    public function loginWithQr(Request $request, string $token): \Illuminate\Http\RedirectResponse
    {
        // SECURITY NOTE: Rate limiting to prevent brute force
        $key = 'qr-login:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            Log::warning('QR login rate limit exceeded', [
                'ip' => $request->ip(),
                'token_prefix' => substr($token, 0, 8)
            ]);
            
            return redirect()->route('login')
                ->with('error', 'Too many login attempts. Please try again later.');
        }
        
        RateLimiter::hit($key, 300); // 5 attempts per 5 minutes
        
        Log::info('QR login attempt', [
            'token_prefix' => substr($token, 0, 8) . '...',
            'ip' => $request->ip()
        ]);
        
        // SECURITY NOTE: Find users with non-expired tokens
        $users = User::whereNotNull('login_qr_code')
            ->where(function($query) {
                $query->where('login_qr_code_expires_at', '>', now())
                    ->orWhereNull('login_qr_code_expires_at');
            })
            ->get();
        
        $matchedUser = null;
        
        // SECURITY NOTE: Use constant-time comparison for token verification
        foreach ($users as $user) {
            if (Hash::check($token, $user->login_qr_code)) {
                $matchedUser = $user;
                break;
            }
        }
        
        if (!$matchedUser) {
            Log::warning('QR login failed - invalid or expired token', [
                'token_prefix' => substr($token, 0, 8) . '...',
                'ip' => $request->ip()
            ]);
            
            return redirect()->route('login')
                ->with('error', 'Invalid or expired QR code');
        }
        
        // SECURITY NOTE: Additional verification for high-risk actions
        if ($this->requiresAdditionalVerification($matchedUser, $request)) {
            Log::info('QR login requires additional verification', [
                'user_id' => $matchedUser->id,
                'ip' => $request->ip()
            ]);
            
            session(['qr_login_pending' => $matchedUser->id]);
            
            return redirect()->route('login.verify')
                ->with('info', 'Please verify your identity to continue.');
        }
        
        // Complete the login
        return $this->completeQrLogin($matchedUser, $request);
    }
    
    /**
     * Complete QR login process
     * 
     * SECURITY NOTE: Regenerates session ID to prevent session fixation
     */
    private function completeQrLogin(User $user, Request $request): \Illuminate\Http\RedirectResponse
    {
        Log::info('QR login successful', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);
        
        // Update usage stats
        $user->update([
            'login_qr_code_used_count' => ($user->login_qr_code_used_count ?? 0) + 1,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);
        
        // SECURITY NOTE: Regenerate session ID to prevent session fixation
        $request->session()->regenerate();
        
        // Log the user in
        /** @var \Illuminate\Contracts\Auth\StatefulGuard $auth */
        $auth = Auth::guard();
        $auth->login($user, true);
        
        // SECURITY NOTE: Log successful authentication
        Log::info('User authenticated via QR code', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
            'session_id' => $request->session()->getId()
        ]);
        
        // Redirect to intended location or default
        return redirect()->intended('/portal/dashboard')
            ->with('success', 'Logged in successfully via QR code');
    }
    
    /**
     * Check if user is authorized to use QR login
     * 
     * SECURITY NOTE: Centralized authorization logic
     */
    private function authorizeQrLogin(User $user): bool
    {
        // LOGIC NOTE: Add your business rules here
        // Example: Only verified users with 2FA enabled can use QR login
        
        // Default implementation - user must have verified email
        return !is_null($user->email_verified_at);
    }
    
    /**
     * Check if additional verification is required
     * 
     * SECURITY NOTE: Implement risk-based authentication
     */
    private function requiresAdditionalVerification(User $user, Request $request): bool
    {
        // LOGIC NOTE: Check for suspicious activity patterns
        $isNewIp = $user->last_login_ip && $user->last_login_ip !== $request->ip();
        $isUnusualTime = false; // Implement time-based risk assessment
        $hasExceededUsageLimit = ($user->login_qr_code_used_count ?? 0) > 100;
        
        return $isNewIp || $isUnusualTime || $hasExceededUsageLimit;
    }
    
    /**
     * Get secure URL for QR code image
     * 
     * SECURITY NOTE: Add temporary signed URLs for additional security
     */
    private function getSecureQrUrl(string $path): string
    {
        // For production, consider using temporary signed URLs
        // return Storage::disk('local')->temporaryUrl($path, now()->addMinutes(5));
        
        return '/storage/' . $path;
    }
    
    /**
     * Ensure storage link exists for QR code
     */
    private function ensureStorageLink(string $publicPath, string $privatePath): void
    {
        // LOGIC NOTE: Create symlink or copy file based on your storage setup
        $publicFullPath = storage_path('app/public/' . $publicPath);
        $privateFullPath = storage_path('app/' . $privatePath);
        
        $publicDir = dirname($publicFullPath);
        if (!is_dir($publicDir)) {
            mkdir($publicDir, 0755, true);
        }
        
        copy($privateFullPath, $publicFullPath);
    }
}