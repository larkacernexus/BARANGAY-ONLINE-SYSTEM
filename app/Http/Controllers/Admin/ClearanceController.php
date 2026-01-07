<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use App\Models\Resident;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Inertia\Inertia;

class ClearanceController extends Controller
{
    /**
     * Display a listing of clearance requests.
     */
    public function index(Request $request)
    {
        $query = ClearanceRequest::query()
            ->with(['resident', 'clearanceType', 'issuingOfficer'])
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
                  });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Type filter
        if ($type = $request->input('type')) {
            $query->where('clearance_type_id', $type);
        }

        // Get paginated results with formatted data
        $clearances = $query->paginate(20)->through(function ($clearance) {
            return array_merge(
                $clearance->toArray(),
                [
                    'resident' => $clearance->resident ? [
                        'id' => $clearance->resident->id,
                        'full_name' => $clearance->resident->full_name ?? $clearance->resident->getFullName(),
                        'first_name' => $clearance->resident->first_name,
                        'last_name' => $clearance->resident->last_name,
                        'address' => $clearance->resident->address,
                    ] : null,
                    'clearance_type' => $clearance->clearanceType ? [
                        'id' => $clearance->clearanceType->id,
                        'name' => $clearance->clearanceType->name,
                        'code' => $clearance->clearanceType->code,
                        'fee' => (float) $clearance->clearanceType->fee,
                        'processing_days' => $clearance->clearanceType->processing_days,
                        'validity_days' => $clearance->clearanceType->validity_days,
                    ] : null,
                    'status_display' => $clearance->status_display,
                    'urgency_display' => $clearance->urgency_display,
                    'formatted_fee' => $clearance->formatted_fee,
                    'is_valid' => $clearance->is_valid,
                    'days_remaining' => $clearance->days_remaining,
                    'created_at' => $clearance->created_at->toDateTimeString(),
                    'updated_at' => $clearance->updated_at->toDateTimeString(),
                    'issue_date' => $clearance->issue_date?->toDateString(),
                    'valid_until' => $clearance->valid_until?->toDateString(),
                ]
            );
        });

        // Get stats
        $stats = [
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
                ->sum('fee_amount'),
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

        return Inertia::render('admin/Clearances/Index', [
            'clearances' => $clearances,
            'stats' => $stats,
            'clearanceTypes' => $clearanceTypes,
            'filters' => $request->only(['search', 'status', 'type']),
            'statusOptions' => $statusOptions,
        ]);
    }
    

        public function show(ClearanceRequest $clearance)
    {
        // Load all necessary relationships
        $clearance->load([
            'resident',
            'clearanceType',
            'documents',
            'payment',
        ]);

        // Get activity logs using Spatie
        $activityLogs = Activity::where('subject_type', ClearanceRequest::class)
            ->where('subject_id', $clearance->id)
            ->orWhere('log_name', 'clearance') // If you have custom log name
            ->with('causer')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'description' => $log->description,
                    'event' => $log->event,
                    'properties' => $log->properties,
                    'created_at' => $log->created_at->toDateTimeString(),
                    'user' => $log->causer ? [
                        'id' => $log->causer->id,
                        'name' => $log->causer->name,
                        'email' => $log->causer->email,
                    ] : null,
                ];
            });

        // Check permissions
        $canEdit = auth()->user()->can('update', $clearance);
        $canDelete = auth()->user()->can('delete', $clearance);
        $canProcess = auth()->user()->can('process', $clearance);
        $canIssue = auth()->user()->can('issue', $clearance);
        $canApprove = auth()->user()->can('approve', $clearance);
        $canPrint = auth()->user()->can('print', $clearance);

        // Format clearance data
        $formattedClearance = [
            'id' => $clearance->id,
            'reference_number' => $clearance->reference_number,
            'clearance_number' => $clearance->clearance_number,
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
            'processed_at' => $clearance->processed_at?->toDateTimeString(),
            'estimated_completion_date' => $clearance->estimated_completion_date?->toDateString(),
            'issuing_officer_name' => $clearance->issuing_officer_name,
            'requirements_met' => $clearance->requirements_met,
            'resident' => $clearance->resident ? [
                'id' => $clearance->resident->id,
                'full_name' => $clearance->resident->full_name ?? $clearance->resident->getFullName(),
                'address' => $clearance->resident->address,
                'contact_number' => $clearance->resident->contact_number,
                'email' => $clearance->resident->email,
                'birth_date' => $clearance->resident->birth_date?->toDateString(),
                'gender' => $clearance->resident->gender,
                'civil_status' => $clearance->resident->civil_status,
                'occupation' => $clearance->resident->occupation,
                'profile_photo' => $clearance->resident->profile_photo,
            ] : null,
            'clearance_type' => $clearance->clearanceType ? [
                'id' => $clearance->clearanceType->id,
                'name' => $clearance->clearanceType->name,
                'code' => $clearance->clearanceType->code,
                'description' => $clearance->clearanceType->description,
                'fee' => (float) $clearance->clearanceType->fee,
                'processing_days' => $clearance->clearanceType->processing_days,
                'validity_days' => $clearance->clearanceType->validity_days,
            ] : null,
            'documents' => $clearance->documents ? $clearance->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'document_type' => $doc->document_type,
                    'status' => $doc->status,
                    'uploaded_at' => $doc->created_at?->toDateTimeString(),
                ];
            })->toArray() : [],
            'payment' => $clearance->payment ? [
                'id' => $clearance->payment->id,
                'amount' => (float) $clearance->payment->amount,
                'formatted_amount' => $clearance->payment->formatted_amount,
                'status' => $clearance->payment->status,
                'payment_method' => $clearance->payment->payment_method,
                'reference_number' => $clearance->payment->reference_number,
                'paid_at' => $clearance->payment->paid_at?->toDateTimeString(),
            ] : null,
            'status_display' => $clearance->status_display,
            'urgency_display' => $clearance->urgency_display,
            'formatted_fee' => $clearance->formatted_fee,
        ];

        return Inertia::render('admin/Clearances/Show', [
            'clearance' => $formattedClearance,
            'activityLogs' => $activityLogs,
            'canEdit' => $canEdit,
            'canDelete' => $canDelete,
            'canProcess' => $canProcess,
            'canIssue' => $canIssue,
            'canApprove' => $canApprove,
            'canPrint' => $canPrint,
        ]);
    }
   public function edit(ClearanceRequest $clearance)
    {
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
                    'requirements' => $type->documentRequirements()->get()->map(function ($req) {
                        return $req->name;
                    })->toArray(),
                    'purpose_options' => $type->purpose_options,
                ];
            });

        // Load necessary relationships
        $clearance->load(['resident', 'clearanceType']);

        // Format the data for Inertia
        $formattedClearance = [
            'id' => $clearance->id,
            'reference_number' => $clearance->reference_number,
            'clearance_number' => $clearance->clearance_number,
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
            'resident' => $clearance->resident ? [
                'id' => $clearance->resident->id,
                'full_name' => $clearance->resident->full_name ?? $clearance->resident->getFullName(),
                'address' => $clearance->resident->address,
                'contact_number' => $clearance->resident->contact_number,
                'email' => $clearance->resident->email,
                'birth_date' => $clearance->resident->birth_date?->toDateString(),
                'gender' => $clearance->resident->gender,
                'civil_status' => $clearance->resident->civil_status,
                'occupation' => $clearance->resident->occupation,
                'profile_photo' => $clearance->resident->profile_photo,
            ] : null,
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
            ] : null,
            'status_display' => $clearance->status_display,
            'urgency_display' => $clearance->urgency_display,
            'formatted_fee' => $clearance->formatted_fee,
        ];

        // Get purpose options from clearance type
        $purposeOptions = [];
        if ($clearance->clearanceType && $clearance->clearanceType->purpose_options) {
            $purposeOptions = explode(',', $clearance->clearanceType->purpose_options);
            $purposeOptions = array_map('trim', $purposeOptions);
        }

        return Inertia::render('admin/Clearances/Edit', [
            'clearance' => $formattedClearance,
            'clearanceTypes' => $clearanceTypes,
            'purposeOptions' => $purposeOptions,
        ]);
    }

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
     * Get clearance statistics
     */
    private function getClearanceStats()
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        
        $totalIssued = ClearanceRequest::where('status', 'issued')->count();
        $pendingReview = ClearanceRequest::where('status', 'pending')->count();
        $inProcessing = ClearanceRequest::where('status', 'processing')->count();
        $pendingPayment = ClearanceRequest::where('status', 'pending_payment')->count();
        
        $expiringSoon = ClearanceRequest::where('valid_until', '>=', $now)
            ->where('valid_until', '<=', $now->addDays(30))
            ->where('status', 'issued')
            ->count();
        
        $issuedLast30Days = ClearanceRequest::where('status', 'issued')
            ->where('issue_date', '>=', $thirtyDaysAgo)
            ->count();
        
        $issuedToday = ClearanceRequest::where('status', 'issued')
            ->whereDate('issue_date', today())
            ->count();
        
        $totalRevenue = ClearanceRequest::where('status', 'issued')
            ->where('issue_date', '>=', $thirtyDaysAgo)
            ->sum('fee_amount');
        
        return [
            [
                'label' => 'Total Issued',
                'value' => $totalIssued,
                'change' => $issuedLast30Days > 0 ? "+{$issuedLast30Days} last 30 days" : 'No recent activity',
                'icon' => 'FileText',
                'color' => 'blue'
            ],
            [
                'label' => 'Pending Review',
                'value' => $pendingReview,
                'change' => $pendingReview > 0 ? 'Needs attention' : 'All clear',
                'icon' => 'Clock',
                'color' => 'amber'
            ],
            [
                'label' => 'In Processing',
                'value' => $inProcessing,
                'change' => $inProcessing > 0 ? 'Currently being processed' : 'No active processing',
                'icon' => 'RefreshCw',
                'color' => 'purple'
            ],
            [
                'label' => 'Pending Payment',
                'value' => $pendingPayment,
                'change' => $pendingPayment > 0 ? 'Awaiting payment' : 'No pending payments',
                'icon' => 'CreditCard',
                'color' => 'yellow'
            ],
            [
                'label' => 'Today\'s Issued',
                'value' => $issuedToday,
                'change' => $issuedToday > 0 ? 'Issued today' : 'None today',
                'icon' => 'Calendar',
                'color' => 'green'
            ],
            [
                'label' => 'Expiring Soon',
                'value' => $expiringSoon,
                'change' => $expiringSoon > 0 ? 'Within 30 days' : 'None expiring',
                'icon' => 'AlertCircle',
                'color' => 'orange'
            ],
        ];
    }
    
    /**
     * Show the form for creating a new clearance request.
     */
    public function create()
    {
        $residents = Resident::with('purok')
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'address', 'contact_number', 'purok_id'])
            ->orderBy('last_name')
            ->get()
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'name' => $resident->full_name,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'address' => $resident->address,
                    'contact_number' => $resident->contact_number,
                    'purok' => $resident->purok ? $resident->purok->name : null,
                    'purok_id' => $resident->purok_id,
                ];
            });
        
        // Get active clearance types
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
                    'requirements' => $type->requirements ?? [],
                    'purpose_options' => $type->purpose_options ? 
                        array_map('trim', explode(',', $type->purpose_options)) : 
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
        
        return Inertia::render('admin/Clearances/Create', [
            'residents' => $residents,
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
    $validator = Validator::make($request->all(), [
        'resident_id' => 'required|exists:residents,id',
        'clearance_type_id' => 'required|exists:clearance_types,id',
        'purpose' => 'required|string|max:500',
        'specific_purpose' => 'nullable|string|max:500',
        'urgency' => 'required|in:normal,rush,express',
        'needed_date' => 'required|date',
        'additional_requirements' => 'nullable|string',
        'fee_amount' => 'nullable|numeric|min:0',
        // Remove 'issuing_officer' validation since it's not in your database
    ]);
    
    if ($validator->fails()) {
        return redirect()->back()
            ->withErrors($validator)
            ->withInput();
    }
    
    // Get clearance type
    $clearanceType = ClearanceType::find($request->clearance_type_id);
    
    // Get resident
    $resident = Resident::find($request->resident_id);
    
    // Calculate fee if not provided
    $feeAmount = $request->fee_amount;
    if ($clearanceType && $feeAmount === null) {
        $feeAmount = $clearanceType->fee ?? 0;
    }
    
    // Adjust fee based on urgency
    if ($request->urgency === 'rush') {
        $feeAmount *= 1.5; // 50% surcharge for rush
    } elseif ($request->urgency === 'express') {
        $feeAmount *= 2.0; // 100% surcharge for express
    }
    
    // Round to 2 decimal places
    $feeAmount = round($feeAmount, 2);
    
    // Determine initial status
    $status = 'pending';
    if ($clearanceType && $clearanceType->requires_payment && $feeAmount > 0) {
        $status = 'pending_payment';
    }
    
    // Get the user ID associated with the resident
    $requestedByUserId = null;
    if ($resident && $resident->user) {
        $requestedByUserId = $resident->user->id;
    }
    
    // Get current admin
    $admin = auth()->user();
    
    $clearanceRequest = ClearanceRequest::create([
        'resident_id' => $request->resident_id,
        'clearance_type_id' => $request->clearance_type_id,
        'purpose' => $request->purpose,
        'specific_purpose' => $request->specific_purpose,
        'urgency' => $request->urgency,
        'needed_date' => $request->needed_date,
        'additional_requirements' => $request->additional_requirements,
        'fee_amount' => $feeAmount,
        'status' => $status,
        // These are the correct field names from your database:
        'issuing_officer_id' => $admin->id, // Store the user ID
        'issuing_officer_name' => $admin->name, // Store the name for display
        'requested_by_user_id' => $requestedByUserId, // Resident's user ID, not admin's
        'processed_by' => $admin->id, // Admin who created it
        'processed_at' => now(), // Admin processed it immediately
    ]);
    
    return redirect()->route('clearances.index')
        ->with('success', 'Clearance request created successfully! Reference number: ' . $clearanceRequest->reference_number);
}


    
    
    /**
     * Remove the specified clearance request from storage.
     */
    public function destroy(ClearanceRequest $clearance)
    {
        $referenceNumber = $clearance->reference_number;
        $clearance->delete();
        
        return redirect()->route('clearances.index')
            ->with('success', "Clearance request {$referenceNumber} deleted successfully!");
    }
    
    /**
     * Print clearance
     */
    public function print(ClearanceRequest $clearance)
    {
        $clearance->load(['resident', 'clearanceType']);
        
        return Inertia::render('admin/clearances/Print', [
            'clearance' => [
                ...$clearance->toArray(),
                'formatted_fee' => $clearance->formatted_fee,
                'status_display' => $clearance->status_display,
                'urgency_display' => $clearance->urgency_display,
            ],
        ]);
    }
    
    /**
     * Mark request as processing
     */
    public function markAsProcessing(Request $request, ClearanceRequest $clearance)
    {
        if (!$clearance->isPending() && !$clearance->isProcessing()) {
            return redirect()->back()
                ->with('error', 'Only pending requests can be marked as processing.');
        }
        
        $clearance->markAsProcessing();
        
        return redirect()->back()
            ->with('success', 'Clearance request marked as processing!');
    }
    
    /**
     * Approve clearance request
     */
    public function approve(Request $request, ClearanceRequest $clearance)
    {
        if (!$clearance->canBeProcessed()) {
            return redirect()->back()
                ->with('error', 'Request cannot be approved at this stage.');
        }
        
        $validator = Validator::make($request->all(), [
            'issuing_officer' => 'required|string|max:200',
            'valid_until' => 'nullable|date',
        ]);
        
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        
        $clearance->approve(
            $request->issuing_officer,
            $request->valid_until
        );
        
        return redirect()->back()
            ->with('success', 'Clearance request approved successfully!');
    }
    
    /**
     * Issue clearance (final step)
     */
    public function issue(Request $request, ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'approved') {
            return redirect()->back()
                ->with('error', 'Only approved requests can be issued.');
        }
        
        $clearance->issue($request->issuing_officer);
        
        return redirect()->back()
            ->with('success', 'Clearance issued successfully! Clearance number: ' . $clearance->clearance_number);
    }
    
    /**
     * Reject clearance request
     */
    public function reject(Request $request, ClearanceRequest $clearance)
    {
        if (!$clearance->canBeProcessed()) {
            return redirect()->back()
                ->with('error', 'Request cannot be rejected at this stage.');
        }
        
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);
        
        $clearance->reject($request->rejection_reason);
        
        return redirect()->back()
            ->with('success', 'Clearance request rejected successfully!');
    }
    
    /**
     * Cancel clearance request
     */
    public function cancel(Request $request, ClearanceRequest $clearance)
    {
        try {
            $clearance->cancel($request->cancellation_reason, false); // false = cancelled by admin
            return redirect()->back()
                ->with('success', 'Clearance request cancelled successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }
    
    /**
     * Mark as pending payment
     */
    public function markAsPendingPayment(Request $request, ClearanceRequest $clearance)
    {
        $clearance->markAsPendingPayment();
        
        return redirect()->back()
            ->with('success', 'Clearance request marked as pending payment!');
    }
    
    /**
     * Bulk actions on clearance requests
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,reject,mark_processing,mark_payment,delete,export',
            'ids' => 'required|array',
            'ids.*' => 'exists:clearance_requests,id',
        ]);
        
        $clearances = ClearanceRequest::whereIn('id', $request->ids)->get();
        
        switch ($request->action) {
            case 'approve':
                $count = 0;
                foreach ($clearances as $clearance) {
                    if ($clearance->canBeProcessed()) {
                        $clearance->approve(auth()->user()->name);
                        $count++;
                    }
                }
                $message = "{$count} clearance request(s) approved successfully.";
                break;
                
            case 'reject':
                $count = 0;
                foreach ($clearances as $clearance) {
                    if ($clearance->canBeProcessed()) {
                        $clearance->reject('Bulk rejected by administrator', auth()->id());
                        $count++;
                    }
                }
                $message = "{$count} clearance request(s) rejected successfully.";
                break;
                
            case 'mark_processing':
                $count = 0;
                foreach ($clearances as $clearance) {
                    if ($clearance->isPending() || $clearance->isProcessing()) {
                        $clearance->markAsProcessing(auth()->id());
                        $count++;
                    }
                }
                $message = "{$count} clearance request(s) marked as processing.";
                break;
                
            case 'mark_payment':
                $count = $clearances->whereIn('status', ['pending', 'processing'])->count();
                ClearanceRequest::whereIn('id', $request->ids)
                    ->whereIn('status', ['pending', 'processing'])
                    ->update(['status' => 'pending_payment']);
                $message = "{$count} clearance request(s) marked as pending payment.";
                break;
                
            case 'delete':
                $count = $clearances->count();
                ClearanceRequest::whereIn('id', $request->ids)->delete();
                $message = "{$count} clearance request(s) deleted successfully.";
                break;
                
            case 'export':
                return $this->export($request);
        }
        
        return redirect()->back()->with('success', $message);
    }
    
    /**
     * API endpoint for clearance statistics
     */
    public function stats()
    {
        return response()->json($this->getClearanceStats());
    }
    
    /**
     * Get clearance types API
     */
    public function types()
    {
        $types = ClearanceType::where('is_active', true)
            ->withCount(['clearanceRequests' => function ($query) {
                $query->where('status', 'issued');
            }])
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'count' => $type->clearance_requests_count,
                    'fee' => $type->formatted_fee,
                ];
            });
        
        return response()->json($types);
    }
    
    /**
     * Export clearances to CSV/Excel
     */
    public function export(Request $request)
    {
        $query = ClearanceRequest::query()
            ->with(['resident', 'clearanceType'])
            ->latest();
        
        // Apply filters if any
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        
        if ($request->has('type') && $request->input('type') !== 'all') {
            $query->where('clearance_type_id', $request->input('type'));
        }
        
        $clearances = $query->get();
        
        // CSV headers
        $headers = [
            'Reference Number',
            'Clearance Number',
            'Resident Name',
            'Clearance Type',
            'Purpose',
            'Urgency',
            'Status',
            'Issue Date',
            'Valid Until',
            'Fee Amount',
            'Issuing Officer',
            'Requested Date',
            'Needed Date',
            'Remarks',
        ];
        
        // CSV content
        $csvContent = implode(',', $headers) . "\n";
        
        foreach ($clearances as $clearance) {
            $row = [
                $clearance->reference_number,
                $clearance->clearance_number ?? 'N/A',
                $clearance->resident ? $clearance->resident->full_name : 'N/A',
                $clearance->clearanceType ? $clearance->clearanceType->name : 'N/A',
                $clearance->purpose,
                $clearance->urgency_display,
                $clearance->status_display,
                $clearance->issue_date ? $clearance->issue_date->format('Y-m-d') : 'N/A',
                $clearance->valid_until ? $clearance->valid_until->format('Y-m-d') : 'N/A',
                $clearance->fee_amount,
                $clearance->issuing_officer ?? 'N/A',
                $clearance->created_at->format('Y-m-d H:i:s'),
                $clearance->needed_date ? $clearance->needed_date->format('Y-m-d') : 'N/A',
                str_replace(',', ';', $clearance->remarks ?? ''),
            ];
            
            $csvContent .= implode(',', $row) . "\n";
        }
        
        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="clearance_requests_' . date('Y-m-d') . '.csv"');
    }
    
    /**
     * Show documents for a clearance request
     */
    public function documents(ClearanceRequest $clearance)
    {
        $clearance->load(['documents.documentType']);
        
        return Inertia::render('admin/clearances/Documents', [
            'clearance' => $clearance,
            'documents' => $clearance->documents,
        ]);
    }
    
    /**
     * Get clearance requests that need attention (dashboard widget)
     */
    public function getAttentionNeeded()
    {
        $pending = ClearanceRequest::pending()
            ->with(['resident', 'clearanceType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        $expiring = ClearanceRequest::where('status', 'issued')
            ->where('valid_until', '<=', now()->addDays(7))
            ->with(['resident', 'clearanceType'])
            ->orderBy('valid_until', 'asc')
            ->limit(10)
            ->get();
        
        return response()->json([
            'pending' => $pending,
            'expiring' => $expiring,
        ]);
    }
}