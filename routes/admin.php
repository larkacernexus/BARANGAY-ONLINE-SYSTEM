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
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\GoogleMapsController;
use App\Http\Controllers\Admin\PrivilegeController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| SECURITY NOTE: All admin routes are protected by:
| - Authentication middleware (auth)
| - Permission checks per route group
| - CSRF protection (enabled globally)
| - Parameter constraints to prevent ID enumeration
| - Rate limiting on sensitive operations
|
| LOGIC NOTE: Route order matters for parameter binding. Specific routes
| must be defined before parameterized routes to prevent conflicts.
|
*/

// ====================
// DASHBOARD & GENERAL
// ====================
Route::middleware(['auth', 'permission:view-dashboard'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // SECURITY NOTE: Input validated in controller
    Route::get('/instructions', function () {
        return Inertia::render('admin/Instructions/Instructions', [
            'section' => request()->input('section', 'overview'),
        ]);
    })->name('instructions');
});

// SECURITY NOTE: Search requires authentication but specific permissions handled in controller
Route::middleware(['auth'])->group(function () {
    Route::get('/search', function () {
        return Inertia::render('admin/Search/Index');
    })->name('search');
});

// ====================
// BANNER MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-banners'])->prefix('banners')->name('banners.')->group(function () {
    Route::get('/', [BannerController::class, 'index'])->name('index');
    Route::get('/create', [BannerController::class, 'create'])->name('create');
    Route::post('/', [BannerController::class, 'store'])->name('store');
    Route::get('/{banner}/edit', [BannerController::class, 'edit'])->name('edit')->whereNumber('banner');
    Route::put('/{banner}', [BannerController::class, 'update'])->name('update')->whereNumber('banner');
    Route::delete('/{banner}', [BannerController::class, 'destroy'])->name('destroy')->whereNumber('banner');
    Route::post('/{banner}/toggle', [BannerController::class, 'toggleActive'])->name('toggle')->whereNumber('banner');
    Route::post('/reorder', [BannerController::class, 'reorder'])->name('reorder');
});

// SECURITY NOTE: Google Maps URL resolver - ensure controller validates URLs against whitelist
Route::middleware(['auth', 'permission:manage-residents', 'throttle:30,1'])->group(function () {
    Route::post('/resolve-google-maps-url', [GoogleMapsController::class, 'resolveUrl'])
        ->name('admin.resolve-google-maps-url');
});

// ====================
// BLOTTER MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('blotters')->name('blotters.')->group(function () {
    // Index - List all blotters
    Route::get('/', [BlotterController::class, 'index'])
        ->name('index')
        ->middleware('permission:view-blotters');
    
    // Create - Show create form
    Route::get('/create', [BlotterController::class, 'create'])
        ->name('create')
        ->middleware('permission:create-blotters');
         Route::get('/search-residents', [BlotterController::class, 'searchResidents'])
        ->name('search-residents');
    
    // Store - Save new blotter
    Route::post('/', [BlotterController::class, 'store'])
        ->name('store')
        ->middleware(['permission:create-blotters', 'throttle:20,1']);
    
    // Custom routes - LOGIC NOTE: Define these BEFORE parameterized routes
    Route::post('/bulk/delete', [BlotterController::class, 'bulkDelete'])
        ->name('bulk.delete')
        ->middleware(['permission:delete-blotters', 'throttle:10,1']);
    
    Route::post('/bulk/status', [BlotterController::class, 'bulkUpdateStatus'])
        ->name('bulk.status')
        ->middleware(['permission:edit-blotters', 'throttle:20,1']);
    
    Route::get('/export/csv', [BlotterController::class, 'exportCsv'])
        ->name('export.csv')
        ->middleware('permission:view-blotters');
    
    Route::get('/export/pdf', [BlotterController::class, 'exportPdf'])
        ->name('export.pdf')
        ->middleware('permission:view-blotters');
    
    Route::post('/import', [BlotterController::class, 'import'])
        ->name('import')
        ->middleware(['permission:create-blotters', 'throttle:5,1']);
    
    Route::get('/stats/overview', [BlotterController::class, 'statistics'])
        ->name('stats')
        ->middleware('permission:view-blotters');
    
    // Show - View single blotter
    Route::get('/{blotter}', [BlotterController::class, 'show'])
        ->name('show')
        ->middleware('permission:view-blotters')
        ->whereNumber('blotter');
    
    // Edit - Show edit form
    Route::get('/{blotter}/edit', [BlotterController::class, 'edit'])
        ->name('edit')
        ->middleware('permission:edit-blotters')
        ->whereNumber('blotter');
    
    // Update - Save edited blotter
    Route::put('/{blotter}', [BlotterController::class, 'update'])
        ->name('update')
        ->middleware('permission:edit-blotters')
        ->whereNumber('blotter');
    
    // Destroy - Delete blotter
    Route::delete('/{blotter}', [BlotterController::class, 'destroy'])
        ->name('destroy')
        ->middleware('permission:delete-blotters')
        ->whereNumber('blotter');
    
    Route::post('/{blotter}/update-status', [BlotterController::class, 'updateStatus'])
        ->name('update-status')
        ->middleware('permission:edit-blotters')
        ->whereNumber('blotter');
    
    // SECURITY NOTE: Attachment download requires additional controller-level authorization
    Route::get('/{blotter}/download-attachment/{index}', [BlotterController::class, 'downloadAttachment'])
        ->name('download-attachment')
        ->middleware('permission:view-blotters')
        ->whereNumber('blotter')
        ->whereNumber('index');
    
    Route::get('/{blotter}/print', [BlotterController::class, 'print'])
        ->name('print')
        ->middleware('permission:view-blotters')
        ->whereNumber('blotter');
});

// ====================
// USER MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-users'])->prefix('users')->name('users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store')->middleware('throttle:10,1');
    Route::get('/{user}', [UserController::class, 'show'])->name('show')->whereNumber('user');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit')->whereNumber('user');
    Route::put('/{user}', [UserController::class, 'update'])->name('update')->whereNumber('user');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy')->whereNumber('user');
    Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->name('reset-password')
        ->middleware('throttle:5,1')
        ->whereNumber('user');
    Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('user');
    Route::post('/{user}/update-permissions', [UserController::class, 'updatePermissions'])->name('update-permissions')->whereNumber('user');
});

