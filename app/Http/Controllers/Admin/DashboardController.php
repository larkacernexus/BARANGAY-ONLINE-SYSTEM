<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {


      if (!auth()->user()->hasPermission('view-dashboard')) {
            abort(403, 'You do not have permission to view the dashboard.');
        }
        
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Get statistics with proper calculations
        $stats = [
            'totalResidents' => Resident::count(),
            'totalHouseholds' => Household::count(),
            'monthlyCollections' => Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed')
                ->sum('total_amount'),
            'pendingClearances' => ClearanceRequest::where('status', 'pending')->count(),
        ];

        // Get recent activities with formatted data
        $recentActivities = [
            'newResidents' => Resident::with('household')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($resident) {
                    return [
                        'id' => $resident->id,
                        'name' => $resident->first_name . ' ' . $resident->last_name,
                        'created_at' => $resident->created_at->format('Y-m-d H:i:s'),
                        'household_number' => $resident->household?->household_number,
                    ];
                }),
                
            'recentPayments' => Payment::with(['resident', 'recorder'])
                ->where('status', 'completed')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'payer_name' => $payment->resident ? 
                            $payment->resident->first_name . ' ' . $payment->resident->last_name : 
                            $payment->payer_name,
                        'total_amount' => $payment->total_amount,
                        'payment_date' => $payment->payment_date ? 
                            Carbon::parse($payment->payment_date)->format('Y-m-d H:i:s') : 
                            $payment->created_at->format('Y-m-d H:i:s'),
                        'payment_method' => $payment->payment_method,
                        'certificate_type' => $payment->certificate_type,
                    ];
                }),
                
            'recentClearanceRequests' => ClearanceRequest::with(['resident', 'clearanceType'])
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
                }),
        ];

        // Get activity stats
        $activityStats = [
            'newResidentsToday' => Resident::whereDate('created_at', $today)->count(),
            'paymentsToday' => Payment::whereDate('payment_date', $today)
                ->where('status', 'completed')
                ->count(),
            'clearanceRequestsToday' => ClearanceRequest::whereDate('created_at', $today)->count(),
            'totalActivitiesThisWeek' => Resident::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count() +
                Payment::whereBetween('payment_date', [$startOfWeek, $endOfWeek])
                    ->where('status', 'completed')
                    ->count() +
                ClearanceRequest::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count(),
        ];

        return Inertia::render('admin/Dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'paymentStats' => $this->getPaymentStats(),
            'clearanceRequestStats' => $this->getClearanceRequestStats(),
            'clearanceTypeStats' => $this->getClearanceTypeStats(),
            'collectionStats' => $this->getCollectionStats(),
            'activityStats' => $activityStats,
            'storageStats' => $this->getStorageStats(),
        ]);
    }

    private function getPaymentStats()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        // Get payment stats by certificate type
