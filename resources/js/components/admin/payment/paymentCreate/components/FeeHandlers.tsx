// app/components/admin/payment/paymentCreate/components/FeeHandlers.tsx
import { useCallback } from 'react';
import { 
    OutstandingFee, 
    PaymentItem,
    PaymentFormData,
    FeeType 
} from '../types';
import { 
    parseAmount, 
    getOutstandingFeeBalance, 
    getAmountPaid, 
    getTotalOriginalAmount,
    calculateMonthsLate, 
    isValidDate,
    getDiscountPercentageForFeeType 
} from '../utils';

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
    // NEW: Optional callback for when discount is applied with amount
    onDiscountApplied?: (discountedAmount: number) => void;
}

/**
 * FIXED: Consistent amount parsing with 2 decimal places
 */
function parseCurrencyString(amountString: string | number | null | undefined): number {
    if (amountString === null || amountString === undefined || amountString === '') return 0;
    
    if (typeof amountString === 'number') {
        return parseFloat(amountString.toFixed(2));
    }
    
    if (typeof amountString === 'string') {
        // Remove currency symbols and commas
        const cleaned = amountString.replace(/[₱,$,\s,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
    }
    
    return 0;
}

/**
 * FIXED: Helper to normalize IDs for comparison
 */
function normalizeId(id: string | number | null | undefined): string {
    if (id === null || id === undefined) return '';
    return String(id);
}

/**
 * FIXED: Check if a fee is already in payment items
 */
function isFeeAlreadyInPaymentItems(paymentItems: PaymentItem[], feeId: string | number): boolean {
    const normalizedFeeId = normalizeId(feeId);
    return paymentItems.some(item => normalizeId(item.fee_id) === normalizedFeeId);
}

/**
 * FIXED: Calculate payment breakdown for the remaining balance
 */
const calculatePaymentBreakdown = (fee: OutstandingFee): {
    baseAmount: number;
    surchargeAmount: number;
    penaltyAmount: number;
    discountAmount: number;
    totalAmount: number;
} => {
    const balanceToPay = getOutstandingFeeBalance(fee);
    const totalOriginal = getTotalOriginalAmount(fee);
    const amountPaid = getAmountPaid(fee);
    
    // If fully paid or no balance, return zeros
    if (balanceToPay <= 0) {
        return { baseAmount: 0, surchargeAmount: 0, penaltyAmount: 0, discountAmount: 0, totalAmount: 0 };
    }
    
    // Get original breakdown
    const originalBase = parseCurrencyString(fee.base_amount);
    const originalSurcharge = parseCurrencyString(fee.surcharge_amount || '0');
    const originalPenalty = parseCurrencyString(fee.penalty_amount || '0');
    const originalDiscount = parseCurrencyString(fee.discount_amount || '0');
    
    // Calculate original ratios
    const originalTotalBeforeDiscount = originalBase + originalSurcharge + originalPenalty;
    
    if (originalTotalBeforeDiscount <= 0) {
        // If no original amounts, just return the balance as base
        return { 
            baseAmount: balanceToPay, 
            surchargeAmount: 0, 
            penaltyAmount: 0, 
            discountAmount: 0, 
            totalAmount: balanceToPay 
        };
    }
    
    const originalDiscountRatio = originalTotalBeforeDiscount > 0 ? originalDiscount / originalTotalBeforeDiscount : 0;
    
    // Solve for X: X = balanceToPay / (1 - originalDiscountRatio)
    const totalBeforeDiscountForPayment = balanceToPay / (1 - originalDiscountRatio);
    
    // Calculate proportional amounts
    const baseRatio = originalBase / originalTotalBeforeDiscount;
    const surchargeRatio = originalSurcharge / originalTotalBeforeDiscount;
    const penaltyRatio = originalPenalty / originalTotalBeforeDiscount;
    
    const baseAmount = totalBeforeDiscountForPayment * baseRatio;
    const surchargeAmount = totalBeforeDiscountForPayment * surchargeRatio;
    const penaltyAmount = totalBeforeDiscountForPayment * penaltyRatio;
    const discountAmount = totalBeforeDiscountForPayment * originalDiscountRatio;
    
    // Verify the math
    const calculatedTotal = baseAmount + surchargeAmount + penaltyAmount - discountAmount;
    const roundingError = Math.abs(calculatedTotal - balanceToPay);
    
    if (roundingError > 0.01) {
        console.warn(`Rounding error in payment breakdown: ${roundingError}`);
        // Adjust to ensure total matches balanceToPay
        const adjustment = balanceToPay - calculatedTotal;
        return {
            baseAmount: parseFloat(baseAmount.toFixed(2)),
            surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
            penaltyAmount: parseFloat(penaltyAmount.toFixed(2)),
            discountAmount: parseFloat((discountAmount + adjustment).toFixed(2)),
            totalAmount: balanceToPay
        };
    }
    
    return {
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
        penaltyAmount: parseFloat(penaltyAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        totalAmount: balanceToPay
    };
};

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
    onDiscountApplied // NEW
}: FeeHandlersProps) {
    
    /**
     * Generate purpose text from items
     */
    const generatePurposeFromItems = useCallback((items: PaymentItem[]): string => {
        if (items.length === 0) return '';
        
        const itemNames = items.map(item => item.fee_name);
        
        if (items.length === 1) {
            return itemNames[0];
        }
        
        if (items.length === 2) {
            return `${itemNames[0]} and ${itemNames[1]}`;
        }
        
        return `${items.length} fees selected`;
    }, []);

    /**
     * 🔴 FIXED: Add outstanding fee directly - WITH DUAL UPDATE PATH
     */
    const handleAddOutstandingFeeDirectly = useCallback((outstandingFee: OutstandingFee): void => {
        // 🔴 CRITICAL FIX: Strong duplicate prevention
        const isAlreadyAdded = isFeeAlreadyInPaymentItems(paymentItems, outstandingFee.id);
        
        if (isAlreadyAdded) {
            console.warn('⚠️ DUPLICATE PREVENTED: Fee already added:', {
                feeId: outstandingFee.id,
                feeCode: outstandingFee.fee_code,
            });
            alert(`This fee (${outstandingFee.fee_code}) has already been added to the payment.`);
            return;
        }
        
        console.log('💰 Adding outstanding fee:', {
            feeId: outstandingFee.id,
            feeCode: outstandingFee.fee_code,
            balance: outstandingFee.balance,
            amount_paid: outstandingFee.amount_paid,
            payer: outstandingFee.payer_name
        });
        
        // Get correct balance to pay
        const balanceToPay = getOutstandingFeeBalance(outstandingFee);
        
        if (balanceToPay <= 0) {
            alert('This fee has no remaining balance to pay.');
            return;
        }
        
        // Calculate payment breakdown
        const paymentBreakdown = calculatePaymentBreakdown(outstandingFee);
        
        // Get fee type category
        const category = outstandingFee.fee_type_category || 
                        outstandingFee.fee_type?.category || 
                        outstandingFee.category || 
                        'other';
        
        // Create payment item with unique ID
        const newItem: PaymentItem = {
            id: Date.now() + Math.random(), // Ensure truly unique ID
            fee_id: outstandingFee.id,
            fee_name: outstandingFee.fee_type_name || outstandingFee.fee_type?.name || 'Fee',
            fee_code: outstandingFee.fee_code,
            description: outstandingFee.purpose || `Payment for ${outstandingFee.fee_type_name || 'Fee'}`,
            base_amount: paymentBreakdown.baseAmount,
            surcharge: paymentBreakdown.surchargeAmount,
            penalty: paymentBreakdown.penaltyAmount,
            discount: paymentBreakdown.discountAmount,
            total_amount: paymentBreakdown.totalAmount,
            category: category,
            period_covered: outstandingFee.billing_period || '',
            months_late: calculateMonthsLate(outstandingFee.due_date),
            metadata: {
                is_outstanding_fee: true,
                is_clearance_fee: false,
                original_fee_id: outstandingFee.id,
                payer_type: outstandingFee.payer_type,
                payer_id: outstandingFee.payer_id,
                original_fee_data: {
                    base_amount: parseCurrencyString(outstandingFee.base_amount),
                    surcharge_amount: parseCurrencyString(outstandingFee.surcharge_amount || '0'),
                    penalty_amount: parseCurrencyString(outstandingFee.penalty_amount || '0'),
                    discount_amount: parseCurrencyString(outstandingFee.discount_amount || '0'),
                    amount_paid: getAmountPaid(outstandingFee),
                    balance: balanceToPay,
                    total_amount: getTotalOriginalAmount(outstandingFee)
                }
            }
        };
        
        console.log('✅ Created payment item:', newItem);
        
        // 🔴 CRITICAL FIX: Create new array and update through BOTH methods
        const updatedItems = [...paymentItems, newItem];
        
        // 1. Update through updateItems prop (useFeeCalculations)
        updateItems(updatedItems);
        
        // 2. DIRECTLY update the form data as backup
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                // Key/value pattern
                setData('items', updatedItems);
                
                // Recalculate totals
                const subtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
                const surcharge = updatedItems.reduce((sum, item) => sum + (item.surcharge || 0), 0);
                const penalty = updatedItems.reduce((sum, item) => sum + (item.penalty || 0), 0);
                const discount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
                const total_amount = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                
                setData('subtotal', parseFloat(subtotal.toFixed(2)));
                setData('surcharge', parseFloat(surcharge.toFixed(2)));
                setData('penalty', parseFloat(penalty.toFixed(2)));
                setData('discount', parseFloat(discount.toFixed(2)));
                setData('total_amount', parseFloat(total_amount.toFixed(2)));
            } else {
                // Object pattern
                setData((prev: PaymentFormData) => {
                    const subtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
                    const surcharge = updatedItems.reduce((sum, item) => sum + (item.surcharge || 0), 0);
                    const penalty = updatedItems.reduce((sum, item) => sum + (item.penalty || 0), 0);
                    const discount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
                    const total_amount = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                    
                    return {
                        ...prev,
                        items: updatedItems,
                        subtotal: parseFloat(subtotal.toFixed(2)),
                        surcharge: parseFloat(surcharge.toFixed(2)),
                        penalty: parseFloat(penalty.toFixed(2)),
                        discount: parseFloat(discount.toFixed(2)),
                        total_amount: parseFloat(total_amount.toFixed(2))
                    };
                });
            }
        }
        
        // Update purpose if not modified
        if (!userModifiedPurpose && !data.purpose?.includes('Clearance')) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('purpose', newPurpose);
                } else {
                    setData((prev: PaymentFormData) => ({
                        ...prev,
                        purpose: newPurpose
                    }));
                }
            }
        }
        
    }, [paymentItems, userModifiedPurpose, data.purpose, updateItems, setData, generatePurposeFromItems]);

    /**
     * 🔴 FIXED: Add outstanding fee with discount - WITH DUAL UPDATE PATH
     * AND NOW SUPPORTS DISCOUNTED AMOUNT CALLBACK
     */
    const handleAddOutstandingFeeWithDiscount = useCallback((outstandingFee: OutstandingFee, discountType: string, discountedAmount?: number): void => {
        // 🔴 CRITICAL FIX: Strong duplicate prevention
        const isAlreadyAdded = isFeeAlreadyInPaymentItems(paymentItems, outstandingFee.id);
        
        if (isAlreadyAdded) {
            console.warn('⚠️ DUPLICATE PREVENTED: Fee with discount already added:', {
                feeId: outstandingFee.id,
                feeCode: outstandingFee.fee_code,
            });
            alert(`This fee (${outstandingFee.fee_code}) has already been added to the payment.`);
            return;
        }
        
        console.log('💰 Adding fee with discount:', {
            feeId: outstandingFee.id,
            discountType,
            discountedAmount,
            balance: outstandingFee.balance
        });
        
        // Get correct balance to pay
        const balanceToPay = getOutstandingFeeBalance(outstandingFee);
        
        if (balanceToPay <= 0) {
            alert('This fee has no remaining balance to pay.');
            return;
        }
        
        // Get fee breakdown
        const baseAmount = parseCurrencyString(outstandingFee.base_amount);
        const surchargeAmount = parseCurrencyString(outstandingFee.surcharge_amount || '0');
        const penaltyAmount = parseCurrencyString(outstandingFee.penalty_amount || '0');
        const existingDiscountAmount = parseCurrencyString(outstandingFee.discount_amount || '0');
        const amountPaid = getAmountPaid(outstandingFee);
        const totalOriginal = getTotalOriginalAmount(outstandingFee);
        
        // Get discount percentage for this specific fee
        const discountPercentage = getDiscountPercentageForFeeType(outstandingFee, discountType);
        const additionalDiscount = (baseAmount * discountPercentage) / 100;
        
        // Calculate unpaid portions
        const paidRatio = totalOriginal > 0 ? amountPaid / totalOriginal : 0;
        const unpaidBase = Math.max(0, baseAmount * (1 - paidRatio));
        const unpaidSurcharge = Math.max(0, surchargeAmount * (1 - paidRatio));
        const unpaidPenalty = Math.max(0, penaltyAmount * (1 - paidRatio));
        const unpaidExistingDiscount = Math.max(0, existingDiscountAmount * (1 - paidRatio));
        const unpaidAdditionalDiscount = Math.max(0, additionalDiscount * (1 - paidRatio));
        const unpaidTotalDiscount = unpaidExistingDiscount + unpaidAdditionalDiscount;
        
        // Calculate final total with all discounts applied
        const finalTotal = Math.max(0, unpaidBase + unpaidSurcharge + unpaidPenalty - unpaidTotalDiscount);
        
        // Get fee type category
        const category = outstandingFee.fee_type_category || 
                        outstandingFee.fee_type?.category || 
                        outstandingFee.category || 
                        'other';
        
        // Create payment item with discount
        const newItem: PaymentItem = {
            id: Date.now() + Math.random(), // Ensure truly unique ID
            fee_id: outstandingFee.id,
            fee_name: outstandingFee.fee_type_name || outstandingFee.fee_type?.name || 'Fee',
            fee_code: outstandingFee.fee_code,
            description: `${outstandingFee.purpose || 'Fee'} (${discountType.replace('_', ' ')} discount applied)`,
            base_amount: parseFloat(unpaidBase.toFixed(2)),
            surcharge: parseFloat(unpaidSurcharge.toFixed(2)),
            penalty: parseFloat(unpaidPenalty.toFixed(2)),
            discount: parseFloat(unpaidTotalDiscount.toFixed(2)),
            total_amount: parseFloat(finalTotal.toFixed(2)),
            category: category,
            period_covered: outstandingFee.billing_period || '',
            months_late: calculateMonthsLate(outstandingFee.due_date),
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
                },
                original_fee_data: {
                    base_amount: baseAmount,
                    surcharge_amount: surchargeAmount,
                    penalty_amount: penaltyAmount,
                    discount_amount: existingDiscountAmount,
                    amount_paid: amountPaid,
                    balance: balanceToPay,
                    total_amount: totalOriginal
                }
            }
        };
        
        console.log('✅ Created discounted payment item:', newItem);
        
        // 🔴 CRITICAL FIX: Create new array and update through BOTH methods
        const updatedItems = [...paymentItems, newItem];
        
        // 1. Update through updateItems prop
        updateItems(updatedItems);
        
        // 2. DIRECTLY update the form data as backup
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                // Key/value pattern
                setData('items', updatedItems);
                setData('discount_type', discountType);
                
                // Recalculate totals
                const subtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
                const surcharge = updatedItems.reduce((sum, item) => sum + (item.surcharge || 0), 0);
                const penalty = updatedItems.reduce((sum, item) => sum + (item.penalty || 0), 0);
                const discount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
                const total_amount = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                
                setData('subtotal', parseFloat(subtotal.toFixed(2)));
                setData('surcharge', parseFloat(surcharge.toFixed(2)));
                setData('penalty', parseFloat(penalty.toFixed(2)));
                setData('discount', parseFloat(discount.toFixed(2)));
                setData('total_amount', parseFloat(total_amount.toFixed(2)));
                
                // 🔥 NEW: Set the amount_paid to the discounted amount if provided
                if (discountedAmount !== undefined && discountedAmount > 0) {
                    console.log('💰 Setting amount_paid to discounted amount:', discountedAmount);
                    setData('amount_paid', discountedAmount);
                    
                    // Call the callback if provided
                    if (onDiscountApplied) {
                        onDiscountApplied(discountedAmount);
                    }
                }
            } else {
                // Object pattern
                setData((prev: PaymentFormData) => {
                    const subtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
                    const surcharge = updatedItems.reduce((sum, item) => sum + (item.surcharge || 0), 0);
                    const penalty = updatedItems.reduce((sum, item) => sum + (item.penalty || 0), 0);
                    const discount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
                    const total_amount = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                    
                    const updated = {
                        ...prev,
                        items: updatedItems,
                        subtotal: parseFloat(subtotal.toFixed(2)),
                        surcharge: parseFloat(surcharge.toFixed(2)),
                        penalty: parseFloat(penalty.toFixed(2)),
                        discount: parseFloat(discount.toFixed(2)),
                        discount_type: discountType,
                        total_amount: parseFloat(total_amount.toFixed(2))
                    };
                    
                    // 🔥 NEW: Set the amount_paid to the discounted amount if provided
                    if (discountedAmount !== undefined && discountedAmount > 0) {
                        updated.amount_paid = discountedAmount;
                        
                        // Call the callback if provided
                        if (onDiscountApplied) {
                            onDiscountApplied(discountedAmount);
                        }
                    }
                    
                    return updated;
                });
            }
        }
        
        // Update purpose if not modified
        if (!userModifiedPurpose && !data.purpose?.includes('Clearance')) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('purpose', newPurpose);
                } else {
                    setData((prev: PaymentFormData) => ({
                        ...prev,
                        purpose: newPurpose
                    }));
                }
            }
        }
        
    }, [paymentItems, data.payer_id, data.payer_name, data.purpose, userModifiedPurpose, updateItems, setData, generatePurposeFromItems, onDiscountApplied]);

    /**
     * 🔴 FIXED: Handle clicking on an outstanding fee
     */
    const handleOutstandingFeeClick = useCallback((fee: OutstandingFee): void => {
        // Check for duplicates first
        if (isFeeAlreadyInPaymentItems(paymentItems, fee.id)) {
            console.warn('⚠️ DUPLICATE CLICK PREVENTED: Fee already added:', {
                feeId: fee.id,
                feeCode: fee.fee_code
            });
            alert(`This fee (${fee.fee_code}) has already been added to the payment.`);
            return;
        }
        
        if (!isValidDate(fee.due_date)) {
            alert(`Error: Invalid due date format for fee ${fee.fee_code}`);
            return;
        }
        
        // Check if resident has applicable discounts
        const hasApplicableDiscounts = fee.applicableDiscounts && fee.applicableDiscounts.length > 0;
        
        console.log('🎯 Checking discount eligibility for fee:', {
            feeId: fee.id,
            feeCode: fee.fee_code,
            hasApplicableDiscounts,
            applicableDiscounts: fee.applicableDiscounts,
        });
        
        if (hasApplicableDiscounts) {
            // Show discount selection modal
            setSelectedOutstandingFee(fee);
            setShowDiscountSelection(true);
        } else {
            // Proceed with normal flow
            const paymentDate = new Date(data.payment_date);
            const dueDate = new Date(fee.due_date);
            const isPaymentLate = paymentDate > dueDate;
            const feeType = feeTypes.find(f => f.id === fee.fee_type_id);
            
            const shouldShowModal = feeType && (feeType.has_surcharge || feeType.has_penalty) && isPaymentLate;
            
            if (shouldShowModal) {
                setSelectedOutstandingFee(fee);
                setShowLateSettings(true);
                setIsLatePayment(true);
                setMonthsLate(Math.max(1, calculateMonthsLate(fee.due_date, paymentDate)));
            } else {
                // Add fee directly
                handleAddOutstandingFeeDirectly(fee);
            }
        }
    }, [paymentItems, data.payment_date, feeTypes, 
        handleAddOutstandingFeeDirectly,
        setSelectedOutstandingFee, setShowDiscountSelection, setShowLateSettings, 
        setIsLatePayment, setMonthsLate]);

    /**
     * Remove payment item
     */
    const removePaymentItem = useCallback((id: number): void => {
        console.log('🗑️ Removing payment item:', id);
        
        const updatedItems = paymentItems.filter(item => item.id !== id);
        
        // Update through both methods
        updateItems(updatedItems);
        
        // Direct backup update
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('items', updatedItems);
                
                // Recalculate totals
                const subtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
                const surcharge = updatedItems.reduce((sum, item) => sum + (item.surcharge || 0), 0);
                const penalty = updatedItems.reduce((sum, item) => sum + (item.penalty || 0), 0);
                const discount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
                const total_amount = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                
                setData('subtotal', parseFloat(subtotal.toFixed(2)));
                setData('surcharge', parseFloat(surcharge.toFixed(2)));
                setData('penalty', parseFloat(penalty.toFixed(2)));
                setData('discount', parseFloat(discount.toFixed(2)));
                setData('total_amount', parseFloat(total_amount.toFixed(2)));
            } else {
                setData((prev: PaymentFormData) => {
                    const subtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
                    const surcharge = updatedItems.reduce((sum, item) => sum + (item.surcharge || 0), 0);
                    const penalty = updatedItems.reduce((sum, item) => sum + (item.penalty || 0), 0);
                    const discount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
                    const total_amount = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                    
                    return {
                        ...prev,
                        items: updatedItems,
                        subtotal: parseFloat(subtotal.toFixed(2)),
                        surcharge: parseFloat(surcharge.toFixed(2)),
                        penalty: parseFloat(penalty.toFixed(2)),
                        discount: parseFloat(discount.toFixed(2)),
                        total_amount: parseFloat(total_amount.toFixed(2))
                    };
                });
            }
        }
        
        // Update purpose if not modified
        if (!userModifiedPurpose) {
            if (updatedItems.length > 0) {
                const newPurpose = generatePurposeFromItems(updatedItems);
                if (typeof setData === 'function') {
                    if (setData.length === 2) {
                        setData('purpose', newPurpose);
                    } else {
                        setData((prev: PaymentFormData) => ({
                            ...prev,
                            purpose: newPurpose
                        }));
                    }
                }
            } else {
                if (typeof setData === 'function') {
                    if (setData.length === 2) {
                        setData('purpose', '');
                    } else {
                        setData((prev: PaymentFormData) => ({
                            ...prev,
                            purpose: ''
                        }));
                    }
                }
            }
        }
        
        // Check if we removed a clearance item
        const itemToRemove = paymentItems.find(item => item.id === id);
        if (itemToRemove?.metadata?.is_clearance_fee) {
            const hasOtherClearanceItems = updatedItems.some(item => 
                item.metadata?.is_clearance_fee
            );
            
            if (!hasOtherClearanceItems && typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('clearance_type', '');
                    setData('clearance_type_id', '');
                    setData('clearance_code', '');
                    setData('is_cleared', false);
                    setData('validity_date', '');
                    setData('clearance_request_id', undefined);
                } else {
                    setData((prev: PaymentFormData) => ({
                        ...prev,
                        clearance_type: '',
                        clearance_type_id: '',
                        clearance_code: '',
                        is_cleared: false,
                        validity_date: '',
                        clearance_request_id: undefined,
                    }));
                }
            }
        }
    }, [paymentItems, userModifiedPurpose, updateItems, setData, generatePurposeFromItems]);

    /**
     * Handle fee selection with discount
     */
    const handleFeeWithDiscount = useCallback((fee: OutstandingFee, discountType: string, discountedAmount?: number) => {
        // Check for duplicates before adding with discount
        if (isFeeAlreadyInPaymentItems(paymentItems, fee.id)) {
            console.warn('⚠️ DUPLICATE PREVENTED: Fee with discount already added:', {
                feeId: fee.id,
                feeCode: fee.fee_code
            });
            alert(`This fee (${fee.fee_code}) has already been added to the payment.`);
            setSelectedOutstandingFee(null);
            setShowDiscountSelection(false);
            setSelectedDiscount('');
            return;
        }
        
        handleAddOutstandingFeeWithDiscount(fee, discountType, discountedAmount);
        setSelectedOutstandingFee(null);
        setShowDiscountSelection(false);
        setSelectedDiscount('');
    }, [handleAddOutstandingFeeWithDiscount, setSelectedOutstandingFee, setShowDiscountSelection, setSelectedDiscount, paymentItems]);

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