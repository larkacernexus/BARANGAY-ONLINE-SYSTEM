// app/Pages/Admin/Payments/hooks/useFormSubmission.ts
import { useForm } from '@inertiajs/react';
import { PaymentFormData } from '../types';
import { useFormValidation } from './useFormValidation';

export function useFormSubmission(initialFormData: PaymentFormData, isClearancePayment: boolean, resetForm: () => void) {
    const { data, setData, post, processing, errors: submissionErrors } = useForm<PaymentFormData & { [key: string]: any }>(initialFormData);
    const { validateFormData } = useFormValidation();

    // 🔴 FIXED: Create wrapper that supports both patterns
    const wrappedSetData = (keyOrCallback: string | Function, value?: any) => {
        if (typeof keyOrCallback === 'function') {
            // Callback pattern: setData((prev) => newPrev)
            const callback = keyOrCallback;
            const newData = callback(data);
            // Use Inertia's setData with individual keys
            Object.entries(newData).forEach(([k, v]) => {
                setData(k as any, v);
            });
        } else {
            // Key/Value pattern: setData('key', value)
            setData(keyOrCallback as any, value);
        }
    };

    const submit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        
        console.log('📤 Form submission triggered');
        
        const validation = validateFormData(data);
        if (!validation.isValid) {
            alert('Payment validation errors:\n' + validation.errors.join('\n'));
            return;
        }
        
        const submissionData = {
            ...data,
            clearance_request_id: data.clearance_request_id || null,
            ...(isClearancePayment && {
                clearance_type: data.clearance_type || '',
                clearance_type_id: data.clearance_type_id || '',
                clearance_code: data.clearance_code || '',
                is_cleared: data.is_cleared || false,
                validity_date: data.validity_date || '',
            }),
            items: data.items?.map(item => ({
                ...item,
                item_type: item.metadata?.is_clearance_fee ? 'clearance' : 'fee',
                outstanding_fee_id: item.metadata?.is_outstanding_fee ? item.fee_id : null,
                metadata: item.metadata,
                applied_discount: item.metadata?.appliedDiscount || null
            })) || []
        };
        
        console.log('🚀 Submitting form with validated data');
        
        post('/admin/payments', {
            ...submissionData,
            preserveScroll: true,
            onSuccess: () => {
                console.log('✅ Payment submitted successfully');
                resetForm();
            },
            onError: (errors) => {
                console.error('❌ Payment submission errors:', errors);
                handleSubmissionErrors(errors);
            },
        });
    };

    const handleSubmissionErrors = (errors: Record<string, string>) => {
        if (errors.discount_type) {
            alert(`Discount Error: ${errors.discount_type}. Please select a valid discount type or remove the discount.`);
        } else if (errors.applied_discount) {
            alert(`Discount Application Error: ${errors.applied_discount}. The discount could not be applied.`);
        } else if (errors.payer_id) {
            alert(`Error: ${errors.payer_id}. Please go back to step 1 and select a payer.`);
        } else if (errors.payer_name) {
            alert(`Error: ${errors.payer_name}. Please ensure payer name is valid.`);
        } else if (errors.total_amount) {
            alert(`Error: ${errors.total_amount}. Please check the payment amount.`);
        } else if (errors.purpose) {
            alert(`Error: ${errors.purpose}. Please enter a valid purpose.`);
        } else if (errors.clearance_type_id) {
            alert(`Error: ${errors.clearance_type_id}. Please select a valid clearance type.`);
        } else if (errors.clearance_request_id) {
            alert(`Error with clearance request: ${errors.clearance_request_id}`);
        } else if (errors.items) {
            alert(`Error with payment items: ${errors.items}. Please add at least one payment item.`);
        } else {
            alert('Failed to process payment. Please check all required fields and try again.');
        }
    };

    return {
        data,
        setData: wrappedSetData, // 🔴 Use the wrapped version that supports both patterns
        submit,
        processing,
        submissionErrors
    };
}