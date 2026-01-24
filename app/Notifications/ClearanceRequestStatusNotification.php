<?php

namespace App\Notifications;

use App\Models\ClearanceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class ClearanceRequestStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $clearanceRequest;
    public $status;

    /**
     * Create a new notification instance.
     */
    public function __construct(ClearanceRequest $clearanceRequest, string $status = null)
    {
        $this->clearanceRequest = $clearanceRequest;
        $this->status = $status ?? $clearanceRequest->status;
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
        $subject = match($this->status) {
            'approved' => 'Clearance Request Approved - ' . $this->clearanceRequest->reference_number,
            'issued' => 'Clearance Issued - ' . $this->clearanceRequest->clearance_number,
            'rejected' => 'Clearance Request Rejected - ' . $this->clearanceRequest->reference_number,
            'pending_payment' => 'Payment Required for Clearance - ' . $this->clearanceRequest->reference_number,
            default => 'Clearance Request Update - ' . $this->clearanceRequest->reference_number,
        };

        $greeting = match($this->status) {
            'approved' => '✅ Clearance Request Approved!',
            'issued' => '🎉 Clearance Issued Successfully!',
            'rejected' => '❌ Clearance Request Rejected',
            'pending_payment' => '💰 Payment Required',
            default => 'Clearance Request Update',
        };

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line('**Request Details:**')
            ->line('Reference #: ' . $this->clearanceRequest->reference_number)
            ->line('Type: ' . ($this->clearanceRequest->clearanceType->name ?? 'N/A'))
            ->line('Purpose: ' . $this->clearanceRequest->purpose);

        if ($this->status === 'approved') {
            $message->line('')
                    ->line('Your clearance request has been approved and is ready for issuance.')
                    ->line('Please proceed to the barangay hall to claim your clearance.')
                    ->line('')
                    ->line('**Required Documents to Bring:**')
                    ->line('• Valid ID')
                    ->line('• Payment receipt (if applicable)');
        } elseif ($this->status === 'issued') {
            $message->line('Clearance #: ' . $this->clearanceRequest->clearance_number)
                    ->line('Issue Date: ' . $this->clearanceRequest->issue_date->format('F d, Y'))
                    ->line('Valid Until: ' . $this->clearanceRequest->valid_until->format('F d, Y'))
                    ->line('')
                    ->line('✅ Your clearance has been issued successfully!')
                    ->line('You may now use this clearance for its intended purpose.');
        } elseif ($this->status === 'rejected') {
            $message->line('')
                    ->line('**Reason for Rejection:**')
                    ->line($this->clearanceRequest->admin_notes ?? 'No reason provided')
                    ->line('')
                    ->line('Please contact the barangay office for more information.');
        } elseif ($this->status === 'pending_payment') {
            $message->line('Fee Amount: ₱' . number_format($this->clearanceRequest->fee_amount, 2))
                    ->line('')
                    ->line('Payment is required to process your clearance request.')
                    ->line('Please proceed to make payment at the barangay hall or through online payment methods.');
        }

        if ($this->status === 'issued' || $this->status === 'approved') {
            $message->action('View Clearance', url('/clearance-requests/' . $this->clearanceRequest->id));
        }

        return $message->salutation('Thank you.');
    }

    /**
     * Get the array representation for database storage.
     */
    public function toDatabase(object $notifiable): array
    {
        $messages = [
            'approved' => 'Your clearance request has been approved and is ready for issuance.',
            'issued' => 'Your clearance has been issued successfully. Clearance #: ' . $this->clearanceRequest->clearance_number,
            'rejected' => 'Your clearance request has been rejected.',
            'pending_payment' => 'Payment required to process your clearance request.',
            'processing' => 'Your clearance request is being processed.',
            'pending' => 'Your clearance request has been received and is pending review.',
        ];

        return [
            'clearance_request_id' => $this->clearanceRequest->id,
            'title' => match($this->status) {
                'approved' => 'Clearance Approved',
                'issued' => 'Clearance Issued',
                'rejected' => 'Clearance Rejected',
                'pending_payment' => 'Payment Required',
                default => 'Clearance Update',
            },
            'message' => $messages[$this->status] ?? 'Clearance request status updated.',
            'reference_number' => $this->clearanceRequest->reference_number,
            'clearance_number' => $this->clearanceRequest->clearance_number,
            'status' => $this->status,
            'type' => 'clearance_status_' . $this->status,
            'action_url' => '/clearance-requests/' . $this->clearanceRequest->id,
            'icon' => match($this->status) {
                'approved' => 'check-circle',
                'issued' => 'file-certificate',
                'rejected' => 'times-circle',
                'pending_payment' => 'money-bill-wave',
                default => 'file-alt',
            },
            'color' => match($this->status) {
                'approved' => 'success',
                'issued' => 'success',
                'rejected' => 'danger',
                'pending_payment' => 'warning',
                default => 'info',
            },
        ];
    }
}