<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\HouseholdMember;
use App\Models\Household;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class ResidentFeeController extends Controller
{
    /**
     * Display a listing of fees for the authenticated resident/household.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Determine the context: which resident is currently active
        $currentResident = $this->getCurrentResident($user);
        
        if (!$currentResident) {
            return $this->renderEmptyFeePage($request, 'No resident profile found.');
        }
        
        // Get ALL resident IDs that belong to this household
        $householdResidentIds = $this->getAllHouseholdResidentIds($currentResident);
        
        // Get the household ID if applicable
        $householdId = $currentResident->household_id;
        
        // Build query with caching for filter options
        $query = $this->buildFeeQuery($householdResidentIds, $householdId, $request);
        
        // Get filter data with caching
        $filterData = Cache::remember("resident_fee_filters_{$currentResident->id}", 300, function () use ($householdResidentIds, $householdId, $currentResident) {
            return [
                'years' => $this->getAvailableYears($householdResidentIds, $householdId),
                'fee_types' => $this->getAvailableFeeTypes($householdResidentIds, $householdId, $currentResident),
                'residents' => $this->getHouseholdResidents($householdResidentIds),
            ];
        });
        
        // Paginate results - use eager loading
        $fees = $query->paginate(15)->withQueryString();
        
        // Format fees manually
        $formattedFees = $fees->getCollection()->map(function ($fee) {
            // Make sure we load the feeType with its documentCategory
            if ($fee->feeType && !$fee->feeType->relationLoaded('documentCategory')) {
                $fee->feeType->load('documentCategory');
            }
            return $this->formatFeeForFrontend($fee);
        });
        
        // Replace the collection with formatted data
        $fees->setCollection($formattedFees);
        
        // Calculate stats for the entire household
        $stats = $this->calculateHouseholdFeeStats($householdResidentIds, $householdId);
        
        // Get household members list for reference
        $householdMembers = $this->getHouseholdMembersList($householdResidentIds);
        
        return Inertia::render('resident/Fees/Index', [
            'fees' => $fees,
            'stats' => $stats,
            'availableYears' => $filterData['years'],
            'availableFeeTypes' => $filterData['fee_types'],
            'householdResidents' => $filterData['residents'],
            'householdMembers' => $householdMembers,
            'currentResident' => $currentResident,
            'householdId' => $householdId,
            'hasProfile' => true,
            'filters' => $this->getSanitizedFilters($request),
            'viewContext' => [
                'isHouseholdHead' => $this->isHouseholdHead($currentResident),
                'currentResidentName' => $currentResident->full_name,
                'householdSize' => count($householdResidentIds),
            ],
        ]);
    }

    /**
     * Display the specified fee.
     */
    public function show(Fee $fee)
    {
        $user = auth()->user();
        $currentResident = $this->getCurrentResident($user);
        
        if (!$currentResident) {
            abort(403, 'No resident profile found.');
        }
        
        // Get all household resident IDs for authorization
        $householdResidentIds = $this->getAllHouseholdResidentIds($currentResident);
        $householdId = $currentResident->household_id;
        
        // Authorize access - check if fee belongs to any household member or the household itself
        if (!$this->authorizeFeeAccess($fee, $householdResidentIds, $householdId)) {
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
        
        // Determine which household member this fee belongs to
        $payerInfo = $this->getPayerInfo($fee);
        
        return Inertia::render('resident/Fees/Show', [
            'fee' => $formattedFee,
            'paymentHistory' => $paymentHistory,
            'canPayOnline' => $this->canPayOnline($fee),
            'payerInfo' => $payerInfo,
        ]);
    }

    /**
     * Helper Methods
     */

    /**
     * Get the current active resident for the authenticated user
     */
    private function getCurrentResident(User $user): ?Resident
    {
        $cacheKey = "auth_resident_{$user->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($user) {
            // First try to get the resident from current_resident_id
            if ($user->current_resident_id) {
                $resident = Resident::with('household')->find($user->current_resident_id);
                if ($resident) {
                    return $resident;
                }
            }
            
            // If user has household_id, try to find the head resident
            if ($user->household_id) {
                // Find household head through household members
                $householdMember = HouseholdMember::where('household_id', $user->household_id)
                    ->where('is_head', true)
                    ->with('resident')
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

    /**
     * Check if the current resident is the household head
     */
    private function isHouseholdHead(Resident $resident): bool
    {
        return HouseholdMember::where('household_id', $resident->household_id)
            ->where('resident_id', $resident->id)
            ->where('is_head', true)
            ->exists();
    }

    /**
     * Get ALL resident IDs in the household (including all members)
     */
    private function getAllHouseholdResidentIds(Resident $resident): array
    {
        $cacheKey = "household_all_resident_ids_{$resident->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($resident) {
            $residentIds = [$resident->id];
            
            // Get all residents in the same household through household_id
            if ($resident->household_id) {
                $householdResidents = Resident::where('household_id', $resident->household_id)
                    ->pluck('id')
                    ->toArray();
                
                $residentIds = array_unique(array_merge($residentIds, $householdResidents));
                
                // Also get residents through household members table (for additional safety)
                $householdMembers = HouseholdMember::where('household_id', $resident->household_id)
                    ->pluck('resident_id')
                    ->toArray();
                
                $residentIds = array_unique(array_merge($residentIds, $householdMembers));
            }
            
            return $residentIds;
        });
    }

    /**
     * Build the fee query to include fees for:
     * - All residents in the household (as individual payers)
     * - The household itself (as a collective payer)
     */
    private function buildFeeQuery(array $residentIds, ?int $householdId, Request $request)
    {
        $query = Fee::query()
            ->where(function ($query) use ($residentIds, $householdId) {
                // Include fees where payer is any resident in the household
                $query->where(function ($q) use ($residentIds) {
                    $q->where('payer_type', 'App\\Models\\Resident') // FIXED: Use full model class name
                      ->whereIn('payer_id', $residentIds);
                });
                
                // Include fees where payer is the household itself
                if ($householdId) {
                    $query->orWhere(function ($q) use ($householdId) {
                        $q->where('payer_type', 'App\\Models\\Household') // FIXED: Use full model class name
                          ->where('payer_id', $householdId);
                    });
                }
            })
            ->with([
                'feeType.documentCategory:id,name,slug',
                'payer', // Load polymorphic payer
            ])
            ->latest('issue_date');
        
        // Apply filters
        $this->applyFilters($query, $request, $residentIds, $householdId);
        
        return $query;
    }

    /**
     * Apply filters to the fee query
     */
    private function applyFilters($query, Request $request, array $residentIds, ?int $householdId): void
    {
        // Search filter
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
     // Status filter
if ($request->filled('status') && $request->status !== 'all') {

    if ($request->status === 'overdue') {

        $query->where('balance', '>', 0)
              ->whereDate('due_date', '<', now())
              ->whereNotIn('status', ['paid', 'cancelled']);

    } else {

        $query->where('status', $request->status);

    }
}
        
        // Fee type filter
        if ($request->filled('fee_type') && $request->fee_type !== 'all') {
            $query->where('fee_type_id', $request->fee_type);
        }
        
        // Year filter
        if ($request->filled('year') && $request->year !== 'all') {
            $query->whereYear('issue_date', $request->year);
        }
        
        // Resident filter - filter by specific resident within the household
        if ($request->filled('resident') && $request->resident !== 'all') {
            $residentId = $request->resident;
            
            // Only apply filter if the selected resident is part of the household
            if (in_array($residentId, $residentIds)) {
                $query->where(function ($q) use ($residentId) {
                    $q->where('payer_type', 'App\\Models\\Resident') // FIXED: Use full model class name
                      ->where('payer_id', $residentId);
                });
            }
        }
        
        // Payer type filter
        if ($request->filled('payer_type') && $request->payer_type !== 'all') {
            // Convert simple payer type to model class
            $payerTypeMap = [
                'resident' => 'App\\Models\\Resident',
                'household' => 'App\\Models\\Household',
                'business' => 'App\\Models\\Business',
            ];
            
            $modelType = $payerTypeMap[$request->payer_type] ?? $request->payer_type;
            $query->where('payer_type', $modelType);
        }
    }

    /**
     * Get available years for filtering
     */
    private function getAvailableYears(array $residentIds, ?int $householdId): array
    {
        return Fee::query()
            ->where(function ($query) use ($residentIds, $householdId) {
                $query->where(function ($q) use ($residentIds) {
                    $q->where('payer_type', 'App\\Models\\Resident') // FIXED: Use full model class name
                      ->whereIn('payer_id', $residentIds);
                });
                
                if ($householdId) {
                    $query->orWhere(function ($q) use ($householdId) {
                        $q->where('payer_type', 'App\\Models\\Household') // FIXED: Use full model class name
                          ->where('payer_id', $householdId);
                    });
                }
            })
            ->whereNotNull('issue_date')
            ->selectRaw('YEAR(issue_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * Get available fee types that are applicable to this resident/household
     */
    private function getAvailableFeeTypes(array $residentIds, ?int $householdId, Resident $resident): array
    {
        return FeeType::active()
            ->with('documentCategory')
            ->where(function($query) use ($resident) {
                $query->where('applicable_to', 'all_residents')
                    ->orWhere('applicable_to', 'property_owners')
                    ->orWhere(function($q) use ($resident) {
                        $q->where('applicable_to', 'specific_purok')
                            ->where('applicable_puroks', 'like', "%{$resident->purok_id}%");
                    });
            })
            ->orderBy('sort_order')
            ->get()
            ->map(function ($feeType) {
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
            })
            ->toArray();
    }

    /**
     * Get all residents in the household for filtering
     */
    private function getHouseholdResidents(array $residentIds): array
    {
        return Resident::query()
            ->whereIn('id', $residentIds)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'middle_name', 'suffix'])
            ->map(function ($resident) {
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'suffix' => $resident->suffix,
                    'full_name' => $resident->full_name,
                ];
            })
            ->toArray();
    }

    /**
     * Get household members list with roles
     */
    private function getHouseholdMembersList(array $residentIds): array
    {
        return Resident::query()
            ->whereIn('id', $residentIds)
            ->with(['householdMemberships' => function ($query) {
                $query->where('is_head', true);
            }])
            ->get()
            ->map(function ($resident) {
                $isHead = $resident->householdMemberships->isNotEmpty();
                
                return [
                    'id' => $resident->id,
                    'full_name' => $resident->full_name,
                    'is_head' => $isHead,
                    'age' => $resident->age,
                    'gender' => $resident->gender,
                ];
            })
            ->toArray();
    }

    /**
     * Calculate fee statistics for the entire household
     */
    private function calculateHouseholdFeeStats(array $residentIds, ?int $householdId): array
    {
        $now = now();
        $currentYear = $now->year;
        
        $baseQuery = Fee::query()
            ->where(function ($query) use ($residentIds, $householdId) {
                $query->where(function ($q) use ($residentIds) {
                    $q->where('payer_type', 'App\\Models\\Resident') // FIXED: Use full model class name
                      ->whereIn('payer_id', $residentIds);
                });
                
                if ($householdId) {
                    $query->orWhere(function ($q) use ($householdId) {
                        $q->where('payer_type', 'App\\Models\\Household') // FIXED: Use full model class name
                          ->where('payer_id', $householdId);
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
        
        // Calculate per-resident stats
        $perResidentStats = [];
        foreach ($residentIds as $residentId) {
            $resident = Resident::find($residentId);
            if ($resident) {
                $residentFees = Fee::where('payer_type', 'App\\Models\\Resident') // FIXED: Use full model class name
                    ->where('payer_id', $residentId)
                    ->count();
                
                $residentBalance = Fee::where('payer_type', 'App\\Models\\Resident')
                    ->where('payer_id', $residentId)
                    ->whereIn('status', ['pending', 'overdue', 'issued', 'partially_paid'])
                    ->sum('balance');
                
                $perResidentStats[] = [
                    'resident_id' => $residentId,
                    'resident_name' => $resident->full_name,
                    'fee_count' => $residentFees,
                    'balance' => (float) $residentBalance,
                ];
            }
        }
        
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
            'per_resident_stats' => $perResidentStats,
        ];
    }

    /**
     * Authorize fee access
     */
    private function authorizeFeeAccess(Fee $fee, array $residentIds, ?int $householdId): bool
    {
        // Check if fee belongs to any resident in the household
        if ($fee->payer_type === 'App\\Models\\Resident') { // FIXED: Use full model class name
            return in_array($fee->payer_id, $residentIds);
        }
        
        // Check if fee belongs to the household
        if ($fee->payer_type === 'App\\Models\\Household') { // FIXED: Use full model class name
            return $fee->payer_id === $householdId;
        }
        
        return false;
    }

    /**
     * Get payer information
     */
    private function getPayerInfo(Fee $fee): array
    {
        if ($fee->payer_type === 'App\\Models\\Resident' && $fee->payer) {
            return [
                'type' => 'resident',
                'id' => $fee->payer->id,
                'name' => $fee->payer->full_name,
                'is_senior' => $fee->payer->is_senior,
                'is_pwd' => $fee->payer->is_pwd,
                'is_solo_parent' => $fee->payer->is_solo_parent,
                'is_indigent' => $fee->payer->is_indigent,
            ];
        } elseif ($fee->payer_type === 'App\\Models\\Household' && $fee->payer) {
            return [
                'type' => 'household',
                'id' => $fee->payer->id,
                'name' => $fee->payer->current_head_name ?? 'Household',
                'head_name' => $fee->payer->current_head_name,
                'member_count' => $fee->payer->member_count,
            ];
        }
        
        return [
            'type' => $fee->payer_type,
            'name' => $fee->payer_name,
        ];
    }

    /**
     * Format fee for frontend
     */
    private function formatFeeForFrontend($fee): array
    {
        // Convert payer_type for frontend display
        $displayPayerType = 'other';
        if ($fee->payer_type === 'App\\Models\\Resident') {
            $displayPayerType = 'resident';
        } elseif ($fee->payer_type === 'App\\Models\\Household') {
            $displayPayerType = 'household';
        } elseif ($fee->payer_type === 'App\\Models\\Business') {
            $displayPayerType = 'business';
        }
        
        $formatted = [
            'id' => $fee->id,
            'fee_code' => $fee->fee_code,
            'or_number' => $fee->or_number,
            'certificate_number' => $fee->certificate_number,
            'purpose' => $fee->purpose,
            'payer_name' => $fee->payer_name,
            'payer_type' => $displayPayerType, // Use display version for frontend
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
            'is_overdue' => $this->checkIfOverdue($fee),
            'days_overdue' => $this->calculateDaysOverdue($fee),
        ];
        
        // Add payer data
        if ($fee->payer) {
            if ($fee->payer_type === 'App\\Models\\Resident') {
                $formatted['resident'] = [
                    'id' => $fee->payer->id,
                    'first_name' => $fee->payer->first_name,
                    'last_name' => $fee->payer->last_name,
                    'middle_name' => $fee->payer->middle_name,
                    'suffix' => $fee->payer->suffix,
                    'full_name' => $fee->payer->full_name,
                    'is_senior' => $fee->payer->is_senior,
                    'is_pwd' => $fee->payer->is_pwd,
                    'is_solo_parent' => $fee->payer->is_solo_parent,
                    'is_indigent' => $fee->payer->is_indigent,
                ];
            } elseif ($fee->payer_type === 'App\\Models\\Household') {
                $formatted['household'] = [
                    'id' => $fee->payer->id,
                    'household_number' => $fee->payer->household_number,
                    'head_name' => $fee->payer->current_head_name,
                    'member_count' => $fee->payer->member_count,
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

    /**
     * Check if fee is overdue
     */
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

    /**
     * Calculate days overdue
     */
    private function calculateDaysOverdue(Fee $fee): int
    {
        if (!$this->checkIfOverdue($fee) || !$fee->due_date) {
            return 0;
        }
        
        $dueDate = Carbon::parse($fee->due_date);
        return max(0, $dueDate->diffInDays(now(), false));
    }

    /**
     * Get payment history
     */
    private function getPaymentHistory(Fee $fee): array
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

    /**
     * Check if fee can be paid online
     */
    private function canPayOnline(Fee $fee): bool
    {
        return $fee->balance > 0 && $fee->status !== 'cancelled' && $fee->status !== 'paid';
    }

    /**
     * Get sanitized filters
     */
    private function getSanitizedFilters(Request $request): array
    {
        return $request->only(['search', 'status', 'fee_type', 'year', 'resident', 'payer_type']);
    }

    /**
     * Render empty fee page
     */
    private function renderEmptyFeePage(Request $request, string $message = 'No fees found.')
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
                'per_resident_stats' => [],
            ],
            'availableYears' => [],
            'availableFeeTypes' => [],
            'householdResidents' => [],
            'householdMembers' => [],
            'hasProfile' => false,
            'filters' => $this->getSanitizedFilters($request),
            'viewContext' => [
                'isHouseholdHead' => false,
                'currentResidentName' => null,
                'householdSize' => 0,
            ],
            'message' => $message,
        ]);
    }
}