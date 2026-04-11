// utils/paymentHelpers.ts
import { 
    OutstandingFee, 
    BackendFee, 
    FeeType, 
    Resident, 
    ResidentDiscount, 
    ResidentPrivilege,
    PaymentItem
} from '@/types/admin/payments/payments';

// ============================================
// TYPE DEFINITIONS
// ============================================

type FeeConversionOptions = {
    defaultPayerName?: string;
};

type PaymentTotal = {
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total: number;
};

type ApplicableDiscount = {
    type: string;
    label: string;
    percentage: number;
    id_number?: string;
    has_id: boolean;
    privilege_code?: string;
};

// ============================================
// CONSTANTS
// ============================================

const PAYER_TYPE_MAPPING: Record<string, string> = {
    'App\\Models\\Resident': 'resident',
    'App\\Models\\Household': 'household',
    'App\\Models\\Business': 'business',
};

// ============================================
// STRING & NUMBER UTILITIES
// ============================================

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
        return Number(amount.toFixed(2));
    }
    
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[₱,$,\s,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
    }
    
    return 0;
}

/**
 * Format currency in Philippine Peso format
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Calculate total for a single payment item
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
    return Math.max(0, Number(total.toFixed(2)));
}

/**
 * Calculate total for multiple payment items
 */
export function calculatePaymentTotal(items: PaymentItem[]): PaymentTotal {
    const initial: PaymentTotal = { subtotal: 0, surcharge: 0, penalty: 0, discount: 0, total: 0 };
    
    return items.reduce((acc, item) => ({
        subtotal: acc.subtotal + (item.base_amount || 0),
        surcharge: acc.surcharge + (item.surcharge || 0),
        penalty: acc.penalty + (item.penalty || 0),
        discount: acc.discount + (item.discount || 0),
        total: acc.total + (item.total_amount || 0),
    }), initial);
}

// ============================================
// FEE UTILITIES
// ============================================

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
    
    return Math.max(0, Number(calculatedBalance.toFixed(2)));
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
    
    return Number((base + surcharge + penalty - discount).toFixed(2));
}

// ============================================
// DATE UTILITIES
// ============================================

export function calculateMonthsLate(dueDate: string | undefined, paymentDate: Date = new Date()): number {
    if (!dueDate) return 0;
    
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

export function isValidDate(dateString: string | undefined): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

export function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
}

// ============================================
// PRIVILEGE & DISCOUNT UTILITIES
// ============================================

/**
 * Map privilege code to discount type
 */
