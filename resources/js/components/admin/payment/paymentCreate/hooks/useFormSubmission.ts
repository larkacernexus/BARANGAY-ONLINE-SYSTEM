// app/Pages/Admin/Payments/hooks/useFormSubmission.ts
import { useForm } from '@inertiajs/react';
import { PaymentFormData, PaymentItem } from '@/types/admin/payments/payments';
import { useFormValidation } from './useFormValidation';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface SubmissionData extends PaymentFormData {
    [key: string]: any;
}

// ✅ Fix: Use a union type for the setData overload
type SetDataFunction = {
    (key: string, value: any): void;
    (callback: (prev: SubmissionData) => SubmissionData): void;
};

interface UseFormSubmissionReturn {
    data: SubmissionData;
    setData: SetDataFunction;
    submit: (e: React.FormEvent<HTMLFormElement>) => void;
    processing: boolean;
    submissionErrors: Record<string, string>;
}

interface FormattedPaymentItem {
    id: string | number;
    fee_id?: string;
    fee_name: string;
    fee_code: string;
    description?: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    category: string;
    period_covered?: string;
    months_late?: number;
    item_type: 'clearance' | 'fee';
    outstanding_fee_id: string | null;
    metadata?: PaymentItem['metadata'];
    applied_discount: any;
}

// ============================================
// CONSTANTS
// ============================================

const ERROR_MESSAGES: Record<string, string> = {
    discount_type: 'Please select a valid discount type or remove the discount.',
    applied_discount: 'The discount could not be applied. Please check the discount code.',
    payer_id: 'Please go back to step 1 and select a payer.',
    payer_name: 'Please ensure payer name is valid.',
    total_amount: 'Please check the payment amount.',
    purpose: 'Please enter a valid purpose.',
    clearance_type_id: 'Please select a valid clearance type.',
    clearance_request_id: 'There was an issue with the clearance request.',
    items: 'Please add at least one payment item.',
    payment_method: 'Please select a payment method.',
    or_number: 'Invalid OR number format.',
    amount_paid: 'Please enter a valid payment amount.',
};

const SUBMISSION_ENDPOINT = '/admin/payments';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert errors from Inertia (which may have undefined values) to Record<string, string>
 */
const normalizeErrors = (errors: Record<string, string | undefined>): Record<string, string> => {
    const normalized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(errors)) {
        if (value !== undefined && value !== null && value !== '') {
            normalized[key] = value;
        }
    }
    
    return normalized;
};

/**
 * Format payment items for API submission
 */
const formatPaymentItems = (items: PaymentFormData['items']): FormattedPaymentItem[] => {
    if (!items?.length) return [];
    
    return items.map(item => ({
        id: item.id,
        fee_id: item.fee_id,
        fee_name: item.fee_name,
        fee_code: item.fee_code,
        description: item.description,
        base_amount: item.base_amount,
        surcharge: item.surcharge,
        penalty: item.penalty,
        discount: item.discount,
        total_amount: item.total_amount,
        category: item.category,
        period_covered: item.period_covered,
        months_late: item.months_late,
        item_type: item.metadata?.is_clearance_fee ? 'clearance' : 'fee',
        outstanding_fee_id: item.metadata?.is_outstanding_fee ? item.fee_id || null : null,
        metadata: item.metadata,
        applied_discount: item.metadata?.appliedDiscount || null
    }));
};

/**
 * Display error message to user
 */
const showErrorAlert = (message: string): void => {
    alert(message);
};

/**
 * Display validation errors to user
 */
const showValidationErrors = (errors: string[]): void => {
    const errorMessage = errors.length === 1 
        ? errors[0] 
        : `Payment validation errors:\n${errors.join('\n')}`;
    showErrorAlert(errorMessage);
};

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useFormSubmission(
    initialFormData: PaymentFormData, 
    isClearancePayment: boolean, 
    resetForm: () => void
): UseFormSubmissionReturn {
    const { data, setData: inertiaSetData, post, processing, errors: rawErrors, reset } = useForm<SubmissionData>(initialFormData);
    const { validateFormData } = useFormValidation();
    
    const submissionErrors = normalizeErrors(rawErrors);

    /**
     * Wrapper for setData that supports both key/value and callback patterns
     */
    const wrappedSetData: SetDataFunction = (arg1: string | ((prev: SubmissionData) => SubmissionData), arg2?: any): void => {
        if (typeof arg1 === 'function') {
            // Callback pattern: setData((prev) => newPrev)
            const callback = arg1;
            const newData = callback(data);
            
            // Use Inertia's setData with individual keys to avoid overwriting
            Object.entries(newData).forEach(([k, v]) => {
                inertiaSetData(k as keyof SubmissionData, v);
            });
        } else {
            // Key/Value pattern: setData('key', value)
            inertiaSetData(arg1 as keyof SubmissionData, arg2);
        }
    };

    /**
     * Prepare submission data based on payment type
     */
    const prepareSubmissionData = (): Partial<SubmissionData> => {
        // Base data with formatted items
        const baseData: Partial<SubmissionData> = {
            ...data,
            clearance_request_id: data.clearance_request_id || undefined,
            items: formatPaymentItems(data.items)
        };

        // Add clearance-specific fields if it's a clearance payment
        if (isClearancePayment) {
            return {
                ...baseData,
                clearance_type: data.clearance_type || '',
                clearance_type_id: data.clearance_type_id || '',
                clearance_code: data.clearance_code || '',
                is_cleared: data.is_cleared || false,
                validity_date: data.validity_date || '',
            };
        }

        return baseData;
    };

    /**
     * Handle submission errors with user-friendly messages
     */
    const handleSubmissionErrors = (errors: Record<string, string>): void => {
        // Log errors for debugging in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Payment submission errors:', errors);
        }
        
        // Find the first error with a mapped message
        const errorKey = Object.keys(errors).find(key => ERROR_MESSAGES[key]);
        
        if (errorKey) {
            showErrorAlert(`Error: ${ERROR_MESSAGES[errorKey]}`);
            return;
        }
        
        // Handle field-specific errors with custom messages
        const errorEntries = Object.entries(errors);
        
        for (const [field, message] of errorEntries) {
            const mappedMessage = ERROR_MESSAGES[field];
            if (mappedMessage) {
                showErrorAlert(`${field.charAt(0).toUpperCase() + field.slice(1)} Error: ${message}. ${mappedMessage}`);
                return;
            }
        }
        
        // Generic error message for unhandled errors
        const errorMessages = errorEntries.map(([, msg]) => msg).join('\n');
        showErrorAlert(`Failed to process payment:\n${errorMessages}\n\nPlease check all required fields and try again.`);
    };

    /**
     * Handle successful submission
     */
    const handleSuccess = (): void => {
        resetForm();
        reset();
    };

    /**
     * Submit the payment form
     */
    const submit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        
        // Validate form data
        const validation = validateFormData(data);
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }
        
        // Prepare submission data
        const submissionData = prepareSubmissionData();
        
        // Submit the form
        post(SUBMISSION_ENDPOINT, {
            ...submissionData,
            preserveScroll: true,
            onSuccess: handleSuccess,
            onError: handleSubmissionErrors,
        });
    };

    return {
        data,
        setData: wrappedSetData,
        submit,
        processing,
        submissionErrors
    };
}

export default useFormSubmission;