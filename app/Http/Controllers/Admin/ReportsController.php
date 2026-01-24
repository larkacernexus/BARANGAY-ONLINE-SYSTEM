<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use DateInterval;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Models\Activity;

class ReportsController extends Controller
{
    /**
     * Display collections report
     */
    public function collections(Request $request)
    {
        // Get date range from request or default to current month
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        $period = $request->input('period', 'month');
        
        // Get all payments in date range WITH recorder info
        $payments = Payment::with('recorder')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->orderBy('payment_date')
            ->get();
        
        // Group payments by date
        $collectionsByDate = $payments->groupBy(function ($payment) {
            return $payment->payment_date->format('Y-m-d');
        })->map(function ($dailyPayments) {
            return [
                'total_amount' => $dailyPayments->sum('total_amount'),
                'transaction_count' => $dailyPayments->count(),
            ];
        })->sortKeys();
        
        // Format for chart
        $chartData = $collectionsByDate->map(function ($data, $date) {
            return [
                'date' => $date,
                'amount' => (float) $data['total_amount'],
                'count' => (int) $data['transaction_count'],
            ];
        })->values();
        
        // Group by payment method for categories
        $categories = $payments->groupBy('payment_method')->map(function ($methodPayments, $method) {
            return [
                'category' => ucfirst($method),
                'total_amount' => $methodPayments->sum('total_amount'),
                'percentage' => 0,
            ];
        })->values();
        
        // Calculate percentages
        $totalAmount = $payments->sum('total_amount');
        if ($totalAmount > 0) {
            $categories = $categories->map(function ($category) use ($totalAmount) {
                $category['percentage'] = round(($category['total_amount'] / $totalAmount) * 100, 1);
                return $category;
            });
        }
        
        // Group by recorder (who collected)
        $collectors = $payments->whereNotNull('recorder')
            ->groupBy('recorded_by')
            ->map(function ($userPayments, $userId) {
                $recorder = $userPayments->first()->recorder;
                return [
                    'collector_id' => $userId,
                    'collector_name' => $recorder ? ($recorder->first_name . ' ' . $recorder->last_name) : 'Unknown',
                    'total_amount' => $userPayments->sum('total_amount'),
                    'transaction_count' => $userPayments->count(),
                ];
            })->values();
        
        // Calculate stats
        $totalCollections = $totalAmount;
        $averageDaily = $collectionsByDate->count() > 0 ? $totalCollections / $collectionsByDate->count() : 0;
        $highestDay = $collectionsByDate->max('total_amount') ?? 0;
        $totalTransactions = $payments->count();
        
        return Inertia::render('admin/Reports/Collections', [
            'collections' => $chartData,
            'categories' => $categories,
            'collectors' => $collectors,
            'stats' => [
                'totalCollections' => $totalCollections,
                'averageDaily' => round($averageDaily, 2),
                'highestDay' => $highestDay,
                'totalTransactions' => $totalTransactions,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'period' => $period,
            ],
        ]);
    }

