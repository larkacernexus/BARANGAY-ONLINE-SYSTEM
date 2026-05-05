<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            session()->put('url.intended', $request->url());
            return redirect()->route('login');
        }

        $user = Auth::user();

        if (!$user->isActive()) {
            Auth::logout();
            return redirect()->route('login')
                ->with('error', 'Your account has been deactivated.');
        }

        if ($user->isHouseholdHead()) {
            session()->regenerate();
            session()->forget(['admin_impersonate', 'admin_last_route']);
            return redirect('/portal/dashboard')
                ->with('info', 'You have been redirected to the resident portal.');
        }

        if (!$user->role) {
            abort(403);
        }

        if (!$user->role->hasPermission('view-admin-dashboard')) {
            abort(403);
        }

        return $this->addSecurityHeaders($next($request));
    }

    private function addSecurityHeaders(Response $response): Response
    {
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}