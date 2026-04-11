// app/Pages/Admin/Payments/components/ProcessingLoader.tsx
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/components/admin/payment/paymentCreate/utils';

interface ProcessingLoaderProps {
    isProcessingFee: boolean;
    step: number;
    pre_filled_data?: {
        fee_id?: number | string;
        fee_code?: string;
        balance?: number;
        payer_type?: string;
        payer_id?: number;
        fee_name?: string;
    };
    selected_fee_details?: {
        discount_eligibility_text?: string;
        fee_name?: string;
        fee_code?: string;
        amount?: number;
        balance?: number;
        resident_discount_info?: {
            has_discount?: boolean;
            discount_type?: string;
            discount_percentage?: number;
            photo_path?: string | null;
        };
    } | null;
}

export default function ProcessingLoader({ 
    isProcessingFee, 
    step, 
    pre_filled_data,
    selected_fee_details 
}: ProcessingLoaderProps) {
    if (!isProcessingFee || step !== 1) return null;
    
    // Get the fee identifier (code or ID)
    const feeIdentifier = pre_filled_data?.fee_code 
        ? `#${pre_filled_data.fee_code}` 
        : pre_filled_data?.fee_id 
            ? `#${pre_filled_data.fee_id}` 
            : '';
    
    // Get the fee amount (balance or amount)
    const feeAmount = pre_filled_data?.balance 
        ? pre_filled_data.balance 
        : selected_fee_details?.balance || selected_fee_details?.amount || 0;
    
    // Get the fee name
    const feeName = selected_fee_details?.fee_name || pre_filled_data?.fee_name || 'Fee';
    
    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Loading fee information and preparing payment...
                </p>
                
                <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {feeName} {feeIdentifier}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Amount: {formatCurrency(feeAmount)}
                    </p>
                    
                    {selected_fee_details?.discount_eligibility_text && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            ✓ {selected_fee_details.discount_eligibility_text}
                        </p>
                    )}
                    
                    {selected_fee_details?.resident_discount_info?.has_discount && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Discount eligible: {selected_fee_details.resident_discount_info.discount_type} 
                            ({selected_fee_details.resident_discount_info.discount_percentage}% off)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}