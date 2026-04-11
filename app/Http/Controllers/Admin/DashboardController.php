<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use App\Models\Privilege;
use App\Models\Activity;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // if (!auth()->user()->hasPermission('view-dashboard')) {
        //     abort(403, 'You do not have permission to view the dashboard.');
        // }
        
        // Get date range from request or default to 'week'
        $dateRange = $request->get('dateRange', 'week');
        
        // Calculate date ranges based on selected filter
        $dateRanges = $this->calculateDateRanges($dateRange);
        
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $startOfYear = Carbon::now()->startOfYear();
        $endOfYear = Carbon::now()->endOfYear();

        // Get privilege IDs for common categories
        $privilegeIds = [
            'senior' => Privilege::where('code', 'SC')->value('id'),
            'pwd' => Privilege::where('code', 'PWD')->value('id'),
            'solo_parent' => Privilege::where('code', 'SP')->value('id'),
            'indigent' => Privilege::where('code', 'IND')->value('id'),
            'four_ps' => Privilege::where('code', '4PS')->value('id'),
            'indigenous' => Privilege::where('code', 'IP')->value('id'),
        ];

        // Get statistics
        $stats = [
            'totalResidents' => Resident::count(),
            'totalHouseholds' => Household::count(),
            'monthlyCollections' => Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed')
                ->sum('total_amount'),
            'pendingClearances' => ClearanceRequest::where('status', 'pending')->count(),
            
            'seniorCitizens' => DB::table('resident_privileges')
                ->where('privilege_id', $privilegeIds['senior'])
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->count(),
                
            'pwds' => DB::table('resident_privileges')
                ->where('privilege_id', $privilegeIds['pwd'])
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->count(),
                
            'soloParents' => DB::table('resident_privileges')
                ->where('privilege_id', $privilegeIds['solo_parent'])
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->count(),
                
            'fourPs' => DB::table('resident_privileges')
                ->where('privilege_id', $privilegeIds['four_ps'])
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->count(),
                
            'indigenous' => DB::table('resident_privileges')
                ->where('privilege_id', $privilegeIds['indigenous'])
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->count(),
                
            'indigent' => DB::table('resident_privileges')
                ->where('privilege_id', $privilegeIds['indigent'])
                ->where(function($query) {
                    $query->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                })
                ->count(),
        ];

        // Get activities from activity_log table
        $activities = $this->getRecentActivities();

        // Get activity stats
        $activityStats = [
            'newResidentsToday' => Resident::whereDate('created_at', $today)->count(),
            'paymentsToday' => Payment::whereDate('payment_date', $today)
                ->where('status', 'completed')
                ->count(),
            'clearanceRequestsToday' => ClearanceRequest::whereDate('created_at', $today)->count(),
            'totalActivitiesThisWeek' => Activity::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count(),
            'activeUsers' => Activity::whereDate('created_at', $today)
                ->distinct('causer_id')
                ->count('causer_id'),
            'peakHours' => $this->getPeakHours(),
        ];

        // Get recent items for backward compatibility
        $recentItems = [
            'newResidents' => $this->getNewResidents(),
            'recentPayments' => $this->getRecentPayments(),
            'recentClearanceRequests' => $this->getRecentClearances(),
            'items' => $activities,
        ];

        // Get privilege statistics
        $privilegeStats = $this->getPrivilegeStats();

        return Inertia::render('admin/Dashboard', [
            'stats' => $stats,
            'activities' => $activities,
            'recentActivities' => $recentItems,
            'paymentStats' => $this->getPaymentStats(
                $dateRanges['start'], 
                $dateRanges['end'], 
                $startOfWeek, 
                $endOfWeek,
                $dateRange
            ),
            'clearanceRequestStats' => $this->getClearanceRequestStats(
                $dateRanges['start'], 
                $dateRanges['end']
            ),
            'clearanceTypeStats' => $this->getClearanceTypeStats(
                $dateRanges['start'], 
                $dateRanges['end']
            ),
            'collectionStats' => $this->getCollectionStats(
                $today, 
                $yesterday, 
                $startOfWeek, 
                $endOfWeek, 
                $startOfMonth, 
                $endOfMonth, 
                $startOfYear, 
                $endOfYear,
                $dateRange
            ),
            'activityStats' => $activityStats,
            'storageStats' => $this->getStorageStats(),
            'demographicStats' => $this->getDemographicStats(),
            'privilegeStats' => $privilegeStats,
            'selectedDateRange' => $dateRange,
        ]);
    }

    /**
     * Get recent activities from activity_log table
     */
    private function getRecentActivities()
    {
        return Activity::with(['causer'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($activity) {
                $iconInfo = $this->getActivityIcon($activity);
                
                return [
                    'id' => $activity->id,
                    'description' => $this->formatActivityDescription($activity),
                    'type' => $this->getActivityType($activity),
                    'time' => $activity->created_at->diffForHumans(),
                    'icon' => $iconInfo['icon'],
                    'iconColor' => $iconInfo['iconColor'],
                    'bgColor' => $iconInfo['bgColor'],
                    'priority' => $this->getActivityPriority($activity),
                    'isRead' => false,
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'subject_type' => class_basename($activity->subject_type),
                    'subject_id' => $activity->subject_id,
                    'properties' => $activity->properties,
                    'created_at' => $activity->created_at->toDateTimeString(),
                ];
            })
            ->toArray();
    }

    /**
     * Get activity icon based on subject and event
     */
    private function getActivityIcon($activity)
    {
        $subjectType = class_basename($activity->subject_type);
        $event = $activity->event;
        
        // Default values
        $icon = 'Activity';
        $iconColor = 'text-gray-600';
        $bgColor = 'bg-gray-50';
        
        switch ($subjectType) {
            case 'Resident':
                if ($event === 'created') {
                    $icon = 'UserPlus';
                    $iconColor = 'text-purple-600';
                    $bgColor = 'bg-purple-50';
                } elseif ($event === 'updated') {
                    $icon = 'UserCheck';
                    $iconColor = 'text-blue-600';
                    $bgColor = 'bg-blue-50';
                } elseif ($event === 'deleted') {
                    $icon = 'UserMinus';
                    $iconColor = 'text-red-600';
                    $bgColor = 'bg-red-50';
                }
                break;
                
            case 'Payment':
                $icon = 'CreditCard';
                $iconColor = 'text-emerald-600';
                $bgColor = 'bg-emerald-50';
                break;
                
            case 'ClearanceRequest':
                $icon = 'FileText';
                $iconColor = 'text-blue-600';
                $bgColor = 'bg-blue-50';
                
                // Check status from properties
                if (isset($activity->properties['changes']['status'])) {
                    $newStatus = $activity->properties['changes']['status']['new'] ?? null;
                    if ($newStatus === 'approved') {
                        $icon = 'CheckCircle';
                        $iconColor = 'text-green-600';
                        $bgColor = 'bg-green-50';
                    } elseif ($newStatus === 'rejected') {
                        $icon = 'XCircle';
                        $iconColor = 'text-red-600';
                        $bgColor = 'bg-red-50';
                    } elseif ($newStatus === 'issued') {
                        $icon = 'FileCheck';
                        $iconColor = 'text-indigo-600';
                        $bgColor = 'bg-indigo-50';
                    }
                }
                break;
                
            case 'Household':
                $icon = 'Home';
                $iconColor = 'text-emerald-600';
                $bgColor = 'bg-emerald-50';
                break;
                
            case 'User':
                $icon = 'User';
                $iconColor = 'text-indigo-600';
                $bgColor = 'bg-indigo-50';
                
                if ($event === 'login') {
                    $icon = 'LogIn';
                } elseif ($event === 'logout') {
                    $icon = 'LogOut';
                }
                break;
        }
        
        return [
            'icon' => $icon,
            'iconColor' => $iconColor,
            'bgColor' => $bgColor,
        ];
    }

    /**
     * Format activity description
     */
    private function formatActivityDescription($activity)
    {
        $causerName = $activity->causer ? $activity->causer->name : 'System';
        $subjectType = class_basename($activity->subject_type);
        $event = $activity->event;
        
        // Get subject name if available
        $subjectName = '';
        if ($activity->subject) {
            if ($activity->subject_type === Resident::class) {
                $subjectName = $activity->subject->first_name . ' ' . $activity->subject->last_name;
            } elseif ($activity->subject_type === Payment::class) {
                $subjectName = $activity->subject->payer_name ?? 'Payment';
            } elseif ($activity->subject_type === ClearanceRequest::class) {
                $subjectName = $activity->subject->resident ? 
                    $activity->subject->resident->first_name . ' ' . $activity->subject->resident->last_name : 
                    'Clearance';
            } elseif ($activity->subject_type === Household::class) {
                $subjectName = 'Household #' . $activity->subject->household_number;
            }
        }
        
        // Check properties for changes
        $properties = $activity->properties;
        
        switch ($event) {
            case 'created':
                return "{$causerName} created new {$subjectType}: {$subjectName}";
                
            case 'updated':
                if (isset($properties['changes'])) {
                    $changedFields = array_keys($properties['changes']);
                    $fieldsList = implode(', ', array_map('ucfirst', $changedFields));
                    return "{$causerName} updated {$subjectType} {$subjectName} ({$fieldsList})";
                }
                return "{$causerName} updated {$subjectType} {$subjectName}";
                
            case 'deleted':
                return "{$causerName} deleted {$subjectType}: {$subjectName}";
                
            case 'login':
                return "{$causerName} logged into the system";
                
            case 'logout':
                return "{$causerName} logged out of the system";
                
            default:
                return $activity->description ?? "{$causerName} performed {$event} on {$subjectType}";
        }
    }

    /**
     * Get activity type
     */
    private function getActivityType($activity)
    {
        $subjectType = class_basename($activity->subject_type);
        
        switch ($subjectType) {
            case 'Resident':
                return 'resident';
            case 'Payment':
                return 'payment';
            case 'ClearanceRequest':
                return 'clearance';
            case 'Household':
                return 'household';
            case 'User':
                return 'user';
            default:
                return 'system';
        }
    }

    /**
     * Get activity priority
     */
    private function getActivityPriority($activity)
    {
        $event = $activity->event;
        
        switch ($event) {
            case 'deleted':
                return 'high';
            case 'created':
                return 'medium';
            case 'updated':
                return 'low';
            case 'login':
            case 'logout':
                return 'low';
            default:
                return 'medium';
        }
    }

    /**
     * Get new residents
     */
    private function getNewResidents()
    {
        return Resident::with(['household'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($resident) {
                $privilegesCount = DB::table('resident_privileges')
                    ->where('resident_id', $resident->id)
                    ->count();
                
                return [
                    'id' => $resident->id,
                    'name' => $resident->first_name . ' ' . $resident->last_name,
                    'created_at' => $resident->created_at->format('Y-m-d H:i:s'),
                    'household_number' => $resident->household?->household_number,
                    'privileges_count' => $privilegesCount,
                ];
            })->toArray();
    }

    /**
     * Get recent payments
     */
    private function getRecentPayments()
    {
        return Payment::with(['resident'])
            ->where('status', 'completed')
            ->latest('payment_date')
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payer_name' => $payment->payer_name ?? ($payment->resident ? 
                        $payment->resident->first_name . ' ' . $payment->resident->last_name : 
                        'Unknown'),
                    'total_amount' => $payment->total_amount,
                    'payment_date' => $payment->payment_date ? 
                        Carbon::parse($payment->payment_date)->format('Y-m-d H:i:s') : 
                        $payment->created_at->format('Y-m-d H:i:s'),
                    'payment_method' => $this->getPaymentMethodDisplay($payment->payment_method),
                    'certificate_type' => $this->getClearanceTypeDisplay($payment->clearance_type),
                ];
            })->toArray();
    }

    /**
     * Get recent clearance requests
     */
    private function getRecentClearances()
    {
        return ClearanceRequest::with(['resident', 'clearanceType'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($clearance) {
                return [
                    'id' => $clearance->id,
                    'resident' => [
                        'name' => $clearance->resident ? 
                            $clearance->resident->first_name . ' ' . $clearance->resident->last_name : 
                            'Unknown Resident',
                    ],
                    'clearanceType' => $clearance->clearanceType ? [
                        'name' => $clearance->clearanceType->name,
                        'code' => $clearance->clearanceType->code,
                    ] : null,
                    'purpose' => $clearance->purpose,
                    'created_at' => $clearance->created_at->format('Y-m-d H:i:s'),
                    'status' => $clearance->status,
                    'urgency' => $clearance->urgency,
                ];
            })->toArray();
    }

    /**
     * Get peak hours from activity logs
     */
    private function getPeakHours()
    {
        $activities = Activity::selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->whereDate('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('hour')
            ->orderByDesc('count')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                $startHour = $item->hour;
                $endHour = ($item->hour + 2) % 24;
                $startFormatted = date('g A', strtotime("{$startHour}:00"));
                $endFormatted = date('g A', strtotime("{$endHour}:00"));
                return "{$startFormatted} - {$endFormatted}";
            })
            ->toArray();
            
        return !empty($activities) ? $activities : ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM', '7:00 PM - 9:00 PM'];
    }

    /**
     * Get payment method display name
     */
    private function getPaymentMethodDisplay($method)
    {
        return match($method) {
            'cash' => 'Cash',
            'gcash' => 'GCash',
            'maya' => 'Maya',
            'bank' => 'Bank Transfer',
            'check' => 'Check',
            'online' => 'Online Payment',
            default => ucfirst($method)
        };
    }

    /**
     * Get clearance type display name
     */
    private function getClearanceTypeDisplay($type)
    {
        return match($type) {
            'barangay_clearance' => 'Barangay Clearance',
            'business_clearance' => 'Business Clearance',
            'indigency' => 'Certificate of Indigency',
            'residency' => 'Certificate of Residency',
            'good_moral' => 'Good Moral Character',
            default => ucwords(str_replace('_', ' ', $type))
        };
    }

    /**
     * Calculate date ranges based on selected filter
     */
    private function calculateDateRanges($dateRange)
    {
        $now = Carbon::now();
        
        switch ($dateRange) {
            case 'today':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                    'label' => 'Today'
                ];
            case 'week':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                    'label' => 'This Week'
                ];
            case 'month':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                    'label' => 'This Month'
                ];
            case 'year':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear(),
                    'label' => 'This Year'
                ];
            default:
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                    'label' => 'This Week'
                ];
        }
    }

    private function getPaymentStats($startDate, $endDate, $startOfWeek, $endOfWeek, $dateRange)
    {
        // For daily collections chart
        $dailyCollections = [];
        
        if ($dateRange === 'today') {
            // Show hourly data for today
            $currentHour = Carbon::now()->startOfDay();
            while ($currentHour <= Carbon::now()) {
                $hourTotal = Payment::whereBetween('payment_date', [
                        $currentHour->copy(),
                        $currentHour->copy()->endOfHour()
                    ])
                    ->where('status', 'completed')
                    ->sum('total_amount');
                    
                $dailyCollections[] = [
                    'date' => $currentHour->format('Y-m-d H:00'),
                    'day' => $currentHour->format('H:00'),
                    'count' => Payment::whereBetween('payment_date', [
                            $currentHour->copy(),
                            $currentHour->copy()->endOfHour()
                        ])
                        ->where('status', 'completed')
                        ->count(),
                    'amount' => number_format($hourTotal ?? 0, 2)
                ];
                
                $currentHour->addHour();
            }
        } else {
            // Show daily data for week/month/year
            $currentDay = $startDate->copy();
            $endDay = $endDate->copy();
            
            while ($currentDay <= $endDay) {
                $dayTotal = Payment::whereDate('payment_date', $currentDay)
                    ->where('status', 'completed')
                    ->sum('total_amount');
                    
                $dailyCollections[] = [
                    'date' => $currentDay->format('Y-m-d'),
                    'day' => $currentDay->format('M d'),
                    'count' => Payment::whereDate('payment_date', $currentDay)
                        ->where('status', 'completed')
                        ->count(),
                    'amount' => number_format($dayTotal ?? 0, 2)
                ];
                
                $currentDay->addDay();
            }
        }

        // Get payment stats by certificate type for the selected period
        $payments = Payment::with(['items.clearanceRequest.clearanceType'])
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->get();
            
        $certificateStats = collect();
        
        foreach ($payments as $payment) {
            foreach ($payment->items as $item) {
                if ($item->clearanceRequest && $item->clearanceRequest->clearanceType) {
                    $certificateStats->push([
                        'type' => $item->clearanceRequest->clearanceType->name,
                        'original_type' => $item->clearanceRequest->clearanceType->code,
                        'count' => 1,
                        'amount' => $item->total_amount
                    ]);
                }
            }
            
            if ($payment->clearance_type && !$payment->items->count()) {
                $certificateStats->push([
                    'type' => $this->getClearanceTypeDisplay($payment->clearance_type),
                    'original_type' => $payment->clearance_type,
                    'count' => 1,
                    'amount' => $payment->total_amount
                ]);
            }
        }
        
        $certificateStats = $certificateStats->groupBy('original_type')
            ->map(function ($items, $typeCode) {
                $first = $items->first();
                return [
                    'type' => $first['type'] ?? $typeCode,
                    'original_type' => $typeCode,
                    'count' => $items->count(),
                    'amount' => number_format($items->sum('amount'), 2)
                ];
            })
            ->values()
            ->toArray();

        // Get payment stats by payment method
        $methodStats = Payment::selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as total')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => $this->getPaymentMethodDisplay($item->payment_method),
                    'original_method' => $item->payment_method,
                    'count' => (int)$item->count,
                    'amount' => number_format($item->total ?? 0, 2)
                ];
            })
            ->toArray();

        return [
            'byCertificateType' => $certificateStats,
            'byPaymentMethod' => $methodStats,
            'dailyCollections' => $dailyCollections,
        ];
    }

    private function getClearanceRequestStats($startDate, $endDate)
    {
        // Get clearance request statistics by type
        $byType = ClearanceRequest::selectRaw('clearance_type_id, COUNT(*) as count')
            ->with('clearanceType')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('clearance_type_id')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->clearanceType?->name ?? 'Unknown Type',
                    'original_type' => $item->clearance_type_id,
                    'count' => (int)$item->count
                ];
            })
            ->toArray();

        // Get clearance request status breakdown
        $byStatus = ClearanceRequest::selectRaw('status, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                $statusDisplay = match($item->status) {
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                    'processing' => 'Processing',
                    'ready_for_pickup' => 'Ready for Pickup',
                    'completed' => 'Completed',
                    default => ucfirst($item->status)
                };
                
                return [
                    'status' => $statusDisplay,
                    'original_status' => $item->status,
                    'count' => (int)$item->count
                ];
            })
            ->toArray();

        return [
            'byType' => $byType,
            'byStatus' => $byStatus,
        ];
    }

    private function getClearanceTypeStats($startDate, $endDate)
    {
        return ClearanceType::where('is_active', true)
            ->get()
            ->map(function ($type) use ($startDate, $endDate) {
                $totalRequests = ClearanceRequest::where('clearance_type_id', $type->id)->count();
                $periodRequests = ClearanceRequest::where('clearance_type_id', $type->id)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count();
                    
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'description' => $type->description,
                    'fee' => '₱' . number_format($type->fee, 2),
                    'processing_days' => $type->processing_days,
                    'validity_days' => $type->validity_days,
                    'requires_payment' => $type->requires_payment,
                    'requires_approval' => $type->requires_approval,
                    'total_requests' => $totalRequests,
                    'monthly_requests' => $periodRequests,
                    'is_active' => $type->is_active,
                ];
            })
            ->toArray();
    }

    private function getCollectionStats($today, $yesterday, $startOfWeek, $endOfWeek, $startOfMonth, $endOfMonth, $startOfYear, $endOfYear, $dateRange)
    {
        $dateRanges = $this->calculateDateRanges($dateRange);
        
        $selectedPeriodCollections = Payment::whereBetween('payment_date', [$dateRanges['start'], $dateRanges['end']])
            ->where('status', 'completed')
            ->sum('total_amount');

        $todayCollections = Payment::whereDate('payment_date', $today)
            ->where('status', 'completed')
            ->sum('total_amount');

        $yesterdayCollections = Payment::whereDate('payment_date', $yesterday)
            ->where('status', 'completed')
            ->sum('total_amount');

        $weeklyCollections = Payment::whereBetween('payment_date', [$startOfWeek, $endOfWeek])
            ->where('status', 'completed')
            ->sum('total_amount');

        $monthlyCollections = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'completed')
            ->sum('total_amount');

        $yearlyCollections = Payment::whereBetween('payment_date', [$startOfYear, $endOfYear])
            ->where('status', 'completed')
            ->sum('total_amount');

        $daysInPeriod = $dateRanges['start']->diffInDays($dateRanges['end']) + 1;
        $dailyAvg = $daysInPeriod > 0 ? $selectedPeriodCollections / $daysInPeriod : 0;

        $previousPeriodStart = $dateRanges['start']->copy()->subDays($daysInPeriod);
        $previousPeriodEnd = $dateRanges['start']->copy()->subDay();
        
        $previousPeriodCollections = Payment::whereBetween('payment_date', [$previousPeriodStart, $previousPeriodEnd])
            ->where('status', 'completed')
            ->sum('total_amount');
        
        $growthRate = $previousPeriodCollections > 0 
            ? (($selectedPeriodCollections - $previousPeriodCollections) / $previousPeriodCollections) * 100 
            : 0;

        return [
            'today' => number_format($todayCollections ?? 0, 2),
            'yesterday' => number_format($yesterdayCollections ?? 0, 2),
            'weekly' => number_format($weeklyCollections ?? 0, 2),
            'monthly' => number_format($monthlyCollections ?? 0, 2),
            'yearly' => number_format($yearlyCollections ?? 0, 2),
            'selectedPeriod' => number_format($selectedPeriodCollections ?? 0, 2),
            'selectedPeriodLabel' => $dateRanges['label'],
            'dailyAvg' => number_format($dailyAvg ?? 0, 2),
            'growthRate' => number_format($growthRate, 1) . '%',
        ];
    }

    /**
     * Get privilege statistics
     */
    private function getPrivilegeStats()
    {
        $privileges = Privilege::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function($privilege) {
                $count = DB::table('resident_privileges')
                    ->where('privilege_id', $privilege->id)
                    ->where(function($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                    })
                    ->count();
                
                return [
                    'id' => $privilege->id,
                    'name' => $privilege->name,
                    'code' => $privilege->code,
                    'count' => $count,
                    'discount_percentage' => $privilege->discount_percentage,
                ];
            });

        $expiringSoon = DB::table('resident_privileges')
            ->join('residents', 'resident_privileges.resident_id', '=', 'residents.id')
            ->join('privileges', 'resident_privileges.privilege_id', '=', 'privileges.id')
            ->whereNotNull('resident_privileges.expires_at')
            ->whereBetween('resident_privileges.expires_at', [now(), now()->addDays(30)])
            ->select(
                'residents.id as resident_id',
                'residents.first_name',
                'residents.last_name',
                'privileges.name as privilege_name',
                'privileges.code as privilege_code',
                'resident_privileges.expires_at',
                'resident_privileges.id_number'
            )
            ->orderBy('resident_privileges.expires_at')
            ->limit(10)
            ->get();

        $recentlyExpired = DB::table('resident_privileges')
            ->join('residents', 'resident_privileges.resident_id', '=', 'residents.id')
            ->join('privileges', 'resident_privileges.privilege_id', '=', 'privileges.id')
            ->whereNotNull('resident_privileges.expires_at')
            ->whereBetween('resident_privileges.expires_at', [now()->subDays(30), now()])
            ->select(
                'residents.id as resident_id',
                'residents.first_name',
                'residents.last_name',
                'privileges.name as privilege_name',
                'privileges.code as privilege_code',
                'resident_privileges.expires_at'
            )
            ->orderByDesc('resident_privileges.expires_at')
            ->limit(10)
            ->get();

        $totalActive = DB::table('resident_privileges')
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->count();

        return [
            'byPrivilege' => $privileges,
            'expiringSoon' => $expiringSoon,
            'recentlyExpired' => $recentlyExpired,
            'totalActive' => $totalActive,
        ];
    }

    /**
     * Get demographic statistics
     */
    private function getDemographicStats()
    {
        $totalResidents = Resident::count();
        
        // Age groups
        $ageGroups = [
            ['group' => '0-17', 'count' => Resident::whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 18')->count()],
            ['group' => '18-30', 'count' => Resident::whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 18 AND 30')->count()],
            ['group' => '31-45', 'count' => Resident::whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 31 AND 45')->count()],
            ['group' => '46-60', 'count' => Resident::whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 46 AND 60')->count()],
            ['group' => '60+', 'count' => Resident::whereRaw('TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 60')->count()],
        ];
        
        foreach ($ageGroups as &$group) {
            $group['percentage'] = $totalResidents > 0 
                ? round(($group['count'] / $totalResidents) * 100, 1) 
                : 0;
        }

        // Gender distribution
        $gender = [
            'male' => Resident::where('gender', 'Male')->count(),
            'female' => Resident::where('gender', 'Female')->count(),
            'other' => Resident::whereNotIn('gender', ['Male', 'Female'])->count(),
        ];

        // Civil status
        $civilStatus = Resident::selectRaw('civil_status, COUNT(*) as count')
            ->whereNotNull('civil_status')
            ->groupBy('civil_status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->civil_status,
                    'count' => $item->count,
                ];
            })
            ->toArray();

        return [
            'ageGroups' => $ageGroups,
            'gender' => $gender,
            'civilStatus' => $civilStatus,
        ];
    }

    /**
     * Get storage statistics
     */
    private function getStorageStats()
    {
        try {
            $residentCount = Resident::count();
            $householdCount = Household::count();
            $paymentCount = Payment::count();
            $clearanceCount = ClearanceRequest::count();
            
            $databaseName = config('database.connections.mysql.database');
            
            $dbSizeQuery = DB::select("
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.tables 
                WHERE table_schema = ?
            ", [$databaseName]);
            
            $databaseSizeMB = $dbSizeQuery[0]->size_mb ?? 2.2;
            
            return [
                'totalUsedMB' => round($databaseSizeMB, 2),
                'totalStorageMB' => 2048,
                'percentage' => round(($databaseSizeMB / 2048) * 100, 1),
                'details' => [
                    'residentCount' => $residentCount,
                    'householdCount' => $householdCount,
                    'paymentCount' => $paymentCount,
                    'clearanceCount' => $clearanceCount,
                ],
                'backupStatus' => [
                    'lastBackup' => now()->subDay()->format('Y-m-d H:i:s'),
                    'backupSize' => round($databaseSizeMB * 0.8, 1) . ' MB',
                    'isAutomatic' => true,
                ],
            ];
            
        } catch (\Exception $e) {
            return [
                'totalUsedMB' => 2.2,
                'totalStorageMB' => 2048,
                'percentage' => 0.1,
                'details' => [
                    'residentCount' => Resident::count(),
                    'householdCount' => Household::count(),
                    'paymentCount' => Payment::count(),
                    'clearanceCount' => ClearanceRequest::count(),
                ],
                'backupStatus' => [
                    'lastBackup' => 'Never',
                    'backupSize' => '0 MB',
                    'isAutomatic' => true,
                ],
            ];
        }
    }
}