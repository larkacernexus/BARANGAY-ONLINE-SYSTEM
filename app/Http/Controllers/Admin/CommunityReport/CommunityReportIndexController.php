<?php

namespace App\Http\Controllers\Admin\CommunityReport;

use App\Models\CommunityReport;
use App\Models\ReportType;
use App\Models\Purok;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CommunityReportIndexController extends BaseCommunityReportController
{
    /**
     * Allowed per page options
     */
    protected const ALLOWED_PER_PAGE = ['15', '30', '50', '100', '500'];
    
    /**
     * Default per page value
     */
    protected const DEFAULT_PER_PAGE = 15;

    public function index(Request $request)
    {
        // Start with base query
        $query = CommunityReport::with(['user:id,resident_id,email,contact_number', 'reportType:id,name,category', 'assignedTo:id,resident_id'])
            ->latest();
        
        // Apply filters
        $this->applyFilters($query, $request);
        
        // Get filter data
        $categories = $this->getCategories();
        $reportTypes = $this->getReportTypes();
        $puroks = $this->getPuroks();
        $staff = $this->getStaff();
        
        // Calculate statistics
        $stats = $this->getStats();
        
        // Get reports with dynamic pagination
        $perPage = $this->getPerPage($request);
        $reports = $query->paginate($perPage)->withQueryString();
        
        // Format reports data
        $formattedReports = $reports->map(fn($report) => $this->formatReport($report));
        
        // Status options
        $statuses = [
            'pending' => 'Pending',
            'under_review' => 'Under Review',
            'assigned' => 'Assigned',
            'in_progress' => 'In Progress',
            'resolved' => 'Resolved',
            'rejected' => 'Rejected'
        ];
        
        // Priority options
        $priorities = [
            'critical' => 'Critical',
            'high' => 'High',
            'medium' => 'Medium',
            'low' => 'Low'
        ];
        
        // Urgency options
        $urgencies = [
            'high' => 'High',
            'medium' => 'Medium',
            'low' => 'Low'
        ];
        
        return Inertia::render('admin/CommunityReports/Index', [
            'reports' => [
                'data' => $formattedReports,
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
                'from' => $reports->firstItem(),
                'to' => $reports->lastItem(),
            ],
            'stats' => $stats,
            'filters' => $request->only([
                'search', 'status', 'priority', 'urgency', 'report_type', 
                'category', 'impact_level', 'from_date', 'to_date', 
                'has_evidences', 'safety_concern', 'environmental_impact',
                'recurring_issue', 'is_anonymous', 'affected_people', 'per_page'
            ]),
            'statuses' => $statuses,
            'priorities' => $priorities,
            'urgencies' => $urgencies,
            'report_types' => $reportTypes,
            'categories' => $categories,
            'puroks' => $puroks,
            'staff' => $staff,
        ]);
    }

    /**
     * Get the per page value from request
     *
     * @param Request $request
     * @return int
     */
    private function getPerPage(Request $request): int
    {
        $perPage = $request->input('per_page', self::DEFAULT_PER_PAGE);
        
        // Validate that per_page is in allowed values
        if (in_array($perPage, self::ALLOWED_PER_PAGE)) {
            return (int) $perPage;
        }
        
        // Return default if invalid value
        return self::DEFAULT_PER_PAGE;
    }

    private function applyFilters($query, Request $request)
    {
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('report_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('reporter_name', 'like', "%{$search}%")
                  ->orWhere('reporter_contact', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('email', 'like', "%{$search}%")
                        ->orWhereHas('resident', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%")
                              ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$search}%");
                        });
                  })
                  ->orWhereHas('reportType', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        if ($request->filled('urgency') && $request->urgency !== 'all') {
            $query->where('urgency_level', $request->urgency);
        }
        
        if ($request->filled('report_type') && $request->report_type !== 'all') {
            $query->where('report_type_id', $request->report_type);
        }
        
        if ($request->filled('category') && $request->category !== 'all') {
            $query->whereHas('reportType', fn($q) => $q->where('category', $request->category));
        }
        
        if ($request->filled('impact_level') && $request->impact_level !== 'all') {
            $query->where('impact_level', $request->impact_level);
        }
        
        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->whereBetween('incident_date', [
                $request->from_date,
                Carbon::parse($request->to_date)->endOfDay()
            ]);
        } elseif ($request->filled('from_date')) {
            $query->whereDate('incident_date', '>=', $request->from_date);
        } elseif ($request->filled('to_date')) {
            $query->whereDate('incident_date', '<=', $request->to_date);
        }
        
        if ($request->filled('has_evidences') && $request->has_evidences == 'true') {
            $query->whereHas('evidences');
        }
        
        if ($request->filled('safety_concern') && $request->safety_concern == 'true') {
            $query->where('safety_concern', true);
        }
        
        if ($request->filled('environmental_impact') && $request->environmental_impact == 'true') {
            $query->where('environmental_impact', true);
        }
        
        if ($request->filled('recurring_issue') && $request->recurring_issue == 'true') {
            $query->where('recurring_issue', true);
        }
        
        if ($request->filled('is_anonymous') && $request->is_anonymous == 'true') {
            $query->where('is_anonymous', true);
        }
        
        if ($request->filled('affected_people') && $request->affected_people !== 'all') {
            $query->where('affected_people', $request->affected_people);
        }
    }

    private function getCategories()
    {
        return ReportType::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category')
            ->toArray();
    }

    private function getReportTypes()
    {
        return ReportType::select('id', 'name', 'category')
            ->orderBy('name')
            ->get();
    }

    private function getPuroks()
    {
        return Purok::select('name as purok')
            ->orderBy('name')
            ->pluck('purok')
            ->toArray();
    }

    private function getStaff()
    {
        return User::whereHas('role', fn($q) => $q->where('name', '!=', 'Resident'))
            ->whereNotNull('role_id')
            ->where('status', 'active')
            ->with(['role:id,name', 'currentResident:id,first_name,middle_name,last_name'])
            ->get()
            ->sortBy(fn($user) => ($user->currentResident->last_name ?? '') . ($user->currentResident->first_name ?? ''))
            ->values()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => trim(($user->currentResident->first_name ?? '') . ' ' . 
                               ($user->currentResident->middle_name ?? '') . ' ' . 
                               ($user->currentResident->last_name ?? '')),
                'email' => $user->email,
                'phone' => $user->contact_number,
                'position' => $user->position,
                'role' => $user->role ? $user->role->name : 'No role assigned',
            ]);
    }

    private function getStats()
    {
        $today = Carbon::today();
        $weekAgo = Carbon::today()->subDays(7);
        $monthAgo = Carbon::today()->subDays(30);
        
        return [
            'total' => CommunityReport::count(),
            'pending' => CommunityReport::where('status', 'pending')->count(),
            'under_review' => CommunityReport::where('status', 'under_review')->count(),
            'assigned' => CommunityReport::where('status', 'assigned')->count(),
            'in_progress' => CommunityReport::where('status', 'in_progress')->count(),
            'resolved' => CommunityReport::where('status', 'resolved')->count(),
            'rejected' => CommunityReport::where('status', 'rejected')->count(),
            'critical_priority' => CommunityReport::where('priority', 'critical')->count(),
            'high_priority' => CommunityReport::where('priority', 'high')->count(),
            'medium_priority' => CommunityReport::where('priority', 'medium')->count(),
            'low_priority' => CommunityReport::where('priority', 'low')->count(),
            'high_urgency' => CommunityReport::where('urgency_level', 'high')->count(),
            'today' => CommunityReport::whereDate('created_at', $today)->count(),
            'this_week' => CommunityReport::where('created_at', '>=', $weekAgo)->count(),
            'this_month' => CommunityReport::where('created_at', '>=', $monthAgo)->count(),
            'anonymous' => CommunityReport::where('is_anonymous', true)->count(),
            'with_evidences' => CommunityReport::has('evidences')->count(),
            'safety_concerns' => CommunityReport::where('safety_concern', true)->count(),
            'environmental_issues' => CommunityReport::where('environmental_impact', true)->count(),
            'recurring_issues' => CommunityReport::where('recurring_issue', true)->count(),
            'community_impact_count' => CommunityReport::whereIn('affected_people', ['community', 'multiple'])->count(),
            'individual_impact_count' => CommunityReport::whereIn('affected_people', ['individual', 'family'])->count(),
            'average_resolution_time' => $this->getAverageResolutionTime(),
        ];
    }

    private function formatReport($report)
    {
        $fullName = null;
        if ($report->user && $report->user->currentResident) {
            $fullName = trim(
                ($report->user->currentResident->first_name ?? '') . ' ' . 
                ($report->user->currentResident->middle_name ?? '') . ' ' . 
                ($report->user->currentResident->last_name ?? '')
            );
        }
        
        $assignedToName = null;
        if ($report->assignedTo && $report->assignedTo->currentResident) {
            $assignedToName = trim(
                ($report->assignedTo->currentResident->first_name ?? '') . ' ' . 
                ($report->assignedTo->currentResident->middle_name ?? '') . ' ' . 
                ($report->assignedTo->currentResident->last_name ?? '')
            );
        }
        
        $userPurok = $report->user && $report->user->currentResident 
            ? $report->user->currentResident->purok_name 
            : null;
        
        return [
            'id' => $report->id,
            'report_number' => $report->report_number ?? 'N/A',
            'user_id' => $report->user_id,
            'user' => $report->user ? [
                'id' => $report->user->id,
                'full_name' => $fullName,
                'email' => $report->user->email,
                'phone' => $report->user->contact_number,
                'purok' => $userPurok,
            ] : null,
            'report_type_id' => $report->report_type_id,
            'report_type' => $report->reportType ? [
                'id' => $report->reportType->id,
                'name' => $report->reportType->name,
                'category' => $report->reportType->category,
            ] : null,
            'title' => $report->title,
            'description' => $report->description,
            'location' => $report->location,
            'incident_date' => $report->incident_date?->format('Y-m-d'),
            'urgency_level' => $report->urgency_level,
            'recurring_issue' => (bool) $report->recurring_issue,
            'affected_people' => $report->affected_people,
            'is_anonymous' => (bool) $report->is_anonymous,
            'impact_level' => $report->impact_level,
            'safety_concern' => (bool) $report->safety_concern,
            'environmental_impact' => (bool) $report->environmental_impact,
            'status' => $report->status,
            'priority' => $report->priority,
            'assigned_to' => $report->assignedTo ? [
                'id' => $report->assignedTo->id,
                'name' => $assignedToName,
            ] : null,
            'created_at' => $report->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $report->updated_at?->format('Y-m-d H:i:s'),
            'evidences_count' => $report->evidences->count(),
            'status_color' => $report->status_color,
            'priority_color' => $report->priority_color,
            'urgency_color' => $report->urgency_color,
        ];
    }
}