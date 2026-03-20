<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use App\Models\ReportType;
use App\Models\User;
use Inertia\Inertia;

class CommunityReportEditController extends BaseCommunityReportController
{
    public function edit(CommunityReport $report)
    {
        $report->load(['user:id,first_name,last_name,email,contact_number', 'reportType:id,name,category', 'assignedTo:id,first_name,last_name']);
        
        $fullName = $report->user ? trim(($report->user->first_name ?? '') . ' ' . ($report->user->last_name ?? '')) : null;
        $assignedToName = $report->assignedTo ? trim(($report->assignedTo->first_name ?? '') . ' ' . ($report->assignedTo->last_name ?? '')) : null;
        
        return Inertia::render('admin/CommunityReports/Edit', [
            'report' => [
                'id' => $report->id,
                'report_number' => $report->report_number ?? 'N/A',
                'user' => $report->user ? [
                    'id' => $report->user->id,
                    'first_name' => $report->user->first_name,
                    'last_name' => $report->user->last_name,
                    'full_name' => $fullName,
                    'email' => $report->user->email,
                    'phone' => $report->user->contact_number,
                ] : null,
                'report_type_id' => $report->report_type_id,
                'report_type' => $report->reportType ? [
                    'id' => $report->reportType->id,
                    'name' => $report->reportType->name,
                    'category' => $report->reportType->category,
                ] : null,
                'title' => $report->title,
                'description' => $report->description,
                'detailed_description' => $report->detailed_description,
                'location' => $report->location,
                'incident_date' => $report->incident_date?->format('Y-m-d'),
                'incident_time' => $report->incident_time,
                'urgency_level' => $report->urgency_level,
                'recurring_issue' => (bool) $report->recurring_issue,
                'affected_people' => $report->affected_people,
                'estimated_affected_count' => $report->estimated_affected_count,
                'is_anonymous' => (bool) $report->is_anonymous,
                'reporter_name' => $report->reporter_name,
                'reporter_contact' => $report->reporter_contact,
                'reporter_address' => $report->reporter_address,
                'perpetrator_details' => $report->perpetrator_details,
                'preferred_resolution' => $report->preferred_resolution,
                'has_previous_report' => (bool) $report->has_previous_report,
                'previous_report_id' => $report->previous_report_id,
                'impact_level' => $report->impact_level,
                'safety_concern' => (bool) $report->safety_concern,
                'environmental_impact' => (bool) $report->environmental_impact,
                'noise_level' => $report->noise_level,
                'duration_hours' => $report->duration_hours,
                'status' => $report->status,
                'priority' => $report->priority,
                'assigned_to' => $report->assignedTo ? [
                    'id' => $report->assignedTo->id,
                    'name' => $assignedToName,
                ] : null,
                'resolution_notes' => $report->resolution_notes,
                'resolved_at' => $report->resolved_at?->format('Y-m-d'),
                'acknowledged_at' => $report->acknowledged_at?->format('Y-m-d'),
            ],
            'statuses' => ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'],
            'priorities' => ['low', 'medium', 'high', 'critical'],
            'urgencies' => ['low', 'medium', 'high'],
            'impact_levels' => ['minor', 'moderate', 'major', 'severe'],
            'affected_people_options' => ['individual', 'family', 'group', 'community', 'multiple'],
            'report_types' => ReportType::orderBy('name')->get(['id', 'name', 'category']),
            'staff' => User::whereHas('role', fn($q) => $q->where('name', '!=', 'Resident'))
                ->whereNotNull('role_id')
                ->where('status', 'active')
                ->with(['role:id,name', 'currentResident:id,first_name,middle_name,last_name'])
                ->get()
                ->sortBy(fn($u) => ($u->currentResident->last_name ?? '') . ($u->currentResident->first_name ?? ''))
                ->values()
                ->map(fn($u) => [
                    'id' => $u->id,
                    'name' => trim(($u->currentResident->first_name ?? '') . ' ' . 
                                   ($u->currentResident->middle_name ?? '') . ' ' . 
                                   ($u->currentResident->last_name ?? '')),
                    'email' => $u->email,
                    'phone' => $u->contact_number,
                    'position' => $u->position,
                    'role' => $u->role ? $u->role->name : 'No role assigned',
                ]),
        ]);
    }
}