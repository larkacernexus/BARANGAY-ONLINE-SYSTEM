<?php
// app/Http/Controllers/Admin/Payment/PaymentCreateController.php

namespace App\Http\Controllers\Admin\Payment;

use App\Http\Controllers\Admin\BasePaymentController;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\DiscountRule;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use App\Models\Privilege;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class PaymentCreateController extends BasePaymentController
{
    /**
     * Show the form for creating a new payment.
     */
    public function create(Request $request)
    {
        Log::info('🚀 ========== PAYMENT CREATE STARTED ==========');
        Log::info('📝 Request params:', $request->all());

        $this->logPaymentActivity('CREATE', [
            'request_params' => $request->all(),
        ]);

        try {
            // Get all query parameters
            $preFilledData = $this->extractPreFilledData($request);
            Log::info('📋 Pre-filled data:', $preFilledData);

            // Get ALL active privileges from database
            $allPrivileges = $this->getAllPrivileges();
            Log::info('🔑 Privileges loaded:', ['count' => count($allPrivileges)]);

            // Fetch all required data with privileges
            Log::info('📊 Fetching residents...');
            $residents = $this->getResidents($allPrivileges);
            Log::info('✅ Residents fetched:', ['count' => count($residents)]);

            Log::info('📊 Fetching households...');
            $households = $this->getHouseholds($allPrivileges);
            Log::info('✅ Households fetched:', ['count' => count($households)]);

            Log::info('📊 Fetching businesses...');
            $businesses = $this->getBusinesses($allPrivileges);
            Log::info('✅ Businesses fetched:', ['count' => count($businesses)]);

            Log::info('📊 Fetching outstanding fees...');
            $allFees = $this->getAllOutstandingFees($allPrivileges);
            Log::info('✅ Outstanding fees fetched:', ['count' => $allFees->count()]);

            Log::info('📊 Fetching fee types...');
            $feeTypes = $this->getFeeTypes($allPrivileges);
            Log::info('✅ Fee types fetched:', ['count' => $feeTypes->count()]);

            Log::info('📊 Fetching discount rules...');
            $discountRules = $this->getDiscountRules();
            Log::info('✅ Discount rules fetched:', ['count' => $discountRules->count()]);

            Log::info('📊 Fetching pending clearance requests...');
            $clearanceRequests = $this->getPendingClearanceRequests($allPrivileges);
            Log::info('✅ Pending clearance requests fetched:', ['count' => $clearanceRequests->count()]);

            Log::info('📊 Fetching clearance types details...');
            $clearanceTypesDetails = $this->getClearanceTypesDetails($allPrivileges);
            Log::info('✅ Clearance types details fetched:', ['count' => $clearanceTypesDetails->count()]);

            // Process clearance request pre-fill
            $clearanceRequest = null;
            $selectedFeeDetails = null;
            $selectedClearanceTypeId = $preFilledData['clearance_type_id'] ?? null;

            if (!empty($preFilledData['clearance_request_id'])) {
                Log::info('🔍 Processing clearance request pre-fill:', ['id' => $preFilledData['clearance_request_id']]);
                $result = $this->processClearanceRequestPreFill($preFilledData['clearance_request_id'], $allPrivileges);
                $clearanceRequest = $result['clearanceRequest'];
                $selectedFeeDetails = $result['virtualFee'];
                $preFilledData = array_merge($preFilledData, $result['preFilledData']);
                $selectedClearanceTypeId = $result['selectedClearanceTypeId'];
                Log::info('✅ Clearance request pre-fill processed');
            } elseif (!empty($preFilledData['fee_id'])) {
                Log::info('🔍 Processing fee pre-fill:', ['id' => $preFilledData['fee_id']]);
                $selectedFeeDetails = $this->getSelectedFeeDetails($preFilledData['fee_id'], $allPrivileges);
                Log::info('✅ Fee pre-fill processed');
            }

            // Determine payment modes
            $isClearanceMode = !empty($preFilledData['clearance_request_id']);
            $isCombinedPayment = !empty($preFilledData['fee_id']) && !empty($preFilledData['clearance_request_id']);
            $isBusinessMode = $preFilledData['payer_type'] === 'business' || 
                             (isset($preFilledData['payer_type']) && $preFilledData['payer_type'] === 'App\\Models\\Business');
            $isFeePayment = !empty($preFilledData['fee_id']) && empty($preFilledData['clearance_request_id']);

            Log::info('🎯 Payment modes:', [
                'isClearanceMode' => $isClearanceMode,
                'isCombinedPayment' => $isCombinedPayment,
                'isBusinessMode' => $isBusinessMode,
                'isFeePayment' => $isFeePayment,
            ]);

            // Get payer-specific clearance requests
            Log::info('🔍 Getting payer-specific clearance requests:', [
                'payerType' => $preFilledData['payer_type'] ?? null,
                'payerId' => $preFilledData['payer_id'] ?? null,
            ]);
            
            $payerClearanceRequests = $this->getPayerClearanceRequests(
                $preFilledData['payer_type'] ?? null,
                $preFilledData['payer_id'] ?? null,
                $allPrivileges
            );

            Log::info('📦 Payer-specific clearance requests result:', [
                'count' => count($payerClearanceRequests),
                'ids' => array_column($payerClearanceRequests, 'id'),
            ]);

            // Prepare discount data
            $discountTypes = $this->formatDiscountTypes($discountRules);
            $discountCodeToIdMap = $this->getDiscountCodeToIdMap($discountRules);

            // Find selected clearance type
            $selectedClearanceType = null;
            if ($selectedClearanceTypeId) {
                $selectedClearanceType = $clearanceTypesDetails->firstWhere('id', $selectedClearanceTypeId);
            }

            // LOG THE DATA BEING SENT TO FRONTEND
            Log::info('🚀 ========== SENDING DATA TO FRONTEND ==========');
            Log::info('📦 Data summary:', [
                'residents_count' => count($residents),
                'households_count' => count($households),
                'businesses_count' => count($businesses),
                'clearance_requests_count' => $clearanceRequests->count(),
                'fees_count' => $allFees->count(),
                'payerClearanceRequests_count' => count($payerClearanceRequests),
                'payerClearanceRequests_sample' => count($payerClearanceRequests) > 0 ? $payerClearanceRequests[0] : null,
                'pre_filled_data' => $preFilledData,
            ]);

            if (count($payerClearanceRequests) > 0) {
                Log::info('📋 Sample payer clearance request:', $payerClearanceRequests[0]);
            }

            return Inertia::render('admin/Payments/Create', [
                'residents' => $residents,
                'households' => $households,
                'businesses' => $businesses,
                'clearance_requests' => $clearanceRequests,
                'fees' => $allFees,
                'feeTypes' => $feeTypes,
                'discountRules' => $discountRules,
                'discountTypes' => $discountTypes,
                'discountCodeToIdMap' => $discountCodeToIdMap,
                'privileges' => $allPrivileges,
                'pre_filled_data' => $preFilledData,
                'selected_fee_details' => $selectedFeeDetails,
                'selected_fee_type_id' => $preFilledData['fee_type_id'] ?? null,
                'clearance_request' => $clearanceRequest ? $this->formatClearanceRequest($clearanceRequest, $allPrivileges) : null,
                'clearance_fee_type' => $this->formatClearanceFeeType($clearanceRequest),
                'clearanceTypes' => $this->getClearanceTypesForSelect(),
                'clearanceTypesDetails' => $clearanceTypesDetails,
                'selectedClearanceType' => $selectedClearanceType,
                'hasClearanceTypes' => $clearanceTypesDetails->count() > 0,
                'isCombinedPayment' => $isCombinedPayment,
                'isClearanceMode' => $isClearanceMode,
                'isBusinessMode' => $isBusinessMode,
                'isFeePayment' => $isFeePayment,
                'payerClearanceRequests' => $payerClearanceRequests,
                'payer_counts' => [
                    'residents' => count($residents),
                    'households' => count($households),
                    'businesses' => count($businesses),
                    'total' => count($residents) + count($households) + count($businesses),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Payment creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return redirect()->back()->with('error', 'Failed to load payment form: ' . $e->getMessage());
        }
    }

    /**
     * Extract pre-filled data from request
     */
    private function extractPreFilledData(Request $request): array
    {
        return [
            'fee_id' => $request->query('fee_id'),
            'fee_type_id' => $request->query('fee_type_id'),
            'payer_type' => $request->query('payer_type'),
            'payer_id' => $request->query('payer_id'),
            'payer_name' => $request->query('payer_name'),
            'contact_number' => $request->query('contact_number'),
            'address' => $request->query('address'),
            'purok' => $request->query('purok'),
            'household_number' => $request->query('household_number'),
            'clearance_request_id' => $request->query('clearance_request_id'),
            'clearance_type_id' => $request->query('clearance_type_id'),
            'purpose' => $request->query('purpose'),
            'reference_number' => $request->query('reference_number'),
            'fee_amount' => $request->query('fee_amount'),
            'fee_description' => $request->query('fee_description'),
            'fee_code' => $request->query('fee_code'),
        ];
    }

    /**
     * Get all active privileges
     */
    private function getAllPrivileges(): array
    {
        return Privilege::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($privilege) {
                return [
                    'id' => $privilege->id,
                    'name' => $privilege->name,
                    'code' => $privilege->code,
                    'description' => $privilege->description,
                    'default_discount_percentage' => $privilege->default_discount_percentage,
                    'requires_id_number' => $privilege->requires_id_number,
                    'requires_verification' => $privilege->requires_verification,
                    'validity_years' => $privilege->validity_years,
                ];
            })
            ->toArray();
    }

    /**
     * Get businesses with related data
     */
    private function getBusinesses(array $allPrivileges): array
    {
        return Business::with(['purok', 'owner'])
            ->where('status', 'active')
            ->orderBy('business_name')
            ->get()
            ->map(function ($business) use ($allPrivileges) {
                $outstandingFees = Fee::where('payer_id', $business->id)
                    ->where('payer_type', 'App\\Models\\Business')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $clearanceRequests = $this->getBusinessOwnerClearanceRequests($business, $allPrivileges);

                return [
                    'id' => $business->id,
                    'business_name' => $business->business_name,
                    'owner_name' => $business->owner_display,
                    'owner_id' => $business->owner_id,
                    'contact_number' => $business->contact_number,
                    'email' => $business->email,
                    'address' => $business->address,
                    'purok' => $business->purok_name,
                    'purok_id' => $business->purok_id,
                    'business_type' => $business->business_type,
                    'business_type_label' => $business->business_type_label,
                    'status' => $business->status,
                    'permit_expiry_date' => $business->permit_expiry_date?->format('Y-m-d'),
                    'is_permit_valid' => $business->hasValidPermit(),
                    'dti_sec_number' => $business->dti_sec_number,
                    'tin_number' => $business->tin_number,
                    'mayors_permit_number' => $business->mayors_permit_number,
                    'employee_count' => $business->employee_count,
                    'capital_amount' => $business->capital_amount,
                    'monthly_gross' => $business->monthly_gross,
                    'formatted_capital' => $business->formatted_capital,
                    'formatted_monthly_gross' => $business->formatted_monthly_gross,
                    'has_outstanding_fees' => $outstandingFees->count() > 0,
                    'outstanding_fee_count' => $outstandingFees->count(),
                    'total_outstanding_balance' => $outstandingFees->count() > 0 
                        ? '₱' . number_format($outstandingFees->sum('balance'), 2)
                        : null,
                    'has_pending_clearance' => count($clearanceRequests) > 0,
                    'pending_clearance_count' => count($clearanceRequests),
                    'clearance_requests' => $clearanceRequests,
                ];
            })
            ->toArray();
    }

    /**
     * Get clearance requests for business owner
     */
    private function getBusinessOwnerClearanceRequests($business, array $allPrivileges): array
    {
        if (!$business->owner_id || !$business->owner) {
            return [];
        }

        return ClearanceRequest::with(['clearanceType', 'resident'])
            ->where('resident_id', $business->owner_id)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->whereNotExists(function($query) {
                $query->select(DB::raw(1))
                      ->from('payment_items')
                      ->whereColumn('payment_items.clearance_request_id', 'clearance_requests.id');
            })
            ->get()
            ->map(function ($cr) use ($business, $allPrivileges) {
                return [
                    'id' => $cr->id,
                    'resident_id' => $cr->resident_id,
                    'resident_name' => $business->owner->full_name,
                    'clearance_type_id' => $cr->clearance_type_id,
                    'reference_number' => $cr->reference_number,
                    'purpose' => $cr->purpose,
                    'specific_purpose' => $cr->specific_purpose,
                    'fee_amount' => floatval($cr->fee_amount),
                    'status' => $cr->status,
                    'status_display' => $cr->status_display,
                    'clearance_type' => $cr->clearanceType ? [
                        'id' => $cr->clearanceType->id,
                        'name' => $cr->clearanceType->name,
                        'code' => $cr->clearanceType->code ?? strtoupper(str_replace(' ', '_', $cr->clearanceType->name)),
                        'fee' => floatval($cr->clearanceType->fee),
                        'formatted_fee' => '₱' . number_format($cr->clearanceType->fee, 2),
                    ] : null,
                    'can_be_paid' => true,
                    'already_paid' => false,
                    'for_business_owner' => true,
                    'business_name' => $business->business_name,
                    'business_id' => $business->id,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get residents with complete data
     */
    private function getResidents(array $allPrivileges): array
    {
        return Resident::with([
                'household.purok',
                'household.householdMembers' => function ($query) {
                    $query->with('resident');
                },
                'householdMember',
                'residentPrivileges.privilege'
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($resident) use ($allPrivileges) {
                $outstandingFees = Fee::where('payer_id', $resident->id)
                    ->where('payer_type', 'App\Models\Resident')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $clearanceRequests = $this->getResidentClearanceRequests($resident, $allPrivileges);

                $householdInfo = $this->getResidentHouseholdInfo($resident, $allPrivileges);
                $isHouseholdHead = $this->isResidentHouseholdHead($resident);

                // Get active privileges
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) use ($allPrivileges) {
                        $privilege = $rp->privilege;
                        return [
                            'id' => $rp->id,
                            'privilege_id' => $privilege->id,
                            'name' => $privilege->name,
                            'code' => $privilege->code,
                            'id_number' => $rp->id_number,
                            'verified_at' => $rp->verified_at?->format('Y-m-d'),
                            'expires_at' => $rp->expires_at?->format('Y-m-d'),
                            'is_active' => true,
                            'discount_percentage' => $rp->discount_percentage ?? $privilege->default_discount_percentage,
                        ];
                    })
                    ->values()
                    ->toArray();

                $privilegeFlags = [];
                $discountEligibilityList = [];
                
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                    $privilegeFlags["has_{$code}"] = true;
                    
                    $discountEligibilityList[] = [
                        'type' => $code,
                        'label' => $priv['name'],
                        'percentage' => $priv['discount_percentage'],
                        'id_number' => $priv['id_number'],
                        'has_id' => !empty($priv['id_number']),
                        'privilege_code' => $priv['code'],
                        'expires_at' => $priv['expires_at'],
                    ];
                }

                return array_merge([
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'suffix' => $resident->suffix,
                    'contact_number' => $resident->contact_number,
                    'email' => $resident->email,
                    'address' => $resident->address,
                    'birth_date' => $resident->birth_date?->format('Y-m-d'),
                    'age' => $resident->age,
                    'gender' => $resident->gender,
                    'civil_status' => $resident->civil_status,
                    'occupation' => $resident->occupation,
                    'household_number' => $resident->household ? $resident->household->household_number : null,
                    'purok' => $resident->household && $resident->household->purok 
                        ? $resident->household->purok->name 
                        : ($resident->purok ? $resident->purok->name : null),
                    'purok_id' => $resident->household && $resident->household->purok 
                        ? $resident->household->purok->id 
                        : $resident->purok_id,
                    'household_id' => $resident->household_id,
                    'household_info' => $householdInfo,
                    'is_household_head' => $isHouseholdHead,
                    'has_outstanding_fees' => $outstandingFees->count() > 0,
                    'outstanding_fee_count' => $outstandingFees->count(),
                    'total_outstanding_balance' => $outstandingFees->count() > 0 
                        ? '₱' . number_format($outstandingFees->sum('balance'), 2)
                        : null,
                    'has_pending_clearance' => count($clearanceRequests) > 0,
                    'pending_clearance_count' => count($clearanceRequests),
                    'clearance_requests' => $clearanceRequests,
                    'has_special_classification' => count($activePrivileges) > 0,
                    'discount_eligibility_list' => $discountEligibilityList,
                    'privileges' => $activePrivileges,
                    'privileges_count' => count($activePrivileges),
                    'active_privileges_count' => count($activePrivileges),
                ], $privilegeFlags);
            })
            ->toArray();
    }

    /**
     * Get resident's discount eligibility list
     */
    private function getResidentDiscountEligibility($resident, array $allPrivileges): array
    {
        $eligibility = [];
        
        foreach ($resident->residentPrivileges as $rp) {
            if (!$rp->isActive()) {
                continue;
            }
            
            $privilege = $rp->privilege;
            
            $eligibility[] = [
                'type' => strtolower($privilege->code),
                'label' => $privilege->name,
                'percentage' => $rp->discount_percentage ?? $privilege->default_discount_percentage,
                'id_number' => $rp->id_number,
                'has_id' => !empty($rp->id_number),
                'privilege_code' => $privilege->code,
                'expires_at' => $rp->expires_at?->format('Y-m-d'),
            ];
        }
        
        return $eligibility;
    }

    /**
     * Get resident clearance requests
     */
    private function getResidentClearanceRequests($resident, array $allPrivileges): array
    {
        return ClearanceRequest::with(['clearanceType'])
            ->where('resident_id', $resident->id)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->whereNotExists(function($query) {
                $query->select(DB::raw(1))
                      ->from('payment_items')
                      ->whereColumn('payment_items.clearance_request_id', 'clearance_requests.id');
            })
            ->get()
            ->map(function ($cr) use ($allPrivileges) {
                return [
                    'id' => $cr->id,
                    'resident_id' => $cr->resident_id,
                    'clearance_type_id' => $cr->clearance_type_id,
                    'reference_number' => $cr->reference_number,
                    'purpose' => $cr->purpose,
                    'specific_purpose' => $cr->specific_purpose,
                    'fee_amount' => floatval($cr->fee_amount),
                    'status' => $cr->status,
                    'status_display' => $cr->status_display,
                    'clearance_type' => $cr->clearanceType ? [
                        'id' => $cr->clearanceType->id,
                        'name' => $cr->clearanceType->name,
                        'code' => $cr->clearanceType->code ?? strtoupper(str_replace(' ', '_', $cr->clearanceType->name)),
                        'fee' => floatval($cr->clearanceType->fee),
                        'formatted_fee' => '₱' . number_format($cr->clearanceType->fee, 2),
                    ] : null,
                    'can_be_paid' => true,
                    'already_paid' => false,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get resident household info
     */
    private function getResidentHouseholdInfo($resident, array $allPrivileges): ?array
    {
        if (!$resident->household) {
            return null;
        }

        $headMember = $resident->household->householdMembers()
            ->where('is_head', true)
            ->with('resident')
            ->first();

        $householdMember = $this->getHouseholdMember($resident);

        return [
            'id' => $resident->household->id,
            'household_number' => $resident->household->household_number,
            'contact_number' => $resident->household->contact_number,
            'email' => $resident->household->email,
            'address' => $resident->household->address,
            'full_address' => $resident->household->full_address,
            'purok' => $resident->household->purok ? $resident->household->purok->name : null,
            'purok_id' => $resident->household->purok_id,
            'member_count' => $resident->household->member_count,
            'head_of_household' => $headMember && $headMember->resident ? [
                'id' => $headMember->resident->id,
                'name' => $headMember->resident->full_name,
                'contact_number' => $headMember->resident->contact_number,
                'is_current_resident' => $headMember->resident_id === $resident->id,
            ] : null,
            'current_head_name' => $resident->household->current_head_name,
            'has_user_account' => $resident->household->has_user_account,
            'user_account' => $resident->household->user_account_details,
            'is_head' => $householdMember && $householdMember->is_head === true,
            'relationship_to_head' => $householdMember ? $householdMember->relationship_to_head : null,
        ];
    }

    /**
     * Check if resident is household head
     */
    private function isResidentHouseholdHead($resident): bool
    {
        $householdMember = $this->getHouseholdMember($resident);
        return $householdMember && $householdMember->is_head === true;
    }

    /**
     * Get households with complete data
     */
    private function getHouseholds(array $allPrivileges): array
    {
        return Household::with([
                'purok',
                'householdMembers' => function ($query) use ($allPrivileges) {
                    $query->with(['resident.residentPrivileges.privilege']);
                },
                'user'
            ])
            ->orderBy('household_number', 'asc')
            ->get()
            ->map(function ($household) use ($allPrivileges) {
                $outstandingFees = Fee::where('payer_id', $household->id)
                    ->where('payer_type', 'App\Models\Household')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $clearanceRequests = $this->getHouseholdClearanceRequests($household, $allPrivileges);
                $members = $this->getHouseholdMembers($household, $allPrivileges);
                $familyComposition = $this->getFamilyComposition($members);

                $headMember = $household->householdMembers()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();

                $headPrivileges = [];
                $headPrivilegeFlags = [];
                
                if ($headMember && $headMember->resident) {
                    $activeHeadPrivileges = $headMember->resident->residentPrivileges
                        ->filter(function ($rp) {
                            return $rp->isActive();
                        })
                        ->map(function ($rp) {
                            $privilege = $rp->privilege;
                            return [
                                'code' => $privilege->code,
                                'name' => $privilege->name,
                                'id_number' => $rp->id_number,
                            ];
                        })
                        ->values()
                        ->toArray();
                    
                    $headPrivileges = $activeHeadPrivileges;
                    
                    foreach ($activeHeadPrivileges as $priv) {
                        $code = strtolower($priv['code']);
                        $headPrivilegeFlags["head_is_{$code}"] = true;
                    }
                }

                return array_merge([
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'contact_number' => $household->contact_number,
                    'email' => $household->email,
                    'address' => $household->address,
                    'full_address' => $household->full_address,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'purok_id' => $household->purok_id,
                    'member_count' => $household->member_count,
                    'income_range' => $household->income_range,
                    'housing_type' => $household->housing_type,
                    'ownership_status' => $household->ownership_status,
                    'water_source' => $household->water_source,
                    'has_electricity' => $household->has_electricity,
                    'has_internet' => $household->has_internet,
                    'has_vehicle' => $household->has_vehicle,
                    'remarks' => $household->remarks,
                    'status' => $household->status,
                    'head' => $headMember && $headMember->resident ? [
                        'id' => $headMember->resident->id,
                        'name' => $headMember->resident->full_name,
                        'first_name' => $headMember->resident->first_name,
                        'last_name' => $headMember->resident->last_name,
                        'contact_number' => $headMember->resident->contact_number,
                        'age' => $headMember->resident->age,
                        'gender' => $headMember->resident->gender,
                        'relationship' => $headMember->relationship_to_head,
                    ] : null,
                    'head_name' => $household->current_head_name,
                    'head_id' => $headMember->resident_id ?? null,
                    'members' => $members,
                    'family_composition' => $familyComposition,
                    'has_user_account' => $household->has_user_account,
                    'user_account' => $household->user_account_details,
                    'has_outstanding_fees' => $outstandingFees->count() > 0,
                    'outstanding_fee_count' => $outstandingFees->count(),
                    'total_outstanding_balance' => $outstandingFees->count() > 0 
                        ? '₱' . number_format($outstandingFees->sum('balance'), 2)
                        : null,
                    'has_pending_clearance' => count($clearanceRequests) > 0,
                    'pending_clearance_count' => count($clearanceRequests),
                    'clearance_requests' => $clearanceRequests,
                    'head_privileges' => $headPrivileges,
                    'has_discount_eligible_head' => count($headPrivileges) > 0,
                ], $headPrivilegeFlags);
            })
            ->toArray();
    }

    /**
     * Get household clearance requests
     */
    private function getHouseholdClearanceRequests($household, array $allPrivileges): array
    {
        $residentIds = $household->householdMembers->pluck('resident_id')->filter();

        if ($residentIds->isEmpty()) {
            return [];
        }

        return ClearanceRequest::with(['clearanceType', 'resident'])
            ->whereIn('resident_id', $residentIds)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->whereNotExists(function($query) {
                $query->select(DB::raw(1))
                      ->from('payment_items')
                      ->whereColumn('payment_items.clearance_request_id', 'clearance_requests.id');
            })
            ->get()
            ->map(function ($cr) use ($allPrivileges) {
                return [
                    'id' => $cr->id,
                    'resident_id' => $cr->resident_id,
                    'resident_name' => $cr->resident->full_name ?? 'Unknown',
                    'clearance_type_id' => $cr->clearance_type_id,
                    'reference_number' => $cr->reference_number,
                    'purpose' => $cr->purpose,
                    'specific_purpose' => $cr->specific_purpose,
                    'fee_amount' => floatval($cr->fee_amount),
                    'status' => $cr->status,
                    'status_display' => $cr->status_display,
                    'clearance_type' => $cr->clearanceType ? [
                        'id' => $cr->clearanceType->id,
                        'name' => $cr->clearanceType->name,
                        'code' => $cr->clearanceType->code ?? strtoupper(str_replace(' ', '_', $cr->clearanceType->name)),
                        'fee' => floatval($cr->clearanceType->fee),
                        'formatted_fee' => '₱' . number_format($cr->clearanceType->fee, 2),
                    ] : null,
                    'can_be_paid' => true,
                    'already_paid' => false,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get household members
     */
    private function getHouseholdMembers($household, array $allPrivileges): array
    {
        return $household->householdMembers
            ->map(function ($member) use ($allPrivileges) {
                $resident = $member->resident;
                
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        return [
                            'code' => $privilege->code,
                            'name' => $privilege->name,
                            'id_number' => $rp->id_number,
                        ];
                    })
                    ->values()
                    ->toArray();

                $privilegeFlags = [];
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                }

                return array_merge([
                    'id' => $member->id,
                    'resident_id' => $member->resident_id,
                    'name' => $resident->full_name ?? 'Unknown',
                    'contact_number' => $resident->contact_number ?? null,
                    'relationship_to_head' => $member->relationship_to_head,
                    'is_head' => $member->is_head,
                    'age' => $resident->age ?? null,
                    'gender' => $resident->gender ?? null,
                    'privileges' => $activePrivileges,
                ], $privilegeFlags);
            })
            ->sortByDesc('is_head')
            ->values()
            ->toArray();
    }

    /**
     * Get family composition
     */
    private function getFamilyComposition($members): array
    {
        $statistics = [
            'total_members' => count($members),
            'adults' => collect($members)->filter(fn($m) => ($m['age'] ?? 0) >= 18)->count(),
            'minors' => collect($members)->filter(fn($m) => ($m['age'] ?? 0) < 18)->count(),
        ];
        
        foreach ($members as $member) {
            if (isset($member['privileges']) && is_array($member['privileges'])) {
                foreach ($member['privileges'] as $priv) {
                    $code = strtolower($priv['code']);
                    if (!isset($statistics["total_{$code}"])) {
                        $statistics["total_{$code}"] = 0;
                    }
                    $statistics["total_{$code}"]++;
                }
            }
        }
        
        return $statistics;
    }

    /**
     * Get all outstanding fees
     */
    private function getAllOutstandingFees(array $allPrivileges): Collection
    {
        return Fee::with([
                'feeType',
                'payer'
            ])
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
            ->orderBy('due_date', 'asc')
            ->orderBy('payer_name', 'asc')
            ->get()
            ->map(function ($fee) use ($allPrivileges) {
                $applicableDiscounts = [];
                $residentDetails = null;
                $householdDetails = null;
                $businessDetails = null;

                if ($fee->payer_type === 'App\Models\Resident' && $fee->payer) {
                    $applicableDiscounts = $this->getApplicableDiscountsForFee($fee, $allPrivileges);
                    $residentDetails = $this->getResidentDetailsForFee($fee, $allPrivileges);
                } elseif ($fee->payer_type === 'App\Models\Household' && $fee->payer) {
                    $householdDetails = $this->getHouseholdDetailsForFee($fee, $allPrivileges);
                } elseif ($fee->payer_type === 'App\Models\Business' && $fee->payer) {
                    $businessDetails = $this->getBusinessDetailsForFee($fee);
                }

                $discountFlags = [];
                foreach ($allPrivileges as $privilege) {
                    $code = strtolower($privilege['code']);
                    $discountFlags["fee_type_has_{$code}_discount"] = false;
                    $discountFlags["fee_type_{$code}_discount_percentage"] = 0;
                }

                return array_merge([
                    'id' => $fee->id,
                    'fee_type_id' => $fee->fee_type_id,
                    'fee_code' => $fee->fee_code,
                    'payer_type' => $fee->payer_type,
                    'payer_id' => $fee->payer_id,
                    'business_name' => $fee->business_name,
                    'payer_name' => $fee->payer_name,
                    'contact_number' => $fee->contact_number,
                    'address' => $fee->address,
                    'purok' => $fee->purok,
                    'zone' => $fee->zone,
                    'billing_period' => $fee->billing_period,
                    'period_start' => $fee->period_start?->format('Y-m-d'),
                    'period_end' => $fee->period_end?->format('Y-m-d'),
                    'issue_date' => $fee->issue_date->format('Y-m-d'),
                    'due_date' => $fee->due_date->format('Y-m-d'),
                    'base_amount' => floatval($fee->base_amount),
                    'surcharge_amount' => floatval($fee->surcharge_amount),
                    'penalty_amount' => floatval($fee->penalty_amount),
                    'discount_amount' => floatval($fee->discount_amount),
                    'total_amount' => floatval($fee->total_amount),
                    'status' => $fee->status,
                    'amount_paid' => floatval($fee->amount_paid),
                    'balance' => floatval($fee->balance),
                    'fee_type_name' => $fee->feeType->name ?? 'Unknown',
                    'fee_type_category' => $fee->feeType->category ?? 'other',
                    'applicableDiscounts' => $applicableDiscounts,
                    'canApplyDiscount' => count($applicableDiscounts) > 0,
                    'resident_details' => $residentDetails,
                    'household_details' => $householdDetails,
                    'business_details' => $businessDetails,
                    'fee_type' => $fee->feeType ? [
                        'id' => $fee->feeType->id,
                        'name' => $fee->feeType->name,
                        'code' => $fee->feeType->code,
                        'base_amount' => $fee->feeType->base_amount,
                        'category' => $fee->feeType->category,
                    ] : null,
                ], $discountFlags);
            });
    }

    /**
     * Get applicable discounts for fee
     */
    private function getApplicableDiscountsForFee($fee, array $allPrivileges): array
    {
        $applicableDiscounts = [];
        
        if (!$fee->payer || !$fee->feeType) {
            return $applicableDiscounts;
        }

        if ($fee->payer_type === 'App\Models\Resident' && $fee->payer) {
            $resident = $fee->payer;
            
            foreach ($resident->residentPrivileges as $rp) {
                if (!$rp->isActive()) {
                    continue;
                }
                
                $privilege = $rp->privilege;
                
                $hasDiscountField = "has_{$privilege->code}_discount";
                $percentageField = "{$privilege->code}_discount_percentage";
                
                $isDiscountApplicable = $fee->feeType->$hasDiscountField ?? false;
                $applicablePercentage = $fee->feeType->$percentageField ?? $rp->discount_percentage ?? $privilege->default_discount_percentage;

                if ($isDiscountApplicable) {
                    $applicableDiscounts[] = [
                        'type' => strtolower($privilege->code),
                        'label' => $privilege->name,
                        'percentage' => $applicablePercentage,
                        'id_number' => $rp->id_number,
                        'has_id' => !empty($rp->id_number),
                        'privilege_code' => $privilege->code,
                    ];
                }
            }
        }

        return $applicableDiscounts;
    }

    /**
     * Get resident details for fee
     */
    private function getResidentDetailsForFee($fee, array $allPrivileges): ?array
    {
        $resident = $fee->payer;
        if (!$resident) {
            return null;
        }

        $householdMember = $this->getHouseholdMember($resident);
        $isHouseholdHead = $householdMember && $householdMember->is_head === true;

        $activePrivileges = $resident->residentPrivileges
            ->filter(function ($rp) {
                return $rp->isActive();
            })
            ->map(function ($rp) {
                return [
                    'code' => $rp->privilege->code,
                    'name' => $rp->privilege->name,
                    'id_number' => $rp->id_number,
                ];
            })
            ->values()
            ->toArray();

        $privilegeFlags = [];
        foreach ($activePrivileges as $priv) {
            $code = strtolower($priv['code']);
            $privilegeFlags["is_{$code}"] = true;
        }

        return array_merge([
            'id' => $resident->id,
            'name' => $resident->full_name,
            'contact_number' => $resident->contact_number,
            'age' => $resident->age,
            'gender' => $resident->gender,
            'is_household_head' => $isHouseholdHead,
            'privileges' => $activePrivileges,
        ], $privilegeFlags);
    }

    /**
     * Get household details for fee
     */
    private function getHouseholdDetailsForFee($fee, array $allPrivileges): ?array
    {
        $household = $fee->payer;
        if (!$household) {
            return null;
        }

        $headMember = $household->householdMembers()
            ->where('is_head', true)
            ->with('resident')
            ->first();

        $headPrivileges = [];
        $headPrivilegeFlags = [];
        
        if ($headMember && $headMember->resident) {
            $activeHeadPrivileges = $headMember->resident->residentPrivileges
                ->filter(function ($rp) {
                    return $rp->isActive();
                })
                ->map(function ($rp) {
                    return [
                        'code' => $rp->privilege->code,
                        'name' => $rp->privilege->name,
                        'id_number' => $rp->id_number,
                    ];
                })
                ->values()
                ->toArray();
            
            $headPrivileges = $activeHeadPrivileges;
            
            foreach ($activeHeadPrivileges as $priv) {
                $code = strtolower($priv['code']);
                $headPrivilegeFlags["head_is_{$code}"] = true;
            }
        }

        return array_merge([
            'id' => $household->id,
            'household_number' => $household->household_number,
            'contact_number' => $household->contact_number,
            'email' => $household->email,
            'address' => $household->address,
            'full_address' => $household->full_address,
            'purok' => $household->purok->name ?? null,
            'purok_id' => $household->purok_id,
            'member_count' => $household->member_count,
            'head_of_household' => $headMember && $headMember->resident ? [
                'id' => $headMember->resident_id,
                'name' => $headMember->resident->full_name ?? 'Unknown',
                'contact_number' => $headMember->resident->contact_number ?? null,
            ] : null,
            'head_name' => $household->current_head_name,
            'head_id' => $headMember->resident_id ?? null,
            'has_user_account' => $household->has_user_account,
            'head_privileges' => $headPrivileges,
        ], $headPrivilegeFlags);
    }

    /**
     * Get business details for fee
     */
    private function getBusinessDetailsForFee($fee): ?array
    {
        $business = $fee->payer;
        if (!$business) {
            return null;
        }

        return [
            'id' => $business->id,
            'business_name' => $business->business_name,
            'owner_name' => $business->owner_name,
            'owner_id' => $business->owner_id,
            'contact_number' => $business->contact_number,
            'email' => $business->email,
            'address' => $business->address,
            'purok' => $business->purok_name,
            'purok_id' => $business->purok_id,
            'business_type' => $business->business_type,
            'business_type_label' => $business->business_type_label,
            'permit_expiry_date' => $business->permit_expiry_date?->format('Y-m-d'),
            'is_permit_valid' => $business->hasValidPermit(),
            'dti_sec_number' => $business->dti_sec_number,
            'tin_number' => $business->tin_number,
            'mayors_permit_number' => $business->mayors_permit_number,
            'employee_count' => $business->employee_count,
        ];
    }

    /**
     * Get fee types
     */
    private function getFeeTypes(array $allPrivileges): Collection
    {
        return FeeType::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($feeType) use ($allPrivileges) {
                $baseData = [
                    'id' => $feeType->id,
                    'name' => $feeType->name,
                    'code' => $feeType->code,
                    'description' => $feeType->description,
                    'base_amount' => floatval($feeType->base_amount),
                    'category' => $feeType->category,
                    'frequency' => $feeType->frequency,
                    'has_surcharge' => (bool) $feeType->has_surcharge,
                    'surcharge_rate' => floatval($feeType->surcharge_percentage ?? 0),
                    'surcharge_fixed' => floatval($feeType->surcharge_fixed ?? 0),
                    'has_penalty' => (bool) $feeType->has_penalty,
                    'penalty_rate' => floatval($feeType->penalty_percentage ?? 0),
                    'penalty_fixed' => floatval($feeType->penalty_fixed ?? 0),
                    'validity_days' => $feeType->validity_days,
                    'applicable_to' => $feeType->applicable_to ? [$feeType->applicable_to] : [],
                ];
                
                foreach ($allPrivileges as $privilege) {
                    $code = $privilege['code'];
                    $baseData["has_{$code}_discount"] = (bool) ($feeType->{"has_{$code}_discount"} ?? false);
                    $baseData["{$code}_discount_percentage"] = (float) ($feeType->{"{$code}_discount_percentage"} ?? $privilege['default_discount_percentage'] ?? 0);
                }
                
                return $baseData;
            });
    }

    /**
     * Get discount rules
     */
    private function getDiscountRules(): Collection
    {
        return DiscountRule::active()
            ->priorityOrder()
            ->get()
            ->map(function ($rule) {
                return [
                    'id' => $rule->id,
                    'code' => $rule->code,
                    'name' => $rule->name,
                    'description' => $rule->description,
                    'discount_type' => $rule->discount_type,
                    'value_type' => $rule->value_type,
                    'discount_value' => $rule->discount_value,
                    'maximum_discount_amount' => $rule->maximum_discount_amount,
                    'minimum_purchase_amount' => $rule->minimum_purchase_amount,
                    'priority' => $rule->priority,
                    'requires_verification' => $rule->requires_verification,
                    'verification_document' => $rule->verification_document,
                    'applicable_to' => $rule->applicable_to,
                    'stackable' => $rule->stackable,
                    'exclusive_with' => $rule->exclusive_with,
                    'effective_date' => $rule->effective_date?->format('Y-m-d'),
                    'expiry_date' => $rule->expiry_date?->format('Y-m-d'),
                    'formatted_value' => $rule->formatted_value,
                    'status' => $rule->status,
                    'type_label' => $rule->type_label,
                    'is_expired' => $rule->is_expired,
                ];
            });
    }

    /**
     * Get pending clearance requests
     */
    private function getPendingClearanceRequests(array $allPrivileges): Collection
    {
        return ClearanceRequest::with([
                'resident' => function ($query) use ($allPrivileges) {
                    $query->with([
                        'household.purok', 
                        'household.householdMembers.resident',
                        'householdMember',
                        'residentPrivileges.privilege'
                    ]);
                },
                'clearanceType'
            ])
            ->whereIn('status', ['pending', 'pending_payment'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) use ($allPrivileges) {
                $hasPaymentItem = DB::table('payment_items')
                    ->where('clearance_request_id', $request->id)
                    ->exists();

                $applicableDiscounts = [];
                $householdInfo = null;
                $isHouseholdHead = false;

                if ($request->resident && $request->clearanceType) {
                    $applicableDiscounts = $this->getApplicableDiscountsForClearance($request, $allPrivileges);
                    $isHouseholdHead = $this->isResidentHouseholdHead($request->resident);
                    $householdInfo = $this->getResidentHouseholdInfo($request->resident, $allPrivileges);
                }

                $residentPrivileges = [];
                $privilegeFlags = [];
                
                if ($request->resident) {
                    $activePrivileges = $request->resident->residentPrivileges
                        ->filter(function ($rp) {
                            return $rp->isActive();
                        })
                        ->map(function ($rp) {
                            return [
                                'code' => $rp->privilege->code,
                                'name' => $rp->privilege->name,
                                'id_number' => $rp->id_number,
                            ];
                        })
                        ->values()
                        ->toArray();
                    
                    $residentPrivileges = $activePrivileges;
                    
                    foreach ($activePrivileges as $priv) {
                        $code = strtolower($priv['code']);
                        $privilegeFlags["is_{$code}"] = true;
                    }
                }

                return array_merge([
                    'id' => $request->id,
                    'resident_id' => $request->resident_id,
                    'clearance_type_id' => $request->clearance_type_id,
                    'reference_number' => $request->reference_number,
                    'purpose' => $request->purpose,
                    'specific_purpose' => $request->specific_purpose,
                    'fee_amount' => floatval($request->fee_amount),
                    'status' => $request->status,
                    'status_display' => $request->status_display,
                    'clearance_type' => $request->clearanceType ? [
                        'id' => $request->clearanceType->id,
                        'name' => $request->clearanceType->name,
                        'code' => $request->clearanceType->code ?? strtoupper(str_replace(' ', '_', $request->clearanceType->name)),
                        'description' => $request->clearanceType->description,
                        'fee' => floatval($request->clearanceType->fee),
                        'formatted_fee' => '₱' . number_format($request->clearanceType->fee, 2),
                        'validity_days' => $request->clearanceType->validity_days,
                    ] : null,
                    'resident' => $request->resident ? [
                        'id' => $request->resident->id,
                        'name' => $request->resident->full_name,
                        'first_name' => $request->resident->first_name,
                        'last_name' => $request->resident->last_name,
                        'contact_number' => $request->resident->contact_number,
                        'email' => $request->resident->email,
                        'address' => $request->resident->address,
                        'birth_date' => $request->resident->birth_date?->format('Y-m-d'),
                        'age' => $request->resident->age,
                        'gender' => $request->resident->gender,
                        'civil_status' => $request->resident->civil_status,
                        'occupation' => $request->resident->occupation,
                        'household_id' => $request->resident->household_id,
                        'household_info' => $householdInfo,
                        'is_household_head' => $isHouseholdHead,
                        'privileges' => $residentPrivileges,
                    ] : null,
                    'household_info' => $householdInfo,
                    'applicableDiscounts' => $applicableDiscounts,
                    'canApplyDiscount' => count($applicableDiscounts) > 0,
                    'can_be_paid' => in_array($request->status, ['pending', 'pending_payment']) && !$hasPaymentItem,
                    'already_paid' => $hasPaymentItem,
                ], $privilegeFlags);
            });
    }

    /**
     * Get applicable discounts for clearance request
     */
    private function getApplicableDiscountsForClearance($request, array $allPrivileges): array
    {
        $applicableDiscounts = [];
        
        if (!$request->resident || !$request->clearanceType) {
            return $applicableDiscounts;
        }

        $resident = $request->resident;

        foreach ($resident->residentPrivileges as $rp) {
            if (!$rp->isActive()) {
                continue;
            }
            
            $privilege = $rp->privilege;
            
            $hasDiscountField = "has_{$privilege->code}_discount";
            $percentageField = "{$privilege->code}_discount_percentage";
            
            $isDiscountApplicable = $request->clearanceType->$hasDiscountField ?? false;
            $applicablePercentage = $request->clearanceType->$percentageField ?? $rp->discount_percentage ?? $privilege->default_discount_percentage;

            if ($isDiscountApplicable) {
                $applicableDiscounts[] = [
                    'type' => strtolower($privilege->code),
                    'label' => $privilege->name,
                    'percentage' => $applicablePercentage,
                    'id_number' => $rp->id_number,
                    'has_id' => !empty($rp->id_number),
                    'privilege_code' => $privilege->code,
                ];
            }
        }

        return $applicableDiscounts;
    }

    /**
     * Get clearance types details
     */
    private function getClearanceTypesDetails(array $allPrivileges): Collection
    {
        return ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) use ($allPrivileges) {
                $eligibilityCriteria = $type->eligibility_criteria ?? [];
                $purposeOptions = $type->purpose_options ?? [];
                $requirements = $type->requirements ?? [];

                $baseData = [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code ?? strtoupper(str_replace(' ', '_', $type->name)),
                    'description' => $type->description,
                    'fee' => floatval($type->fee),
                    'formatted_fee' => '₱' . number_format($type->fee, 2),
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                    'requires_payment' => (bool) $type->requires_payment,
                    'requires_approval' => (bool) $type->requires_approval,
                    'is_online_only' => (bool) $type->is_online_only,
                    'is_discountable' => (bool) $type->is_discountable,
                    'eligibility_criteria' => $eligibilityCriteria,
                    'purpose_options' => $purposeOptions,
                    'requirements' => $requirements,
                ];
                
                foreach ($allPrivileges as $privilege) {
                    $code = $privilege['code'];
                    $baseData["has_{$code}_discount"] = (bool) ($type->{"has_{$code}_discount"} ?? false);
                    $baseData["{$code}_discount_percentage"] = (float) ($type->{"{$code}_discount_percentage"} ?? $privilege['default_discount_percentage'] ?? 0);
                }
                
                return $baseData;
            });
    }

    /**
     * Process clearance request pre-fill
     */
    private function processClearanceRequestPreFill($clearanceRequestId, array $allPrivileges): array
    {
        $clearanceRequest = ClearanceRequest::with([
                'resident' => function ($query) use ($allPrivileges) {
                    $query->with([
                        'household.purok', 
                        'household.householdMembers.resident',
                        'householdMember',
                        'residentPrivileges.privilege'
                    ]);
                },
                'clearanceType'
            ])
            ->find($clearanceRequestId);

        if (!$clearanceRequest) {
            return [
                'clearanceRequest' => null,
                'virtualFee' => null,
                'preFilledData' => [],
                'selectedClearanceTypeId' => null,
            ];
        }

        $hasPaymentItem = DB::table('payment_items')
            ->where('clearance_request_id', $clearanceRequest->id)
            ->exists();

        $discountFlags = [];
        foreach ($allPrivileges as $privilege) {
            $code = $privilege['code'];
            $discountFlags["fee_type_has_{$code}_discount"] = $clearanceRequest->clearanceType->{"has_{$code}_discount"} ?? false;
            $discountFlags["fee_type_{$code}_discount_percentage"] = $clearanceRequest->clearanceType->{"{$code}_discount_percentage"} ?? $privilege['default_discount_percentage'] ?? 0;
        }

        $virtualFee = array_merge([
            'id' => 'clearance-' . $clearanceRequest->id,
            'fee_code' => $clearanceRequest->reference_number,
            'fee_type_id' => $clearanceRequest->clearance_type_id,
            'fee_type_name' => $clearanceRequest->clearanceType->name ?? 'Barangay Clearance',
            'fee_type_category' => 'clearance',
            'payer_name' => $clearanceRequest->resident->full_name ?? 'Unknown',
            'payer_type' => 'App\Models\Resident',
            'payer_id' => $clearanceRequest->resident_id,
            'contact_number' => $clearanceRequest->resident->contact_number ?? '',
            'address' => $clearanceRequest->resident->address ?? '',
            'purok' => $clearanceRequest->resident->household->purok->name ?? '',
            'base_amount' => floatval($clearanceRequest->fee_amount),
            'surcharge_amount' => 0,
            'penalty_amount' => 0,
            'total_discounts' => 0,
            'total_amount' => floatval($clearanceRequest->fee_amount),
            'balance' => floatval($clearanceRequest->fee_amount - ($clearanceRequest->amount_paid ?? 0)),
            'status' => $clearanceRequest->status,
            'issue_date' => $clearanceRequest->created_at->format('Y-m-d'),
            'due_date' => now()->addDays(7)->format('Y-m-d'),
            'purpose' => $clearanceRequest->purpose,
            'remarks' => $clearanceRequest->remarks,
        ], $discountFlags);

        $preFilledData = [
            'fee_id' => 'clearance-' . $clearanceRequest->id,
            'fee_amount' => $clearanceRequest->fee_amount,
            'fee_description' => $clearanceRequest->clearanceType->name . ' Clearance',
            'fee_code' => $clearanceRequest->reference_number,
            'payer_type' => 'App\Models\Resident',
            'payer_id' => $clearanceRequest->resident_id,
            'payer_name' => $clearanceRequest->resident->full_name ?? 'Unknown',
            'contact_number' => $clearanceRequest->resident->contact_number ?? '',
            'address' => $clearanceRequest->resident->address ?? '',
            'purok' => $clearanceRequest->resident->household->purok->name ?? '',
            'clearance_type_id' => $clearanceRequest->clearance_type_id,
            'purpose' => $clearanceRequest->clearanceType->name ?? 'Clearance Payment',
        ];

        if ($clearanceRequest->clearanceType) {
            $preFilledData['clearance_code'] = $clearanceRequest->clearanceType->code ?? 
                strtoupper(str_replace(' ', '_', $clearanceRequest->clearanceType->name));
        }

        return [
            'clearanceRequest' => $clearanceRequest,
            'virtualFee' => $virtualFee,
            'preFilledData' => $preFilledData,
            'selectedClearanceTypeId' => $clearanceRequest->clearance_type_id,
        ];
    }

    /**
     * Get selected fee details
     */
    private function getSelectedFeeDetails($feeId, array $allPrivileges): ?array
    {
        $fee = Fee::with([
                'feeType',
                'payer'
            ])
            ->find($feeId);

        if (!$fee) {
            return null;
        }

        $applicableDiscounts = [];
        $residentDiscountInfo = null;
        $householdInfo = null;
        $businessInfo = null;
        $isHouseholdHead = false;

        if ($fee->payer_type === 'App\Models\Resident' && $fee->payer && $fee->feeType) {
            $resident = $fee->payer;
            $applicableDiscounts = $this->getApplicableDiscountsForFee($fee, $allPrivileges);
            $isHouseholdHead = $this->isResidentHouseholdHead($resident);
            $householdInfo = $this->getResidentHouseholdInfo($resident, $allPrivileges);

            $activePrivileges = $resident->residentPrivileges
                ->filter(function ($rp) {
                    return $rp->isActive();
                })
                ->map(function ($rp) {
                    return [
                        'code' => $rp->privilege->code,
                        'name' => $rp->privilege->name,
                        'id_number' => $rp->id_number,
                    ];
                })
                ->values()
                ->toArray();

            $privilegeFlags = [];
            foreach ($activePrivileges as $priv) {
                $code = strtolower($priv['code']);
                $privilegeFlags["is_{$code}"] = true;
            }

            $residentDiscountInfo = array_merge([
                'id' => $resident->id,
                'name' => $resident->full_name,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'contact_number' => $resident->contact_number,
                'email' => $resident->email,
                'address' => $resident->address,
                'birth_date' => $resident->birth_date?->format('Y-m-d'),
                'age' => $resident->age,
                'gender' => $resident->gender,
                'has_special_classification' => count($activePrivileges) > 0,
                'discount_eligibility_list' => $this->getResidentDiscountEligibility($resident, $allPrivileges),
                'household_id' => $resident->household_id,
                'household_info' => $householdInfo,
                'is_household_head' => $isHouseholdHead,
                'privileges' => $activePrivileges,
            ], $privilegeFlags);
        } elseif ($fee->payer_type === 'App\Models\Household' && $fee->payer) {
            $household = $fee->payer;
            $householdInfo = $this->getHouseholdDetailsForFee($fee, $allPrivileges);
        } elseif ($fee->payer_type === 'App\Models\Business' && $fee->payer) {
            $business = $fee->payer;
            $businessInfo = $this->getBusinessDetailsForFee($fee);
        }

        $discountFlags = [];
        foreach ($allPrivileges as $privilege) {
            $code = $privilege['code'];
            $discountFlags["fee_type_has_{$code}_discount"] = $fee->feeType->{"has_{$code}_discount"} ?? false;
            $discountFlags["fee_type_{$code}_discount_percentage"] = $fee->feeType->{"{$code}_discount_percentage"} ?? $privilege['default_discount_percentage'] ?? 0;
        }

        return array_merge([
            'id' => $fee->id,
            'fee_code' => $fee->fee_code,
            'fee_type_id' => $fee->fee_type_id,
            'fee_type_name' => $fee->feeType->name ?? 'Unknown',
            'fee_type_category' => $fee->feeType->category ?? 'other',
            'payer_name' => $fee->payer_name,
            'payer_type' => $fee->payer_type,
            'payer_id' => $fee->payer_id,
            'contact_number' => $fee->contact_number,
            'address' => $fee->address,
            'purok' => $fee->purok,
            'base_amount' => floatval($fee->base_amount),
            'surcharge_amount' => floatval($fee->surcharge_amount),
            'penalty_amount' => floatval($fee->penalty_amount),
            'total_discounts' => floatval($fee->total_discounts),
            'total_amount' => floatval($fee->total_amount),
            'balance' => floatval($fee->balance),
            'status' => $fee->status,
            'issue_date' => $fee->issue_date->format('Y-m-d'),
            'due_date' => $fee->due_date->format('Y-m-d'),
            'purpose' => $fee->purpose,
            'remarks' => $fee->remarks,
            'applicable_discounts' => $applicableDiscounts,
            'discount_eligibility_text' => $this->getDiscountEligibilityText($applicableDiscounts),
            'resident_discount_info' => $residentDiscountInfo,
            'household_info' => $householdInfo,
            'business_info' => $businessInfo,
            'is_household_head' => $isHouseholdHead,
        ], $discountFlags);
    }

    /**
     * Get discount eligibility text
     */
    private function getDiscountEligibilityText($applicableDiscounts): string
    {
        if (empty($applicableDiscounts)) {
            return '';
        }

        $highestDiscount = collect($applicableDiscounts)->sortByDesc('percentage')->first();
        return "Eligible for {$highestDiscount['label']} discount ({$highestDiscount['percentage']}%)";
    }

    /**
     * Get clearance types for select dropdown
     */
    private function getClearanceTypesForSelect(): array
    {
        return ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->mapWithKeys(function ($type) {
                $code = $type->code ?? strtoupper(str_replace(' ', '_', $type->name));
                return [$code => $type->name];
            })
            ->toArray();
    }

    /**
     * Format discount types for dropdown
     */
    private function formatDiscountTypes($discountRules): array
    {
        return $discountRules->mapWithKeys(function ($rule) {
            $label = $rule['name'];
            if ($rule['formatted_value']) {
                $label .= ' (' . $rule['formatted_value'] . ')';
            }
            if ($rule['minimum_purchase_amount'] > 0) {
                $label .= ' - Min: ₱' . number_format($rule['minimum_purchase_amount'], 2);
            }
            if ($rule['requires_verification']) {
                $label .= ' ✓';
            }
            return [$rule['code'] => $label];
        })->toArray();
    }

    /**
     * Get discount code to ID map
     */
    private function getDiscountCodeToIdMap($discountRules): array
    {
        return $discountRules->mapWithKeys(function ($rule) {
            return [$rule['code'] => $rule['id']];
        })->toArray();
    }

    /**
     * Format clearance request for response
     */
    private function formatClearanceRequest($clearanceRequest, array $allPrivileges): ?array
    {
        if (!$clearanceRequest) {
            return null;
        }

        $hasPaymentItem = DB::table('payment_items')
            ->where('clearance_request_id', $clearanceRequest->id)
            ->exists();

        $residentPrivileges = [];
        $privilegeFlags = [];
        
        if ($clearanceRequest->resident) {
            $activePrivileges = $clearanceRequest->resident->residentPrivileges
                ->filter(function ($rp) {
                    return $rp->isActive();
                })
                ->map(function ($rp) {
                    return [
                        'code' => $rp->privilege->code,
                        'name' => $rp->privilege->name,
                        'id_number' => $rp->id_number,
                    ];
                })
                ->values()
                ->toArray();
            
            $residentPrivileges = $activePrivileges;
            
            foreach ($activePrivileges as $priv) {
                $code = strtolower($priv['code']);
                $privilegeFlags["is_{$code}"] = true;
            }
        }

        $discountFlags = [];
        if ($clearanceRequest->clearanceType) {
            foreach ($allPrivileges as $privilege) {
                $code = $privilege['code'];
                $discountFlags["has_{$code}_discount"] = $clearanceRequest->clearanceType->{"has_{$code}_discount"} ?? false;
                $discountFlags["{$code}_discount_percentage"] = $clearanceRequest->clearanceType->{"{$code}_discount_percentage"} ?? $privilege['default_discount_percentage'] ?? 0;
            }
        }

        return array_merge([
            'id' => $clearanceRequest->id,
            'reference_number' => $clearanceRequest->reference_number,
            'purpose' => $clearanceRequest->purpose,
            'specific_purpose' => $clearanceRequest->specific_purpose,
            'status' => $clearanceRequest->status,
            'status_display' => $clearanceRequest->status_display,
            'fee_amount' => floatval($clearanceRequest->fee_amount),
            'formatted_fee' => '₱' . number_format($clearanceRequest->fee_amount, 2),
            'valid_until' => $clearanceRequest->valid_until?->format('Y-m-d'),
            'requirements_met' => $clearanceRequest->requirements_met,
            'remarks' => $clearanceRequest->remarks,
            'created_at' => $clearanceRequest->created_at->format('Y-m-d H:i:s'),
            'clearance_type' => $clearanceRequest->clearanceType ? [
                'id' => $clearanceRequest->clearanceType->id,
                'name' => $clearanceRequest->clearanceType->name,
                'code' => $clearanceRequest->clearanceType->code ?? strtoupper(str_replace(' ', '_', $clearanceRequest->clearanceType->name)),
                'description' => $clearanceRequest->clearanceType->description,
                'fee' => floatval($clearanceRequest->clearanceType->fee),
                'formatted_fee' => '₱' . number_format($clearanceRequest->clearanceType->fee, 2),
                'processing_days' => $clearanceRequest->clearanceType->processing_days,
                'validity_days' => $clearanceRequest->clearanceType->validity_days,
                'requirements' => $clearanceRequest->clearanceType->requirements ?? [],
            ] : null,
            'resident' => $clearanceRequest->resident ? [
                'id' => $clearanceRequest->resident->id,
                'name' => $clearanceRequest->resident->full_name,
                'first_name' => $clearanceRequest->resident->first_name,
                'last_name' => $clearanceRequest->resident->last_name,
                'contact_number' => $clearanceRequest->resident->contact_number,
                'email' => $clearanceRequest->resident->email,
                'address' => $clearanceRequest->resident->address,
                'household_number' => $clearanceRequest->resident->household->household_number ?? null,
                'purok' => $clearanceRequest->resident->household->purok->name ?? null,
                'purok_id' => $clearanceRequest->resident->household->purok_id ?? null,
                'household_id' => $clearanceRequest->resident->household_id ?? null,
                'household_head' => $clearanceRequest->resident->household && $clearanceRequest->resident->household->head_of_household 
                    ? $clearanceRequest->resident->household->head_of_household->full_name 
                    : null,
                'household_head_id' => $clearanceRequest->resident->household && $clearanceRequest->resident->household->head_of_household
                    ? $clearanceRequest->resident->household->head_of_household->id
                    : null,
                'is_household_head' => $this->isResidentHouseholdHead($clearanceRequest->resident),
                'birth_date' => $clearanceRequest->resident->birth_date?->format('Y-m-d'),
                'age' => $clearanceRequest->resident->age ?? null,
                'gender' => $clearanceRequest->resident->gender,
                'privileges' => $residentPrivileges,
            ] : null,
            'can_be_paid' => in_array($clearanceRequest->status, ['pending', 'pending_payment']) && !$hasPaymentItem,
            'already_paid' => $hasPaymentItem,
        ], $privilegeFlags, $discountFlags);
    }

    /**
     * Format clearance fee type for response
     */
    private function formatClearanceFeeType($clearanceRequest): ?array
    {
        if (!$clearanceRequest) {
            return null;
        }

        return [
            'id' => 'clearance-' . $clearanceRequest->id,
            'clearance_request_id' => $clearanceRequest->id,
            'name' => $clearanceRequest->clearanceType->name ?? 'Barangay Clearance',
            'code' => 'CLEARANCE',
            'description' => $clearanceRequest->specific_purpose ?? $clearanceRequest->purpose ?? 'Clearance Fee',
            'base_amount' => floatval($clearanceRequest->fee_amount > 0 
                ? $clearanceRequest->fee_amount 
                : ($clearanceRequest->clearanceType->fee ?? 0)),
            'category' => 'clearance',
            'fee_amount' => floatval($clearanceRequest->fee_amount),
            'clearance_type_id' => $clearanceRequest->clearance_type_id,
            'reference_number' => $clearanceRequest->reference_number,
        ];
    }

    /**
     * Get payer-specific clearance requests - FIXED version with extensive logging
     */
    private function getPayerClearanceRequests($payerType, $payerId, array $allPrivileges): array
    {
        Log::info('🔍 ========== GET PAYER CLEARANCE REQUESTS ==========');
        Log::info('📋 Input parameters:', [
            'payerType' => $payerType,
            'payerId' => $payerId,
            'payerIdType' => gettype($payerId),
        ]);

        if (!$payerType || !$payerId) {
            Log::info('❌ No payer type or ID provided, returning empty array');
            return [];
        }

        // Convert model string to simple type if needed
        $simpleType = null;
        if ($payerType === 'App\Models\Resident' || $payerType === 'resident') {
            $simpleType = 'resident';
        } elseif ($payerType === 'App\Models\Household' || $payerType === 'household') {
            $simpleType = 'household';
        } elseif ($payerType === 'App\Models\Business' || $payerType === 'business') {
            $simpleType = 'business';
        }

        Log::info('📋 Normalized payer type:', ['simpleType' => $simpleType]);

        $clearanceRequests = collect();

        if ($simpleType === 'resident') {
            Log::info('🔍 Fetching clearance requests for resident', ['resident_id' => $payerId]);
            
            $clearanceRequests = ClearanceRequest::with(['clearanceType', 'resident'])
                ->where('resident_id', $payerId)
                ->whereIn('status', ['pending', 'pending_payment'])
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('payment_items')
                          ->whereColumn('payment_items.clearance_request_id', 'clearance_requests.id');
                })
                ->get();
                
            Log::info('✅ Found clearance requests for resident:', [
                'count' => $clearanceRequests->count(),
                'ids' => $clearanceRequests->pluck('id')->toArray(),
                'reference_numbers' => $clearanceRequests->pluck('reference_number')->toArray(),
            ]);
        } elseif ($simpleType === 'household') {
            Log::info('🔍 Fetching clearance requests for household', ['household_id' => $payerId]);
            
            $household = Household::with('householdMembers.resident')->find($payerId);
            if ($household && $household->householdMembers) {
                $residentIds = $household->householdMembers
                    ->pluck('resident_id')
                    ->filter()
                    ->toArray();

                Log::info('📋 Resident IDs in household:', ['residentIds' => $residentIds]);

                if (!empty($residentIds)) {
                    $clearanceRequests = ClearanceRequest::with(['clearanceType', 'resident'])
                        ->whereIn('resident_id', $residentIds)
                        ->whereIn('status', ['pending', 'pending_payment'])
                        ->whereNotExists(function($query) {
                            $query->select(DB::raw(1))
                                  ->from('payment_items')
                                  ->whereColumn('payment_items.clearance_request_id', 'clearance_requests.id');
                        })
                        ->get();
                        
                    Log::info('✅ Found clearance requests for household members:', [
                        'count' => $clearanceRequests->count(),
                        'ids' => $clearanceRequests->pluck('id')->toArray(),
                    ]);
                }
            }
        } elseif ($simpleType === 'business') {
            Log::info('🔍 Fetching clearance requests for business', ['business_id' => $payerId]);
            
            $business = Business::with('owner')->find($payerId);
            if ($business && $business->owner_id) {
                Log::info('📋 Business owner ID:', ['owner_id' => $business->owner_id]);
                
                $clearanceRequests = ClearanceRequest::with(['clearanceType', 'resident'])
                    ->where('resident_id', $business->owner_id)
                    ->whereIn('status', ['pending', 'pending_payment'])
                    ->whereNotExists(function($query) {
                        $query->select(DB::raw(1))
                              ->from('payment_items')
                              ->whereColumn('payment_items.clearance_request_id', 'clearance_requests.id');
                    })
                    ->get();
                    
                Log::info('✅ Found clearance requests for business owner:', [
                    'count' => $clearanceRequests->count(),
                    'ids' => $clearanceRequests->pluck('id')->toArray(),
                ]);
            }
        }

        // Log the raw data before formatting
        Log::info('📋 Raw clearance requests before formatting:', [
            'count' => $clearanceRequests->count(),
            'data' => $clearanceRequests->map(function($cr) {
                return [
                    'id' => $cr->id,
                    'resident_id' => $cr->resident_id,
                    'reference_number' => $cr->reference_number,
                    'fee_amount' => $cr->fee_amount,
                    'status' => $cr->status,
                    'clearance_type_name' => $cr->clearanceType?->name,
                ];
            })->toArray()
        ]);

        $formatted = $clearanceRequests->map(function ($cr) use ($allPrivileges) {
            $applicableDiscounts = $this->getApplicableDiscountsForClearance($cr, $allPrivileges);
            
            return [
                'id' => $cr->id,
                'resident_id' => $cr->resident_id,
                'clearance_type_id' => $cr->clearance_type_id,
                'reference_number' => $cr->reference_number,
                'purpose' => $cr->purpose,
                'specific_purpose' => $cr->specific_purpose,
                'fee_amount' => floatval($cr->fee_amount),
                'status' => $cr->status,
                'status_display' => $cr->status_display,
                'clearance_type' => $cr->clearanceType ? [
                    'id' => $cr->clearanceType->id,
                    'name' => $cr->clearanceType->name,
                    'code' => $cr->clearanceType->code ?? strtoupper(str_replace(' ', '_', $cr->clearanceType->name)),
                    'fee' => floatval($cr->clearanceType->fee),
                    'formatted_fee' => '₱' . number_format($cr->clearanceType->fee, 2),
                    'has_senior_discount' => $cr->clearanceType->has_senior_discount ?? false,
                    'senior_discount_percentage' => $cr->clearanceType->senior_discount_percentage ?? 0,
                    'has_pwd_discount' => $cr->clearanceType->has_pwd_discount ?? false,
                    'pwd_discount_percentage' => $cr->clearanceType->pwd_discount_percentage ?? 0,
                    'has_solo_parent_discount' => $cr->clearanceType->has_solo_parent_discount ?? false,
                    'solo_parent_discount_percentage' => $cr->clearanceType->solo_parent_discount_percentage ?? 0,
                    'has_indigent_discount' => $cr->clearanceType->has_indigent_discount ?? false,
                    'indigent_discount_percentage' => $cr->clearanceType->indigent_discount_percentage ?? 0,
                ] : null,
                'resident' => $cr->resident ? [
                    'id' => $cr->resident->id,
                    'name' => $cr->resident->full_name,
                    'contact_number' => $cr->resident->contact_number,
                    'address' => $cr->resident->address,
                ] : null,
                'applicableDiscounts' => $applicableDiscounts,
                'canApplyDiscount' => count($applicableDiscounts) > 0,
                'can_be_paid' => true,
                'already_paid' => false,
            ];
        })->values()->toArray();

        Log::info('📦 Formatted clearance requests for frontend:', [
            'count' => count($formatted),
            'sample' => count($formatted) > 0 ? $formatted[0] : null,
        ]);
        
        Log::info('🔍 ========== END GET PAYER CLEARANCE REQUESTS ==========');

        return $formatted;
    }

    /**
     * Get household member record
     */
    protected function getHouseholdMember($resident)
    {
        return $resident->householdMember()
            ->where('household_id', $resident->household_id)
            ->first();
    }

    /**
     * API endpoint to get clearance requests
     */
    public function getPayerClearanceRequestsApi(Request $request)
    {
        $payerType = $request->get('payer_type');
        $payerId = $request->get('payer_id');
        
        Log::info('🔍 API getPayerClearanceRequestsApi called', [
            'payerType' => $payerType,
            'payerId' => $payerId,
        ]);

        $allPrivileges = $this->getAllPrivileges();
        $requests = $this->getPayerClearanceRequests($payerType, $payerId, $allPrivileges);
        
        return response()->json([
            'success' => true,
            'clearance_requests' => $requests
        ]);
    }
}