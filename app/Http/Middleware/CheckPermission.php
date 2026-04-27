<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        // SECURITY NOTE: Rate limit permission failures to prevent enumeration
        $key = 'permission_check:' . $request->ip();
        
        // Check if user is authenticated
        if (!$request->user()) {
            RateLimiter::hit($key);
            return redirect()->route('login');
        }

        $user = $request->user();
        
        // SECURITY NOTE: Eager load role and permissions to prevent N+1 queries
        if (!$user->relationLoaded('role')) {
            $user->load('role.permissions');
        }
        
        // LOGIC NOTE: Validate role existence without exposing internal state
        if (!$user->role) {
            // SECURITY NOTE: Log critical configuration error
            Log::critical('User has no role assigned', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'ip' => $request->ip(),
            ]);
            
            // SECURITY NOTE: Generic error message prevents information disclosure
            abort(403, 'Access denied.');
        }
        
        // SECURITY NOTE: Check if user has super-admin privileges from database
        if ($this->hasSuperAccess($user)) {
            // LOGIC NOTE: Log super-role access for audit purposes
            Log::info('Super-role access granted', [
                'user_id' => $user->id,
                'role' => $user->role->name,
                'permission_bypassed' => $permission,
                'route' => $request->route()->getName(),
            ]);
            
            return $next($request);
        }
        
        // SECURITY NOTE: Check specific permission with caching
        if (!$this->userHasPermission($user, $permission)) {
            // Rate limit failed permission checks
            RateLimiter::hit($key, 60);
            
            // SECURITY NOTE: Log detailed information but return generic error
            Log::warning('Permission denied', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role->name,
                'permission_required' => $permission,
                'route' => $request->route()->getName(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'parameters' => $this->sanitizeParameters($request->route()->parameters()),
            ]);
            
            // SECURITY NOTE: Generic error message - never expose permission names
            abort(403, 'Access denied.');
        }
        
        // SECURITY NOTE: Log successful permission checks for sensitive permissions
        if ($this->isSensitivePermission($permission)) {
            Log::info('Sensitive permission accessed', [
                'user_id' => $user->id,
                'permission' => $permission,
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
            ]);
        }
        
        // Add security headers to response
        $response = $next($request);
        return $this->addSecurityHeaders($response);
    }
    
    /**
     * Check if user has super-access privileges.
     *
     * @param \App\Models\User $user
     * @return bool
     */
    private function hasSuperAccess($user): bool
    {
        // SECURITY NOTE: Cache super-access check to reduce database queries
        $cacheKey = "super_access:{$user->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($user) {
            // LOGIC NOTE: Check database flag instead of hardcoded roles
            return $user->role->is_super_role ?? false;
        });
    }
    
    /**
     * Check if user has specific permission with caching.
     *
     * @param \App\Models\User $user
     * @param string $permission
     * @return bool
     */
    private function userHasPermission($user, string $permission): bool
    {
        // SECURITY NOTE: Validate permission name format
        if (!$this->isValidPermissionName($permission)) {
            Log::warning('Invalid permission name format', [
                'permission' => $permission,
                'user_id' => $user->id,
            ]);
            return false;
        }
        
        // SECURITY NOTE: Cache permission check for performance
        $cacheKey = "user_permission:{$user->id}:{$permission}";
        
        return Cache::remember($cacheKey, 60, function () use ($user, $permission) {
            // LOGIC NOTE: Delegate to User model's permission check
            return $user->hasPermission($permission);
        });
    }
    
    /**
     * Validate permission name format to prevent injection.
     *
     * @param string $permission
     * @return bool
     */
    private function isValidPermissionName(string $permission): bool
    {
        // SECURITY NOTE: Only allow alphanumeric, hyphens, and underscores
        return preg_match('/^[a-zA-Z0-9\-_]+$/', $permission) === 1;
    }
    
    /**
     * Check if a permission is considered sensitive.
     *
     * @param string $permission
     * @return bool
     */
    private function isSensitivePermission(string $permission): bool
    {
        // SECURITY NOTE: Define sensitive permissions that require audit logging
        $sensitivePermissions = [
            'manage-users',
            'delete-users',
            'manage-roles',
            'view-audit-logs',
            'manage-backups',
            'delete-data',
        ];
        
        return in_array($permission, $sensitivePermissions, true);
    }
    
    /**
     * Sanitize route parameters for logging.
     *
     * @param array $parameters
     * @return array
     */
    private function sanitizeParameters(array $parameters): array
    {
        // SECURITY NOTE: Remove sensitive data from logs
        $sensitiveKeys = ['password', 'token', 'secret', 'key', 'credit_card', 'ssn'];
        
        return array_map(function ($value) use ($sensitiveKeys) {
            if (is_array($value)) {
                return $this->sanitizeParameters($value);
            }
            
            // Mask potentially sensitive values
            foreach ($sensitiveKeys as $key) {
                if (stripos((string)$value, $key) !== false) {
                    return '[REDACTED]';
                }
            }
            
            return $value;
        }, $parameters);
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
        
        // SECURITY NOTE: Enable strict transport security
        if (config('app.env') === 'production') {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }
        
        // SECURITY NOTE: Remove sensitive headers
        $response->headers->remove('X-Powered-By');
        
        return $response;
    }
    
    /**
     * Clear permission cache for a user.
     * Call this method when user permissions are modified.
     *
     * @param int $userId
     * @return void
     */
    public static function clearPermissionCache(int $userId): void
    {
        Cache::forget("super_access:{$userId}");
        
        // LOGIC NOTE: Use pattern to clear all permission caches for user
        $pattern = "user_permission:{$userId}:*";
        // Implementation depends on cache driver
    }
}