<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommunityReportNotificationController extends BaseCommunityReportController
{
    public function sendAssignmentNotification($report, $reportOwner, $assignedBy)
    {
        try {
            Log::info('Sending assignment notification to owner', [
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'owner_id' => $reportOwner->id,
            ]);
            
            $reportOwner->notify(new \App\Notifications\ReportAssignedNotification($report, $assignedBy));
            
            Log::info('✓ Assignment notification sent to owner');
            
        } catch (\Exception $e) {
            Log::error('Failed to send assignment notification: ' . $e->getMessage());
            $this->createManualAssignmentNotification($report, $reportOwner, $assignedBy);
        }
    }

    public function sendAssignmentRemovedNotification($report, $reportOwner, $updatedBy)
    {
        try {
            $updatedByName = $this->getUserNameById($updatedBy->id) ?? 'System';
            
            $data = [
                'type' => 'assignment_removed',
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'report_title' => $report->title,
                'updated_by_id' => $updatedBy->id,
                'updated_by_name' => $updatedByName,
                'message' => "The assignment for your report #{$report->report_number} has been removed",
                'title' => 'Assignment Removed',
                'icon' => 'user-x',
                'color' => 'yellow',
                'url' => '/admin/community-reports/' . $report->id,
                'created_at' => now()->toDateTimeString(),
            ];
            
            DB::table('notifications')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\AssignmentRemoved',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $reportOwner->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send assignment removed notification: ' . $e->getMessage());
        }
    }

    public function sendStaffAssignmentNotification($report, $staff, $assignedBy)
    {
        try {
            $assignedByName = $this->getUserNameById($assignedBy->id) ?? 'System';
            
            $data = [
                'type' => 'staff_assigned',
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'report_title' => $report->title,
                'report_status' => $report->status,
                'report_priority' => $report->priority,
                'assigned_by_id' => $assignedBy->id,
                'assigned_by_name' => $assignedByName,
                'message' => "You have been assigned to report #{$report->report_number}: {$report->title}",
                'title' => 'New Report Assignment',
                'icon' => 'briefcase',
                'color' => 'blue',
                'url' => '/admin/community-reports/' . $report->id,
                'created_at' => now()->toDateTimeString(),
            ];
            
            DB::table('notifications')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\StaffAssignedNotification',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $staff->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send staff assignment notification: ' . $e->getMessage());
        }
    }

    public function sendStaffUnassignmentNotification($report, $staff, $updatedBy)
    {
        try {
            $updatedByName = $this->getUserNameById($updatedBy->id) ?? 'System';
            
            $data = [
                'type' => 'staff_unassigned',
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'report_title' => $report->title,
                'updated_by_id' => $updatedBy->id,
                'updated_by_name' => $updatedByName,
                'message' => "You have been unassigned from report #{$report->report_number}",
                'title' => 'Assignment Removed',
                'icon' => 'user-minus',
                'color' => 'yellow',
                'url' => '/admin/community-reports',
                'created_at' => now()->toDateTimeString(),
            ];
            
            DB->table('notifications')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\StaffUnassignedNotification',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $staff->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send staff unassignment notification: ' . $e->getMessage());
        }
    }

    public function sendStatusChangeNotification($report, $reportOwner, $oldStatus, $newStatus)
    {
        try {
            $notificationType = $newStatus === 'resolved' ? 'resolved' : 
                               ($newStatus === 'rejected' ? 'rejected' : 'status_changed');
            
            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                $report, $oldStatus, $newStatus, $notificationType
            ));
            
        } catch (\Exception $e) {
            Log::error('Failed to send status notification: ' . $e->getMessage());
            $this->createManualStatusNotification($report, $reportOwner, $oldStatus, $newStatus);
        }
    }

    private function createManualAssignmentNotification($report, $reportOwner, $assignedBy)
    {
        try {
            $assignedToName = $this->getAssignedToName($report);
            $assignedByName = $this->getUserNameById($assignedBy->id) ?? 'System';
            
            $data = [
                'type' => 'report_assigned',
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'report_title' => $report->title,
                'assigned_to_id' => $report->assigned_to,
                'assigned_to_name' => $assignedToName,
                'assigned_by_id' => $assignedBy->id,
                'assigned_by_name' => $assignedByName,
                'assigned_at' => now()->toDateTimeString(),
                'message' => "Your report #{$report->report_number} has been assigned to {$assignedToName}",
                'title' => 'Report Assigned',
                'icon' => 'user-check',
                'color' => 'blue',
                'url' => '/admin/community-reports/' . $report->id,
                'created_at' => now()->toDateTimeString(),
            ];
            
            DB::table('notifications')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\ReportAssignedNotification',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $reportOwner->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to create manual assignment notification: ' . $e->getMessage());
        }
    }

    private function createManualStatusNotification($report, $reportOwner, $oldStatus, $newStatus)
    {
        try {
            $statusLabels = [
                'pending' => 'Pending',
                'under_review' => 'Under Review',
                'assigned' => 'Assigned',
                'in_progress' => 'In Progress',
                'resolved' => 'Resolved',
                'rejected' => 'Rejected',
            ];
            
            $oldLabel = $statusLabels[$oldStatus] ?? ucfirst($oldStatus);
            $newLabel = $statusLabels[$newStatus] ?? ucfirst($newStatus);
            
            $icon = $newStatus === 'resolved' ? 'check-circle' : 
                   ($newStatus === 'rejected' ? 'x-circle' : 
                   ($newStatus === 'assigned' ? 'user-check' : 'refresh-cw'));
            
            $color = $newStatus === 'resolved' ? 'green' : 
                     ($newStatus === 'rejected' ? 'red' : 
                     ($newStatus === 'assigned' ? 'blue' : 'yellow'));
            
            $data = [
                'type' => 'report_status',
                'notification_type' => $newStatus === 'resolved' ? 'resolved' : 
                                      ($newStatus === 'rejected' ? 'rejected' : 'status_changed'),
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'report_title' => $report->title,
                'old_status' => $oldStatus,
                'old_status_label' => $oldLabel,
                'new_status' => $newStatus,
                'new_status_label' => $newLabel,
                'changed_at' => now()->toDateTimeString(),
                'message' => "Your report #{$report->report_number} status changed from {$oldLabel} to {$newLabel}",
                'title' => 'Report Status Updated',
                'icon' => $icon,
                'color' => $color,
                'url' => '/admin/community-reports/' . $report->id,
                'created_at' => now()->toDateTimeString(),
            ];
            
            DB::table('notifications')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\ReportStatusUpdated',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $reportOwner->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to create manual status notification: ' . $e->getMessage());
        }
    }

    private function getAssignedToName($report): string
    {
        if (!$report->assignedTo) {
            return 'a staff member';
        }
        
        if ($report->assignedTo->currentResident) {
            return trim(
                ($report->assignedTo->currentResident->first_name ?? '') . ' ' . 
                ($report->assignedTo->currentResident->middle_name ?? '') . ' ' . 
                ($report->assignedTo->currentResident->last_name ?? '')
            ) ?: 'Staff';
        }
        
        return $report->assignedTo->name ?? $report->assignedTo->email ?? 'Staff';
    }
}