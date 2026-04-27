<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\User;

class PortalMiddleware
{
    /**
     * Allowed roles for resident portal access
     * 
     * SECURITY NOTE: Configure via config file or environment variable
     */
    private const ALLOWED_ROLES = ['Household Head'];
    
    /**
     * Cache TTL for role checks (in seconds)
     */
    private const ROLE_CACHE_TTL = 3600; // 1 hour
    
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // SECURITY NOTE: Use Auth facade with explicit type hint for Intelephense
        /** @var \Illuminate\Contracts\Auth\StatefulGuard $auth */
        $auth = auth();
        
        if (!$auth->check()) {
            Log::warning('Unauthenticated portal access attempt', [
                'ip' => $request->ip(),
                'path' => $request->path(),
                'user_agent' => $request->userAgent()
            ]);
            
            return redirect()->route('login');
        }

        /** @var User|null $user */
        $user = $auth->user();
        
        // LOGIC NOTE: This should never happen if auth check passes, but defensive coding
        if (!$user) {
            Log::error('Auth check passed but user is null', [
                'ip' => $request->ip(),
                'path' => $request->path()
            ]);
            
            return redirect()->route('login');
        }
        
        // SECURITY NOTE: Eager load role relationship if not already loaded
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }
        
        // SECURITY NOTE: Check if user has a role assigned
        if (!$user->role) {
            Log::warning('User without role attempted portal access', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'path' => $request->path()
            ]);
            
            // SECURITY NOTE: Generic error message - don't expose system details
            abort(403, 'Access denied.');
        }
        
        // SECURITY NOTE: Block system/admin roles from resident portal
        if ($this->isSystemRole($user)) {
            Log::warning('Admin user attempted resident portal access', [
                'user_id' => $user->id,
                'role' => $user->role->name,
                'ip' => $request->ip(),
                'path' => $request->path()
            ]);
            
            // SECURITY NOTE: Generic error message
            abort(403, 'Access denied.');
        }
        
        // SECURITY NOTE: Check if user's role is allowed
        if (!$this->isAllowedRole($user)) {
            Log::warning('Unauthorized role attempted portal access', [
                'user_id' => $user->id,
                'role' => $user->role->name,
                'ip' => $request->ip(),
                'path' => $request->path()
            ]);
            
            // SECURITY NOTE: Generic error message
            abort(403, 'Access denied.');
        }

        // SECURITY NOTE: Add portal access context to request for downstream use
        $request->attributes->set('portal_access', true);
        $request->attributes->set('portal_user_role', $user->role->name);
        
        // LOGIC NOTE: Log successful portal access (sampled to reduce log volume)
        if ($this->shouldLogAccess($request)) {
            Log::info('Portal accessed', [
                'user_id' => $user->id,
                'household_id' => $user->household_id ?? null,
                'ip' => $request->ip()
            ]);
        }

        return $next($request);
    }
    
    /**
     * Check if user has a system/admin role
     * 
     * SECURITY NOTE: Cached to improve performance
     */
    private function isSystemRole(User $user): bool
    {
        $cacheKey = 'user_system_role:' . $user->id;
        
        return Cache::remember($cacheKey, self::ROLE_CACHE_TTL, function () use ($user) {
            // Check if role has system_role flag
            if (isset($user->role->is_system_role)) {
                return (bool) $user->role->is_system_role;
            }
            
            // Alternative: Check against configurable system roles
            $systemRoles = config('auth.system_roles', ['Admin', 'Super Admin', 'Barangay Secretary']);
            
            return in_array($user->role->name, $systemRoles, true);
        });
    }
    
    /**
     * Check if user's role is allowed to access portal
     * 
     * SECURITY NOTE: Configurable via config file
     */
    private function isAllowedRole(User $user): bool
    {
        $allowedRoles = config('auth.portal_roles', self::ALLOWED_ROLES);
        
        return in_array($user->role->name, $allowedRoles, true);
    }
    
    /**
     * Determine if this request should be logged
     * 
     * LOGIC NOTE: Sample logs to reduce volume (log ~10% of requests)
     */
    private function shouldLogAccess(Request $request): bool
    {
        // Always log if in debug mode
        if (config('app.debug')) {
            return true;
        }
        
        // Sample 10% of requests
        return random_int(1, 10) === 1;
    }
    
    /**
     * Clear role cache for a user (call when role changes)
     */
    public static function clearRoleCache(int $userId): void
    {
        Cache::forget('user_system_role:' . $userId);
    }
}