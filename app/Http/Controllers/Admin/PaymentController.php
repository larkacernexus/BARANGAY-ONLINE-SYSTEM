<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\DiscountRule;
use App\Models\PaymentItem;
use App\Models\PaymentDiscount;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments.
     */
   public function index(Request $request)
    {
        $query = Payment::with([
                'items', 
                'recorder', 
                'items.clearanceRequest.clearanceType'
            ])
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('household_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('payer_type')) {
            $query->where('payer_type', $request->input('payer_type'));
        }

        // Add clearance type filter
        if ($request->filled('clearance_type_id')) {
            $clearanceTypeId = $request->input('clearance_type_id');
            $query->whereHas('items.clearanceRequest', function ($q) use ($clearanceTypeId) {
                $q->where('clearance_type_id', $clearanceTypeId);
            });
        }

        // Add clearance request filter
        if ($request->filled('clearance_request_id')) {
            $clearanceRequestId = $request->input('clearance_request_id');
            $query->whereHas('items', function ($q) use ($clearanceRequestId) {
                $q->where('clearance_request_id', $clearanceRequestId);
            });
        }

        $payments = $query->paginate(20)->withQueryString();

        // Get clearance types from database for filter
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code ?? strtoupper(str_replace(' ', '_', $type->name)),
                    'fee' => floatval($type->fee),
                ];
            });

        // Calculate statistics - update to use amount_paid
        $stats = [
            'total' => Payment::count(),
            'today' => Payment::whereDate('payment_date', today())->count(),
            'monthly' => Payment::whereMonth('payment_date', now()->month)->count(),
            'total_amount' => Payment::sum('amount_paid'), // Changed from total_amount
            'today_amount' => Payment::whereDate('payment_date', today())->sum('amount_paid'), // Changed from total_amount
            'monthly_amount' => Payment::whereMonth('payment_date', now()->month)->sum('amount_paid'), // Changed from total_amount
            'clearance_payments' => Payment::whereHas('items', function ($q) {
                $q->whereNotNull('clearance_request_id');
            })->count(),
            'clearance_amount' => Payment::whereHas('items', function ($q) {
                $q->whereNotNull('clearance_request_id');
            })->sum('amount_paid'), // Changed from total_amount
        ];

        return Inertia::render('admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to', 'payer_type', 'clearance_type_id', 'clearance_request_id']),
            'clearanceTypes' => $clearanceTypes,
            'stats' => $stats,
            'hasClearanceTypes' => $clearanceTypes->count() > 0,
        ]);
    }
   /**
 * Show the form for creating a new payment.
 */
// app/Http/Controllers/Admin/PaymentController.php

