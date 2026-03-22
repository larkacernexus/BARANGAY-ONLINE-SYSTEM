<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use App\Models\ReportType;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class CommunityReportShowController extends BaseCommunityReportController
{
    public function show(CommunityReport $report)
    {
        $report->load([
            'user:id,first_name,last_name,email,contact_number',
            'user.currentResident.purok:id,name',
            'reportType:id,name,category,description',
            'assignedTo:id,first_name,last_name,email,contact_number,position,role_id,username',
            'assignedTo.role:id,name,is_system_role',
            'assignedTo.currentResident:id,first_name,middle_name,last_name,suffix,address,contact_number,email,purok_id',
            'assignedTo.currentResident.purok:id,name',
            'previousReport:id,report_number,title,status',
            'evidences'
        ]);
        
        $this->logView($report);
        
        $activityLogs = $this->getActivityLogs($report);
        $ownerNotifications = $this->getOwnerNotifications($report);
        $similarReports = $this->getSimilarReports($report);
        $staff = $this->getStaffForAssignment();
        $reportData = $this->formatReportData($report);
        
        return Inertia::render('admin/CommunityReports/Show', [
            'report' => $reportData,
            'similar_reports' => $similarReports,
            'activity_logs' => $activityLogs,
            'owner_notifications' => $ownerNotifications,
            'statuses' => ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'],
            'priorities' => ['low', 'medium', 'high', 'critical'],
            'urgencies' => ['low', 'medium', 'high'],
            'impact_levels' => ['low', 'moderate', 'high', 'severe'],
            'affected_people_options' => ['individual', 'family', 'community'],
            'report_types' => ReportType::orderBy('name')->get(['id', 'name', 'category']),
            'staff' => $staff,
        ]);
    }

    private function formatReportData(CommunityReport $report): array
    {
        // Format assignedTo data with resident information
        $assignedToData = null;
        if ($report->assignedTo) {
            $resident = $report->assignedTo->currentResident;
            
            if ($resident && ($resident->first_name || $resident->last_name)) {
                $fullName = trim(implode(' ', array_filter([
                    $resident->first_name,
                    $resident->middle_name,
                    $resident->last_name,
                    $resident->suffix
                ])));
                $firstName = $resident->first_name;
                $lastName = $resident->last_name;
                $phone = $resident->contact_number;
                $email = $resident->email ?: $report->assignedTo->email;
                $address = $resident->address;
                $purok = $resident->purok ? $resident->purok->name : null;
                $initials = '';
                if ($firstName && $lastName) {
                    $initials = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
                }
                
                $assignedToData = [
                    'id' => $report->assignedTo->id,
                    'user_id' => $report->assignedTo->id,
                    'resident_id' => $resident->id,
                    'name' => $fullName,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'phone' => $phone,
                    'username' => $report->assignedTo->username,
                    'position' => $report->assignedTo->position,
                    'role' => $report->assignedTo->role?->name,
                    'purok' => $purok,
                    'address' => $address,
                    'is_active' => $report->assignedTo->status === 'active',
                    'initials' => $initials,
                    'avatar' => null,
                ];
            } else {
                // Fallback for staff without resident records
                $fullName = $report->assignedTo->position ?? $report->assignedTo->username ?? $report->assignedTo->email;
                $initials = '';
                if ($report->assignedTo->username) {
                    $initials = strtoupper(substr($report->assignedTo->username, 0, 2));
                } elseif ($report->assignedTo->email) {
                    $initials = strtoupper(substr($report->assignedTo->email, 0, 2));
                }
                
                $assignedToData = [
                    'id' => $report->assignedTo->id,
                    'user_id' => $report->assignedTo->id,
                    'resident_id' => null,
                    'name' => $fullName,
                    'first_name' => null,
                    'last_name' => null,
                    'email' => $report->assignedTo->email,
                    'phone' => $report->assignedTo->contact_number,
                    'username' => $report->assignedTo->username,
                    'position' => $report->assignedTo->position,
                    'role' => $report->assignedTo->role?->name,
                    'purok' => null,
                    'address' => null,
                    'is_active' => $report->assignedTo->status === 'active',
                    'initials' => $initials,
                    'avatar' => null,
                ];
            }
        }
        
        // Format user data with resident information
        $userData = null;
        if ($report->user) {
            $resident = $report->user->currentResident;
            $fullName = null;
            $address = null;
            $purok = null;
            
            if ($resident && ($resident->first_name || $resident->last_name)) {
                $fullName = trim(implode(' ', array_filter([
                    $resident->first_name,
                    $resident->middle_name,
                    $resident->last_name,
                    $resident->suffix
                ])));
                $address = $resident->address;
                $purok = $resident->purok ? $resident->purok->name : null;
            } else {
                $fullName = trim(($report->user->first_name ?? '') . ' ' . ($report->user->last_name ?? ''));
            }
            
            $userData = [
                'id' => $report->user->id,
                'first_name' => $report->user->first_name,
                'last_name' => $report->user->last_name,
                'full_name' => $fullName,
                'email' => $report->user->email,
                'phone' => $report->user->contact_number,
                'address' => $address,
                'purok' => $purok,
                'has_resident' => $resident !== null,
            ];
        }
        
        return [
            'id' => $report->id,
            'report_number' => $report->report_number,
            'user_id' => $report->user_id,
            'user' => $userData,
            'report_type_id' => $report->report_type_id,
            'report_type' => $report->reportType ? [
                'id' => $report->reportType->id,
                'name' => $report->reportType->name,
                'category' => $report->reportType->category,
                'description' => $report->reportType->description,
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
            'previous_report' => $report->previousReport ? [
                'id' => $report->previousReport->id,
                'report_number' => $report->previousReport->report_number,
                'title' => $report->previousReport->title,
                'status' => $report->previousReport->status,
            ] : null,
            'impact_level' => $report->impact_level,
            'safety_concern' => (bool) $report->safety_concern,
            'environmental_impact' => (bool) $report->environmental_impact,
            'noise_level' => $report->noise_level,
            'duration_hours' => $report->duration_hours,
            'status' => $report->status,
            'priority' => $report->priority,
            'assigned_to' => $report->assigned_to,
            'assignedTo' => $assignedToData,
            'resolution_notes' => $report->resolution_notes,
            'resolved_at' => $report->resolved_at?->format('Y-m-d H:i:s'),
            'acknowledged_at' => $report->acknowledged_at?->format('Y-m-d H:i:s'),
            'created_at' => $report->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $report->updated_at?->format('Y-m-d H:i:s'),
            'evidences' => $report->evidences->map(fn($e) => [
                'id' => $e->id,
                'file_path' => $e->file_path,
                'file_name' => $e->file_name,
                'file_type' => $e->file_type,
                'file_size' => $e->file_size,
                'url' => Storage::url($e->file_path),
            ]),
            'status_color' => $report->status_color,
            'priority_color' => $report->priority_color,
            'urgency_color' => $report->urgency_color,
        ];
    }

    private function logView(CommunityReport $report): void
    {
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'report_number' => $report->report_number,
            ])
            ->event('viewed')
            ->log("Viewed community report #{$report->report_number}");
    }

    private function getActivityLogs(CommunityReport $report)
    {
        return Activity::where(function($query) use ($report) {
                $query->where('subject_type', CommunityReport::class)
                    ->where('subject_id', $report->id);
            })
            ->orWhere('description', 'like', "%report #{$report->report_number}%")
            ->orWhere('description', 'like', "%report_id:{$report->id}%")
            ->with(['causer:id,first_name,last_name'])
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'user_id' => $log->causer_id,
                'user_name' => $log->causer ? $log->causer->first_name . ' ' . $log->causer->last_name : 'System',
                'action' => $log->event,
                'details' => $log->description,
                'changes' => $log->changes ?? [],
                'created_at' => $log->created_at?->format('Y-m-d H:i:s'),
            ]);
    }

    private function getOwnerNotifications(CommunityReport $report)
    {
        if ($report->is_anonymous || !$report->user_id) {
            return [];
        }
        
        return DB::table('notifications')
            ->where('notifiable_id', $report->user_id)
            ->where('notifiable_type', 'App\Models\User')
            ->where(function($query) use ($report) {
                $query->where('data->report_id', $report->id)
                      ->orWhere('data->report_number', $report->report_number);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'data' => json_decode($n->data, true),
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
                'formatted_date' => Carbon::parse($n->created_at)->diffForHumans(),
                'is_read' => !is_null($n->read_at),
            ]);
    }

    private function getSimilarReports(CommunityReport $report)
    {
        $similarReports = CommunityReport::where('id', '!=', $report->id)
            ->where('status', '!=', 'resolved')
            ->where(function ($query) use ($report) {
                if ($report->report_type_id) {
                    $query->orWhere('report_type_id', $report->report_type_id);
                }
                if ($report->location) {
                    $query->orWhere('location', 'like', "%{$report->location}%");
                }
                if ($report->user_id && !$report->is_anonymous) {
                    $query->orWhere('user_id', $report->user_id);
                }
            })
            ->with(['user:id,first_name,last_name', 'reportType:id,name'])
            ->latest()
            ->limit(5)
            ->get();
        
        return $similarReports->map(fn($sr) => [
            'id' => $sr->id,
            'report_number' => $sr->report_number ?? 'N/A',
            'title' => $sr->title,
            'report_type' => $sr->reportType ? ['name' => $sr->reportType->name] : null,
            'status' => $sr->status,
            'priority' => $sr->priority,
            'urgency_level' => $sr->urgency_level,
            'created_at' => $sr->created_at?->format('Y-m-d H:i:s'),
            'user' => $sr->user ? [
                'id' => $sr->user->id,
                'name' => trim(($sr->user->first_name ?? '') . ' ' . ($sr->user->last_name ?? '')),
            ] : null,
        ]);
    }
}