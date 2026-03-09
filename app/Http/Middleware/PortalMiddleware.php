<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PortalMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        $user = auth()->user();
        
        if (!$user->role) {
            abort(403, 'No role assigned to your account.');
        }
        
        // Check if user has a system role (is_system_role == 1)
        // This assumes your roles table has an is_system_role column
        if ($user->role->is_system_role == 1) {
            abort(403, 'Admin users cannot access the resident portal. Please use the admin dashboard.');
        }
        
        // ONLY allow Household Head role
        if ($user->role->name !== 'Household Head') {
            abort(403, 'Access denied. Only Household Heads can access the resident portal. Your role: ' . $user->role->name);
        }

        return $next($request);
    }
}