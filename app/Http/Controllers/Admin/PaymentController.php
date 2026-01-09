<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\PaymentItem;
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
        $query = Payment::with(['items', 'recorder', 'clearanceType'])
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

        // Add clearance type filter (using ID)
        if ($request->filled('clearance_type_id')) {
            $query->where('clearance_type_id', $request->input('clearance_type_id'));
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

        // Calculate statistics
        $stats = [
            'total' => Payment::count(),
            'today' => Payment::whereDate('payment_date', today())->count(),
            'monthly' => Payment::whereMonth('payment_date', now()->month)->count(),
            'total_amount' => Payment::sum('total_amount'),
            'today_amount' => Payment::whereDate('payment_date', today())->sum('total_amount'),
            'monthly_amount' => Payment::whereMonth('payment_date', now()->month)->sum('total_amount'),
            // Clearance stats
            'clearance_payments' => Payment::whereNotNull('clearance_type_id')->count(),
            'clearance_amount' => Payment::whereNotNull('clearance_type_id')->sum('total_amount'),
        ];

        return Inertia::render('admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to', 'payer_type', 'clearance_type_id']),
            'clearanceTypes' => $clearanceTypes,
            'stats' => $stats,
            'hasClearanceTypes' => $clearanceTypes->count() > 0,
        ]);
    }

    /**
     * Show the form for creating a new payment.
     */
    public function create(Request $request)
    {
        Log::info('PAYMENT_CREATE: Starting payment creation', [
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name ?? 'Unknown',
            'request_params' => $request->all(),
        ]);

        // Get pre-filled data from query parameters
        $preFilledData = $request->only([
            'fee_id', 'fee_type_id', 'payer_type', 'payer_id', 'payer_name', 
            'contact_number', 'address', 'purok', 'household_number',
            'clearance_request_id', 'clearance_type_id', 'purpose'
        ]);

        Log::debug('PAYMENT_CREATE: Pre-filled data', $preFilledData);

        // Get residents with all outstanding fees
        Log::debug('PAYMENT_CREATE: Fetching residents with fees');
        $residents = Resident::with(['household' => function ($query) {
                $query->select('id', 'household_number', 'purok_id');
            }, 'household.purok' => function ($query) {
                $query->select('id', 'name');
            }])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'address', 'household_id'])
            ->map(function ($resident) {
                // Get fees directly linked to resident (payer_type = 'resident')
                $residentFees = Fee::with(['feeType'])
                    ->where('payer_type', 'resident')
                    ->where('resident_id', $resident->id)
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();
                
                // Get fees linked to resident's household (payer_type = 'household')
                $householdFees = collect();
                if ($resident->household_id) {
                    $householdFees = Fee::with(['feeType'])
                        ->where('payer_type', 'household')
                        ->where('household_id', $resident->household_id)
                        ->where('balance', '>', 0)
                        ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                        ->get();
                }
                
                // Combine both fee collections
                $allFees = $residentFees->merge($householdFees);
                
                $totalBalance = $allFees->sum('balance');
                $feeCount = $allFees->count();
                
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'contact_number' => $resident->contact_number,
                    'address' => $resident->address,
                    'household_number' => $resident->household ? $resident->household->household_number : null,
                    'purok' => $resident->household && $resident->household->purok 
                        ? $resident->household->purok->name 
                        : null,
                    'household_id' => $resident->household_id,
                    'has_outstanding_fees' => $feeCount > 0,
                    'outstanding_fee_count' => $feeCount,
                    'total_outstanding_balance' => number_format($totalBalance, 2),
                    'outstanding_fees' => $allFees->map(function ($fee) {
                        return [
                            'id' => $fee->id,
                            'fee_code' => $fee->fee_code,
                            'fee_type_id' => $fee->fee_type_id,
                            'fee_type_name' => $fee->feeType->name ?? 'Unknown',
                            'fee_type_category' => $fee->feeType->category ?? 'other',
                            'payer_type' => $fee->payer_type,
                            'payer_id' => $fee->payer_type === 'resident' ? $fee->resident_id : $fee->household_id,
                            'base_amount' => number_format($fee->base_amount, 2),
                            'surcharge_amount' => number_format($fee->surcharge_amount, 2),
                            'penalty_amount' => number_format($fee->penalty_amount, 2),
                            'discount_amount' => number_format($fee->discount_amount, 2),
                            'total_amount' => number_format($fee->total_amount, 2),
                            'balance' => number_format($fee->balance, 2),
                            'status' => $fee->status,
                            'issue_date' => $fee->issue_date->format('Y-m-d'),
                            'due_date' => $fee->due_date->format('Y-m-d'),
                            'purpose' => $fee->purpose,
                            'remarks' => $fee->remarks,
                            'billing_period' => $fee->billing_period,
                            'period_start' => $fee->period_start ? $fee->period_start->format('Y-m-d') : null,
                            'period_end' => $fee->period_end ? $fee->period_end->format('Y-m-d') : null,
                        ];
                    }),
                ];
            });

        // Get households with outstanding fees
        Log::debug('PAYMENT_CREATE: Fetching households with fees');
        $households = Household::with(['purok' => function ($query) {
                $query->select('id', 'name');
            }])
            ->withCount(['householdMembers as members_count'])
            ->orderBy('head_of_family', 'asc')
            ->get(['id', 'head_of_family', 'contact_number', 'address', 'household_number', 'purok_id'])
            ->map(function ($household) {
                // Get household fees (payer_type = 'household')
                $householdFees = Fee::with(['feeType'])
                    ->where('payer_type', 'household')
                    ->where('household_id', $household->id)
                    ->where('balance', '>', 0)
                    ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                    ->get();
                
                $totalBalance = $householdFees->sum('balance');
                $feeCount = $householdFees->count();
                
                return [
                    'id' => $household->id,
                    'head_name' => $household->head_of_family,
                    'contact_number' => $household->contact_number,
                    'address' => $household->address,
                    'household_number' => $household->household_number,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'purok_id' => $household->purok_id,
                    'family_members' => $household->members_count,
                    'has_outstanding_fees' => $feeCount > 0,
                    'outstanding_fee_count' => $feeCount,
                    'total_outstanding_balance' => number_format($totalBalance, 2),
                    'outstanding_fees' => $householdFees->map(function ($fee) {
                        return [
                            'id' => $fee->id,
                            'fee_code' => $fee->fee_code,
                            'fee_type_id' => $fee->fee_type_id,
                            'fee_type_name' => $fee->feeType->name ?? 'Unknown',
                            'fee_type_category' => $fee->feeType->category ?? 'other',
                            'payer_type' => $fee->payer_type,
                            'payer_id' => $fee->household_id,
                            'base_amount' => number_format($fee->base_amount, 2),
                            'surcharge_amount' => number_format($fee->surcharge_amount, 2),
                            'penalty_amount' => number_format($fee->penalty_amount, 2),
                            'discount_amount' => number_format($fee->discount_amount, 2),
                            'total_amount' => number_format($fee->total_amount, 2),
                            'balance' => number_format($fee->balance, 2),
                            'status' => $fee->status,
                            'issue_date' => $fee->issue_date->format('Y-m-d'),
                            'due_date' => $fee->due_date->format('Y-m-d'),
                            'purpose' => $fee->purpose,
                            'remarks' => $fee->remarks,
                            'billing_period' => $fee->billing_period,
                            'period_start' => $fee->period_start ? $fee->period_start->format('Y-m-d') : null,
                            'period_end' => $fee->period_end ? $fee->period_end->format('Y-m-d') : null,
                        ];
                    }),
                ];
            });

        // Get pending clearance requests
        Log::debug('PAYMENT_CREATE: Fetching pending clearance requests');
        $clearanceRequests = ClearanceRequest::with([
                'resident.household.purok', 
                'clearanceType',
                'payment'
            ])
            ->whereIn('status', ['pending_payment', 'pending', 'processing', 'approved'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->filter(function ($request) {
                return !$request->payment;
            })
            ->map(function ($request) {
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
                    ] : null,
                    'resident' => $request->resident ? [
                        'id' => $request->resident->id,
                        'name' => $request->resident->full_name,
                        'contact_number' => $request->resident->contact_number,
                        'address' => $request->resident->address,
                        'household_number' => $request->resident->household->household_number ?? null,
                        'purok' => $request->resident->household->purok->name ?? null,
                        'household_id' => $request->resident->household_id ?? null,
                    ] : null,
                    'can_be_paid' => in_array($request->status, ['pending_payment', 'processing', 'approved']),
                    'already_paid' => !is_null($request->payment),
                ];
            })
            ->values();

        // Get fee types
        Log::debug('PAYMENT_CREATE: Fetching fee types');
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
                    'surcharge_fixed' => floatval($feeType->surcharge_fixed ?? 0),
                    'has_penalty' => (bool) $feeType->has_penalty,
                    'penalty_rate' => floatval($feeType->penalty_percentage ?? 0),
                    'penalty_fixed' => floatval($feeType->penalty_fixed ?? 0),
                    'validity_days' => $feeType->validity_days,
                    'applicable_to' => $feeType->applicable_to ? [$feeType->applicable_to] : [],
                ];
            });

        // Define discount types
        $discountTypes = [
            'senior_citizen' => 'Senior Citizen (20%)',
            'pwd' => 'Person with Disability (20%)',
            'solo_parent' => 'Solo Parent (15%)',
            'indigent' => 'Indigent (50%)',
            'veteran' => 'Veteran (100%)',
            'government_employee' => 'Government Employee (10%)',
            'promo' => 'Promotional Discount',
        ];

        // Generate OR number in frontend format
        function generateORNumber(): string {
            $date = new \DateTime();
            $year = $date->format('Y');
            $month = $date->format('m');
            $day = $date->format('d');
            $random = str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
            return "BAR-{$year}{$month}{$day}-{$random}";
        }

        $defaultOrNumber = generateORNumber();

        // If fee_id is provided in pre-filled data, get the fee details
        $selectedFeeDetails = null;
        if (!empty($preFilledData['fee_id'])) {
            $fee = Fee::with(['feeType', 'resident', 'household'])
                ->find($preFilledData['fee_id']);
            
            if ($fee) {
                $selectedFeeDetails = [
                    'id' => $fee->id,
                    'fee_code' => $fee->fee_code,
                    'fee_type_id' => $fee->fee_type_id,
                    'fee_type_name' => $fee->feeType->name ?? 'Unknown',
                    'fee_type_category' => $fee->feeType->category ?? 'other',
                    'payer_name' => $fee->payer_name,
                    'payer_type' => $fee->payer_type,
                    'payer_id' => $fee->payer_type === 'resident' ? $fee->resident_id : $fee->household_id,
                    'contact_number' => $fee->contact_number,
                    'address' => $fee->address,
                    'purok' => $fee->purok,
                    'base_amount' => floatval($fee->base_amount),
                    'surcharge_amount' => floatval($fee->surcharge_amount),
                    'penalty_amount' => floatval($fee->penalty_amount),
                    'discount_amount' => floatval($fee->discount_amount),
                    'total_amount' => floatval($fee->total_amount),
                    'balance' => floatval($fee->balance),
                    'status' => $fee->status,
                    'issue_date' => $fee->issue_date->format('Y-m-d'),
                    'due_date' => $fee->due_date->format('Y-m-d'),
                    'purpose' => $fee->purpose,
                    'remarks' => $fee->remarks,
                ];
            }
        }

        // Get clearance types
        Log::debug('PAYMENT_CREATE: Fetching clearance types from database');
        
        // Get clearance types as array for dropdown (key-value pairs)
        $clearanceTypesForSelect = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->mapWithKeys(function ($type) {
                $code = $type->code ?? strtoupper(str_replace(' ', '_', $type->name));
                return [$code => $type->name];
            })
            ->toArray();

        // Get clearance types as array with full details
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

        // Handle clearance request pre-fill
        $clearanceRequest = null;
        $selectedClearanceTypeId = $preFilledData['clearance_type_id'] ?? null;
        
        if (!empty($preFilledData['clearance_request_id'])) {
            Log::info('PAYMENT_CREATE: Processing clearance request pre-fill', [
                'clearance_request_id' => $preFilledData['clearance_request_id']
            ]);
            
            $clearanceRequest = ClearanceRequest::with([
                    'resident.household.purok',
                    'clearanceType', 
                    'payment'
                ])
                ->find($preFilledData['clearance_request_id']);
                
            if ($clearanceRequest) {
                // Check if clearance request is payable
                $payableStatuses = ['approved', 'pending_payment', 'processing'];
                
                if (!in_array($clearanceRequest->status, $payableStatuses)) {
                    return redirect()->back()->withErrors([
                        'error' => 'Clearance request is not in a payable state. Current status: ' . 
                                   ($clearanceRequest->status_display ?? $clearanceRequest->status)
                    ]);
                }
                
                // Check if already paid
                if ($clearanceRequest->payment) {
                    return redirect()->back()->withErrors([
                        'error' => 'This clearance request already has a payment: OR#' . $clearanceRequest->payment->or_number
                    ]);
                }
                
                // Auto-populate payer information
                $preFilledData['payer_type'] = 'resident';
                $preFilledData['payer_id'] = $clearanceRequest->resident_id;
                $preFilledData['payer_name'] = $clearanceRequest->resident->full_name ?? 'Unknown';
                $preFilledData['contact_number'] = $clearanceRequest->resident->contact_number ?? null;
                $preFilledData['address'] = $clearanceRequest->resident->address ?? null;
                
                if ($clearanceRequest->resident->household) {
                    $preFilledData['household_number'] = $clearanceRequest->resident->household->household_number ?? null;
                    $preFilledData['purok'] = $clearanceRequest->resident->household->purok->name ?? null;
                }
                
                // Set clearance type ID from clearance request
                if ($clearanceRequest->clearance_type_id && !$selectedClearanceTypeId) {
                    $selectedClearanceTypeId = $clearanceRequest->clearance_type_id;
                    $preFilledData['clearance_type_id'] = $selectedClearanceTypeId;
                }
                
                // Set purpose from clearance type
                if (!isset($preFilledData['purpose']) || empty($preFilledData['purpose'])) {
                    $preFilledData['purpose'] = $clearanceRequest->clearanceType->name ?? 'Clearance Payment';
                }
                
                // Also set clearance_code
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

        Log::info('PAYMENT_CREATE: Rendering payment creation view', [
            'data_summary' => [
                'residents_count' => $residents->count(),
                'households_count' => $households->count(),
                'clearance_requests_count' => $clearanceRequests->count(),
                'fee_types_count' => $fees->count(),
                'has_clearance_request' => !is_null($clearanceRequest),
                'clearance_types_count' => $clearanceTypesDetails->count(),
                'selected_clearance_type_id' => $selectedClearanceTypeId,
            ],
        ]);

        return Inertia::render('admin/Payments/Create', [
            'residents' => $residents,
            'households' => $households,
            'clearance_requests' => $clearanceRequests,
            'fees' => $fees,
            'discountTypes' => $discountTypes,
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
                    'requirements' => $clearanceRequest->clearanceType->requirements,
                ] : null,
                
                'resident' => $clearanceRequest->resident ? [
                    'id' => $clearanceRequest->resident->id,
                    'name' => $clearanceRequest->resident->full_name,
                    'contact_number' => $clearanceRequest->resident->contact_number,
                    'address' => $clearanceRequest->resident->address,
                    'household_number' => $clearanceRequest->resident->household->household_number ?? null,
                    'purok' => $clearanceRequest->resident->household->purok->name ?? null,
                    'birthdate' => $clearanceRequest->resident->birthdate?->format('Y-m-d'),
                    'age' => $clearanceRequest->resident->age ?? null,
                    'gender' => $clearanceRequest->resident->gender,
                    'household_id' => $clearanceRequest->resident->household_id ?? null,
                ] : null,
                
                'can_be_paid' => in_array($clearanceRequest->status, ['approved', 'pending_payment', 'processing']),
                'already_paid' => !is_null($clearanceRequest->payment),
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
        ]);
    }

    /**
     * Generate OR number in frontend format.
     */
    private function generateOrNumber()
    {
        $date = now()->format('Ymd');
        
        // Find the highest sequence number for today
        $latestPayment = Payment::where('or_number', 'like', "BAR-{$date}-%")
            ->orderByRaw('CAST(SUBSTRING(or_number, -3) AS UNSIGNED) DESC')
            ->first();

        if ($latestPayment) {
            $lastNumber = (int) substr($latestPayment->or_number, -3);
            $nextNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '001';
        }

        return "BAR-{$date}-{$nextNumber}";
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

        // Get outstanding fees based on payer type
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

        // Calculate totals
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
     public function store(Request $request)
{
    Log::info('PAYMENT_STORE_REQUEST: Payment creation started', [
        'user_id' => Auth::id(),
        'user_name' => Auth::user()->name ?? 'Unknown',
        'items_count' => count($request->input('items', [])),
        'clearance_request_id' => $request->input('clearance_request_id'),
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
        'discount_type' => 'nullable|string|max:100',
        'total_amount' => 'required|numeric|min:0',
        'purpose' => 'required|string|max:500',
        'remarks' => 'nullable|string|max:1000',
        'is_cleared' => 'boolean',
        'clearance_type_id' => 'nullable|exists:clearance_types,id',
        'clearance_code' => 'nullable|string|max:100',
        'validity_date' => 'nullable|date',
        'collection_type' => 'required|in:manual,system',
        'method_details' => 'nullable|array',
        'items' => 'required|array|min:1',
        'clearance_request_id' => 'nullable|exists:clearance_requests,id',
    ]);

    // Get clearance type details if provided
    $clearanceType = null;
    $clearanceCode = $validated['clearance_code'] ?? null;
    if (!empty($validated['clearance_type_id'])) {
        $clearanceType = ClearanceType::find($validated['clearance_type_id']);
        if ($clearanceType && !$clearanceCode) {
            $clearanceCode = $clearanceType->code ?? strtoupper(str_replace(' ', '_', $clearanceType->name));
        }
    }

    // Generate OR number if not provided or invalid
    $orNumber = $validated['or_number'] ?? $this->generateOrNumber();
    
    // Check if OR number already exists
    if (Payment::where('or_number', $orNumber)->exists()) {
        $orNumber = $this->generateOrNumber();
        Log::warning('PAYMENT_STORE: OR number conflict, generated new one', [
            'new_or_number' => $orNumber,
        ]);
    }
    
    $validated['or_number'] = $orNumber;

    // Validate each item
    $validatedItems = [];
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
                'total_amount' => 'required|numeric|min:0',
                'category' => 'required|string|max:50',
                'period_covered' => 'nullable|string|max:100',
                'months_late' => 'nullable|integer|min:0',
                'metadata' => 'nullable|array',
            ])->validate();

            // Validate clearance request if provided in metadata
            if (!empty($itemData['metadata']['clearance_request_id'])) {
                $clearanceRequest = ClearanceRequest::with(['payment', 'resident'])
                    ->find($itemData['metadata']['clearance_request_id']);
                
                if (!$clearanceRequest) {
                    throw new \Exception('Clearance request not found');
                }
                
                // Verify clearance request is payable
                $payableStatuses = ['pending_payment', 'processing', 'approved'];
                if (!in_array($clearanceRequest->status, $payableStatuses)) {
                    throw new \Exception('Clearance request is not payable. Current status: ' . 
                               ($clearanceRequest->status_display ?? $clearanceRequest->status));
                }
                
                // Check if already paid
                if ($clearanceRequest->payment) {
                    throw new \Exception('Clearance request already has a payment: OR#' . $clearanceRequest->payment->or_number);
                }
                
                // Verify payer matches clearance request resident
                if ($validated['payer_type'] === 'resident' && 
                    $validated['payer_id'] != $clearanceRequest->resident_id) {
                    throw new \Exception('Payer does not match clearance request resident');
                }
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
                'total_amount' => floatval($itemData['total_amount']),
                'category' => $itemData['category'],
                'period_covered' => $itemData['period_covered'] ?? null,
                'months_late' => $itemData['months_late'] ?? 0,
                'metadata' => $itemData['metadata'] ?? null,
            ];
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('PAYMENT_STORE_ITEM_VALIDATION_ERROR', [
                'item_index' => $index,
                'errors' => $e->errors(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('PAYMENT_STORE_ITEM_ERROR', [
                'item_index' => $index,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors([
                'error' => 'Item ' . ($index + 1) . ': ' . $e->getMessage()
            ])->withInput();
        }
    }

    $validated['items'] = $validatedItems;

    DB::beginTransaction();

    try {
        Log::info('PAYMENT_STORE: Creating payment record', [
            'or_number' => $validated['or_number'],
            'payer_name' => $validated['payer_name'],
            'payer_type' => $validated['payer_type'],
            'total_amount' => $validated['total_amount'],
            'items_count' => count($validated['items']),
            'clearance_type_id' => $validated['clearance_type_id'] ?? null,
            'clearance_code' => $clearanceCode,
            'clearance_request_id' => $validated['clearance_request_id'] ?? null,
        ]);

        // Create payment
        $payment = Payment::create([
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
            'discount_type' => $validated['discount_type'] ?? null,
            'total_amount' => floatval($validated['total_amount']),
            'purpose' => $validated['purpose'],
            'remarks' => $validated['remarks'] ?? null,
            'is_cleared' => $validated['is_cleared'] ?? false,
            'clearance_type_id' => $validated['clearance_type_id'] ?? null,
            'clearance_code' => $clearanceCode,
            'validity_date' => $validated['validity_date'] ?? null,
            'collection_type' => $validated['collection_type'] ?? 'manual',
            'method_details' => $validated['method_details'] ?? null,
            'recorded_by' => Auth::id(),
            'status' => 'completed',
            'clearance_request_id' => $validated['clearance_request_id'] ?? null,
        ]);

        Log::info('PAYMENT_STORE: Payment record created', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'clearance_request_id' => $payment->clearance_request_id,
        ]);

        // Get outstanding fees for this payer based on payer_type
        $outstandingFees = Fee::where('payer_type', $validated['payer_type'])
            ->where($validated['payer_type'] . '_id', $validated['payer_id'])
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
            ->get()
            ->keyBy('id');

        // Create payment items
        $itemDetails = [];
        $feeIdsPaid = [];
        $clearanceRequestsPaid = [];
        
        foreach ($validated['items'] as $index => $item) {
            $paymentItemData = [
                'payment_id' => $payment->id,
                'fee_id' => null,
                'clearance_request_id' => null,
                'original_fee_id' => null,
                'fee_name' => $item['fee_name'],
                'fee_code' => $item['fee_code'],
                'description' => $item['description'] ?? null,
                'base_amount' => $item['base_amount'],
                'surcharge' => $item['surcharge'],
                'penalty' => $item['penalty'],
                'total_amount' => $item['total_amount'],
                'category' => $item['category'],
                'period_covered' => $item['period_covered'] ?? null,
                'months_late' => $item['months_late'] ?? 0,
                'fee_metadata' => json_encode($item['metadata'] ?? []),
            ];

            // Check if it's a clearance fee
            if (($item['metadata']['is_clearance_fee'] ?? false) || $item['item_type'] === 'clearance') {
                $clearanceRequestId = $item['metadata']['clearance_request_id'] ?? $validated['clearance_request_id'] ?? null;
                
                if ($clearanceRequestId) {
                    $clearanceRequest = ClearanceRequest::find($clearanceRequestId);
                    
                    if ($clearanceRequest) {
                        // Mark clearance request as paid
                        $clearanceRequest->update([
                            'status' => 'paid', // CHANGED: Set to 'paid' instead of 'processing'
                            'payment_id' => $payment->id,
                            'fee_amount' => $item['total_amount'],
                            'payment_date' => $validated['payment_date'],
                            'payment_method' => $validated['payment_method'],
                            'or_number' => $payment->or_number,
                        ]);
                        
                        $clearanceRequestsPaid[] = $clearanceRequestId;
                        
                        // Store clearance_request_id in the payment item
                        $paymentItemData['clearance_request_id'] = $clearanceRequestId;
                        
                        // Update metadata with clearance request info
                        $metadata = $item['metadata'] ?? [];
                        $metadata['is_clearance_fee'] = true;
                        $metadata['clearance_request_id'] = $clearanceRequestId;
                        $metadata['clearance_type_id'] = $clearanceRequest->clearance_type_id ?? $validated['clearance_type_id'] ?? null;
                        $metadata['clearance_code'] = $clearanceCode;
                        
                        $paymentItemData['fee_metadata'] = json_encode($metadata);
                    }
                }
            } 
            // Check if it's an outstanding fee payment
            elseif (!empty($item['outstanding_fee_id']) || ($item['metadata']['is_outstanding_fee'] ?? false)) {
                $outstandingFeeId = $item['outstanding_fee_id'] ?? $item['fee_id'];
                
                if (isset($outstandingFees[$outstandingFeeId])) {
                    $fee = $outstandingFees[$outstandingFeeId];
                    
                    // Calculate new balance
                    $newBalance = max(0, $fee->balance - $item['total_amount']);
                    $newStatus = $newBalance <= 0 ? 'paid' : 'partially_paid'; // CHANGED: Use 'paid' status
                    
                    // Update the fee's payment status
                    $fee->update([
                        'balance' => $newBalance,
                        'amount_paid' => $fee->amount_paid + $item['total_amount'],
                        'status' => $newStatus, // CHANGED: Set to 'paid' if fully paid
                        'last_payment_date' => now(),
                        'last_payment_or' => $payment->or_number,
                    ]);
                    
                    $paymentItemData['original_fee_id'] = $fee->id;
                    $paymentItemData['fee_id'] = $fee->id;
                    $feeIdsPaid[] = $fee->id;
                    
                    // Update metadata
                    $metadata = $item['metadata'] ?? [];
                    if ($fee->feeType) {
                        $metadata['original_amount'] = $fee->feeType->base_amount;
                        $metadata['surcharge_rate'] = $fee->feeType->surcharge_percentage;
                        $metadata['penalty_rate'] = $fee->feeType->penalty_percentage;
                        $metadata['validity_days'] = $fee->feeType->validity_days;
                        $metadata['frequency'] = $fee->feeType->frequency;
                    }
                    $metadata['is_outstanding_fee'] = true;
                    $metadata['original_fee_id'] = $fee->id;
                    
                    $paymentItemData['fee_metadata'] = json_encode($metadata);
                }
            }
            // Regular fee type payment (new fee) - check if fee_id is numeric
            elseif (!empty($item['fee_id']) && is_numeric($item['fee_id'])) {
                // This is for new fees, not existing ones
                // Create a new fee record if it's a new fee payment
                if (!isset($outstandingFees[$item['fee_id']])) {
                    $feeType = FeeType::find($item['fee_id']);
                    if ($feeType) {
                        // Create a new fee record
                        $newFee = Fee::create([
                            'fee_code' => $item['fee_code'] ?? $feeType->code,
                            'fee_type_id' => $feeType->id,
                            'payer_type' => $validated['payer_type'],
                            'resident_id' => $validated['payer_type'] === 'resident' ? $validated['payer_id'] : null,
                            'household_id' => $validated['payer_type'] === 'household' ? $validated['payer_id'] : null,
                            'payer_name' => $validated['payer_name'],
                            'contact_number' => $validated['contact_number'] ?? null,
                            'address' => $validated['address'] ?? null,
                            'purok' => $validated['purok'] ?? null,
                            'base_amount' => $item['base_amount'],
                            'surcharge_amount' => $item['surcharge'],
                            'penalty_amount' => $item['penalty'],
                            'discount_amount' => 0,
                            'total_amount' => $item['total_amount'],
                            'amount_paid' => $item['total_amount'], // Fully paid
                            'balance' => 0, // No balance since it's paid immediately
                            'status' => 'paid', // CHANGED: Set to 'paid' immediately
                            'issue_date' => now(),
                            'due_date' => now(),
                            'purpose' => $validated['purpose'] ?? $feeType->description,
                            'remarks' => 'Paid upon creation: ' . $payment->or_number,
                            'recorded_by' => Auth::id(),
                        ]);
                        
                        $paymentItemData['fee_id'] = $newFee->id;
                        
                        $metadata = $item['metadata'] ?? [];
                        $metadata['original_amount'] = $feeType->base_amount;
                        $metadata['surcharge_rate'] = $feeType->surcharge_percentage;
                        $metadata['penalty_rate'] = $feeType->penalty_percentage;
                        $metadata['validity_days'] = $feeType->validity_days;
                        $metadata['frequency'] = $feeType->frequency;
                        $metadata['is_new_fee'] = true;
                        
                        $paymentItemData['fee_metadata'] = json_encode($metadata);
                    }
                }
            }

            $paymentItem = PaymentItem::create($paymentItemData);

            $itemDetails[] = [
                'item_id' => $paymentItem->id,
                'fee_name' => $item['fee_name'],
                'total_amount' => $item['total_amount'],
                'original_fee_id' => $paymentItemData['original_fee_id'] ?? null,
                'fee_id' => $paymentItemData['fee_id'] ?? null,
                'clearance_request_id' => $paymentItemData['clearance_request_id'] ?? null,
                'is_clearance_fee' => $item['metadata']['is_clearance_fee'] ?? false,
            ];
        }

        Log::info('PAYMENT_STORE: Payment items created', [
            'items_count' => count($itemDetails),
            'items_linked_to_fees' => count(array_filter($itemDetails, function($item) {
                return !empty($item['original_fee_id']);
            })),
            'clearance_items' => count(array_filter($itemDetails, function($item) {
                return $item['is_clearance_fee'];
            })),
            'clearance_requests_paid' => $clearanceRequestsPaid,
            'fees_paid' => $feeIdsPaid,
        ]);

        DB::commit();

        Log::info('PAYMENT_STORE: Payment transaction completed', [
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'total_amount' => $payment->total_amount,
            'clearance_requests' => $clearanceRequestsPaid,
            'fees_paid' => $feeIdsPaid,
            'payment_clearance_request_id' => $payment->clearance_request_id,
        ]);

        return redirect()->route('payments.show', $payment->id)
            ->with('success', 'Payment recorded successfully! Receipt: ' . $payment->or_number);

    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('PAYMENT_STORE_ERROR: Payment creation failed', [
            'error_message' => $e->getMessage(),
            'error_trace' => $e->getTraceAsString(),
            'or_number' => $validated['or_number'] ?? 'N/A',
            'payer_name' => $validated['payer_name'] ?? 'N/A',
        ]);
        
        return back()->withErrors([
            'error' => 'Failed to record payment. Please try again. Error: ' . $e->getMessage()
        ])->withInput();
    }
}

private function updateFeeStatusOnPaymentChange(Payment $payment, $newPaymentStatus)
{
    // Update related fees
    foreach ($payment->items as $item) {
        if ($item->fee_id) {
            $fee = Fee::find($item->fee_id);
            if ($fee) {
                if ($newPaymentStatus === 'cancelled' || $newPaymentStatus === 'refunded') {
                    // Recalculate fee balance by adding back the paid amount
                    $newBalance = $fee->balance + $item->total_amount;
                    $fee->update([
                        'balance' => $newBalance,
                        'amount_paid' => max(0, $fee->amount_paid - $item->total_amount),
                        'status' => $newBalance > 0 ? 'pending' : 'pending',
                        'last_payment_date' => null,
                        'last_payment_or' => null,
                    ]);
                }
            }
        }
        
        // Update clearance request status
        if ($item->clearance_request_id) {
            $clearanceRequest = ClearanceRequest::find($item->clearance_request_id);
            if ($clearanceRequest) {
                if ($newPaymentStatus === 'cancelled' || $newPaymentStatus === 'refunded') {
                    $clearanceRequest->update([
                        'status' => 'pending_payment', // Revert to pending payment
                        'payment_id' => null,
                        'payment_date' => null,
                        'payment_method' => null,
                        'or_number' => null,
                    ]);
                } elseif ($newPaymentStatus === 'completed') {
                    $clearanceRequest->update([
                        'status' => 'paid',
                        'payment_id' => $payment->id,
                        'payment_date' => $payment->payment_date,
                        'payment_method' => $payment->payment_method,
                        'or_number' => $payment->or_number,
                    ]);
                }
            }
        }
    }
}


    /**
     * Display the specified payment.
     */
    public function show(Payment $payment)
    {
        // First, load the payment with basic relationships
        $payment->load([
            'items',
            'recorder',
        ]);

        // Now load clearanceType separately to avoid relation not found error
        if ($payment->clearance_type_id) {
            $payment->load('clearanceType');
        }

        // Load resident or household based on payer type
        if ($payment->payer_type === 'resident') {
            $payment->load('resident.household');
        } elseif ($payment->payer_type === 'household') {
            $payment->load('household');
        }

        // Get related payments
        $relatedPayments = Payment::where('payer_type', $payment->payer_type)
            ->where('payer_id', $payment->payer_id)
            ->where('id', '!=', $payment->id)
            ->orderBy('payment_date', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/Payments/Show', [
            'payment' => $payment,
            'relatedPayments' => $relatedPayments,
            'isClearancePayment' => !empty($payment->clearance_type_id),
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

        // Load clearance type safely
        $payment->load('items');
        if ($payment->clearance_type_id) {
            $payment->load('clearanceType');
        }
        
        // Get residents
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

        // Get households
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

        // Get FEE TYPES
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

        // Get clearance types from database
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
            'clearance_type_id' => 'nullable|exists:clearance_types,id',
            'clearance_code' => 'nullable|string|max:100',
            'validity_date' => 'nullable|date',
            'collection_type' => 'required|in:manual,system',
            'method_details' => 'nullable|array',
        ]);

        // Get clearance type details if provided
        $clearanceCode = null;
        if (!empty($validated['clearance_type_id'])) {
            $clearanceType = ClearanceType::find($validated['clearance_type_id']);
            if ($clearanceType) {
                $clearanceCode = $clearanceType->code ?? strtoupper(str_replace(' ', '_', $clearanceType->name));
                $validated['clearance_code'] = $clearanceCode;
            }
        } else {
            $validated['clearance_code'] = null;
        }

        DB::beginTransaction();

        try {
            // Store old values for logging
            $oldValues = $payment->getOriginal();

            // Update payment
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
                'clearance_type_id' => $validated['clearance_type_id'],
                'clearance_code' => $clearanceCode,
                'validity_date' => $validated['validity_date'],
                'collection_type' => $validated['collection_type'],
                'method_details' => $validated['method_details'] ?? null,
            ]);

            Log::info('PAYMENT_UPDATE: Payment record updated', [
                'payment_id' => $payment->id,
                'changes' => array_diff_assoc($payment->getAttributes(), $oldValues),
            ]);

            // Update items if provided
            if ($request->has('items')) {
                $oldItemsCount = $payment->items()->count();
                $payment->items()->delete();
                
                foreach ($request->input('items') as $item) {
                    $paymentItemData = [
                        'payment_id' => $payment->id,
                        'fee_id' => null,
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

                    // Check if it's a clearance fee
                    if (($item['metadata']['is_clearance_fee'] ?? false) || ($item['item_type'] ?? 'fee') === 'clearance') {
                        $clearanceRequestId = $item['metadata']['clearance_request_id'] ?? null;
                        $metadata = [
                            'is_clearance_fee' => true,
                            'clearance_request_id' => $clearanceRequestId,
                            'clearance_type_id' => $validated['clearance_type_id'] ?? null,
                            'clearance_code' => $clearanceCode,
                        ];
                        
                        $paymentItemData['fee_metadata'] = json_encode($metadata);
                        
                        // Update clearance request if ID is provided
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
                    // Regular fee type
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
            // Update clearance request status for any clearance items in this payment
            $clearanceItems = $payment->items()
                ->whereNotNull('fee_metadata')
                ->get();
                
            foreach ($clearanceItems as $item) {
                $metadata = json_decode($item->fee_metadata, true);
                if (!empty($metadata['is_clearance_fee']) && !empty($metadata['clearance_request_id'])) {
                    $clearanceRequest = ClearanceRequest::find($metadata['clearance_request_id']);
                    if ($clearanceRequest && in_array($clearanceRequest->status, ['pending_payment', 'processing'])) {
                        $clearanceRequest->update([
                            'status' => 'cancelled',
                            'cancellation_reason' => 'Payment cancelled: ' . $payment->or_number,
                            'payment_id' => null,
                        ]);
                    }
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
            // Update clearance request status for any clearance items in this payment
            $clearanceItems = $payment->items()
                ->whereNotNull('fee_metadata')
                ->get();
                
            foreach ($clearanceItems as $item) {
                $metadata = json_decode($item->fee_metadata, true);
                if (!empty($metadata['is_clearance_fee']) && !empty($metadata['clearance_request_id'])) {
                    $clearanceRequest = ClearanceRequest::find($metadata['clearance_request_id']);
                    if ($clearanceRequest) {
                        $clearanceRequest->update([
                            'status' => 'cancelled',
                            'cancellation_reason' => 'Payment refunded: ' . $payment->or_number . ' - ' . $request->refund_reason,
                            'payment_id' => null,
                        ]);
                    }
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
        ]);
        
        if ($payment->clearance_type_id) {
            $payment->load('clearanceType');
        }

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
            'isClearancePayment' => !empty($payment->clearance_type_id),
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

        if ($request->filled('clearance_type_id')) {
            $query->where('clearance_type_id', $request->input('clearance_type_id'));
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
            // Clearance specific stats
            'clearance_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereNotNull('clearance_type_id')
                ->count(),
            'clearance_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereNotNull('clearance_type_id')
                ->sum('total_amount'),
            'by_clearance_type' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereNotNull('clearance_type_id')
                ->with('clearanceType')
                ->select('clearance_type_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('clearance_type_id')
                ->get()
                ->map(function ($item) {
                    return [
                        'clearance_type_id' => $item->clearance_type_id,
                        'clearance_type_name' => $item->clearanceType->name ?? 'Unknown',
                        'count' => $item->count,
                        'total' => $item->total,
                    ];
                }),
        ];

        return response()->json($stats);
    }

    /**
     * Create payment for clearance request.
     */
    public function createForClearance(Request $request, ClearanceRequest $clearanceRequest)
    {
        // Check if clearance request is eligible for payment
        if (!in_array($clearanceRequest->status, ['pending_payment', 'pending', 'processing', 'approved'])) {
            return redirect()->route('clearance-requests.show', $clearanceRequest->id)
                ->with('error', 'Clearance request is not in a payable state.');
        }

        // Check if payment already exists
        if ($clearanceRequest->payment) {
            return redirect()->route('payments.show', $clearanceRequest->payment->id)
                ->with('info', 'Payment already exists for this clearance request.');
        }

        // Redirect to create payment with pre-filled data
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