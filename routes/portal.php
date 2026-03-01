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
use App\Http\Controllers\Resident\ResidentFormController;
use App\Http\Controllers\Resident\ResidentAnnouncementController;
Use Inertia\Inertia;

// ====================
// RESIDENT DASHBOARD
// ====================
Route::get('/dashboard', [ResidentDashboardController::class, 'residentdashboard'])
    ->name('dashboard');
Route::get('/instructions', function () {
    return Inertia::render('resident/Instructions/HouseholdInstructions', [
        'section' => request('section', 'overview'), // optional section parameter
        'userRole' => auth()->user()->role ?? 'staff'
    ]);
})->name('instructions');
// ====================
// RESIDENT PAYMENTS
// ====================
Route::prefix('my-payments')->name('my.payments.')->group(function () {
    Route::get('/', [ResidentPaymentController::class, 'index'])->name('index');
    Route::get('/pay', [ResidentPaymentController::class, 'create'])->name('create');
    Route::post('/', [ResidentPaymentController::class, 'store'])->name('store');
    Route::get('/{payment}', [ResidentPaymentController::class, 'show'])->name('show');
    Route::get('/{payment}/receipt', [ResidentPaymentController::class, 'receipt'])->name('receipt');
    Route::post('/verify', [ResidentPaymentController::class, 'verify'])->name('verify');
    Route::post('/save-payment-method', [ResidentPaymentController::class, 'savePaymentMethod'])->name('save-method');
});

// ====================
// RESIDENT PAYMENTS
// ====================
Route::prefix('my-payments')->name('resident.payments.')->group(function () {
    Route::get('/', [ResidentPaymentController::class, 'index'])->name('index');
    Route::get('/create', [ResidentPaymentController::class, 'create'])->name('create');
    Route::post('/', [ResidentPaymentController::class, 'store'])->name('store');
    Route::get('/{payment}', [ResidentPaymentController::class, 'show'])->name('show');
    
    // Receipt routes
    Route::get('/{payment}/receipt/download', [ResidentPaymentController::class, 'downloadReceipt'])->name('receipt.download');
    Route::get('/{payment}/receipt/view', [ResidentPaymentController::class, 'viewReceipt'])->name('receipt.view');
    Route::post('/{payment}/receipt/save', [ResidentPaymentController::class, 'saveReceipt'])->name('receipt.save');
    
    // Note routes
    Route::post('/{payment}/notes', [ResidentPaymentController::class, 'addNote'])->name('notes.store');
    
    // Attachment routes
    Route::post('/{payment}/attachments', [ResidentPaymentController::class, 'uploadAttachment'])->name('attachments.store');
    Route::get('/{payment}/attachments/{attachment}/download', [ResidentPaymentController::class, 'downloadAttachment'])->name('attachments.download');
    Route::delete('/{payment}/attachments/{attachment}', [ResidentPaymentController::class, 'deleteAttachment'])->name('attachments.destroy');
    
    // Payment action routes
    Route::put('/{payment}/payment-method', [ResidentPaymentController::class, 'updatePaymentMethod'])->name('update-method');
    Route::put('/{payment}/cancel', [ResidentPaymentController::class, 'cancel'])->name('cancel');
    Route::get('/{payment}/receipt', [ResidentPaymentController::class, 'receipt'])->name('receipt');
    Route::post('/{payment}/verify', [ResidentPaymentController::class, 'verify'])->name('verify');
    Route::get('/{payment}/payment-link', [ResidentPaymentController::class, 'getPaymentLink'])->name('payment-link');
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