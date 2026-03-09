<?php

namespace App\Notifications;

use App\Models\Fee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class FeeDueReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $fee;
    protected $daysUntilDue;

    /**
     * Create a new notification instance.
     *
     * @param Fee $fee
     * @param int|float $daysUntilDue
     * @return void
     */
    public function __construct(Fee $fee, $daysUntilDue)
    {
        $this->fee = $fee;
        $this->daysUntilDue = (int) $daysUntilDue;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable): array
    {
        $channels = ['database'];
        
        // Add mail channel if the notifiable has an email
        if ($notifiable && !empty($notifiable->email)) {
            $channels[] = 'mail';
        }
        
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        $status = $this->getStatusText();
        $daysText = $this->getDaysText();
        
        $mailMessage = (new MailMessage)
            ->subject('Fee Payment Reminder: ' . $this->fee->fee_code)
            ->greeting('Hello ' . ($notifiable->name ?? $this->fee->payer_name ?? 'Valued Customer') . '!')
            ->line(new HtmlString('<strong>This is a reminder about your pending fee payment.</strong>'))
            ->line('---')
            ->line('**Fee Details:**')
            ->line('• **Fee Code:** ' . $this->fee->fee_code)
            ->line('• **Amount:** ₱' . number_format($this->fee->total_amount ?? $this->fee->base_amount, 2))
            ->line('• **Due Date:** ' . $this->fee->due_date->format('F j, Y'))
            ->line('• **Status:** ' . ucfirst($status) . ' (' . $daysText . ')')
            ->line('• **Balance:** ₱' . number_format($this->fee->balance, 2));

        // Add payer information if available
        if ($this->fee->payer_name) {
            $mailMessage->line('• **Payer:** ' . $this->fee->payer_name);
        }

        if ($this->fee->purok) {
            $mailMessage->line('• **Purok:** ' . $this->fee->purok);
        }

        $mailMessage->line('---')
            ->line('Please ensure timely payment to avoid additional penalties.')
            ->action('View Details', url('/admin/fees/' . $this->fee->id))
            ->line('Thank you for your prompt attention to this matter!');

        // Add overdue warning if applicable
        if ($this->daysUntilDue < 0) {
            $mailMessage->line(new HtmlString('<strong style="color: #dc2626;">⚠️ This fee is already overdue. Please settle immediately.</strong>'));
        } elseif ($this->daysUntilDue <= 3) {
            $mailMessage->line(new HtmlString('<strong style="color: #f59e0b;">⚠️ Payment is due very soon.</strong>'));
        }

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification (for database).
     *
     * @param mixed $notifiable
     * @return array
     */
    public function toArray($notifiable): array
    {
        $status = $this->getStatusText();
        $daysText = $this->getDaysText();

        return [
            'fee_id' => $this->fee->id,
            'fee_code' => $this->fee->fee_code,
            'fee_type' => $this->fee->feeType?->name ?? 'N/A',
            'amount' => (float) ($this->fee->total_amount ?? $this->fee->base_amount),
            'formatted_amount' => '₱' . number_format($this->fee->total_amount ?? $this->fee->base_amount, 2),
            'due_date' => $this->fee->due_date->format('Y-m-d'),
            'formatted_due_date' => $this->fee->due_date->format('F j, Y'),
            'days_until_due' => $this->daysUntilDue,
            'status' => $status,
            'status_text' => ucfirst($status),
            'days_text' => $daysText,
            'payer_name' => $this->fee->payer_name,
            'payer_type' => $this->fee->payer_type,
            'payer_id' => $this->fee->payer_id,
            'balance' => (float) $this->fee->balance,
            'formatted_balance' => '₱' . number_format($this->fee->balance, 2),
            'purok' => $this->fee->purok,
            'zone' => $this->fee->zone,
            'message' => $this->generateMessage(),
            'short_message' => $this->generateShortMessage(),
            'type' => 'fee_reminder',
            'priority' => $this->getPriority(),
            'icon' => $this->getIcon(),
            'color' => $this->getColor(),
            'action_url' => '/portal/fees/' . $this->fee->id,
            'action_text' => 'View Fee',
            'metadata' => [
                'or_number' => $this->fee->or_number,
                'certificate_number' => $this->fee->certificate_number,
                'period_start' => $this->fee->period_start?->format('Y-m-d'),
                'period_end' => $this->fee->period_end?->format('Y-m-d'),
            ],
            'created_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get the notification's priority level.
     *
     * @return string
     */
    private function getPriority(): string
    {
        if ($this->daysUntilDue < 0) {
            return 'critical';
        } elseif ($this->daysUntilDue <= 3) {
            return 'high';
        } elseif ($this->daysUntilDue <= 7) {
            return 'normal';
        }
        return 'low';
    }

    /**
     * Get the icon for the notification.
     *
     * @return string
     */
    private function getIcon(): string
    {
        if ($this->daysUntilDue < 0) {
            return 'alert-triangle';
        } elseif ($this->daysUntilDue <= 3) {
            return 'clock';
        }
        return 'bell';
    }

    /**
     * Get the color for the notification.
     *
     * @return string
     */
    private function getColor(): string
    {
        if ($this->daysUntilDue < 0) {
            return 'red';
        } elseif ($this->daysUntilDue <= 3) {
            return 'orange';
        } elseif ($this->daysUntilDue <= 7) {
            return 'yellow';
        }
        return 'blue';
    }

    /**
     * Get the status text based on days until due.
     *
     * @return string
     */
    private function getStatusText(): string
    {
        if ($this->daysUntilDue < 0) {
            return 'overdue';
        } elseif ($this->daysUntilDue === 0) {
            return 'due_today';
        } elseif ($this->daysUntilDue === 1) {
            return 'due_tomorrow';
        }
        return 'upcoming';
    }

    /**
     * Get the days text description.
     *
     * @return string
     */
    private function getDaysText(): string
    {
        if ($this->daysUntilDue < 0) {
            $days = abs($this->daysUntilDue);
            return $days === 1 ? 'overdue by 1 day' : "overdue by {$days} days";
        } elseif ($this->daysUntilDue === 0) {
            return 'due today';
        } elseif ($this->daysUntilDue === 1) {
            return 'due tomorrow';
        }
        return "due in {$this->daysUntilDue} days";
    }

    /**
     * Generate a detailed message for the notification.
     *
     * @return string
     */
    private function generateMessage(): string
    {
        $status = $this->getStatusText();
        $amount = '₱' . number_format($this->fee->total_amount ?? $this->fee->base_amount, 2);
        
        $parts = [
            "Fee {$status}:",
            $this->fee->fee_code,
            "-",
            $amount,
        ];

        if ($this->fee->payer_name) {
            $parts[] = "({$this->fee->payer_name})";
        }

        $parts[] = "is {$this->getDaysText()}.";

        if ($this->fee->balance > 0 && $this->fee->balance < ($this->fee->total_amount ?? $this->fee->base_amount)) {
            $parts[] = " Remaining balance: ₱" . number_format($this->fee->balance, 2);
        }

        return implode(' ', $parts);
    }

    /**
     * Generate a short message for the notification.
     *
     * @return string
     */
    private function generateShortMessage(): string
    {
        $amount = '₱' . number_format($this->fee->total_amount ?? $this->fee->base_amount, 2);
        
        if ($this->daysUntilDue < 0) {
            return "⚠️ Overdue: {$this->fee->fee_code} - {$amount}";
        } elseif ($this->daysUntilDue <= 3) {
            return "🔔 Due soon: {$this->fee->fee_code} - {$amount}";
        }
        
        return "📋 Reminder: {$this->fee->fee_code} - {$amount}";
    }

    /**
     * Get the notification's database type.
     *
     * @return string
     */
    public function databaseType(): string
    {
        return 'fee-reminder';
    }

    /**
     * Determine if the notification should be sent.
     *
     * @param mixed $notifiable
     * @param string $channel
     * @return bool
     */
    public function shouldSend($notifiable, string $channel): bool
    {
        // Don't send reminders for paid/cancelled/waived fees
        if (in_array($this->fee->status, ['paid', 'cancelled', 'waived'])) {
            return false;
        }

        // For mail channel, ensure we have an email
        if ($channel === 'mail') {
            return !empty($notifiable->email);
        }

        return true;
    }
}