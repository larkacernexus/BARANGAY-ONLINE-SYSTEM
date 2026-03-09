<?php
// app/Notifications/ReportAssignedNotification.php

namespace App\Notifications;

use App\Models\CommunityReport;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReportAssignedNotification extends Notification
{
    use Queueable;

    protected $report;
    protected $assignedBy;
    protected $assignedTo;

    public function __construct(CommunityReport $report, User $assignedBy)
    {
        $this->report = $report;
        $this->assignedBy = $assignedBy;
        
        // Get the assigned staff member
        $this->assignedTo = $report->assignedTo;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        // Get assigned staff name from currentResident
        $assignedToName = 'a staff member';
        if ($this->assignedTo && $this->assignedTo->currentResident) {
            $firstName = $this->assignedTo->currentResident->first_name ?? '';
            $middleName = $this->assignedTo->currentResident->middle_name ?? '';
            $lastName = $this->assignedTo->currentResident->last_name ?? '';
            $assignedToName = trim("{$firstName} {$middleName} {$lastName}");
        }
        
        // Get assigned by name
        $assignedByName = 'System';
        if ($this->assignedBy && $this->assignedBy->currentResident) {
            $firstName = $this->assignedBy->currentResident->first_name ?? '';
            $middleName = $this->assignedBy->currentResident->middle_name ?? '';
            $lastName = $this->assignedBy->currentResident->last_name ?? '';
            $assignedByName = trim("{$firstName} {$middleName} {$lastName}");
        } elseif ($this->assignedBy) {
            $assignedByName = $this->assignedBy->name ?? $this->assignedBy->email ?? 'System';
        }
        
        // Get assigned staff details
        $assignedStaffDetails = null;
        if ($this->assignedTo) {
            $staffFirstName = $this->assignedTo->currentResident->first_name ?? '';
            $staffLastName = $this->assignedTo->currentResident->last_name ?? '';
            $staffPosition = $this->assignedTo->position ?? 'Staff';
            $staffRole = $this->assignedTo->role ? $this->assignedTo->role->name : 'Staff';
            
            $assignedStaffDetails = [
                'id' => $this->assignedTo->id,
                'name' => $assignedToName,
                'first_name' => $staffFirstName,
                'last_name' => $staffLastName,
                'email' => $this->assignedTo->email,
                'phone' => $this->assignedTo->contact_number,
                'position' => $staffPosition,
                'role' => $staffRole,
            ];
        }
        
        // Create the message
        $message = "Your report #{$this->report->report_number} has been assigned to {$assignedToName}";
        
        return [
            'type' => 'report_assigned',
            'action' => 'assigned',
            
            // Report details
            'report_id' => $this->report->id,
            'report_number' => $this->report->report_number,
            'report_title' => $this->report->title,
            'report_status' => $this->report->status,
            'report_priority' => $this->report->priority,
            
            // Assignment details
            'assigned_to_id' => $this->assignedTo ? $this->assignedTo->id : null,
            'assigned_to_name' => $assignedToName,
            'assigned_to_details' => $assignedStaffDetails,
            'assigned_by_id' => $this->assignedBy->id,
            'assigned_by_name' => $assignedByName,
            'assigned_at' => now()->toDateTimeString(),
            
            // Notification metadata
            'title' => 'Report Assigned',
            'message' => $message,
            'icon' => 'user-check',
            'color' => 'blue',
            
            // URLs - USING ID NOT SLUG
            'url' => '/portal/community-reports/' . $this->report->id,
            'link' => '/portal/community-reports/' . $this->report->id,
            'admin_url' => '/admin/community-reports/' . $this->report->id,
            'staff_url' => '/staff/community-reports/' . $this->report->id,
            
            // Timestamps
            'created_at' => now()->toDateTimeString(),
        ];
    }
}