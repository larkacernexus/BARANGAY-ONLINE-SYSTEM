<?php

namespace App\Services;

use App\Models\Resident;
use App\Models\DiscountType;
use App\Models\Privilege;
use Illuminate\Support\Facades\Log;

class SimpleDiscountService
{
    /**
     * Calculate discount for a resident
     * 
     * @param Resident $resident
     * @param float $totalAmount
     * @param mixed $feeType (optional)
     * @return array
     */
    public function calculateDiscount($resident, $totalAmount, $feeType = null)
    {
        if (!$resident) {
            return $this->emptyDiscountResult($totalAmount);
        }

        // Get all valid discount types that this resident qualifies for
        $applicableDiscountTypes = $this->getApplicableDiscountTypes($resident);
        
        if ($applicableDiscountTypes->isEmpty()) {
            return $this->emptyDiscountResult($totalAmount);
        }

        $totalDiscount = 0;
        $appliedDiscounts = [];
        $remainingAmount = $totalAmount;

        foreach ($applicableDiscountTypes as $discountType) {
            // Get the resident privilege for this discount type to get ID number and custom percentage
            $residentPrivilege = $this->getResidentPrivilegeForDiscountType($resident, $discountType);
            
            // ✅ FIXED: Use 'percentage' instead of 'default_percentage'
            $discountPercentage = $residentPrivilege && $residentPrivilege->discount_percentage 
                ? $residentPrivilege->discount_percentage 
                : $discountType->percentage;
            
            // Calculate discount amount
            $discountAmount = $remainingAmount * ($discountPercentage / 100);
            
            // Don't exceed remaining amount
            if ($discountAmount > $remainingAmount) {
                $discountAmount = $remainingAmount;
            }
            
            $totalDiscount += $discountAmount;
            $remainingAmount -= $discountAmount;
            
            // Get the privilege details for this discount type
            $privilege = Privilege::where('discount_type_id', $discountType->id)->first();
            
            $appliedDiscounts[] = [
                'code' => $discountType->code,
                'name' => $discountType->name,
                'percentage' => $discountPercentage,
                'amount' => $discountAmount,
                'id_number' => $residentPrivilege ? $residentPrivilege->id_number : null,
                'privilege_name' => $privilege ? $privilege->name : $discountType->name,
                'privilege_code' => $privilege ? $privilege->code : $discountType->code,
                'discount_type_id' => $discountType->id,
                // ✅ Added verification requirements from DiscountType
                'requires_id_number' => $discountType->requires_id_number,
                'requires_verification' => $discountType->requires_verification,
                'verification_document' => $discountType->verification_document,
            ];
            
            // Stop if fully discounted
            if ($remainingAmount <= 0) {
                break;
            }
        }

        return [
            'discount_amount' => $totalDiscount,
            'final_amount' => $totalAmount - $totalDiscount,
            'original_amount' => $totalAmount,
            'discount_percentage' => $totalAmount > 0 ? ($totalDiscount / $totalAmount) * 100 : 0,
            'applied_discounts' => $appliedDiscounts,
            'has_discount' => $totalDiscount > 0,
        ];
    }

    /**
     * Get applicable discount types for a resident
     * Uses the relationship: Resident -> ResidentPrivilege -> Privilege -> DiscountType
     */
    private function getApplicableDiscountTypes($resident)
    {
        $discountTypes = collect();
        
        // Get all active resident privileges with their discount types
        $activeResidentPrivileges = $resident->residentPrivileges()
            ->with(['privilege.discountType'])
            ->whereNotNull('verified_at')
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->get();
        
        // Extract discount types from active privileges
        foreach ($activeResidentPrivileges as $rp) {
            $privilege = $rp->privilege;
            
            // Check if privilege has a discount type
            if ($privilege && $privilege->discountType && $privilege->discountType->is_active) {
                // Avoid duplicates
                if (!$discountTypes->contains('id', $privilege->discountType->id)) {
                    $discountTypes->push($privilege->discountType);
                }
            }
        }
        
        // ✅ FIXED: Check for automatic eligibility by age (Senior Citizen)
        // This is for residents who haven't been verified but are eligible by age
        if ($resident->age >= 60) {
            $seniorDiscount = DiscountType::where('code', 'SENIOR')
                ->where('is_active', true)
                ->first();
            if ($seniorDiscount && !$discountTypes->contains('id', $seniorDiscount->id)) {
                // Check if resident has a pending or active senior privilege
                $hasSeniorPrivilege = $resident->residentPrivileges()
                    ->whereHas('privilege', function($q) {
                        $q->where('code', 'SENIOR');
                    })
                    ->exists();
                
                if (!$hasSeniorPrivilege) {
                    $discountTypes->push($seniorDiscount);
                }
            }
        }
        
        // Sort by priority (lowest number = highest priority)
        return $discountTypes->sortBy('priority');
    }

