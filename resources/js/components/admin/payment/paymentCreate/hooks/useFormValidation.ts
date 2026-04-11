// app/Pages/Admin/Payments/hooks/useFormValidation.ts
import { PaymentFormData, PaymentItem } from '@/types/admin/payments/payments';
import { parseAmount } from '@/components/admin/payment/paymentCreate/utils';

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

interface ItemValidationError {
    index: number;
    feeName: string;
    message: string;
}

// Validation constants
const MAX_ROUNDING_ERROR = 0.01;
const MIN_PAYMENT_AMOUNT = 0.01;

export function useFormValidation() {
    /**
     * Validate a single payment item's calculations
     */
    const validatePaymentItem = (item: PaymentItem, index: number): string | null => {
        const calculatedTotal = item.base_amount + item.surcharge + item.penalty - item.discount;
        const diff = Math.abs(calculatedTotal - item.total_amount);
        
        if (diff > MAX_ROUNDING_ERROR) {
            return `Item ${index + 1} (${item.fee_name}): Calculated total ₱${calculatedTotal.toFixed(2)} doesn't match item total ₱${item.total_amount.toFixed(2)}`;
        }
        
        // Validate non-negative amounts
        if (item.base_amount < 0) {
            return `Item ${index + 1} (${item.fee_name}): Base amount cannot be negative`;
        }
        
        if (item.total_amount < 0) {
            return `Item ${index + 1} (${item.fee_name}): Total amount cannot be negative`;
        }
        
        // Validate discount doesn't exceed base amount
        if (item.discount > item.base_amount + item.surcharge + item.penalty) {
            return `Item ${index + 1} (${item.fee_name}): Discount cannot exceed the total amount`;
        }
        
        return null;
    };

    /**
     * Validate overall payment totals
     */
    const validateOverallTotals = (data: PaymentFormData): string | null => {
        const calculatedTotal = data.subtotal + data.surcharge + data.penalty - data.discount;
        const totalDiff = Math.abs(calculatedTotal - data.total_amount);
        
        if (totalDiff > MAX_ROUNDING_ERROR) {
            return `Total amount mismatch: Calculated ₱${calculatedTotal.toFixed(2)} vs Stored ₱${data.total_amount.toFixed(2)}`;
        }
        
        // Validate total amount is positive
        if (data.total_amount <= 0) {
            return 'Total amount must be greater than 0';
        }
        
        // Validate amount paid doesn't exceed total
        if (data.amount_paid < 0) {
            return 'Amount paid cannot be negative';
        }
        
        return null;
    };

    /**
     * Validate payer information
     */
    const validatePayerInfo = (data: PaymentFormData): string[] => {
        const errors: string[] = [];
        
        if (!data.payer_id || String(data.payer_id).trim() === '') {
            errors.push('Missing payer information. Please go back to step 1 and select a payer.');
        }
        
        if (!data.payer_name || data.payer_name.trim() === '') {
            errors.push('Missing payer name. Please go back to step 1 and select a payer.');
        }
        
        if (!data.payer_type || data.payer_type.trim() === '') {
            errors.push('Missing payer type. Please go back to step 1 and select a payer.');
        }
        
        return errors;
    };

    /**
     * Validate payment items
     */
    const validatePaymentItems = (items: PaymentItem[] | undefined): string[] => {
        const errors: string[] = [];
        
        if (!items || items.length === 0) {
            errors.push('Please add at least one payment item');
            return errors;
        }
        
        items.forEach((item, index) => {
            const itemError = validatePaymentItem(item, index);
            if (itemError) {
                errors.push(itemError);
            }
        });
        
        return errors;
    };

    /**
     * Validate required fields
     */
    const validateRequiredFields = (data: PaymentFormData): string[] => {
        const errors: string[] = [];
        
        if (!data.payment_date || data.payment_date.trim() === '') {
            errors.push('Payment date is required');
        }
        
        if (!data.purpose || data.purpose.trim() === '') {
            errors.push('Purpose of payment is required');
        }
        
        if (!data.payment_method || data.payment_method.trim() === '') {
            errors.push('Payment method is required');
        }
        
        if (!data.or_number || data.or_number.trim() === '') {
            errors.push('OR number is required');
        }
        
        return errors;
    };

    // ❌ REMOVED: validateClearanceFields function - clearance type is not required

    /**
     * Validate discount fields
     */
    const validateDiscountFields = (data: PaymentFormData): string[] => {
        const errors: string[] = [];
        
        // If discount code is present, validate related fields
        if (data.discount_code && data.discount_code !== 'no_discount') {
            if (data.discount < 0) {
                errors.push('Discount amount cannot be negative');
            }
            
            // Check if discount amount exceeds total
            if (data.discount > data.subtotal + data.surcharge + data.penalty) {
                errors.push('Discount amount cannot exceed the subtotal');
            }
        }
        
        return errors;
    };

    /**
     * Main validation function
     */
    const validateFormData = (data: PaymentFormData): ValidationResult => {
        const errors: string[] = [];
        
        // Run all validations
        errors.push(...validatePayerInfo(data));
        errors.push(...validatePaymentItems(data.items));
        errors.push(...validateRequiredFields(data));
        // ❌ REMOVED: validateClearanceFields call
        errors.push(...validateDiscountFields(data));
        
        // Validate overall totals
        const totalError = validateOverallTotals(data);
        if (totalError) {
            errors.push(totalError);
        }
        
        // Check for payment amount vs total amount
        if (data.amount_paid > 0 && data.amount_paid < data.total_amount) {
            errors.push(`Partial payment detected: Amount paid (₱${data.amount_paid.toFixed(2)}) is less than total amount (₱${data.total_amount.toFixed(2)}). Please ensure this is intended.`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    };

    /**
     * Quick validation for specific field
     */
    const validateField = (field: keyof PaymentFormData, value: any): string | null => {
        switch (field) {
            case 'payer_id':
                if (!value || String(value).trim() === '') {
                    return 'Payer is required';
                }
                break;
            case 'payer_name':
                if (!value || value.trim() === '') {
                    return 'Payer name is required';
                }
                break;
            case 'payment_date':
                if (!value || value.trim() === '') {
                    return 'Payment date is required';
                }
                break;
            case 'purpose':
                if (!value || value.trim() === '') {
                    return 'Purpose is required';
                }
                break;
            case 'total_amount':
                if (!value || value <= 0) {
                    return 'Total amount must be greater than 0';
                }
                break;
            case 'amount_paid':
                if (value < 0) {
                    return 'Amount paid cannot be negative';
                }
                break;
        }
        
        return null;
    };

    /**
     * Check if form has required minimum data
     */
    const isFormMinimallyValid = (data: PaymentFormData): boolean => {
        return !!(
            data.payer_id &&
            data.payer_name &&
            data.items?.length > 0 &&
            data.total_amount > 0 &&
            data.purpose
        );
    };

    return {
        validateFormData,
        validateField,
        isFormMinimallyValid,
        validatePaymentItem,
        validateOverallTotals
    };
}

export default useFormValidation;