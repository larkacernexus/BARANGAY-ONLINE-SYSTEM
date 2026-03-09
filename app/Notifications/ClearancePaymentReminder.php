<?php

namespace App\Notifications;

use App\Models\ClearanceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClearancePaymentReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $clearanceRequest;

    public function __construct(ClearanceRequest $clearanceRequest)
    {
        $this->clearanceRequest = $clearanceRequest;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Payment Reminder: Clearance Request')
            ->greeting("Hello {$this->clearanceRequest->contact_name}!")
            ->line("This is a reminder that payment is still pending for your clearance request (Ref: {$this->clearanceRequest->reference_number}).")
            ->line("Amount Due: " . $this->clearanceRequest->formatted_fee)
            ->line("Please complete your payment to avoid delays in processing.")
            ->action('Make Payment Now', url('/payments/create?clearance_id=' . $this->clearanceRequest->id))
            ->line('Thank you!');
    }

    public function toArray($notifiable)
    {
        return [
            'clearance_id' => $this->clearanceRequest->id,
            'reference_number' => $this->clearanceRequest->reference_number,
            'amount_due' => $this->clearanceRequest->fee_amount,
            'formatted_amount' => $this->clearanceRequest->formatted_fee,
            'message' => 'Payment reminder for clearance request.',
        ];
    }
}