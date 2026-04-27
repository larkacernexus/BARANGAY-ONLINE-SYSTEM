<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// SECURITY NOTE: All routes in this file are protected by 'auth' middleware
// Additional authorization checks MUST be performed in controllers using Policies/Gates

Route::middleware(['auth', 'verified'])->group(function () {
    // LOGIC NOTE: Redirect from base settings to admin profile for consistent navigation
    Route::redirect('settings', '/admin/settings/profile');

    // Admin Settings Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        
        // Profile Management
        // SECURITY NOTE: ProfileController must use FormRequests with validated fields only
        // and verify Gate::allows('update', $user) before any modification
        Route::controller(ProfileController::class)
            ->prefix('settings/profile')
            ->name('profile.')
            ->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::patch('/', 'update')->name('update');
                // SECURITY NOTE: DELETE method requires additional password confirmation in controller
                Route::delete('/', 'destroy')->name('destroy');
            });
        
        // Password Management
        // SECURITY NOTE: Throttle prevents brute force attempts (6 attempts per minute)
        Route::controller(PasswordController::class)
            ->prefix('settings/password')
            ->name('password.')
            ->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::put('/', 'update')
                    ->middleware(['throttle:6,1', 'password.confirm'])
                    ->name('update');
            });
        
        // Appearance Settings
        // LOGIC NOTE: Simple Inertia render without backend state
        // SECURITY NOTE: User preferences should be validated against whitelist in controller
        Route::get('/settings/appearance', function () {
            return Inertia::render('settings/appearance');
        })->name('appearance.edit');
        
        // Two-Factor Authentication
        // SECURITY NOTE: All 2FA operations require recent authentication via password.confirm
        Route::controller(TwoFactorAuthenticationController::class)
            ->prefix('settings/two-factor')
            ->name('security.')
            ->middleware(['password.confirm']) // Requires recent password entry
            ->group(function () {
                // Enable 2FA workflow
                Route::post('/enable', 'enable')
                    ->middleware('throttle:3,10') // Prevent rapid-fire attempts
                    ->name('enable');
                    
                // Confirm and activate 2FA
                Route::post('/confirm', 'confirm')
                    ->middleware('throttle:5,10')
                    ->name('confirm');
                    
                // Cancel setup process
                Route::post('/cancel-setup', 'cancelSetup')
                    ->middleware('throttle:5,10')
                    ->name('cancel-setup');
                    
                // Disable 2FA
                // SECURITY NOTE: Use DELETE for resource removal, require password confirmation
                Route::delete('/disable', 'disable')
                    ->middleware(['throttle:3,30']) // Stricter throttling for sensitive operation
                    ->name('disable');
                    
                // Recovery Codes Management
                // SECURITY NOTE: Recovery codes are sensitive; show once and force regeneration if needed
                Route::get('/recovery-codes', 'getRecoveryCodes')
                    ->middleware('throttle:3,60') // Very strict throttling
                    ->name('recovery-codes');
                    
                Route::post('/recovery-codes/regenerate', 'regenerateRecoveryCodes')
                    ->middleware('throttle:2,3600') // Only allow twice per hour
                    ->name('recovery-codes.regenerate');
            });
    });
});