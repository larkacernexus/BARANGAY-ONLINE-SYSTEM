<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Admin\Clearance\Traits\ClearanceNotificationTrait;

class ClearancePaymentController extends Controller
{
    use ClearanceNotificationTrait;

    /**
     * Request payment.
     */
    public function requestPayment(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'pending_payment') {
            $clearance->update(['status' => 'pending_payment']);
        }

        // Notify payer about payment request
        $payerUsers = $this->getPayerUsersFromClearance($clearance);
        foreach ($payerUsers as $user) {
            $user->notify(new \App\Notifications\ClearancePaymentRequest($clearance));
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('Payment requested');

        return redirect()->back()->with('success', 'Payment request sent to resident.');
    }

    /**
     * Verify payment (mark as paid manually).
     */
    public function verifyPayment(ClearanceRequest $clearance)
    {
        if ($clearance->payment_status === 'paid') {
            return redirect()->back()->with('info', 'Payment already verified.');
        }

        $oldPaymentStatus = $clearance->payment_status;
        $oldStatus = $clearance->status;
        
        $clearance->update([
            'payment_status' => 'paid',
            'amount_paid' => $clearance->fee_amount,
            'balance' => 0,
            'status' => 'processing',
        ]);

        // Send payment notification if payment exists
        if ($clearance->payment) {
            $this->sendPaymentNotification($clearance, $clearance->payment, 'verified');
        }

        // Send status update notification
        if ($oldStatus !== $clearance->status) {
            $this->sendClearanceStatusNotification($clearance, $oldStatus, $clearance->status, 'Payment verified');
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('Payment verified manually');

        return redirect()->back()->with('success', 'Payment verified successfully.');
    }

    /**
     * Send payment reminder.
     */
    public function sendReminder(ClearanceRequest $clearance)
    {
        if ($clearance->payment_status === 'paid') {
            return redirect()->back()->with('info', 'Payment already completed.');
        }

        // Notify payer about payment reminder
        $payerUsers = $this->getPayerUsersFromClearance($clearance);
        foreach ($payerUsers as $user) {
            $user->notify(new \App\Notifications\ClearancePaymentReminder($clearance));
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('Payment reminder sent');

        return redirect()->back()->with('success', 'Payment reminder sent to resident.');
    }
}