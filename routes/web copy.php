<?php

use App\Http\Controllers\Admin\LoginLogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\ResidentController;
use App\Http\Controllers\Admin\AdminIncidentController;
use App\Http\Controllers\Admin\OfficialController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\CommitteeController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\HouseholdController;
use App\Http\Controllers\Admin\FeeController;
use App\Http\Controllers\Admin\Fees\FeeCreateController;
use App\Http\Controllers\Admin\Fees\FeeStoreController;
use App\Http\Controllers\Admin\Fees\FeeShowController;
use App\Http\Controllers\Admin\Fees\FeeEditController;
use App\Http\Controllers\Admin\Fees\FeePaymentController;
use App\Http\Controllers\Admin\Fees\FeeTypeController;
use App\Http\Controllers\Admin\ReportTypeController;
use App\Http\Controllers\Admin\DocumentTypeController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\FormController;
use App\Http\Controllers\Admin\ReceiptsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ClearanceController;
use App\Http\Controllers\Admin\ClearanceApprovalController;
use App\Http\Controllers\Admin\ClearanceTypeController;
use App\Http\Controllers\Admin\PurokController;
use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AdminCommunityReportController;
use App\Http\Controllers\Resident\ResidentDashboardController;
use App\Http\Controllers\Resident\ResidentIncidentController;
use App\Http\Controllers\Resident\ResidentPaymentController;
use App\Http\Controllers\Resident\ResidentFeeController;
use App\Http\Controllers\Resident\ResidentClearanceController;
use App\Http\Controllers\Resident\CommunityReportController;
use App\Http\Controllers\Resident\RecordController;
use App\Http\Controllers\Resident\ResidentFormController;
use App\Http\Controllers\Resident\ResidentAnnouncementController;
use App\Http\Controllers\Auth\LoginController;

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


Route::get('/test-access', function () {
    return response()->json([
        'is_authenticated' => auth()->check(),
        'user_id' => auth()->id(),
        'user_email' => auth()->user()?->email,
        'is_admin' => auth()->user()?->is_admin,
        'email_verified' => !is_null(auth()->user()?->email_verified_at),
        'permissions' => auth()->user()?->getAllPermissions()->pluck('name') ?? [],
        'has_manage_fees' => auth()->user()?->hasPermissionTo('manage-fees'),
        'middleware_passed' => 'Direct access without middleware'
    ]);
});
// Guest routes (not logged in)
Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store']);
});

// Authenticated routes (logged in)
Route::middleware('auth')->group(function () {
    Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('password/change', [LoginController::class, 'showChangeForm'])
        ->name('password.change');

    Route::post('password/change', [LoginController::class, 'changePassword'])
        ->name('password.change.post');

});

