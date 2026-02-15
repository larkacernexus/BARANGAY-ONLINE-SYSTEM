<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Payment;
use App\Models\PaymentItem;
use App\Models\PaymentDiscount;
use App\Models\DiscountRule;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\DocumentCategory;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class FeeController extends Controller
{
    // Display list of fees
public function index(Request $request)
{
    try {
        Log::info('FeeController@index accessed', [
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'filters' => $request->all()
        ]);

        // Build query WITHOUT problematic eager loading
        $query = Fee::query()
            ->with([
                'feeType:id,name,code,document_category_id,is_discountable',
                'paymentItems.payment:id,payment_date,total_amount,or_number,status'
            ])
            ->latest();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payer_name', 'like', "%{$search}%")
                    ->orWhere('or_number', 'like', "%{$search}%")
                    ->orWhere('certificate_number', 'like', "%{$search}%")
                    ->orWhere('fee_code', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhere('purok', 'like', "%{$search}%");
            });

            Log::debug('Fee search applied', ['search_term' => $search]);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
            Log::debug('Fee status filter applied', ['status' => $request->status]);
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->whereHas('feeType', function ($q) use ($request) {
                $q->where('document_category_id', $request->category);
            });
            Log::debug('Fee category filter applied', ['category' => $request->category]);
        }

        // Filter by purok
        if ($request->has('purok') && $request->purok) {
            $query->where('purok', $request->purok);
            Log::debug('Fee purok filter applied', ['purok' => $request->purok]);
        }

        // Filter by payer type
        if ($request->has('payer_type') && $request->payer_type) {
            $query->where('payer_type', $request->payer_type);
            Log::debug('Fee payer type filter applied', ['payer_type' => $request->payer_type]);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('issue_date', '>=', $request->from_date);
            Log::debug('Fee from_date filter applied', ['from_date' => $request->from_date]);
        }

        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('issue_date', '<=', $request->to_date);
            Log::debug('Fee to_date filter applied', ['to_date' => $request->to_date]);
        }

        // Filter by amount range
        if ($request->has('min_amount')) {
            $query->where('total_amount', '>=', $request->min_amount);
            Log::debug('Fee min_amount filter applied', ['min_amount' => $request->min_amount]);
        }

        if ($request->has('max_amount')) {
            $query->where('total_amount', '<=', $request->max_amount);
            Log::debug('Fee max_amount filter applied', ['max_amount' => $request->max_amount]);
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

                // Format amounts with currency - UPDATED to use amount_paid as primary
                $fee->formatted_total_amount = '₱' . number_format($fee->total_amount, 2);
                $fee->formatted_amount_paid = '₱' . number_format($fee->amount_paid, 2);
                $fee->formatted_balance = '₱' . number_format($fee->balance, 2);

                // Get payer details safely (using the data already in the fee record)
                $fee->payer_details = $this->getPayerDetails($fee);

                // Include IDs for polymorphic relationships
                $fee->resident_id = $fee->payer_type === 'resident' ? $fee->payer_id : null;
                $fee->household_id = $fee->payer_type === 'household' ? $fee->payer_id : null;

                return $fee;
            });

        // Get statistics - UPDATED to use amount_paid instead of total_amount
        $stats = $this->getStatistics();

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
        $categories = DocumentCategory::active()
            ->ordered()
            ->get(['id', 'name'])
            ->pluck('name', 'id')
            ->toArray();

        // Payer type options
        $payerTypes = [
            'resident' => 'Resident',
            'business' => 'Business',
            'household' => 'Household',
            'visitor' => 'Visitor',
            'other' => 'Other',
        ];

        Log::info('FeeController@index completed successfully', [
            'fee_count' => $fees->total(),
            'total_records' => $stats['total']
        ]);

        return Inertia::render('admin/Fees/Index', [
            'fees' => $fees,
            'filters' => $request->only([
                'search',
                'status',
                'category',
                'purok',
                'payer_type',
                'from_date',
                'to_date',
                'min_amount',
                'max_amount'
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

    } catch (\Exception $e) {
        Log::error('FeeController@index error', [
            'user_id' => Auth::id(),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return back()->with('error', 'Failed to load fees. Please try again.');
    }
}

    // Add this helper method to your controller
    private function getPayerDetails($fee)
    {
        // Return basic payer info from the fee record itself
        $details = [
            'name' => $fee->payer_name,
            'contact' => $fee->contact_number,
            'purok' => $fee->purok,
            'address' => $fee->address,
            'type' => $fee->payer_type,
            'business_name' => $fee->business_name,
        ];

        // Try to get additional details from the related model if possible
        if ($fee->payer_id && $fee->payer_model) {
            try {
                $modelClass = $this->normalizeModelClass($fee->payer_model);

                if (class_exists($modelClass)) {
                    $payerModel = $modelClass::find($fee->payer_id);
                    if ($payerModel) {
                        if ($modelClass === Resident::class) {
                            $details['full_name'] = $payerModel->first_name . ' ' . $payerModel->last_name;
                            $details['first_name'] = $payerModel->first_name;
                            $details['last_name'] = $payerModel->last_name;
                            $details['middle_name'] = $payerModel->middle_name;
                            $details['is_senior'] = $payerModel->is_senior;
                            $details['is_pwd'] = $payerModel->is_pwd;
                            $details['is_solo_parent'] = $payerModel->is_solo_parent;
                            $details['is_indigent'] = $payerModel->is_indigent;
                        } elseif ($modelClass === Household::class) {
                            $details['head_of_family'] = $payerModel->head_of_family;
                            $details['household_number'] = $payerModel->household_number;
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to load detailed payer info', [
                    'fee_id' => $fee->id,
                    'payer_model' => $fee->payer_model,
                    'payer_id' => $fee->payer_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $details;
    }

    // Helper to normalize model class names
    private function normalizeModelClass($className)
    {
        if (empty($className)) {
            return null;
        }

        if (class_exists($className)) {
            return $className;
        }

        $modelMap = [
            'resident' => Resident::class,
            'Resident' => Resident::class,
            'household' => Household::class,
            'Household' => Household::class,
            'business' => Business::class,
            'Business' => Business::class,
        ];

        return $modelMap[$className] ?? $className;
    }

    public function quickStats(Request $request)
    {
        try {
            $period = $request->get('period', 'today');

            Log::debug('FeeController@quickStats called', [
                'period' => $period,
                'user_id' => Auth::id()
            ]);

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

            Log::info('FeeController@quickStats completed', [
                'period' => $period,
                'stats' => $stats
            ]);

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('FeeController@quickStats error', [
                'user_id' => Auth::id(),
                'period' => $period ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    // Get fees by status for chart
    public function statusChartData()
    {
        try {
            Log::debug('FeeController@statusChartData called', ['user_id' => Auth::id()]);

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
                'pending',
                'issued',
                'partially_paid',
                'paid',
                'overdue',
                'cancelled',
                'waived'
            ];

            foreach ($statuses as $status) {
                $chartData['labels'][] = ucfirst(str_replace('_', ' ', $status));
                $chartData['datasets'][0]['data'][] = $data[$status]->count ?? 0;
            }

            Log::info('FeeController@statusChartData completed', [
                'total_records' => array_sum($chartData['datasets'][0]['data'])
            ]);

            return response()->json($chartData);

        } catch (\Exception $e) {
            Log::error('FeeController@statusChartData error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'labels' => [],
                'datasets' => [[]]
            ], 500);
        }
    }

    // Get monthly collection data for chart
    public function monthlyCollectionChart()
    {
        try {
            Log::debug('FeeController@monthlyCollectionChart called', ['user_id' => Auth::id()]);

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

            Log::info('FeeController@monthlyCollectionChart completed', [
                'data_points' => count($labels)
            ]);

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

        } catch (\Exception $e) {
            Log::error('FeeController@monthlyCollectionChart error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'labels' => [],
                'datasets' => [[]]
            ], 500);
        }
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
        try {
            Log::info('FeeController@create accessed', [
                'user_id' => Auth::id(),
                'request_params' => $request->all()
            ]);

            $resident = null;
            $household = null;
            $feeToDuplicate = null;

            // Check if we're duplicating from an existing fee
            if ($request->has('duplicate_from')) {
                $feeToDuplicate = Fee::with(['feeType', 'resident', 'household'])->find($request->duplicate_from);

                if ($feeToDuplicate) {
                    if ($feeToDuplicate->payer_type === 'resident' && $feeToDuplicate->resident) {
                        $resident = $feeToDuplicate->resident;
                    } elseif ($feeToDuplicate->payer_type === 'household' && $feeToDuplicate->household) {
                        $household = $feeToDuplicate->household;
                    }

                    Log::info('Fee duplication requested', [
                        'original_fee_id' => $feeToDuplicate->id,
                        'original_fee_code' => $feeToDuplicate->fee_code
                    ]);
                }
            }

            if ($request->has('resident_id')) {
                $resident = Resident::with('purok')->find($request->resident_id);
                Log::debug('Preselected resident', ['resident_id' => $request->resident_id]);
            }

            if ($request->has('household_id')) {
                $household = Household::with(['purok', 'householdMembers.resident'])->find($request->household_id);
                Log::debug('Preselected household', ['household_id' => $request->household_id]);
            }

            // Prepare initial data for form
            $initialData = [];
            if ($feeToDuplicate) {
                $initialData = $this->prepareDuplicateData($feeToDuplicate);
            }

            // SIMPLIFIED: Get fee types without discount relationships
            $feeTypes = FeeType::with(['documentCategory'])
                ->active()
                ->get()
                ->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'code' => $type->code,
                        'name' => $type->name,
                        'document_category_id' => $type->document_category_id,
                        'document_category' => $type->documentCategory ? [
                            'id' => $type->documentCategory->id,
                            'name' => $type->documentCategory->name,
                            'slug' => $type->documentCategory->slug,
                            'icon' => $type->documentCategory->icon,
                            'color' => $type->documentCategory->color,
                        ] : null,
                        'base_amount' => (float) $type->base_amount,
                        'amount_type' => $type->amount_type,
                        'is_discountable' => (bool) $type->is_discountable,
                        'has_surcharge' => (bool) $type->has_surcharge,
                        'surcharge_percentage' => (float) $type->surcharge_percentage,
                        'surcharge_fixed' => (float) $type->surcharge_fixed,
                        'has_penalty' => (bool) $type->has_penalty,
                        'penalty_percentage' => (float) $type->penalty_percentage,
                        'penalty_fixed' => (float) $type->penalty_fixed,
                        'validity_days' => $type->validity_days,
                        'description' => $type->description,
                    ];
                });

            // Get residents for bulk selection
            $residents = Resident::with('purok')
                ->select(['id', 'first_name', 'last_name', 'middle_name', 'purok_id', 'contact_number', 'birth_date', 'is_pwd', 'is_senior', 'is_solo_parent', 'is_indigent'])
                ->orderBy('last_name')
                ->get()
                ->map(function ($resident) {
                    $age = $resident->birth_date ? Carbon::parse($resident->birth_date)->age : 0;
                    $isSenior = $resident->is_senior || $age >= 60;

                    return [
                        'id' => $resident->id,
                        'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}"),
                        'full_name' => $resident->full_name,
                        'purok' => $resident->purok ? $resident->purok->name : null,
                        'contact_number' => $resident->contact_number,
                        'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                        'age' => $age,
                        'is_senior' => (bool) $isSenior,
                        'is_pwd' => (bool) $resident->is_pwd,
                        'is_solo_parent' => (bool) $resident->is_solo_parent,
                        'is_indigent' => (bool) $resident->is_indigent,
                        'has_special_classification' => $isSenior || $resident->is_pwd || $resident->is_solo_parent || $resident->is_indigent,
                    ];
                });

            // Get households for bulk selection
            $households = Household::with([
                'purok',
                'householdMembers' => function ($query) {
                    $query->where('is_head', true)->with('resident');
                }
            ])
                ->select(['id', 'household_number', 'purok_id', 'contact_number'])
                ->orderBy('household_number')
                ->get()
                ->map(function ($household) {
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

            // Prepare preselected data
            $preselectedResidentData = null;
            if ($resident) {
                $age = $resident->birth_date ? Carbon::parse($resident->birth_date)->age : 0;
                $isSenior = $resident->is_senior || $age >= 60;

                $preselectedResidentData = [
                    'id' => $resident->id,
                    'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}"),
                    'full_name' => $resident->full_name,
                    'purok' => $resident->purok ? $resident->purok->name : null,
                    'contact_number' => $resident->contact_number,
                    'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                    'age' => $age,
                    'is_senior' => (bool) $isSenior,
                    'is_pwd' => (bool) $resident->is_pwd,
                    'is_solo_parent' => (bool) $resident->is_solo_parent,
                    'is_indigent' => (bool) $resident->is_indigent,
                ];
            }

            $preselectedHouseholdData = null;
            if ($household) {
                $household->load([
                    'householdMembers' => function ($query) {
                        $query->where('is_head', true)->with('resident');
                    }
                ]);

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

            // Get discount rules for reference (not for automatic application)
            $discountRules = DiscountRule::active()->get(['id', 'code', 'name', 'discount_type', 'value_type', 'discount_value']);

            return Inertia::render('admin/Fees/Create', [
                'feeTypes' => $feeTypes,
                'residents' => $residents,
                'households' => $households,
                'discountRules' => $discountRules,
                'preselectedResident' => $preselectedResidentData,
                'preselectedHousehold' => $preselectedHouseholdData,
                'puroks' => \App\Models\Purok::pluck('name')->filter()->values(),
                'documentCategories' => DocumentCategory::active()->ordered()->get(),
                'initialData' => $initialData,
                'duplicateFrom' => $feeToDuplicate ? [
                    'id' => $feeToDuplicate->id,
                    'fee_code' => $feeToDuplicate->fee_code,
                    'fee_type_name' => $feeToDuplicate->feeType->name ?? 'Unknown',
                ] : null,
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@create error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load fee creation form. Please try again.');
        }
    }

    // Prepare duplicate data helper
    private function prepareDuplicateData(Fee $fee)
    {
        return [
            'fee_type_id' => $fee->fee_type_id,
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
            'period_start' => $fee->period_start,
            'period_end' => $fee->period_end,
            'issue_date' => $fee->issue_date,
            'due_date' => $fee->due_date,
            'base_amount' => $fee->base_amount,
            'surcharge_amount' => $fee->surcharge_amount,
            'penalty_amount' => $fee->penalty_amount,
            'discount_amount' => 0, // Reset discount for new fee
            'total_amount' => $fee->base_amount + ($fee->surcharge_amount ?? 0) + ($fee->penalty_amount ?? 0),
            'purpose' => $fee->purpose,
            'property_description' => $fee->property_description,
            'business_type' => $fee->business_type,
            'area' => $fee->area,
            'remarks' => $fee->remarks,
        ];
    }

    // Store new fee with bulk creation support
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@store started', [
                'user_id' => Auth::id(),
                'bulk_type' => $request->bulk_type ?? 'none',
                'bulk_selection_count' => $this->getBulkSelectionCount($request)
            ]);

            $bulkType = $request->bulk_type ?? 'none';
            $createdFees = [];

            if ($bulkType === 'none') {
                $fee = $this->createSingleFee($request);
                if ($fee) {
                    $createdFees[] = $fee;
                }
            } else {
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

        // SIMPLIFIED: No discounts at creation time
        $validated['discount_amount'] = 0;

        // Calculate total amount (no discount subtraction)
        $validated['total_amount'] = $validated['base_amount']
            + ($validated['surcharge_amount'] ?? 0)
            + ($validated['penalty_amount'] ?? 0);

        $validated = $this->setDefaultFeeValues($validated, $request->fee_type_id);

        if (isset($validated['requirements_submitted'])) {
            $validated['requirements_submitted'] = json_encode($validated['requirements_submitted']);
        }

        $fee = Fee::create($validated);

        $this->generateFeeIdentifiers($fee);

        return $fee;
    }

    // Helper method to create bulk fees
    private function createBulkFees($request)
    {
        $createdFees = [];
        $bulkType = $request->bulk_type;

        if ($bulkType === 'residents') {
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

    // REMOVED: processDiscounts method

    private function createFeeForResident($request, $resident)
    {
        $feeData = $this->prepareFeeData($request);
        
        $feeData['payer_type'] = 'resident';
        $feeData['resident_id'] = $resident->id;
        $feeData['payer_id'] = $resident->id;
        $feeData['payer_model'] = Resident::class;
        $feeData['payer_name'] = $resident->full_name ?? trim($resident->first_name . ' ' . $resident->last_name);
        $feeData['contact_number'] = $resident->contact_number;
        $feeData['purok'] = $resident->purok ? $resident->purok->name : null;
        
        // Store resident verification info for reference only
        if ($request->include_resident_details ?? false) {
            $feeData['ph_senior_id_verified'] = $resident->is_senior;
            $feeData['ph_pwd_id_verified'] = $resident->is_pwd;
            $feeData['ph_solo_parent_id_verified'] = $resident->is_solo_parent;
            $feeData['ph_indigent_id_verified'] = $resident->is_indigent;
        }

        $feeData = $this->setDefaultFeeValues($feeData, $request->fee_type_id);

        $fee = Fee::create($feeData);
        $this->generateFeeIdentifiers($fee);
        
        return $fee;
    }

    private function createFeeForHousehold($request, $household)
    {
        $feeData = $this->prepareFeeData($request);
        
        $headMember = $household->householdMembers()->where('is_head', true)->first();
        $householdName = $headMember && $headMember->resident 
            ? $headMember->resident->full_name ?? trim($headMember->resident->first_name . ' ' . $headMember->resident->last_name)
            : 'Household #' . $household->household_number;

        $feeData['payer_type'] = 'household';
        $feeData['household_id'] = $household->id;
        $feeData['payer_id'] = $household->id;
        $feeData['payer_model'] = Household::class;
        $feeData['payer_name'] = $householdName;
        $feeData['contact_number'] = $household->contact_number;
        $feeData['purok'] = $household->purok ? $household->purok->name : null;

        $feeData = $this->setDefaultFeeValues($feeData, $request->fee_type_id);

        $fee = Fee::create($feeData);
        $this->generateFeeIdentifiers($fee);
        
        return $fee;
    }

    private function createFeeForCustomPayer($request, $customPayer)
    {
        $feeData = $this->prepareFeeData($request);
        
        $feeData['payer_type'] = 'visitor';
        $feeData['payer_name'] = $customPayer['name'];
        $feeData['contact_number'] = $customPayer['contact_number'] ?? null;
        $feeData['address'] = $customPayer['address'] ?? null;
        $feeData['purok'] = $customPayer['purok'] ?? null;
        $feeData['payer_id'] = null;
        $feeData['payer_model'] = null;

        $feeData = $this->setDefaultFeeValues($feeData, $request->fee_type_id);

        $fee = Fee::create($feeData);
        $this->generateFeeIdentifiers($fee);
        
        return $fee;
    }

    // Prepare base fee data from request
    private function prepareFeeData($request)
    {
        $feeData = [
            'fee_type_id' => $request->fee_type_id,
            'base_amount' => $request->base_amount,
            'surcharge_amount' => $request->surcharge_amount ?? 0,
            'penalty_amount' => $request->penalty_amount ?? 0,
            'discount_amount' => 0, // Always 0 for new fees
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
            // REMOVED: discount_type_ids and discount_type
        ];

        $feeData['ph_senior_id_verified'] = false;
        $feeData['ph_pwd_id_verified'] = false;
        $feeData['ph_solo_parent_id_verified'] = false;
        $feeData['ph_indigent_id_verified'] = false;

        return $feeData;
    }

    private function setDefaultFeeValues($validated, $feeTypeId)
    {
        $feeType = FeeType::find($feeTypeId);

        $validated['fee_code'] = $feeType->code;
        $validated['status'] = 'issued';
        $validated['amount_paid'] = 0;
        $validated['balance'] = $validated['total_amount'];
        $validated['issued_by'] = auth()->id();
        $validated['created_by'] = auth()->id();

        if ($feeType->validity_days) {
            $validated['valid_from'] = $validated['issue_date'];
            $validated['valid_until'] = Carbon::parse($validated['issue_date'])
                ->addDays($feeType->validity_days)
                ->toDateString();
        }

        return $validated;
    }

    private function generateFeeIdentifiers($fee)
    {
        if (!$fee->fee_code) {
            $feeType = $fee->feeType;
            $year = date('Y');
            $sequence = Fee::whereYear('created_at', $year)
                ->where('fee_type_id', $fee->fee_type_id)
                ->count();
            
            $fee->fee_code = $feeType->code . '-' . $year . '-' . str_pad($sequence + 1, 4, '0', STR_PAD_LEFT);
        }

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

    // Show fee details
// Show fee details
public function show(Fee $fee)
{
    try {
        Log::info('FeeController@show accessed', [
            'user_id' => Auth::id(),
            'fee_id' => $fee->id,
            'fee_code' => $fee->fee_code
        ]);

        // FIXED: Use paymentItems relationship instead of payments
        $fee->load([
            'feeType', 
            'issuedBy', 
            'createdBy',
            'resident', 
            'household',
            'paymentItems' => function($query) {
                $query->with(['payment.discounts.rule', 'payment.recorder']);
            }
        ]);

        $formattedFee = $this->formatFeeForShow($fee);
        $relatedFees = $this->getRelatedFees($fee);
        $paymentHistory = $this->getPaymentHistory($fee);
        $permissions = $this->getPermissions($fee);

        return Inertia::render('admin/Fees/Show', [
            'fee' => $formattedFee,
            'related_fees' => $relatedFees,
            'payment_history' => $paymentHistory,
            'permissions' => $permissions,
        ]);

    } catch (\Exception $e) {
        Log::error('FeeController@show error', [
            'user_id' => Auth::id(),
            'fee_id' => $fee->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return back()->with('error', 'Failed to load fee details. Please try again.');
    }
}

    // Format fee for show view
    private function formatFeeForShow(Fee $fee)
    {
        $formatted = [
            'id' => $fee->id,
            'fee_type_id' => $fee->fee_type_id,
            'fee_type' => $fee->feeType ? [
                'id' => $fee->feeType->id,
                'name' => $fee->feeType->name,
                'code' => $fee->feeType->code,
                'document_category_id' => $fee->feeType->document_category_id,
                'description' => $fee->feeType->description,
                'base_amount' => (float) $fee->feeType->base_amount,
                'validity_days' => $fee->feeType->validity_days,
                'is_discountable' => (bool) $fee->feeType->is_discountable,
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
            'total_amount' => '₱' . number_format($fee->total_amount, 2),
            'amount_paid' => '₱' . number_format($fee->amount_paid, 2),
            'balance' => '₱' . number_format($fee->balance, 2),
            'purpose' => $fee->purpose,
            'property_description' => $fee->property_description,
            'business_type' => $fee->business_type,
            'area' => $fee->area,
            'remarks' => $fee->remarks,
            'requirements_submitted' => $this->safeJsonDecode($fee->requirements_submitted),
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

        if ($fee->household) {
            $formatted['household'] = [
                'id' => $fee->household->id,
                'head_of_family' => $fee->household->head_of_family,
                'address' => $fee->household->address,
                'contact_number' => $fee->household->contact_number,
            ];
        }

        if ($fee->issuedBy) {
            $formatted['issued_by_user'] = [
                'id' => $fee->issuedBy->id,
                'name' => trim(($fee->issuedBy->first_name ?? '') . ' ' . ($fee->issuedBy->last_name ?? '')),
                'email' => $fee->issuedBy->email,
            ];
        }

        return $formatted;
    }

    private function safeJsonDecode($value)
    {
        if (empty($value)) {
            return [];
        }
        
        if (is_array($value)) {
            return $value;
        }
        
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }

    // Get related fees
    private function getRelatedFees(Fee $fee)
    {
        $query = Fee::query()
            ->where('id', '!=', $fee->id)
            ->where('status', '!=', 'cancelled');

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

    // Get payment history with discounts
  private function getPaymentHistory(Fee $fee)
{
    // Get unique payments from payment items
    $paymentIds = $fee->paymentItems()->pluck('payment_id')->unique();
    
    if ($paymentIds->isEmpty()) {
        return [];
    }
    
    return Payment::whereIn('id', $paymentIds)
        ->with(['discounts.rule', 'recorder'])
        ->orderBy('payment_date', 'desc')
        ->get()
        ->map(function ($payment) {
            $discounts = $payment->discounts->map(function ($discount) {
                return [
                    'id' => $discount->id,
                    'rule_name' => $discount->rule->name ?? 'Unknown',
                    'discount_type' => $discount->rule->discount_type ?? null,
                    'amount' => $discount->discount_amount,
                    'formatted_amount' => '₱' . number_format($discount->discount_amount, 2),
                    'id_number' => $discount->id_number,
                    'verified_by' => $discount->verifier->name ?? 'Unknown',
                ];
            });

            return [
                'id' => $payment->id,
                'amount' => $payment->total_amount,
                'formatted_amount' => '₱' . number_format($payment->total_amount, 2),
                'subtotal' => $payment->subtotal,
                'formatted_subtotal' => '₱' . number_format($payment->subtotal, 2),
                'discounts' => $discounts,
                'total_discount' => $discounts->sum('amount'),
                'formatted_total_discount' => '₱' . number_format($discounts->sum('amount'), 2),
                'description' => $payment->remarks ?? 'Payment',
                'payment_date' => $payment->payment_date ? Carbon::parse($payment->payment_date)->format('M d, Y') : null,
                'or_number' => $payment->or_number,
                'payment_method' => $payment->payment_method,
                'reference_number' => $payment->reference_number,
                'status' => $payment->status,
                'received_by' => $payment->recorder ? 
                    trim(($payment->recorder->first_name ?? '') . ' ' . ($payment->recorder->last_name ?? '')) : 'Unknown',
                'created_at' => Carbon::parse($payment->created_at)->format('M d, Y h:i A'),
            ];
        });
}
    // Get available discounts for a fee
    public function getAvailableDiscounts(Fee $fee)
    {
        try {
            Log::info('FeeController@getAvailableDiscounts accessed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id
            ]);

            if (!$fee->feeType || !$fee->feeType->is_discountable) {
                return response()->json([
                    'discountable' => false,
                    'message' => 'This fee type is not discountable',
                    'discounts' => []
                ]);
            }

            $applicableDiscounts = [];
            
            if ($fee->payer_type === 'resident' && $fee->resident) {
                $resident = $fee->resident;
                
                $discountRules = DiscountRule::active()
                    ->orderBy('priority')
                    ->get();
                
                foreach ($discountRules as $rule) {
                    if ($rule->isApplicableToResident($resident)) {
                        $applicableDiscounts[] = [
                            'id' => $rule->id,
                            'code' => $rule->code,
                            'name' => $rule->name,
                            'discount_type' => $rule->discount_type,
                            'value_type' => $rule->value_type,
                            'discount_value' => $rule->discount_value,
                            'formatted_value' => $rule->formatted_value,
                            'maximum_discount_amount' => $rule->maximum_discount_amount,
                            'minimum_purchase_amount' => $rule->minimum_purchase_amount,
                            'priority' => $rule->priority,
                            'stackable' => $rule->stackable,
                            'requires_verification' => $rule->requires_verification,
                            'verification_document' => $rule->verification_document,
                            'estimated_amount' => $rule->calculateDiscount($fee->balance),
                        ];
                    }
                }
            }

            return response()->json([
                'discountable' => true,
                'fee_balance' => $fee->balance,
                'discounts' => $applicableDiscounts
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get available discounts', [
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load discounts'
            ], 500);
        }
    }

    // Record payment for fee
    public function recordPayment(Fee $fee, Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@recordPayment started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_balance' => $fee->balance,
                'current_status' => $fee->status
            ]);

            if ($fee->status === 'paid') {
                Log::warning('Payment recording attempted on already paid fee', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status
                ]);

                return back()->with('error', 'Fee is already paid.');
            }

            $validated = $request->validate([
                'payment_amount' => 'required|numeric|min:0.01|max:' . $fee->balance,
                'payment_date' => 'required|date',
                'payment_method' => 'required|in:cash,gcash,maya,bank,check,online',
                'reference_number' => 'nullable|string|max:255',
                'or_number' => 'nullable|string|max:50|unique:payments,or_number',
                'remarks' => 'nullable|string',
                'discounts' => 'nullable|array',
                'discounts.*.rule_id' => 'required_with:discounts|exists:discount_rules,id',
                'discounts.*.amount' => 'required_with:discounts|numeric|min:0',
                'discounts.*.id_number' => 'nullable|string',
            ]);

            // Calculate total discount
            $totalDiscount = 0;
            if (!empty($validated['discounts'])) {
                $totalDiscount = collect($validated['discounts'])->sum('amount');
            }

            $payment = new Payment();
            $payment->or_number = $validated['or_number'] ?? Payment::generateOrNumber();
            $payment->reference_number = $validated['reference_number'] ?? null;
            $payment->payment_date = $validated['payment_date'];
            $payment->payment_method = $validated['payment_method'];
            $payment->total_amount = $validated['payment_amount'];
            $payment->subtotal = $validated['payment_amount'] + $totalDiscount;
            $payment->recorded_by = auth()->id();
            $payment->status = 'completed';
            $payment->remarks = $validated['remarks'] ?? null;
            $payment->payer_type = $fee->payer_type;
            $payment->payer_id = $fee->payer_type === 'resident' ? $fee->resident_id :
                ($fee->payer_type === 'household' ? $fee->household_id : null);
            $payment->payer_name = $fee->payer_name;
            $payment->contact_number = $fee->contact_number;
            $payment->address = $fee->address;
            $payment->purok = $fee->purok;
            $payment->save();

            $paymentItem = new PaymentItem();
            $paymentItem->payment_id = $payment->id;
            $paymentItem->fee_id = $fee->id;
            $paymentItem->amount = $validated['payment_amount'];
            $paymentItem->description = "Payment for fee {$fee->fee_code}";
            $paymentItem->save();

            // Apply discounts if any
            if (!empty($validated['discounts'])) {
                foreach ($validated['discounts'] as $discountData) {
                    $discountRule = DiscountRule::find($discountData['rule_id']);
                    
                    $paymentDiscount = new PaymentDiscount();
                    $paymentDiscount->payment_id = $payment->id;
                    $paymentDiscount->discount_rule_id = $discountData['rule_id'];
                    $paymentDiscount->discount_amount = $discountData['amount'];
                    $paymentDiscount->verified_by = auth()->id();
                    $paymentDiscount->verified_at = now();
                    $paymentDiscount->id_presented = !empty($discountData['id_number']);
                    $paymentDiscount->id_number = $discountData['id_number'] ?? null;
                    $paymentDiscount->remarks = "Applied to fee {$fee->fee_code}";
                    $paymentDiscount->save();

                    Log::info('Discount applied to payment', [
                        'payment_id' => $payment->id,
                        'discount_rule' => $discountRule->name ?? 'Unknown',
                        'amount' => $discountData['amount']
                    ]);
                }
            }

            $fee->applyPayment(
                $validated['payment_amount'],
                $payment->id,
                [
                    'or_number' => $payment->or_number,
                    'collected_by' => auth()->id(),
                ]
            );

            DB::commit();

            Log::info('Payment recorded successfully', [
                'fee_id' => $fee->id,
                'payment_id' => $payment->id,
                'or_number' => $payment->or_number,
                'payment_amount' => $validated['payment_amount'],
                'discounts_applied' => count($validated['discounts'] ?? []),
                'new_balance' => $fee->balance,
                'new_status' => $fee->status
            ]);

            return redirect()->route('fees.show', $fee)
                ->with('success', 'Payment of ₱' . number_format($validated['payment_amount'], 2) . ' recorded successfully. OR#: ' . $payment->or_number);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Payment recording failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to record payment. Please try again.');
        }
    }

    // Cancel fee
    public function cancel(Fee $fee, Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@cancel started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_status' => $fee->status,
                'reason_provided' => !empty($request->reason)
            ]);

            $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $fee->update([
                'status' => 'cancelled',
                'cancelled_by' => auth()->id(),
                'cancelled_at' => now(),
                'waiver_reason' => $request->reason,
            ]);

            DB::commit();

            Log::info('Fee cancelled successfully', [
                'fee_id' => $fee->id,
                'reason' => $request->reason,
                'cancelled_by' => auth()->id()
            ]);

            return back()->with('success', 'Fee cancelled successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee cancellation failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to cancel fee. Please try again.');
        }
    }

    // Waive fee
    public function waive(Fee $fee, Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@waive started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_balance' => $fee->balance,
                'waiver_amount' => $request->waiver_amount
            ]);

            $request->validate([
                'reason' => 'required|string|max:500',
                'waiver_amount' => 'required|numeric|min:0.01|max:' . $fee->balance,
            ]);

            $payment = new Payment();
            $payment->or_number = 'WAIVER-' . date('YmdHis');
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

            $paymentItem = new PaymentItem();
            $paymentItem->payment_id = $payment->id;
            $paymentItem->fee_id = $fee->id;
            $paymentItem->amount = $request->waiver_amount;
            $paymentItem->description = "Waiver: {$request->reason}";
            $paymentItem->save();

            $fee->applyPayment($request->waiver_amount, $payment->id);
            $fee->waiver_reason = $request->reason;
            $fee->status = 'waived';
            $fee->save();

            DB::commit();

            Log::info('Fee waived successfully', [
                'fee_id' => $fee->id,
                'waiver_amount' => $request->waiver_amount,
                'reason' => $request->reason,
                'new_status' => $fee->status
            ]);

            return back()->with('success', 'Fee balance of ₱' . number_format($request->waiver_amount, 2) . ' waived successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee waiver failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to waive fee. Please try again.');
        }
    }

    // Show edit form
    public function edit(Fee $fee)
    {
        try {
            Log::info('FeeController@edit accessed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_status' => $fee->status
            ]);

            if (!in_array($fee->status, ['pending', 'issued'])) {
                Log::warning('Fee edit attempted on non-editable status', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status,
                    'allowed_statuses' => ['pending', 'issued']
                ]);

                return redirect()->route('fees.show', $fee)
                    ->with('error', 'Only pending or issued fees can be edited.');
            }

            $fee->load(['feeType', 'resident', 'household']);

            $feeTypes = FeeType::active()
                ->get()
                ->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'code' => $type->code,
                        'name' => $type->name,
                        'base_amount' => (float) $type->base_amount,
                        'is_discountable' => (bool) $type->is_discountable,
                        'has_surcharge' => (bool) $type->has_surcharge,
                        'surcharge_percentage' => (float) $type->surcharge_percentage,
                        'surcharge_fixed' => (float) $type->surcharge_fixed,
                        'has_penalty' => (bool) $type->has_penalty,
                        'penalty_percentage' => (float) $type->penalty_percentage,
                        'penalty_fixed' => (float) $type->penalty_fixed,
                    ];
                });

            return Inertia::render('admin/Fees/Edit', [
                'fee' => $fee,
                'feeTypes' => $feeTypes,
                'residents' => Resident::with('purok')
                    ->select(['id', 'first_name', 'last_name', 'middle_name', 'purok_id'])
                    ->orderBy('last_name')
                    ->get()
                    ->map(function ($resident) {
                        return [
                            'id' => $resident->id,
                            'name' => trim("{$resident->first_name} {$resident->middle_name} {$resident->last_name}"),
                            'purok' => $resident->purok ? $resident->purok->name : null,
                        ];
                    }),
                'households' => Household::select(['id', 'household_number', 'head_of_family', 'purok'])
                    ->orderBy('household_number')
                    ->get()
                    ->map(function ($household) {
                        return [
                            'id' => $household->id,
                            'name' => $household->head_of_family ?? $household->household_number,
                            'purok' => $household->purok,
                        ];
                    }),
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@edit error', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to load fee edit form. Please try again.');
        }
    }

    // Update fee
    public function update(Request $request, Fee $fee)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@update started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'original_status' => $fee->status
            ]);

            if (!in_array($fee->status, ['pending', 'issued'])) {
                Log::warning('Fee update attempted on non-editable status', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status
                ]);

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
                'total_amount' => 'required|numeric|min:0',
                'purpose' => 'nullable|string',
                'property_description' => 'nullable|string',
                'business_type' => 'nullable|string',
                'area' => 'nullable|numeric|min:0',
                'remarks' => 'nullable|string',
                'requirements_submitted' => 'nullable|array',
            ]);

            $feeType = FeeType::find($validated['fee_type_id']);
            $validated['fee_code'] = $feeType->code;

            if ($validated['total_amount'] != $fee->total_amount) {
                $validated['balance'] = $validated['total_amount'] - $fee->amount_paid;
                Log::debug('Fee total amount changed, recalculating balance', [
                    'old_total' => $fee->total_amount,
                    'new_total' => $validated['total_amount'],
                    'new_balance' => $validated['balance']
                ]);
            }

            $validated['updated_by'] = auth()->id();

            if (isset($validated['requirements_submitted'])) {
                $validated['requirements_submitted'] = json_encode($validated['requirements_submitted']);
            }

            $changes = [];
            foreach ($validated as $key => $value) {
                if ($fee->$key != $value) {
                    $changes[$key] = [
                        'from' => $fee->$key,
                        'to' => $value
                    ];
                }
            }

            $fee->update($validated);
            $fee->updateStatus();

            DB::commit();

            Log::info('Fee updated successfully', [
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'changes' => $changes,
                'new_status' => $fee->status
            ]);

            return redirect()->route('fees.show', $fee)
                ->with('success', 'Fee updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee update failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to update fee. Please try again.');
        }
    }

    // Delete fee
    public function destroy(Fee $fee)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@destroy started', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'current_status' => $fee->status
            ]);

            if ($fee->status !== 'pending') {
                Log::warning('Fee delete attempted on non-pending status', [
                    'fee_id' => $fee->id,
                    'status' => $fee->status
                ]);

                return back()->with('error', 'Only pending fees can be deleted.');
            }

            $feeDetails = [
                'id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'payer_name' => $fee->payer_name,
                'total_amount' => $fee->total_amount,
                'created_at' => $fee->created_at
            ];

            $fee->delete();

            DB::commit();

            Log::info('Fee deleted successfully', $feeDetails);

            return redirect()->route('fees.index')
                ->with('success', 'Fee deleted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fee deletion failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to delete fee. Please try again.');
        }
    }

    // Print fee receipt or certificate
    public function print(Fee $fee, Request $request)
    {
        try {
            Log::info('FeeController@print accessed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'print_type' => $request->get('type', 'receipt'),
                'action' => $request->get('action', 'preview')
            ]);

            $type = $request->get('type', 'receipt');
            $action = $request->get('action', 'preview');

            $fee->load([
                'feeType',
                'issuedBy',
                'payments' => function ($query) {
                    $query->with(['discounts.rule', 'recorder'])->orderBy('payment_date', 'desc');
                }
            ]);

            if ($fee->payer_type === 'resident' && $fee->resident) {
                $fee->load('resident');
            } elseif ($fee->payer_type === 'household' && $fee->household) {
                $fee->load('household');
            }

            if ($fee->issuedBy) {
                $fee->issuedBy->formatted_name = trim(($fee->issuedBy->first_name ?? '') . ' ' . ($fee->issuedBy->last_name ?? ''));
            }

            $totalDiscounts = 0;
            $discountDetails = [];
            if ($fee->payments) {
                foreach ($fee->payments as $payment) {
                    foreach ($payment->discounts as $discount) {
                        $totalDiscounts += $discount->discount_amount;
                        $discountDetails[] = [
                            'rule' => $discount->rule->name ?? 'Unknown',
                            'amount' => $discount->discount_amount,
                            'formatted_amount' => '₱' . number_format($discount->discount_amount, 2),
                        ];
                    }
                }
            }

            $data = [
                'fee' => $fee,
                'total_discounts' => $totalDiscounts,
                'formatted_total_discounts' => '₱' . number_format($totalDiscounts, 2),
                'discount_details' => $discountDetails,
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

            $isCertificate = $fee->feeType && $fee->feeType->document_category_id
                && in_array($fee->feeType->documentCategory->slug ?? '', ['certificate', 'clearance']);

            if ($type === 'certificate' && ($fee->certificate_number || $isCertificate)) {
                $view = 'pdf.fee-certificate';
                $filename = "certificate-{$fee->certificate_number}.pdf";
            } else {
                $view = 'pdf.fee-receipt';
                $filename = "receipt-{$fee->fee_code}.pdf";
            }

            $pdf = Pdf::loadView($view, $data);
            $pdf->setPaper('A4', 'portrait');

            Log::info('PDF generated successfully', [
                'fee_id' => $fee->id,
                'view' => $view,
                'filename' => $filename,
                'action' => $action
            ]);

            if ($action === 'download') {
                return $pdf->download($filename);
            }

            return $pdf->stream($filename);

        } catch (\Exception $e) {
            Log::error('Fee print failed', [
                'user_id' => Auth::id(),
                'fee_id' => $fee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to generate document. Please try again.');
        }
    }

    // Bulk actions
    public function bulkAction(Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('FeeController@bulkAction started', [
                'user_id' => Auth::id(),
                'action' => $request->action,
                'fee_ids_count' => count($request->fee_ids ?? [])
            ]);

            $request->validate([
                'action' => 'required|in:issue,mark_paid,cancel,delete',
                'fee_ids' => 'required|array',
                'fee_ids.*' => 'exists:fees,id',
            ]);

            $count = 0;
            $processedFees = [];

            foreach ($request->fee_ids as $feeId) {
                $fee = Fee::find($feeId);

                switch ($request->action) {
                    case 'issue':
                        if ($fee->status === 'pending') {
                            $fee->update(['status' => 'issued']);
                            $count++;
                            $processedFees[] = ['id' => $fee->id, 'action' => 'issued'];
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
                            $processedFees[] = ['id' => $fee->id, 'action' => 'marked_paid', 'amount' => $fee->balance];
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
                            $processedFees[] = ['id' => $fee->id, 'action' => 'cancelled'];
                        }
                        break;

                    case 'delete':
                        if ($fee->status === 'pending') {
                            $fee->delete();
                            $count++;
                            $processedFees[] = ['id' => $fee->id, 'action' => 'deleted'];
                        }
                        break;
                }
            }

            DB::commit();

            Log::info('Bulk action completed', [
                'action' => $request->action,
                'successful_count' => $count,
                'processed_fees' => $processedFees
            ]);

            return back()->with('success', "{$count} fees updated successfully.");

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Bulk action failed', [
                'user_id' => Auth::id(),
                'action' => $request->action ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to perform bulk action. Please try again.');
        }
    }

    // Dashboard statistics
    public function dashboard()
    {
        try {
            Log::debug('FeeController@dashboard accessed', ['user_id' => Auth::id()]);

            $today = now()->toDateString();

            $stats = [
                'total_fees' => Fee::count(),
                'today_fees' => Fee::whereDate('created_at', $today)->count(),
                'total_collected' => Fee::where('status', 'paid')->sum('amount_paid'),
                'pending_collection' => Fee::whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
                'overdue_fees' => Fee::where('status', 'overdue')->count(),
            ];

            $recentFees = Fee::with(['feeType', 'resident'])
                ->latest()
                ->limit(10)
                ->get();

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

            $feesByCategory = Fee::select(
                'fee_types.document_category_id',
                DB::raw('COUNT(fees.id) as count'),
                DB::raw('SUM(fees.total_amount) as total')
            )
                ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
                ->groupBy('fee_types.document_category_id')
                ->get();

            Log::info('Fee dashboard data loaded', [
                'stats' => $stats,
                'recent_fees_count' => $recentFees->count()
            ]);

            return Inertia::render('admin/Fees/Dashboard', [
                'stats' => $stats,
                'recentFees' => $recentFees,
                'monthlyCollections' => $monthlyCollections,
                'feesByCategory' => $feesByCategory,
            ]);

        } catch (\Exception $e) {
            Log::error('FeeController@dashboard error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load dashboard. Please try again.');
        }
    }

    // Export fees
    public function export(Request $request)
    {
        try {
            Log::info('FeeController@export started', [
                'user_id' => Auth::id(),
                'export_filters' => $request->all()
            ]);

            $query = Fee::query()
                ->with(['feeType', 'resident', 'household'])
                ->latest();

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('payer_name', 'like', "%{$search}%")
                        ->orWhere('or_number', 'like', "%{$search}%")
                        ->orWhere('certificate_number', 'like', "%{$search}%");
                });
            }

            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('category') && $request->category) {
                $query->whereHas('feeType', function ($q) use ($request) {
                    $q->where('document_category_id', $request->category);
                });
            }

            if ($request->has('from_date') && $request->from_date) {
                $query->whereDate('issue_date', '>=', $request->from_date);
            }

            if ($request->has('to_date') && $request->to_date) {
                $query->whereDate('issue_date', '<=', $request->to_date);
            }

            $fees = $query->get();

            $fileName = 'fees_export_' . date('Y-m-d_H-i-s') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ];

            Log::info('Fee export completed', [
                'record_count' => $fees->count(),
                'filename' => $fileName
            ]);

            $callback = function () use ($fees) {
                $file = fopen('php://output', 'w');
                fwrite($file, "\xEF\xBB\xBF");

                fputcsv($file, [
                    'ID',
                    'Fee Code',
                    'Fee Type',
                    'Document Category ID',
                    'Payer Name',
                    'Payer Type',
                    'Contact Number',
                    'Purok',
                    'Issue Date',
                    'Due Date',
                    'Base Amount',
                    'Surcharge',
                    'Penalty',
                    'Discount',
                    'Total Amount',
                    'Amount Paid',
                    'Balance',
                    'Status',
                    'OR Number',
                    'Certificate Number',
                    'Created At'
                ]);

                foreach ($fees as $fee) {
                    fputcsv($file, [
                        $fee->id,
                        $fee->fee_code,
                        $fee->feeType->name ?? 'N/A',
                        $fee->feeType->document_category_id ?? 'N/A',
                        $fee->payer_name,
                        $fee->payer_type,
                        $fee->contact_number,
                        $fee->purok,
                        $fee->issue_date,
                        $fee->due_date,
                        $fee->base_amount,
                        $fee->surcharge_amount,
                        $fee->penalty_amount,
                        $fee->discount_amount,
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

        } catch (\Exception $e) {
            Log::error('Fee export failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to export fees. Please try again.');
        }
    }

    public function outstanding(Request $request)
    {
        try {
            Log::info('FeeController@outstanding accessed', [
                'user_id' => Auth::id(),
                'filters' => $request->all()
            ]);

            $search = $request->input('search', '');
            $status = $request->input('status', 'overdue');
            $purok = $request->input('purok', '');

            $query = Fee::with(['feeType', 'resident', 'household'])
                ->where('balance', '>', 0)
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->orderBy('due_date');

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

            if ($status === 'overdue') {
                $query->where('due_date', '<', Carbon::today());
            } elseif ($status === 'pending') {
                $query->where('due_date', '>=', Carbon::today());
            }

            if ($purok) {
                $query->where('purok', $purok);
            }

            $fees = $query->paginate(20)->withQueryString();

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

            $overdueFees = Fee::where('balance', '>', 0)
                ->where('due_date', '<', Carbon::today())
                ->whereIn('status', ['pending', 'issued', 'partially_paid'])
                ->get();

            $averageDaysOverdue = $overdueFees->count() > 0
                ? $overdueFees->avg(function ($fee) {
                    return Carbon::parse($fee->due_date)->diffInDays(Carbon::today());
                })
                : 0;

            $puroks = Fee::whereNotNull('purok')
                ->distinct()
                ->pluck('purok')
                ->sort()
                ->values();

            Log::info('Outstanding fees report generated', [
                'total_outstanding' => $totalOutstanding,
                'overdue_count' => $overdueCount,
                'pending_count' => $pendingCount,
                'average_days_overdue' => $averageDaysOverdue,
                'filtered_count' => $fees->total()
            ]);

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

        } catch (\Exception $e) {
            Log::error('FeeController@outstanding error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load outstanding fees. Please try again.');
        }
    }

   private function getStatistics()
    {
        return [
            'total' => Fee::count(),
            'total_amount' => Fee::sum('total_amount'),
            'total_collected' => Fee::sum('amount_paid'),
            'collected' => Fee::where('status', 'paid')->sum('amount_paid'),
            'pending' => Fee::whereIn('status', ['issued', 'partially_paid', 'overdue'])->sum('balance'),
            'overdue_count' => Fee::where('status', 'overdue')->count(),

            'today_count' => Fee::whereDate('created_at', today())->count(),
            'today_amount' => Fee::whereDate('created_at', today())->sum('total_amount'),
            'today_collected' => Fee::whereDate('created_at', today())->sum('amount_paid'),
            
            'this_month_count' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'this_month_amount' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
            'this_month_collected' => Fee::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount_paid'),

            'status_counts' => [
                'pending' => Fee::where('status', 'pending')->count(),
                'issued' => Fee::where('status', 'issued')->count(),
                'partially_paid' => Fee::where('status', 'partially_paid')->count(),
                'paid' => Fee::where('status', 'paid')->count(),
                'overdue' => Fee::where('status', 'overdue')->count(),
                'cancelled' => Fee::where('status', 'cancelled')->count(),
                'waived' => Fee::where('status', 'waived')->count(),
            ],

            'category_totals' => Fee::selectRaw('fee_types.document_category_id, COUNT(fees.id) as count, SUM(fees.total_amount) as total_amount, SUM(fees.amount_paid) as total_collected')
                ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
                ->groupBy('fee_types.document_category_id')
                ->get()
                ->keyBy('document_category_id')
                ->toArray(),
        ];
    }

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

    private function getPermissions(Fee $fee)
    {
        $user = Auth::user();
        
        return [
            'can_edit' => $user->can('update', $fee) && in_array($fee->status, ['pending', 'issued']),
            'can_delete' => $user->can('delete', $fee) && $fee->status === 'pending' && $fee->amount_paid == 0,
            'can_record_payment' => $user->can('recordPayment', $fee) && $fee->balance > 0 && !in_array($fee->status, ['cancelled', 'waived', 'paid']),
            'can_cancel' => $user->can('cancel', $fee) && !in_array($fee->status, ['paid', 'cancelled', 'waived']),
            'can_waive' => $user->can('waive', $fee) && $fee->balance > 0 && !in_array($fee->status, ['paid', 'cancelled']),
            'can_print' => true,
        ];
    }
}