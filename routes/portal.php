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

// ====================
// RESIDENT DASHBOARD
// ====================
Route::get('/dashboard', [ResidentDashboardController::class, 'residentdashboard'])
    ->name('dashboard');

Route::get('/instructions', function () {
    return Inertia::render('resident/Instructions/HouseholdInstructions', [
        'section' => request('section', 'overview'),
        'userRole' => auth()->user()->role ?? 'staff'
    ]);
})->name('instructions');

// ====================
// RESIDENT NOTIFICATIONS
// ====================
Route::prefix('notifications')->name('notifications.')->group(function () {
    // Get notifications list
    Route::get('/', [ResidentNotificationController::class, 'index'])->name('index');
    
    // Mark a single notification as read
    Route::patch('/{id}/mark-as-read', [ResidentNotificationController::class, 'markAsRead'])
        ->name('mark-as-read');
    
    // Mark all notifications as read
    Route::post('/mark-all-as-read', [ResidentNotificationController::class, 'markAllAsRead'])
        ->name('mark-all-as-read');
    
    // Get unread count (for polling/updates)
    Route::get('/unread-count', [ResidentNotificationController::class, 'unreadCount'])
        ->name('unread-count');
    
    // Delete a notification
    Route::delete('/{id}', [ResidentNotificationController::class, 'destroy'])
        ->name('destroy');
});

// ====================
// RESIDENT PAYMENTS
// ====================
Route::prefix('payments')->name('my.payments.')->group(function () {
    Route::get('/', [ResidentPaymentController::class, 'index'])->name('index');
    Route::get('/pay', [ResidentPaymentController::class, 'create'])->name('create');
    Route::post('/', [ResidentPaymentController::class, 'store'])->name('store');
    Route::get('/{payment}', [ResidentPaymentController::class, 'show'])->name('show');
    Route::get('/{payment}/receipt', [ResidentPaymentController::class, 'receipt'])->name('receipt');
    Route::post('/verify', [ResidentPaymentController::class, 'verify'])->name('verify');
    Route::post('/save-payment-method', [ResidentPaymentController::class, 'savePaymentMethod'])->name('save-method');
       Route::get('/{payment}/receipt', [ResidentPaymentController::class, 'receipt'])
            ->name('receipt.view'); // This creates portal.my.payments.receipt.view
    });

// ====================
// RESIDENT CLEARANCES
// ====================
Route::prefix('my-clearances')->name('my.clearances.')->group(function () {
    Route::get('/', [ResidentClearanceController::class, 'index'])->name('index');
    Route::get('/request', [ResidentClearanceController::class, 'create'])->name('create');
    Route::post('/', [ResidentClearanceController::class, 'store'])->name('store');
    Route::get('/{clearance}', [ResidentClearanceController::class, 'show'])->name('show');
    Route::get('/{clearance}/download', [ResidentClearanceController::class, 'download'])->name('download');
    Route::put('/{clearance}/cancel', [ResidentClearanceController::class, 'cancel'])->name('cancel');
});

// ====================
// RESIDENT RECEIPTS
// ====================
Route::prefix('receipts')->name('receipts.')->group(function () {
    Route::get('/', [ResidentReceiptController::class, 'index'])->name('index');
    Route::get('/{receipt}', [ResidentReceiptController::class, 'show'])->name('show');
    Route::get('/{receipt}/download', [ResidentReceiptController::class, 'download'])->name('download');
    Route::post('/{receipt}/print', [ResidentReceiptController::class, 'print'])->name('print');
});

// ====================
// COMMUNITY REPORTS
// ====================
Route::prefix('community-reports')->name('community-reports.')->group(function () {
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
    
    // DRAFT ROUTES
    Route::get('/drafts/check', [CommunityReportController::class, 'checkDraft'])->name('drafts.check');
    Route::post('/drafts', [CommunityReportController::class, 'saveDraft'])->name('drafts.store');
    Route::put('/drafts/{draft}', [CommunityReportController::class, 'updateDraft'])->name('drafts.update');
    Route::delete('/drafts/{draft}', [CommunityReportController::class, 'deleteDraft'])->name('drafts.destroy');
    Route::delete('/drafts/files/{file}', [CommunityReportController::class, 'deleteDraftFile'])->name('drafts.files.destroy');
});

// ====================
// RESIDENT INCIDENT REPORTS
// ====================
Route::prefix('my-incidents')->name('my.incidents.')->group(function () {
    Route::get('/', [ResidentIncidentController::class, 'index'])->name('index');
    Route::get('/create', [ResidentIncidentController::class, 'create'])->name('create');
    Route::get('/{incident}', [ResidentIncidentController::class, 'show'])->name('show');
    Route::post('/', [ResidentIncidentController::class, 'store'])->name('store');
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
    Route::post('/{document}/extend-session', [RecordController::class, 'extendSession'])->name('documents.extend-session');
});

// ====================
// RESIDENT ANNOUNCEMENTS
// ====================
Route::prefix('announcements')->name('announcements.')->group(function () {
    Route::get('/', [ResidentAnnouncementController::class, 'index'])->name('index');
    Route::get('/{announcement}', [ResidentAnnouncementController::class, 'show'])->name('show');
    Route::post('/{announcement}/bookmark', [ResidentAnnouncementController::class, 'bookmark'])->name('bookmark');
    Route::post('/subscribe', [ResidentAnnouncementController::class, 'subscribe'])->name('subscribe');
});


   // ========== SUPPORT CENTER ROUTES ==========
    Route::get('/support', [SupportController::class, 'index'])->name('support.index');
    Route::get('/support/tickets/{id}', [SupportController::class, 'show'])->name('support.tickets.show');
    Route::post('/support/tickets', [SupportController::class, 'store'])->name('support.tickets.store');
    Route::post('/support/tickets/{id}/reply', [SupportController::class, 'reply'])->name('support.tickets.reply');
    Route::get('/support/faqs', [SupportController::class, 'faqs'])->name('support.faqs');
    Route::get('/support/guides', [SupportController::class, 'guides'])->name('support.guides');
    Route::get('/support/video-tutorials', [SupportController::class, 'videos'])->name('support.videos');
    
    // API routes for AJAX requests
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/support/faqs/search', [SupportController::class, 'searchFaqs'])->name('support.faqs.search');
        Route::post('/support/tickets/{id}/rate', [SupportController::class, 'rate'])->name('support.tickets.rate');
    });

// ====================
// RESIDENT FEES
// ====================
Route::prefix('fees')->name('fees.')->group(function () {
    Route::get('/', [ResidentFeeController::class, 'index'])->name('index');
    Route::get('/{fee}', [ResidentFeeController::class, 'show'])->name('show');
});

// ====================
// RESIDENT FORMS
// ====================
Route::prefix('forms')->name('forms.')->group(function () {
    Route::get('/', [ResidentFormController::class, 'index'])->name('index');
    Route::get('/{form}', [ResidentFormController::class, 'show'])->name('show');
    Route::get('/{form}/download', [ResidentFormController::class, 'download'])->name('download');
    Route::post('/submit', [ResidentFormController::class, 'submit'])->name('submit');
    Route::post('/request', [ResidentFormController::class, 'requestForm'])->name('request');
});