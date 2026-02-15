<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\DocumentCategory;
use App\Models\Household;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FeeStoreController extends Controller
{
    // Store new fee with bulk creation support
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeStoreController@store started', [
                'user_id' => Auth::id(),
                'bulk_type' => $request->bulk_type ?? 'none',
                'bulk_selection_count' => $this->getBulkSelectionCount($request)
            ]);

            // Determine if this is bulk creation
            $bulkType = $request->bulk_type ?? 'none';
            $createdFees = [];

            if ($bulkType === 'none') {
                // Single fee creation
                $fee = $this->createSingleFee($request);
                if ($fee) {
                    $createdFees[] = $fee;
                }
            } else {
                // Bulk fee creation
                $createdFees = $this->createBulkFees($request);
            }

            DB::commit();

            Log::info('Fee(s) created successfully', [
                'total_fees_created' => count($createdFees),
                'fee_ids' => collect($createdFees)->pluck('id')->toArray()
            ]);

            if (count($createdFees) === 1) {
                return redirect()->route('fees.show', $createdFees[0])
                    ->with('success', 'Fee created successfully.');
            } else {
                return redirect()->route('fees.index')
                    ->with('success', 'Successfully created ' . count($createdFees) . ' fees.');
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            throw $e;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Fee creation failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to create fee. Please try again.');
        }
    }

    private function getBulkSelectionCount(Request $request)
    {
        $bulkType = $request->bulk_type ?? 'none';
        
        switch ($bulkType) {
            case 'residents':
                if ($request->apply_to_all_residents ?? false) {
                    return 'all';
                }
                return count($request->selected_resident_ids ?? []);
            case 'households':
                if ($request->apply_to_all_households ?? false) {
                    return 'all';
                }
                return count($request->selected_household_ids ?? []);
            case 'custom':
                return count($request->custom_payers ?? []);
            default:
                return 1;
        }
    }

    // Helper method to create a single fee
    private function createSingleFee($request)
    {
        // Validate all fields including bulk fields
        $validated = $this->validateFeeRequest($request);

        // Set payer_id and payer_model based on payer type
        if ($request->payer_type === 'resident' && $request->resident_id) {
            $validated['payer_id'] = $request->resident_id;
            $validated['payer_model'] = Resident::class;
        } elseif ($request->payer_type === 'household' && $request->household_id) {
            $validated['payer_id'] = $request->household_id;
            $validated['payer_model'] = Household::class;
        } else {
            $validated['payer_id'] = null;
            $validated['payer_model'] = null;
        }

        // SIMPLIFIED: No discounts at creation time - will be applied during payment
        $validated['discount_amount'] = 0;

        // Calculate total amount (no discount subtraction)
        $validated['total_amount'] = $validated['base_amount']
            + ($validated['surcharge_amount'] ?? 0)
            + ($validated['penalty_amount'] ?? 0);

        // Set default values
        $validated = $this->setDefaultFeeValues($validated, $request->fee_type_id);

        // Convert arrays to JSON
        if (isset($validated['requirements_submitted'])) {
            $validated['requirements_submitted'] = json_encode($validated['requirements_submitted']);
        }

        // Create the fee
        $fee = Fee::create($validated);

        // Generate identifiers
        $this->generateFeeIdentifiers($fee);

        return $fee;
    }

    // Helper method to create bulk fees
    private function createBulkFees($request)
    {
        $createdFees = [];
        $bulkType = $request->bulk_type;

        if ($bulkType === 'residents') {
            // Bulk create for residents
            $residentIds = $request->selected_resident_ids ?? [];
            $applyToAll = $request->apply_to_all_residents ?? false;

            if ($applyToAll) {
                $residents = Resident::all();
            } else {
                $residents = Resident::whereIn('id', $residentIds)->get();
            }

            foreach ($residents as $resident) {
                try {
                    $fee = $this->createFeeForResident($request, $resident);
                    if ($fee) {
                        $createdFees[] = $fee;
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to create fee for resident', [
                        'resident_id' => $resident->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

        } elseif ($bulkType === 'households') {
            // Bulk create for households
            $householdIds = $request->selected_household_ids ?? [];
            $applyToAll = $request->apply_to_all_households ?? false;

            if ($applyToAll) {
                $households = Household::all();
            } else {
                $households = Household::whereIn('id', $householdIds)->get();
            }

            foreach ($households as $household) {
                try {
                    $fee = $this->createFeeForHousehold($request, $household);
                    if ($fee) {
                        $createdFees[] = $fee;
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to create fee for household', [
                        'household_id' => $household->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

        } elseif ($bulkType === 'custom') {
            // Bulk create for custom payers
            $customPayers = $request->custom_payers ?? [];

            foreach ($customPayers as $customPayer) {
                try {
                    if (empty($customPayer['name'])) {
                        Log::warning('Skipping custom payer with empty name');
                        continue;
                    }

                    $fee = $this->createFeeForCustomPayer($request, $customPayer);
                    if ($fee) {
                        $createdFees[] = $fee;
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to create fee for custom payer', [
                        'payer_name' => $customPayer['name'] ?? 'Unknown',
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        return $createdFees;
    }

    // Helper method to validate fee request
    private function validateFeeRequest($request)
    {
        $rules = [
            'fee_type_id' => 'required|exists:fee_types,id',
            'payer_type' => 'required|in:resident,business,household,visitor,other',
            'resident_id' => 'nullable|required_if:payer_type,resident|exists:residents,id',
            'household_id' => 'nullable|required_if:payer_type,household|exists:households,id',
            'business_name' => 'nullable|required_if:payer_type,business|string|max:255',
            'payer_name' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'purok' => 'nullable|string|max:50',
            'zone' => 'nullable|string|max:50',
            'billing_period' => 'nullable|string|max:100',
            'period_start' => 'nullable|date',
            'period_end' => 'nullable|date|after_or_equal:period_start',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'base_amount' => 'required|numeric|min:0',
            'surcharge_amount' => 'nullable|numeric|min:0',
            'penalty_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'purpose' => 'nullable|string',
            'property_description' => 'nullable|string',
            'business_type' => 'nullable|string',
            'area' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
            'requirements_submitted' => 'nullable|array',
            'ph_legal_compliance_notes' => 'nullable|string',
        ];

        // REMOVED: All discount-related validation rules
        // REMOVED: discount_type_ids, discount_amount validation

        // Add bulk validation rules if in bulk mode
        $bulkType = $request->bulk_type ?? 'none';
        if ($bulkType !== 'none') {
            switch ($bulkType) {
                case 'residents':
                    if (!($request->apply_to_all_residents ?? false)) {
                        $rules['selected_resident_ids'] = 'required|array|min:1';
                        $rules['selected_resident_ids.*'] = 'exists:residents,id';
                    }
                    break;
                case 'households':
                    if (!($request->apply_to_all_households ?? false)) {
                        $rules['selected_household_ids'] = 'required|array|min:1';
                        $rules['selected_household_ids.*'] = 'exists:households,id';
                    }
                    break;
                case 'custom':
                    $rules['custom_payers'] = 'required|array|min:1';
                    $rules['custom_payers.*.name'] = 'required|string|max:255';
                    break;
            }
        }

        return $request->validate($rules);
    }

    // REMOVED: processDiscounts method - discounts are now handled at payment time

    private function createFeeForResident($request, $resident)
    {
        $feeData = $this->prepareFeeData($request);
        
        // Set resident-specific data
        $feeData['payer_type'] = 'resident';
        $feeData['resident_id'] = $resident->id;
        $feeData['payer_id'] = $resident->id;
        $feeData['payer_model'] = Resident::class;
        $feeData['payer_name'] = $resident->full_name ?? trim($resident->first_name . ' ' . $resident->last_name);
        $feeData['contact_number'] = $resident->contact_number;
        $feeData['purok'] = $resident->purok ? $resident->purok->name : null;
        
        // SIMPLIFIED: Store resident verification info for reference, not for automatic discounts
        if ($request->include_resident_details ?? false) {
            $feeData['ph_senior_id_verified'] = $resident->is_senior;
            $feeData['ph_pwd_id_verified'] = $resident->is_pwd;
            $feeData['ph_solo_parent_id_verified'] = $resident->is_solo_parent;
            $feeData['ph_indigent_id_verified'] = $resident->is_indigent;
        }

        // Set default values
        $feeData = $this->setDefaultFeeValues($feeData, $request->fee_type_id);

        // Create the fee
        $fee = Fee::create($feeData);
        $this->generateFeeIdentifiers($fee);
        
        return $fee;
    }

    // Create fee for a specific household
    private function createFeeForHousehold($request, $household)
    {
        $feeData = $this->prepareFeeData($request);
        
        // Get household name
        $headMember = $household->householdMembers()->where('is_head', true)->first();
        $householdName = $headMember && $headMember->resident 
            ? $headMember->resident->full_name ?? trim($headMember->resident->first_name . ' ' . $headMember->resident->last_name)
            : 'Household #' . $household->household_number;

        // Set household-specific data
        $feeData['payer_type'] = 'household';
        $feeData['household_id'] = $household->id;
        $feeData['payer_id'] = $household->id;
        $feeData['payer_model'] = Household::class;
        $feeData['payer_name'] = $householdName;
        $feeData['contact_number'] = $household->contact_number;
        $feeData['purok'] = $household->purok ? $household->purok->name : null;

        // Set default values
        $feeData = $this->setDefaultFeeValues($feeData, $request->fee_type_id);

        // Create the fee
        $fee = Fee::create($feeData);
        $this->generateFeeIdentifiers($fee);
        
        return $fee;
    }

    // Create fee for a custom payer
    private function createFeeForCustomPayer($request, $customPayer)
    {
        $feeData = $this->prepareFeeData($request);
        
        // Set custom payer data
        $feeData['payer_type'] = 'visitor';
        $feeData['payer_name'] = $customPayer['name'];
        $feeData['contact_number'] = $customPayer['contact_number'] ?? null;
        $feeData['address'] = $customPayer['address'] ?? null;
        $feeData['purok'] = $customPayer['purok'] ?? null;
        $feeData['payer_id'] = null;
        $feeData['payer_model'] = null;

        // Set default values
        $feeData = $this->setDefaultFeeValues($feeData, $request->fee_type_id);

        // Create the fee
        $fee = Fee::create($feeData);
        $this->generateFeeIdentifiers($fee);
        
        return $fee;
    }

    // Prepare base fee data from request
    private function prepareFeeData($request)
    {
        // Extract only the fee data, excluding bulk fields
        $feeData = [
            'fee_type_id' => $request->fee_type_id,
            'base_amount' => $request->base_amount,
            'surcharge_amount' => $request->surcharge_amount ?? 0,
            'penalty_amount' => $request->penalty_amount ?? 0,
            'discount_amount' => 0, // Always 0 for new fees - discounts applied at payment
            'total_amount' => $request->base_amount + ($request->surcharge_amount ?? 0) + ($request->penalty_amount ?? 0),
            'issue_date' => $request->issue_date,
            'due_date' => $request->due_date,
            'purpose' => $request->purpose,
            'remarks' => $request->remarks,
            'billing_period' => $request->billing_period,
            'period_start' => $request->period_start,
            'period_end' => $request->period_end,
            'property_description' => $request->property_description,
            'business_type' => $request->business_type,
            'area' => $request->area,
            'zone' => $request->zone,
            'requirements_submitted' => json_encode($request->requirements_submitted ?? []),
            'ph_legal_compliance_notes' => $request->ph_legal_compliance_notes,
            // REMOVED: discount_type_ids and discount_type fields
        ];

        // Add Philippine law fields (stored for verification reference)
        $feeData['ph_senior_id_verified'] = false;
        $feeData['ph_pwd_id_verified'] = false;
        $feeData['ph_solo_parent_id_verified'] = false;
        $feeData['ph_indigent_id_verified'] = false;

        return $feeData;
    }

    // REMOVED: calculateTotalAmount method - no need to subtract discounts

    // Helper method to set default fee values
    private function setDefaultFeeValues($validated, $feeTypeId)
    {
        $feeType = FeeType::find($feeTypeId);

        $validated['fee_code'] = $feeType->code;
        $validated['status'] = 'issued';
        $validated['amount_paid'] = 0;
        $validated['balance'] = $validated['total_amount'];
        $validated['issued_by'] = auth()->id();
        $validated['created_by'] = auth()->id();

        // Set validity dates if applicable
        if ($feeType->validity_days) {
            $validated['valid_from'] = $validated['issue_date'];
            $validated['valid_until'] = Carbon::parse($validated['issue_date'])
                ->addDays($feeType->validity_days)
                ->toDateString();
        }

        return $validated;
    }

    // Helper method to generate fee identifiers
    private function generateFeeIdentifiers($fee)
    {
        // Generate fee code if not set
        if (!$fee->fee_code) {
            $feeType = $fee->feeType;
            $year = date('Y');
            $sequence = Fee::whereYear('created_at', $year)
                ->where('fee_type_id', $fee->fee_type_id)
                ->count();
            
            $fee->fee_code = $feeType->code . '-' . $year . '-' . str_pad($sequence + 1, 4, '0', STR_PAD_LEFT);
        }

        // Generate certificate number if applicable
        $feeType = $fee->feeType;
        if ($feeType && $feeType->document_category_id) {
            $category = DocumentCategory::find($feeType->document_category_id);
            if ($category && in_array($category->slug, ['clearance', 'certificate'])) {
                $year = date('Y');
                $sequence = Fee::whereYear('created_at', $year)
                    ->where('fee_type_id', $fee->fee_type_id)
                    ->whereNotNull('certificate_number')
                    ->count();
                
                $fee->certificate_number = $feeType->code . '-CERT-' . $year . '-' . str_pad($sequence + 1, 5, '0', STR_PAD_LEFT);
            }
        }

        $fee->save();
    }
}