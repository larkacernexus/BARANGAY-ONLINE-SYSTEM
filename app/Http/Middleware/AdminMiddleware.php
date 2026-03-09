<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
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
        
        // ALL ADMIN ROLES - Based on your roles list
        $adminRoles = [
            'Administrator',
            'Barangay Captain',
            'Barangay Secretary',
            'Barangay Treasurer',
            'Barangay Kagawad',
            'SK Chairman',
            'SK Kagawad',
            'Treasury Officer',
            'Records Clerk',
            'Clearance Officer',
            'Viewer',
            'Staff',
        ];
        
        // Check if role exists and has is_system_role property
        $isSystemRole = isset($user->role->is_system_role) ? $user->role->is_system_role : null;
        
        // If is_system_role is 0 OR role is Household Head, redirect to resident portal
        if ($isSystemRole === 0 || $user->role->name === 'Household Head') {
            return redirect('/portal/dashboard')
                ->with('info', 'Welcome to the resident portal. The admin dashboard is for staff only.');
        }
        
        // Check if user has an admin role (for cases where is_system_role might not be set)
        if (!in_array($user->role->name, $adminRoles) && $isSystemRole !== 1) {
            abort(403, 'Access denied. You do not have permission to access the admin area. Your role: ' . $user->role->name);
        }

        return $next($request);
    }
}