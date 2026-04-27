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

// SECURITY NOTE: All authenticated routes require email verification
// LOGIC NOTE: Route naming follows consistent pattern: resident.{resource}.{action}

Route::middleware(['auth', 'verified'])->group(function () {
    // LOGIC NOTE: Consistent redirect to profile as default settings page
    Route::redirect('settings', '/residentsettings/profile')->name('settings');

    // =========================================================================
    // PROFILE MANAGEMENT
    // SECURITY NOTE: ProfileController must use FormRequest with validated fields
    // and verify Gate::allows('update', $user) before any modification
    // =========================================================================
    Route::prefix('residentsettings/profile')->name('resident.profile.')->group(function () {
        Route::get('/', [ResidentProfileController::class, 'show'])->name('show');
        Route::patch('/', [ResidentProfileController::class, 'update'])->name('update');
        
        // SECURITY NOTE: Account deletion requires password confirmation in controller
        Route::delete('/', [ResidentProfileController::class, 'destroy'])
            ->middleware(['password.confirm'])
            ->name('destroy');
    });

    // =========================================================================
    // DEVICE MANAGEMENT
    // SECURITY NOTE: Session management operations require password confirmation
    // and must log all device terminations for audit purposes
    // =========================================================================
    Route::prefix('residentsettings/devices')->name('resident.devices.')->group(function () {
        Route::get('/', [DeviceController::class, 'connectedDevices'])->name('index');
        
        // SECURITY NOTE: Single device logout requires password confirmation
        Route::post('/logout', [DeviceController::class, 'logoutDevice'])
            ->middleware(['password.confirm', 'throttle:10,60'])
            ->name('logout');
        
        // SECURITY NOTE: Mass logout is highly sensitive, strict rate limiting applied
        Route::post('/logout-all', [DeviceController::class, 'logoutAllDevices'])
            ->middleware(['password.confirm', 'throttle:3,3600'])
            ->name('logout-all');
        
        // SECURITY NOTE: Trust decisions should be reversible and logged
        Route::post('/trust', [DeviceController::class, 'trustDevice'])
            ->middleware('throttle:20,60')
            ->name('trust');
        
        Route::post('/untrust', [DeviceController::class, 'untrustDevice'])
            ->middleware('throttle:20,60')
            ->name('untrust');
        
        // SECURITY NOTE: Suspicious activity reports trigger security audit
        Route::post('/report-suspicious', [DeviceController::class, 'reportSuspicious'])
            ->middleware(['throttle:5,300'])
            ->name('report-suspicious');
    });

    // =========================================================================
    // ACTIVITY LOGS
    // SECURITY NOTE: Export and reporting operations must respect data retention policies
    // =========================================================================
    Route::prefix('residentsettings/activities')->name('resident.activities.')->group(function () {
        Route::get('/', [ActivityController::class, 'index'])->name('index');
        
        // SECURITY NOTE: Individual activity access requires ownership verification
        Route::get('/{id}', [ActivityController::class, 'show'])
            ->where('id', '[0-9]+') // Prevent injection via ID parameter
            ->name('show');
        
        // SECURITY NOTE: Export operations rate-limited to prevent resource exhaustion
        Route::post('/export', [ActivityController::class, 'export'])
            ->middleware('throttle:5,3600')
            ->name('export');
        
        // SECURITY NOTE: Suspicious activity reports trigger security workflow
        Route::post('/report', [ActivityController::class, 'report'])
            ->middleware('throttle:10,3600')
            ->name('report');
    });

    // =========================================================================
    // NOTIFICATION PREFERENCES
    // =========================================================================
    Route::prefix('residentsettings/notifications')->name('resident.notifications.')->group(function () {
        Route::get('/', [NotificationPreferenceController::class, 'index'])->name('index');
        
        // SECURITY NOTE: Update operations must validate notification channels against whitelist
        Route::post('/update', [NotificationPreferenceController::class, 'update'])
            ->middleware('throttle:30,60')
            ->name('update');
    });

    // =========================================================================
    // QR CODE LOGIN MANAGEMENT
    // SECURITY NOTE: QR codes are single-use and expire after 5 minutes
    // All QR operations require recent password confirmation
    // =========================================================================
    Route::prefix('residentsettings/qr')->name('resident.qr.')->group(function () {
        // SECURITY NOTE: QR generation invalidates all previous codes for this user
        Route::post('/generate', [QrLoginController::class, 'generateQrCode'])
            ->middleware(['password.confirm', 'throttle:5,300'])
            ->name('generate');
        
        // LOGIC NOTE: Status endpoint for polling QR code usage (frontend polling every 2s)
        Route::get('/status', [QrLoginController::class, 'getQrStatus'])
            ->middleware('throttle:60,60') // Allow frequent polling but prevent abuse
            ->name('status');
        
        Route::post('/regenerate', [QrLoginController::class, 'regenerateQrCode'])
            ->middleware(['password.confirm', 'throttle:3,300'])
            ->name('regenerate');
        
        Route::post('/disable', [QrLoginController::class, 'disableQrLogin'])
            ->middleware(['password.confirm', 'throttle:5,300'])
            ->name('disable');
        
        Route::post('/enable', [QrLoginController::class, 'enableQrLogin'])
            ->middleware(['password.confirm', 'throttle:5,300'])
            ->name('enable');
    });

    // =========================================================================
    // PRIVACY & DATA MANAGEMENT
    // SECURITY NOTE: All data operations require password confirmation
    // and must comply with data protection regulations (GDPR/CCPA)
    // =========================================================================
    Route::prefix('residentsettings/privacy')->name('resident.privacy.')->group(function () {
        Route::get('/', [PrivacyController::class, 'index'])->name('index');
        
        Route::post('/request-correction', [PrivacyController::class, 'requestCorrection'])
            ->middleware(['throttle:5,86400']) // 5 requests per day
            ->name('request-correction');
        
        // SECURITY NOTE: Data export creates audit trail and notifies security team
        Route::post('/export-data', [PrivacyController::class, 'exportData'])
            ->middleware(['password.confirm', 'throttle:2,86400']) // 2 exports per day
            ->name('export-data');
        
        // SECURITY NOTE: IDOR vulnerability prevention - controller MUST verify
        // that the authenticated user has permission to access this resident's data
        Route::get('/member/{residentId}', [PrivacyController::class, 'getMemberData'])
            ->where('residentId', '[0-9]+')
            ->middleware('can:viewMemberData,residentId') // POLICY CHECK REQUIRED
            ->name('member-data');
    });

    // =========================================================================
    // PASSWORD MANAGEMENT
    // =========================================================================
    Route::prefix('residentsettings/security')->name('resident.security.')->group(function () {
        Route::get('/password', [PasswordController::class, 'edit'])->name('password.edit');
        
        // SECURITY NOTE: Throttle prevents brute force attempts
        Route::put('/password', [PasswordController::class, 'update'])
            ->middleware(['throttle:6,1'])
            ->name('password.update');
    });

    // =========================================================================
    // TWO-FACTOR AUTHENTICATION
    // SECURITY NOTE: 2FA setup requires password confirmation before any changes
    // =========================================================================
    Route::prefix('residentsettings/security/two-factor')
        ->name('resident.two-factor.')
        ->middleware(['password.confirm']) // Global 2FA confirmation requirement
        ->group(function () {
            Route::get('/', [ResidentTwoFactorAuthenticationController::class, 'show'])
                ->name('show');
            
            // SECURITY NOTE: These routes should be added for complete 2FA functionality
            Route::post('/enable', [ResidentTwoFactorAuthenticationController::class, 'enable'])
                ->middleware('throttle:3,10')
                ->name('enable');
            
            Route::post('/confirm', [ResidentTwoFactorAuthenticationController::class, 'confirm'])
                ->middleware('throttle:5,10')
                ->name('confirm');
            
            Route::delete('/disable', [ResidentTwoFactorAuthenticationController::class, 'disable'])
                ->middleware('throttle:3,30')
                ->name('disable');
            
            Route::get('/recovery-codes', [ResidentTwoFactorAuthenticationController::class, 'getRecoveryCodes'])
                ->middleware('throttle:3,60')
                ->name('recovery-codes');
            
            Route::post('/recovery-codes/regenerate', [ResidentTwoFactorAuthenticationController::class, 'regenerateRecoveryCodes'])
                ->middleware('throttle:2,3600')
                ->name('recovery-codes.regenerate');
        });

    // =========================================================================
    // APPEARANCE SETTINGS
    // =========================================================================
    Route::get('/residentsettings/appearance', function () {
        // SECURITY NOTE: User preferences stored server-side must be validated
        return Inertia::render('residentsettings/appearance');
    })->name('resident.appearance.edit');

    // =========================================================================
    // PASSWORD CONFIRMATION (RESIDENT CONTEXT)
    // =========================================================================
    Route::prefix('resident')->name('resident.')->group(function () {
        Route::get('/confirm-password', [ConfirmablePasswordController::class, 'show'])
            ->middleware('throttle:10,60')
            ->name('password.confirm');
        
        Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store'])
            ->middleware('throttle:10,60')
            ->name('password.confirm.store');
    });

    // =========================================================================
    // SETTINGS INDEX PAGES (LEGACY COMPATIBILITY)
    // LOGIC NOTE: These routes provide navigation structure, not data operations
    // =========================================================================
    Route::prefix('residentsettings')->name('resident.settings.')->group(function () {
        Route::get('/password', [SettingsController::class, 'password'])->name('password');
        Route::get('/two-factor', [SettingsController::class, 'twoFactor'])->name('two-factor');
        Route::get('/privacy', [SettingsController::class, 'privacy'])->name('privacy');
        Route::get('/security', [SettingsController::class, 'security'])->name('security');
        Route::get('/preferences', [SettingsController::class, 'preferences'])->name('preferences');
        Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
    });
});

