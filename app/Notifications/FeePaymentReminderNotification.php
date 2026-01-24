<?php

namespace App\Notifications;

use App\Models\Fee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class FeePaymentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $fee;
    public $daysUntilDue;
    public $messageType;

    /**
     * Create a new notification instance.
     */
    public function __construct(Fee $fee, string $messageType = 'reminder')
    {
        $this->fee = $fee;
        $this->daysUntilDue = now()->diffInDays($fee->due_date, false);
        $this->messageType = $messageType;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = match($this->messageType) {
            'overdue' => 'OVERDUE Payment Notice - ' . $this->fee->feeType->name,
            'due_today' => 'Payment Due Today - ' . $this->fee->feeType->name,
            default => 'Payment Reminder - ' . $this->fee->feeType->name,
        };

        $greeting = match($this->messageType) {
            'overdue' => 'URGENT: Payment Overdue!',
            'due_today' => 'Important: Payment Due Today!',
            default => 'Payment Reminder',
        };

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line('**Fee Details:**')
            ->line('Fee Type: ' . $this->fee->feeType->name)
            ->line('Fee Code: ' . $this->fee->fee_code)
            ->line('Amount Due: ₱' . number_format($this->fee->balance, 2))
            ->line('Due Date: ' . $this->fee->due_date->format('F d, Y'));

        if ($this->messageType === 'overdue') {
            $message->line('⚠️ **Payment is overdue by ' . abs($this->daysUntilDue) . ' days**')
                    ->line('Please make payment immediately to avoid additional penalties.');
        } elseif ($this->messageType === 'due_today') {
            $message->line('⏰ **Payment is due today!**');
        } else {
            $message->line('📅 **Days remaining: ' . $this->daysUntilDue . ' days**');
        }

        if ($this->fee->penalty_amount > 0) {
            $message->line('Current Penalty: ₱' . number_format($this->fee->penalty_amount, 2));
        }

        $message->action('Make Payment', url('/payments/create?fee_id=' . $this->fee->id))
                ->line('**Payment Methods:**')
                ->line('• Cash at Barangay Hall')
                ->line('• GCash: 0917-XXX-XXXX')
                ->line('• Bank Transfer: BPI XXX-XXX-XXX')
                ->salutation('Thank you for your prompt payment.');

        return $message;
    }

    /**
     * Get the array representation for database storage.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'fee_id' => $this->fee->id,
            'title' => match($this->messageType) {
                'overdue' => 'OVERDUE Payment Notice',
                'due_today' => 'Payment Due Today',
                default => 'Payment Reminder',
            },
            'message' => $this->getNotificationMessage(),
            'amount' => $this->fee->balance,
            'due_date' => $this->fee->due_date->format('Y-m-d'),
            'days_remaining' => $this->daysUntilDue,
            'type' => 'fee_payment_' . $this->messageType,
            'action_url' => '/fees/' . $this->fee->id,
            'icon' => match($this->messageType) {
                'overdue' => 'exclamation-triangle',
                'due_today' => 'bell',
                default => 'calendar-alt',
            },
            'color' => match($this->messageType) {
                'overdue' => 'danger',
                'due_today' => 'warning',
                default => 'info',
            },
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => get_class($this),
            'data' => [
                'fee_id' => $this->fee->id,
                'title' => match($this->messageType) {
                    'overdue' => 'OVERDUE Payment',
                    'due_today' => 'Payment Due Today',
                    default => 'Payment Reminder',
                },
                'message' => $this->getNotificationMessage(),
                'amount' => $this->fee->balance,
                'url' => '/fees/' . $this->fee->id,
            ],
            'read_at' => null,
            'created_at' => now()->toDateTimeString(),
        ]);
    }

    /**
     * Get notification message.
     */
    private function getNotificationMessage(): string
    {
        $message = 'Fee: ' . $this->fee->feeType->name . ' (₱' . number_format($this->fee->balance, 2) . ')';
        
        if ($this->messageType === 'overdue') {
            $message .= ' - OVERDUE by ' . abs($this->daysUntilDue) . ' days';
        } elseif ($this->messageType === 'due_today') {
            $message .= ' - Due today!';
        } else {
            $message .= ' - Due in ' . $this->daysUntilDue . ' days';
        }
        
        return $message;
    }
}