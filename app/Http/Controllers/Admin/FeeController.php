<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Payment;
use App\Models\PaymentItem;
use App\Models\DiscountType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class FeeController extends Controller
{
    // Display list of fees
    public function index(Request $request)
    {
        $query = Fee::query()
            ->with([
                'feeType:id,name,code,category',
                'resident:id,first_name,last_name,middle_name',
                'household:id,head_of_family',
                'paymentItems.payment:id,payment_date,total_amount,or_number,status'  
            ])
            ->latest();
        
        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payer_name', 'like', "%{$search}%")
                  ->orWhere('or_number', 'like', "%{$search}%")
                  ->orWhere('certificate_number', 'like', "%{$search}%")
                  ->orWhere('fee_code', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('purok', 'like', "%{$search}%");
            });
        }
        
        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->whereHas('feeType', function($q) use ($request) {
                $q->where('category', $request->category);
            });
        }
        
        // Filter by purok
        if ($request->has('purok') && $request->purok) {
            $query->where('purok', $request->purok);
        }
        
        // Filter by payer type
        if ($request->has('payer_type') && $request->payer_type) {
            $query->where('payer_type', $request->payer_type);
        }
        
        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('issue_date', '>=', $request->from_date);
        }
        
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('issue_date', '<=', $request->to_date);
        }
        
        // Filter by amount range
        if ($request->has('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
        }
        
        if ($request->has('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
        }
        
        // Get paginated results
        $perPage = $request->get('per_page', 20);
        $fees = $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($fee) {
                // Format fee data for frontend
                $fee->formatted_issue_date = Carbon::parse($fee->issue_date)->format('M d, Y');
                $fee->formatted_due_date = Carbon::parse($fee->due_date)->format('M d, Y');
                $fee->formatted_created_at = Carbon::parse($fee->created_at)->format('M d, Y h:i A');
                
                // Calculate days overdue
                $fee->is_overdue = $fee->status === 'overdue';
                $fee->days_overdue = $fee->is_overdue 
                    ? Carbon::parse($fee->due_date)->diffInDays(now())
                    : 0;
                    
                // Add payer type icon class
                $fee->payer_type_icon = $this->getPayerTypeIcon($fee->payer_type);
                
                // Format amounts with currency
                $fee->formatted_total_amount = '₱' . number_format($fee->total_amount, 2);
                $fee->formatted_amount_paid = '₱' . number_format($fee->amount_paid, 2);
                $fee->formatted_balance = '₱' . number_format($fee->balance, 2);
                
                return $fee;
            });
    
        // Get statistics
        $stats = [
            'total' => Fee::count(),
            'total_amount' => Fee::sum('total_amount'),
            'collected' => Fee::where('status', 'paid')->sum('amount_paid'),
            'pending' => Fee::whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
            'overdue_count' => Fee::where('status', 'overdue')->count(),
            
            // Additional stats for dashboard
            'today_count' => Fee::whereDate('created_at', today())->count(),
            'today_amount' => Fee::whereDate('created_at', today())->sum('total_amount'),
            'this_month_count' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'this_month_amount' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
            
            // Status breakdown
            'status_counts' => [
                'pending' => Fee::where('status', 'pending')->count(),
                'issued' => Fee::where('status', 'issued')->count(),
                'partially_paid' => Fee::where('status', 'partially_paid')->count(),
                'paid' => Fee::where('status', 'paid')->count(),
                'overdue' => Fee::where('status', 'overdue')->count(),
                'cancelled' => Fee::where('status', 'cancelled')->count(),
                'waived' => Fee::where('status', 'waived')->count(),
            ],
            
            // Category breakdown
            'category_totals' => Fee::selectRaw('fee_types.category, COUNT(fees.id) as count, SUM(fees.total_amount) as total_amount')
                ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
                ->groupBy('fee_types.category')
                ->get()
                ->keyBy('category')
                ->toArray(),
        ];
    
        // Get unique puroks from fees
        $puroks = Fee::whereNotNull('purok')
            ->distinct('purok')
            ->pluck('purok')
            ->filter()
            ->sort()
            ->values();
    
        // Status options
        $statuses = [
            'pending' => 'Pending',
            'issued' => 'Issued',
            'partially_paid' => 'Partially Paid',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            'waived' => 'Waived',
            'written_off' => 'Written Off',
        ];
    
        // Category options
        $categories = [
            'tax' => 'Taxes',
            'clearance' => 'Clearances',
            'certificate' => 'Certificates',
            'service' => 'Services',
            'rental' => 'Rentals',
            'fine' => 'Fines',
            'contribution' => 'Contributions',
            'other' => 'Other',
        ];
    
        // Payer type options
        $payerTypes = [
            'resident' => 'Resident',
            'business' => 'Business',
            'household' => 'Household',
            'visitor' => 'Visitor',
            'other' => 'Other',
        ];
    
        return Inertia::render('admin/Fees/Index', [
            'fees' => $fees,
            'filters' => $request->only([
                'search', 'status', 'category', 'purok', 'payer_type',
                'from_date', 'to_date', 'min_amount', 'max_amount'
            ]),
            'statuses' => $statuses,
            'categories' => $categories,
            'payerTypes' => $payerTypes,
            'puroks' => $puroks,
            'stats' => $stats,
            
            // For quick filters
            'quickStats' => [
                'all' => $stats['total'],
                'pending' => $stats['status_counts']['pending'],
                'issued' => $stats['status_counts']['issued'],
                'overdue' => $stats['status_counts']['overdue'],
                'paid' => $stats['status_counts']['paid'],
            ],
        ]);
    }
    
    public function quickStats(Request $request)
    {
        $period = $request->get('period', 'today'); // today, week, month, year
        
        $query = Fee::query();
        
        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
                break;
            case 'year':
                $query->whereYear('created_at', now()->year);
                break;
        }
        
        $stats = [
            'count' => $query->count(),
            'total_amount' => $query->sum('total_amount'),
            'collected' => $query->where('status', 'paid')->sum('amount_paid'),
            'pending' => $query->whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
        ];
        
        return response()->json($stats);
    }
    
    // Get fees by status for chart
    public function statusChartData()
    {
        $data = Fee::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->keyBy('status');
        
        $chartData = [
            'labels' => [],
            'datasets' => [
                [
                    'label' => 'Number of Fees',
                    'data' => [],
                    'backgroundColor' => [
                        '#fbbf24', // pending - yellow
                        '#60a5fa', // issued - blue
                        '#a78bfa', // partially_paid - purple
                        '#34d399', // paid - green
                        '#f87171', // overdue - red
                        '#9ca3af', // cancelled - gray
                        '#c084fc', // waived - purple
                    ]
                ]
            ]
        ];
        
        $statuses = [
            'pending', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled', 'waived'
        ];
        
        foreach ($statuses as $status) {
            $chartData['labels'][] = ucfirst(str_replace('_', ' ', $status));
            $chartData['datasets'][0]['data'][] = $data[$status]->count ?? 0;
        }
        
        return response()->json($chartData);
    }
    
    // Get monthly collection data for chart
    public function monthlyCollectionChart()
    {
        $data = Fee::selectRaw('
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                SUM(total_amount) as total,
                SUM(amount_paid) as collected
            ')
            ->where('status', 'paid')
            ->whereYear('created_at', '>=', now()->subYear()->year)
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        
        $labels = [];
        $totals = [];
        $collected = [];
        
        foreach ($data as $item) {
            $date = Carbon::create($item->year, $item->month, 1);
            $labels[] = $date->format('M Y');
            $totals[] = $item->total;
            $collected[] = $item->collected;
        }
        
        return response()->json([
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Total Amount',
                    'data' => $totals,
                    'borderColor' => '#60a5fa',
                    'backgroundColor' => 'rgba(96, 165, 250, 0.1)',
                ],
                [
                    'label' => 'Amount Collected',
                    'data' => $collected,
                    'borderColor' => '#34d399',
                    'backgroundColor' => 'rgba(52, 211, 153, 0.1)',
                ]
            ]
        ]);
    }
    
    // Helper method to get payer type icon
    private function getPayerTypeIcon($payerType)
    {
        $icons = [
            'resident' => 'user',
            'business' => 'building',
            'household' => 'home',
            'visitor' => 'user',
            'other' => 'user',
        ];
        
        return $icons[$payerType] ?? 'user';
    }

    // Show create form
  public function create(Request $request)
{
    $resident = null;
    $household = null;
    $feeToDuplicate = null;
    
    // Check if we're duplicating from an existing fee
    if ($request->has('duplicate_from')) {
        $feeToDuplicate = Fee::with(['feeType', 'resident', 'household'])->find($request->duplicate_from);
        
        if ($feeToDuplicate) {
            // Set pre-selected resident/household based on the duplicated fee
            if ($feeToDuplicate->payer_type === 'resident' && $feeToDuplicate->resident) {
                $resident = $feeToDuplicate->resident;
            } elseif ($feeToDuplicate->payer_type === 'household' && $feeToDuplicate->household) {
                $household = $feeToDuplicate->household;
            }
        }
    }
    
    if ($request->has('resident_id')) {
        $resident = Resident::with('purok')->find($request->resident_id);
    }
    
    if ($request->has('household_id')) {
        $household = Household::with(['purok', 'householdMembers.resident'])->find($request->household_id);
    }
    
    // Prepare initial data for form
    $initialData = [];
    if ($feeToDuplicate) {
        $initialData = $this->prepareDuplicateData($feeToDuplicate);
    }
    
    // Get fee types with discount relationships
    $feeTypes = FeeType::with(['discountFeeTypes' => function($query) {
            $query->where('is_active', true)
                  ->with('discountType');
        }])
        ->active()
        ->get()
        ->map(function($type) {
            $discountFeeTypes = $type->discountFeeTypes ?? collect();
            
            return [
                'id' => $type->id,
                'code' => $type->code,
                'name' => $type->name,
                'category' => $type->category,
                'base_amount' => (float) $type->base_amount,
                'amount_type' => $type->amount_type,
                'has_surcharge' => $type->has_surcharge,
                'surcharge_percentage' => (float) $type->surcharge_percentage,
                'surcharge_fixed' => (float) $type->surcharge_fixed,
                'has_penalty' => $type->has_penalty,
                'penalty_percentage' => (float) $type->penalty_percentage,
                'penalty_fixed' => (float) $type->penalty_fixed,
                'validity_days' => $type->validity_days,
                // Legacy discount fields (keep for backward compatibility)
                'has_senior_discount' => $type->has_senior_discount,
                'has_pwd_discount' => $type->has_pwd_discount,
                'has_solo_parent_discount' => $type->has_solo_parent_discount,
                'has_indigent_discount' => $type->has_indigent_discount,
                'discount_percentage' => (float) $type->discount_percentage,
                // New discount relationship data
                'discount_fee_types' => $discountFeeTypes->map(function($dft) {
                    return [
                        'id' => $dft->id,
                        'fee_type_id' => $dft->fee_type_id,
                        'discount_type_id' => $dft->discount_type_id,
                        'percentage' => (float) $dft->percentage,
                        'is_active' => (bool) $dft->is_active,
                        'discount_type' => $dft->discountType ? [
                            'id' => $dft->discountType->id,
                            'code' => $dft->discountType->code,
                            'name' => $dft->discountType->name,
                            'description' => $dft->discountType->description,
                            'default_percentage' => (float) $dft->discountType->default_percentage,
                            'legal_basis' => $dft->discountType->legal_basis,
                            'requirements' => $dft->discountType->requirements,
                            'is_active' => (bool) $dft->discountType->is_active,
                            'is_mandatory' => (bool) $dft->discountType->is_mandatory,
                        ] : null
                    ];
                })->toArray(),
            ];
        });
    
    // Get residents - simplified query without complex SQL functions
    $residents = Resident::with('purok')
        ->select(['id', 'first_name', 'last_name', 'middle_name', 'purok_id', 'contact_number', 'birth_date', 'is_pwd', 'is_senior'])
        ->orderBy('last_name')
        ->get()
        ->map(function($resident) {
            // Determine eligible discounts based on resident attributes
            $eligibleDiscounts = [];
            
            // Use the model's boolean fields
            if ($resident->is_senior) {
                $eligibleDiscounts[] = 'SENIOR';
            }
            if ($resident->is_pwd) {
                $eligibleDiscounts[] = 'PWD';
            }
            // Add other eligibility checks as needed
            // if ($resident->is_solo_parent) { $eligibleDiscounts[] = 'SOLO_PARENT'; }
            // if ($resident->is_indigent) { $eligibleDiscounts[] = 'INDIGENT'; }
            
            return [
                'id' => $resident->id,
                'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}"),
                'full_name' => $resident->full_name,
                'purok' => $resident->purok ? $resident->purok->name : null,
                'contact_number' => $resident->contact_number,
                // Discount eligibility - use the boolean fields from your model
                'is_senior' => (bool) $resident->is_senior,
                'is_pwd' => (bool) $resident->is_pwd,
                'eligible_discounts' => $eligibleDiscounts,
            ];
        });
    
    // Get households - find head resident through household_members table
    $households = Household::with(['purok', 'householdMembers' => function($query) {
            $query->where('is_head', true)->with('resident');
        }])
        ->select(['id', 'household_number', 'purok_id', 'contact_number'])
        ->orderBy('household_number')
        ->get()
        ->map(function($household) {
            // Get head resident from household members
            $headMember = $household->householdMembers->first();
            $headName = $headMember && $headMember->resident 
                ? trim("{$headMember->resident->first_name} {$headMember->resident->last_name}")
                : null;
            
            return [
                'id' => $household->id,
                'household_number' => $household->household_number,
                'name' => $headName ?? 'Household #' . $household->household_number,
                'purok' => $household->purok ? $household->purok->name : null,
                'contact_number' => $household->contact_number,
                'head_resident_name' => $headName,
            ];
        });
    
    // Get all discount types for the form
    $discountTypes = DiscountType::active()
        ->orderBy('sort_order')
        ->get()
        ->map(function($discountType) {
            return [
                'id' => $discountType->id,
                'code' => $discountType->code,
                'name' => $discountType->name,
                'description' => $discountType->description,
                'default_percentage' => (float) $discountType->default_percentage,
                'legal_basis' => $discountType->legal_basis,
                'requirements' => $discountType->requirements,
                'is_active' => (bool) $discountType->is_active,
                'is_mandatory' => (bool) $discountType->is_mandatory,
            ];
        });
    
    // Prepare preselected household data
    $preselectedHouseholdData = null;
    if ($household) {
        // Load head member for preselected household
        $household->load(['householdMembers' => function($query) {
            $query->where('is_head', true)->with('resident');
        }]);
        
        $headMember = $household->householdMembers->first();
        $headName = $headMember && $headMember->resident 
            ? trim("{$headMember->resident->first_name} {$headMember->resident->last_name}")
            : null;
        
        $preselectedHouseholdData = [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'name' => $headName ?? 'Household #' . $household->household_number,
            'purok' => $household->purok ? $household->purok->name : null,
            'contact_number' => $household->contact_number,
        ];
    }
    
    return Inertia::render('admin/Fees/Create', [
        'feeTypes' => $feeTypes,
        'residents' => $residents,
        'households' => $households,
        'preselectedResident' => $resident ? [
            'id' => $resident->id,
            'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}"),
            'full_name' => $resident->full_name,
            'purok' => $resident->purok ? $resident->purok->name : null,
            'contact_number' => $resident->contact_number,
            'is_senior' => (bool) $resident->is_senior,
            'is_pwd' => (bool) $resident->is_pwd,
            'eligible_discounts' => $this->getResidentEligibleDiscounts($resident),
        ] : null,
        'preselectedHousehold' => $preselectedHouseholdData,
        'puroks' => \App\Models\Purok::pluck('name')->filter()->values(),
        'discountTypes' => $discountTypes,
        // Add initial data for form
        'initialData' => $initialData,
        // Pass the fee being duplicated for reference
        'duplicateFrom' => $feeToDuplicate ? [
            'id' => $feeToDuplicate->id,
            'fee_code' => $feeToDuplicate->fee_code,
            'fee_type_name' => $feeToDuplicate->feeType->name ?? 'Unknown',
        ] : null,
    ]);
}