/**
 * Show the form for creating a new payment.
 */
  public function create(Request $request)
    {
        Log::info('PAYMENT_CREATE: Starting payment creation', [
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name ?? 'Unknown',
            'request_params' => $request->all(),
            'query_string' => $request->getQueryString(),
            'full_url' => $request->fullUrl(),
        ]);

        // Helper function to safely get household member (handles both collection and single model)
        $getHouseholdMember = function($resident) {
            if (!$resident) return null;
            
            if ($resident->householdMember instanceof \Illuminate\Database\Eloquent\Collection) {
                return $resident->householdMember->first();
            }
            
            return $resident->householdMember;
        };

        // Get ALL query parameters directly from request
        $preFilledData = [
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
        ];

        // Also check if fee_id is in the request input (for POST/Inertia)
        if (empty($preFilledData['fee_id']) && $request->has('fee_id')) {
            $preFilledData['fee_id'] = $request->input('fee_id');
        }

        Log::debug('PAYMENT_CREATE: Pre-filled data', [
            'preFilledData' => $preFilledData,
            'fee_id_exists' => !empty($preFilledData['fee_id']),
            'fee_id_value' => $preFilledData['fee_id'] ?? null,
            'clearance_request_id_exists' => !empty($preFilledData['clearance_request_id']),
        ]);

        // ========== RESIDENTS WITH COMPLETE HOUSEHOLD INFORMATION ==========
        Log::debug('PAYMENT_CREATE: Fetching ALL residents with household details');
        
        $residents = Resident::with([
                'household.purok',
                'household.householdMembers' => function ($query) {
                    $query->with('resident');
                },
                'householdMember'
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($resident) use ($getHouseholdMember) {
                // Get outstanding fees for this resident
                $outstandingFees = Fee::where('payer_id', $resident->id)
                    ->where('payer_type', 'App\Models\Resident')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $outstandingFeeCount = $outstandingFees->count();
                $totalOutstandingBalance = $outstandingFees->sum('balance');

                // Get ALL pending clearance requests
                $pendingClearanceRequests = DB::table('clearance_requests')
                    ->where('resident_id', $resident->id)
                    ->whereIn('status', ['pending_payment', 'pending', 'processing', 'approved'])
                    ->count();

                // Get household membership details
                $householdInfo = null;
                $isHouseholdHead = false;
                $householdMember = $getHouseholdMember($resident);
                
                if ($resident->household) {
                    // Check if this resident is the head of household
                    $isHouseholdHead = $householdMember && $householdMember->is_head === true;
                    
                    // Get household head details
                    $headMember = $resident->household->householdMembers()
                        ->where('is_head', true)
                        ->with('resident')
                        ->first();
                    
                    $householdInfo = [
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
                        'is_head' => $isHouseholdHead,
                        'relationship_to_head' => $householdMember ? $householdMember->relationship_to_head : null,
                    ];
                }

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
                    'has_outstanding_fees' => $outstandingFeeCount > 0,
                    'outstanding_fee_count' => $outstandingFeeCount,
                    'total_outstanding_balance' => $totalOutstandingBalance > 0 
                        ? '₱' . number_format($totalOutstandingBalance, 2)
                        : null,
                    'has_pending_clearance' => $pendingClearanceRequests > 0,
                    'pending_clearance_count' => $pendingClearanceRequests,
                    'is_senior' => $resident->is_senior,
                    'is_pwd' => $resident->is_pwd,
                    'is_solo_parent' => $resident->is_solo_parent,
                    'is_indigent' => $resident->is_indigent,
                    'has_special_classification' => $resident->has_special_classification,
                    'discount_eligibility_list' => $resident->discount_eligibility_list,
                ];
            });

        // ========== HOUSEHOLDS WITH COMPLETE MEMBER INFORMATION ==========
        Log::debug('PAYMENT_CREATE: Fetching ALL households with member details');
        
        $households = Household::with([
                'purok',
                'householdMembers' => function ($query) {
                    $query->with('resident');
                },
                'user'
            ])
            ->orderBy('household_number', 'asc')
            ->get()
            ->map(function ($household) {
                // Get outstanding fees for this household
                $outstandingFees = Fee::where('payer_id', $household->id)
                    ->where('payer_type', 'App\Models\Household')
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();

                $outstandingFeeCount = $outstandingFees->count();
                $totalOutstandingBalance = $outstandingFees->sum('balance');

                // Get head of household
                $headMember = $household->householdMembers()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();
                
                // Get all members with their roles
                $members = $household->householdMembers
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
                    ->values();

                // Get family composition
                $familyComposition = [
                    'total_members' => $household->member_count,
                    'adults' => $members->filter(fn($m) => ($m['age'] ?? 0) >= 18)->count(),
                    'minors' => $members->filter(fn($m) => ($m['age'] ?? 0) < 18)->count(),
                    'seniors' => $members->filter(fn($m) => $m['is_senior'])->count(),
                    'pwd' => $members->filter(fn($m) => $m['is_pwd'])->count(),
                    'solo_parents' => $members->filter(fn($m) => $m['is_solo_parent'])->count(),
                ];

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
                    // Head of household information
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
                    // Household members
                    'members' => $members,
                    'family_composition' => $familyComposition,
                    // User account
                    'has_user_account' => $household->has_user_account,
                    'user_account' => $household->user_account_details,
                    // Outstanding fees
                    'has_outstanding_fees' => $outstandingFeeCount > 0,
                    'outstanding_fee_count' => $outstandingFeeCount,
                    'total_outstanding_balance' => $totalOutstandingBalance > 0 
                        ? '₱' . number_format($totalOutstandingBalance, 2)
                        : null,
                ];
            });

        // ========== ALL FEES WITH COMPLETE PAYER INFORMATION ==========
        Log::debug('PAYMENT_CREATE: Fetching ALL fees with balance for fees tab');
        
        $allFees = Fee::with([
                'feeType',
                'payer' // Use polymorphic relationship instead of specific resident/household
            ])
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
            ->orderBy('due_date', 'asc')
            ->orderBy('payer_name', 'asc')
            ->get()
            ->map(function ($fee) use ($getHouseholdMember) {
                $baseAmount = is_numeric($fee->base_amount) ? $fee->base_amount : 0;
                $surchargeAmount = is_numeric($fee->surcharge_amount) ? $fee->surcharge_amount : 0;
                $penaltyAmount = is_numeric($fee->penalty_amount) ? $fee->penalty_amount : 0;
                $discountAmount = is_numeric($fee->discount_amount) ? $fee->discount_amount : 0;
                $totalAmount = is_numeric($fee->total_amount) ? $fee->total_amount : 0;
                $balance = is_numeric($fee->balance) ? $fee->balance : 0;
                $amountPaid = is_numeric($fee->amount_paid) ? $fee->amount_paid : 0;

                // Get discount eligibility for resident fees
                $applicableDiscounts = [];
                $canApplyDiscount = false;
                $residentDetails = null;
                $householdDetails = null;
                $isHouseholdHead = false;
                
                // For resident payers - access through polymorphic relationship
                if ($fee->payer_type === 'App\Models\Resident' && $fee->payer_id) {
                    $resident = $fee->payer; // This will load the Resident model
                    
                    if ($resident && $fee->feeType) {
                        $residentDiscounts = $resident->discount_eligibility_list;
                        
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
                        
                        $canApplyDiscount = count($applicableDiscounts) > 0;
                        
                        // Check if resident is household head
                        $householdMember = $getHouseholdMember($resident);
                        $isHouseholdHead = $householdMember && $householdMember->is_head === true;
                        
                        $residentDetails = [
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
                        
                        // Get household details if resident belongs to a household
                        if ($resident->household) {
                            $headMember = $resident->household->householdMembers()
                                ->where('is_head', true)
                                ->with('resident')
                                ->first();
                            
                            $householdDetails = [
                                'id' => $resident->household->id,
                                'household_number' => $resident->household->household_number,
                                'contact_number' => $resident->household->contact_number,
                                'address' => $resident->household->address,
                                'purok' => $resident->household->purok->name ?? null,
                                'member_count' => $resident->household->member_count,
                                'head_of_household' => $headMember && $headMember->resident ? [
                                    'id' => $headMember->resident_id,
                                    'name' => $headMember->resident->full_name ?? 'Unknown',
                                    'is_current_resident' => $headMember->resident_id === $resident->id,
                                ] : null,
                                'resident_role' => $householdMember ? $householdMember->relationship_to_head : null,
                                'is_head' => $isHouseholdHead,
                            ];
                        }
                    }
                }
                
                // For household payers
                if ($fee->payer_type === 'App\Models\Household' && $fee->payer_id) {
                    $household = $fee->payer; // This will load the Household model
                    
                    if ($household) {
                        // Get head of household
                        $headMember = $household->householdMembers()
                            ->where('is_head', true)
                            ->with('resident')
                            ->first();
                        
                        // Get all members count
                        $membersCount = $household->householdMembers()->count();
                        
                        $householdDetails = [
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
                            'members_count' => $membersCount,
                        ];
                    }
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
                    'period_start' => $fee->period_start ? $fee->period_start->format('Y-m-d') : null,
                    'period_end' => $fee->period_end ? $fee->period_end->format('Y-m-d') : null,
                    'issue_date' => $fee->issue_date->format('Y-m-d'),
                    'due_date' => $fee->due_date->format('Y-m-d'),
                    'base_amount' => $baseAmount,
                    'surcharge_amount' => $surchargeAmount,
                    'penalty_amount' => $penaltyAmount,
                    'discount_amount' => $discountAmount,
                    'discount_type' => $fee->discount_type,
                    'total_amount' => $totalAmount,
                    'status' => $fee->status,
                    'amount_paid' => $amountPaid,
                    'balance' => $balance,
                    'payment_id' => $fee->payment_id,
                    'or_number' => $fee->or_number,
                    'payment_date' => $fee->payment_date ? $fee->payment_date->format('Y-m-d') : null,
                    'payment_method' => $fee->payment_method,
                    'transaction_reference' => $fee->transaction_reference,
                    'certificate_number' => $fee->certificate_number,
                    'valid_from' => $fee->valid_from ? $fee->valid_from->format('Y-m-d') : null,
                    'valid_until' => $fee->valid_until ? $fee->valid_until->format('Y-m-d') : null,
                    'purpose' => $fee->purpose,
                    'property_description' => $fee->property_description,
                    'business_type' => $fee->business_type,
                    'area' => $fee->area,
                    'issued_by' => $fee->issued_by,
                    'collected_by' => $fee->collected_by,
                    'approved_by' => $fee->approved_by,
                    'computation_details' => $fee->computation_details,
                    'requirements_submitted' => $fee->requirements_submitted,
                    'remarks' => $fee->remarks,
                    'waiver_reason' => $fee->waiver_reason,
                    'created_by' => $fee->created_by,
                    'updated_by' => $fee->updated_by,
                    'cancelled_by' => $fee->cancelled_by,
                    'cancelled_at' => $fee->cancelled_at ? $fee->cancelled_at->format('Y-m-d H:i:s') : null,
                    'created_at' => $fee->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $fee->updated_at->format('Y-m-d H:i:s'),
                    'deleted_at' => $fee->deleted_at ? $fee->deleted_at->format('Y-m-d H:i:s') : null,
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
                    'canApplyDiscount' => $canApplyDiscount,
                    'category' => $fee->feeType->category ?? 'other',
                    'resident_details' => $residentDetails,
                    'household_details' => $householdDetails,
                    'fee_type' => $fee->feeType ? [
                        'id' => $fee->feeType->id,
                        'name' => $fee->feeType->name,
                        'code' => $fee->feeType->code,
                        'base_amount' => $fee->feeType->base_amount,
                        'category' => $fee->feeType->category,
                    ] : null,
                ];
            });

        // ========== CLEARANCE REQUESTS WITH HOUSEHOLD INFORMATION ==========
        Log::debug('PAYMENT_CREATE: Fetching ALL pending clearance requests');
        
        $clearanceRequests = ClearanceRequest::with([
                'resident' => function ($query) {
                    $query->with(['household.purok', 'household.householdMembers.resident', 'householdMember']);
                },
                'clearanceType'
            ])
            ->whereIn('status', ['pending_payment', 'pending', 'processing', 'approved'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) use ($getHouseholdMember) {
                $hasPaymentItem = DB::table('payment_items')
                    ->where('clearance_request_id', $request->id)
                    ->exists();
                
                $applicableDiscounts = [];
                $canApplyDiscount = false;
                $householdInfo = null;
                $isHouseholdHead = false;
                
                if ($request->resident && $request->clearanceType) {
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
                    
                    $canApplyDiscount = count($applicableDiscounts) > 0;
                    
                    // Check if resident is household head
                    $householdMember = $getHouseholdMember($request->resident);
                    $isHouseholdHead = $householdMember && $householdMember->is_head === true;
                    
                    // Get household information
                    if ($request->resident->household) {
                        $headMember = $request->resident->household->householdMembers()
                            ->where('is_head', true)
                            ->with('resident')
                            ->first();
                        
                        $householdInfo = [
                            'id' => $request->resident->household->id,
                            'household_number' => $request->resident->household->household_number,
                            'contact_number' => $request->resident->household->contact_number,
                            'address' => $request->resident->household->address,
                            'full_address' => $request->resident->household->full_address,
                            'purok' => $request->resident->household->purok->name ?? null,
                            'purok_id' => $request->resident->household->purok_id ?? null,
                            'member_count' => $request->resident->household->member_count,
                            'head_of_household' => $headMember && $headMember->resident ? [
                                'id' => $headMember->resident_id,
                                'name' => $headMember->resident->full_name ?? 'Unknown',
                                'is_current_resident' => $headMember->resident_id === $request->resident_id,
                            ] : null,
                            'head_name' => $request->resident->household->current_head_name,
                            'head_id' => $headMember->resident_id ?? null,
                            'resident_role' => $householdMember ? $householdMember->relationship_to_head : null,
                            'is_head' => $isHouseholdHead,
                        ];
                    }
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
                    'canApplyDiscount' => $canApplyDiscount,
                    'can_be_paid' => in_array($request->status, ['pending_payment', 'processing', 'approved']) && !$hasPaymentItem,
                    'already_paid' => $hasPaymentItem,
                ];
            })
            ->values();

        // ========== FEE TYPES ==========
        Log::debug('PAYMENT_CREATE: Fetching fee types');
        
        $feeTypes = FeeType::where('is_active', true)
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

        // ========== DISCOUNT RULES ==========
        Log::debug('PAYMENT_CREATE: Fetching active discount rules');

        $discountRules = DiscountRule::active()
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

        // Create a formatted array for the discount dropdown
        $discountTypes = $discountRules->mapWithKeys(function ($rule) {
            // Create a descriptive label
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

        // Also keep a mapping of code -> id for reference
        $discountCodeToIdMap = $discountRules->mapWithKeys(function ($rule) {
            return [$rule['code'] => $rule['id']];
        })->toArray();

        // Generate OR number function
        $generateORNumber = function(): string {
            $date = new \DateTime();
            $year = $date->format('Y');
            $month = $date->format('m');
            $day = $date->format('d');
            $random = str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
            return "BAR-{$year}{$month}{$day}-{$random}";
        };

        // ========== SELECTED FEE DETAILS WITH HOUSEHOLD INFORMATION ==========
        $selectedFeeDetails = null;
        if (!empty($preFilledData['fee_id'])) {
            $feeId = $preFilledData['fee_id'];
            Log::debug('PAYMENT_CREATE: Fetching selected fee details', ['fee_id' => $feeId]);
            
            $fee = Fee::with([
                    'feeType',
                    'payer' // Use polymorphic relationship
                ])
                ->find($feeId);
            
            if ($fee) {
                Log::debug('PAYMENT_CREATE: Found fee', ['fee_id' => $fee->id, 'fee_code' => $fee->fee_code]);
                
                $applicableDiscounts = [];
                $discountEligibilityText = '';
                $residentDiscountInfo = null;
                $householdInfo = null;
                $isHouseholdHead = false;
                
                // For resident payers
                if ($fee->payer_type === 'App\Models\Resident' && $fee->payer_id && $fee->feeType) {
                    $resident = $fee->payer; // This will load the Resident model
                    
                    if ($resident) {
                        $residentDiscounts = $resident->discount_eligibility_list;
                        
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
                        
                        if (!empty($applicableDiscounts)) {
                            $highestDiscount = collect($applicableDiscounts)->sortByDesc('percentage')->first();
                            $discountEligibilityText = "Eligible for {$highestDiscount['label']} discount ({$highestDiscount['percentage']}%)";
                        }
                        
                        // Check if resident is household head
                        $householdMember = $getHouseholdMember($resident);
                        $isHouseholdHead = $householdMember && $householdMember->is_head === true;
                        
                        // Get household details
                        if ($resident->household) {
                            $headMember = $resident->household->householdMembers()
                                ->where('is_head', true)
                                ->with('resident')
                                ->first();
                            
                            $householdInfo = [
                                'id' => $resident->household->id,
                                'household_number' => $resident->household->household_number,
                                'contact_number' => $resident->household->contact_number,
                                'email' => $resident->household->email,
                                'address' => $resident->household->address,
                                'full_address' => $resident->household->full_address,
                                'purok' => $resident->household->purok->name ?? null,
                                'purok_id' => $resident->household->purok_id,
                                'member_count' => $resident->household->member_count,
                                'head_of_household' => $headMember && $headMember->resident ? [
                                    'id' => $headMember->resident_id,
                                    'name' => $headMember->resident->full_name ?? 'Unknown',
                                    'contact_number' => $headMember->resident->contact_number ?? null,
                                    'is_current_resident' => $headMember->resident_id === $resident->id,
                                ] : null,
                                'head_name' => $resident->household->current_head_name,
                                'head_id' => $headMember->resident_id ?? null,
                                'resident_role' => $householdMember ? $householdMember->relationship_to_head : null,
                                'is_head' => $isHouseholdHead,
                                'has_user_account' => $resident->household->has_user_account,
                            ];
                        }
                        
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
                            'discount_eligibility_list' => $residentDiscounts,
                            'household_id' => $resident->household_id,
                            'household_info' => $householdInfo,
                            'is_household_head' => $isHouseholdHead,
                        ];
                    }
                }
                
                // For household payers
                if ($fee->payer_type === 'App\Models\Household' && $fee->payer_id) {
                    $household = $fee->payer; // This will load the Household model
                    
                    if ($household) {
                        $headMember = $household->householdMembers()
                            ->where('is_head', true)
                            ->with('resident')
                            ->first();
                        
                        $householdInfo = [
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
                            'user_account' => $household->user_account_details,
                            'income_range' => $household->income_range,
                            'housing_type' => $household->housing_type,
                            'ownership_status' => $household->ownership_status,
                            'has_electricity' => $household->has_electricity,
                            'has_internet' => $household->has_internet,
                            'has_vehicle' => $household->has_vehicle,
                        ];
                    }
                }
                
                $selectedFeeDetails = [
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
                    'discount_eligibility_text' => $discountEligibilityText,
                    'resident_discount_info' => $residentDiscountInfo,
                    'household_info' => $householdInfo,
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
                
                Log::debug('PAYMENT_CREATE: Selected fee details prepared', [
                    'fee_id' => $selectedFeeDetails['id'],
                    'has_discounts' => !empty($selectedFeeDetails['applicable_discounts']),
                    'has_household_info' => !is_null($selectedFeeDetails['household_info']),
                    'is_household_head' => $selectedFeeDetails['is_household_head'] ?? false,
                ]);
            }
        }

        // ========== CLEARANCE TYPES ==========
        Log::debug('PAYMENT_CREATE: Fetching clearance types');

        $clearanceTypesForSelect = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->mapWithKeys(function ($type) {
                $code = $type->code ?? strtoupper(str_replace(' ', '_', $type->name));
                return [$code => $type->name];
            })
            ->toArray();

        $clearanceTypesDetails = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                // Handle fields that are cast to arrays by the model
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

        // ========== CLEARANCE REQUEST PRE-FILL ==========
        $clearanceRequest = null;
        $selectedClearanceTypeId = $preFilledData['clearance_type_id'] ?? null;
        
        if (!empty($preFilledData['clearance_request_id'])) {
            Log::info('PAYMENT_CREATE: Processing clearance request pre-fill', [
                'clearance_request_id' => $preFilledData['clearance_request_id']
            ]);
            
            $clearanceRequest = ClearanceRequest::with([
                    'resident' => function ($query) {
                        $query->with(['household.purok', 'household.householdMembers.resident', 'householdMember']);
                    },
                    'clearanceType'
                ])
                ->find($preFilledData['clearance_request_id']);
                
            if ($clearanceRequest) {
                $hasPaymentItem = DB::table('payment_items')
                    ->where('clearance_request_id', $clearanceRequest->id)
                    ->exists();
                
                $payableStatuses = ['approved', 'pending_payment', 'processing'];
                
                if (!in_array($clearanceRequest->status, $payableStatuses)) {
                    return redirect()->back()->withErrors([
                        'error' => 'Clearance request is not in a payable state. Current status: ' . 
                                   ($clearanceRequest->status_display ?? $clearanceRequest->status)
                    ]);
                }
                
                $preFilledData['payer_type'] = 'App\Models\Resident';
                $preFilledData['payer_id'] = $clearanceRequest->resident_id;
                $preFilledData['payer_name'] = $clearanceRequest->resident->full_name ?? 'Unknown';
                $preFilledData['contact_number'] = $clearanceRequest->resident->contact_number ?? null;
                $preFilledData['address'] = $clearanceRequest->resident->address ?? null;
                
                if ($clearanceRequest->resident->household) {
                    $preFilledData['household_number'] = $clearanceRequest->resident->household->household_number ?? null;
                    $preFilledData['purok'] = $clearanceRequest->resident->household->purok->name ?? null;
                }
                
                if ($clearanceRequest->clearance_type_id && !$selectedClearanceTypeId) {
                    $selectedClearanceTypeId = $clearanceRequest->clearance_type_id;
                    $preFilledData['clearance_type_id'] = $selectedClearanceTypeId;
                }
                
                if (!isset($preFilledData['purpose']) || empty($preFilledData['purpose'])) {
                    $preFilledData['purpose'] = $clearanceRequest->clearanceType->name ?? 'Clearance Payment';
                }
                
                if ($clearanceRequest->clearanceType) {
                    $preFilledData['clearance_code'] = $clearanceRequest->clearanceType->code ?? 
                        strtoupper(str_replace(' ', '_', $clearanceRequest->clearanceType->name));
                }
            }
        }

        // Find selected clearance type details
        $selectedClearanceType = null;
        if ($selectedClearanceTypeId) {
            $selectedClearanceType = $clearanceTypesDetails->firstWhere('id', $selectedClearanceTypeId);
        }

        // Determine if this is a combined payment (both fee and clearance)
        $isCombinedPayment = !empty($preFilledData['fee_id']) && !empty($preFilledData['clearance_request_id']);

        Log::info('PAYMENT_CREATE: Rendering payment creation view', [
            'data_summary' => [
                'residents_count' => count($residents),
                'households_count' => count($households),
                'clearance_requests_count' => $clearanceRequests->count(),
                'all_fees_count' => $allFees->count(),
                'discount_rules_count' => $discountRules->count(),
                'has_clearance_request' => !is_null($clearanceRequest),
                'clearance_types_count' => $clearanceTypesDetails->count(),
                'selected_clearance_type_id' => $selectedClearanceTypeId,
                'has_selected_fee_details' => !is_null($selectedFeeDetails),
                'selected_fee_id' => $selectedFeeDetails['id'] ?? null,
                'is_combined_payment' => $isCombinedPayment,
            ],
        ]);

        return Inertia::render('admin/Payments/Create', [
            'residents' => $residents,
            'households' => $households,
            'clearance_requests' => $clearanceRequests,
            'fees' => $allFees,
            'feeTypes' => $feeTypes,
            'discountRules' => $discountRules, // Full discount rule data
            'discountTypes' => $discountTypes, // For dropdown display
            'discountCodeToIdMap' => $discountCodeToIdMap, // For mapping back to IDs
            'pre_filled_data' => array_merge($preFilledData, [
                'fee_type_id' => $preFilledData['fee_type_id'] ?? null,
                'clearance_type_id' => $selectedClearanceTypeId,
                'clearance_code' => $preFilledData['clearance_code'] ?? null,
            ]),
            'selected_fee_details' => $selectedFeeDetails,
            'selected_fee_type_id' => $preFilledData['fee_type_id'] ?? null,
            'clearance_request' => $clearanceRequest ? [
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
                    'is_household_head' => $clearanceRequest->resident->householdMember && 
                        $getHouseholdMember($clearanceRequest->resident)?->is_head === true,
                    'birthdate' => $clearanceRequest->resident->birthdate?->format('Y-m-d'),
                    'age' => $clearanceRequest->resident->age ?? null,
                    'gender' => $clearanceRequest->resident->gender,
                    'is_senior' => $clearanceRequest->resident->is_senior,
                    'is_pwd' => $clearanceRequest->resident->is_pwd,
                    'is_solo_parent' => $clearanceRequest->resident->is_solo_parent,
                    'is_indigent' => $clearanceRequest->resident->is_indigent,
                    'discount_eligibility_list' => $clearanceRequest->resident->discount_eligibility_list,
                ] : null,
                'can_be_paid' => in_array($clearanceRequest->status, ['approved', 'pending_payment', 'processing']) && !$hasPaymentItem,
                'already_paid' => $hasPaymentItem ?? false,
            ] : null,
            'clearance_fee_type' => $clearanceRequest ? [
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
            ] : null,
            'clearanceTypes' => $clearanceTypesForSelect,
            'clearanceTypesDetails' => $clearanceTypesDetails,
            'selectedClearanceType' => $selectedClearanceType,
            'hasClearanceTypes' => $clearanceTypesDetails->count() > 0,
            'isCombinedPayment' => $isCombinedPayment,
        ]);
    }
    /**
     * Get outstanding fees for a specific payer.
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
                    'original_amount' => $fee->feeType->base_amount ?? 0,
                    'surcharge_rate' => $fee->feeType->surcharge_percentage ?? 0,
                    'penalty_rate' => $fee->feeType->penalty_percentage ?? 0,
                    'has_surcharge' => $fee->feeType->has_surcharge ?? false,
                    'has_penalty' => $fee->feeType->has_penalty ?? false,
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

    /**
     * Store a newly created payment in storage.
     */
   /**
 * Store a newly created payment in storage.
 */
  private function getPayerModelClass(string $payerType): string
    {
        return match($payerType) {
            'resident' => 'App\\Models\\Resident',
            'household' => 'App\\Models\\Household',
            'business' => 'App\\Models\\Business',
            default => 'App\\Models\\Resident',
        };
    }

    /**
     * Generate a unique OR number
     */
    private function generateOrNumber(): string
    {
        $date = now()->format('Ymd');
        $lastPayment = Payment::where('or_number', 'like', "BAR-{$date}-%")
            ->orderBy('or_number', 'desc')
            ->first();

        if ($lastPayment) {
            $lastNumber = (int) substr($lastPayment->or_number, -3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }

        return "BAR-{$date}-{$newNumber}";
    }

public function store(Request $request)
{
    Log::info('PAYMENT_STORE_REQUEST: Payment creation started', [
        'user_id' => Auth::id(),
        'user_name' => Auth::user()->name ?? 'Unknown',
        'items_count' => count($request->input('items', [])),
    ]);

    // Validate main request
    $validated = $request->validate([
        'payer_type' => 'required|in:resident,household,business,other',
        'payer_id' => 'required',
        'payer_name' => 'required|string|max:255',
        'contact_number' => 'nullable|string|max:20',
        'address' => 'nullable|string|max:500',
        'household_number' => 'nullable|string|max:50',
        'purok' => 'nullable|string|max:100',
        'payment_date' => 'required|date',
        'period_covered' => 'nullable|string|max:100',
        'or_number' => 'nullable|string|max:100',
        'payment_method' => 'required|in:cash,gcash,maya,bank,check,online',
        'reference_number' => 'nullable|string|max:100',
        'subtotal' => 'required|numeric|min:0',
        'surcharge' => 'required|numeric|min:0',
        'penalty' => 'required|numeric|min:0',
        'discount' => 'required|numeric|min:0',
        'amount_paid' => 'required|numeric|min:0',
        'total_amount' => 'required|numeric|min:0', // This should be subtotal + surcharge + penalty
        'purpose' => 'required|string|max:500',
        'remarks' => 'nullable|string|max:1000',
        'is_cleared' => 'boolean',
        'validity_date' => 'nullable|date',
        'collection_type' => 'required|in:manual,system',
        'method_details' => 'nullable|array',
        'items' => 'required|array|min:1',
        'verification_id_number' => 'nullable|string',
        'verification_remarks' => 'nullable|string',
        'discount_code' => 'nullable|string',
        'discount_type' => 'nullable|string',
    ]);

    // IMPORTANT: Recalculate total_amount to ensure it's correct (subtotal + surcharge + penalty)
    $calculatedTotal = $validated['subtotal'] + $validated['surcharge'] + $validated['penalty'];
    
    // If there's a mismatch, use the calculated total
    if (abs($calculatedTotal - $validated['total_amount']) > 0.01) {
        Log::warning('PAYMENT_STORE: Total amount mismatch, using calculated value', [
            'provided_total' => $validated['total_amount'],
            'calculated_total' => $calculatedTotal,
        ]);
        $validated['total_amount'] = $calculatedTotal;
    }

    // Calculate amount due after discount (what they should pay)
    $amountDue = $validated['total_amount'] - $validated['discount'];

    // Log the correct values
    Log::info('PAYMENT_STORE: Payment calculation', [
        'subtotal' => $validated['subtotal'],
        'surcharge' => $validated['surcharge'],
        'penalty' => $validated['penalty'],
        'total_amount' => $validated['total_amount'], // Original amount before discount (51.00)
        'discount' => $validated['discount'], // Discount amount (5.10)
        'amount_due' => $amountDue, // What they should pay (45.90)
        'amount_paid' => $validated['amount_paid'], // What they actually paid (should be 45.90)
    ]);

    // Validate that amount_paid makes sense
    if ($validated['amount_paid'] < 0) {
        return back()->withErrors(['amount_paid' => 'Amount paid cannot be negative'])->withInput();
    }

    // Generate OR number
    $orNumber = $validated['or_number'] ?? $this->generateOrNumber();
    
    if (Payment::where('or_number', $orNumber)->exists()) {
        $orNumber = $this->generateOrNumber();
    }
    
    $validated['or_number'] = $orNumber;

    // Validate items
    $validatedItems = [];
    $feeIdsToUpdate = [];
    $itemDiscountAmounts = [];
    
    foreach ($validated['items'] as $index => $item) {
        try {
            $itemData = validator($item, [
                'item_type' => 'nullable|in:fee,clearance',
                'fee_id' => 'nullable',
                'fee_type_id' => 'nullable',
                'outstanding_fee_id' => 'nullable',
                'fee_name' => 'required|string|max:255',
                'fee_code' => 'required|string|max:50',
                'description' => 'nullable|string|max:500',
                'base_amount' => 'required|numeric|min:0',
                'surcharge' => 'required|numeric|min:0',
                'penalty' => 'required|numeric|min:0',
                'total_amount' => 'required|numeric|min:0', // This is base + surcharge + penalty (without discount)
                'category' => 'required|string|max:50',
                'period_covered' => 'nullable|string|max:100',
                'months_late' => 'nullable|integer|min:0',
                'metadata' => 'nullable|array',
            ])->validate();

            if (!empty($itemData['outstanding_fee_id'])) {
                $feeIdsToUpdate[] = $itemData['outstanding_fee_id'];
            }

            $validatedItems[] = [
                'item_type' => $itemData['item_type'] ?? 'fee',
                'fee_id' => $itemData['fee_id'] ?? null,
                'fee_type_id' => $itemData['fee_type_id'] ?? null,
                'outstanding_fee_id' => $itemData['outstanding_fee_id'] ?? null,
                'fee_name' => $itemData['fee_name'],
                'fee_code' => $itemData['fee_code'],
                'description' => $itemData['description'] ?? null,
                'base_amount' => floatval($itemData['base_amount']),
                'surcharge' => floatval($itemData['surcharge']),
                'penalty' => floatval($itemData['penalty']),
                'total_amount' => floatval($itemData['total_amount']), // Original amount without discount
                'category' => $itemData['category'],
                'period_covered' => $itemData['period_covered'] ?? null,
                'months_late' => $itemData['months_late'] ?? 0,
                'metadata' => $itemData['metadata'] ?? [],
            ];
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Item ' . ($index + 1) . ': ' . $e->getMessage()])->withInput();
        }
    }

    $validated['items'] = $validatedItems;

    DB::beginTransaction();

    try {
        // Determine status based on amount paid vs amount due
        $status = 'completed';
        if ($validated['amount_paid'] <= 0) {
            $status = 'pending';
        } elseif ($validated['amount_paid'] < $amountDue - 0.01) {
            $status = 'partially_paid';
        }

        // Get recorded by user
        $recordedBy = Auth::id() ?? 1;

        // Create payment record
        $paymentData = [
            'status' => $status,
            'collection_type' => $validated['collection_type'] ?? 'manual',
            'or_number' => $validated['or_number'],
            'payer_type' => $validated['payer_type'],
            'payer_id' => $validated['payer_id'],
            'payer_name' => $validated['payer_name'],
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'household_number' => $validated['household_number'] ?? null,
            'purok' => $validated['purok'] ?? null,
            'payment_date' => $validated['payment_date'],
            'period_covered' => $validated['period_covered'] ?? null,
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'subtotal' => floatval($validated['subtotal']),
            'surcharge' => floatval($validated['surcharge']),
            'penalty' => floatval($validated['penalty']),
            'discount' => floatval($validated['discount']),
            'amount_paid' => floatval($validated['amount_paid']),
            'total_amount' => floatval($validated['total_amount']), // Original amount before discount
            'purpose' => $validated['purpose'],
            'remarks' => $validated['remarks'] ?? null,
            'is_cleared' => $validated['is_cleared'] ?? false,
            'validity_date' => $validated['validity_date'] ?? null,
            'method_details' => !empty($validated['method_details']) ? json_encode($validated['method_details']) : null,
            'recorded_by' => $recordedBy,
            'discount_code' => $validated['discount_code'] ?? null,
            'discount_type' => $validated['discount_type'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        Log::info('PAYMENT_STORE: Creating payment record', [
            'or_number' => $paymentData['or_number'],
            'payer_name' => $paymentData['payer_name'],
            'total_amount' => $paymentData['total_amount'],
            'discount' => $paymentData['discount'],
            'amount_due' => $paymentData['total_amount'] - $paymentData['discount'],
            'amount_paid' => $paymentData['amount_paid'],
            'status' => $status,
        ]);

        $payment = Payment::create($paymentData);

        // Get outstanding fees
        $payerModelClass = $this->getPayerModelClass($validated['payer_type']);
        $outstandingFees = Fee::where('payer_type', $payerModelClass)
            ->where('payer_id', $validated['payer_id'])
            ->whereIn('id', $feeIdsToUpdate)
            ->get()
            ->keyBy('id');

        // Calculate proportional discount per item
        $totalBaseAmount = array_sum(array_column($validated['items'], 'base_amount'));
        $totalDiscount = floatval($validated['discount']);
        
        if ($totalDiscount > 0 && $totalBaseAmount > 0) {
            foreach ($validated['items'] as $index => $item) {
                $itemBaseAmount = floatval($item['base_amount']);
                $itemProportion = $itemBaseAmount / $totalBaseAmount;
                $itemDiscountAmounts[$index] = $totalDiscount * $itemProportion;
            }
        }

        // Create payment items and update fees
        $feeIdsPaid = [];
        
        foreach ($validated['items'] as $index => $item) {
            $paymentItemData = [
                'payment_id' => $payment->id,
                'fee_name' => $item['fee_name'],
                'fee_code' => $item['fee_code'],
                'description' => $item['description'] ?? null,
                'base_amount' => $item['base_amount'],
                'surcharge' => $item['surcharge'],
                'penalty' => $item['penalty'],
                'total_amount' => $item['total_amount'], // Original amount without discount
                'category' => $item['category'],
                'period_covered' => $item['period_covered'] ?? null,
                'months_late' => $item['months_late'] ?? 0,
                'fee_metadata' => json_encode($item['metadata'] ?? []),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Handle outstanding fee
            if (!empty($item['outstanding_fee_id']) && isset($outstandingFees[$item['outstanding_fee_id']])) {
                $fee = $outstandingFees[$item['outstanding_fee_id']];
                $itemDiscountAmount = $itemDiscountAmounts[$index] ?? 0;
                
                // Calculate the actual amount paid for this fee (total_amount - discount portion)
                $actualAmountPaid = $item['total_amount'] - $itemDiscountAmount;
                
                // Update fee
                $newBalance = max(0, $fee->balance - $actualAmountPaid);
                $newAmountPaid = $fee->amount_paid + $actualAmountPaid;
                $newTotalDiscounts = ($fee->total_discounts ?? 0) + $itemDiscountAmount;
                
                $fee->update([
                    'total_discounts' => $newTotalDiscounts,
                    'balance' => $newBalance,
                    'amount_paid' => $newAmountPaid,
                    'status' => $newBalance <= 0 ? 'paid' : 'partially_paid',
                    'last_payment_date' => now(),
                    'last_payment_or' => $payment->or_number,
                ]);
                
                $paymentItemData['original_fee_id'] = $fee->id;
                $paymentItemData['fee_id'] = $fee->id;
                $feeIdsPaid[] = $fee->id;
            }

            DB::table('payment_items')->insert($paymentItemData);
        }

        // Handle discount verification
        if (!empty($validated['discount_code']) && !empty($validated['verification_id_number'])) {
            $discountRule = DiscountRule::where('code', $validated['discount_code'])->first();
            
            if ($discountRule) {
                PaymentDiscount::create([
                    'payment_id' => $payment->id,
                    'discount_rule_id' => $discountRule->id,
                    'discount_amount' => $validated['discount'],
                    'verified_by' => $recordedBy,
                    'verified_at' => now(),
                    'id_presented' => true,
                    'id_number' => $validated['verification_id_number'],
                    'remarks' => $validated['verification_remarks'] ?? null,
                ]);
            }
        }

        DB::commit();

        Log::info('PAYMENT_STORE: Payment transaction completed', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'total_amount' => $payment->total_amount,
            'discount' => $payment->discount,
            'amount_due' => $payment->total_amount - $payment->discount,
            'amount_paid' => $payment->amount_paid,
            'status' => $payment->status,
        ]);

        return redirect()->route('payments.show', $payment->id)
            ->with('success', 'Payment recorded successfully! Receipt: ' . $payment->or_number);

    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('PAYMENT_STORE_ERROR: Payment creation failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        
        return back()->withErrors(['error' => 'Failed to record payment: ' . $e->getMessage()])->withInput();
    }
}


  /**
 * Display the specified payment.
 */
public function show(Payment $payment)
{
    $payment->load([
        'items',
        'recorder',
        'items.clearanceRequest.clearanceType',
        'items.fee.feeType',
        'items.clearanceRequest.resident.household',
        'items.clearanceRequest.documents',
        'items.clearanceRequest.issuingOfficer',
        'items.clearanceRequest.processedBy',
    ]);

    // Get clearance requests associated with this payment
    $clearanceRequests = $payment->items()
        ->whereNotNull('clearance_request_id')
        ->with([
            'clearanceRequest.clearanceType',
            'clearanceRequest.resident.household',
            'clearanceRequest.issuingOfficer',
            'clearanceRequest.processedBy',
            'clearanceRequest.documents'
        ])
        ->get()
        ->pluck('clearanceRequest')
        ->filter()
        ->map(function ($request) {
            // Add formatted dates
            if ($request->needed_date) {
                $request->formatted_needed_date = $request->needed_date->format('F j, Y');
            }
            if ($request->issue_date) {
                $request->formatted_issue_date = $request->issue_date->format('F j, Y');
            }
            if ($request->valid_until) {
                $request->formatted_valid_until = $request->valid_until->format('F j, Y');
                $request->days_remaining = $request->valid_until->diffInDays(now(), false);
                $request->is_valid = $request->valid_until->isFuture();
            }
            if ($request->created_at) {
                $request->formatted_created_at = $request->created_at->format('F j, Y g:i A');
            }
            if ($request->processed_at) {
                $request->formatted_processed_at = $request->processed_at->format('F j, Y g:i A');
            }
            
            return $request;
        });

    // Get fees associated with this payment
    $fees = $payment->items()
        ->whereNotNull('fee_id')
        ->with([
            'fee.feeType',
            'fee.payer', // Load polymorphic payer relationship
            'fee.issuedBy',
            'fee.collectedBy',
            'fee.createdBy',
        ])
        ->get()
        ->pluck('fee')
        ->filter()
        ->map(function ($fee) {
            // Load household for residents if needed
            if ($fee->payer && $fee->payer_type === 'App\Models\Resident' && method_exists($fee->payer, 'household')) {
                $fee->payer->load('household');
            }
            
            // Add formatted dates and calculations
            if ($fee->issue_date) {
                $fee->formatted_issue_date = $fee->issue_date->format('F j, Y');
            }
            if ($fee->due_date) {
                $fee->formatted_due_date = $fee->due_date->format('F j, Y');
                $fee->is_overdue = $fee->due_date->isPast() && $fee->status !== 'paid' && $fee->status !== 'cancelled';
                $fee->days_overdue = $fee->is_overdue ? now()->diffInDays($fee->due_date) : 0;
            }
            if ($fee->period_start) {
                $fee->formatted_period_start = $fee->period_start->format('F j, Y');
            }
            if ($fee->period_end) {
                $fee->formatted_period_end = $fee->period_end->format('F j, Y');
            }
            if ($fee->valid_from) {
                $fee->formatted_valid_from = $fee->valid_from->format('F j, Y');
            }
            if ($fee->valid_until) {
                $fee->formatted_valid_until = $fee->valid_until->format('F j, Y');
            }
            
            $fee->payment_percentage = $fee->total_amount > 0 ? ($fee->amount_paid / $fee->total_amount) * 100 : 0;
            
            return $fee;
        });

    // Load payer details based on payer_type
    if ($payment->payer_type === 'resident') {
        $payment->load(['resident.household']);
        $payerDetails = $payment->resident;
    } elseif ($payment->payer_type === 'household') {
        $payment->load(['household.members.resident']);
        $payerDetails = $payment->household;
    } else {
        $payerDetails = null;
    }

    // Format payer details
    $payer = null;
    if ($payerDetails) {
        if ($payment->payer_type === 'resident') {
            $payer = [
                'id' => $payerDetails->id,
                'name' => $payment->payer_name,
                'type' => $payment->payer_type,
                'contact_number' => $payerDetails->contact_number ?? $payment->contact_number,
                'email' => $payerDetails->email ?? null,
                'address' => $payerDetails->address ?? $payment->address,
                'household_number' => $payerDetails->household?->household_number ?? null,
                'purok' => $payerDetails->purok?->name ?? $payerDetails->household?->purok?->name ?? $payment->purok,
                'household' => $payerDetails->household ? [
                    'id' => $payerDetails->household->id,
                    'household_number' => $payerDetails->household->household_number,
                    'purok' => $payerDetails->household->purok?->name,
                ] : null,
                'members' => null,
            ];
        } elseif ($payment->payer_type === 'household') {
            $payer = [
                'id' => $payerDetails->id,
                'name' => $payment->payer_name,
                'type' => $payment->payer_type,
                'contact_number' => $payerDetails->contact_number ?? $payment->contact_number,
                'email' => $payerDetails->email ?? null,
                'address' => $payerDetails->address ?? $payment->address,
                'household_number' => $payerDetails->household_number,
                'purok' => $payerDetails->purok?->name ?? $payment->purok,
                'household' => [
                    'id' => $payerDetails->id,
                    'household_number' => $payerDetails->household_number,
                    'purok' => $payerDetails->purok?->name,
                ],
                'members' => $payerDetails->members?->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->resident?->name ?? 'Unknown',
                        'relationship' => $member->relationship,
                        'resident' => $member->resident ? [
                            'id' => $member->resident->id,
                            'name' => $member->resident->name,
                        ] : null,
                    ];
                })->toArray(),
            ];
        }
    }

    // Get related payments
    $relatedPayments = Payment::where('payer_type', $payment->payer_type)
        ->where('payer_id', $payment->payer_id)
        ->where('id', '!=', $payment->id)
        ->with(['recorder'])
        ->orderBy('payment_date', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($relatedPayment) {
            $relatedPayment->formatted_date = $relatedPayment->payment_date->format('F j, Y');
            $relatedPayment->formatted_total = '₱' . number_format($relatedPayment->total_amount, 2);
            $relatedPayment->status_display = ucfirst($relatedPayment->status);
            return $relatedPayment;
        });

    // Calculate payment breakdown
    $paymentBreakdown = [
        'subtotal' => $payment->subtotal,
        'formatted_subtotal' => '₱' . number_format($payment->subtotal, 2),
        'surcharge' => $payment->surcharge,
        'formatted_surcharge' => '₱' . number_format($payment->surcharge, 2),
        'penalty' => $payment->penalty,
        'formatted_penalty' => '₱' . number_format($payment->penalty, 2),
        'discount' => $payment->discount,
        'formatted_discount' => '₱' . number_format($payment->discount, 2),
        'total' => $payment->total_amount,
        'formatted_total' => '₱' . number_format($payment->total_amount, 2),
    ];

    // Format payment dates
    $payment->formatted_date = $payment->payment_date->format('F j, Y');
    $payment->formatted_created_at = $payment->created_at->format('F j, Y g:i A');
    $payment->formatted_updated_at = $payment->updated_at->format('F j, Y g:i A');
    if ($payment->validity_date) {
        $payment->formatted_validity_date = $payment->validity_date->format('F j, Y');
    }
    
    // Format payment method
    $paymentMethodDetails = [
        'cash' => ['name' => 'Cash', 'icon' => 'cash', 'color' => 'text-green-600'],
        'gcash' => ['name' => 'GCash', 'icon' => 'mobile', 'color' => 'text-blue-600'],
        'maya' => ['name' => 'Maya', 'icon' => 'mobile', 'color' => 'text-purple-600'],
        'online' => ['name' => 'Online', 'icon' => 'globe', 'color' => 'text-indigo-600'],
        'bank' => ['name' => 'Bank', 'icon' => 'bank', 'color' => 'text-orange-600'],
        'check' => ['name' => 'Check', 'icon' => 'file-text', 'color' => 'text-red-600'],
    ];
    
    $payment->payment_method_display = $paymentMethodDetails[$payment->payment_method]['name'] ?? ucfirst($payment->payment_method);
    $payment->payment_method_details = $paymentMethodDetails[$payment->payment_method] ?? ['name' => ucfirst($payment->payment_method), 'icon' => 'credit-card', 'color' => 'text-gray-600'];
    
    // Format collection type
    $payment->collection_type_display = ucfirst($payment->collection_type);
    
    // Format status
    $payment->status_display = ucfirst($payment->status);
    
    // Format clearance status
    $payment->is_cleared_display = $payment->is_cleared ? 'Cleared' : 'Not Cleared';
    
    // Add flags for UI
    $payment->has_surcharge = $payment->surcharge > 0;
    $payment->has_penalty = $payment->penalty > 0;
    $payment->has_discount = $payment->discount > 0;

    return Inertia::render('admin/Payments/Show', [
        'payment' => $payment,
        'clearanceRequests' => $clearanceRequests,
        'fees' => $fees,
        'payer' => $payer,
        'relatedPayments' => $relatedPayments,
        'paymentBreakdown' => $paymentBreakdown,
        'isClearancePayment' => $payment->items()->whereNotNull('clearance_request_id')->exists(),
        'isFeePayment' => $payment->items()->whereNotNull('fee_id')->exists(),
        'hasClearanceRequests' => $clearanceRequests->isNotEmpty(),
        'hasFees' => $fees->isNotEmpty(),
    ]);
}
    /**
     * Show the form for editing the specified payment.
     */
    public function edit(Payment $payment)
    {
        if ($payment->status === 'cancelled') {
            return redirect()->route('payments.show', $payment->id)
                ->with('error', 'Cannot edit a cancelled payment.');
        }

        $payment->load('items');
        
        $residents = Resident::with(['household' => function ($query) {
                $query->select('id', 'household_number', 'purok_id');
            }, 'household.purok' => function ($query) {
                $query->select('id', 'name');
            }])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'address', 'household_id'])
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'contact_number' => $resident->contact_number,
                    'address' => $resident->address,
                    'household_number' => $resident->household ? $resident->household->household_number : null,
                    'purok' => $resident->household && $resident->household->purok 
                        ? $resident->household->purok->name 
                        : null,
                ];
            });

        $households = Household::with(['purok' => function ($query) {
                $query->select('id', 'name');
            }])
            ->withCount(['householdMembers as members_count'])
            ->orderBy('head_of_family', 'asc')
            ->get(['id', 'head_of_family', 'contact_number', 'address', 'household_number', 'purok_id'])
            ->map(function ($household) {
                return [
                    'id' => $household->id,
                    'head_name' => $household->head_of_family,
                    'contact_number' => $household->contact_number,
                    'address' => $household->address,
                    'household_number' => $household->household_number,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'family_members' => $household->members_count,
                ];
            });

        $fees = FeeType::where('is_active', true)
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
                    'has_surcharge' => (bool) $feeType->has_surcharge,
                    'surcharge_rate' => floatval($feeType->surcharge_percentage ?? 0),
                    'has_penalty' => (bool) $feeType->has_penalty,
                    'penalty_rate' => floatval($feeType->penalty_percentage ?? 0),
                    'validity_days' => $feeType->validity_days,
                    'applicable_to' => $feeType->applicable_to ? [$feeType->applicable_to] : [],
                ];
        });

        $discountTypes = [
            'senior_citizen' => 'Senior Citizen (20%)',
            'pwd' => 'Person with Disability (20%)',
            'solo_parent' => 'Solo Parent (15%)',
            'indigent' => 'Indigent (50%)',
            'veteran' => 'Veteran (100%)',
            'government_employee' => 'Government Employee (10%)',
            'promo' => 'Promotional Discount',
        ];

        $clearanceTypesForSelect = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->mapWithKeys(function ($type) {
                $code = $type->code ?? strtoupper(str_replace(' ', '_', $type->name));
                return [$code => $type->name];
            })
            ->toArray();

        $clearanceTypesDetails = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
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
                    'eligibility_criteria' => $type->eligibility_criteria ? json_decode($type->eligibility_criteria, true) : [],
                    'purpose_options' => $type->purpose_options ? explode(', ', $type->purpose_options) : [],
                ];
            });

        return Inertia::render('admin/Payments/Edit', [
            'payment' => $payment,
            'residents' => $residents,
            'households' => $households,
            'fees' => $fees,
            'discountTypes' => $discountTypes,
            'clearanceTypes' => $clearanceTypesForSelect,
            'clearanceTypesDetails' => $clearanceTypesDetails,
            'hasClearanceTypes' => $clearanceTypesDetails->count() > 0,
        ]);
    }

    /**
     * Update the specified payment in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        Log::info('PAYMENT_UPDATE: Starting payment update', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'user_id' => Auth::id(),
        ]);

        if ($payment->status === 'cancelled') {
            return back()->withErrors(['error' => 'Cannot update a cancelled payment.']);
        }

        $validated = $request->validate([
            'payer_type' => 'required|in:resident,household,business,other',
            'payer_id' => 'required',
            'payer_name' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'household_number' => 'nullable|string|max:50',
            'purok' => 'nullable|string|max:100',
            'payment_date' => 'required|date',
            'period_covered' => 'nullable|string|max:100',
            'payment_method' => 'required|in:cash,gcash,maya,bank,check,online',
            'reference_number' => 'nullable|string|max:100',
            'subtotal' => 'required|numeric|min:0',
            'surcharge' => 'required|numeric|min:0',
            'penalty' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'discount_type' => 'nullable|string|max:100',
            'total_amount' => 'required|numeric|min:0',
            'purpose' => 'required|string|max:500',
            'remarks' => 'nullable|string|max:1000',
            'is_cleared' => 'boolean',
            'validity_date' => 'nullable|date',
            'collection_type' => 'required|in:manual,system',
            'method_details' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            $oldValues = $payment->getOriginal();

            $payment->update([
                'payer_type' => $validated['payer_type'],
                'payer_id' => $validated['payer_id'],
                'payer_name' => $validated['payer_name'],
                'contact_number' => $validated['contact_number'],
                'address' => $validated['address'],
                'household_number' => $validated['household_number'],
                'purok' => $validated['purok'],
                'payment_date' => $validated['payment_date'],
                'period_covered' => $validated['period_covered'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'subtotal' => floatval($validated['subtotal']),
                'surcharge' => floatval($validated['surcharge']),
                'penalty' => floatval($validated['penalty']),
                'discount' => floatval($validated['discount']),
                'discount_type' => $validated['discount_type'] ?? null,
                'total_amount' => floatval($validated['total_amount']),
                'purpose' => $validated['purpose'],
                'remarks' => $validated['remarks'] ?? null,
                'is_cleared' => $validated['is_cleared'] ?? false,
                // REMOVED: 'certificate_type' => $certificateType,
                'validity_date' => $validated['validity_date'],
                'collection_type' => $validated['collection_type'],
                'method_details' => $validated['method_details'] ?? null,
            ]);

            Log::info('PAYMENT_UPDATE: Payment record updated', [
                'payment_id' => $payment->id,
                'changes' => array_diff_assoc($payment->getAttributes(), $oldValues),
            ]);

            if ($request->has('items')) {
                $oldItemsCount = $payment->items()->count();
                $payment->items()->delete();
                
                foreach ($request->input('items') as $item) {
                    $paymentItemData = [
                        'payment_id' => $payment->id,
                        'fee_id' => null,
                        'clearance_request_id' => null,
                        'fee_name' => $item['fee_name'],
                        'fee_code' => $item['fee_code'],
                        'description' => $item['description'],
                        'base_amount' => floatval($item['base_amount']),
                        'surcharge' => floatval($item['surcharge']),
                        'penalty' => floatval($item['penalty']),
                        'total_amount' => floatval($item['total_amount']),
                        'category' => $item['category'],
                        'period_covered' => $item['period_covered'],
                        'months_late' => $item['months_late'],
                    ];

                    if (($item['metadata']['is_clearance_fee'] ?? false) || ($item['item_type'] ?? 'fee') === 'clearance') {
                        $clearanceRequestId = $item['metadata']['clearance_request_id'] ?? null;
                        $metadata = [
                            'is_clearance_fee' => true,
                            'clearance_request_id' => $clearanceRequestId,
                        ];
                        
                        $paymentItemData['fee_metadata'] = json_encode($metadata);
                        $paymentItemData['clearance_request_id'] = $clearanceRequestId;
                        
                        if ($clearanceRequestId) {
                            $clearanceRequest = ClearanceRequest::find($clearanceRequestId);
                            if ($clearanceRequest) {
                                $clearanceRequest->update([
                                    'fee_amount' => $item['total_amount'],
                                    'payment_id' => $payment->id,
                                ]);
                            }
                        }
                    } 
                    elseif (!empty($item['fee_id']) && is_numeric($item['fee_id'])) {
                        $paymentItemData['fee_id'] = $item['fee_id'];
                        
                        $feeType = FeeType::find($item['fee_id']);
                        if ($feeType) {
                            $metadata = $item['metadata'] ?? [];
                            $metadata['original_amount'] = $feeType->base_amount;
                            $metadata['surcharge_rate'] = $feeType->surcharge_percentage;
                            $metadata['penalty_rate'] = $feeType->penalty_percentage;
                            $metadata['validity_days'] = $feeType->validity_days;
                            $metadata['frequency'] = $feeType->frequency;
                            
                            $paymentItemData['fee_metadata'] = json_encode($metadata);
                        }
                    }

                    PaymentItem::create($paymentItemData);
                }

                Log::info('PAYMENT_UPDATE: Payment items updated', [
                    'old_items_count' => $oldItemsCount,
                    'new_items_count' => count($request->input('items')),
                ]);
            }

            DB::commit();

            Log::info('PAYMENT_UPDATE: Payment update completed', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
            ]);

            return redirect()->route('payments.show', $payment->id)
                ->with('success', 'Payment updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('PAYMENT_UPDATE_ERROR: Payment update failed', [
                'error_message' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to update payment. Please try again. Error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Cancel the specified payment.
     */
    public function cancel(Payment $payment)
    {
        if ($payment->status === 'cancelled') {
            return back()->with('error', 'Payment is already cancelled.');
        }

        Log::warning('PAYMENT_CANCEL: Payment cancellation requested', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'user_id' => Auth::id(),
        ]);

        DB::beginTransaction();

        try {
            $clearanceItems = $payment->items()
                ->whereNotNull('clearance_request_id')
                ->get();
                
            foreach ($clearanceItems as $item) {
                $clearanceRequest = ClearanceRequest::find($item->clearance_request_id);
                if ($clearanceRequest && in_array($clearanceRequest->status, ['pending_payment', 'processing'])) {
                    $clearanceRequest->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => 'Payment cancelled: ' . $payment->or_number,
                        'payment_id' => null,
                    ]);
                }
            }

            $payment->update([
                'status' => 'cancelled',
                'remarks' => ($payment->remarks ? $payment->remarks . "\n\n" : '') . 
                            'Cancelled on ' . now()->format('Y-m-d H:i:s') . ' by ' . Auth::user()->name,
            ]);

            DB::commit();

            Log::warning('PAYMENT_CANCEL: Payment cancelled successfully', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
            ]);

            return redirect()->route('payments.show', $payment->id)
                ->with('success', 'Payment cancelled successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('PAYMENT_CANCEL_ERROR: Payment cancellation failed', [
                'error_message' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to cancel payment. Please try again.'
            ]);
        }
    }

    /**
     * Mark payment as refunded.
     */
    public function refund(Request $request, Payment $payment)
    {
        $request->validate([
            'refund_reason' => 'required|string|max:500',
        ]);

        Log::warning('PAYMENT_REFUND: Payment refund requested', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'user_id' => Auth::id(),
            'refund_reason' => $request->refund_reason,
        ]);

        DB::beginTransaction();

        try {
            $clearanceItems = $payment->items()
                ->whereNotNull('clearance_request_id')
                ->get();
                
            foreach ($clearanceItems as $item) {
                $clearanceRequest = ClearanceRequest::find($item->clearance_request_id);
                if ($clearanceRequest) {
                    $clearanceRequest->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => 'Payment refunded: ' . $payment->or_number . ' - ' . $request->refund_reason,
                        'payment_id' => null,
                    ]);
                }
            }

            $payment->update([
                'status' => 'refunded',
                'remarks' => ($payment->remarks ? $payment->remarks . "\n\n" : '') . 
                            'Refunded on ' . now()->format('Y-m-d H:i:s') . 
                            ' by ' . Auth::user()->name . 
                            '. Reason: ' . $request->refund_reason,
            ]);

            DB::commit();

            Log::warning('PAYMENT_REFUND: Payment marked as refunded', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
            ]);

            return redirect()->route('payments.show', $payment->id)
                ->with('success', 'Payment marked as refunded.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('PAYMENT_REFUND_ERROR: Payment refund failed', [
                'error_message' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to refund payment. Please try again.'
            ]);
        }
    }

    /**
     * Print receipt for the specified payment.
     */
    public function printReceipt(Payment $payment)
    {
        $payment->load([
            'items',
            'recorder',
            'items.clearanceRequest.clearanceType',
        ]);

        if ($payment->payer_type === 'resident') {
            $payment->load('resident.household');
        } elseif ($payment->payer_type === 'household') {
            $payment->load('household');
        }

        return Inertia::render('admin/Payments/Receipt', [
            'payment' => $payment,
            'barangay' => [
                'name' => config('app.barangay_name', 'Your Barangay Name'),
                'address' => config('app.barangay_address', 'Your Barangay Address'),
                'contact' => config('app.barangay_contact', 'Your Barangay Contact'),
            ],
            'officer' => [
                'name' => auth()->user()->name ?? 'Barangay Treasurer',
                'position' => 'Barangay Treasurer',
            ],
            'isClearancePayment' => $payment->items()->whereNotNull('clearance_request_id')->exists(),
        ]);
    }

    /**
     * Export payments to PDF.
     */
    public function exportPdf(Request $request)
    {
        $query = Payment::with(['items', 'recorder'])
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $payments = $query->get();

        $pdf = PDF::loadView('exports.payments', [
            'payments' => $payments,
            'filters' => $request->all(),
            'date_range' => $request->filled('date_from') && $request->filled('date_to') 
                ? $request->input('date_from') . ' to ' . $request->input('date_to')
                : 'All Time',
        ]);

        return $pdf->download('payments-report-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Get payment statistics.
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth());
        $dateTo = $request->input('date_to', now()->endOfMonth());

        $stats = [
            'total_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->count(),
            'total_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->sum('total_amount'),
            'by_method' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('payment_method')
                ->get(),
            'by_category' => PaymentItem::whereHas('payment', function ($query) use ($dateFrom, $dateTo) {
                    $query->whereBetween('payment_date', [$dateFrom, $dateTo]);
                })
                ->select('category', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('category')
                ->get(),
            'daily_trend' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->select(DB::raw('DATE(payment_date) as date'), DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy(DB::raw('DATE(payment_date)'))
                ->orderBy('date')
                ->get(),
            'clearance_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereHas('items', function ($q) {
                    $q->whereNotNull('clearance_request_id');
                })
                ->count(),
            'clearance_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereHas('items', function ($q) {
                    $q->whereNotNull('clearance_request_id');
                })
                ->sum('total_amount'),
            'by_clearance_type' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereHas('items.clearanceRequest', function ($q) {
                    $q->whereNotNull('clearance_type_id');
                })
                ->with(['items.clearanceRequest.clearanceType'])
                ->get()
                ->flatMap(function ($payment) {
                    return $payment->items->map(function ($item) use ($payment) {
                        if ($item->clearanceRequest) {
                            return [
                                'clearance_type_id' => $item->clearanceRequest->clearance_type_id,
                                'clearance_type_name' => $item->clearanceRequest->clearanceType->name ?? 'Unknown',
                                'count' => 1,
                                'total' => $item->total_amount,
                            ];
                        }
                        return null;
                    })->filter();
                })
                ->groupBy('clearance_type_id')
                ->map(function ($items, $typeId) {
                    $first = $items->first();
                    return [
                        'clearance_type_id' => $typeId,
                        'clearance_type_name' => $first['clearance_type_name'],
                        'count' => $items->count(),
                        'total' => $items->sum('total'),
                    ];
                })
                ->values(),
        ];

        return response()->json($stats);
    }

    /**
     * Create payment for clearance request.
     */
    public function createForClearance(Request $request, ClearanceRequest $clearanceRequest)
    {
        if (!in_array($clearanceRequest->status, ['pending_payment', 'pending', 'processing', 'approved'])) {
            return redirect()->route('clearance-requests.show', $clearanceRequest->id)
                ->with('error', 'Clearance request is not in a payable state.');
        }

        $hasPaymentItem = DB::table('payment_items')
            ->where('clearance_request_id', $clearanceRequest->id)
            ->exists();
            
        if ($hasPaymentItem) {
            return redirect()->route('clearance-requests.show', $clearanceRequest->id)
                ->with('info', 'Payment already exists for this clearance request.');
        }

        return redirect()->route('payments.create', [
            'clearance_request_id' => $clearanceRequest->id,
            'clearance_type_id' => $clearanceRequest->clearance_type_id,
            'payer_type' => 'resident',
            'payer_id' => $clearanceRequest->resident_id,
            'payer_name' => $clearanceRequest->resident->full_name,
            'contact_number' => $clearanceRequest->resident->contact_number,
            'address' => $clearanceRequest->resident->address,
            'household_number' => $clearanceRequest->resident->household->household_number ?? null,
            'purok' => $clearanceRequest->resident->household->purok->name ?? null,
            'purpose' => $clearanceRequest->clearanceType->name ?? 'Clearance Fee',
        ]);
    }

    /**
     * Get clearance types for dropdown.
     */
    public function getClearanceTypes()
    {
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code ?? strtoupper(str_replace(' ', '_', $type->name)),
                    'description' => $type->description,
                    'fee' => floatval($type->fee),
                    'formatted_fee' => '₱' . number_format($type->fee, 2),
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                ];
            });

        return response()->json($clearanceTypes);
    }
}