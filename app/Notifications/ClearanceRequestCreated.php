<?php

namespace App\Notifications;

use App\Models\ClearanceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClearanceRequestCreated extends Notification
{
    use Queueable;

    protected $clearance;
    protected $action;
    protected $recipientType;

    public function __construct(ClearanceRequest $clearance, string $action = 'created', string $recipientType = 'payer')
    {
        $this->clearance = $clearance;
        $this->action = $action;
        $this->recipientType = $recipientType;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        // Extract ALL data from relationships FIRST
        $clearanceType = $this->clearance->clearanceType;
        $clearanceTypeName = $clearanceType?->name ?? 'Clearance';
        $clearanceTypeCode = $clearanceType?->code ?? 'CLR';
        
        $payerName = $this->clearance->payer_name ?? 'Unknown';
        $referenceNumber = $this->clearance->reference_number;
        $clearanceId = $this->clearance->id;
        $feeAmount = (float) $this->clearance->fee_amount;
        $status = $this->clearance->status;
        $paymentStatus = $this->clearance->payment_status;
        $payerType = $this->clearance->payer_type;
        $urgency = $this->clearance->urgency;
        $purpose = $this->clearance->purpose;
        
        // Format the amount
        $formattedAmount = $feeAmount ? '₱' . number_format($feeAmount, 2) : '₱0.00';
        
        // Determine URLs based on recipient type
        $url = $this->recipientType === 'admin' 
            ? "/admin/clearances/{$clearanceId}"
            : "/portal/my-clearances/{$clearanceId}";
            
        $link = $url; // Same as URL for consistency
        
        // Determine target roles and excluded roles
        $targetRoles = ['admin', 'secretary', 'treasurer'];
        $excludedRoles = [];
        
        if ($this->recipientType === 'admin') {
            $targetRoles = ['admin', 'secretary', 'treasurer'];
        } else {
            // For payer notifications, no role filtering needed
            $targetRoles = [];
            $excludedRoles = [];
        }
        
        // Create the message
        $message = $this->recipientType === 'admin'
            ? "New {$clearanceTypeName} request #{$referenceNumber} from {$payerName}"
            : "Your {$clearanceTypeName} request #{$referenceNumber} has been created successfully.";

        return [
            'type' => 'clearance',
            'action' => $this->action,
            
            // Clearance details
            'clearance_id' => $clearanceId,
            'reference_number' => $referenceNumber,
            'clearance_type' => $clearanceTypeName,
            'clearance_type_code' => $clearanceTypeCode,
            
            // Payer information
            'payer_id' => $this->clearance->payer_id,
            'payer_type' => $payerType,
            'payer_name' => $payerName,
            'resident_name' => $payerType === 'resident' ? $payerName : null,
            
            // Financial details
            'fee_amount' => $feeAmount,
            'formatted_fee' => $formattedAmount,
            'status' => $status,
            'payment_status' => $paymentStatus,
            
            // Additional details
            'urgency' => $urgency,
            'purpose' => $purpose,
            'needed_date' => $this->clearance->needed_date?->toDateString(),
            
            // Metadata
            'recipient_type' => $this->recipientType,
            'message' => $message,
            'target_roles' => $targetRoles,
            'excluded_roles' => $excludedRoles,
            'created_at' => now()->toDateTimeString(),
            
            // URLs
            'url' => $url,
            'link' => $link,
        ];
    }
}