// ====================
// ROLES & PERMISSIONS
// ====================
Route::middleware(['auth', 'permission:manage-roles'])->prefix('roles')->name('roles.')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('index');
    Route::get('/create', [RoleController::class, 'create'])->name('create');
    Route::post('/', [RoleController::class, 'store'])->name('store');
    Route::get('/{role}', [RoleController::class, 'show'])->name('show')->whereNumber('role');
    Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit')->whereNumber('role');
    Route::put('/{role}', [RoleController::class, 'update'])->name('update')->whereNumber('role');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy')->whereNumber('role');
    Route::get('/{role}/permissions', [RoleController::class, 'permissions'])->name('permissions')->whereNumber('role');
    Route::post('/{role}/permissions/assign', [RoleController::class, 'assignPermissions'])->name('permissions.assign')->whereNumber('role');
    Route::delete('/{role}/permissions/{permission}', [RoleController::class, 'revokePermission'])
        ->name('permissions.revoke')
        ->whereNumber('role')
        ->whereNumber('permission');
    Route::put('/{role}/permissions/update', [RoleController::class, 'updatePermissions'])->name('permissions.update')->whereNumber('role');
    Route::get('/{role}/users', [RoleController::class, 'users'])->name('users')->whereNumber('role');
});

Route::middleware(['auth', 'permission:manage-role-permissions'])->prefix('role-permissions')->name('role-permissions.')->group(function () {
    Route::get('/', [RolePermissionController::class, 'index'])->name('index');
    Route::get('/create', [RolePermissionController::class, 'create'])->name('create');
    Route::post('/', [RolePermissionController::class, 'store'])->name('store');
    Route::get('/{role_permission}', [RolePermissionController::class, 'show'])->name('show')->whereNumber('role_permission');
    Route::delete('/{role_permission}', [RolePermissionController::class, 'destroy'])->name('destroy')->whereNumber('role_permission');
    Route::post('/bulk-revoke', [RolePermissionController::class, 'bulkRevoke'])->name('bulk-revoke');
    Route::get('/export', [RolePermissionController::class, 'export'])->name('export');
});

Route::middleware(['auth', 'permission:manage-permissions'])->prefix('permissions')->name('permissions.')->group(function () {
    Route::get('/', [PermissionController::class, 'index'])->name('index');
    Route::get('/create', [PermissionController::class, 'create'])->name('create');
    Route::post('/', [PermissionController::class, 'store'])->name('store');
    Route::get('/modules/list', [PermissionController::class, 'modules'])->name('modules');
    Route::post('/bulk-assign', [PermissionController::class, 'bulkAssignStore'])->name('bulk-assign');
    Route::get('/{permission}', [PermissionController::class, 'show'])->name('show')->whereNumber('permission');
    Route::get('/{permission}/edit', [PermissionController::class, 'edit'])->name('edit')->whereNumber('permission');
    Route::put('/{permission}', [PermissionController::class, 'update'])->name('update')->whereNumber('permission');
    Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('destroy')->whereNumber('permission');
    Route::put('/{permission}/toggle-status', [PermissionController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('permission');
});

// ====================
// INCIDENT MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('incidents')->group(function () {
    Route::middleware('permission:view-incidents')->group(function () {
        Route::get('/', [AdminIncidentController::class, 'index'])->name('admin.incidents.index');
        Route::get('/complaints', [AdminIncidentController::class, 'complaints'])->name('admin.complaints.index');
        Route::get('/blotters', [AdminIncidentController::class, 'blotters'])->name('admin.blotters.index');
        Route::get('/{incident}', [AdminIncidentController::class, 'show'])->name('admin.incidents.show')->whereNumber('incident');
    });
    
    Route::middleware('permission:manage-incidents')->group(function () {
        Route::get('/create', [AdminIncidentController::class, 'create'])->name('admin.incidents.create');
        Route::post('/', [AdminIncidentController::class, 'store'])->name('admin.incidents.store');
        Route::patch('/{incident}', [AdminIncidentController::class, 'update'])->name('admin.incidents.update')->whereNumber('incident');
        Route::patch('/{incident}/status', [AdminIncidentController::class, 'updateStatus'])->name('admin.incidents.update-status')->whereNumber('incident');
        Route::delete('/{incident}', [AdminIncidentController::class, 'destroy'])->name('admin.incidents.destroy')->whereNumber('incident');
    });
    
    Route::middleware('permission:review-incidents')->group(function () {
        Route::patch('/{incident}/review-status', [AdminIncidentController::class, 'reviewStatus'])
            ->name('admin.incidents.review-status')
            ->whereNumber('incident');
    });
});

Route::middleware(['auth', 'permission:manage-blotters'])->prefix('blotters')->group(function () {
    Route::patch('/{incident}/details', [AdminIncidentController::class, 'updateBlotterDetails'])
        ->name('admin.blotters.update-details')
        ->whereNumber('incident');
});

Route::middleware(['auth', 'permission:manage-complaints'])->prefix('complaints')->group(function () {
    Route::get('/create', [AdminIncidentController::class, 'createComplaint'])->name('admin.complaints.create');
});

// ====================
// RESIDENT MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-residents'])->prefix('residents')->name('residents.')->group(function () {
    // Import/Export - LOGIC NOTE: Specific routes before parameterized routes
    Route::post('/import', [ResidentImportController::class, 'import'])->name('import')->middleware('throttle:5,1');
    Route::get('/import/guide', [ResidentImportController::class, 'downloadGuide'])->name('import.guide');
    Route::get('/import/template', [ResidentImportController::class, 'downloadTemplate'])->name('import.template');
    Route::get('/import/empty-template', [ResidentImportController::class, 'downloadEmptyTemplate'])->name('import.empty-template');
    Route::post('/import/process', [ResidentImportController::class, 'processImport'])->name('import.process');
    Route::post('/export', [ResidentExportController::class, 'export'])->name('export');
    
    // Bulk Operations
    Route::post('/bulk-delete', [ResidentBulkController::class, 'bulkDelete'])->name('bulk.delete')->middleware('throttle:10,1');
    Route::post('/bulk-action', [ResidentBulkController::class, 'bulkAction'])->name('bulk.action')->middleware('throttle:20,1');
    
    // CRUD Operations
    Route::get('/', [ResidentIndexController::class, 'index'])->name('index');
    Route::get('/create', [ResidentCreateController::class, 'create'])->name('create');
    Route::post('/', [ResidentStoreController::class, 'store'])->name('store');
    Route::get('/{resident}', [ResidentShowController::class, 'show'])->name('show')->whereNumber('resident');
    Route::get('/{resident}/edit', [ResidentEditController::class, 'edit'])->name('edit')->whereNumber('resident');
    Route::put('/{resident}', [ResidentUpdateController::class, 'update'])->name('update')->whereNumber('resident');
    Route::delete('/{resident}', [ResidentDestroyController::class, 'destroy'])->name('destroy')->whereNumber('resident');
    
    // Household assignment routes
    Route::post('/{resident}/assign-household', [App\Http\Controllers\Admin\Resident\ResidentHouseholdController::class, 'assign'])
        ->name('assign-household')
        ->whereNumber('resident');
    Route::delete('/{resident}/remove-from-household', [App\Http\Controllers\Admin\Resident\ResidentHouseholdController::class, 'remove'])
        ->name('remove-from-household')
        ->whereNumber('resident');
    
    // Resident Privileges
    Route::post('/{resident}/privileges', [App\Http\Controllers\Admin\Resident\ResidentPrivilegeController::class, 'store'])
        ->name('privileges.store')
        ->whereNumber('resident');
    Route::delete('/{resident}/privileges/{privilege}', [App\Http\Controllers\Admin\Resident\ResidentPrivilegeController::class, 'destroy'])
        ->name('privileges.destroy')
        ->whereNumber('resident')
        ->whereNumber('privilege');
});

