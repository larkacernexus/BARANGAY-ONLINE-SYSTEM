<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\HouseholdMember;
use App\Models\Household;
use App\Models\User;
use App\Models\Privilege;
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
        
        // Get ALL active privileges for reference
        $allPrivileges = $this->getAllPrivileges();
        
        // Get ALL resident IDs that belong to this household
        $householdResidentIds = $this->getAllHouseholdResidentIds($currentResident);
        
        // Get the household ID if applicable
        $householdId = $currentResident->household_id;
        
        // Build query with caching for filter options
        $query = $this->buildFeeQuery($householdResidentIds, $householdId, $request);
        
        // Get filter data with caching
        $filterData = Cache::remember("resident_fee_filters_{$currentResident->id}", 300, function () use ($householdResidentIds, $householdId, $currentResident, $allPrivileges) {
            return [
                'years' => $this->getAvailableYears($householdResidentIds, $householdId),
                'fee_types' => $this->getAvailableFeeTypes($householdResidentIds, $householdId, $currentResident),
                'residents' => $this->getHouseholdResidents($householdResidentIds, $allPrivileges),
            ];
        });
        
        // Paginate results - use eager loading
        $fees = $query->paginate(15)->withQueryString();
        
        // Format fees manually
        $formattedFees = $fees->getCollection()->map(function ($fee) use ($allPrivileges) {
            // Make sure we load the feeType with its documentCategory
            if ($fee->feeType && !$fee->feeType->relationLoaded('documentCategory')) {
                $fee->feeType->load('documentCategory');
            }
            return $this->formatFeeForFrontend($fee, $allPrivileges);
        });
        
        // Replace the collection with formatted data
        $fees->setCollection($formattedFees);
        
        // Calculate stats for the entire household using actual fee data
        $stats = $this->calculateHouseholdFeeStats($householdResidentIds, $householdId, $allPrivileges);
        
        // Get household members list for reference
        $householdMembers = $this->getHouseholdMembersList($householdResidentIds, $allPrivileges);
        
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
            'allPrivileges' => $allPrivileges,
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
        
        // Get ALL active privileges for reference
        $allPrivileges = $this->getAllPrivileges();
        
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
            'payer',
            'paymentItems.payment' => function ($query) {
                $query->select('id', 'payment_date', 'or_number', 'payment_method', 'status');
            }
        ]);
        
        $formattedFee = $this->formatFeeForFrontend($fee, $allPrivileges);
        $paymentHistory = $this->getPaymentHistory($fee);
        
        // Determine which household member this fee belongs to
        $payerInfo = $this->getPayerInfo($fee, $allPrivileges);
        
        return Inertia::render('resident/Fees/Show', [
            'fee' => $formattedFee,
            'paymentHistory' => $paymentHistory,
            'canPayOnline' => $this->canPayOnline($fee),
            'payerInfo' => $payerInfo,
            'allPrivileges' => $allPrivileges,
        ]);
    }

    /**
     * Helper Methods
     */

    /**
     * Get all active privileges from database - DYNAMIC
     */
    private function getAllPrivileges(): array
    {
        return Cache::remember('all_active_privileges', 3600, function () {
            return Privilege::with('discountType')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description', 'discount_type_id'])
                ->map(function ($privilege) {
                    return [
                        'id' => $privilege->id,
                        'name' => $privilege->name,
                        'code' => $privilege->code,
                        'description' => $privilege->description,
                        'discount_type_id' => $privilege->discount_type_id,
                        'default_discount_percentage' => (float) ($privilege->discountType?->percentage ?? 0),
                        'discount_type' => $privilege->discountType ? [
                            'id' => $privilege->discountType->id,
                            'code' => $privilege->discountType->code,
                            'name' => $privilege->discountType->name,
                            'percentage' => (float) $privilege->discountType->percentage,
                            'requires_id_number' => (bool) $privilege->discountType->requires_id_number,
                            'requires_verification' => (bool) $privilege->discountType->requires_verification,
                            'verification_document' => $privilege->discountType->verification_document,
                            'validity_days' => $privilege->discountType->validity_days,
                        ] : null,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get the current active resident for the authenticated user
     */
    private function getCurrentResident(User $user): ?Resident
    {
        $cacheKey = "auth_resident_{$user->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($user) {
            if ($user->current_resident_id) {
                $resident = Resident::with(['household', 'residentPrivileges.privilege.discountType'])->find($user->current_resident_id);
                if ($resident) {
                    return $resident;
                }
            }
            
            if ($user->household_id) {
                $householdMember = HouseholdMember::where('household_id', $user->household_id)
                    ->where('is_head', true)
                    ->with(['resident.residentPrivileges.privilege.discountType'])
                    ->first();
                    
                if ($householdMember && $householdMember->resident) {
                    return $householdMember->resident;
                }
                
                $firstResident = Resident::with(['residentPrivileges.privilege.discountType'])
                    ->where('household_id', $user->household_id)
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
            
            if ($resident->household_id) {
                $householdResidents = Resident::where('household_id', $resident->household_id)
                    ->pluck('id')
                    ->toArray();
                
                $residentIds = array_unique(array_merge($residentIds, $householdResidents));
                
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
                $query->where(function ($q) use ($residentIds) {
                    $q->where('payer_type', 'App\\Models\\Resident')
                      ->whereIn('payer_id', $residentIds);
                });
                
                if ($householdId) {
                    $query->orWhere(function ($q) use ($householdId) {
                        $q->where('payer_type', 'App\\Models\\Household')
                          ->where('payer_id', $householdId);
                    });
                }
            })
            ->with([
                'feeType.documentCategory:id,name,slug',
                'payer',
            ])
            ->latest('issue_date');
        
        $this->applyFilters($query, $request, $residentIds, $householdId);
        
        return $query;
    }

    /**
     * Apply filters to the fee query
     */
    private function applyFilters($query, Request $request, array $residentIds, ?int $householdId): void
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
            if ($request->status === 'overdue') {
                $query->where('balance', '>', 0)
                      ->whereDate('due_date', '<', now())
                      ->whereNotIn('status', ['paid', 'cancelled']);
            } else {
                $query->where('status', $request->status);
            }
        }
        
        if ($request->filled('fee_type') && $request->fee_type !== 'all') {
            $query->where('fee_type_id', $request->fee_type);
        }
        
        if ($request->filled('year') && $request->year !== 'all') {
            $query->whereYear('issue_date', $request->year);
        }
        
        if ($request->filled('resident') && $request->resident !== 'all') {
            $residentId = $request->resident;
            
            if (in_array($residentId, $residentIds)) {
                $query->where(function ($q) use ($residentId) {
                    $q->where('payer_type', 'App\\Models\\Resident')
                      ->where('payer_id', $residentId);
                });
            }
        }
        
        if ($request->filled('payer_type') && $request->payer_type !== 'all') {
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
                    $q->where('payer_type', 'App\\Models\\Resident')
                      ->whereIn('payer_id', $residentIds);
                });
                
                if ($householdId) {
                    $query->orWhere(function ($q) use ($householdId) {
                        $q->where('payer_type', 'App\\Models\\Household')
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
     * Get all residents in the household for filtering - WITH PRIVILEGES
     */
    private function getHouseholdResidents(array $residentIds, array $allPrivileges): array
    {
        return Resident::query()
            ->whereIn('id', $residentIds)
            ->with(['residentPrivileges.privilege.discountType'])
            ->orderBy('first_name')
            ->get()
            ->map(function ($resident) use ($allPrivileges) {
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        $discountPercentage = $rp->discount_percentage 
                            ?? $privilege->discountType?->percentage 
                            ?? 0;
                        
                        return [
                            'code' => $privilege->code,
                            'name' => $privilege->name,
                            'discount_percentage' => (float) $discountPercentage,
                        ];
                    })
                    ->values()
                    ->toArray();

                $privilegeFlags = [];
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                }

                return array_merge([
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'suffix' => $resident->suffix,
                    'full_name' => $resident->full_name,
                    'privileges' => $activePrivileges,
                    'has_privileges' => count($activePrivileges) > 0,
                ], $privilegeFlags);
            })
            ->toArray();
    }

    /**
     * Get household members list with roles and privileges
     */
    private function getHouseholdMembersList(array $residentIds, array $allPrivileges): array
    {
        return Resident::query()
            ->whereIn('id', $residentIds)
            ->with([
                'householdMemberships' => function ($query) {
                    $query->where('is_head', true);
                },
                'residentPrivileges.privilege.discountType'
            ])
            ->get()
            ->map(function ($resident) use ($allPrivileges) {
                $isHead = $resident->householdMemberships->isNotEmpty();
                
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        $discountPercentage = $rp->discount_percentage 
                            ?? $privilege->discountType?->percentage 
                            ?? 0;
                        
                        return [
                            'code' => $privilege->code,
                            'name' => $privilege->name,
                            'discount_percentage' => (float) $discountPercentage,
                        ];
                    })
                    ->values()
                    ->toArray();

                $privilegeFlags = [];
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                }
                
                return array_merge([
                    'id' => $resident->id,
                    'full_name' => $resident->full_name,
                    'is_head' => $isHead,
                    'age' => $resident->age,
                    'gender' => $resident->gender,
                    'privileges' => $activePrivileges,
                    'has_privileges' => count($activePrivileges) > 0,
                ], $privilegeFlags);
            })
            ->toArray();
    }

    /**
     * Calculate fee statistics for the entire household
     * FIXED: Uses base_amount instead of total_amount for accurate calculations
     */
    private function calculateHouseholdFeeStats(array $residentIds, ?int $householdId, array $allPrivileges): array
    {
        $now = now();
        $currentYear = $now->year;
        
        // Get all fees for calculation
        $allFees = Fee::query()
            ->where(function ($query) use ($residentIds, $householdId) {
                $query->where(function ($q) use ($residentIds) {
                    $q->where('payer_type', 'App\\Models\\Resident')
                      ->whereIn('payer_id', $residentIds);
                });
                
                if ($householdId) {
                    $query->orWhere(function ($q) use ($householdId) {
                        $q->where('payer_type', 'App\\Models\\Household')
                          ->where('payer_id', $householdId);
                    });
                }
            })
            ->get();
        
        // Calculate totals using base_amount
        $totalAmount = $allFees->sum('base_amount');
        $totalPaid = $allFees->sum('amount_paid');
        $totalBalance = $allFees->sum(function ($fee) {
            return max(0, $fee->base_amount - $fee->amount_paid);
        });
        
        // Count by status
        $totalCount = $allFees->count();
        $pendingCount = $allFees->whereIn('status', ['pending', 'issued'])->count();
        $paidCount = $allFees->where('status', 'paid')->count();
        $issuedCount = $allFees->where('status', 'issued')->count();
        $overdueCount = $allFees->filter(function ($fee) use ($now) {
            return $fee->due_date && 
                   $fee->due_date < $now && 
                   !in_array($fee->status, ['paid', 'cancelled', 'waived']) && 
                   $fee->balance > 0;
        })->count();
        
        // Calculate amounts by status using base_amount
        $pendingAmount = $allFees->filter(function ($fee) {
            return in_array($fee->status, ['pending', 'issued']);
        })->sum(function ($fee) {
            return max(0, $fee->base_amount - $fee->amount_paid);
        });
        
        $overdueAmount = $allFees->filter(function ($fee) use ($now) {
            return $fee->due_date && 
                   $fee->due_date < $now && 
                   !in_array($fee->status, ['paid', 'cancelled', 'waived']) && 
                   $fee->balance > 0;
        })->sum(function ($fee) {
            return max(0, $fee->base_amount - $fee->amount_paid);
        });
        
        $paidAmount = $allFees->where('status', 'paid')->sum('base_amount');
        
        // Yearly stats
        $currentYearFees = $allFees->filter(function ($fee) use ($currentYear) {
            return $fee->issue_date && $fee->issue_date->year == $currentYear;
        });
        
        $currentYearTotal = $currentYearFees->sum('base_amount');
        $currentYearPaid = $currentYearFees->sum('amount_paid');
        $currentYearBalance = $currentYearFees->sum(function ($fee) {
            return max(0, $fee->base_amount - $fee->amount_paid);
        });
        
        // Payment rate
        $paymentRate = $totalAmount > 0 ? round(($totalPaid / $totalAmount) * 100, 1) : 0;
        
        // Calculate per-resident stats with privilege info
        $perResidentStats = [];
        foreach ($residentIds as $residentId) {
            $resident = Resident::with(['residentPrivileges.privilege.discountType'])->find($residentId);
            if ($resident) {
                $residentFees = $allFees->filter(function ($fee) use ($residentId) {
                    return $fee->payer_type === 'App\\Models\\Resident' && $fee->payer_id == $residentId;
                });
                
                $residentBalance = $residentFees->sum(function ($fee) {
                    return max(0, $fee->base_amount - $fee->amount_paid);
                });
                
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        $discountPercentage = $rp->discount_percentage 
                            ?? $privilege->discountType?->percentage 
                            ?? 0;
                        
                        return [
                            'code' => $privilege->code,
                            'name' => $privilege->name,
                            'discount_percentage' => (float) $discountPercentage,
                        ];
                    })
                    ->values()
                    ->toArray();

                $privilegeFlags = [];
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                }
                
                $perResidentStats[] = array_merge([
                    'resident_id' => $residentId,
                    'resident_name' => $resident->full_name,
                    'fee_count' => $residentFees->count(),
                    'balance' => (float) $residentBalance,
                    'privileges' => $activePrivileges,
                    'has_privileges' => count($activePrivileges) > 0,
                ], $privilegeFlags);
            }
        }
        
        return [
            // Counts
            'total_fees' => $totalCount,
            'pending_fees' => $pendingCount,
            'overdue_fees' => $overdueCount,
            'paid_fees' => $paidCount,
            'issued_fees' => $issuedCount,
            
            // Amounts
            'total_amount' => (float) $totalAmount,
            'total_balance' => (float) $totalBalance,
            'total_paid' => (float) $totalPaid,
            
            // Amounts by status
            'pending_amount' => (float) $pendingAmount,
            'overdue_amount' => (float) $overdueAmount,
            'paid_amount' => (float) $paidAmount,
            
            // Yearly stats
            'current_year_total' => (float) $currentYearTotal,
            'current_year_paid' => (float) $currentYearPaid,
            'current_year_balance' => (float) $currentYearBalance,
            
            // Payment rate
            'payment_rate' => $paymentRate,
            
            // Per resident stats
            'per_resident_stats' => $perResidentStats,
        ];
    }

    /**
     * Authorize fee access
     */
    private function authorizeFeeAccess(Fee $fee, array $residentIds, ?int $householdId): bool
    {
        if ($fee->payer_type === 'App\\Models\\Resident') {
            return in_array($fee->payer_id, $residentIds);
        }
        
        if ($fee->payer_type === 'App\\Models\\Household') {
            return $fee->payer_id === $householdId;
        }
        
        return false;
    }

    /**
     * Get payer information with privileges
     */
    private function getPayerInfo(Fee $fee, array $allPrivileges): array
    {
        if ($fee->payer_type === 'App\\Models\\Resident' && $fee->payer) {
            $activePrivileges = $fee->payer->residentPrivileges
                ->filter(function ($rp) {
                    return $rp->isActive();
                })
                ->map(function ($rp) {
                    $privilege = $rp->privilege;
                    $discountPercentage = $rp->discount_percentage 
                        ?? $privilege->discountType?->percentage 
                        ?? 0;
                    
                    return [
                        'code' => $privilege->code,
                        'name' => $privilege->name,
                        'id_number' => $rp->id_number,
                        'discount_percentage' => (float) $discountPercentage,
                    ];
                })
                ->values()
                ->toArray();

            $privilegeFlags = [];
            foreach ($activePrivileges as $priv) {
                $code = strtolower($priv['code']);
                $privilegeFlags["is_{$code}"] = true;
            }

            return array_merge([
                'type' => 'resident',
                'id' => $fee->payer->id,
                'name' => $fee->payer->full_name,
                'privileges' => $activePrivileges,
                'has_privileges' => count($activePrivileges) > 0,
            ], $privilegeFlags);
            
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
     * FIXED: Uses base_amount when total_amount is 0
     */
    private function formatFeeForFrontend($fee, array $allPrivileges): array
    {
        // Calculate actual total amount (use base_amount if total_amount is 0)
        $actualTotalAmount = $fee->total_amount > 0 ? $fee->total_amount : $fee->base_amount;
        $actualBalance = $fee->balance > 0 ? $fee->balance : max(0, $actualTotalAmount - $fee->amount_paid);
        
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
            'payer_type' => $displayPayerType,
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
            'total_amount' => (float) $actualTotalAmount,
            'amount_paid' => (float) $fee->amount_paid,
            'balance' => (float) max(0, $actualBalance),
            'status' => $fee->status,
            'remarks' => $fee->remarks,
            'formatted_issue_date' => $fee->issue_date?->format('M d, Y') ?? 'N/A',
            'formatted_due_date' => $fee->due_date?->format('M d, Y') ?? 'N/A',
            'formatted_total' => '₱' . number_format($actualTotalAmount, 2),
            'formatted_balance' => '₱' . number_format(max(0, $actualBalance), 2),
            'formatted_amount_paid' => '₱' . number_format($fee->amount_paid, 2),
            'is_overdue' => $this->checkIfOverdue($fee),
            'days_overdue' => $this->calculateDaysOverdue($fee),
        ];
        
        // Add payer data with privileges
        if ($fee->payer) {
            if ($fee->payer_type === 'App\\Models\\Resident') {
                $activePrivileges = $fee->payer->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        $discountPercentage = $rp->discount_percentage 
                            ?? $privilege->discountType?->percentage 
                            ?? 0;
                        
                        return [
                            'code' => $privilege->code,
                            'name' => $privilege->name,
                            'discount_percentage' => (float) $discountPercentage,
                        ];
                    })
                    ->values()
                    ->toArray();

                $privilegeFlags = [];
                foreach ($activePrivileges as $priv) {
                    $code = strtolower($priv['code']);
                    $privilegeFlags["is_{$code}"] = true;
                }

                $formatted['resident'] = array_merge([
                    'id' => $fee->payer->id,
                    'first_name' => $fee->payer->first_name,
                    'last_name' => $fee->payer->last_name,
                    'middle_name' => $fee->payer->middle_name,
                    'suffix' => $fee->payer->suffix,
                    'full_name' => $fee->payer->full_name,
                    'privileges' => $activePrivileges,
                    'has_privileges' => count($activePrivileges) > 0,
                ], $privilegeFlags);
                
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
                'total_amount' => 0,
                'total_balance' => 0,
                'total_paid' => 0,
                'pending_amount' => 0,
                'overdue_amount' => 0,
                'paid_amount' => 0,
                'current_year_total' => 0,
                'current_year_paid' => 0,
                'current_year_balance' => 0,
                'payment_rate' => 0,
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
            'allPrivileges' => $this->getAllPrivileges(),
            'message' => $message,
        ]);
    }
}