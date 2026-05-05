<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class LoginController extends Controller
{
    private const ROLE_HOUSEHOLD_HEAD = 13;
    private const MAX_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;
    
    private function getThrottleKey(Request $request): string
    {
        return 'login_attempts_' . strtolower($request->email) . '_' . $request->ip();
    }
    
    private function isRateLimited(Request $request): bool
    {
        $key = $this->getThrottleKey($request);
        $attempts = (int) Cache::get($key, 0);
        return $attempts >= self::MAX_ATTEMPTS;
    }
    
    private function getRemainingAttempts(Request $request): int
    {
        $key = $this->getThrottleKey($request);
        $attempts = (int) Cache::get($key, 0);
        return max(0, self::MAX_ATTEMPTS - $attempts);
    }
    
    private function getLockoutTimeRemaining(Request $request): int
    {
        $key = $this->getThrottleKey($request);
        $lockoutUntil = Cache::get($key . '_lockout');
        
        if ($lockoutUntil && $lockoutUntil > now()) {
            return now()->diffInSeconds($lockoutUntil);
        }
        
        return 0;
    }
    
    private function incrementRateLimiter(Request $request): void
    {
        $key = $this->getThrottleKey($request);
        $attempts = (int) Cache::get($key, 0);
        $attempts++;
        
        Cache::put($key, $attempts, now()->addMinutes(self::LOCKOUT_MINUTES));
        
        if ($attempts >= self::MAX_ATTEMPTS) {
            Cache::put($key . '_lockout', now()->addMinutes(self::LOCKOUT_MINUTES), now()->addMinutes(self::LOCKOUT_MINUTES));
        }
    }
    
    private function clearRateLimiter(Request $request): void
    {
        $key = $this->getThrottleKey($request);
        Cache::forget($key);
        Cache::forget($key . '_lockout');
    }
    
    public function create(Request $request)
    {
        if (Auth::check()) {
            return redirect()->intended('/dashboard');
        }
        
        $lastLogin = null;
        $failedAttempts = 0;
        $isLocked = false;
        $unlockTime = null;
        $user = null;
        $isRateLimited = false;
        $rateLimitReset = null;
        
        $email = old('email');
        
        if ($email) {
            $user = User::with('role')->where('email', $email)->first();
            
            $mockRequest = new Request();
            $mockRequest->merge(['email' => $email]);
            $mockRequest->server->set('REMOTE_ADDR', $request->ip());
            
            $isRateLimited = $this->isRateLimited($mockRequest);
            
            if ($isRateLimited) {
                $seconds = $this->getLockoutTimeRemaining($mockRequest);
                $rateLimitReset = now()->addSeconds($seconds)->timestamp;
            }
            
            if ($user && !$isRateLimited) {
                $lastLogin = UserLoginLog::where('user_id', $user->id)
                    ->where('is_successful', true)
                    ->latest('login_at')
                    ->first();
                
                $failedAttempts = UserLoginLog::where('user_id', $user->id)
                    ->where('is_successful', false)
                    ->where('created_at', '>', Carbon::now()->subMinutes(15))
                    ->count();
                    
                $isLocked = $this->isAccountLocked($user);
                
                if ($isLocked && $user->last_failed_login_at) {
                    $unlockTime = $user->last_failed_login_at->addMinutes(15)->toISOString();
                }
            }
        }
        
        return inertia('auth/login', [
            'status' => session('status'),
            'canResetPassword' => true,
            'lastLoginInfo' => ($lastLogin && $user && !$isRateLimited) ? [
                'time' => $lastLogin->login_at->toISOString(),
                'ip' => $this->maskIpAddress($lastLogin->ip_address),
                'device' => $this->formatDeviceInfo($lastLogin),
                'location' => $this->getLocation($lastLogin->ip_address),
            ] : null,
            'failedLoginCount' => $failedAttempts,
            'isLocked' => $isLocked,
            'unlockTime' => $unlockTime,
            'isRateLimited' => $isRateLimited,
            'rateLimitReset' => $rateLimitReset,
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:1',
        ]);
        
        if ($this->isRateLimited($request)) {
            $seconds = $this->getLockoutTimeRemaining($request);
            
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }
        
        $user = User::with('role')->where('email', $request->email)->first();
        
        $passwordValid = false;
        
        if ($user) {
            $passwordValid = Hash::check($request->password, $user->password);
        } else {
            $fakeUser = new User();
            $fakeUser->password = Hash::make(fake()->password(20));
            Hash::check($request->password, $fakeUser->password);
        }
        
        if (!$user || !$passwordValid) {
            $this->incrementRateLimiter($request);
            $this->logFailedAttempt($request, $user, 'Invalid credentials');
            
            if ($user) {
                $this->incrementFailedAttempts($user);
            }
            
            $remaining = $this->getRemainingAttempts($request);
            $message = $remaining > 0 
                ? __('auth.failed') . " You have {$remaining} attempt(s) remaining."
                : __('auth.throttle', ['seconds' => self::LOCKOUT_MINUTES * 60, 'minutes' => self::LOCKOUT_MINUTES]);
            
            throw ValidationException::withMessages([
                'email' => $message,
            ]);
        }
        
        if (!$user->isActive()) {
            $this->incrementRateLimiter($request);
            $this->logFailedAttempt($request, $user, 'Account not active');
            
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }
        
        if ($this->isAccountLocked($user)) {
            $this->logFailedAttempt($request, $user, 'Account locked');
            
            throw ValidationException::withMessages([
                'email' => __('auth.throttle', [
                    'seconds' => 900,
                    'minutes' => 15,
                ]),
            ]);
        }
        
        if (!$user->role) {
            $this->logFailedAttempt($request, $user, 'No role assigned');
            
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }
        
        $this->resetFailedAttempts($user);
        $this->clearRateLimiter($request);
        
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        
        $this->logSuccessfulLogin($request, $user);
        $user->recordLogin($request->ip());
        
        return $this->redirectBasedOnRole($user);
    }
    
    /**
     * Handle forgot password - simply flags the user for admin review.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.exists' => 'No account found with this email address.',
        ]);

        User::where('email', $request->email)->update([
            'password_requested_at' => now(),
        ]);

        return back()->with('status', 'Barangay officials have been notified. They will assist you shortly.');
    }
    
    private function isHouseholdUser(User $user): bool
    {
        $householdRoleId = config('auth.roles.household_head', self::ROLE_HOUSEHOLD_HEAD);
        return $user->role_id === $householdRoleId;
    }
    
    private function isAdminUser(User $user): bool
    {
        $roleId = $user->role_id;
        $householdRoleId = config('auth.roles.household_head', self::ROLE_HOUSEHOLD_HEAD);
        
        return $roleId !== null && $roleId !== $householdRoleId;
    }
    
    private function redirectBasedOnRole(User $user)
    {
        $roleName = $user->role?->name;
        
        if (!$roleName) {
            Auth::logout();
            return redirect()->route('login')
                ->withErrors(['email' => __('auth.failed')]);
        }
        
        $user->load('permissions');
        
        session()->put([
            'user.role' => $roleName,
            'user.role_id' => $user->role_id,
            'user.permission_ids' => $user->permissions->pluck('id')->toArray(),
            'user.full_name_hash' => hash('sha256', $user->full_name),
            'user.resident_id' => $user->resident_id,
            'user.is_household_head' => $user->is_household_head ?? false,
            'user.show_password_change_modal' => $user->require_password_change || is_null($user->password_changed_at),
        ]);
        
        if ($this->isHouseholdUser($user)) {
            return redirect()->intended('/portal/dashboard')
                ->with('status', 'Login successful. Welcome to your household portal.');
        }
        
        if ($this->isAdminUser($user)) {
            return redirect()->intended('/admin/dashboard')
                ->with('status', 'Login successful. Welcome to the Barangay Administration.');
        }
        
        Auth::logout();
        return redirect()->route('login')
            ->withErrors(['email' => __('auth.failed')]);
    }
    
    private function isAccountLocked(User $user): bool
    {
        $lockThreshold = config('auth.lockout.attempts', 5);
        $lockMinutes = config('auth.lockout.minutes', 15);
        
        if (($user->failed_login_attempts ?? 0) >= $lockThreshold) {
            $lastAttempt = $user->last_failed_login_at;
            
            if ($lastAttempt && $lastAttempt->addMinutes($lockMinutes)->isFuture()) {
                return true;
            }
            
            $this->resetFailedAttempts($user);
        }
        
        return false;
    }
    
    private function logSuccessfulLogin(Request $request, User $user): void
    {
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
            'user_role' => $user->role?->name,
        ]);
    }
    
    private function logFailedAttempt(Request $request, ?User $user, string $reason): void
    {
        UserLoginLog::create([
            'user_id' => $user?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => Carbon::now(),
            'is_successful' => false,
            'failure_reason' => $reason,
            'device_type' => $this->getDeviceType($request),
            'browser' => $this->getBrowser($request),
            'platform' => $this->getPlatform($request),
            'user_role' => $user?->role?->name,
        ]);
    }
    
    private function incrementFailedAttempts(User $user): void
    {
        $user->update([
            'failed_login_attempts' => ($user->failed_login_attempts ?? 0) + 1,
            'last_failed_login_at' => Carbon::now(),
        ]);
    }
    
    private function resetFailedAttempts(User $user): void
    {
        $user->update([
            'failed_login_attempts' => 0,
            'last_failed_login_at' => null,
        ]);
    }
    
    private function getDeviceType(Request $request): string
    {
        $agent = strtolower($request->userAgent() ?? '');
        
        if (str_contains($agent, 'mobile')) return 'Mobile';
        if (str_contains($agent, 'tablet') || str_contains($agent, 'ipad')) return 'Tablet';
        
        return 'Desktop';
    }
    
    private function getBrowser(Request $request): string
    {
        $agent = strtolower($request->userAgent() ?? '');
        
        if (str_contains($agent, 'edg') || str_contains($agent, 'edge')) return 'Edge';
        if (str_contains($agent, 'chrome') && !str_contains($agent, 'edg')) return 'Chrome';
        if (str_contains($agent, 'firefox')) return 'Firefox';
        if (str_contains($agent, 'safari') && !str_contains($agent, 'chrome')) return 'Safari';
        
        return 'Unknown';
    }
    
    private function getPlatform(Request $request): string
    {
        $agent = strtolower($request->userAgent() ?? '');
        
        if (str_contains($agent, 'windows')) return 'Windows';
        if (str_contains($agent, 'mac')) return 'macOS';
        if (str_contains($agent, 'linux')) return 'Linux';
        if (str_contains($agent, 'android')) return 'Android';
        if (str_contains($agent, 'iphone') || str_contains($agent, 'ipad')) return 'iOS';
        
        return 'Unknown';
    }
    
    private function formatDeviceInfo(UserLoginLog $log): string
    {
        $browser = $log->browser ?? 'Unknown';
        $platform = $log->platform ?? 'Unknown';
        $deviceType = $log->device_type ?? 'Desktop';
        
        return "{$browser} on {$platform} ({$deviceType})";
    }
    
    private function maskIpAddress(?string $ip): ?string
    {
        if (!$ip) return null;
        
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            if (count($parts) === 4) {
                return $parts[0] . '.' . $parts[1] . '.*.*';
            }
        }
        
        return '***.***.***.***';
    }
    
    private function getLocation(string $ip): ?string
    {
        return null;
    }
    
    public function destroy(Request $request)
    {
        if (Auth::check()) {
            $userId = Auth::id();
            
            $loginLog = UserLoginLog::where('user_id', $userId)
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
        
        return redirect('/')->with('status', 'You have been logged out.');
    }

    public function showChangeForm(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        return inertia('auth/change-password', [
            'require_password_change' => false,
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|min:8|confirmed|different:current_password',
        ]);

        $user->update([
            'password' => Hash::make($request->new_password),
            'require_password_change' => false,
            'password_changed_at' => Carbon::now(),
        ]);

        return redirect()->back()->with('success', 'Password changed successfully.');
    }
    
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