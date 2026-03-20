<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/admin/settings/profile');

    // Admin Settings Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        
        // Profile
        Route::get('/settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
        
        // Password
        Route::get('/settings/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('/settings/password', [PasswordController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('password.update');
        
        // Appearance
        Route::get('/settings/appearance', function () {
            return Inertia::render('settings/appearance');
        })->name('appearance.edit');
        
        // TWO-FACTOR AUTHENTICATION ROUTES - ADD THESE
        Route::controller(TwoFactorAuthenticationController::class)->prefix('settings/two-factor')->name('security.')->group(function () {
            Route::post('/enable', 'enable')->name('enable');
            Route::post('/confirm', 'confirm')->name('confirm');
            Route::post('/cancel-setup', 'cancelSetup')->name('cancel-setup');
            Route::delete('/disable', 'disable')->name('disable');
            Route::get('/recovery-codes', 'getRecoveryCodes')->name('recovery-codes');
            Route::post('/recovery-codes/regenerate', 'regenerateRecoveryCodes')->name('recovery-codes.regenerate');
        });
    });
});