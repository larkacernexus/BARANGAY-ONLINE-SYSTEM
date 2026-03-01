<?php
// app/Notifications/FeeCreatedNotification.php

namespace App\Notifications;

use App\Models\Fee;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FeeCreatedNotification extends Notification
{
    use Queueable;

    protected $fee;
    protected $action;
    protected $bulkCount;
    protected $residentName;

    public function __construct(Fee $fee, string $action = 'created', ?int $bulkCount = null, ?string $residentName = null)
    {
        $this->fee = $fee;
        $this->action = $action;
        $this->bulkCount = $bulkCount;
        $this->residentName = $residentName;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $feeTypeName = $this->fee->feeType->name ?? 'Fee';
        $amount = number_format($this->fee->total_amount, 2);
        
        // Determine who this fee is for
        $forWhom = '';
        $residentName = $this->residentName;
        
        if (!$residentName && $this->fee->payer_type === 'resident' && $this->fee->resident) {
            $residentName = $this->fee->resident->full_name;
        }
        
        if ($residentName) {
            $forWhom = " for {$residentName}";
        } elseif ($this->fee->payer_type === 'household') {
            $forWhom = " for your household";
        }

        // Create the message
        $message = match($this->action) {
            'created' => "New fee created{$forWhom}: {$feeTypeName} - ₱{$amount}",
            'bulk_created' => "Bulk created {$this->bulkCount} fees for your household: {$feeTypeName}",
            'duplicated' => "Fee duplicated{$forWhom}: {$feeTypeName} - ₱{$amount}",
            default => "Fee {$this->action}: {$feeTypeName}",
        };

        // Create a short title for display
        $title = $residentName 
            ? "Fee for {$residentName}" 
            : ($this->fee->payer_type === 'household' ? "Household Fee" : "New Fee");

        return [
            'type' => 'fee_created',
            'fee_id' => $this->fee->id,
            'fee_code' => $this->fee->fee_code,
            'fee_type' => $feeTypeName,
            'payer_name' => $this->fee->payer_name,
            'resident_name' => $residentName,
            'payer_type' => $this->fee->payer_type,
            'amount' => $this->fee->total_amount,
            'formatted_amount' => "₱{$amount}",
            'action' => $this->action,
            'message' => $message,
            'title' => $title,
            'bulk_count' => $this->bulkCount,
            'created_by' => $this->fee->created_by,
            'created_at' => now()->toISOString(),
            'link' => "/admin/fees/{$this->fee->id}",
            'household_id' => $this->fee->household_id,
            'resident_id' => $this->fee->resident_id,
        ];
    }
}