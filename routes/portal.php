<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Resident\ResidentDashboardController;
use App\Http\Controllers\Resident\ResidentIncidentController;
use App\Http\Controllers\Resident\ResidentPaymentController;
use App\Http\Controllers\Resident\ResidentReceiptController;
use App\Http\Controllers\Resident\ResidentFeeController;
use App\Http\Controllers\Resident\ResidentClearanceController;
use App\Http\Controllers\Resident\CommunityReportController;
use App\Http\Controllers\Resident\RecordController;
use App\Http\Controllers\Resident\SupportController;
use App\Http\Controllers\Resident\ResidentFormController;
use App\Http\Controllers\Resident\ResidentAnnouncementController;
use App\Http\Controllers\Resident\ResidentNotificationController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Resident Portal Routes
|--------------------------------------------------------------------------
|
| SECURITY NOTE: All routes require authentication and resident role verification.
| Controllers MUST implement additional ownership checks for individual resources.
| Never trust route parameters alone - always verify the authenticated user owns the resource.
|
| LOGIC NOTE: Route order matters - specific routes before parameterized routes.
| All modification operations should use transactions to prevent partial updates.
|
*/

// SECURITY NOTE: Apply resident middleware to all routes in this file via RouteServiceProvider
// Recommended middleware: ['auth', 'verified', 'role:resident']

// ====================
// RESIDENT DASHBOARD & GENERAL
// ====================
Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/dashboard', [ResidentDashboardController::class, 'residentdashboard'])
        ->name('dashboard');
    
    // SECURITY NOTE: Search should be limited to resident-accessible data only
    Route::get('/search', function () {
        // LOGIC NOTE: Controller-level authorization required to filter results by user ownership
        return Inertia::render('resident/Search/Index');
    })->name('search');
    
    // SECURITY NOTE: Instructions accessible to all authenticated residents
    Route::get('/instructions', function () {
        return Inertia::render('resident/Instructions/HouseholdInstructions', [
            'section' => request()->input('section', 'overview'),
            // SECURITY NOTE: Never expose full user object - use only necessary fields
            'userRole' => auth()->user()->role ?? 'resident',
        ]);
    })->name('instructions');
});

// ====================
// RESIDENT NOTIFICATIONS
// ====================
// SECURITY NOTE: All notification operations must be scoped to authenticated user
Route::middleware(['auth'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [ResidentNotificationController::class, 'index'])->name('index');
    Route::get('/unread-count', [ResidentNotificationController::class, 'unreadCount'])->name('unread-count');
    
    // SECURITY NOTE: ID validation required - user can only mark their own notifications as read
    Route::patch('/{id}/mark-as-read', [ResidentNotificationController::class, 'markAsRead'])
        ->name('mark-as-read')
        ->where('id', '[0-9]+'); // LOGIC NOTE: Restrict to numeric IDs to prevent injection
    
    Route::post('/mark-all-as-read', [ResidentNotificationController::class, 'markAllAsRead'])
        ->name('mark-all-as-read');
    
    // SECURITY NOTE: Delete requires ownership verification in controller
    Route::delete('/{id}', [ResidentNotificationController::class, 'destroy'])
        ->name('destroy')
        ->where('id', '[0-9]+');
});

// ====================
// RESIDENT PAYMENTS
// ====================
// SECURITY NOTE: Payment operations must verify resident ownership and prevent amount tampering
Route::middleware(['auth'])->prefix('payments')->name('my.payments.')->group(function () {
    Route::get('/', [ResidentPaymentController::class, 'index'])->name('index');
    Route::get('/pay', [ResidentPaymentController::class, 'create'])->name('create');
    
    // SECURITY NOTE: Payment creation must validate amounts server-side, never trust client input
    Route::post('/', [ResidentPaymentController::class, 'store'])
        ->name('store')
        ->middleware('throttle:10,1'); // Rate limit payment attempts
    
    // SECURITY NOTE: Payment method saving requires encryption at rest
    Route::post('/save-payment-method', [ResidentPaymentController::class, 'savePaymentMethod'])
        ->name('save-method')
        ->middleware('throttle:5,1');
    
    // LOGIC NOTE: Verify endpoint must use constant-time comparison for sensitive data
    Route::post('/verify', [ResidentPaymentController::class, 'verify'])
        ->name('verify')
        ->middleware('throttle:20,1');
    
    // SECURITY NOTE: Individual payment access requires ownership verification
    Route::get('/{payment}', [ResidentPaymentController::class, 'show'])
        ->name('show')
        ->where('payment', '[0-9]+');
    
    // SECURITY NOTE: Receipt access logs should be maintained for audit trail
    Route::get('/{payment}/receipt', [ResidentPaymentController::class, 'receipt'])
        ->name('receipt.view')
        ->where('payment', '[0-9]+');
});

