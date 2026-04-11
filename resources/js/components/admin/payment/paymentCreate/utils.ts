// resources/js/components/admin/payment/paymentCreate/utils.ts

import { 
    OutstandingFee, 
    BackendFee, 
    FeeType, 
    Resident, 
    ResidentDiscount, 
    ResidentPrivilege,
    PaymentItem,
    DiscountRule
} from '@/types/admin/payments/payments';

// ============================================
// TYPE DEFINITIONS
// ============================================

type ApplicableDiscount = {
    type: string;
    label: string;
    percentage: number;
    id_number?: string;
    has_id: boolean;
    privilege_code: string;
};

type PaymentTotal = {
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total: number;
};

type ItemWithAmounts = Pick<PaymentItem, 'base_amount' | 'surcharge' | 'penalty' | 'discount' | 'total_amount'>;

type DiscountValidationResult = {
    allowed: boolean;
    reason?: string;
    percentage?: number;
};

type FeeConversionOptions = {
    includeZeroBalances?: boolean;
    defaultPayerName?: string;
};

// ============================================
// CONSTANTS
// ============================================

const PRIVILEGE_ICON_MAP: Record<string, string> = {
    'S': '👴', // Senior Citizen
    'P': '♿', // PWD
    'I': '🏠', // Indigenous
    'F': '🌾', // Farmer
    'O': '✈️', // OFW
    '4': '📦', // 4Ps
    'U': '💼', // Solo Parent
    'A': '🎫',
    'B': '🎫',
    'C': '🎫',
    'D': '🎫',
    'E': '🎫',
};

const PRIVILEGE_COLORS = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-amber-100 text-amber-800 border-amber-200',
];

const PAYER_TYPE_MAPPING: Record<string, string> = {
    'App\\Models\\Resident': 'resident',
    'App\\Models\\Household': 'household',
    'App\\Models\\Business': 'business',
};

// ============================================
// STRING & NUMBER UTILITIES
// ============================================

/**
 * Generate a unique OR number for payment receipts
 * Format: BAR-YYYYMMDD-RRR (where RRR is random 3-digit number)
 */
export function generateORNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `BAR-${year}${month}${day}-${random}`;
}

/**
 * Parse amount from various formats to a consistent number with 2 decimal places
 */
