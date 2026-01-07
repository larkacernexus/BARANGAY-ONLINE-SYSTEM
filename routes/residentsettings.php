<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ResidentProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('residentsettings/profile', [ResidentProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('residentsettings/profile', [ResidentProfileController::class, 'update'])->name('profile.update');
    Route::delete('residentsettings/profile', [ResidentProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('residentsettings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('residentsettings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
