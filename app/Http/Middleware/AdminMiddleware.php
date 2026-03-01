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
        
        // Check if user has an admin role
        if (!in_array($user->role->name, $adminRoles)) {
            // If not admin, redirect to resident portal
            return redirect('/portal/dashboard')
                ->with('error', 'You do not have access to the admin dashboard. Redirecting to resident portal.');
        }

        return $next($request);
    }
}