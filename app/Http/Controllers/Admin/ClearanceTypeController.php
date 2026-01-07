<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceType;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClearanceTypeController extends Controller
{
    // Define common types as a constant or method
    private const COMMON_TYPES = [
        'business_clearance' => [
            'name' => 'Business Clearance',
            'code' => 'BUSINESS_CLEARANCE',
            'description' => 'For business permit applications',
            'fee' => 500.00,
            'processing_days' => 3,
            'validity_days' => 365,
            'requires_payment' => true,
        ],
        'residency_certificate' => [
            'name' => 'Certificate of Residency',
            'code' => 'RESIDENCY_CERTIFICATE',
            'description' => 'Proof of barangay residency',
            'fee' => 100.00,
            'processing_days' => 1,
            'validity_days' => 90,
            'requires_payment' => true,
        ],
        'barangay_clearance' => [
            'name' => 'Barangay Clearance',
            'code' => 'BARANGAY_CLEARANCE',
            'description' => 'General barangay clearance for various purposes',
            'fee' => 50.00,
            'processing_days' => 1,
            'validity_days' => 60,
            'requires_payment' => true,
        ],
        'indigency_certificate' => [
            'name' => 'Certificate of Indigency',
            'code' => 'INDIGENCY_CERTIFICATE',
            'description' => 'For indigent residents applying for assistance',
            'fee' => 0.00,
            'processing_days' => 2,
            'validity_days' => 90,
            'requires_payment' => false,
        ],
        'good_moral_certificate' => [
            'name' => 'Certificate of Good Moral Character',
            'code' => 'GOOD_MORAL_CERTIFICATE',
            'description' => 'For employment and educational purposes',
            'fee' => 150.00,
            'processing_days' => 3,
            'validity_days' => 180,
            'requires_payment' => true,
        ],
        'first_time_jobseeker' => [
            'name' => 'First Time Jobseeker Certificate',
            'code' => 'FIRST_TIME_JOBSEEKER',
            'description' => 'For first time jobseekers applying for benefits',
            'fee' => 0.00,
            'processing_days' => 2,
            'validity_days' => 365,
            'requires_payment' => false,
        ],
        'solo_parent_certificate' => [
            'name' => 'Solo Parent Certificate',
            'code' => 'SOLO_PARENT_CERTIFICATE',
            'description' => 'For solo parents applying for benefits',
            'fee' => 0.00,
            'processing_days' => 3,
            'validity_days' => 365,
            'requires_payment' => false,
        ],
        'pwd_certificate' => [
            'name' => 'PWD Certificate',
            'code' => 'PWD_CERTIFICATE',
            'description' => 'For persons with disability applying for benefits',
            'fee' => 0.00,
            'processing_days' => 3,
            'validity_days' => 365,
            'requires_payment' => false,
        ],
        'senior_citizen_certificate' => [
            'name' => 'Senior Citizen Certificate',
            'code' => 'SENIOR_CITIZEN_CERTIFICATE',
            'description' => 'For senior citizens applying for benefits',
            'fee' => 0.00,
            'processing_days' => 2,
            'validity_days' => 365,
            'requires_payment' => false,
        ],
        'business_permit_renewal' => [
            'name' => 'Business Permit Renewal',
            'code' => 'BUSINESS_PERMIT_RENEWAL',
            'description' => 'For renewing business permits',
            'fee' => 300.00,
            'processing_days' => 2,
            'validity_days' => 365,
            'requires_payment' => true,
        ],
    ];

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
        return Inertia::render('admin/Clearance-types/Create', [
            'commonTypes' => self::COMMON_TYPES,
            'documentTypes' => DocumentType::where('is_active', true)
                ->orderBy('category')
                ->orderBy('sort_order')
                ->get(),
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
            'document_type_ids' => 'nullable|array',
            'document_type_ids.*' => 'exists:document_types,id',
            'eligibility_criteria' => 'nullable|array',
            'eligibility_criteria.*.field' => 'required|string',
            'eligibility_criteria.*.operator' => 'required|string',
            'eligibility_criteria.*.value' => 'required',
            'purpose_options' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($validated) {
            // Convert eligibility criteria to JSON
            if (isset($validated['eligibility_criteria'])) {
                $validated['eligibility_criteria'] = json_encode($validated['eligibility_criteria']);
            }

            $clearanceType = ClearanceType::create($validated);
            
            // Attach document types if provided
            if (isset($validated['document_type_ids'])) {
                $clearanceType->documentTypes()->sync($validated['document_type_ids']);
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
        $clearanceType->load(['documentTypes', 'clearances' => function ($query) {
            $query->latest()->limit(5)->with('resident:id,first_name,last_name');
        }])->loadCount('clearances');

        // Ensure eligibility_criteria is properly cast to array
        $clearanceTypeArray = $clearanceType->toArray();
        $clearanceTypeArray['eligibility_criteria'] = $clearanceType->eligibility_criteria ?? [];

        $recentClearances = $clearanceType->clearances->map(function ($clearance) {
            return [
                'id' => $clearance->id,
                'resident_name' => $clearance->resident ? 
                    $clearance->resident->first_name . ' ' . $clearance->resident->last_name : 'Unknown',
                'status' => $clearance->status,
                'created_at' => $clearance->created_at,
            ];
        });

        return Inertia::render('admin/Clearance-types/Show', [
            'clearanceType' => $clearanceTypeArray,
            'recentClearances' => $recentClearances,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClearanceType $clearanceType)
    {
        // Ensure eligibility_criteria is properly cast to array
        $clearanceTypeArray = $clearanceType->toArray();
        $clearanceTypeArray['eligibility_criteria'] = $clearanceType->eligibility_criteria ?? [];

        return Inertia::render('admin/Clearance-types/Edit', [
            'clearanceType' => array_merge($clearanceTypeArray, [
                'document_types' => $clearanceType->documentTypes->toArray()
            ]),
            'commonTypes' => self::COMMON_TYPES,
            'documentTypes' => DocumentType::where('is_active', true)
                ->orderBy('category')
                ->orderBy('sort_order')
                ->get(),
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
            'document_type_ids' => 'nullable|array',
            'document_type_ids.*' => 'exists:document_types,id',
            'eligibility_criteria' => 'nullable|array',
            'eligibility_criteria.*.field' => 'required|string',
            'eligibility_criteria.*.operator' => 'required|string',
            'eligibility_criteria.*.value' => 'required',
            'purpose_options' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($validated, $clearanceType) {
            // Convert eligibility criteria to JSON
            if (isset($validated['eligibility_criteria'])) {
                $validated['eligibility_criteria'] = json_encode($validated['eligibility_criteria']);
            } else {
                $validated['eligibility_criteria'] = null;
            }

            $clearanceType->update($validated);
            
            // Sync document types
            $clearanceType->documentTypes()->sync($validated['document_type_ids'] ?? []);
        });

        return redirect()->route('clearance-types.show', $clearanceType)
            ->with('success', 'Clearance type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClearanceType $clearanceType)
    {
        // Check if there are any clearances using this type
        if ($clearanceType->clearances()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete clearance type. There are existing clearances using this type.');
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
        DB::transaction(function () use ($clearanceType) {
            $newClearanceType = $clearanceType->replicate();
            $newClearanceType->name = $clearanceType->name . ' (Copy)';
            $newClearanceType->code = $clearanceType->code . '_COPY';
            $newClearanceType->push();

            // Duplicate document type relationships
            if ($clearanceType->documentTypes()->count() > 0) {
                $newClearanceType->documentTypes()->sync($clearanceType->documentTypes->pluck('id'));
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
                // Check if any clearance type has associated clearances
                $typesWithClearances = ClearanceType::whereIn('id', $request->ids)
                    ->has('clearances')
                    ->count();
                    
                if ($typesWithClearances > 0) {
                    return redirect()->back()
                        ->with('error', 'Cannot delete clearance types that have associated clearances.');
                }
                
                ClearanceType::whereIn('id', $request->ids)->delete();
                $message = 'Clearance types deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
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