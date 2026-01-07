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
        $query = Payment::with(['items', 'recorder'])
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
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
        if ($request->filled('certificate_type')) {
            $query->where('certificate_type', $request->input('certificate_type'));
        }

        $payments = $query->paginate(20)->withQueryString();

        // Get clearance types for filter
        $clearanceTypes = [
            'residency' => 'Certificate of Residency',
            'indigency' => 'Certificate of Indigency',
            'clearance' => 'Barangay Clearance',
            'cedula' => 'Cedula',
            'business' => 'Business Permit',
            'other' => 'Other Certificate',
        ];

        return Inertia::render('admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to', 'payer_type', 'certificate_type']),
            'clearanceTypes' => $clearanceTypes,
            'stats' => [
                'total' => Payment::count(),
                'today' => Payment::today()->count(),
                'monthly' => Payment::thisMonth()->count(),
                'total_amount' => Payment::sum('total_amount'),
                'today_amount' => Payment::today()->sum('total_amount'),
                'monthly_amount' => Payment::thisMonth()->sum('total_amount'),
                // Clearance stats
                'clearance_payments' => Payment::where('certificate_type', '!=', null)->count(),
                'clearance_amount' => Payment::where('certificate_type', '!=', null)->sum('total_amount'),
            ],
        ]);
    }

    
    /**
     * Show the form for creating a new payment.
     */
