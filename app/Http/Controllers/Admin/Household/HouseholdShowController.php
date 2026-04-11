<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Household;
use App\Models\Resident;
use App\Models\User;
use App\Models\Privilege;
use App\Models\Fee;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\ResidentDocument;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class HouseholdShowController extends BaseHouseholdController
{
    public function show(Household $household)
    {
        Log::info('Viewing household details', ['household_id' => $household->id]);
        
        // Load household with relationships including resident privileges and discount types
        $household->load([
            'householdMembers.resident.purok',
            'householdMembers.resident.residentPrivileges.privilege.discountType',
            'purok',
        ]);
        
        $activePrivileges = cache()->remember('active_privileges', 3600, 
            fn() => Privilege::with('discountType')
                ->where('is_active', true)
                ->get(['id', 'name', 'code', 'description', 'discount_type_id'])
        );
        
        $headMember = $household->householdMembers->firstWhere('is_head', true);
        $headResident = $headMember?->resident;
        $headId = $headResident?->id;
        
        $userAccount = null;
        $hasUserAccount = false;
        
        if ($headResident) {
            $userAccount = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            $hasUserAccount = (bool) $userAccount;
        }
        
        // Get resident IDs from household members
        $residentIds = $household->householdMembers->pluck('resident_id')->filter()->values();
        
        Log::info('Household member IDs', [
            'household_id' => $household->id,
            'household_number' => $household->household_number,
            'member_count' => $household->householdMembers->count(),
            'resident_ids' => $residentIds->toArray(),
            'members_details' => $household->householdMembers->map(function($m) {
                return [
                    'member_id' => $m->id,
                    'resident_id' => $m->resident_id,
                    'resident_name' => $m->resident->full_name ?? 'Unknown'
                ];
            })->toArray()
        ]);
        
        $userAccountsByResident = User::whereIn('resident_id', $residentIds)
            ->where('household_id', $household->id)
            ->get()
            ->keyBy('resident_id');
        
        // Calculate privilege statistics for the entire household
        $privilegeStatistics = $this->calculateHouseholdPrivilegeStatistics($household);
        
        // Calculate additional statistics for the frontend
        $demographicStatistics = $this->calculateDemographicStatistics($household);
        
        // Get fees for this household
        $fees = $this->getHouseholdFees($household, $residentIds->toArray());
        
        // Get payments for this household
        $payments = $this->getHouseholdPayments($household, $residentIds->toArray());
        
        // Get clearances for this household
        $clearances = $this->getHouseholdClearances($household, $residentIds->toArray());
        
        // Get documents for this household
        $documents = $this->getHouseholdDocuments($household, $residentIds->toArray());
        
        // Get activity logs for this household
        $activities = $this->getHouseholdActivities($household, $residentIds->toArray());
        
        // Get available residents for adding as members
        $availableResidents = $this->getAvailableResidents($household, $residentIds->toArray(), $headId);
        
        Log::info('Final data counts', [
            'fees' => count($fees),
            'payments' => count($payments),
            'clearances' => count($clearances),
            'documents' => count($documents),
            'activities' => count($activities)
        ]);
        
        return Inertia::render('admin/Households/Show', [
            'household' => $this->transformHouseholdData(
                $household, 
                $headResident, 
                $headMember, 
                $hasUserAccount, 
                $userAccount, 
                $userAccountsByResident, 
                $activePrivileges,
                $privilegeStatistics,
                $demographicStatistics
            ),
            'availableResidents' => $availableResidents,
            'headId' => $headId,
            'fees' => $fees,
            'payments' => $payments,
            'clearances' => $clearances,
            'documents' => $documents,
            'activities' => $activities,
        ]);
    }

    /**
     * Get fees for household members (polymorphic)
     */
    private function getHouseholdFees(Household $household, array $residentIds): array
    {
        Log::info('Fetching fees for household', [
            'household_id' => $household->id,
            'resident_ids' => $residentIds
        ]);
        
        if (empty($residentIds)) {
            return [];
        }
        
        // Get fees for residents
        $residentFees = Fee::where('payer_type', Resident::class)
            ->whereIn('payer_id', $residentIds)
            ->with(['feeType', 'paymentItems.payment'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get fees for household itself
        $householdFees = Fee::where('payer_type', Household::class)
            ->where('payer_id', $household->id)
            ->with(['feeType', 'paymentItems.payment'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        Log::info('Found fees', [
            'resident_fees' => $residentFees->count(),
            'household_fees' => $householdFees->count()
        ]);
        
        // Merge and sort
        $allFees = $residentFees->concat($householdFees)
            ->sortByDesc('created_at')
            ->values();
        
        return $allFees->map(function($fee) {
            $totalAmount = floatval($fee->total_amount ?? 0);
            $amountPaid = floatval($fee->amount_paid ?? 0);
            $balance = floatval($fee->balance ?? 0);
            
            return [
                'id' => $fee->id,
                'fee_code' => $fee->fee_code,
                'or_number' => $fee->or_number,
                'fee_type' => $fee->feeType ? [
                    'id' => $fee->feeType->id,
                    'name' => $fee->feeType->name,
                    'code' => $fee->feeType->code,
                ] : null,
                'total_amount' => $totalAmount,
                'amount_paid' => $amountPaid,
                'balance' => $balance,
                'status' => $fee->status,
                'issue_date' => $fee->issue_date?->toISOString(),
                'due_date' => $fee->due_date?->toISOString(),
                'description' => $fee->metadata['description'] ?? null,
                'formatted_total' => '₱' . number_format($totalAmount, 2),
                'formatted_paid' => '₱' . number_format($amountPaid, 2),
                'formatted_balance' => '₱' . number_format($balance, 2),
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get payments for household members using polymorphic relationship
     */
    private function getHouseholdPayments(Household $household, array $residentIds): array
    {
        Log::info('Fetching payments for household', [
            'household_id' => $household->id,
            'resident_ids' => $residentIds,
            'resident_ids_count' => count($residentIds)
        ]);
        
        if (empty($residentIds)) {
            return [];
        }
        
        // Use 'resident' string, not the full class name
        $residentPayments = Payment::where('payer_type', 'resident')
            ->whereIn('payer_id', $residentIds)
            ->with(['resident' => function($q) {
                $q->with(['household.purok']);
            }, 'recorder'])
            ->orderBy('payment_date', 'desc')
            ->get();
        
        Log::info('Found resident payments', [
            'count' => $residentPayments->count(),
            'payment_ids' => $residentPayments->pluck('id')->toArray(),
            'payment_or_numbers' => $residentPayments->pluck('or_number')->toArray(),
            'payment_resident_ids' => $residentPayments->pluck('payer_id')->toArray()
        ]);
        
        // Also check for household payments
        $householdPayments = Payment::where('payer_type', 'household')
            ->where('payer_id', $household->id)
            ->with(['household' => function($q) {
                $q->with('purok');
            }, 'recorder'])
            ->orderBy('payment_date', 'desc')
            ->get();
        
        // Merge and sort
        $allPayments = $residentPayments->concat($householdPayments)
            ->sortByDesc('payment_date')
            ->values();
        
        return $allPayments->map(function($payment) use ($household) {
            $totalAmount = floatval($payment->total_amount ?? 0);
            $amountPaid = floatval($payment->amount_paid ?? 0);
            $subtotal = floatval($payment->subtotal ?? 0);
            $surcharge = floatval($payment->surcharge ?? 0);
            $penalty = floatval($payment->penalty ?? 0);
            $discount = floatval($payment->discount ?? 0);
            
            $residentName = '';
            if ($payment->payer_id && $payment->payer_type === 'resident') {
                $resident = Resident::find($payment->payer_id);
                if ($resident) {
                    $residentName = $resident->full_name;
                }
            }
            
            $householdNumber = $payment->household_number ?? $household->household_number;
            $purok = $payment->purok ?? $household->purok?->name ?? 'N/A';
            $payerDisplay = $residentName ? "{$residentName} • House #{$householdNumber} • Purok {$purok}" : ($payment->payer_name ?? 'Unknown');
            
            return [
                'id' => $payment->id,
                'or_number' => $payment->or_number,
                'total_amount' => $totalAmount,
                'amount_paid' => $amountPaid,
                'payment_method' => $payment->payment_method,
                'payment_date' => $payment->payment_date?->toISOString(),
                'status' => $payment->status,
                'payer_name' => $payerDisplay,
                'payer_type' => $payment->payer_type,
                'purpose' => $payment->purpose ?? 'N/A',
                'subtotal' => $subtotal,
                'surcharge' => $surcharge,
                'penalty' => $penalty,
                'discount' => $discount,
                'discount_code' => $payment->discount_code,
                'discount_type' => $payment->discount_type,
                'household_number' => $householdNumber,
                'purok' => $purok,
                'recorded_by' => $payment->recorder ? [
                    'id' => $payment->recorder->id,
                    'name' => $payment->recorder->name,
                ] : null,
                'formatted_total' => '₱' . number_format($totalAmount, 2),
                'formatted_amount_paid' => '₱' . number_format($amountPaid, 2),
                'formatted_subtotal' => '₱' . number_format($subtotal, 2),
                'formatted_surcharge' => $surcharge > 0 ? 'Surcharge: ₱' . number_format($surcharge, 2) : null,
                'formatted_penalty' => $penalty > 0 ? 'Penalty: ₱' . number_format($penalty, 2) : null,
                'formatted_discount' => $discount > 0 ? 'Discount: ₱' . number_format($discount, 2) : null,
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get clearances for household members
     */
    private function getHouseholdClearances(Household $household, array $residentIds): array
    {
        if (empty($residentIds)) {
            return [];
        }
        
        $clearances = ClearanceRequest::whereIn('resident_id', $residentIds)
            ->with(['clearanceType', 'resident'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return $clearances->map(function($clearance) {
            return [
                'id' => $clearance->id,
                'clearance_number' => $clearance->clearance_number,
                'clearance_type' => $clearance->clearanceType ? [
                    'id' => $clearance->clearanceType->id,
                    'name' => $clearance->clearanceType->name,
                    'code' => $clearance->clearanceType->code,
                ] : null,
                'resident' => $clearance->resident ? [
                    'id' => $clearance->resident->id,
                    'full_name' => $clearance->resident->full_name,
                ] : null,
                'status' => $clearance->status,
                'purpose' => $clearance->purpose,
                'request_date' => $clearance->created_at?->toISOString(),
                'release_date' => $clearance->released_at?->toISOString(),
                'expiry_date' => $clearance->expires_at?->toISOString(),
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get documents for household members
     */
    private function getHouseholdDocuments(Household $household, array $residentIds): array
    {
        if (empty($residentIds)) {
            return [];
        }
        
        $documents = ResidentDocument::whereIn('resident_id', $residentIds)
            ->with(['resident', 'uploadedBy', 'category', 'documentType'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return $documents->map(function($doc) {
            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'file_name' => $doc->file_name,
                'file_extension' => $doc->file_extension,
                'file_size_human' => $doc->file_size_human,
                'description' => $doc->description,
                'reference_number' => $doc->reference_number,
                'issue_date' => $doc->issue_date?->toISOString(),
                'expiry_date' => $doc->expiry_date?->toISOString(),
                'tags' => $doc->tags,
                'status' => $doc->status,
                'resident' => $doc->resident ? [
                    'id' => $doc->resident->id,
                    'full_name' => $doc->resident->full_name,
                ] : null,
                'uploaded_at' => $doc->uploaded_at?->toISOString(),
                'view_count' => $doc->view_count,
                'download_count' => $doc->download_count,
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Get activity logs for the household and its members
     */
    private function getHouseholdActivities(Household $household, array $residentIds): array
    {
        // Get activities for the household itself
        $householdActivities = Activity::where('subject_type', Household::class)
            ->where('subject_id', $household->id)
            ->get();
        
        // Get activities for household members
        $memberActivities = collect();
        if (!empty($residentIds)) {
            $memberActivities = Activity::where('subject_type', Resident::class)
                ->whereIn('subject_id', $residentIds)
                ->get();
        }
        
        // Get activities caused by users related to this household
        $userActivities = Activity::where('causer_type', User::class)
            ->where('properties->household_id', $household->id)
            ->get();
        
        // Merge all activities
        $allActivities = $householdActivities
            ->concat($memberActivities)
            ->concat($userActivities)
            ->sortByDesc('created_at')
            ->take(100);
        
        return $allActivities->map(function($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'event' => $activity->event,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                ] : null,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at->toISOString(),
                'subject_type' => class_basename($activity->subject_type),
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Calculate comprehensive demographic statistics for the household
     */
    private function calculateDemographicStatistics(Household $household): array
    {
        $members = $household->householdMembers;
        $totalMembers = $members->count();
        
        // Gender counts
        $maleCount = $members->filter(fn($m) => strtolower($m->resident->gender ?? '') === 'male')->count();
        $femaleCount = $members->filter(fn($m) => strtolower($m->resident->gender ?? '') === 'female')->count();
        
        // Age groups
        $ageGroups = [
            'children' => 0,
            'adults' => 0,
            'seniors' => 0,
        ];
        
        $ages = [];
        foreach ($members as $member) {
            $age = $member->resident->age;
            if ($age !== null) {
                $ages[] = $age;
                if ($age < 18) {
                    $ageGroups['children']++;
                } elseif ($age < 60) {
                    $ageGroups['adults']++;
                } else {
                    $ageGroups['seniors']++;
                }
            }
        }
        
        $avgAge = !empty($ages) ? round(array_sum($ages) / count($ages)) : 0;
        
        // Civil status
        $civilStatus = [
            'single' => $members->filter(fn($m) => strtolower($m->resident->civil_status ?? '') === 'single')->count(),
            'married' => $members->filter(fn($m) => strtolower($m->resident->civil_status ?? '') === 'married')->count(),
            'widowed' => $members->filter(fn($m) => strtolower($m->resident->civil_status ?? '') === 'widowed')->count(),
            'divorced' => $members->filter(fn($m) => in_array(strtolower($m->resident->civil_status ?? ''), ['divorced', 'separated']))->count(),
        ];
        
        // Voter statistics
        $votersCount = $members->filter(fn($m) => $m->resident->is_voter === true)->count();
        $nonVotersCount = $totalMembers - $votersCount;
        
        // Employment statistics
        $employedCount = $members->filter(fn($m) => !empty($m->resident->occupation) && $m->resident->occupation !== 'N/A')->count();
        $unemployedCount = $totalMembers - $employedCount;
        
        // Education levels
        $educationLevels = [
            'none' => 0,
            'elementary' => 0,
            'highschool' => 0,
            'vocational' => 0,
            'college' => 0,
        ];
        
        foreach ($members as $member) {
            $education = strtolower($member->resident->education ?? '');
            if (empty($education) || $education === 'none' || $education === 'n/a') {
                $educationLevels['none']++;
            } elseif (str_contains($education, 'elementary')) {
                $educationLevels['elementary']++;
            } elseif (str_contains($education, 'high') || str_contains($education, 'secondary')) {
                $educationLevels['highschool']++;
            } elseif (str_contains($education, 'vocational') || str_contains($education, 'tech')) {
                $educationLevels['vocational']++;
            } elseif (str_contains($education, 'college') || str_contains($education, 'university')) {
                $educationLevels['college']++;
            }
        }
        
        // Members with photos
        $membersWithPhotos = $members->filter(fn($m) => !empty($m->resident->photo_path))->count();
        
        return [
            'gender' => [
                'male' => $maleCount,
                'female' => $femaleCount,
                'male_percentage' => $totalMembers > 0 ? round(($maleCount / $totalMembers) * 100) : 0,
                'female_percentage' => $totalMembers > 0 ? round(($femaleCount / $totalMembers) * 100) : 0,
            ],
            'age' => [
                'groups' => $ageGroups,
                'average' => $avgAge,
                'children_percentage' => $totalMembers > 0 ? round(($ageGroups['children'] / $totalMembers) * 100) : 0,
                'adults_percentage' => $totalMembers > 0 ? round(($ageGroups['adults'] / $totalMembers) * 100) : 0,
                'seniors_percentage' => $totalMembers > 0 ? round(($ageGroups['seniors'] / $totalMembers) * 100) : 0,
            ],
            'civil_status' => $civilStatus,
            'voters' => [
                'registered' => $votersCount,
                'non_registered' => $nonVotersCount,
                'registered_percentage' => $totalMembers > 0 ? round(($votersCount / $totalMembers) * 100) : 0,
            ],
            'employment' => [
                'employed' => $employedCount,
                'unemployed' => $unemployedCount,
                'employed_percentage' => $totalMembers > 0 ? round(($employedCount / $totalMembers) * 100) : 0,
            ],
            'education' => $educationLevels,
            'photos' => [
                'with_photos' => $membersWithPhotos,
                'without_photos' => $totalMembers - $membersWithPhotos,
            ],
        ];
    }

    /**
     * Get residents available to be added as members to this household
     */
    private function getAvailableResidents(Household $household, array $currentMemberIds, ?int $headId): array
    {
        return Resident::whereDoesntHave('householdMemberships', function($q) use ($household) {
                $q->where('is_head', true);
            })
            ->whereNotIn('id', $currentMemberIds)
            ->when($headId, function($q) use ($headId) {
                $q->where('id', '!=', $headId);
            })
            ->with(['householdMemberships' => function($q) {
                $q->with('household')->where('is_head', false);
            }, 'residentPrivileges.privilege.discountType'])
            ->select(['id', 'first_name', 'last_name', 'middle_name', 'age', 'address', 'photo_path'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function($resident) {
                $membership = $resident->householdMemberships->first();
                
                // Get active privileges for display
                $activePrivileges = $resident->residentPrivileges
                    ->filter(fn($rp) => $rp->isActive())
                    ->map(fn($rp) => [
                        'code' => $rp->privilege->code,
                        'name' => $rp->privilege->name,
                        'discount_percentage' => $rp->discount_percentage ?? $rp->privilege->discountType?->percentage ?? 0,
                    ])
                    ->values()
                    ->toArray();
                
                $householdStatus = 'none';
                $statusLabel = 'Not in any household';
                $statusColor = 'gray';
                $currentHousehold = null;
                
                if ($membership) {
                    $householdStatus = 'member';
                    $statusLabel = 'Member of Another Household';
                    $statusColor = 'purple';
                    $currentHousehold = [
                        'id' => $membership->household->id,
                        'number' => $membership->household->household_number,
                        'relationship' => $membership->relationship_to_head,
                    ];
                }
                
                $canBeAdded = true;
                $restrictionReason = $membership ? 'Will be transferred from their current household' : null;
                
                return [
                    'id' => $resident->id,
                    'first_name' => $resident->first_name,
                    'last_name' => $resident->last_name,
                    'middle_name' => $resident->middle_name,
                    'full_name' => trim($resident->first_name . ' ' . $resident->middle_name . ' ' . $resident->last_name),
                    'age' => $resident->age,
                    'address' => $resident->address,
                    'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
                    'household_status' => $householdStatus,
                    'status_label' => $statusLabel,
                    'status_color' => $statusColor,
                    'can_be_added' => $canBeAdded,
                    'restriction_reason' => $restrictionReason,
                    'current_household' => $currentHousehold,
                    'privileges' => $activePrivileges,
                    'has_privileges' => count($activePrivileges) > 0,
                ];
            })
            ->values()
            ->toArray();
    }

    private function transformHouseholdData($household, $headResident, $headMember, $hasUserAccount, $userAccount, $userAccountsByResident, $activePrivileges, $privilegeStatistics, $demographicStatistics)
    {
        return [
            'id' => $household->id,
            'household_number' => $household->household_number,
            'contact_number' => $household->contact_number,
            'email' => $household->email,
            'address' => $household->address,
            'purok' => $household->purok?->name,
            'purok_id' => $household->purok_id,
            'member_count' => $household->member_count,
            'income_range' => $household->income_range,
            'housing_type' => $household->housing_type,
            'ownership_status' => $household->ownership_status,
            'water_source' => $household->water_source,
            'electricity' => (bool) $household->electricity,
            'internet' => (bool) $household->internet,
            'vehicle' => (bool) $household->vehicle,
            'remarks' => $household->remarks,
            'status' => $household->status,
            'has_user_account' => $hasUserAccount,
            'user_account' => $userAccount ? [
                'id' => $userAccount->id,
                'username' => $userAccount->username,
                'email' => $userAccount->email,
                'status' => $userAccount->status,
                'resident_id' => $userAccount->resident_id,
                'resident_name' => $userAccount->first_name . ' ' . $userAccount->last_name,
            ] : null,
            'google_maps_url' => $household->google_maps_url,
            'latitude' => $household->latitude,
            'longitude' => $household->longitude,
            'full_address' => $household->full_address,
            'household_members' => $household->householdMembers->map(
                fn($member) => $this->transformMemberData($member, $userAccountsByResident)
            )->values()->toArray(),
            'created_at' => $household->created_at->toISOString(),
            'updated_at' => $household->updated_at->toISOString(),
            'privilege_statistics' => $privilegeStatistics,
            'demographic_statistics' => $demographicStatistics,
        ];
    }

    private function transformMemberData($member, $userAccountsByResident)
    {
        $resident = $member->resident;
        
        $privileges = $resident->residentPrivileges
            ->map(fn($rp) => $this->transformPrivilegeData($rp))
            ->values()
            ->toArray();
        
        return [
            'id' => $member->id,
            'resident_id' => $member->resident_id,
            'relationship_to_head' => $member->relationship_to_head,
            'is_head' => (bool) $member->is_head,
            'created_at' => $member->created_at?->toISOString(),
            'updated_at' => $member->updated_at?->toISOString(),
            'resident' => array_merge(
                $this->getResidentBaseData($resident),
                [
                    'has_user_account' => $userAccountsByResident->has($resident->id),
                    'privileges_list' => $privileges,
                    'privileges_count' => count($privileges),
                    'active_privileges_count' => collect($privileges)->filter(fn($p) => $p['status'] === 'active')->count(),
                    'has_photo' => !empty($resident->photo_path),
                ]
            )
        ];
    }

    /**
     * Transform privilege data - FIXED: Uses discountType relationship for percentage
     */
    private function transformPrivilegeData($residentPrivilege): array
    {
        $privilege = $residentPrivilege->privilege;
        $discountType = $privilege?->discountType;
        $now = Carbon::now();
        $expiresAt = $residentPrivilege->expires_at ? Carbon::parse($residentPrivilege->expires_at) : null;
        
        $status = $this->determinePrivilegeStatus($residentPrivilege, $now, $expiresAt);
        
        // Get discount percentage from pivot, privilege's discount type, or default 0
        $discountPercentage = $residentPrivilege->discount_percentage 
            ?? ($discountType ? $discountType->percentage : 0)
            ?? 0;
        
        return [
            'id' => $residentPrivilege->id,
            'name' => $privilege->name,
            'code' => $privilege->code,
            'description' => $privilege->description,
            'id_number' => $residentPrivilege->id_number,
            'verified_at' => $residentPrivilege->verified_at?->toISOString(),
            'expires_at' => $residentPrivilege->expires_at?->toISOString(),
            'remarks' => $residentPrivilege->remarks,
            'status' => $status,
            'discount_percentage' => (float) $discountPercentage,
            'privilege_id' => $privilege->id,
            'privilege_name' => $privilege->name,
            'privilege_code' => $privilege->code,
            'privilege_description' => $privilege->description,
            'requires_id_number' => (bool) ($discountType?->requires_id_number ?? false),
            'requires_verification' => (bool) ($discountType?->requires_verification ?? false),
            'validity_days' => $discountType?->validity_days ?? 0,
            'created_at' => $residentPrivilege->created_at?->toISOString(),
            'updated_at' => $residentPrivilege->updated_at?->toISOString(),
            'discount_type' => $discountType ? [
                'id' => $discountType->id,
                'name' => $discountType->name,
                'code' => $discountType->code,
                'percentage' => (float) $discountType->percentage,
            ] : null,
        ];
    }

    private function determinePrivilegeStatus($residentPrivilege, $now, $expiresAt): string
    {
        if (!$residentPrivilege->verified_at) {
            return 'pending';
        }

        if (!$expiresAt) {
            return 'active';
        }

        if ($now->greaterThan($expiresAt)) {
            return 'expired';
        }

        $daysUntilExpiry = $now->diffInDays($expiresAt, false);
        
        if ($daysUntilExpiry <= 30) {
            return 'expiring_soon';
        }

        return 'active';
    }

    private function calculateHouseholdPrivilegeStatistics($household): array
    {
        $allPrivileges = [];
        $privilegeCounts = [];
        
        foreach ($household->householdMembers as $member) {
            $resident = $member->resident;
            foreach ($resident->residentPrivileges as $rp) {
                $privilegeData = $this->transformPrivilegeData($rp);
                $allPrivileges[] = $privilegeData;
                
                if (in_array($privilegeData['status'], ['active', 'expiring_soon'])) {
                    $code = $privilegeData['code'];
                    $privilegeCounts[$code] = ($privilegeCounts[$code] ?? 0) + 1;
                }
            }
        }
        
        $statusCounts = [
            'active' => collect($allPrivileges)->where('status', 'active')->count(),
            'expiring_soon' => collect($allPrivileges)->where('status', 'expiring_soon')->count(),
            'expired' => collect($allPrivileges)->where('status', 'expired')->count(),
            'pending' => collect($allPrivileges)->where('status', 'pending')->count(),
        ];
        
        return [
            'total' => count($allPrivileges),
            'by_status' => $statusCounts,
            'by_code' => $privilegeCounts,
            'members_with_privileges' => $household->householdMembers
                ->filter(fn($m) => $m->resident->residentPrivileges->count() > 0)
                ->count(),
        ];
    }

    protected function getResidentBaseData(Resident $resident): array
    {
        // Get active privileges for the resident
        $activePrivileges = $resident->residentPrivileges
            ->filter(fn($rp) => $rp->isActive())
            ->map(fn($rp) => [
                'code' => $rp->privilege->code,
                'name' => $rp->privilege->name,
                'discount_percentage' => $rp->discount_percentage ?? $rp->privilege->discountType?->percentage ?? 0,
            ])
            ->values()
            ->toArray();
        
        return [
            'id' => $resident->id,
            'first_name' => $resident->first_name,
            'last_name' => $resident->last_name,
            'middle_name' => $resident->middle_name,
            'suffix' => $resident->suffix,
            'full_name' => $resident->full_name,
            'age' => $resident->age,
            'gender' => $resident->gender,
            'civil_status' => $resident->civil_status,
            'contact_number' => $resident->contact_number,
            'email' => $resident->email,
            'occupation' => $resident->occupation,
            'education' => $resident->education,
            'religion' => $resident->religion,
            'is_voter' => (bool) $resident->is_voter,
            'place_of_birth' => $resident->place_of_birth,
            'purok' => $resident->purok?->name,
            'purok_id' => $resident->purok_id,
            'address' => $resident->address,
            'photo_path' => $resident->photo_path,
            'photo_url' => $resident->photo_path ? Storage::url($resident->photo_path) : null,
            'has_photo' => !empty($resident->photo_path),
            'is_head_of_household' => $resident->isHeadOfHousehold(),
            'has_user_account' => false,
            'created_at' => $resident->created_at?->toISOString(),
            'updated_at' => $resident->updated_at?->toISOString(),
            'privileges' => $activePrivileges,
            'has_privileges' => count($activePrivileges) > 0,
        ];
    }
}