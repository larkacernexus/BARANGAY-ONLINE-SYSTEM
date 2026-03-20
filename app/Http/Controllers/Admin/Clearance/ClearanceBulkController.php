<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;

class ClearanceBulkController extends BaseClearanceController
{
    protected $notificationController;

    public function __construct(ClearanceNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    /**
     * Bulk process clearance requests.
     */
    public function bulkProcess(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        $clearances = ClearanceRequest::whereIn('id', $request->ids)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->get();

        $count = 0;
        foreach ($clearances as $clearance) {
            $oldStatus = $clearance->status;
            $clearance->update([
                'status' => 'processing',
                'processed_by' => auth()->id(),
                'processed_at' => now(),
            ]);
            
            $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'processing');
            $count++;
        }

        return redirect()->back()->with('success', "{$count} clearance requests marked as processing.");
    }

    /**
     * Bulk approve clearance requests.
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        $clearances = ClearanceRequest::whereIn('id', $request->ids)
            ->where('status', 'processing')
            ->where(function ($q) {
                $q->where('payment_status', 'paid')
                  ->orWhereDoesntHave('clearanceType', fn($q) => $q->where('requires_payment', true));
            })
            ->get();

        $count = 0;
        foreach ($clearances as $clearance) {
            $oldStatus = $clearance->status;
            $clearance->update([
                'status' => 'approved',
                'issuing_officer_id' => auth()->id(),
                'issuing_officer_name' => auth()->user()->name,
            ]);
            
            $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'approved');
            $count++;
        }

        return redirect()->back()->with('success', "{$count} clearance requests approved.");
    }

    /**
     * Bulk issue clearance certificates.
     */
    public function bulkIssue(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        $clearances = ClearanceRequest::whereIn('id', $request->ids)
            ->where('status', 'approved')
            ->get();

        $count = 0;
        foreach ($clearances as $clearance) {
            $oldStatus = $clearance->status;
            $clearance->update([
                'status' => 'issued',
                'issue_date' => now(),
                'valid_until' => now()->addDays(30),
            ]);
            
            $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'issued');
            $count++;
        }

        return redirect()->back()->with('success', "{$count} clearance certificates issued.");
    }

    /**
     * Bulk update status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
            'status' => 'required|in:pending,processing,approved,issued,rejected,cancelled',
        ]);

        $clearances = ClearanceRequest::whereIn('id', $request->ids)->get();

        $count = 0;
        foreach ($clearances as $clearance) {
            $oldStatus = $clearance->status;
            $clearance->update([
                'status' => $request->status,
                'processed_by' => auth()->id(),
                'processed_at' => now(),
            ]);
            
            $this->notificationController->sendStatusNotification($clearance, $oldStatus, $request->status);
            $count++;
        }

        return redirect()->back()->with('success', "{$count} clearance requests updated to {$request->status}.");
    }

    /**
     * Bulk delete clearance requests.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        $hasPayments = ClearanceRequest::whereIn('id', $request->ids)
            ->where(function ($q) {
                $q->whereNotNull('payment_id')
                  ->orWhereHas('paymentItems');
            })
            ->exists();

        if ($hasPayments) {
            return redirect()->back()->with('error', 'Cannot delete clearance requests with associated payments.');
        }

        $count = ClearanceRequest::whereIn('id', $request->ids)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->delete();

        return redirect()->back()->with('success', "{$count} clearance requests deleted.");
    }
}