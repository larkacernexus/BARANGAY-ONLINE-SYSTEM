<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClearanceIndexController extends Controller
{
    public function __invoke(Request $request)
    {
        $query = ClearanceRequest::query()
            ->with(['resident', 'household', 'business', 'clearanceType', 'issuingOfficer', 'payment'])
            ->latest();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('clearance_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhereHas('resident', function ($q) use ($search) {
                      $q->where(DB::raw("CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name)"), 'like', "%{$search}%");
                  })
                  ->orWhereHas('household', function ($q) use ($search) {
                      $q->where('household_number', 'like', "%{$search}%")
                        ->orWhere('head_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('business', function ($q) use ($search) {
                      $q->where('business_name', 'like', "%{$search}%")
                        ->orWhere('owner_name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Payment status filter
        if ($payment_status = $request->input('payment_status')) {
            $query->where('payment_status', $payment_status);
        }

        // Type filter
        if ($type = $request->input('type')) {
            $query->where('clearance_type_id', $type);
        }

        // Get paginated results
        $clearances = $query->paginate(20)->through(function ($clearance) {
            return $this->formatClearance($clearance);
        });

        // Get stats
        $stats = $this->getStats();

        // Get clearance types
        $clearanceTypes = $this->getClearanceTypes();

        // Status options for filter
        $statusOptions = [
            ['value' => 'pending', 'label' => 'Pending Review'],
            ['value' => 'pending_payment', 'label' => 'Pending Payment'],
            ['value' => 'processing', 'label' => 'Under Processing'],
            ['value' => 'approved', 'label' => 'Approved'],
            ['value' => 'issued', 'label' => 'Issued'],
            ['value' => 'rejected', 'label' => 'Rejected'],
            ['value' => 'cancelled', 'label' => 'Cancelled'],
            ['value' => 'expired', 'label' => 'Expired'],
        ];

        $paymentStatusOptions = [
            ['value' => 'unpaid', 'label' => 'Unpaid'],
            ['value' => 'partially_paid', 'label' => 'Partially Paid'],
            ['value' => 'paid', 'label' => 'Paid'],
        ];

        return Inertia::render('admin/Clearances/Index', [
            'clearances' => $clearances,
            'stats' => $stats,
            'clearanceTypes' => $clearanceTypes,
            'filters' => $request->only(['search', 'status', 'type', 'payment_status']),
            'statusOptions' => $statusOptions,
            'paymentStatusOptions' => $paymentStatusOptions,
        ]);
    }

    protected function formatClearance($clearance)
    {
        return array_merge(
            $clearance->toArray(),
            [
                'payer_type' => $clearance->payer_type,
                'payer_id' => $clearance->payer_id,
                'payer_display' => $clearance->payer_display,
                'resident' => $clearance->resident ? [
                    'id' => $clearance->resident->id,
                    'full_name' => $clearance->resident->full_name,
                    'contact_number' => $clearance->resident->contact_number,
                ] : null,
                'household' => $clearance->household ? [
                    'id' => $clearance->household->id,
                    'household_number' => $clearance->household->household_number,
                    'head_name' => $clearance->household->head_name,
                ] : null,
                'business' => $clearance->business ? [
                    'id' => $clearance->business->id,
                    'business_name' => $clearance->business->business_name,
                ] : null,
                'clearance_type' => $clearance->clearanceType ? [
                    'id' => $clearance->clearanceType->id,
                    'name' => $clearance->clearanceType->name,
                ] : null,
                'payment' => $clearance->payment ? [
                    'id' => $clearance->payment->id,
                    'or_number' => $clearance->payment->or_number,
                    'amount_paid' => $clearance->payment->amount_paid,
                ] : null,
                'status_display' => $clearance->status_display,
                'payment_status_display' => $clearance->payment_status_display,
                'formatted_fee' => $clearance->formatted_fee,
                'is_fully_paid' => $clearance->is_fully_paid,
                'created_at' => $clearance->created_at->toDateTimeString(),
            ]
        );
    }

    protected function getStats()
    {
        return [
            'total' => ClearanceRequest::count(),
            'totalIssued' => ClearanceRequest::where('status', 'issued')->count(),
            'issuedThisMonth' => ClearanceRequest::where('status', 'issued')
                ->whereMonth('issue_date', now()->month)
                ->whereYear('issue_date', now()->year)
                ->count(),
            'pending' => ClearanceRequest::where('status', 'pending')->count(),
            'pendingToday' => ClearanceRequest::where('status', 'pending')
                ->whereDate('created_at', today())
                ->count(),
            'expiringSoon' => ClearanceRequest::where('status', 'issued')
                ->where('valid_until', '<=', now()->addDays(30))
                ->where('valid_until', '>', now())
                ->count(),
            'totalRevenue' => (float) ClearanceRequest::where('status', 'issued')
                ->sum('amount_paid'),
            'unpaid' => ClearanceRequest::where('payment_status', 'unpaid')->count(),
            'partially_paid' => ClearanceRequest::where('payment_status', 'partially_paid')->count(),
            'paid' => ClearanceRequest::where('payment_status', 'paid')->count(),
            'pending_payment' => ClearanceRequest::where('status', 'pending_payment')->count(),
        ];
    }

    protected function getClearanceTypes()
    {
        return ClearanceType::active()
            ->withCount(['clearanceRequests'])
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'fee' => (float) $type->fee,
                    'formatted_fee' => $type->formatted_fee,
                    'requires_payment' => (bool) $type->requires_payment,
                ];
            });
    }
}