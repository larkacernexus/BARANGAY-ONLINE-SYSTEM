<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
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
            // Redirect based on user's role
            return $this->redirectBasedOnRole(auth()->user());
        }
        
        $lastLogin = null;
        $failedAttempts = 0;
        $isLocked = false;
        
        // Get user by email from input
        $email = old('email');
        if ($email) {
            $user = User::with('role')->where('email', $email)->first();
            
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
            ] : null,
            'failedLoginCount' => $failedAttempts,
            'isLocked' => $isLocked,
            'unlockTime' => $isLocked ? Carbon::now()->addMinutes(15)->toISOString() : null,
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
        
        // Find user with role relationship
        $user = User::with('role')->where('email', $request->email)->first();
        
        // Check if user exists
        if (!$user) {
            $this->logFailedAttempt($request, null, 'User not found');
            RateLimiter::hit($throttleKey);
            
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }
        
        // Check if user account is active
        if (!$user->isActive()) {
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
        
        // Check if user has any role assigned
        if (!$user->role) {
            $this->logFailedAttempt($request, $user, 'No role assigned');
            
            throw ValidationException::withMessages([
                'email' => 'Your account does not have any role assigned. Please contact administrator.',
            ]);
        }
        
        // Reset failed attempts on successful login
        $this->resetFailedAttempts($user);
        
        // Log the user in
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        
        // Log successful login
        $this->logSuccessfulLogin($request, $user);
        
        // Update user's last login info
        $user->recordLogin($request->ip());
        
        // Clear rate limiter
        RateLimiter::clear($throttleKey);
        
        // Redirect based on user's role
        return $this->redirectBasedOnRole($user);
    }
    
    /**
     * Get user's role name.
     */
    private function getRoleName(User $user): ?string
    {
        return $user->role ? $user->role->name : null;
    }
    
    /**
     * Redirect user based on their role.
     */
    private function redirectBasedOnRole(User $user)
    {
        $roleName = $this->getRoleName($user);
        
        if (!$roleName) {
            Auth::logout();
            return redirect()->route('login')
                ->withErrors([
                    'email' => 'Your account does not have any role assigned. Please contact administrator.',
                ]);
        }
        
        // Store role in session
        session()->put([
            'user.role' => $roleName,
            'user.permissions' => $user->getPermissionNames(),
            'user.full_name' => $user->full_name,
            'user.show_password_change_modal' => $user->require_password_change || is_null($user->password_changed_at),
        ]);
        
        // Define redirect logic
        $residentRoles = ['Resident', 'Barangay Kagawad'];
        
        if (in_array($roleName, $residentRoles)) {
            return redirect()->intended('/residentdashboard')
                ->with('status', 'Login successful');
        } else {
            return redirect()->intended('/dashboard')
                ->with('status', 'Login successful');
        }
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
     * Log successful login.
     */
    private function logSuccessfulLogin(Request $request, User $user): void
    {
        $roleName = $this->getRoleName($user);
        
        UserLoginLog::create([
            'user_id' => $user->id,
            'session_id' => session()->getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => Carbon::now(),
            'is_successful' => true,
            'device_type' => $this->getDeviceType($request),
            'browser' => $this->getBrowser($request),
            'platform' => $this->getPlatform($request),
            'user_role' => $roleName,
        ]);
    }
    
    /**
     * Log failed login attempt.
     */
    private function logFailedAttempt(Request $request, ?User $user, string $reason): void
    {
        $roleName = $user ? $this->getRoleName($user) : null;
        
        UserLoginLog::create([
            'user_id' => $user?->id,
            'session_id' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => Carbon::now(),
            'is_successful' => false,
            'failure_reason' => $reason,
            'device_type' => $this->getDeviceType($request),
            'browser' => $this->getBrowser($request),
            'platform' => $this->getPlatform($request),
            'user_role' => $roleName,
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
            'account_locked_until' => null,
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
        // Return null for now, implement IP geolocation if needed
        return null;
    }
    
    /**
     * Log the user out.
     */
    public function destroy(Request $request)
    {
        // Find and update the login log for this session
        if (auth()->check()) {
            $loginLog = UserLoginLog::where('user_id', auth()->id())
                ->where('session_id', session()->getId())
                ->where('is_successful', true)
                ->whereNull('logout_at')
                ->latest('login_at')
                ->first();
                
            if ($loginLog) {
                $loginLog->update([
                    'logout_at' => Carbon::now(),
                    'session_duration' => Carbon::now()->diffInSeconds($loginLog->login_at),
                ]);
            }
        }
        
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/')
            ->with('status', 'You have been logged out.');
    }

    /**
     * Show password change form (optional)
     */
    public function showChangeForm(Request $request)
    {
        // Only allow access if logged in
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        return inertia('auth/change-password', [
            'require_password_change' => false,
        ]);
    }

    /**
     * Handle password change request (optional)
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        // Validate current password and new password
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|min:8|confirmed|different:current_password',
        ]);

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
            'require_password_change' => false,
            'password_changed_at' => Carbon::now(),
        ]);

        return redirect()->back()
            ->with('success', 'Password changed successfully.');
    }
    
    /**
     * Mark password as changed (dismiss modal)
     */
    public function dismissPasswordChange(Request $request)
    {
        $user = Auth::user();
        
        $user->update([
            'require_password_change' => false,
            'password_changed_at' => Carbon::now(),
        ]);
        
        return response()->json(['success' => true]);
    }
}