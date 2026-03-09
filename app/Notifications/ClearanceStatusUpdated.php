<?php

namespace App\Notifications;

use App\Models\ClearanceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClearanceStatusUpdated extends Notification
{
    use Queueable;

    protected $clearance;
    protected $oldStatus;
    protected $newStatus;
    protected $remarks;

    public function __construct(ClearanceRequest $clearance, string $oldStatus, string $newStatus, ?string $remarks = null)
    {
        $this->clearance = $clearance;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->remarks = $remarks;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'clearance_id' => $this->clearance->id,
            'reference_number' => $this->clearance->reference_number,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'remarks' => $this->remarks,
            'message' => $this->getMessage(),
            'updated_at' => now()->toDateTimeString(),
        ];
    }

    protected function getMessage(): string
    {
        $statusLabels = [
            'pending' => 'Pending Review',
            'pending_payment' => 'Pending Payment',
            'processing' => 'Processing',
            'approved' => 'Approved',
            'issued' => 'Issued',
            'rejected' => 'Rejected',
            'cancelled' => 'Cancelled',
            'expired' => 'Expired',
        ];

        $newStatusLabel = $statusLabels[$this->newStatus] ?? ucfirst($this->newStatus);
        
        $message = "Clearance #{$this->clearance->reference_number} status updated to: {$newStatusLabel}";
        
        if ($this->remarks) {
            $message .= " - {$this->remarks}";
        }
        
        return $message;
    }
}