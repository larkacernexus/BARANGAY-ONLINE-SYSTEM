<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class LoginController extends Controller
{
    /**
     * Show the login form.
     */
    public function create(Request $request)
    {
        if (auth()->check()) {
            return redirect()->intended('/dashboard');
        }
        
        $lastLogin = null;
        $failedAttempts = 0;
        $isLocked = false;
        $rateLimitRemaining = null;
        $rateLimitReset = null;
        
        // Check rate limiting for IP
        $throttleKey = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $rateLimitRemaining = 0;
            $rateLimitReset = RateLimiter::availableIn($throttleKey);
        } else {
            $rateLimitRemaining = 5 - RateLimiter::attempts($throttleKey);
        }
        
        // Get user by email from input
        $email = old('email');
        if ($email) {
            $user = User::where('email', $email)->first();
            
            if ($user) {
                // Get last successful login
                $lastLogin = UserLoginLog::where('user_id', $user->id)
                    ->where('is_successful', true)
                    ->latest('login_at')
                    ->first();
                
                // Get failed attempts in last 15 minutes
                $failedAttempts = UserLoginLog::where('user_id', $user->id)
                    ->where('is_successful', false)
                    ->where('created_at', '>', Carbon::now()->subMinutes(15))
                    ->count();
                    
                // Check if account is locked
                $isLocked = $this->isAccountLocked($user);
            }
        }
        
        return inertia('auth/login', [
            'status' => session('status'),
            'canResetPassword' => true,
            'lastLoginInfo' => $lastLogin ? [
                'time' => $lastLogin->login_at,
                'ip' => $lastLogin->ip_address,
                'device' => $this->formatDeviceInfo($lastLogin),
                'location' => $this->getLocation($lastLogin->ip_address),
                'session_id' => $lastLogin->session_id, // Added
            ] : null,
            'failedLoginCount' => $failedAttempts,
            'isLocked' => $isLocked,
            'unlockTime' => $isLocked ? Carbon::now()->addMinutes(15)->toISOString() : null,
            'rateLimitRemaining' => $rateLimitRemaining,
            'rateLimitReset' => $rateLimitReset,
        ]);
    }
    
    /**
     * Handle a login request.
     */
public function store(Request $request)
{
    // Validate credentials
    $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);
    
    // Throttle login attempts by IP + email
    $throttleKey = 'login:' . $request->ip() . '|' . $request->email;
    
    if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
        $seconds = RateLimiter::availableIn($throttleKey);
        
        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }
    
    // Find user
    $user = User::where('email', $request->email)->first();
    
    // Check if user exists
    if (!$user) {
        $this->logFailedAttempt($request, null, 'User not found');
        RateLimiter::hit($throttleKey);
        
        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }
    
    // Check if user account is active
    if ($user->status !== 'active') {
        $this->logFailedAttempt($request, $user, 'Account not active');
        RateLimiter::hit($throttleKey);
        
        throw ValidationException::withMessages([
            'email' => 'Your account is not active. Please contact administrator.',
        ]);
    }
    
    // Check if account is locked
    if ($this->isAccountLocked($user)) {
        throw ValidationException::withMessages([
            'email' => 'Account temporarily locked due to too many failed attempts. Please try again later.',
        ]);
    }
    
    // Check password manually
    if (!Hash::check($request->password, $user->password)) {
        $this->logFailedAttempt($request, $user, 'Invalid password');
        $this->incrementFailedAttempts($user);
        RateLimiter::hit($throttleKey);
        
        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }
    
    // Reset failed attempts on successful login
    $this->resetFailedAttempts($user);
    
    // Check if password change is required
    // if ($user->require_password_change) {
    //     Auth::logout();
    //     return redirect()->route('password.change')
    //         ->with('message', 'Password change required. Please set a new password.');
    // }
    
    // Log the user in manually FIRST - This creates the session
    Auth::login($user, $request->boolean('remember'));
    
    // Now get the session ID (it exists in the sessions table)
    $sessionId = session()->getId();
    
    // Log successful login WITH the session ID
    $this->logSuccessfulLogin($request, $user, $sessionId);
    
    // Regenerate session ID for security
    $request->session()->regenerate();
    $newSessionId = session()->getId();
    
    // Update login log with new session ID after regeneration
    $this->updateLoginLogSessionId($user->id, $sessionId, $newSessionId);
    
    // Clear rate limiter
    RateLimiter::clear($throttleKey);
    
    // Update user's last login info
    $user->update([
        'last_login_at' => Carbon::now(),
        'last_login_ip' => $request->ip(),
        'login_count' => $user->login_count + 1,
        'current_session_id' => $newSessionId, // Store current session ID
    ]);
    
    return redirect()->intended('/dashboard')
        ->with('status', 'Login successful');
}

/**
 * Log successful login.
 */