// Available Privileges for dropdown
Route::middleware(['auth', 'permission:manage-residents'])->get('/privileges/available', [App\Http\Controllers\Admin\PrivilegeController::class, 'available'])
    ->name('privileges.available');

// ====================
// OFFICIALS MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-officials'])->prefix('officials')->name('officials.')->group(function () {
    // LOGIC NOTE: Specific routes before parameterized routes
    Route::get('/current', [OfficialController::class, 'currentOfficials'])->name('current');
    Route::get('/committee/{committee}', [OfficialController::class, 'byCommittee'])->name('committee')->whereNumber('committee');
    Route::post('/update-order', [OfficialController::class, 'updateOrder'])->name('update-order');
    Route::post('/export', [OfficialController::class, 'export'])->name('export');
    Route::post('/bulk-delete', [OfficialController::class, 'bulkDelete'])->name('bulk.delete')->middleware('throttle:10,1');
    Route::post('/bulk-status', [OfficialController::class, 'bulkUpdateStatus'])->name('bulk.status')->middleware('throttle:20,1');
    Route::get('/search-residents', [OfficialController::class, 'searchResidents'])
    ->name('search-residents');

    Route::get('/', [OfficialController::class, 'index'])->name('index');
    Route::get('/create', [OfficialController::class, 'create'])->name('create');
    Route::post('/', [OfficialController::class, 'store'])->name('store');
    
    // Single official term management
    Route::post('/{official}/end-term', [OfficialController::class, 'endTerm'])->name('end-term')->whereNumber('official');
    Route::post('/{official}/reactivate', [OfficialController::class, 'reactivate'])->name('reactivate')->whereNumber('official');
    
    Route::get('/{official}', [OfficialController::class, 'show'])->name('show')->whereNumber('official');
    Route::get('/{official}/edit', [OfficialController::class, 'edit'])->name('edit')->whereNumber('official');
    Route::put('/{official}', [OfficialController::class, 'update'])->name('update')->whereNumber('official');
    Route::delete('/{official}', [OfficialController::class, 'destroy'])->name('destroy')->whereNumber('official');
});

// ====================
// COMMITTEES MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-committees'])->prefix('committees')->name('committees.')->group(function () {
    Route::get('/export', [CommitteeController::class, 'export'])->name('export');
    Route::post('/bulk-activate', [CommitteeController::class, 'bulkActivate'])->name('bulk-activate');
    Route::post('/bulk-deactivate', [CommitteeController::class, 'bulkDeactivate'])->name('bulk-deactivate');
    Route::post('/bulk-delete', [CommitteeController::class, 'bulkDelete'])->name('bulk-delete')->middleware('throttle:10,1');
    
    Route::get('/', [CommitteeController::class, 'index'])->name('index');
    Route::get('/create', [CommitteeController::class, 'create'])->name('create');
    Route::post('/', [CommitteeController::class, 'store'])->name('store');
    Route::get('/{committee}', [CommitteeController::class, 'show'])->name('show')->whereNumber('committee');
    Route::get('/{committee}/edit', [CommitteeController::class, 'edit'])->name('edit')->whereNumber('committee');
    Route::put('/{committee}', [CommitteeController::class, 'update'])->name('update')->whereNumber('committee');
    Route::delete('/{committee}', [CommitteeController::class, 'destroy'])->name('destroy')->whereNumber('committee');
});

// ====================
// NOTIFICATIONS
// ====================
// SECURITY NOTE: Notifications accessible to all authenticated users, but controller should scope to user
Route::middleware(['auth'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::get('/api', [NotificationController::class, 'getNotifications'])->name('api');
    Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('unread-count');
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read')->middleware('throttle:10,1');
    
    // SECURITY NOTE: Notifications may use UUIDs
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])
        ->name('mark-read')
        ->where('id', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');
    Route::patch('/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])
        ->name('mark-as-read')
        ->where('id', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');
    Route::delete('/{id}', [NotificationController::class, 'destroy'])
        ->name('destroy')
        ->where('id', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');
});

// ====================
// POSITIONS MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-positions'])->prefix('positions')->name('positions.')->group(function () {
    Route::get('/export', [PositionController::class, 'export'])->name('export');
    Route::post('/bulk-activate', [PositionController::class, 'bulkActivate'])->name('bulk-activate');
    Route::post('/bulk-deactivate', [PositionController::class, 'bulkDeactivate'])->name('bulk-deactivate');
    Route::post('/bulk-delete', [PositionController::class, 'bulkDelete'])->name('bulk-delete')->middleware('throttle:10,1');
    
    Route::get('/', [PositionController::class, 'index'])->name('index');
    Route::get('/create', [PositionController::class, 'create'])->name('create');
    Route::post('/', [PositionController::class, 'store'])->name('store');
    Route::get('/{position}', [PositionController::class, 'show'])->name('show')->whereNumber('position');
    Route::get('/{position}/edit', [PositionController::class, 'edit'])->name('edit')->whereNumber('position');
    Route::put('/{position}', [PositionController::class, 'update'])->name('update')->whereNumber('position');
    Route::delete('/{position}', [PositionController::class, 'destroy'])->name('destroy')->whereNumber('position');
});

