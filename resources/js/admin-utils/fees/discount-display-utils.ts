// admin-utils/fees/discount-display-utils.ts

/**
 * DISCOUNT DISPLAY UTILITIES
 * 
 * PURPOSE: Informational display only for fee creation forms
 * 
 * IMPORTANT: 
 * - These functions ONLY show what discounts MAY be available
 * - NO discounts are applied during fee creation
 * - Actual discount application requires ID verification at payment time
 */

import { FeeType, DiscountRule, Resident, DiscountTypeCode } from '@/types/fees';

// ============================================
// CORE UTILITY FUNCTIONS
// ============================================

// Format currency with peso sign
export const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined || amount === '') return '₱0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '₱0.00';
    return '₱' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Safe number parsing
export const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '' || value === 'null') return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

// Safe string conversion
export const safeString = (value: any): string => {
    if (value === null || value === undefined || value === 'null') return '';
    return String(value);
};

// Calculate total amount (NO DISCOUNT LOGIC)
export const calculateTotalAmount = (
    base: number,
    surcharge: number = 0,
    penalty: number = 0
): number => {
    const total = parseNumber(base) + parseNumber(surcharge) + parseNumber(penalty);
    return Math.max(0, total);
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Validate fee form data for submission
export const validateFeeForm = (data: any, bulkType: string): string | null => {
    if (!data.fee_type_id) {
        return 'Please select a fee type';
    }

    if (bulkType === 'none') {
        if (!data.payer_type || data.payer_type === '') {
            return 'Please select a payer type';
        }
        
        if (data.payer_type === 'App\\Models\\Resident' && !data.resident_id) {
            return 'Please select a resident';
        }
        
        if (data.payer_type === 'App\\Models\\Household' && !data.household_id) {
            return 'Please select a household';
        }
        
        if (data.payer_type === 'business' && !data.business_name) {
            return 'Please enter business name';
        }
        
        if ((data.payer_type === 'visitor' || data.payer_type === 'other') && !data.payer_name) {
            return 'Please enter payer name';
        }
    }

    if (bulkType === 'custom' && data.custom_payers) {
        const invalidPayers = data.custom_payers.filter((p: any) => !p.name?.trim());
        if (invalidPayers.length > 0) {
            return 'Please enter names for all custom payers';
        }
    }

    return null;
};

// Generate bulk creation summary message
export const getBulkCreationSummary = (
    count: number,
    totalAmount: number,
    bulkType: string
): string => {
    const typeLabel = bulkType === 'residents' ? 'residents' : 
                     bulkType === 'households' ? 'households' : 'payers';
    
    return `You are about to create fees for ${count} ${typeLabel}.\n` +
           `• Total amount: ${formatCurrency(totalAmount)}\n` +
           `• Average per payer: ${formatCurrency(totalAmount / count)}\n\n` +
           `Note: Discounts will be applied during payment upon ID verification, as required by Philippine law (RA 9994, RA 10754, RA 8972).\n\n` +
           `Do you want to proceed?`;
};

// ============================================
// PHILIPPINE DISCOUNT LAWS (Display Only)
// ============================================

export const PHILIPPINE_DISCOUNT_LAWS = {
    SENIOR: {
        code: 'RA 9994',
        name: 'Expanded Senior Citizens Act of 2010',
        maxPercentage: 20,
        description: 'For senior citizens aged 60 and above',
        requirements: ['Valid Senior Citizen ID', 'Age 60+'] as string[],
        discountType: 'SENIOR' as DiscountTypeCode,
    },
    PWD: {
        code: 'RA 10754',
        name: 'Expanded PWD Benefits Act',
        maxPercentage: 20,
        description: 'For Persons With Disabilities',
        requirements: ['Valid PWD ID'] as string[],
        discountType: 'PWD' as DiscountTypeCode,
    },
    SOLO_PARENT: {
        code: 'RA 8972',
        name: 'Solo Parents Welfare Act of 2000',
        maxPercentage: 10,
        description: 'For solo parents',
        requirements: ['Valid Solo Parent ID'] as string[],
        discountType: 'SOLO_PARENT' as DiscountTypeCode,
    },
    INDIGENT: {
        code: 'Local Ordinance',
        name: 'Social Reform and Poverty Alleviation Act',
        maxPercentage: 20,
        description: 'For indigent families',
        requirements: ['Certificate of Indigency'] as string[],
        discountType: 'INDIGENT' as DiscountTypeCode,
    },
} as const;

// ============================================
// DISCOUNT DISPLAY FUNCTIONS
// ============================================

// Define badge type
export type BadgeType = 'senior' | 'pwd' | 'solo_parent' | 'indigent' | 'veteran' | 'student';

export interface EligibilityBadge {
    label: string;
    type: BadgeType;
    icon: string;
    color: string;
}

// Get active discount rules for display
export const getActiveDiscountsForDisplay = (
    discountRules: DiscountRule[] = []
): DiscountRule[] => {
    const now = new Date().toISOString().split('T')[0];
    
    return discountRules.filter(rule => 
        rule.is_active && 
        (!rule.effective_date || rule.effective_date <= now) &&
        (!rule.expiry_date || rule.expiry_date >= now)
    ).sort((a, b) => a.priority - b.priority);
};

// Get discounts applicable to a fee type (MAIN FUNCTION YOU NEED)
export const getDiscountsForFeeType = (
    feeType: FeeType | null,
    discountRules: DiscountRule[] = []
): DiscountRule[] => {
    if (!feeType || !feeType.is_discountable) return [];
    
    return getActiveDiscountsForDisplay(discountRules).filter(rule => 
        rule.applicable_to === 'all' || 
        rule.applicable_to === 'resident' || 
        rule.applicable_to === null
    );
};

// ALIAS for backward compatibility - this fixes your import error!
export const getActiveDiscountsForFeeType = getDiscountsForFeeType;

// Get discount note for special combinations
export const getDiscountNote = (
    discountCodes: string[],
): { note: string; type: 'info' | 'warning' | 'error' } => {
    if (discountCodes.length < 2) return { note: '', type: 'info' };

    const hasSeniorDiscount = discountCodes.includes('SENIOR');
    const hasPWDDiscount = discountCodes.includes('PWD');

    if (hasSeniorDiscount && hasPWDDiscount) {
        return {
            note: 'Philippine Law (RA 9994 & RA 10754): Senior Citizen and PWD discounts cannot be combined cumulatively. Maximum discount applied: 20%.',
            type: 'warning',
        };
    }

    return { note: '', type: 'info' };
};

// Get resident eligibility badges
export const getEligibilityBadges = (resident: Resident | null): EligibilityBadge[] => {
    if (!resident) return [];
    
    const badges: EligibilityBadge[] = [];
    
    if (resident.is_senior) {
        badges.push({
            label: 'Senior Citizen',
            type: 'senior',
            icon: '👵',
            color: 'bg-blue-100 text-blue-800 border-blue-200'
        });
    }
    if (resident.is_pwd) {
        badges.push({
            label: 'PWD',
            type: 'pwd',
            icon: '♿',
            color: 'bg-green-100 text-green-800 border-green-200'
        });
    }
    if (resident.is_solo_parent) {
        badges.push({
            label: 'Solo Parent',
            type: 'solo_parent',
            icon: '👨‍👧‍👦',
            color: 'bg-pink-100 text-pink-800 border-pink-200'
        });
    }
    if (resident.is_indigent) {
        badges.push({
            label: 'Indigent',
            type: 'indigent',
            icon: '🏠',
            color: 'bg-amber-100 text-amber-800 border-amber-200'
        });
    }
    if (resident.is_veteran) {
        badges.push({
            label: 'Veteran',
            type: 'veteran',
            icon: '🎖️',
            color: 'bg-purple-100 text-purple-800 border-purple-200'
        });
    }
    if (resident.is_student) {
        badges.push({
            label: 'Student',
            type: 'student',
            icon: '📚',
            color: 'bg-teal-100 text-teal-800 border-teal-200'
        });
    }
    
    return badges;
};

// Check if resident is eligible for a specific discount type
export const isResidentEligibleForDiscount = (
    resident: Resident | null,
    discountType: DiscountTypeCode
): boolean => {
    if (!resident) return false;
    
    switch (discountType) {
        case 'SENIOR':
            return resident.is_senior === true;
        case 'PWD':
            return resident.is_pwd === true;
        case 'SOLO_PARENT':
            return resident.is_solo_parent === true;
        case 'INDIGENT':
            return resident.is_indigent === true;
        case 'VETERAN':
            return resident.is_veteran === true;
        case 'STUDENT':
            return resident.is_student === true;
        default:
            return false;
    }
};

// Get all discount types a resident is eligible for
export const getResidentEligibleDiscountTypes = (
    resident: Resident | null
): DiscountTypeCode[] => {
    if (!resident) return [];
    
    const eligible: DiscountTypeCode[] = [];
    
    if (resident.is_senior) eligible.push('SENIOR');
    if (resident.is_pwd) eligible.push('PWD');
    if (resident.is_solo_parent) eligible.push('SOLO_PARENT');
    if (resident.is_indigent) eligible.push('INDIGENT');
    if (resident.is_veteran) eligible.push('VETERAN');
    if (resident.is_student) eligible.push('STUDENT');
    
    return eligible;
};

// Get Philippine legal basis for discount
export const getPhilippineLegalBasis = (discountType: DiscountTypeCode): string => {
    switch (discountType) {
        case 'SENIOR':
            return 'RA 9994 (Expanded Senior Citizens Act)';
        case 'PWD':
            return 'RA 10754 (Expanded PWD Benefits Act)';
        case 'SOLO_PARENT':
            return 'RA 8972 (Solo Parents Welfare Act)';
        case 'INDIGENT':
            return 'Local Ordinance (Indigent Assistance)';
        case 'VETERAN':
            return 'RA 6948 (Veterans Benefits)';
        case 'STUDENT':
            return 'Local Ordinance (Student Discount)';
        default:
            return 'Local Ordinance';
    }
};

// Format discount rule for display
export const formatDiscountRuleForDisplay = (rule: DiscountRule): {
    code: string;
    name: string;
    percentage: number;
    legalBasis: string;
    description: string;
    requirements?: string[];
} => {
    const isPercentage = rule.value_type === 'percentage';
    const lawInfo = PHILIPPINE_DISCOUNT_LAWS[rule.discount_type as keyof typeof PHILIPPINE_DISCOUNT_LAWS];
    
    let requirements: string[] | undefined = undefined;
    
    if (rule.verification_document) {
        requirements = [rule.verification_document];
    } else if (lawInfo?.requirements) {
        requirements = lawInfo.requirements;
    }
    
    return {
        code: rule.discount_type,
        name: rule.name,
        percentage: isPercentage ? rule.discount_value : 0,
        legalBasis: getPhilippineLegalBasis(rule.discount_type),
        description: rule.description || lawInfo?.description || '',
        requirements,
    };
};

// ============================================
// NO NEED FOR ADDITIONAL EXPORT BLOCK
// ============================================
// The functions above are already exported with 'export const'
// DO NOT add another export block at the bottom