private function logSuccessfulLogin(Request $request, User $user, string $sessionId): void
{
    UserLoginLog::create([
        'user_id' => $user->id,
        'session_id' => $sessionId, // Use the provided session ID
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'login_at' => Carbon::now(),
        'is_successful' => true,
        'device_type' => $this->getDeviceType($request),
        'browser' => $this->getBrowser($request),
        'platform' => $this->getPlatform($request),
    ]);
}
    
    /**
     * Log the user out.
     */
    public function destroy(Request $request)
    {
        // Log logout with current session ID
        if (auth()->check()) {
            $this->logLogout(auth()->user(), session()->getId());
        }
        
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/')
            ->with('status', 'You have been logged out.');
    }
    
    /**
     * Check if account is locked.
     */
    private function isAccountLocked(User $user): bool
    {
        $lockThreshold = 5;
        $lockMinutes = 15;
        
        if ($user->failed_login_attempts >= $lockThreshold) {
            $lastAttempt = $user->last_failed_login_at;
            
            if ($lastAttempt && $lastAttempt->addMinutes($lockMinutes)->isFuture()) {
                return true;
            }
            
            // Reset if lock period has passed
            $this->resetFailedAttempts($user);
        }
        
        return false;
    }
    
    /**
     * Log failed login attempt.
     */
    private function logFailedAttempt(Request $request, ?User $user, string $reason): void
    {
        UserLoginLog::create([
            'user_id' => $user?->id,
            'session_id' => null, // No session for failed attempts
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => Carbon::now(),
            'is_successful' => false,
            'failure_reason' => $reason,
            'device_type' => $this->getDeviceType($request),
            'browser' => $this->getBrowser($request),
            'platform' => $this->getPlatform($request),
        ]);
    }
    

    /**
     * Update login log with new session ID after regeneration.
     */
    private function updateLoginLogSessionId(int $userId, string $oldSessionId, string $newSessionId): void
    {
        // Update the most recent login log for this user
        UserLoginLog::where('user_id', $userId)
            ->where('session_id', $oldSessionId)
            ->where('is_successful', true)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first()
            ?->update(['session_id' => $newSessionId]);
    }
    
    /**
     * Log logout.
     */
    private function logLogout(User $user, string $sessionId): void
    {
        // Find login log by session_id
        $latestLogin = UserLoginLog::where('user_id', $user->id)
            ->where('session_id', $sessionId)
            ->where('is_successful', true)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first();
            
        if ($latestLogin) {
            $latestLogin->update([
                'logout_at' => Carbon::now(),
            ]);
        }
        
        $user->update([
            'last_logout_at' => Carbon::now(),
            'current_session_id' => null, // Clear current session
        ]);
    }
    
    /**
     * Increment failed login attempts.
     */
    private function incrementFailedAttempts(User $user): void
    {
        $user->update([
            'failed_login_attempts' => $user->failed_login_attempts + 1,
            'last_failed_login_at' => Carbon::now(),
        ]);
    }
    
    /**
     * Reset failed login attempts.
     */
    private function resetFailedAttempts(User $user): void
    {
        $user->update([
            'failed_login_attempts' => 0,
            'last_failed_login_at' => null,
        ]);
    }
    
    /**
     * Get device type from request.
     */
    private function getDeviceType(Request $request): string
    {
        $agent = strtolower($request->userAgent());
        
        if (strpos($agent, 'mobile') !== false) {
            return 'Mobile';
        } elseif (strpos($agent, 'tablet') !== false || strpos($agent, 'ipad') !== false) {
            return 'Tablet';
        }
        
        return 'Desktop';
    }
    
    /**
     * Get browser from request.
     */
    private function getBrowser(Request $request): string
    {
        $agent = strtolower($request->userAgent());
        
        if (strpos($agent, 'chrome') !== false && strpos($agent, 'edg') === false) return 'Chrome';
        if (strpos($agent, 'firefox') !== false) return 'Firefox';
        if (strpos($agent, 'safari') !== false && strpos($agent, 'chrome') === false) return 'Safari';
        if (strpos($agent, 'edge') !== false || strpos($agent, 'edg') !== false) return 'Edge';
        
        return 'Unknown';
    }
    
    /**
     * Get platform from request.
     */
    private function getPlatform(Request $request): string
    {
        $agent = strtolower($request->userAgent());
        
        if (strpos($agent, 'windows') !== false) return 'Windows';
        if (strpos($agent, 'mac') !== false) return 'macOS';
        if (strpos($agent, 'linux') !== false) return 'Linux';
        if (strpos($agent, 'android') !== false) return 'Android';
        if (strpos($agent, 'iphone') !== false || strpos($agent, 'ipad') !== false) return 'iOS';
        
        return 'Unknown';
    }
    
    /**
     * Format device info for display.
     */
    private function formatDeviceInfo(UserLoginLog $log): string
    {
        return "{$log->browser} on {$log->platform} ({$log->device_type})";
    }
    
    /**
     * Get location from IP.
     */
    private function getLocation(string $ip): ?string
    {
        // Implement IP geolocation here if needed
        // Example using a service:
        // try {
        //     $response = Http::get("http://ip-api.com/json/{$ip}");
        //     $data = $response->json();
        //     return $data['city'] . ', ' . $data['country'];
        // } catch (\Exception $e) {
        //     return null;
        // }
        return null;
    }
    
    /**
     * Get login logs for current session (helper method).
     */
    public function getCurrentSessionLogs()
    {
        if (!auth()->check()) {
            return collect();
        }
        
        return UserLoginLog::where('user_id', auth()->id())
            ->where('session_id', session()->getId())
            ->orderBy('login_at', 'desc')
            ->get();
    }
}