// ====================
// RESIDENT CLEARANCES
// ====================
// SECURITY NOTE: Clearance requests require validation of supporting documents
Route::middleware(['auth'])->prefix('my-clearances')->name('my.clearances.')->group(function () {
    Route::get('/', [ResidentClearanceController::class, 'index'])->name('index');
    Route::get('/request', [ResidentClearanceController::class, 'create'])->name('create');
    
    // SECURITY NOTE: Clearance creation must validate resident eligibility
    Route::post('/', [ResidentClearanceController::class, 'store'])
        ->name('store')
        ->middleware('throttle:5,60'); // Prevent clearance request spam
    
    Route::get('/{clearance}', [ResidentClearanceController::class, 'show'])
        ->name('show')
        ->where('clearance', '[0-9]+');
    
    // SECURITY NOTE: Document downloads require additional audit logging
    Route::get('/{clearance}/download', [ResidentClearanceController::class, 'download'])
        ->name('download')
        ->where('clearance', '[0-9]+');
    
    // SECURITY NOTE: Only pending clearances can be cancelled, verify state in controller
    Route::put('/{clearance}/cancel', [ResidentClearanceController::class, 'cancel'])
        ->name('cancel')
        ->where('clearance', '[0-9]+');
});

// ====================
// RESIDENT RECEIPTS
// ====================
// SECURITY NOTE: Receipts contain financial data - strict access control required
Route::middleware(['auth'])->prefix('receipts')->name('receipts.')->group(function () {
    Route::get('/', [ResidentReceiptController::class, 'index'])->name('index');
    
    Route::get('/{receipt}', [ResidentReceiptController::class, 'show'])
        ->name('show')
        ->where('receipt', '[0-9]+');
    
    Route::get('/{receipt}/download', [ResidentReceiptController::class, 'download'])
        ->name('download')
        ->where('receipt', '[0-9]+');
    
    // SECURITY NOTE: Printing should not expose internal IDs in logs
    Route::post('/{receipt}/print', [ResidentReceiptController::class, 'print'])
        ->name('print')
        ->where('receipt', '[0-9]+');
});

// ====================
// COMMUNITY REPORTS
// ====================
// SECURITY NOTE: Reports may contain sensitive information - enforce ownership
Route::middleware(['auth'])->prefix('community-reports')->name('community-reports.')->group(function () {
    Route::get('/', [CommunityReportController::class, 'index'])->name('index');
    Route::get('/create', [CommunityReportController::class, 'create'])->name('create');
    
    // SECURITY NOTE: Report creation must validate file uploads for malware
    Route::post('/', [CommunityReportController::class, 'store'])
        ->name('store')
        ->middleware('throttle:10,60');
    
    // Draft routes - LOGIC NOTE: Must be before parameterized routes
    Route::get('/drafts/check', [CommunityReportController::class, 'checkDraft'])->name('drafts.check');
    Route::post('/drafts', [CommunityReportController::class, 'saveDraft'])->name('drafts.store');
    Route::put('/drafts/{draft}', [CommunityReportController::class, 'updateDraft'])->name('drafts.update');
    Route::delete('/drafts/{draft}', [CommunityReportController::class, 'deleteDraft'])->name('drafts.destroy');
    Route::delete('/drafts/files/{file}', [CommunityReportController::class, 'deleteDraftFile'])->name('drafts.files.destroy');
    
    Route::get('/{communityReport}', [CommunityReportController::class, 'show'])
        ->name('show')
        ->where('communityReport', '[0-9]+');
    
    // SECURITY NOTE: Only draft reports can be updated, verify state in controller
    Route::put('/{communityReport}', [CommunityReportController::class, 'update'])
        ->name('update')
        ->where('communityReport', '[0-9]+');
    
    Route::delete('/{communityReport}', [CommunityReportController::class, 'destroy'])
        ->name('destroy')
        ->where('communityReport', '[0-9]+');
    
    // Evidence management - SECURITY NOTE: Validate file types and scan for malware
    Route::post('/{communityReport}/evidence', [CommunityReportController::class, 'addEvidence'])
        ->name('evidence.store')
        ->where('communityReport', '[0-9]+');
    
    Route::delete('/{communityReport}/evidence/{evidence}', [CommunityReportController::class, 'deleteEvidence'])
        ->name('evidence.destroy')
        ->where(['communityReport' => '[0-9]+', 'evidence' => '[0-9]+']);
    
    // SECURITY NOTE: Evidence downloads require additional verification
    Route::get('/{communityReport}/evidence/{evidence}/download', [CommunityReportController::class, 'downloadEvidence'])
        ->name('evidence.download')
        ->where(['communityReport' => '[0-9]+', 'evidence' => '[0-9]+']);
});

