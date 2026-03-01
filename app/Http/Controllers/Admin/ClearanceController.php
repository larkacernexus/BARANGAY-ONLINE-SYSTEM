<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\Purok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ClearanceController extends Controller
{
   public function index(Request $request)
{
    $query = ClearanceRequest::query()
        ->with(['resident', 'household', 'business', 'clearanceType', 'issuingOfficer', 'payment'])
        ->latest();

    // Search filter
    if ($search = $request->input('search')) {
        $query->where(function ($q) use ($search) {
            $q->where('reference_number', 'like', "%{$search}%")
              ->orWhere('clearance_number', 'like', "%{$search}%")
              ->orWhere('purpose', 'like', "%{$search}%")
              ->orWhereHas('resident', function ($q) use ($search) {
                  $q->where(DB::raw("CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name)"), 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
              })
              // Add search for household and business
              ->orWhereHas('household', function ($q) use ($search) {
                  $q->where('household_number', 'like', "%{$search}%")
                    ->orWhere('head_name', 'like', "%{$search}%");
              })
              ->orWhereHas('business', function ($q) use ($search) {
                  $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%");
              });
        });
    }

    // Status filter
    if ($status = $request->input('status')) {
        $query->where('status', $status);
    }

    // Payment status filter
    if ($payment_status = $request->input('payment_status')) {
        $query->where('payment_status', $payment_status);
    }

    // Type filter
    if ($type = $request->input('type')) {
        $query->where('clearance_type_id', $type);
    }

    // Get paginated results with formatted data
    $clearances = $query->paginate(20)->through(function ($clearance) {
        // Build payer data based on payer_type
        $payerData = [
            'payer_type' => $clearance->payer_type,
            'payer_id' => $clearance->payer_id,
            'payer_name' => $clearance->payer_name,
            'payer_display' => $clearance->payer_display,
        ];

        // Add resident data if exists
        $residentData = $clearance->resident ? [
            'id' => $clearance->resident->id,
            'full_name' => $clearance->resident->full_name ?? $clearance->resident->getFullName(),
            'first_name' => $clearance->resident->first_name,
            'last_name' => $clearance->resident->last_name,
            'address' => $clearance->resident->address,
            'contact_number' => $clearance->resident->contact_number,
            'purok' => $clearance->resident->purok,
        ] : null;

        // Add household data if exists
        $householdData = $clearance->household ? [
            'id' => $clearance->household->id,
            'household_number' => $clearance->household->household_number,
            'head_name' => $clearance->household->head_name,
            'address' => $clearance->household->address,
            'purok' => $clearance->household->purok,
        ] : null;

        // Add business data if exists
        $businessData = $clearance->business ? [
            'id' => $clearance->business->id,
            'business_name' => $clearance->business->business_name,
            'owner_name' => $clearance->business->owner_name,
            'contact_number' => $clearance->business->contact_number,
            'address' => $clearance->business->address,
            'purok' => $clearance->business->purok,
            'owner_id' => $clearance->business->owner_id,
        ] : null;

        return array_merge(
            $clearance->toArray(),
            $payerData,
            [
                'resident' => $residentData,
                'household' => $householdData,
                'business' => $businessData,
                'clearance_type' => $clearance->clearanceType ? [
                    'id' => $clearance->clearanceType->id,
                    'name' => $clearance->clearanceType->name,
                    'code' => $clearance->clearanceType->code,
                    'fee' => (float) $clearance->clearanceType->fee,
                    'processing_days' => $clearance->clearanceType->processing_days,
                    'validity_days' => $clearance->clearanceType->validity_days,
                    'requires_payment' => (bool) $clearance->clearanceType->requires_payment,
                ] : null,
                'payment' => $clearance->payment ? [
                    'id' => $clearance->payment->id,
                    'or_number' => $clearance->payment->or_number,
                    'amount_paid' => $clearance->payment->amount_paid,
                    'status' => $clearance->payment->status,
                    'payment_date' => $clearance->payment->payment_date,
                ] : null,
                'status_display' => $clearance->status_display,
                'payment_status_display' => $clearance->payment_status_display,
                'urgency_display' => $clearance->urgency_display,
                'formatted_fee' => $clearance->formatted_fee,
                'formatted_amount_paid' => $clearance->formatted_amount_paid,
                'formatted_balance' => $clearance->formatted_balance,
                'is_valid' => $clearance->is_valid,
                'days_remaining' => $clearance->days_remaining,
                'is_fully_paid' => $clearance->is_fully_paid,
                'created_at' => $clearance->created_at->toDateTimeString(),
                'updated_at' => $clearance->updated_at->toDateTimeString(),
                'issue_date' => $clearance->issue_date?->toDateString(),
                'valid_until' => $clearance->valid_until?->toDateString(),
                'payment_date' => $clearance->payment_date?->toDateTimeString(),
                // Add contact info from the clearance
                'contact_number' => $clearance->contact_number,
                'contact_address' => $clearance->contact_address,
                'contact_purok' => $clearance->contact_purok,
            ]
        );
    });

    // Get stats with payment tracking
    $stats = [
        'total' => ClearanceRequest::count(),
        'totalIssued' => ClearanceRequest::where('status', 'issued')->count(),
        'issuedThisMonth' => ClearanceRequest::where('status', 'issued')
            ->whereMonth('issue_date', now()->month)
            ->whereYear('issue_date', now()->year)
            ->count(),
        'pending' => ClearanceRequest::where('status', 'pending')->count(),
        'pendingToday' => ClearanceRequest::where('status', 'pending')
            ->whereDate('created_at', today())
            ->count(),
        'expiringSoon' => ClearanceRequest::where('status', 'issued')
            ->where('valid_until', '<=', now()->addDays(30))
            ->where('valid_until', '>', now())
            ->count(),
        'totalRevenue' => (float) ClearanceRequest::where('status', 'issued')
            ->sum('amount_paid'),
        'unpaid' => ClearanceRequest::where('payment_status', 'unpaid')->count(),
        'partially_paid' => ClearanceRequest::where('payment_status', 'partially_paid')->count(),
        'paid' => ClearanceRequest::where('payment_status', 'paid')->count(),
        'pending_payment' => ClearanceRequest::where('status', 'pending_payment')->count(),
    ];

    // Get active clearance types with counts
    $clearanceTypes = ClearanceType::active()
        ->withCount(['clearanceRequests'])
        ->orderBy('name')
        ->get()
        ->map(function ($type) {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'fee' => (float) $type->fee,
                'formatted_fee' => $type->formatted_fee,
                'processing_days' => $type->processing_days,
                'validity_days' => $type->validity_days,
                'is_active' => (bool) $type->is_active,
                'description' => $type->description,
                'requires_payment' => (bool) $type->requires_payment,
                'document_types_count' => $type->document_types_count,
                'required_document_types_count' => $type->required_document_types_count,
                'total_requests' => $type->clearance_requests_count,
            ];
        });

    // Status options for filter
    $statusOptions = [
        ['value' => 'pending', 'label' => 'Pending Review'],
        ['value' => 'pending_payment', 'label' => 'Pending Payment'],
        ['value' => 'processing', 'label' => 'Under Processing'],
        ['value' => 'approved', 'label' => 'Approved'],
        ['value' => 'issued', 'label' => 'Issued'],
        ['value' => 'rejected', 'label' => 'Rejected'],
        ['value' => 'cancelled', 'label' => 'Cancelled'],
        ['value' => 'expired', 'label' => 'Expired'],
    ];

    // Payment status options
    $paymentStatusOptions = [
        ['value' => 'unpaid', 'label' => 'Unpaid'],
        ['value' => 'partially_paid', 'label' => 'Partially Paid'],
        ['value' => 'paid', 'label' => 'Paid'],
    ];

    return Inertia::render('admin/Clearances/Index', [
        'clearances' => $clearances,
        'stats' => $stats,
        'clearanceTypes' => $clearanceTypes,
        'filters' => $request->only(['search', 'status', 'type', 'payment_status']),
        'statusOptions' => $statusOptions,
        'paymentStatusOptions' => $paymentStatusOptions,
    ]);
}

    /**
     * Show the form for creating a new clearance request.
     */
    public function create()
    {
        // Fetch residents with their purok
        $residents = Resident::with('purok')
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'suffix', 'address', 'contact_number', 'purok_id', 'household_id', 'email'])
            ->orderBy('last_name')
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'suffix' => $resident->suffix,
                    'address' => $resident->address,
                    'contact_number' => $resident->contact_number,
                    'email' => $resident->email,
                    'purok' => $resident->purok ? $resident->purok->name : null,
                    'purok_id' => $resident->purok_id,
                    'type' => 'resident',
                    'type_label' => 'Resident',
                    'icon' => 'User',
                    'household_id' => $resident->household_id,
                ];
            });
        
        // Fetch households with head member
        $households = Household::with(['purok', 'householdMembers.resident'])
            ->select([
                'id', 
                'household_number', 
                'address', 
                'purok_id',
                'contact_number',
                'email',
                'member_count',
                'status'
            ])
            ->where('status', 'active')
            ->orderBy('household_number')
            ->get()
            ->map(function ($household) {
                // Get head member through householdMembers relationship
                $headMember = $household->householdMembers()
                    ->where('is_head', true)
                    ->with('resident')
                    ->first();
                
                $headName = $headMember && $headMember->resident 
                    ? $headMember->resident->full_name 
                    : 'No Head Assigned';
                
                $headId = $headMember ? $headMember->resident_id : null;
                $contactNumber = $headMember && $headMember->resident 
                    ? ($headMember->resident->contact_number ?? $household->contact_number)
                    : $household->contact_number;
                
                $email = $headMember && $headMember->resident 
                    ? ($headMember->resident->email ?? $household->email)
                    : $household->email;
                
                return [
                    'id' => $household->id,
                    'name' => $headName . ' (Household)',
                    'household_number' => $household->household_number,
                    'head_name' => $headName,
                    'head_id' => $headId,
                    'address' => $household->address,
                    'contact_number' => $contactNumber,
                    'email' => $email,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'purok_id' => $household->purok_id,
                    'type' => 'household',
                    'type_label' => 'Household',
                    'icon' => 'Home',
                    'member_count' => $household->member_count,
                    'has_user_account' => $household->has_user_account,
                ];
            });
        
        // Fetch businesses
        $businesses = Business::with(['purok', 'owner'])
            ->select([
                'id', 
                'business_name', 
                'owner_id', 
                'owner_name', 
                'address', 
                'contact_number', 
                'purok_id',
                'business_type',
                'status',
                'permit_expiry_date',
                'dti_sec_number',
                'tin_number',
                'mayors_permit_number',
                'employee_count',
                'capital_amount',
                'monthly_gross',
            ])
            ->where('status', 'active')
            ->orderBy('business_name')
            ->get()
            ->map(function ($business) {
                // Get owner email if available
                $email = null;
                if ($business->owner_id && $business->owner) {
                    $email = $business->owner->email;
                }
                
                return [
                    'id' => $business->id,
                    'name' => $business->business_name . ' (Business)',
                    'business_name' => $business->business_name,
                    'owner_name' => $business->owner_display,
                    'owner_id' => $business->owner_id,
                    'owner_email' => $email,
                    'business_type' => $business->business_type,
                    'business_type_label' => $business->business_type_label,
                    'address' => $business->address,
                    'contact_number' => $business->contact_number,
                    'email' => $email,
                    'purok' => $business->purok_name,
                    'purok_id' => $business->purok_id,
                    'type' => 'business',
                    'type_label' => 'Business',
                    'icon' => 'Building',
                    'status' => $business->status,
                    'status_label' => $business->status_label,
                    'permit_status' => $business->permit_status,
                    'permit_status_label' => $business->permit_status_label,
                    'permit_expiry_date' => $business->permit_expiry_date?->format('Y-m-d'),
                    'is_permit_valid' => $business->hasValidPermit(),
                    'is_permit_expiring_soon' => $business->is_permit_expiring_soon,
                    'dti_sec_number' => $business->dti_sec_number,
                    'tin_number' => $business->tin_number,
                    'mayors_permit_number' => $business->mayors_permit_number,
                    'employee_count' => $business->employee_count,
                    'capital_amount' => $business->capital_amount,
                    'monthly_gross' => $business->monthly_gross,
                    'formatted_capital' => $business->formatted_capital,
                    'formatted_monthly_gross' => $business->formatted_monthly_gross,
                ];
            });
        
        // Get active clearance types with is_discountable flag
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                    'fee' => (float) $type->fee,
                    'formatted_fee' => $type->formatted_fee,
                    'processing_days' => (int) $type->processing_days,
                    'validity_days' => (int) $type->validity_days,
                    'requires_payment' => (bool) $type->requires_payment,
                    'requires_approval' => (bool) $type->requires_approval,
                    'is_online_only' => (bool) $type->is_online_only,
                    'is_discountable' => (bool) $type->is_discountable,
                    'requirements' => $type->requirements ?? [],
                    'purpose_options' => $type->purpose_options ? 
                        (is_array($type->purpose_options) ? $type->purpose_options : 
                            array_map('trim', explode(',', $type->purpose_options))) : 
                        ['Employment', 'Business Registration', 'Travel', 'School Requirement', 'Government Transaction', 'Loan Application', 'Other'],
                ];
            });
        
        // Default purpose options
        $defaultPurposeOptions = [
            'Employment',
            'Business Registration',
            'Travel',
            'School Requirement',
            'Government Transaction',
            'Loan Application',
            'Other',
        ];
        
        // Combine all payers for search
        $allPayers = collect()
            ->merge($residents)
            ->merge($households)
            ->merge($businesses)
            ->sortBy('name')
            ->values()
            ->all();
        
        return Inertia::render('admin/Clearances/Create', [
            // Individual lists
            'residents' => $residents,
            'households' => $households,
            'businesses' => $businesses,
            
            // Combined list for search
            'payers' => $allPayers,
            
            // Payer type counts for UI
            'payer_counts' => [
                'residents' => $residents->count(),
                'households' => $households->count(),
                'businesses' => $businesses->count(),
                'total' => count($allPayers),
            ],
            
            'clearanceTypes' => $clearanceTypes,
            'activeClearanceTypes' => $clearanceTypes,
            'purposeOptions' => $defaultPurposeOptions,
        ]);
    }
    
   /**
 * Store a newly created clearance request in storage.
 */
