<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Admin\Clearance\Traits\ClearanceNotificationTrait;

class ClearanceNotificationController extends Controller
{
    use ClearanceNotificationTrait;

    /**
     * Resend payment notification.
     */
    public function resendPaymentNotification(ClearanceRequest $clearance)
    {
        try {
            if (!$clearance->payment) {
                return redirect()->back()->with('error', 'No payment found for this clearance.');
            }

            $this->sendPaymentNotification($clearance, $clearance->payment, 'received');

            return redirect()->back()->with('success', 'Payment notification resent successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to resend payment notification', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()->with('error', 'Failed to resend payment notification.');
        }
    }

    /**
     * Resend status notification.
     */
    public function resendStatusNotification(ClearanceRequest $clearance)
    {
        try {
            $this->sendClearanceStatusNotification($clearance, $clearance->status, $clearance->status, 'Manual resend');

            return redirect()->back()->with('success', 'Status notification resent successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to resend status notification', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()->with('error', 'Failed to resend status notification.');
        }
    }

    /**
     * Test notification (admin only).
     */
    public function testNotification(ClearanceRequest $clearance)
    {
        if (!auth()->user()->isAdministrator()) {
            return redirect()->back()->with('error', 'Unauthorized.');
        }

        try {
            // Send test notification to current user
            auth()->user()->notify(new \App\Notifications\ClearanceRequestCreated($clearance, 'test', 'admin'));

            return redirect()->back()->with('success', 'Test notification sent.');

        } catch (\Exception $e) {
            Log::error('Test notification failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Test notification failed.');
        }
    }
}