// Helper method to get resident eligible discounts
private function getResidentEligibleDiscounts($resident)
{
    $eligibleDiscounts = [];
    
    // Use the boolean fields from your model
    if ($resident->is_senior) {
        $eligibleDiscounts[] = 'SENIOR';
    }
    
    if ($resident->is_pwd) {
        $eligibleDiscounts[] = 'PWD';
    }
    
    // Check solo parent eligibility (you'll need to add this field to your resident model)
    // if ($resident->is_solo_parent) {
    //     $eligibleDiscounts[] = 'SOLO_PARENT';
    // }
    
    // Check indigent eligibility (you'll need to add this field to your resident model)
    // if ($resident->is_indigent) {
    //     $eligibleDiscounts[] = 'INDIGENT';
    // }
    
    return $eligibleDiscounts;
}

// Helper method for duplicate data preparation
private function prepareDuplicateData($fee)
{
    return [
        'fee_type_id' => $fee->fee_type_id,
        'payer_type' => $fee->payer_type,
        'resident_id' => $fee->payer_type === 'resident' ? $fee->resident_id : '',
        'household_id' => $fee->payer_type === 'household' ? $fee->household_id : '',
        'business_name' => $fee->business_name ?? '',
        'payer_name' => $fee->payer_name ?? '',
        'contact_number' => $fee->contact_number ?? '',
        'address' => $fee->address ?? '',
        'purok' => $fee->purok ?? '',
        'zone' => $fee->zone ?? '',
        'billing_period' => $fee->billing_period ?? '',
        'period_start' => $fee->period_start ? $fee->period_start->format('Y-m-d') : '',
        'period_end' => $fee->period_end ? $fee->period_end->format('Y-m-d') : '',
        'issue_date' => now()->format('Y-m-d'), // New issue date for duplicate
        'due_date' => now()->addDays(30)->format('Y-m-d'), // New due date for duplicate
        'base_amount' => (float) $fee->base_amount,
        'surcharge_amount' => (float) $fee->surcharge_amount,
        'penalty_amount' => (float) $fee->penalty_amount,
        'discount_amount' => (float) $fee->discount_amount,
        'discount_type_ids' => $fee->discount_type_ids ?? [], // Store as array of IDs
        'total_amount' => (float) $fee->total_amount,
        'purpose' => $fee->purpose ?? '',
        'property_description' => $fee->property_description ?? '',
        'business_type' => $fee->business_type ?? '',
        'area' => (float) $fee->area,
        'remarks' => $fee->remarks ?? '',
        'requirements_submitted' => $fee->requirements_submitted ?? [],
    ];
}


    
    // Store new fee
  public function store(Request $request)
{
    // Validate main fields
    $validated = $request->validate([
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
        'discount_amount' => 'nullable|numeric|min:0',
        'discount_type_ids' => 'nullable|array', // NEW: Array of discount type IDs
        'discount_type_ids.*' => 'exists:discount_types,id',
        'total_amount' => 'required|numeric|min:0',
        'purpose' => 'nullable|string',
        'property_description' => 'nullable|string',
        'business_type' => 'nullable|string',
        'area' => 'nullable|numeric|min:0',
        'remarks' => 'nullable|string',
        'requirements_submitted' => 'nullable|array',
    ]);

    // Get fee type
    $feeType = FeeType::find($validated['fee_type_id']);
    
    // Set default values
    $validated['fee_code'] = $feeType->code;
    $validated['status'] = 'issued';
    $validated['amount_paid'] = 0;
    $validated['balance'] = $validated['total_amount'];
    $validated['issued_by'] = auth()->id();
    $validated['created_by'] = auth()->id();
    
    // Handle discount type IDs - store as JSON array
    if (isset($validated['discount_type_ids'])) {
        $validated['discount_type_ids'] = json_encode($validated['discount_type_ids']);
    } else {
        $validated['discount_type_ids'] = json_encode([]);
    }
    
    // For backward compatibility, keep the old discount_type field
    // You can set this based on discount_type_ids if needed
    $validated['discount_type'] = 'other'; // Default or calculate based on discount_type_ids
    
    // For clearances/certificates, set validity dates
    if (in_array($feeType->category, ['clearance', 'certificate']) && $feeType->validity_days) {
        $validated['valid_from'] = $validated['issue_date'];
        $validated['valid_until'] = Carbon::parse($validated['issue_date'])->addDays($feeType->validity_days);
    }
    
    // Convert arrays to JSON
    if (isset($validated['requirements_submitted'])) {
        $validated['requirements_submitted'] = json_encode($validated['requirements_submitted']);
    }
    
    $fee = Fee::create($validated);
    
    // Generate certificate number if applicable
    if (in_array($feeType->category, ['clearance', 'certificate'])) {
        $fee->generateCertificateNumber();
    }
    
    // Generate fee code if not set
    if (!$fee->fee_code) {
        $fee->generateFeeCode();
    }
    
    return redirect()->route('fees.show', $fee)
        ->with('success', 'Fee created successfully.');
}
    

    // Show fee details - REVISED based on Payment model
    public function show(Fee $fee)
    {
        // Load all necessary relationships - UPDATED to match your Payment model
        $fee->load([
            'feeType:id,code,name,category,description,base_amount,validity_days',
            'resident:id,first_name,last_name,middle_name,birth_date,gender,occupation,contact_number',
            'household:id,head_of_family,address,contact_number',
            'issuedBy:id,first_name,last_name,email',
            'collectedBy:id,first_name,last_name,email',
            'cancelledBy:id,first_name,last_name,email',
            'paymentItems.payment:id,payment_date,or_number,payment_method,reference_number,status,recorded_by', // UPDATED: removed 'notes', changed to 'recorded_by'
            'paymentItems.payment.recorder:id,first_name,last_name', // UPDATED: using 'recorder' relationship
        ]);

        // Format fee data
        $formattedFee = $this->formatFeeForShow($fee);
        
        // Get related fees from the same payer
        $relatedFees = $this->getRelatedFees($fee);
        
        // Calculate statistics
        $stats = $this->calculateFeeStats($fee);
        
        // Get payment history
        $paymentHistory = $this->getPaymentHistory($fee);
        
        // Get activity log
        $activityLog = $this->getActivityLog($fee);

        return Inertia::render('admin/Fees/Show', [
            'fee' => $formattedFee,
            'related_fees' => $relatedFees,
            'payment_history' => $paymentHistory,
            'activity_log' => $activityLog,
            'stats' => $stats,
            'payment_methods' => [
                'cash' => 'Cash',
                'gcash' => 'GCash',
                'maya' => 'Maya',
                'bank' => 'Bank Transfer',
                'check' => 'Check',
                'online' => 'Online Payment',
            ],
            'permissions' => [
                'can_edit' => $fee->status === 'pending' || $fee->status === 'issued',
                'can_delete' => $fee->status === 'pending',
                'can_record_payment' => $fee->balance > 0 && !in_array($fee->status, ['paid', 'cancelled', 'waived']),
                'can_cancel' => in_array($fee->status, ['pending', 'issued', 'partially_paid']),
                'can_waive' => $fee->balance > 0 && !in_array($fee->status, ['paid', 'cancelled', 'waived']),
                'can_print' => true,
            ],
        ]);
    }
    
    // Format fee for show view - UPDATED
    private function formatFeeForShow(Fee $fee)
    {
        $formatted = [
            'id' => $fee->id,
            'fee_type_id' => $fee->fee_type_id,
            'fee_type' => $fee->feeType ? [
                'id' => $fee->feeType->id,
                'name' => $fee->feeType->name,
                'code' => $fee->feeType->code,
                'category' => $fee->feeType->category,
                'description' => $fee->feeType->description,
                'base_amount' => (float) $fee->feeType->base_amount,
                'validity_days' => $fee->feeType->validity_days,
            ] : null,
            'payer_type' => $fee->payer_type,
            'resident_id' => $fee->resident_id,
            'household_id' => $fee->household_id,
            'business_name' => $fee->business_name,
            'payer_name' => $fee->payer_name,
            'contact_number' => $fee->contact_number,
            'address' => $fee->address,
            'purok' => $fee->purok,
            'zone' => $fee->zone,
            'billing_period' => $fee->billing_period,
            'period_start' => $fee->period_start ? Carbon::parse($fee->period_start)->format('M d, Y') : null,
            'period_end' => $fee->period_end ? Carbon::parse($fee->period_end)->format('M d, Y') : null,
            'issue_date' => Carbon::parse($fee->issue_date)->format('M d, Y'),
            'due_date' => Carbon::parse($fee->due_date)->format('M d, Y'),
            'base_amount' => '₱' . number_format($fee->base_amount, 2),
            'surcharge_amount' => '₱' . number_format($fee->surcharge_amount, 2),
            'penalty_amount' => '₱' . number_format($fee->penalty_amount, 2),
            'discount_amount' => '₱' . number_format($fee->discount_amount, 2),
            'discount_type' => $fee->discount_type,
            'total_amount' => '₱' . number_format($fee->total_amount, 2),
            'amount_paid' => '₱' . number_format($fee->amount_paid, 2),
            'balance' => '₱' . number_format($fee->balance, 2),
            'purpose' => $fee->purpose,
            'property_description' => $fee->property_description,
            'business_type' => $fee->business_type,
            'area' => $fee->area,
            'remarks' => $fee->remarks,
            'requirements_submitted' => $fee->requirements_submitted ? json_decode($fee->requirements_submitted, true) : [],
            'status' => $fee->status,
            'status_label' => $this->getStatusLabel($fee->status),
            'fee_code' => $fee->fee_code,
            'or_number' => $fee->or_number,
            'certificate_number' => $fee->certificate_number,
            'issued_by' => $fee->issued_by,
            'collected_by' => $fee->collected_by,
            'cancelled_by' => $fee->cancelled_by,
            'valid_from' => $fee->valid_from ? Carbon::parse($fee->valid_from)->format('M d, Y') : null,
            'valid_until' => $fee->valid_until ? Carbon::parse($fee->valid_until)->format('M d, Y') : null,
            'waiver_reason' => $fee->waiver_reason,
            'cancelled_at' => $fee->cancelled_at ? Carbon::parse($fee->cancelled_at)->format('M d, Y h:i A') : null,
            'created_at' => Carbon::parse($fee->created_at)->format('M d, Y h:i A'),
            'updated_at' => Carbon::parse($fee->updated_at)->format('M d, Y h:i A'),
        ];

        // Add resident information
        if ($fee->resident) {
            $formatted['resident'] = [
                'id' => $fee->resident->id,
                'name' => trim($fee->resident->first_name . ' ' . $fee->resident->last_name),
                'birth_date' => $fee->resident->birth_date ? Carbon::parse($fee->resident->birth_date)->format('M d, Y') : null,
                'gender' => $fee->resident->gender,
                'occupation' => $fee->resident->occupation,
                'contact_number' => $fee->resident->contact_number,
            ];
        }

        // Add household information
        if ($fee->household) {
            $formatted['household'] = [
                'id' => $fee->household->id,
                'head_of_family' => $fee->household->head_of_family,
                'address' => $fee->household->address,
                'contact_number' => $fee->household->contact_number,
            ];
        }

        // Add user information
        if ($fee->issuedBy) {
            $formatted['issued_by_user'] = [
                'id' => $fee->issuedBy->id,
                'name' => trim($fee->issuedBy->first_name . ' ' . $fee->issuedBy->last_name),
                'email' => $fee->issuedBy->email,
            ];
        }

        if ($fee->collectedBy) {
            $formatted['collected_by_user'] = [
                'id' => $fee->collectedBy->id,
                'name' => trim($fee->collectedBy->first_name . ' ' . $fee->collectedBy->last_name),
                'email' => $fee->collectedBy->email,
            ];
        }

        if ($fee->cancelledBy) {
            $formatted['cancelled_by_user'] = [
                'id' => $fee->cancelledBy->id,
                'name' => trim($fee->cancelledBy->first_name . ' ' . $fee->cancelledBy->last_name),
                'email' => $fee->cancelledBy->email,
            ];
        }

        return $formatted;
    }
    
    // Get related fees
    private function getRelatedFees(Fee $fee)
    {
        $query = Fee::query()
            ->where('id', '!=', $fee->id)
            ->where('status', '!=', 'cancelled');
        
        // Filter by same payer
        if ($fee->resident_id) {
            $query->where('resident_id', $fee->resident_id);
        } elseif ($fee->household_id) {
            $query->where('household_id', $fee->household_id);
        } else {
            $query->where('payer_name', $fee->payer_name);
        }
        
        return $query->select(['id', 'fee_code', 'fee_type_id', 'total_amount', 'amount_paid', 'balance', 'status', 'issue_date'])
            ->with(['feeType:id,name'])
            ->orderBy('issue_date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($relatedFee) {
                return [
                    'id' => $relatedFee->id,
                    'fee_code' => $relatedFee->fee_code,
                    'fee_type_name' => $relatedFee->feeType->name ?? 'Unknown',
                    'total_amount' => '₱' . number_format($relatedFee->total_amount, 2),
                    'amount_paid' => '₱' . number_format($relatedFee->amount_paid, 2),
                    'balance' => '₱' . number_format($relatedFee->balance, 2),
                    'status' => $relatedFee->status,
                    'status_label' => $this->getStatusLabel($relatedFee->status),
                    'issue_date' => Carbon::parse($relatedFee->issue_date)->format('M d, Y'),
                ];
            });
    }
    
    // Get payment history - UPDATED
    private function getPaymentHistory(Fee $fee)
    {
        return $fee->paymentItems->map(function ($item) {
            return [
                'id' => $item->id,
                'amount' => '₱' . number_format($item->amount, 2),
                'description' => $item->description,
                'payment_date' => $item->payment ? Carbon::parse($item->payment->payment_date)->format('M d, Y') : null,
                'or_number' => $item->payment->or_number ?? null,
                'payment_method' => $item->payment->payment_method ?? null,
                'reference_number' => $item->payment->reference_number ?? null,
                'status' => $item->payment->status ?? 'completed',
                'received_by' => $item->payment->recorder ? // UPDATED: using recorder relationship
                    trim($item->payment->recorder->first_name . ' ' . $item->payment->recorder->last_name) : 'Unknown', 
                'created_at' => Carbon::parse($item->created_at)->format('M d, Y h:i A'),
            ];
        })->sortByDesc('payment_date')->values();
    }
    
    // Calculate fee statistics
    private function calculateFeeStats(Fee $fee)
    {
        $isOverdue = $fee->isOverdue();
        $daysOverdue = $fee->days_overdue;
        
        return [
            'payment_progress' => $fee->total_amount > 0 ? round(($fee->amount_paid / $fee->total_amount) * 100, 2) : 0,
            'is_overdue' => $isOverdue,
            'days_overdue' => $daysOverdue,
            'overdue_label' => $isOverdue ? "{$daysOverdue} days overdue" : null,
            'amount_breakdown' => [
                'base' => (float) $fee->base_amount,
                'surcharge' => (float) $fee->surcharge_amount,
                'penalty' => (float) $fee->penalty_amount,
                'discount' => (float) $fee->discount_amount,
                'total' => (float) $fee->total_amount,
                'paid' => (float) $fee->amount_paid,
                'balance' => (float) $fee->balance,
            ],
        ];
    }
    
    // Get activity log
    private function getActivityLog(Fee $fee)
    {
        // If you have activity logging (spatie/laravel-activitylog)
        if (class_exists('\Spatie\Activitylog\Models\Activity')) {
            return \Spatie\Activitylog\Models\Activity::where('subject_type', Fee::class)
                ->where('subject_id', $fee->id)
                ->with('causer')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($activity) {
                    return [
                        'description' => $activity->description,
                        'causer' => $activity->causer ? $activity->causer->name : 'System',
                        'created_at' => Carbon::parse($activity->created_at)->format('M d, Y h:i A'),
                        'properties' => $activity->properties,
                    ];
                });
        }
        
        // Fallback to simple log
        return collect([
            [
                'description' => 'Fee created',
                'causer' => $fee->issuedBy->name ?? 'System',
                'created_at' => Carbon::parse($fee->created_at)->format('M d, Y h:i A'),
                'properties' => [],
            ]
        ]);
    }
    
    // Get status label
    private function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'Pending',
            'issued' => 'Issued',
            'partially_paid' => 'Partially Paid',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            'waived' => 'Waived',
            'written_off' => 'Written Off',
        ];
        
        return $labels[$status] ?? ucfirst($status);
    }
    
    // Show edit form
    public function edit(Fee $fee)
    {
        // Check if fee can be edited
        if (!in_array($fee->status, ['pending', 'issued'])) {
            return redirect()->route('fees.show', $fee)
                ->with('error', 'Only pending or issued fees can be edited.');
        }
        
        $fee->load(['feeType', 'resident', 'household']);
        
        return Inertia::render('admin/Fees/Edit', [
            'fee' => $fee,
            'feeTypes' => FeeType::active()->get(),
            'residents' => Resident::with('purok')
                ->select(['id', 'first_name', 'last_name', 'middle_name', 'purok_id'])
                ->orderBy('last_name')
                ->get()
                ->map(function($resident) {
                    return [
                        'id' => $resident->id,
                        'name' => trim("{$resident->first_name} {$resident->middle_name} {$resident->last_name}"),
                        'purok' => $resident->purok ? $resident->purok->name : null,
                    ];
                }),
            'households' => Household::select(['id', 'head_name', 'purok'])
                ->orderBy('head_name')
                ->get()
                ->map(function($household) {
                    return [
                        'id' => $household->id,
                        'name' => $household->head_name,
                        'purok' => $household->purok,
                    ];
                }),
        ]);
    }
    
    // Update fee
    public function update(Request $request, Fee $fee)
    {
        // Can only update pending or issued fees
        if (!in_array($fee->status, ['pending', 'issued'])) {
            return back()->with('error', 'Only pending or issued fees can be updated.');
        }
        
        $validated = $request->validate([
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
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:senior,pwd,solo_parent,indigent,other',
            'total_amount' => 'required|numeric|min:0',
            'purpose' => 'nullable|string',
            'property_description' => 'nullable|string',
            'business_type' => 'nullable|string',
            'area' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
            'requirements_submitted' => 'nullable|array',
        ]);
        
        // Get fee type
        $feeType = FeeType::find($validated['fee_type_id']);
        
        // Update fee code
        $validated['fee_code'] = $feeType->code;
        
        // Recalculate balance if total amount changed
        if ($validated['total_amount'] != $fee->total_amount) {
            $validated['balance'] = $validated['total_amount'] - $fee->amount_paid;
        }
        
        // Update updated_by
        $validated['updated_by'] = auth()->id();
        
        // Convert arrays to JSON
        if (isset($validated['requirements_submitted'])) {
            $validated['requirements_submitted'] = json_encode($validated['requirements_submitted']);
        }
        
        $fee->update($validated);
        
        // Update status based on new balance
        $fee->updateStatus();
        
        return redirect()->route('fees.show', $fee)
            ->with('success', 'Fee updated successfully.');
    }
    
    // Delete fee
    public function destroy(Fee $fee)
    {
        // Can only delete pending fees
        if ($fee->status !== 'pending') {
            return back()->with('error', 'Only pending fees can be deleted.');
        }
        
        $fee->delete();
        
        return redirect()->route('fees.index')
            ->with('success', 'Fee deleted successfully.');
    }
    
    // Record payment for fee - UPDATED to use Payment model fields
    public function recordPayment(Fee $fee, Request $request)
    {
        // Check if fee is already paid
        if ($fee->status === 'paid') {
            return back()->with('error', 'Fee is already paid.');
        }
        
        $validated = $request->validate([
            'payment_amount' => 'required|numeric|min:0.01|max:' . $fee->balance,
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,gcash,maya,bank,check,online',
            'reference_number' => 'nullable|string|max:255',
            'or_number' => 'nullable|string|max:50|unique:payments,or_number',
            'remarks' => 'nullable|string',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Create payment record using Payment model fields
            $payment = new Payment();
            $payment->or_number = $validated['or_number'] ?? Payment::generateOrNumber();
            $payment->reference_number = $validated['reference_number'] ?? null;
            $payment->payment_date = $validated['payment_date'];
            $payment->payment_method = $validated['payment_method'];
            $payment->total_amount = $validated['payment_amount'];
            $payment->recorded_by = auth()->id(); // Using recorded_by from Payment model
            $payment->status = 'completed';
            $payment->remarks = $validated['remarks'] ?? null; // Using remarks from Payment model
            $payment->subtotal = $validated['payment_amount']; // Assuming subtotal equals payment amount
            $payment->payer_type = $fee->payer_type;
            $payment->payer_id = $fee->payer_type === 'resident' ? $fee->resident_id : 
                               ($fee->payer_type === 'household' ? $fee->household_id : null);
            $payment->payer_name = $fee->payer_name;
            $payment->contact_number = $fee->contact_number;
            $payment->address = $fee->address;
            $payment->purok = $fee->purok;
            $payment->save();
            
            // Create payment item
            $paymentItem = new PaymentItem();
            $paymentItem->payment_id = $payment->id;
            $paymentItem->fee_id = $fee->id;
            $paymentItem->amount = $validated['payment_amount']; // Adjust field name if different
            $paymentItem->description = "Payment for fee {$fee->fee_code}";
            $paymentItem->save();
            
            // Apply payment to fee
            $fee->applyPayment(
                $validated['payment_amount'],
                $payment->id,
                [
                    'or_number' => $payment->or_number,
                    'collected_by' => auth()->id(),
                ]
            );
            
            DB::commit();
            
            return redirect()->route('fees.show', $fee)
                ->with('success', 'Payment of ₱' . number_format($validated['payment_amount'], 2) . ' recorded successfully. OR#: ' . $payment->or_number);
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to record payment. Please try again.');
        }
    }
    
    // Cancel fee
    public function cancel(Fee $fee, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);
        
        $fee->update([
            'status' => 'cancelled',
            'cancelled_by' => auth()->id(),
            'cancelled_at' => now(),
            'waiver_reason' => $request->reason,
        ]);
        
        return back()->with('success', 'Fee cancelled successfully.');
    }
    
    // Waive fee - UPDATED to use Payment model
    public function waive(Fee $fee, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'waiver_amount' => 'required|numeric|min:0.01|max:' . $fee->balance,
        ]);
        
        DB::beginTransaction();
        
        try {
            // Create payment record for waiver using Payment model
            $payment = new Payment();
            $payment->or_number = 'WAIVER';
            $payment->reference_number = 'WAIVER-' . date('YmdHis');
            $payment->payment_date = now();
            $payment->payment_method = 'waiver';
            $payment->total_amount = $request->waiver_amount;
            $payment->subtotal = $request->waiver_amount;
            $payment->recorded_by = auth()->id();
            $payment->status = 'completed';
            $payment->remarks = "Waiver: {$request->reason}";
            $payment->payer_type = $fee->payer_type;
            $payment->payer_id = $fee->payer_type === 'resident' ? $fee->resident_id : 
                               ($fee->payer_type === 'household' ? $fee->household_id : null);
            $payment->payer_name = $fee->payer_name;
            $payment->contact_number = $fee->contact_number;
            $payment->address = $fee->address;
            $payment->purok = $fee->purok;
            $payment->save();
            
            // Create payment item
            $paymentItem = new PaymentItem();
            $paymentItem->payment_id = $payment->id;
            $paymentItem->fee_id = $fee->id;
            $paymentItem->amount = $request->waiver_amount;
            $paymentItem->description = "Waiver: {$request->reason}";
            $paymentItem->save();
            
            // Update fee
            $fee->applyPayment($request->waiver_amount, $payment->id);
            $fee->waiver_reason = $request->reason;
            $fee->status = 'waived';
            $fee->save();
            
            DB::commit();
            
            return back()->with('success', 'Fee balance of ₱' . number_format($request->waiver_amount, 2) . ' waived successfully.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to waive fee. Please try again.');
        }
    }
    
    // Print fee receipt or certificate
   public function print(Fee $fee, Request $request)
{
    // Get the print type from query parameter or default to 'receipt'
    $type = $request->get('type', 'receipt');
    $action = $request->get('action', 'preview'); // 'preview' or 'download'
    
    // Load required relationships
    $fee->load([
        'feeType',
        'issuedBy',
        'paymentItems.payment' => function ($query) {
            $query->orderBy('payment_date', 'desc');
        }
    ]);
    
    // Load payer
    if ($fee->payer_type === 'resident' && $fee->resident) {
        $fee->load('resident');
    } elseif ($fee->payer_type === 'household' && $fee->household) {
        $fee->load('household');
    }
    
    // Format names for display
    if ($fee->issuedBy) {
        $fee->issuedBy->formatted_name = trim($fee->issuedBy->first_name . ' ' . $fee->issuedBy->last_name);
    }
    
    if ($fee->payer_type === 'resident' && $fee->resident) {
        $fee->resident->formatted_name = trim($fee->resident->first_name . ' ' . $fee->resident->last_name);
    }
    
    $data = [
        'fee' => $fee,
        'barangay' => [
            'name' => config('app.barangay_name', 'Barangay Management System'),
            'address' => config('app.barangay_address', ''),
            'contact' => config('app.barangay_contact', ''),
            'official' => Auth::user()->name,
            'position' => Auth::user()->role ?? 'Barangay Staff',
        ],
        'print_date' => now()->format('F j, Y h:i A'),
        'type' => $type,
    ];
    
    if ($type === 'certificate' && $fee->certificate_number) {
        $view = 'pdf.fee-certificate';
        $filename = "certificate-{$fee->certificate_number}.pdf";
    } else {
        $view = 'pdf.fee-receipt';
        $filename = "receipt-{$fee->fee_code}.pdf";
    }
    
    $pdf = Pdf::loadView($view, $data);
    
    // Set paper size and orientation
    $pdf->setPaper('A4', 'portrait');
    
    // Return based on action parameter
    if ($action === 'download') {
        return $pdf->download($filename);
    }
    
    // Default: preview in browser
    return $pdf->stream($filename);
}
    
    // Generate payment reference - REMOVED since Payment model has its own method
    private function generatePaymentReference()
    {
        $date = date('Ymd');
        $count = Payment::whereDate('created_at', today())->count() + 1;
        return "PAY-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
    
    // Generate OR number - REMOVED since Payment model has its own method
    private function generateORNumber()
    {
        return Payment::generateOrNumber();
    }
    
    // Bulk actions
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:issue,mark_paid,cancel,delete',
            'fee_ids' => 'required|array',
            'fee_ids.*' => 'exists:fees,id',
        ]);
        
        $count = 0;
        
        foreach ($request->fee_ids as $feeId) {
            $fee = Fee::find($feeId);
            
            switch ($request->action) {
                case 'issue':
                    if ($fee->status === 'pending') {
                        $fee->update(['status' => 'issued']);
                        $count++;
                    }
                    break;
                    
                case 'mark_paid':
                    if (in_array($fee->status, ['issued', 'partially_paid', 'overdue'])) {
                        $fee->applyPayment($fee->balance, null, [
                            'payment_date' => now(),
                            'payment_method' => 'cash',
                            'collected_by' => auth()->id(),
                        ]);
                        $count++;
                    }
                    break;
                    
                case 'cancel':
                    if (in_array($fee->status, ['pending', 'issued'])) {
                        $fee->update([
                            'status' => 'cancelled',
                            'cancelled_by' => auth()->id(),
                            'cancelled_at' => now(),
                        ]);
                        $count++;
                    }
                    break;
                    
                case 'delete':
                    if ($fee->status === 'pending') {
                        $fee->delete();
                        $count++;
                    }
                    break;
            }
        }
        
        return back()->with('success', "{$count} fees updated successfully.");
    }
    
    // Dashboard statistics
    public function dashboard()
    {
        $today = now()->toDateString();
        
        $stats = [
            'total_fees' => Fee::count(),
            'today_fees' => Fee::whereDate('created_at', $today)->count(),
            'total_collected' => Fee::where('status', 'paid')->sum('amount_paid'),
            'pending_collection' => Fee::whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
            'overdue_fees' => Fee::where('status', 'overdue')->count(),
        ];
        
        // Recent fees
        $recentFees = Fee::with(['feeType', 'resident'])
            ->latest()
            ->limit(10)
            ->get();
        
        // Monthly collection chart
        $monthlyCollections = Fee::select(
                DB::raw('MONTH(payment_date) as month'),
                DB::raw('YEAR(payment_date) as year'),
                DB::raw('SUM(amount_paid) as total')
            )
            ->where('status', 'paid')
            ->whereYear('payment_date', now()->year)
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        
        // Fees by category
        $feesByCategory = Fee::select(
                'fee_types.category',
                DB::raw('COUNT(fees.id) as count'),
                DB::raw('SUM(fees.total_amount) as total')
            )
            ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
            ->groupBy('fee_types.category')
            ->get();
        
        return Inertia::render('admin/Fees/Dashboard', [
            'stats' => $stats,
            'recentFees' => $recentFees,
            'monthlyCollections' => $monthlyCollections,
            'feesByCategory' => $feesByCategory,
        ]);
    }
    
    // Export fees
    public function export(Request $request)
    {
        $query = Fee::query()
            ->with(['feeType', 'resident', 'household', 'payment'])
            ->latest();
        
        // Apply filters same as index
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payer_name', 'like', "%{$search}%")
                  ->orWhere('or_number', 'like', "%{$search}%")
                  ->orWhere('certificate_number', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('category') && $request->category) {
            $query->whereHas('feeType', function($q) use ($request) {
                $q->where('category', $request->category);
            });
        }
        
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('issue_date', '>=', $request->from_date);
        }
        
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('issue_date', '<=', $request->to_date);
        }
        
        $fees = $query->get();
        
        // Generate CSV
        $fileName = 'fees_export_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];
        
        $callback = function() use ($fees) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fwrite($file, "\xEF\xBB\xBF");
            
            // Headers
            fputcsv($file, [
                'ID',
                'Fee Code',
                'Fee Type',
                'Category',
                'Payer Name',
                'Payer Type',
                'Contact Number',
                'Purok',
                'Issue Date',
                'Due Date',
                'Total Amount',
                'Amount Paid',
                'Balance',
                'Status',
                'OR Number',
                'Certificate Number',
                'Created At'
            ]);
            
            // Data
            foreach ($fees as $fee) {
                fputcsv($file, [
                    $fee->id,
                    $fee->fee_code,
                    $fee->feeType->name ?? 'N/A',
                    $fee->feeType->category ?? 'N/A',
                    $fee->payer_name,
                    $fee->payer_type,
                    $fee->contact_number,
                    $fee->purok,
                    $fee->issue_date,
                    $fee->due_date,
                    $fee->total_amount,
                    $fee->amount_paid,
                    $fee->balance,
                    $fee->status,
                    $fee->or_number,
                    $fee->certificate_number,
                    $fee->created_at,
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

     public function outstanding(Request $request)
    {
        // Get search and filter parameters
        $search = $request->input('search', '');
        $status = $request->input('status', 'overdue'); // overdue, pending, all
        $purok = $request->input('purok', '');
        
        // Build query for outstanding fees
        $query = Fee::with(['feeType', 'resident', 'household'])
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid'])
            ->orderBy('due_date');
        
        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('fee_code', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%")
                  ->orWhereHas('resident', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('household', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Apply status filter
        if ($status === 'overdue') {
            $query->where('due_date', '<', Carbon::today());
        } elseif ($status === 'pending') {
            $query->where('due_date', '>=', Carbon::today());
        }
        // If status is 'all', show both overdue and pending
        
        // Apply purok filter
        if ($purok) {
            $query->where('purok', $purok);
        }
        
        // Paginate results
        $fees = $query->paginate(20)->withQueryString();
        
        // Calculate stats
        $totalOutstanding = Fee::where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid'])
            ->sum('balance');
        
        $overdueCount = Fee::where('balance', '>', 0)
            ->where('due_date', '<', Carbon::today())
            ->whereIn('status', ['pending', 'issued', 'partially_paid'])
            ->count();
            
        $pendingCount = Fee::where('balance', '>', 0)
            ->where('due_date', '>=', Carbon::today())
            ->whereIn('status', ['pending', 'issued', 'partially_paid'])
            ->count();
        
        // Calculate average days overdue
        $overdueFees = Fee::where('balance', '>', 0)
            ->where('due_date', '<', Carbon::today())
            ->whereIn('status', ['pending', 'issued', 'partially_paid'])
            ->get();
            
        $averageDaysOverdue = $overdueFees->count() > 0 
            ? $overdueFees->avg(function ($fee) {
                return Carbon::parse($fee->due_date)->diffInDays(Carbon::today());
            }) 
            : 0;
        
        // Get puroks for filter
        $puroks = Fee::whereNotNull('purok')
            ->distinct()
            ->pluck('purok')
            ->sort()
            ->values();
        
        return Inertia::render('admin/Fees/Outstanding', [
            'fees' => $fees,
            'stats' => [
                'totalOutstanding' => $totalOutstanding,
                'overdueCount' => $overdueCount,
                'pendingCount' => $pendingCount,
                'averageDaysOverdue' => round($averageDaysOverdue, 1),
            ],
            'puroks' => $puroks,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'purok' => $purok,
            ],
        ]);
    }
}