/*
|--------------------------------------------------------------------------
| Admin Routes (ALL PROTECTED WITH PERMISSIONS)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'admin'])->group(function () {

    // ====================
    // DASHBOARD
    // ====================
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:view-dashboard')
        ->name('dashboard');

    // ====================
    // USER MANAGEMENT
    // ====================
    Route::middleware('permission:manage-users')->group(function () {
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('/create', [UserController::class, 'create'])->name('create');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::get('/{user}', [UserController::class, 'show'])->name('show');
            Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
            Route::put('/{user}', [UserController::class, 'update'])->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');

            // Additional user routes
            Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
            Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('toggle-status');
            Route::post('/{user}/update-permissions', [UserController::class, 'updatePermissions'])->name('update-permissions');
        });
    });

    // ====================
    // ROLES & PERMISSIONS
    // ====================
    Route::middleware('permission:manage-roles')->group(function () {
        Route::prefix('roles')->name('roles.')->group(function () {
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
            // Role Permissions Management
            Route::get('/{role}/permissions', [RoleController::class, 'permissions'])->name('permissions');
            Route::put('/{role}/permissions/update', [RoleController::class, 'updatePermissions'])->name('permissions.update');

            // Role Users
            Route::get('/{role}/users', [RoleController::class, 'users'])->name('users');
        });
    });


    Route::middleware('permission:manage-role-permissions')->group(function () {
        Route::prefix('role-permissions')->name('role-permissions.')->group(function () {
            // Basic CRUD
            Route::get('/', [RolePermissionController::class, 'index'])->name('index');
            Route::get('/create', [RolePermissionController::class, 'create'])->name('create');
            Route::post('/', [RolePermissionController::class, 'store'])->name('store');
            Route::get('/{role_permission}', [RolePermissionController::class, 'show'])->name('show');
            Route::delete('/{role_permission}', [RolePermissionController::class, 'destroy'])->name('destroy');

            // Bulk Actions
            Route::post('/bulk-revoke', [RolePermissionController::class, 'bulkRevoke'])->name('bulk-revoke');

            // Export
            Route::get('/export', [RolePermissionController::class, 'export'])->name('export');
        });
    });

    Route::middleware('permission:manage-permissions')->group(function () {
        Route::prefix('permissions')->name('permissions.')->group(function () {
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
    });

    // ====================
    // INCIDENT MANAGEMENT (NEW FEATURE)
    // ====================

    // View incidents (for kagawads, secretary, etc.)
    Route::middleware('permission:view-incidents')->group(function () {
        Route::prefix('incidents')->group(function () {
            // All incidents
            Route::get('/', [AdminIncidentController::class, 'index'])
                ->name('admin.incidents.index');

            // Show specific incident
            Route::get('/{incident}', [AdminIncidentController::class, 'show'])
                ->name('admin.incidents.show');

            // Complaints only (filtered view)
            Route::get('/complaints', [AdminIncidentController::class, 'complaints'])
                ->name('admin.complaints.index');

            // Blotters only (filtered view)
            Route::get('/blotters', [AdminIncidentController::class, 'blotters'])
                ->name('admin.blotters.index');
        });
    });

    // Full incident management (for secretary, admin, captain)
    Route::middleware('permission:manage-incidents')->group(function () {
        Route::prefix('incidents')->group(function () {
            // Create new incident (admin can file on behalf)
            Route::get('/create', [AdminIncidentController::class, 'create'])
                ->name('admin.incidents.create');

            // Update incident status
            Route::patch('/{incident}/status', [AdminIncidentController::class, 'updateStatus'])
                ->name('admin.incidents.update-status');

            // Update incident details
            Route::patch('/{incident}', [AdminIncidentController::class, 'update'])
                ->name('admin.incidents.update');

            // Delete incident
            Route::delete('/{incident}', [AdminIncidentController::class, 'destroy'])
                ->name('admin.incidents.destroy');
        });

        // Blotter-specific management
        Route::middleware('permission:manage-blotters')->group(function () {
            Route::prefix('blotters')->group(function () {
                // Update blotter-specific details
                Route::patch('/{incident}/details', [AdminIncidentController::class, 'updateBlotterDetails'])
                    ->name('admin.blotters.update-details');
            });
        });

        // Complaint-specific management
        Route::middleware('permission:manage-complaints')->group(function () {
            Route::prefix('complaints')->group(function () {
                // Create complaint
                Route::get('/create', [AdminIncidentController::class, 'createComplaint'])
                    ->name('admin.complaints.create');
            });
        });
    });

    // Review incidents (for designated reviewers)
    Route::middleware('permission:review-incidents')->group(function () {
        Route::prefix('incidents')->group(function () {
            // Update incident status
            Route::patch('/{incident}/review-status', [AdminIncidentController::class, 'reviewStatus'])
                ->name('admin.incidents.review-status');
        });
    });


    // ====================
    // RESIDENT MANAGEMENT
    // ====================
    Route::middleware('permission:manage-residents')->group(function () {
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
    });

    // ====================
    // OFFICIALS MANAGEMENT
    // ====================
    Route::middleware('permission:manage-officials')->group(function () {
        Route::prefix('officials')->name('admin/officials.')->group(function () {
            Route::get('/', [OfficialController::class, 'index'])->name('index');
            Route::get('/create', [OfficialController::class, 'create'])->name('create');
            Route::post('/', [OfficialController::class, 'store'])->name('store');
            Route::get('/{official}', [OfficialController::class, 'show'])->name('show');
            Route::get('/{official}/edit', [OfficialController::class, 'edit'])->name('edit');
            Route::put('/{official}', [OfficialController::class, 'update'])->name('update');
            Route::delete('/{official}', [OfficialController::class, 'destroy'])->name('destroy');

            // Additional routes
            Route::get('/current', [OfficialController::class, 'currentOfficials'])->name('current');
            Route::get('/committee/{committee}', [OfficialController::class, 'byCommittee'])->name('committee');
            Route::post('/update-order', [OfficialController::class, 'updateOrder'])->name('update-order');

            // Bulk actions
            Route::post('/export', [OfficialController::class, 'export'])->name('export');
            Route::post('/bulk-delete', [OfficialController::class, 'bulkDelete'])->name('bulk.delete');
            Route::post('/bulk-update-status', [OfficialController::class, 'bulkUpdateStatus'])->name('bulk.update-status');
        });
    });

    // ====================
    // COMMITTEES MANAGEMENT
    // ====================
    Route::middleware('permission:manage-committees')->group(function () {
        Route::prefix('committees')->name('committees.')->group(function () {
            Route::get('/', [CommitteeController::class, 'index'])->name('index');
            Route::get('/create', [CommitteeController::class, 'create'])->name('committees.create');
            Route::post('', [CommitteeController::class, 'store'])->name('committees.store');
            Route::get('/{committee}', [CommitteeController::class, 'show'])->name('committees.show');
            Route::get('/{committee}/edit', [CommitteeController::class, 'edit'])->name('committees.edit');
            Route::put('/{committee}', [CommitteeController::class, 'update'])->name('committees.update');
            Route::delete('/{committee}', [CommitteeController::class, 'destroy'])->name('committees.destroy');

            // Bulk actions
            Route::post('/bulk-activate', [CommitteeController::class, 'bulkActivate'])->name('committees.bulk-activate');
            Route::post('/bulk-deactivate', [CommitteeController::class, 'bulkDeactivate'])->name('committees.bulk-deactivate');
            Route::post('/bulk-delete', [CommitteeController::class, 'bulkDelete'])->name('committees.bulk-delete');
            Route::get('/export', [CommitteeController::class, 'export'])->name('committees.export');
        });
    });

    // ====================
    // POSITIONS MANAGEMENT
    // ====================
    Route::middleware('permission:manage-positions')->group(function () {
        Route::prefix('positions')->name('positions.')->group(function () {
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
    });

    // ====================
    // HOUSEHOLDS MANAGEMENT
    // ====================
    Route::middleware('permission:manage-households')->group(function () {
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
    });

    // ====================
    // PAYMENTS MANAGEMENT
    // ====================
    // View payments (for kagawads, secretary, etc.)
    Route::middleware('permission:view-payments')->group(function () {
        Route::prefix('payments')->group(function () {
            Route::get('/', [PaymentController::class, 'index'])->name('payments.index');
            Route::get('/{payment}', [PaymentController::class, 'show'])->name('admin.payments.show');
        });
    });

Route::middleware('permission:manage-payments')->group(function () {
    Route::prefix('payments')->group(function () {
    Route::get('/payments/create', [PaymentController::class, 'create'])->name('payments.create');
        Route::post('/', [PaymentController::class, 'store'])->name('payments.store');
        Route::get('/{payment}/edit', [PaymentController::class, 'edit'])->name('payments.edit');
        Route::put('/{payment}', [PaymentController::class, 'update'])->name('payments.update');
        Route::delete('/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
        // FIX THIS LINE - remove the extra /payments
        Route::get('/{payment}/receipt', [PaymentController::class, 'printReceipt'])->name('payments.receipt');
    });
});


    // ====================
    // FEES MANAGEMENT
    // ====================
    // View fees (for kagawads, secretary, etc.)
    Route::middleware('permission:view-fees')->group(function () {
        Route::prefix('fees')->group(function () {
            Route::get('/', [FeeController::class, 'index'])->name('fees.index');
            Route::get('/{fee}', [FeeShowController::class, 'show'])->name('admin.fees.show');
        });
    });

    // Full fee management (for treasurer, admin, captain)
    Route::middleware('permission:manage-fees')->group(function () {
        Route::prefix('fees')->group(function () {
            // Create
            Route::get('/fees/create', [FeeCreateController::class, 'create'])->name('fees.create');
            Route::post('/', [FeeStoreController::class, 'store'])->name('fees.store');
            
            // Edit and update
            Route::get('/{fee}/edit', [FeeEditController::class, 'edit'])->name('fees.edit');
            Route::put('/{fee}', [FeeEditController::class, 'update'])->name('fees.update');
            Route::delete('/{fee}', [FeeEditController::class, 'destroy'])->name('fees.destroy');
            
            // Show and print
            Route::get('/{fee}', [FeeShowController::class, 'show'])->name('admin.fees.show');
            Route::get('/{fee}/print/{type?}', [FeeShowController::class, 'print'])->name('fees.print');
            
            // Payment actions
            Route::post('/{fee}/record-payment', [FeePaymentController::class, 'recordPayment'])->name('record-payment');
            Route::post('/{fee}/waive', [FeePaymentController::class, 'waive'])->name('waive');
            
            // Cancel
            Route::post('/{fee}/cancel', [FeeEditController::class, 'cancel'])->name('cancel');
            
            // Other fee routes from main controller
            Route::get('/outstanding', [FeeController::class, 'outstanding'])->name('fees.outstanding');
            Route::get('/export', [FeeController::class, 'export'])->name('export');
            Route::post('/bulk-action', [FeePaymentController::class, 'bulkAction'])->name('bulk-action');
        });
        
        // Statistics and charts (from main controller)
        Route::prefix('fees')->group(function () {
            Route::get('/quick-stats', [FeeController::class, 'quickStats'])->name('fees.quickStats');
            Route::get('/status-chart', [FeeController::class, 'statusChartData'])->name('fees.statusChart');
            Route::get('/monthly-collection-chart', [FeeController::class, 'monthlyCollectionChart'])->name('fees.monthlyCollectionChart');
            Route::get('/dashboard', [FeeController::class, 'dashboard'])->name('fees.dashboard');
        });
    });

    // ====================
    // Community MANAGEMENT
    // ====================
    Route::middleware('permission:view-reports')->group(function () {
        Route::prefix('admin/community-reports')->group(function () {
            Route::get('/', [AdminCommunityReportController::class, 'index'])->name('admin.community-reports.index');
            Route::get('/{report}', [AdminCommunityReportController::class, 'show'])->name('admin.community-reports.show');
            Route::get('/{report}/print', [AdminCommunityReportController::class, 'print'])->name('admin.community-reports.print');
            Route::get('/{report}/pdf', [AdminCommunityReportController::class, 'pdf'])->name('admin.community-reports.pdf');
            Route::get('/{report}/related', [AdminCommunityReportController::class, 'related'])->name('admin.community-reports.related');

            // Export routes
            Route::get('/export', [AdminCommunityReportController::class, 'export'])->name('admin.community-reports.export');
        });
    });

    // Full report management (for secretary, admin, captain)
    Route::middleware('permission:manage-reports')->group(function () {
        Route::prefix('admin/community-reports')->group(function () {
            // Create
            Route::get('/create', [AdminCommunityReportController::class, 'create'])->name('admin.community-reports.create');
            Route::post('/', [AdminCommunityReportController::class, 'store'])->name('admin.community-reports.store');

            // Edit
            Route::get('/{report}/edit', [AdminCommunityReportController::class, 'edit'])->name('admin.community-reports.edit');
            Route::put('/{report}', [AdminCommunityReportController::class, 'update'])->name('admin.community-reports.update');

            // Delete
            Route::delete('/{report}', [AdminCommunityReportController::class, 'destroy'])->name('admin.community-reports.destroy');

            // Bulk operations
            Route::post('/bulk-action', [AdminCommunityReportController::class, 'bulkAction'])->name('admin.community-reports.bulk-action');

            // Evidence management
            Route::post('/{report}/upload-evidence', [AdminCommunityReportController::class, 'uploadEvidence'])->name('admin.community-reports.upload-evidence');
            Route::delete('/{report}/evidence/{evidence}', [AdminCommunityReportController::class, 'removeEvidence'])->name('admin.community-reports.remove-evidence');

            // Response management
            Route::post('/{report}/send-response', [AdminCommunityReportController::class, 'sendResponse'])->name('admin.community-reports.send-response');

            // Statistics
            Route::get('/statistics', [AdminCommunityReportController::class, 'statistics'])->name('admin.community-reports.statistics');
            Route::get('/dashboard-stats', [AdminCommunityReportController::class, 'dashboardStats'])->name('admin.community-reports.dashboard-stats');
        });
    });


    // ====================
    // REPORT TYPES MANAGEMENT
    // ====================
    // View report types (for kagawads, secretary, etc.)
    Route::middleware('permission:view-report-types')->group(function () {
        Route::prefix('report-types')->group(function () {
            Route::get('/', [ReportTypeController::class, 'index'])->name('report-types.index');
            Route::get('/{reportType}', [ReportTypeController::class, 'show'])->name('report-types.show');
        });
    });

    // Full report type management (for admin, captain)
    Route::middleware('permission:manage-report-types')->group(function () {
        Route::prefix('report-types')->group(function () {
            Route::get('/report-types/create', [ReportTypeController::class, 'create'])->name('report-types.create');
            Route::post('/', [ReportTypeController::class, 'store'])->name('report-types.store');
            Route::get('/{reportType}/edit', [ReportTypeController::class, 'edit'])->name('report-types.edit');
            Route::put('/{reportType}', [ReportTypeController::class, 'update'])->name('report-types.update');
            Route::delete('/{reportType}', [ReportTypeController::class, 'destroy'])->name('report-types.destroy');
            Route::post('/{reportType}/toggle-status', [ReportTypeController::class, 'toggleStatus'])->name('report-types.toggle-status');
            Route::post('/bulk-action', [ReportTypeController::class, 'bulkAction'])->name('report-types.bulk-action');
            Route::post('/create-from-common', [ReportTypeController::class, 'createFromCommonType'])->name('report-types.create-from-common');
        });
    });


    // ====================
    // DOCUMENT TYPES MANAGEMENT
    // ====================
    // View document types (for kagawads, secretary, etc.)
    Route::middleware('permission:view-document-types')->group(function () {
        Route::prefix('document-types')->group(function () {
            Route::get('/', [DocumentTypeController::class, 'index'])->name('document-types.index');
            Route::get('/export', [DocumentTypeController::class, 'export'])->name('document-types.export');
            Route::get('/{documentType}', [DocumentTypeController::class, 'show'])->name('document-types.show');
        });
    });

    // Full document type management (for admin, captain)
    Route::middleware('permission:manage-document-types')->group(function () {
        Route::prefix('document-types')->group(function () {
            Route::get('/create', [DocumentTypeController::class, 'create'])->name('document-types.create');
            Route::post('/', [DocumentTypeController::class, 'store'])->name('document-types.store');
            Route::get('/{documentType}/edit', [DocumentTypeController::class, 'edit'])->name('document-types.edit');
            Route::put('/{documentType}', [DocumentTypeController::class, 'update'])->name('document-types.update');
            Route::delete('/{documentType}', [DocumentTypeController::class, 'destroy'])->name('document-types.destroy');
            Route::post('/{documentType}/toggle-status', [DocumentTypeController::class, 'toggleStatus'])->name('document-types.toggle-status');
            Route::post('/{documentType}/toggle-required', [DocumentTypeController::class, 'toggleRequired'])->name('document-types.toggle-required');
            Route::post('/{documentType}/duplicate', [DocumentTypeController::class, 'duplicate'])->name('document-types.duplicate');
            Route::post('/bulk-action', [DocumentTypeController::class, 'bulkAction'])->name('document-types.bulk-action');
            Route::post('/bulk-duplicate', [DocumentTypeController::class, 'bulkDuplicate'])->name('document-types.bulk-duplicate');
            Route::post('/create-from-common', [DocumentTypeController::class, 'createFromCommonType'])->name('document-types.create-from-common');
        });
    });

    // ====================
    // FORMS MANAGEMENT
    // ====================
    Route::middleware('permission:manage-forms')->group(function () {
        Route::prefix('forms')->name('forms.')->group(function () {
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
    });

    // ====================
    // ANNOUNCEMENTS MANAGEMENT
    // ====================
    // View announcements (for kagawads, residents, etc.)
    Route::middleware('permission:view-announcements')->group(function () {
        Route::prefix('announcements')->group(function () {
            Route::get('/', [AnnouncementController::class, 'index'])->name('announcements.index');
            Route::get('/show/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');
        });
    });

    // Full announcement management (for SK chairman, secretary, admin, captain)
    Route::middleware('permission:manage-announcements')->group(function () {
        Route::prefix('announcements')->group(function () {
            Route::get('/create', [AnnouncementController::class, 'create'])->name('announcements.create');
            Route::post('/store', [AnnouncementController::class, 'store'])->name('announcements.store');
            Route::get('/edit/{announcement}', [AnnouncementController::class, 'edit'])->name('announcements.edit');
            Route::put('/update/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
            Route::delete('/delete/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

            Route::post('/bulk-action', [AnnouncementController::class, 'bulkAction'])->name('announcements.bulk-action');
            Route::post('/toggle-status/{announcement}', [AnnouncementController::class, 'toggleStatus'])->name('announcements.toggle-status');
        });
    });

    // ====================
    // FEE TYPES MANAGEMENT
    // ====================
    // View fee types (for kagawads, secretary, etc.)
    Route::middleware('permission:view-fee-types')->group(function () {
        Route::prefix('fee-types')->group(function () {
            Route::get('/', [FeeTypeController::class, 'index'])->name('fee-types.index');
            Route::get('/{feeType}', [FeeTypeController::class, 'show'])->name('fee-types.show');
        });
    });

        // Fee Types routes with permission check
        Route::middleware('permission:manage-fee-types')->group(function () {
            Route::prefix('fee-types')->name('fee-types.')->group(function () {
                Route::get('/fee-types/create', [FeeTypeController::class, 'create'])->name('create');
                Route::post('/', [FeeTypeController::class, 'store'])->name('store');
                Route::get('/{feeType}/edit', [FeeTypeController::class, 'edit'])->name('edit');
                Route::put('/{feeType}', [FeeTypeController::class, 'update'])->name('update');
                Route::delete('/{feeType}', [FeeTypeController::class, 'destroy'])->name('destroy');
                Route::post('/{feeType}/toggle-status', [FeeTypeController::class, 'toggleStatus'])->name('toggle-status');
                Route::post('/bulk-action', [FeeTypeController::class, 'bulkAction'])->name('bulk-action');
            });
        });

    // ====================
    // CLEARANCES MANAGEMENT
    // ====================
    // View clearances (for kagawads, treasurer, etc.)
    Route::middleware('permission:view-clearances')->group(function () {
        Route::prefix('clearances')->name('clearances.')->group(function () {
            Route::get('/', [ClearanceController::class, 'index'])->name('index');
            Route::get('/{clearance}', [ClearanceController::class, 'show'])->name('show');
            Route::get('/{clearance}/print', [ClearanceController::class, 'print'])->name('print');
            Route::get('/types', [ClearanceController::class, 'types'])->name('types.index');
            Route::get('/reports/issued', [ClearanceController::class, 'issuedReport'])->name('reports.issued');
        });
    });

    // Full clearance management (for secretary, admin, captain)
    Route::middleware('permission:manage-clearances')->group(function () {
        Route::prefix('clearances')->name('clearances.')->group(function () {
            Route::get('/clearances/create', [ClearanceController::class, 'create'])->name('create');
            Route::post('/', [ClearanceController::class, 'store'])->name('store');
            Route::get('/{clearance}/edit', [ClearanceController::class, 'edit'])->name('edit');
            Route::put('/{clearance}', [ClearanceController::class, 'update'])->name('update');
            Route::delete('/{clearance}', [ClearanceController::class, 'destroy'])->name('destroy');
        });

        Route::middleware('permission:issue-clearances')->group(function () {
            Route::prefix('clearances')->group(function () {
                Route::post('/{clearance}/approve', [ClearanceController::class, 'approve'])->name('approve');
                Route::post('/{clearance}/reject', [ClearanceController::class, 'reject'])->name('reject');
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
        });
    });

    // ====================
    // CLEARANCE TYPES MANAGEMENT
    // ====================
    // View clearance types (for kagawads, etc.)
    Route::middleware('permission:view-clearance-types')->group(function () {
        Route::prefix('clearance-types')->name('clearance-types.')->group(function () {
            Route::get('/', [ClearanceTypeController::class, 'index'])->name('index');
            Route::get('/{clearanceType}', [ClearanceTypeController::class, 'show'])->name('show');
            Route::get('/export', [ClearanceTypeController::class, 'export'])->name('export');
            Route::get('/{clearanceType}/print', [ClearanceTypeController::class, 'print'])->name('print');
        });
    });

    // Full clearance type management (for secretary, admin, captain)
    Route::middleware('permission:manage-clearance-types')->group(function () {
        Route::prefix('clearance-types')->name('clearance-types.')->group(function () {
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
    });

    // ====================
    // PUROK MANAGEMENT
    // ====================
    Route::middleware('permission:manage-puroks')->group(function () {
        Route::prefix('puroks')->name('puroks.')->group(function () {
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
    });

    // ====================
    // BACKUP MANAGEMENT
    // ====================
    Route::middleware('permission:manage-backups')->group(function () {
        Route::prefix('backup')->name('backup.')->group(function () {
            Route::get('/', [BackupController::class, 'index'])->name('index');
            Route::post('/backup', [BackupController::class, 'create'])->name('create');
            Route::get('/download/{filename}', [BackupController::class, 'download'])->name('download');
            Route::delete('/{filename}', [BackupController::class, 'destroy'])->name('destroy');
        });
    });

    // ====================
    // REPORTS
    // ====================
    Route::middleware('permission:view-reports')->group(function () {
        Route::get('/reports/collections', [ReportsController::class, 'collections'])->name('reports.collections');
        Route::get('/reports/revenue', [ReportsController::class, 'revenue'])->name('reports.revenue');
        Route::get('/reports/audit-logs', [ReportsController::class, 'auditLogs'])->name('reports.auditLogs');
        Route::get('/reports/activity-logs', [ReportsController::class, 'activityLogs'])->name('reports.activity-logs');
        Route::get('/reports/activity-logs/export', [ReportsController::class, 'activityLogsExport'])->name('reports.activity-logs.export');
        Route::get('/reports/activity-logs/{id}', [ReportsController::class, 'activityLogShow'])->name('reports.activity-logs.show');
        Route::get('/reports/login-logs', [LoginLogController::class, 'index'])->name('reports.login-logs');
        Route::get('/reports/login-logs/{id}', [LoginLogController::class, 'show'])->name('reports.login-logs.show');

        // Receipts Management
        Route::get('/receipts', [ReceiptsController::class, 'index'])->name('receipts.index');
        Route::get('/receipts/generate', [ReceiptsController::class, 'create'])->name('receipts.create');
    });

    // ====================
    // SECURITY LOGS
    // ====================
    Route::middleware('permission:view-security-logs')->group(function () {
        Route::get('/security/access-logs', [SecurityController::class, 'accessLogs'])->name('reports.access-logs');
        Route::get('/security/access-logs/export', [SecurityController::class, 'exportAccessLogs'])->name('reports.access-logs.export');
        Route::get('/security/security-audit', [SecurityController::class, 'securityAudit'])->name('reports.security-audit');
        Route::get('/security/sessions', [SecurityController::class, 'sessions'])->name('admin.security.sessions');
    });
});

/*
|--------------------------------------------------------------------------
| Resident Routes (PROTECTED)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'resident'])->group(function () {

    // Resident Dashboard
    Route::get('/residentdashboard', [ResidentDashboardController::class, 'residentdashboard'])
        ->name('residentdashboard');

    // ====================
    // RESIDENT PAYMENTS
    // ====================
    Route::prefix('my-payments')->name('my.payments.')->group(function () {
        Route::get('/', [ResidentPaymentController::class, 'index'])->name('index');
        Route::get('/pay', [ResidentPaymentController::class, 'create'])->name('create');
        Route::post('/pay', [ResidentPaymentController::class, 'store'])->name('store');
        Route::get('/{payment}', [ResidentPaymentController::class, 'show'])->name('show');
        Route::get('/{payment}/receipt', [ResidentPaymentController::class, 'receipt'])->name('receipt');
        Route::post('/verify', [ResidentPaymentController::class, 'verify'])->name('verify');
        Route::post('/save-payment-method', [ResidentPaymentController::class, 'savePaymentMethod'])->name('save-method');
    });

    // ====================
    // RESIDENT CLEARANCES
    // ====================
    Route::prefix('my-clearances')->name('my.clearances.')->group(function () {
        Route::get('/', [ResidentClearanceController::class, 'index'])->name('index');
        Route::get('/request', [ResidentClearanceController::class, 'create'])->name('create');
        Route::post('/store', [ResidentClearanceController::class, 'store'])->name('store');
        Route::get('/{clearance}', [ResidentClearanceController::class, 'show'])->name('show');
        Route::get('/{clearance}/download', [ResidentClearanceController::class, 'download'])->name('download');
        Route::put('/{clearance}/cancel', [ResidentClearanceController::class, 'cancel'])->name('cancel');
    });


    Route::prefix('community-reports')->name('resident.community-reports.')->group(function () {
        Route::get('/', [CommunityReportController::class, 'index'])->name('index');
        Route::get('/create', [CommunityReportController::class, 'create'])->name('create');
        Route::post('/', [CommunityReportController::class, 'store'])->name('store');
        Route::get('/{communityReport}', [CommunityReportController::class, 'show'])->name('show');
        Route::put('/{communityReport}', [CommunityReportController::class, 'update'])->name('update');
        Route::delete('/{communityReport}', [CommunityReportController::class, 'destroy'])->name('destroy');

        // Evidence management
        Route::post('/{communityReport}/evidence', [CommunityReportController::class, 'addEvidence'])->name('evidence.store');
        Route::delete('/{communityReport}/evidence/{evidence}', [CommunityReportController::class, 'deleteEvidence'])->name('evidence.destroy');
        Route::get('/{communityReport}/evidence/{evidence}/download', [CommunityReportController::class, 'downloadEvidence'])->name('evidence.download');

        // DRAFT ROUTES - ADD THESE
        Route::get('/drafts/check', [CommunityReportController::class, 'checkDraft'])->name('drafts.check');
        Route::post('/drafts', [CommunityReportController::class, 'saveDraft'])->name('drafts.store');
        Route::put('/drafts/{draft}', [CommunityReportController::class, 'updateDraft'])->name('drafts.update');
        Route::delete('/drafts/{draft}', [CommunityReportController::class, 'deleteDraft'])->name('drafts.destroy');

        // Draft file management
        Route::delete('/drafts/files/{file}', [CommunityReportController::class, 'deleteDraftFile'])->name('drafts.files.destroy');
    });


    // ====================
    // RESIDENT INCIDENT REPORTS (NEW FEATURE)
    // ====================
    Route::prefix('my-incidents')->name('my.incidents.')->group(function () {
        // List incidents filed by resident
        Route::get('/', [ResidentIncidentController::class, 'index'])
            ->name('index');

        // Create new incident (complaint or blotter)
        Route::get('/create', [ResidentIncidentController::class, 'create'])
            ->name('create');

        // Show specific incident
        Route::get('/{incident}', [ResidentIncidentController::class, 'show'])
            ->name('show');
    });

    // Form submission routes (POST)
    Route::middleware('auth')->group(function () {
        // Resident incident submission
        Route::post('/my-incidents', [ResidentIncidentController::class, 'store'])
            ->middleware('verified', 'resident')
            ->name('my.incidents.store');

        // Admin incident submission
        Route::post('/admin/incidents', [AdminIncidentController::class, 'store'])
            ->middleware('verified', 'admin')
            ->name('admin.incidents.store');

        // Admin incident status update
        Route::patch('/admin/incidents/{incident}/status', [AdminIncidentController::class, 'updateStatus'])
            ->middleware('verified', 'admin', 'permission:manage-incidents')
            ->name('admin.incidents.update-status');

        // Admin blotter details update
        Route::patch('/admin/blotters/{incident}/details', [AdminIncidentController::class, 'updateBlotterDetails'])
            ->middleware('verified', 'admin', 'permission:manage-blotters')
            ->name('admin.blotters.update-details');
    });

    // ====================
    // RESIDENT RECORDS
    // ====================
    Route::prefix('my-records')->name('my.records.')->group(function () {
        Route::get('/', [RecordController::class, 'index'])->name('index');
        Route::post('/filter', [RecordController::class, 'filter'])->name('filter');
        Route::get('/create', [RecordController::class, 'create'])->name('create');
        Route::post('/', [RecordController::class, 'store'])->name('store');
        Route::get('/{record}', [RecordController::class, 'show'])->name('show');
        Route::get('/{record}/download', [RecordController::class, 'download'])->name('download');
        Route::post('/{record}/verify-password', [RecordController::class, 'verifyPassword'])->name('verify-password');
        Route::delete('/{record}', [RecordController::class, 'destroy'])->name('destroy');
        Route::post('/export', [RecordController::class, 'export'])->name('export');
        Route::get('/{id}/preview', [RecordController::class, 'preview'])->name('preview');
        Route::post('/my-records/{document}/extend-session', [RecordController::class, 'extendSession'])
            ->name('documents.extend-session')
            ->middleware('auth');
    });

    // ====================
    // RESIDENT ANNOUNCEMENTS
    // ====================
    Route::prefix('resident-announcements')->name('resident.announcements.')->group(function () {
        Route::get('/', [ResidentAnnouncementController::class, 'index'])->name('index');
        Route::get('/{announcement}', [ResidentAnnouncementController::class, 'show'])->name('show');
        Route::post('/{announcement}/bookmark', [ResidentAnnouncementController::class, 'bookmark'])->name('bookmark');
        Route::post('/subscribe', [ResidentAnnouncementController::class, 'subscribe'])->name('subscribe');
    });

    // ====================
    // RESIDENT FEES
    // ====================
    Route::prefix('residentfees')->name('fees.')->group(function () {
        Route::get('/', [ResidentFeeController::class, 'index'])->name('index');
        Route::get('/{fee}', [ResidentFeeController::class, 'show'])->name('show');
    });

    // ====================
    // RESIDENT FORMS
    // ====================
    Route::prefix('resident-forms')->name('resident.forms.')->group(function () {
        Route::get('/', [ResidentFormController::class, 'index'])->name('index');
        Route::get('/{form}', [ResidentFormController::class, 'show'])->name('show');
        Route::get('/{form}/download', [ResidentFormController::class, 'download'])->name('download');
        Route::post('/submit', [ResidentFormController::class, 'submit'])->name('submit');
        Route::post('/request', [ResidentFormController::class, 'requestForm'])->name('request');
    });
});

/*
|--------------------------------------------------------------------------
| Fallback
|--------------------------------------------------------------------------
*/
Route::fallback(fn() => inertia('Error/404'));

require __DIR__ . '/settings.php';
require __DIR__ . '/residentsettings.php';