    /**
     * Display revenue analytics - SIMPLIFIED for Barangay
     */
    public function revenue(Request $request)
    {
        // Get period from request
        $period = $request->input('period', 'month');
        
        // Calculate date range based on period
        if ($period === 'year') {
            $startDate = Carbon::now()->startOfYear();
            $endDate = Carbon::now()->endOfYear();
            $groupBy = 'month';
        } elseif ($period === 'month') {
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
            $groupBy = 'week';
        } else {
            // Default to week
            $startDate = Carbon::now()->startOfWeek();
            $endDate = Carbon::now()->endOfWeek();
            $groupBy = 'day';
        }
        
        // Get payments in date range with recorder
        $payments = Payment::with('recorder')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->get();
        
        // Group by period
        $revenueData = collect();
        if ($groupBy === 'month') {
            $revenueData = $payments->groupBy(function ($payment) {
                return $payment->payment_date->format('F');
            })->map(function ($monthPayments, $month) {
                return [
                    'period' => $month,
                    'total_revenue' => $monthPayments->sum('total_amount'),
                    'transaction_count' => $monthPayments->count(),
                ];
            });
        } elseif ($groupBy === 'week') {
            $revenueData = $payments->groupBy(function ($payment) {
                return 'Week ' . $payment->payment_date->weekOfMonth;
            })->map(function ($weekPayments, $week) {
                return [
                    'period' => $week,
                    'total_revenue' => $weekPayments->sum('total_amount'),
                    'transaction_count' => $weekPayments->count(),
                ];
            });
        } else {
            $revenueData = $payments->groupBy(function ($payment) {
                return $payment->payment_date->format('D, M j');
            })->map(function ($dayPayments, $day) {
                return [
                    'period' => $day,
                    'total_revenue' => $dayPayments->sum('total_amount'),
                    'transaction_count' => $dayPayments->count(),
                ];
            });
        }
        
        // Get revenue by payment method
        $revenueByMethod = $payments->groupBy('payment_method')->map(function ($methodPayments, $method) {
            return [
                'name' => ucfirst($method),
                'total_revenue' => $methodPayments->sum('total_amount'),
                'transaction_count' => $methodPayments->count(),
            ];
        })->values();
        
        // Get revenue by recorder (who collected)
        $revenueByCollector = $payments->whereNotNull('recorder')
            ->groupBy('recorded_by')
            ->map(function ($userPayments, $userId) {
                $recorder = $userPayments->first()->recorder;
                return [
                    'name' => $recorder ? ($recorder->first_name . ' ' . $recorder->last_name) : 'Unknown',
                    'position' => $recorder ? $recorder->position : 'N/A',
                    'total_revenue' => $userPayments->sum('total_amount'),
                    'transaction_count' => $userPayments->count(),
                    'average_amount' => $userPayments->avg('total_amount'),
                ];
            })->values();
        
        // Simple current revenue
        $currentRevenue = $payments->sum('total_amount');
        
        return Inertia::render('admin/Reports/Revenue', [
            'revenueData' => $revenueData->values(),
            'revenueByMethod' => $revenueByMethod,
            'revenueByCollector' => $revenueByCollector,
            'stats' => [
                'totalRevenue' => $currentRevenue,
                'averageTransaction' => $payments->count() > 0 ? round($currentRevenue / $payments->count(), 2) : 0,
                'totalTransactions' => $payments->count(),
                'uniqueCollectors' => $revenueByCollector->count(),
            ],
            'filters' => [
                'period' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
        ]);
    }

    /**
     * Display audit logs - USING SPATIE ACTIVITY LOG
     */
  public function auditLogs(Request $request)
{
    // Use Spatie Activity model - ONLY fetch Payment-related logs
    $query = Activity::with(['causer'])
        ->where(function ($q) {
            $q->where('subject_type', 'App\Models\Payment')
              ->orWhere('log_name', 'payments');
        })
        ->latest();

    // ONLY apply filters if they have actual values (not empty strings)
    if ($request->filled('search') && !empty(trim($request->input('search')))) {
        $search = trim($request->input('search'));
        $query->where(function ($q) use ($search) {
            $q->where('description', 'like', "%{$search}%")
                ->orWhere('event', 'like', "%{$search}%")
                ->orWhere('properties', 'like', "%{$search}%")
                ->orWhereHas('causer', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHasMorph('subject', ['App\Models\Payment'], function ($q) use ($search) {
                    $q->where('or_number', 'like', "%{$search}%")
                      ->orWhere('payer_name', 'like', "%{$search}%");
                });
        });
    }

    // Only apply event type filter if it has a value
    if ($request->filled('event_type') && !empty(trim($request->input('event_type')))) {
        $query->where('event', $request->input('event_type'));
    }

    // Only apply user filter if it has a value
    if ($request->filled('user_id') && !empty(trim($request->input('user_id')))) {
        $query->where('causer_id', $request->input('user_id'));
    }

    // Only apply date filters if they have values
    if ($request->filled('date_from') && !empty(trim($request->input('date_from')))) {
        $query->whereDate('created_at', '>=', $request->input('date_from'));
    }
    if ($request->filled('date_to') && !empty(trim($request->input('date_to')))) {
        $query->whereDate('created_at', '<=', $request->input('date_to'));
    }

    // Log name filter is now fixed to 'payments'
    $query->where('log_name', 'payments');

    $perPage = $request->input('per_page', 25);
    $logs = $query->paginate($perPage);

    // Get filter options - ONLY payment-related
    $eventTypes = Activity::where('log_name', 'payments')
        ->orWhere('subject_type', 'App\Models\Payment')
        ->distinct()
        ->pluck('event')
        ->filter()
        ->values();
    
    // Log names is now fixed to only 'payments'
    $logNames = collect(['payments']);
    
    // Get users who have performed payment-related activities
    $userIds = Activity::where('log_name', 'payments')
        ->orWhere('subject_type', 'App\Models\Payment')
        ->whereNotNull('causer_id')
        ->distinct('causer_id')
        ->pluck('causer_id');
    
    $users = User::whereIn('id', $userIds)
        ->select('id', 'first_name', 'last_name', 'email')
        ->get()
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ];
        });

