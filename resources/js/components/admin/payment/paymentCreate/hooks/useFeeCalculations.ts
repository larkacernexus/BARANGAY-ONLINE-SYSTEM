// resources/js/components/admin/payment/paymentCreate/hooks/useFeeCalculations.tsx
import { useCallback, useRef } from 'react';
import { PaymentItem, PaymentFormData, DiscountRule } from '@/types/admin/payments/payments';

interface UseFeeCalculationsProps {
    setData: ((data: any) => void) | ((key: string, value: any) => void);
    data: PaymentFormData;
    discountRules?: DiscountRule[];
}

interface CalculatedTotals {
    items: PaymentItem[];
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
}

// Constants
const DECIMAL_PLACES = 2;
const ROUNDING_FACTOR = Math.pow(10, DECIMAL_PLACES);

// Helper functions
const roundToTwoDecimals = (value: number): number => {
    return Math.round(value * ROUNDING_FACTOR) / ROUNDING_FACTOR;
};

const calculateItemBaseTotal = (item: PaymentItem): number => {
    return (item.base_amount || 0) + (item.surcharge || 0) + (item.penalty || 0);
};

const calculateTotalBaseAmount = (items: PaymentItem[]): number => {
    return items.reduce((sum, item) => sum + calculateItemBaseTotal(item), 0);
};

const calculateSubtotal = (items: PaymentItem[]): number => {
    return items.reduce((sum, item) => sum + (item.base_amount || 0), 0);
};

const calculateSurcharge = (items: PaymentItem[]): number => {
    return items.reduce((sum, item) => sum + (item.surcharge || 0), 0);
};

const calculatePenalty = (items: PaymentItem[]): number => {
    return items.reduce((sum, item) => sum + (item.penalty || 0), 0);
};

