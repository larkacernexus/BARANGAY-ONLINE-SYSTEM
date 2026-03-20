// utils/paymentHelpers.ts
import { OutstandingFee, BackendFee, FeeType, Resident, ResidentDiscount, ResidentPrivilege } from '@/types';

export function generateORNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BAR-${year}${month}${day}-${random}`;
}

/**
 * Consistent amount parsing with 2 decimal places
 */
export function parseAmount(amount: string | number | null | undefined): number {
    if (amount === null || amount === undefined || amount === '') return 0;
    
    if (typeof amount === 'number') {
        return parseFloat(amount.toFixed(2));
    }
    
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[₱,$,\s,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
    }
    
    return 0;
}

/**
 * Calculate item total consistently
 */
export function calculateItemTotal(item: {
    base_amount: number | string;
    surcharge?: number | string;
    penalty?: number | string;
    discount?: number | string;
}): number {
    const base = parseAmount(item.base_amount);
    const surcharge = parseAmount(item.surcharge || 0);
    const penalty = parseAmount(item.penalty || 0);
    const discount = parseAmount(item.discount || 0);
    
    const total = base + surcharge + penalty - discount;
    return Math.max(0, parseFloat(total.toFixed(2)));
}

/**
 * Get correct balance for outstanding fees
 */
export function getOutstandingFeeBalance(fee: OutstandingFee): number {
    // Priority 1: Use balance from backend
    const balanceFromDB = parseAmount(fee.balance);
    if (balanceFromDB > 0) {
        return balanceFromDB;
    }
    
    // Priority 2: Calculate from components
    const base = parseAmount(fee.base_amount);
    const surcharge = parseAmount(fee.surcharge_amount || 0);
    const penalty = parseAmount(fee.penalty_amount || 0);
    const discount = parseAmount(fee.discount_amount || 0);
    const amountPaid = parseAmount(fee.amount_paid || 0);
    
    const totalAmount = base + surcharge + penalty - discount;
    const calculatedBalance = totalAmount - amountPaid;
    
    return Math.max(0, parseFloat(calculatedBalance.toFixed(2)));
}

/**
 * Get amount already paid
 */
export function getAmountPaid(fee: OutstandingFee): number {
    return parseAmount(fee.amount_paid || 0);
}

/**
 * Get total amount (original amount)
 */
export function getTotalOriginalAmount(fee: OutstandingFee): number {
    const base = parseAmount(fee.base_amount);
    const surcharge = parseAmount(fee.surcharge_amount || 0);
    const penalty = parseAmount(fee.penalty_amount || 0);
    const discount = parseAmount(fee.discount_amount || 0);
    
    return parseFloat((base + surcharge + penalty - discount).toFixed(2));
}

export function calculateMonthsLate(dueDate: string, paymentDate: Date = new Date()): number {
    try {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return 0;
        
        if (due > paymentDate) return 0;
        
        const months = (paymentDate.getFullYear() - due.getFullYear()) * 12 + 
                      (paymentDate.getMonth() - due.getMonth());
        
        const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
        
        return Math.max(0, months + (daysLate > 0 && months === 0 ? 1 : 0));
    } catch {
        return 0;
    }
}

export function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

/**
 * Map privilege code to discount type - DYNAMIC from code
 */
export function mapPrivilegeCodeToDiscountType(code: string): string {
    // Just return the code in lowercase as the type
    return code?.toLowerCase() || 'unknown';
}

/**
 * Get discount info from privilege
 */
export function getDiscountInfoFromPrivilege(privilege: any): { type: string; label: string; defaultPercentage: number } | null {
    if (!privilege || !privilege.code) return null;
    
    return {
        type: privilege.code.toLowerCase(),
        label: privilege.name || privilege.code,
        defaultPercentage: privilege.default_discount_percentage || 0
    };
}

/**
 * Get resident's active privileges as discount list - DYNAMIC
 */
export function getResidentDiscounts(resident: Resident): ResidentDiscount[] {
    const discounts: ResidentDiscount[] = [];
    
    // Use privileges array if available
    if (resident.privileges && Array.isArray(resident.privileges) && resident.privileges.length > 0) {
        resident.privileges.forEach((rp: ResidentPrivilege) => {
            // Only include active privileges
            if (rp.status !== 'active' && rp.status !== 'expiring_soon') return;
            
            const discountInfo = getDiscountInfoFromPrivilege(rp);
            if (discountInfo) {
                discounts.push({
                    type: discountInfo.type,
                    label: discountInfo.label,
                    percentage: rp.discount_percentage || discountInfo.defaultPercentage,
                    id_number: rp.id_number,
                    has_id: !!rp.id_number,
                    privilege_code: rp.code,
                    expires_at: rp.expires_at
                });
            }
        });
    }
    
    // Fallback to discount_eligibility_list if available
    if (discounts.length === 0 && resident.discount_eligibility_list && Array.isArray(resident.discount_eligibility_list)) {
        resident.discount_eligibility_list.forEach((discount: any) => {
            discounts.push({
                type: discount.type || 'unknown',
                label: discount.label || 'Unknown',
                percentage: discount.percentage || 0,
                id_number: discount.id_number,
                has_id: !!discount.id_number,
                privilege_code: discount.privilege_code
            });
        });
    }
    
    return discounts;
}

/**
 * Convert BackendFee to OutstandingFee format - DYNAMIC with privilege fields
 */
export function convertBackendFeeToOutstandingFee(fee: BackendFee, feeTypes: FeeType[]): OutstandingFee {
    const feeType = feeTypes.find(ft => ft.id == fee.fee_type_id);
    
    // Determine payer ID based on payer type
    let payerId = null;
    if (fee.payer_type === 'resident') {
        payerId = fee.resident_id;
    } else if (fee.payer_type === 'household') {
        payerId = fee.household_id;
    } else if (fee.payer_type === 'business') {
        payerId = fee.business_id;
    }
    
    // Build dynamic discount fields based on feeType properties
    const discountFields: Record<string, any> = {};
    
    // If feeType exists, extract all discount-related fields dynamically
    if (feeType) {
        Object.entries(feeType).forEach(([key, value]) => {
            // Match any field that starts with 'has_' or ends with '_discount_percentage'
            if (key.startsWith('has_') || key.endsWith('_discount_percentage')) {
                discountFields[key] = value;
            }
        });
    }
    
    // Also include any discount fields directly from fee
    Object.entries(fee).forEach(([key, value]) => {
        if (key.startsWith('fee_type_has_') || key.endsWith('_discount_percentage')) {
            discountFields[key] = value;
        }
    });
    
    return {
        id: fee.id,
        fee_type_id: fee.fee_type_id,
        fee_type: feeType,
        fee_code: fee.fee_code,
        payer_name: fee.payer_name,
        payer_type: fee.payer_type,
        payer_id: payerId,
        resident_id: fee.resident_id,
        household_id: fee.household_id,
        business_id: fee.business_id,
        business_name: fee.business_name,
        due_date: fee.due_date,
        base_amount: fee.base_amount?.toString() || '0',
        surcharge_amount: fee.surcharge_amount?.toString() || '0',
        penalty_amount: fee.penalty_amount?.toString() || '0',
        discount_amount: fee.discount_amount?.toString() || '0',
        amount_paid: fee.amount_paid ? fee.amount_paid.toString() : '0',
        balance: fee.balance?.toString() || '0',
        total_amount: fee.total_amount ? fee.total_amount.toString() : '0',
        status: fee.status,
        purpose: fee.purpose || undefined,
        fee_type_name: fee.fee_type_name || feeType?.name,
        fee_type_category: fee.fee_type_category || feeType?.category || 'other',
        billing_period: fee.billing_period,
        period_start: fee.period_start || undefined,
        period_end: fee.period_end || undefined,
        category: fee.fee_type_category || feeType?.category || 'other',
        contact_number: fee.contact_number,
        address: fee.address,
        purok: fee.purok,
        ...discountFields // Spread all dynamic discount fields
    };
}

/**
 * Check if discount is allowed for a specific fee - DYNAMIC
 */
export function checkIfDiscountAllowed(fee: OutstandingFee, discountType: string): boolean {
    // Check if fee has a field 'has_{discountType}_discount'
    const fieldName = `has_${discountType}_discount`;
    return (fee as any)[fieldName] === true;
}

/**
 * Get discount percentage for specific resident and fee type - DYNAMIC
 */
export function getDiscountPercentageForFeeType(fee: OutstandingFee, discountType: string, residentDiscount?: ResidentDiscount): number {
    // First try to get from fee's specific percentage field
    const percentageField = `${discountType}_discount_percentage`;
    const feePercentage = (fee as any)[percentageField];
    
    if (feePercentage && feePercentage > 0) {
        return feePercentage;
    }
    
    // Then try to get from resident's discount
    if (residentDiscount && residentDiscount.percentage) {
        return residentDiscount.percentage;
    }
    
    // Default fallback
    return 0;
}

/**
 * Get applicable discounts for a fee based on resident - DYNAMIC
 */
export function getApplicableDiscountsForFee(resident: Resident, fee: OutstandingFee): Array<{
    type: string;
    label: string;
    percentage: number;
    id_number?: string;
    has_id: boolean;
    privilege_code?: string;
}> {
    const applicableDiscounts = [];
    
    if (!resident.privileges || !Array.isArray(resident.privileges)) {
        return applicableDiscounts;
    }
    
    for (const rp of resident.privileges) {
        if (!rp.is_active && rp.status !== 'active' && rp.status !== 'expiring_soon') continue;
        
        const privilege = rp.privilege;
        if (!privilege || !privilege.code) continue;
        
        const discountType = privilege.code.toLowerCase();
        
        // Check if this fee type allows this discount
        const isAllowed = checkIfDiscountAllowed(fee, discountType);
        
        if (isAllowed) {
            const percentage = getDiscountPercentageForFeeType(fee, discountType, {
                type: discountType,
                label: privilege.name,
                percentage: rp.discount_percentage || privilege.default_discount_percentage || 0,
                id_number: rp.id_number,
                has_id: !!rp.id_number
            });
            
            applicableDiscounts.push({
                type: discountType,
                label: privilege.name || discountType,
                percentage,
                id_number: rp.id_number,
                has_id: !!rp.id_number,
                privilege_code: privilege.code
            });
        }
    }
    
    return applicableDiscounts;
}

/**
 * Format discount type label - DYNAMIC
 */
export function formatDiscountTypeLabel(type: string): string {
    // Convert from kebab/snake case to title case
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Get the highest applicable discount
 */
export function getHighestDiscount(discounts: Array<{ type: string; percentage: number }>): { type: string; percentage: number } | null {
    if (discounts.length === 0) return null;
    
    return discounts.reduce((highest, current) => 
        current.percentage > highest.percentage ? current : highest
    );
}

/**
 * Calculate discount amount based on percentage
 */
export function calculateDiscountAmount(amount: number, percentage: number): number {
    return parseFloat((amount * (percentage / 100)).toFixed(2));
}

/**
 * Validate if discount can be applied - DYNAMIC
 */
export function canApplyDiscount(
    discountType: string,
    resident: Resident,
    fee: OutstandingFee
): { allowed: boolean; reason?: string } {
    // Check if resident has the privilege for this discount type
    const hasPrivilege = resident.privileges?.some((rp: ResidentPrivilege) => {
        if (!rp.is_active && rp.status !== 'active' && rp.status !== 'expiring_soon') return false;
        return rp.code?.toLowerCase() === discountType.toLowerCase();
    });
    
    if (!hasPrivilege) {
        return { allowed: false, reason: `Resident does not have ${discountType} privilege` };
    }
    
    // Check if fee type allows this discount
    const isAllowed = checkIfDiscountAllowed(fee, discountType);
    if (!isAllowed) {
        return { allowed: false, reason: 'This fee type does not allow this discount' };
    }
    
    return { allowed: true };
}

// Re-export all utilities
export default {
    generateORNumber,
    parseAmount,
    calculateItemTotal,
    getOutstandingFeeBalance,
    getAmountPaid,
    getTotalOriginalAmount,
    calculateMonthsLate,
    isValidDate,
    convertBackendFeeToOutstandingFee,
    getResidentDiscounts,
    checkIfDiscountAllowed,
    getDiscountPercentageForFeeType,
    getApplicableDiscountsForFee,
    formatDiscountTypeLabel,
    getHighestDiscount,
    calculateDiscountAmount,
    canApplyDiscount
};