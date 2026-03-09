<?php
// app/Notifications/ReportStatusUpdated.php

namespace App\Notifications;

use App\Models\CommunityReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReportStatusUpdated extends Notification
{
    use Queueable;

    protected $report;
    protected $oldStatus;
    protected $newStatus;
    protected $notificationType;

    public function __construct(CommunityReport $report, string $oldStatus, string $newStatus, string $notificationType = 'status_changed')
    {
        $this->report = $report;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->notificationType = $notificationType;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $statusLabels = [
            'pending' => 'Pending',
            'under_review' => 'Under Review',
            'assigned' => 'Assigned',
            'in_progress' => 'In Progress',
            'resolved' => 'Resolved',
            'rejected' => 'Rejected',
        ];
        
        $oldLabel = $statusLabels[$this->oldStatus] ?? ucfirst($this->oldStatus);
        $newLabel = $statusLabels[$this->newStatus] ?? ucfirst($this->newStatus);
        
        $icon = 'refresh-cw';
        $color = 'blue';
        
        if ($this->newStatus === 'resolved') {
            $icon = 'check-circle';
            $color = 'green';
        } elseif ($this->newStatus === 'rejected') {
            $icon = 'x-circle';
            $color = 'red';
        } elseif ($this->newStatus === 'assigned') {
            $icon = 'user-check';
            $color = 'blue';
        } elseif ($this->newStatus === 'in_progress') {
            $icon = 'loader';
            $color = 'yellow';
        }
        
        $message = "Your report #{$this->report->report_number} status changed from {$oldLabel} to {$newLabel}";
        
        return [
            'type' => 'report_status',
            'notification_type' => $this->notificationType,
            
            // Report details
            'report_id' => $this->report->id,
            'report_number' => $this->report->report_number,
            'report_title' => $this->report->title,
            
            // Status details
            'old_status' => $this->oldStatus,
            'old_status_label' => $oldLabel,
            'new_status' => $this->newStatus,
            'new_status_label' => $newLabel,
            'changed_at' => now()->toDateTimeString(),
            
            // Notification metadata
            'title' => 'Report Status Updated',
            'message' => $message,
            'icon' => $icon,
            'color' => $color,
            
            // URLs - USING ID NOT SLUG
            'url' => '/portal/community-reports/' . $this->report->id,
            'link' => '/portal/community-reports/' . $this->report->id,
            'admin_url' => '/admin/community-reports/' . $this->report->id,
            
            // Timestamps
            'created_at' => now()->toDateTimeString(),
        ];
    }
}