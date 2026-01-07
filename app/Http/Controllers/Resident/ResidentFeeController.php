<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\HouseholdMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Carbon\Carbon;

class ResidentFeeController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $resident = $this->getAuthenticatedResident($user);
        
        if (!$resident) {
            return $this->renderEmptyFeePage($request);
        }
        
        $residentIds = $this->getHouseholdResidentIds($resident);
        
        // Build query with caching for filter options
        $query = $this->buildFeeQuery($residentIds, $resident, $request);
        
        // Get filter data with caching
        $filterData = Cache::remember("resident_fee_filters_{$resident->id}", 300, function () use ($residentIds, $resident) {
            return [
                'years' => $this->getAvailableYears($residentIds, $resident),
                'fee_types' => $this->getAvailableFeeTypes($residentIds, $resident),
                'residents' => $this->getHouseholdResidents($residentIds),
            ];
        });
        
        // Paginate results - remove the ->through() call for now
        $fees = $query->paginate(15);
        
        // Format fees manually
        $formattedFees = $fees->getCollection()->map(function ($fee) {
            return $this->formatFeeForFrontend($fee);
        });
        
        // Replace the collection with formatted data
        $fees->setCollection($formattedFees);
        
        // Calculate stats
        $stats = $this->calculateFeeStats($residentIds, $resident);
        
        return Inertia::render('resident/Fees/Index', [
            'fees' => $fees,
            'stats' => $stats,
            'availableYears' => $filterData['years'],
            'availableFeeTypes' => $filterData['fee_types'],
            'householdResidents' => $filterData['residents'],
            'currentResident' => $resident,
            'hasProfile' => true,
            'filters' => $this->getSanitizedFilters($request),
        ]);
    }
    
    public function show(Fee $fee)
    {
        $user = auth()->user();
        $resident = $this->getAuthenticatedResident($user);
        
        if (!$resident || !$this->authorizeFeeAccess($fee, $resident)) {
            abort(403, 'You are not authorized to view this fee.');
        }
        
        $fee->load([
            'feeType:id,code,name,category',
            'resident:id,first_name,last_name,middle_name,contact_number',
            'household:id,household_number',
            'paymentItems.payment' => function ($query) {
                $query->select('id', 'payment_date', 'or_number', 'payment_method', 'status');
            }
        ]);
        
        $formattedFee = $this->formatFeeForFrontend($fee, true);
        $paymentHistory = $this->getPaymentHistory($fee);
        
        return Inertia::render('resident/Fees/Show', [
            'fee' => $formattedFee,
            'paymentHistory' => $paymentHistory,
            'canPayOnline' => $this->canPayOnline($fee),
        ]);
    }
    
    /**
     * Helper Methods
     */
    private function getAuthenticatedResident($user): ?Resident
    {
        $cacheKey = "auth_resident_{$user->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($user) {
            // Try direct resident record
            $resident = Resident::where('user_id', $user->id)->first();
            
            if ($resident) {
                return $resident;
            }
            
            // Try household head
            $householdMember = HouseholdMember::with('resident')
                ->where('user_id', $user->id)
                ->where('is_head', true)
                ->first();
            
            return $householdMember?->resident;
        });
    }
    
    private function getHouseholdResidentIds(Resident $resident): array
    {
        $cacheKey = "household_resident_ids_{$resident->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($resident) {
            $residentIds = [$resident->id];
            
            if ($resident->household_id) {
                // Get residents from household
                $householdResidents = Resident::where('household_id', $resident->household_id)
                    ->pluck('id')
                    ->toArray();
                
                $residentIds = array_unique(array_merge($residentIds, $householdResidents));
                
                // Get additional household members
                $householdMembers = HouseholdMember::where('household_id', $resident->household_id)
                    ->pluck('resident_id')
                    ->toArray();
                
                $residentIds = array_unique(array_merge($residentIds, $householdMembers));
            }
            
            return $residentIds;
        });
    }
    
    private function buildFeeQuery(array $residentIds, Resident $resident, Request $request)
    {
        $query = Fee::query()
            ->where(function ($query) use ($residentIds, $resident) {
                $query->where('payer_type', 'resident')
                    ->whereIn('resident_id', $residentIds);
                
                if ($resident->household_id) {
                    $query->orWhere(function ($q) use ($resident) {
                        $q->where('payer_type', 'household')
                            ->where('household_id', $resident->household_id);
                    });
                }
            })
            ->with(['feeType:id,code,name,category', 'resident', 'household'])
            ->latest('issue_date');
        
        // Apply filters
        $this->applyFilters($query, $request);
        
        return $query;
    }
    
    private function applyFilters($query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('fee_code', 'like', "%{$search}%")
                    ->orWhere('or_number', 'like', "%{$search}%")
                    ->orWhere('certificate_number', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhere('payer_name', 'like', "%{$search}%")
                    ->orWhereHas('feeType', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('fee_type') && $request->fee_type !== 'all') {
            $query->whereHas('feeType', function ($q) use ($request) {
                $q->where('code', $request->fee_type);
            });
        }
        
        if ($request->filled('year') && $request->year !== 'all') {
            $query->whereYear('issue_date', $request->year);
        }
    }
    
    private function getAvailableYears(array $residentIds, Resident $resident): array
    {
        return Fee::query()
            ->where(function ($query) use ($residentIds, $resident) {
                $query->where('payer_type', 'resident')
                    ->whereIn('resident_id', $residentIds);
                
                if ($resident->household_id) {
                    $query->orWhere(function ($q) use ($resident) {
                        $q->where('payer_type', 'household')
                            ->where('household_id', $resident->household_id);
                    });
                }
            })
            ->selectRaw('YEAR(issue_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->filter()
            ->values()
            ->toArray();
    }
    
    private function getAvailableFeeTypes(array $residentIds, Resident $resident)
    {
        return FeeType::query()
            ->where('is_active', true)
            ->whereIn('id', function ($query) use ($residentIds, $resident) {
                $query->select('fee_type_id')
                    ->from('fees')
                    ->where(function ($q) use ($residentIds) {
                        $q->where('payer_type', 'resident')
                            ->whereIn('resident_id', $residentIds);
                    })
                    ->orWhere(function ($q) use ($resident) {
                        $q->where('payer_type', 'household')
                            ->where('household_id', $resident->household_id);
                    });
            })
            ->get(['id', 'code', 'name', 'category'])
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'code' => $type->code,
                    'name' => $type->name,
                    'category' => $type->category,
                ];
            });
    }
    
    private function getHouseholdResidents(array $residentIds)
    {
        return Resident::query()
            ->whereIn('id', $residentIds)
            ->get(['id', 'first_name', 'last_name', 'middle_name'])
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'full_name' => $resident->full_name,
                ];
            });
    }
    
    private function authorizeFeeAccess(Fee $fee, Resident $resident): bool
    {
        $residentIds = $this->getHouseholdResidentIds($resident);
        
        return ($fee->payer_type === 'resident' && in_array($fee->resident_id, $residentIds)) ||
               ($fee->payer_type === 'household' && $fee->household_id === $resident->household_id);
    }
    
    private function formatFeeForFrontend(Fee $fee, bool $detailed = false): array
    {
        $isOwnFee = $this->isOwnFee($fee);
        $requirementsSubmitted = $this->parseRequirements($fee->requirements_submitted);
        
        // Create category_display from category if it doesn't exist
        $categoryDisplay = $fee->feeType ? ucwords(str_replace('_', ' ', $fee->feeType->category)) : null;
        
        $baseData = [
            'id' => $fee->id,
            'fee_code' => $fee->fee_code,
            'or_number' => $fee->or_number,
            'certificate_number' => $fee->certificate_number,
            'purpose' => $fee->purpose,
            'payer_name' => $fee->payer_name,
            'address' => $fee->address,
            'purok' => $fee->purok,
            'zone' => $fee->zone,
            'billing_period' => $fee->billing_period,
            'issue_date' => $fee->issue_date?->format('Y-m-d'),
            'due_date' => $fee->due_date?->format('Y-m-d'),
            'period_start' => $fee->period_start?->format('Y-m-d'),
            'period_end' => $fee->period_end?->format('Y-m-d'),
            'base_amount' => (float) $fee->base_amount,
            'surcharge_amount' => (float) $fee->surcharge_amount,
            'penalty_amount' => (float) $fee->penalty_amount,
            'discount_amount' => (float) $fee->discount_amount,
            'total_amount' => (float) $fee->total_amount,
            'amount_paid' => (float) $fee->amount_paid,
            'balance' => (float) $fee->balance,
            'status' => $fee->status,
            'remarks' => $fee->remarks,
            'payer_type' => $fee->payer_type,
            'resident_id' => $fee->resident_id,
            'household_id' => $fee->household_id,
            'is_own_fee' => $isOwnFee,
            'formatted_issue_date' => $fee->issue_date?->format('M d, Y') ?? 'N/A',
            'formatted_due_date' => $fee->due_date?->format('M d, Y') ?? 'N/A',
            'formatted_total' => '₱' . number_format($fee->total_amount, 2),
            'formatted_balance' => '₱' . number_format($fee->balance, 2),
            'formatted_amount_paid' => '₱' . number_format($fee->amount_paid, 2),
            'formatted_base_amount' => '₱' . number_format($fee->base_amount, 2),
            'formatted_surcharge' => '₱' . number_format($fee->surcharge_amount, 2),
            'formatted_penalty' => '₱' . number_format($fee->penalty_amount, 2),
            'formatted_discount' => '₱' . number_format($fee->discount_amount, 2),
            'is_overdue' => $this->checkIfOverdue($fee),
            'days_overdue' => $this->calculateDaysOverdue($fee),
            'requirements_submitted' => $requirementsSubmitted,
            'fee_type' => $fee->feeType ? [
                'id' => $fee->feeType->id,
                'code' => $fee->feeType->code,
                'name' => $fee->feeType->name,
                'category' => $fee->feeType->category,
                'category_display' => $categoryDisplay, // Generated from category
            ] : null,
        ];
        
        if ($detailed) {
            $baseData = array_merge($baseData, [
                'property_description' => $fee->property_description,
                'business_type' => $fee->business_type,
                'business_name' => $fee->business_name,
                'area' => $fee->area ? (float) $fee->area : null,
                'valid_from' => $fee->valid_from?->format('Y-m-d'),
                'valid_until' => $fee->valid_until?->format('Y-m-d'),
                'waiver_reason' => $fee->waiver_reason,
                'formatted_valid_from' => $fee->valid_from?->format('M d, Y') ?? 'N/A',
                'formatted_valid_until' => $fee->valid_until?->format('M d, Y') ?? 'N/A',
                'resident_info' => $fee->resident ? [
                    'id' => $fee->resident->id,
                    'full_name' => $fee->resident->full_name,
                    'first_name' => $fee->resident->first_name,
                    'last_name' => $fee->resident->last_name,
                    'contact_number' => $fee->resident->contact_number,
                ] : null,
            ]);
        }
        
        return $baseData;
    }
    
    private function checkIfOverdue(Fee $fee): bool
    {
        if (in_array($fee->status, ['paid', 'cancelled'])) {
            return false;
        }
        
        if ($fee->due_date && Carbon::parse($fee->due_date)->isPast()) {
            return $fee->balance > 0;
        }
        
        return false;
    }
    
    private function calculateDaysOverdue(Fee $fee): int
    {
        if (!$this->checkIfOverdue($fee) || !$fee->due_date) {
            return 0;
        }
        
        $dueDate = Carbon::parse($fee->due_date);
        return max(0, $dueDate->diffInDays(now(), false));
    }
    
    private function isOwnFee(Fee $fee): bool
    {
        $user = auth()->user();
        $loggedInResident = Resident::where('user_id', $user->id)->first();
        
        if ($loggedInResident && $fee->payer_type === 'resident' && $fee->resident_id == $loggedInResident->id) {
            return true;
        }
        
        $householdMember = HouseholdMember::where('user_id', $user->id)
            ->where('is_head', true)
            ->first();
        
        return $householdMember && $fee->payer_type === 'resident' && $fee->resident_id == $householdMember->resident_id;
    }
    
    private function parseRequirements($requirements): array
    {
        if (is_array($requirements)) {
            return $requirements;
        }
        
        if (is_string($requirements)) {
            try {
                $parsed = json_decode($requirements, true, 512, JSON_THROW_ON_ERROR);
                return is_array($parsed) ? $parsed : [];
            } catch (\JsonException $e) {
                return [];
            }
        }
        
        return [];
    }
    
    private function getPaymentHistory(Fee $fee)
    {
        return $fee->paymentItems
            ->map(function ($item) {
                return [
                    'date' => $item->payment->payment_date?->format('Y-m-d'),
                    'amount' => (float) $item->total,
                    'or_number' => $item->payment->or_number,
                    'method' => $item->payment->payment_method,
                    'status' => $item->payment->status,
                ];
            })
            ->sortByDesc('date')
            ->values()
            ->toArray();
    }
    
    private function canPayOnline(Fee $fee): bool
    {
        return $fee->balance > 0 && $fee->status !== 'cancelled' && $fee->status !== 'paid';
    }
    
    private function calculateFeeStats(array $residentIds, Resident $resident): array
    {
        $now = now();
        $currentYear = $now->year;
        
        $baseQuery = Fee::query()
            ->where(function ($query) use ($residentIds, $resident) {
                $query->where('payer_type', 'resident')
                    ->whereIn('resident_id', $residentIds);
                
                if ($resident->household_id) {
                    $query->orWhere(function ($q) use ($resident) {
                        $q->where('payer_type', 'household')
                            ->where('household_id', $resident->household_id);
                    });
                }
            });
        
        $totalStats = (clone $baseQuery)
            ->selectRaw('COUNT(*) as total_count')
            ->selectRaw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_count')
            ->selectRaw('SUM(CASE WHEN status = "paid" THEN 1 ELSE 0 END) as paid_count')
            ->selectRaw('SUM(CASE WHEN status = "issued" THEN 1 ELSE 0 END) as issued_count')
            ->selectRaw('SUM(CASE WHEN due_date < ? AND status IN ("pending", "issued", "partially_paid") AND balance > 0 THEN 1 ELSE 0 END) as overdue_count', [$now])
            ->selectRaw('SUM(CASE WHEN status IN ("pending", "overdue", "issued", "partially_paid") THEN balance ELSE 0 END) as total_balance')
            ->selectRaw('SUM(amount_paid) as total_paid')
            ->first();
        
        $currentYearStats = (clone $baseQuery)
            ->whereYear('issue_date', $currentYear)
            ->selectRaw('SUM(total_amount) as year_total')
            ->selectRaw('SUM(amount_paid) as year_paid')
            ->selectRaw('SUM(CASE WHEN status IN ("pending", "overdue", "issued", "partially_paid") THEN balance ELSE 0 END) as year_balance')
            ->first();
        
        return [
            'total_fees' => (int) ($totalStats->total_count ?? 0),
            'pending_fees' => (int) ($totalStats->pending_count ?? 0),
            'overdue_fees' => (int) ($totalStats->overdue_count ?? 0),
            'paid_fees' => (int) ($totalStats->paid_count ?? 0),
            'issued_fees' => (int) ($totalStats->issued_count ?? 0),
            'total_balance' => (float) ($totalStats->total_balance ?? 0),
            'total_paid' => (float) ($totalStats->total_paid ?? 0),
            'current_year_total' => (float) ($currentYearStats->year_total ?? 0),
            'current_year_paid' => (float) ($currentYearStats->year_paid ?? 0),
            'current_year_balance' => (float) ($currentYearStats->year_balance ?? 0),
        ];
    }
    
    private function getSanitizedFilters(Request $request): array
    {
        return $request->only(['search', 'status', 'fee_type', 'year']);
    }
    
    private function renderEmptyFeePage(Request $request)
    {
        return Inertia::render('Resident/Fees/Index', [
            'fees' => [
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'total' => 0,
                'from' => 0,
                'to' => 0,
            ],
            'stats' => [
                'total_fees' => 0,
                'pending_fees' => 0,
                'overdue_fees' => 0,
                'paid_fees' => 0,
                'issued_fees' => 0,
                'total_balance' => 0,
                'total_paid' => 0,
                'current_year_total' => 0,
                'current_year_paid' => 0,
                'current_year_balance' => 0,
            ],
            'hasProfile' => false,
            'filters' => $this->getSanitizedFilters($request),
        ]);
    }
}