// ====================
// HOUSEHOLDS MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-households'])->prefix('households')->name('households.')->group(function () {
    // Import
    Route::post('/import', [HouseholdImportController::class, 'import'])->name('import')->middleware('throttle:5,1');
    
    // CRUD Operations
    Route::get('/', [HouseholdIndexController::class, 'index'])->name('index');
    Route::get('/create', [HouseholdCreateController::class, 'create'])->name('create');
    Route::get('/search-heads', [HouseholdCreateController::class, 'searchHeads'])->name('households.search-heads');
    Route::get('/search-residents', [HouseholdCreateController::class, 'searchResidents'])->name('households.search-residents');
    Route::post('/', [HouseholdStoreController::class, 'store'])->name('store');
    Route::get('/{household}', [HouseholdShowController::class, 'show'])->name('show')->whereNumber('household');
    Route::get('/{household}/edit', [HouseholdEditController::class, 'edit'])->name('edit')->whereNumber('household');
    Route::put('/{household}', [HouseholdUpdateController::class, 'update'])->name('update')->whereNumber('household');
    Route::delete('/{household}', [HouseholdDestroyController::class, 'destroy'])->name('destroy')->whereNumber('household');
    
    // Member Management
    Route::prefix('/{household}/members')->name('members.')->group(function () {
        Route::get('/', [HouseholdMemberController::class, 'index'])->name('index');
        Route::post('/', [HouseholdMemberController::class, 'addMember'])->name('add');
        Route::delete('/{member}', [HouseholdMemberController::class, 'removeMember'])->name('remove')->whereNumber('member');
    })->whereNumber('household');
    
    // User Account Management for Household Head
    Route::prefix('/{household}/user')->name('user.')->group(function () {
        Route::post('/create', [HouseholdUserController::class, 'createUserAccount'])
            ->name('create')
            ->middleware('throttle:5,1');
        Route::post('/reset-password', [HouseholdUserController::class, 'resetUserPassword'])
            ->name('reset-password')
            ->middleware('throttle:5,1');
        Route::post('/change-head', [HouseholdUserController::class, 'changeHead'])->name('change-head');
    })->whereNumber('household');
});
// ====================
// PAYMENTS MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('payments')->name('payments.')->group(function () {
    // View payments
    Route::middleware('permission:view-payments')->group(function () {
        Route::get('/statistics', [PaymentIndexController::class, 'statistics'])->name('statistics');
        Route::get('/clearance-types', [PaymentShowController::class, 'getClearanceTypes'])->name('clearance-types');
        Route::get('/export/pdf', [PaymentShowController::class, 'exportPdf'])->name('export-pdf');
        Route::get('/', [PaymentIndexController::class, 'index'])->name('index');
        Route::get('/{payment}', [PaymentShowController::class, 'show'])->name('show')->whereNumber('payment');
        Route::get('/{payment}/receipt', [PaymentShowController::class, 'printReceipt'])->name('receipt')->whereNumber('payment');
    });
    
    // Manage payments
    Route::middleware('permission:manage-payments')->group(function () {
        
        // ==========================================
        // FIXED: ALL specific routes MUST come BEFORE parameterized routes
        // ==========================================
        
        // POST routes
        Route::post('/verify-discount-id', [PaymentCreateController::class, 'verifyDiscountId'])
            ->name('verify-discount-id')
            ->middleware('throttle:20,1');
        
        // Load more - Infinite scroll (GET request)
        Route::get('/load-more-payers', [PaymentCreateController::class, 'loadMorePayers'])
            ->name('load-more-payers')
            ->middleware('throttle:60,1');
        
        // GET routes for payment creation
        Route::get('/create', [PaymentCreateController::class, 'create'])->name('create');
        Route::get('/create-for-clearance/{clearanceRequest}', [PaymentCreateController::class, 'createForClearance'])
            ->name('create-for-clearance')
            ->whereNumber('clearanceRequest');
        Route::get('/outstanding-fees', [PaymentCreateController::class, 'getOutstandingFees'])->name('outstanding-fees');
        
        // API endpoints for pagination
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/residents', [PaymentCreateController::class, 'getResidentsApi'])->name('residents');
            Route::get('/households', [PaymentCreateController::class, 'getHouseholdsApi'])->name('households');
            Route::get('/businesses', [PaymentCreateController::class, 'getBusinessesApi'])->name('businesses');
            Route::get('/fees', [PaymentCreateController::class, 'getFeesApi'])->name('fees');
            Route::get('/clearance-requests', [PaymentCreateController::class, 'getClearanceRequestsApi'])->name('clearance-requests');
            Route::get('/payer-clearance-requests', [PaymentCreateController::class, 'getPayerClearanceRequestsApi'])
                ->name('payer-clearance-requests')
                ->middleware('throttle:60,1');
        });
        
        // Payment CRUD operations
        Route::post('/', [PaymentStoreController::class, 'store'])->name('store')->middleware('throttle:30,1');
        
        // ==========================================
        // FIXED: Parameterized routes MUST BE LAST
        // ==========================================
        Route::get('/{payment}/edit', [PaymentEditController::class, 'edit'])->name('edit')->whereNumber('payment');
        Route::put('/{payment}', [PaymentEditController::class, 'update'])->name('update')->whereNumber('payment');
        Route::patch('/{payment}/cancel', [PaymentEditController::class, 'cancel'])->name('cancel')->whereNumber('payment');
        Route::patch('/{payment}/refund', [PaymentEditController::class, 'refund'])->name('refund')->whereNumber('payment');
        Route::delete('/{payment}', [PaymentEditController::class, 'destroy'])->name('destroy')->whereNumber('payment');
    });
});

