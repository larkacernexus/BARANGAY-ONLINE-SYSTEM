<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        $user = auth()->user();
        
        if (!$user->role) {
            abort(403, 'No role assigned to your account.');
        }
        
        // ALLOW ALL NON-RESIDENT ROLES + Kagawads
        $adminRoles = [
            'Administrator',
            'Barangay Captain',
            'Barangay Secretary',
            'Barangay Treasurer',
            'Barangay Kagawad', // Kagawads can access admin panel too
            'SK Chairman',
            'SK Kagawad',
        ];
        
        if (!in_array($user->role->name, $adminRoles)) {
            abort(403, 'You do not have access to the admin dashboard.');
        }

        return $next($request);
    }
}