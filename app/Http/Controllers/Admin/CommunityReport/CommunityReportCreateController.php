<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\ReportType;
use App\Models\Purok;
use App\Models\Resident;
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
        
        // Fetch residents directly
        $residents = Resident::select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'email',
                'contact_number',
                'address',
                'purok_id'
            )
            ->with('purok') // Load the purok relationship to get the purok name
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(fn($resident) => [
                'id' => $resident->id,
                'name' => $resident->full_name, // Use the accessor from the model
                'email' => $resident->email,
                'phone' => $resident->contact_number,
                'address' => $resident->address,
                'purok' => $resident->purok?->name, // Get purok name from relationship
                'purok_id' => $resident->purok_id,
            ])
            ->sortBy('name')
            ->values();
        
        return Inertia::render('admin/CommunityReports/Create', [
            'report_types' => $reportTypes,
            'categories' => $categories,
            'puroks' => $puroks,
            'users' => $residents, // Keep as 'users' for frontend compatibility
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