<?php

use App\Http\Controllers\Residentsettings\PasswordController;
use App\Http\Controllers\Settings\ResidentProfileController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Residentsettings\SettingsController;

use App\Http\Controllers\Residentsettings\ResidentTwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    // Resident profile routes
    Route::get('/residentsettings/profile', [ResidentProfileController::class, 'show'])
        ->name('resident.profile.show');    
    Route::patch('residentsettings/profile', [ResidentProfileController::class, 'update'])
        ->name('profile.update');
    Route::delete('residentsettings/profile', [ResidentProfileController::class, 'destroy'])
        ->name('profile.destroy');
    Route::get('/residentsettings/devices', [SettingsController::class, 'connectedDevices'])->name('devices');
    Route::get('/residentsettings/billing', [SettingsController::class, 'billing'])->name('billing');
    Route::get('/residentsettings/privacy', [SettingsController::class, 'privacy'])->name('privacy');

    // Resident password routes
    Route::get('residentsettings/security/password', [PasswordController::class, 'edit'])
        ->name('user-password.edit');
    Route::put('residentsettings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    // Appearance route
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    // **CRITICAL FIX**: Resident password confirmation routes - MOVE OUTSIDE
    Route::prefix('resident')->name('resident.')->group(function () {
        Route::get('/confirm-password', [ConfirmablePasswordController::class, 'show'])
            ->name('password.confirm');
        
        Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store'])
            ->name('password.confirm.store');
    });

        Route::get('residentsettings/preferences/appearance', function () {
        return Inertia::render('residentsettings/appearance');
    })->name('residentsettings.edit');

    // Two-Factor Authentication Routes - Resident specific
    Route::prefix('residentsettings/security/two-factor')->name('resident.two-factor.')->group(function () {
        Route::get('/', [ResidentTwoFactorAuthenticationController::class, 'show'])
            ->name('show');
        
        Route::post('/enable', [ResidentTwoFactorAuthenticationController::class, 'enable'])
            ->name('enable');
        
        Route::post('/confirm', [ResidentTwoFactorAuthenticationController::class, 'confirm'])
            ->name('confirm');
        
        Route::post('/disable', [ResidentTwoFactorAuthenticationController::class, 'disable'])
            ->name('disable');
        
        Route::post('/cancel-setup', [ResidentTwoFactorAuthenticationController::class, 'cancelSetup'])
            ->name('cancel-setup');
        
        Route::get('/recovery-codes', [ResidentTwoFactorAuthenticationController::class, 'getRecoveryCodes'])
            ->name('recovery-codes');
        
        Route::post('/regenerate-recovery-codes', [ResidentTwoFactorAuthenticationController::class, 'regenerateRecoveryCodes'])
            ->name('regenerate-recovery-codes');


    Route::get('/password', [SettingsController::class, 'password'])->name('password');
    Route::get('/two-factor', [SettingsController::class, 'twoFactor'])->name('two-factor');
    Route::get('/appearance', [SettingsController::class, 'appearance'])->name('appearance');
    
    // NEW ROUTES
    Route::get('/privacy', [SettingsController::class, 'privacy'])->name('privacy');
    
    // Optional: Add routes for child pages if using nested navigation
    Route::get('/security', [SettingsController::class, 'security'])->name('security');
    Route::get('/preferences', [SettingsController::class, 'preferences'])->name('preferences');
    Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
    });
});