<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceType;
use App\Models\DocumentType;
use App\Models\DocumentRequirement;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClearanceTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ClearanceType::withCount('clearanceRequests');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by payment requirement
        if ($request->has('requires_payment')) {
            $query->where('requires_payment', $request->requires_payment === 'yes');
        }

        // Sort functionality
        $sortColumn = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        
        // Validate sort column
        $allowedSortColumns = ['name', 'code', 'fee', 'processing_days', 'validity_days', 'is_active', 'created_at', 'updated_at'];
        if (!in_array($sortColumn, $allowedSortColumns)) {
            $sortColumn = 'created_at';
        }
        
        $query->orderBy($sortColumn, $sortDirection);

        $clearanceTypes = $query->paginate(10)->withQueryString();

        // Transform data to include necessary attributes
        $clearanceTypes->getCollection()->transform(function ($type) {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'description' => $type->description,
                'fee' => $type->fee,
                'formatted_fee' => $type->formatted_fee,
                'processing_days' => $type->processing_days,
                'validity_days' => $type->validity_days,
                'is_active' => $type->is_active,
                'requires_payment' => $type->requires_payment,
                'requires_approval' => $type->requires_approval,
                'is_online_only' => $type->is_online_only,
                'clearances_count' => $type->clearance_requests_count,
                'document_types_count' => $type->documentRequirements()->count(),
                'created_at' => $type->created_at ? $type->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $type->updated_at ? $type->updated_at->format('Y-m-d H:i:s') : null,
                'purpose_options' => $type->purpose_options,
            ];
        });

        return Inertia::render('admin/Clearance-types/Index', [
            'clearanceTypes' => $clearanceTypes,
            'filters' => $request->only(['search', 'status', 'requires_payment', 'sort', 'direction']),
            'stats' => $this->getStats(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $documentTypes = DocumentType::where('is_active', true)
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'description', 'category', 'is_active']);

        return Inertia::render('admin/Clearance-types/Create', [
            'commonTypes' => ClearanceType::COMMON_TYPES,
            'documentTypes' => $documentTypes,
            'defaultPurposeOptions' => [
                'Employment',
                'Business Registration',
                'Travel',
                'School Requirement',
                'Government Transaction',
                'Loan Application',
                'Other',
            ],
            'eligibilityOperators' => [
                ['value' => 'equals', 'label' => 'Equals'],
                ['value' => 'not_equals', 'label' => 'Not Equals'],
                ['value' => 'greater_than', 'label' => 'Greater Than'],
                ['value' => 'less_than', 'label' => 'Less Than'],
                ['value' => 'greater_than_or_equal', 'label' => 'Greater Than or Equal'],
                ['value' => 'less_than_or_equal', 'label' => 'Less Than or Equal'],
                ['value' => 'in', 'label' => 'In List'],
                ['value' => 'not_in', 'label' => 'Not In List'],
                ['value' => 'contains', 'label' => 'Contains'],
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:clearance_types,name',
            'code' => 'required|string|max:50|unique:clearance_types,code|regex:/^[A-Z_]+$/',
            'description' => 'nullable|string',
            'fee' => 'required|numeric|min:0',
            'processing_days' => 'required|integer|min:1|max:365',
            'validity_days' => 'required|integer|min:1|max:3650',
            'is_active' => 'boolean',
            'requires_payment' => 'boolean',
            'requires_approval' => 'boolean',
            'is_online_only' => 'boolean',
            'document_requirements' => 'nullable|array',
            'document_requirements.*.document_type_id' => 'required|exists:document_types,id',
            'document_requirements.*.is_required' => 'boolean',
            'document_requirements.*.sort_order' => 'integer|min:0',
            'eligibility_criteria' => 'nullable|array',
            'eligibility_criteria.*.field' => 'required|string',
            'eligibility_criteria.*.operator' => 'required|string',
            'eligibility_criteria.*.value' => 'required',
            'purpose_options' => 'nullable|string|max:1000',
            'requirements' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated) {
            // Create the clearance type
            $clearanceType = ClearanceType::create([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'description' => $validated['description'] ?? null,
                'fee' => $validated['fee'],
                'processing_days' => $validated['processing_days'],
                'validity_days' => $validated['validity_days'],
                'is_active' => $validated['is_active'] ?? true,
                'requires_payment' => $validated['requires_payment'] ?? false,
                'requires_approval' => $validated['requires_approval'] ?? false,
                'is_online_only' => $validated['is_online_only'] ?? false,
                'eligibility_criteria' => $validated['eligibility_criteria'] ?? null,
                'purpose_options' => $validated['purpose_options'] ?? null,
                'requirements' => $validated['requirements'] ?? null,
            ]);

            // Create document requirements if provided
            if (!empty($validated['document_requirements'])) {
                foreach ($validated['document_requirements'] as $index => $req) {
                    DocumentRequirement::create([
                        'clearance_type_id' => $clearanceType->id,
                        'document_type_id' => $req['document_type_id'],
                        'is_required' => $req['is_required'] ?? true,
                        'sort_order' => $req['sort_order'] ?? $index,
                    ]);
                }
            }
        });

        return redirect()->route('clearance-types.index')
            ->with('success', 'Clearance type created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ClearanceType $clearanceType)
    {
        // Check if the clearance type exists
        if (!$clearanceType->exists) {
            abort(404, 'Clearance type not found');
        }

        // Load relationships using query to get actual data
        $clearanceType->load([
            'documentRequirements' => function ($query) {
                $query->with('documentType:id,name,description')
                      ->orderBy('sort_order', 'asc');
            },
            'clearanceRequests' => function ($query) {
                $query->with('resident:id,first_name,last_name')
                      ->latest()
                      ->limit(5);
            }
        ]);

        // Prepare recent clearances - use the loaded relationship
        $recentClearances = collect();
        if ($clearanceType->relationLoaded('clearanceRequests')) {
            // Access the relationship as a method to get collection
            $clearanceRequests = $clearanceType->clearanceRequests()->get();
            $recentClearances = $clearanceRequests->map(function ($request) {
                return [
                    'id' => $request->id,
                    'resident_name' => $request->resident ? 
                        $request->resident->first_name . ' ' . $request->resident->last_name : 'Unknown',
                    'status' => $request->status,
                    'created_at' => $request->created_at ? $request->created_at->format('Y-m-d H:i:s') : null,
                ];
            });
        }

        // Prepare document types - get the relationship as a collection
        $documentTypes = collect();
        if ($clearanceType->relationLoaded('documentRequirements')) {
            // Access the relationship as a method to get collection
            $documentRequirements = $clearanceType->documentRequirements()->get();
            $documentTypes = $documentRequirements->map(function ($requirement) {
                return [
                    'id' => $requirement->document_type_id,
                    'name' => $requirement->documentType->name ?? 'Unknown',
                    'description' => $requirement->documentType->description ?? '',
                    'is_required' => $requirement->is_required,
                    'sort_order' => $requirement->sort_order,
                ];
            });
        }

        // Prepare clearance type data
        $clearanceTypeData = [
            'id' => $clearanceType->id,
            'name' => $clearanceType->name,
            'code' => $clearanceType->code,
            'description' => $clearanceType->description,
            'fee' => $clearanceType->fee,
            'formatted_fee' => $clearanceType->formatted_fee,
            'processing_days' => $clearanceType->processing_days,
            'validity_days' => $clearanceType->validity_days,
            'is_active' => $clearanceType->is_active,
            'requires_payment' => $clearanceType->requires_payment,
            'requires_approval' => $clearanceType->requires_approval,
            'is_online_only' => $clearanceType->is_online_only,
            'eligibility_criteria' => $clearanceType->eligibility_criteria ?? [],
            'purpose_options' => $clearanceType->purpose_options,
            'requirements' => $clearanceType->requirements ?? [],
            'document_types' => $documentTypes->values()->all(), // Convert to array
            'clearances_count' => $clearanceType->clearanceRequests()->count(),
            'document_types_count' => $clearanceType->documentRequirements()->count(),
            'created_at' => $clearanceType->created_at ? $clearanceType->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $clearanceType->updated_at ? $clearanceType->updated_at->format('Y-m-d H:i:s') : null,
        ];

        return Inertia::render('admin/Clearance-types/Show', [
            'clearanceType' => $clearanceTypeData,
            'recentClearances' => $recentClearances->values()->all(), // Convert to array
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClearanceType $clearanceType)
    {
        // Check if the clearance type exists
        if (!$clearanceType->exists) {
            abort(404, 'Clearance type not found');
        }

        // Load relationships
        $clearanceType->load([
            'documentRequirements' => function ($query) {
                $query->with('documentType:id,name')
                      ->orderBy('sort_order', 'asc');
            }
        ]);

        // Get available document types
        $documentTypes = DocumentType::where('is_active', true)
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'description', 'category', 'is_active']);

        // Prepare document requirements for the form
        $documentRequirements = collect();
        if ($clearanceType->relationLoaded('documentRequirements')) {
            // Access the relationship as a method to get collection
            $requirements = $clearanceType->documentRequirements()->get();
            $documentRequirements = $requirements->map(function ($requirement) {
                return [
                    'document_type_id' => $requirement->document_type_id,
                    'is_required' => $requirement->is_required,
                    'sort_order' => $requirement->sort_order,
                ];
            });
        }

        // Prepare clearance type data
        $clearanceTypeData = [
            'id' => $clearanceType->id,
            'name' => $clearanceType->name,
            'code' => $clearanceType->code,
            'description' => $clearanceType->description,
            'fee' => $clearanceType->fee,
            'processing_days' => $clearanceType->processing_days,
            'validity_days' => $clearanceType->validity_days,
            'is_active' => $clearanceType->is_active,
            'requires_payment' => $clearanceType->requires_payment,
            'requires_approval' => $clearanceType->requires_approval,
            'is_online_only' => $clearanceType->is_online_only,
            'eligibility_criteria' => $clearanceType->eligibility_criteria ?? [],
            'purpose_options' => $clearanceType->purpose_options,
            'requirements' => $clearanceType->requirements ?? [],
            'document_requirements' => $documentRequirements->values()->all(), // Convert to array
        ];

        return Inertia::render('admin/Clearance-types/Edit', [
            'clearanceType' => $clearanceTypeData,
            'commonTypes' => ClearanceType::COMMON_TYPES,
            'documentTypes' => $documentTypes,
            'defaultPurposeOptions' => [
                'Employment',
                'Business Registration',
                'Travel',
                'School Requirement',
                'Government Transaction',
                'Loan Application',
                'Other',
            ],
            'eligibilityOperators' => [
                ['value' => 'equals', 'label' => 'Equals'],
                ['value' => 'not_equals', 'label' => 'Not Equals'],
                ['value' => 'greater_than', 'label' => 'Greater Than'],
                ['value' => 'less_than', 'label' => 'Less Than'],
                ['value' => 'greater_than_or_equal', 'label' => 'Greater Than or Equal'],
                ['value' => 'less_than_or_equal', 'label' => 'Less Than or Equal'],
                ['value' => 'in', 'label' => 'In List'],
                ['value' => 'not_in', 'label' => 'Not In List'],
                ['value' => 'contains', 'label' => 'Contains'],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ClearanceType $clearanceType)
    {
        // Check if the clearance type exists
        if (!$clearanceType->exists) {
            abort(404, 'Clearance type not found');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:clearance_types,name,' . $clearanceType->id,
            'code' => 'required|string|max:50|unique:clearance_types,code,' . $clearanceType->id . '|regex:/^[A-Z_]+$/',
            'description' => 'nullable|string',
            'fee' => 'required|numeric|min:0',
            'processing_days' => 'required|integer|min:1|max:365',
            'validity_days' => 'required|integer|min:1|max:3650',
            'is_active' => 'boolean',
            'requires_payment' => 'boolean',
            'requires_approval' => 'boolean',
            'is_online_only' => 'boolean',
            'document_requirements' => 'nullable|array',
            'document_requirements.*.document_type_id' => 'required|exists:document_types,id',
            'document_requirements.*.is_required' => 'boolean',
            'document_requirements.*.sort_order' => 'integer|min:0',
            'eligibility_criteria' => 'nullable|array',
            'eligibility_criteria.*.field' => 'required|string',
            'eligibility_criteria.*.operator' => 'required|string',
            'eligibility_criteria.*.value' => 'required',
            'purpose_options' => 'nullable|string|max:1000',
            'requirements' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated, $clearanceType) {
            // Update the clearance type
            $clearanceType->update([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'description' => $validated['description'] ?? null,
                'fee' => $validated['fee'],
                'processing_days' => $validated['processing_days'],
                'validity_days' => $validated['validity_days'],
                'is_active' => $validated['is_active'] ?? $clearanceType->is_active,
                'requires_payment' => $validated['requires_payment'] ?? $clearanceType->requires_payment,
                'requires_approval' => $validated['requires_approval'] ?? $clearanceType->requires_approval,
                'is_online_only' => $validated['is_online_only'] ?? $clearanceType->is_online_only,
                'eligibility_criteria' => $validated['eligibility_criteria'] ?? null,
                'purpose_options' => $validated['purpose_options'] ?? null,
                'requirements' => $validated['requirements'] ?? null,
            ]);

            // Sync document requirements
            if (isset($validated['document_requirements'])) {
                // Delete existing requirements
                $clearanceType->documentRequirements()->delete();
                
                // Create new requirements
                foreach ($validated['document_requirements'] as $index => $req) {
                    DocumentRequirement::create([
                        'clearance_type_id' => $clearanceType->id,
                        'document_type_id' => $req['document_type_id'],
                        'is_required' => $req['is_required'] ?? true,
                        'sort_order' => $req['sort_order'] ?? $index,
                    ]);
                }
            }
        });

        return redirect()->route('clearance-types.show', $clearanceType)
            ->with('success', 'Clearance type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClearanceType $clearanceType)
    {
        // Check if the clearance type exists
        if (!$clearanceType->exists) {
            abort(404, 'Clearance type not found');
        }

        // Check if there are any clearance requests using this type
        if ($clearanceType->clearanceRequests()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete clearance type. There are existing clearance requests using this type.');
        }

        $clearanceType->delete();

        return redirect()->route('clearance-types.index')
            ->with('success', 'Clearance type deleted successfully.');
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(ClearanceType $clearanceType)
    {
        // Check if the clearance type exists
        if (!$clearanceType->exists) {
            abort(404, 'Clearance type not found');
        }

        $clearanceType->update([
            'is_active' => !$clearanceType->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Clearance type status updated successfully.');
    }

    /**
     * Duplicate clearance type
     */
    public function duplicate(ClearanceType $clearanceType)
    {
        // Check if the clearance type exists
        if (!$clearanceType->exists) {
            abort(404, 'Clearance type not found');
        }

        DB::transaction(function () use ($clearanceType) {
            // Duplicate the clearance type
            $newClearanceType = $clearanceType->replicate();
            $newClearanceType->name = $clearanceType->name . ' (Copy)';
            $newClearanceType->code = $clearanceType->code . '_COPY';
            $newClearanceType->save();

            // Duplicate document requirements
            foreach ($clearanceType->documentRequirements()->get() as $requirement) {
                $newRequirement = $requirement->replicate();
                $newRequirement->clearance_type_id = $newClearanceType->id;
                $newRequirement->save();
            }
        });

        return redirect()->route('clearance-types.index')
            ->with('success', 'Clearance type duplicated successfully.');
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_types,id',
        ]);

        switch ($request->action) {
            case 'activate':
                ClearanceType::whereIn('id', $request->ids)->update(['is_active' => true]);
                $message = 'Clearance types activated successfully.';
                break;
                
            case 'deactivate':
                ClearanceType::whereIn('id', $request->ids)->update(['is_active' => false]);
                $message = 'Clearance types deactivated successfully.';
                break;
                
            case 'delete':
                // Check if any clearance type has associated clearance requests
                $typesWithRequests = ClearanceType::whereIn('id', $request->ids)
                    ->has('clearanceRequests')
                    ->count();
                    
                if ($typesWithRequests > 0) {
                    return redirect()->back()
                        ->with('error', 'Cannot delete clearance types that have associated clearance requests.');
                }
                
                ClearanceType::whereIn('id', $request->ids)->delete();
                $message = 'Clearance types deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Bulk activate (separate endpoint)
     */
    public function bulkActivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_types,id',
        ]);

        ClearanceType::whereIn('id', $request->ids)->update(['is_active' => true]);

        return response()->json(['message' => 'Selected clearance types activated successfully.']);
    }

    /**
     * Bulk deactivate (separate endpoint)
     */
    public function bulkDeactivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_types,id',
        ]);

        ClearanceType::whereIn('id', $request->ids)->update(['is_active' => false]);

        return response()->json(['message' => 'Selected clearance types deactivated successfully.']);
    }

    /**
     * Bulk delete (separate endpoint)
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_types,id',
        ]);

        // Check if any have clearance requests
        $typesWithRequests = ClearanceType::whereIn('id', $request->ids)
            ->has('clearanceRequests')
            ->count();

        if ($typesWithRequests > 0) {
            return response()->json([
                'error' => 'Cannot delete clearance types that have associated clearance requests.'
            ], 422);
        }

        ClearanceType::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Selected clearance types deleted successfully.']);
    }

    /**
     * Bulk duplicate (separate endpoint)
     */
    public function bulkDuplicate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_types,id',
        ]);

        DB::transaction(function () use ($request) {
            $clearanceTypes = ClearanceType::whereIn('id', $request->ids)->get();
            
            foreach ($clearanceTypes as $type) {
                // Duplicate the clearance type
                $newType = $type->replicate();
                $newType->name = $type->name . ' (Copy)';
                $newType->code = $type->code . '_COPY_' . time();
                $newType->save();

                // Duplicate document requirements
                foreach ($type->documentRequirements()->get() as $requirement) {
                    $newRequirement = $requirement->replicate();
                    $newRequirement->clearance_type_id = $newType->id;
                    $newRequirement->save();
                }
            }
        });

        return response()->json(['message' => 'Selected clearance types duplicated successfully.']);
    }

    /**
     * Bulk update (separate endpoint)
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_types,id',
            'field' => 'required|string|in:processing_days,validity_days,fee,requires_payment,requires_approval,is_online_only,is_active',
            'value' => 'required',
        ]);

        $field = $request->field;
        $value = $request->value;

        // Convert value based on field type
        if (in_array($field, ['processing_days', 'validity_days'])) {
            $value = (int) $value;
        } elseif ($field === 'fee') {
            $value = (float) $value;
        } elseif (in_array($field, ['requires_payment', 'requires_approval', 'is_online_only', 'is_active'])) {
            $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }

        ClearanceType::whereIn('id', $request->ids)->update([$field => $value]);

        return response()->json(['message' => 'Selected clearance types updated successfully.']);
    }

    /**
     * Export clearance types
     */
    public function export(Request $request)
    {
        $query = ClearanceType::query();

        // Apply filters if provided
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->has('requires_payment')) {
            $query->where('requires_payment', $request->requires_payment === 'yes');
        }

        if ($request->has('ids')) {
            $query->whereIn('id', $request->ids);
        }

        $clearanceTypes = $query->get();

        // Generate CSV content
        $csv = "ID,Name,Code,Description,Fee,Processing Days,Validity Days,Active,Requires Payment,Requires Approval,Online Only,Document Count,Clearance Requests\n";
        
        foreach ($clearanceTypes as $type) {
            $csv .= sprintf(
                "%d,\"%s\",\"%s\",\"%s\",%.2f,%d,%d,%s,%s,%s,%s,%d,%d\n",
                $type->id,
                $type->name,
                $type->code,
                $type->description,
                $type->fee,
                $type->processing_days,
                $type->validity_days,
                $type->is_active ? 'Yes' : 'No',
                $type->requires_payment ? 'Yes' : 'No',
                $type->requires_approval ? 'Yes' : 'No',
                $type->is_online_only ? 'Yes' : 'No',
                $type->documentRequirements()->count(),
                $type->clearanceRequests()->count()
            );
        }

        $filename = 'clearance_types_export_' . date('Y-m-d_H-i-s') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Get statistics for clearance types
     */
    private function getStats()
    {
        return [
            'total' => ClearanceType::count(),
            'active' => ClearanceType::where('is_active', true)->count(),
            'requires_payment' => ClearanceType::where('requires_payment', true)->count(),
            'requires_approval' => ClearanceType::where('requires_approval', true)->count(),
            'online_only' => ClearanceType::where('is_online_only', true)->count(),
        ];
    }
}