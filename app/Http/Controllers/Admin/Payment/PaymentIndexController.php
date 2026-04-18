<?php
// app/Http/Controllers/Admin/Payment/PaymentIndexController.php

namespace App\Http\Controllers\Admin\Payment;

use App\Http\Controllers\Admin\BasePaymentController;
use App\Models\Payment;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PaymentIndexController extends BasePaymentController
{
    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        $query = Payment::with([
                'items', 
                'recorder', 
                'items.clearanceRequest.clearanceType'
            ])
            ->orderBy('payment_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Apply filters
        $this->applyFilters($query, $request);

        $payments = $query->paginate(20)->withQueryString();

        // Get clearance types for filter
        $clearanceTypes = $this->getClearanceTypesForFilter();

        // Calculate statistics (cached for 5 minutes)
        $stats = Cache::remember('payments.statistics', 300, function () {
            return $this->calculateStatistics();
        });

        Log::info('Payments index (Server-Side)', [
            'total_payments' => $payments->total(),
            'current_page' => $payments->currentPage(),
            'filters_applied' => $request->only(['search', 'status', 'payment_method', 'payer_type'])
        ]);

        return Inertia::render('admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only([
                'search', 'status', 'payment_method', 'date_from', 'date_to', 
                'payer_type', 'clearance_type_id', 'clearance_request_id'
            ]),
            'clearanceTypes' => $clearanceTypes,
            'stats' => $stats,
            'hasClearanceTypes' => $clearanceTypes->count() > 0,
        ]);
    }

    /**
     * Apply filters to query
     */
    private function applyFilters($query, Request $request): void
    {
        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('household_number', 'like', "%{$search}%");
            });
        }

        // Status filter - FIXED: Skip 'all' value
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Payment method filter - FIXED: Skip 'all' value
        if ($request->filled('payment_method') && $request->input('payment_method') !== 'all') {
            $query->where('payment_method', $request->input('payment_method'));
        }

        // Date range filters
        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->input('date_to'));
        }

        // Payer type filter - FIXED: Skip 'all' value
        if ($request->filled('payer_type') && $request->input('payer_type') !== 'all') {
            $query->where('payer_type', $request->input('payer_type'));
        }

        // Clearance type filter - FIXED: Skip 'all' value and validate numeric
        if ($request->filled('clearance_type_id') && $request->input('clearance_type_id') !== 'all') {
            $clearanceTypeId = $request->input('clearance_type_id');
            
            // Only apply if it's a valid numeric ID
            if (is_numeric($clearanceTypeId) && $clearanceTypeId > 0) {
                $query->whereHas('items.clearanceRequest', function ($q) use ($clearanceTypeId) {
                    $q->where('clearance_type_id', $clearanceTypeId);
                });
            }
        }

        // Clearance request filter - FIXED: Validate numeric
        if ($request->filled('clearance_request_id')) {
            $clearanceRequestId = $request->input('clearance_request_id');
            
            // Only apply if it's a valid numeric ID
            if (is_numeric($clearanceRequestId) && $clearanceRequestId > 0) {
                $query->whereHas('items', function ($q) use ($clearanceRequestId) {
                    $q->where('clearance_request_id', $clearanceRequestId);
                });
            }
        }
    }

    /**
     * Get clearance types for filter dropdown
     */
    private function getClearanceTypesForFilter()
    {
        return Cache::remember('clearance.types.active', 3600, function () {
            return ClearanceType::where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'name' => $type->name,
                        'code' => $type->code ?? strtoupper(str_replace(' ', '_', $type->name)),
                        'fee' => floatval($type->fee),
                    ];
                });
        });
    }

    /**
     * Calculate payment statistics
     */
    private function calculateStatistics(): array
    {
        return [
            'total' => Payment::count(),
            'today' => Payment::whereDate('payment_date', today())->count(),
            'monthly' => Payment::whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->count(),
            'total_amount' => (float) Payment::sum('amount_paid'),
            'today_amount' => (float) Payment::whereDate('payment_date', today())->sum('amount_paid'),
            'monthly_amount' => (float) Payment::whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount_paid'),
            'clearance_payments' => Payment::whereHas('items', function ($q) {
                $q->whereNotNull('clearance_request_id');
            })->count(),
            'clearance_amount' => (float) Payment::whereHas('items', function ($q) {
                $q->whereNotNull('clearance_request_id');
            })->sum('amount_paid'),
            'pending_count' => Payment::where('status', 'pending')->count(),
            'completed_count' => Payment::where('status', 'completed')->count(),
            'cancelled_count' => Payment::where('status', 'cancelled')->count(),
        ];
    }

    /**
     * Get payment statistics (API endpoint)
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', now()->endOfMonth()->toDateString());

        $stats = [
            'total_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->count(),
            'total_amount' => (float) Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->sum('total_amount'),
            'by_method' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('payment_method')
                ->get()
                ->map(fn($item) => [
                    'method' => $item->payment_method,
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ]),
            'by_category' => \App\Models\PaymentItem::whereHas('payment', function ($query) use ($dateFrom, $dateTo) {
                    $query->whereBetween('payment_date', [$dateFrom, $dateTo]);
                })
                ->select('category', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('category')
                ->get()
                ->map(fn($item) => [
                    'category' => $item->category,
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ]),
            'daily_trend' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->select(DB::raw('DATE(payment_date) as date'), DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy(DB::raw('DATE(payment_date)'))
                ->orderBy('date')
                ->get()
                ->map(fn($item) => [
                    'date' => $item->date,
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ]),
            'clearance_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereHas('items', function ($q) {
                    $q->whereNotNull('clearance_request_id');
                })
                ->count(),
            'clearance_amount' => (float) Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereHas('items', function ($q) {
                    $q->whereNotNull('clearance_request_id');
                })
                ->sum('total_amount'),
        ];

        return response()->json($stats);
    }

    /**
     * Clear payment cache (call this when payments are created/updated/deleted)
     */
    public function clearCache()
    {
        Cache::forget('payments.statistics');
        Cache::forget('clearance.types.active');
        
        return response()->json(['message' => 'Payment cache cleared successfully']);
    }
}