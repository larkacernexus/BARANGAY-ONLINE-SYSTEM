<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\ResidentController;
use App\Http\Controllers\Admin\HouseholdController;
use App\Http\Controllers\Admin\FeeController;
use App\Http\Controllers\Admin\FeeTypeController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\ReceiptsController;  
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ClearanceController;
use App\Http\Controllers\Admin\ClearanceApprovalController;
use App\Http\Controllers\Admin\ClearanceTypeController;
use App\Http\Controllers\Admin\PurokController;
use App\Http\Controllers\Admin\AdminComplaintController;
use App\Http\Controllers\Resident\ResidentPortalController;
use App\Http\Controllers\Resident\ResidentDashboardController;
use App\Http\Controllers\Resident\ResidentPaymentController;
use App\Http\Controllers\Resident\ResidentFeeController;
use App\Http\Controllers\Resident\ResidentClearanceController;
use App\Http\Controllers\Resident\ComplaintController;
use App\Http\Controllers\Resident\RecordController;
use App\Http\Controllers\Resident\AnnouncementController;
use App\Http\Controllers\Resident\EventController;
use App\Http\Controllers\Resident\FormController;

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
       Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

  Route::prefix('roles')->name('roles.')->group(function () {
        // Main CRUD routes
        Route::get('/', [RoleController::class, 'index'])->name('index');
        Route::get('/create', [RoleController::class, 'create'])->name('create');
        Route::post('/', [RoleController::class, 'store'])->name('store');
        Route::get('/{role}', [RoleController::class, 'show'])->name('show');
        Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit');
        Route::put('/{role}', [RoleController::class, 'update'])->name('update');
        Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy');
        
        // Role Permissions Management
        Route::get('/{role}/permissions', [RoleController::class, 'permissions'])->name('permissions');
        Route::put('/{role}/permissions/update', [RoleController::class, 'updatePermissions'])->name('permissions.update');
        
        // Role Users
        Route::get('/{role}/users', [RoleController::class, 'users'])->name('users');
    });

    // ====================
    // PERMISSIONS ROUTES
    // ====================
    Route::prefix('permissions')->name('permissions.')->group(function () {
        // Main CRUD routes
        Route::get('/', [PermissionController::class, 'index'])->name('index');
        Route::get('/create', [PermissionController::class, 'create'])->name('create');
        Route::post('/', [PermissionController::class, 'store'])->name('store');
        Route::get('/{permission}', [PermissionController::class, 'show'])->name('show');
        Route::get('/{permission}/edit', [PermissionController::class, 'edit'])->name('edit');
        Route::put('/{permission}', [PermissionController::class, 'update'])->name('update');
        Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('destroy');
            Route::post('/permissions/bulk-assign', [PermissionController::class, 'bulkAssignStore'])
        ->name('bulk-assign');
        // Toggle permission status
        Route::put('/{permission}/toggle-status', [PermissionController::class, 'toggleStatus'])->name('toggle-status');
        
        // Get modules
        Route::get('/modules/list', [PermissionController::class, 'modules'])->name('modules');
    });
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
Route::prefix('payments')->group(function () {
    Route::get('/', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/create', [PaymentController::class, 'create'])->name('payments.create');
    Route::post('/', [PaymentController::class, 'store'])->name('payments.store'); // Add this POST route
    Route::get('/{payment}', [PaymentController::class, 'show'])->name('payments.show');
    Route::get('/{payment}/edit', [PaymentController::class, 'edit'])->name('payments.edit');
    Route::put('/{payment}', [PaymentController::class, 'update'])->name('payments.update');
    Route::delete('/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
Route::get('/payments/{payment}/receipt', [PaymentController::class, 'printReceipt'])->name('payments.receipt');
});

    /*
    |--------------------------------------------------------------------------
    | Fees
    |--------------------------------------------------------------------------
    */
  Route::prefix('fees')->group(function () {
    Route::get('/', [FeeController::class, 'index'])->name('fees.index');
    Route::get('/create', [FeeController::class, 'create'])->name('fees.create');
    Route::post('/', [FeeController::class, 'store'])->name('fees.store'); // This should work now
    Route::get('/{fee}', [FeeController::class, 'show'])->name('fees.show');
    Route::get('/{fee}/edit', [FeeController::class, 'edit'])->name('fees.edit');
    Route::put('/{fee}', [FeeController::class, 'update'])->name('fees.update');
    Route::delete('/{fee}', [FeeController::class, 'destroy'])->name('fees.destroy');
        Route::get('/payments/create/with-fee/{fee}', [FeeController::class, 'createWithFee'])
        ->name('payments.create-with-fee');
        Route::post('/{fee}/record-payment', [FeeController::class, 'recordPayment'])->name('record-payment');
        Route::post('/{fee}/cancel', [FeeController::class, 'cancel'])->name('cancel');
        Route::post('/{fee}/waive', [FeeController::class, 'waive'])->name('waive');
    Route::get('/fees/outstanding', [FeeController::class, 'outstanding'])->name('fees.outstanding');
        
        // Print/Export
        Route::get('/{fee}/print/{type?}', [FeeController::class, 'print'])->name('fees.print');
        Route::get('/export', [FeeController::class, 'export'])->name('export');
        
        // Bulk Actions
        Route::post('/bulk-action', [FeeController::class, 'bulkAction'])->name('bulk-action');


    // Additional fee routes
    Route::post('/{fee}/record-payment', [FeeController::class, 'recordPayment'])->name('fees.record-payment');
    Route::post('/{fee}/cancel', [FeeController::class, 'cancel'])->name('fees.cancel');
    Route::post('/{fee}/waive', [FeeController::class, 'waive'])->name('fees.waive');
    Route::post('/bulk-action', [FeeController::class, 'bulkAction'])->name('fees.bulk-action');

});


   /*
    |--------------------------------------------------------------------------
    | Payments
    |--------------------------------------------------------------------------
    */
Route::prefix('admincomplaints')->group(function () {
    Route::get('/', [AdminComplaintController::class, 'index'])->name('admin.complaints.index');
});


   Route::prefix('fee-types')->group(function () {
    Route::get('/', [FeeTypeController::class, 'index'])->name('fee-types.index');
    Route::get('/create', [FeeTypeController::class, 'create'])->name('fee-types.create');
    Route::post('/', [FeeTypeController::class, 'store'])->name('fee-types.store');
    Route::get('/{feeType}', [FeeTypeController::class, 'show'])->name('fee-types.show');
    Route::get('/{feeType}/edit', [FeeTypeController::class, 'edit'])->name('fee-types.edit');
    Route::put('/{feeType}', [FeeTypeController::class, 'update'])->name('fee-types.update');
    Route::delete('/{feeType}', [FeeTypeController::class, 'destroy'])->name('fee-types.destroy');
    Route::post('/{feeType}/toggle-status', [FeeTypeController::class, 'toggleStatus'])->name('fee-types.toggle-status');
    Route::post('/bulk-action', [FeeTypeController::class, 'bulkAction'])->name('fee-types.bulk-action');
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


    Route::prefix('clearances/approval')->name('admin.clearances.approval.')->group(function () {
    Route::get('/requests', [ClearanceApprovalController::class, 'index'])->name('index');
    Route::get('/{clearanceRequest}', [ClearanceApprovalController::class, 'show'])->name('show');
    Route::post('/{clearanceRequest}/approve', [ClearanceApprovalController::class, 'approve'])->name('approve');
    Route::post('/{clearanceRequest}/reject', [ClearanceApprovalController::class, 'reject'])->name('reject');
    Route::post('/{clearanceRequest}/mark-processing', [ClearanceApprovalController::class, 'markAsProcessing'])->name('mark-processing');
    Route::post('/{clearanceRequest}/return-pending', [ClearanceApprovalController::class, 'returnToPending'])->name('return-pending');
    Route::get('/stats', [ClearanceApprovalController::class, 'stats'])->name('stats');
});


Route::prefix('clearance-types')->name('clearance-types.')->group(function () {
    Route::get('/', [ClearanceTypeController::class, 'index'])->name('index');
    Route::get('/create', [ClearanceTypeController::class, 'create'])->name('create');
    Route::post('/', [ClearanceTypeController::class, 'store'])->name('store');
    
    // Single clearance type routes
    Route::prefix('{clearanceType}')->group(function () {
        Route::get('/', [ClearanceTypeController::class, 'show'])->name('show');
        Route::get('/edit', [ClearanceTypeController::class, 'edit'])->name('edit');
        Route::put('/', [ClearanceTypeController::class, 'update'])->name('update');
        Route::delete('/', [ClearanceTypeController::class, 'destroy'])->name('destroy');
        Route::post('/toggle-status', [ClearanceTypeController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/duplicate', [ClearanceTypeController::class, 'duplicate'])->name('duplicate');
    });
    
    Route::post('/bulk-action', [ClearanceTypeController::class, 'bulkAction'])->name('bulk-action');
});


 /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('users.index');
    Route::get('/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/', [UserController::class, 'store'])->name('users.store');
    Route::get('/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    
    // Additional user routes
    Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('/{user}/update-permissions', [UserController::class, 'updatePermissions'])->name('users.update-permissions');
});

Route::prefix('admin/puroks')->name('puroks.')->group(function () {
    Route::get('/', [PurokController::class, 'index'])->name('index');
    Route::get('/create', [PurokController::class, 'create'])->name('create');
    Route::post('/', [PurokController::class, 'store'])->name('store');
    Route::get('/{purok}', [PurokController::class, 'show'])->name('show');
    Route::get('/{purok}/edit', [PurokController::class, 'edit'])->name('edit');
    Route::put('/{purok}', [PurokController::class, 'update'])->name('update');
    Route::delete('/{purok}', [PurokController::class, 'destroy'])->name('destroy');
    Route::post('/update-statistics', [PurokController::class, 'updateStatistics'])->name('update-statistics');
    Route::get('/api/all', [PurokController::class, 'getAll'])->name('api.all');
});


Route::get('/reports/collections', [ReportsController::class, 'collections'])->name('reports.collections');
    
    // Revenue Analytics
    Route::get('/reports/revenue', [ReportsController::class, 'revenue'])->name('reports.revenue');
    
    // Outstanding Fees Report
    
    // Receipts Management
    Route::get('/receipts', [ReceiptsController::class, 'index'])->name('receipts.index');
    
    // Generate Receipt
    Route::get('/receipts/generate', [ReceiptsController::class, 'create'])->name('receipts.create');
});

/*
|--------------------------------------------------------------------------
| Resident Routes (PROTECTED)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'resident'])->group(function () {

    // Removed the duplicate 'dashboard' route here (Fix 2)

    // Dashboard
    Route::get('/residentdashboard', [ResidentDashboardController::class, 'residentdashboard'])->name('residentdashboard');

    
  


         // Resident Payments - renamed to avoid conflict
    Route::prefix('my-payments')->name('my.payments.')->group(function () {
        Route::get('/', [ResidentPaymentController::class, 'index'])->name('index');
        Route::get('/pay', [ResidentPaymentController::class, 'create'])->name('create');
        Route::post('/pay', [ResidentPaymentController::class, 'store'])->name('store');
        Route::get('/{payment}', [ResidentPaymentController::class, 'show'])->name('show');
        Route::get('/{payment}/receipt', [ResidentPaymentController::class, 'receipt'])->name('receipt');
        Route::post('/verify', [ResidentPaymentController::class, 'verify'])->name('verify');
        Route::post('/save-payment-method', [ResidentPaymentController::class, 'savePaymentMethod'])->name('save-method');
    });
Route::prefix('my-clearances')->name('my.clearances.')->group(function () {
    Route::get('/', [ResidentClearanceController::class, 'index'])->name('index');
    Route::get('/request', [ResidentClearanceController::class, 'create'])->name('create');
    
    // Fix: Remove the leading slash and just use 'store' inside the prefix
    Route::post('/store', [ResidentClearanceController::class, 'store'])->name('store');
    // OR
    Route::post('/', [ResidentClearanceController::class, 'store'])->name('store');
    
    Route::get('/{clearance}', [ResidentClearanceController::class, 'show'])->name('show');
    Route::get('/{clearance}/download', [ResidentClearanceController::class, 'download'])->name('download');
    Route::put('/{clearance}/cancel', [ResidentClearanceController::class, 'cancel'])->name('cancel');
});
    // Complaints - resident specific
    Route::prefix('my-complaints')->name('my.complaints.')->group(function () {
        Route::get('/', [ComplaintController::class, 'index'])->name('index');
        Route::get('/create', [ComplaintController::class, 'create'])->name('create');
        Route::post('/', [ComplaintController::class, 'store'])->name('store');
        Route::get('/show/{complaint}', [ComplaintController::class, 'show'])->name('show');
        Route::post('/{complaint}/comments', [ComplaintController::class, 'addComment'])->name('comments.store');
        Route::post('/{complaint}/rate', [ComplaintController::class, 'rate'])->name('rate');
        Route::put('/{complaint}', [ComplaintController::class, 'update'])->name('update');
        Route::delete('/{complaint}', [ComplaintController::class, 'destroy'])->name('destroy');
    });
    
    // Records - resident specific
    Route::prefix('my-records')->name('my.records.')->group(function () {
        Route::get('/', [RecordController::class, 'index'])->name('index');
         Route::get('/create', [RecordController::class, 'create'])->name('create');
        Route::get('/{record}/download', [RecordController::class, 'download'])->name('download');
        Route::get('/{record}/view', [RecordController::class, 'view'])->name('view');
        Route::delete('/{record}', [RecordController::class, 'destroy'])->name('destroy');
        Route::post('/export', [RecordController::class, 'export'])->name('export');
    });
    
    // Announcements - resident specific
    Route::prefix('resident-announcements')->name('resident.announcements.')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index'])->name('index');
        Route::get('/{announcement}', [AnnouncementController::class, 'show'])->name('show');
        Route::post('/{announcement}/bookmark', [AnnouncementController::class, 'bookmark'])->name('bookmark');
        Route::post('/subscribe', [AnnouncementController::class, 'subscribe'])->name('subscribe');
    });
    
    // Events - resident specific
    Route::prefix('resident-events')->name('resident.events.')->group(function () {
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/{event}', [EventController::class, 'show'])->name('show');
        Route::post('/{event}/register', [EventController::class, 'register'])->name('register');
        Route::post('/{event}/cancel', [EventController::class, 'cancel'])->name('cancel');
        Route::post('/alerts', [EventController::class, 'toggleAlerts'])->name('alerts');
    });
    

     Route::prefix('residentfees')->name('fees.')->group(function () {
        Route::get('/', [ResidentFeeController::class, 'index'])->name('index');
        Route::get('/{fee}', [ResidentFeeController::class, 'show'])->name('show');
    });
    // Forms - resident specific
    Route::prefix('resident-forms')->name('resident.forms.')->group(function () {
        Route::get('/', [FormController::class, 'index'])->name('index');
        Route::get('/{form}/download', [FormController::class, 'download'])->name('download');
        Route::post('/submit', [FormController::class, 'submit'])->name('submit');
        Route::post('/request', [FormController::class, 'requestForm'])->name('request');
    });
       Route::post('/debug-file-upload', function(Request $request) {
    \Log::debug('=== DEBUG FILE UPLOAD ===');
    \Log::debug('All input:', $request->all());
    \Log::debug('Files received:', array_keys($request->allFiles()));
    
    $files = $request->allFiles();
    $fileInfo = [];
    
    foreach ($files as $key => $file) {
        if (is_array($file)) {
            foreach ($file as $index => $f) {
                $fileInfo[] = [
                    'key' => $key . '[' . $index . ']',
                    'name' => $f->getClientOriginalName(),
                    'size' => $f->getSize(),
                    'type' => $f->getMimeType()
                ];
            }
        } else {
            $fileInfo[] = [
                'key' => $key,
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'type' => $file->getMimeType()
            ];
        }
    }
    
    return response()->json([
        'success' => true,
        'message' => 'Debug upload received',
        'files_count' => count($files),
        'files_info' => $fileInfo,
        'total_input_keys' => count($request->all()),
        'request_method' => $request->method(),
        'content_type' => $request->header('Content-Type')
    ]);
}); 
});


/*
|--------------------------------------------------------------------------
| Fallback
|--------------------------------------------------------------------------
*/
Route::fallback(fn () => inertia('Error/404'));

require __DIR__.'/settings.php';
