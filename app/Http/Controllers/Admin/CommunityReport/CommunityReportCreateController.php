<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\ReportType;
use App\Models\Purok;
use App\Models\Resident;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        
        return Inertia::render('admin/CommunityReports/Create', [
            'report_types' => $reportTypes,
            'categories' => $categories,
            'puroks' => $puroks,
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

    /**
     * Search residents via AJAX for community report complainant selection
     */
    public function searchResidents(Request $request)
    {
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        $perPage = 50;
        
        $query = Resident::with('purok')
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'suffix',
                'email',
                'contact_number',
                'address',
                'purok_id',
                'photo_path',
                'civil_status',
                'gender',
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhereHas('purok', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        $data = $paginator->map(function($resident) {
            return [
                'id' => $resident->id,
                'name' => $resident->full_name,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'middle_name' => $resident->middle_name,
                'suffix' => $resident->suffix,
                'email' => $resident->email,
                'phone' => $resident->contact_number,
                'address' => $resident->address,
                'purok' => $resident->purok?->name,
                'purok_id' => $resident->purok_id,
                'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                'civil_status' => $resident->civil_status,
                'gender' => $resident->gender,
            ];
        });
        
        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }
}