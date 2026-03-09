<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunityReport;
use App\Models\User;
use App\Models\Purok;
use App\Models\Activity;
use App\Models\ReportType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminCommunityReportController extends Controller
{
    public function index(Request $request)
    {

        // Start with base query
        $query = CommunityReport::with(['user:id,resident_id,email,contact_number', 'reportType:id,name,category', 'assignedTo:id,resident_id'])
            ->latest();
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('report_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('detailed_description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('resolution_notes', 'like', "%{$search}%")
                  ->orWhere('reporter_name', 'like', "%{$search}%")
                  ->orWhere('reporter_contact', 'like', "%{$search}%")
                  ->orWhere('reporter_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('email', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%")
                        ->orWhereHas('resident', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                              ->orWhere('middle_name', 'like', "%{$search}%")
                              ->orWhere('last_name', 'like', "%{$search}%")
                              ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$search}%");
                        });
                  })
                  ->orWhereHas('reportType', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                  });
            });
        }
        
        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Apply priority filter
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        // Apply urgency filter
        if ($request->filled('urgency') && $request->urgency !== 'all') {
            $query->where('urgency_level', $request->urgency);
        }
        
        // Apply report type filter
        if ($request->filled('report_type') && $request->report_type !== 'all') {
            $query->where('report_type_id', $request->report_type);
        }
        
        // Apply category filter
        if ($request->filled('category') && $request->category !== 'all') {
            $query->whereHas('reportType', function ($q) use ($request) {
                $q->where('category', $request->category);
            });
        }
        
        // Apply impact level filter
        if ($request->filled('impact_level') && $request->impact_level !== 'all') {
            $query->where('impact_level', $request->impact_level);
        }
        
        // Apply date filters
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
        
        // Apply boolean filters
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
        
        // Apply affected people filter
        if ($request->filled('affected_people') && $request->affected_people !== 'all') {
            $query->where('affected_people', $request->affected_people);
        }
        
        // Get unique categories for filter dropdown
        $categories = ReportType::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category')
            ->toArray();
        
        // Get report types for filter dropdown
        $reportTypes = ReportType::select('id', 'name', 'category')
            ->orderBy('name')
            ->get();
        
        // Get puroks for filter dropdown
        $puroks = Purok::select('name as purok')
            ->orderBy('name')
            ->pluck('purok')
            ->toArray();
        
        // Get staff for assignment dropdown - Get names from residents table
        $staff = User::whereHas('role', function ($query) {
                // Exclude users with "Resident" role - based on your roles table
                $query->where('name', '!=', 'Resident');
            })
            ->whereNotNull('role_id') // Exclude users with no role assigned
            ->where('status', 'active') // Only active users
            ->with(['role:id,name', 'currentResident:id,first_name,middle_name,last_name'])
            ->get()
            ->sortBy(function ($user) {
                // Sort by resident's last name, then first name
                $lastName = $user->currentResident->last_name ?? '';
                $firstName = $user->currentResident->first_name ?? '';
                return $lastName . $firstName;
            })
            ->values() // Reset keys after sorting
            ->map(function ($user) {
                // Check if role exists before accessing
                $roleName = $user->role ? $user->role->name : 'No role assigned';
                
                // Get name from resident
                $firstName = $user->currentResident->first_name ?? '';
                $middleName = $user->currentResident->middle_name ?? '';
                $lastName = $user->currentResident->last_name ?? '';
                
                // Create full name
                $fullName = trim("{$firstName} {$middleName} {$lastName}");
                
                return [
                    'id' => $user->id,
                    'name' => $fullName,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $user->email,
                    'phone' => $user->contact_number,
                    'position' => $user->position,
                    'role' => $roleName,
                    'role_id' => $user->role_id,
                ];
            });
        
        // Calculate statistics
        $today = Carbon::today();
        $weekAgo = Carbon::today()->subDays(7);
        $monthAgo = Carbon::today()->subDays(30);
        
        $stats = [
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
        
        // Get reports with pagination
        $perPage = $request->get('per_page', 15);
        $reports = $query->paginate($perPage)->withQueryString();
        
        // Format reports data with null-safe operations
        $formattedReports = $reports->map(function ($report) {
            // Get user's name from resident
            $fullName = null;
            if ($report->user && $report->user->currentResident) {
                $firstName = $report->user->currentResident->first_name ?? '';
                $middleName = $report->user->currentResident->middle_name ?? '';
                $lastName = $report->user->currentResident->last_name ?? '';
                $fullName = trim("{$firstName} {$middleName} {$lastName}");
            }
            
            // Get assigned staff name from resident
            $assignedToName = null;
            if ($report->assignedTo && $report->assignedTo->currentResident) {
                $firstName = $report->assignedTo->currentResident->first_name ?? '';
                $middleName = $report->assignedTo->currentResident->middle_name ?? '';
                $lastName = $report->assignedTo->currentResident->last_name ?? '';
                $assignedToName = trim("{$firstName} {$middleName} {$lastName}");
            }
            
            // Get user's purok from resident if exists
            $userPurok = null;
            if ($report->user && $report->user->currentResident) {
                $userPurok = $report->user->currentResident->purok_name;
            }
            
            return [
                'id' => $report->id,
                'report_number' => $report->report_number ?? 'N/A',
                'user_id' => $report->user_id,
                'user' => $report->user ? [
                    'id' => $report->user->id,
                    'first_name' => $report->user->currentResident->first_name ?? null,
                    'last_name' => $report->user->currentResident->last_name ?? null,
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
                'detailed_description' => $report->detailed_description,
                'location' => $report->location,
                'incident_date' => $report->incident_date ? $report->incident_date->format('Y-m-d') : null,
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
                'resolved_at' => $report->resolved_at ? $report->resolved_at->format('Y-m-d H:i:s') : null,
                'acknowledged_at' => $report->acknowledged_at ? $report->acknowledged_at->format('Y-m-d H:i:s') : null,
                'created_at' => $report->created_at ? $report->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $report->updated_at ? $report->updated_at->format('Y-m-d H:i:s') : null,
                'evidences' => $report->evidences ? $report->evidences->map(function ($evidence) {
                    return [
                        'id' => $evidence->id,
                        'file_path' => $evidence->file_path,
                        'file_name' => $evidence->file_name,
                        'file_type' => $evidence->file_type,
                        'file_size' => $evidence->file_size,
                    ];
                }) : [],
                'status_color' => $report->status_color,
                'priority_color' => $report->priority_color,
                'urgency_color' => $report->urgency_color,
            ];
        });
        
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
                'recurring_issue', 'is_anonymous', 'affected_people'
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
     * Show the form for creating a new community report.
     */
    public function create()
    {
        // Get report types for dropdown
        $reportTypes = ReportType::orderBy('name')->get(['id', 'name', 'category', 'description']);
        
        // Get categories for filtering
        $categories = ReportType::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category')
            ->toArray();
        
        // Get puroks for location suggestions
        $puroks = Purok::select('name as purok')
            ->orderBy('name')
            ->pluck('purok')
            ->toArray();
        
        // Get users for selection
        $users = User::whereHas('currentResident')
            ->with(['currentResident:id,first_name,middle_name,last_name,address'])
            ->get()
            ->map(function ($user) {
                $resident = $user->currentResident;
                
                $firstName = $resident->first_name ?? '';
                $middleName = $resident->middle_name ?? '';
                $lastName = $resident->last_name ?? '';
                $fullName = trim("{$firstName} {$middleName} {$lastName}");
                
                return [
                    'id' => $user->id,
                    'name' => $fullName ?: $user->email,
                    'email' => $user->email,
                    'phone' => $user->contact_number,
                    'address' => $resident->address ?? null,
                ];
            })
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

    /**
     * Store a newly created community report.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'report_type_id' => 'required|exists:report_types,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'detailed_description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'incident_date' => 'required|date',
            'incident_time' => 'nullable|date_format:H:i',
            'urgency_level' => 'required|in:low,medium,high',
            'recurring_issue' => 'boolean',
            'affected_people' => 'required|in:individual,family,group,community,multiple',
            'estimated_affected_count' => 'nullable|integer|min:0',
            'is_anonymous' => 'boolean',
            'reporter_name' => 'required_if:is_anonymous,true|nullable|string|max:255',
            'reporter_contact' => 'required_if:is_anonymous,true|nullable|string|max:50',
            'reporter_address' => 'required_if:is_anonymous,true|nullable|string|max:500',
            'perpetrator_details' => 'nullable|string|max:1000',
            'preferred_resolution' => 'nullable|string|max:1000',
            'has_previous_report' => 'boolean',
            'previous_report_id' => 'nullable|exists:community_reports,id',
            'impact_level' => 'required|in:minor,moderate,major,severe',
            'safety_concern' => 'boolean',
            'environmental_impact' => 'boolean',
            'noise_level' => 'nullable|in:low,medium,high',
            'duration_hours' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,under_review,assigned,in_progress,resolved,rejected',
            'priority' => 'required|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        // Handle file uploads separately
        $files = $request->file('evidences', []);
        
        // Set default values
        $validated['is_anonymous'] = $request->boolean('is_anonymous', false);
        $validated['recurring_issue'] = $request->boolean('recurring_issue', false);
        $validated['has_previous_report'] = $request->boolean('has_previous_report', false);
        $validated['safety_concern'] = $request->boolean('safety_concern', false);
        $validated['environmental_impact'] = $request->boolean('environmental_impact', false);
        
        // Create the report
        $report = CommunityReport::create($validated);
        
        // Handle evidence uploads
        if (!empty($files)) {
            foreach ($files as $file) {
                $path = $file->store('community-reports/evidence', 'public');
                
                $report->evidences()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => Auth::id(),
                ]);
            }
        }
        
        // Send notification if report is assigned
        if ($validated['assigned_to'] && !$validated['is_anonymous'] && $validated['user_id']) {
            $reportOwner = User::find($validated['user_id']);
            if ($reportOwner) {
                $this->sendAssignmentNotification($report, $reportOwner, Auth::user());
            }
        }
        
        // Log the creation
        $reportNumber = $report->report_number ?? 'N/A';
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'report_number' => $reportNumber,
            ])
            ->event('created')
            ->log("Created new community report #{$reportNumber}");
        
        return redirect()->route('admin.community-reports.show', $report)
            ->with('success', 'Community report created successfully.');
    }

public function show(CommunityReport $report)
{
    // Load report with related data - make sure assignedTo is properly loaded
    $report->load([
        'user:id,first_name,last_name,email,contact_number',
        'user.currentResident.purok:id,name',
        'reportType:id,name,category,description',
        'assignedTo:id,first_name,last_name,email,contact_number,position,role_id', // Make sure all needed fields are included
        'assignedTo.role:id,name,is_system_role', // Load the role relationship
        'assignedTo.currentResident:id,first_name,middle_name,last_name', // Load resident for full name
        'previousReport:id,report_number,title,status',
        'evidences'
    ]);
    
    // Log the view activity
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
    
    // Get activity logs for this report
    $activityLogs = Activity::where(function($query) use ($report) {
            $query->where('subject_type', CommunityReport::class)
                ->where('subject_id', $report->id);
        })
        ->orWhere('description', 'like', "%report #{$report->report_number}%")
        ->orWhere('description', 'like', "%report_id:{$report->id}%")
        ->with(['causer:id,first_name,last_name'])
        ->orderBy('created_at', 'desc')
        ->take(50)
        ->get()
        ->map(function ($log) {
            $userName = $log->causer ? $log->causer->first_name . ' ' . $log->causer->last_name : 'System';
            
            return [
                'id' => $log->id,
                'user_id' => $log->causer_id,
                'user_name' => $userName,
                'action' => $log->event,
                'details' => $log->description,
                'changes' => $log->changes ?? [],
                'created_at' => $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : null,
            ];
        });
    
    // Get notifications for the report owner (if not anonymous)
    $ownerNotifications = [];
    if (!$report->is_anonymous && $report->user_id) {
        $ownerNotifications = DB::table('notifications')
            ->where('notifiable_id', $report->user_id)
            ->where('notifiable_type', 'App\Models\User')
            ->where(function($query) use ($report) {
                $query->where('data->report_id', $report->id)
                      ->orWhere('data->report_number', $report->report_number);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                $data = json_decode($notification->data, true);
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'formatted_date' => Carbon::parse($notification->created_at)->diffForHumans(),
                    'is_read' => !is_null($notification->read_at),
                ];
            });
    }
    
    // Get similar reports (same type or location)
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
    
    // Format similar reports
    $formattedSimilarReports = $similarReports->map(function ($similarReport) {
        $fullName = $similarReport->user ? $similarReport->user->first_name . ' ' . $similarReport->user->last_name : null;
        
        return [
            'id' => $similarReport->id,
            'report_number' => $similarReport->report_number ?? 'N/A',
            'title' => $similarReport->title,
            'report_type' => $similarReport->reportType ? [
                'name' => $similarReport->reportType->name,
            ] : null,
            'status' => $similarReport->status,
            'priority' => $similarReport->priority,
            'urgency_level' => $similarReport->urgency_level,
            'created_at' => $similarReport->created_at ? $similarReport->created_at->format('Y-m-d H:i:s') : null,
            'user' => $similarReport->user ? [
                'id' => $similarReport->user->id,
                'name' => $fullName,
            ] : null,
        ];
    });
    
    // Get full name for the main report
    $fullName = $report->user ? $report->user->first_name . ' ' . $report->user->last_name : null;
    
    // Get assigned staff name from currentResident
    $assignedToName = null;
    $assignedToEmail = null;
    $assignedToPhone = null;
    $assignedToPosition = null;
    $assignedToRole = null;
    $assignedToRoleId = null;
    
    if ($report->assignedTo) {
        // Get name from currentResident if available
        if ($report->assignedTo->currentResident) {
            $firstName = $report->assignedTo->currentResident->first_name ?? '';
            $middleName = $report->assignedTo->currentResident->middle_name ?? '';
            $lastName = $report->assignedTo->currentResident->last_name ?? '';
            $assignedToName = trim("{$firstName} {$middleName} {$lastName}");
        }
        
        // Fallback to user fields if resident not available
        if (!$assignedToName) {
            $firstName = $report->assignedTo->first_name ?? '';
            $lastName = $report->assignedTo->last_name ?? '';
            $assignedToName = trim("{$firstName} {$lastName}");
        }
        
        // If still no name, use email
        if (!$assignedToName) {
            $assignedToName = $report->assignedTo->email ?? 'Unknown Staff';
        }
        
        // Get other assigned user details
        $assignedToEmail = $report->assignedTo->email ?? null;
        $assignedToPhone = $report->assignedTo->contact_number ?? null;
        $assignedToPosition = $report->assignedTo->position ?? null;
        $assignedToRole = $report->assignedTo->role ? $report->assignedTo->role->name : null;
        $assignedToRoleId = $report->assignedTo->role_id ?? null;
    }
    
    // Get user's address and purok from currentResident
    $userAddress = null;
    $userPurok = null;
    if ($report->user && $report->user->currentResident) {
        $userAddress = $report->user->currentResident->address;
        if ($report->user->currentResident->purok) {
            $userPurok = $report->user->currentResident->purok->name;
        }
    }
    
    // Prepare report data with null-safe operations
    $reportData = [
        'id' => $report->id,
        'report_number' => $report->report_number,
        'user_id' => $report->user_id,
        'user' => $report->user ? [
            'id' => $report->user->id,
            'first_name' => $report->user->first_name,
            'last_name' => $report->user->last_name,
            'full_name' => $fullName,
            'email' => $report->user->email,
            'phone' => $report->user->contact_number,
            'address' => $userAddress,
            'purok' => $userPurok,
            'has_resident' => !empty($report->user->currentResident),
        ] : null,
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
        'incident_date' => $report->incident_date ? $report->incident_date->format('Y-m-d') : null,
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
        'assignedTo' => $report->assignedTo ? [
            'id' => $report->assignedTo->id,
            'first_name' => $report->assignedTo->first_name,
            'last_name' => $report->assignedTo->last_name,
            'name' => $assignedToName,
            'email' => $assignedToEmail,
            'contact_number' => $assignedToPhone,
            'phone' => $assignedToPhone, // Add this for compatibility
            'position' => $assignedToPosition,
            'role' => $assignedToRole,
            'role_id' => $assignedToRoleId,
        ] : null,
        'resolution_notes' => $report->resolution_notes,
        'resolved_at' => $report->resolved_at ? $report->resolved_at->format('Y-m-d H:i:s') : null,
        'acknowledged_at' => $report->acknowledged_at ? $report->acknowledged_at->format('Y-m-d H:i:s') : null,
        'created_at' => $report->created_at ? $report->created_at->format('Y-m-d H:i:s') : null,
        'updated_at' => $report->updated_at ? $report->updated_at->format('Y-m-d H:i:s') : null,
        'evidences' => $report->evidences ? $report->evidences->map(function ($evidence) {
            return [
                'id' => $evidence->id,
                'file_path' => $evidence->file_path,
                'file_name' => $evidence->file_name,
                'file_type' => $evidence->file_type,
                'file_size' => $evidence->file_size,
                'url' => Storage::url($evidence->file_path),
            ];
        }) : [],
        'status_color' => $report->status_color,
        'priority_color' => $report->priority_color,
        'urgency_color' => $report->urgency_color,
    ];
    
    // Get staff for assignment - ONLY users with system roles (is_system_role = 1)
    // This excludes Household Head (role_id = 13, is_system_role = 0)
    $staff = User::whereHas('role', function ($query) {
            // Only include system roles (officials) - is_system_role = 1
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
            
            // If no resident name, fallback to user fields or email
            if (empty($fullName)) {
                $fullName = trim($user->first_name . ' ' . $user->last_name);
            }
            if (empty($fullName)) {
                $fullName = $user->email ?? 'Unknown User';
            }
            
            // Generate initials
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
    
    // Debug - Log the assignedTo data to see what's coming through
    \Log::info('Assigned To Data:', [
        'assigned_to_id' => $report->assigned_to,
        'assignedTo_object' => $report->assignedTo ? $report->assignedTo->toArray() : null,
        'formatted_assignedTo' => $reportData['assignedTo']
    ]);
    
    // Debug - Log staff count to verify filtering
    \Log::info('Staff List:', [
        'total_staff_count' => $staff->count(),
        'staff_roles' => $staff->pluck('role')->toArray()
    ]);
    
    return Inertia::render('admin/CommunityReports/Show', [
        'report' => $reportData,
        'similar_reports' => $formattedSimilarReports,
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

    public function edit(CommunityReport $report)
    {
        $report->load(['user:id,first_name,last_name,email,contact_number', 'reportType:id,name,category', 'assignedTo:id,first_name,last_name']);
        
        // Get full name
        $fullName = $report->user ? $report->user->first_name . ' ' . $report->user->last_name : null;
        $assignedToName = $report->assignedTo ? $report->assignedTo->first_name . ' ' . $report->assignedTo->last_name : null;
        
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
                'incident_date' => $report->incident_date ? $report->incident_date->format('Y-m-d') : null,
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
                'resolved_at' => $report->resolved_at ? $report->resolved_at->format('Y-m-d') : null,
                'acknowledged_at' => $report->acknowledged_at ? $report->acknowledged_at->format('Y-m-d') : null,
            ],
            'statuses' => ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'],
            'priorities' => ['low', 'medium', 'high', 'critical'],
            'urgencies' => ['low', 'medium', 'high'],
            'impact_levels' => ['minor', 'moderate', 'major', 'severe'],
            'affected_people_options' => ['individual', 'family', 'group', 'community', 'multiple'],
            'report_types' => ReportType::orderBy('name')->get(['id', 'name', 'category']),
            'staff' => User::whereHas('role', function ($query) {
                $query->where('name', '!=', 'Resident');
            })
            ->whereNotNull('role_id')
            ->where('status', 'active')
            ->with(['role:id,name', 'currentResident:id,first_name,middle_name,last_name'])
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
                
                return [
                    'id' => $user->id,
                    'name' => $fullName,
                    'email' => $user->email,
                    'phone' => $user->contact_number,
                    'position' => $user->position,
                    'role' => $user->role ? $user->role->name : 'No role assigned',
                ];
            }),
        ]);
    }
    
    /**
     * Update the specified community report.
     */
    public function update(Request $request, CommunityReport $report)
    {
        $validated = $request->validate([
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
        
        // Convert boolean values
        $validated['recurring_issue'] = $request->boolean('recurring_issue', false);
        $validated['has_previous_report'] = $request->boolean('has_previous_report', false);
        $validated['safety_concern'] = $request->boolean('safety_concern', false);
        $validated['environmental_impact'] = $request->boolean('environmental_impact', false);
        $validated['is_anonymous'] = $request->boolean('is_anonymous', false);
        
        // Ensure status is a string value
        if (isset($validated['status'])) {
            $validated['status'] = (string) $validated['status'];
        }
        
        // Store old values for logging and notifications
        $oldValues = $report->getAttributes();
        $oldStatus = $report->status;
        $oldAssignedTo = $report->assigned_to;
        
        // Handle resolved_at timestamp
        if (isset($validated['status']) && $validated['status'] === 'resolved' && $report->status !== 'resolved') {
            $validated['resolved_at'] = now();
        } elseif (isset($validated['status']) && $validated['status'] !== 'resolved') {
            $validated['resolved_at'] = null;
        }
        
        // Handle acknowledged_at timestamp
        if (isset($validated['status']) && $validated['status'] === 'under_review' && $report->status !== 'under_review') {
            $validated['acknowledged_at'] = now();
        }
        
        // Track changes for logging
        $changes = [];
        foreach ($validated as $key => $value) {
            if (isset($oldValues[$key]) && $oldValues[$key] != $value) {
                $changes[$key] = [
                    'from' => $oldValues[$key],
                    'to' => $value
                ];
            }
        }
        
        // Update the report
        foreach ($validated as $key => $value) {
            $report->$key = $value;
        }
        $report->save();
        
        // ========== SEND NOTIFICATIONS ==========
        
        // Get the authenticated user who performed the update
        $authUser = Auth::user();
        
        // Send notifications to report owner if not anonymous
        if (!$report->is_anonymous && $report->user_id) {
            $reportOwner = User::find($report->user_id);
            
            if ($reportOwner) {
                \Log::info('Processing notifications for report owner', [
                    'report_id' => $report->id,
                    'report_number' => $report->report_number,
                    'owner_id' => $reportOwner->id,
                    'owner_email' => $reportOwner->email
                ]);
                
                // CASE 1: Report was assigned to someone
                if (isset($validated['assigned_to']) && $oldAssignedTo != $validated['assigned_to']) {
                    
                    if ($validated['assigned_to']) {
                        // Report was assigned to someone
                        $this->sendAssignmentNotification($report, $reportOwner, $authUser);
                    } else {
                        // Assignment was removed
                        $this->sendAssignmentRemovedNotification($report, $reportOwner, $authUser);
                    }
                }
                
                // CASE 2: Status changed
                if (isset($validated['status']) && $oldStatus !== $validated['status']) {
                    // Don't send duplicate if status changed to 'assigned' and we just sent assignment
                    $skipStatusChange = ($validated['status'] === 'assigned' && 
                                         isset($validated['assigned_to']) && 
                                         $validated['assigned_to'] && 
                                         $oldAssignedTo != $validated['assigned_to']);
                    
                    if (!$skipStatusChange) {
                        $this->sendStatusChangeNotification($report, $reportOwner, $oldStatus, $validated['status']);
                    }
                }
            }
        }
        
        // Send notification to the assigned staff member (if different from owner)
        if (isset($validated['assigned_to']) && $validated['assigned_to'] && $oldAssignedTo != $validated['assigned_to']) {
            $assignedStaff = User::find($validated['assigned_to']);
            
            if ($assignedStaff) {
                $this->sendStaffAssignmentNotification($report, $assignedStaff, $authUser);
            }
        }
        
        // Send notification to previous assignee if assignment changed
        if (isset($validated['assigned_to']) && $oldAssignedTo && $oldAssignedTo != $validated['assigned_to']) {
            $previousAssignee = User::find($oldAssignedTo);
            
            if ($previousAssignee) {
                $this->sendStaffUnassignmentNotification($report, $previousAssignee, $authUser);
            }
        }
        
        // Log the update activity
        $reportNumber = $report->report_number ?? 'N/A';
        if (!empty($changes)) {
            activity()
                ->on($report)
                ->by($authUser)
                ->withProperties([
                    'changes' => $changes,
                    'ip' => request()->ip(),
                    'report_number' => $reportNumber,
                ])
                ->event('updated')
                ->log("Updated community report #{$reportNumber}");
        }
        
        return redirect()->route('admin.community-reports.show', $report)
            ->with('success', 'Community report updated successfully.');
    }

    /**
     * Send assignment notification to report owner
     */
    private function sendAssignmentNotification($report, $reportOwner, $assignedBy)
    {
        try {
            \Log::info('Sending assignment notification to owner', [
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'owner_id' => $reportOwner->id,
                'assigned_to_id' => $report->assigned_to,
                'assigned_by_id' => $assignedBy->id
            ]);
            
            $reportOwner->notify(new \App\Notifications\ReportAssignedNotification($report, $assignedBy));
            
            \Log::info('✓ Assignment notification sent to owner');
            
        } catch (\Exception $e) {
            \Log::error('Failed to send assignment notification: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            
            // Fallback: Create manual notification
            $this->createManualAssignmentNotification($report, $reportOwner, $assignedBy);
        }
    }

    /**
     * Send notification when assignment is removed
     */
    private function sendAssignmentRemovedNotification($report, $reportOwner, $updatedBy)
    {
        try {
            \Log::info('Sending assignment removed notification', [
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'owner_id' => $reportOwner->id,
            ]);
            
            // Get the name of the person who removed assignment
            $updatedByName = 'System';
            if ($updatedBy && $updatedBy->currentResident) {
                $firstName = $updatedBy->currentResident->first_name ?? '';
                $lastName = $updatedBy->currentResident->last_name ?? '';
                $updatedByName = trim("{$firstName} {$lastName}");
            } elseif ($updatedBy) {
                $updatedByName = $updatedBy->name ?? $updatedBy->email ?? 'System';
            }
            
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
                'link' => '/admin/community-reports/' . $report->id,
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
            
            \Log::info('✓ Assignment removed notification created');
            
        } catch (\Exception $e) {
            \Log::error('Failed to send assignment removed notification: ' . $e->getMessage());
        }
    }

    /**
     * Send notification to staff when assigned to a report
     */
    private function sendStaffAssignmentNotification($report, $staff, $assignedBy)
    {
        try {
            \Log::info('Sending assignment notification to staff', [
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'staff_id' => $staff->id,
                'assigned_by_id' => $assignedBy->id
            ]);
            
            // Get assigned by name
            $assignedByName = 'System';
            if ($assignedBy && $assignedBy->currentResident) {
                $firstName = $assignedBy->currentResident->first_name ?? '';
                $lastName = $assignedBy->currentResident->last_name ?? '';
                $assignedByName = trim("{$firstName} {$lastName}");
            } elseif ($assignedBy) {
                $assignedByName = $assignedBy->name ?? $assignedBy->email ?? 'System';
            }
            
            $data = [
                'type' => 'staff_assigned',
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'report_title' => $report->title,
                'report_status' => $report->status,
                'report_priority' => $report->priority,
                'report_urgency' => $report->urgency_level,
                'assigned_by_id' => $assignedBy->id,
                'assigned_by_name' => $assignedByName,
                'message' => "You have been assigned to report #{$report->report_number}: {$report->title}",
                'title' => 'New Report Assignment',
                'icon' => 'briefcase',
                'color' => 'blue',
                'url' => '/admin/community-reports/' . $report->id,
                'link' => '/admin/community-reports/' . $report->id,
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
            
            \Log::info('✓ Staff assignment notification created');
            
        } catch (\Exception $e) {
            \Log::error('Failed to send staff assignment notification: ' . $e->getMessage());
        }
    }

    /**
     * Send notification to staff when unassigned from a report
     */
    private function sendStaffUnassignmentNotification($report, $staff, $updatedBy)
    {
        try {
            \Log::info('Sending unassignment notification to staff', [
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'staff_id' => $staff->id,
            ]);
            
            // Get updated by name
            $updatedByName = 'System';
            if ($updatedBy && $updatedBy->currentResident) {
                $firstName = $updatedBy->currentResident->first_name ?? '';
                $lastName = $updatedBy->currentResident->last_name ?? '';
                $updatedByName = trim("{$firstName} {$lastName}");
            } elseif ($updatedBy) {
                $updatedByName = $updatedBy->name ?? $updatedBy->email ?? 'System';
            }
            
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
                'link' => '/admin/community-reports',
                'created_at' => now()->toDateTimeString(),
            ];
            
            DB::table('notifications')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\StaffUnassignedNotification',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $staff->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            \Log::info('✓ Staff unassignment notification created');
            
        } catch (\Exception $e) {
            \Log::error('Failed to send staff unassignment notification: ' . $e->getMessage());
        }
    }

    /**
     * Send status change notification
     */
    private function sendStatusChangeNotification($report, $reportOwner, $oldStatus, $newStatus)
    {
        try {
            $notificationType = $newStatus === 'resolved' ? 'resolved' : 
                               ($newStatus === 'rejected' ? 'rejected' : 'status_changed');
            
            \Log::info('Sending status change notification', [
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'owner_id' => $reportOwner->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'type' => $notificationType
            ]);
            
            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                $report, 
                $oldStatus, 
                $newStatus, 
                $notificationType
            ));
            
            \Log::info('✓ Status notification sent');
            
        } catch (\Exception $e) {
            \Log::error('Failed to send status notification: ' . $e->getMessage());
            
            // Fallback: Create manual notification
            $this->createManualStatusNotification($report, $reportOwner, $oldStatus, $newStatus);
        }
    }

    /**
     * Manually create assignment notification in database (fallback)
     */
    private function createManualAssignmentNotification($report, $reportOwner, $assignedBy)
    {
        try {
            // Get assigned staff name
            $assignedToName = 'a staff member';
            if ($report->assignedTo && $report->assignedTo->currentResident) {
                $firstName = $report->assignedTo->currentResident->first_name ?? '';
                $middleName = $report->assignedTo->currentResident->middle_name ?? '';
                $lastName = $report->assignedTo->currentResident->last_name ?? '';
                $assignedToName = trim("{$firstName} {$middleName} {$lastName}");
            }
            
            // Get assigned by name
            $assignedByName = 'System';
            if ($assignedBy && $assignedBy->currentResident) {
                $firstName = $assignedBy->currentResident->first_name ?? '';
                $lastName = $assignedBy->currentResident->last_name ?? '';
                $assignedByName = trim("{$firstName} {$lastName}");
            } elseif ($assignedBy) {
                $assignedByName = $assignedBy->name ?? $assignedBy->email ?? 'System';
            }
            
            // Get assigned staff details
            $assignedStaffDetails = null;
            if ($report->assignedTo) {
                $staffFirstName = $report->assignedTo->currentResident->first_name ?? '';
                $staffLastName = $report->assignedTo->currentResident->last_name ?? '';
                $staffPosition = $report->assignedTo->position ?? 'Staff';
                $staffRole = $report->assignedTo->role ? $report->assignedTo->role->name : 'Staff';
                
                $assignedStaffDetails = [
                    'id' => $report->assignedTo->id,
                    'name' => $assignedToName,
                    'first_name' => $staffFirstName,
                    'last_name' => $staffLastName,
                    'email' => $report->assignedTo->email,
                    'phone' => $report->assignedTo->contact_number,
                    'position' => $staffPosition,
                    'role' => $staffRole,
                ];
            }
            
            $data = [
                'type' => 'report_assigned',
                'action' => 'assigned',
                'report_id' => $report->id,
                'report_number' => $report->report_number,
                'report_title' => $report->title,
                'assigned_to_id' => $report->assigned_to,
                'assigned_to_name' => $assignedToName,
                'assigned_to_details' => $assignedStaffDetails,
                'assigned_by_id' => $assignedBy->id,
                'assigned_by_name' => $assignedByName,
                'assigned_at' => now()->toDateTimeString(),
                'message' => "Your report #{$report->report_number} has been assigned to {$assignedToName}",
                'title' => 'Report Assigned',
                'icon' => 'user-check',
                'color' => 'blue',
                'url' => '/admin/community-reports/' . $report->id,
                'link' => '/admin/community-reports/' . $report->id,
                'created_at' => now()->toDateTimeString(),
            ];
            
            $notificationId = DB::table('notifications')->insertGetId([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\ReportAssignedNotification',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $reportOwner->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            \Log::info('✓ Manual assignment notification created', [
                'notification_id' => $notificationId
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to create manual assignment notification: ' . $e->getMessage());
        }
    }

    /**
     * Manually create status notification in database (fallback)
     */
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
            
            $icon = 'refresh-cw';
            $color = 'blue';
            
            if ($newStatus === 'resolved') {
                $icon = 'check-circle';
                $color = 'green';
            } elseif ($newStatus === 'rejected') {
                $icon = 'x-circle';
                $color = 'red';
            } elseif ($newStatus === 'assigned') {
                $icon = 'user-check';
                $color = 'blue';
            } elseif ($newStatus === 'in_progress') {
                $icon = 'loader';
                $color = 'yellow';
            }
            
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
                'link' => '/admin/community-reports/' . $report->id,
                'created_at' => now()->toDateTimeString(),
            ];
            
            $notificationId = DB::table('notifications')->insertGetId([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\ReportStatusUpdated',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $reportOwner->id,
                'data' => json_encode($data),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            \Log::info('✓ Manual status notification created', [
                'notification_id' => $notificationId
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to create manual status notification: ' . $e->getMessage());
        }
    }

    /**
     * Helper to get user name
     */
    private function getUserNameById($userId)
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

    public function destroy(CommunityReport $report)
    {
        // Store report info for logging
        $reportNumber = $report->report_number ?? 'N/A';
        $reportTitle = $report->title ?? 'N/A';
        
        // Delete associated evidence files
        foreach ($report->evidences as $evidence) {
            if (Storage::exists($evidence->file_path)) {
                Storage::delete($evidence->file_path);
            }
            $evidence->delete();
        }
        
        // Log the deletion
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'report_number' => $reportNumber,
                'title' => $reportTitle,
                'ip' => request()->ip(),
            ])
            ->event('deleted')
            ->log("Deleted community report #{$reportNumber}");
        
        $report->delete();
        
        return redirect()->route('admin.community-reports.index')
            ->with('success', 'Community report deleted successfully.');
    }
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'report_ids' => 'required|array',
            'report_ids.*' => 'exists:community_reports,id',
            'action' => 'required|in:mark_resolved,mark_under_review,mark_assigned,mark_in_progress,mark_pending,delete,export,change_priority,change_urgency,assign_to',
        ]);
        
        $count = count($request->report_ids);
        $reports = CommunityReport::whereIn('id', $request->report_ids)->get();
        
        switch ($request->action) {
            case 'mark_resolved':
                CommunityReport::whereIn('id', $request->report_ids)
                    ->update([
                        'status' => 'resolved',
                        'resolved_at' => now(),
                    ]);
                    
                // Send notifications for each report
                foreach ($reports as $report) {
                    if (!$report->is_anonymous && $report->user_id) {
                        $reportOwner = User::find($report->user_id);
                        if ($reportOwner) {
                            $oldStatus = $report->getOriginal('status');
                            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                                $report,
                                $oldStatus,
                                'resolved',
                                'resolved'
                            ));
                        }
                    }
                }
                $message = "{$count} report(s) marked as resolved.";
                break;
                
            case 'mark_under_review':
                CommunityReport::whereIn('id', $request->report_ids)
                    ->update([
                        'status' => 'under_review',
                        'acknowledged_at' => now(),
                        'resolved_at' => null,
                    ]);
                    
                foreach ($reports as $report) {
                    if (!$report->is_anonymous && $report->user_id) {
                        $reportOwner = User::find($report->user_id);
                        if ($reportOwner) {
                            $oldStatus = $report->getOriginal('status');
                            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                                $report,
                                $oldStatus,
                                'under_review',
                                'status_changed'
                            ));
                        }
                    }
                }
                $message = "{$count} report(s) marked as under review.";
                break;
                
            case 'mark_assigned':
                CommunityReport::whereIn('id', $request->report_ids)
                    ->update([
                        'status' => 'assigned',
                        'resolved_at' => null,
                    ]);
                    
                foreach ($reports as $report) {
                    if (!$report->is_anonymous && $report->user_id) {
                        $reportOwner = User::find($report->user_id);
                        if ($reportOwner) {
                            $oldStatus = $report->getOriginal('status');
                            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                                $report,
                                $oldStatus,
                                'assigned',
                                'status_changed'
                            ));
                        }
                    }
                }
                $message = "{$count} report(s) marked as assigned.";
                break;
                
            case 'mark_in_progress':
                CommunityReport::whereIn('id', $request->report_ids)
                    ->update([
                        'status' => 'in_progress',
                        'resolved_at' => null,
                    ]);
                    
                foreach ($reports as $report) {
                    if (!$report->is_anonymous && $report->user_id) {
                        $reportOwner = User::find($report->user_id);
                        if ($reportOwner) {
                            $oldStatus = $report->getOriginal('status');
                            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                                $report,
                                $oldStatus,
                                'in_progress',
                                'status_changed'
                            ));
                        }
                    }
                }
                $message = "{$count} report(s) marked as in progress.";
                break;
                
            case 'mark_pending':
                CommunityReport::whereIn('id', $request->report_ids)
                    ->update([
                        'status' => 'pending',
                        'acknowledged_at' => null,
                        'resolved_at' => null,
                    ]);
                    
                foreach ($reports as $report) {
                    if (!$report->is_anonymous && $report->user_id) {
                        $reportOwner = User::find($report->user_id);
                        if ($reportOwner) {
                            $oldStatus = $report->getOriginal('status');
                            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                                $report,
                                $oldStatus,
                                'pending',
                                'status_changed'
                            ));
                        }
                    }
                }
                $message = "{$count} report(s) marked as pending.";
                break;
                
            case 'delete':
                // Delete evidence files for each report
                foreach ($reports as $report) {
                    foreach ($report->evidences as $evidence) {
                        if (Storage::exists($evidence->file_path)) {
                            Storage::delete($evidence->file_path);
                        }
                        $evidence->delete();
                    }
                }
                CommunityReport::whereIn('id', $request->report_ids)->delete();
                $message = "{$count} report(s) deleted.";
                break;
                
            case 'change_priority':
                $request->validate([
                    'priority' => 'required|in:low,medium,high,critical',
                ]);
                CommunityReport::whereIn('id', $request->report_ids)
                    ->update(['priority' => $request->priority]);
                $message = "{$count} report(s) priority changed to {$request->priority}.";
                break;
                
            case 'change_urgency':
                $request->validate([
                    'urgency' => 'required|in:low,medium,high',
                ]);
                CommunityReport::whereIn('id', $request->report_ids)
                    ->update(['urgency_level' => $request->urgency]);
                $message = "{$count} report(s) urgency changed to {$request->urgency}.";
                break;
                
            case 'assign_to':
                $request->validate([
                    'assigned_to' => 'nullable|exists:users,id',
                ]);
                
                $assignedToUser = $request->assigned_to ? User::find($request->assigned_to) : null;
                
                foreach ($reports as $report) {
                    $oldAssignedTo = $report->assigned_to;
                    $oldStatus = $report->status;
                    
                    $report->update([
                        'assigned_to' => $request->assigned_to,
                        'status' => $request->assigned_to ? 'assigned' : 'pending'
                    ]);
                    
                    if (!$report->is_anonymous && $report->user_id && $request->assigned_to) {
                        $reportOwner = User::find($report->user_id);
                        if ($reportOwner) {
                            $reportOwner->notify(new \App\Notifications\ReportStatusUpdated(
                                $report,
                                $oldStatus,
                                $report->status,
                                'assigned'
                            ));
                        }
                    }
                }
                $message = "{$count} report(s) assigned successfully.";
                break;
                
            case 'export':
                $message = 'Export initiated.';
                break;
        }
        
        return response()->json([
            'message' => $message,
            'count' => $count,
        ]);
    }
    
    public function dashboardStats()
    {
        $today = Carbon::today();
        $weekAgo = Carbon::today()->subDays(7);
        
        return response()->json([
            'total' => CommunityReport::count(),
            'pending' => CommunityReport::where('status', 'pending')->count(),
            'under_review' => CommunityReport::where('status', 'under_review')->count(),
            'assigned' => CommunityReport::where('status', 'assigned')->count(),
            'in_progress' => CommunityReport::where('status', 'in_progress')->count(),
            'resolved' => CommunityReport::where('status', 'resolved')->count(),
            'high_priority' => CommunityReport::where('priority', 'high')->orWhere('priority', 'critical')->count(),
            'high_urgency' => CommunityReport::where('urgency_level', 'high')->count(),
            'today' => CommunityReport::whereDate('created_at', $today)->count(),
            'this_week' => CommunityReport::where('created_at', '>=', $weekAgo)->count(),
            'safety_concerns' => CommunityReport::where('safety_concern', true)->count(),
        ]);
    }
    
    public function uploadEvidence(Request $request, CommunityReport $report)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx,txt,mp4,mov,avi',
        ]);
        
        $uploadedFiles = [];
        
        foreach ($request->file('files') as $file) {
            $path = $file->store('community-reports/evidence', 'public');
            
            $report->evidences()->create([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
            ]);
            
            $uploadedFiles[] = $path;
        }
        
        $reportNumber = $report->report_number ?? 'N/A';
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'file_count' => count($uploadedFiles),
                'ip' => request()->ip(),
                'report_number' => $reportNumber,
            ])
            ->event('evidence_uploaded')
            ->log("Uploaded evidence files for community report #{$reportNumber}");
        
        return response()->json([
            'success' => true,
            'files' => $uploadedFiles,
            'message' => 'Files uploaded successfully.',
        ]);
    }
    
    public function removeEvidence(CommunityReport $report, $evidenceId)
    {
        $evidence = $report->evidences()->find($evidenceId);
        
        if ($evidence) {
            if (Storage::exists($evidence->file_path)) {
                Storage::delete($evidence->file_path);
            }
            
            $evidence->delete();
            
            $reportNumber = $report->report_number ?? 'N/A';
            activity()
                ->on($report)
                ->by(Auth::user())
                ->withProperties([
                    'evidence_id' => $evidenceId,
                    'file_name' => $evidence->file_name,
                    'ip' => request()->ip(),
                    'report_number' => $reportNumber,
                ])
                ->event('evidence_removed')
                ->log("Removed evidence file from community report #{$reportNumber}");
            
            return response()->json([
                'success' => true,
                'message' => 'File removed successfully.',
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'File not found.',
        ], 404);
    }
    
    public function print(CommunityReport $report)
    {
        $report->load(['user', 'reportType', 'assignedTo', 'evidences']);
        
        $reportNumber = $report->report_number ?? 'N/A';
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'report_number' => $reportNumber,
            ])
            ->event('printed')
            ->log("Printed community report #{$reportNumber}");
        
        return Inertia::render('admin/CommunityReports/Print', [
            'report' => $this->formatReportForPrint($report),
            'print_date' => now()->format('F d, Y'),
        ]);
    }
    
    public function pdf(CommunityReport $report)
    {
        $report->load(['user', 'reportType', 'assignedTo', 'evidences']);
        
        $reportNumber = $report->report_number ?? 'N/A';
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'ip' => request()->ip(),
                'report_number' => $reportNumber,
            ])
            ->event('pdf_downloaded')
            ->log("Downloaded PDF for community report #{$reportNumber}");
        
        $pdf = Pdf::loadView('admin.community-reports.pdf', [
            'report' => $this->formatReportForPrint($report),
            'print_date' => now()->format('F d, Y'),
        ]);
        
        return $pdf->download("community-report-{$reportNumber}.pdf");
    }
    
    public function sendResponse(Request $request, CommunityReport $report)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'send_email' => 'boolean',
            'send_sms' => 'boolean',
            'is_public' => 'boolean',
        ]);
        
        $reportNumber = $report->report_number ?? 'N/A';
        activity()
            ->on($report)
            ->by(Auth::user())
            ->withProperties([
                'subject' => $request->subject,
                'message' => $request->message,
                'channels' => $this->getSentVia($request),
                'is_public' => $request->boolean('is_public', false),
                'ip' => request()->ip(),
                'report_number' => $reportNumber,
            ])
            ->event('response_sent')
            ->log("Sent response for community report #{$reportNumber}");
        
        return redirect()
            ->route('admin.community-reports.show', $report)
            ->with('success', 'Response sent successfully.');
    }
    
    public function export(Request $request)
    {
        $query = CommunityReport::with(['user', 'reportType', 'assignedTo']);
        
        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->whereBetween('incident_date', [
                $request->from_date,
                Carbon::parse($request->to_date)->endOfDay()
            ]);
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
        
        $reports = $query->get();
        
        $csvData = "Report Number,Title,Report Type,Category,Status,Priority,Urgency,Impact Level,Resident Name,Location,Incident Date,Created At,Resolved At,Assigned To,Safety Concern,Environmental Impact,Recurring Issue,Estimated Affected\n";
        
        foreach ($reports as $report) {
            $residentName = $report->is_anonymous ? 'Anonymous' : 
                          ($report->user ? $report->user->first_name . ' ' . $report->user->last_name : 'N/A');
            
            $reportType = $report->reportType ? $report->reportType->name : 'N/A';
            $category = $report->reportType ? $report->reportType->category : 'N/A';
            $assignedTo = $report->assignedTo ? $report->assignedTo->first_name . ' ' . $report->assignedTo->last_name : 'Unassigned';
            
            $csvData .= "\"" . ($report->report_number ?? 'N/A') . "\","
                . "\"" . str_replace('"', '""', $report->title ?? '') . "\","
                . "\"" . str_replace('"', '""', $reportType) . "\","
                . "\"" . str_replace('"', '""', $category) . "\","
                . "\"" . $report->status . "\","
                . "\"" . $report->priority . "\","
                . "\"" . $report->urgency_level . "\","
                . "\"" . $report->impact_level . "\","
                . "\"" . str_replace('"', '""', $residentName) . "\","
                . "\"" . str_replace('"', '""', $report->location ?? '') . "\","
                . "\"" . ($report->incident_date ? $report->incident_date->format('Y-m-d') : '') . "\","
                . "\"" . ($report->created_at ? $report->created_at->format('Y-m-d H:i:s') : '') . "\","
                . "\"" . ($report->resolved_at ? $report->resolved_at->format('Y-m-d H:i:s') : '') . "\","
                . "\"" . str_replace('"', '""', $assignedTo) . "\","
                . "\"" . ($report->safety_concern ? 'Yes' : 'No') . "\","
                . "\"" . ($report->environmental_impact ? 'Yes' : 'No') . "\","
                . "\"" . ($report->recurring_issue ? 'Yes' : 'No') . "\","
                . "\"" . ($report->estimated_affected_count ?? '') . "\"\n";
        }
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="community-reports_' . date('Y-m-d_H-i') . '.csv"',
        ];
        
        return response()->make($csvData, 200, $headers);
    }
    
    public function statistics()
    {
        $stats = [
            'total' => CommunityReport::count(),
            'pending' => CommunityReport::where('status', 'pending')->count(),
            'under_review' => CommunityReport::where('status', 'under_review')->count(),
            'assigned' => CommunityReport::where('status', 'assigned')->count(),
            'in_progress' => CommunityReport::where('status', 'in_progress')->count(),
            'resolved' => CommunityReport::where('status', 'resolved')->count(),
            'rejected' => CommunityReport::where('status', 'rejected')->count(),
            'high_priority' => CommunityReport::where('priority', 'high')->orWhere('priority', 'critical')->count(),
            'high_urgency' => CommunityReport::where('urgency_level', 'high')->count(),
            'this_month' => CommunityReport::whereMonth('created_at', date('m'))->count(),
            'avg_resolution_time' => $this->getAverageResolutionTime(),
            'safety_concerns' => CommunityReport::where('safety_concern', true)->count(),
            'environmental_issues' => CommunityReport::where('environmental_impact', true)->count(),
            'recurring_issues' => CommunityReport::where('recurring_issue', true)->count(),
            'community_impact' => CommunityReport::whereIn('affected_people', ['community', 'multiple'])->count(),
        ];
        
        return response()->json($stats);
    }
    
    public function related(CommunityReport $report)
    {
        $relatedReports = CommunityReport::where('id', '!=', $report->id)
            ->where(function($query) use ($report) {
                if (!$report->is_anonymous && $report->user_id) {
                    $query->orWhere('user_id', $report->user_id);
                }
                
                if ($report->location) {
                    $query->orWhere('location', 'LIKE', "%{$report->location}%");
                }
                
                if ($report->report_type_id) {
                    $query->orWhere('report_type_id', $report->report_type_id);
                }
                
                if ($report->title) {
                    $keywords = explode(' ', $report->title);
                    foreach ($keywords as $keyword) {
                        if (strlen($keyword) > 3) {
                            $query->orWhere('title', 'LIKE', "%{$keyword}%");
                            $query->orWhere('description', 'LIKE', "%{$keyword}%");
                        }
                    }
                }
            })
            ->with(['user', 'reportType'])
            ->limit(10)
            ->get();
        
        return Inertia::render('admin/CommunityReports/Related', [
            'report' => $report,
            'related_reports' => $relatedReports,
        ]);
    }
    
    private function getSentVia(Request $request): string
    {
        $channels = [];
        
        if ($request->boolean('send_email')) $channels[] = 'email';
        if ($request->boolean('send_sms')) $channels[] = 'sms';
        
        return empty($channels) ? 'internal' : implode(', ', $channels);
    }
    
    private function getAverageResolutionTime(): string
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
    
    private function formatReportForPrint(CommunityReport $report): array
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
    
    private function formatFileSize($bytes): string
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
}