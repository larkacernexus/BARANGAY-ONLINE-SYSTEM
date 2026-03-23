<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use App\Console\Commands\GenerateMigrationsFromSQL; // Add this line

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        GenerateMigrationsFromSQL::class, // Register the command here
    ])
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
        ]);
        
        // Route middleware aliases
        $middleware->alias([
            'admin'           => \App\Http\Middleware\AdminMiddleware::class,
            'portal'          => \App\Http\Middleware\PortalMiddleware::class,
            'permission'      => \App\Http\Middleware\CheckPermission::class,
            'resident.inertia' => \App\Http\Middleware\ResidentHandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();