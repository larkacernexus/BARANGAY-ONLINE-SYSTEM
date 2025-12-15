<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\ResidentController;
use App\Http\Controllers\Admin\HouseholdController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ClearanceController;

/*
|--------------------------------------------------------------------------
| Public Route
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

/*
|--------------------------------------------------------------------------
| Admin Routes (ALL PROTECTED)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'admin'])->group(function () {

    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Residents (ADMIN MANAGES RESIDENTS)
    |--------------------------------------------------------------------------
    */
    Route::prefix('residents')->name('residents.')->group(function () {
        Route::get('/', [ResidentController::class, 'index'])->name('index');
        Route::get('/create', [ResidentController::class, 'create'])->name('create');
        Route::post('/', [ResidentController::class, 'store'])->name('store');
        Route::get('/{resident}', [ResidentController::class, 'show'])->name('show');
        Route::get('/{resident}/edit', [ResidentController::class, 'edit'])->name('edit');
        Route::put('/{resident}', [ResidentController::class, 'update'])->name('update');
        Route::delete('/{resident}', [ResidentController::class, 'destroy'])->name('destroy');

        // Bulk actions
        Route::post('/import', [ResidentController::class, 'import'])->name('import');
        Route::post('/export', [ResidentController::class, 'export'])->name('export');
        Route::post('/bulk-delete', [ResidentController::class, 'bulkDelete'])->name('bulk.delete');
    });

    /*
    |--------------------------------------------------------------------------
    | Households
    |--------------------------------------------------------------------------
    */
    Route::prefix('households')->name('households.')->group(function () {
        Route::get('/', [HouseholdController::class, 'index'])->name('index');
        Route::get('/create', [HouseholdController::class, 'create'])->name('create');
        Route::post('/', [HouseholdController::class, 'store'])->name('store');
        Route::get('/{household}', [HouseholdController::class, 'show'])->name('show');
        Route::get('/{household}/edit', [HouseholdController::class, 'edit'])->name('edit');
        Route::put('/{household}', [HouseholdController::class, 'update'])->name('update');
        Route::delete('/{household}', [HouseholdController::class, 'destroy'])->name('destroy');

        // Members
        Route::get('/{household}/members', [HouseholdController::class, 'members'])->name('members');
        Route::post('/{household}/members', [HouseholdController::class, 'addMember'])->name('members.add');
        Route::delete('/{household}/members/{resident}', [HouseholdController::class, 'removeMember'])->name('members.remove');
    });

    /*
    |--------------------------------------------------------------------------
    | Payments
    |--------------------------------------------------------------------------
    */
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->name('index');
        Route::get('/create', [PaymentController::class, 'create'])->name('create');
        Route::post('/', [PaymentController::class, 'store'])->name('store');
        Route::get('/{payment}', [PaymentController::class, 'show'])->name('show');
        Route::get('/{payment}/edit', [PaymentController::class, 'edit'])->name('edit');
        Route::put('/{payment}', [PaymentController::class, 'update'])->name('update');
        Route::delete('/{payment}', [PaymentController::class, 'destroy'])->name('destroy');
        Route::get('/{payment}/receipt', [PaymentController::class, 'receipt'])->name('receipt');

        // Reports
        Route::get('/reports/monthly', [PaymentController::class, 'monthlyReport'])->name('reports.monthly');
        Route::get('/reports/export', [PaymentController::class, 'exportReport'])->name('reports.export');

        // Types
        Route::get('/types', [PaymentController::class, 'types'])->name('types.index');
        Route::post('/types', [PaymentController::class, 'storeType'])->name('types.store');
    });

    /*
    |--------------------------------------------------------------------------
    | Clearances
    |--------------------------------------------------------------------------
    */
    Route::prefix('clearances')->name('clearances.')->group(function () {
        Route::get('/', [ClearanceController::class, 'index'])->name('index');
        Route::get('/create', [ClearanceController::class, 'create'])->name('create');
        Route::post('/', [ClearanceController::class, 'store'])->name('store');
        Route::get('/{clearance}', [ClearanceController::class, 'show'])->name('show');
        Route::get('/{clearance}/edit', [ClearanceController::class, 'edit'])->name('edit');
        Route::put('/{clearance}', [ClearanceController::class, 'update'])->name('update');
        Route::delete('/{clearance}', [ClearanceController::class, 'destroy'])->name('destroy');
        Route::get('/{clearance}/print', [ClearanceController::class, 'print'])->name('print');
        Route::post('/{clearance}/approve', [ClearanceController::class, 'approve'])->name('approve');
        Route::post('/{clearance}/reject', [ClearanceController::class, 'reject'])->name('reject');

        Route::get('/types', [ClearanceController::class, 'types'])->name('types.index');
        Route::get('/reports/issued', [ClearanceController::class, 'issuedReport'])->name('reports.issued');
    });
});

/*
|--------------------------------------------------------------------------
| Fallback
|--------------------------------------------------------------------------
*/
Route::fallback(fn () => inertia('Error/404'));

require __DIR__.'/settings.php';