    // Get statistics - ONLY for payment logs
    $stats = [
        'total_logs' => Activity::where('log_name', 'payments')
            ->orWhere('subject_type', 'App\Models\Payment')
            ->count(),
        'today_logs' => Activity::whereDate('created_at', today())
            ->where(function ($q) {
                $q->where('log_name', 'payments')
                  ->orWhere('subject_type', 'App\Models\Payment');
            })
            ->count(),
        'payment_logs' => Activity::where('log_name', 'payments')->count(),
        'user_logs' => Activity::where(function ($q) {
                $q->where('log_name', 'payments')
                  ->orWhere('subject_type', 'App\Models\Payment');
            })
            ->whereNotNull('causer_id')
            ->distinct('causer_id')
            ->count(),
    ];

    // Get recent activities - ONLY payment-related
    $recentActivities = Activity::with('causer')
        ->where(function ($q) {
            $q->where('log_name', 'payments')
              ->orWhere('subject_type', 'App\Models\Payment');
        })
        ->latest()
        ->limit(10)
        ->get()
        ->map(function ($activity) {
            $activityArray = $activity->toArray();
            if ($activity->causer) {
                $activityArray['causer']['name'] = $activity->causer->first_name . ' ' . $activity->causer->last_name;
            }
            return $activityArray;
        });

    // Get activity summary - ONLY for payment logs
    $activitySummary = Activity::select('event', DB::raw('count(*) as count'))
        ->where(function ($q) {
            $q->where('log_name', 'payments')
              ->orWhere('subject_type', 'App\Models\Payment');
        })
        ->groupBy('event')
        ->orderBy('count', 'desc')
        ->limit(10)
        ->get();

    // Get top users by activity - ONLY for payment activities
    $topUsers = Activity::with(['causer'])
        ->select('causer_id', DB::raw('count(*) as activity_count'))
        ->where(function ($q) {
            $q->where('log_name', 'payments')
              ->orWhere('subject_type', 'App\Models\Payment');
        })
        ->whereNotNull('causer_id')
        ->groupBy('causer_id')
        ->orderBy('activity_count', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($activity) {
            $userData = null;
            if ($activity->causer) {
                $userData = [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->first_name . ' ' . $activity->causer->last_name,
                    'first_name' => $activity->causer->first_name,
                    'last_name' => $activity->causer->last_name,
                    'email' => $activity->causer->email,
                ];
            }
            
            return [
                'user' => $userData,
                'activity_count' => $activity->activity_count,
                'count' => $activity->activity_count,
            ];
        });

    // Only send back filters that have actual values
    $activeFilters = array_filter($request->only(['search', 'event_type', 'user_id', 'date_from', 'date_to', 'per_page']), function($value) {
        return !empty(trim($value));
    });

    return Inertia::render('admin/Reports/AuditLogs', [
        'logs' => [
            'data' => $logs->items(),
            'current_page' => $logs->currentPage(),
            'first_page_url' => $logs->url(1),
            'from' => $logs->firstItem(),
            'last_page' => $logs->lastPage(),
            'last_page_url' => $logs->url($logs->lastPage()),
            'links' => $logs->linkCollection()->toArray(),
            'next_page_url' => $logs->nextPageUrl(),
            'path' => $logs->path(),
            'per_page' => $logs->perPage(),
            'prev_page_url' => $logs->previousPageUrl(),
            'to' => $logs->lastItem(),
            'total' => $logs->total(),
        ],
        'filters' => $activeFilters,
        'event_types' => $eventTypes,
        'log_names' => $logNames,
        'users' => $users,
        'stats' => $stats,
        'recent_activities' => $recentActivities,
        'activity_summary' => $activitySummary,
        'top_users' => $topUsers,
    ]);
}

/**
 * Display audit log details - ONLY for Payment logs
 */
