<?php
// app/Notifications/PaymentReceiptNotification.php

namespace App\Notifications;

use App\Models\Payment;
use App\Models\Receipt;
use App\Models\Resident;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentReceiptNotification extends Notification
{
    use Queueable;

    protected $payment;
    protected $receipt;

    public function __construct(Payment $payment, Receipt $receipt)
    {
        $this->payment = $payment;
        $this->receipt = $receipt;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $payerName = $this->payment->payer_name;
        $amount = number_format($this->payment->amount_paid, 2);
        
        // Get resident name if available
        $residentName = null;
        if ($this->payment->payer_type === 'resident' && $this->payment->payer_id) {
            $resident = Resident::find($this->payment->payer_id);
            $residentName = $resident ? $resident->full_name : null;
        }
        
        return [
            'type' => 'receipt',
            'action' => 'generated',
            'receipt_id' => $this->receipt->id,
            'receipt_number' => $this->receipt->receipt_number,
            'receipt_type' => $this->receipt->type,
            'payment_id' => $this->payment->id,
            'or_number' => $this->payment->or_number,
            'payer_id' => $this->payment->payer_id,
            'payer_type' => $this->payment->payer_type,
            'payer_name' => $payerName,
            'resident_name' => $residentName ?? $payerName,
            'amount' => $this->payment->amount_paid,
            'formatted_amount' => '₱' . $amount,
            'total_amount' => $this->payment->total_amount,
            'formatted_total' => '₱' . number_format($this->payment->total_amount, 2),
            'payment_method' => $this->payment->payment_method,
            'purpose' => $this->payment->purpose,
            'message' => "Your receipt #{$this->receipt->receipt_number} for ₱{$amount} is ready",
            'title' => 'Payment Receipt Generated',
            'is_fee_notification' => true,
            'created_at' => now()->toDateTimeString(),
            // FIXED: Portal link for residents
            'url' => '/portal/receipts/' . $this->receipt->id,
            'link' => '/portal/receipts/' . $this->receipt->id,
            'action_url' => '/portal/receipts/' . $this->receipt->id,
            // REMOVED target_roles and excluded_roles - they're for residents now!
        ];
    }
}