// ====================
// RESIDENT INCIDENT REPORTS
// ====================
// SECURITY NOTE: Incidents may involve other parties - handle with confidentiality
Route::middleware(['auth'])->prefix('my-incidents')->name('my.incidents.')->group(function () {
    Route::get('/', [ResidentIncidentController::class, 'index'])->name('index');
    Route::get('/create', [ResidentIncidentController::class, 'create'])->name('create');
    
    Route::post('/', [ResidentIncidentController::class, 'store'])
        ->name('store')
        ->middleware('throttle:10,60');
    
    Route::get('/{incident}', [ResidentIncidentController::class, 'show'])
        ->name('show')
        ->where('incident', '[0-9]+');
});

// ====================
// RESIDENT RECORDS
// ====================
// SECURITY NOTE: Records contain personal data - strict access control required
Route::middleware(['auth'])->prefix('my-records')->name('my.records.')->group(function () {
    Route::get('/', [RecordController::class, 'index'])->name('index');
    Route::get('/create', [RecordController::class, 'create'])->name('create');
    
    Route::post('/', [RecordController::class, 'store'])
        ->name('store')
        ->middleware('throttle:20,60');
    
    Route::post('/filter', [RecordController::class, 'filter'])->name('filter');
    Route::post('/export', [RecordController::class, 'export'])->name('export');
    
    Route::get('/{id}/preview', [RecordController::class, 'preview'])
        ->name('preview')
        ->where('id', '[0-9]+');
    
    Route::get('/{record}', [RecordController::class, 'show'])
        ->name('show')
        ->where('record', '[0-9]+');
    
    // SECURITY NOTE: Document downloads require additional authentication
    Route::get('/{record}/download', [RecordController::class, 'download'])
        ->name('download')
        ->where('record', '[0-9]+')
        ->middleware('throttle:5,1'); // Prevent brute force downloads
    
    // SECURITY NOTE: Password verification must use constant-time comparison
    Route::post('/{record}/verify-password', [RecordController::class, 'verifyPassword'])
        ->name('verify-password')
        ->where('record', '[0-9]+')
        ->middleware('throttle:10,1'); // Prevent brute force attacks
    
    Route::delete('/{record}', [RecordController::class, 'destroy'])
        ->name('destroy')
        ->where('record', '[0-9]+');
    
    // SECURITY NOTE: Session extension requires fresh authentication check
    Route::post('/{document}/extend-session', [RecordController::class, 'extendSession'])
        ->name('documents.extend-session')
        ->where('document', '[0-9]+');
});

// ====================
// RESIDENT ANNOUNCEMENTS
// ====================
Route::middleware(['auth'])->prefix('announcements')->name('announcements.')->group(function () {
    Route::get('/', [ResidentAnnouncementController::class, 'index'])->name('index');
    
    Route::get('/{announcement}', [ResidentAnnouncementController::class, 'show'])
        ->name('show')
        ->where('announcement', '[0-9]+');
    
    // SECURITY NOTE: Bookmark operations should be idempotent
    Route::post('/{announcement}/bookmark', [ResidentAnnouncementController::class, 'bookmark'])
        ->name('bookmark')
        ->where('announcement', '[0-9]+');
    
    // SECURITY NOTE: Subscription preferences should be validated
    Route::post('/subscribe', [ResidentAnnouncementController::class, 'subscribe'])
        ->name('subscribe')
        ->middleware('throttle:5,60');
});

