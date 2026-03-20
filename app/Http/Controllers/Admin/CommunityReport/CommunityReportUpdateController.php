<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommunityReportUpdateController extends BaseCommunityReportController
{
    protected $notificationController;

    public function __construct(CommunityReportNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    public function update(Request $request, CommunityReport $report)
    {
        $validated = $this->validateRequest($request);
        
        // Convert boolean values
        $validated['recurring_issue'] = $request->boolean('recurring_issue', false);
        $validated['has_previous_report'] = $request->boolean('has_previous_report', false);
        $validated['safety_concern'] = $request->boolean('safety_concern', false);
        $validated['environmental_impact'] = $request->boolean('environmental_impact', false);
        $validated['is_anonymous'] = $request->boolean('is_anonymous', false);
        
        if (isset($validated['status'])) {
            $validated['status'] = (string) $validated['status'];
        }
        
        // Store old values for logging and notifications
        $oldValues = $report->getAttributes();
        $oldStatus = $report->status;
        $oldAssignedTo = $report->assigned_to;
        
        // Handle timestamps
        $this->handleTimestamps($report, $validated);
        
        // Track changes
        $changes = $this->trackChanges($oldValues, $validated);
        
        // Update the report
        foreach ($validated as $key => $value) {
            $report->$key = $value;
        }
        $report->save();
        
        // Send notifications
        $this->sendUpdateNotifications($report, $oldStatus, $oldAssignedTo, $validated, $changes);
        
        // Log the update
        $this->logUpdate($report, $changes);
        
        return redirect()->route('admin.community-reports.show', $report)
            ->with('success', 'Community report updated successfully.');
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'report_type_id' => 'sometimes|exists:report_types,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'detailed_description' => 'nullable|string',
            'location' => 'sometimes|string|max:255',
            'incident_date' => 'sometimes|date',
            'incident_time' => 'nullable|date_format:H:i',
            'urgency_level' => 'sometimes|in:low,medium,high',
            'recurring_issue' => 'boolean',
            'affected_people' => 'sometimes|in:individual,family,group,community,multiple',
            'estimated_affected_count' => 'nullable|integer|min:0',
            'is_anonymous' => 'boolean',
            'reporter_name' => 'nullable|string|max:255',
            'reporter_contact' => 'nullable|string|max:50',
            'reporter_address' => 'nullable|string|max:500',
            'perpetrator_details' => 'nullable|string|max:1000',
            'preferred_resolution' => 'nullable|string|max:1000',
            'has_previous_report' => 'boolean',
            'previous_report_id' => 'nullable|exists:community_reports,id',
            'impact_level' => 'sometimes|in:minor,moderate,major,severe',
            'safety_concern' => 'boolean',
            'environmental_impact' => 'boolean',
            'noise_level' => 'nullable|in:low,medium,high',
            'duration_hours' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:pending,under_review,assigned,in_progress,resolved,rejected',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
            'resolution_notes' => 'nullable|string',
            'resolved_at' => 'nullable|date',
            'acknowledged_at' => 'nullable|date',
        ]);
    }

    private function handleTimestamps(CommunityReport $report, array &$validated): void
    {
        if (isset($validated['status']) && $validated['status'] === 'resolved' && $report->status !== 'resolved') {
            $validated['resolved_at'] = now();
        } elseif (isset($validated['status']) && $validated['status'] !== 'resolved') {
            $validated['resolved_at'] = null;
        }
        
        if (isset($validated['status']) && $validated['status'] === 'under_review' && $report->status !== 'under_review') {
            $validated['acknowledged_at'] = now();
        }
    }

    private function trackChanges(array $oldValues, array $validated): array
    {
        $changes = [];
        foreach ($validated as $key => $value) {
            if (isset($oldValues[$key]) && $oldValues[$key] != $value) {
                $changes[$key] = [
                    'from' => $oldValues[$key],
                    'to' => $value
                ];
            }
        }
        return $changes;
    }

    private function sendUpdateNotifications(CommunityReport $report, $oldStatus, $oldAssignedTo, array $validated, array $changes): void
    {
        $authUser = Auth::user();
        
        if ($report->is_anonymous || !$report->user_id) {
            return;
        }
        
        $reportOwner = User::find($report->user_id);
        
        if (!$reportOwner) {
            return;
        }
        
        // Assignment changed
        if (isset($validated['assigned_to']) && $oldAssignedTo != $validated['assigned_to']) {
            if ($validated['assigned_to']) {
                $this->notificationController->sendAssignmentNotification($report, $reportOwner, $authUser);
            } else {
                $this->notificationController->sendAssignmentRemovedNotification($report, $reportOwner, $authUser);
            }
        }
        
        // Status changed
        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            $skipStatusChange = ($validated['status'] === 'assigned' && 
                                 isset($validated['assigned_to']) && 
                                 $validated['assigned_to'] && 
                                 $oldAssignedTo != $validated['assigned_to']);
            
            if (!$skipStatusChange) {
                $this->notificationController->sendStatusChangeNotification($report, $reportOwner, $oldStatus, $validated['status']);
            }
        }
        
        // Staff assignment
        if (isset($validated['assigned_to']) && $validated['assigned_to'] && $oldAssignedTo != $validated['assigned_to']) {
            $assignedStaff = User::find($validated['assigned_to']);
            if ($assignedStaff) {
                $this->notificationController->sendStaffAssignmentNotification($report, $assignedStaff, $authUser);
            }
        }
        
        // Staff unassignment
        if (isset($validated['assigned_to']) && $oldAssignedTo && $oldAssignedTo != $validated['assigned_to']) {
            $previousAssignee = User::find($oldAssignedTo);
            if ($previousAssignee) {
                $this->notificationController->sendStaffUnassignmentNotification($report, $previousAssignee, $authUser);
            }
        }
    }

    private function logUpdate(CommunityReport $report, array $changes): void
    {
        if (empty($changes)) {
            return;
        }
        
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'changes' => $changes,
                'ip' => request()->ip(),
                'report_number' => $report->report_number,
            ])
            ->event('updated')
            ->log("Updated community report #{$report->report_number}");
    }
}