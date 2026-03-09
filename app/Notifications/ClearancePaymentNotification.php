<?php
// app/Notifications/ClearancePaymentNotification.php

namespace App\Notifications;

use App\Models\ClearanceRequest;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClearancePaymentNotification extends Notification
{
    use Queueable;

    protected $clearanceRequest;
    protected $payment;
    protected $action;

    public function __construct(ClearanceRequest $clearanceRequest, Payment $payment, string $action = 'fully_paid')
    {
        $this->clearanceRequest = $clearanceRequest;
        $this->payment = $payment;
        $this->action = $action;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $amount = number_format($this->payment->amount_paid, 2);
        $clearanceType = $this->clearanceRequest->clearanceType->name ?? 'Clearance';
        $residentName = $this->clearanceRequest->resident->full_name ?? 'Resident';
        
        $message = $this->action === 'fully_paid' 
            ? "Your {$clearanceType} has been fully paid. OR #{$this->payment->or_number}"
            : "Partial payment of ₱{$amount} received for your {$clearanceType}. OR #{$this->payment->or_number}";

        return [
            'type' => 'clearance_payment',
            'action' => $this->action,
            'clearance_id' => $this->clearanceRequest->id,
            'reference_number' => $this->clearanceRequest->reference_number,
            'clearance_number' => $this->clearanceRequest->clearance_number,
            'clearance_type' => $clearanceType,
            'resident_id' => $this->clearanceRequest->resident_id,
            'resident_name' => $residentName,
            'payment_id' => $this->payment->id,
            'or_number' => $this->payment->or_number,
            'amount' => $this->payment->amount_paid,
            'formatted_amount' => '₱' . $amount,
            'total_amount' => $this->clearanceRequest->fee_amount,
            'formatted_total' => '₱' . number_format($this->clearanceRequest->fee_amount, 2),
            'balance' => $this->clearanceRequest->balance,
            'formatted_balance' => '₱' . number_format($this->clearanceRequest->balance, 2),
            'status' => $this->payment->status,
            'message' => $message,
            'title' => 'Clearance Payment ' . ($this->action === 'fully_paid' ? 'Completed' : 'Update'),
            'is_fee_notification' => true,
            'created_at' => now()->toDateTimeString(),
            // FIXED: Portal link for residents
            'url' => '/portal/clearances/' . $this->clearanceRequest->id,
            'link' => '/portal/clearances/' . $this->clearanceRequest->id,
            'action_url' => '/portal/clearances/' . $this->clearanceRequest->id,
            // REMOVED target_roles and excluded_roles - they're for residents now!
        ];
    }
}