export function useFeeCalculations({
    setData,
    data,
    discountRules = []
}: UseFeeCalculationsProps) {
    
    // Ref to prevent infinite update loops
    const isUpdatingRef = useRef(false);
    
    /**
     * Get discount value from rule (handles multiple possible field names)
     */
    const getDiscountValue = useCallback((rule: DiscountRule): number => {
        // Try different possible field names
        if (rule.discount_value !== undefined && rule.discount_value !== null) {
            return typeof rule.discount_value === 'number' ? rule.discount_value : parseFloat(String(rule.discount_value));
        }
        if (rule.value !== undefined && rule.value !== null) {
            return typeof rule.value === 'number' ? rule.value : parseFloat(String(rule.value));
        }
        if (rule.percentage !== undefined && rule.percentage !== null) {
            return typeof rule.percentage === 'number' ? rule.percentage : parseFloat(String(rule.percentage));
        }
        return 0;
    }, []);

    /**
     * Calculate discount based on discount rule
     */
    const calculateDiscountFromRule = useCallback((
        baseAmount: number,
        discountCode: string
    ): number => {
        if (!discountCode || discountCode === 'no_discount') return 0;
        
        const rule = discountRules.find(r => r.code === discountCode);
        if (!rule) {
            console.warn('Discount rule not found:', discountCode);
            return 0;
        }
        
        console.log('💰 Calculating discount:', {
            discountCode,
            ruleName: rule.name,
            ruleValueType: rule.value_type,
            ruleDiscountValue: rule.discount_value,
            ruleValue: rule.value,
            baseAmount
        });
        
        // Check minimum purchase amount
        const minPurchase = rule.minimum_purchase_amount || 0;
        if (minPurchase > 0 && baseAmount < minPurchase) {
            console.log(`❌ Minimum purchase not met: ${baseAmount} < ${minPurchase}`);
            return 0;
        }
        
        let discount = 0;
        const discountValue = getDiscountValue(rule);
        
        if (rule.value_type === 'percentage') {
            discount = baseAmount * (discountValue / 100);
            console.log(`📊 Percentage discount: ${discountValue}% of ${baseAmount} = ${discount}`);
            
            // Apply maximum discount limit if set
            const maxDiscount = rule.maximum_discount_amount || 0;
            if (maxDiscount > 0 && discount > maxDiscount) {
                console.log(`🔒 Capping discount at max: ${maxDiscount}`);
                discount = maxDiscount;
            }
        } else {
            // Fixed amount discount
            discount = Math.min(discountValue, baseAmount);
            console.log(`💰 Fixed discount: ${discountValue} (capped at ${baseAmount}) = ${discount}`);
        }
        
        const finalDiscount = roundToTwoDecimals(Math.max(0, discount));
        console.log(`✅ Final discount: ${finalDiscount}`);
        
        return finalDiscount;
    }, [discountRules, getDiscountValue]);

    /**
     * Distribute discount proportionally across items
     */
    const applyDiscountToItems = useCallback((
        items: PaymentItem[],
        discountCode: string,
        totalDiscount: number,
        totalBaseAmount: number
    ): PaymentItem[] => {
        if (totalDiscount === 0 || totalBaseAmount === 0) return items;
        
        let distributedTotal = 0;
        
        const updatedItems = items.map((item, index) => {
            const itemBaseTotal = calculateItemBaseTotal(item);
            const itemProportion = itemBaseTotal / totalBaseAmount;
            let itemDiscount = totalDiscount * itemProportion;
            
            // Round to 2 decimal places
            itemDiscount = roundToTwoDecimals(itemDiscount);
            
            // Track distributed total for last item adjustment
            distributedTotal += itemDiscount;
            
            // Adjust last item to account for rounding errors
            if (index === items.length - 1 && Math.abs(distributedTotal - totalDiscount) > 0.01) {
                const adjustment = totalDiscount - distributedTotal;
                itemDiscount = roundToTwoDecimals(itemDiscount + adjustment);
            }
            
            const newTotalAmount = roundToTwoDecimals(itemBaseTotal - itemDiscount);
            
            return {
                ...item,
                discount: itemDiscount,
                total_amount: newTotalAmount,
                metadata: {
                    ...item.metadata,
                    appliedDiscount: {
                        ...(item.metadata?.appliedDiscount || {}),
                        code: discountCode,
                        amount: itemDiscount,
                        applied_at: new Date().toISOString()
                    }
                }
            };
        });
        
        return updatedItems;
    }, []);

    /**
     * Recalculate totals with discount
     */
    const recalculateTotals = useCallback((
        items: PaymentItem[], 
        discountCode?: string
    ): CalculatedTotals => {
        // Calculate base components
        const subtotal = calculateSubtotal(items);
        const surcharge = calculateSurcharge(items);
        const penalty = calculatePenalty(items);
        
        const totalBaseAmount = subtotal + surcharge + penalty;
        
        // Calculate discount based on discount code
        let discountAmount = 0;
        let updatedItems = [...items];
        
        if (discountCode && discountCode !== 'no_discount') {
            discountAmount = calculateDiscountFromRule(totalBaseAmount, discountCode);
            
            if (discountAmount > 0) {
                updatedItems = applyDiscountToItems(items, discountCode, discountAmount, totalBaseAmount);
            }
        }
        
        // Calculate total with discount
        const totalAmount = roundToTwoDecimals(totalBaseAmount - discountAmount);
        
        console.log('📊 Recalculated totals:', {
            subtotal,
            surcharge,
            penalty,
            totalBaseAmount,
            discountCode,
            discountAmount,
            totalAmount,
            itemsCount: items.length
        });
        
        return {
            items: updatedItems,
            subtotal: roundToTwoDecimals(subtotal),
            surcharge: roundToTwoDecimals(surcharge),
            penalty: roundToTwoDecimals(penalty),
            discount: roundToTwoDecimals(discountAmount),
            total_amount: totalAmount
        };
    }, [calculateDiscountFromRule, applyDiscountToItems]);

    /**
     * Update form data with new items and recalculated totals
     */
    const updateFormData = useCallback((
        items: PaymentItem[],
        additionalUpdates?: Partial<PaymentFormData>
    ) => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;
        
        try {
            // Recalculate totals with current discount code
            const discountCodeToUse = additionalUpdates?.discount_code !== undefined 
                ? additionalUpdates.discount_code 
                : data.discount_code;
            
            const totals = recalculateTotals(items, discountCodeToUse);
            
            const updates = {
                items: totals.items,
                subtotal: totals.subtotal,
                surcharge: totals.surcharge,
                penalty: totals.penalty,
                discount: totals.discount,
                total_amount: totals.total_amount,
                ...additionalUpdates
            };
            
            console.log('📝 Updating form data:', updates);
            
            // Handle both types of setData
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    // Key/Value pattern
                    Object.entries(updates).forEach(([key, value]) => {
                        (setData as (key: string, value: any) => void)(key, value);
                    });
                } else {
                    // Callback pattern
                    (setData as (data: any) => void)((prev: PaymentFormData) => {
                        const newData = {
                            ...prev,
                            ...updates
                        };
                        return newData;
                    });
                }
            }
        } finally {
            // Reset update flag after state updates
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 100);
        }
    }, [setData, recalculateTotals, data.discount_code]);

    /**
     * Update payment items
     */
    const updateItems = useCallback((items: PaymentItem[]) => {
        if (!items) return;
        updateFormData(items);
    }, [updateFormData]);

    /**
     * Apply discount code to current items
     */
    const applyDiscount = useCallback((discountCode: string) => {
        console.log('🎯 applyDiscount called with code:', discountCode);
        
        if (!discountCode || discountCode === 'no_discount') {
            removeDiscount();
            return;
        }
        
        const rule = discountRules.find(r => r.code === discountCode);
        if (!rule) {
            console.warn('Discount rule not found:', discountCode);
            return;
        }
        
        // Check if items exist
        if (!data.items?.length) {
            console.warn('No items to apply discount to');
            return;
        }
        
        // Calculate total base amount
        const totalBaseAmount = calculateTotalBaseAmount(data.items);
        
        // Calculate discount amount
        const discountAmount = calculateDiscountFromRule(totalBaseAmount, discountCode);
        
        console.log('💰 Discount calculation result:', {
            discountCode,
            discountAmount,
            totalBaseAmount,
            ruleName: rule.name,
            ruleValueType: rule.value_type,
            ruleDiscountValue: rule.discount_value
        });
        
        if (discountAmount === 0) {
            console.warn('Discount amount is 0, not applying');
            return;
        }
        
        // Recalculate totals with new discount
        const totals = recalculateTotals(data.items, discountCode);
        
        updateFormData(totals.items, {
            discount_code: discountCode,
            discount_id: rule.id,
            discount_type: rule.value_type,
            discount: totals.discount,
            total_amount: totals.total_amount
        });
        
        console.log('✅ Discount applied successfully:', {
            discountAmount: totals.discount,
            newTotal: totals.total_amount
        });
        
    }, [data.items, discountRules, calculateDiscountFromRule, recalculateTotals, updateFormData]);

    /**
     * Remove current discount
     */
    const removeDiscount = useCallback(() => {
        if (!data.items?.length) return;
        
        console.log('🗑️ Removing discount');
        
        // Recalculate totals without discount
        const totals = recalculateTotals(data.items, '');
        
        updateFormData(totals.items, {
            discount_code: '',
            discount_id: undefined,
            discount_type: '',
            discount: 0
        });
        
    }, [data.items, recalculateTotals, updateFormData]);

    /**
     * Clear all payment items
     */
    const clearItems = useCallback(() => {
        updateFormData([], {
            discount_code: '',
            discount_id: undefined,
            discount_type: '',
            purpose: '',
            discount: 0
        });
    }, [updateFormData]);

    /**
     * Get discount rule by code
     */
    const getDiscountRule = useCallback((discountCode: string): DiscountRule | undefined => {
        return discountRules.find(r => r.code === discountCode);
    }, [discountRules]);

    /**
     * Check if discount is applicable to current cart
     */
    const isDiscountApplicable = useCallback((discountCode: string): boolean => {
        if (!discountCode || discountCode === 'no_discount') return false;
        
        const rule = discountRules.find(r => r.code === discountCode);
        if (!rule) return false;
        
        if (!data.items?.length) return false;
        
        const totalBaseAmount = calculateTotalBaseAmount(data.items);
        const minPurchase = rule.minimum_purchase_amount || 0;
        
        if (minPurchase > 0 && totalBaseAmount < minPurchase) return false;
        
        return true;
    }, [discountRules, data.items]);

    return {
        updateItems,
        clearItems,
        applyDiscount,
        removeDiscount,
        calculateDiscountFromRule,
        recalculateTotals,
        getDiscountRule,
        isDiscountApplicable
    };
}

export default useFeeCalculations;