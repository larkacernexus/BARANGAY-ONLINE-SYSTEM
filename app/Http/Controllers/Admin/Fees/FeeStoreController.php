<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\DocumentCategory;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Notifications\FeeCreatedNotification; // Add this
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

        // SEND NOTIFICATIONS AFTER SUCCESSFUL COMMIT
        if (!empty($createdFees)) {
            $this->sendFeeNotifications($createdFees, $request);
        }

        Log::info('Fee(s) created successfully', [
            'total_fees_created' => count($createdFees),
            'fee_ids' => collect($createdFees)->pluck('id')->toArray()
        ]);

        if (count($createdFees) === 1) {
            return redirect()->route('admin.fees.show', $createdFees[0])
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
   private function findHouseholdHeadUser($householdId)
{
    if (!$householdId) {
        return null;
    }
    
    // Direct approach: The household has a user_id column
    $household = Household::with('user')->find($householdId);
    
    if ($household && $household->user_id) {
        // Verify the user exists and is active
        $user = User::find($household->user_id);
        if ($user && $user->status === 'active') {
            return $user;
        }
    }
    
    return null;
}

// Alternative approach if household doesn't have user_id:
private function findHouseholdHeadUserAlternative($householdId)
{
    if (!$householdId) {
        return null;
    }
    
    // Find the household head member
    $headMember = HouseholdMember::with('resident')
        ->where('household_id', $householdId)
        ->where('is_head', true)
        ->first();
    
    if (!$headMember || !$headMember->resident) {
        return null;
    }
    
    // Find the user account linked to this household head's resident
    // Users have resident_id pointing to the head resident
    return User::where('resident_id', $headMember->resident->id)->first();
}

/**
 * Send notifications to the household head (payer)
 */
private function sendFeeNotifications($fees, $request)
{
    try {
        Log::info('========== START NOTIFICATION DEBUG ==========');
        Log::info('Starting notification process for ' . count($fees) . ' fees');

        $usersToNotify = collect();
        
        foreach ($fees as $index => $fee) {
            Log::info('Processing fee #' . ($index + 1), [
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'payer_type' => $fee->payer_type,
                'payer_id' => $fee->payer_id,
                'payer_name' => $fee->payer_name
            ]);
            
            $householdId = null;
            $residentName = null;
            
            // === USE THE POLYMORPHIC RELATIONSHIP TO FIND THE HOUSEHOLD ===
            
            // Case 1: Fee is for a resident
            if ($fee->payer_type === 'App\Models\Resident' && $fee->payer_id) {
                Log::info('Fee is for resident', ['payer_id' => $fee->payer_id]);
                
                // Find the resident with their household
                $resident = Resident::with('household')->find($fee->payer_id);
                
                if ($resident) {
                    Log::info('Found resident', [
                        'resident_id' => $resident->id,
                        'resident_name' => $resident->full_name,
                        'household_id' => $resident->household_id
                    ]);
                    
                    $residentName = $resident->full_name;
                    $fee->resident_name = $residentName;
                    
                    if ($resident->household_id) {
                        $householdId = $resident->household_id;
                    } else {
                        Log::warning('Resident has no household assigned');
                    }
                } else {
                    Log::error('Resident not found', ['payer_id' => $fee->payer_id]);
                }
            }
            
            // Case 2: Fee is for a household directly
            elseif ($fee->payer_type === 'App\Models\Household' && $fee->payer_id) {
                Log::info('Fee is for household', ['payer_id' => $fee->payer_id]);
                $householdId = $fee->payer_id;
            }
            
            // Case 3: Unknown payer type
            else {
                Log::warning('Unknown payer type or missing payer_id', [
                    'payer_type' => $fee->payer_type,
                    'payer_id' => $fee->payer_id
                ]);
            }
            
            // Find the household head user
            if ($householdId) {
                Log::info('Looking for user with household_id = ' . $householdId);
                
                // Find user by household_id (this links to the household head's account)
                $householdHeadUser = User::where('household_id', $householdId)
                    ->where('status', 'active')
                    ->first();
                
                if ($householdHeadUser) {
                    Log::info('✓ Found household head user', [
                        'user_id' => $householdHeadUser->id,
                        'user_name' => $householdHeadUser->full_name,
                        'user_household_id' => $householdHeadUser->household_id
                    ]);
                    
                    $usersToNotify->push($householdHeadUser);
                } else {
                    Log::warning('No active user found for household', [
                        'household_id' => $householdId
                    ]);
                    
                    // Alternative: Try to find by resident_id of the head member
                    $headMember = HouseholdMember::with('resident')
                        ->where('household_id', $householdId)
                        ->where('is_head', true)
                        ->first();
                    
                    if ($headMember && $headMember->resident) {
                        $userFromResident = User::where('resident_id', $headMember->resident_id)
                            ->where('status', 'active')
                            ->first();
                        
                        if ($userFromResident) {
                            Log::info('✓ Found user from head resident', [
                                'user_id' => $userFromResident->id
                            ]);
                            $usersToNotify->push($userFromResident);
                        }
                    }
                }
            } else {
                Log::warning('No household_id found for this fee');
            }
        }
        
        $usersToNotify = $usersToNotify->unique('id');
        
        Log::info('Final count - Total household heads to notify: ' . $usersToNotify->count());

        if ($usersToNotify->isEmpty()) {
            Log::warning('❌ No household heads found to notify');
            Log::info('========== END NOTIFICATION DEBUG ==========');
            return;
        }

        // Log the users we're notifying
        foreach ($usersToNotify as $user) {
            Log::info('✓ WILL NOTIFY USER:', [
                'user_id' => $user->id,
                'user_name' => $user->full_name,
                'user_household_id' => $user->household_id
            ]);
        }

        // === ADD NOTIFICATION PREFERENCE CHECK ===
        // Send notifications only if user wants them
        if (count($fees) > 1) {
            $firstFee = $fees[0];
            $bulkCount = count($fees);
            
            foreach ($usersToNotify as $user) {
                // Get user notification preferences
                $prefs = $user->getNotificationPreferences();
                
                // Check if user wants fee notifications via email
                if ($prefs['fees'] && $prefs['email']) {
                    $user->notify(new FeeCreatedNotification(
                        $firstFee,
                        'bulk_created',
                        $bulkCount
                    ));
                    Log::info('✓ Bulk notification sent to user: ' . $user->id);
                } else {
                    Log::info('✗ User opted out of fee notifications: ' . $user->id, [
                        'wants_fees' => $prefs['fees'],
                        'wants_email' => $prefs['email']
                    ]);
                }
            }
        } else {
            foreach ($fees as $fee) {
                foreach ($usersToNotify as $user) {
                    // Get user notification preferences
                    $prefs = $user->getNotificationPreferences();
                    
                    // Check if user wants fee notifications via email
                    if ($prefs['fees'] && $prefs['email']) {
                        $user->notify(new FeeCreatedNotification(
                            $fee, 
                            'created',
                            null,
                            $fee->resident_name ?? null
                        ));
                        Log::info('✓ Single notification sent to user: ' . $user->id);
                    } else {
                        Log::info('✗ User opted out of fee notifications: ' . $user->id, [
                            'wants_fees' => $prefs['fees'],
                            'wants_email' => $prefs['email']
                        ]);
                    }
                }
            }
        }
        
        Log::info('========== END NOTIFICATION DEBUG ==========');

    } catch (\Exception $e) {
        Log::error('Failed to send fee notifications', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
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
    // Log the incoming request data
    Log::info('createSingleFee - Request data', [
        'payer_type' => $request->payer_type,
        'resident_id' => $request->resident_id,
        'household_id' => $request->household_id,
        'payer_name' => $request->payer_name
    ]);

    // Validate all fields including bulk fields
    $validated = $this->validateFeeRequest($request);
    
    Log::info('createSingleFee - After validation', [
        'validated_data' => $validated
    ]);

    // Set payer_id and payer_model based on payer type
    if ($request->payer_type === 'resident' && $request->resident_id) {
        $validated['payer_id'] = $request->resident_id;
        $validated['payer_model'] = Resident::class;
        Log::info('createSingleFee - Set resident payer', [
            'payer_id' => $request->resident_id,
            'payer_model' => Resident::class
        ]);
    } elseif ($request->payer_type === 'household' && $request->household_id) {
        $validated['payer_id'] = $request->household_id;
        $validated['payer_model'] = Household::class;
        Log::info('createSingleFee - Set household payer', [
            'payer_id' => $request->household_id,
            'payer_model' => Household::class
        ]);
    } else {
        $validated['payer_id'] = null;
        $validated['payer_model'] = null;
        Log::warning('createSingleFee - No payer ID set', [
            'payer_type' => $request->payer_type,
            'has_resident_id' => !empty($request->resident_id),
            'has_household_id' => !empty($request->household_id)
        ]);
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

    Log::info('createSingleFee - Before create', [
        'data_to_create' => $validated
    ]);

    // Create the fee
    $fee = Fee::create($validated);

    Log::info('createSingleFee - After create', [
        'fee_id' => $fee->id,
        'payer_type' => $fee->payer_type,
        'payer_id' => $fee->payer_id,
        'payer_name' => $fee->payer_name
    ]);

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

   private function createFeeForResident($request, $resident)
{
    $feeData = $this->prepareFeeData($request);
    
    // Make sure privileges are loaded
    if (!$resident->relationLoaded('residentPrivileges')) {
        $resident->load('residentPrivileges.privilege');
    }
    
    // Get ALL active privileges dynamically
    $activePrivileges = $resident->residentPrivileges
        ->filter(function ($rp) {
            return $rp->isActive();
        })
        ->map(function ($rp) {
            $privilege = $rp->privilege;
            return [
                'code' => $privilege->code,
                'id_number' => $rp->id_number,
                'discount_percentage' => $rp->discount_percentage ?? $privilege->default_discount_percentage,
                'verified_at' => $rp->verified_at,
            ];
        })
        ->values()
        ->toArray();

    // Set resident-specific data
    $feeData['payer_type'] = 'resident';
    $feeData['resident_id'] = $resident->id;
    $feeData['payer_id'] = $resident->id;
    $feeData['payer_model'] = Resident::class;
    $feeData['payer_name'] = $resident->full_name ?? trim($resident->first_name . ' ' . $resident->last_name);
    $feeData['contact_number'] = $resident->contact_number;
    $feeData['purok'] = $resident->purok ? $resident->purok->name : null;
    
    // DYNAMICALLY store resident privilege info for reference
    if ($request->include_resident_details ?? false) {
        // Store ALL privileges dynamically in a JSON field
        $feeData['resident_privileges'] = json_encode($activePrivileges);
        
        // Also create dynamic fields for each privilege (for easy querying if needed)
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $feeData["has_{$code}_privilege"] = true;
            $feeData["{$code}_id_verified"] = !empty($priv['id_number']);
            $feeData["{$code}_id_number"] = $priv['id_number'];
            $feeData["{$code}_discount"] = $priv['discount_percentage'];
        }
        
        // For backward compatibility, also set the old fields if they exist in privileges
        $privilegeMap = [
            'senior' => ['SC', 'OSP'],
            'pwd' => ['PWD'],
            'solo_parent' => ['SP'],
            'indigent' => ['IND'],
        ];
        
        foreach ($privilegeMap as $key => $codes) {
            $hasPrivilege = false;
            $idNumber = null;
            
            foreach ($activePrivileges as $priv) {
                if (in_array($priv['code'], $codes)) {
                    $hasPrivilege = true;
                    $idNumber = $priv['id_number'];
                    break;
                }
            }
            
            $feeData["ph_{$key}_id_verified"] = $hasPrivilege;
            $feeData["{$key}_id_number"] = $idNumber;
        }
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
        'payer_type' => $request->payer_type,
        // DON'T include payer_id here - it's set in createSingleFee
        'payer_name' => $request->payer_name,
        'contact_number' => $request->contact_number,
        'address' => $request->address,
        'purok' => $request->purok,
        'zone' => $request->zone,
        'billing_period' => $request->billing_period,
        'period_start' => $request->period_start,
        'period_end' => $request->period_end,
        'issue_date' => $request->issue_date,
        'due_date' => $request->due_date,
        'base_amount' => $request->base_amount,
        'surcharge_amount' => $request->surcharge_amount ?? 0,
        'penalty_amount' => $request->penalty_amount ?? 0,
        'discount_amount' => 0,
        'total_amount' => $request->base_amount + ($request->surcharge_amount ?? 0) + ($request->penalty_amount ?? 0),
        'purpose' => $request->purpose,
        'remarks' => $request->remarks,
        'property_description' => $request->property_description,
        'business_type' => $request->business_type,
        'area' => $request->area,
        'requirements_submitted' => json_encode($request->requirements_submitted ?? []),
        'ph_legal_compliance_notes' => $request->ph_legal_compliance_notes,
    ];

    // Add Philippine law fields (stored for verification reference)
    $feeData['ph_senior_id_verified'] = false;
    $feeData['ph_pwd_id_verified'] = false;
    $feeData['ph_solo_parent_id_verified'] = false;
    $feeData['ph_indigent_id_verified'] = false;

    return $feeData;
}

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