export function parseAmount(amount: string | number | null | undefined): number {
    if (amount === null || amount === undefined || amount === '') return 0;
    
    let parsed: number;
    
    if (typeof amount === 'number') {
        parsed = amount;
    } else {
        const cleaned = amount.replace(/[₱,$,\s,]/g, '').trim();
        parsed = parseFloat(cleaned);
    }
    
    return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
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
export function calculateItemTotal(item: Partial<ItemWithAmounts>): number {
    const base = parseAmount(item.base_amount ?? 0);
    const surcharge = parseAmount(item.surcharge ?? 0);
    const penalty = parseAmount(item.penalty ?? 0);
    const discount = parseAmount(item.discount ?? 0);
    
    const total = base + surcharge + penalty - discount;
    return Math.max(0, Number(total.toFixed(2)));
}

/**
 * Calculate total for multiple payment items
 */
export function calculatePaymentTotal(items: ItemWithAmounts[]): PaymentTotal {
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
// DATE UTILITIES
// ============================================

/**
 * Calculate number of months late based on due date
 */
export function calculateMonthsLate(dueDate: string | undefined, paymentDate: Date = new Date()): number {
    if (!dueDate) return 0;
    
    try {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return 0;
        
        // Not late if payment date is before or on due date
        if (due >= paymentDate) return 0;
        
        // Calculate month difference
        const monthDiff = (paymentDate.getFullYear() - due.getFullYear()) * 12 + 
                         (paymentDate.getMonth() - due.getMonth());
        
        // Check if we're past the day of month for additional month
        const dayDiff = paymentDate.getDate() - due.getDate();
        const monthsLate = monthDiff + (dayDiff > 0 ? 1 : 0);
        
        return Math.max(0, monthsLate);
    } catch {
        return 0;
    }
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateString: string | undefined): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

/**
 * Format date to YYYY-MM-DD for input fields
 */
export function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
}

// ============================================
// FEE UTILITIES
// ============================================

/**
 * Get the correct balance for an outstanding fee
 */
export function getOutstandingFeeBalance(fee: OutstandingFee): number {
    return parseAmount(fee.balance);
}

/**
 * Get amount already paid for a fee
 */
export function getAmountPaid(fee: OutstandingFee): number {
    return parseAmount(fee.amount_paid);
}

/**
 * Get total original amount (before payments)
 */
export function getTotalOriginalAmount(fee: OutstandingFee): number {
    const base = parseAmount(fee.base_amount);
    const surcharge = parseAmount(fee.surcharge_amount);
    const penalty = parseAmount(fee.penalty_amount);
    const discount = parseAmount(fee.discount_amount);
    
    return Number((base + surcharge + penalty - discount).toFixed(2));
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
 * Convert BackendFee to OutstandingFee format - RETURNS NUMBERS (not strings)
 */
export function convertBackendFeeToOutstandingFee(
    fee: BackendFee, 
    feeTypes: FeeType[],
    options: FeeConversionOptions = {}
): OutstandingFee {
    const feeType = feeTypes.find(ft => ft.id === fee.fee_type_id);
    const normalizedPayerType = normalizePayerType(fee.payer_type);
    
    const payerId = fee.payer_id ?? fee.resident_id ?? fee.household_id ?? fee.business_id ?? 0;
    const payerType = normalizedPayerType ?? determinePayerTypeFromIds(fee);
    
    // Parse all amounts to numbers (not strings)
    const baseAmount = parseAmount(fee.base_amount);
    const surchargeAmount = parseAmount(fee.surcharge_amount);
    const penaltyAmount = parseAmount(fee.penalty_amount);
    const discountAmount = parseAmount(fee.discount_amount);
    const amountPaid = parseAmount(fee.amount_paid);
    const totalAmount = parseAmount(fee.total_amount);
    
    // Calculate balance
    const calculatedTotal = baseAmount + surchargeAmount + penaltyAmount - discountAmount;
    const balance = totalAmount > 0 ? totalAmount - amountPaid : calculatedTotal - amountPaid;
    const finalBalance = Math.max(0, parseAmount(balance));
    
    const discountFields = extractDiscountFields(fee, feeType);
    
    return {
        id: fee.id,
        fee_id: fee.id,
        fee_type_id: fee.fee_type_id,
        fee_name: fee.fee_type_name || feeType?.name || 'Fee',
        fee_code: fee.fee_code || '',
        fee_type_name: fee.fee_type_name || feeType?.name || 'Fee',
        fee_type_category: fee.fee_type_category || feeType?.category || 'other',
        payer_type: payerType,
        payer_id: payerId,
        payer_name: fee.payer_name || options.defaultPayerName || 'Unknown',
        resident_id: fee.resident_id ?? (payerType === 'resident' ? payerId : 0),
        household_id: fee.household_id ?? (payerType === 'household' ? payerId : 0),
        business_id: fee.business_id ?? (payerType === 'business' ? payerId : 0),
        
        // Amount fields as NUMBERS (not strings)
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
        due_date: fee.due_date,
        months_late: fee.months_late || 0,
        
        // Optional business fields
        business_name: fee.business_name,
        business_type: fee.business_type,
        contact_number: fee.contact_number,
        address: fee.address,
        purok: fee.purok,
        
        // Discount fields
        ...discountFields,
        applicableDiscounts: fee.applicableDiscounts || [],
        canApplyDiscount: fee.canApplyDiscount || false,
        
        // Additional details
        resident_details: fee.resident_details,
    };
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

// ============================================
// DISCOUNT UTILITIES
// ============================================

/**
 * Get resident discounts from privileges
 */
export function getResidentDiscounts(resident: Resident): ResidentDiscount[] {
    const discounts: ResidentDiscount[] = [];
    
    if (resident.privileges?.length) {
        for (const rp of resident.privileges) {
            if (!isPrivilegeActive(rp)) continue;
            if (!rp.privilege?.code) continue;
            
            discounts.push({
                type: rp.privilege.code.toLowerCase(),
                label: rp.privilege.name || rp.privilege.code,
                percentage: rp.discount_percentage || rp.privilege.default_discount_percentage || 0,
                id_number: rp.id_number,
                has_id: !!rp.id_number,
                privilege_code: rp.privilege.code,
                expires_at: rp.expires_at
            });
        }
    }
    
    if (discounts.length === 0 && resident.discount_eligibility_list?.length) {
        for (const discount of resident.discount_eligibility_list) {
            if (!discount?.type) continue;
            if (discounts.some(d => d.type === discount.type)) continue;
            
            discounts.push({
                type: discount.type,
                label: discount.label || discount.type,
                percentage: discount.percentage || 0,
                id_number: discount.id_number,
                has_id: !!discount.id_number,
                privilege_code: discount.privilege_code
            });
        }
    }
    
    return discounts;
}

/**
 * Check if a privilege is active
 */
function isPrivilegeActive(privilege: any): boolean {
    return privilege.status === 'active' || privilege.status === 'expiring_soon';
}

/**
 * Check if a resident has a specific privilege
 */
export function hasPrivilege(resident: Resident, privilegeCode: string): boolean {
    if (!resident.privileges?.length) return false;
    
    const normalizedCode = privilegeCode.toUpperCase();
    
    return resident.privileges.some(rp => {
        if (!isPrivilegeActive(rp)) return false;
        if (!rp.privilege?.code) return false;
        return rp.privilege.code.toUpperCase() === normalizedCode;
    });
}

/**
 * Get privilege details by code
 */
export function getPrivilegeByCode(resident: Resident, privilegeCode: string): any | null {
    if (!resident.privileges?.length) return null;
    
    const normalizedCode = privilegeCode.toUpperCase();
    
    for (const rp of resident.privileges) {
        if (!isPrivilegeActive(rp)) continue;
        if (!rp.privilege?.code) continue;
        if (rp.privilege.code.toUpperCase() === normalizedCode) {
            return rp;
        }
    }
    
    return null;
}

/**
 * Check if a discount is allowed for a specific fee
 */
export function checkIfDiscountAllowed(fee: OutstandingFee, privilegeCode: string): boolean {
    const fieldName = `has_${privilegeCode.toLowerCase()}_discount`;
    return (fee as any)[fieldName] === true;
}

/**
 * Get discount percentage for a specific fee and privilege
 */
export function getDiscountPercentageForFeeType(fee: OutstandingFee, privilegeCode: string): number {
    const fieldName = `${privilegeCode.toLowerCase()}_discount_percentage`;
    const percentage = (fee as any)[fieldName];
    return typeof percentage === 'number' ? percentage : 0;
}

/**
 * Check if fee allows discount for a specific privilege
 */
export function feeAllowsDiscount(fee: OutstandingFee, privilegeCode: string): boolean {
    return checkIfDiscountAllowed(fee, privilegeCode);
}

/**
 * Get discount percentage from fee
 */
export function getDiscountPercentage(fee: OutstandingFee, privilegeCode: string): number {
    return getDiscountPercentageForFeeType(fee, privilegeCode);
}

/**
 * Validate if a discount can be applied
 */
export function canApplyDiscount(
    privilegeCode: string,
    resident: Resident,
    fee: OutstandingFee
): DiscountValidationResult {
    if (!hasPrivilege(resident, privilegeCode)) {
        return { 
            allowed: false, 
            reason: `Resident does not have ${privilegeCode.toUpperCase()} privilege` 
        };
    }
    
    if (!checkIfDiscountAllowed(fee, privilegeCode)) {
        return { 
            allowed: false, 
            reason: 'This fee type does not allow this discount' 
        };
    }
    
    const percentage = getDiscountPercentageForFeeType(fee, privilegeCode);
    
    return { 
        allowed: true, 
        percentage,
        reason: `Discount applied: ${percentage}% off` 
    };
}

/**
 * Get all applicable discounts for a fee based on resident privileges
 */
export function getApplicableDiscountsForFee(resident: Resident, fee: OutstandingFee): ApplicableDiscount[] {
    const applicableDiscounts: ApplicableDiscount[] = [];
    
    if (!resident.privileges?.length) return applicableDiscounts;
    
    for (const rp of resident.privileges) {
        if (!isPrivilegeActive(rp)) continue;
        if (!rp.privilege?.code) continue;
        
        const privilege = rp.privilege;
        
        if (checkIfDiscountAllowed(fee, privilege.code)) {
            applicableDiscounts.push({
                type: privilege.code.toLowerCase(),
                label: privilege.name || privilege.code,
                percentage: rp.discount_percentage || privilege.default_discount_percentage || 0,
                id_number: rp.id_number,
                has_id: !!rp.id_number,
                privilege_code: privilege.code
            });
        }
    }
    
    return applicableDiscounts;
}

/**
 * Get the highest discount from a list of discounts
 */
export function getHighestDiscount(discounts: Array<{ type: string; percentage: number }>): { type: string; percentage: number } | null {
    if (!discounts.length) return null;
    
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
 * Get discount type label
 */
export function getDiscountTypeLabel(type: string): string {
    return type
        .split(/[_\s-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// ============================================
// PRIVILEGE UI UTILITIES
// ============================================

export function getPrivilegeIcon(code: string): string {
    if (!code) return '🎫';
    const firstChar = code.charAt(0).toUpperCase();
    return PRIVILEGE_ICON_MAP[firstChar] || '🎫';
}

export function getPrivilegeColor(code: string): string {
    if (!code) return PRIVILEGE_COLORS[0];
    const firstCharCode = code.charCodeAt(0);
    const colorIndex = firstCharCode % PRIVILEGE_COLORS.length;
    return PRIVILEGE_COLORS[colorIndex];
}

export function getActivePrivileges(resident: Resident): ResidentPrivilege[] {
    if (!resident.privileges?.length) return [];
    
    return resident.privileges.filter(p => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
}

// ============================================
// FILTER UTILITIES
// ============================================

export function filterFeesByResident(fees: OutstandingFee[], residentId: number | string): OutstandingFee[] {
    const targetId = Number(residentId);
    
    return fees.filter(fee => {
        const balance = getOutstandingFeeBalance(fee);
        const isMatch = fee.payer_type === 'resident' && 
                       (Number(fee.payer_id) === targetId || Number(fee.resident_id) === targetId);
        
        return isMatch && balance > 0;
    });
}

export function filterFeesByHousehold(fees: OutstandingFee[], householdId: number | string): OutstandingFee[] {
    const targetId = Number(householdId);
    
    return fees.filter(fee => {
        const balance = getOutstandingFeeBalance(fee);
        const isMatch = fee.payer_type === 'household' && 
                       (Number(fee.payer_id) === targetId || Number(fee.household_id) === targetId);
        
        return isMatch && balance > 0;
    });
}

export function filterFeesByBusiness(fees: OutstandingFee[], businessId: number | string): OutstandingFee[] {
    const targetId = Number(businessId);
    
    return fees.filter(fee => {
        const balance = getOutstandingFeeBalance(fee);
        const isMatch = fee.payer_type === 'business' && 
                       (Number(fee.payer_id) === targetId || Number(fee.business_id) === targetId);
        
        return isMatch && balance > 0;
    });
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function validateDiscountRule(
    rule: DiscountRule,
    subtotal: number,
    currentDate: Date = new Date()
): { valid: boolean; message?: string } {
    if (rule.start_date && new Date(rule.start_date) > currentDate) {
        return { valid: false, message: `Discount starts on ${formatDateForInput(new Date(rule.start_date))}` };
    }
    
    if (rule.end_date && new Date(rule.end_date) < currentDate) {
        return { valid: false, message: 'Discount has expired' };
    }
    
    if (rule.minimum_purchase_amount && subtotal < rule.minimum_purchase_amount) {
        return { 
            valid: false, 
            message: `Minimum purchase of ${formatCurrency(rule.minimum_purchase_amount)} required` 
        };
    }
    
    return { valid: true };
}

export function isPaymentComplete(totalAmount: number, amountPaid: number): boolean {
    return amountPaid >= totalAmount;
}

export function calculateChange(amountPaid: number, totalAmount: number): number {
    return Math.max(0, amountPaid - totalAmount);
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
    calculateMonthsLate,
    calculateDiscountAmount,
    calculateChange,
    getOutstandingFeeBalance,
    getAmountPaid,
    getTotalOriginalAmount,
    convertBackendFeeToOutstandingFee,
    getResidentDiscounts,
    checkIfDiscountAllowed,
    getDiscountPercentageForFeeType,
    getDiscountPercentage,
    getApplicableDiscountsForFee,
    getDiscountTypeLabel,
    getHighestDiscount,
    canApplyDiscount,
    feeAllowsDiscount,
    validateDiscountRule,
    hasPrivilege,
    getPrivilegeByCode,
    getPrivilegeIcon,
    getPrivilegeColor,
    getActivePrivileges,
    filterFeesByResident,
    filterFeesByHousehold,
    filterFeesByBusiness,
    isValidDate,
    isPaymentComplete,
};