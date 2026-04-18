<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\LoginLogController;
use App\Http\Controllers\Admin\Resident\ResidentIndexController;
use App\Http\Controllers\Admin\Resident\ResidentCreateController;
use App\Http\Controllers\Admin\Resident\ResidentStoreController;
use App\Http\Controllers\Admin\Resident\ResidentShowController;
use App\Http\Controllers\Admin\Resident\ResidentEditController;
use App\Http\Controllers\Admin\Resident\ResidentUpdateController;
use App\Http\Controllers\Admin\Resident\ResidentDestroyController;
use App\Http\Controllers\Admin\Resident\ResidentImportController;
use App\Http\Controllers\Admin\Resident\ResidentExportController;
use App\Http\Controllers\Admin\Resident\ResidentBulkController;
use App\Http\Controllers\Admin\AdminIncidentController;
use App\Http\Controllers\Admin\BlotterController;
use App\Http\Controllers\Admin\OfficialController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\CommitteeController;
use App\Http\Controllers\Admin\Backup\BackupIndexController;
use App\Http\Controllers\Admin\Backup\BackupCreateController;
use App\Http\Controllers\Admin\Backup\BackupDownloadController;
use App\Http\Controllers\Admin\Backup\BackupDestroyController;
use App\Http\Controllers\Admin\Backup\BackupProtectionController;
use App\Http\Controllers\Admin\Backup\BackupProgressController;
use App\Http\Controllers\Admin\Household\HouseholdIndexController;
use App\Http\Controllers\Admin\Household\HouseholdCreateController;
use App\Http\Controllers\Admin\Household\HouseholdStoreController;
use App\Http\Controllers\Admin\Household\HouseholdShowController;
use App\Http\Controllers\Admin\Household\HouseholdEditController;
use App\Http\Controllers\Admin\Household\HouseholdUpdateController;
use App\Http\Controllers\Admin\Household\HouseholdDestroyController;
use App\Http\Controllers\Admin\Household\HouseholdMemberController;
use App\Http\Controllers\Admin\Household\HouseholdImportController;
use App\Http\Controllers\Admin\Household\HouseholdUserController;
use App\Http\Controllers\Admin\FeeController;
use App\Http\Controllers\Admin\FeeReminderController;
use App\Http\Controllers\Admin\Fees\FeeCreateController;
use App\Http\Controllers\Admin\Fees\FeeStoreController;
use App\Http\Controllers\Admin\Fees\FeeShowController;
use App\Http\Controllers\Admin\Fees\FeeEditController;
use App\Http\Controllers\Admin\Fees\FeePaymentController;
use App\Http\Controllers\Admin\Fees\FeeTypeController;
use App\Http\Controllers\Admin\ReportTypeController;
use App\Http\Controllers\Admin\DocumentTypeController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\Payment\PaymentIndexController;
use App\Http\Controllers\Admin\Payment\PaymentCreateController;
use App\Http\Controllers\Admin\Payment\PaymentStoreController;
use App\Http\Controllers\Admin\Payment\PaymentShowController;
use App\Http\Controllers\Admin\Payment\PaymentEditController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\FormController;
use App\Http\Controllers\Admin\ReceiptsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\Clearance\ClearanceIndexController;
use App\Http\Controllers\Admin\Clearance\ClearanceCreateController;
use App\Http\Controllers\Admin\Clearance\ClearanceStoreController;
use App\Http\Controllers\Admin\Clearance\ClearanceShowController;
use App\Http\Controllers\Admin\Clearance\ClearanceEditController;
use App\Http\Controllers\Admin\Clearance\ClearanceUpdateController;
use App\Http\Controllers\Admin\Clearance\ClearanceDestroyController;
use App\Http\Controllers\Admin\Clearance\ClearanceStatusController;
use App\Http\Controllers\Admin\Clearance\ClearancePrintController;
use App\Http\Controllers\Admin\Clearance\ClearanceTypeController;
use App\Http\Controllers\Admin\Clearance\ClearanceReportController;
use App\Http\Controllers\Admin\ClearanceApprovalController;
use App\Http\Controllers\Admin\PurokController;
use App\Http\Controllers\Admin\InstructionController;
use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportIndexController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportCreateController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportStoreController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportShowController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportEditController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportUpdateController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportDestroyController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportBulkController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportEvidenceController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportExportController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportPrintController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportStatsController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportResponseController;
use App\Http\Controllers\Admin\CommunityReport\CommunityReportRelatedController;
use App\Http\Controllers\Admin\GoogleMapsController;
use App\Http\Controllers\Admin\PrivilegeController;
use Inertia\Inertia;

// ====================
// DASHBOARD
// ====================
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('permission:view-dashboard')
    ->name('dashboard');
Route::get('/instructions', function () {
    return Inertia::render('admin/Instructions/Instructions', [
        'section' => request('section', 'overview'), // optional section parameter
        // 'userRole' => auth()->user()->role ?? 'staff'
    ]);
})->name('instructions');

