<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Http\Controllers\Controller;
use App\Models\CommunityReport;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

abstract class BaseCommunityReportController extends Controller
{
    /**
     * Get average resolution time
     */
    protected function getAverageResolutionTime(): string
    {
        $resolvedReports = CommunityReport::whereNotNull('resolved_at')
            ->whereNotNull('created_at')
            ->where('status', 'resolved')
            ->get();
        
        if ($resolvedReports->isEmpty()) {
            return 'N/A';
        }
        
        $totalHours = 0;
        foreach ($resolvedReports as $report) {
            $created = Carbon::parse($report->created_at);
            $resolved = Carbon::parse($report->resolved_at);
            $totalHours += $resolved->diffInHours($created);
        }
        
        $avgHours = $totalHours / $resolvedReports->count();
        
        if ($avgHours < 24) {
            return round($avgHours) . ' hours';
        } else {
            return round($avgHours / 24, 1) . ' days';
        }
    }

    /**
     * Format file size
     */
    protected function formatFileSize($bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    /**
     * Get user name by ID
     */
    protected function getUserNameById($userId)
    {
        if (!$userId) return null;
        
        $user = User::with('currentResident')->find($userId);
        if (!$user) return null;
        
        if ($user->currentResident) {
            $firstName = $user->currentResident->first_name ?? '';
            $middleName = $user->currentResident->middle_name ?? '';
            $lastName = $user->currentResident->last_name ?? '';
            return trim("{$firstName} {$middleName} {$lastName}");
        }
        
        return $user->name ?? $user->email ?? 'Unknown';
    }

    /**
     * Get sent via string
     */
    protected function getSentVia(Request $request): string
    {
        $channels = [];
        
        if ($request->boolean('send_email')) $channels[] = 'email';
        if ($request->boolean('send_sms')) $channels[] = 'sms';
        
        return empty($channels) ? 'internal' : implode(', ', $channels);
    }

    /**
     * Format report for print
     */
    protected function formatReportForPrint(CommunityReport $report): array
    {
        $fullName = $report->user ? $report->user->first_name . ' ' . $report->user->last_name : null;
        $assignedToName = $report->assignedTo ? $report->assignedTo->first_name . ' ' . $report->assignedTo->last_name : null;
        
        return [
            'id' => $report->id,
            'report_number' => $report->report_number ?? 'N/A',
            'user' => $report->user ? [
                'name' => $fullName,
                'email' => $report->user->email,
                'phone' => $report->user->contact_number,
                'address' => $report->user->currentResident->address ?? null,
                'purok' => $report->user->currentResident && $report->user->currentResident->purok ? 
                    $report->user->currentResident->purok->name : null,
            ] : null,
            'report_type' => $report->reportType ? [
                'name' => $report->reportType->name,
                'category' => $report->reportType->category,
            ] : null,
            'title' => $report->title,
            'description' => $report->description,
            'detailed_description' => $report->detailed_description,
            'location' => $report->location,
            'incident_date' => $report->incident_date ? $report->incident_date->format('F d, Y') : null,
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
            'impact_level' => $report->impact_level,
            'safety_concern' => (bool) $report->safety_concern,
            'environmental_impact' => (bool) $report->environmental_impact,
            'noise_level' => $report->noise_level,
            'duration_hours' => $report->duration_hours,
            'status' => $report->status,
            'priority' => $report->priority,
            'assigned_to' => $report->assignedTo ? [
                'name' => $assignedToName,
            ] : null,
            'resolution_notes' => $report->resolution_notes,
            'resolved_at' => $report->resolved_at ? $report->resolved_at->format('F d, Y') : null,
            'created_at' => $report->created_at ? $report->created_at->format('F d, Y') : null,
            'evidences' => $report->evidences ? $report->evidences->map(function ($evidence) {
                return [
                    'file_name' => $evidence->file_name,
                    'file_type' => $evidence->file_type,
                    'file_size' => $this->formatFileSize($evidence->file_size),
                ];
            }) : [],
        ];
    }

    /**
     * Get staff for assignment
     */
    protected function getStaffForAssignment()
    {
        return User::whereHas('role', function ($query) {
                $query->where('is_system_role', 1);
            })
            ->whereNotNull('role_id')
            ->where('status', 'active')
            ->with(['role:id,name,is_system_role', 'currentResident:id,first_name,middle_name,last_name'])
            ->get()
            ->sortBy(function ($user) {
                $lastName = $user->currentResident->last_name ?? '';
                $firstName = $user->currentResident->first_name ?? '';
                return $lastName . $firstName;
            })
            ->values()
            ->map(function ($user) {
                $firstName = $user->currentResident->first_name ?? '';
                $middleName = $user->currentResident->middle_name ?? '';
                $lastName = $user->currentResident->last_name ?? '';
                $fullName = trim("{$firstName} {$middleName} {$lastName}");
                
                if (empty($fullName)) {
                    $fullName = trim($user->first_name . ' ' . $user->last_name);
                }
                if (empty($fullName)) {
                    $fullName = $user->email ?? 'Unknown User';
                }
                
                $initials = '';
                if ($firstName && $lastName) {
                    $initials = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
                } elseif ($firstName) {
                    $initials = strtoupper(substr($firstName, 0, 2));
                } elseif ($user->first_name && $user->last_name) {
                    $initials = strtoupper(substr($user->first_name, 0, 1) . substr($user->last_name, 0, 1));
                } elseif ($user->email) {
                    $initials = strtoupper(substr($user->email, 0, 2));
                }
                
                return [
                    'id' => $user->id,
                    'name' => $fullName,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $user->email,
                    'phone' => $user->contact_number,
                    'position' => $user->position,
                    'role' => $user->role ? $user->role->name : 'No role assigned',
                    'role_id' => $user->role_id,
                    'is_system_role' => $user->role ? $user->role->is_system_role : false,
                    'initials' => $initials,
                    'avatar' => null,
                ];
            });
    }
}