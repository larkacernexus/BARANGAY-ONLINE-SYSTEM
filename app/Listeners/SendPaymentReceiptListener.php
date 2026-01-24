<?php

namespace App\Listeners;

use App\Events\PaymentCreated;
use App\Notifications\PaymentReceiptNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendPaymentReceiptListener implements ShouldQueue
{
    public function handle(PaymentCreated $event)
    {
        $payment = $event->payment;
        
        // Send payment receipt notification
        $payment->notify(new PaymentReceiptNotification($payment));
        
        // Send to resident user if exists
        if ($payment->payer_type === 'resident' && $payment->resident && $payment->resident->user) {
            $payment->resident->user->notify(new PaymentReceiptNotification($payment));
        }
    }
}