<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClearancePaymentController extends BaseClearanceController
{
    protected $notificationController;

    public function __construct(ClearanceNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    /**
     * Request payment.
     */
    public function requestPayment(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'pending_payment') {
            $clearance->update(['status' => 'pending_payment']);
        }

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

        if ($clearance->payment) {
            $this->notificationController->sendPaymentNotification($clearance, $clearance->payment, 'verified');
        }

        if ($oldStatus !== $clearance->status) {
            $this->notificationController->sendStatusNotification($clearance, $oldStatus, $clearance->status, 'Payment verified');
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
    public function sendPaymentReminder(ClearanceRequest $clearance)
    {
        if ($clearance->payment_status === 'paid') {
            return redirect()->back()->with('info', 'Payment already completed.');
        }

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