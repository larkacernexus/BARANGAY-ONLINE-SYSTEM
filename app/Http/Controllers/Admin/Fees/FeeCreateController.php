<?php

namespace App\Http\Controllers\Admin\Fees;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeeType;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Privilege;
use App\Models\ResidentPrivilege;
use Illuminate\Http\Request;
use App\Models\DocumentCategory;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FeeCreateController extends Controller
{
    // Show create form
    public function create(Request $request)
    {
        try {
            Log::info('FeeCreateController@create accessed', [
                'user_id' => Auth::id(),
                'request_params' => $request->all()
            ]);

            $resident = null;
            $household = null;
            $feeToDuplicate = null;

            // Check if we're duplicating from an existing fee
            if ($request->has('duplicate_from')) {
                $feeToDuplicate = Fee::with(['feeType', 'resident', 'household'])->find($request->duplicate_from);

                if ($feeToDuplicate) {
                    // Set pre-selected resident/household based on the duplicated fee
                    if ($feeToDuplicate->payer_type === 'resident' && $feeToDuplicate->resident) {
                        $resident = $feeToDuplicate->resident;
                    } elseif ($feeToDuplicate->payer_type === 'household' && $feeToDuplicate->household) {
                        $household = $feeToDuplicate->household;
                    }

                    Log::info('Fee duplication requested', [
                        'original_fee_id' => $feeToDuplicate->id,
                        'original_fee_code' => $feeToDuplicate->fee_code
                    ]);
                }
            }

            if ($request->has('resident_id')) {
                $resident = Resident::with(['purok', 'residentPrivileges.privilege'])->find($request->resident_id);
                Log::debug('Preselected resident', ['resident_id' => $request->resident_id]);
            }

            if ($request->has('household_id')) {
                $household = Household::with(['purok', 'householdMembers.resident'])->find($request->household_id);
                Log::debug('Preselected household', ['household_id' => $request->household_id]);
            }

            // Prepare initial data for form
            $initialData = [];
            if ($feeToDuplicate) {
                $initialData = $this->prepareDuplicateData($feeToDuplicate);
            }

            // Get ALL active privileges from database
            $allPrivileges = Privilege::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'description', 'default_discount_percentage'])
                ->map(function ($privilege) {
                    return [
                        'id' => $privilege->id,
                        'name' => $privilege->name,
                        'code' => $privilege->code,
                        'description' => $privilege->description,
                        'default_discount_percentage' => (float) $privilege->default_discount_percentage,
                    ];
                })
                ->values()
                ->toArray();

            // Get fee types with document category
            $feeTypes = FeeType::with(['documentCategory'])
                ->active()
                ->get()
                ->map(function ($type) use ($allPrivileges) {
                    $baseData = [
                        'id' => $type->id,
                        'code' => $type->code,
                        'name' => $type->name,
                        'short_name' => $type->short_name,
                        'document_category_id' => $type->document_category_id,
                        'document_category' => $type->documentCategory ? [
                            'id' => $type->documentCategory->id,
                            'name' => $type->documentCategory->name,
                            'slug' => $type->documentCategory->slug,
                            'icon' => $type->documentCategory->icon,
                            'color' => $type->documentCategory->color,
                            'description' => $type->documentCategory->description,
                            'order' => $type->documentCategory->order,
                        ] : null,
                        'base_amount' => (float) $type->base_amount,
                        'amount_type' => $type->amount_type,
                        'computation_formula' => $type->computation_formula,
                        'unit' => $type->unit,
                        
                        // Discount eligibility flags - dynamically set for all privileges
                        'is_discountable' => (bool) $type->is_discountable,
                        
                        // Surcharge fields
                        'has_surcharge' => (bool) $type->has_surcharge,
                        'surcharge_percentage' => (float) $type->surcharge_percentage,
                        'surcharge_fixed' => (float) $type->surcharge_fixed,
                        'surcharge_description' => $type->surcharge_description,
                        
                        // Penalty fields
                        'has_penalty' => (bool) $type->has_penalty,
                        'penalty_percentage' => (float) $type->penalty_percentage,
                        'penalty_fixed' => (float) $type->penalty_fixed,
                        'penalty_description' => $type->penalty_description,
                        
                        // Other fields
                        'frequency' => $type->frequency,
                        'validity_days' => $type->validity_days,
                        'applicable_to' => $type->applicable_to,
                        'applicable_puroks' => $type->applicable_puroks ?? [],
                        'requirements' => $type->requirements ?? [],
                        'effective_date' => $type->effective_date,
                        'expiry_date' => $type->expiry_date,
                        'is_mandatory' => (bool) $type->is_mandatory,
                        'auto_generate' => (bool) $type->auto_generate,
                        'due_day' => $type->due_day,
                        'sort_order' => $type->sort_order,
                        'description' => $type->description,
                        'notes' => $type->notes,
                    ];
                    
                    // Dynamically add discount fields for each privilege
                    foreach ($allPrivileges as $privilege) {
                        $code = strtolower($privilege['code']);
                        $baseData["has_{$code}_discount"] = (bool) ($type->{"has_{$code}_discount"} ?? false);
                        $baseData["{$code}_discount_percentage"] = (float) ($type->{"{$code}_discount_percentage"} ?? $privilege['default_discount_percentage'] ?? 0);
                    }
                    
                    return $baseData;
                });

            // Get residents with their privileges
            $residents = Resident::with(['purok', 'residentPrivileges.privilege'])
                ->select(['id', 'first_name', 'last_name', 'middle_name', 'suffix', 'purok_id', 'contact_number', 'birth_date', 'address'])
                ->orderBy('last_name')
                ->get()
                ->map(function ($resident) use ($allPrivileges) {
                    $age = $resident->birth_date ? Carbon::parse($resident->birth_date)->age : 0;
                    
                    // Get active privileges
                    $activePrivileges = $resident->residentPrivileges
                        ->filter(function ($rp) {
                            return $rp->isActive();
                        })
                        ->map(function ($rp) use ($allPrivileges) {
                            $privilege = $rp->privilege;
                            return [
                                'id' => $rp->id,
                                'privilege_id' => $privilege->id,
                                'code' => $privilege->code,
                                'name' => $privilege->name,
                                'id_number' => $rp->id_number,
                                'discount_percentage' => $rp->discount_percentage ?? $privilege->default_discount_percentage,
                                'expires_at' => $rp->expires_at?->format('Y-m-d'),
                                'verified_at' => $rp->verified_at?->format('Y-m-d'),
                                'is_active' => true,
                            ];
                        })
                        ->values()
                        ->toArray();

                    // Dynamically create boolean flags for each privilege
                    $privilegeFlags = [];
                    $privilegeIdNumbers = [];
                    
                    foreach ($allPrivileges as $privilege) {
                        $code = strtolower($privilege['code']);
                        $hasPrivilege = $this->hasPrivilegeCode($activePrivileges, [$privilege['code']]);
                        $privilegeFlags["is_{$code}"] = $hasPrivilege;
                        $privilegeFlags["has_{$code}"] = $hasPrivilege;
                        
                        if ($hasPrivilege) {
                            $idNumber = $this->getIdNumberForPrivilege($activePrivileges, [$privilege['code']]);
                            $privilegeIdNumbers["{$code}_id_number"] = $idNumber;
                        } else {
                            $privilegeIdNumbers["{$code}_id_number"] = null;
                        }
                    }

                    // Get discount eligibility list
                    $discountEligibilityList = $this->getDiscountEligibilityList($activePrivileges, $allPrivileges);

                    return array_merge([
                        'id' => $resident->id,
                        'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}" . ($resident->suffix ? " {$resident->suffix}" : '')),
                        'full_name' => $resident->full_name,
                        'first_name' => $resident->first_name,
                        'last_name' => $resident->last_name,
                        'middle_name' => $resident->middle_name,
                        'suffix' => $resident->suffix,
                        'purok' => $resident->purok ? $resident->purok->name : null,
                        'purok_id' => $resident->purok_id,
                        'contact_number' => $resident->contact_number,
                        'address' => $resident->address,
                        'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                        'age' => $age,
                        
                        // Full privilege data
                        'privileges' => $activePrivileges,
                        'privileges_count' => count($activePrivileges),
                        'discount_eligibility_list' => $discountEligibilityList,
                        'has_special_classification' => count($activePrivileges) > 0,
                    ], $privilegeFlags, $privilegeIdNumbers);
                });

            // Get households for bulk selection
            $households = Household::with([
                'purok',
                'householdMembers' => function ($query) {
                    $query->where('is_head', true)->with(['resident', 'resident.residentPrivileges.privilege']);
                }
            ])
                ->select(['id', 'household_number', 'purok_id', 'contact_number', 'address'])
                ->orderBy('household_number')
                ->get()
                ->map(function ($household) use ($allPrivileges) {
                    $headMember = $household->householdMembers->first();
                    $headResident = $headMember ? $headMember->resident : null;
                    
                    $headName = $headResident
                        ? $headResident->full_name
                        : 'Household #' . $household->household_number;

                    // Get head resident's privileges if available
                    $headPrivileges = [];
                    $headDiscountEligibility = [];
                    $privilegeFlags = [];
                    
                    if ($headResident && $headResident->relationLoaded('residentPrivileges')) {
                        $activePrivileges = $headResident->residentPrivileges
                            ->filter(function ($rp) {
                                return $rp->isActive();
                            })
                            ->map(function ($rp) {
                                $privilege = $rp->privilege;
                                return [
                                    'code' => $privilege->code,
                                    'name' => $privilege->name,
                                    'id_number' => $rp->id_number,
                                ];
                            })
                            ->values()
                            ->toArray();
                        
                        $headPrivileges = $activePrivileges;
                        $headDiscountEligibility = $this->getDiscountEligibilityListSimple($activePrivileges, $allPrivileges);
                        
                        // Create privilege flags for household
                        foreach ($allPrivileges as $privilege) {
                            $code = strtolower($privilege['code']);
                            $hasPrivilege = $this->hasPrivilegeCodeSimple($activePrivileges, [$privilege['code']]);
                            $privilegeFlags["head_is_{$code}"] = $hasPrivilege;
                        }
                    }

                    return array_merge([
                        'id' => $household->id,
                        'household_number' => $household->household_number,
                        'name' => $headName,
                        'purok' => $household->purok ? $household->purok->name : null,
                        'purok_id' => $household->purok_id,
                        'contact_number' => $household->contact_number,
                        'address' => $household->address,
                        'head_of_family' => $headName,
                        'head_resident_id' => $headResident?->id,
                        'member_count' => $household->householdMembers->count(),
                        'head_privileges' => $headPrivileges,
                        'head_discount_eligibility' => $headDiscountEligibility,
                        'has_discount_eligible_head' => count($headPrivileges) > 0,
                    ], $privilegeFlags);
                });

            // Prepare preselected data
            $preselectedResidentData = null;
            if ($resident) {
                $age = $resident->birth_date ? Carbon::parse($resident->birth_date)->age : 0;
                
                // Get active privileges
                $activePrivileges = $resident->residentPrivileges
                    ->filter(function ($rp) {
                        return $rp->isActive();
                    })
                    ->map(function ($rp) {
                        $privilege = $rp->privilege;
                        return [
                            'id' => $rp->id,
                            'privilege_id' => $privilege->id,
                            'code' => $privilege->code,
                            'name' => $privilege->name,
                            'id_number' => $rp->id_number,
                            'discount_percentage' => $rp->discount_percentage ?? $privilege->default_discount_percentage,
                        ];
                    })
                    ->values()
                    ->toArray();

                // Create privilege flags
                $privilegeFlags = [];
                $privilegeIdNumbers = [];
                
                foreach ($allPrivileges as $privilege) {
                    $code = strtolower($privilege['code']);
                    $hasPrivilege = $this->hasPrivilegeCode($activePrivileges, [$privilege['code']]);
                    $privilegeFlags["is_{$code}"] = $hasPrivilege;
                    
                    if ($hasPrivilege) {
                        $idNumber = $this->getIdNumberForPrivilege($activePrivileges, [$privilege['code']]);
                        $privilegeIdNumbers["{$code}_id_number"] = $idNumber;
                    } else {
                        $privilegeIdNumbers["{$code}_id_number"] = null;
                    }
                }

                $preselectedResidentData = array_merge([
                    'id' => $resident->id,
                    'name' => trim("{$resident->first_name} " . ($resident->middle_name ? $resident->middle_name[0] . '.' : '') . " {$resident->last_name}" . ($resident->suffix ? " {$resident->suffix}" : '')),
                    'full_name' => $resident->full_name,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'purok' => $resident->purok ? $resident->purok->name : null,
                    'contact_number' => $resident->contact_number,
                    'address' => $resident->address,
                    'birth_date' => $resident->birth_date ? $resident->birth_date->format('Y-m-d') : null,
                    'age' => $age,
                    
                    // Full privilege data
                    'privileges' => $activePrivileges,
                    'discount_eligibility_list' => $this->getDiscountEligibilityList($activePrivileges, $allPrivileges),
                ], $privilegeFlags, $privilegeIdNumbers);
            }

            $preselectedHouseholdData = null;
            if ($household) {
                $household->load([
                    'householdMembers' => function ($query) {
                        $query->where('is_head', true)->with(['resident', 'resident.residentPrivileges.privilege']);
                    }
                ]);

                $headMember = $household->householdMembers->first();
                $headResident = $headMember ? $headMember->resident : null;
                
                $headName = $headResident
                    ? $headResident->full_name
                    : 'Household #' . $household->household_number;

                $headPrivileges = [];
                $privilegeFlags = [];
                
                if ($headResident && $headResident->residentPrivileges) {
                    $activePrivileges = $headResident->residentPrivileges
                        ->filter(function ($rp) {
                            return $rp->isActive();
                        })
                        ->map(function ($rp) {
                            $privilege = $rp->privilege;
                            return [
                                'code' => $privilege->code,
                                'name' => $privilege->name,
                                'id_number' => $rp->id_number,
                            ];
                        })
                        ->values()
                        ->toArray();
                    
                    $headPrivileges = $activePrivileges;
                    
                    foreach ($allPrivileges as $privilege) {
                        $code = strtolower($privilege['code']);
                        $hasPrivilege = $this->hasPrivilegeCodeSimple($activePrivileges, [$privilege['code']]);
                        $privilegeFlags["head_is_{$code}"] = $hasPrivilege;
                    }
                }

                $preselectedHouseholdData = array_merge([
                    'id' => $household->id,
                    'household_number' => $household->household_number,
                    'name' => $headName,
                    'purok' => $household->purok ? $household->purok->name : null,
                    'contact_number' => $household->contact_number,
                    'address' => $household->address,
                    'head_of_family' => $headName,
                    'head_privileges' => $headPrivileges,
                    'has_discount_eligible_head' => count($headPrivileges) > 0,
                ], $privilegeFlags);
            }

            return Inertia::render('admin/Fees/Create', [
                'feeTypes' => $feeTypes,
                'residents' => $residents,
                'households' => $households,
                'preselectedResident' => $preselectedResidentData,
                'preselectedHousehold' => $preselectedHouseholdData,
                'puroks' => \App\Models\Purok::pluck('name')->filter()->values(),
                'documentCategories' => DocumentCategory::active()->ordered()->get(),
                'allPrivileges' => $allPrivileges, // Send all privileges to frontend
                'initialData' => $initialData,
                'duplicateFrom' => $feeToDuplicate ? [
                    'id' => $feeToDuplicate->id,
                    'fee_code' => $feeToDuplicate->fee_code,
                    'fee_type_name' => $feeToDuplicate->feeType->name ?? 'Unknown',
                ] : null,
            ]);

        } catch (\Exception $e) {
            Log::error('FeeCreateController@create error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to load fee creation form. Please try again.');
        }
    }

    /**
     * Check if any of the given privilege codes exist in the active privileges
     */
    private function hasPrivilegeCode(array $activePrivileges, array $codes): bool
    {
        foreach ($activePrivileges as $privilege) {
            if (in_array($privilege['code'], $codes)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Simple version for household head privileges
     */
    private function hasPrivilegeCodeSimple(array $activePrivileges, array $codes): bool
    {
        foreach ($activePrivileges as $privilege) {
            if (in_array($privilege['code'], $codes)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get ID number for a privilege code
     */
    private function getIdNumberForPrivilege(array $activePrivileges, array $codes): ?string
    {
        foreach ($activePrivileges as $privilege) {
            if (in_array($privilege['code'], $codes)) {
                return $privilege['id_number'] ?? null;
            }
        }
        return null;
    }

    /**
     * Get discount eligibility list from privileges
     */
    private function getDiscountEligibilityList(array $activePrivileges, array $allPrivileges): array
    {
        $eligibility = [];
        
        foreach ($activePrivileges as $privilege) {
            // Find the full privilege data
            $fullPrivilege = collect($allPrivileges)->firstWhere('code', $privilege['code']);
            
            $eligibility[] = [
                'type' => strtolower($privilege['code']),
                'label' => $privilege['name'],
                'percentage' => $privilege['discount_percentage'] ?? $fullPrivilege['default_discount_percentage'] ?? 0,
                'id_number' => $privilege['id_number'] ?? null,
                'has_id' => !empty($privilege['id_number']),
                'privilege_code' => $privilege['code'],
            ];
        }
        
        return $eligibility;
    }

    /**
     * Simplified version for households
     */
    private function getDiscountEligibilityListSimple(array $activePrivileges, array $allPrivileges): array
    {
        $eligibility = [];
        
        foreach ($activePrivileges as $privilege) {
            $fullPrivilege = collect($allPrivileges)->firstWhere('code', $privilege['code']);
            
            $eligibility[] = [
                'type' => strtolower($privilege['code']),
                'label' => $privilege['name'],
                'percentage' => $fullPrivilege['default_discount_percentage'] ?? 0,
            ];
        }
        
        return $eligibility;
    }

    // Prepare duplicate data helper
    private function prepareDuplicateData(Fee $fee)
    {
        return [
            'fee_type_id' => $fee->fee_type_id,
            'payer_type' => $fee->payer_type,
            'payer_id' => $fee->payer_id,
            'payer_name' => $fee->payer_name,
            'contact_number' => $fee->contact_number,
            'address' => $fee->address,
            'purok' => $fee->purok,
            'zone' => $fee->zone,
            'purpose' => $fee->purpose,
            'issue_date' => $fee->issue_date ? Carbon::parse($fee->issue_date)->format('Y-m-d') : null,
            'due_date' => $fee->due_date ? Carbon::parse($fee->due_date)->format('Y-m-d') : null,
            'base_amount' => (float) $fee->base_amount,
            'surcharge_amount' => (float) $fee->surcharge_amount,
            'penalty_amount' => (float) $fee->penalty_amount,
            'discount_amount' => (float) $fee->total_discounts,
            'total_amount' => (float) $fee->total_amount,
            'valid_from' => $fee->valid_from ? Carbon::parse($fee->valid_from)->format('Y-m-d') : null,
            'valid_until' => $fee->valid_until ? Carbon::parse($fee->valid_until)->format('Y-m-d') : null,
            'property_description' => $fee->property_description,
            'business_type' => $fee->business_type,
            'area' => $fee->area,
            'billing_period' => $fee->billing_period,
            'period_start' => $fee->period_start ? Carbon::parse($fee->period_start)->format('Y-m-d') : null,
            'period_end' => $fee->period_end ? Carbon::parse($fee->period_end)->format('Y-m-d') : null,
            'computation_details' => $fee->computation_details,
            'requirements_submitted' => $fee->requirements_submitted,
            'remarks' => $fee->remarks,
            'waiver_reason' => $fee->waiver_reason,
        ];
    }
}