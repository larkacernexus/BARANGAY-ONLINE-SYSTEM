<?php
// app/Http\Controllers\Admin\ReportTypeController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReportType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ReportTypeController extends Controller
{
   public function index(Request $request)
{
    return Inertia::render('admin/Reports/ReportTypes/Index', [
        'reportTypes' => ReportType::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
            })
            ->latest()
            ->get(),
        'filters' => $request->only(['search', 'status', 'priority', 'requires_action']),
        'stats' => [
            'total' => ReportType::count(),
            'active' => ReportType::where('is_active', true)->count(),
            'requires_immediate_action' => ReportType::where('requires_immediate_action', true)->count(),
            'allows_anonymous' => ReportType::where('allows_anonymous', true)->count(),
            'requires_evidence' => ReportType::where('requires_evidence', true)->count(),
            'critical' => ReportType::where('priority_level', 1)->count(),
            'high' => ReportType::where('priority_level', 2)->count(),
            'medium' => ReportType::where('priority_level', 3)->count(),
            'low' => ReportType::where('priority_level', 4)->count(),
        ],
    ]);
}
    
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
            'lupon' => 'Lupon Member',
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
        
        // Default required fields template
        $defaultRequiredFields = [
            [
                'key' => 'complainant_name',
                'label' => 'Full Name',
                'type' => 'text',
                'required' => true,
                'placeholder' => 'Enter full name',
            ],
            [
                'key' => 'complainant_contact',
                'label' => 'Contact Number',
                'type' => 'tel',
                'required' => true,
                'placeholder' => '09XXXXXXXXX',
            ],
            [
                'key' => 'complainant_address',
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
        
        // Default resolution steps template
        $defaultResolutionSteps = [
            ['step' => 1, 'action' => 'Complaint Received', 'description' => 'Complaint has been submitted and logged'],
            ['step' => 2, 'action' => 'Initial Assessment', 'description' => 'Complaint is being reviewed and assigned'],
            ['step' => 3, 'action' => 'Field Investigation', 'description' => 'Assigned personnel will conduct site visit'],
            ['step' => 4, 'action' => 'Resolution Planning', 'description' => 'Developing solution and action plan'],
            ['step' => 5, 'action' => 'Implementation', 'description' => 'Executing the resolution plan'],
            ['step' => 6, 'action' => 'Follow-up', 'description' => 'Monitoring and ensuring issue is resolved'],
            ['step' => 7, 'action' => 'Case Closed', 'description' => 'Complaint has been successfully resolved'],
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
            
            // Encode arrays to JSON
            if (isset($validated['required_fields'])) {
                $validated['required_fields'] = json_encode($validated['required_fields']);
            }
            
            if (isset($validated['resolution_steps'])) {
                $validated['resolution_steps'] = json_encode($validated['resolution_steps']);
            }
            
            if (isset($validated['assigned_to_roles'])) {
                $validated['assigned_to_roles'] = json_encode($validated['assigned_to_roles']);
            }
            
            Log::info('Creating ReportType with data:', ['report_type_data' => $validated]);
            
            // Create the report type
            $reportType = ReportType::create($validated);
            
            Log::info('ReportType created successfully', [
                'report_type_id' => $reportType->id,
                'report_type_code' => $reportType->code,
                'report_type_name' => $reportType->name,
            ]);
            
            return redirect()->route('report-types.index')
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
    
    public function show(ReportType $reportType)
    {
        $reportType->loadCount('complaints');
        
        // Decode JSON fields for display
        $reportType->required_fields = json_decode($reportType->required_fields, true) ?: [];
        $reportType->resolution_steps = json_decode($reportType->resolution_steps, true) ?: [];
        $reportType->assigned_to_roles = json_decode($reportType->assigned_to_roles, true) ?: [];
        
        return Inertia::render('admin/Reports/ReportTypes/Show', [
            'reportType' => $reportType,
            'recentComplaints' => $reportType->complaints()
                ->with(['complainant', 'assignedTo', 'status'])
                ->latest()
                ->limit(10)
                ->get(),
        ]);
    }
    
    public function edit(ReportType $reportType)
    {
        // Decode JSON fields for editing
        $reportType->required_fields = json_decode($reportType->required_fields, true) ?: [];
        $reportType->resolution_steps = json_decode($reportType->resolution_steps, true) ?: [];
        $reportType->assigned_to_roles = json_decode($reportType->assigned_to_roles, true) ?: [];
        
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
            'lupon' => 'Lupon Member',
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
        
        return Inertia::render('admin/Reports/ReportTypes/Edit', [
            'reportType' => $reportType,
            'priorityOptions' => $priorityOptions,
            'roleOptions' => $roleOptions,
            'fieldTypes' => $fieldTypes,
        ]);
    }
    
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
            
            // Encode arrays to JSON
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
            
            return redirect()->route('report-types.index')
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
    
    public function destroy(ReportType $reportType)
    {
        // Check if report type is in use
        if ($reportType->complaints()->exists()) {
            return back()->with('error', 'Cannot delete report type that is in use. There are existing reports using this type.');
        }
        
        $reportType->delete();
        
        return redirect()->route('report-types.index')
            ->with('success', 'Report type deleted successfully.');
    }
    
    public function toggleStatus(ReportType $reportType)
    {
        $reportType->update(['is_active' => !$reportType->is_active]);
        
        $status = $reportType->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "Report type {$status} successfully.");
    }
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'report_type_ids' => 'required|array',
            'report_type_ids.*' => 'exists:report_types,id',
        ]);
        
        $count = 0;
        
        foreach ($request->report_type_ids as $reportTypeId) {
            $reportType = ReportType::find($reportTypeId);
            
            switch ($request->action) {
                case 'activate':
                    $reportType->update(['is_active' => true]);
                    $count++;
                    break;
                    
                case 'deactivate':
                    $reportType->update(['is_active' => false]);
                    $count++;
                    break;
                    
                case 'delete':
                    // Check if report type is in use
                    if (!$reportType->complaints()->exists()) {
                        $reportType->delete();
                        $count++;
                    }
                    break;
            }
        }
        
        return back()->with('success', "{$count} report types updated successfully.");
    }
    
    /**
     * Quick create from common type
     */
    public function createFromCommonType(Request $request)
    {
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
        ]);
        
        return redirect()->route('report-types.edit', $reportType)
            ->with('success', 'Report type created from template. You can now customize it.');
    }
}