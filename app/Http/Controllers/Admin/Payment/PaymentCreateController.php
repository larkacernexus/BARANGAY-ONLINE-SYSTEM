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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentCreateController extends BasePaymentController
{
    /**
     * Show the form for creating a new payment.
     */
    public function create(Request $request)
    {
        $this->logPaymentActivity('CREATE', [
            'request_params' => $request->all(),
        ]);

        // Get all query parameters
        $preFilledData = $this->extractPreFilledData($request);

        // Fetch all required data
        $businesses = $this->getBusinesses();
        $residents = $this->getResidents();
        $households = $this->getHouseholds();
        $allFees = $this->getAllOutstandingFees(); // Renamed method call
        $feeTypes = $this->getFeeTypes();
        $discountRules = $this->getDiscountRules();
        $clearanceRequests = $this->getPendingClearanceRequests();
        $clearanceTypesDetails = $this->getClearanceTypesDetails();

        // Process clearance request pre-fill
        $clearanceRequest = null;
        $selectedFeeDetails = null;
        $selectedClearanceTypeId = $preFilledData['clearance_type_id'] ?? null;

        if (!empty($preFilledData['clearance_request_id'])) {
            $result = $this->processClearanceRequestPreFill($preFilledData['clearance_request_id']);
            $clearanceRequest = $result['clearanceRequest'];
            $selectedFeeDetails = $result['virtualFee'];
            $preFilledData = array_merge($preFilledData, $result['preFilledData']);
            $selectedClearanceTypeId = $result['selectedClearanceTypeId'];
        } elseif (!empty($preFilledData['fee_id'])) {
            $selectedFeeDetails = $this->getSelectedFeeDetails($preFilledData['fee_id']);
        }

        // Determine payment modes
        $isClearanceMode = !empty($preFilledData['clearance_request_id']);
        $isCombinedPayment = !empty($preFilledData['fee_id']) && !empty($preFilledData['clearance_request_id']);
        $isBusinessMode = $preFilledData['payer_type'] === 'business' || 
                         (isset($preFilledData['payer_type']) && $preFilledData['payer_type'] === 'App\\Models\\Business');
        $isFeePayment = !empty($preFilledData['fee_id']) && empty($preFilledData['clearance_request_id']);

        // Get payer-specific clearance requests
        $payerClearanceRequests = $this->getPayerClearanceRequests(
            $preFilledData['payer_type'] ?? null,
            $preFilledData['payer_id'] ?? null
        );

        // Prepare discount data
        $discountTypes = $this->formatDiscountTypes($discountRules);
        $discountCodeToIdMap = $this->getDiscountCodeToIdMap($discountRules);

        // Find selected clearance type
        $selectedClearanceType = null;
        if ($selectedClearanceTypeId) {
            $selectedClearanceType = $clearanceTypesDetails->firstWhere('id', $selectedClearanceTypeId);
        }

        $this->logPaymentActivity('CREATE_RENDER', [
            'data_summary' => [
                'residents_count' => count($residents),
                'households_count' => count($households),
                'businesses_count' => count($businesses),
                'clearance_requests_count' => $clearanceRequests->count(),
                'all_fees_count' => $allFees->count(),
                'is_clearance_mode' => $isClearanceMode,
                'is_combined_payment' => $isCombinedPayment,
                'is_business_mode' => $isBusinessMode,
                'is_fee_payment' => $isFeePayment,
            ],
        ]);

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
            'pre_filled_data' => $preFilledData,
            'selected_fee_details' => $selectedFeeDetails,
            'selected_fee_type_id' => $preFilledData['fee_type_id'] ?? null,
            'clearance_request' => $clearanceRequest ? $this->formatClearanceRequest($clearanceRequest) : null,
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
     * Get businesses with related data
     */
    private function getBusinesses()
    {
        return Business::with(['purok', 'owner'])
            ->where('status', 'active')
            ->orderBy('business_name')
            ->get()
            ->map(function ($business) {
                $outstandingFees = Fee::where('payer_id', $business->id)
                    ->where('payer_type', 'App\\Models\\Business')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $clearanceRequests = $this->getBusinessOwnerClearanceRequests($business);

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
            });
    }

    /**
     * Get clearance requests for business owner
     */
    private function getBusinessOwnerClearanceRequests($business)
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
            ->map(function ($cr) use ($business) {
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
    private function getResidents()
    {
        return Resident::with([
                'household.purok',
                'household.householdMembers' => function ($query) {
                    $query->with('resident');
                },
                'householdMember'
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($resident) {
                $outstandingFees = Fee::where('payer_id', $resident->id)
                    ->where('payer_type', 'App\Models\Resident')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $clearanceRequests = $this->getResidentClearanceRequests($resident);

                $householdInfo = $this->getResidentHouseholdInfo($resident);
                $isHouseholdHead = $this->isResidentHouseholdHead($resident);

                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'suffix' => $resident->suffix,
                    'contact_number' => $resident->contact_number,
                    'email' => $resident->email,
                    'address' => $resident->address,
                    'birthdate' => $resident->birthdate?->format('Y-m-d'),
                    'age' => $resident->age,
                    'gender' => $resident->gender,
                    'civil_status' => $resident->civil_status,
                    'occupation' => $resident->occupation,
                    'household_number' => $resident->household ? $resident->household->household_number : null,
                    'purok' => $resident->household && $resident->household->purok 
                        ? $resident->household->purok->name 
                        : null,
                    'purok_id' => $resident->household && $resident->household->purok 
                        ? $resident->household->purok->id 
                        : null,
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
                    'is_senior' => $resident->is_senior,
                    'is_pwd' => $resident->is_pwd,
                    'is_solo_parent' => $resident->is_solo_parent,
                    'is_indigent' => $resident->is_indigent,
                    'has_special_classification' => $resident->has_special_classification,
                    'discount_eligibility_list' => $resident->discount_eligibility_list,
                ];
            });
    }

    /**
     * Get resident clearance requests
     */
    private function getResidentClearanceRequests($resident)
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
            ->map(function ($cr) {
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
    private function getResidentHouseholdInfo($resident)
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
    private function getHouseholds()
    {
        return Household::with([
                'purok',
                'householdMembers' => function ($query) {
                    $query->with('resident');
                },
                'user'
            ])
            ->orderBy('household_number', 'asc')
            ->get()
            ->map(function ($household) {
                $outstandingFees = Fee::where('payer_id', $household->id)
                    ->where('payer_type', 'App\Models\Household')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $clearanceRequests = $this->getHouseholdClearanceRequests($household);
                $members = $this->getHouseholdMembers($household);
                $familyComposition = $this->getFamilyComposition($members);

                $headMember = $household->householdMembers()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();

                return [
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
                        'is_senior' => $headMember->resident->is_senior,
                        'is_pwd' => $headMember->resident->is_pwd,
                        'is_solo_parent' => $headMember->resident->is_solo_parent,
                        'is_indigent' => $headMember->resident->is_indigent,
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
                ];
            });
    }

    /**
     * Get household clearance requests
     */
    private function getHouseholdClearanceRequests($household)
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
            ->map(function ($cr) {
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
    private function getHouseholdMembers($household)
    {
        return $household->householdMembers
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'resident_id' => $member->resident_id,
                    'name' => $member->resident->full_name ?? 'Unknown',
                    'contact_number' => $member->resident->contact_number ?? null,
                    'relationship_to_head' => $member->relationship_to_head,
                    'is_head' => $member->is_head,
                    'is_senior' => $member->resident->is_senior ?? false,
                    'is_pwd' => $member->resident->is_pwd ?? false,
                    'is_solo_parent' => $member->resident->is_solo_parent ?? false,
                    'is_indigent' => $member->resident->is_indigent ?? false,
                    'age' => $member->resident->age ?? null,
                    'gender' => $member->resident->gender ?? null,
                ];
            })
            ->sortByDesc('is_head')
            ->values()
            ->toArray();
    }

    /**
     * Get family composition
     */
    private function getFamilyComposition($members)
    {
        return [
            'total_members' => count($members),
            'adults' => collect($members)->filter(fn($m) => ($m['age'] ?? 0) >= 18)->count(),
            'minors' => collect($members)->filter(fn($m) => ($m['age'] ?? 0) < 18)->count(),
            'seniors' => collect($members)->filter(fn($m) => $m['is_senior'])->count(),
            'pwd' => collect($members)->filter(fn($m) => $m['is_pwd'])->count(),
            'solo_parents' => collect($members)->filter(fn($m) => $m['is_solo_parent'])->count(),
        ];
    }

    /**
     * Get all outstanding fees (renamed to avoid conflict with API method)
     */
    private function getAllOutstandingFees()
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
            ->map(function ($fee) {
                $applicableDiscounts = [];
                $residentDetails = null;
                $householdDetails = null;
                $businessDetails = null;

                // Process based on payer type
                if ($fee->payer_type === 'App\Models\Resident' && $fee->payer) {
                    $applicableDiscounts = $this->getApplicableDiscountsForFee($fee);
                    $residentDetails = $this->getResidentDetailsForFee($fee);
                } elseif ($fee->payer_type === 'App\Models\Household' && $fee->payer) {
                    $householdDetails = $this->getHouseholdDetailsForFee($fee);
                } elseif ($fee->payer_type === 'App\Models\Business' && $fee->payer) {
                    $businessDetails = $this->getBusinessDetailsForFee($fee);
                }

                return [
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
                    'fee_type_has_senior_discount' => $fee->feeType->has_senior_discount ?? false,
                    'fee_type_senior_discount_percentage' => $fee->feeType->senior_discount_percentage ?? 0,
                    'fee_type_has_pwd_discount' => $fee->feeType->has_pwd_discount ?? false,
                    'fee_type_pwd_discount_percentage' => $fee->feeType->pwd_discount_percentage ?? 0,
                    'fee_type_has_solo_parent_discount' => $fee->feeType->has_solo_parent_discount ?? false,
                    'fee_type_solo_parent_discount_percentage' => $fee->feeType->solo_parent_discount_percentage ?? 0,
                    'fee_type_has_indigent_discount' => $fee->feeType->has_indigent_discount ?? false,
                    'fee_type_indigent_discount_percentage' => $fee->feeType->indigent_discount_percentage ?? 0,
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
                ];
            });
    }

    /**
     * Get applicable discounts for fee
     */
    private function getApplicableDiscountsForFee($fee)
    {
        $applicableDiscounts = [];
        
        if (!$fee->payer || !$fee->feeType) {
            return $applicableDiscounts;
        }

        $residentDiscounts = $fee->payer->discount_eligibility_list;

        foreach ($residentDiscounts as $discount) {
            $isDiscountApplicable = false;
            $applicablePercentage = $discount['percentage'];

            switch ($discount['type']) {
                case 'senior':
                    if ($fee->feeType->has_senior_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $fee->feeType->senior_discount_percentage ?? $discount['percentage'];
                    }
                    break;
                case 'pwd':
                    if ($fee->feeType->has_pwd_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $fee->feeType->pwd_discount_percentage ?? $discount['percentage'];
                    }
                    break;
                case 'solo_parent':
                    if ($fee->feeType->has_solo_parent_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $fee->feeType->solo_parent_discount_percentage ?? $discount['percentage'];
                    }
                    break;
                case 'indigent':
                    if ($fee->feeType->has_indigent_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $fee->feeType->indigent_discount_percentage ?? $discount['percentage'];
                    }
                    break;
            }

            if ($isDiscountApplicable) {
                $applicableDiscounts[] = [
                    'type' => $discount['type'],
                    'label' => $discount['label'],
                    'percentage' => $applicablePercentage,
                    'id_number' => $discount['id_number'] ?? null,
                    'has_id' => $discount['has_id'] ?? false,
                ];
            }
        }

        return $applicableDiscounts;
    }

    /**
     * Get resident details for fee
     */
    private function getResidentDetailsForFee($fee)
    {
        $resident = $fee->payer;
        $householdMember = $this->getHouseholdMember($resident);
        $isHouseholdHead = $householdMember && $householdMember->is_head === true;

        return [
            'id' => $resident->id,
            'name' => $resident->full_name,
            'contact_number' => $resident->contact_number,
            'is_senior' => $resident->is_senior,
            'is_pwd' => $resident->is_pwd,
            'is_solo_parent' => $resident->is_solo_parent,
            'is_indigent' => $resident->is_indigent,
            'age' => $resident->age,
            'gender' => $resident->gender,
            'is_household_head' => $isHouseholdHead,
        ];
    }

    /**
     * Get household details for fee
     */
    private function getHouseholdDetailsForFee($fee)
    {
        $household = $fee->payer;

        $headMember = $household->householdMembers()
            ->where('is_head', true)
            ->with('resident')
            ->first();

        return [
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
                'is_senior' => $headMember->resident->is_senior ?? false,
                'is_pwd' => $headMember->resident->is_pwd ?? false,
            ] : null,
            'head_name' => $household->current_head_name,
            'head_id' => $headMember->resident_id ?? null,
            'has_user_account' => $household->has_user_account,
        ];
    }

    /**
     * Get business details for fee
     */
    private function getBusinessDetailsForFee($fee)
    {
        $business = $fee->payer;

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
    private function getFeeTypes()
    {
        return FeeType::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($feeType) {
                return [
                    'id' => $feeType->id,
                    'name' => $feeType->name,
                    'code' => $feeType->code,
                    'description' => $feeType->description,
                    'base_amount' => floatval($feeType->base_amount),
                    'category' => $feeType->category,
                    'frequency' => $feeType->frequency,
                    'has_senior_discount' => (bool) $feeType->has_senior_discount,
                    'senior_discount_percentage' => floatval($feeType->senior_discount_percentage ?? 0),
                    'has_pwd_discount' => (bool) $feeType->has_pwd_discount,
                    'pwd_discount_percentage' => floatval($feeType->pwd_discount_percentage ?? 0),
                    'has_solo_parent_discount' => (bool) $feeType->has_solo_parent_discount,
                    'solo_parent_discount_percentage' => floatval($feeType->solo_parent_discount_percentage ?? 0),
                    'has_indigent_discount' => (bool) $feeType->has_indigent_discount,
                    'indigent_discount_percentage' => floatval($feeType->indigent_discount_percentage ?? 0),
                    'has_surcharge' => (bool) $feeType->has_surcharge,
                    'surcharge_rate' => floatval($feeType->surcharge_percentage ?? 0),
                    'surcharge_fixed' => floatval($feeType->surcharge_fixed ?? 0),
                    'has_penalty' => (bool) $feeType->has_penalty,
                    'penalty_rate' => floatval($feeType->penalty_percentage ?? 0),
                    'penalty_fixed' => floatval($feeType->penalty_fixed ?? 0),
                    'validity_days' => $feeType->validity_days,
                    'applicable_to' => $feeType->applicable_to ? [$feeType->applicable_to] : [],
                ];
            });
    }

    /**
     * Get discount rules
     */
    private function getDiscountRules()
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
    private function getPendingClearanceRequests()
    {
        return ClearanceRequest::with([
                'resident' => function ($query) {
                    $query->with(['household.purok', 'household.householdMembers.resident', 'householdMember']);
                },
                'clearanceType'
            ])
            ->whereIn('status', ['pending', 'pending_payment'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                $hasPaymentItem = DB::table('payment_items')
                    ->where('clearance_request_id', $request->id)
                    ->exists();

                $applicableDiscounts = [];
                $householdInfo = null;
                $isHouseholdHead = false;

                if ($request->resident && $request->clearanceType) {
                    $applicableDiscounts = $this->getApplicableDiscountsForClearance($request);
                    $isHouseholdHead = $this->isResidentHouseholdHead($request->resident);
                    $householdInfo = $this->getResidentHouseholdInfo($request->resident);
                }

                return [
                    'id' => $request->id,
                    'resident_id' => $request->resident_id,
                    'clearance_type_id' => $request->clearance_type_id,
                    'reference_number' => $request->reference_number,
                    'purpose' => $request->purpose,
                    'specific_purpose' => $request->specific_purpose,
                    'fee_amount' => $request->fee_amount,
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
                        'has_senior_discount' => $request->clearanceType->has_senior_discount ?? false,
                        'senior_discount_percentage' => $request->clearanceType->senior_discount_percentage ?? 0,
                        'has_pwd_discount' => $request->clearanceType->has_pwd_discount ?? false,
                        'pwd_discount_percentage' => $request->clearanceType->pwd_discount_percentage ?? 0,
                        'has_solo_parent_discount' => $request->clearanceType->has_solo_parent_discount ?? false,
                        'solo_parent_discount_percentage' => $request->clearanceType->solo_parent_discount_percentage ?? 0,
                        'has_indigent_discount' => $request->clearanceType->has_indigent_discount ?? false,
                        'indigent_discount_percentage' => $request->clearanceType->indigent_discount_percentage ?? 0,
                    ] : null,
                    'resident' => $request->resident ? [
                        'id' => $request->resident->id,
                        'name' => $request->resident->full_name,
                        'first_name' => $request->resident->first_name,
                        'last_name' => $request->resident->last_name,
                        'contact_number' => $request->resident->contact_number,
                        'email' => $request->resident->email,
                        'address' => $request->resident->address,
                        'birthdate' => $request->resident->birthdate?->format('Y-m-d'),
                        'age' => $request->resident->age,
                        'gender' => $request->resident->gender,
                        'civil_status' => $request->resident->civil_status,
                        'occupation' => $request->resident->occupation,
                        'is_senior' => $request->resident->is_senior,
                        'is_pwd' => $request->resident->is_pwd,
                        'is_solo_parent' => $request->resident->is_solo_parent,
                        'is_indigent' => $request->resident->is_indigent,
                        'discount_eligibility_list' => $request->resident->discount_eligibility_list,
                        'household_id' => $request->resident->household_id,
                        'household_info' => $householdInfo,
                        'is_household_head' => $isHouseholdHead,
                    ] : null,
                    'household_info' => $householdInfo,
                    'applicableDiscounts' => $applicableDiscounts,
                    'canApplyDiscount' => count($applicableDiscounts) > 0,
                    'can_be_paid' => in_array($request->status, ['pending', 'pending_payment']) && !$hasPaymentItem,
                    'already_paid' => $hasPaymentItem,
                ];
            })
            ->values();
    }

    /**
     * Get applicable discounts for clearance request
     */
    private function getApplicableDiscountsForClearance($request)
    {
        $applicableDiscounts = [];
        
        if (!$request->resident || !$request->clearanceType) {
            return $applicableDiscounts;
        }

        $residentDiscounts = $request->resident->discount_eligibility_list;

        foreach ($residentDiscounts as $discount) {
            $isDiscountApplicable = false;
            $applicablePercentage = $discount['percentage'];

            switch ($discount['type']) {
                case 'senior':
                    if ($request->clearanceType->has_senior_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $request->clearanceType->senior_discount_percentage ?? $discount['percentage'];
                    }
                    break;
                case 'pwd':
                    if ($request->clearanceType->has_pwd_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $request->clearanceType->pwd_discount_percentage ?? $discount['percentage'];
                    }
                    break;
                case 'solo_parent':
                    if ($request->clearanceType->has_solo_parent_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $request->clearanceType->solo_parent_discount_percentage ?? $discount['percentage'];
                    }
                    break;
                case 'indigent':
                    if ($request->clearanceType->has_indigent_discount) {
                        $isDiscountApplicable = true;
                        $applicablePercentage = $request->clearanceType->indigent_discount_percentage ?? $discount['percentage'];
                    }
                    break;
            }

            if ($isDiscountApplicable) {
                $applicableDiscounts[] = [
                    'type' => $discount['type'],
                    'label' => $discount['label'],
                    'percentage' => $applicablePercentage,
                    'id_number' => $discount['id_number'] ?? null,
                    'has_id' => $discount['has_id'] ?? false,
                ];
            }
        }

        return $applicableDiscounts;
    }

    /**
     * Get clearance types details
     */
    private function getClearanceTypesDetails()
    {
        return ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                $eligibilityCriteria = $type->eligibility_criteria ?? [];
                $purposeOptions = $type->purpose_options ?? [];
                $requirements = $type->requirements ?? [];

                return [
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
                    'has_senior_discount' => (bool) ($type->has_senior_discount ?? false),
                    'senior_discount_percentage' => floatval($type->senior_discount_percentage ?? 0),
                    'has_pwd_discount' => (bool) ($type->has_pwd_discount ?? false),
                    'pwd_discount_percentage' => floatval($type->pwd_discount_percentage ?? 0),
                    'has_solo_parent_discount' => (bool) ($type->has_solo_parent_discount ?? false),
                    'solo_parent_discount_percentage' => floatval($type->solo_parent_discount_percentage ?? 0),
                    'has_indigent_discount' => (bool) ($type->has_indigent_discount ?? false),
                    'indigent_discount_percentage' => floatval($type->indigent_discount_percentage ?? 0),
                ];
            });
    }

    /**
     * Process clearance request pre-fill
     */
    private function processClearanceRequestPreFill($clearanceRequestId)
    {
        $clearanceRequest = ClearanceRequest::with([
                'resident' => function ($query) {
                    $query->with(['household.purok', 'household.householdMembers.resident', 'householdMember']);
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

        // Create a virtual fee entry
        $virtualFee = [
            'id' => 'clearance-' . $clearanceRequest->id,
            'fee_code' => $clearanceRequest->reference_number,
            'fee_type_id' => $clearanceRequest->clearance_type_id,
            'fee_type_name' => $clearanceRequest->clearanceType->name ?? 'Barangay Clearance',
            'fee_type_category' => 'clearance',
            'payer_name' => $clearanceRequest->resident->full_name ?? 'Unknown',
            'payer_type' => 'App\\Models\\Resident',
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
            'fee_type_has_senior_discount' => $clearanceRequest->clearanceType->has_senior_discount ?? false,
            'fee_type_senior_discount_percentage' => $clearanceRequest->clearanceType->senior_discount_percentage ?? 0,
            'fee_type_has_pwd_discount' => $clearanceRequest->clearanceType->has_pwd_discount ?? false,
            'fee_type_pwd_discount_percentage' => $clearanceRequest->clearanceType->pwd_discount_percentage ?? 0,
            'fee_type_has_solo_parent_discount' => $clearanceRequest->clearanceType->has_solo_parent_discount ?? false,
            'fee_type_solo_parent_discount_percentage' => $clearanceRequest->clearanceType->solo_parent_discount_percentage ?? 0,
            'fee_type_has_indigent_discount' => $clearanceRequest->clearanceType->has_indigent_discount ?? false,
            'fee_type_indigent_discount_percentage' => $clearanceRequest->clearanceType->indigent_discount_percentage ?? 0,
        ];

        $preFilledData = [
            'fee_id' => 'clearance-' . $clearanceRequest->id,
            'fee_amount' => $clearanceRequest->fee_amount,
            'fee_description' => $clearanceRequest->clearanceType->name . ' Clearance',
            'fee_code' => $clearanceRequest->reference_number,
            'payer_type' => 'App\\Models\\Resident',
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
    private function getSelectedFeeDetails($feeId)
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
            $applicableDiscounts = $this->getApplicableDiscountsForFee($fee);
            $isHouseholdHead = $this->isResidentHouseholdHead($resident);
            $householdInfo = $this->getResidentHouseholdInfo($resident);

            $residentDiscountInfo = [
                'id' => $resident->id,
                'name' => $resident->full_name,
                'first_name' => $resident->first_name,
                'last_name' => $resident->last_name,
                'contact_number' => $resident->contact_number,
                'email' => $resident->email,
                'address' => $resident->address,
                'birthdate' => $resident->birthdate?->format('Y-m-d'),
                'age' => $resident->age,
                'gender' => $resident->gender,
                'is_senior' => $resident->is_senior,
                'is_pwd' => $resident->is_pwd,
                'is_solo_parent' => $resident->is_solo_parent,
                'is_indigent' => $resident->is_indigent,
                'has_special_classification' => $resident->has_special_classification,
                'discount_eligibility_list' => $resident->discount_eligibility_list,
                'household_id' => $resident->household_id,
                'household_info' => $householdInfo,
                'is_household_head' => $isHouseholdHead,
            ];
        } elseif ($fee->payer_type === 'App\Models\Household' && $fee->payer) {
            $household = $fee->payer;
            $householdInfo = $this->getHouseholdDetailsForFee($fee);
        } elseif ($fee->payer_type === 'App\Models\Business' && $fee->payer) {
            $business = $fee->payer;
            $businessInfo = $this->getBusinessDetailsForFee($fee);
        }

        return [
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
            'fee_type_has_senior_discount' => $fee->feeType->has_senior_discount ?? false,
            'fee_type_senior_discount_percentage' => $fee->feeType->senior_discount_percentage ?? 0,
            'fee_type_has_pwd_discount' => $fee->feeType->has_pwd_discount ?? false,
            'fee_type_pwd_discount_percentage' => $fee->feeType->pwd_discount_percentage ?? 0,
            'fee_type_has_solo_parent_discount' => $fee->feeType->has_solo_parent_discount ?? false,
            'fee_type_solo_parent_discount_percentage' => $fee->feeType->solo_parent_discount_percentage ?? 0,
            'fee_type_has_indigent_discount' => $fee->feeType->has_indigent_discount ?? false,
            'fee_type_indigent_discount_percentage' => $fee->feeType->indigent_discount_percentage ?? 0,
        ];
    }

    /**
     * Get discount eligibility text
     */
    private function getDiscountEligibilityText($applicableDiscounts)
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
    private function getClearanceTypesForSelect()
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
    private function formatDiscountTypes($discountRules)
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
    private function getDiscountCodeToIdMap($discountRules)
    {
        return $discountRules->mapWithKeys(function ($rule) {
            return [$rule['code'] => $rule['id']];
        })->toArray();
    }

    /**
     * Format clearance request for response
     */
    private function formatClearanceRequest($clearanceRequest)
    {
        if (!$clearanceRequest) {
            return null;
        }

        $hasPaymentItem = DB::table('payment_items')
            ->where('clearance_request_id', $clearanceRequest->id)
            ->exists();

        return [
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
                'has_senior_discount' => $clearanceRequest->clearanceType->has_senior_discount ?? false,
                'senior_discount_percentage' => $clearanceRequest->clearanceType->senior_discount_percentage ?? 0,
                'has_pwd_discount' => $clearanceRequest->clearanceType->has_pwd_discount ?? false,
                'pwd_discount_percentage' => $clearanceRequest->clearanceType->pwd_discount_percentage ?? 0,
                'has_solo_parent_discount' => $clearanceRequest->clearanceType->has_solo_parent_discount ?? false,
                'solo_parent_discount_percentage' => $clearanceRequest->clearanceType->solo_parent_discount_percentage ?? 0,
                'has_indigent_discount' => $clearanceRequest->clearanceType->has_indigent_discount ?? false,
                'indigent_discount_percentage' => $clearanceRequest->clearanceType->indigent_discount_percentage ?? 0,
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
                'birthdate' => $clearanceRequest->resident->birthdate?->format('Y-m-d'),
                'age' => $clearanceRequest->resident->age ?? null,
                'gender' => $clearanceRequest->resident->gender,
                'is_senior' => $clearanceRequest->resident->is_senior,
                'is_pwd' => $clearanceRequest->resident->is_pwd,
                'is_solo_parent' => $clearanceRequest->resident->is_solo_parent,
                'is_indigent' => $clearanceRequest->resident->is_indigent,
                'discount_eligibility_list' => $clearanceRequest->resident->discount_eligibility_list,
            ] : null,
            'can_be_paid' => in_array($clearanceRequest->status, ['pending', 'pending_payment']) && !$hasPaymentItem,
            'already_paid' => $hasPaymentItem,
        ];
    }

    /**
     * Format clearance fee type for response
     */
    private function formatClearanceFeeType($clearanceRequest)
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
     * Get payer-specific clearance requests
     */
    private function getPayerClearanceRequests($payerType, $payerId)
    {
        if (!$payerType || !$payerId) {
            return [];
        }

        if ($payerType === 'App\\Models\\Resident' || $payerType === 'resident') {
            return ClearanceRequest::with(['clearanceType', 'resident'])
                ->where('resident_id', $payerId)
                ->whereIn('status', ['pending', 'pending_payment'])
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('payment_items')
                          ->whereColumn('payment_items.clearance_request_id', 'clearance_requests.id');
                })
                ->get()
                ->map(function ($cr) {
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
                        'resident' => $cr->resident ? [
                            'id' => $cr->resident->id,
                            'name' => $cr->resident->full_name,
                            'contact_number' => $cr->resident->contact_number,
                        ] : null,
                        'can_be_paid' => true,
                        'already_paid' => false,
                    ];
                })
                ->values()
                ->toArray();
        }

        return [];
    }

    /**
     * API endpoint to get outstanding fees for a specific payer
     */
    public function getOutstandingFees(Request $request)
    {
        $request->validate([
            'payer_type' => 'required|in:resident,household',
            'payer_id' => 'required|integer',
        ]);

        $payerType = $request->input('payer_type');
        $payerId = $request->input('payer_id');

        $fees = Fee::with(['feeType'])
            ->where('payer_type', $payerType)
            ->where($payerType . '_id', $payerId)
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($fee) {
                $isOverdue = $fee->due_date < now() && $fee->status !== 'paid';
                $daysOverdue = $isOverdue ? now()->diffInDays($fee->due_date) : 0;

                return [
                    'id' => $fee->id,
                    'fee_code' => $fee->fee_code,
                    'fee_type_name' => $fee->feeType->name ?? 'Unknown',
                    'fee_type_category' => $fee->feeType->category ?? 'Unknown',
                    'description' => $fee->feeType->description ?? 'No description',
                    'base_amount' => floatval($fee->base_amount),
                    'surcharge_amount' => floatval($fee->surcharge_amount),
                    'penalty_amount' => floatval($fee->penalty_amount),
                    'discount_amount' => floatval($fee->discount_amount),
                    'total_amount' => floatval($fee->total_amount),
                    'amount_paid' => floatval($fee->amount_paid),
                    'balance' => floatval($fee->balance),
                    'status' => $fee->status,
                    'issue_date' => $fee->issue_date->format('Y-m-d'),
                    'due_date' => $fee->due_date->format('Y-m-d'),
                    'is_overdue' => $isOverdue,
                    'days_overdue' => $daysOverdue,
                    'purpose' => $fee->purpose ?? '',
                    'remarks' => $fee->remarks ?? '',
                ];
            });

        $totalBalance = Fee::where('payer_type', $payerType)
            ->where($payerType . '_id', $payerId)
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
            ->sum('balance');

        $totalCount = Fee::where('payer_type', $payerType)
            ->where($payerType . '_id', $payerId)
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
            ->count();

        return response()->json([
            'success' => true,
            'fees' => $fees,
            'summary' => [
                'total_outstanding_balance' => floatval($totalBalance),
                'total_outstanding_fees' => $totalCount,
                'has_outstanding_fees' => $totalCount > 0,
            ]
        ]);
    }
}