public function auditLogShow($id)
{
    $log = Activity::with(['causer', 'subject'])
        ->where(function ($q) {
            $q->where('subject_type', 'App\Models\Payment')
              ->orWhere('log_name', 'payments');
        })
        ->findOrFail($id);

    // Add computed name for causer if exists
    if ($log->causer) {
        $log->causer->name = $log->causer->first_name . ' ' . $log->causer->last_name;
    }

    // Get similar logs - ONLY payment-related
    $similarLogs = Activity::where(function ($q) {
            $q->where('subject_type', 'App\Models\Payment')
              ->orWhere('log_name', 'payments');
        })
        ->where('causer_id', $log->causer_id)
        ->where('id', '!=', $log->id)
        ->where('event', $log->event)
        ->latest()
        ->limit(5)
        ->get();

    // Add computed names for similar logs
    $similarLogs->each(function ($similarLog) {
        if ($similarLog->causer) {
            $similarLog->causer->name = $similarLog->causer->first_name . ' ' . $similarLog->causer->last_name;
        }
    });

    // Get timeline of user's recent activities - ONLY payment-related
    $userTimeline = Activity::where(function ($q) {
            $q->where('subject_type', 'App\Models\Payment')
              ->orWhere('log_name', 'payments');
        })
        ->where('causer_id', $log->causer_id)
        ->where('id', '!=', $log->id)
        ->latest()
        ->limit(10)
        ->get();

    // Add computed names for timeline logs
    $userTimeline->each(function ($timelineLog) {
        if ($timelineLog->causer) {
            $timelineLog->causer->name = $timelineLog->causer->first_name . ' ' . $timelineLog->causer->last_name;
        }
    });

    return Inertia::render('admin/Reports/AuditLogShow', [
        'log' => $log,
        'similar_logs' => $similarLogs,
        'user_timeline' => $userTimeline,
    ]);
}

    /**
     * NEW: Payment Audit Trail Report
     */
    public function paymentAudit(Request $request)
    {
        // Get payment activities only
        $query = Activity::with(['causer', 'subject'])
            ->where('subject_type', 'App\Models\Payment')
            ->orWhere('log_name', 'payments')
            ->latest();

        // Filter by OR number
        if ($request->filled('or_number')) {
            $query->whereHas('subject', function($q) use ($request) {
                $q->where('or_number', 'like', "%{$request->or_number}%");
            });
        }

        // Filter by date
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->input('per_page', 50);
        $activities = $query->paginate($perPage);

        // Add computed names for causers
        $activities->each(function ($activity) {
            if ($activity->causer) {
                $activity->causer->name = $activity->causer->first_name . ' ' . $activity->causer->last_name;
            }
        });

        // Get payment summary stats
        $paymentIds = $activities->pluck('subject_id')->filter()->unique();
        $payments = Payment::whereIn('id', $paymentIds)->get();
        
        $stats = [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('total_amount'),
            'unique_collectors' => $payments->pluck('recorded_by')->unique()->count(),
        ];

        return Inertia::render('admin/Reports/PaymentAudit', [
            'activities' => $activities,
            'stats' => $stats,
            'filters' => $request->only(['or_number', 'date_from', 'date_to', 'per_page']),
        ]);
    }

    /**
     * NEW: OR Number Accountability Report
     */
    public function orAccountability(Request $request)
    {
        $date = $request->input('date', today()->format('Y-m-d'));
        
        // Get all payments for the date with recorder info
        $payments = Payment::with('recorder')
            ->whereDate('payment_date', $date)
            ->orderBy('or_number')
            ->get();
        
        // Group by recorder
        $byRecorder = $payments->groupBy('recorded_by')
            ->map(function ($userPayments, $userId) {
                $recorder = $userPayments->first()->recorder;
                $collectorName = 'Unknown';
                if ($recorder) {
                    $collectorName = $recorder->first_name . ' ' . $recorder->last_name;
                }
                
                return [
                    'collector_id' => $userId,
                    'collector_name' => $collectorName,
                    'collector_position' => $recorder ? $recorder->position : 'N/A',
                    'or_numbers' => $userPayments->pluck('or_number')->sort()->values(),
                    'total_collected' => $userPayments->sum('total_amount'),
                    'payment_count' => $userPayments->count(),
                ];
            })->values();
        
        // Find missing OR numbers in sequence
        $allORs = $payments->pluck('or_number')->sort()->values();
        $missingORs = $this->findMissingORNumbers($allORs);
        
        return Inertia::render('admin/Reports/OrAccountability', [
            'date' => $date,
            'payments' => $payments,
            'by_recorder' => $byRecorder,
            'missing_or_numbers' => $missingORs,
            'summary' => [
                'total_collected' => $payments->sum('total_amount'),
                'total_or_numbers' => $payments->count(),
                'unique_collectors' => $byRecorder->count(),
            ]
        ]);
    }

    /**
     * NEW: Collector Accountability Report
     */
    public function collectorReport(Request $request)
    {
        $userId = $request->input('user_id');
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        
        $user = User::findOrFail($userId);
        $user->name = $user->first_name . ' ' . $user->last_name;
        
        // Get all payments recorded by this user
        $payments = Payment::where('recorded_by', $userId)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->orderBy('payment_date', 'desc')
            ->get();
        
        // Group by date
        $dailyCollections = $payments->groupBy(function($payment) {
            return $payment->payment_date->format('Y-m-d');
        })->map(function($dayPayments, $date) {
            return [
                'date' => $date,
                'total_amount' => $dayPayments->sum('total_amount'),
                'payment_count' => $dayPayments->count(),
                'or_numbers' => $dayPayments->pluck('or_number')->sort()->values(),
            ];
        })->sortKeysDesc();
        
        // Group by clearance type
        $byClearanceType = $payments->whereNotNull('clearance_type')
            ->groupBy('clearance_type')
            ->map(function($typePayments, $type) {
                return [
                    'type' => $type,
                    'type_display' => $typePayments->first()->clearance_type_display,
                    'total_amount' => $typePayments->sum('total_amount'),
                    'payment_count' => $typePayments->count(),
                ];
            })->values();
        
        // Group by payment method
        $byPaymentMethod = $payments->groupBy('payment_method')
            ->map(function($methodPayments, $method) {
                return [
                    'method' => $method,
                    'method_display' => $methodPayments->first()->payment_method_display,
                    'total_amount' => $methodPayments->sum('total_amount'),
                    'payment_count' => $methodPayments->count(),
                ];
            })->values();
        
        return Inertia::render('admin/Reports/CollectorReport', [
            'user' => $user,
            'payments' => $payments,
            'daily_collections' => $dailyCollections,
            'by_clearance_type' => $byClearanceType,
            'by_payment_method' => $byPaymentMethod,
            'summary' => [
                'total_collected' => $payments->sum('total_amount'),
                'total_payments' => $payments->count(),
                'date_range' => $startDate . ' to ' . $endDate,
            ],
            'filters' => [
                'user_id' => $userId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    /**
     * Helper: Find missing OR numbers
     */
    private function findMissingORNumbers($orNumbers)
    {
        if ($orNumbers->isEmpty()) {
            return collect();
        }
        
        $missing = collect();
        $currentSeries = null;
        
        foreach ($orNumbers as $or) {
            // Extract number part (e.g., BAR-20250111-001 -> 001)
            if (preg_match('/-(\d+)$/', $or, $matches)) {
                $num = (int) $matches[1];
                $series = substr($or, 0, strrpos($or, '-'));
                
                if ($currentSeries !== $series) {
                    $currentSeries = $series;
                    continue;
                }
                
                // Check for gaps
                // This is simplified - you might need more complex logic
            }
        }
        
        return $missing;
    }

    /**
     * Export collections report - UPDATED with recorder info
     */
    public function collectionsExport(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        
        $payments = Payment::with('recorder')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->orderBy('payment_date')
            ->get();
        
        $fileName = 'collections-report-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];
        
        $callback = function () use ($payments) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fwrite($file, "\xEF\xBB\xBF");
            
            // Headers - INCLUDING recorder info
            fputcsv($file, [
                'OR Number',
                'Date',
                'Payer Name',
                'Amount',
                'Payment Method',
                'Clearance Type',
                'Recorded By',
                'Position',
                'Status',
                'Remarks',
            ]);
            
            // Data
            foreach ($payments as $payment) {
                $recorderName = 'Unknown';
                if ($payment->recorder) {
                    $recorderName = $payment->recorder->first_name . ' ' . $payment->recorder->last_name;
                }
                
                fputcsv($file, [
                    $payment->or_number,
                    $payment->payment_date->format('Y-m-d H:i:s'),
                    $payment->payer_name,
                    $payment->total_amount,
                    $payment->payment_method_display,
                    $payment->clearance_type_display ?? 'N/A',
                    $recorderName,
                    $payment->recorder ? $payment->recorder->position : 'N/A',
                    $payment->status_display,
                    $payment->remarks ?? '',
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display all reports dashboard - UPDATED
     */
    public function index()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $thisMonth = Carbon::now()->startOfMonth();
        
        // Collections stats
        $todayCollections = Payment::whereDate('payment_date', $today)->sum('total_amount');
        $yesterdayCollections = Payment::whereDate('payment_date', $yesterday)->sum('total_amount');
        $monthCollections = Payment::whereDate('payment_date', '>=', $thisMonth)->sum('total_amount');
        
        // Activity logs stats (using Spatie)
        $todayLogs = Activity::whereDate('created_at', $today)->count();
        $paymentLogs = Activity::where('log_name', 'payments')->whereDate('created_at', $today)->count();
        
        // Recent activities
        $recentActivities = Activity::with('causer')
            ->latest()
            ->limit(10)
            ->get();
            
        // Add computed names for recent activities
        $recentActivities->each(function ($activity) {
            if ($activity->causer) {
                $activity->causer->name = $activity->causer->first_name . ' ' . $activity->causer->last_name;
            }
        });
        
        // Recent payments with recorder info
        $recentPayments = Payment::with('recorder')
            ->latest()
            ->limit(10)
            ->get();
        
        // Top collectors today
        $topCollectors = Payment::with('recorder')
            ->whereDate('payment_date', $today)
            ->select('recorded_by', DB::raw('SUM(total_amount) as total_collected'), DB::raw('COUNT(*) as payment_count'))
            ->groupBy('recorded_by')
            ->orderBy('total_collected', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                $collectorName = 'Unknown';
                if ($item->recorder) {
                    $collectorName = $item->recorder->first_name . ' ' . $item->recorder->last_name;
                }
                
                return [
                    'collector' => [
                        'id' => $item->recorder ? $item->recorder->id : null,
                        'name' => $collectorName,
                        'position' => $item->recorder ? $item->recorder->position : null,
                    ],
                    'total_collected' => $item->total_collected,
                    'payment_count' => $item->payment_count,
                ];
            });

        return Inertia::render('admin/Reports/Index', [
            'stats' => [
                'todayCollections' => $todayCollections,
                'yesterdayCollections' => $yesterdayCollections,
                'monthCollections' => $monthCollections,
                'todayLogs' => $todayLogs,
                'paymentLogs' => $paymentLogs,
            ],
            'recentActivities' => $recentActivities,
            'recentPayments' => $recentPayments,
            'topCollectors' => $topCollectors,
        ]);
    }


public function activityLogs(Request $request)
{
    $query = Activity::with(['causer' => function ($query) {
        $query->select('id', 'first_name', 'last_name', 'email');
    }])
    ->latest();
    
    // Apply search filter
    if ($request->filled('search') && !empty(trim($request->input('search')))) {
        $search = trim($request->input('search'));
        $query->where(function ($q) use ($search) {
            $q->where('description', 'like', "%{$search}%")
              ->orWhere('event', 'like', "%{$search}%")
              ->orWhere('properties', 'like', "%{$search}%")
              ->orWhereHas('causer', function ($q) use ($search) {
                  $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
              });
        });
    }
    
    // Apply log_name filter
    if ($request->filled('log_name') && !empty(trim($request->input('log_name')))) {
        $query->where('log_name', $request->input('log_name'));
    }
    
    // Apply event_type filter
    if ($request->filled('event_type') && !empty(trim($request->input('event_type')))) {
        $query->where('event', $request->input('event_type'));
    }
    
    // Apply user filter
    if ($request->filled('user_id') && !empty(trim($request->input('user_id')))) {
        $query->where('causer_id', $request->input('user_id'))
              ->where('causer_type', 'App\Models\User');
    }
    
    // Apply date range filter
    if ($request->filled('date_from') && !empty(trim($request->input('date_from')))) {
        $query->whereDate('created_at', '>=', $request->input('date_from'));
    }
    
    if ($request->filled('date_to') && !empty(trim($request->input('date_to')))) {
        $query->whereDate('created_at', '<=', $request->input('date_to'));
    }
    
    $perPage = $request->input('per_page', 25);
    $logs = $query->paginate($perPage);
    
    // Get filter options
    $eventTypes = Activity::select('event')
        ->whereNotNull('event')
        ->where('event', '!=', '')
        ->distinct()
        ->pluck('event')
        ->values();
    
    $logNames = Activity::select('log_name')
        ->whereNotNull('log_name')
        ->where('log_name', '!=', '')
        ->distinct()
        ->pluck('log_name')
        ->values();
    
    // Get all users for filter dropdown
    $users = User::select('id', 'first_name', 'last_name', 'email')
        ->get()
        ->map(function ($user) {
            $user->name = $user->first_name . ' ' . $user->last_name;
            return $user;
        });
    
    // Get stats
    $totalLogs = Activity::count();
    $todayLogs = Activity::whereDate('created_at', today())->count();
    $paymentLogs = Activity::where('log_name', 'payments')->count();
    $userLogs = Activity::where('causer_type', 'App\Models\User')->distinct('causer_id')->count();
    $systemLogs = Activity::whereNull('causer_type')->count();
    $userActivities = Activity::whereNotNull('causer_type')->count();
    
    // Get recent activities
    $recentActivities = Activity::with(['causer' => function ($query) {
        $query->select('id', 'first_name', 'last_name', 'email');
    }])
    ->latest()
    ->limit(10)
    ->get();
    
    // Get activity summary
    $activitySummary = Activity::select('log_name', DB::raw('count(*) as count'))
        ->whereNotNull('log_name')
        ->where('log_name', '!=', '')
        ->groupBy('log_name')
        ->orderBy('count', 'desc')
        ->get();
    
    // Get event summary
    $eventSummary = Activity::select('event', DB::raw('count(*) as count'))
        ->whereNotNull('event')
        ->where('event', '!=', '')
        ->groupBy('event')
        ->orderBy('count', 'desc')
        ->limit(10)
        ->get();
    
    // Get top users
    $topUsers = Activity::select('causer_id', DB::raw('count(*) as activity_count'))
        ->whereNotNull('causer_id')
        ->where('causer_type', 'App\Models\User')
        ->with(['causer' => function ($query) {
            $query->select('id', 'first_name', 'last_name', 'email');
        }])
        ->groupBy('causer_id')
        ->orderBy('activity_count', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($item) {
            return [
                'user' => $item->causer ? [
                    'id' => $item->causer->id,
                    'name' => $item->causer->first_name . ' ' . $item->causer->last_name,
                    'email' => $item->causer->email,
                ] : null,
                'activity_count' => $item->activity_count,
            ];
        });
    
    // Get hourly activity (last 24 hours)
    $hourlyActivity = Activity::select(
            DB::raw('HOUR(created_at) as hour'),
            DB::raw('count(*) as count')
        )
        ->where('created_at', '>=', now()->subDay())
        ->groupBy(DB::raw('HOUR(created_at)'))
        ->orderBy('hour')
        ->get();
    
    return Inertia::render('admin/Reports/ActivityLogs', [
        'logs' => $logs,
        'filters' => $request->only(['search', 'event_type', 'user_id', 'date_from', 'date_to', 'log_name', 'per_page']),
        'event_types' => $eventTypes,
        'log_names' => $logNames,
        'users' => $users,
        'stats' => [
            'total_logs' => $totalLogs,
            'today_logs' => $todayLogs,
            'payment_logs' => $paymentLogs,
            'user_logs' => $userLogs,
            'system_logs' => $systemLogs,
            'user_activities' => $userActivities,
        ],
        'recent_activities' => $recentActivities,
        'activity_summary' => $activitySummary,
        'event_summary' => $eventSummary,
        'top_users' => $topUsers,
        'hourly_activity' => $hourlyActivity,
    ]);
}
public function activityLogShow($id)
    {
        $log = Activity::with(['causer'])
            ->with(['subject' => function ($query) {
                // Eager load subject relationships if needed
            }])
            ->findOrFail($id);
        
        // Format log for display
        $formattedLog = [
            'id' => $log->id,
            'log_name' => $log->log_name,
            'description' => $log->description,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'event' => $log->event,
            'properties' => $log->properties,
            'batch_uuid' => $log->batch_uuid,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'created_at' => $log->created_at->toISOString(),
            'updated_at' => $log->updated_at->toISOString(),
            'causer' => $log->causer ? [
                'id' => $log->causer->id,
                'name' => $log->causer->name,
                'email' => $log->causer->email,
            ] : null,
        ];
        
        return Inertia::render('admin/Reports/ActivityLogShow', [
            'log' => $formattedLog,
        ]);
    }
    
}