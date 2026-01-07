<?php
// app/Http/Controllers/Admin/FeeTypeController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeType;
use App\Models\Purok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DiscountType;
use App\Models\DiscountFeeType;
use Illuminate\Support\Facades\Log;


class FeeTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = FeeType::query()->latest();
        
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
            $query->where('category', $request->category);
        }
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        $feeTypes = $query->get();
        
        return Inertia::render('admin/Fees/FeeTypes/Index', [
            'feeTypes' => $feeTypes,
            'filters' => $request->only(['search', 'category', 'status']),
            'categories' => [
                'tax' => 'Taxes',
                'clearance' => 'Clearances',
                'certificate' => 'Certificates',
                'service' => 'Services',
                'rental' => 'Rentals',
                'fine' => 'Fines',
                'contribution' => 'Contributions',
                'other' => 'Other',
            ]
        ]);
    }
    
    public function create()
    {
        return Inertia::render('admin/Fees/FeeTypes/Create', [
            'categories' => [
                'tax' => 'Taxes',
                'clearance' => 'Clearances',
                'certificate' => 'Certificates',
                'service' => 'Services',
                'rental' => 'Rentals',
                'fine' => 'Fines',
                'contribution' => 'Contributions',
                'other' => 'Other',
            ],
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
                'as_needed' => 'As Needed',
            ],
            'applicableTo' => [
                'all_residents' => 'All Residents',
                'businesses' => 'Businesses Only',
                'households' => 'Households Only',
                'specific_purok' => 'Specific Purok Only',
                'visitors' => 'Visitors',
                'other' => 'Other',
            ],
            'puroks' => Purok::pluck('name')->filter()->values()->toArray(),
        ]);
    }
    

