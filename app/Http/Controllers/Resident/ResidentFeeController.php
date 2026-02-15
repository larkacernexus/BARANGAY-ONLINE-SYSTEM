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
        
        // Paginate results - use eager loading
        $fees = $query->paginate(15)->withQueryString(); // Added withQueryString
        
        // Format fees manually - EAGER LOAD documentCategory through feeType
        $formattedFees = $fees->getCollection()->map(function ($fee) {
            // Make sure we load the feeType with its documentCategory
            if ($fee->feeType && !$fee->feeType->relationLoaded('documentCategory')) {
                $fee->feeType->load('documentCategory');
            }
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

    private function getAvailableFeeTypes($residentIds, $resident)
    {
        return FeeType::active()
            ->with('documentCategory')
            ->where(function($query) use ($resident) {
                $query->where('applicable_to', 'all_residents')
                    ->orWhere('applicable_to', 'property_owners')
                    ->orWhere(function($q) use ($resident) {
                        $q->where('applicable_to', 'specific_purok')
                            ->where('applicable_puroks', 'like', "%{$resident->purok}%");
                    });
            })
            ->orderBy('sort_order')
            ->get()
            ->map(function ($feeType) {
                // Get category name from documentCategory - use slug as code
                $categoryName = $feeType->documentCategory ? $feeType->documentCategory->name : 'Uncategorized';
                $categoryCode = $feeType->documentCategory ? $feeType->documentCategory->slug : 'uncategorized';
                
                return [
                    'id' => $feeType->id,
                    'code' => $feeType->code,
                    'name' => $feeType->name,
                    'category' => $categoryName,
                    'category_display' => $categoryName,
                    'document_category' => $feeType->documentCategory ? [
                        'id' => $feeType->documentCategory->id,
                        'name' => $feeType->documentCategory->name,
                        'code' => $categoryCode,
                        'slug' => $feeType->documentCategory->slug,
                    ] : null,
                ];
            });
    }

   private function formatFeeForFrontend($fee)
{
    // Format the fee for frontend display
    $formatted = [
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
        'issue_date' => $fee->issue_date?->toDateString(),
        'due_date' => $fee->due_date?->toDateString(),
        'period_start' => $fee->period_start?->toDateString(),
        'period_end' => $fee->period_end?->toDateString(),
        'base_amount' => (float) $fee->base_amount,
        'surcharge_amount' => (float) $fee->surcharge_amount,
        'penalty_amount' => (float) $fee->penalty_amount,
        'discount_amount' => (float) $fee->discount_amount,
        'total_amount' => (float) $fee->total_amount,
        'amount_paid' => (float) $fee->amount_paid,
        'balance' => (float) $fee->balance,
        'status' => $fee->status,
        'remarks' => $fee->remarks,
        'formatted_issue_date' => $fee->issue_date?->format('M d, Y') ?? 'N/A',
        'formatted_due_date' => $fee->due_date?->format('M d, Y') ?? 'N/A',
        'formatted_total' => '₱' . number_format($fee->total_amount, 2),
        'formatted_balance' => '₱' . number_format($fee->balance, 2),
        'formatted_amount_paid' => '₱' . number_format($fee->amount_paid, 2),
        'is_overdue' => $fee->isOverdue(),
        'days_overdue' => $fee->days_overdue,
    ];
    
    // Add payer data
    if ($fee->payer) {
        if ($fee->payer_type === 'resident') {
            $formatted['resident'] = [
                'id' => $fee->payer->id,
                'first_name' => $fee->payer->first_name,
                'last_name' => $fee->payer->last_name,
                'middle_name' => $fee->payer->middle_name,
                'full_name' => $fee->payer->full_name,
            ];
        } elseif ($fee->payer_type === 'household') {
            $formatted['household'] = [
                'id' => $fee->payer->id,
                'household_number' => $fee->payer->household_number,
                'head_name' => $fee->payer->head_name,
            ];
        }
    }
    
    // Add fee type with document category
    if ($fee->feeType) {
        $categoryName = $fee->feeType->documentCategory ? $fee->feeType->documentCategory->name : 'Uncategorized';
        $categoryCode = $fee->feeType->documentCategory ? $fee->feeType->documentCategory->slug : 'uncategorized';
        
        $formatted['fee_type'] = [
            'id' => $fee->feeType->id,
            'code' => $fee->feeType->code,
            'name' => $fee->feeType->name,
            'category' => $categoryName,
            'category_display' => $categoryName,
            'document_category' => $fee->feeType->documentCategory ? [
                'id' => $fee->feeType->documentCategory->id,
                'name' => $fee->feeType->documentCategory->name,
                'code' => $categoryCode,
                'slug' => $fee->feeType->documentCategory->slug,
            ] : null,
        ];
    }
    
    return $formatted;
}
    
 public function show(Fee $fee)
{
    $user = auth()->user();
    $resident = $this->getAuthenticatedResident($user);
    
    if (!$resident || !$this->authorizeFeeAccess($fee, $resident)) {
        abort(403, 'You are not authorized to view this fee.');
    }
    
    // Update eager loading to use payer
    $fee->load([
        'feeType.documentCategory:id,name,slug',
        'payer', // Load polymorphic payer
        'paymentItems.payment' => function ($query) {
            $query->select('id', 'payment_date', 'or_number', 'payment_method', 'status');
        }
    ]);
    
    $formattedFee = $this->formatFeeForFrontend($fee);
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
            // Get resident from user's current_resident_id
            if ($user->current_resident_id) {
                $resident = Resident::find($user->current_resident_id);
                if ($resident) {
                    return $resident;
                }
            }
            
            // If user has household_id, try to find the head resident
            if ($user->household_id) {
                // Find household head through household members
                $householdMember = HouseholdMember::where('household_id', $user->household_id)
                    ->where('is_head', true)
                    ->first();
                    
                if ($householdMember && $householdMember->resident) {
                    return $householdMember->resident;
                }
                
                // If no head found, get the first resident in the household
                $firstResident = Resident::where('household_id', $user->household_id)
                    ->first();
                    
                if ($firstResident) {
                    return $firstResident;
                }
            }
            
            return null;
        });
    }
    
    private function getHouseholdResidentIds(Resident $resident): array
    {
        $cacheKey = "household_resident_ids_{$resident->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($resident) {
            $residentIds = [$resident->id];
            
            // Get all residents in the same household
            if ($resident->household_id) {
                $householdResidents = Resident::where('household_id', $resident->household_id)
                    ->pluck('id')
                    ->toArray();
                
                $residentIds = array_unique(array_merge($residentIds, $householdResidents));
                
                // Also get residents through household members
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
            // Use polymorphic relationship
            $query->where(function ($q) use ($residentIds) {
                $q->where('payer_type', 'resident')
                  ->whereIn('payer_id', $residentIds);
            });
            
            if ($resident->household_id) {
                $query->orWhere(function ($q) use ($resident) {
                    $q->where('payer_type', 'household')
                      ->where('payer_id', $resident->household_id);
                });
            }
        })
        ->with([
            'feeType.documentCategory:id,name,slug',
            'payer', // Use polymorphic payer instead of resident/household
        ])
        ->latest('issue_date');
    
    // Apply filters
    $this->applyFilters($query, $request, $residentIds);
    
    return $query;
}
    
   private function applyFilters($query, Request $request, array $residentIds): void
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
    
    // FIXED: Filter by fee type ID (not code)
    if ($request->filled('fee_type') && $request->fee_type !== 'all') {
        $query->where('fee_type_id', $request->fee_type);
    }
    
    // FIXED: Handle year filter properly
    if ($request->filled('year') && $request->year !== 'all') {
        $query->whereYear('issue_date', $request->year);
    }
    
    // FIXED: Add resident filter - now using payer_id and payer_type
    if ($request->filled('resident') && $request->resident !== 'all') {
        $query->where('payer_type', 'resident')
              ->where('payer_id', $request->resident);
    }
}
    
  private function getAvailableYears(array $residentIds, Resident $resident): array
{
    return Fee::query()
        ->where(function ($query) use ($residentIds, $resident) {
            // Use polymorphic relationship
            $query->where(function ($q) use ($residentIds) {
                $q->where('payer_type', 'resident')
                  ->whereIn('payer_id', $residentIds);
            });
            
            if ($resident->household_id) {
                $query->orWhere(function ($q) use ($resident) {
                    $q->where('payer_type', 'household')
                      ->where('payer_id', $resident->household_id);
                });
            }
        })
        ->whereNotNull('issue_date') // Add this to exclude null dates
        ->selectRaw('YEAR(issue_date) as year')
        ->distinct()
        ->orderBy('year', 'desc')
        ->pluck('year')
        ->filter()
        ->values()
        ->toArray();
}
    
    private function getHouseholdResidents(array $residentIds)
    {
        return Resident::query()
            ->whereIn('id', $residentIds)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'middle_name'])
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                ];
            })
            ->toArray();
    }
    
    private function authorizeFeeAccess(Fee $fee, Resident $resident): bool
    {
        $residentIds = $this->getHouseholdResidentIds($resident);
        
        // Use polymorphic relationship
        return ($fee->payer_type === 'resident' && in_array($fee->payer_id, $residentIds)) ||
            ($fee->payer_type === 'household' && $fee->payer_id === $resident->household_id);
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
        
        // Check if fee belongs to user's current resident
        if ($user->current_resident_id && $fee->payer_type === 'resident' && $fee->payer_id == $user->current_resident_id) {
            return true;
        }
        
        // Check if user is household head and fee belongs to household
        if ($user->household_id && $fee->payer_type === 'household' && $fee->payer_id == $user->household_id) {
            return true;
        }
        
        return false;
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
            // Use polymorphic relationship
            $query->where(function ($q) use ($residentIds) {
                $q->where('payer_type', 'resident')
                  ->whereIn('payer_id', $residentIds);
            });
            
            if ($resident->household_id) {
                $query->orWhere(function ($q) use ($resident) {
                    $q->where('payer_type', 'household')
                      ->where('payer_id', $resident->household_id);
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
        return $request->only(['search', 'status', 'fee_type', 'year', 'resident']);
    }
    
    private function renderEmptyFeePage(Request $request)
    {
        return Inertia::render('resident/Fees/Index', [
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
            'availableYears' => [],
            'availableFeeTypes' => [],
            'householdResidents' => [],
            'hasProfile' => false,
            'filters' => $this->getSanitizedFilters($request),
        ]);
    }
}