    /**
     * Get resident privilege for a specific discount type
     */
    private function getResidentPrivilegeForDiscountType($resident, DiscountType $discountType)
    {
        // First try to find privilege that has this discount type
        $privilege = Privilege::where('discount_type_id', $discountType->id)->first();
        
        if (!$privilege) {
            return null;
        }
        
        return $resident->residentPrivileges()
            ->where('privilege_id', $privilege->id)
            ->whereNotNull('verified_at')
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    /**
     * Get resident's ID number for a specific discount type
     */
    public function getResidentIdNumber($resident, $discountCode)
    {
        $discountType = DiscountType::where('code', $discountCode)->first();
        
        if (!$discountType) {
            return null;
        }
        
        $residentPrivilege = $this->getResidentPrivilegeForDiscountType($resident, $discountType);
        
        return $residentPrivilege ? $residentPrivilege->id_number : null;
    }

    /**
     * Check if a resident has a valid ID for a discount type
     */
    public function hasValidIdForDiscount($resident, $discountCode): bool
    {
        $discountType = DiscountType::where('code', $discountCode)->first();
        
        if (!$discountType) {
            return false;
        }
        
        // If discount doesn't require ID, return true
        if (!$discountType->requires_id_number) {
            return true;
        }
        
        $residentPrivilege = $this->getResidentPrivilegeForDiscountType($resident, $discountType);
        
        return $residentPrivilege && !empty($residentPrivilege->id_number);
    }

    /**
     * Get applicable discounts for a specific fee/clearance type
     * This filters discounts that are applicable to specific fee types
     */
    public function getApplicableDiscountsForFeeType($resident, $feeType)
    {
        if (!$resident || !$feeType) {
            return [];
        }
        
        $allApplicableDiscounts = $this->getApplicableDiscountTypes($resident);
        $applicableDiscounts = [];
        
        foreach ($allApplicableDiscounts as $discountType) {
            // Check if this discount type is applicable to the fee type
            $isApplicable = $this->isDiscountApplicableToFeeType($discountType, $feeType);
            
            if ($isApplicable) {
                $residentPrivilege = $this->getResidentPrivilegeForDiscountType($resident, $discountType);
                $privilege = Privilege::where('discount_type_id', $discountType->id)->first();
                
                $applicableDiscounts[] = [
                    'code' => $discountType->code,
                    'name' => $discountType->name,
                    'percentage' => $residentPrivilege && $residentPrivilege->discount_percentage 
                        ? $residentPrivilege->discount_percentage 
                        : $discountType->percentage,
                    'id_number' => $residentPrivilege ? $residentPrivilege->id_number : null,
                    'privilege_name' => $privilege ? $privilege->name : $discountType->name,
                    'privilege_code' => $privilege ? $privilege->code : $discountType->code,
                    'discount_type_id' => $discountType->id,
                    // ✅ Added verification requirements
                    'requires_id_number' => $discountType->requires_id_number,
                    'requires_verification' => $discountType->requires_verification,
                    'verification_document' => $discountType->verification_document,
                    'validity_days' => $discountType->validity_days,
                ];
            }
        }
        
        return $applicableDiscounts;
    }

    /**
     * Check if discount is applicable to a specific fee type
     * Override this method to implement fee type specific logic
     */
    protected function isDiscountApplicableToFeeType($discountType, $feeType)
    {
        // Check if discount type has fee type restrictions via discount_fee_types table
        if ($feeType && method_exists($discountType, 'feeTypes')) {
            return $discountType->feeTypes()
                ->where('fee_type_id', $feeType->id)
                ->where('is_active', true)
                ->exists();
        }
        
        // Default: discount applies to all fee types
        return true;
    }

    /**
     * Return empty discount result
     */
    private function emptyDiscountResult($totalAmount)
    {
        return [
            'discount_amount' => 0,
            'final_amount' => $totalAmount,
            'original_amount' => $totalAmount,
            'discount_percentage' => 0,
            'applied_discounts' => [],
            'has_discount' => false,
        ];
    }
}