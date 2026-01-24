<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
        // Cookie encryption exceptions
        $middleware->encryptCookies(except: [
            'appearance',
            'sidebar_state',
        ]);
        
        // Web middleware stack (GLOBAL)
        $middleware->web(append: [
            \App\Http\Middleware\HandleAppearance::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            // \App\Http\Middleware\LogUserAccess::class, // ← COMMENT THIS OUT FOR NOW
        ]);
        
        // Route middleware aliases
        $middleware->alias([
            'admin'    => \App\Http\Middleware\AdminMiddleware::class,
            'resident' => \App\Http\Middleware\ResidentMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();