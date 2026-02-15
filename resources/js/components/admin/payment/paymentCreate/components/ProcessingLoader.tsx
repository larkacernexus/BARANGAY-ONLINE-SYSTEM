// app/Pages/Admin/Payments/components/ProcessingLoader.tsx
import { Loader2 } from 'lucide-react';
import { PreFilledFeeData, SelectedFeeDetails } from '../types';

interface ProcessingLoaderProps {
    isProcessingFee: boolean;
    step: number;
    pre_filled_data?: PreFilledFeeData;
    selected_fee_details?: SelectedFeeDetails | null;
}

export default function ProcessingLoader({ 
    isProcessingFee, 
    step, 
    pre_filled_data,
    selected_fee_details 
}: ProcessingLoaderProps) {
    if (!isProcessingFee || step !== 1) return null;
    
    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                    Loading fee information and preparing payment...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Fee #{pre_filled_data?.fee_code || pre_filled_data?.fee_id} - ₱{pre_filled_data?.balance?.toLocaleString() || '0.00'}
                    {selected_fee_details?.discount_eligibility_text && (
                        <span className="ml-2 text-green-600">
                            • {selected_fee_details.discount_eligibility_text}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}