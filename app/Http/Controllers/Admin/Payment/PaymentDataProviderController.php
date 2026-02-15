<?php

namespace App\Http\Controllers\Admin;

use App\Models\Resident;
use App\Models\Household;
use App\Models\Fee;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentDataProviderController extends PaymentBaseController
{
    public function getOutstandingFees(Request $request)
    {
        $request->validate([
            'payer_type' => 'required|in:resident,household',
            'payer_id' => 'required|integer',
        ]);

        $payerType = $request->input('payer_type');
        $payerId = $request->input('payer_id');

        $fees = Fee::with(['feeType'])
            ->where('payer_type', $payerType)
            ->where($payerType . '_id', $payerId)
            ->where('balance', '>', 0)
            ->whereIn('status', ['pending', 'issued', 'partially_paid', 'overdue'])
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(fn($fee) => $this->formatOutstandingFee($fee));

        $totalBalance = $fees->sum('balance');
        $totalCount = $fees->count();

        return response()->json([
            'success' => true,
            'fees' => $fees,
            'summary' => [
                'total_outstanding_balance' => floatval($totalBalance),
                'total_outstanding_fees' => $totalCount,
                'has_outstanding_fees' => $totalCount > 0,
            ]
        ]);
    }

    public function getClearanceTypes()
    {
        $clearanceTypes = ClearanceType::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($type) => $this->formatClearanceType($type));

        return response()->json($clearanceTypes);
    }

    public function getPaymentStatistics(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth());
        $dateTo = $request->input('date_to', now()->endOfMonth());

        $stats = [
            'total_payments' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->count(),
            'total_amount' => Payment::whereBetween('payment_date', [$dateFrom, $dateTo])->sum('total_amount'),
            'by_method' => $this->getPaymentsByMethod($dateFrom, $dateTo),
            'by_category' => $this->getPaymentsByCategory($dateFrom, $dateTo),
            'daily_trend' => $this->getDailyTrend($dateFrom, $dateTo),
            'clearance_payments' => $this->getClearancePaymentStats($dateFrom, $dateTo),
            'by_clearance_type' => $this->getPaymentsByClearanceType($dateFrom, $dateTo),
        ];

        return response()->json($stats);
    }

    // Private formatting methods...
}