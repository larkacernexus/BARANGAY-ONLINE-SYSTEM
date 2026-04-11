// app/components/admin/payment/paymentCreate/components/FeeHandlers.tsx

import { useCallback, useRef } from 'react';
import { 
    OutstandingFee, 
    PaymentItem,
    PaymentFormData,
    FeeType 
} from '@/types/admin/payments/payments';
import { 
    parseAmount, 
    getOutstandingFeeBalance, 
    getAmountPaid, 
    getTotalOriginalAmount,
    calculateMonthsLate, 
    isValidDate,
    getDiscountPercentageForFeeType,
    formatCurrency
} from '../utils';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface FeeHandlersProps {
    data: PaymentFormData;
    setData: ((data: any) => void) | ((key: string, value: any) => void);
    updateItems: (items: PaymentItem[]) => void;
    paymentItems: PaymentItem[];
    userModifiedPurpose: boolean;
    setUserModifiedPurpose: (value: boolean) => void;
    feeTypes: FeeType[];
    setSelectedOutstandingFee: (fee: OutstandingFee | null) => void;
    setShowDiscountSelection: (value: boolean) => void;
    setShowLateSettings: (value: boolean) => void;
    setIsLatePayment: (value: boolean) => void;
    setMonthsLate: (value: number) => void;
    setSelectedDiscount: (value: string) => void;
    onDiscountApplied?: (discountedAmount: number) => void;
}

interface PaymentBreakdown {
    baseAmount: number;
    surchargeAmount: number;
    penaltyAmount: number;
    discountAmount: number;
    totalAmount: number;
}

interface DiscountMetadata {
    type: string;
    percentage: number;
    amount: number;
    residentId: string | number;
    residentName: string;
}

