<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class PaymentReceiptNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = 'Payment Receipt - OR# ' . $this->payment->or_number;
        
        return (new MailMessage)
            ->subject($subject)
            ->greeting('Payment Confirmed!')
            ->line('Thank you for your payment. Here are your payment details:')
            ->line('')
            ->line('**PAYMENT RECEIPT**')
            ->line('OR Number: **' . $this->payment->or_number . '**')
            ->line('Date: ' . $this->payment->payment_date->format('F d, Y h:i A'))
            ->line('Payer: ' . $this->payment->payer_name)
            ->line('Payment Method: ' . $this->payment->payment_method_display)
            ->line('')
            ->line('**PAYMENT BREAKDOWN**')
            ->line('Subtotal: ₱' . number_format($this->payment->subtotal, 2))
            ->line('Surcharge: ₱' . number_format($this->payment->surcharge, 2))
            ->line('Penalty: ₱' . number_format($this->payment->penalty, 2))
            ->line('Discount: -₱' . number_format($this->payment->discount, 2))
            ->line('────────────────────')
            ->line('**Total Paid: ₱' . number_format($this->payment->total_amount, 2) . '**')
            ->line('')
            ->line('**ITEMS PAID:**')
            ->when($this->payment->items->isNotEmpty(), function ($mail) {
                foreach ($this->payment->items as $item) {
                    $mail->line('• ' . $item->fee_name . ': ₱' . number_format($item->total_amount, 2));
                }
            })
            ->line('')
            ->line('**Payment Status:** ✅ Completed')
            ->line('Recorded by: ' . $this->payment->recorded_by_user_name)
            ->line('')
            ->line('This receipt serves as official confirmation of your payment.')
            ->action('View Receipt', url('/payments/' . $this->payment->id . '/receipt'))
            ->salutation('Thank you for your payment.');
    }

    /**
     * Get the array representation for database storage.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'title' => 'Payment Receipt',
            'message' => 'Payment confirmed for OR# ' . $this->payment->or_number . ' - Amount: ₱' . number_format($this->payment->total_amount, 2),
            'or_number' => $this->payment->or_number,
            'amount' => $this->payment->total_amount,
            'payer_name' => $this->payment->payer_name,
            'type' => 'payment_receipt',
            'action_url' => '/payments/' . $this->payment->id,
            'icon' => 'receipt',
            'color' => 'success',
        ];
    }
}