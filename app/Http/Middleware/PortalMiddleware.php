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
        
        // ROLES THAT CAN ACCESS RESIDENT PORTAL
        $residentPortalRoles = [
            'Household Head',        // Main resident role
        ];
        
        // If user has an admin role, redirect them to admin dashboard
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
        
        // If user is admin, redirect to admin dashboard
        if (in_array($user->role->name, $adminRoles)) {
            return redirect('/dashboard')
                ->with('info', 'Welcome to the admin dashboard.');
        }
        
        // Check if user is allowed in resident portal
        if (!in_array($user->role->name, $residentPortalRoles)) {
            abort(403, 'You do not have access to the resident portal. Your role: ' . $user->role->name);
        }

        return $next($request);
    }
}