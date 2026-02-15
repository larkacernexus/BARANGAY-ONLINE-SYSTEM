// resources/js/components/admin/payment/paymentCreate/hooks/useFeeCalculations.tsx
import { useCallback } from 'react';
import { PaymentItem, PaymentFormData, DiscountRule } from '../types';

interface UseFeeCalculationsProps {
    setData: ((data: any) => void) | ((key: string, value: any) => void);
    data: PaymentFormData;
    discountRules?: DiscountRule[]; // Add discount rules
}

export function useFeeCalculations({
    setData,
    data,
    discountRules = [] // Default to empty array
}: UseFeeCalculationsProps) {
    
    // Calculate discount based on discount rule
    const calculateDiscountFromRule = useCallback((
        baseAmount: number,
        discountCode: string
    ): number => {
        if (!discountCode || discountCode === 'no_discount') return 0;
        
        const rule = discountRules.find(r => r.code === discountCode);
        if (!rule) return 0;
        
        // Check minimum purchase amount
        if (rule.minimum_purchase_amount && baseAmount < rule.minimum_purchase_amount) {
            return 0;
        }
        
        let discount = 0;
        
        if (rule.value_type === 'percentage') {
            discount = baseAmount * (rule.discount_value / 100);
            
            // Apply maximum discount limit if set
            if (rule.maximum_discount_amount && discount > rule.maximum_discount_amount) {
                discount = rule.maximum_discount_amount;
            }
        } else {
            // Fixed amount discount
            discount = Math.min(rule.discount_value, baseAmount);
        }
        
        return Math.round(discount * 100) / 100; // Round to 2 decimal places
    }, [discountRules]);

    // Distribute discount proportionally across items
    const applyDiscountToItems = useCallback((
        items: PaymentItem[],
        discountCode: string,
        totalDiscount: number,
        totalBaseAmount: number
    ): PaymentItem[] => {
        if (totalDiscount === 0 || totalBaseAmount === 0) return items;
        
        return items.map(item => {
            const itemBaseTotal = item.base_amount + (item.surcharge || 0) + (item.penalty || 0);
            const itemProportion = itemBaseTotal / totalBaseAmount;
            const itemDiscount = totalDiscount * itemProportion;
            
            // Round to 2 decimal places and ensure we don't create rounding errors
            const roundedItemDiscount = Math.round(itemDiscount * 100) / 100;
            
            return {
                ...item,
                discount: roundedItemDiscount,
                total_amount: itemBaseTotal - roundedItemDiscount,
                metadata: {
                    ...item.metadata,
                    appliedDiscount: {
                        ...(item.metadata?.appliedDiscount || {}),
                        code: discountCode,
                        amount: roundedItemDiscount
                    }
                }
            };
        });
    }, []);

    // Recalculate totals with discount
    const recalculateTotals = useCallback((items: PaymentItem[], discountCode?: string) => {
        // Calculate base components
        const subtotal = items.reduce((sum, item) => sum + (item.base_amount || 0), 0);
        const surcharge = items.reduce((sum, item) => sum + (item.surcharge || 0), 0);
        const penalty = items.reduce((sum, item) => sum + (item.penalty || 0), 0);
        
        const totalBaseAmount = subtotal + surcharge + penalty;
        
        // Calculate discount based on discount code
        let discountAmount = 0;
        let updatedItems = items;
        
        if (discountCode && discountCode !== 'no_discount') {
            discountAmount = calculateDiscountFromRule(totalBaseAmount, discountCode);
            
            if (discountAmount > 0) {
                // Distribute discount proportionally across items
                updatedItems = applyDiscountToItems(items, discountCode, discountAmount, totalBaseAmount);
            }
        }
        
        // Calculate total with discount
        const totalAmount = totalBaseAmount - discountAmount;
        
        return {
            items: updatedItems,
            subtotal: parseFloat(subtotal.toFixed(2)),
            surcharge: parseFloat(surcharge.toFixed(2)),
            penalty: parseFloat(penalty.toFixed(2)),
            discount: parseFloat(discountAmount.toFixed(2)),
            total_amount: parseFloat(totalAmount.toFixed(2))
        };
    }, [calculateDiscountFromRule, applyDiscountToItems]);

    const updateItems = useCallback((items: PaymentItem[]) => {
        console.log('🧮 useFeeCalculations - Updating items:', {
            count: items.length,
            items: items.map(item => ({
                id: item.id,
                fee_id: item.fee_id,
                name: item.fee_name,
                base: item.base_amount,
                discount: item.discount,
                total: item.total_amount
            }))
        });
        
        // Recalculate totals with current discount code
        const totals = recalculateTotals(items, data.discount_code);
        
        console.log('📊 useFeeCalculations - Calculated totals:', {
            ...totals,
            itemsCount: items.length,
            discountCode: data.discount_code,
            discountBreakdown: totals.items.map(item => ({
                name: item.fee_name,
                discount: item.discount,
                hasDiscount: item.discount > 0
            }))
        });
        
        // Handle both types of setData
        if (typeof setData === 'function') {
            // Check if it's the (key, value) pattern from useForm
            if (setData.length === 2) {
                // This is the (key, value) pattern from useForm
                console.log('📝 useFeeCalculations - Using key/value pattern');
                setData('items', totals.items);
                setData('subtotal', totals.subtotal);
                setData('surcharge', totals.surcharge);
                setData('penalty', totals.penalty);
                setData('discount', totals.discount);
                setData('total_amount', totals.total_amount);
                
                // Also update discount_type for backward compatibility
                if (data.discount_code) {
                    const rule = discountRules.find(r => r.code === data.discount_code);
                    if (rule) {
                        setData('discount_type', rule.discount_type);
                    }
                }
            } else {
                // This is the callback pattern
                console.log('📝 useFeeCalculations - Using callback pattern');
                setData((prev: PaymentFormData) => {
                    const newData = {
                        ...prev,
                        items: totals.items,
                        subtotal: totals.subtotal,
                        surcharge: totals.surcharge,
                        penalty: totals.penalty,
                        discount: totals.discount,
                        total_amount: totals.total_amount
                    };
                    
                    // Update discount_type for backward compatibility
                    if (newData.discount_code) {
                        const rule = discountRules.find(r => r.code === newData.discount_code);
                        if (rule) {
                            newData.discount_type = rule.discount_type;
                        }
                    }
                    
                    return newData;
                });
            }
        } else {
            console.error('❌ useFeeCalculations - setData is not a function:', setData);
        }
        
    }, [setData, recalculateTotals, data.discount_code, discountRules]);

    const applyDiscount = useCallback((discountCode: string) => {
        console.log('🏷️ useFeeCalculations - Applying discount:', { discountCode });
        
        const rule = discountRules.find(r => r.code === discountCode);
        if (!rule) {
            console.warn('⚠️ Discount rule not found:', discountCode);
            return;
        }
        
        // Check if items exist
        if (!data.items || data.items.length === 0) {
            console.warn('⚠️ No items to apply discount to');
            return;
        }
        
        // Recalculate totals with new discount
        const totals = recalculateTotals(data.items, discountCode);
        
        // Update form data
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('discount_code', discountCode);
                setData('discount_id', rule.id);
                setData('items', totals.items);
                setData('subtotal', totals.subtotal);
                setData('surcharge', totals.surcharge);
                setData('penalty', totals.penalty);
                setData('discount', totals.discount);
                setData('total_amount', totals.total_amount);
                setData('discount_type', rule.discount_type); // For backward compatibility
            } else {
                setData((prev: PaymentFormData) => ({
                    ...prev,
                    discount_code: discountCode,
                    discount_id: rule.id,
                    items: totals.items,
                    subtotal: totals.subtotal,
                    surcharge: totals.surcharge,
                    penalty: totals.penalty,
                    discount: totals.discount,
                    total_amount: totals.total_amount,
                    discount_type: rule.discount_type // For backward compatibility
                }));
            }
        }
    }, [data.items, discountRules, recalculateTotals, setData]);

    const removeDiscount = useCallback(() => {
        console.log('🗑️ useFeeCalculations - Removing discount');
        
        if (!data.items || data.items.length === 0) return;
        
        // Recalculate totals without discount
        const totals = recalculateTotals(data.items, '');
        
        // Update form data
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('discount_code', '');
                setData('discount_id', undefined);
                setData('items', totals.items);
                setData('subtotal', totals.subtotal);
                setData('surcharge', totals.surcharge);
                setData('penalty', totals.penalty);
                setData('discount', totals.discount);
                setData('total_amount', totals.total_amount);
                setData('discount_type', '');
            } else {
                setData((prev: PaymentFormData) => ({
                    ...prev,
                    discount_code: '',
                    discount_id: undefined,
                    items: totals.items,
                    subtotal: totals.subtotal,
                    surcharge: totals.surcharge,
                    penalty: totals.penalty,
                    discount: totals.discount,
                    total_amount: totals.total_amount,
                    discount_type: ''
                }));
            }
        }
    }, [data.items, recalculateTotals, setData]);

    const clearItems = useCallback(() => {
        console.log('🧹 useFeeCalculations - Clearing all items');
        
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('items', []);
                setData('subtotal', 0);
                setData('surcharge', 0);
                setData('penalty', 0);
                setData('discount', 0);
                setData('total_amount', 0);
                setData('discount_code', '');
                setData('discount_id', undefined);
                setData('discount_type', '');
                setData('purpose', '');
            } else {
                setData((prev: PaymentFormData) => ({
                    ...prev,
                    items: [],
                    subtotal: 0,
                    surcharge: 0,
                    penalty: 0,
                    discount: 0,
                    total_amount: 0,
                    discount_code: '',
                    discount_id: undefined,
                    discount_type: '',
                    purpose: ''
                }));
            }
        }
    }, [setData]);
    
    return {
        updateItems,
        clearItems,
        applyDiscount,
        removeDiscount,
        calculateDiscountFromRule,
        recalculateTotals
    };
}