public function store(Request $request)
{
    try {
        Log::info('ClearanceController@store started', [
            'user_id' => auth()->id(),
            'request_data' => $request->except(['_token'])
        ]);

        $validator = Validator::make($request->all(), [
            // Payer information
            'payer_type' => 'required|in:resident,household,business',
            'payer_id' => 'required',
            
            // Keep resident_id for backward compatibility but make it optional
            'resident_id' => 'nullable|exists:residents,id',
            
            // Clearance details
            'clearance_type_id' => 'required|exists:clearance_types,id',
            'purpose' => 'required|string|max:500',
            'specific_purpose' => 'nullable|string|max:500',
            'urgency' => 'required|in:normal,rush,express',
            'needed_date' => 'required|date|after_or_equal:today',
            'additional_requirements' => 'nullable|string',
            'fee_amount' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
            'proceed_to_payment' => 'nullable|boolean',
        ]);
        
        // Validate that the payer_id exists in the correct table based on payer_type
        $validator->after(function ($validator) use ($request) {
            $payerType = $request->payer_type;
            $payerId = $request->payer_id;
            
            if ($payerType === 'resident') {
                if (!Resident::where('id', $payerId)->exists()) {
                    $validator->errors()->add('payer_id', 'Selected resident does not exist.');
                }
            } elseif ($payerType === 'household') {
                if (!Household::where('id', $payerId)->exists()) {
                    $validator->errors()->add('payer_id', 'Selected household does not exist.');
                }
            } elseif ($payerType === 'business') {
                if (!Business::where('id', $payerId)->exists()) {
                    $validator->errors()->add('payer_id', 'Selected business does not exist.');
                }
            }
        });
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        DB::beginTransaction();

        // Get clearance type
        $clearanceType = ClearanceType::find($request->clearance_type_id);
        
        // Get payer information based on type
        $payer = $this->getPayer($request->payer_type, $request->payer_id);
        
        // Set resident_id based on payer_type (for backward compatibility)
        $residentId = null;
        if ($request->payer_type === 'resident') {
            $residentId = $request->payer_id;
        } elseif ($request->payer_type === 'household' && $payer) {
            // For household, try to get the head resident's ID
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->first();
            if ($headMember) {
                $residentId = $headMember->resident_id;
            }
        } elseif ($request->payer_type === 'business' && $payer && $payer->owner_id) {
            // For business, use the owner's resident ID if available
            $residentId = $payer->owner_id;
        }
        
        // Get contact information from payer
        $contactInfo = $this->getContactInfoFromPayer($payer, $request->payer_type);
        
        // Calculate fee if not provided
        $feeAmount = $request->fee_amount;
        if ($clearanceType && ($feeAmount === null || $feeAmount === 0)) {
            $feeAmount = $clearanceType->fee ?? 0;
        }
        
        // Adjust fee based on urgency (only if fee > 0)
        if ($feeAmount > 0) {
            if ($request->urgency === 'rush') {
                $feeAmount *= 1.5; // 50% surcharge for rush
            } elseif ($request->urgency === 'express') {
                $feeAmount *= 2.0; // 100% surcharge for express
            }
        }
        
        // Round to 2 decimal places
        $feeAmount = round($feeAmount, 2);
        
        // Generate reference number
        $referenceNumber = $this->generateReferenceNumber();
        
        // Determine initial status and payment status based on fee amount
        $status = 'pending';
        $paymentStatus = 'unpaid';
        $balance = $feeAmount;
        
        // Check if clearance type requires payment and has fee
        if ($clearanceType) {
            if ($feeAmount > 0 && $clearanceType->requires_payment) {
                // Fee-based clearance that requires payment
                $status = 'pending_payment';
                Log::info('Fee-based clearance - requires payment', [
                    'clearance_type' => $clearanceType->name,
                    'fee' => $feeAmount,
                    'status' => $status
                ]);
            } elseif ($feeAmount == 0) {
                // Zero-fee clearance (like Indigency Certificate)
                $paymentStatus = 'paid'; // Mark as paid automatically since no payment required
                $balance = 0;
                
                // Determine if approval is required
                if ($clearanceType->requires_approval) {
                    // If approval required, stay in pending for review
                    $status = 'pending';
                    Log::info('Zero-fee clearance - pending approval', [
                        'clearance_type' => $clearanceType->name,
                        'fee' => $feeAmount,
                        'status' => $status
                    ]);
                } else {
                    // If no approval required, go directly to processing
                    $status = 'processing';
                    Log::info('Zero-fee clearance - auto-processed', [
                        'clearance_type' => $clearanceType->name,
                        'fee' => $feeAmount,
                        'status' => $status
                    ]);
                }
            } elseif ($feeAmount > 0 && !$clearanceType->requires_payment) {
                // Fee-based but payment not required (unusual case, but handle it)
                $paymentStatus = 'paid';
                $balance = 0;
                $status = 'processing';
                Log::info('Fee-based clearance but payment not required - auto-processed', [
                    'clearance_type' => $clearanceType->name,
                    'fee' => $feeAmount,
                    'status' => $status
                ]);
            }
        }
        
        // Get current admin
        $admin = auth()->user();
        
        // Get requested by user ID (if payer has user account)
        $requestedByUserId = $this->getRequestedByUserId($payer, $request->payer_type);
        
        // Create the clearance request with ALL fields properly set
        $clearanceRequest = ClearanceRequest::create([
            // Payer information - THESE ARE THE KEY FIELDS THAT WERE NULL BEFORE
            'payer_type' => $request->payer_type,
            'payer_id' => $request->payer_id,
            'resident_id' => $residentId, // For backward compatibility
            
            // Contact snapshot
            'contact_name' => $contactInfo['name'],
            'contact_number' => $contactInfo['contact_number'],
            'contact_address' => $contactInfo['address'],
            'contact_purok_id' => $contactInfo['purok_id'],
            'contact_email' => $contactInfo['email'],
            
            // Clearance details
            'clearance_type_id' => $request->clearance_type_id,
            'reference_number' => $referenceNumber,
            'purpose' => $request->purpose,
            'specific_purpose' => $request->specific_purpose,
            'urgency' => $request->urgency,
            'needed_date' => $request->needed_date,
            'additional_requirements' => $request->additional_requirements,
            'fee_amount' => $feeAmount,
            'status' => $status,
            'remarks' => $request->remarks,
            
            // Payment tracking fields
            'payment_status' => $paymentStatus,
            'amount_paid' => 0,
            'balance' => $balance,
            
            // Admin info
            'issuing_officer_id' => $admin->id,
            'issuing_officer_name' => $admin->name,
            'requested_by_user_id' => $requestedByUserId,
            'processed_by' => $admin->id,
            'processed_at' => now(),
        ]);

        // Log activity based on the outcome
        if ($feeAmount == 0) {
            if ($status === 'processing') {
                activity()
                    ->performedOn($clearanceRequest)
                    ->causedBy($admin)
                    ->withProperties([
                        'reason' => 'Zero-fee clearance type (no payment required)',
                        'clearance_type' => $clearanceType->name,
                        'fee' => $feeAmount,
                        'payer_type' => $request->payer_type,
                        'payer_id' => $request->payer_id,
                    ])
                    ->event('auto_processed')
                    ->log('Clearance request auto-processed (no payment required)');
            } else {
                activity()
                    ->performedOn($clearanceRequest)
                    ->causedBy($admin)
                    ->withProperties([
                        'reason' => 'Zero-fee clearance type pending approval',
                        'clearance_type' => $clearanceType->name,
                        'fee' => $feeAmount,
                        'payer_type' => $request->payer_type,
                        'payer_id' => $request->payer_id,
                    ])
                    ->event('created')
                    ->log('Clearance request created (pending approval, no payment required)');
            }
        }

        DB::commit();

        Log::info('Clearance request created successfully', [
            'clearance_id' => $clearanceRequest->id,
            'reference_number' => $referenceNumber,
            'payer_type' => $request->payer_type,
            'payer_id' => $request->payer_id,
            'resident_id' => $residentId,
            'fee_amount' => $feeAmount,
            'payment_status' => $paymentStatus,
            'status' => $status,
            'proceed_to_payment' => $request->input('proceed_to_payment', false),
            'is_zero_fee' => $feeAmount == 0
        ]);

        // Handle redirect based on fee and payment requirement
        if ($feeAmount > 0 && $request->input('proceed_to_payment', false)) {
            // Load relationships for payment page
            $clearanceRequest->load(['clearanceType']);
            
            // Build payment URL parameters
            $params = http_build_query([
                'clearance_request_id' => $clearanceRequest->id,
                'clearance_type_id' => $clearanceRequest->clearance_type_id,
                'payer_type' => $request->payer_type,
                'payer_id' => $request->payer_id,
                'payer_name' => $contactInfo['name'],
                'contact_number' => $contactInfo['contact_number'],
                'address' => $contactInfo['address'],
                'purok' => $contactInfo['purok'],
                'purpose' => $clearanceType->name . ' Clearance',
                'fee_amount' => $feeAmount,
            ]);
            
            return redirect()->route('payments.create') . '?' . $params;
        } 
        
        // For zero-fee clearances, redirect with appropriate message
        if ($feeAmount == 0) {
            if ($status === 'processing') {
                return redirect()->route('clearances.show', $clearanceRequest->id)
                    ->with('success', 'Clearance request created and auto-processed successfully! No payment required. Reference number: ' . $referenceNumber);
            } else {
                return redirect()->route('clearances.show', $clearanceRequest->id)
                    ->with('success', 'Clearance request created successfully! No payment required, pending review. Reference number: ' . $referenceNumber);
            }
        }

        // Default redirect for fee-based clearances
        return redirect()->route('clearances.show', $clearanceRequest->id)
            ->with('success', 'Clearance request created successfully! Reference number: ' . $referenceNumber);

    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('ClearanceController@store error', [
            'user_id' => auth()->id(),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return redirect()->back()
            ->withInput()
            ->withErrors(['error' => 'Failed to create clearance request. Please try again.']);
    }
}
    
    /**
     * Show the form for editing the specified clearance request.
     */
    public function edit(ClearanceRequest $clearance)
    {
        // Load necessary relationships
        $clearance->load(['clearanceType', 'contactPurok', 'payment']);
        
        // Load payer based on type
        if ($clearance->payer_type === 'resident') {
            $clearance->load('resident.purok');
        } elseif ($clearance->payer_type === 'household') {
            $clearance->load(['household' => function ($query) {
                $query->with(['householdMembers.resident', 'purok']);
            }]);
        } elseif ($clearance->payer_type === 'business') {
            $clearance->load(['business' => function ($query) {
                $query->with(['owner', 'purok']);
            }]);
        }
        
        // Get active clearance types
        $clearanceTypes = ClearanceType::active()
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                    'fee' => (float) $type->fee,
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                    'formatted_fee' => $type->formatted_fee,
                    'requires_payment' => $type->requires_payment,
                    'requires_approval' => $type->requires_approval,
                    'is_online_only' => $type->is_online_only,
                    'is_discountable' => (bool) $type->is_discountable,
                    'requirements' => $type->documentRequirements()->get()->map(function ($req) {
                        return $req->name;
                    })->toArray(),
                    'purpose_options' => $type->purpose_options,
                ];
            });

        // Format the data for Inertia
        $formattedClearance = [
            'id' => $clearance->id,
            'reference_number' => $clearance->reference_number,
            'clearance_number' => $clearance->clearance_number,
            
            // Payer information
            'payer_type' => $clearance->payer_type,
            'payer_id' => $clearance->payer_id,
            'payer_name' => $clearance->payer_name,
            'payer_display' => $clearance->payer_display,
            'resident_id' => $clearance->resident_id,
            
            // Contact snapshot
            'contact_name' => $clearance->contact_name,
            'contact_number' => $clearance->contact_number,
            'contact_address' => $clearance->contact_address,
            'contact_purok' => $clearance->contactPurok?->name,
            'contact_purok_id' => $clearance->contact_purok_id,
            'contact_email' => $clearance->contact_email,
            
            // Clearance details
            'purpose' => $clearance->purpose,
            'specific_purpose' => $clearance->specific_purpose,
            'clearance_type_id' => $clearance->clearance_type_id,
            'urgency' => $clearance->urgency,
            'fee_amount' => (float) $clearance->fee_amount,
            'needed_date' => $clearance->needed_date?->toDateString(),
            'additional_requirements' => $clearance->additional_requirements,
            'admin_notes' => $clearance->admin_notes,
            'remarks' => $clearance->remarks,
            'status' => $clearance->status,
            'issue_date' => $clearance->issue_date?->toDateString(),
            'valid_until' => $clearance->valid_until?->toDateString(),
            'created_at' => $clearance->created_at->toDateTimeString(),
            'updated_at' => $clearance->updated_at->toDateTimeString(),
            
            // Payment tracking fields
            'payment_id' => $clearance->payment_id,
            'payment_status' => $clearance->payment_status,
            'amount_paid' => (float) $clearance->amount_paid,
            'balance' => (float) $clearance->balance,
            'payment_date' => $clearance->payment_date?->toDateTimeString(),
            'or_number' => $clearance->or_number,
            
            // Relationships
            'clearance_type' => $clearance->clearanceType ? [
                'id' => $clearance->clearanceType->id,
                'name' => $clearance->clearanceType->name,
                'code' => $clearance->clearanceType->code,
                'description' => $clearance->clearanceType->description,
                'fee' => (float) $clearance->clearanceType->fee,
                'processing_days' => $clearance->clearanceType->processing_days,
                'validity_days' => $clearance->clearanceType->validity_days,
                'requires_payment' => $clearance->clearanceType->requires_payment,
                'requires_approval' => $clearance->clearanceType->requires_approval,
                'is_online_only' => $clearance->clearanceType->is_online_only,
                'is_discountable' => (bool) $clearance->clearanceType->is_discountable,
            ] : null,
            
            'payment' => $clearance->payment ? [
                'id' => $clearance->payment->id,
                'or_number' => $clearance->payment->or_number,
                'amount' => $clearance->payment->amount_paid,
                'formatted_amount' => '₱' . number_format($clearance->payment->amount_paid, 2),
                'status' => $clearance->payment->status,
                'status_display' => ucfirst($clearance->payment->status),
                'payment_method' => $clearance->payment->payment_method,
                'payment_method_display' => ucfirst($clearance->payment->payment_method),
                'payment_date' => $clearance->payment->payment_date,
                'reference_number' => $clearance->payment->reference_number,
                'paid_at' => $clearance->payment->payment_date,
            ] : null,
            
            // Payer specific data
            'resident' => $clearance->resident ? [
                'id' => $clearance->resident->id,
                'full_name' => $clearance->resident->full_name,
                'address' => $clearance->resident->address,
                'contact_number' => $clearance->resident->contact_number,
                'email' => $clearance->resident->email,
                'birth_date' => $clearance->resident->birth_date,
                'gender' => $clearance->resident->gender,
                'civil_status' => $clearance->resident->civil_status,
                'occupation' => $clearance->resident->occupation,
            ] : null,
            
            'household' => $clearance->household ? [
                'id' => $clearance->household->id,
                'household_number' => $clearance->household->household_number,
                'head_name' => $clearance->household->current_head_name,
                'head_of_household' => $clearance->household->head_of_household ? [
                    'id' => $clearance->household->head_of_household->id,
                    'full_name' => $clearance->household->head_of_household->full_name,
                ] : null,
                'member_count' => $clearance->household->member_count,
                'has_user_account' => $clearance->household->has_user_account,
            ] : null,
            
            'business' => $clearance->business ? [
                'id' => $clearance->business->id,
                'business_name' => $clearance->business->business_name,
                'business_type' => $clearance->business->business_type,
                'business_type_label' => $clearance->business->business_type_label,
                'owner_name' => $clearance->business->owner_display,
                'owner_id' => $clearance->business->owner_id,
                'permit_status' => $clearance->business->permit_status,
                'permit_status_label' => $clearance->business->permit_status_label,
                'permit_expiry_date' => $clearance->business->permit_expiry_date?->format('Y-m-d'),
                'has_valid_permit' => $clearance->business->hasValidPermit(),
                'dti_sec_number' => $clearance->business->dti_sec_number,
                'tin_number' => $clearance->business->tin_number,
                'mayors_permit_number' => $clearance->business->mayors_permit_number,
                'employee_count' => $clearance->business->employee_count,
                'capital_amount' => $clearance->business->capital_amount,
                'monthly_gross' => $clearance->business->monthly_gross,
                'formatted_capital' => $clearance->business->formatted_capital,
                'formatted_monthly_gross' => $clearance->business->formatted_monthly_gross,
                'status' => $clearance->business->status,
                'status_label' => $clearance->business->status_label,
            ] : null,
            
            // Display helpers
            'status_display' => $clearance->status_display,
            'payment_status_display' => $clearance->payment_status_display,
            'urgency_display' => $clearance->urgency_display,
            'formatted_fee' => $clearance->formatted_fee,
            'formatted_amount_paid' => $clearance->formatted_amount_paid,
            'formatted_balance' => $clearance->formatted_balance,
            'is_valid' => $clearance->is_valid,
            'days_remaining' => $clearance->days_remaining,
            'is_fully_paid' => $clearance->is_fully_paid,
        ];

        // Get purpose options from clearance type
        $purposeOptions = [];
        if ($clearance->clearanceType && $clearance->clearanceType->purpose_options) {
            $purposeOptions = is_array($clearance->clearanceType->purpose_options) 
                ? $clearance->clearanceType->purpose_options
                : array_map('trim', explode(',', $clearance->clearanceType->purpose_options));
        }

        return Inertia::render('admin/Clearances/Edit', [
            'clearance' => $formattedClearance,
            'clearanceTypes' => $clearanceTypes,
            'purposeOptions' => $purposeOptions,
        ]);
    }

    /**
     * Update the specified clearance request in storage.
     */
    public function update(Request $request, ClearanceRequest $clearance)
    {
        // Define validation rules based on status
        $rules = [
            'purpose' => 'required|string|max:255',
            'specific_purpose' => 'nullable|string|max:500',
            'needed_date' => 'required|date|after_or_equal:today',
            'additional_requirements' => 'nullable|string|max:1000',
            'remarks' => 'nullable|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000',
        ];

        // Add rules based on status
        if (in_array($clearance->status, ['pending', 'pending_payment'])) {
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
            $rules['urgency'] = 'required|in:normal,rush,express';
            $rules['fee_amount'] = 'required|numeric|min:0';
        } elseif (in_array($clearance->status, ['processing', 'approved'])) {
            $rules['fee_amount'] = 'required|numeric|min:0';
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
        } elseif (in_array($clearance->status, ['issued', 'rejected', 'cancelled', 'expired'])) {
            // Only admin notes can be updated for these statuses
            $rules = ['admin_notes' => 'nullable|string|max:1000'];
        } else {
            $rules['clearance_type_id'] = 'required|exists:clearance_types,id';
            $rules['urgency'] = 'required|in:normal,rush,express';
            $rules['fee_amount'] = 'required|numeric|min:0';
        }
        
        $request->validate($rules);

        // Determine which fields can be updated based on status
        $editableFields = ['admin_notes']; // Always editable
        
        if (in_array($clearance->status, ['pending', 'pending_payment'])) {
            $editableFields = array_merge($editableFields, [
                'purpose',
                'specific_purpose',
                'clearance_type_id',
                'urgency',
                'needed_date',
                'additional_requirements',
                'fee_amount',
                'remarks',
            ]);
        } elseif (in_array($clearance->status, ['processing', 'approved'])) {
            $editableFields = array_merge($editableFields, [
                'purpose',
                'specific_purpose',
                'needed_date',
                'additional_requirements',
                'fee_amount',
                'remarks',
            ]);
        }

        // Get changed fields for audit log
        $original = $clearance->toArray();
        $changed = [];
        
        foreach ($editableFields as $field) {
            $oldValue = $original[$field] ?? null;
            $newValue = $request->input($field);
            
            // Format dates for comparison
            if (in_array($field, ['needed_date', 'issue_date', 'valid_until'])) {
                if ($oldValue instanceof \DateTimeInterface) {
                    $oldValue = $oldValue->format('Y-m-d');
                }
                if ($newValue instanceof \DateTimeInterface) {
                    $newValue = $newValue->format('Y-m-d');
                }
            }
            
            // Compare values
            if ($oldValue != $newValue) {
                $changed[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        // If fee amount changed, update balance
        if (isset($changed['fee_amount'])) {
            $clearance->balance = $clearance->fee_amount - $clearance->amount_paid;
            
            // Update payment status based on new balance
            if ($clearance->balance <= 0) {
                $clearance->payment_status = 'paid';
            } elseif ($clearance->amount_paid > 0) {
                $clearance->payment_status = 'partially_paid';
            }
        }

        // Log the activity
        if (!empty($changed)) {
            activity()
                ->performedOn($clearance)
                ->causedBy(auth()->user())
                ->withProperties([
                    'changes' => $changed,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->event('updated')
                ->log('Clearance request was updated');
        }

        // Update the clearance
        $clearance->update($request->only($editableFields));

        return redirect()->route('clearances.show', $clearance)
            ->with('success', 'Clearance request updated successfully.');
    }

    /**
     * Display the specified clearance request.
     */
    public function show(ClearanceRequest $clearance)
    {
        // Load all necessary relationships
        $clearance->load([
            'clearanceType',
            'contactPurok',
            'issuingOfficer',
            'processedBy',
            'requestedBy',
            'payment',
            'paymentItems',
            'documents',
            'activities' => function ($query) {
                $query->with('causer')->orderBy('created_at', 'desc');
            }
        ]);
        
        // Load payer based on type
        if ($clearance->payer_type === 'resident') {
            $clearance->load('resident.purok');
        } elseif ($clearance->payer_type === 'household') {
            $clearance->load(['household' => function ($query) {
                $query->with(['householdMembers.resident', 'purok', 'user']);
            }]);
        } elseif ($clearance->payer_type === 'business') {
            $clearance->load(['business' => function ($query) {
                $query->with(['owner', 'purok']);
            }]);
        }

        // Get activity logs
        $activityLogs = $clearance->activities->map(function ($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'event' => $activity->event,
                'user' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                ] : null,
                'created_at' => $activity->created_at->toDateTimeString(),
                'formatted_date' => $activity->created_at->format('F j, Y g:i A'),
                'properties' => $activity->properties,
            ];
        });

        // Determine permissions
        $user = auth()->user();
        $canEdit = in_array($clearance->status, ['pending', 'pending_payment', 'processing']) && 
                   $user->can('manage-clearances');
        $canDelete = in_array($clearance->status, ['pending', 'pending_payment']) && 
                     $user->can('manage-clearances');
        $canProcess = in_array($clearance->status, ['pending', 'pending_payment', 'processing']) && 
                      $user->can('process-clearances');
        $canIssue = $clearance->status === 'approved' && $user->can('issue-clearances');
        $canApprove = $clearance->status === 'processing' && $user->can('approve-clearances');
        $canPrint = $clearance->status === 'issued' && $user->can('print-clearances');

        return Inertia::render('admin/Clearances/Show', [
            'clearance' => $clearance,
            'activityLogs' => $activityLogs,
            'canEdit' => $canEdit,
            'canDelete' => $canDelete,
            'canProcess' => $canProcess,
            'canIssue' => $canIssue,
            'canApprove' => $canApprove,
            'canPrint' => $canPrint,
        ]);
    }

    /**
     * Mark clearance as processing.
     */
    public function process(ClearanceRequest $clearance)
    {
        if (!in_array($clearance->status, ['pending', 'pending_payment'])) {
            return redirect()->back()->with('error', 'Cannot process clearance request in current status.');
        }

        $clearance->markAsProcessing(auth()->id());

        return redirect()->back()->with('success', 'Clearance request marked as processing.');
    }

    /**
     * Approve clearance request.
     */
    public function approve(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'processing') {
            return redirect()->back()->with('error', 'Cannot approve clearance request in current status.');
        }

        // Check if payment is required and completed
        if ($clearance->clearanceType->requires_payment && $clearance->payment_status !== 'paid') {
            return redirect()->back()->with('error', 'Cannot approve: Payment is required and not yet completed.');
        }

        $clearance->approve();

        return redirect()->back()->with('success', 'Clearance request approved successfully.');
    }

    /**
     * Issue clearance certificate.
     */
    public function issue(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'approved') {
            return redirect()->back()->with('error', 'Cannot issue clearance in current status.');
        }

        $clearance->issue();

        return redirect()->back()->with('success', 'Clearance certificate issued successfully.');
    }

    /**
     * Reject clearance request.
     */
    public function reject(Request $request, ClearanceRequest $clearance)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!in_array($clearance->status, ['pending', 'processing'])) {
            return redirect()->back()->with('error', 'Cannot reject clearance request in current status.');
        }

        $clearance->reject($request->reason, auth()->id());

        return redirect()->back()->with('success', 'Clearance request rejected.');
    }

    /**
     * Cancel clearance request.
     */
    public function cancel(Request $request, ClearanceRequest $clearance)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        if (!in_array($clearance->status, ['pending', 'pending_payment', 'processing'])) {
            return redirect()->back()->with('error', 'Cannot cancel clearance request in current status.');
        }

        $clearance->cancel($request->reason, false);

        return redirect()->back()->with('success', 'Clearance request cancelled.');
    }

    /**
     * Delete clearance request.
     */
    public function destroy(ClearanceRequest $clearance)
    {
        if (!in_array($clearance->status, ['pending', 'pending_payment'])) {
            return redirect()->back()->with('error', 'Cannot delete clearance request in current status.');
        }

        // Check if there are payments
        if ($clearance->payment_id || $clearance->paymentItems()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete clearance request with associated payments.');
        }

        $clearance->delete();

        return redirect()->route('clearances.index')->with('success', 'Clearance request deleted.');
    }

    /**
     * Print clearance certificate.
     */
    public function print(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'issued') {
            return redirect()->back()->with('error', 'Cannot print clearance that is not issued.');
        }

        $clearance->load(['clearanceType', 'resident', 'issuingOfficer']);

        return Inertia::render('admin/Clearances/Print', [
            'clearance' => $clearance,
        ]);
    }

    /**
     * Download clearance certificate.
     */
    public function download(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'issued') {
            return redirect()->back()->with('error', 'Cannot download clearance that is not issued.');
        }

        // Generate PDF download logic here
        // This would typically use a PDF library like DomPDF or mPDF
        
        return redirect()->back()->with('info', 'Download functionality to be implemented.');
    }

    // ========== HELPER METHODS ==========

    /**
     * Get payer model based on type and ID.
     */
    private function getPayer(string $type, int $id)
    {
        return match($type) {
            'resident' => Resident::with('purok')->find($id),
            'household' => Household::with(['householdMembers.resident', 'purok'])->find($id),
            'business' => Business::with(['owner', 'purok'])->find($id),
            default => null,
        };
    }

    /**
     * Get contact information from payer.
     */
    private function getContactInfoFromPayer($payer, string $type): array
    {
        $contactInfo = [
            'name' => null,
            'contact_number' => null,
            'address' => null,
            'purok_id' => null,
            'purok' => null,
            'email' => null,
        ];

        if (!$payer) {
            return $contactInfo;
        }

        if ($type === 'resident') {
            $contactInfo['name'] = $payer->full_name;
            $contactInfo['contact_number'] = $payer->contact_number;
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok?->name;
            $contactInfo['email'] = $payer->email;
        } elseif ($type === 'household') {
            // Get head member through householdMembers relationship
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->with('resident')
                ->first();
                
            if ($headMember && $headMember->resident) {
                $contactInfo['name'] = $headMember->resident->full_name;
                $contactInfo['contact_number'] = $headMember->resident->contact_number ?? $payer->contact_number;
                $contactInfo['email'] = $headMember->resident->email ?? $payer->email;
            } else {
                $contactInfo['name'] = 'Household ' . $payer->household_number;
                $contactInfo['contact_number'] = $payer->contact_number;
                $contactInfo['email'] = $payer->email;
            }
            
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok?->name;
        } elseif ($type === 'business') {
            $contactInfo['name'] = $payer->business_name;
            $contactInfo['contact_number'] = $payer->contact_number;
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok_name;
            
            // Get email from owner if available
            if ($payer->owner_id && $payer->owner) {
                $contactInfo['email'] = $payer->owner->email;
            }
        }

        return $contactInfo;
    }

    /**
     * Get requested by user ID if payer has user account.
     */
    private function getRequestedByUserId($payer, string $type): ?int
    {
        if ($type === 'resident' && $payer && $payer->user) {
            return $payer->user->id;
        }
        
        if ($type === 'household' && $payer) {
            // Check if household has user account
            if ($payer->has_user_account && $payer->user_id) {
                return $payer->user_id;
            }
            
            // Check head member's user account
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->with('resident.user')
                ->first();
                
            if ($headMember && $headMember->resident && $headMember->resident->user) {
                return $headMember->resident->user->id;
            }
        }
        
        if ($type === 'business' && $payer && $payer->owner && $payer->owner->user) {
            return $payer->owner->user->id;
        }
        
        return null;
    }

    /**
     * Generate a unique reference number.
     */
    private function generateReferenceNumber(): string
    {
        $prefix = 'CLR-' . date('Ymd') . '-';
        $lastRequest = ClearanceRequest::where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) str_replace($prefix, '', $lastRequest->reference_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }

    /**
     * Verify all pending documents.
     */
    public function verifyAllDocuments(ClearanceRequest $clearance)
    {
        if (!$clearance->documents()->where('is_verified', false)->exists()) {
            return redirect()->back()->with('info', 'No pending documents to verify.');
        }

        $clearance->documents()->where('is_verified', false)->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('All pending documents verified');

        return redirect()->back()->with('success', 'All pending documents verified successfully.');
    }

    /**
     * Request more documents.
     */
    public function requestMoreDocuments(Request $request, ClearanceRequest $clearance)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        // Update status to pending if it was in processing
        if ($clearance->status === 'processing') {
            $clearance->update([
                'status' => 'pending',
                'admin_notes' => $clearance->admin_notes . "\nRequested more documents: " . $request->reason,
            ]);
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->withProperties(['reason' => $request->reason])
            ->log('Requested more documents');

        return redirect()->back()->with('success', 'Document request sent to resident.');
    }

    /**
     * Request payment.
     */
    public function requestPayment(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'pending_payment') {
            $clearance->update(['status' => 'pending_payment']);
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('Payment requested');

        return redirect()->back()->with('success', 'Payment request sent to resident.');
    }

    /**
     * Verify payment (mark as paid manually).
     */
    public function verifyPayment(ClearanceRequest $clearance)
    {
        if ($clearance->payment_status === 'paid') {
            return redirect()->back()->with('info', 'Payment already verified.');
        }

        $clearance->update([
            'payment_status' => 'paid',
            'amount_paid' => $clearance->fee_amount,
            'balance' => 0,
            'status' => 'processing', // Move to processing after payment
        ]);

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('Payment verified manually');

        return redirect()->back()->with('success', 'Payment verified successfully.');
    }

    /**
     * Send payment reminder.
     */
    public function sendPaymentReminder(ClearanceRequest $clearance)
    {
        if ($clearance->payment_status === 'paid') {
            return redirect()->back()->with('info', 'Payment already completed.');
        }

        activity()
            ->performedOn($clearance)
            ->causedBy(auth()->user())
            ->log('Payment reminder sent');

        return redirect()->back()->with('success', 'Payment reminder sent to resident.');
    }

    // ========== BULK OPERATIONS ==========

    /**
     * Bulk process clearance requests.
     */
    public function bulkProcess(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        $count = ClearanceRequest::whereIn('id', $request->ids)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->update([
                'status' => 'processing',
                'processed_by' => auth()->id(),
                'processed_at' => now(),
            ]);

        return redirect()->back()->with('success', "{$count} clearance requests marked as processing.");
    }

    /**
     * Bulk approve clearance requests.
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        $count = ClearanceRequest::whereIn('id', $request->ids)
            ->where('status', 'processing')
            ->where(function ($q) {
                $q->where('payment_status', 'paid')
                  ->orWhereDoesntHave('clearanceType', function ($q) {
                      $q->where('requires_payment', true);
                  });
            })
            ->update([
                'status' => 'approved',
                'issuing_officer_id' => auth()->id(),
                'issuing_officer_name' => auth()->user()->name,
            ]);

        return redirect()->back()->with('success', "{$count} clearance requests approved.");
    }

    /**
     * Bulk issue clearance certificates.
     */
    public function bulkIssue(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        $count = ClearanceRequest::whereIn('id', $request->ids)
            ->where('status', 'approved')
            ->update([
                'status' => 'issued',
                'issue_date' => now(),
                'valid_until' => now()->addDays(30), // Default validity
            ]);

        return redirect()->back()->with('success', "{$count} clearance certificates issued.");
    }

    /**
     * Bulk update status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
            'status' => 'required|in:pending,processing,approved,issued,rejected,cancelled',
        ]);

        $count = ClearanceRequest::whereIn('id', $request->ids)->update([
            'status' => $request->status,
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return redirect()->back()->with('success', "{$count} clearance requests updated to {$request->status}.");
    }

    /**
     * Bulk delete clearance requests.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);

        // Check for payments
        $hasPayments = ClearanceRequest::whereIn('id', $request->ids)
            ->where(function ($q) {
                $q->whereNotNull('payment_id')
                  ->orWhereHas('paymentItems');
            })
            ->exists();

        if ($hasPayments) {
            return redirect()->back()->with('error', 'Cannot delete clearance requests with associated payments.');
        }

        $count = ClearanceRequest::whereIn('id', $request->ids)
            ->whereIn('status', ['pending', 'pending_payment'])
            ->delete();

        return redirect()->back()->with('success', "{$count} clearance requests deleted.");
    }
}