<?php

namespace App\Http\Controllers\Admin\Household;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Household;
use App\Models\User;
use App\Models\Privilege;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class HouseholdShowController extends BaseHouseholdController
{
    public function show(Household $household)
    {
        Log::info('Viewing household details', ['household_id' => $household->id]);
        
        // Load household with relationships including resident privileges
        $household->load([
            'householdMembers.resident.purok',
            'householdMembers.resident.residentPrivileges.privilege.discountType',
            'purok',
        ]);
        
        $activePrivileges = cache()->remember('active_privileges', 3600, 
            fn() => Privilege::where('is_active', true)->get()
        );
        
        $headMember = $household->householdMembers->firstWhere('is_head', true);
        $headResident = $headMember?->resident;
        
        $userAccount = null;
        $hasUserAccount = false;
        
        if ($headResident) {
            $userAccount = User::where('resident_id', $headResident->id)
                ->where('household_id', $household->id)
                ->first();
            $hasUserAccount = (bool) $userAccount;
        }
        
        $residentIds = $household->householdMembers->pluck('resident_id')->filter();
        $userAccountsByResident = User::whereIn('resident_id', $residentIds)
            ->where('household_id', $household->id)
            ->get()
            ->keyBy('resident_id');
        
        // Calculate privilege statistics for the entire household
        $privilegeStatistics = $this->calculateHouseholdPrivilegeStatistics($household);
        
        return Inertia::render('admin/Households/Show', [
            'household' => $this->transformHouseholdData(
                $household, 
                $headResident, 
                $headMember, 
                $hasUserAccount, 
                $userAccount, 
                $userAccountsByResident, 
                $activePrivileges,
                $privilegeStatistics
            ),
        ]);
    }

    private function transformHouseholdData($household, $headResident, $headMember, $hasUserAccount, $userAccount, $userAccountsByResident, $activePrivileges, $privilegeStatistics)
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
            'household_members' => $household->householdMembers->map(
                fn($member) => $this->transformMemberData($member, $userAccountsByResident)
            )->values()->toArray(),
            'created_at' => $household->created_at->toISOString(),
            'updated_at' => $household->updated_at->toISOString(),
            // Add privilege statistics
            'privilege_statistics' => $privilegeStatistics,
        ];
    }

    private function transformMemberData($member, $userAccountsByResident)
    {
        $resident = $member->resident;
        
        // Transform resident privileges
        $privileges = $resident->residentPrivileges
            ->map(fn($rp) => $this->transformPrivilegeData($rp))
            ->values()
            ->toArray();
        
        return [
            'id' => $member->id,
            'resident_id' => $member->resident_id,
            'relationship_to_head' => $member->relationship_to_head,
            'is_head' => (bool) $member->is_head,
            'resident' => array_merge(
                $this->getResidentBaseData($resident), // This now calls parent method
                [
                    'has_user_account' => $userAccountsByResident->has($resident->id),
                    'privileges_list' => $privileges,
                    'privileges_count' => count($privileges),
                    'active_privileges_count' => collect($privileges)->filter(fn($p) => $p['status'] === 'active')->count(),
                ]
            )
        ];
    }

    /**
     * Transform a single resident privilege for the frontend
     */
    private function transformPrivilegeData($residentPrivilege): array
    {
        $privilege = $residentPrivilege->privilege;
        $now = Carbon::now();
        $expiresAt = $residentPrivilege->expires_at ? Carbon::parse($residentPrivilege->expires_at) : null;
        
        // Determine privilege status
        $status = $this->determinePrivilegeStatus($residentPrivilege, $now, $expiresAt);
        
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
            'discount_percentage' => $residentPrivilege->discount_percentage ?? $privilege->default_discount_percentage,
            'privilege_id' => $privilege->id,
            'privilege_name' => $privilege->name,
            'privilege_code' => $privilege->code,
            'privilege_description' => $privilege->description,
            'requires_id_number' => (bool) $privilege->requires_id_number,
            'requires_verification' => (bool) $privilege->requires_verification,
            'validity_years' => $privilege->validity_years,
            'discount_type' => $privilege->discountType ? [
                'id' => $privilege->discountType->id,
                'name' => $privilege->discountType->name,
                'code' => $privilege->discountType->code,
            ] : null,
        ];
    }

    /**
     * Determine the status of a privilege
     */
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

    /**
     * Calculate privilege statistics for the entire household
     */
    private function calculateHouseholdPrivilegeStatistics($household): array
    {
        $allPrivileges = [];
        $privilegeCounts = [];
        
        foreach ($household->householdMembers as $member) {
            $resident = $member->resident;
            foreach ($resident->residentPrivileges as $rp) {
                $privilegeData = $this->transformPrivilegeData($rp);
                $allPrivileges[] = $privilegeData;
                
                // Count by privilege code for active or expiring soon privileges
                if (in_array($privilegeData['status'], ['active', 'expiring_soon'])) {
                    $code = $privilegeData['code'];
                    $privilegeCounts[$code] = ($privilegeCounts[$code] ?? 0) + 1;
                }
            }
        }
        
        // Count by status
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
}