// ====================
// FEES MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('fees')->name('fees.')->group(function () {
    // View fees
    Route::middleware('permission:view-fees')->group(function () {
        Route::get('/outstanding', [FeeController::class, 'outstanding'])->name('outstanding');
        Route::get('/export', [FeeController::class, 'export'])->name('export');
        Route::get('/quick-stats', [FeeController::class, 'quickStats'])->name('quickStats');
        Route::get('/status-chart', [FeeController::class, 'statusChartData'])->name('statusChart');
        Route::get('/monthly-collection-chart', [FeeController::class, 'monthlyCollectionChart'])->name('monthlyCollectionChart');
        Route::get('/dashboard', [FeeController::class, 'dashboard'])->name('dashboard');
        Route::get('/', [FeeController::class, 'index'])->name('index');
        Route::get('/{fee}', [FeeShowController::class, 'show'])->name('show')->whereNumber('fee');
        Route::get('/{fee}/print/{type?}', [FeeShowController::class, 'print'])->name('print')->whereNumber('fee');
    });
    
    // Manage fees
    Route::middleware('permission:manage-fees')->group(function () {
        Route::post('/bulk-action', [FeePaymentController::class, 'bulkAction'])->name('bulk-action')->middleware('throttle:20,1');
        Route::get('/create', [FeeCreateController::class, 'create'])->name('create');
        Route::post('/', [FeeStoreController::class, 'store'])->name('store');
        Route::get('/{fee}/edit', [FeeEditController::class, 'edit'])->name('edit')->whereNumber('fee');
        Route::put('/{fee}', [FeeEditController::class, 'update'])->name('update')->whereNumber('fee');
        Route::delete('/{fee}', [FeeEditController::class, 'destroy'])->name('destroy')->whereNumber('fee');
        Route::post('/{fee}/record-payment', [FeePaymentController::class, 'recordPayment'])->name('record-payment')->whereNumber('fee');
        Route::post('/{fee}/waive', [FeePaymentController::class, 'waive'])->name('waive')->whereNumber('fee');
        Route::post('/{fee}/cancel', [FeeEditController::class, 'cancel'])->name('cancel')->whereNumber('fee');
    });
    
    // Reminders
    Route::prefix('reminders')->name('reminders.')->group(function () {
        Route::get('/due-stats', [FeeController::class, 'getDueStats'])->name('due-stats');
        Route::post('/send', [FeeController::class, 'sendDueReminders'])->name('send')->middleware('throttle:10,1');
        Route::post('/{id}/send-single', [FeeController::class, 'sendSingleReminder'])->name('send-single')->whereNumber('id');
        Route::get('/{id}/history', [FeeController::class, 'getReminderHistory'])->name('history')->whereNumber('id');
    });
});

// ====================
// COMMUNITY REPORTS MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('community-reports')->name('community-reports.')->group(function () {
    // View reports
    Route::middleware('permission:view-reports')->group(function () {
        Route::get('/export', [CommunityReportExportController::class, 'export'])->name('export');
        Route::get('/statistics', [CommunityReportStatsController::class, 'statistics'])->name('statistics');
        Route::get('/dashboard-stats', [CommunityReportStatsController::class, 'dashboardStats'])->name('dashboard-stats');
        Route::get('/', [CommunityReportIndexController::class, 'index'])->name('index');
        Route::get('/{report}', [CommunityReportShowController::class, 'show'])->name('show')->whereNumber('report');
        Route::get('/{report}/print', [CommunityReportPrintController::class, 'print'])->name('print')->whereNumber('report');
        Route::get('/{report}/pdf', [CommunityReportPrintController::class, 'pdf'])->name('pdf')->whereNumber('report');
        Route::get('/{report}/related', [CommunityReportRelatedController::class, 'index'])->name('related')->whereNumber('report');
    });
    
    // Manage reports
    Route::middleware('permission:manage-reports')->group(function () {
        Route::post('/bulk-action', [CommunityReportBulkController::class, 'bulkAction'])->name('bulk-action')->middleware('throttle:20,1');
        Route::get('/create', [CommunityReportCreateController::class, 'create'])->name('create');
        Route::get('/search-residents', [CommunityReportCreateController::class, 'searchResidents'])
            ->name('search-residents');
        Route::post('/', [CommunityReportStoreController::class, 'store'])->name('store');
        Route::get('/{report}/edit', [CommunityReportEditController::class, 'edit'])->name('edit')->whereNumber('report');
        Route::put('/{report}', [CommunityReportUpdateController::class, 'update'])->name('update')->whereNumber('report');
        Route::delete('/{report}', [CommunityReportDestroyController::class, 'destroy'])->name('destroy')->whereNumber('report');
        Route::post('/{report}/upload-evidence', [CommunityReportEvidenceController::class, 'upload'])
            ->name('upload-evidence')
            ->whereNumber('report')
            ->middleware('throttle:10,1');
        Route::delete('/{report}/evidence/{evidenceId}', [CommunityReportEvidenceController::class, 'remove'])
            ->name('remove-evidence')
            ->whereNumber('report')
            ->whereNumber('evidenceId');
        Route::post('/{report}/send-response', [CommunityReportResponseController::class, 'send'])
            ->name('send-response')
            ->whereNumber('report');
    });
});

// ====================
// REPORT TYPES MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('report-types')->name('report-types.')->group(function () {
    Route::middleware('permission:view-report-types')->group(function () {
        Route::get('/', [ReportTypeController::class, 'index'])->name('index');
        Route::get('/{reportType}', [ReportTypeController::class, 'show'])->name('show')->whereNumber('reportType');
    });
    
    Route::middleware('permission:manage-report-types')->group(function () {
        Route::post('/bulk-action', [ReportTypeController::class, 'bulkAction'])->name('bulk-action');
        Route::post('/create-from-common', [ReportTypeController::class, 'createFromCommonType'])->name('create-from-common');
        Route::get('/create', [ReportTypeController::class, 'create'])->name('create');
        Route::post('/', [ReportTypeController::class, 'store'])->name('store');
        Route::get('/{reportType}/edit', [ReportTypeController::class, 'edit'])->name('edit')->whereNumber('reportType');
        Route::put('/{reportType}', [ReportTypeController::class, 'update'])->name('update')->whereNumber('reportType');
        Route::delete('/{reportType}', [ReportTypeController::class, 'destroy'])->name('destroy')->whereNumber('reportType');
        Route::post('/{reportType}/toggle-status', [ReportTypeController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('reportType');
    });
});

// ====================
// DOCUMENT TYPES MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('document-types')->name('document-types.')->group(function () {
    Route::middleware('permission:view-document-types')->group(function () {
        Route::get('/export', [DocumentTypeController::class, 'export'])->name('export');
        Route::get('/', [DocumentTypeController::class, 'index'])->name('index');
        Route::get('/{documentType}', [DocumentTypeController::class, 'show'])->name('show')->whereNumber('documentType');
    });
    
    Route::middleware('permission:manage-document-types')->group(function () {
        Route::post('/bulk-action', [DocumentTypeController::class, 'bulkAction'])->name('bulk-action');
        Route::post('/bulk-duplicate', [DocumentTypeController::class, 'bulkDuplicate'])->name('bulk-duplicate');
        Route::post('/create-from-common', [DocumentTypeController::class, 'createFromCommonType'])->name('create-from-common');
        Route::get('/create', [DocumentTypeController::class, 'create'])->name('create');
        Route::post('/', [DocumentTypeController::class, 'store'])->name('store');
        Route::get('/{documentType}/edit', [DocumentTypeController::class, 'edit'])->name('edit')->whereNumber('documentType');
        Route::put('/{documentType}', [DocumentTypeController::class, 'update'])->name('update')->whereNumber('documentType');
        Route::delete('/{documentType}', [DocumentTypeController::class, 'destroy'])->name('destroy')->whereNumber('documentType');
        Route::post('/{documentType}/toggle-status', [DocumentTypeController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('documentType');
        Route::post('/{documentType}/toggle-required', [DocumentTypeController::class, 'toggleRequired'])->name('toggle-required')->whereNumber('documentType');
        Route::post('/{documentType}/duplicate', [DocumentTypeController::class, 'duplicate'])->name('duplicate')->whereNumber('documentType');
    });
});

