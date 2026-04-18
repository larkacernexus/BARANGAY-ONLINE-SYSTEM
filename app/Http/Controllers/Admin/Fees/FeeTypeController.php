<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\FeeType;
use App\Models\Purok;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class FeeTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = FeeType::query()->with('documentCategory')->latest();
        
        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('short_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('document_category_id', $request->category);
        }
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        // Filter by discountable
        if ($request->has('discountable') && $request->discountable !== 'all') {
            $query->where('is_discountable', $request->discountable === 'yes');
        }
        
        $feeTypes = $query->get();
        
        // Get categories from document_categories table for filters
        $documentCategories = DocumentCategory::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->pluck('name', 'id')
            ->toArray();
        
        return Inertia::render('admin/Fees/FeeTypes/Index', [
            'feeTypes' => $feeTypes,
            'filters' => $request->only(['search', 'category', 'status', 'discountable']),
            'categories' => $documentCategories
        ]);
    }
    
public function create()
{
    // Fetch categories from document_categories table
    $documentCategories = DocumentCategory::where('is_active', true)
        ->orderBy('order')
        ->get(['id', 'name', 'slug', 'icon', 'color']);
    
    // Transform to array format for frontend
    $categoryOptions = $documentCategories->map(function($category) {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'icon' => $category->icon,
            'color' => $category->color,
        ];
    })->values()->toArray();
    
    // Log for debugging
    Log::info('Document categories fetched for fee type create', [
        'count' => count($categoryOptions),
        'categories' => $categoryOptions
    ]);
    
    return Inertia::render('admin/Fees/FeeTypes/Create', [
        'documentCategories' => $documentCategories,
        'categories' => $categoryOptions, // Now an array of objects
        'amountTypes' => [
            'fixed' => 'Fixed Amount',
            'per_unit' => 'Per Unit',
            'computed' => 'Computed',
        ],
        'frequencies' => [
            'one_time' => 'One Time',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'semi_annual' => 'Semi-Annual',
            'annual' => 'Annual',
            'custom' => 'Custom',
        ],
        'applicableTo' => [
            'all_residents' => 'All Residents',
            'property_owners' => 'Property Owners',
            'business_owners' => 'Business Owners',
            'households' => 'Households',
            'specific_purok' => 'Specific Purok',
            'specific_zone' => 'Specific Zone',
            'visitors' => 'Visitors',
        ],
        'puroks' => Purok::pluck('name')->filter()->values()->toArray(),
    ]);
}
    
    public function store(Request $request)
    {
        Log::info('Fee Type Store Request Received', [
            'request_data' => $request->all(),
            'ip' => $request->ip(),
        ]);

        try {
            // Get all valid document category IDs for validation
            $validCategoryIds = DocumentCategory::pluck('id')->toArray();
            
            $validated = $request->validate([
                'code' => 'required|string|max:20|unique:fee_types,code',
                'name' => 'required|string|max:255',
                'short_name' => 'nullable|string|max:50',
                'document_category_id' => 'required|in:' . implode(',', $validCategoryIds),
                'base_amount' => 'required|numeric|min:0',
                'amount_type' => 'required|in:fixed,per_unit,computed',
                'computation_formula' => 'nullable|array',
                'unit' => 'nullable|string|max:50',
                'description' => 'nullable|string',
                
                // Discount flag (simplified - just boolean)
                'is_discountable' => 'boolean',
                
                // Late payments
                'has_surcharge' => 'boolean',
                'surcharge_percentage' => 'nullable|required_if:has_surcharge,true|numeric|min:0',
                'surcharge_fixed' => 'nullable|numeric|min:0',
                'has_penalty' => 'boolean',
                'penalty_percentage' => 'nullable|required_if:has_penalty,true|numeric|min:0',
                'penalty_fixed' => 'nullable|numeric|min:0',
                
                // Frequency & validity
                'frequency' => 'required|in:one_time,monthly,quarterly,semi_annual,annual,custom',
                'validity_days' => 'nullable|integer|min:1',
                
                // Applicability
                'applicable_to' => 'required|in:all_residents,property_owners,business_owners,households,specific_purok,specific_zone,visitors',
                'applicable_puroks' => 'nullable|array',
                'applicable_puroks.*' => 'string',
                'requirements' => 'nullable|array',
                'requirements.*' => 'string',
                
                // Dates
                'effective_date' => 'nullable|date',
                'expiry_date' => 'nullable|date|after:effective_date',
                
                // Settings
                'is_active' => 'boolean',
                'is_mandatory' => 'boolean',
                'auto_generate' => 'boolean',
                'due_day' => 'nullable|integer|min:1|max:31',
                'sort_order' => 'nullable|integer',
                'notes' => 'nullable|string',
            ]);

            Log::info('Validation passed', ['validated_data' => $validated]);

            // Set default values
            $validated['is_active'] = $validated['is_active'] ?? true;
            $validated['is_mandatory'] = $validated['is_mandatory'] ?? false;
            $validated['auto_generate'] = $validated['auto_generate'] ?? false;
            $validated['is_discountable'] = $validated['is_discountable'] ?? true;
            $validated['has_surcharge'] = $validated['has_surcharge'] ?? false;
            $validated['has_penalty'] = $validated['has_penalty'] ?? false;
            
            // Cast arrays properly - encode to JSON for storage
            if (isset($validated['applicable_puroks'])) {
                $validated['applicable_puroks'] = json_encode($validated['applicable_puroks']);
            } else {
                $validated['applicable_puroks'] = json_encode([]);
            }
            
            if (isset($validated['requirements'])) {
                $validated['requirements'] = json_encode($validated['requirements']);
            } else {
                $validated['requirements'] = json_encode([]);
            }
            
            if (isset($validated['computation_formula'])) {
                $validated['computation_formula'] = json_encode($validated['computation_formula']);
            } else {
                $validated['computation_formula'] = null;
            }
            
            Log::info('Creating FeeType with data:', ['fee_type_data' => $validated]);
            
            // Create the fee type
            $feeType = FeeType::create($validated);
            
            Log::info('FeeType created successfully', [
                'fee_type_id' => $feeType->id,
                'fee_type_code' => $feeType->code,
                'fee_type_name' => $feeType->name,
                'document_category_id' => $feeType->document_category_id,
                'is_discountable' => $feeType->is_discountable,
            ]);
            
            return redirect()->route('fee-types.index')
                ->with('success', 'Fee type created successfully.');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error in fee type store method:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'An error occurred while creating the fee type: ' . $e->getMessage());
        }
    }
    
    public function show(FeeType $feeType)
    {
        $feeType->load(['documentCategory'])->loadCount('fees');
        
        // Get recent fees with their polymorphic payer relationship
        $recentFees = $feeType->fees()
            ->with(['payer'])
            ->latest()
            ->limit(10)
            ->get();
        
        return Inertia::render('admin/Fees/FeeTypes/Show', [
            'feeType' => $feeType, // No manual decoding needed - casts handle it
            'recentFees' => $recentFees,
        ]);
    }
    
 public function edit(FeeType $feeType)
{
    // Load related data
    $feeType->load(['documentCategory']);
    
    // Fetch categories from document_categories table
    $documentCategories = DocumentCategory::where('is_active', true)
        ->orderBy('order')
        ->get(['id', 'name', 'slug', 'icon', 'color']);
    
    // Transform to array format for frontend
    $categoryOptions = $documentCategories->map(function($category) {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'icon' => $category->icon,
            'color' => $category->color,
        ];
    })->values()->toArray();
    
    return Inertia::render('admin/Fees/FeeTypes/Edit', [
        'feeType' => $feeType,
        'documentCategories' => $documentCategories,
        'categories' => $categoryOptions, // Now an array of objects
        'amountTypes' => [
            'fixed' => 'Fixed Amount',
            'per_unit' => 'Per Unit',
            'computed' => 'Computed',
        ],
        'frequencies' => [
            'one_time' => 'One Time',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'semi_annual' => 'Semi-Annual',
            'annual' => 'Annual',
            'custom' => 'Custom',
        ],
        'applicableTo' => [
            'all_residents' => 'All Residents',
            'property_owners' => 'Property Owners',
            'business_owners' => 'Business Owners',
            'households' => 'Households',
            'specific_purok' => 'Specific Purok',
            'specific_zone' => 'Specific Zone',
            'visitors' => 'Visitors',
        ],
        'puroks' => Purok::pluck('name')->filter()->values()->toArray(),
    ]);
}

    public function update(Request $request, FeeType $feeType)
    {
        Log::info('Fee Type Update Request Received', [
            'fee_type_id' => $feeType->id,
            'request_data' => $request->all(),
            'ip' => $request->ip(),
        ]);

        try {
            // Get all valid document category IDs for validation
            $validCategoryIds = DocumentCategory::pluck('id')->toArray();
            
            $validated = $request->validate([
                'code' => 'required|string|max:20|unique:fee_types,code,' . $feeType->id,
                'name' => 'required|string|max:255',
                'short_name' => 'nullable|string|max:50',
                'document_category_id' => 'required|in:' . implode(',', $validCategoryIds),
                'base_amount' => 'required|numeric|min:0',
                'amount_type' => 'required|in:fixed,per_unit,computed',
                'computation_formula' => 'nullable|array',
                'unit' => 'nullable|string|max:50',
                'description' => 'nullable|string',
                
                // Discount flag (simplified)
                'is_discountable' => 'boolean',
                
                // Late payments
                'has_surcharge' => 'boolean',
                'surcharge_percentage' => 'nullable|required_if:has_surcharge,true|numeric|min:0',
                'surcharge_fixed' => 'nullable|numeric|min:0',
                'has_penalty' => 'boolean',
                'penalty_percentage' => 'nullable|required_if:has_penalty,true|numeric|min:0',
                'penalty_fixed' => 'nullable|numeric|min:0',
                
                // Frequency & validity
                'frequency' => 'required|in:one_time,monthly,quarterly,semi_annual,annual,custom',
                'validity_days' => 'nullable|integer|min:1',
                
                // Applicability
                'applicable_to' => 'required|in:all_residents,property_owners,business_owners,households,specific_purok,specific_zone,visitors',
                'applicable_puroks' => 'nullable|array',
                'applicable_puroks.*' => 'string',
                'requirements' => 'nullable|array',
                'requirements.*' => 'string',
                
                // Dates
                'effective_date' => 'nullable|date',
                'expiry_date' => 'nullable|date|after:effective_date',
                
                // Settings
                'is_active' => 'boolean',
                'is_mandatory' => 'boolean',
                'auto_generate' => 'boolean',
                'due_day' => 'nullable|integer|min:1|max:31',
                'sort_order' => 'nullable|integer',
                'notes' => 'nullable|string',
            ]);

            // Set default values for booleans
            $validated['is_active'] = $validated['is_active'] ?? $feeType->is_active;
            $validated['is_mandatory'] = $validated['is_mandatory'] ?? $feeType->is_mandatory;
            $validated['auto_generate'] = $validated['auto_generate'] ?? $feeType->auto_generate;
            $validated['is_discountable'] = $validated['is_discountable'] ?? $feeType->is_discountable;
            $validated['has_surcharge'] = $validated['has_surcharge'] ?? $feeType->has_surcharge;
            $validated['has_penalty'] = $validated['has_penalty'] ?? $feeType->has_penalty;

            // Cast arrays properly - encode to JSON for storage
            if (isset($validated['applicable_puroks'])) {
                $validated['applicable_puroks'] = json_encode($validated['applicable_puroks']);
            } else {
                $validated['applicable_puroks'] = json_encode([]);
            }
            
            if (isset($validated['requirements'])) {
                $validated['requirements'] = json_encode($validated['requirements']);
            } else {
                $validated['requirements'] = json_encode([]);
            }
            
            if (isset($validated['computation_formula'])) {
                $validated['computation_formula'] = json_encode($validated['computation_formula']);
            } else {
                $validated['computation_formula'] = null;
            }

            // Update the fee type
            $feeType->update($validated);
            
            Log::info('FeeType updated successfully', [
                'fee_type_id' => $feeType->id,
                'fee_type_code' => $feeType->code,
                'fee_type_name' => $feeType->name,
                'is_discountable' => $feeType->is_discountable,
            ]);

            return redirect()->route('fee-types.index')
                ->with('success', 'Fee type updated successfully.');
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'fee_type_id' => $feeType->id,
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error in fee type update method:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'fee_type_id' => $feeType->id,
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'An error occurred while updating the fee type: ' . $e->getMessage());
        }
    }
    
    public function destroy(FeeType $feeType)
    {
        // Check if fee type is in use
        if ($feeType->fees()->exists()) {
            return back()->with('error', 'Cannot delete fee type that is in use. There are existing fees using this type.');
        }
        
        $feeType->delete();
        
        return redirect()->route('fee-types.index')
            ->with('success', 'Fee type deleted successfully.');
    }
    
    public function toggleStatus(FeeType $feeType)
    {
        $feeType->update(['is_active' => !$feeType->is_active]);
        
        $status = $feeType->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "Fee type {$status} successfully.");
    }
    
    public function toggleDiscountable(FeeType $feeType)
    {
        $feeType->update(['is_discountable' => !$feeType->is_discountable]);
        
        $status = $feeType->is_discountable ? 'discountable' : 'non-discountable';
        
        return back()->with('success', "Fee type marked as {$status} successfully.");
    }
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete,mark_discountable,mark_non_discountable',
            'fee_type_ids' => 'required|array',
            'fee_type_ids.*' => 'exists:fee_types,id',
        ]);
        
        $count = 0;
        
        foreach ($request->fee_type_ids as $feeTypeId) {
            $feeType = FeeType::find($feeTypeId);
            
            switch ($request->action) {
                case 'activate':
                    $feeType->update(['is_active' => true]);
                    $count++;
                    break;
                    
                case 'deactivate':
                    $feeType->update(['is_active' => false]);
                    $count++;
                    break;
                    
                case 'mark_discountable':
                    $feeType->update(['is_discountable' => true]);
                    $count++;
                    break;
                    
                case 'mark_non_discountable':
                    $feeType->update(['is_discountable' => false]);
                    $count++;
                    break;
                    
                case 'delete':
                    // Check if fee type is in use
                    if (!$feeType->fees()->exists()) {
                        $feeType->delete();
                        $count++;
                    }
                    break;
            }
        }
        
        return back()->with('success', "{$count} fee types updated successfully.");
    }
}