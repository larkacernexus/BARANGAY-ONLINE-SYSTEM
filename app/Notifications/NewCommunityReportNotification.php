<?php
// app/Notifications/NewCommunityReportNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCommunityReportNotification extends Notification
{
    use Queueable;

    protected $report;
    protected $action;

    public function __construct($report, $action = 'submitted')
    {
        $this->report = $report;
        $this->action = $action;
    }

    public function via($notifiable)
    {
        // Safety check: Only send to users with system roles (officials)
        if (!$notifiable->role || $notifiable->role->is_system_role != 1) {
            return []; // Don't send to non-officials
        }
        
        // Don't send to the report owner
        if ($notifiable->id === $this->report->user_id) {
            return [];
        }
        
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $reporterName = $this->report->is_anonymous 
            ? 'Anonymous' 
            : ($this->report->reporter_name ?? $this->report->user->name ?? 'Unknown');

        return [
            'type' => 'community_report',
            'action' => $this->action,
            'report_id' => $this->report->id,
            'report_number' => $this->report->report_number,
            'title' => $this->report->title,
            'description' => $this->report->description,
            'category' => $this->report->reportType->category ?? 'Uncategorized',
            'report_type' => $this->report->reportType->name ?? 'Unknown Type',
            'report_type_id' => $this->report->report_type_id,
            'urgency' => $this->report->urgency,
            'location' => $this->report->location,
            'incident_date' => $this->report->incident_date?->toDateString(),
            'reporter_name' => $reporterName,
            'is_anonymous' => (bool) $this->report->is_anonymous,
            'status' => $this->report->status,
            'has_evidence' => $this->report->evidences()->count() > 0,
            'evidence_count' => $this->report->evidences()->count(),
            'submitted_at' => $this->report->submitted_at?->toDateTimeString(),
            'message' => $this->generateMessage(),
            'target_roles' => $this->getTargetRoles(),
            'excluded_roles' => $this->getExcludedRoles(),
            'is_critical' => in_array($this->report->urgency, ['high', 'medium']),
            'created_at' => now()->toDateTimeString(),
            'url' => $this->getNotificationUrl(),
        ];
    }

    private function generateMessage()
    {
        $reporterName = $this->report->is_anonymous 
            ? 'Anonymous' 
            : ($this->report->reporter_name ?? 'A resident');
        
        $reportType = $this->report->reportType->name ?? 'community report';
        $urgency = $this->report->urgency;
        
        $urgencyLabel = match($urgency) {
            'high' => '🔴 HIGH PRIORITY',
            'medium' => '🟡 MEDIUM PRIORITY',
            'low' => '🟢 LOW PRIORITY',
            default => ''
        };

        switch($this->action) {
            case 'submitted':
                return $urgency === 'high' 
                    ? "{$urgencyLabel}: New {$reportType} report from {$reporterName}: {$this->report->title}"
                    : "New {$reportType} report from {$reporterName}: {$this->report->title}";
            
            case 'updated':
                return "Report #{$this->report->report_number} has been updated by {$reporterName}";
            
            case 'under_review':
                return "Report #{$this->report->report_number} is now under review";
            
            case 'in_progress':
                return "Report #{$this->report->report_number} is now being addressed";
            
            case 'resolved':
                return "Report #{$this->report->report_number} has been resolved";
            
            case 'rejected':
                return "Report #{$this->report->report_number} has been reviewed and closed";
            
            case 'evidence_added':
                return "New evidence added to report #{$this->report->report_number}";
            
            case 'escalated':
                return "🚨 Report #{$this->report->report_number} has been escalated due to {$this->report->urgency} priority";
            
            default:
                return "New community report: {$this->report->title}";
        }
    }

    private function getTargetRoles()
    {
        // For new reports - notify all relevant officials
        if ($this->action === 'submitted') {
            return ['barangay_captain', 'barangay_secretary', 'records_clerk', 'staff'];
        }
        
        // For urgent/high priority reports - include more officials
        if ($this->report->urgency === 'high' && in_array($this->action, ['submitted', 'escalated'])) {
            return ['barangay_captain', 'barangay_secretary', 'records_clerk', 'staff', 'barangay_kagawad'];
        }
        
        // For status updates
        if (in_array($this->action, ['under_review', 'in_progress', 'resolved', 'rejected'])) {
            return ['barangay_captain', 'barangay_secretary', 'records_clerk', 'staff'];
        }
        
        // For evidence added
        if ($this->action === 'evidence_added') {
            return ['records_clerk', 'staff', 'barangay_secretary'];
        }
        
        // Default target roles
        return ['barangay_secretary', 'records_clerk', 'staff'];
    }

    private function getExcludedRoles()
    {
        // Exclude certain roles based on action and urgency
        if ($this->report->urgency === 'low' && $this->action === 'submitted') {
            // For low priority reports, exclude captain to reduce noise
            return ['barangay_captain'];
        }
        
        if ($this->action === 'evidence_added') {
            // Only records clerk and staff need to see evidence updates
            return ['barangay_captain', 'barangay_kagawad'];
        }
        
        // Default exclusions
        return [];
    }

    private function getNotificationUrl()
    {
        // Return admin route for officials
        return route('admin.community-reports.show', $this->report->id);
    }
}