public function store(Request $request)
{
    // Log the incoming request data
    Log::info('Fee Type Store Request Received', [
        'request_data' => $request->all(),
        'request_headers' => $request->headers->all(),
        'ip' => $request->ip(),
    ]);

    try {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:fee_types,code',
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'category' => 'required|in:tax,clearance,certificate,service,rental,fine,contribution,other',
            'base_amount' => 'required|numeric|min:0',
            'amount_type' => 'required|in:fixed,per_unit,computed',
            'computation_formula' => 'nullable|array',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            
            // Discount boolean flags
            'has_senior_discount' => 'boolean',
            'has_pwd_discount' => 'boolean',
            'has_solo_parent_discount' => 'boolean',
            'has_indigent_discount' => 'boolean',
            
            // Separate percentage fields for each discount type
            'senior_discount_percentage' => 'nullable|required_if:has_senior_discount,true|numeric|min:0|max:100',
            'pwd_discount_percentage' => 'nullable|required_if:has_pwd_discount,true|numeric|min:0|max:100',
            'solo_parent_discount_percentage' => 'nullable|required_if:has_solo_parent_discount,true|numeric|min:0|max:100',
            'indigent_discount_percentage' => 'nullable|required_if:has_indigent_discount,true|numeric|min:0|max:100',
            
            // Late payments
            'has_surcharge' => 'boolean',
            'surcharge_percentage' => 'nullable|required_if:has_surcharge,true|numeric|min:0',
            'surcharge_fixed' => 'nullable|numeric|min:0',
            'has_penalty' => 'boolean',
            'penalty_percentage' => 'nullable|required_if:has_penalty,true|numeric|min:0',
            'penalty_fixed' => 'nullable|numeric|min:0',
            
            // Frequency & validity
            'frequency' => 'required|in:one_time,monthly,quarterly,semi_annual,annual,as_needed',
            'validity_days' => 'nullable|integer|min:1',
            
            // Applicability
            'applicable_to' => 'required|in:all_residents,businesses,households,specific_purok,visitors,other',
            'applicable_puroks' => 'nullable|array',
            'applicable_puroks.*' => 'string',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string',
            
            // Dates
            'effective_date' => 'required|date',
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
        $validated['has_senior_discount'] = $validated['has_senior_discount'] ?? false;
        $validated['has_pwd_discount'] = $validated['has_pwd_discount'] ?? false;
        $validated['has_solo_parent_discount'] = $validated['has_solo_parent_discount'] ?? false;
        $validated['has_indigent_discount'] = $validated['has_indigent_discount'] ?? false;
        $validated['has_surcharge'] = $validated['has_surcharge'] ?? false;
        $validated['has_penalty'] = $validated['has_penalty'] ?? false;
        
        Log::debug('Default values set', ['after_defaults' => $validated]);

        // Log discount percentages from request
        Log::debug('Discount percentages from request:', [
            'senior_discount_percentage' => $request->senior_discount_percentage,
            'pwd_discount_percentage' => $request->pwd_discount_percentage,
            'solo_parent_discount_percentage' => $request->solo_parent_discount_percentage,
            'indigent_discount_percentage' => $request->indigent_discount_percentage,
            'has_senior_discount' => $validated['has_senior_discount'],
            'has_pwd_discount' => $validated['has_pwd_discount'],
            'has_solo_parent_discount' => $validated['has_solo_parent_discount'],
            'has_indigent_discount' => $validated['has_indigent_discount'],
        ]);

        // Remove discount percentage from fee_types data
        unset($validated['senior_discount_percentage']);
        unset($validated['pwd_discount_percentage']);
        unset($validated['solo_parent_discount_percentage']);
        unset($validated['indigent_discount_percentage']);
        
        // Cast arrays properly
        if (isset($validated['applicable_puroks'])) {
            Log::debug('Applicable puroks before encoding', ['puroks' => $validated['applicable_puroks']]);
            $validated['applicable_puroks'] = json_encode($validated['applicable_puroks']);
        }
        
        if (isset($validated['requirements'])) {
            Log::debug('Requirements before encoding', ['requirements' => $validated['requirements']]);
            $validated['requirements'] = json_encode($validated['requirements']);
        }
        
        Log::info('Creating FeeType with data:', ['fee_type_data' => $validated]);
        
        // Create the fee type
        $feeType = FeeType::create($validated);
        Log::info('FeeType created successfully', [
            'fee_type_id' => $feeType->id,
            'fee_type_code' => $feeType->code,
            'fee_type_name' => $feeType->name,
        ]);

        // Try to get discount types from database
        try {
            $discountTypeIds = [
                'senior' => DiscountType::where('code', 'SENIOR')->first()->id,
                'pwd' => DiscountType::where('code', 'PWD')->first()->id,
                'solo_parent' => DiscountType::where('code', 'SOLO_PARENT')->first()->id,
                'indigent' => DiscountType::where('code', 'INDIGENT')->first()->id,
            ];
            
            Log::debug('Discount type IDs found:', $discountTypeIds);
        } catch (\Exception $e) {
            Log::error('Error fetching discount types:', [
                'error' => $e->getMessage(),
                'available_discount_types' => DiscountType::all()->pluck('code', 'id')->toArray(),
            ]);
            throw $e;
        }
        
        // Create discount_fee_types records for each enabled discount
        $discountsData = [
            'senior' => [
                'enabled' => $validated['has_senior_discount'],
                'percentage' => $request->senior_discount_percentage,
                'discount_type_id' => $discountTypeIds['senior'],
            ],
            'pwd' => [
                'enabled' => $validated['has_pwd_discount'],
                'percentage' => $request->pwd_discount_percentage,
                'discount_type_id' => $discountTypeIds['pwd'],
            ],
            'solo_parent' => [
                'enabled' => $validated['has_solo_parent_discount'],
                'percentage' => $request->solo_parent_discount_percentage,
                'discount_type_id' => $discountTypeIds['solo_parent'],
            ],
            'indigent' => [
                'enabled' => $validated['has_indigent_discount'],
                'percentage' => $request->indigent_discount_percentage,
                'discount_type_id' => $discountTypeIds['indigent'],
            ],
        ];
        
        Log::debug('Discounts data to be created:', $discountsData);
        
        $createdDiscounts = [];
        foreach ($discountsData as $type => $data) {
            if ($data['enabled'] && !is_null($data['percentage'])) {
                try {
                    $discountFeeType = DiscountFeeType::create([
                        'fee_type_id' => $feeType->id,
                        'discount_type_id' => $data['discount_type_id'],
                        'percentage' => $data['percentage'],
                        'is_active' => true,
                        'sort_order' => 0,
                    ]);
                    
                    $createdDiscounts[$type] = [
                        'id' => $discountFeeType->id,
                        'percentage' => $discountFeeType->percentage,
                    ];
                    
                    Log::info("DiscountFeeType created for $type", [
                        'discount_fee_type_id' => $discountFeeType->id,
                        'fee_type_id' => $feeType->id,
                        'discount_type_id' => $data['discount_type_id'],
                        'percentage' => $data['percentage'],
                    ]);
                } catch (\Exception $e) {
                    Log::error("Error creating discount for $type:", [
                        'error' => $e->getMessage(),
                        'data' => $data,
                        'fee_type_id' => $feeType->id,
                    ]);
                }
            } else {
                Log::debug("Discount for $type not created", [
                    'enabled' => $data['enabled'],
                    'percentage' => $data['percentage'],
                    'reason' => !$data['enabled'] ? 'Not enabled' : 'Percentage is null',
                ]);
            }
        }
        
        // Verify the created discounts
        $actualDiscounts = DiscountFeeType::where('fee_type_id', $feeType->id)->get();
        Log::info('Discounts verification:', [
            'expected_count' => count(array_filter($discountsData, fn($d) => $d['enabled'] && !is_null($d['percentage']))),
            'actual_count' => $actualDiscounts->count(),
            'actual_discounts' => $actualDiscounts->map(function($item) {
                return [
                    'id' => $item->id,
                    'discount_type_id' => $item->discount_type_id,
                    'percentage' => $item->percentage,
                    'fee_type_id' => $item->fee_type_id,
                ];
            })->toArray(),
        ]);
        
        Log::info('Fee type creation completed successfully', [
            'fee_type_id' => $feeType->id,
            'created_discounts_count' => count($createdDiscounts),
            'created_discounts' => $createdDiscounts,
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
        $feeType->loadCount('fees');
        
        return Inertia::render('admin/Fees/FeeTypes/Show', [
            'feeType' => $feeType,
            'recentFees' => $feeType->fees()
                ->with(['resident', 'household'])
                ->latest()
                ->limit(10)
                ->get(),
        ]);
    }
    
    public function edit(FeeType $feeType)
    {
        return Inertia::render('admin/Fees/FeeTypes/Edit', [
            'feeType' => $feeType,
            'categories' => [
                'tax' => 'Taxes',
                'clearance' => 'Clearances',
                'certificate' => 'Certificates',
                'service' => 'Services',
                'rental' => 'Rentals',
                'fine' => 'Fines',
                'contribution' => 'Contributions',
                'other' => 'Other',
            ],
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
                'as_needed' => 'As Needed',
            ],
            'applicableTo' => [
                'all_residents' => 'All Residents',
                'businesses' => 'Businesses Only',
                'households' => 'Households Only',
                'specific_purok' => 'Specific Purok Only',
                'visitors' => 'Visitors',
                'other' => 'Other',
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
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:fee_types,code,' . $feeType->id,
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'category' => 'required|in:tax,clearance,certificate,service,rental,fine,contribution,other',
            'base_amount' => 'required|numeric|min:0',
            'amount_type' => 'required|in:fixed,per_unit,computed',
            'computation_formula' => 'nullable|array',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            
            // Discount boolean flags
            'has_senior_discount' => 'nullable|boolean',
            'has_pwd_discount' => 'nullable|boolean',
            'has_solo_parent_discount' => 'nullable|boolean',
            'has_indigent_discount' => 'nullable|boolean',
            
            // Separate percentage fields for each discount type
            'senior_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'pwd_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'solo_parent_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'indigent_discount_percentage' => 'nullable|numeric|min:0|max:100',
            
            // Late payments
            'has_surcharge' => 'nullable|boolean',
            'surcharge_percentage' => 'nullable|numeric|min:0',
            'surcharge_fixed' => 'nullable|numeric|min:0',
            'has_penalty' => 'nullable|boolean',
            'penalty_percentage' => 'nullable|numeric|min:0',
            'penalty_fixed' => 'nullable|numeric|min:0',
            
            // Frequency & validity
            'frequency' => 'required|in:one_time,monthly,quarterly,semi_annual,annual,as_needed',
            'validity_days' => 'nullable|integer|min:1',
            
            // Applicability
            'applicable_to' => 'required|in:all_residents,businesses,households,specific_purok,visitors,other',
            'applicable_puroks' => 'nullable|array',
            'applicable_puroks.*' => 'string',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string',
            
            // Dates
            'effective_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:effective_date',
            
            // Settings
            'is_active' => 'nullable|boolean',
            'is_mandatory' => 'nullable|boolean',
            'auto_generate' => 'nullable|boolean',
            'due_day' => 'nullable|integer|min:1|max:31',
            'sort_order' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        // Set default values for booleans
        $validated['is_active'] = $validated['is_active'] ?? $feeType->is_active;
        $validated['is_mandatory'] = $validated['is_mandatory'] ?? $feeType->is_mandatory;
        $validated['auto_generate'] = $validated['auto_generate'] ?? $feeType->auto_generate;
        $validated['has_senior_discount'] = $validated['has_senior_discount'] ?? $feeType->has_senior_discount;
        $validated['has_pwd_discount'] = $validated['has_pwd_discount'] ?? $feeType->has_pwd_discount;
        $validated['has_solo_parent_discount'] = $validated['has_solo_parent_discount'] ?? $feeType->has_solo_parent_discount;
        $validated['has_indigent_discount'] = $validated['has_indigent_discount'] ?? $feeType->has_indigent_discount;
        $validated['has_surcharge'] = $validated['has_surcharge'] ?? $feeType->has_surcharge;
        $validated['has_penalty'] = $validated['has_penalty'] ?? $feeType->has_penalty;

        // Cast arrays properly - ensure they are always arrays
        if (isset($validated['applicable_puroks']) && is_array($validated['applicable_puroks'])) {
            $validated['applicable_puroks'] = json_encode($validated['applicable_puroks']);
        } else {
            $validated['applicable_puroks'] = json_encode([]);
        }
        
        if (isset($validated['requirements']) && is_array($validated['requirements'])) {
            $validated['requirements'] = json_encode($validated['requirements']);
        } else {
            $validated['requirements'] = json_encode([]);
        }

        // Update the fee type
        $feeType->update($validated);
        
        Log::info('FeeType updated successfully', [
            'fee_type_id' => $feeType->id,
            'fee_type_code' => $feeType->code,
            'fee_type_name' => $feeType->name,
        ]);

        // Handle discount_fee_types table
        try {
            // Get discount type IDs
            $discountTypeIds = [
                'senior' => DiscountType::where('code', 'SENIOR')->first()?->id,
                'pwd' => DiscountType::where('code', 'PWD')->first()?->id,
                'solo_parent' => DiscountType::where('code', 'SOLO_PARENT')->first()?->id,
                'indigent' => DiscountType::where('code', 'INDIGENT')->first()?->id,
            ];
            
            // Delete existing discount_fee_types for this fee type
            DiscountFeeType::where('fee_type_id', $feeType->id)->delete();
            
            // Create discount_fee_types records for each enabled discount
            $discountsData = [
                'senior' => [
                    'enabled' => $validated['has_senior_discount'],
                    'percentage' => $request->senior_discount_percentage,
                    'discount_type_id' => $discountTypeIds['senior'],
                ],
                'pwd' => [
                    'enabled' => $validated['has_pwd_discount'],
                    'percentage' => $request->pwd_discount_percentage,
                    'discount_type_id' => $discountTypeIds['pwd'],
                ],
                'solo_parent' => [
                    'enabled' => $validated['has_solo_parent_discount'],
                    'percentage' => $request->solo_parent_discount_percentage,
                    'discount_type_id' => $discountTypeIds['solo_parent'],
                ],
                'indigent' => [
                    'enabled' => $validated['has_indigent_discount'],
                    'percentage' => $request->indigent_discount_percentage,
                    'discount_type_id' => $discountTypeIds['indigent'],
                ],
            ];
            
            foreach ($discountsData as $type => $data) {
                if ($data['enabled'] && !is_null($data['percentage']) && $data['discount_type_id']) {
                    DiscountFeeType::create([
                        'fee_type_id' => $feeType->id,
                        'discount_type_id' => $data['discount_type_id'],
                        'percentage' => $data['percentage'],
                        'is_active' => true,
                        'sort_order' => 0,
                    ]);
                    
                    Log::info("DiscountFeeType created for $type", [
                        'fee_type_id' => $feeType->id,
                        'discount_type_id' => $data['discount_type_id'],
                        'percentage' => $data['percentage'],
                    ]);
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Error updating discount_fee_types:', [
                'error' => $e->getMessage(),
                'fee_type_id' => $feeType->id,
            ]);
            // Continue even if discount_fee_types fails - the fee type was updated
        }

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
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
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