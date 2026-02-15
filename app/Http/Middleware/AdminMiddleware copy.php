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

        // STRING ROLE
      if (auth()->user()->role_id !== 1) {
                abort(403, 'Admins only.');
            }
        // NUMERIC ROLE (example)
        // if (auth()->user()->role_as !== 1) {
        //     abort(403, 'Unauthorized');
        // }

        return $next($request);
    }
}