// Search routes
Route::get('/search', function () {
    return Inertia::render('admin/Search/Index');
})->name('search')->middleware(['auth']);


    Route::get('/instructions/download', [InstructionController::class, 'download'])
        ->name('instructions.download');


            Route::post('/resolve-google-maps-url', [GoogleMapsController::class, 'resolveUrl'])
        ->name('admin.resolve-google-maps-url');

 // Index - List all blotters
    Route::get('/blotters', [BlotterController::class, 'index'])
        ->name('blotters.index')
        ->middleware('permission:view-blotters');
    
    // Create - Show create form
    Route::get('/blotters/create', [BlotterController::class, 'create'])
        ->name('blotters.create')
        ->middleware('permission:create-blotters');
    
    // Store - Save new blotter
    Route::post('/blotters', [BlotterController::class, 'store'])
        ->name('blotters.store')
        ->middleware('permission:create-blotters');
    
    // Show - View single blotter
    Route::get('/blotters/{blotter}', [BlotterController::class, 'show'])
        ->name('blotters.show')
        ->middleware('permission:view-blotters');
    
    // Edit - Show edit form
    Route::get('/blotters/{blotter}/edit', [BlotterController::class, 'edit'])
        ->name('blotters.edit')
        ->middleware('permission:edit-blotters');
    
    // Update - Save edited blotter
    Route::put('/blotters/{blotter}', [BlotterController::class, 'update'])
        ->name('blotters.update')
        ->middleware('permission:edit-blotters');
    
    // Update with PATCH (alternative)
    Route::patch('/blotters/{blotter}', [BlotterController::class, 'update'])
        ->name('blotters.patch')
        ->middleware('permission:edit-blotters');
    
    // Destroy - Delete blotter
    Route::delete('/blotters/{blotter}', [BlotterController::class, 'destroy'])
        ->name('blotters.destroy')
        ->middleware('permission:delete-blotters');
    
    // Custom routes
    Route::post('/blotters/{blotter}/update-status', [BlotterController::class, 'updateStatus'])
        ->name('blotters.update-status')
        ->middleware('permission:edit-blotters');
    
    Route::get('/blotters/{blotter}/download-attachment/{index}', [BlotterController::class, 'downloadAttachment'])
        ->name('blotters.download-attachment')
        ->middleware('permission:view-blotters');
    
    // Optional: Bulk operations
    Route::post('/blotters/bulk/delete', [BlotterController::class, 'bulkDelete'])
        ->name('blotters.bulk.delete')
        ->middleware('permission:delete-blotters');
    
    Route::post('/blotters/bulk/status', [BlotterController::class, 'bulkUpdateStatus'])
        ->name('blotters.bulk.status')
        ->middleware('permission:edit-blotters');
    
    // Optional: Export/Import
    Route::get('/blotters/export/csv', [BlotterController::class, 'exportCsv'])
        ->name('blotters.export.csv')
        ->middleware('permission:view-blotters');
    
    Route::get('/blotters/export/pdf', [BlotterController::class, 'exportPdf'])
        ->name('blotters.export.pdf')
        ->middleware('permission:view-blotters');
    
    Route::post('/blotters/import', [BlotterController::class, 'import'])
        ->name('blotters.import')
        ->middleware('permission:create-blotters');
    
    // Optional: Print
    Route::get('/blotters/{blotter}/print', [BlotterController::class, 'print'])
        ->name('blotters.print')
        ->middleware('permission:view-blotters');
    
    // Optional: Statistics
    Route::get('/blotters/stats/overview', [BlotterController::class, 'statistics'])
        ->name('blotters.stats')
        ->middleware('permission:view-blotters');


// ====================
// USER MANAGEMENT
// ====================
Route::middleware('permission:manage-users')->prefix('users')->name('users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{user}', [UserController::class, 'show'])->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
    Route::put('/{user}', [UserController::class, 'update'])->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
    Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
    Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('toggle-status');
    Route::post('/{user}/update-permissions', [UserController::class, 'updatePermissions'])->name('update-permissions');
});

// ====================
// ROLES & PERMISSIONS
// ====================
Route::middleware('permission:manage-roles')->prefix('roles')->name('roles.')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('index');
    Route::get('/create', [RoleController::class, 'create'])->name('create');
    Route::post('/', [RoleController::class, 'store'])->name('store');
    Route::get('/{role}', [RoleController::class, 'show'])->name('show');
    Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit');
    Route::put('/{role}', [RoleController::class, 'update'])->name('update');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy');
    Route::get('/{role}/permissions', [RoleController::class, 'permissions'])->name('permissions');
    Route::post('/{role}/permissions/assign', [RoleController::class, 'assignPermissions'])->name('permissions.assign');
    Route::delete('/{role}/permissions/{permission}', [RoleController::class, 'revokePermission'])->name('permissions.revoke');
    Route::put('/{role}/permissions/update', [RoleController::class, 'updatePermissions'])->name('permissions.update');
    Route::get('/{role}/users', [RoleController::class, 'users'])->name('users');
});

