<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Admin\Clearance\Traits\ClearanceNotificationTrait;

class ClearanceStatusController extends Controller
{
    use ClearanceNotificationTrait;

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
        
        $this->sendClearanceStatusNotification($clearance, $oldStatus, 'processing');

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

        // Check if payment is required and completed
        if ($clearance->clearanceType->requires_payment && $clearance->payment_status !== 'paid') {
            return redirect()->back()->with('error', 'Cannot approve: Payment is required and not yet completed.');
        }

        $oldStatus = $clearance->status;
        $clearance->approve();
        
        $this->sendClearanceStatusNotification($clearance, $oldStatus, 'approved');

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
        
        $this->sendClearanceStatusNotification($clearance, $oldStatus, 'issued');

        return redirect()->back()->with('success', 'Clearance certificate issued successfully.');
    }

    /**
     * Reject clearance request.
     */
    public function reject(Request $request, ClearanceRequest $clearance)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!in_array($clearance->status, ['pending', 'processing'])) {
            return redirect()->back()->with('error', 'Cannot reject clearance request in current status.');
        }

        $oldStatus = $clearance->status;
        $clearance->reject($request->reason, auth()->id());
        
        $this->sendClearanceStatusNotification($clearance, $oldStatus, 'rejected', $request->reason);

        return redirect()->back()->with('success', 'Clearance request rejected.');
    }

    /**
     * Cancel clearance request.
     */
    public function cancel(Request $request, ClearanceRequest $clearance)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        if (!in_array($clearance->status, ['pending', 'pending_payment', 'processing'])) {
            return redirect()->back()->with('error', 'Cannot cancel clearance request in current status.');
        }

        $oldStatus = $clearance->status;
        $clearance->cancel($request->reason, false);
        
        $this->sendClearanceStatusNotification($clearance, $oldStatus, 'cancelled', $request->reason);

        return redirect()->back()->with('success', 'Clearance request cancelled.');
    }

    /**
     * Delete clearance request.
     */
    public function destroy(ClearanceRequest $clearance)
    {
        if (!in_array($clearance->status, ['pending', 'pending_payment'])) {
            return redirect()->back()->with('error', 'Cannot delete clearance request in current status.');
        }

        // Check if there are payments
        if ($clearance->payment_id || $clearance->paymentItems()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete clearance request with associated payments.');
        }

        $clearance->delete();

        return redirect()->route('clearances.index')->with('success', 'Clearance request deleted.');
    }
}