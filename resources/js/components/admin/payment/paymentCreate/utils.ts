// app/Pages/Admin/Payments/utils.ts

import { OutstandingFee, BackendFee, FeeType, Resident, ResidentDiscount } from './types';

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
 * 🔴 FIXED: Convert BackendFee to OutstandingFee format with proper payer_id mapping
 */
export function convertBackendFeeToOutstandingFee(fee: BackendFee, feeTypes: FeeType[]): OutstandingFee {
    const feeType = feeTypes.find(ft => ft.id == fee.fee_type_id);
    
    // 🔴 CRITICAL FIX: Determine payer type and ID correctly
    let payerType = fee.payer_type;
    let payerId = fee.payer_id;
    let residentId = fee.resident_id;
    let householdId = fee.household_id;
    
    // Handle string payer types from backend (might be full class names)
    if (payerType === 'App\\Models\\Resident') {
        payerType = 'resident';
        payerId = fee.payer_id || fee.resident_id;
        residentId = fee.payer_id || fee.resident_id;
    } else if (payerType === 'App\\Models\\Household') {
        payerType = 'household';
        payerId = fee.payer_id || fee.household_id;
        householdId = fee.payer_id || fee.household_id;
    }
    
    // If payer_id is missing but we have resident_id or household_id, use those
    if (!payerId) {
        if (residentId) {
            payerId = residentId;
            payerType = 'resident';
        } else if (householdId) {
            payerId = householdId;
            payerType = 'household';
        }
    }
    
    console.log('🔄 Converting backend fee:', {
        id: fee.id,
        fee_code: fee.fee_code,
        payer_name: fee.payer_name,
        payer_type: payerType,
        payer_id: payerId,
        resident_id: residentId,
        household_id: householdId,
        balance: fee.balance
    });
    
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
        // Add fee type discount settings from backend
        fee_type_has_senior_discount: fee.fee_type_has_senior_discount || feeType?.has_senior_discount || false,
        fee_type_senior_discount_percentage: fee.fee_type_senior_discount_percentage || feeType?.senior_discount_percentage || 0,
        fee_type_has_pwd_discount: fee.fee_type_has_pwd_discount || feeType?.has_pwd_discount || false,
        fee_type_pwd_discount_percentage: fee.fee_type_pwd_discount_percentage || feeType?.pwd_discount_percentage || 0,
        fee_type_has_solo_parent_discount: fee.fee_type_has_solo_parent_discount || feeType?.has_solo_parent_discount || false,
        fee_type_solo_parent_discount_percentage: fee.fee_type_solo_parent_discount_percentage || feeType?.solo_parent_discount_percentage || 0,
        fee_type_has_indigent_discount: fee.fee_type_has_indigent_discount || feeType?.has_indigent_discount || false,
        fee_type_indigent_discount_percentage: fee.fee_type_indigent_discount_percentage || feeType?.indigent_discount_percentage || 0,
        // Add these for discount handling
        applicableDiscounts: fee.applicableDiscounts || [],
        canApplyDiscount: fee.canApplyDiscount || false,
    };
}

/**
 * Check if resident is eligible for any discounts
 */
export function getResidentDiscounts(resident: Resident): ResidentDiscount[] {
    const discounts: ResidentDiscount[] = [];
    
    if (resident.is_senior) {
        discounts.push({
            type: 'senior',
            label: 'Senior Citizen',
            percentage: 20,
            id_number: (resident as any).senior_id_number,
            has_id: !!(resident as any).senior_id_number
        });
    }
    
    if (resident.is_pwd) {
        discounts.push({
            type: 'pwd',
            label: 'Person with Disability',
            percentage: 20,
            id_number: (resident as any).pwd_id_number,
            has_id: !!(resident as any).pwd_id_number
        });
    }
    
    if (resident.is_solo_parent) {
        discounts.push({
            type: 'solo_parent',
            label: 'Solo Parent',
            percentage: 15,
            id_number: (resident as any).solo_parent_id_number,
            has_id: !!(resident as any).solo_parent_id_number
        });
    }
    
    if (resident.is_indigent) {
        discounts.push({
            type: 'indigent',
            label: 'Indigent',
            percentage: 25,
            id_number: (resident as any).indigent_id_number,
            has_id: !!(resident as any).indigent_id_number
        });
    }
    
    if (resident.is_veteran) {
        discounts.push({
            type: 'veteran',
            label: 'Veteran',
            percentage: 100,
            id_number: (resident as any).veteran_id_number,
            has_id: !!(resident as any).veteran_id_number
        });
    }
    
    if (resident.is_government_employee) {
        discounts.push({
            type: 'government_employee',
            label: 'Government Employee',
            percentage: 10,
            id_number: undefined,
            has_id: false
        });
    }
    
    return discounts;
}

/**
 * Check if discount is allowed for a specific fee
 */
export function checkIfDiscountAllowed(fee: OutstandingFee, discountType: string): boolean {
    switch (discountType) {
        case 'senior':
            return fee.fee_type_has_senior_discount || false;
        case 'pwd':
            return fee.fee_type_has_pwd_discount || false;
        case 'solo_parent':
            return fee.fee_type_has_solo_parent_discount || false;
        case 'indigent':
            return fee.fee_type_has_indigent_discount || false;
        case 'veteran':
            return true;
        case 'government_employee':
            return true;
        default:
            return false;
    }
}

/**
 * Get discount percentage for specific resident and fee type
 */
export function getDiscountPercentageForFeeType(fee: OutstandingFee, discountType: string): number {
    switch (discountType) {
        case 'senior':
            return fee.fee_type_senior_discount_percentage || 20;
        case 'pwd':
            return fee.fee_type_pwd_discount_percentage || 20;
        case 'solo_parent':
            return fee.fee_type_solo_parent_discount_percentage || 15;
        case 'indigent':
            return fee.fee_type_indigent_discount_percentage || 25;
        case 'veteran':
            return 100;
        case 'government_employee':
            return 10;
        default:
            return 0;
    }
}

/**
 * 🔴 NEW: Helper function to filter fees by resident
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
 * 🔴 NEW: Helper function to filter fees by household
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