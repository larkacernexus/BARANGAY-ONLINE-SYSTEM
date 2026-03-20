<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ClearanceReportController extends Controller
{
    /**
     * Generate issued clearances report.
     */
    public function issued(Request $request)
    {
        $query = ClearanceRequest::query()
            ->with(['clearanceType', 'resident', 'household', 'business'])
            ->where('status', 'issued');

        // Date range filter
        if ($request->filled('from_date')) {
            $query->whereDate('issue_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('issue_date', '<=', $request->to_date);
        }

        // Clearance type filter
        if ($request->filled('clearance_type_id')) {
            $query->where('clearance_type_id', $request->clearance_type_id);
        }

        // Payer type filter
        if ($request->filled('payer_type')) {
            $query->where('payer_type', $request->payer_type);
        }

        // Get paginated results
        $clearances = $query->orderBy('issue_date', 'desc')
            ->paginate(20)
            ->through(fn($clearance) => [
                'id' => $clearance->id,
                'reference_number' => $clearance->reference_number,
                'clearance_number' => $clearance->clearance_number,
                'clearance_type' => $clearance->clearanceType?->name,
                'payer_name' => $clearance->payer_name,
                'payer_type' => $clearance->payer_type_label,
                'issue_date' => $clearance->issue_date?->format('Y-m-d'),
                'valid_until' => $clearance->valid_until?->format('Y-m-d'),
                'fee_amount' => $clearance->fee_amount,
                'formatted_fee' => $clearance->formatted_fee,
                'amount_paid' => $clearance->amount_paid,
                'purpose' => $clearance->purpose,
                'issuing_officer' => $clearance->issuing_officer_name,
            ]);

        // Get summary statistics
        $summary = $this->getIssuedSummary($request);

        // Get clearance types for filter dropdown
        $clearanceTypes = ClearanceType::active()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('admin/Clearances/Reports/Issued', [
            'clearances' => $clearances,
            'summary' => $summary,
            'clearanceTypes' => $clearanceTypes,
            'filters' => $request->only(['from_date', 'to_date', 'clearance_type_id', 'payer_type']),
        ]);
    }

    /**
     * Generate monthly summary report.
     */
    public function monthly(Request $request)
    {
        $year = $request->input('year', now()->year);
        
        $monthlyData = ClearanceRequest::where('status', 'issued')
            ->whereYear('issue_date', $year)
            ->select(
                DB::raw('MONTH(issue_date) as month'),
                DB::raw('COUNT(*) as total_issued'),
                DB::raw('SUM(fee_amount) as total_revenue'),
                DB::raw('AVG(fee_amount) as average_fee')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'month_name' => date('F', mktime(0, 0, 0, $item->month, 1)),
                'total_issued' => $item->total_issued,
                'total_revenue' => (float) $item->total_revenue,
                'formatted_revenue' => '₱' . number_format($item->total_revenue, 2),
                'average_fee' => (float) $item->average_fee,
            ]);

        // Get breakdown by clearance type
        $typeBreakdown = ClearanceRequest::where('status', 'issued')
            ->whereYear('issue_date', $year)
            ->select(
                'clearance_type_id',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(fee_amount) as revenue')
            )
            ->with('clearanceType:id,name,code')
            ->groupBy('clearance_type_id')
            ->get()
            ->map(fn($item) => [
                'clearance_type' => $item->clearanceType?->name ?? 'Unknown',
                'code' => $item->clearanceType?->code,
                'total' => $item->total,
                'revenue' => (float) $item->revenue,
                'formatted_revenue' => '₱' . number_format($item->revenue, 2),
            ]);

        $years = ClearanceRequest::where('status', 'issued')
            ->select(DB::raw('YEAR(issue_date) as year'))
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('admin/Clearances/Reports/Monthly', [
            'monthlyData' => $monthlyData,
            'typeBreakdown' => $typeBreakdown,
            'year' => $year,
            'years' => $years,
            'summary' => [
                'total_issued' => $monthlyData->sum('total_issued'),
                'total_revenue' => $monthlyData->sum('total_revenue'),
                'formatted_total_revenue' => '₱' . number_format($monthlyData->sum('total_revenue'), 2),
                'average_monthly' => $monthlyData->avg('total_issued'),
            ],
        ]);
    }

    /**
     * Generate clearance type performance report.
     */
    public function typePerformance(Request $request)
    {
        $year = $request->input('year', now()->year);
        
        $performance = ClearanceType::active()
            ->withCount(['clearanceRequests' => function ($query) use ($year) {
                $query->whereYear('created_at', $year);
            }])
            ->withCount(['clearanceRequests as issued_count' => function ($query) use ($year) {
                $query->where('status', 'issued')->whereYear('issue_date', $year);
            }])
            ->withSum(['clearanceRequests as revenue' => function ($query) use ($year) {
                $query->where('status', 'issued')->whereYear('issue_date', $year);
            }], 'fee_amount')
            ->orderBy('name')
            ->get()
            ->map(fn($type) => [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'fee' => $type->fee,
                'formatted_fee' => $type->formatted_fee,
                'total_requests' => $type->clearance_requests_count,
                'issued_count' => $type->issued_count,
                'approval_rate' => $type->clearance_requests_count > 0 
                    ? round(($type->issued_count / $type->clearance_requests_count) * 100, 2)
                    : 0,
                'revenue' => (float) $type->revenue,
                'formatted_revenue' => '₱' . number_format($type->revenue ?? 0, 2),
            ]);

        $years = ClearanceRequest::select(DB::raw('YEAR(created_at) as year'))
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('admin/Clearances/Reports/TypePerformance', [
            'performance' => $performance,
            'year' => $year,
            'years' => $years,
        ]);
    }

    /**
     * Generate payment summary report.
     */
    public function paymentSummary(Request $request)
    {
        $query = ClearanceRequest::query()
            ->where('status', 'issued')
            ->where('fee_amount', '>', 0);

        if ($request->filled('from_date')) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        $payments = $query->select(
            'payment_status',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(fee_amount) as total_fees'),
            DB::raw('SUM(amount_paid) as total_paid'),
            DB::raw('SUM(balance) as total_balance')
        )
        ->groupBy('payment_status')
        ->get()
        ->map(fn($item) => [
            'status' => $item->payment_status,
            'status_label' => ucfirst(str_replace('_', ' ', $item->payment_status)),
            'count' => $item->count,
            'total_fees' => (float) $item->total_fees,
            'total_paid' => (float) $item->total_paid,
            'total_balance' => (float) $item->total_balance,
            'formatted_fees' => '₱' . number_format($item->total_fees, 2),
            'formatted_paid' => '₱' . number_format($item->total_paid, 2),
            'formatted_balance' => '₱' . number_format($item->total_balance, 2),
            'collection_rate' => $item->total_fees > 0 
                ? round(($item->total_paid / $item->total_fees) * 100, 2)
                : 0,
        ]);

        $totals = [
            'total_clearances' => $payments->sum('count'),
            'total_fees' => $payments->sum('total_fees'),
            'total_paid' => $payments->sum('total_paid'),
            'total_balance' => $payments->sum('total_balance'),
            'formatted_fees' => '₱' . number_format($payments->sum('total_fees'), 2),
            'formatted_paid' => '₱' . number_format($payments->sum('total_paid'), 2),
            'formatted_balance' => '₱' . number_format($payments->sum('total_balance'), 2),
            'overall_collection_rate' => $payments->sum('total_fees') > 0
                ? round(($payments->sum('total_paid') / $payments->sum('total_fees')) * 100, 2)
                : 0,
        ];

        return Inertia::render('admin/Clearances/Reports/PaymentSummary', [
            'payments' => $payments,
            'totals' => $totals,
            'filters' => $request->only(['from_date', 'to_date']),
        ]);
    }

    /**
     * Export issued clearances report (CSV/Excel).
     */
    public function exportIssued(Request $request)
    {
        $query = ClearanceRequest::with(['clearanceType', 'resident', 'household', 'business'])
            ->where('status', 'issued');

        if ($request->filled('from_date')) {
            $query->whereDate('issue_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('issue_date', '<=', $request->to_date);
        }

        $clearances = $query->orderBy('issue_date', 'desc')->get();

        $headers = [
            'Reference Number',
            'Clearance Number',
            'Clearance Type',
            'Payer Name',
            'Payer Type',
            'Issue Date',
            'Valid Until',
            'Fee Amount',
            'Purpose',
            'Issuing Officer',
        ];

        $data = $clearances->map(fn($c) => [
            $c->reference_number,
            $c->clearance_number,
            $c->clearanceType?->name,
            $c->payer_name,
            $c->payer_type_label,
            $c->issue_date?->format('Y-m-d'),
            $c->valid_until?->format('Y-m-d'),
            $c->fee_amount,
            $c->purpose,
            $c->issuing_officer_name,
        ])->toArray();

        // Generate CSV
        $csvContent = implode(',', $headers) . "\n";
        foreach ($data as $row) {
            $csvContent .= implode(',', array_map(fn($field) => '"' . str_replace('"', '""', $field) . '"', $row)) . "\n";
        }

        $filename = 'issued_clearances_' . now()->format('Y-m-d_His') . '.csv';

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Get summary statistics for issued report.
     */
    private function getIssuedSummary(Request $request)
    {
        $query = ClearanceRequest::where('status', 'issued');

        if ($request->filled('from_date')) {
            $query->whereDate('issue_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('issue_date', '<=', $request->to_date);
        }
        if ($request->filled('clearance_type_id')) {
            $query->where('clearance_type_id', $request->clearance_type_id);
        }
        if ($request->filled('payer_type')) {
            $query->where('payer_type', $request->payer_type);
        }

        $total = $query->count();
        $totalRevenue = $query->sum('fee_amount');
        $averageFee = $total > 0 ? $totalRevenue / $total : 0;

        $byType = $query->clone()
            ->select('clearance_type_id', DB::raw('COUNT(*) as count'))
            ->with('clearanceType:id,name')
            ->groupBy('clearance_type_id')
            ->get()
            ->map(fn($item) => [
                'type' => $item->clearanceType?->name ?? 'Unknown',
                'count' => $item->count,
            ]);

        return [
            'total_issued' => $total,
            'total_revenue' => (float) $totalRevenue,
            'formatted_revenue' => '₱' . number_format($totalRevenue, 2),
            'average_fee' => (float) $averageFee,
            'formatted_average_fee' => '₱' . number_format($averageFee, 2),
            'by_type' => $byType,
        ];
    }
}