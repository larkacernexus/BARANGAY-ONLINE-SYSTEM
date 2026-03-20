<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Privilege;
use App\Models\Purok;
use Carbon\Carbon;

abstract class BaseResidentController extends Controller
{
    /**
     * Generate resident ID
     */
    protected function generateResidentId(): string
    {
        $year = now()->format('Y');
        $lastResident = Resident::whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->first();
        
        if ($lastResident && str_contains($lastResident->resident_id, 'BRGY-' . $year)) {
            $lastNumber = intval(substr($lastResident->resident_id, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        return 'BRGY-' . $year . '-' . $newNumber;
    }

    /**
     * Get puroks for select dropdown
     */
    protected function getPuroksForSelect(): array
    {
        return Purok::active()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($purok) => [
                'id' => $purok->id,
                'name' => $purok->name,
            ])
            ->toArray();
    }

    /**
     * Get civil status options
     */
    protected function getCivilStatusOptions(): array
    {
        return [
            ['value' => 'single', 'label' => 'Single'],
            ['value' => 'married', 'label' => 'Married'],
            ['value' => 'widowed', 'label' => 'Widowed'],
            ['value' => 'separated', 'label' => 'Separated'],
        ];
    }

    /**
     * Get gender options
     */
    protected function getGenderOptions(): array
    {
        return [
            ['value' => 'male', 'label' => 'Male'],
            ['value' => 'female', 'label' => 'Female'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }

    /**
     * Get education options
     */
    protected function getEducationOptions(): array
    {
        return [
            ['value' => 'none', 'label' => 'No Formal Education'],
            ['value' => 'elementary', 'label' => 'Elementary'],
            ['value' => 'high_school', 'label' => 'High School'],
            ['value' => 'college', 'label' => 'College'],
            ['value' => 'vocational', 'label' => 'Vocational'],
            ['value' => 'postgraduate', 'label' => 'Postgraduate'],
        ];
    }

    /**
     * Get relationship options
     */
    protected function getRelationshipOptions(): array
    {
        return [
            ['value' => 'head', 'label' => 'Head of Household'],
            ['value' => 'spouse', 'label' => 'Spouse'],
            ['value' => 'son', 'label' => 'Son'],
            ['value' => 'daughter', 'label' => 'Daughter'],
            ['value' => 'father', 'label' => 'Father'],
            ['value' => 'mother', 'label' => 'Mother'],
            ['value' => 'brother', 'label' => 'Brother'],
            ['value' => 'sister', 'label' => 'Sister'],
            ['value' => 'grandfather', 'label' => 'Grandfather'],
            ['value' => 'grandmother', 'label' => 'Grandmother'],
            ['value' => 'grandson', 'label' => 'Grandson'],
            ['value' => 'granddaughter', 'label' => 'Granddaughter'],
            ['value' => 'uncle', 'label' => 'Uncle'],
            ['value' => 'aunt', 'label' => 'Aunt'],
            ['value' => 'nephew', 'label' => 'Nephew'],
            ['value' => 'niece', 'label' => 'Niece'],
            ['value' => 'cousin', 'label' => 'Cousin'],
            ['value' => 'son_in_law', 'label' => 'Son-in-law'],
            ['value' => 'daughter_in_law', 'label' => 'Daughter-in-law'],
            ['value' => 'father_in_law', 'label' => 'Father-in-law'],
            ['value' => 'mother_in_law', 'label' => 'Mother-in-law'],
            ['value' => 'other_relative', 'label' => 'Other Relative'],
            ['value' => 'non_relative', 'label' => 'Non-relative'],
        ];
    }

    /**
     * Get privilege category
     */
    protected function getPrivilegeCategory($privilege): string
    {
        $code = strtoupper($privilege->code);
        
        if (in_array($code, ['SC', 'OSP'])) {
            return 'Senior Citizen';
        } elseif ($code === 'PWD') {
            return 'Disability';
        } elseif (in_array($code, ['4PS', 'IND', 'UNE'])) {
            return 'Social Welfare';
        } elseif ($code === 'SP') {
            return 'Family';
        } elseif (in_array($code, ['IP', 'INDIGENOUS'])) {
            return 'Indigenous';
        } elseif (in_array($code, ['FRM', 'FSH'])) {
            return 'Livelihood';
        } elseif ($code === 'OFW') {
            return 'Overseas';
        } elseif ($code === 'SCH') {
            return 'Education';
        } else {
            return 'Other';
        }
    }

    /**
     * Format privilege data
     */
    protected function formatPrivilege($residentPrivilege): array
    {
        $privilege = $residentPrivilege->privilege;
        
        $status = 'pending';
        if ($residentPrivilege->verified_at) {
            if ($residentPrivilege->expires_at && $residentPrivilege->expires_at->isPast()) {
                $status = 'expired';
            } elseif ($residentPrivilege->expires_at && $residentPrivilege->expires_at->diffInDays(now()) <= 30) {
                $status = 'expiring_soon';
            } else {
                $status = 'active';
            }
        }

        return [
            'id' => $residentPrivilege->id,
            'resident_privilege_id' => $residentPrivilege->id,
            'privilege_id' => $privilege->id,
            'name' => $privilege->name,
            'code' => $privilege->code,
            'description' => $privilege->description,
            'discount_percentage' => $residentPrivilege->discount_percentage ?? $privilege->default_discount_percentage,
            'id_number' => $residentPrivilege->id_number,
            'verified_at' => $residentPrivilege->verified_at?->toISOString(),
            'expires_at' => $residentPrivilege->expires_at?->toISOString(),
            'remarks' => $residentPrivilege->remarks,
            'status' => $status,
            'is_active' => $residentPrivilege->isActive(),
            'requires_id_number' => $privilege->requires_id_number,
            'requires_verification' => $privilege->requires_verification,
            'validity_years' => $privilege->validity_years,
        ];
    }
}