export function mapPrivilegeCodeToDiscountType(code: string): string {
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
 * Get resident's active privileges as discount list
 */
export function getResidentDiscounts(resident: Resident): ResidentDiscount[] {
    const discounts: ResidentDiscount[] = [];
    
    // Use privileges array if available
    if (resident.privileges && Array.isArray(resident.privileges) && resident.privileges.length > 0) {
        resident.privileges.forEach((rp: ResidentPrivilege) => {
            // Only include active privileges
            if (rp.status !== 'active' && rp.status !== 'expiring_soon') return;
            
            const privilege = rp.privilege;
            if (privilege && privilege.code) {
                discounts.push({
                    type: privilege.code.toLowerCase(),
                    label: privilege.name || privilege.code,
                    percentage: rp.discount_percentage || privilege.default_discount_percentage || 0,
                    id_number: rp.id_number,
                    has_id: !!rp.id_number,
                    privilege_code: privilege.code,
                    expires_at: rp.expires_at
                });
            }
        });
    }
    
    // Fallback to discount_eligibility_list if available
    if (discounts.length === 0 && (resident as any).discount_eligibility_list && Array.isArray((resident as any).discount_eligibility_list)) {
        (resident as any).discount_eligibility_list.forEach((discount: any) => {
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
 * Normalize payer type from backend format to frontend format
 */
function normalizePayerType(payerType: string | null | undefined): 'resident' | 'household' | 'business' | null {
    if (!payerType) return null;
    
    if (PAYER_TYPE_MAPPING[payerType]) {
        return PAYER_TYPE_MAPPING[payerType] as 'resident' | 'household' | 'business';
    }
    
    const normalized = payerType.toLowerCase();
    if (['resident', 'household', 'business'].includes(normalized)) {
        return normalized as 'resident' | 'household' | 'business';
    }
    
    return null;
}

/**
 * Determine payer type from IDs when not explicitly provided
 */
function determinePayerTypeFromIds(fee: BackendFee): 'resident' | 'household' | 'business' {
    if (fee.resident_id) return 'resident';
    if (fee.household_id) return 'household';
    if (fee.business_id) return 'business';
    return 'resident';
}

/**
 * Extract discount-related fields from fee and feeType
 */
function extractDiscountFields(fee: BackendFee, feeType?: FeeType): Record<string, any> {
    const discountFields: Record<string, any> = {};
    
    const addMatchingFields = (obj: any) => {
        if (!obj) return;
        
        Object.keys(obj).forEach(key => {
            if (key.startsWith('has_') && key.endsWith('_discount')) {
                discountFields[key] = obj[key];
            }
            if (key.endsWith('_discount_percentage')) {
                discountFields[key] = obj[key];
            }
        });
    };
    
    addMatchingFields(fee);
    addMatchingFields(feeType);
    
    return discountFields;
}

/**
 * Convert BackendFee to OutstandingFee format
 */
export function convertBackendFeeToOutstandingFee(
    fee: BackendFee, 
    feeTypes: FeeType[],
    options: FeeConversionOptions = {}
): OutstandingFee {
    const feeType = feeTypes.find(ft => ft.id == fee.fee_type_id);
    const normalizedPayerType = normalizePayerType(fee.payer_type);
    
    // Determine payer ID based on payer type
    let payerId: number = 0;
    const payerType = normalizedPayerType ?? determinePayerTypeFromIds(fee);
    
    if (payerType === 'resident') {
        payerId = fee.resident_id ?? fee.payer_id ?? 0;
    } else if (payerType === 'household') {
        payerId = fee.household_id ?? fee.payer_id ?? 0;
    } else if (payerType === 'business') {
        payerId = fee.business_id ?? fee.payer_id ?? 0;
    } else {
        payerId = fee.payer_id ?? 0;
    }
    
    // Parse all amounts to numbers
    const baseAmount = parseAmount(fee.base_amount);
    const surchargeAmount = parseAmount(fee.surcharge_amount);
    const penaltyAmount = parseAmount(fee.penalty_amount);
    const discountAmount = parseAmount(fee.discount_amount);
    const amountPaid = parseAmount(fee.amount_paid);
    const totalAmount = parseAmount(fee.total_amount);
    const balanceAmount = parseAmount(fee.balance);
    
    // Calculate balance if not provided
    const calculatedTotal = baseAmount + surchargeAmount + penaltyAmount - discountAmount;
    const finalBalance = balanceAmount > 0 
        ? balanceAmount 
        : Math.max(0, calculatedTotal - amountPaid);
    
    const discountFields = extractDiscountFields(fee, feeType);
    
    return {
        id: fee.id,
        fee_id: fee.id,
        fee_type_id: fee.fee_type_id,
        fee_code: fee.fee_code || '',
        fee_name: fee.fee_name || fee.fee_type_name || feeType?.name || 'Fee',
        fee_type_name: fee.fee_type_name || feeType?.name,
        fee_type_category: fee.fee_type_category || feeType?.category || 'other',
        
        // ✅ Add the missing fee_type property
        fee_type: feeType?.name || fee.fee_type_name || 'Unknown',
        
        payer_name: fee.payer_name || options.defaultPayerName || 'Unknown',
        payer_type: payerType,
        payer_id: payerId,
        
        resident_id: fee.resident_id ?? (payerType === 'resident' ? payerId : 0),
        household_id: fee.household_id ?? (payerType === 'household' ? payerId : 0),
        business_id: fee.business_id ?? (payerType === 'business' ? payerId : 0),
        business_name: fee.business_name || '',
        business_type: fee.business_type || '',
        
        due_date: fee.due_date,
        base_amount: baseAmount,
        surcharge_amount: surchargeAmount,
        penalty_amount: penaltyAmount,
        discount_amount: discountAmount,
        amount_paid: amountPaid,
        balance: finalBalance,
        total_amount: totalAmount > 0 ? totalAmount : calculatedTotal,
        
        status: fee.status || 'pending',
        purpose: fee.purpose,
        
        billing_period: fee.billing_period,
        period_covered: fee.period_covered,
        period_start: fee.period_start,
        period_end: fee.period_end,
        
        category: fee.fee_type_category || feeType?.category || 'other',
        contact_number: fee.contact_number || '',
        address: fee.address || '',
        purok: fee.purok || '',
        
        months_late: fee.months_late || 0,
        
        applicableDiscounts: fee.applicableDiscounts || [],
        canApplyDiscount: fee.canApplyDiscount || false,
        
        resident_details: fee.resident_details,
        
        ...discountFields
    };
}
/**
 * Check if discount is allowed for a specific fee
 */
export function checkIfDiscountAllowed(fee: OutstandingFee, discountType: string): boolean {
    const fieldName = `has_${discountType}_discount`;
    return (fee as any)[fieldName] === true;
}

/**
 * Get discount percentage for specific resident and fee type
 */
export function getDiscountPercentageForFeeType(
    fee: OutstandingFee, 
    discountType: string, 
    residentDiscount?: ResidentDiscount
): number {
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
    
    return 0;
}

/**
 * Get applicable discounts for a fee based on resident
 */
export function getApplicableDiscountsForFee(
    resident: Resident, 
    fee: OutstandingFee
): ApplicableDiscount[] {
    // ✅ Fixed: Explicitly typed array
    const applicableDiscounts: ApplicableDiscount[] = [];
    
    if (!resident.privileges || !Array.isArray(resident.privileges)) {
        return applicableDiscounts;
    }
    
    for (const rp of resident.privileges) {
        if (rp.status !== 'active' && rp.status !== 'expiring_soon') continue;
        
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
                has_id: !!rp.id_number,
                privilege_code: privilege.code
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
 * Format discount type label
 */
export function formatDiscountTypeLabel(type: string): string {
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
    return Number((amount * (percentage / 100)).toFixed(2));
}

/**
 * Validate if discount can be applied
 */
export function canApplyDiscount(
    discountType: string,
    resident: Resident,
    fee: OutstandingFee
): { allowed: boolean; reason?: string } {
    // Check if resident has the privilege for this discount type
    const hasPrivilege = resident.privileges?.some((rp: ResidentPrivilege) => {
        if (rp.status !== 'active' && rp.status !== 'expiring_soon') return false;
        return rp.privilege?.code?.toLowerCase() === discountType.toLowerCase();
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

// ============================================
// EXPORTS
// ============================================

export default {
    generateORNumber,
    parseAmount,
    formatCurrency,
    formatDateForInput,
    calculateItemTotal,
    calculatePaymentTotal,
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
    canApplyDiscount,
    mapPrivilegeCodeToDiscountType,
    getDiscountInfoFromPrivilege
};