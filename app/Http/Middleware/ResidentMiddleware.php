<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResidentMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        // STRING ROLE
        if (auth()->user()->role !== 'resident') {
            abort(403, 'Unauthorized');
        }

        // NUMERIC ROLE (example)
        // if (auth()->user()->role_as !== 2) {
        //     abort(403, 'Unauthorized');
        // }

        return $next($request);
    }
}