// ====================
// SUPPORT CENTER
// ====================
// SECURITY NOTE: Support tickets may contain sensitive information
Route::middleware(['auth'])->prefix('support')->name('support.')->group(function () {
    Route::get('/', [SupportController::class, 'index'])->name('index');
    Route::get('/faqs', [SupportController::class, 'faqs'])->name('faqs');
    Route::get('/guides', [SupportController::class, 'guides'])->name('guides');
    Route::get('/video-tutorials', [SupportController::class, 'videos'])->name('videos');
    
    // LOGIC NOTE: Show route must be before API prefix to avoid conflict
    Route::get('/tickets/{id}', [SupportController::class, 'show'])
        ->name('tickets.show')
        ->where('id', '[0-9]+');
    
    // SECURITY NOTE: Ticket creation requires rate limiting
    Route::post('/tickets', [SupportController::class, 'store'])
        ->name('tickets.store')
        ->middleware('throttle:10,60');
    
    Route::post('/tickets/{id}/reply', [SupportController::class, 'reply'])
        ->name('tickets.reply')
        ->where('id', '[0-9]+')
        ->middleware('throttle:20,60');
    
    // API routes for AJAX requests
    Route::prefix('api')->name('api.')->group(function () {
        // SECURITY NOTE: Search queries should be sanitized to prevent injection
        Route::get('/faqs/search', [SupportController::class, 'searchFaqs'])
            ->name('faqs.search');
        
        Route::post('/tickets/{id}/rate', [SupportController::class, 'rate'])
            ->name('tickets.rate')
            ->where('id', '[0-9]+');
    });
});

// ====================
// RESIDENT FEES
// ====================
// SECURITY NOTE: Fee data must be scoped to resident's household
Route::middleware(['auth'])->prefix('fees')->name('fees.')->group(function () {
    Route::get('/', [ResidentFeeController::class, 'index'])->name('index');
    
    Route::get('/{fee}', [ResidentFeeController::class, 'show'])
        ->name('show')
        ->where('fee', '[0-9]+');
});

// ====================
// RESIDENT FORMS
// ====================
// SECURITY NOTE: Form submissions must validate all input server-side
Route::middleware(['auth'])->prefix('forms')->name('forms.')->group(function () {
    Route::get('/', [ResidentFormController::class, 'index'])->name('index');
    
    Route::get('/{form}', [ResidentFormController::class, 'show'])
        ->name('show')
        ->where('form', '[0-9]+');
    
    Route::get('/{form}/download', [ResidentFormController::class, 'download'])
        ->name('download')
        ->where('form', '[0-9]+');
    
    // SECURITY NOTE: Form submissions should be rate limited and validated
    Route::post('/submit', [ResidentFormController::class, 'submit'])
        ->name('submit')
        ->middleware('throttle:20,60');
    
    Route::post('/request', [ResidentFormController::class, 'requestForm'])
        ->name('request')
        ->middleware('throttle:10,60');
});

/*
|--------------------------------------------------------------------------
| Critical Controller Implementation Requirements
|--------------------------------------------------------------------------
|
| The following must be implemented in ALL resident controllers:
|
| 1. Authorization Gates:
|    - Every show/update/delete method must verify: $record->user_id === auth()->id()
|    - Use Laravel Policies with Gate::authorize() before any data access
|
| 2. Form Request Validation:
|    - All POST/PUT routes must use dedicated Form Request classes
|    - Never use $request->all() with create() or update()
|    - Explicitly define allowed fields using $request->validated()
|
| 3. File Upload Security:
|    - Validate MIME types against whitelist, not just extension
|    - Scan uploads for malware in production
|    - Store files outside public directory, serve via controller
|    - Generate random filenames, never use original names
|
| 4. Database Queries:
|    - Always scope queries to authenticated user: ->where('user_id', auth()->id())
|    - Use parameterized queries via Eloquent/Query Builder
|    - Whitelist any dynamic ORDER BY or GROUP BY fields
|
| 5. Response Security:
|    - Use API Resources to control exposed fields
|    - Never return full models as JSON
|    - Sanitize any HTML content before display
|    - Set appropriate Content-Security-Policy headers
|
| 6. Audit Logging:
|    - Log all sensitive operations (downloads, deletions, payment attempts)
|    - Include user ID, timestamp, IP address, and action performed
|    - Never log passwords or full credit card numbers
|
| 7. Session Security:
|    - Implement session fixation protection
|    - Regenerate session ID after privilege changes
|    - Set secure and httpOnly cookie flags
|
*/