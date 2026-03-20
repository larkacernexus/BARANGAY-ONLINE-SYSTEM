<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\ReportType;
use App\Models\Purok;
use App\Models\User;
use Inertia\Inertia;

class CommunityReportCreateController extends BaseCommunityReportController
{
    public function create()
    {
        $reportTypes = ReportType::orderBy('name')->get(['id', 'name', 'category', 'description']);
        
        $categories = ReportType::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category')
            ->toArray();
        
        $puroks = Purok::select('name as purok')
            ->orderBy('name')
            ->pluck('purok')
            ->toArray();
        
        $users = User::whereHas('currentResident')
            ->with(['currentResident:id,first_name,middle_name,last_name,address'])
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => trim(($user->currentResident->first_name ?? '') . ' ' . 
                               ($user->currentResident->middle_name ?? '') . ' ' . 
                               ($user->currentResident->last_name ?? '')) ?: $user->email,
                'email' => $user->email,
                'phone' => $user->contact_number,
                'address' => $user->currentResident->address ?? null,
            ])
            ->sortBy('name')
            ->values();
        
        return Inertia::render('admin/CommunityReports/Create', [
            'report_types' => $reportTypes,
            'categories' => $categories,
            'puroks' => $puroks,
            'users' => $users,
            'statuses' => [
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'under_review', 'label' => 'Under Review'],
                ['value' => 'assigned', 'label' => 'Assigned'],
                ['value' => 'in_progress', 'label' => 'In Progress'],
                ['value' => 'resolved', 'label' => 'Resolved'],
                ['value' => 'rejected', 'label' => 'Rejected'],
            ],
            'urgencies' => [
                ['value' => 'low', 'label' => 'Low'],
                ['value' => 'medium', 'label' => 'Medium'],
                ['value' => 'high', 'label' => 'High'],
            ],
            'priorities' => [
                ['value' => 'low', 'label' => 'Low'],
                ['value' => 'medium', 'label' => 'Medium'],
                ['value' => 'high', 'label' => 'High'],
                ['value' => 'critical', 'label' => 'Critical'],
            ],
            'impact_levels' => [
                ['value' => 'minor', 'label' => 'Minor'],
                ['value' => 'moderate', 'label' => 'Moderate'],
                ['value' => 'major', 'label' => 'Major'],
                ['value' => 'severe', 'label' => 'Severe'],
            ],
            'affected_people_options' => [
                ['value' => 'individual', 'label' => 'Individual'],
                ['value' => 'family', 'label' => 'Family'],
                ['value' => 'group', 'label' => 'Group'],
                ['value' => 'community', 'label' => 'Community'],
                ['value' => 'multiple', 'label' => 'Multiple'],
            ],
            'noise_levels' => [
                ['value' => 'low', 'label' => 'Low'],
                ['value' => 'medium', 'label' => 'Medium'],
                ['value' => 'high', 'label' => 'High'],
            ],
        ]);
    }
}