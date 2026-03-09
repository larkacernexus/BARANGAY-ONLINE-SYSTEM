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
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Receipt routes (public/guest accessible ones)
Route::get('receipts', [App\Http\Controllers\Admin\ReceiptsController::class, 'index'])->name('receipts.index');
Route::get('receipts/create', [App\Http\Controllers\Admin\ReceiptsController::class, 'create'])->name('receipts.create');
Route::get('receipts/{receipt}', [App\Http\Controllers\Admin\ReceiptsController::class, 'show'])->name('receipts.show');
Route::post('receipts/{receipt}/print', [App\Http\Controllers\Admin\ReceiptsController::class, 'print'])->name('receipts.print');

// Search routes
Route::get('/search', function () {
    return Inertia::render('admin/Search/Index');
})->name('search')->middleware(['auth']);

// Guest routes (not logged in)
Route::middleware('guest')->group(function () {
    Route::get('login', [App\Http\Controllers\Auth\LoginController::class, 'create'])->name('login');
    Route::post('login', [App\Http\Controllers\Auth\LoginController::class, 'store']);
});



// Authenticated routes (logged in)
Route::middleware('auth')->group(function () {
    Route::post('logout', [App\Http\Controllers\Auth\LoginController::class, 'destroy'])->name('logout');
    Route::get('password/change', [App\Http\Controllers\Auth\LoginController::class, 'showChangeForm'])->name('password.change');
    Route::post('password/change', [App\Http\Controllers\Auth\LoginController::class, 'changePassword'])->name('password.change.post');
});

/*
|--------------------------------------------------------------------------
| Load Route Files Based on Authentication and Roles
|--------------------------------------------------------------------------
*/
// require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/residentsettings.php';

// Load admin routes - protected by admin middleware
Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        require __DIR__ . '/admin.php';
    });

// Load portal (resident) routes - protected by portal middleware
Route::middleware(['auth', 'verified', 'portal', 'resident.inertia'])
    ->prefix('portal')
    ->name('portal.')
    ->group(function () {
        require __DIR__ . '/portal.php';
    });

/*
|--------------------------------------------------------------------------
| Fallback
|--------------------------------------------------------------------------
*/
Route::fallback(fn() => inertia('Error/404'));