Route::middleware('permission:manage-role-permissions')->prefix('role-permissions')->name('role-permissions.')->group(function () {
    Route::get('/', [RolePermissionController::class, 'index'])->name('index');
    Route::get('/create', [RolePermissionController::class, 'create'])->name('create');
    Route::post('/', [RolePermissionController::class, 'store'])->name('store');
    Route::get('/{role_permission}', [RolePermissionController::class, 'show'])->name('show');
    Route::delete('/{role_permission}', [RolePermissionController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-revoke', [RolePermissionController::class, 'bulkRevoke'])->name('bulk-revoke');
    Route::get('/export', [RolePermissionController::class, 'export'])->name('export');
});

Route::middleware('permission:manage-permissions')->prefix('permissions')->name('permissions.')->group(function () {
    Route::get('/', [PermissionController::class, 'index'])->name('index');
    Route::get('/create', [PermissionController::class, 'create'])->name('create');
    Route::post('/', [PermissionController::class, 'store'])->name('store');
    Route::get('/{permission}', [PermissionController::class, 'show'])->name('show');
    Route::get('/{permission}/edit', [PermissionController::class, 'edit'])->name('edit');
    Route::put('/{permission}', [PermissionController::class, 'update'])->name('update');
    Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('destroy');
    Route::post('/permissions/bulk-assign', [PermissionController::class, 'bulkAssignStore'])->name('bulk-assign');
    Route::put('/{permission}/toggle-status', [PermissionController::class, 'toggleStatus'])->name('toggle-status');
    Route::get('/modules/list', [PermissionController::class, 'modules'])->name('modules');
});

// ====================
// INCIDENT MANAGEMENT
// ====================
Route::middleware('permission:view-incidents')->prefix('incidents')->group(function () {
    Route::get('/', [AdminIncidentController::class, 'index'])->name('admin.incidents.index');
    Route::get('/{incident}', [AdminIncidentController::class, 'show'])->name('admin.incidents.show');
    Route::get('/complaints', [AdminIncidentController::class, 'complaints'])->name('admin.complaints.index');
    Route::get('/blotters', [AdminIncidentController::class, 'blotters'])->name('admin.blotters.index');
});

Route::middleware('permission:manage-incidents')->prefix('incidents')->group(function () {
    Route::get('/create', [AdminIncidentController::class, 'create'])->name('admin.incidents.create');
    Route::patch('/{incident}/status', [AdminIncidentController::class, 'updateStatus'])->name('admin.incidents.update-status');
    Route::patch('/{incident}', [AdminIncidentController::class, 'update'])->name('admin.incidents.update');
    Route::delete('/{incident}', [AdminIncidentController::class, 'destroy'])->name('admin.incidents.destroy');
    Route::post('/', [AdminIncidentController::class, 'store'])->name('admin.incidents.store');
});

Route::middleware('permission:manage-blotters')->prefix('blotters')->group(function () {
    Route::patch('/{incident}/details', [AdminIncidentController::class, 'updateBlotterDetails'])->name('admin.blotters.update-details');
});

Route::middleware('permission:manage-complaints')->prefix('complaints')->group(function () {
    Route::get('/create', [AdminIncidentController::class, 'createComplaint'])->name('admin.complaints.create');
});

Route::middleware('permission:review-incidents')->prefix('incidents')->group(function () {
    Route::patch('/{incident}/review-status', [AdminIncidentController::class, 'reviewStatus'])->name('admin.incidents.review-status');
});

// ====================
// RESIDENT MANAGEMENT
// ====================
Route::middleware('permission:manage-residents')->prefix('residents')->name('residents.')->group(function () {
    // CRUD Operations
    Route::get('/', [ResidentIndexController::class, 'index'])->name('index');
    Route::get('/create', [ResidentCreateController::class, 'create'])->name('create');
    Route::post('/', [ResidentStoreController::class, 'store'])->name('store');
    Route::get('/{resident}', [ResidentShowController::class, 'show'])->name('show');
    Route::get('/{resident}/edit', [ResidentEditController::class, 'edit'])->name('edit');
    Route::put('/{resident}', [ResidentUpdateController::class, 'update'])->name('update');
    Route::delete('/{resident}', [ResidentDestroyController::class, 'destroy'])->name('destroy');
    
    // Household assignment routes
    Route::post('/{resident}/assign-household', [App\Http\Controllers\Admin\Resident\ResidentHouseholdController::class, 'assign'])
        ->name('assign-household');
    
    Route::delete('/{resident}/remove-from-household', [App\Http\Controllers\Admin\Resident\ResidentHouseholdController::class, 'remove'])
        ->name('remove-from-household');
    
    // Resident Privileges - MOVED INSIDE THE RESIDENTS GROUP
    Route::post('/{resident}/privileges', [App\Http\Controllers\Admin\Resident\ResidentPrivilegeController::class, 'store'])
        ->name('privileges.store');
    
    Route::delete('/{resident}/privileges/{privilege}', [App\Http\Controllers\Admin\Resident\ResidentPrivilegeController::class, 'destroy'])
        ->name('privileges.destroy');
    
    // Import/Export
    Route::post('/import', [ResidentImportController::class, 'import'])->name('import');
    Route::get('/import/guide', [ResidentImportController::class, 'downloadGuide'])->name('import.guide');
    Route::get('/import/template', [ResidentImportController::class, 'downloadTemplate'])->name('import.template');
    Route::get('/import/empty-template', [ResidentImportController::class, 'downloadEmptyTemplate'])->name('import.empty-template');
    Route::post('/import/process', [ResidentImportController::class, 'processImport'])->name('import.process');
    
    Route::post('/export', [ResidentExportController::class, 'export'])->name('export');
    
    // Bulk Operations
    Route::post('/bulk-delete', [ResidentBulkController::class, 'bulkDelete'])->name('bulk.delete');
    Route::post('/bulk-action', [ResidentBulkController::class, 'bulkAction'])->name('bulk.action');
});

// Available Privileges for dropdown - keep this outside
Route::middleware('permission:manage-residents')->get('/privileges/available', [App\Http\Controllers\Admin\PrivilegeController::class, 'available'])
    ->name('privileges.available');

// ====================
// OFFICIALS MANAGEMENT
// ====================
Route::middleware('permission:manage-officials')->prefix('officials')->name('officials.')->group(function () {
    Route::get('/', [OfficialController::class, 'index'])->name('index');
    Route::get('/create', [OfficialController::class, 'create'])->name('create');
    Route::post('/', [OfficialController::class, 'store'])->name('store');
    Route::get('/current', [OfficialController::class, 'currentOfficials'])->name('current');
    Route::get('/committee/{committee}', [OfficialController::class, 'byCommittee'])->name('committee');
    Route::post('/update-order', [OfficialController::class, 'updateOrder'])->name('update-order');
    Route::post('/export', [OfficialController::class, 'export'])->name('export');
    
    // BULK OPERATIONS
    Route::post('/bulk-delete', [OfficialController::class, 'bulkDelete'])->name('bulk.delete');
    Route::post('/bulk-status', [OfficialController::class, 'bulkUpdateStatus'])->name('bulk.status'); // <-- ADD THIS LINE
    
    // SINGLE OFFICIAL TERM MANAGEMENT
    Route::post('/{official}/end-term', [OfficialController::class, 'endTerm'])->name('end-term');
    Route::post('/{official}/reactivate', [OfficialController::class, 'reactivate'])->name('reactivate');
    
    Route::get('/{official}', [OfficialController::class, 'show'])->name('show');
    Route::get('/{official}/edit', [OfficialController::class, 'edit'])->name('edit');
    Route::put('/{official}', [OfficialController::class, 'update'])->name('update');
    Route::delete('/{official}', [OfficialController::class, 'destroy'])->name('destroy');
});
// ====================
// COMMITTEES MANAGEMENT
// ====================
Route::middleware('permission:manage-committees')->prefix('committees')->name('committees.')->group(function () {
    Route::get('/', [CommitteeController::class, 'index'])->name('index');
    Route::get('/create', [CommitteeController::class, 'create'])->name('committees.create');
    Route::post('', [CommitteeController::class, 'store'])->name('committees.store');
    Route::get('/{committee}', [CommitteeController::class, 'show'])->name('committees.show');
    Route::get('/{committee}/edit', [CommitteeController::class, 'edit'])->name('committees.edit');
    Route::put('/{committee}', [CommitteeController::class, 'update'])->name('committees.update');
    Route::delete('/{committee}', [CommitteeController::class, 'destroy'])->name('committees.destroy');
    Route::post('/bulk-activate', [CommitteeController::class, 'bulkActivate'])->name('committees.bulk-activate');
    Route::post('/bulk-deactivate', [CommitteeController::class, 'bulkDeactivate'])->name('committees.bulk-deactivate');
    Route::post('/bulk-delete', [CommitteeController::class, 'bulkDelete'])->name('committees.bulk-delete');
    Route::get('/export', [CommitteeController::class, 'export'])->name('committees.export');
});

// ====================
// NOTIFICATIONS
// ====================
Route::middleware('auth')->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::get('/api', [NotificationController::class, 'getNotifications'])->name('api');
    Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('unread-count');
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('mark-read');
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
    Route::patch('/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])
        ->name('mark-as-read');

    });

// ====================
// POSITIONS MANAGEMENT
// ====================
Route::middleware('permission:manage-positions')->prefix('positions')->name('positions.')->group(function () {
    Route::get('/', [PositionController::class, 'index'])->name('index');
    Route::get('/create', [PositionController::class, 'create'])->name('create');
    Route::post('', [PositionController::class, 'store'])->name('store');
    Route::get('/{position}', [PositionController::class, 'show'])->name('show');
    Route::get('/{position}/edit', [PositionController::class, 'edit'])->name('edit');
    Route::post('/{position}', [PositionController::class, 'update'])->name('update');
    Route::delete('/{position}', [PositionController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-activate', [PositionController::class, 'bulkActivate'])->name('bulk-activate');
    Route::post('/bulk-deactivate', [PositionController::class, 'bulkDeactivate'])->name('bulk-deactivate');
    Route::post('/bulk-delete', [PositionController::class, 'bulkDelete'])->name('bulk-delete');
    Route::get('/export', [PositionController::class, 'export'])->name('export');
});

// ====================
// HOUSEHOLDS MANAGEMENT
// ====================
Route::middleware('permission:manage-households')->prefix('households')->name('households.')->group(function () {
    // CRUD Operations
    Route::get('/', [HouseholdIndexController::class, 'index'])->name('index');
    Route::get('/create', [HouseholdCreateController::class, 'create'])->name('create');
    Route::post('/', [HouseholdStoreController::class, 'store'])->name('store');
    Route::get('/{household}', [HouseholdShowController::class, 'show'])->name('show');
    Route::get('/{household}/edit', [HouseholdEditController::class, 'edit'])->name('edit');
    Route::put('/{household}', [HouseholdUpdateController::class, 'update'])->name('update');
    Route::delete('/{household}', [HouseholdDestroyController::class, 'destroy'])->name('destroy');
    
    // Import
    Route::post('/import', [HouseholdImportController::class, 'import'])->name('import');
    
    // Member Management
    Route::prefix('/{household}/members')->name('members.')->group(function () {
        Route::get('/', [HouseholdMemberController::class, 'index'])->name('index');
        Route::post('/', [HouseholdMemberController::class, 'addMember'])->name('add');
        Route::delete('/{member}', [HouseholdMemberController::class, 'removeMember'])->name('remove');
    });
    
    // User Account Management for Household Head
    Route::prefix('/{household}/user')->name('user.')->group(function () {
        Route::post('/create', [HouseholdUserController::class, 'createUserAccount'])->name('create');
        Route::post('/reset-password', [HouseholdUserController::class, 'resetUserPassword'])->name('reset-password');
        Route::post('/change-head', [HouseholdUserController::class, 'changeHead'])->name('change-head');
    });
});

Route::middleware('permission:view-payments')->prefix('payments')->name('payments.')->group(function () {
    Route::get('/', [PaymentIndexController::class, 'index'])->name('index');
    Route::get('/statistics', [PaymentIndexController::class, 'statistics'])->name('statistics');
    Route::get('/clearance-types', [PaymentShowController::class, 'getClearanceTypes'])->name('clearance-types');
    Route::get('/outstanding-fees', [PaymentCreateController::class, 'getOutstandingFees'])->name('outstanding-fees');
    Route::get('/export/pdf', [PaymentShowController::class, 'exportPdf'])->name('export-pdf');
    Route::get('/{payment}', [PaymentShowController::class, 'show'])->name('show');
    Route::get('/{payment}/receipt', [PaymentShowController::class, 'printReceipt'])->name('receipt');
});

// Routes for managing payments (permission: manage-payments)
Route::middleware('permission:manage-payments')->prefix('payments')->name('payments.')->group(function () {
    // Create routes
    Route::get('/payments/create', [PaymentCreateController::class, 'create'])->name('create');
    Route::get('/create-for-clearance/{clearanceRequest}', [PaymentCreateController::class, 'createForClearance'])->name('create-for-clearance');
    Route::post('/', [PaymentStoreController::class, 'store'])->name('store');
    

    Route::post('/verify-discount-id', [PaymentCreateController::class, 'verifyDiscountId'])
    ->name('verify-discount-id');
    // Edit/Update routes
    Route::get('/{payment}/edit', [PaymentEditController::class, 'edit'])->name('edit');
    Route::put('/{payment}', [PaymentEditController::class, 'update'])->name('update');
    
    // Status management routes
    Route::patch('/{payment}/cancel', [PaymentEditController::class, 'cancel'])->name('cancel');
    Route::patch('/{payment}/refund', [PaymentEditController::class, 'refund'])->name('refund');
    
    // Delete route (if needed)
    Route::delete('/{payment}', [PaymentEditController::class, 'destroy'])->name('destroy');
});



// ====================
// FEES MANAGEMENT
// ====================
Route::middleware('permission:view-fees')->prefix('fees')->name('fees.')->group(function () {
    Route::get('/', [FeeController::class, 'index'])->name('index');
    Route::get('/{fee}', [FeeShowController::class, 'show'])->name('show');
});

Route::middleware('permission:manage-fees')->prefix('fees')->name('fees.')->group(function () {
    Route::get('/fees/create', [FeeCreateController::class, 'create'])->name('create');
    Route::post('/', [FeeStoreController::class, 'store'])->name('store');
    Route::get('/{fee}/edit', [FeeEditController::class, 'edit'])->name('edit');
    Route::put('/{fee}', [FeeEditController::class, 'update'])->name('update');
    Route::delete('/{fee}', [FeeEditController::class, 'destroy'])->name('destroy');
    Route::get('/{fee}', [FeeShowController::class, 'show'])->name('show');
    Route::get('/{fee}/print/{type?}', [FeeShowController::class, 'print'])->name('print');
    Route::post('/{fee}/record-payment', [FeePaymentController::class, 'recordPayment'])->name('record-payment');
    Route::post('/{fee}/waive', [FeePaymentController::class, 'waive'])->name('waive');
    Route::post('/{fee}/cancel', [FeeEditController::class, 'cancel'])->name('cancel');
    Route::get('/outstanding', [FeeController::class, 'outstanding'])->name('outstanding');
    Route::get('/export', [FeeController::class, 'export'])->name('export');
    Route::post('/bulk-action', [FeePaymentController::class, 'bulkAction'])->name('bulk-action');
    Route::get('/quick-stats', [FeeController::class, 'quickStats'])->name('quickStats');
    Route::get('/status-chart', [FeeController::class, 'statusChartData'])->name('statusChart');
    Route::get('/monthly-collection-chart', [FeeController::class, 'monthlyCollectionChart'])->name('monthlyCollectionChart');
    Route::get('/dashboard', [FeeController::class, 'dashboard'])->name('dashboard');
});



Route::prefix('fees/reminders')->name('fees.reminders.')->group(function () {
    Route::get('/due-stats', [FeeController::class, 'getDueStats'])->name('due-stats');
    Route::post('/send', [FeeController::class, 'sendDueReminders'])->name('send');
    Route::post('/{id}/send-single', [FeeController::class, 'sendSingleReminder'])->name('send-single');
    Route::get('/{id}/history', [FeeController::class, 'getReminderHistory'])->name('history');
});

// ====================
// COMMUNITY REPORTS MANAGEMENT
// ====================

// Routes for viewing reports (view-reports permission)
Route::middleware('permission:view-reports')->prefix('community-reports')->name('community-reports.')->group(function () {
    Route::get('/', [CommunityReportIndexController::class, 'index'])->name('index');
    Route::get('/{report}', [CommunityReportShowController::class, 'show'])->name('show');
    Route::get('/{report}/print', [CommunityReportPrintController::class, 'print'])->name('print');
    Route::get('/{report}/pdf', [CommunityReportPrintController::class, 'pdf'])->name('pdf');
    Route::get('/{report}/related', [CommunityReportRelatedController::class, 'index'])->name('related');
    Route::get('/export', [CommunityReportExportController::class, 'export'])->name('export');
    Route::get('/statistics', [CommunityReportStatsController::class, 'statistics'])->name('statistics');
    Route::get('/dashboard-stats', [CommunityReportStatsController::class, 'dashboardStats'])->name('dashboard-stats');
});

// Routes for managing reports (manage-reports permission)
Route::middleware('permission:manage-reports')->prefix('community-reports')->name('community-reports.')->group(function () {
    Route::get('/community-reports/create', [CommunityReportCreateController::class, 'create'])->name('create');
    Route::post('/', [CommunityReportStoreController::class, 'store'])->name('store');
    Route::get('/{report}/edit', [CommunityReportEditController::class, 'edit'])->name('edit');
    Route::put('/{report}', [CommunityReportUpdateController::class, 'update'])->name('update');
    Route::delete('/{report}', [CommunityReportDestroyController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-action', [CommunityReportBulkController::class, 'bulkAction'])->name('bulk-action');
    Route::post('/{report}/upload-evidence', [CommunityReportEvidenceController::class, 'upload'])->name('upload-evidence');
    Route::delete('/{report}/evidence/{evidenceId}', [CommunityReportEvidenceController::class, 'remove'])->name('remove-evidence');
    Route::post('/{report}/send-response', [CommunityReportResponseController::class, 'send'])->name('send-response');
});

// ====================
// REPORT TYPES MANAGEMENT
// ====================
Route::middleware('permission:view-report-types')->prefix('report-types')->name('report-types.')->group(function () {
    Route::get('/', [ReportTypeController::class, 'index'])->name('index');
    Route::get('/{reportType}', [ReportTypeController::class, 'show'])->name('show');
});

Route::middleware('permission:manage-report-types')->prefix('report-types')->name('report-types.')->group(function () {
    Route::get('/report-types/create', [ReportTypeController::class, 'create'])->name('create');
    Route::post('/', [ReportTypeController::class, 'store'])->name('store');
    Route::get('/{reportType}/edit', [ReportTypeController::class, 'edit'])->name('edit');
    Route::put('/{reportType}', [ReportTypeController::class, 'update'])->name('update');
    Route::delete('/{reportType}', [ReportTypeController::class, 'destroy'])->name('destroy');
    Route::post('/{reportType}/toggle-status', [ReportTypeController::class, 'toggleStatus'])->name('toggle-status');
    Route::post('/bulk-action', [ReportTypeController::class, 'bulkAction'])->name('bulk-action');
    Route::post('/create-from-common', [ReportTypeController::class, 'createFromCommonType'])->name('create-from-common');
});

// ====================
// DOCUMENT TYPES MANAGEMENT
// ====================
Route::middleware('permission:view-document-types')->prefix('document-types')->name('document-types.')->group(function () {
    Route::get('/', [DocumentTypeController::class, 'index'])->name('index');
    Route::get('/export', [DocumentTypeController::class, 'export'])->name('export');
    Route::get('/{documentType}', [DocumentTypeController::class, 'show'])->name('show');
});

Route::middleware('permission:manage-document-types')->prefix('document-types')->name('document-types.')->group(function () {
    Route::get('/document-types/create', [DocumentTypeController::class, 'create'])->name('create');
    Route::post('/', [DocumentTypeController::class, 'store'])->name('store');
    Route::get('/{documentType}/edit', [DocumentTypeController::class, 'edit'])->name('edit');
    Route::put('/{documentType}', [DocumentTypeController::class, 'update'])->name('update');
    Route::delete('/{documentType}', [DocumentTypeController::class, 'destroy'])->name('destroy');
    Route::post('/{documentType}/toggle-status', [DocumentTypeController::class, 'toggleStatus'])->name('toggle-status');
    Route::post('/{documentType}/toggle-required', [DocumentTypeController::class, 'toggleRequired'])->name('toggle-required');
    Route::post('/{documentType}/duplicate', [DocumentTypeController::class, 'duplicate'])->name('duplicate');
    Route::post('/bulk-action', [DocumentTypeController::class, 'bulkAction'])->name('bulk-action');
    Route::post('/bulk-duplicate', [DocumentTypeController::class, 'bulkDuplicate'])->name('bulk-duplicate');
    Route::post('/create-from-common', [DocumentTypeController::class, 'createFromCommonType'])->name('create-from-common');
});

// ====================
// FORMS MANAGEMENT
// ====================
Route::middleware('permission:manage-forms')->prefix('forms')->name('forms.')->group(function () {
    Route::get('/', [FormController::class, 'index'])->name('index');
    Route::get('/create', [FormController::class, 'create'])->name('create');
    Route::post('/', [FormController::class, 'store'])->name('store');
    Route::prefix('{form}')->group(function () {
        Route::get('/', [FormController::class, 'show'])->name('show');
        Route::get('/edit', [FormController::class, 'edit'])->name('edit');
        Route::put('/', [FormController::class, 'update'])->name('update');
        Route::delete('/', [FormController::class, 'destroy'])->name('destroy');
        Route::get('/download', [FormController::class, 'download'])->name('download');
        Route::post('/toggle-status', [FormController::class, 'toggleStatus'])->name('toggle-status');
    });
    Route::post('/bulk-action', [FormController::class, 'bulkAction'])->name('bulk-action');
});

// ====================
// PRIVILEGES MANAGEMENT
// ====================

// Routes for viewing privileges (view-privileges permission)
Route::middleware('permission:view-privileges')->prefix('privileges')->name('privileges.')->group(function () {
    Route::get('/', [PrivilegeController::class, 'index'])->name('index');
    Route::get('/{privilege}', [PrivilegeController::class, 'show'])->name('show');
    Route::get('/{privilege}/assignments', [PrivilegeController::class, 'assignments'])->name('assignments');
    Route::get('/{privilege}/export', [PrivilegeController::class, 'exportAssignments'])->name('assignments.export');
});

// Routes for managing privileges (manage-privileges permission)
Route::middleware('permission:manage-privileges')->prefix('privileges')->name('privileges.')->group(function () {
    Route::get('/privileges/create', [PrivilegeController::class, 'create'])->name('create');
    Route::post('/', [PrivilegeController::class, 'store'])->name('store');
    Route::get('/{privilege}/edit', [PrivilegeController::class, 'edit'])->name('edit');
    Route::put('/{privilege}', [PrivilegeController::class, 'update'])->name('update');
    Route::delete('/{privilege}', [PrivilegeController::class, 'destroy'])->name('destroy');
    Route::post('/{privilege}/toggle-status', [PrivilegeController::class, 'toggleStatus'])->name('toggle-status');
    Route::post('/{privilege}/duplicate', [PrivilegeController::class, 'duplicate'])->name('duplicate');
});

// Routes for assigning privileges (assign-privileges permission)
Route::middleware('permission:assign-privileges')->prefix('privileges')->name('privileges.')->group(function () {
    Route::get('/{privilege}/assign', [PrivilegeController::class, 'assign'])->name('assign');
    Route::post('/{privilege}/assign', [PrivilegeController::class, 'storeAssignment'])->name('assign.store');
    Route::post('/{privilege}/bulk-verify', [PrivilegeController::class, 'bulkVerify'])->name('bulk-verify');
    Route::get('/{privilege}/search-residents', [PrivilegeController::class, 'searchResidents'])->name('search-residents');
});

// Assignment specific routes (assign-privileges permission)
Route::middleware('permission:assign-privileges')->prefix('assignments')->name('privileges.assignments.')->group(function () {
    Route::post('/{assignment}/verify', [PrivilegeController::class, 'verifyAssignment'])->name('verify');
    Route::delete('/{assignment}/revoke', [PrivilegeController::class, 'revokeAssignment'])->name('revoke');
});
// ====================
// ANNOUNCEMENTS MANAGEMENT
// ====================
Route::middleware('permission:view-announcements')->prefix('announcements')->name('announcements.')->group(function () {
    Route::get('/', [AnnouncementController::class, 'index'])->name('index');
    Route::get('/show/{announcement}', [AnnouncementController::class, 'show'])->name('show');
});

Route::middleware('permission:manage-announcements')->prefix('announcements')->name('announcements.')->group(function () {
    Route::get('/create', [AnnouncementController::class, 'create'])->name('create');
    Route::post('/store', [AnnouncementController::class, 'store'])->name('store');
    Route::get('/edit/{announcement}', [AnnouncementController::class, 'edit'])->name('edit');
    Route::put('/update/{announcement}', [AnnouncementController::class, 'update'])->name('update');
    Route::delete('/delete/{announcement}', [AnnouncementController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-action', [AnnouncementController::class, 'bulkAction'])->name('bulk-action');
    Route::post('/toggle-status/{announcement}', [AnnouncementController::class, 'toggleStatus'])->name('toggle-status');
});

// ====================
// FEE TYPES MANAGEMENT - COMMENTED OUT FOR NOW
// ====================
Route::middleware('permission:view-fee-types')->prefix('fee-types')->name('fee-types.')->group(function () {
    Route::get('/', [FeeTypeController::class, 'index'])->name('index');
    Route::get('/{feeType}', [FeeTypeController::class, 'show'])->name('show');
});

Route::middleware('permission:manage-fee-types')->prefix('fee-types')->name('fee-types.')->group(function () {
    Route::get('/fee-types/create', [FeeTypeController::class, 'create'])->name('create');
    Route::post('/', [FeeTypeController::class, 'store'])->name('store');
    Route::get('/{feeType}/edit', [FeeTypeController::class, 'edit'])->name('edit');
    Route::put('/{feeType}', [FeeTypeController::class, 'update'])->name('update');
    Route::delete('/{feeType}', [FeeTypeController::class, 'destroy'])->name('destroy');
    Route::post('/{feeType}/toggle-status', [FeeTypeController::class, 'toggleStatus'])->name('toggle-status');
    Route::post('/bulk-action', [FeeTypeController::class, 'bulkAction'])->name('bulk-action');
});

// ====================
// CLEARANCES MANAGEMENT
// ====================

// Routes for viewing clearances (view-clearances permission)
Route::middleware('permission:view-clearances')->prefix('clearances')->name('clearances.')->group(function () {
    Route::get('/', [ClearanceIndexController::class, 'index'])->name('index');
    Route::get('/{clearance}', [ClearanceShowController::class, 'show'])->name('show');
    Route::get('/{clearance}/print', [ClearancePrintController::class, 'print'])->name('print');
    Route::get('/types', [ClearanceTypeController::class, 'index'])->name('types.index');
    Route::get('/reports/issued', [ClearanceReportController::class, 'issued'])->name('reports.issued');
});

// Routes for managing clearances (manage-clearances permission)
Route::middleware('permission:manage-clearances')->prefix('clearances')->name('clearances.')->group(function () {
    Route::get('/clearances/create', [ClearanceCreateController::class, 'create'])->name('create');
    Route::post('/', [ClearanceStoreController::class, 'store'])->name('store');
    Route::get('/{clearance}/edit', [ClearanceEditController::class, 'edit'])->name('edit');
    Route::put('/{clearance}', [ClearanceUpdateController::class, 'update'])->name('update');
    Route::delete('/{clearance}', [ClearanceDestroyController::class, 'destroy'])->name('destroy');
});

// Routes for issuing clearances (issue-clearances permission)
Route::middleware('permission:issue-clearances')->prefix('clearances')->name('clearances.')->group(function () {
    Route::post('/{clearance}/approve', [ClearanceStatusController::class, 'approve'])->name('approve');
    Route::post('/{clearance}/reject', [ClearanceStatusController::class, 'reject'])->name('reject');
    Route::post('/{clearance}/issue', [ClearanceStatusController::class, 'issue'])->name('issue');
    Route::post('/{clearance}/process', [ClearanceStatusController::class, 'process'])->name('process');
    Route::post('/{clearance}/cancel', [ClearanceStatusController::class, 'cancel'])->name('cancel');
});

Route::middleware('permission:issue-clearances')->prefix('clearances/approval')->name('clearances.approval.')->group(function () {
    Route::get('/requests', [ClearanceApprovalController::class, 'index'])->name('index');
    Route::get('/{clearanceRequest}', [ClearanceApprovalController::class, 'show'])->name('show');
    Route::post('/{clearanceRequest}/approve', [ClearanceApprovalController::class, 'approve'])->name('approve');
    Route::post('/{clearanceRequest}/reject', [ClearanceApprovalController::class, 'reject'])->name('reject');
    Route::post('/{clearanceRequest}/mark-processing', [ClearanceApprovalController::class, 'markAsProcessing'])->name('mark-processing');
    Route::post('/{clearanceRequest}/return-pending', [ClearanceApprovalController::class, 'returnToPending'])->name('return-pending');
    Route::get('/stats', [ClearanceApprovalController::class, 'stats'])->name('stats');
});

// ====================
// CLEARANCE TYPES MANAGEMENT
// ====================
Route::middleware('permission:view-clearance-types')->prefix('clearance-types')->name('clearance-types.')->group(function () {
    Route::get('/', [ClearanceTypeController::class, 'index'])->name('index');
    Route::get('/{clearanceType}', [ClearanceTypeController::class, 'show'])->name('show');
    Route::get('/export', [ClearanceTypeController::class, 'export'])->name('export');
    Route::get('/{clearanceType}/print', [ClearanceTypeController::class, 'print'])->name('print');
});

Route::middleware('permission:manage-clearance-types')->prefix('clearance-types')->name('clearance-types.')->group(function () {
    Route::get('/clearance-types/create', [ClearanceTypeController::class, 'create'])->name('create');
    Route::post('/', [ClearanceTypeController::class, 'store'])->name('store');
    Route::post('/bulk-action', [ClearanceTypeController::class, 'bulkAction'])->name('bulk-action');
    Route::post('/bulk-activate', [ClearanceTypeController::class, 'bulkActivate'])->name('bulk-activate');
    Route::post('/bulk-deactivate', [ClearanceTypeController::class, 'bulkDeactivate'])->name('bulk-deactivate');
    Route::post('/bulk-delete', [ClearanceTypeController::class, 'bulkDelete'])->name('bulk-delete');
    Route::post('/bulk-duplicate', [ClearanceTypeController::class, 'bulkDuplicate'])->name('bulk-duplicate');
    Route::post('/bulk-update', [ClearanceTypeController::class, 'bulkUpdate'])->name('bulk-update');
    Route::prefix('{clearanceType}')->group(function () {
        Route::get('/edit', [ClearanceTypeController::class, 'edit'])->name('edit');
        Route::put('/', [ClearanceTypeController::class, 'update'])->name('update');
        Route::delete('/', [ClearanceTypeController::class, 'destroy'])->name('destroy');
        Route::post('/toggle-status', [ClearanceTypeController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/duplicate', [ClearanceTypeController::class, 'duplicate'])->name('duplicate');
    });
});

// ====================
// PUROK MANAGEMENT
// ====================
Route::middleware('permission:manage-puroks')->prefix('puroks')->name('puroks.')->group(function () {
    Route::get('/', [PurokController::class, 'index'])->name('index');
    Route::get('/create', [PurokController::class, 'create'])->name('create');
    Route::post('/', [PurokController::class, 'store'])->name('store');
    Route::get('/{purok}', [PurokController::class, 'show'])->name('show');
    Route::get('/{purok}/edit', [PurokController::class, 'edit'])->name('edit');
    Route::put('/{purok}', [PurokController::class, 'update'])->name('update');
    Route::delete('/{purok}', [PurokController::class, 'destroy'])->name('destroy');
    Route::post('/update-statistics', [PurokController::class, 'updateStatistics'])->name('update-statistics');
    Route::get('/api/all', [PurokController::class, 'getAll'])->name('api.all');
    Route::patch('/admin/puroks/{purok}/update-coordinates', [PurokController::class, 'updateCoordinates'])
    ->name('admin.puroks.update-coordinates');
});

// ====================
// BACKUP MANAGEMENT
// ====================
Route::middleware('permission:manage-backups')->prefix('backup')->name('backup.')->group(function () {
    // Main backup page
    Route::get('/', [BackupIndexController::class, 'index'])->name('index');
    
    // Create backup
    Route::post('/', [BackupCreateController::class, 'create'])->name('create');
    
    // Download backup
    Route::get('/download/{filename}', [BackupDownloadController::class, 'download'])->name('download');
    
    // Delete backup
    Route::delete('/{filename}', [BackupDestroyController::class, 'destroy'])->name('destroy');
    
    // Protection routes
    Route::post('/{filename}/protect', [BackupProtectionController::class, 'protect'])->name('protect');
    Route::post('/{filename}/unprotect', [BackupProtectionController::class, 'unprotect'])->name('unprotect');
    Route::post('/{filename}/toggle-protection', [BackupProtectionController::class, 'toggleProtection'])->name('toggle-protection');
    
    // Progress tracking
    Route::get('/progress', [BackupProgressController::class, 'progress'])->name('progress');
});

// ====================
// REPORTS
// ====================
Route::middleware('permission:view-reports')->prefix('reports')->name('reports.')->group(function () {
    Route::get('/collections', [ReportsController::class, 'collections'])->name('collections');
    Route::get('/revenue', [ReportsController::class, 'revenue'])->name('revenue');
    Route::get('/audit-logs', [ReportsController::class, 'auditLogs'])->name('auditLogs');
    Route::get('/audit-logs/{id}', [ReportsController::class, 'auditLogsShow'])->name('auditLogs.show');

    Route::get('/activity-logs', [ReportsController::class, 'activityLogs'])->name('activity-logs');
    Route::get('/activity-logs/export', [ReportsController::class, 'activityLogsExport'])->name('activity-logs.export');
    Route::get('/activity-logs/{id}', [ReportsController::class, 'activityLogShow'])->name('activity-logs.show');
    Route::get('/login-logs', [LoginLogController::class, 'index'])->name('login-logs');
    Route::get('/login-logs/{id}', [LoginLogController::class, 'show'])->name('login-logs.show');
});

// ====================
// RECEIPTS MANAGEMENT
// ====================
Route::prefix('receipts')->name('receipts.')->group(function () {
    Route::get('/', [ReceiptsController::class, 'index'])->name('index');
    Route::post('/', [ReceiptsController::class, 'store'])->name('store');
    Route::post('/generate-from-payment/{payment}', [ReceiptsController::class, 'generateFromPayment'])->name('generate-from-payment');
    Route::post('/generate-from-clearance/{clearance}', [ReceiptsController::class, 'generateFromClearance'])->name('generate-from-clearance');
    Route::post('/{receipt}/void', [ReceiptsController::class, 'void'])->name('void');
    Route::post('/bulk/operation', [ReceiptsController::class, 'bulkOperation'])->name('bulk-operation');
    Route::post('/export', [ReceiptsController::class, 'export'])->name('export');
    Route::get('/receipts/{receipt}', [ReceiptsController::class, 'show'])->name('show');

    });

// ====================
// SECURITY LOGS
// ====================
Route::middleware('permission:view-security-logs')->prefix('security')->name('reports.')->group(function () {
    Route::get('/access-logs', [SecurityController::class, 'accessLogs'])->name('access-logs');
    Route::get('/access-logs/export', [SecurityController::class, 'exportAccessLogs'])->name('access-logs.export');
    Route::get('/security-audit', [SecurityController::class, 'securityAudit'])->name('security-audit');
    Route::get('/sessions', [SecurityController::class, 'sessions'])->name('admin.security.sessions');
});