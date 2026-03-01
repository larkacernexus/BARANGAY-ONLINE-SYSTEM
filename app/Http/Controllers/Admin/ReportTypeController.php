<?php
// app/Http/Controllers/Admin/ReportTypeController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReportType;
use App\Models\CommunityReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ReportTypeController extends Controller
{
    /**
     * Display a listing of report types.
     */
    public function index(Request $request)
    {
        try {
            $query = ReportType::query();

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $isActive = $request->status === 'active';
                $query->where('is_active', $isActive);
            }

            if ($request->filled('priority') && $request->priority !== 'all') {
                $query->where('priority_level', $request->priority);
            }

            if ($request->filled('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            if ($request->filled('requires_action') && $request->requires_action !== 'all') {
                if ($request->requires_action === 'true') {
                    $query->where('requires_immediate_action', true);
                }
            }

            // Sorting
            $sortField = $request->get('sort_field', 'priority_level');
            $sortDirection = $request->get('sort_direction', 'asc');
            $query->orderBy($sortField, $sortDirection)->orderBy('name');

            $reportTypes = $query->get()->map(function ($type) {
                // Add report counts
                $type->reports_count = $type->communityReports()->count();
                $type->pending_reports_count = $type->communityReports()->where('status', 'pending')->count();
                $type->in_progress_count = $type->communityReports()->where('status', 'in_progress')->count();
                $type->resolved_count = $type->communityReports()->where('status', 'resolved')->count();
                return $type;
            });

            // Get unique categories for filter
            $categories = ReportType::getCategories();

            // Calculate stats
            $stats = [
                'total' => ReportType::count(),
                'active' => ReportType::where('is_active', true)->count(),
                'inactive' => ReportType::where('is_active', false)->count(),
                'requires_immediate_action' => ReportType::where('requires_immediate_action', true)->count(),
                'allows_anonymous' => ReportType::where('allows_anonymous', true)->count(),
                'requires_evidence' => ReportType::where('requires_evidence', true)->count(),
                'critical' => ReportType::where('priority_level', 1)->count(),
                'high' => ReportType::where('priority_level', 2)->count(),
                'medium' => ReportType::where('priority_level', 3)->count(),
                'low' => ReportType::where('priority_level', 4)->count(),
                'total_reports' => CommunityReport::count(),
                'pending_reports' => CommunityReport::where('status', 'pending')->count(),
                'in_progress_reports' => CommunityReport::where('status', 'in_progress')->count(),
                'resolved_reports' => CommunityReport::where('status', 'resolved')->count(),
            ];

            return Inertia::render('admin/Reports/ReportTypes/Index', [
                'reportTypes' => $reportTypes,
                'filters' => $request->only(['search', 'status', 'priority', 'category', 'requires_action', 'sort_field', 'sort_direction']),
                'stats' => $stats,
                'categories' => $categories,
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading report types:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('admin/Reports/ReportTypes/Index', [
                'reportTypes' => [],
                'filters' => $request->only(['search', 'status', 'priority', 'category', 'requires_action']),
                'stats' => [
                    'total' => 0,
                    'active' => 0,
                    'inactive' => 0,
                    'requires_immediate_action' => 0,
                    'allows_anonymous' => 0,
                    'requires_evidence' => 0,
                    'critical' => 0,
                    'high' => 0,
                    'medium' => 0,
                    'low' => 0,
                    'total_reports' => 0,
                    'pending_reports' => 0,
                    'in_progress_reports' => 0,
                    'resolved_reports' => 0,
                ],
                'categories' => [],
                'error' => 'Failed to load report types. Please try again.'
            ]);
        }
    }

    /**
     * Show the form for creating a new report type.
     */
    public function create()
    {
        // Get common types for quick selection
        $commonTypes = ReportType::COMMON_TYPES;

        // Prepare priority levels for dropdown
        $priorityOptions = [];
        foreach (ReportType::PRIORITY_LABELS as $level => $data) {
            $priorityOptions[$level] = "{$data['label']} (Level {$level})";
        }

        // Default role options for barangay
        $roleOptions = [
            'barangay_captain' => 'Barangay Captain',
            'barangay_secretary' => 'Barangay Secretary',
            'barangay_treasurer' => 'Barangay Treasurer',
            'barangay_tanod' => 'Barangay Tanod',
            'barangay_health_worker' => 'Barangay Health Worker',
            'barangay_sanitation' => 'Sanitation Officer',
            'barangay_engineer' => 'Barangay Engineer',
            'barangay_utility' => 'Utility Officer',
            'lupon_member' => 'Lupon Member',
            'kagawad' => 'Barangay Kagawad',
        ];

        // Default required field types
        $fieldTypes = [
            'text' => 'Text Field',
            'textarea' => 'Text Area',
            'number' => 'Number',
            'date' => 'Date',
            'time' => 'Time',
            'datetime' => 'Date & Time',
            'select' => 'Dropdown',
            'radio' => 'Radio Buttons',
            'checkbox' => 'Checkbox',
            'file' => 'File Upload',
            'tel' => 'Phone Number',
            'email' => 'Email',
        ];

        // Default required fields template (updated to reporter_* fields)
        $defaultRequiredFields = [
            [
                'key' => 'reporter_name',
                'label' => 'Full Name',
                'type' => 'text',
                'required' => true,
                'placeholder' => 'Enter full name',
            ],
            [
                'key' => 'reporter_contact',
                'label' => 'Contact Number',
                'type' => 'tel',
                'required' => true,
                'placeholder' => '09XXXXXXXXX',
            ],
            [
                'key' => 'reporter_address',
                'label' => 'Address',
                'type' => 'text',
                'required' => true,
                'placeholder' => 'House #, Street, Purok',
            ],
            [
                'key' => 'incident_location',
                'label' => 'Incident Location',
                'type' => 'text',
                'required' => true,
                'placeholder' => 'Specific location where incident happened',
            ],
            [
                'key' => 'incident_date',
                'label' => 'Date of Incident',
                'type' => 'date',
                'required' => true,
            ],
            [
                'key' => 'incident_time',
                'label' => 'Time of Incident',
                'type' => 'time',
                'required' => true,
            ],
            [
                'key' => 'detailed_description',
                'label' => 'Detailed Description',
                'type' => 'textarea',
                'required' => true,
                'placeholder' => 'Describe what happened in detail...',
                'rows' => 4,
            ],
        ];

        // Default resolution steps template (updated to report terminology)
        $defaultResolutionSteps = [
            ['step' => 1, 'action' => 'Report Received', 'description' => 'Report has been submitted and logged'],
            ['step' => 2, 'action' => 'Initial Assessment', 'description' => 'Report is being reviewed and assigned'],
            ['step' => 3, 'action' => 'Field Investigation', 'description' => 'Assigned personnel will conduct site visit'],
            ['step' => 4, 'action' => 'Resolution Planning', 'description' => 'Developing solution and action plan'],
            ['step' => 5, 'action' => 'Implementation', 'description' => 'Executing the resolution plan'],
            ['step' => 6, 'action' => 'Follow-up', 'description' => 'Monitoring and ensuring issue is resolved'],
            ['step' => 7, 'action' => 'Report Closed', 'description' => 'Report has been successfully resolved'],
        ];

        return Inertia::render('admin/Reports/ReportTypes/Create', [
            'commonTypes' => array_values($commonTypes),
            'priorityOptions' => $priorityOptions,
            'roleOptions' => $roleOptions,
            'fieldTypes' => $fieldTypes,
            'defaultRequiredFields' => $defaultRequiredFields,
            'defaultResolutionSteps' => $defaultResolutionSteps,
        ]);
    }

    /**
     * Store a newly created report type in storage.
     */
    public function store(Request $request)
    {
        Log::info('Report Type Store Request Received', [
            'request_data' => $request->all(),
            'ip' => $request->ip(),
        ]);

        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:report_types,code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:50',
                'subcategory' => 'nullable|string|max:50',
                'icon' => 'nullable|string|max:50',
                'color' => 'nullable|string|max:7',
                'priority_level' => 'required|integer|min:1|max:4',
                'resolution_days' => 'required|integer|min:1|max:365',

                // Boolean flags
                'is_active' => 'boolean',
                'requires_immediate_action' => 'boolean',
                'requires_evidence' => 'boolean',
                'allows_anonymous' => 'boolean',

                // Arrays (JSON)
                'required_fields' => 'nullable|array',
                'required_fields.*.key' => 'required|string',
                'required_fields.*.label' => 'required|string',
                'required_fields.*.type' => 'required|string',
                'required_fields.*.required' => 'boolean',
                'required_fields.*.placeholder' => 'nullable|string',
                'required_fields.*.options' => 'nullable|array',
                'required_fields.*.rows' => 'nullable|integer',

                'resolution_steps' => 'nullable|array',
                'resolution_steps.*.step' => 'required|integer',
                'resolution_steps.*.action' => 'required|string',
                'resolution_steps.*.description' => 'nullable|string',

                'assigned_to_roles' => 'nullable|array',
                'assigned_to_roles.*' => 'string',
            ]);

            // Set default values
            $validated['is_active'] = $validated['is_active'] ?? true;
            $validated['requires_immediate_action'] = $validated['requires_immediate_action'] ?? false;
            $validated['requires_evidence'] = $validated['requires_evidence'] ?? false;
            $validated['allows_anonymous'] = $validated['allows_anonymous'] ?? false;

            // Set default icon and color if not provided
            $validated['icon'] = $validated['icon'] ?? 'alert-circle';
            $validated['color'] = $validated['color'] ?? ReportType::PRIORITY_LABELS[$validated['priority_level']]['color'] ?? '#3B82F6';

            // Encode arrays to JSON (they will be cast back to arrays by the model)
            if (isset($validated['required_fields'])) {
                $validated['required_fields'] = json_encode($validated['required_fields']);
            } else {
                $validated['required_fields'] = json_encode([]);
            }

            if (isset($validated['resolution_steps'])) {
                $validated['resolution_steps'] = json_encode($validated['resolution_steps']);
            } else {
                $validated['resolution_steps'] = json_encode([]);
            }

            if (isset($validated['assigned_to_roles'])) {
                $validated['assigned_to_roles'] = json_encode($validated['assigned_to_roles']);
            } else {
                $validated['assigned_to_roles'] = json_encode([]);
            }

            Log::info('Creating ReportType with data:', ['report_type_data' => $validated]);

            // Create the report type
            $reportType = ReportType::create($validated);

            Log::info('ReportType created successfully', [
                'report_type_id' => $reportType->id,
                'report_type_code' => $reportType->code,
                'report_type_name' => $reportType->name,
            ]);

            return redirect()->route('admin.report-types.show', $reportType)
                ->with('success', 'Report type created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error in report type store method:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'An error occurred while creating the report type: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified report type.
     */
    public function show(ReportType $reportType)
    {
        try {
            // Load related community reports count
            $reportType->loadCount('communityReports');

            // Get recent reports
            $recentReports = $reportType->communityReports()
                ->with(['reporter', 'assignedTo'])
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'reference_number' => $report->reference_number,
                        'title' => $report->title,
                        'status' => $report->status,
                        'priority_level' => $report->priority_level,
                        'reporter_name' => $report->reporter->name ?? $report->reporter_name ?? 'Anonymous',
                        'assigned_to_name' => $report->assignedTo->name ?? 'Unassigned',
                        'created_at' => $report->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            // Get report statistics
            $reportStats = [
                'total' => $reportType->communityReports()->count(),
                'pending' => $reportType->communityReports()->where('status', 'pending')->count(),
                'in_progress' => $reportType->communityReports()->where('status', 'in_progress')->count(),
                'resolved' => $reportType->communityReports()->where('status', 'resolved')->count(),
                'closed' => $reportType->communityReports()->where('status', 'closed')->count(),
                'with_evidence' => $reportType->communityReports()->whereHas('evidences')->count(),
                'anonymous' => $reportType->communityReports()->where('is_anonymous', true)->count(),
            ];

            return Inertia::render('admin/Reports/ReportTypes/Show', [
                'reportType' => $reportType,
                'recentReports' => $recentReports,
                'reportStats' => $reportStats,
            ]);

        } catch (\Exception $e) {
            Log::error('Error showing report type:', [
                'error' => $e->getMessage(),
                'report_type_id' => $reportType->id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('report-types.index')
                ->with('error', 'Failed to load report type details.');
        }
    }

    /**
     * Show the form for editing the specified report type.
     */
    public function edit(ReportType $reportType)
    {
        try {
            // Prepare priority levels for dropdown
            $priorityOptions = [];
            foreach (ReportType::PRIORITY_LABELS as $level => $data) {
                $priorityOptions[$level] = "{$data['label']} (Level {$level})";
            }

            // Default role options
            $roleOptions = [
                'barangay_captain' => 'Barangay Captain',
                'barangay_secretary' => 'Barangay Secretary',
                'barangay_treasurer' => 'Barangay Treasurer',
                'barangay_tanod' => 'Barangay Tanod',
                'barangay_health_worker' => 'Barangay Health Worker',
                'barangay_sanitation' => 'Sanitation Officer',
                'barangay_engineer' => 'Barangay Engineer',
                'barangay_utility' => 'Utility Officer',
                'lupon_member' => 'Lupon Member',
                'kagawad' => 'Barangay Kagawad',
            ];

            // Field types
            $fieldTypes = [
                'text' => 'Text Field',
                'textarea' => 'Text Area',
                'number' => 'Number',
                'date' => 'Date',
                'time' => 'Time',
                'datetime' => 'Date & Time',
                'select' => 'Dropdown',
                'radio' => 'Radio Buttons',
                'checkbox' => 'Checkbox',
                'file' => 'File Upload',
                'tel' => 'Phone Number',
                'email' => 'Email',
            ];

            // Category options (from seeder)
            $categoryOptions = [
                'complaint' => 'Complaint',
                'issue' => 'Community Issue',
                'request' => 'Request',
                'concern' => 'Concern',
                'suggestion' => 'Suggestion',
            ];

            return Inertia::render('admin/Reports/ReportTypes/Edit', [
                'reportType' => $reportType,
                'priorityOptions' => $priorityOptions,
                'roleOptions' => $roleOptions,
                'fieldTypes' => $fieldTypes,
                'categoryOptions' => $categoryOptions,
            ]);

        } catch (\Exception $e) {
            Log::error('Error editing report type:', [
                'error' => $e->getMessage(),
                'report_type_id' => $reportType->id,
            ]);

            return redirect()->route('report-types.index')
                ->with('error', 'Failed to load report type for editing.');
        }
    }

    /**
     * Update the specified report type in storage.
     */
    public function update(Request $request, ReportType $reportType)
    {
        Log::info('Report Type Update Request Received', [
            'report_type_id' => $reportType->id,
            'request_data' => $request->all(),
            'ip' => $request->ip(),
        ]);

        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:report_types,code,' . $reportType->id,
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:50',
                'subcategory' => 'nullable|string|max:50',
                'icon' => 'nullable|string|max:50',
                'color' => 'nullable|string|max:7',
                'priority_level' => 'required|integer|min:1|max:4',
                'resolution_days' => 'required|integer|min:1|max:365',

                // Boolean flags
                'is_active' => 'boolean',
                'requires_immediate_action' => 'boolean',
                'requires_evidence' => 'boolean',
                'allows_anonymous' => 'boolean',

                // Arrays (JSON)
                'required_fields' => 'nullable|array',
                'required_fields.*.key' => 'required|string',
                'required_fields.*.label' => 'required|string',
                'required_fields.*.type' => 'required|string',
                'required_fields.*.required' => 'boolean',
                'required_fields.*.placeholder' => 'nullable|string',
                'required_fields.*.options' => 'nullable|array',
                'required_fields.*.rows' => 'nullable|integer',

                'resolution_steps' => 'nullable|array',
                'resolution_steps.*.step' => 'required|integer',
                'resolution_steps.*.action' => 'required|string',
                'resolution_steps.*.description' => 'nullable|string',

                'assigned_to_roles' => 'nullable|array',
                'assigned_to_roles.*' => 'string',
            ]);

            // Set default values for booleans
            $validated['is_active'] = $validated['is_active'] ?? $reportType->is_active;
            $validated['requires_immediate_action'] = $validated['requires_immediate_action'] ?? $reportType->requires_immediate_action;
            $validated['requires_evidence'] = $validated['requires_evidence'] ?? $reportType->requires_evidence;
            $validated['allows_anonymous'] = $validated['allows_anonymous'] ?? $reportType->allows_anonymous;

            // Encode arrays to JSON (they will be cast back to arrays by the model)
            if (isset($validated['required_fields'])) {
                $validated['required_fields'] = json_encode($validated['required_fields']);
            } else {
                $validated['required_fields'] = json_encode([]);
            }

            if (isset($validated['resolution_steps'])) {
                $validated['resolution_steps'] = json_encode($validated['resolution_steps']);
            } else {
                $validated['resolution_steps'] = json_encode([]);
            }

            if (isset($validated['assigned_to_roles'])) {
                $validated['assigned_to_roles'] = json_encode($validated['assigned_to_roles']);
            } else {
                $validated['assigned_to_roles'] = json_encode([]);
            }

            // Update the report type
            $reportType->update($validated);

            Log::info('ReportType updated successfully', [
                'report_type_id' => $reportType->id,
                'report_type_code' => $reportType->code,
                'report_type_name' => $reportType->name,
            ]);

            return redirect()->route('admin.report-types.show', $reportType)
                ->with('success', 'Report type updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'report_type_id' => $reportType->id,
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error in report type update method:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'report_type_id' => $reportType->id,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'An error occurred while updating the report type: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified report type from storage.
     */
    public function destroy(ReportType $reportType)
    {
        try {
            // Check if report type is in use
            if ($reportType->communityReports()->exists()) {
                $count = $reportType->communityReports()->count();
                return back()->with('error', "Cannot delete report type that is in use. There are {$count} existing reports using this type.");
            }

            $reportType->delete();

            Log::info('ReportType deleted successfully', [
                'report_type_id' => $reportType->id,
                'report_type_code' => $reportType->code,
                'report_type_name' => $reportType->name,
            ]);

            return redirect()->route('report-types.index')
                ->with('success', 'Report type deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Error deleting report type:', [
                'error' => $e->getMessage(),
                'report_type_id' => $reportType->id,
            ]);

            return back()->with('error', 'Failed to delete report type. Please try again.');
        }
    }

    /**
     * Toggle the active status of a report type.
     */
    public function toggleStatus(ReportType $reportType)
    {
        try {
            $reportType->update(['is_active' => !$reportType->is_active]);

            $status = $reportType->is_active ? 'activated' : 'deactivated';

            Log::info('ReportType status toggled', [
                'report_type_id' => $reportType->id,
                'new_status' => $reportType->is_active,
            ]);

            return back()->with('success', "Report type {$status} successfully.");

        } catch (\Exception $e) {
            Log::error('Error toggling report type status:', [
                'error' => $e->getMessage(),
                'report_type_id' => $reportType->id,
            ]);

            return back()->with('error', 'Failed to toggle status. Please try again.');
        }
    }

    /**
     * Toggle the requires immediate action flag.
     */
    public function toggleRequiresImmediateAction(ReportType $reportType)
    {
        try {
            $reportType->update(['requires_immediate_action' => !$reportType->requires_immediate_action]);

            $status = $reportType->requires_immediate_action ? 'marked as requiring immediate action' : 'marked as not requiring immediate action';

            Log::info('ReportType requires_immediate_action toggled', [
                'report_type_id' => $reportType->id,
                'new_value' => $reportType->requires_immediate_action,
            ]);

            return back()->with('success', "Report type {$status} successfully.");

        } catch (\Exception $e) {
            Log::error('Error toggling requires_immediate_action:', [
                'error' => $e->getMessage(),
                'report_type_id' => $reportType->id,
            ]);

            return back()->with('error', 'Failed to toggle immediate action flag. Please try again.');
        }
    }

    /**
     * Perform bulk actions on report types.
     */
    public function bulkAction(Request $request)
    {
        try {
            $validated = $request->validate([
                'action' => 'required|in:activate,deactivate,delete,toggle_immediate_action,toggle_anonymous,toggle_evidence',
                'report_type_ids' => 'required|array',
                'report_type_ids.*' => 'exists:report_types,id',
            ]);

            $count = 0;
            $skipped = 0;

            DB::beginTransaction();

            foreach ($validated['report_type_ids'] as $reportTypeId) {
                $reportType = ReportType::find($reportTypeId);

                switch ($validated['action']) {
                    case 'activate':
                        $reportType->update(['is_active' => true]);
                        $count++;
                        break;

                    case 'deactivate':
                        $reportType->update(['is_active' => false]);
                        $count++;
                        break;

                    case 'toggle_immediate_action':
                        $reportType->update(['requires_immediate_action' => !$reportType->requires_immediate_action]);
                        $count++;
                        break;

                    case 'toggle_anonymous':
                        $reportType->update(['allows_anonymous' => !$reportType->allows_anonymous]);
                        $count++;
                        break;

                    case 'toggle_evidence':
                        $reportType->update(['requires_evidence' => !$reportType->requires_evidence]);
                        $count++;
                        break;

                    case 'delete':
                        // Check if report type is in use
                        if (!$reportType->communityReports()->exists()) {
                            $reportType->delete();
                            $count++;
                        } else {
                            $skipped++;
                        }
                        break;
                }
            }

            DB::commit();

            $message = "{$count} report types updated successfully.";
            if ($skipped > 0) {
                $message .= " {$skipped} report types were skipped (in use).";
            }

            Log::info('Bulk action performed on report types', [
                'action' => $validated['action'],
                'count' => $count,
                'skipped' => $skipped,
            ]);

            return back()->with('success', $message);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->with('error', 'Invalid request data.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in bulk action:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to perform bulk action. Please try again.');
        }
    }

    /**
     * Quick create from common type.
     */
    public function createFromCommonType(Request $request)
    {
        try {
            $typeCode = $request->input('type_code');

            if (!isset(ReportType::COMMON_TYPES[$typeCode])) {
                return back()->with('error', 'Invalid report type selected.');
            }

            $commonType = ReportType::COMMON_TYPES[$typeCode];

            // Check if already exists
            if (ReportType::where('code', $commonType['code'])->exists()) {
                return back()->with('error', 'This report type already exists.');
            }

            // Create the report type
            $reportType = ReportType::create([
                'code' => $commonType['code'],
                'name' => $commonType['name'],
                'description' => $commonType['description'],
                'icon' => $commonType['icon'] ?? 'alert-circle',
                'color' => $commonType['color'] ?? '#3B82F6',
                'priority_level' => $commonType['priority_level'],
                'resolution_days' => $commonType['resolution_days'],
                'requires_immediate_action' => $commonType['requires_immediate_action'] ?? false,
                'requires_evidence' => $commonType['requires_evidence'] ?? false,
                'allows_anonymous' => $commonType['allows_anonymous'] ?? false,
                'is_active' => true,
                'required_fields' => json_encode([]),
                'resolution_steps' => json_encode([]),
                'assigned_to_roles' => json_encode([]),
            ]);

            Log::info('Report type created from template', [
                'template' => $typeCode,
                'new_id' => $reportType->id,
            ]);

            return redirect()->route('admin.report-types.edit', $reportType)
                ->with('success', 'Report type created from template. You can now customize it.');

        } catch (\Exception $e) {
            Log::error('Error creating from common type:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to create report type from template.');
        }
    }

    /**
     * Get reports for a specific report type.
     */
    public function getReports(ReportType $reportType, Request $request)
    {
        try {
            $reports = $reportType->communityReports()
                ->with(['reporter', 'assignedTo', 'evidences'])
                ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                    $query->where('status', $request->status);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(15)
                ->withQueryString();

            return Inertia::render('admin/Reports/ReportTypes/Reports', [
                'reportType' => $reportType,
                'reports' => $reports,
                'filters' => $request->only(['status']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting reports for report type:', [
                'error' => $e->getMessage(),
                'report_type_id' => $reportType->id,
            ]);

            return redirect()->route('admin.report-types.show', $reportType)
                ->with('error', 'Failed to load reports for this type.');
        }
    }

    /**
     * Export report types to CSV.
     */
    public function export(Request $request)
    {
        try {
            $query = ReportType::query()
                ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                    $isActive = $request->status === 'active';
                    $query->where('is_active', $isActive);
                })
                ->when($request->category && $request->category !== 'all', function ($query) use ($request) {
                    $query->where('category', $request->category);
                })
                ->orderBy('priority_level')
                ->orderBy('name');

            $reportTypes = $query->get();

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename=report_types_export_' . date('Y-m-d_His') . '.csv',
            ];

            $callback = function () use ($reportTypes) {
                $file = fopen('php://output', 'w');

                // Add BOM for UTF-8
                fwrite($file, "\xEF\xBB\xBF");

                // Headers
                fputcsv($file, [
                    'ID',
                    'Code',
                    'Name',
                    'Category',
                    'Description',
                    'Priority Level',
                    'Resolution Days',
                    'Active',
                    'Requires Immediate Action',
                    'Requires Evidence',
                    'Allows Anonymous',
                    'Reports Count',
                    'Created At',
                ]);

                // Data
                foreach ($reportTypes as $type) {
                    fputcsv($file, [
                        $type->id,
                        $type->code,
                        $type->name,
                        $type->category ?? 'N/A',
                        $type->description ?? '',
                        $type->priority_level,
                        $type->resolution_days,
                        $type->is_active ? 'Yes' : 'No',
                        $type->requires_immediate_action ? 'Yes' : 'No',
                        $type->requires_evidence ? 'Yes' : 'No',
                        $type->allows_anonymous ? 'Yes' : 'No',
                        $type->communityReports()->count(),
                        $type->created_at->format('Y-m-d H:i:s'),
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Error exporting report types:', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to export report types. Please try again.');
        }
    }
}