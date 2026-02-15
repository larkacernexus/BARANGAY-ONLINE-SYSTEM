<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Payment;
use App\Models\PaymentItem;
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
                    'feeType:id,name,code,document_category_id,is_discountable', // Added is_discountable
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

                    // Format amounts with currency
                    $fee->formatted_total_amount = '₱' . number_format($fee->total_amount, 2);
                    $fee->formatted_amount_paid = '₱' . number_format($fee->amount_paid, 2);
                    $fee->formatted_balance = '₱' . number_format($fee->balance, 2);

                    // Get payer details safely (using the data already in the fee record)
                    $fee->payer_details = $this->getPayerDetails($fee);

                    return $fee;
                });

            // Get statistics
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
                // Normalize the model class name
                $modelClass = $this->normalizeModelClass($fee->payer_model);

                if (class_exists($modelClass)) {
                    $payerModel = $modelClass::find($fee->payer_id);
                    if ($payerModel) {
                        // Add specific details based on model type
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

        // If it's already a fully qualified class name
        if (class_exists($className)) {
            return $className;
        }

        // Map common names to proper classes
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
            $period = $request->get('period', 'today'); // today, week, month, year

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

    // Dashboard statistics
    public function dashboard()
    {
        try {
            Log::debug('FeeController@dashboard accessed', ['user_id' => Auth::id()]);

            $today = now()->toDateString();

            $stats = $this->getStatistics();

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
                ->with(['feeType', 'resident', 'household', 'payment'])
                ->latest();

            // Apply filters same as index
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

            // Generate CSV
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

                // Add BOM for UTF-8
                fwrite($file, "\xEF\xBB\xBF");

                // Headers
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
                        $fee->feeType->document_category_id ?? 'N/A',
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
            'category_totals' => Fee::selectRaw('fee_types.document_category_id, COUNT(fees.id) as count, SUM(fees.total_amount) as total_amount')
                ->join('fee_types', 'fees.fee_type_id', '=', 'fee_types.id')
                ->groupBy('fee_types.document_category_id')
                ->get()
                ->keyBy('document_category_id')
                ->toArray(),
        ];
    }
}