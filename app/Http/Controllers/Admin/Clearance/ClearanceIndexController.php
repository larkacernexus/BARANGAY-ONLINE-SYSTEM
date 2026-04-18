<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\ClearanceType;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ClearanceIndexController extends Controller
{
    public function index(Request $request)
    {
        // Build query with eager loading
        $query = ClearanceRequest::query()
            ->with(['resident', 'household', 'business', 'clearanceType', 'issuingOfficer', 'payment']);
        
        // Apply all filters
        $this->applyFilters($query, $request);
        
        // Apply sorting
        $this->applySorting($query, $request);
        
        // Get paginated results
        $clearances = $query->paginate(20)
            ->withQueryString()
            ->through(fn($clearance) => $this->formatClearance($clearance));
        
        // Get stats with caching
        $stats = Cache::remember('clearances.statistics', 300, function () {
            return $this->getStats();
        });
        
        // Get clearance types for filter dropdown
        $clearanceTypes = Cache::remember('clearances.types', 3600, function () {
            return ClearanceType::active()
                ->withCount('clearanceRequests')
                ->orderBy('name')
                ->get()
                ->map(fn($type) => $this->formatClearanceType($type));
        });
        
        // Get options for dropdowns
        $statusOptions = $this->getStatusOptions();
        $paymentStatusOptions = $this->getPaymentStatusOptions();
        $urgencyOptions = [
            ['value' => 'normal', 'label' => 'Normal'],
            ['value' => 'rush', 'label' => 'Rush'],
            ['value' => 'express', 'label' => 'Express'],
        ];
        
        Log::info('Clearances index (Server-Side)', [
            'total' => $clearances->total(),
            'current_page' => $clearances->currentPage(),
            'filters' => $request->only(['search', 'status', 'type', 'payment_status'])
        ]);

        return Inertia::render('admin/Clearances/Index', [
            'clearances' => $clearances,
            'stats' => $stats,
            'clearanceTypes' => $clearanceTypes,
            'filters' => $request->only([
                'search', 
                'status', 
                'type', 
                'payment_status', 
                'urgency', 
                'from_date', 
                'to_date',
                'clearance_number',
                'applicant_type',
                'amount_range',
                'sort_by',
                'sort_order'
            ]),
            'statusOptions' => $statusOptions,
            'paymentStatusOptions' => $paymentStatusOptions,
            'urgencyOptions' => $urgencyOptions,
        ]);
    }

    /**
     * Apply all filters to the query
     */
    private function applyFilters($query, Request $request): void
    {
        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('clearance_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('or_number', 'like', "%{$search}%")
                  ->orWhereHas('resident', function ($q) use ($search) {
                      $q->where(DB::raw("CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name)"), 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('household', function ($q) use ($search) {
                      $q->where('household_number', 'like', "%{$search}%");
                  })
                  ->orWhereHas('business', function ($q) use ($search) {
                      $q->where('business_name', 'like', "%{$search}%");
                  });
            });
        }

        // Clearance Number filter
        if ($clearanceNumber = $request->input('clearance_number')) {
            $query->where(function ($q) use ($clearanceNumber) {
                $q->where('clearance_number', 'like', "%{$clearanceNumber}%")
                  ->orWhere('reference_number', 'like', "%{$clearanceNumber}%");
            });
        }

        // Applicant Type filter
        if ($applicantType = $request->input('applicant_type')) {
            if ($applicantType !== 'all') {
                match ($applicantType) {
                    'resident' => $query->whereNotNull('resident_id')->whereNull('business_id'),
                    'business' => $query->whereNotNull('business_id'),
                    'senior' => $query->where('applicant_type', 'senior'),
                    'pwd' => $query->where('applicant_type', 'pwd'),
                    default => null
                };
            }
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Payment status filter
        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        // Type filter
        if ($type = $request->input('type')) {
            $query->where('clearance_type_id', $type);
        }

        // Urgency filter
        if ($urgency = $request->input('urgency')) {
            $query->where('urgency', $urgency);
        }

        // Date range filter
        if ($fromDate = $request->input('from_date')) {
            $query->whereDate('created_at', '>=', $fromDate);
        }
        if ($toDate = $request->input('to_date')) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        // Amount range filter
        if ($amountRange = $request->input('amount_range')) {
            $this->applyAmountRangeFilter($query, $amountRange);
        }
    }

    /**
     * Apply sorting to the query
     */
    private function applySorting($query, Request $request): void
    {
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $allowedSorts = [
            'reference_number', 'created_at', 'status', 'payment_status', 
            'fee_amount', 'amount_paid', 'urgency', 'clearance_number'
        ];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    /**
     * Apply amount range filter to query
     */
    private function applyAmountRangeFilter($query, string $range): void
    {
        match ($range) {
            '0-100' => $query->whereBetween('fee_amount', [0, 100]),
            '101-500' => $query->whereBetween('fee_amount', [101, 500]),
            '501-1000' => $query->whereBetween('fee_amount', [501, 1000]),
            '1001-5000' => $query->whereBetween('fee_amount', [1001, 5000]),
            '5000+' => $query->where('fee_amount', '>=', 5000),
            default => null
        };
    }

    private function formatClearance($clearance): array
    {
        $payerData = [
            'payer_type' => $clearance->payer_type,
            'payer_id' => $clearance->payer_id,
            'payer_name' => $clearance->payer_name,
            'payer_display' => $clearance->payer_display,
        ];

        $residentData = $clearance->resident ? [
            'id' => $clearance->resident->id,
            'full_name' => $clearance->resident->full_name,
            'address' => $clearance->resident->address,
            'contact_number' => $clearance->resident->contact_number,
            'purok' => $clearance->resident->purok,
        ] : null;

        $householdData = $clearance->household ? [
            'id' => $clearance->household->id,
            'household_number' => $clearance->household->household_number,
            'head_name' => $clearance->household->head_name,
            'address' => $clearance->household->address,
            'purok' => $clearance->household->purok,
        ] : null;

        $businessData = $clearance->business ? [
            'id' => $clearance->business->id,
            'business_name' => $clearance->business->business_name,
            'owner_name' => $clearance->business->owner_name,
            'address' => $clearance->business->address,
        ] : null;

        return array_merge(
            $clearance->toArray(),
            $payerData,
            [
                'resident' => $residentData,
                'household' => $householdData,
                'business' => $businessData,
                'clearance_type' => $clearance->clearanceType ? [
                    'id' => $clearance->clearanceType->id,
                    'name' => $clearance->clearanceType->name,
                    'code' => $clearance->clearanceType->code,
                    'fee' => (float) $clearance->clearanceType->fee,
                ] : null,
                'payment' => $clearance->payment ? [
                    'id' => $clearance->payment->id,
                    'or_number' => $clearance->payment->or_number,
                    'amount_paid' => $clearance->payment->amount_paid,
                ] : null,
                'status_display' => $clearance->status_display,
                'payment_status_display' => $clearance->payment_status_display,
                'formatted_fee' => $clearance->formatted_fee,
                'is_valid' => $clearance->is_valid,
                'days_remaining' => $clearance->days_remaining,
                'created_at' => $clearance->created_at?->toDateTimeString(),
                'issue_date' => $clearance->issue_date?->toDateString(),
                'valid_until' => $clearance->valid_until?->toDateString(),
            ]
        );
    }

    private function formatClearanceType($type): array
    {
        return [
            'id' => $type->id,
            'name' => $type->name,
            'code' => $type->code,
            'fee' => (float) $type->fee,
            'formatted_fee' => $type->formatted_fee,
            'processing_days' => $type->processing_days,
            'validity_days' => $type->validity_days,
            'is_active' => (bool) $type->is_active,
            'requires_payment' => (bool) $type->requires_payment,
            'total_requests' => $type->clearance_requests_count,
        ];
    }

    private function getStats(): array
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
            'expressRequests' => ClearanceRequest::where('urgency', 'express')->count(),
            'rushRequests' => ClearanceRequest::where('urgency', 'rush')->count(),
            'processing' => ClearanceRequest::where('status', 'processing')->count(),
            'approved' => ClearanceRequest::where('status', 'approved')->count(),
        ];
    }

    private function getStatusOptions(): array
    {
        return [
            ['value' => 'pending', 'label' => 'Pending Review'],
            ['value' => 'pending_payment', 'label' => 'Pending Payment'],
            ['value' => 'processing', 'label' => 'Under Processing'],
            ['value' => 'approved', 'label' => 'Approved'],
            ['value' => 'issued', 'label' => 'Issued'],
            ['value' => 'rejected', 'label' => 'Rejected'],
            ['value' => 'cancelled', 'label' => 'Cancelled'],
            ['value' => 'expired', 'label' => 'Expired'],
        ];
    }

    private function getPaymentStatusOptions(): array
    {
        return [
            ['value' => 'unpaid', 'label' => 'Unpaid'],
            ['value' => 'partially_paid', 'label' => 'Partially Paid'],
            ['value' => 'paid', 'label' => 'Paid'],
        ];
    }
}