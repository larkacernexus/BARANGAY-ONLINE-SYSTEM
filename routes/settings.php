<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ResidentProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Settings\ResidentTwoFactorAuthenticationController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('adminsettings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('settings/profile', [ResidentProfileController::class, 'edit'])->name('profile.edit');

    Route::get('/residentsettings/profile', [ResidentProfileController::class, 'edit'])
    ->name('resident.profile.edit');

    Route::get('adminsettings/password', [PasswordController::class, 'edit'])->name('user-password.edit');
    Route::get('residentsettings/password', [PasswordController::class, 'editresident'])->name('resident-password.edit');


    Route::put('adminsettings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('adminsettings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('adminsettings.edit');

        Route::get('residentsettings/appearance', function () {
        return Inertia::render('residentsettings/appearance');
    })->name('residentsettings.edit');

    Route::get('adminsettings/two-factor-authentication', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

            Route::get('adminsettings/two-factor-authentication', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');


        
                    Route::get('residentsettings/two-factor-authentication', [ResidentTwoFactorAuthenticationController::class, 'residentshow'])
        ->name('two-factor.show');

        
});