$certificateStats = Payment::with(['items.clearanceRequest.clearanceType'])
    ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
    ->where('status', 'completed')
    ->get()
    ->flatMap(function ($payment) {
        return $payment->items->map(function ($item) use ($payment) {
            if ($item->clearanceRequest && $item->clearanceRequest->clearanceType) {
                return [
                    'type' => $item->clearanceRequest->clearanceType->name,
                    'original_type' => $item->clearanceRequest->clearanceType->code,
                    'count' => 1,
                    'amount' => $item->total_amount
                ];
            }
            return null;
        })->filter();
    })
    ->groupBy('original_type')
    ->map(function ($items, $typeCode) {
        $first = $items->first();
        return [
            'type' => $first['type'] ?? $typeCode,
            'original_type' => $typeCode,
            'count' => $items->count(),
            'amount' => number_format($items->sum('amount'), 2)
        ];
    })
    ->values();

        // Get payment stats by payment method
        $methodStats = Payment::selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as total')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'completed')
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                $methodDisplay = match($item->payment_method) {
                    'cash' => 'Cash',
                    'gcash' => 'GCash',
                    'bank_transfer' => 'Bank Transfer',
                    'check' => 'Check',
                    'paymaya' => 'PayMaya',
                    default => ucfirst($item->payment_method)
                };
                
                return [
                    'method' => $methodDisplay,
                    'original_method' => $item->payment_method,
                    'count' => (int)$item->count,
                    'amount' => number_format($item->total ?? 0, 2)
                ];
            });

        // Get daily collections for the current week
        $dailyCollections = [];
        $currentDay = $startOfWeek->copy();
        
        while ($currentDay <= $endOfWeek) {
            $dayTotal = Payment::whereDate('payment_date', $currentDay)
                ->where('status', 'completed')
                ->sum('total_amount');
                
            $dailyCollections[] = [
                'date' => $currentDay->format('Y-m-d'),
                'day' => $currentDay->format('D'),
                'count' => Payment::whereDate('payment_date', $currentDay)
                    ->where('status', 'completed')
                    ->count(),
                'amount' => number_format($dayTotal ?? 0, 2)
            ];
            
            $currentDay->addDay();
        }

        return [
            'byCertificateType' => $certificateStats,
            'byPaymentMethod' => $methodStats,
            'dailyCollections' => $dailyCollections,
        ];
    }

    private function getClearanceRequestStats()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Get clearance request statistics by type
        $clearanceRequestStats = ClearanceRequest::selectRaw('clearance_type_id, COUNT(*) as count')
            ->with('clearanceType')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->groupBy('clearance_type_id')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->clearanceType?->name ?? 'Unknown Type',
                    'original_type' => $item->clearance_type_id,
                    'count' => (int)$item->count
                ];
            });

        // Get clearance request status breakdown
        $statusStats = ClearanceRequest::selectRaw('status, COUNT(*) as count')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
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
            });

        // Get urgency breakdown
        $urgencyStats = ClearanceRequest::selectRaw('urgency, COUNT(*) as count')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->groupBy('urgency')
            ->get()
            ->map(function ($item) {
                $urgencyDisplay = match($item->urgency) {
                    'urgent' => 'Urgent',
                    'normal' => 'Normal',
                    'low' => 'Low Priority',
                    default => ucfirst($item->urgency)
                };
                
                return [
                    'urgency' => $urgencyDisplay,
                    'original_urgency' => $item->urgency,
                    'count' => (int)$item->count
                ];
            });

        return [
            'byType' => $clearanceRequestStats,
            'byStatus' => $statusStats,
            'byUrgency' => $urgencyStats,
        ];
    }

    private function getClearanceTypeStats()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Get all clearance types with counts
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->get()
            ->map(function ($type) use ($startOfMonth, $endOfMonth) {
                $totalRequests = ClearanceRequest::where('clearance_type_id', $type->id)->count();
                $monthlyRequests = ClearanceRequest::where('clearance_type_id', $type->id)
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
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
                    'monthly_requests' => $monthlyRequests,
                    'is_active' => $type->is_active,
                ];
            });

        return $clearanceTypes;
    }

    private function getCollectionStats()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $startOfYear = Carbon::now()->startOfYear();
        $endOfYear = Carbon::now()->endOfYear();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Get today's collections
        $todayCollections = Payment::whereDate('payment_date', $today)
            ->where('status', 'completed')
            ->sum('total_amount');

        // Get yesterday's collections
        $yesterdayCollections = Payment::whereDate('payment_date', $yesterday)
            ->where('status', 'completed')
            ->sum('total_amount');

        // Get this week's collections
        $weeklyCollections = Payment::whereBetween('payment_date', [$startOfWeek, $endOfWeek])
            ->where('status', 'completed')
            ->sum('total_amount');

        // Get this year's collections
        $yearlyCollections = Payment::whereBetween('payment_date', [$startOfYear, $endOfYear])
            ->where('status', 'completed')
            ->sum('total_amount');

        // Calculate daily average for current month
        $daysInMonth = Carbon::now()->daysInMonth;
        $currentDay = Carbon::now()->day;
        $monthlyCollections = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'completed')
            ->sum('total_amount');
        $dailyAvg = $monthlyCollections / max(1, $currentDay);

        // Calculate weekly average
        $currentDayOfWeek = Carbon::now()->dayOfWeekIso; // 1 (Monday) to 7 (Sunday)
        $weeklyAvg = $weeklyCollections / max(1, $currentDayOfWeek);

        return [
            'today' => number_format($todayCollections ?? 0, 2),
            'yesterday' => number_format($yesterdayCollections ?? 0, 2),
            'weekly' => number_format($weeklyCollections ?? 0, 2),
            'yearly' => number_format($yearlyCollections ?? 0, 2),
            'dailyAvg' => number_format($dailyAvg ?? 0, 2),
            'weeklyAvg' => number_format($weeklyAvg ?? 0, 2),
        ];
    }

    /**
     * Get ACTUAL storage statistics based on database size
     * Based on phpMyAdmin data: 2.2 MiB total, 39 tables, 387 rows
     */
    private function getStorageStats()
    {
        try {
            // Get actual counts from your database
            $residentCount = Resident::count();
            $householdCount = Household::count();
            $paymentCount = Payment::count();
            $clearanceCount = ClearanceRequest::count();
            
            // Get database name
            $databaseName = config('database.connections.mysql.database');
            
            // Query actual database size from information_schema
            $dbSizeQuery = DB::select("
                SELECT 
                    SUM(data_length + index_length) / 1024 / 1024 AS size_mb,
                    SUM(table_rows) AS total_rows,
                    COUNT(*) AS table_count
                FROM information_schema.tables 
                WHERE table_schema = ?
            ", [$databaseName]);
            
            $dbSize = $dbSizeQuery[0] ?? null;
            
            // File storage calculation
            $fileStorageSizeMB = 0;
            $hasFileStorage = false;
            $fileCount = 0;
            
            try {
                if (Storage::exists('public')) {
                    $hasFileStorage = true;
                    $allFiles = Storage::allFiles('public');
                    $fileCount = count($allFiles);
                    $totalSizeBytes = 0;
                    
                    foreach ($allFiles as $file) {
                        try {
                            $totalSizeBytes += Storage::size($file);
                        } catch (\Exception $e) {
                            continue;
                        }
                    }
                    
                    $fileStorageSizeMB = $totalSizeBytes / (1024 * 1024); // Convert bytes to MB
                }
            } catch (\Exception $e) {
                // If file storage check fails, continue without files
            }
            
            // Get sizes of major tables with type casting
            $majorTables = ['residents', 'households', 'payments', 'clearance_requests', 'users'];
            $tableSizes = [];
            
            foreach ($majorTables as $table) {
                $tableSizeQuery = DB::select("
                    SELECT 
                        table_name,
                        ROUND((data_length + index_length) / 1024, 2) AS size_kb,
                        table_rows
                    FROM information_schema.tables 
                    WHERE table_schema = ? AND table_name = ?
                ", [$databaseName, $table]);
                
                if ($tableSizeQuery && isset($tableSizeQuery[0])) {
                    $tableData = $tableSizeQuery[0];
                    $tableSizes[$table] = [
                        'size_kb' => (float)($tableData->size_kb ?? 0), // Cast to float
                        'rows' => (int)($tableData->table_rows ?? 0) // Cast to int
                    ];
                }
            }
            
            // Total used storage (database + files)
            $databaseSizeMB = $dbSize ? round($dbSize->size_mb, 2) : 2.2;
            $totalUsedMB = round($databaseSizeMB + $fileStorageSizeMB, 2);
            
            // Storage allocation - 2GB (2048MB) for barangay system
            $totalStorageMB = 2048;
            
            // Calculate percentage (ensure minimum 0.1% for visibility)
            $percentage = ($totalUsedMB / $totalStorageMB) * 100;
            $percentage = max(0.1, round($percentage, 1));
            
            // Calculate breakdown percentages
            if ($totalUsedMB > 0) {
                $databasePercentage = round(($databaseSizeMB / $totalUsedMB) * 100, 1);
                $filesPercentage = round(($fileStorageSizeMB / $totalUsedMB) * 100, 1);
                
                // Ensure total adds up to 100%
                if (($databasePercentage + $filesPercentage) !== 100) {
                    $databasePercentage = 100 - $filesPercentage;
                }
            } else {
                $databasePercentage = 100;
                $filesPercentage = 0;
            }
            
            return [
                'totalUsedMB' => $totalUsedMB,
                'totalStorageMB' => $totalStorageMB,
                'percentage' => $percentage,
                'breakdown' => [
                    'database' => $databasePercentage,
                    'files' => $filesPercentage,
                ],
                'details' => [
                    'databaseSizeMB' => $databaseSizeMB,
                    'fileStorageSizeMB' => round($fileStorageSizeMB, 2),
                    'fileCount' => $fileCount,
                    'hasStorageFiles' => $hasFileStorage,
                    'residentCount' => $residentCount,
                    'householdCount' => $householdCount,
                    'paymentCount' => $paymentCount,
                    'clearanceCount' => $clearanceCount,
                    'totalRows' => (int)($dbSize->total_rows ?? ($residentCount + $householdCount + $paymentCount + $clearanceCount)),
                    'tableCount' => (int)($dbSize->table_count ?? 39),
                    'tableSizes' => $tableSizes
                ]
            ];
            
        } catch (\Exception $e) {
            // Fallback to values from phpMyAdmin data if query fails
            return [
                'totalUsedMB' => 2.2,
                'totalStorageMB' => 2048,
                'percentage' => 0.1,
                'breakdown' => [
                    'database' => 100,
                    'files' => 0,
                ],
                'details' => [
                    'databaseSizeMB' => 2.2,
                    'fileStorageSizeMB' => 0,
                    'fileCount' => 0,
                    'hasStorageFiles' => false,
                    'residentCount' => Resident::count(),
                    'householdCount' => Household::count(),
                    'paymentCount' => Payment::count(),
                    'clearanceCount' => ClearanceRequest::count(),
                    'totalRows' => 387,
                    'tableCount' => 39,
                    'tableSizes' => []
                ]
            ];
        }
    }
}