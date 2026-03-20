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

import { FeeType, DiscountRule, Resident } from '@/types/fees';

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
           `Note: Discounts will be applied during payment upon ID verification.\n\n` +
           `Do you want to proceed?`;
};

// ============================================
// DYNAMIC PRIVILEGE-BASED FUNCTIONS
// ============================================

// Get all discount rules that are active
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

// Get discounts applicable to a fee type (DYNAMIC)
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

// ALIAS for backward compatibility
export const getActiveDiscountsForFeeType = getDiscountsForFeeType;

// Get discount note for special combinations (DYNAMIC)
export const getDiscountNote = (
    discountCodes: string[],
): { note: string; type: 'info' | 'warning' | 'error' } => {
    // This can be extended based on your business rules
    // For now, just check if there are multiple discounts
    if (discountCodes.length < 2) return { note: '', type: 'info' };

    return {
        note: 'Multiple discounts may not be combinable. Check local ordinances for stacking rules.',
        type: 'warning',
    };
};

/**
 * Get resident's active privileges - DYNAMIC
 */
export const getResidentPrivileges = (resident: Resident | null): any[] => {
    if (!resident || !resident.privileges || !Array.isArray(resident.privileges)) {
        return [];
    }
    
    return resident.privileges.filter((p: any) => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
};

/**
 * Get resident eligibility badges from privileges - DYNAMIC
 */
export const getEligibilityBadges = (resident: Resident | null): Array<{
    label: string;
    type: string;
    icon: string;
    color: string;
    code: string;
}> => {
    if (!resident) return [];
    
    const badges = [];
    const privileges = getResidentPrivileges(resident);
    
    // Generate badges from actual privileges
    for (const priv of privileges) {
        const code = priv.code || 'unknown';
        badges.push({
            label: priv.name || code,
            type: code.toLowerCase(),
            icon: getPrivilegeIcon(code),
            color: getPrivilegeColor(code),
            code: code
        });
    }
    
    // Fallback to discount_eligibility_list if available
    if (badges.length === 0 && resident.discount_eligibility_list) {
        const eligibilityList = Array.isArray(resident.discount_eligibility_list) 
            ? resident.discount_eligibility_list 
            : [];
            
        for (const item of eligibilityList) {
            badges.push({
                label: item.label || 'Unknown',
                type: item.type || 'unknown',
                icon: '🎫',
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                code: item.privilege_code || 'unknown'
            });
        }
    }
    
    return badges;
};

/**
 * Get icon for privilege code - DYNAMIC based on first character
 */
export const getPrivilegeIcon = (code: string): string => {
    const firstChar = (code?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, string> = {
        'S': '👴',
        'P': '♿',
        'I': '🏠',
        'F': '🌾',
        'O': '✈️',
        '4': '📦',
        'U': '💼',
        'A': '🎫',
        'B': '🎫',
        'C': '🎫',
        'D': '🎫',
        'E': '🎫',
    };
    
    return iconMap[firstChar] || '🎫';
};

/**
 * Get color for privilege code - DYNAMIC based on first character
 */
export const getPrivilegeColor = (code: string): string => {
    const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
        'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400';
};

/**
 * Check if resident is eligible for a specific discount type - DYNAMIC
 */
export const isResidentEligibleForDiscount = (
    resident: Resident | null,
    discountType: string
): boolean => {
    if (!resident) return false;
    
    // Check privileges
    const privileges = getResidentPrivileges(resident);
    const hasPrivilege = privileges.some((p: any) => 
        p.code?.toLowerCase() === discountType.toLowerCase()
    );
    
    if (hasPrivilege) return true;
    
    // Check discount_eligibility_list
    if (resident.discount_eligibility_list) {
        const eligibilityList = Array.isArray(resident.discount_eligibility_list) 
            ? resident.discount_eligibility_list 
            : [];
            
        return eligibilityList.some((item: any) => 
            item.type?.toLowerCase() === discountType.toLowerCase() ||
            item.privilege_code?.toLowerCase() === discountType.toLowerCase()
        );
    }
    
    return false;
};

/**
 * Get all discount types a resident is eligible for - DYNAMIC
 */
export const getResidentEligibleDiscountTypes = (
    resident: Resident | null
): string[] => {
    if (!resident) return [];
    
    const eligibleTypes: string[] = [];
    
    // Get from privileges
    const privileges = getResidentPrivileges(resident);
    for (const priv of privileges) {
        if (priv.code) {
            eligibleTypes.push(priv.code);
        }
    }
    
    // Get from discount_eligibility_list
    if (resident.discount_eligibility_list) {
        const eligibilityList = Array.isArray(resident.discount_eligibility_list) 
            ? resident.discount_eligibility_list 
            : [];
            
        for (const item of eligibilityList) {
            if (item.type && !eligibleTypes.includes(item.type)) {
                eligibleTypes.push(item.type);
            }
            if (item.privilege_code && !eligibleTypes.includes(item.privilege_code)) {
                eligibleTypes.push(item.privilege_code);
            }
        }
    }
    
    return eligibleTypes;
};

/**
 * Get Philippine legal basis for discount - DYNAMIC (can be extended)
 */
export const getPhilippineLegalBasis = (discountType: string): string => {
    // This could be stored in the database and fetched dynamically
    // For now, return a generic message
    return 'Applicable Philippine Laws and Local Ordinances';
};

/**
 * Format discount rule for display - DYNAMIC
 */
export const formatDiscountRuleForDisplay = (rule: DiscountRule): {
    code: string;
    name: string;
    percentage: number;
    legalBasis: string;
    description: string;
    requirements?: string[];
} => {
    const isPercentage = rule.value_type === 'percentage';
    
    let requirements: string[] | undefined = undefined;
    
    if (rule.verification_document) {
        requirements = [rule.verification_document];
    }
    
    return {
        code: rule.discount_type,
        name: rule.name,
        percentage: isPercentage ? rule.discount_value : 0,
        legalBasis: getPhilippineLegalBasis(rule.discount_type),
        description: rule.description || '',
        requirements,
    };
};

/**
 * Get discount percentage from resident and fee type - DYNAMIC
 */
export const getDiscountPercentage = (
    resident: Resident | null,
    discountType: string
): number => {
    if (!resident) return 0;
    
    // Try to get from privileges
    const privileges = getResidentPrivileges(resident);
    for (const priv of privileges) {
        if (priv.code?.toLowerCase() === discountType.toLowerCase()) {
            return priv.discount_percentage || 0;
        }
    }
    
    // Try to get from discount_eligibility_list
    if (resident.discount_eligibility_list) {
        const eligibilityList = Array.isArray(resident.discount_eligibility_list) 
            ? resident.discount_eligibility_list 
            : [];
            
        for (const item of eligibilityList) {
            if (item.type?.toLowerCase() === discountType.toLowerCase() ||
                item.privilege_code?.toLowerCase() === discountType.toLowerCase()) {
                return item.percentage || 0;
            }
        }
    }
    
    return 0;
};

/**
 * Check if resident has ID number for a privilege
 */
export const hasPrivilegeIdNumber = (
    resident: Resident | null,
    privilegeCode: string
): boolean => {
    if (!resident || !resident.privileges) return false;
    
    const priv = resident.privileges.find((p: any) => 
        p.code?.toLowerCase() === privilegeCode.toLowerCase()
    );
    
    return !!(priv && priv.id_number);
};

// ============================================
// NO HARDCODED DISCOUNT TYPES
// ============================================
// Removed: PHILIPPINE_DISCOUNT_LAWS constant
// Removed: Hardcoded badge types
// Removed: Hardcoded icon mappings