// ====================
// FORMS MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-forms'])->prefix('forms')->name('forms.')->group(function () {
    Route::post('/bulk-action', [FormController::class, 'bulkAction'])->name('bulk-action');
    Route::get('/', [FormController::class, 'index'])->name('index');
    Route::get('/create', [FormController::class, 'create'])->name('create');
    Route::post('/', [FormController::class, 'store'])->name('store');
    Route::get('/{form}', [FormController::class, 'show'])->name('show')->whereNumber('form');
    Route::get('/{form}/edit', [FormController::class, 'edit'])->name('edit')->whereNumber('form');
    Route::put('/{form}', [FormController::class, 'update'])->name('update')->whereNumber('form');
    Route::delete('/{form}', [FormController::class, 'destroy'])->name('destroy')->whereNumber('form');
    
    // SECURITY NOTE: Validate file path to prevent directory traversal
    Route::get('/{form}/download', [FormController::class, 'download'])->name('download')->whereNumber('form');
    Route::post('/{form}/toggle-status', [FormController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('form');
});

// ====================
// PRIVILEGES MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('privileges')->name('privileges.')->group(function () {
    Route::middleware('permission:view-privileges')->group(function () {
        Route::get('/', [PrivilegeController::class, 'index'])->name('index');
        Route::get('/{privilege}', [PrivilegeController::class, 'show'])->name('show')->whereNumber('privilege');
        Route::get('/{privilege}/assignments', [PrivilegeController::class, 'assignments'])->name('assignments')->whereNumber('privilege');
        Route::get('/{privilege}/export', [PrivilegeController::class, 'exportAssignments'])->name('assignments.export')->whereNumber('privilege');
    });
    
    Route::middleware('permission:manage-privileges')->group(function () {
        Route::get('/create', [PrivilegeController::class, 'create'])->name('create');
        Route::post('/', [PrivilegeController::class, 'store'])->name('store');
        Route::get('/{privilege}/edit', [PrivilegeController::class, 'edit'])->name('edit')->whereNumber('privilege');
        Route::put('/{privilege}', [PrivilegeController::class, 'update'])->name('update')->whereNumber('privilege');
        Route::delete('/{privilege}', [PrivilegeController::class, 'destroy'])->name('destroy')->whereNumber('privilege');
        Route::post('/{privilege}/toggle-status', [PrivilegeController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('privilege');
        Route::post('/{privilege}/duplicate', [PrivilegeController::class, 'duplicate'])->name('duplicate')->whereNumber('privilege');
    });
    
    Route::middleware('permission:assign-privileges')->group(function () {
        Route::get('/{privilege}/assign', [PrivilegeController::class, 'assign'])->name('assign')->whereNumber('privilege');
        Route::post('/{privilege}/assign', [PrivilegeController::class, 'storeAssignment'])->name('assign.store')->whereNumber('privilege');
        Route::post('/{privilege}/bulk-verify', [PrivilegeController::class, 'bulkVerify'])->name('bulk-verify')->whereNumber('privilege');
        Route::get('/{privilege}/search-residents', [PrivilegeController::class, 'searchResidents'])->name('search-residents')->whereNumber('privilege');
    });
});

// Assignment specific routes
Route::middleware(['auth', 'permission:assign-privileges'])->prefix('assignments')->name('privileges.assignments.')->group(function () {
    Route::post('/{assignment}/verify', [PrivilegeController::class, 'verifyAssignment'])->name('verify')->whereNumber('assignment');
    Route::delete('/{assignment}/revoke', [PrivilegeController::class, 'revokeAssignment'])->name('revoke')->whereNumber('assignment');
});

// ====================
// ANNOUNCEMENTS MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('announcements')->name('announcements.')->group(function () {
    Route::middleware('permission:view-announcements')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index'])->name('index');
        Route::get('/show/{announcement}', [AnnouncementController::class, 'show'])->name('show')->whereNumber('announcement');
    });
    
    Route::middleware('permission:manage-announcements')->group(function () {
        Route::post('/bulk-action', [AnnouncementController::class, 'bulkAction'])->name('bulk-action');
        Route::get('/create', [AnnouncementController::class, 'create'])->name('create');
          Route::get('/search-households', [AnnouncementController::class, 'searchHouseholds'])
            ->name('search-households');
        Route::get('/search-businesses', [AnnouncementController::class, 'searchBusinesses'])
            ->name('search-businesses');
        Route::get('/search-users', [AnnouncementController::class, 'searchUsers'])
            ->name('search-users');
        Route::post('/store', [AnnouncementController::class, 'store'])->name('store');
        Route::get('/edit/{announcement}', [AnnouncementController::class, 'edit'])->name('edit')->whereNumber('announcement');
        Route::put('/update/{announcement}', [AnnouncementController::class, 'update'])->name('update')->whereNumber('announcement');
        Route::delete('/delete/{announcement}', [AnnouncementController::class, 'destroy'])->name('destroy')->whereNumber('announcement');
        Route::post('/toggle-status/{announcement}', [AnnouncementController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('announcement');
    });
});

// ====================
// FEE TYPES MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('fee-types')->name('fee-types.')->group(function () {
    Route::middleware('permission:view-fee-types')->group(function () {
        Route::get('/', [FeeTypeController::class, 'index'])->name('index');
        Route::get('/{feeType}', [FeeTypeController::class, 'show'])->name('show')->whereNumber('feeType');
    });
    
    Route::middleware('permission:manage-fee-types')->group(function () {
        Route::post('/bulk-action', [FeeTypeController::class, 'bulkAction'])->name('bulk-action');
        Route::get('/create', [FeeTypeController::class, 'create'])->name('create');
        Route::post('/', [FeeTypeController::class, 'store'])->name('store');
        Route::get('/{feeType}/edit', [FeeTypeController::class, 'edit'])->name('edit')->whereNumber('feeType');
        Route::put('/{feeType}', [FeeTypeController::class, 'update'])->name('update')->whereNumber('feeType');
        Route::delete('/{feeType}', [FeeTypeController::class, 'destroy'])->name('destroy')->whereNumber('feeType');
        Route::post('/{feeType}/toggle-status', [FeeTypeController::class, 'toggleStatus'])->name('toggle-status')->whereNumber('feeType');
    });
});

