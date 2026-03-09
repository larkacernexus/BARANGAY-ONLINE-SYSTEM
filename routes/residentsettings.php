<?php

use App\Http\Controllers\Residentsettings\PasswordController;
use App\Http\Controllers\Settings\ResidentProfileController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Residentsettings\SettingsController;
use App\Http\Controllers\Residentsettings\NotificationPreferenceController;
use App\Http\Controllers\Residentsettings\DeviceController;
use App\Http\Controllers\Residentsettings\PrivacyController;
use App\Http\Controllers\Residentsettings\ActivityController;
use App\Http\Controllers\Residentsettings\QrLoginController;
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


    // Device routes
    Route::prefix('residentsettings')->middleware(['auth'])->group(function () {
        Route::get('/devices', [DeviceController::class, 'connectedDevices'])
            ->name('residentsettings.devices');
        
        Route::post('/user/devices/logout', [DeviceController::class, 'logoutDevice'])
            ->name('user.devices.logout');
        
        Route::post('/user/devices/logout-all', [DeviceController::class, 'logoutAllDevices'])
            ->name('user.devices.logout-all');
        
        Route::post('/user/devices/trust', [DeviceController::class, 'trustDevice'])
            ->name('user.devices.trust');
        
        Route::post('/user/devices/untrust', [DeviceController::class, 'untrustDevice'])
            ->name('user.devices.untrust');
        
        Route::post('/user/devices/report-suspicious', [DeviceController::class, 'reportSuspicious'])
            ->name('user.devices.report-suspicious');
    });

    // ===== FIXED ACTIVITIES ROUTES =====
    // These should be at the same level as device routes, not nested inside them
    Route::prefix('residentsettings')->middleware(['auth'])->group(function () {
        Route::get('/activities', [ActivityController::class, 'index'])->name('residentsettings.activities');
        Route::get('/activities/{id}', [ActivityController::class, 'show'])->name('residentsettings.activities.show');
        Route::post('/activities/export', [ActivityController::class, 'export'])->name('residentsettings.activities.export');
        Route::post('/activities/report', [ActivityController::class, 'report'])->name('residentsettings.activities.report');
    });

    // Notification preferences routes
    Route::prefix('residentsettings')->middleware(['auth'])->group(function () {
        Route::get('/preferences/notifications', [NotificationPreferenceController::class, 'index'])
            ->name('residentsettings.notification-preferences');
        
        Route::post('/preferences/notifications/update', [NotificationPreferenceController::class, 'update'])
            ->name('user.notification-preferences.update');
    });

    // ========== FIXED QR CODE ROUTES ==========
    Route::prefix('residentsettings')->middleware(['auth'])->group(function () {
        Route::post('/qr/generate', [QrLoginController::class, 'generateQrCode'])
            ->name('resident.qr.generate');
        
        Route::get('/qr/status', [QrLoginController::class, 'getQrStatus'])
            ->name('resident.qr.status');
        
        Route::post('/qr/regenerate', [QrLoginController::class, 'regenerateQrCode'])
            ->name('resident.qr.regenerate');
        
        Route::post('/qr/disable', [QrLoginController::class, 'disableQrLogin'])
            ->name('resident.qr.disable');
        
        Route::post('/qr/enable', [QrLoginController::class, 'enableQrLogin'])
            ->name('resident.qr.enable');
    });

    // Privacy routes
    Route::prefix('residentsettings')->middleware(['auth'])->group(function () {
        Route::get('/privacy', [PrivacyController::class, 'index'])->name('privacy');
        Route::post('/request-correction', [PrivacyController::class, 'requestCorrection'])->name('request-correction');
        Route::post('/export-data', [PrivacyController::class, 'exportData'])->name('export-data');
        Route::get('/member/{residentId}', [PrivacyController::class, 'getMemberData'])->name('member-data');
    });

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

    // Resident password confirmation routes
    Route::prefix('resident')->name('resident.')->group(function () {
        Route::get('/confirm-password', [ConfirmablePasswordController::class, 'show'])
            ->name('password.confirm');
        
        Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store'])
            ->name('password.confirm.store');
    });

    Route::get('residentsettings/preferences/appearance', function () {
        return Inertia::render('residentsettings/appearance');
    })->name('residentsettings.edit');

    // Two-Factor Authentication Routes
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
    });

    // Settings controller routes
    Route::prefix('residentsettings')->middleware(['auth'])->group(function () {
        Route::get('/password', [SettingsController::class, 'password'])->name('password');
        Route::get('/two-factor', [SettingsController::class, 'twoFactor'])->name('two-factor');
        Route::get('/appearance', [SettingsController::class, 'appearance'])->name('appearance');
        Route::get('/privacy', [SettingsController::class, 'privacy'])->name('privacy');
        Route::get('/security', [SettingsController::class, 'security'])->name('security');
        Route::get('/preferences', [SettingsController::class, 'preferences'])->name('preferences');
        Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
    });
});

// ========== PUBLIC QR LOGIN ROUTES ==========
Route::get('/qr-login/{token}', [QrLoginController::class, 'loginWithQr'])->name('qr.login');
Route::get('/household-login/{token}', [QrLoginController::class, 'householdLogin'])->name('qr.household.login');