public function create(Request $request)
{
    // Log request start
    Log::info('PAYMENT_CREATE_REQUEST: Starting payment creation', [
        'action' => 'create',
        'user_id' => Auth::id(),
        'user_name' => Auth::user()->name ?? 'Unknown',
        'timestamp' => now()->toDateTimeString(),
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
        'request_params' => $request->all(),
        'pre_filled_data' => $request->only([
            'fee_id', 'payer_type', 'payer_id', 'payer_name', 
            'contact_number', 'address', 'purok', 'pre_filled_fee',
            'clearance_request_id', 'clearance_type_id'
        ]),
    ]);

    // Get pre-filled data from query parameters
    $preFilledData = $request->only([
        'fee_id', 'payer_type', 'payer_id', 'payer_name', 
        'contact_number', 'address', 'purok', 'pre_filled_fee',
        'clearance_request_id', 'clearance_type_id'
    ]);

    // Get the selected fee type from query parameter (if any)
    $selectedFeeTypeId = $request->input('fee_type_id');

    // Log pre-filled data
    Log::debug('PAYMENT_CREATE_DEBUG: Pre-filled data received', [
        'pre_filled_data' => $preFilledData,
        'selected_fee_type_id' => $selectedFeeTypeId,
        'has_clearance_request_id' => !empty($preFilledData['clearance_request_id']),
        'has_fee_id' => !empty($preFilledData['fee_id']),
    ]);

    // ========== GET RESIDENTS WITH OUTSTANDING FEES ==========
    Log::debug('PAYMENT_CREATE_DEBUG: Fetching residents with outstanding fees');
    $residents = Resident::with(['household' => function ($query) {
            $query->select('id', 'household_number', 'purok_id');
        }, 'household.purok' => function ($query) {
            $query->select('id', 'name');
        }])
        ->whereHas('fees', function ($query) use ($selectedFeeTypeId) {
            $query->where('balance', '>', 0)
                  ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue']);
            
            if ($selectedFeeTypeId) {
                $query->where('fee_type_id', $selectedFeeTypeId);
            }
        })
        ->orderBy('last_name')
        ->orderBy('first_name')
        ->get(['id', 'first_name', 'last_name', 'middle_name', 'contact_number', 'address', 'household_id'])
        ->map(function ($resident) use ($selectedFeeTypeId) {
            // Get ALL outstanding fees for this resident with complete details
            $feesQuery = $resident->fees()
                ->with(['feeType'])
                ->where('balance', '>', 0)
                ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue']);
            
            if ($selectedFeeTypeId) {
                $feesQuery->where('fee_type_id', $selectedFeeTypeId);
            }
            
            $outstandingFees = $feesQuery->get();
            
            $totalBalance = $outstandingFees->sum('balance');
            $feeCount = $outstandingFees->count();
            
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
                // Send ALL fees with COMPLETE details
                'outstanding_fees' => $outstandingFees->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'fee_code' => $fee->fee_code,
                        'fee_type_id' => $fee->fee_type_id,
                        'fee_type_name' => $fee->feeType->name ?? 'Unknown',
                        'fee_type_category' => $fee->feeType->category ?? 'other',
                        'base_amount' => number_format($fee->base_amount, 2),
                        'surcharge_amount' => number_format($fee->surcharge_amount, 2),
                        'penalty_amount' => number_format($fee->penalty_amount, 2),
                        'discount_amount' => number_format($fee->discount_amount, 2),
                        'total_amount' => number_format($fee->total_amount, 2),
                        'balance' => number_format($fee->balance, 2),
                        'status' => $fee->status,
                        'issue_date' => $fee->issue_date->format('M d, Y'),
                        'due_date' => $fee->due_date->format('M d, Y'),
                        'purpose' => $fee->purpose,
                        'remarks' => $fee->remarks,
                        'billing_period' => $fee->billing_period,
                        'period_start' => $fee->period_start ? $fee->period_start->format('M d, Y') : null,
                        'period_end' => $fee->period_end ? $fee->period_end->format('M d, Y') : null,
                    ];
                }),
            ];
        });

    Log::debug('PAYMENT_CREATE_DEBUG: Residents fetched', [
        'residents_count' => $residents->count(),
        'residents_sample' => $residents->take(3)->pluck('name', 'id'),
    ]);

    // ========== GET HOUSEHOLDS WITH OUTSTANDING FEES ==========
    Log::debug('PAYMENT_CREATE_DEBUG: Fetching households with outstanding fees');
    $households = Household::with(['purok' => function ($query) {
            $query->select('id', 'name');
        }])
        ->whereHas('fees', function ($query) use ($selectedFeeTypeId) {
            $query->where('balance', '>', 0)
                  ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue']);
            
            if ($selectedFeeTypeId) {
                $query->where('fee_type_id', $selectedFeeTypeId);
            }
        })
        ->withCount(['householdMembers as members_count'])
        ->orderBy('head_of_family', 'asc')
        ->get(['id', 'head_of_family', 'contact_number', 'address', 'household_number', 'purok_id'])
        ->map(function ($household) use ($selectedFeeTypeId) {
            // Get ALL outstanding fees for this household with complete details
            $feesQuery = $household->fees()
                ->with(['feeType'])
                ->where('balance', '>', 0)
                ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue']);
            
            if ($selectedFeeTypeId) {
                $feesQuery->where('fee_type_id', $selectedFeeTypeId);
            }
            
            $outstandingFees = $feesQuery->get();
            
            $totalBalance = $outstandingFees->sum('balance');
            $feeCount = $outstandingFees->count();
            
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
                // Send ALL fees with COMPLETE details
                'outstanding_fees' => $outstandingFees->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'fee_code' => $fee->fee_code,
                        'fee_type_id' => $fee->fee_type_id,
                        'fee_type_name' => $fee->feeType->name ?? 'Unknown',
                        'fee_type_category' => $fee->feeType->category ?? 'other',
                        'base_amount' => number_format($fee->base_amount, 2),
                        'surcharge_amount' => number_format($fee->surcharge_amount, 2),
                        'penalty_amount' => number_format($fee->penalty_amount, 2),
                        'discount_amount' => number_format($fee->discount_amount, 2),
                        'total_amount' => number_format($fee->total_amount, 2),
                        'balance' => number_format($fee->balance, 2),
                        'status' => $fee->status,
                        'issue_date' => $fee->issue_date->format('M d, Y'),
                        'due_date' => $fee->due_date->format('M d, Y'),
                        'purpose' => $fee->purpose,
                        'remarks' => $fee->remarks,
                        'billing_period' => $fee->billing_period,
                        'period_start' => $fee->period_start ? $fee->period_start->format('M d, Y') : null,
                        'period_end' => $fee->period_end ? $fee->period_end->format('M d, Y') : null,
                    ];
                }),
            ];
        });

    Log::debug('PAYMENT_CREATE_DEBUG: Households fetched', [
        'households_count' => $households->count(),
        'households_sample' => $households->take(3)->pluck('head_name', 'id'),
    ]);

    // ========== GET PENDING CLEARANCE REQUESTS ==========
    Log::debug('PAYMENT_CREATE_DEBUG: Fetching pending clearance requests');
    
    // Get clearance requests that are pending payment and don't have a payment yet
    $clearanceRequests = ClearanceRequest::with([
            'resident.household.purok', 
            'clearanceType',
            'payment' // Eager load the payment relationship to check if it exists
        ])
        ->whereIn('status', ['pending_payment', 'pending', 'processing', 'approved'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->filter(function ($request) {
            // Filter out requests that already have a payment
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
                    'code' => $request->clearanceType->code,
                    'description' => $request->clearanceType->description,
                ] : null,
                'resident' => $request->resident ? [
                    'id' => $request->resident->id,
                    'name' => $request->resident->full_name,
                    'contact_number' => $request->resident->contact_number,
                    'address' => $request->resident->address,
                    'household_number' => $request->resident->household->household_number ?? null,
                    'purok' => $request->resident->household->purok->name ?? null,
                ] : null,
                'can_be_paid' => in_array($request->status, ['pending_payment', 'processing', 'approved']),
                'already_paid' => !is_null($request->payment), // Check if payment relationship exists
            ];
        })
        ->values(); // Reset array keys after filtering

    Log::debug('PAYMENT_CREATE_DEBUG: Clearance requests fetched', [
        'clearance_requests_count' => $clearanceRequests->count(),
        'clearance_requests_payable' => $clearanceRequests->where('can_be_paid', true)->count(),
        'clearance_requests_sample' => $clearanceRequests->take(3)->pluck('reference_number', 'id'),
    ]);

    // ========== GET FEE TYPES ==========
    Log::debug('PAYMENT_CREATE_DEBUG: Fetching fee types');
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
                'base_amount' => $feeType->base_amount,
                'category' => $feeType->category,
                'frequency' => $feeType->frequency,
                'has_surcharge' => $feeType->has_surcharge,
                'surcharge_rate' => $feeType->surcharge_percentage,
                'has_penalty' => $feeType->has_penalty,
                'penalty_rate' => $feeType->penalty_percentage,
                'validity_days' => $feeType->validity_days,
                'applicable_to' => $feeType->applicable_to ? [$feeType->applicable_to] : [],
            ];
        });

    Log::debug('PAYMENT_CREATE_DEBUG: Fee types fetched', [
        'fee_types_count' => $fees->count(),
        'fee_types_sample' => $fees->take(3)->pluck('name', 'id'),
    ]);

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

    // Generate OR number
    $defaultOrNumber = Payment::generateOrNumber();
    Log::debug('PAYMENT_CREATE_DEBUG: Generated OR number', [
        'or_number' => $defaultOrNumber,
    ]);

    // If fee_id is provided in pre-filled data, get the fee details
    $selectedFeeDetails = null;
    if (!empty($preFilledData['fee_id'])) {
        Log::debug('PAYMENT_CREATE_DEBUG: Fetching pre-filled fee details', [
            'fee_id' => $preFilledData['fee_id'],
        ]);
        
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
            ];
            
            Log::debug('PAYMENT_CREATE_DEBUG: Pre-filled fee details found', [
                'fee_details' => [
                    'id' => $selectedFeeDetails['id'],
                    'fee_code' => $selectedFeeDetails['fee_code'],
                    'balance' => $selectedFeeDetails['balance'],
                    'payer_name' => $selectedFeeDetails['payer_name'],
                ]
            ]);
        } else {
            Log::warning('PAYMENT_CREATE_WARNING: Pre-filled fee not found', [
                'fee_id' => $preFilledData['fee_id'],
            ]);
        }
    }

    // Handle clearance request pre-fill
    $clearanceRequest = null;
    $clearanceFeeType = null;
    
    if (!empty($preFilledData['clearance_request_id'])) {
        Log::info('PAYMENT_CREATE_CLEARANCE: Processing clearance request pre-fill', [
            'clearance_request_id' => $preFilledData['clearance_request_id'],
            'has_clearance_type_id' => !empty($preFilledData['clearance_type_id']),
        ]);
        
        $clearanceRequest = ClearanceRequest::with([
                'resident.household.purok',
                'clearanceType', 
                'documents',
                'issuingOfficer',
                'payment'
            ])
            ->find($preFilledData['clearance_request_id']);
            
        if ($clearanceRequest) {
            Log::info('PAYMENT_CREATE_CLEARANCE: Clearance request found', [
                'clearance_request_id' => $clearanceRequest->id,
                'reference_number' => $clearanceRequest->reference_number,
                'status' => $clearanceRequest->status,
                'status_display' => $clearanceRequest->status_display,
                'fee_amount' => $clearanceRequest->fee_amount,
                'resident_id' => $clearanceRequest->resident_id,
                'resident_name' => $clearanceRequest->resident->full_name ?? 'Unknown',
                'has_payment' => !is_null($clearanceRequest->payment),
                'payment_id' => $clearanceRequest->payment_id,
                'payment_or_number' => $clearanceRequest->payment->or_number ?? null,
            ]);
            
            // Check if clearance request is in a payable state
            $payableStatuses = ['approved', 'pending_payment', 'processing'];
            
            if (!in_array($clearanceRequest->status, $payableStatuses)) {
                $errorMessage = 'Clearance request is not in a payable state. Current status: ' . 
                               ($clearanceRequest->status_display ?? $clearanceRequest->status);
                
                Log::warning('PAYMENT_CREATE_CLEARANCE_ERROR: Clearance request not payable', [
                    'clearance_request_id' => $clearanceRequest->id,
                    'current_status' => $clearanceRequest->status,
                    'allowed_statuses' => $payableStatuses,
                    'error_message' => $errorMessage,
                ]);
                
                // Redirect back with error if not payable
                return redirect()->back()->withErrors([
                    'error' => $errorMessage
                ]);
            }
            
            // Check if already paid
            if ($clearanceRequest->payment) {
                $errorMessage = 'This clearance request already has a payment: OR#' . $clearanceRequest->payment->or_number;
                
                Log::warning('PAYMENT_CREATE_CLEARANCE_ERROR: Clearance request already paid', [
                    'clearance_request_id' => $clearanceRequest->id,
                    'payment_id' => $clearanceRequest->payment_id,
                    'payment_or_number' => $clearanceRequest->payment->or_number,
                    'error_message' => $errorMessage,
                ]);
                
                return redirect()->back()->withErrors([
                    'error' => $errorMessage
                ]);
            }
            
            // Auto-populate payer information from clearance request
            $preFilledData['payer_type'] = 'resident';
            $preFilledData['payer_id'] = $clearanceRequest->resident_id;
            $preFilledData['payer_name'] = $clearanceRequest->resident->full_name ?? $clearanceRequest->resident->name ?? 'Unknown';
            $preFilledData['contact_number'] = $clearanceRequest->resident->contact_number ?? null;
            $preFilledData['address'] = $clearanceRequest->resident->address ?? null;
            
            // Get household info if available
            if ($clearanceRequest->resident->household) {
                $preFilledData['household_number'] = $clearanceRequest->resident->household->household_number ?? null;
                $preFilledData['purok'] = $clearanceRequest->resident->household->purok->name ?? null;
            }
            
            // Set purpose to clearance type
            $preFilledData['purpose'] = $clearanceRequest->clearanceType->name ?? 'Clearance Payment';
            $preFilledData['certificate_type'] = $clearanceRequest->clearanceType->code ?? 'clearance';
            
            // Use the fee amount from clearance request
            $feeAmount = $clearanceRequest->fee_amount > 0 
                ? $clearanceRequest->fee_amount 
                : ($clearanceRequest->clearanceType->fee ?? 0);
            
            // Create a temporary fee type for clearance
            $clearanceFeeType = [
                'id' => 'clearance-' . $clearanceRequest->id,
                'clearance_request_id' => $clearanceRequest->id,
                'name' => $clearanceRequest->clearanceType->name ?? 'Barangay Clearance',
                'code' => 'CLEARANCE',
                'description' => $clearanceRequest->specific_purpose ?? $clearanceRequest->purpose ?? 'Clearance Fee',
                'base_amount' => $feeAmount,
                'category' => 'clearance',
                'fee_amount' => $feeAmount,
                'clearance_type_id' => $clearanceRequest->clearance_type_id,
                'reference_number' => $clearanceRequest->reference_number,
            ];
            
            Log::info('PAYMENT_CREATE_CLEARANCE: Clearance request pre-fill completed', [
                'clearance_request_id' => $clearanceRequest->id,
                'fee_amount' => $feeAmount,
                'payer_name' => $preFilledData['payer_name'],
                'certificate_type' => $preFilledData['certificate_type'],
                'clearance_fee_type' => [
                    'id' => $clearanceFeeType['id'],
                    'name' => $clearanceFeeType['name'],
                    'amount' => $clearanceFeeType['base_amount'],
                ],
            ]);
        } else {
            $errorMessage = 'Clearance request not found';
            
            Log::error('PAYMENT_CREATE_CLEARANCE_ERROR: Clearance request not found', [
                'requested_clearance_request_id' => $preFilledData['clearance_request_id'],
                'error_message' => $errorMessage,
            ]);
            
            return redirect()->back()->withErrors([
                'error' => $errorMessage
            ]);
        }
    } else {
        Log::debug('PAYMENT_CREATE_DEBUG: No clearance request ID provided', [
            'has_clearance_request_id' => !empty($preFilledData['clearance_request_id']),
            'is_clearance_payment' => false,
        ]);
    }

    // Get clearance types for dropdown
    $clearanceTypes = [];
    $clearanceTypesList = ClearanceType::where('is_active', true)
        ->orderBy('name')
        ->get();
    
    foreach ($clearanceTypesList as $type) {
        $clearanceTypes[$type->code] = $type->name;
    }

    // Also fetch all clearance types as array for frontend
    $allClearanceTypes = $clearanceTypesList->map(function ($type) {
        return [
            'id' => $type->id,
            'name' => $type->name,
            'code' => $type->code,
            'description' => $type->description,
            'fee' => $type->fee,
            'formatted_fee' => '₱' . number_format($type->fee, 2),
            'processing_days' => $type->processing_days,
            'validity_days' => $type->validity_days,
            'requires_payment' => $type->requires_payment,
            'requirements' => $type->requirements ?? [],
        ];
    })->toArray();

    Log::debug('PAYMENT_CREATE_DEBUG: Clearance types fetched', [
        'clearance_types_count' => count($allClearanceTypes),
        'clearance_types_sample' => array_slice($allClearanceTypes, 0, 3),
    ]);

    // Log the final data being passed to the view
    Log::info('PAYMENT_CREATE_COMPLETE: Rendering payment creation view', [
        'data_summary' => [
            'residents_count' => $residents->count(),
            'households_count' => $households->count(),
            'clearance_requests_count' => $clearanceRequests->count(),
            'fee_types_count' => $fees->count(),
            'clearance_types_count' => count($allClearanceTypes),
            'has_clearance_request' => !is_null($clearanceRequest),
            'clearance_request_id' => $clearanceRequest->id ?? null,
            'clearance_request_status' => $clearanceRequest->status ?? null,
            'is_clearance_payment' => !is_null($clearanceRequest),
            'default_or_number' => $defaultOrNumber,
            'pre_filled_data_summary' => [
                'has_payer_id' => !empty($preFilledData['payer_id']),
                'has_payer_name' => !empty($preFilledData['payer_name']),
                'has_fee_id' => !empty($preFilledData['fee_id']),
                'has_clearance_request_id' => !empty($preFilledData['clearance_request_id']),
            ],
        ],
        'execution_time' => round(microtime(true) - LARAVEL_START, 3) . ' seconds',
    ]);

    return Inertia::render('admin/Payments/Create', [
        'residents' => $residents,
        'households' => $households,
        'clearance_requests' => $clearanceRequests, // NEW: Add clearance requests
        'fees' => $fees,
        'discountTypes' => $discountTypes,
        'defaultOrNumber' => $defaultOrNumber,
        'pre_filled_data' => array_merge($preFilledData, [
            'fee_type_id' => $selectedFeeTypeId
        ]),
        'selected_fee_details' => $selectedFeeDetails,
        'selected_fee_type_id' => $selectedFeeTypeId,
        'clearance_request' => $clearanceRequest ? [
            'id' => $clearanceRequest->id,
            'reference_number' => $clearanceRequest->reference_number,
            'clearance_number' => $clearanceRequest->clearance_number,
            'purpose' => $clearanceRequest->purpose,
            'specific_purpose' => $clearanceRequest->specific_purpose,
            'status' => $clearanceRequest->status,
            'status_display' => $clearanceRequest->status_display,
            'urgency' => $clearanceRequest->urgency,
            'urgency_display' => $clearanceRequest->urgency_display,
            'fee_amount' => $clearanceRequest->fee_amount,
            'formatted_fee' => $clearanceRequest->formatted_fee,
            'issue_date' => $clearanceRequest->issue_date?->format('Y-m-d'),
            'valid_until' => $clearanceRequest->valid_until?->format('Y-m-d'),
            'requirements_met' => $clearanceRequest->requirements_met,
            'remarks' => $clearanceRequest->remarks,
            'needed_date' => $clearanceRequest->needed_date?->format('Y-m-d'),
            'created_at' => $clearanceRequest->created_at->format('Y-m-d H:i:s'),
            'estimated_completion_date' => $clearanceRequest->estimated_completion_date?->format('Y-m-d'),
            
            // Clearance type details
            'clearance_type' => $clearanceRequest->clearanceType ? [
                'id' => $clearanceRequest->clearanceType->id,
                'name' => $clearanceRequest->clearanceType->name,
                'code' => $clearanceRequest->clearanceType->code,
                'description' => $clearanceRequest->clearanceType->description,
                'fee' => $clearanceRequest->clearanceType->fee,
                'formatted_fee' => '₱' . number_format($clearanceRequest->clearanceType->fee, 2),
                'processing_days' => $clearanceRequest->clearanceType->processing_days,
                'validity_days' => $clearanceRequest->clearanceType->validity_days,
                'requirements' => $clearanceRequest->clearanceType->requirements,
            ] : null,
            
            // Resident details
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
            ] : null,
            
            // Document counts
            'documents_count' => $clearanceRequest->documents->count(),
            'has_documents' => $clearanceRequest->documents->count() > 0,
            
            // Payment eligibility
            'can_be_paid' => in_array($clearanceRequest->status, ['approved', 'pending_payment', 'processing']),
            'already_paid' => !is_null($clearanceRequest->payment), // Changed: use relationship check
            'payment_id' => $clearanceRequest->payment ? $clearanceRequest->payment->id : null, // Changed: get payment ID if exists
            
            // Issuing officer
            'issuing_officer' => $clearanceRequest->issuingOfficer ? [
                'id' => $clearanceRequest->issuingOfficer->id,
                'name' => $clearanceRequest->issuingOfficer->name,
                'email' => $clearanceRequest->issuingOfficer->email,
            ] : ($clearanceRequest->issuing_officer_name ? [
                'name' => $clearanceRequest->issuing_officer_name,
            ] : null),
        ] : null,
        'clearance_fee_type' => $clearanceFeeType,
        'clearanceTypes' => $clearanceTypes,
        'allClearanceTypes' => $allClearanceTypes,
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
                    'base_amount' => number_format($fee->base_amount, 2),
                    'surcharge_amount' => number_format($fee->surcharge_amount, 2),
                    'penalty_amount' => number_format($fee->penalty_amount, 2),
                    'discount_amount' => number_format($fee->discount_amount, 2),
                    'total_amount' => number_format($fee->total_amount, 2),
                    'amount_paid' => number_format($fee->amount_paid, 2),
                    'balance' => number_format($fee->balance, 2),
                    'status' => $fee->status,
                    'issue_date' => $fee->issue_date->format('M d, Y'),
                    'due_date' => $fee->due_date->format('M d, Y'),
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
                'total_outstanding_balance' => number_format($totalBalance, 2),
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
        // Log the complete incoming request
        Log::info('PAYMENT_STORE_REQUEST_FULL: Full request data', [
            'full_request' => $request->all(),
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name ?? 'Unknown',
            'timestamp' => now()->toDateTimeString(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Check for required fields immediately
        $requiredFields = [
            'payer_type', 'payer_id', 'payer_name', 'payment_date', 
            'payment_method', 'total_amount', 'purpose', 'items'
        ];
        
        $missingFields = [];
        foreach ($requiredFields as $field) {
            if (!$request->has($field) || empty($request->input($field))) {
                $missingFields[] = $field;
            }
        }
        
        if (!empty($missingFields)) {
            Log::error('PAYMENT_STORE_ERROR: Missing required fields', [
                'missing_fields' => $missingFields,
                'received_fields' => array_keys($request->all()),
                'items_received' => $request->has('items') ? count($request->input('items')) : 0,
            ]);
            
            return back()->withErrors([
                'error' => 'Missing required fields: ' . implode(', ', $missingFields) . 
                          '. Please complete all steps of the payment process.'
            ])->withInput();
        }

        // Generate OR number if not provided
        $orNumber = $request->input('or_number', Payment::generateOrNumber());
        
        // Log request start
        Log::info('PAYMENT_STORE: Payment creation started', [
            'action' => 'store',
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name ?? 'Unknown',
            'timestamp' => now()->toDateTimeString(),
            'generated_or_number' => $orNumber,
            'request_or_number' => $request->input('or_number'),
            'request_data_summary' => [
                'payer_type' => $request->input('payer_type'),
                'payer_name' => $request->input('payer_name'),
                'payment_date' => $request->input('payment_date'),
                'payment_method' => $request->input('payment_method'),
                'total_amount' => $request->input('total_amount'),
                'items_count' => count($request->input('items', [])),
                'clearance_request_id' => $request->input('clearance_request_id'),
                'certificate_type' => $request->input('certificate_type'),
            ],
        ]);

        try {
            // Validate the request with default values for optional fields
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
                'certificate_type' => 'nullable|string|max:100',
                'validity_date' => 'nullable|date',
                'collection_type' => 'required|in:manual,system',
                'method_details' => 'nullable|array',
                'items' => 'required|array|min:1',
                'clearance_request_id' => 'nullable|exists:clearance_requests,id',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('PAYMENT_STORE_VALIDATION_ERROR: Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->except('items'), // Don't log all items for brevity
                'items_count' => $request->has('items') ? count($request->input('items')) : 0,
            ]);
            
            throw $e; // Let Laravel handle the validation error response
        }

        // Use provided OR number or generate one
        $validated['or_number'] = $request->input('or_number', Payment::generateOrNumber());

        // Check if OR number already exists (safety check)
        if (Payment::where('or_number', $validated['or_number'])->exists()) {
            // Generate a new one if duplicate
            $validated['or_number'] = Payment::generateOrNumber();
            Log::warning('PAYMENT_STORE: OR number conflict, generated new one', [
                'original_or_number' => $orNumber,
                'new_or_number' => $validated['or_number'],
            ]);
        }

        // Now validate each item individually with proper defaults
        $validatedItems = [];
        foreach ($validated['items'] as $index => $item) {
            try {
                $itemData = validator($item, [
                    'fee_id' => 'required',
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
                ])->validate();

                // Ensure all fields have values
                $validatedItems[] = [
                    'fee_id' => $itemData['fee_id'],
                    'fee_name' => $itemData['fee_name'],
                    'fee_code' => $itemData['fee_code'],
                    'description' => $itemData['description'] ?? null,
                    'base_amount' => $itemData['base_amount'],
                    'surcharge' => $itemData['surcharge'],
                    'penalty' => $itemData['penalty'],
                    'total_amount' => $itemData['total_amount'],
                    'category' => $itemData['category'],
                    'period_covered' => $itemData['period_covered'] ?? null,
                    'months_late' => $itemData['months_late'] ?? 0,
                ];
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error('PAYMENT_STORE_ITEM_VALIDATION_ERROR: Item validation failed', [
                    'item_index' => $index,
                    'item_data' => $item,
                    'errors' => $e->errors(),
                ]);
                throw $e;
            }
        }

        $validated['items'] = $validatedItems;

        DB::beginTransaction();

        try {
            // Log payment creation attempt with full details
            Log::info('PAYMENT_STORE: Payment creation process started', [
                'transaction_start' => now()->toDateTimeString(),
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name ?? 'Unknown',
                'or_number' => $validated['or_number'],
                'payer_name' => $validated['payer_name'],
                'payer_type' => $validated['payer_type'],
                'payer_id' => $validated['payer_id'],
                'payment_method' => $validated['payment_method'],
                'payment_date' => $validated['payment_date'],
                'total_amount' => $validated['total_amount'],
                'subtotal' => $validated['subtotal'],
                'surcharge' => $validated['surcharge'],
                'penalty' => $validated['penalty'],
                'discount' => $validated['discount'],
                'discount_type' => $validated['discount_type'],
                'items_count' => count($validated['items']),
                'items_total' => array_sum(array_column($validated['items'], 'total_amount')),
                'address' => $validated['address'] ?? 'N/A',
                'purok' => $validated['purok'] ?? 'N/A',
                'contact_number' => $validated['contact_number'] ?? 'N/A',
                'purpose' => $validated['purpose'],
                'period_covered' => $validated['period_covered'] ?? 'N/A',
                'clearance_request_id' => $validated['clearance_request_id'] ?? null,
                'certificate_type' => $validated['certificate_type'] ?? null,
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
                'subtotal' => $validated['subtotal'],
                'surcharge' => $validated['surcharge'],
                'penalty' => $validated['penalty'],
                'discount' => $validated['discount'],
                'discount_type' => $validated['discount_type'] ?? null,
                'total_amount' => $validated['total_amount'],
                'purpose' => $validated['purpose'],
                'remarks' => $validated['remarks'] ?? null,
                'is_cleared' => $validated['is_cleared'] ?? false,
                'certificate_type' => $validated['certificate_type'] ?? null,
                'validity_date' => $validated['validity_date'] ?? null,
                'collection_type' => $validated['collection_type'] ?? 'manual',
                'method_details' => $validated['method_details'] ?? null,
                'recorded_by' => Auth::id(),
                'status' => 'completed',
            ]);

            // Log payment created successfully
            Log::info('PAYMENT_STORE: Payment record created in database', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'database_id' => $payment->id,
                'created_at' => $payment->created_at,
                'total_amount' => $payment->total_amount,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'payment_date' => $payment->payment_date,
                'purpose' => $payment->purpose,
                'certificate_type' => $payment->certificate_type,
            ]);

            // Handle clearance request payment link
            if (!empty($validated['clearance_request_id'])) {
                $clearanceRequest = ClearanceRequest::find($validated['clearance_request_id']);
                
                if ($clearanceRequest) {
                    // Update clearance request status to processing
                    $clearanceRequest->update([
                        'status' => 'processing',
                        'fee_amount' => $payment->total_amount,
                    ]);
                    
                    // Link payment to clearance request
                    $payment->update([
                        'clearance_request_id' => $clearanceRequest->id,
                    ]);
                    
                    Log::info('PAYMENT_STORE: Linked to clearance request', [
                        'payment_id' => $payment->id,
                        'clearance_request_id' => $clearanceRequest->id,
                        'clearance_type' => $clearanceRequest->clearanceType->name ?? 'Unknown',
                        'fee_amount' => $clearanceRequest->fee_amount,
                    ]);
                }
            }

            // Check if there are any outstanding fees for this payer
            $outstandingFees = Fee::where('payer_type', $validated['payer_type'])
                ->where($validated['payer_type'] . '_id', $validated['payer_id'])
                ->where('balance', '>', 0)
                ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
                ->get();

            // Create payment items
            $itemDetails = [];
            $feeIdsPaid = [];
            
            foreach ($validated['items'] as $index => $item) {
                // For clearance payments, check if it's a clearance fee
                if (str_starts_with($item['fee_id'], 'clearance-')) {
                    // This is a clearance fee
                    $paymentItem = PaymentItem::create([
                        'payment_id' => $payment->id,
                        'fee_id' => null, // No fee type ID for clearances
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
                        'fee_metadata' => [
                            'is_clearance_fee' => true,
                            'clearance_request_id' => $validated['clearance_request_id'] ?? null,
                        ],
                    ]);
                } else {
                    // Regular fee payment
                    $feeType = FeeType::find($item['fee_id']);
                    
                    // Check if this item corresponds to an existing fee in the fees table
                    $feeIdForItem = null;
                    $originalFeeId = null;
                    
                    // Try to find a matching outstanding fee
                    foreach ($outstandingFees as $fee) {
                        if ($fee->fee_type_id == $item['fee_id'] && !in_array($fee->id, $feeIdsPaid)) {
                            $feeIdForItem = $fee->id;
                            $originalFeeId = $fee->id;
                            $feeIdsPaid[] = $fee->id;
                            
                            // Update the fee's payment status
                            $fee->applyPayment(
                                $item['total_amount'],
                                $payment->id,
                                [
                                    'or_number' => $payment->or_number,
                                    'collected_by' => Auth::id(),
                                ]
                            );
                            break;
                        }
                    }

                    $paymentItem = PaymentItem::create([
                        'payment_id' => $payment->id,
                        'fee_id' => $item['fee_id'],
                        'original_fee_id' => $originalFeeId, // Store the original fee ID if applicable
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
                        'fee_metadata' => $feeType ? [
                            'original_amount' => $feeType->base_amount,
                            'surcharge_rate' => $feeType->surcharge_percentage,
                            'penalty_rate' => $feeType->penalty_percentage,
                            'validity_days' => $feeType->validity_days,
                            'frequency' => $feeType->frequency,
                        ] : null,
                    ]);
                }

                $itemDetails[] = [
                    'item_id' => $paymentItem->id,
                    'fee_name' => $item['fee_name'],
                    'fee_code' => $item['fee_code'],
                    'base_amount' => $item['base_amount'],
                    'surcharge' => $item['surcharge'],
                    'penalty' => $item['penalty'],
                    'total_amount' => $item['total_amount'],
                    'category' => $item['category'],
                    'description' => $item['description'] ?? null,
                    'period_covered' => $item['period_covered'] ?? null,
                    'original_fee_id' => $originalFeeId ?? null,
                    'is_clearance_fee' => str_starts_with($item['fee_id'] ?? '', 'clearance-'),
                ];
            }

            // Log payment items created
            Log::info('PAYMENT_STORE: Payment items created successfully', [
                'payment_id' => $payment->id,
                'items_count' => count($validated['items']),
                'total_items_amount' => array_sum(array_column($validated['items'], 'total_amount')),
                'items_linked_to_fees' => array_filter($itemDetails, function($item) {
                    return !empty($item['original_fee_id']);
                }),
                'clearance_items' => array_filter($itemDetails, function($item) {
                    return !empty($item['is_clearance_fee']);
                }),
                'items_sample' => array_slice($itemDetails, 0, 3),
            ]);

            DB::commit();

            // Log successful transaction completion
            Log::info('PAYMENT_STORE: Payment transaction completed successfully', [
                'transaction_completed' => now()->toDateTimeString(),
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'payer_name' => $payment->payer_name,
                'payer_type' => $payment->payer_type,
                'total_amount' => $payment->total_amount,
                'payment_method' => $payment->payment_method,
                'payment_date' => $payment->payment_date,
                'purpose' => $payment->purpose,
                'certificate_type' => $payment->certificate_type,
                'clearance_request_id' => $payment->clearance_request_id ?? null,
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name ?? 'Unknown',
                'execution_time' => round(microtime(true) - LARAVEL_START, 3) . ' seconds',
                'database_transaction' => 'committed',
            ]);

            return redirect()->route('payments.show', $payment->id)
                ->with('success', 'Payment recorded successfully! Receipt: ' . $payment->or_number);

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Log the error with comprehensive context
            Log::error('PAYMENT_STORE_ERROR: Payment creation failed', [
                'error_timestamp' => now()->toDateTimeString(),
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name ?? 'Unknown',
                'or_number' => $validated['or_number'] ?? 'N/A',
                'payer_name' => $validated['payer_name'] ?? 'N/A',
                'error_message' => $e->getMessage(),
                'error_class' => get_class($e),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_code' => $e->getCode(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => [
                    'payer_type' => $validated['payer_type'] ?? 'N/A',
                    'total_amount' => $validated['total_amount'] ?? 'N/A',
                    'items_received' => isset($validated['items']) ? count($validated['items']) : 0,
                    'items_sample' => isset($validated['items']) && count($validated['items']) > 0 ? 
                        array_slice($validated['items'], 0, 3) : 'No items',
                    'purpose' => $validated['purpose'] ?? 'N/A',
                    'period_covered' => $validated['period_covered'] ?? 'N/A',
                    'clearance_request_id' => $validated['clearance_request_id'] ?? null,
                ],
                'database_transaction' => 'rolled_back',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to record payment. Please try again. Error: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Display the specified payment.
     */
    public function show(Payment $payment)
    {
        // Load all necessary relationships
        $payment->load([
            'items.fee',
            'recorder',
            'resident.household',
            'household.members'
        ]);

        // Load clearance request if exists
        if ($payment->certificate_type) {
            $payment->load('clearanceRequest.resident', 'clearanceRequest.clearanceType');
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
            'paymentBreakdown' => [
                'subtotal' => $payment->subtotal,
                'surcharge' => $payment->surcharge,
                'penalty' => $payment->penalty,
                'discount' => $payment->discount,
                'total' => $payment->total_amount,
            ],
            'isClearancePayment' => !empty($payment->certificate_type),
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
        
        // Get residents with their household and purok info (include all for editing)
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
                    'household_id' => $resident->household_id,
                ];
            });

        // Fix: Changed head_name to head_of_family
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
                    'purok_id' => $household->purok_id,
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
                    'base_amount' => $feeType->base_amount,
                    'category' => $feeType->category,
                    'frequency' => $feeType->frequency,
                    'has_surcharge' => $feeType->has_surcharge,
                    'surcharge_rate' => $feeType->surcharge_percentage,
                    'has_penalty' => $feeType->has_penalty,
                    'penalty_rate' => $feeType->penalty_percentage,
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

        // Get clearance types for certificate_type dropdown
        $clearanceTypes = [
            'residency' => 'Certificate of Residency',
            'indigency' => 'Certificate of Indigency',
            'clearance' => 'Barangay Clearance',
            'cedula' => 'Cedula',
            'business' => 'Business Permit',
            'other' => 'Other Certificate',
        ];

        return Inertia::render('Admin/Payments/Edit', [
            'payment' => $payment,
            'residents' => $residents,
            'households' => $households,
            'fees' => $fees,
            'discountTypes' => $discountTypes,
            'clearanceTypes' => $clearanceTypes,
        ]);
    }

    /**
     * Update the specified payment in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        // Log update request start
        Log::info('PAYMENT_UPDATE: Payment update started', [
            'action' => 'update',
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'timestamp' => now()->toDateTimeString(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'current_payment_status' => $payment->status,
            'current_payer_name' => $payment->payer_name,
            'current_total_amount' => $payment->total_amount,
            'current_certificate_type' => $payment->certificate_type,
        ]);

        if ($payment->status === 'cancelled') {
            Log::warning('PAYMENT_UPDATE: Attempt to update cancelled payment blocked', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'user_id' => Auth::id(),
            ]);
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
            'certificate_type' => 'nullable|string|max:100',
            'validity_date' => 'nullable|date',
            'collection_type' => 'required|in:manual,system',
            'method_details' => 'nullable|array',
            'clearance_request_id' => 'nullable|exists:clearance_requests,id',
        ]);

        DB::beginTransaction();

        try {
            // Store old values for logging
            $oldValues = $payment->getOriginal();
            $changes = [];

            // Check what fields are being changed
            foreach ($validated as $key => $value) {
                if (isset($oldValues[$key]) && $oldValues[$key] != $value) {
                    $changes[$key] = [
                        'old' => $oldValues[$key],
                        'new' => $value,
                    ];
                }
            }

            // Log payment update attempt with details
            Log::info('PAYMENT_UPDATE: Payment update process started', [
                'transaction_start' => now()->toDateTimeString(),
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name,
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'old_total_amount' => $payment->total_amount,
                'new_total_amount' => $validated['total_amount'],
                'old_payer_name' => $payment->payer_name,
                'new_payer_name' => $validated['payer_name'],
                'old_certificate_type' => $payment->certificate_type,
                'new_certificate_type' => $validated['certificate_type'],
                'field_changes_count' => count($changes),
                'significant_changes' => [
                    'total_amount' => isset($changes['total_amount']) ? $changes['total_amount'] : 'No change',
                    'payer_name' => isset($changes['payer_name']) ? $changes['payer_name'] : 'No change',
                    'payment_method' => isset($changes['payment_method']) ? $changes['payment_method'] : 'No change',
                    'certificate_type' => isset($changes['certificate_type']) ? $changes['certificate_type'] : 'No change',
                ],
            ]);

            if (!empty($changes)) {
                Log::info('PAYMENT_UPDATE: Detailed field changes detected', [
                    'payment_id' => $payment->id,
                    'changes' => $changes,
                    'changed_fields' => array_keys($changes),
                ]);
            }

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
                'subtotal' => $validated['subtotal'],
                'surcharge' => $validated['surcharge'],
                'penalty' => $validated['penalty'],
                'discount' => $validated['discount'],
                'discount_type' => $validated['discount_type'],
                'total_amount' => $validated['total_amount'],
                'purpose' => $validated['purpose'],
                'remarks' => $validated['remarks'],
                'is_cleared' => $validated['is_cleared'] ?? false,
                'certificate_type' => $validated['certificate_type'],
                'validity_date' => $validated['validity_date'],
                'collection_type' => $validated['collection_type'],
                'method_details' => $validated['method_details'] ?? null,
                'clearance_request_id' => $validated['clearance_request_id'] ?? $payment->clearance_request_id,
            ]);

            // Update clearance request if changed
            if (!empty($validated['clearance_request_id']) && $validated['clearance_request_id'] != $payment->clearance_request_id) {
                $clearanceRequest = ClearanceRequest::find($validated['clearance_request_id']);
                if ($clearanceRequest) {
                    $clearanceRequest->update([
                        'fee_amount' => $validated['total_amount'],
                    ]);
                    Log::info('PAYMENT_UPDATE: Updated clearance request fee', [
                        'clearance_request_id' => $clearanceRequest->id,
                        'new_fee_amount' => $validated['total_amount'],
                    ]);
                }
            }

            // Log payment updated successfully
            Log::info('PAYMENT_UPDATE: Payment record updated in database', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'updated_at' => $payment->updated_at,
                'total_amount_before' => $oldValues['total_amount'] ?? null,
                'total_amount_after' => $payment->total_amount,
                'certificate_type_before' => $oldValues['certificate_type'] ?? null,
                'certificate_type_after' => $payment->certificate_type,
                'fields_updated' => array_keys($changes),
                'significant_field_changes' => $changes,
            ]);

            // Update items if provided
            if ($request->has('items')) {
                // Log items update
                $oldItemsCount = $payment->items()->count();
                $oldItemsTotal = $payment->items()->sum('total_amount');
                $oldItemsDetails = $payment->items()->select('fee_name', 'fee_code', 'total_amount')->get()->toArray();
                
                Log::info('PAYMENT_UPDATE: Payment items update started', [
                    'payment_id' => $payment->id,
                    'old_items_count' => $oldItemsCount,
                    'old_items_total' => $oldItemsTotal,
                    'old_items_sample' => array_slice($oldItemsDetails, 0, 3),
                    'new_items_count' => count($request->input('items')),
                    'new_items_total' => array_sum(array_column($request->input('items'), 'total_amount')),
                ]);
                
                $payment->items()->delete();
                
                $newItemDetails = [];
                foreach ($request->input('items') as $index => $item) {
                    // Check if it's a clearance fee
                    if (str_starts_with($item['fee_id'], 'clearance-')) {
                        $paymentItem = PaymentItem::create([
                            'payment_id' => $payment->id,
                            'fee_id' => null,
                            'fee_name' => $item['fee_name'],
                            'fee_code' => $item['fee_code'],
                            'description' => $item['description'],
                            'base_amount' => $item['base_amount'],
                            'surcharge' => $item['surcharge'],
                            'penalty' => $item['penalty'],
                            'total_amount' => $item['total_amount'],
                            'category' => $item['category'],
                            'period_covered' => $item['period_covered'],
                            'months_late' => $item['months_late'],
                            'fee_metadata' => [
                                'is_clearance_fee' => true,
                                'clearance_request_id' => $validated['clearance_request_id'] ?? null,
                            ],
                        ]);
                    } else {
                        $feeType = FeeType::find($item['fee_id']);
                        
                        $paymentItem = PaymentItem::create([
                            'payment_id' => $payment->id,
                            'fee_id' => $item['fee_id'],
                            'fee_name' => $item['fee_name'],
                            'fee_code' => $item['fee_code'],
                            'description' => $item['description'],
                            'base_amount' => $item['base_amount'],
                            'surcharge' => $item['surcharge'],
                            'penalty' => $item['penalty'],
                            'total_amount' => $item['total_amount'],
                            'category' => $item['category'],
                            'period_covered' => $item['period_covered'],
                            'months_late' => $item['months_late'],
                            'fee_metadata' => $feeType ? [
                                'original_amount' => $feeType->base_amount,
                                'surcharge_rate' => $feeType->surcharge_percentage,
                                'penalty_rate' => $feeType->penalty_percentage,
                                'validity_days' => $feeType->validity_days,
                                'frequency' => $feeType->frequency,
                            ] : null,
                        ]);
                    }

                    $newItemDetails[] = [
                        'item_id' => $paymentItem->id,
                        'fee_name' => $item['fee_name'],
                        'fee_code' => $item['fee_code'],
                        'total_amount' => $item['total_amount'],
                        'is_clearance_fee' => str_starts_with($item['fee_id'], 'clearance-'),
                    ];
                }

                // Log items updated successfully
                Log::info('PAYMENT_UPDATE: Payment items updated successfully', [
                    'payment_id' => $payment->id,
                    'items_deleted' => $oldItemsCount,
                    'items_created' => count($request->input('items')),
                    'old_items_total' => $oldItemsTotal,
                    'new_items_total' => array_sum(array_column($request->input('items'), 'total_amount')),
                    'difference_amount' => (array_sum(array_column($request->input('items'), 'total_amount')) - $oldItemsTotal),
                    'new_items_sample' => array_slice($newItemDetails, 0, 3),
                    'clearance_items_count' => count(array_filter($newItemDetails, function($item) {
                        return !empty($item['is_clearance_fee']);
                    })),
                ]);
            }

            DB::commit();

            // Log successful transaction completion
            Log::info('PAYMENT_UPDATE: Payment update transaction completed successfully', [
                'transaction_completed' => now()->toDateTimeString(),
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'total_amount' => $payment->total_amount,
                'certificate_type' => $payment->certificate_type,
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name,
                'execution_time' => round(microtime(true) - LARAVEL_START, 3) . ' seconds',
                'database_transaction' => 'committed',
                'changes_summary' => [
                    'fields_changed' => count($changes),
                    'amount_changed' => isset($changes['total_amount']) ? true : false,
                    'payer_changed' => isset($changes['payer_name']) || isset($changes['payer_type']) ? true : false,
                    'certificate_changed' => isset($changes['certificate_type']) ? true : false,
                ],
            ]);

            return redirect()->route('payments.show', $payment->id)
                ->with('success', 'Payment updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Log the error with comprehensive context
            Log::error('PAYMENT_UPDATE_ERROR: Payment update failed', [
                'error_timestamp' => now()->toDateTimeString(),
                'user_id' => Auth::id(),
                'user_name' => Auth::user()->name,
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'error_message' => $e->getMessage(),
                'error_class' => get_class($e),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_code' => $e->getCode(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => [
                    'payer_name' => $validated['payer_name'] ?? 'N/A',
                    'total_amount' => $validated['total_amount'] ?? 'N/A',
                    'items_updated' => $request->has('items') ? count($request->input('items')) : 'No items update',
                    'certificate_type' => $validated['certificate_type'] ?? null,
                    'clearance_request_id' => $validated['clearance_request_id'] ?? null,
                ],
                'database_transaction' => 'rolled_back',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
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

        // Log cancellation
        Log::warning('PAYMENT_CANCEL: Payment cancellation requested', [
            'action' => 'cancel',
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'total_amount' => $payment->total_amount,
            'payer_name' => $payment->payer_name,
            'certificate_type' => $payment->certificate_type,
            'timestamp' => now()->toDateTimeString(),
        ]);

        DB::beginTransaction();

        try {
            // Update clearance request status if this is a clearance payment
            if (!empty($payment->clearance_request_id)) {
                $clearanceRequest = ClearanceRequest::find($payment->clearance_request_id);
                if ($clearanceRequest && in_array($clearanceRequest->status, ['pending_payment', 'processing'])) {
                    $clearanceRequest->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => 'Payment cancelled: ' . $payment->or_number,
                    ]);
                    Log::info('PAYMENT_CANCEL: Associated clearance request cancelled', [
                        'clearance_request_id' => $clearanceRequest->id,
                        'old_status' => $clearanceRequest->getOriginal('status'),
                        'new_status' => 'cancelled',
                    ]);
                }
            }

            $payment->update([
                'status' => 'cancelled',
                'remarks' => ($payment->remarks ? $payment->remarks . "\n\n" : '') . 
                            'Cancelled on ' . now()->format('Y-m-d H:i:s') . ' by ' . Auth::user()->name,
            ]);

            DB::commit();

            // Log successful cancellation
            Log::warning('PAYMENT_CANCEL: Payment cancelled successfully', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'cancelled_by' => Auth::user()->name,
                'cancelled_at' => now()->toDateTimeString(),
                'cancelled_amount' => $payment->total_amount,
                'status_before' => 'active',
                'status_after' => 'cancelled',
                'clearance_request_updated' => !empty($payment->clearance_request_id),
            ]);

            return redirect()->route('payments.show', $payment->id)
                ->with('success', 'Payment cancelled successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('PAYMENT_CANCEL_ERROR: Payment cancellation failed', [
                'error_message' => $e->getMessage(),
                'payment_id' => $payment->id,
                'user_id' => Auth::id(),
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

        // Log refund request
        Log::warning('PAYMENT_REFUND: Payment refund requested', [
            'action' => 'refund',
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
            'payment_id' => $payment->id,
            'or_number' => $payment->or_number,
            'total_amount' => $payment->total_amount,
            'refund_reason' => $request->refund_reason,
            'certificate_type' => $payment->certificate_type,
            'timestamp' => now()->toDateTimeString(),
        ]);

        DB::beginTransaction();

        try {
            // Update clearance request status if this is a clearance payment
            if (!empty($payment->clearance_request_id)) {
                $clearanceRequest = ClearanceRequest::find($payment->clearance_request_id);
                if ($clearanceRequest) {
                    $clearanceRequest->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => 'Payment refunded: ' . $payment->or_number . ' - ' . $request->refund_reason,
                    ]);
                    Log::info('PAYMENT_REFUND: Associated clearance request cancelled due to refund', [
                        'clearance_request_id' => $clearanceRequest->id,
                        'old_status' => $clearanceRequest->getOriginal('status'),
                        'new_status' => 'cancelled',
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

            // Log successful refund
            Log::warning('PAYMENT_REFUND: Payment marked as refunded', [
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'refunded_by' => Auth::user()->name,
                'refunded_at' => now()->toDateTimeString(),
                'refund_reason' => $request->refund_reason,
                'refunded_amount' => $payment->total_amount,
                'status_before' => 'completed',
                'status_after' => 'refunded',
                'clearance_request_updated' => !empty($payment->clearance_request_id),
            ]);

            return redirect()->route('payments.show', $payment->id)
                ->with('success', 'Payment marked as refunded.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('PAYMENT_REFUND_ERROR: Payment refund failed', [
                'error_message' => $e->getMessage(),
                'payment_id' => $payment->id,
                'user_id' => Auth::id(),
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
        // Load all necessary data
        $payment->load([
            'items.fee',
            'recorder',
            'resident.household',
            'household.members',
            'clearanceRequest.clearanceType'
        ]);

        // You have two options here:

        // OPTION 1: Return an Inertia view for browser printing
        return Inertia::render('admin/Payments/Receipt', [
            'payment' => $payment,
            'barangay' => [
                'name' => 'Your Barangay Name',
                'logo' => null, // Add your barangay logo path if available
                'address' => 'Your Barangay Address',
                'contact' => 'Your Barangay Contact',
            ],
            'officer' => [
                'name' => auth()->user()->name ?? 'Barangay Treasurer',
                'position' => 'Barangay Treasurer',
                'signature' => null, // Add signature path if available
            ],
            'isClearancePayment' => !empty($payment->certificate_type),
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

        // Apply filters from request
        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Add clearance type filter
        if ($request->filled('certificate_type')) {
            $query->where('certificate_type', $request->input('certificate_type'));
        }

        $payments = $query->get();

        // Generate PDF using a blade view
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
                ->where('certificate_type', '!=', null)
                ->count(),
            'clearance_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('certificate_type', '!=', null)
                ->sum('total_amount'),
            'by_clearance_type' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->where('certificate_type', '!=', null)
                ->select('certificate_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('certificate_type')
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Create payment for clearance request.
     */
    public function createForClearance(Request $request, ClearanceRequest $clearanceRequest)
    {
        // Check if clearance request is eligible for payment
        if (!in_array($clearanceRequest->status, ['pending_payment', 'pending', 'processing'])) {
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
            'purpose' => $clearanceRequest->clearanceType->name ?? 'Clearance Fee',
            'certificate_type' => $clearanceRequest->clearanceType->code ?? 'clearance',
        ]);
    }

    /**
     * Get clearance types for dropdown.
     */
    public function getClearanceTypes()
    {
        $clearanceTypes = ClearanceType::active()
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                    'fee' => $type->fee,
                    'formatted_fee' => $type->formatted_fee,
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                ];
            });

        return response()->json($clearanceTypes);
    }
}