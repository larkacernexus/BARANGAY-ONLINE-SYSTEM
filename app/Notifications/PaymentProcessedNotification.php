<?php
// app/Notifications/PaymentProcessedNotification.php

namespace App\Notifications;

use App\Models\Payment;
use App\Models\Receipt;
use App\Models\Resident;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentProcessedNotification extends Notification
{
    use Queueable;

    protected $payment;
    protected $action;
    protected $items;
    protected $receipt;

    public function __construct(Payment $payment, string $action = 'completed', array $items = [], ?Receipt $receipt = null)
    {
        $this->payment = $payment;
        $this->action = $action;
        $this->items = $items;
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
        
        $message = match($this->action) {
            'completed' => "Your payment of ₱{$amount} has been completed. OR #{$this->payment->or_number}",
            'partially_paid' => "Partial payment of ₱{$amount} received. OR #{$this->payment->or_number}",
            'pending' => "Your payment of ₱{$amount} is pending. OR #{$this->payment->or_number}",
            'refunded' => "Your payment of ₱{$amount} has been refunded. OR #{$this->payment->or_number}",
            'cancelled' => "Your payment of ₱{$amount} has been cancelled. OR #{$this->payment->or_number}",
            default => "Payment of ₱{$amount} processed. OR #{$this->payment->or_number}",
        };

        return [
            'type' => 'payment',
            'action' => $this->action,
            'payment_id' => $this->payment->id,
            'or_number' => $this->payment->or_number,
            'reference_number' => $this->payment->reference_number,
            'payer_id' => $this->payment->payer_id,
            'payer_type' => $this->payment->payer_type,
            'payer_name' => $payerName,
            'resident_name' => $residentName ?? $payerName,
            'total_amount' => $this->payment->total_amount,
            'formatted_total' => '₱' . number_format($this->payment->total_amount, 2),
            'amount_paid' => $this->payment->amount_paid,
            'formatted_amount' => '₱' . $amount,
            'discount' => $this->payment->discount,
            'formatted_discount' => '₱' . number_format($this->payment->discount, 2),
            'payment_method' => $this->payment->payment_method,
            'purpose' => $this->payment->purpose,
            'status' => $this->payment->status,
            'items_count' => count($this->items),
            'items' => $this->items,
            'message' => $message,
            'title' => 'Payment ' . ucfirst(str_replace('_', ' ', $this->action)),
            'is_fee_notification' => true,
            'receipt_id' => $this->receipt?->id,
            'receipt_number' => $this->receipt?->receipt_number,
            'created_at' => now()->toDateTimeString(),
            // FIXED: Portal link for residents
            'url' => '/portal/payments/' . $this->payment->id,
            'link' => '/portal/payments/' . $this->payment->id,
            'action_url' => '/portal/payments/' . $this->payment->id,
            // REMOVED target_roles and excluded_roles - they're for residents now!
        ];
    }
}