interface OriginalFeeData {
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    amount_paid: number;
    balance: number;
    total_amount: number;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_percentage = 0;
const MAX_ROUNDING_ERROR = 0.01;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse currency string to number with 2 decimal places
 */
function parseCurrencyString(amount: string | number | null | undefined): number {
    if (amount === null || amount === undefined || amount === '') return 0;
    
    if (typeof amount === 'number') {
        return Number(amount.toFixed(2));
    }
    
    const cleaned = amount.replace(/[₱,$,\s,]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
}

/**
 * Normalize ID for comparison
 */
function normalizeId(id: string | number | null | undefined): string {
    if (id === null || id === undefined) return '';
    return String(id);
}

/**
 * Check if fee is already in payment items
 */
function isFeeAlreadyInPaymentItems(paymentItems: PaymentItem[], feeId: string | number): boolean {
    const normalizedFeeId = normalizeId(feeId);
    return paymentItems.some(item => normalizeId(item.fee_id) === normalizedFeeId);
}

/**
 * Calculate payment breakdown for remaining balance
 */
function calculatePaymentBreakdown(fee: OutstandingFee): PaymentBreakdown {
    const balanceToPay = getOutstandingFeeBalance(fee);
    const totalOriginal = getTotalOriginalAmount(fee);
    const amountPaid = getAmountPaid(fee);
    
    // If fully paid or no balance, return zeros
    if (balanceToPay <= 0 || totalOriginal <= 0) {
        return { baseAmount: 0, surchargeAmount: 0, penaltyAmount: 0, discountAmount: 0, totalAmount: 0 };
    }
    
    // Get original breakdown
    const originalBase = parseCurrencyString(fee.base_amount);
    const originalSurcharge = parseCurrencyString(fee.surcharge_amount);
    const originalPenalty = parseCurrencyString(fee.penalty_amount);
    const originalDiscount = parseCurrencyString(fee.discount_amount);
    
    // Calculate original totals
    const originalTotalBeforeDiscount = originalBase + originalSurcharge + originalPenalty;
    
    if (originalTotalBeforeDiscount <= 0) {
        return { 
            baseAmount: balanceToPay, 
            surchargeAmount: 0, 
            penaltyAmount: 0, 
            discountAmount: 0, 
            totalAmount: balanceToPay 
        };
    }
    
    // Calculate paid ratio
    const paidRatio = amountPaid / totalOriginal;
    
    // Calculate unpaid amounts
    const unpaidBase = Math.max(0, originalBase * (1 - paidRatio));
    const unpaidSurcharge = Math.max(0, originalSurcharge * (1 - paidRatio));
    const unpaidPenalty = Math.max(0, originalPenalty * (1 - paidRatio));
    const unpaidDiscount = Math.max(0, originalDiscount * (1 - paidRatio));
    
    // Calculate final total
    let finalTotal = unpaidBase + unpaidSurcharge + unpaidPenalty - unpaidDiscount;
    finalTotal = Math.max(0, Number(finalTotal.toFixed(2)));
    
    // Adjust for rounding errors
    if (Math.abs(finalTotal - balanceToPay) > MAX_ROUNDING_ERROR) {
        console.warn(`Rounding error in payment breakdown: ${Math.abs(finalTotal - balanceToPay)}`);
        const adjustment = balanceToPay - finalTotal;
        finalTotal = balanceToPay;
        
        return {
            baseAmount: Number(unpaidBase.toFixed(2)),
            surchargeAmount: Number(unpaidSurcharge.toFixed(2)),
            penaltyAmount: Number(unpaidPenalty.toFixed(2)),
            discountAmount: Number((unpaidDiscount + adjustment).toFixed(2)),
            totalAmount: finalTotal
        };
    }
    
    return {
        baseAmount: Number(unpaidBase.toFixed(2)),
        surchargeAmount: Number(unpaidSurcharge.toFixed(2)),
        penaltyAmount: Number(unpaidPenalty.toFixed(2)),
        discountAmount: Number(unpaidDiscount.toFixed(2)),
        totalAmount: finalTotal
    };
}

/**
 * Generate unique ID for payment item
 */
function generateUniqueId(): number {
    return Date.now() + Math.random();
}

/**
 * Validate fee before adding
 */
function validateFeeForPayment(fee: OutstandingFee): { valid: boolean; message?: string } {
    const balanceToPay = getOutstandingFeeBalance(fee);
    
    if (balanceToPay <= 0) {
        return { valid: false, message: 'This fee has no remaining balance to pay.' };
    }
    
    if (!fee.fee_code) {
        return { valid: false, message: 'Invalid fee: missing fee code.' };
    }
    
    if (fee.due_date && !isValidDate(fee.due_date)) {
        return { valid: false, message: `Invalid due date format for fee ${fee.fee_code}` };
    }
    
    return { valid: true };
}

/**
 * Get fee category safely
 */
function getFeeCategory(fee: OutstandingFee): string {
    return fee.fee_type_category || fee.category || 'other';
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useFeeHandlers({
    data,
    setData,
    updateItems,
    paymentItems,
    userModifiedPurpose,
    setUserModifiedPurpose,
    feeTypes,
    setSelectedOutstandingFee,
    setShowDiscountSelection,
    setShowLateSettings,
    setIsLatePayment,
    setMonthsLate,
    setSelectedDiscount,
    onDiscountApplied
}: FeeHandlersProps) {
    
    // Refs for tracking state to prevent infinite loops
    const isUpdatingRef = useRef(false);
    
    /**
     * Generate purpose text from items
     */
    const generatePurposeFromItems = useCallback((items: PaymentItem[]): string => {
        if (items.length === 0) return '';
        
        if (items.length === 1) {
            return items[0].fee_name;
        }
        
        if (items.length === 2) {
            return `${items[0].fee_name} and ${items[1].fee_name}`;
        }
        
        return `${items.length} fees selected`;
    }, []);
    
    /**
     * Update form data with new items and recalculated totals
     */
    const updateFormDataWithItems = useCallback((updatedItems: PaymentItem[], additionalUpdates?: Partial<PaymentFormData>) => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;
        
        try {
            // Calculate totals
            const subtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
            const surcharge = updatedItems.reduce((sum, item) => sum + (item.surcharge || 0), 0);
            const penalty = updatedItems.reduce((sum, item) => sum + (item.penalty || 0), 0);
            const discount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
            const total_amount = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
            
            const updates = {
                items: updatedItems,
                subtotal: Number(subtotal.toFixed(2)),
                surcharge: Number(surcharge.toFixed(2)),
                penalty: Number(penalty.toFixed(2)),
                discount: Number(discount.toFixed(2)),
                total_amount: Number(total_amount.toFixed(2)),
                ...additionalUpdates
            };
            
            // Update through updateItems prop
            updateItems(updatedItems);
            
            // Direct update as backup
            if (typeof setData === 'function') {
                // Check if setData accepts two arguments (key, value) or one argument (object)
                if (setData.length === 2) {
                    // setData expects (key, value) - handle each update individually
                    Object.entries(updates).forEach(([key, value]) => {
                        (setData as (key: string, value: any) => void)(key, value);
                    });
                } else {
                    // setData expects (updater function or object)
                    (setData as (data: any) => void)((prev: PaymentFormData) => ({
                        ...prev,
                        ...updates
                    }));
                }
            }
        } finally {
            // Use setTimeout to reset the flag after state updates complete
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
    }, [setData, updateItems]);
    
    /**
     * Add outstanding fee directly
     */
    const handleAddOutstandingFeeDirectly = useCallback((outstandingFee: OutstandingFee): void => {
        // Validate fee
        const validation = validateFeeForPayment(outstandingFee);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        // Check for duplicates
        if (isFeeAlreadyInPaymentItems(paymentItems, outstandingFee.id)) {
            console.warn('Duplicate fee prevented:', {
                feeId: outstandingFee.id,
                feeCode: outstandingFee.fee_code,
            });
            alert(`This fee (${outstandingFee.fee_code}) has already been added to the payment.`);
            return;
        }
        
        const balanceToPay = getOutstandingFeeBalance(outstandingFee);
        const paymentBreakdown = calculatePaymentBreakdown(outstandingFee);
        
        // Get fee type category (fee_type doesn't exist on OutstandingFee)
        const category = getFeeCategory(outstandingFee);
        
        // Calculate months late with safe due date handling
        const monthsLate = outstandingFee.due_date 
            ? calculateMonthsLate(outstandingFee.due_date)
            : 0;
        
        // Create payment item
        const newItem: PaymentItem = {
            id: generateUniqueId(),
            fee_id: String(outstandingFee.id), // Convert to string as per PaymentItem type
            fee_name: outstandingFee.fee_type_name || 'Fee',
            fee_code: outstandingFee.fee_code,
            description: outstandingFee.purpose || `Payment for ${outstandingFee.fee_type_name || 'Fee'}`,
            base_amount: paymentBreakdown.baseAmount,
            surcharge: paymentBreakdown.surchargeAmount,
            penalty: paymentBreakdown.penaltyAmount,
            discount: paymentBreakdown.discountAmount,
            total_amount: paymentBreakdown.totalAmount,
            category: category,
            period_covered: outstandingFee.billing_period || '',
            months_late: monthsLate,
            metadata: {
                is_outstanding_fee: true,
                is_clearance_fee: false,
                original_fee_id: outstandingFee.id,
                payer_type: outstandingFee.payer_type,
                payer_id: outstandingFee.payer_id,
                original_fee_data: {
                    base_amount: parseCurrencyString(outstandingFee.base_amount),
                    surcharge_amount: parseCurrencyString(outstandingFee.surcharge_amount),
                    penalty_amount: parseCurrencyString(outstandingFee.penalty_amount),
                    discount_amount: parseCurrencyString(outstandingFee.discount_amount),
                    amount_paid: getAmountPaid(outstandingFee),
                    balance: balanceToPay,
                    total_amount: getTotalOriginalAmount(outstandingFee)
                } as OriginalFeeData
            }
        };
        
        const updatedItems = [...paymentItems, newItem];
        
        // Update purpose if not modified and not clearance-related
        let purposeUpdate = {};
        if (!userModifiedPurpose && !data.purpose?.includes('Clearance')) {
            purposeUpdate = { purpose: generatePurposeFromItems(updatedItems) };
        }
        
        updateFormDataWithItems(updatedItems, purposeUpdate);
        
        console.log('Fee added successfully:', {
            feeId: outstandingFee.id,
            feeCode: outstandingFee.fee_code,
            amount: formatCurrency(paymentBreakdown.totalAmount)
        });
        
    }, [paymentItems, userModifiedPurpose, data.purpose, updateFormDataWithItems, generatePurposeFromItems]);
    
    /**
     * Add outstanding fee with discount
     */
    const handleAddOutstandingFeeWithDiscount = useCallback((
        outstandingFee: OutstandingFee, 
        discountType: string, 
        discountedAmount?: number
    ): void => {
        // Validate fee
        const validation = validateFeeForPayment(outstandingFee);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        // Check for duplicates
        if (isFeeAlreadyInPaymentItems(paymentItems, outstandingFee.id)) {
            console.warn('Duplicate fee with discount prevented:', {
                feeId: outstandingFee.id,
                feeCode: outstandingFee.fee_code,
            });
            alert(`This fee (${outstandingFee.fee_code}) has already been added to the payment.`);
            return;
        }
        
        const balanceToPay = getOutstandingFeeBalance(outstandingFee);
        const baseAmount = parseCurrencyString(outstandingFee.base_amount);
        const surchargeAmount = parseCurrencyString(outstandingFee.surcharge_amount);
        const penaltyAmount = parseCurrencyString(outstandingFee.penalty_amount);
        const existingDiscountAmount = parseCurrencyString(outstandingFee.discount_amount);
        const amountPaid = getAmountPaid(outstandingFee);
        const totalOriginal = getTotalOriginalAmount(outstandingFee);
        
        // Calculate discount
        const discountPercentage = getDiscountPercentageForFeeType(outstandingFee, discountType);
        const paidRatio = totalOriginal > 0 ? amountPaid / totalOriginal : 0;
        
        const additionalDiscount = (baseAmount * discountPercentage) / 100;
        const unpaidAdditionalDiscount = Math.max(0, additionalDiscount * (1 - paidRatio));
        
        // Calculate unpaid amounts
        const unpaidBase = Math.max(0, baseAmount * (1 - paidRatio));
        const unpaidSurcharge = Math.max(0, surchargeAmount * (1 - paidRatio));
        const unpaidPenalty = Math.max(0, penaltyAmount * (1 - paidRatio));
        const unpaidExistingDiscount = Math.max(0, existingDiscountAmount * (1 - paidRatio));
        
        const totalDiscount = unpaidExistingDiscount + unpaidAdditionalDiscount;
        const finalTotal = Math.max(0, unpaidBase + unpaidSurcharge + unpaidPenalty - totalDiscount);
        
        // Get fee category
        const category = getFeeCategory(outstandingFee);
        
        // Calculate months late with safe due date handling
        const monthsLate = outstandingFee.due_date 
            ? calculateMonthsLate(outstandingFee.due_date)
            : 0;
        
        // Create payment item with discount
        const newItem: PaymentItem = {
            id: generateUniqueId(),
            fee_id: String(outstandingFee.id), // Convert to string as per PaymentItem type
            fee_name: outstandingFee.fee_type_name || 'Fee',
            fee_code: outstandingFee.fee_code,
            description: `${outstandingFee.purpose || 'Fee'} (${discountType.replace(/_/g, ' ')} discount applied)`,
            base_amount: Number(unpaidBase.toFixed(2)),
            surcharge: Number(unpaidSurcharge.toFixed(2)),
            penalty: Number(unpaidPenalty.toFixed(2)),
            discount: Number(totalDiscount.toFixed(2)),
            total_amount: Number(finalTotal.toFixed(2)),
            category: category,
            period_covered: outstandingFee.billing_period || '',
            months_late: monthsLate,
            metadata: {
                is_outstanding_fee: true,
                is_clearance_fee: false,
                original_fee_id: outstandingFee.id,
                payer_type: outstandingFee.payer_type,
                payer_id: outstandingFee.payer_id,
                appliedDiscount: {
                    type: discountType,
                    percentage: discountPercentage,
                    amount: additionalDiscount,
                    residentId: data.payer_id,
                    residentName: data.payer_name
                } as DiscountMetadata,
                original_fee_data: {
                    base_amount: baseAmount,
                    surcharge_amount: surchargeAmount,
                    penalty_amount: penaltyAmount,
                    discount_amount: existingDiscountAmount,
                    amount_paid: amountPaid,
                    balance: balanceToPay,
                    total_amount: totalOriginal
                } as OriginalFeeData
            }
        };
        
        const updatedItems = [...paymentItems, newItem];
        
        // Prepare updates
        const updates: Partial<PaymentFormData> = {
            discount_type: discountType
        };
        
        // Set amount_paid if discounted amount provided
        if (discountedAmount !== undefined && discountedAmount > 0) {
            updates.amount_paid = discountedAmount;
            onDiscountApplied?.(discountedAmount);
        }
        
        // Update purpose if not modified
        if (!userModifiedPurpose && !data.purpose?.includes('Clearance')) {
            updates.purpose = generatePurposeFromItems(updatedItems);
        }
        
        updateFormDataWithItems(updatedItems, updates);
        
        console.log('Discounted fee added successfully:', {
            feeId: outstandingFee.id,
            feeCode: outstandingFee.fee_code,
            discountType,
            discountPercentage,
            originalAmount: formatCurrency(balanceToPay),
            discountedAmount: formatCurrency(finalTotal)
        });
        
    }, [paymentItems, data.payer_id, data.payer_name, data.purpose, userModifiedPurpose, 
        updateFormDataWithItems, generatePurposeFromItems, onDiscountApplied]);
    
    /**
     * Handle clicking on an outstanding fee
     */
    const handleOutstandingFeeClick = useCallback((fee: OutstandingFee): void => {
        // Check for duplicates first
        if (isFeeAlreadyInPaymentItems(paymentItems, fee.id)) {
            alert(`This fee (${fee.fee_code}) has already been added to the payment.`);
            return;
        }
        
        // Validate fee
        const validation = validateFeeForPayment(fee);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        // Check for applicable discounts
        const hasApplicableDiscounts = fee.applicableDiscounts && fee.applicableDiscounts.length > 0;
        
        if (hasApplicableDiscounts) {
            // Show discount selection modal
            setSelectedOutstandingFee(fee);
            setShowDiscountSelection(true);
            return;
        }
        
        // Check for late payment (only if due_date exists)
        if (fee.due_date) {
            const paymentDate = new Date(data.payment_date);
            const dueDate = new Date(fee.due_date);
            const isPaymentLate = paymentDate > dueDate;
            const feeType = feeTypes.find(f => f.id === fee.fee_type_id);
            
            const shouldShowLateModal = feeType && 
                                       (feeType.has_surcharge || feeType.has_penalty) && 
                                       isPaymentLate;
            
            if (shouldShowLateModal) {
                setSelectedOutstandingFee(fee);
                setShowLateSettings(true);
                setIsLatePayment(true);
                setMonthsLate(Math.max(1, calculateMonthsLate(fee.due_date, paymentDate)));
                return;
            }
        }
        
        // Add fee directly
        handleAddOutstandingFeeDirectly(fee);
        
    }, [paymentItems, data.payment_date, feeTypes, handleAddOutstandingFeeDirectly,
        setSelectedOutstandingFee, setShowDiscountSelection, setShowLateSettings, 
        setIsLatePayment, setMonthsLate]);
    
    /**
     * Remove payment item
     */
    const removePaymentItem = useCallback((id: number): void => {
        const itemToRemove = paymentItems.find(item => item.id === id);
        if (!itemToRemove) return;
        
        const updatedItems = paymentItems.filter(item => item.id !== id);
        
        // Prepare updates
        const updates: Partial<PaymentFormData> = {};
        
        // Update purpose if not modified
        if (!userModifiedPurpose) {
            updates.purpose = updatedItems.length > 0 
                ? generatePurposeFromItems(updatedItems) 
                : '';
        }
        
        // Clear clearance fields if removing last clearance item
        if (itemToRemove.metadata?.is_clearance_fee) {
            const hasOtherClearanceItems = updatedItems.some(item => 
                item.metadata?.is_clearance_fee
            );
            
            if (!hasOtherClearanceItems) {
                updates.clearance_type = '';
                updates.clearance_type_id = '';
                updates.clearance_code = '';
                updates.is_cleared = false;
                updates.validity_date = '';
                updates.clearance_request_id = undefined;
            }
        }
        
        updateFormDataWithItems(updatedItems, updates);
        
        console.log('Payment item removed:', { id, feeName: itemToRemove.fee_name });
        
    }, [paymentItems, userModifiedPurpose, updateFormDataWithItems, generatePurposeFromItems]);
    
    /**
     * Handle fee selection with discount
     */
    const handleFeeWithDiscount = useCallback((
        fee: OutstandingFee, 
        discountType: string, 
        discountedAmount?: number
    ) => {
        // Check for duplicates before adding with discount
        if (isFeeAlreadyInPaymentItems(paymentItems, fee.id)) {
            alert(`This fee (${fee.fee_code}) has already been added to the payment.`);
            // Reset modal states
            setSelectedOutstandingFee(null);
            setShowDiscountSelection(false);
            setSelectedDiscount('');
            return;
        }
        
        handleAddOutstandingFeeWithDiscount(fee, discountType, discountedAmount);
        
        // Reset modal states
        setSelectedOutstandingFee(null);
        setShowDiscountSelection(false);
        setSelectedDiscount('');
        
    }, [handleAddOutstandingFeeWithDiscount, paymentItems, 
        setSelectedOutstandingFee, setShowDiscountSelection, setSelectedDiscount]);
    
    /**
     * Check if a fee is already added
     */
    const isFeeAdded = useCallback((feeId: string | number): boolean => {
        return isFeeAlreadyInPaymentItems(paymentItems, feeId);
    }, [paymentItems]);
    
    return {
        handleOutstandingFeeClick,
        handleAddOutstandingFeeDirectly,
        handleAddOutstandingFeeWithDiscount,
        handleFeeWithDiscount,
        removePaymentItem,
        generatePurposeFromItems,
        isFeeAdded
    };
}