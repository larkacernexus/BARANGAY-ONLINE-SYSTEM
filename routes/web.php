<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('auth/login', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/privacy', function () {
    return Inertia::render('auth/privacy-policy');
})->name('privacy');

Route::get('/help', function () {
    return Inertia::render('auth/support');
})->name('help');

Route::get('receipts', [App\Http\Controllers\Admin\ReceiptsController::class, 'index'])->name('receipts.index');
Route::get('receipts/create', [App\Http\Controllers\Admin\ReceiptsController::class, 'create'])->name('receipts.create');
Route::get('receipts/{receipt}', [App\Http\Controllers\Admin\ReceiptsController::class, 'show'])->name('receipts.show');
Route::post('receipts/{receipt}/print', [App\Http\Controllers\Admin\ReceiptsController::class, 'print'])->name('receipts.print');

/*
|--------------------------------------------------------------------------
| Guest routes (not logged in)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('login', [App\Http\Controllers\Auth\LoginController::class, 'create'])->name('login');
    Route::post('login', [App\Http\Controllers\Auth\LoginController::class, 'store']);
    Route::post('/password/forgot', [App\Http\Controllers\Auth\LoginController::class, 'forgotPassword'])->name('password.forgot');
});

/*
|--------------------------------------------------------------------------
| Authenticated routes (logged in)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::post('logout', [App\Http\Controllers\Auth\LoginController::class, 'destroy'])->name('logout');
    Route::get('password/change', [App\Http\Controllers\Auth\LoginController::class, 'showChangeForm'])->name('password.change');
    Route::post('password/change', [App\Http\Controllers\Auth\LoginController::class, 'changePassword'])->name('password.change.post');
});

/*
|--------------------------------------------------------------------------
| Load Route Files
|--------------------------------------------------------------------------
*/
require __DIR__ . '/settings.php';
require __DIR__ . '/residentsettings.php';

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        require __DIR__ . '/admin.php';
    });

Route::middleware(['auth', 'verified', 'portal', 'resident.inertia'])
    ->prefix('portal')
    ->name('portal.')
    ->group(function () {
        require __DIR__ . '/portal.php';
    });

Route::fallback(fn() => inertia('Error/404'));