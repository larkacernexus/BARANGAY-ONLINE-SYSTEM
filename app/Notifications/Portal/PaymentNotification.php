<?php
// app/Notifications/PaymentNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentNotification extends Notification
{
    use Queueable;

    protected $payment;
    protected $action;

    public function __construct($payment, $action = 'completed')
    {
        $this->payment = $payment;
        $this->action = $action;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $payable = $this->payment->payable;
        $resident = null;
        
        if ($payable && method_exists($payable, 'resident')) {
            $resident = $payable->resident;
        }
        
        return [
            'type' => 'payment',
            'action' => $this->action,
            'payment_id' => $this->payment->id,
            'or_number' => $this->payment->or_number,
            'amount' => $this->payment->amount,
            'payable_type' => $this->payment->payable_type ? class_basename($this->payment->payable_type) : 'Unknown',
            'payable_id' => $this->payment->payable_id,
            'resident_name' => $resident->full_name ?? 'Unknown',
            'message' => $this->generateMessage(),
            'target_roles' => $this->getTargetRoles(),
            'excluded_roles' => $this->getExcludedRoles(),
            'created_at' => now()->toDateTimeString(),
            'url' => route('admin.payments.show', $this->payment->id),
        ];
    }

    private function generateMessage()
    {
        if ($this->action === 'completed') {
            return "Payment of ₱" . number_format($this->payment->amount, 2) . " completed. OR #: " . ($this->payment->or_number ?? 'N/A');
        }
        return "New payment of ₱" . number_format($this->payment->amount, 2) . " processed";
    }

    private function getTargetRoles()
    {
        // Treasurer needs to see payment notifications
        return ['admin', 'captain', 'treasurer', 'secretary'];
    }

    private function getExcludedRoles()
    {
        return ['kagawad']; // Kagawad don't need payment notifications
    }
}