<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Models\Activity;

class ReportsController extends Controller


{
 

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
                        $q->where('username', 'like', "%{$search}%")
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
        
        // FIXED: Use username instead of first_name and last_name
        $users = User::whereIn('id', $userIds)
            ->select('id', 'username', 'email')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->username, // Use username as the display name
                    'username' => $user->username,
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
                    // FIXED: Use username instead of first_name + last_name
                    $activityArray['causer']['name'] = $activity->causer->username;
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
                    // FIXED: Use username instead of first_name + last_name
                    $userData = [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->username,
                        'username' => $activity->causer->username,
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

        // FIXED: Use username instead of first_name + last_name
        if ($log->causer) {
            $log->causer->name = $log->causer->username;
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

        // FIXED: Use username instead of first_name + last_name
        $similarLogs->each(function ($similarLog) {
            if ($similarLog->causer) {
                $similarLog->causer->name = $similarLog->causer->username;
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

        // FIXED: Use username instead of first_name + last_name
        $userTimeline->each(function ($timelineLog) {
            if ($timelineLog->causer) {
                $timelineLog->causer->name = $timelineLog->causer->username;
            }
        });

        return Inertia::render('admin/Reports/AuditLogShow', [
            'log' => $log,
            'similar_logs' => $similarLogs,
            'user_timeline' => $userTimeline,
        ]);
    }

    /**
     * Display ALL Activity Logs (not just payment-related)
     */
    public function activityLogs(Request $request)
    {
        $query = Activity::with(['causer' => function ($query) {
            $query->select('id', 'username', 'email');
        }])
        ->with(['subject' => function ($query) {
            // Load subject data based on type
            if ($query->getModel() instanceof User) {
                $query->select('id', 'username', 'email');
            }
            // Add more model-specific eager loading as needed
        }])
        ->latest();
        
        // Apply search filter
        if ($request->filled('search') && !empty(trim($request->input('search')))) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%")
                  ->orWhere('properties', 'like', "%{$search}%")
                  ->orWhere('log_name', 'like', "%{$search}%")
                  ->orWhere('batch_uuid', 'like', "%{$search}%")
                  ->orWhereHas('causer', function ($q) use ($search) {
                      $q->where('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHasMorph('subject', ['App\Models\User'], function ($q) use ($search) {
                      $q->where('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHasMorph('subject', ['App\Models\Resident'], function ($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('resident_id', 'like', "%{$search}%");
                  });
            });
        }
        
        // Apply log_name filter - SPECIAL HANDLING FOR RESIDENTS
        if ($request->filled('log_name') && !empty(trim($request->input('log_name')))) {
            $logName = $request->input('log_name');
            
            // Handle "residents" (plural) by also checking for "resident" (singular) and subject type
            if ($logName === 'residents') {
                $query->where(function ($q) {
                    $q->where('log_name', 'residents')
                      ->orWhere('log_name', 'resident')
                      ->orWhere('subject_type', 'App\Models\Resident');
                });
            } else {
                $query->where('log_name', $logName);
            }
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
        
        // Process logs for display
        $logs->getCollection()->transform(function ($log) {
            return $this->formatActivityForDisplay($log);
        });
        
        // Get filter options - SPECIAL HANDLING FOR LOG NAMES
        $eventTypes = Activity::select('event')
            ->whereNotNull('event')
            ->where('event', '!=', '')
            ->distinct()
            ->orderBy('event')
            ->pluck('event')
            ->values()
            ->map(function ($event) {
                return [
                    'value' => $event,
                    'label' => ucwords(str_replace(['_', '-'], ' ', $event))
                ];
            });
        
        // Get unique log names from database
        $dbLogNames = Activity::select('log_name')
            ->whereNotNull('log_name')
            ->where('log_name', '!=', '')
            ->distinct()
            ->orderBy('log_name')
            ->pluck('log_name')
            ->values();
        
        // Create a unified list of log names for frontend
        $logNames = collect();
        
        // Always include these standard categories
        $standardLogs = [
            'payments' => 'Payments',
            'clearance-requests' => 'Clearance Requests',
            'users' => 'Users',
            'residents' => 'Residents', // We'll use 'residents' as the display name
            'households' => 'Households',
            'authentication' => 'Authentication',
            'system' => 'System',
            'default' => 'Default',
        ];
        
        // Add standard logs first
        foreach ($standardLogs as $key => $label) {
            $logNames->push([
                'value' => $key,
                'label' => $label
            ]);
        }
        
        // Add any other log names from database not in standard list
        foreach ($dbLogNames as $dbLogName) {
            if (!collect($standardLogs)->has($dbLogName)) {
                // Handle 'resident' singular -> map to 'residents' plural
                if ($dbLogName === 'resident') {
                    continue; // Skip since we already have 'residents' in standard
                }
                
                $logNames->push([
                    'value' => $dbLogName,
                    'label' => $this->getLogTypeDisplay($dbLogName)
                ]);
            }
        }
        
        // Remove duplicates and reorder
        $logNames = $logNames->unique('value')->values();
        
        // Get all users for filter dropdown (only those with activities)
        // FIXED: Use username instead of first_name and last_name
        $users = User::whereHas('activities')
            ->select('id', 'username', 'email')
            ->orderBy('username')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->username,
                    'username' => $user->username,
                    'email' => $user->email,
                ];
            });
        
        // Get stats - COUNT RESIDENT ACTIVITIES PROPERLY
        $totalLogs = Activity::count();
        $todayLogs = Activity::whereDate('created_at', today())->count();
        
        // Count resident activities (both 'resident' and 'residents' log names and subject_type)
        $residentLogs = Activity::where(function ($q) {
            $q->where('log_name', 'resident')
              ->orWhere('log_name', 'residents')
              ->orWhere('subject_type', 'App\Models\Resident');
        })->count();
        
        $userLogs = Activity::where('causer_type', 'App\Models\User')->distinct('causer_id')->count();
        $systemLogs = Activity::whereNull('causer_type')->count();
        $userActivities = Activity::whereNotNull('causer_type')->count();
        $last7Days = Activity::where('created_at', '>=', now()->subDays(7))->count();
        
        // Get payment logs separately
        $paymentLogs = Activity::where('log_name', 'payments')->count();
        
        // Get recent activities
        $recentActivities = Activity::with(['causer' => function ($query) {
            $query->select('id', 'username', 'email');
        }])
        ->latest()
        ->limit(10)
        ->get()
        ->map(function ($activity) {
            return $this->formatActivityForDisplay($activity);
        });
        
        // Get activity summary for last 30 days - GROUP RESIDENT ACTIVITIES
        $rawActivitySummary = Activity::select('log_name', DB::raw('count(*) as count'))
            ->whereNotNull('log_name')
            ->where('log_name', '!=', '')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('log_name')
            ->orderBy('count', 'desc')
            ->get();
        
        // Process activity summary - combine 'resident' and 'residents' into 'residents'
        $activitySummary = collect();
        $residentCount = 0;
        
        foreach ($rawActivitySummary as $item) {
            if ($item->log_name === 'resident' || $item->log_name === 'residents') {
                $residentCount += $item->count;
            } else {
                $activitySummary->push([
                    'log_name' => $item->log_name,
                    'count' => $item->count,
                ]);
            }
        }
        
        // Add combined resident count
        if ($residentCount > 0) {
            $activitySummary->prepend([
                'log_name' => 'residents',
                'count' => $residentCount,
            ]);
        }
        
        // Get event summary for last 30 days
        $eventSummary = Activity::select('event', DB::raw('count(*) as count'))
            ->whereNotNull('event')
            ->where('event', '!=', '')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('event')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'event' => $item->event,
                    'count' => $item->count,
                ];
            });
        
        // Get top users for last 30 days
        $topUsers = Activity::select('causer_id', DB::raw('count(*) as activity_count'))
            ->whereNotNull('causer_id')
            ->where('causer_type', 'App\Models\User')
            ->where('created_at', '>=', now()->subDays(30))
            ->with(['causer' => function ($query) {
                $query->select('id', 'username', 'email');
            }])
            ->groupBy('causer_id')
            ->orderBy('activity_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'user' => $item->causer ? [
                        'id' => $item->causer->id,
                        'name' => $item->causer->username,
                        'username' => $item->causer->username,
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
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => str_pad($item->hour, 2, '0', STR_PAD_LEFT) . ':00',
                    'count' => $item->count,
                ];
            });
        
        // Get daily activity trend (last 7 days)
        $dailyActivity = Activity::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M j'),
                    'count' => $item->count,
                ];
            });
        
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
                'resident_logs' => $residentLogs, // Add this
                'user_logs' => $userLogs,
                'system_logs' => $systemLogs,
                'user_activities' => $userActivities,
                'last_7_days' => $last7Days,
            ],
            'recent_activities' => $recentActivities,
            'activity_summary' => $activitySummary,
            'event_summary' => $eventSummary,
            'top_users' => $topUsers,
            'hourly_activity' => $hourlyActivity,
            'daily_activity' => $dailyActivity,
        ]);
    }

    /**
     * Display single activity log details
     */
    public function activityLogShow($id)
    {
        $log = Activity::with(['causer', 'subject'])
            ->findOrFail($id);
        
        // Format the log for display
        $formattedLog = $this->formatActivityForDisplay($log, true);
        
        // Get similar logs
        $similarLogs = Activity::where('causer_id', $log->causer_id)
            ->where('id', '!=', $log->id)
            ->where('event', $log->event)
            ->where('log_name', $log->log_name)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($similarLog) {
                return $this->formatActivityForDisplay($similarLog);
            });
        
        // Get user's recent activity timeline
        $userTimeline = Activity::where('causer_id', $log->causer_id)
            ->where('id', '!=', $log->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($timelineLog) {
                return $this->formatActivityForDisplay($timelineLog);
            });
        
        return Inertia::render('admin/Reports/ActivityLogShow', [
            'log' => $formattedLog,
            'similar_logs' => $similarLogs,
            'user_timeline' => $userTimeline,
        ]);
    }

    /**
     * Export activity logs
     */
    public function activityLogsExport(Request $request)
    {
        $query = Activity::with(['causer'])
            ->latest();
        
        // Apply filters
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%")
                  ->orWhere('properties', 'like', "%{$search}%")
                  ->orWhereHas('causer', function ($q) use ($search) {
                      $q->where('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->input('log_name'));
        }
        
        if ($request->filled('event_type')) {
            $query->where('event', $request->input('event_type'));
        }
        
        if ($request->filled('user_id')) {
            $query->where('causer_id', $request->input('user_id'));
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }
        
        $logs = $query->get();
        
        $fileName = 'activity-logs-export-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];
        
        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8
            fwrite($file, "\xEF\xBB\xBF");
            
            // Headers
            fputcsv($file, [
                'ID',
                'Timestamp',
                'Log Type',
                'Event',
                'Description',
                'User',
                'User Email',
                'Subject Type',
                'Subject ID',
                'IP Address',
                'Properties',
                'Batch UUID',
            ]);
            
            // Data
            foreach ($logs as $log) {
                // FIXED: Use username instead of first_name + last_name
                $causerName = $log->causer ? $log->causer->username : 'System';
                $causerEmail = $log->causer ? $log->causer->email : '';
                $properties = json_encode($log->properties ?? [], JSON_PRETTY_PRINT);
                
                fputcsv($file, [
                    $log->id,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $this->getLogTypeDisplay($log->log_name),
                    $log->event,
                    $log->description ?? '',
                    $causerName,
                    $causerEmail,
                    $log->subject_type ?? '',
                    $log->subject_id ?? '',
                    $log->properties['ip_address'] ?? '',
                    $properties,
                    $log->batch_uuid ?? '',
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Helper: Format activity for display
     */
    private function formatActivityForDisplay(Activity $activity, $detailed = false): array
    {
        $properties = $activity->properties ?? [];
        
        $formatted = [
            'id' => $activity->id,
            'log_name' => $activity->log_name,
            'log_name_display' => $this->getLogTypeDisplay($activity->log_name),
            'description' => $activity->description,
            'event' => $activity->event,
            'event_display' => ucwords(str_replace(['_', '-'], ' ', $activity->event)),
            'subject_type' => $activity->subject_type,
            'subject_type_display' => $activity->subject_type ? class_basename($activity->subject_type) : null,
            'subject_id' => $activity->subject_id,
            'causer_type' => $activity->causer_type,
            'causer_id' => $activity->causer_id,
            'batch_uuid' => $activity->batch_uuid,
            'properties' => $properties,
            'created_at' => $activity->created_at->toISOString(),
            'updated_at' => $activity->updated_at->toISOString(),
            'created_at_formatted' => $activity->created_at->format('Y-m-d H:i:s'),
            'created_at_relative' => $activity->created_at->diffForHumans(),
            // FIXED: Use username instead of first_name + last_name
            'causer' => $activity->causer ? [
                'id' => $activity->causer->id,
                'name' => $activity->causer->username,
                'username' => $activity->causer->username,
                'email' => $activity->causer->email,
            ] : null,
            'subject' => $activity->subject ? $this->formatSubjectForDisplay($activity->subject) : null,
        ];
        
        // Add IP and User Agent if available in properties
        if (isset($properties['ip_address'])) {
            $formatted['ip_address'] = $properties['ip_address'];
        }
        
        if (isset($properties['user_agent'])) {
            $formatted['user_agent'] = $properties['user_agent'];
        }
        
        // Add formatted changes if available
        if (isset($properties['changes'])) {
            $formatted['formatted_changes'] = $this->formatChanges($properties['changes']);
        }
        
        if (isset($properties['old'])) {
            $formatted['formatted_old_values'] = $this->formatOldValues($properties['old']);
        }
        
        if (isset($properties['attributes'])) {
            $formatted['extracted_attributes'] = $properties['attributes'];
        }
        
        return $formatted;
    }

    /**
     * Helper: Format subject for display
     */
    private function formatSubjectForDisplay($subject): array
    {
        // FIXED: Use username instead of first_name + last_name for User model
        if ($subject instanceof User) {
            return [
                'id' => $subject->id,
                'name' => $subject->username,
                'email' => $subject->email,
                'type' => 'user',
            ];
        }
        
        // Handle other model types
        return [
            'id' => $subject->id ?? null,
            'type' => class_basename($subject),
            'data' => $subject->toArray(),
        ];
    }

    /**
     * Helper: Get log type display name
     */
    private function getLogTypeDisplay(string $logName): string
    {
        $types = [
            'default' => 'System',
            'payments' => 'Payments',
            'clearance-requests' => 'Clearance Requests',
            'users' => 'Users',
            'residents' => 'Residents',
            'households' => 'Households',
            'authentication' => 'Authentication',
            'system' => 'System',
        ];
        
        return $types[$logName] ?? ucwords(str_replace(['_', '-'], ' ', $logName));
    }

    /**
     * Helper: Format changes for display
     */
    private function formatChanges(array $changes): array
    {
        $formatted = [];
        
        foreach ($changes as $key => $value) {
            // Format date fields
            if (in_array($key, ['created_at', 'updated_at', 'deleted_at', 'date', 'birth_date', 'date_of_birth'])) {
                $value = Carbon::parse($value)->format('Y-m-d H:i:s');
            }
            
            // Format boolean fields
            if (is_bool($value)) {
                $value = $value ? 'Yes' : 'No';
            }
            
            // Format array/object fields
            if (is_array($value) || is_object($value)) {
                $value = json_encode($value, JSON_PRETTY_PRINT);
            }
            
            // Format key for display
            $displayKey = ucwords(str_replace(['_', '-'], ' ', $key));
            
            $formatted[] = [
                'key' => $key,
                'display_key' => $displayKey,
                'value' => $value,
                'type' => gettype($value),
            ];
        }
        
        return $formatted;
    }

    /**
     * Helper: Format old values for display
     */
    private function formatOldValues(array $oldValues): array
    {
        $formatted = [];
        
        foreach ($oldValues as $key => $value) {
            // Format date fields
            if (in_array($key, ['created_at', 'updated_at', 'deleted_at', 'date', 'birth_date', 'date_of_birth'])) {
                $value = $value ? Carbon::parse($value)->format('Y-m-d H:i:s') : null;
            }
            
            // Format boolean fields
            if (is_bool($value)) {
                $value = $value ? 'Yes' : 'No';
            }
            
            // Format array/object fields
            if (is_array($value) || is_object($value)) {
                $value = json_encode($value, JSON_PRETTY_PRINT);
            }
            
            // Format key for display
            $displayKey = ucwords(str_replace(['_', '-'], ' ', $key));
            
            $formatted[] = [
                'key' => $key,
                'display_key' => $displayKey,
                'value' => $value,
                'type' => gettype($value),
            ];
        }
        
        return $formatted;
    }
}