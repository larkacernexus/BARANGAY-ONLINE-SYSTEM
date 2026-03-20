<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClearanceStatusController extends BaseClearanceController
{
    protected $notificationController;

    public function __construct(ClearanceNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    /**
     * Mark clearance as processing.
     */
    public function process(ClearanceRequest $clearance)
    {
        if (!in_array($clearance->status, ['pending', 'pending_payment'])) {
            return redirect()->back()->with('error', 'Cannot process clearance request in current status.');
        }

        $oldStatus = $clearance->status;
        $clearance->markAsProcessing(auth()->id());
        
        $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'processing');

        return redirect()->back()->with('success', 'Clearance request marked as processing.');
    }

    /**
     * Approve clearance request.
     */
    public function approve(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'processing') {
            return redirect()->back()->with('error', 'Cannot approve clearance request in current status.');
        }

        if ($clearance->clearanceType->requires_payment && $clearance->payment_status !== 'paid') {
            return redirect()->back()->with('error', 'Cannot approve: Payment is required and not yet completed.');
        }

        $oldStatus = $clearance->status;
        $clearance->approve();
        
        $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'approved');

        return redirect()->back()->with('success', 'Clearance request approved successfully.');
    }

    /**
     * Issue clearance certificate.
     */
    public function issue(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'approved') {
            return redirect()->back()->with('error', 'Cannot issue clearance in current status.');
        }

        $oldStatus = $clearance->status;
        $clearance->issue();
        
        $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'issued');

        return redirect()->back()->with('success', 'Clearance certificate issued successfully.');
    }

    /**
     * Reject clearance request.
     */
    public function reject(Request $request, ClearanceRequest $clearance)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        if (!in_array($clearance->status, ['pending', 'processing'])) {
            return redirect()->back()->with('error', 'Cannot reject clearance request in current status.');
        }

        $oldStatus = $clearance->status;
        $clearance->reject($request->reason, auth()->id());
        
        $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'rejected', $request->reason);

        return redirect()->back()->with('success', 'Clearance request rejected.');
    }

    /**
     * Cancel clearance request.
     */
    public function cancel(Request $request, ClearanceRequest $clearance)
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        if (!in_array($clearance->status, ['pending', 'pending_payment', 'processing'])) {
            return redirect()->back()->with('error', 'Cannot cancel clearance request in current status.');
        }

        $oldStatus = $clearance->status;
        $clearance->cancel($request->reason, false);
        
        $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'cancelled', $request->reason);

        return redirect()->back()->with('success', 'Clearance request cancelled.');
    }

    /**
     * Request more documents.
     */
    public function requestMoreDocuments(Request $request, ClearanceRequest $clearance)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        if ($clearance->status === 'processing') {
            $oldStatus = $clearance->status;
            $clearance->update([
                'status' => 'pending',
                'admin_notes' => $clearance->admin_notes . "\nRequested more documents: " . $request->reason,
            ]);
            
            $this->notificationController->sendStatusNotification($clearance, $oldStatus, 'pending', 'Additional documents required: ' . $request->reason);
        }

        $payerUsers = $this->getPayerUsersFromClearance($clearance);
        foreach ($payerUsers as $user) {
            $user->notify(new \App\Notifications\ClearanceDocumentRequest($clearance, $request->reason));
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->withProperties(['reason' => $request->reason])
            ->log('Requested more documents');

        return redirect()->back()->with('success', 'Document request sent to resident.');
    }
}