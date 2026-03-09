<?php
// app/Notifications/ClearanceRequestNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClearanceRequestNotification extends Notification
{
    use Queueable;

    protected $clearanceRequest;
    protected $action;

    public function __construct($clearanceRequest, $action = 'submitted')
    {
        $this->clearanceRequest = $clearanceRequest;
        $this->action = $action;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $resident = $this->clearanceRequest->resident;
        $clearanceType = $this->clearanceRequest->clearance_type;
        
        return [
            'type' => 'clearance_request',
            'action' => $this->action,
            'clearance_id' => $this->clearanceRequest->id,
            'reference_number' => $this->clearanceRequest->reference_number,
            'clearance_type' => $clearanceType->name ?? 'Clearance',
            'clearance_type_id' => $clearanceType->id ?? null,
            'resident_id' => $resident->id ?? null,
            'resident_name' => $resident->full_name ?? 'Unknown Resident',
            'household_id' => $this->clearanceRequest->household_id,
            'purpose' => $this->clearanceRequest->purpose,
            'fee_amount' => $this->clearanceRequest->fee_amount,
            'status' => $this->clearanceRequest->status,
            'message' => $this->generateMessage(),
            'target_roles' => $this->getTargetRoles(),
            'excluded_roles' => $this->getExcludedRoles(),
            'created_at' => now()->toDateTimeString(),
            'url' => $this->getNotificationUrl(),
        ];
    }

    private function generateMessage()
    {
        $residentName = $this->clearanceRequest->resident->full_name ?? 'A resident';
        $clearanceType = $this->clearanceRequest->clearance_type->name ?? 'clearance';
        
        switch($this->action) {
            case 'submitted':
                return "{$residentName} requested a {$clearanceType}";
            case 'approved':
                return "{$clearanceType} for {$residentName} has been approved";
            case 'rejected':
                return "{$clearanceType} for {$residentName} has been rejected";
            case 'issued':
                return "{$clearanceType} for {$residentName} has been issued";
            case 'payment_completed':
                return "Payment completed for {$residentName}'s {$clearanceType}";
            case 'cancelled':
                return "{$clearanceType} request by {$residentName} was cancelled";
            default:
                return "New clearance request from {$residentName}";
        }
    }

    private function getTargetRoles()
    {
        // Only admin, captain, secretary can see clearance requests
        if ($this->action === 'submitted') {
            return ['admin', 'captain', 'secretary'];
        }
        
        if (in_array($this->action, ['approved', 'rejected', 'issued'])) {
            return ['admin', 'captain', 'secretary'];
        }
        
        if ($this->action === 'payment_completed') {
            return ['admin', 'captain', 'secretary', 'treasurer'];
        }
        
        return ['admin', 'captain'];
    }

    private function getExcludedRoles()
    {
        if ($this->action === 'submitted') {
            return ['kagawad', 'treasurer']; // Kagawads and treasurers don't need to see new requests
        }
        
        if ($this->action === 'payment_completed') {
            return ['kagawad']; // Only exclude kagawad from payment notifications
        }
        
        return ['kagawad']; // Default exclude kagawad from most notifications
    }

    private function getNotificationUrl()
    {
        return route('admin.clearances.show', $this->clearanceRequest->id);
    }
}