// =========================================================================
// PUBLIC QR LOGIN ROUTES - CRITICAL SECURITY CONSIDERATIONS
// SECURITY NOTE: These routes are PUBLIC and require EXTREME caution
// =========================================================================

// SECURITY NOTE: QR login token validation must include:
// 1. Constant-time token comparison (hash_equals)
// 2. Single-use enforcement (token deleted after use)
// 3. Strict expiration (5 minutes maximum)
// 4. Rate limiting by IP and user agent fingerprint
// 5. Session fixation protection (regenerate session ID after login)
// 6. Device fingerprinting to detect token theft
// 7. Audit logging of all login attempts

Route::prefix('qr-login')->name('qr.')->group(function () {
    // SECURITY NOTE: Token in URL is logged by servers/proxies - use POST instead in production
    Route::get('/{token}', [QrLoginController::class, 'loginWithQr'])
        ->middleware([
            'throttle:5,60', // Strict rate limiting - 5 attempts per hour per IP
            'qr.token.validate', // Custom middleware for token validation
        ])
        ->where('token', '[A-Za-z0-9]{64}') // Strict token format validation
        ->name('login');
    
    // SECURITY NOTE: Household login requires additional authorization verification
    Route::get('/household/{token}', [QrLoginController::class, 'householdLogin'])
        ->middleware([
            'throttle:3,60',
            'qr.token.validate',
        ])
        ->where('token', '[A-Za-z0-9]{64}')
        ->name('household.login');
});

// SECURITY NOTE: Fallback route for malformed tokens - don't expose validation logic
Route::fallback(function () {
    // LOGIC NOTE: Generic 404 prevents token format enumeration
    abort(404);
});