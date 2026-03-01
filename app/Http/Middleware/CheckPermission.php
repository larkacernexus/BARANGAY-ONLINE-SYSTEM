<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        // Check if user has a role
        if (!$user->role) {
            abort(403, 'No role assigned to your account.');
        }

        // Allow Administrator and Barangay Captain to access everything
        $superRoles = ['Administrator', 'Barangay Captain'];
        if (in_array($user->role->name, $superRoles)) {
            return $next($request);
        }

        // Check if user has the specific permission
        if (!$user->hasPermission($permission)) {
            // Log the permission denial for debugging
            \Log::warning('Permission denied', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role->name,
                'permission_required' => $permission,
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip()
            ]);
            
            abort(403, 'You do not have permission to access this page. Required permission: ' . $permission);
        }

        return $next($request);
    }
}