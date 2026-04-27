<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // SECURITY NOTE: Ensure user is authenticated before checking roles
        /** @var \Illuminate\Contracts\Auth\Guard $guard */
        $guard = Auth::guard();
        
        if (!$guard->check()) {
            // LOGIC NOTE: Use intended URL for post-login redirect
            session()->put('url.intended', $request->url());
            return redirect()->route('login');
        }

        /** @var User|null $authUser */
        $authUser = $guard->user();
        
        // SECURITY NOTE: Verify user exists (should always be true after check())
        if (!$authUser) {
            Log::error('Auth check passed but user is null', [
                'ip' => $request->ip(),
                'route' => $request->route() ? $request->route()->getName() : null,
            ]);
            return redirect()->route('login');
        }
        
        // SECURITY NOTE: Eager load role relationship to prevent N+1 query
        /** @var User $user */
        $user = $authUser->load('role');
        
        // LOGIC NOTE: Early return for missing role - don't expose internal details
        if (!$user->role) {
            // SECURITY NOTE: Log security event without exposing details to user
            Log::warning('User attempted admin access without role assignment', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'route' => $request->route() ? $request->route()->getName() : null,
            ]);
            
            // SECURITY NOTE: Generic error message prevents information disclosure
            abort(403, 'Access denied.');
        }
        
        // SECURITY NOTE: Check if user should be redirected to resident portal
        if ($this->shouldRedirectToPortal($user)) {
            // SECURITY NOTE: Regenerate session ID on privilege boundary change
            session()->regenerate();
            
            // LOGIC NOTE: Clear any admin-specific session data
            session()->forget(['admin_impersonate', 'admin_last_route']);
            
            // SECURITY NOTE: Use safe flash data (escaped automatically by Laravel)
            return redirect('/portal/dashboard')
                ->with('info', 'You have been redirected to the resident portal.');
        }
        
        // SECURITY NOTE: Verify admin access with cached permission check
        if (!$this->hasAdminAccess($user)) {
            // SECURITY NOTE: Log failed admin access attempts for audit
            Log::warning('Failed admin access attempt', [
                'user_id' => $user->id,
                'role' => $user->role->name,
                'is_system_role' => $user->role->is_system_role ?? null,
                'ip' => $request->ip(),
                'route' => $request->route() ? $request->route()->getName() : null,
            ]);
            
            abort(403, 'Access denied.');
        }
        
        // SECURITY NOTE: Add security headers to response
        $response = $next($request);
        
        return $this->addSecurityHeaders($response);
    }
    
    /**
     * Determine if user should be redirected to resident portal.
     *
     * @param User $user
     * @return bool
     */
    private function shouldRedirectToPortal(User $user): bool
    {
        // LOGIC NOTE: Check multiple conditions with clear boolean logic
        
        // Household Head always goes to portal
        if ($user->role->name === 'Household Head') {
            return true;
        }
        
        // SECURITY NOTE: Explicit null check before strict comparison
        $isSystemRole = $user->role->is_system_role ?? null;
        
        // Non-system roles (is_system_role === 0) go to portal
        // Use identical comparison (===) to prevent type juggling
        if ($isSystemRole === 0) {
            return true;
        }
        
        // If role is null or not defined, redirect to portal for safety
        if ($isSystemRole === null) {
            // SECURITY NOTE: Log configuration issue for investigation
            Log::error('Role has no is_system_role defined', [
                'role_id' => $user->role->id,
                'role_name' => $user->role->name,
            ]);
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if user has admin access using cached permissions.
     *
     * @param User $user
     * @return bool
     */
    private function hasAdminAccess(User $user): bool
    {
        // SECURITY NOTE: Cache admin role check for 1 minute to reduce database queries
        $cacheKey = "admin_access:{$user->id}";
        
        return Cache::remember($cacheKey, 60, function () use ($user) {
            // SECURITY NOTE: Get admin roles from database, not hardcoded
            $adminRoles = $this->getAdminRoles();
            
            // Check if user's role is in admin roles list
            if (in_array($user->role->name, $adminRoles, true)) {
                return true;
            }
            
            // Check is_system_role flag with type safety
            $isSystemRole = $user->role->is_system_role ?? null;
            
            // LOGIC NOTE: Only allow if is_system_role is explicitly true (1)
            return $isSystemRole === 1;
        });
    }
    
    /**
     * Get list of admin role names from database.
     *
     * @return array
     */
    private function getAdminRoles(): array
    {
        // SECURITY NOTE: Cache admin roles list to avoid repeated database queries
        return Cache::remember('admin_roles_list', 3600, function () {
            // LOGIC NOTE: Fetch from database to allow dynamic role management
            /** @var \Illuminate\Database\Eloquent\Collection $roles */
            $roles = \App\Models\Role::where('is_system_role', 1)
                ->pluck('name');
            
            return $roles->toArray();
        });
    }
    
    /**
     * Add security headers to response.
     *
     * @param Response $response
     * @return Response
     */
    private function addSecurityHeaders(Response $response): Response
    {
        // SECURITY NOTE: Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');
        
        // SECURITY NOTE: Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        
        // SECURITY NOTE: Basic XSS protection (legacy browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // SECURITY NOTE: Referrer policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // SECURITY NOTE: Remove sensitive headers
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');
        
        return $response;
    }
}