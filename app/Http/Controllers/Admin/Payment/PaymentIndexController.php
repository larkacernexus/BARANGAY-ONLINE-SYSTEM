<?php
// app/Http/Controllers/Admin/Payment/PaymentIndexController.php

namespace App\Http\Controllers\Admin\Payment;

use App\Http\Controllers\Admin\BasePaymentController;
use App\Models\Payment;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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

        // Calculate statistics
        $stats = $this->calculateStatistics();

        return Inertia::render('admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to', 'payer_type', 'clearance_type_id', 'clearance_request_id']),
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

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('payer_type')) {
            $query->where('payer_type', $request->input('payer_type'));
        }

        if ($request->filled('clearance_type_id')) {
            $clearanceTypeId = $request->input('clearance_type_id');
            $query->whereHas('items.clearanceRequest', function ($q) use ($clearanceTypeId) {
                $q->where('clearance_type_id', $clearanceTypeId);
            });
        }

        if ($request->filled('clearance_request_id')) {
            $clearanceRequestId = $request->input('clearance_request_id');
            $query->whereHas('items', function ($q) use ($clearanceRequestId) {
                $q->where('clearance_request_id', $clearanceRequestId);
            });
        }
    }

    /**
     * Get clearance types for filter dropdown
     */
    private function getClearanceTypesForFilter()
    {
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
    }

    /**
     * Calculate payment statistics
     */
    private function calculateStatistics(): array
    {
        return [
            'total' => Payment::count(),
            'today' => Payment::whereDate('payment_date', today())->count(),
            'monthly' => Payment::whereMonth('payment_date', now()->month)->count(),
            'total_amount' => Payment::sum('amount_paid'),
            'today_amount' => Payment::whereDate('payment_date', today())->sum('amount_paid'),
            'monthly_amount' => Payment::whereMonth('payment_date', now()->month)->sum('amount_paid'),
            'clearance_payments' => Payment::whereHas('items', function ($q) {
                $q->whereNotNull('clearance_request_id');
            })->count(),
            'clearance_amount' => Payment::whereHas('items', function ($q) {
                $q->whereNotNull('clearance_request_id');
            })->sum('amount_paid'),
        ];
    }

    /**
     * Get payment statistics (API endpoint)
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth());
        $dateTo = $request->input('date_to', now()->endOfMonth());

        $stats = [
            'total_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->count(),
            'total_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->sum('total_amount'),
            'by_method' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('payment_method')
                ->get(),
            'by_category' => \App\Models\PaymentItem::whereHas('payment', function ($query) use ($dateFrom, $dateTo) {
                    $query->whereBetween('payment_date', [$dateFrom, $dateTo]);
                })
                ->select('category', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy('category')
                ->get(),
            'daily_trend' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->select(DB::raw('DATE(payment_date) as date'), DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
                ->groupBy(DB::raw('DATE(payment_date)'))
                ->orderBy('date')
                ->get(),
            'clearance_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereHas('items', function ($q) {
                    $q->whereNotNull('clearance_request_id');
                })
                ->count(),
            'clearance_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->whereHas('items', function ($q) {
                    $q->whereNotNull('clearance_request_id');
                })
                ->sum('total_amount'),
        ];

        return response()->json($stats);
    }
}