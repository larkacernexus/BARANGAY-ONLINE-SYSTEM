// app/Pages/Admin/Payments/hooks/useFormValidation.ts
import { PaymentFormData, PaymentItem } from '../types';
import { parseAmount } from '../utils';

export function useFormValidation() {
    const validateFormData = (data: PaymentFormData): { isValid: boolean; errors: string[] } => {
        console.log('🔍 Validating form data');
        const errors: string[] = [];
        
        // Check items
        if (!data.items || data.items.length === 0) {
            errors.push('Please add at least one payment item');
        }
        
        // Validate each item's calculations
        data.items?.forEach((item, index) => {
            const calculatedTotal = item.base_amount + item.surcharge + item.penalty - item.discount;
            const diff = Math.abs(calculatedTotal - item.total_amount);
            
            if (diff > 0.01) {
                errors.push(
                    `Item ${index + 1} (${item.fee_name}): ` +
                    `Calculated total ₱${calculatedTotal.toFixed(2)} doesn't match item total ₱${item.total_amount.toFixed(2)}`
                );
            }
        });
        
        // Validate overall totals
        const calculatedTotal = data.subtotal + data.surcharge + data.penalty - data.discount;
        const totalDiff = Math.abs(calculatedTotal - data.total_amount);
        
        if (totalDiff > 0.01) {
            errors.push(`Total amount mismatch: Calculated ₱${calculatedTotal.toFixed(2)} vs Stored ₱${data.total_amount.toFixed(2)}`);
        }
        
        // Other validations
        if (!data.payer_id || String(data.payer_id).trim() === '') {
            errors.push('Missing payer information. Please go back to step 1 and select a payer.');
        }
        
        if (!data.payer_name || data.payer_name.trim() === '') {
            errors.push('Missing payer name. Please go back to step 1 and select a payer.');
        }
        
        if (!data.payment_date || data.payment_date.trim() === '') {
            errors.push('Payment date is required');
        }
        
        if (!data.total_amount || data.total_amount <= 0) {
            errors.push('Total amount must be greater than 0');
        }
        
        if (!data.purpose || data.purpose.trim() === '') {
            errors.push('Purpose of payment is required');
        }
        
        console.log('✅ Form validation completed:', { isValid: errors.length === 0, errorCount: errors.length });
        return { isValid: errors.length === 0, errors };
    };

    return { validateFormData };
}