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
        ->with([
            'role:id,name,is_system_role',
            'currentResident' => function($query) {
                $query->select([
                    'id', 'first_name', 'middle_name', 'last_name', 
                    'suffix', 'address', 'purok_id', 'contact_number', 'email'
                ])->with('purok:id,name');
            }
        ])
        ->get()
        ->sortBy(function ($user) {
            $resident = $user->currentResident;
            if ($resident && $resident->last_name) {
                return $resident->last_name . ($resident->first_name ?? '');
            }
            return $user->position ?? $user->username ?? $user->email;
        })
        ->values()
        ->map(function ($user) {
            $resident = $user->currentResident;
            
            // If resident exists with name data, use resident data
            if ($resident && ($resident->first_name || $resident->last_name)) {
                // Build full name from resident data
                $fullName = trim(implode(' ', array_filter([
                    $resident->first_name,
                    $resident->middle_name,
                    $resident->last_name,
                    $resident->suffix
                ])));
                
                $firstName = $resident->first_name;
                $lastName = $resident->last_name;
                $phone = $resident->contact_number;
                $email = $resident->email ?: $user->email;
                $address = $resident->address;
                $purok = $resident->purok ? $resident->purok->name : null;
                
                // Generate initials from resident name
                $initials = '';
                if ($firstName && $lastName) {
                    $initials = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
                } elseif ($firstName) {
                    $initials = strtoupper(substr($firstName, 0, 2));
                } elseif ($lastName) {
                    $initials = strtoupper(substr($lastName, 0, 2));
                }
                
                return [
                    'id' => $user->id,
                    'user_id' => $user->id,
                    'resident_id' => $resident->id,
                    'name' => $fullName,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'phone' => $phone,
                    'username' => $user->username,
                    'position' => $user->position,
                    'role' => $user->role ? $user->role->name : 'No role assigned',
                    'purok' => $purok,
                    'address' => $address,
                    'is_active' => $user->status === 'active',
                    'initials' => $initials,
                    'avatar' => null,
                ];
            } 
            
            // Fallback for staff without resident records (use user data)
            $fullName = $user->position ?? $user->username ?? $user->email;
            $initials = '';
            if ($user->username) {
                $initials = strtoupper(substr($user->username, 0, 2));
            } elseif ($user->email) {
                $initials = strtoupper(substr($user->email, 0, 2));
            } elseif ($user->position) {
                $initials = strtoupper(substr($user->position, 0, 2));
            }
            
            return [
                'id' => $user->id,
                'user_id' => $user->id,
                'resident_id' => null,
                'name' => $fullName,
                'first_name' => null,
                'last_name' => null,
                'email' => $user->email,
                'phone' => $user->contact_number,
                'username' => $user->username,
                'position' => $user->position,
                'role' => $user->role ? $user->role->name : 'No role assigned',
                'purok' => null,
                'address' => null,
                'is_active' => $user->status === 'active',
                'initials' => $initials,
                'avatar' => null,
            ];
        });
}
}