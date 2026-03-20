// resources/js/components/admin/payment/paymentCreate/utils.ts

import { OutstandingFee, BackendFee, FeeType, Resident, ResidentDiscount, ResidentPrivilege } from './types';

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
 * Get active privileges from resident
 */
export function getActivePrivileges(resident: Resident): any[] {
    if (!resident.privileges || !Array.isArray(resident.privileges)) {
        return [];
    }
    return resident.privileges.filter((p: any) => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
}

/**
 * Get privilege icon based on code
 */
export function getPrivilegeIcon(code: string): string {
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
}

/**
 * Get privilege color based on code hash
 */
export function getPrivilegeColor(code: string): string {
    const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-green-100 text-green-800 border-green-200',
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-orange-100 text-orange-800 border-orange-200',
        'bg-red-100 text-red-800 border-red-200',
        'bg-indigo-100 text-indigo-800 border-indigo-200',
        'bg-pink-100 text-pink-800 border-pink-200',
        'bg-amber-100 text-amber-800 border-amber-200',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Check if fee allows discount for a specific privilege code
 */
export function feeAllowsDiscount(fee: OutstandingFee, privilegeCode: string): boolean {
    const fieldName = `has_${privilegeCode.toLowerCase()}_discount`;
    return (fee as any)[fieldName] === true;
}

/**
 * Get discount percentage for a specific privilege from fee
 */
export function getDiscountPercentage(fee: OutstandingFee, privilegeCode: string): number {
    const fieldName = `${privilegeCode.toLowerCase()}_discount_percentage`;
    return (fee as any)[fieldName] || 0;
}

/**
 * Convert BackendFee to OutstandingFee format - DYNAMIC
 */
export function convertBackendFeeToOutstandingFee(fee: BackendFee, feeTypes: FeeType[]): OutstandingFee {
    const feeType = feeTypes.find(ft => ft.id == fee.fee_type_id);
    
    // Determine payer type and ID correctly
    let payerType = fee.payer_type;
    let payerId = fee.payer_id;
    let residentId = fee.resident_id;
    let householdId = fee.household_id;
    let businessId = fee.business_id;
    
    // Handle string payer types from backend
    if (payerType === 'App\\Models\\Resident') {
        payerType = 'resident';
        payerId = fee.payer_id || fee.resident_id;
        residentId = fee.payer_id || fee.resident_id;
    } else if (payerType === 'App\\Models\\Household') {
        payerType = 'household';
        payerId = fee.payer_id || fee.household_id;
        householdId = fee.payer_id || fee.household_id;
    } else if (payerType === 'App\\Models\\Business') {
        payerType = 'business';
        payerId = fee.payer_id || fee.business_id;
        businessId = fee.payer_id || fee.business_id;
    }
    
    if (!payerId) {
        if (residentId) {
            payerId = residentId;
            payerType = 'resident';
        } else if (householdId) {
            payerId = householdId;
            payerType = 'household';
        } else if (businessId) {
            payerId = businessId;
            payerType = 'business';
        }
    }

    // Build dynamic discount fields
    const discountFields: Record<string, any> = {};
    
    // Add any discount fields from the fee object
    Object.keys(fee).forEach(key => {
        if (key.startsWith('has_') && key.endsWith('_discount')) {
            discountFields[key] = fee[key as keyof BackendFee];
        }
        if (key.endsWith('_discount_percentage')) {
            discountFields[key] = fee[key as keyof BackendFee];
        }
    });
    
    // Add any discount fields from feeType
    if (feeType) {
        Object.keys(feeType).forEach(key => {
            if (key.startsWith('has_') && key.endsWith('_discount')) {
                discountFields[key] = feeType[key as keyof FeeType];
            }
            if (key.endsWith('_discount_percentage')) {
                discountFields[key] = feeType[key as keyof FeeType];
            }
        });
    }

    return {
        id: fee.id,
        fee_type_id: fee.fee_type_id,
        fee_type: feeType,
        fee_code: fee.fee_code,
        payer_name: fee.payer_name || 'Unknown',
        payer_type: payerType as any,
        payer_id: payerId,
        resident_id: residentId,
        household_id: householdId,
        business_id: businessId,
        due_date: fee.due_date,
        base_amount: fee.base_amount?.toString() || '0',
        surcharge_amount: fee.surcharge_amount?.toString() || '0',
        penalty_amount: fee.penalty_amount?.toString() || '0',
        discount_amount: fee.discount_amount?.toString() || '0',
        amount_paid: fee.amount_paid?.toString() || '0',
        balance: fee.balance?.toString() || '0',
        total_amount: fee.total_amount?.toString() || '0',
        status: fee.status || 'pending',
        purpose: fee.purpose,
        fee_type_name: fee.fee_type_name || feeType?.name || 'Fee',
        fee_type_category: fee.fee_type_category || feeType?.category || 'other',
        billing_period: fee.billing_period,
        period_start: fee.period_start || undefined,
        period_end: fee.period_end || undefined,
        category: fee.fee_type_category || feeType?.category || 'other',
        business_name: fee.business_name,
        business_type: fee.business_type,
        contact_number: fee.contact_number || undefined,
        address: fee.address || undefined,
        purok: fee.purok || undefined,
        
        // Add all dynamic discount fields
        ...discountFields,
        
        // Add discount applicability
        applicableDiscounts: fee.applicableDiscounts || [],
        canApplyDiscount: fee.canApplyDiscount || false,
        
        // Add resident details
        resident_details: fee.resident_details,
    };
}

/**
 * Get resident discounts from privileges - DYNAMIC
 */
export function getResidentDiscounts(resident: Resident): ResidentDiscount[] {
    const discounts: ResidentDiscount[] = [];
    
    // Use privileges array from the backend
    if (resident.privileges && Array.isArray(resident.privileges) && resident.privileges.length > 0) {
        resident.privileges.forEach((rp: any) => {
            // Skip if not active
            if (rp.status !== 'active' && rp.status !== 'expiring_soon') return;
            
            // Skip if privilege is missing
            if (!rp.privilege) {
                console.warn('Resident privilege missing privilege data:', rp);
                return;
            }
            
            const privilege = rp.privilege;
            
            // Skip if privilege code is missing
            if (!privilege.code) {
                console.warn('Privilege missing code:', privilege);
                return;
            }
            
            discounts.push({
                type: privilege.code.toLowerCase(),
                label: privilege.name || privilege.code,
                percentage: rp.discount_percentage || privilege.default_discount_percentage || 0,
                id_number: rp.id_number,
                has_id: !!rp.id_number,
                privilege_code: privilege.code,
                expires_at: rp.expires_at
            });
        });
    }
    
    // Use discount_eligibility_list if available
    if (discounts.length === 0 && resident.discount_eligibility_list && Array.isArray(resident.discount_eligibility_list)) {
        resident.discount_eligibility_list.forEach((discount: any) => {
            if (!discount || !discount.type) return;
            
            const exists = discounts.some(d => d.type === discount.type);
            if (!exists) {
                discounts.push({
                    type: discount.type,
                    label: discount.label || discount.type,
                    percentage: discount.percentage || 0,
                    id_number: discount.id_number,
                    has_id: !!discount.id_number,
                    privilege_code: discount.privilege_code
                });
            }
        });
    }
    
    return discounts;
}

/**
 * Check if resident has a specific privilege - DYNAMIC
 */
export function hasPrivilege(resident: Resident, privilegeCode: string): boolean {
    if (!resident.privileges || !Array.isArray(resident.privileges)) return false;
    
    return resident.privileges.some((rp: any) => {
        if (rp.status !== 'active' && rp.status !== 'expiring_soon') return false;
        if (!rp.privilege || !rp.privilege.code) return false;
        return rp.privilege.code.toUpperCase() === privilegeCode.toUpperCase();
    });
}

/**
 * Get privilege details by code - DYNAMIC
 */
export function getPrivilegeByCode(resident: Resident, privilegeCode: string): any | null {
    if (!resident.privileges || !Array.isArray(resident.privileges)) return null;
    
    for (const rp of resident.privileges) {
        if (rp.status !== 'active' && rp.status !== 'expiring_soon') continue;
        if (!rp.privilege || !rp.privilege.code) continue;
        if (rp.privilege.code.toUpperCase() === privilegeCode.toUpperCase()) {
            return rp;
        }
    }
    
    return null;
}

/**
 * Check if discount is allowed for a specific fee - DYNAMIC
 */
export function checkIfDiscountAllowed(fee: OutstandingFee, privilegeCode: string): boolean {
    const fieldName = `has_${privilegeCode.toLowerCase()}_discount`;
    return (fee as any)[fieldName] === true;
}

/**
 * Get discount percentage for specific resident and fee type - DYNAMIC
 */
export function getDiscountPercentageForFeeType(fee: OutstandingFee, privilegeCode: string): number {
    const fieldName = `${privilegeCode.toLowerCase()}_discount_percentage`;
    const percentage = (fee as any)[fieldName];
    return percentage || 0;
}

/**
 * Helper function to filter fees by resident
 */
export function filterFeesByResident(fees: OutstandingFee[], residentId: number | string): OutstandingFee[] {
    return fees.filter(fee => {
        const balance = parseAmount(fee.balance);
        const isMatch = 
            fee.payer_type === 'resident' && 
            (fee.payer_id == residentId || fee.resident_id == residentId) &&
            balance > 0;
        
        return isMatch;
    });
}

/**
 * Helper function to filter fees by household
 */
export function filterFeesByHousehold(fees: OutstandingFee[], householdId: number | string): OutstandingFee[] {
    return fees.filter(fee => {
        const balance = parseAmount(fee.balance);
        const isMatch = 
            fee.payer_type === 'household' && 
            (fee.payer_id == householdId || fee.household_id == householdId) &&
            balance > 0;
        
        return isMatch;
    });
}

/**
 * Helper function to filter fees by business
 */
export function filterFeesByBusiness(fees: OutstandingFee[], businessId: number | string): OutstandingFee[] {
    return fees.filter(fee => {
        const balance = parseAmount(fee.balance);
        const isMatch = 
            fee.payer_type === 'business' && 
            (fee.payer_id == businessId || fee.business_id == businessId) &&
            balance > 0;
        
        return isMatch;
    });
}

/**
 * Calculate total amount from payment items
 */
export function calculatePaymentTotal(items: any[]): {
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total: number;
} {
    return items.reduce((acc, item) => ({
        subtotal: acc.subtotal + (item.base_amount || 0),
        surcharge: acc.surcharge + (item.surcharge || 0),
        penalty: acc.penalty + (item.penalty || 0),
        discount: acc.discount + (item.discount || 0),
        total: acc.total + (item.total_amount || 0),
    }), { subtotal: 0, surcharge: 0, penalty: 0, discount: 0, total: 0 });
}

/**
 * Format currency
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
 * Get discount type label - DYNAMIC
 */
export function getDiscountTypeLabel(type: string): string {
    // Convert from kebab/snake case to title case
    return type
        .split(/[_\s-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Validate if discount can be applied - DYNAMIC
 */
export function canApplyDiscount(
    privilegeCode: string,
    resident: Resident,
    fee: OutstandingFee
): { allowed: boolean; reason?: string } {
    // Check if resident has the privilege
    const hasPriv = hasPrivilege(resident, privilegeCode);
    
    if (!hasPriv) {
        return { allowed: false, reason: `Resident does not have ${privilegeCode} privilege` };
    }
    
    // Check if fee type allows this discount
    const isAllowed = checkIfDiscountAllowed(fee, privilegeCode);
    if (!isAllowed) {
        return { allowed: false, reason: 'This fee type does not allow this discount' };
    }
    
    return { allowed: true };
}

/**
 * Get applicable discounts for a fee based on resident privileges - DYNAMIC
 */
export function getApplicableDiscountsForFee(resident: Resident, fee: OutstandingFee): Array<{
    type: string;
    label: string;
    percentage: number;
    id_number?: string;
    has_id: boolean;
    privilege_code: string;
}> {
    const applicableDiscounts = [];
    
    if (!resident.privileges || !Array.isArray(resident.privileges)) return applicableDiscounts;
    
    for (const rp of resident.privileges) {
        if (rp.status !== 'active' && rp.status !== 'expiring_soon') continue;
        
        // Skip if privilege is missing
        if (!rp.privilege || !rp.privilege.code) continue;
        
        const privilege = rp.privilege;
        
        // Check if this fee type allows this discount
        const isAllowed = checkIfDiscountAllowed(fee, privilege.code);
        
        if (isAllowed) {
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

// Re-export everything
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
    getDiscountTypeLabel,
    getHighestDiscount,
    calculateDiscountAmount,
    canApplyDiscount,
    getPrivilegeIcon,
    getPrivilegeColor,
    hasPrivilege,
    getPrivilegeByCode,
    feeAllowsDiscount,
    getDiscountPercentage
};