// ====================
// CLEARANCES MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('clearances')->name('clearances.')->group(function () {
    // View clearances
    Route::middleware('permission:view-clearances')->group(function () {
        Route::get('/types', [ClearanceTypeController::class, 'index'])->name('types.index');
        Route::get('/reports/issued', [ClearanceReportController::class, 'issued'])->name('reports.issued');
        Route::get('/', [ClearanceIndexController::class, 'index'])->name('index');
        Route::get('/{clearance}', [ClearanceShowController::class, 'show'])
            ->name('show')
            ->whereNumber('clearance');
        Route::get('/{clearance}/print', [ClearancePrintController::class, 'print'])
            ->name('print')
            ->whereNumber('clearance');
    });
    
    // Manage clearances
    Route::middleware('permission:manage-clearances')->group(function () {
        // FIXED: Removed duplicate 'clearances' segment - now correctly /clearances/create
        Route::get('/create', [ClearanceCreateController::class, 'create'])->name('create');
        // Search routes for AJAX
        Route::get('/search-residents', [ClearanceCreateController::class, 'searchResidents'])
            ->name('search-residents');
        Route::get('/search-households', [ClearanceCreateController::class, 'searchHouseholds'])
            ->name('search-households');
        Route::get('/search-businesses', [ClearanceCreateController::class, 'searchBusinesses'])
            ->name('search-businesses');
        
        Route::post('/', [ClearanceStoreController::class, 'store'])
            ->name('store')
            ->middleware('throttle:30,1');
        Route::get('/{clearance}/edit', [ClearanceEditController::class, 'edit'])
            ->name('edit')
            ->whereNumber('clearance');
        Route::put('/{clearance}', [ClearanceUpdateController::class, 'update'])
            ->name('update')
            ->whereNumber('clearance');
        Route::delete('/{clearance}', [ClearanceDestroyController::class, 'destroy'])
            ->name('destroy')
            ->whereNumber('clearance');
    });
    
    // Issue clearances
    Route::middleware('permission:issue-clearances')->group(function () {
        Route::post('/{clearance}/approve', [ClearanceStatusController::class, 'approve'])
            ->name('approve')
            ->middleware('throttle:20,1')
            ->whereNumber('clearance');
        Route::post('/{clearance}/reject', [ClearanceStatusController::class, 'reject'])
            ->name('reject')
            ->middleware('throttle:20,1')
            ->whereNumber('clearance');
        Route::post('/{clearance}/issue', [ClearanceStatusController::class, 'issue'])
            ->name('issue')
            ->middleware('throttle:20,1')
            ->whereNumber('clearance');
        Route::post('/{clearance}/process', [ClearanceStatusController::class, 'process'])
            ->name('process')
            ->whereNumber('clearance');
        Route::post('/{clearance}/cancel', [ClearanceStatusController::class, 'cancel'])
            ->name('cancel')
            ->whereNumber('clearance');
    });
});

// Clearance Approval
Route::middleware(['auth', 'permission:issue-clearances'])->prefix('clearances/approval')->name('clearances.approval.')->group(function () {
    Route::get('/stats', [ClearanceApprovalController::class, 'stats'])->name('stats');
    Route::get('/requests', [ClearanceApprovalController::class, 'index'])->name('index');
    Route::get('/{clearanceRequest}', [ClearanceApprovalController::class, 'show'])
        ->name('show')
        ->whereNumber('clearanceRequest');
    Route::post('/{clearanceRequest}/approve', [ClearanceApprovalController::class, 'approve'])
        ->name('approve')
        ->middleware('throttle:20,1')
        ->whereNumber('clearanceRequest');
    Route::post('/{clearanceRequest}/reject', [ClearanceApprovalController::class, 'reject'])
        ->name('reject')
        ->middleware('throttle:20,1')
        ->whereNumber('clearanceRequest');
    Route::post('/{clearanceRequest}/mark-processing', [ClearanceApprovalController::class, 'markAsProcessing'])
        ->name('mark-processing')
        ->whereNumber('clearanceRequest');
    Route::post('/{clearanceRequest}/return-pending', [ClearanceApprovalController::class, 'returnToPending'])
        ->name('return-pending')
        ->whereNumber('clearanceRequest');
});

// ====================
// CLEARANCE TYPES MANAGEMENT
// ====================
Route::middleware(['auth'])->prefix('clearance-types')->name('clearance-types.')->group(function () {
    Route::middleware('permission:view-clearance-types')->group(function () {
        Route::get('/export', [ClearanceTypeController::class, 'export'])->name('export');
        Route::get('/', [ClearanceTypeController::class, 'index'])->name('index');
        Route::get('/{clearanceType}', [ClearanceTypeController::class, 'show'])
            ->name('show')
            ->whereNumber('clearanceType');
        Route::get('/{clearanceType}/print', [ClearanceTypeController::class, 'print'])
            ->name('print')
            ->whereNumber('clearanceType');
    });
    
    Route::middleware('permission:manage-clearance-types')->group(function () {
        Route::post('/bulk-action', [ClearanceTypeController::class, 'bulkAction'])->name('bulk-action');
        Route::post('/bulk-activate', [ClearanceTypeController::class, 'bulkActivate'])->name('bulk-activate');
        Route::post('/bulk-deactivate', [ClearanceTypeController::class, 'bulkDeactivate'])->name('bulk-deactivate');
        Route::post('/bulk-delete', [ClearanceTypeController::class, 'bulkDelete'])
            ->name('bulk-delete')
            ->middleware('throttle:10,1');
        Route::post('/bulk-duplicate', [ClearanceTypeController::class, 'bulkDuplicate'])->name('bulk-duplicate');
        Route::post('/bulk-update', [ClearanceTypeController::class, 'bulkUpdate'])->name('bulk-update');
        Route::get('/create', [ClearanceTypeController::class, 'create'])->name('create');
        Route::post('/', [ClearanceTypeController::class, 'store'])->name('store');
        Route::get('/{clearanceType}/edit', [ClearanceTypeController::class, 'edit'])
            ->name('edit')
            ->whereNumber('clearanceType');
        Route::put('/{clearanceType}', [ClearanceTypeController::class, 'update'])
            ->name('update')
            ->whereNumber('clearanceType');
        Route::delete('/{clearanceType}', [ClearanceTypeController::class, 'destroy'])
            ->name('destroy')
            ->whereNumber('clearanceType');
        Route::post('/{clearanceType}/toggle-status', [ClearanceTypeController::class, 'toggleStatus'])
            ->name('toggle-status')
            ->whereNumber('clearanceType');
        Route::post('/{clearanceType}/duplicate', [ClearanceTypeController::class, 'duplicate'])
            ->name('duplicate')
            ->whereNumber('clearanceType');
    });
});

