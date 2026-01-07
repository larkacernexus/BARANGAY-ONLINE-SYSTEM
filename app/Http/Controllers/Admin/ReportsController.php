<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use DateInterval;

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
        
        // Get all payments in date range
        $payments = Payment::whereBetween('payment_date', [$startDate, $endDate])
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
                'percentage' => 0, // Will calculate below
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
        
        // Calculate stats
        $totalCollections = $totalAmount;
        $averageDaily = $collectionsByDate->count() > 0 ? $totalCollections / $collectionsByDate->count() : 0;
        $highestDay = $collectionsByDate->max('total_amount') ?? 0;
        $totalTransactions = $payments->count();
        
        return Inertia::render('admin/Reports/Collections', [
            'collections' => $chartData,
            'categories' => $categories,
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
     * Display revenue analytics
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
        
        // Get payments in date range
        $payments = Payment::whereBetween('payment_date', [$startDate, $endDate])->get();
        
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
                return 'Week ' . ceil($payment->payment_date->day / 7);
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
        
        // Calculate growth percentage - FIXED: Use proper DateInterval
        $previousRevenue = 0;
        $currentRevenue = $payments->sum('total_amount');
        
        // Define intervals for different periods
        $intervals = [
            'day' => new DateInterval('P1D'),
            'week' => new DateInterval('P1W'),
            'month' => new DateInterval('P1M'),
            'year' => new DateInterval('P1Y'),
        ];
        
        if (isset($intervals[$period])) {
            $previousPeriodStart = $startDate->copy()->sub($intervals[$period]);
            $previousPeriodEnd = $endDate->copy()->sub($intervals[$period]);
            
            $previousRevenue = Payment::whereBetween('payment_date', [$previousPeriodStart, $previousPeriodEnd])
                ->sum('total_amount');
        }
        
        $growthPercentage = $previousRevenue > 0 
            ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 
            : ($currentRevenue > 0 ? 100 : 0);
        
        return Inertia::render('admin/Reports/Revenue', [
            'revenueData' => $revenueData->values(),
            'revenueByMethod' => $revenueByMethod,
            'stats' => [
                'totalRevenue' => $currentRevenue,
                'growthPercentage' => round($growthPercentage, 1),
                'averageTransaction' => $payments->count() > 0 ? round($currentRevenue / $payments->count(), 2) : 0,
                'totalTransactions' => $payments->count(),
            ],
            'filters' => [
                'period' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
        ]);
    }
}