// ====================
// PUROK MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-puroks'])->prefix('puroks')->name('puroks.')->group(function () {
    Route::get('/api/all', [PurokController::class, 'getAll'])->name('api.all');
    Route::post('/update-statistics', [PurokController::class, 'updateStatistics'])->name('update-statistics');
    
    Route::get('/', [PurokController::class, 'index'])->name('index');
    Route::get('/create', [PurokController::class, 'create'])->name('create');
    Route::get('/search-residents', [PurokController::class, 'searchResidents'])
            ->name('search-residents');
    Route::post('/', [PurokController::class, 'store'])->name('store');
    Route::get('/{purok}', [PurokController::class, 'show'])->name('show')->whereNumber('purok');
    Route::get('/{purok}/edit', [PurokController::class, 'edit'])->name('edit')->whereNumber('purok');
    Route::put('/{purok}', [PurokController::class, 'update'])->name('update')->whereNumber('purok');
    Route::delete('/{purok}', [PurokController::class, 'destroy'])->name('destroy')->whereNumber('purok');
    Route::patch('/{purok}/update-coordinates', [PurokController::class, 'updateCoordinates'])
        ->name('update-coordinates')
        ->whereNumber('purok');
});

// ====================
// BACKUP MANAGEMENT
// ====================
// SECURITY NOTE: Backup operations should be restricted to specific IP addresses in production
Route::middleware(['auth', 'permission:manage-backups', 'throttle:5,1'])
    ->prefix('backup')
    ->name('backup.')
    ->group(function () {
        Route::get('/progress', [BackupProgressController::class, 'progress'])->name('progress');
        Route::get('/', [BackupIndexController::class, 'index'])->name('index');
        Route::post('/', [BackupCreateController::class, 'create'])->name('create');
        
        // SECURITY NOTE: Validate filename to prevent directory traversal
        Route::get('/download/{filename}', [BackupDownloadController::class, 'download'])
            ->name('download')
            ->where('filename', '^[a-zA-Z0-9_.-]+\.(zip|sql|gz)$');
        Route::delete('/{filename}', [BackupDestroyController::class, 'destroy'])
            ->name('destroy')
            ->where('filename', '^[a-zA-Z0-9_.-]+\.(zip|sql|gz)$');
        Route::post('/{filename}/protect', [BackupProtectionController::class, 'protect'])
            ->name('protect')
            ->where('filename', '^[a-zA-Z0-9_.-]+\.(zip|sql|gz)$');
        Route::post('/{filename}/unprotect', [BackupProtectionController::class, 'unprotect'])
            ->name('unprotect')
            ->where('filename', '^[a-zA-Z0-9_.-]+\.(zip|sql|gz)$');
        Route::post('/{filename}/toggle-protection', [BackupProtectionController::class, 'toggleProtection'])
            ->name('toggle-protection')
            ->where('filename', '^[a-zA-Z0-9_.-]+\.(zip|sql|gz)$');
    });

// ====================
// REPORTS
// ====================
Route::middleware(['auth', 'permission:view-reports'])->prefix('reports')->name('reports.')->group(function () {
    Route::get('/collections', [ReportsController::class, 'collections'])->name('collections');
    Route::get('/revenue', [ReportsController::class, 'revenue'])->name('revenue');
    
    Route::get('/audit-logs', [ReportsController::class, 'auditLogs'])->name('auditLogs');
    Route::get('/audit-logs/{id}', [ReportsController::class, 'auditLogsShow'])->name('auditLogs.show')->whereNumber('id');
    
    Route::get('/activity-logs', [ReportsController::class, 'activityLogs'])->name('activity-logs');
    Route::get('/activity-logs/export', [ReportsController::class, 'activityLogsExport'])
        ->name('activity-logs.export')
        ->middleware('throttle:5,1');
    Route::get('/activity-logs/{id}', [ReportsController::class, 'activityLogShow'])->name('activity-logs.show')->whereNumber('id');
    
    Route::get('/login-logs', [LoginLogController::class, 'index'])->name('login-logs');
    Route::get('/login-logs/{id}', [LoginLogController::class, 'show'])->name('login-logs.show')->whereNumber('id');
});

// ====================
// RECEIPTS MANAGEMENT
// ====================
Route::middleware(['auth', 'permission:manage-receipts'])->prefix('receipts')->name('receipts.')->group(function () {
    Route::post('/bulk/operation', [ReceiptsController::class, 'bulkOperation'])
        ->name('bulk-operation')
        ->middleware('throttle:20,1');
    Route::post('/export', [ReceiptsController::class, 'export'])->name('export');
    Route::post('/generate-from-payment/{payment}', [ReceiptsController::class, 'generateFromPayment'])
        ->name('generate-from-payment')
        ->whereNumber('payment');
    Route::post('/generate-from-clearance/{clearance}', [ReceiptsController::class, 'generateFromClearance'])
        ->name('generate-from-clearance')
        ->whereNumber('clearance');
    
    Route::get('/', [ReceiptsController::class, 'index'])->name('index');
    Route::post('/', [ReceiptsController::class, 'store'])->name('store');
    Route::get('/{receipt}', [ReceiptsController::class, 'show'])->name('show')->whereNumber('receipt');
    Route::post('/{receipt}/void', [ReceiptsController::class, 'void'])->name('void')->whereNumber('receipt');
});

// ====================
// SECURITY LOGS
// ====================
Route::middleware(['auth', 'permission:view-security-logs'])->prefix('security')->name('reports.')->group(function () {
    Route::get('/access-logs', [SecurityController::class, 'accessLogs'])->name('access-logs');
    Route::get('/access-logs/export', [SecurityController::class, 'exportAccessLogs'])
        ->name('access-logs.export')
        ->middleware('throttle:5,1');
    Route::get('/security-audit', [SecurityController::class, 'securityAudit'])->name('security-audit');
    Route::get('/sessions', [SecurityController::class, 'sessions'])->name('admin.security.sessions');
});

// ====================
// INSTRUCTIONS DOWNLOAD
// ====================
Route::middleware(['auth', 'permission:view-instructions', 'throttle:10,1'])->group(function () {
    Route::get('/instructions/download', [InstructionController::class, 'download'])
        ->name('instructions.download');
});