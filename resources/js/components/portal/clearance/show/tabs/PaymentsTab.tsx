// clearance-show/components/tabs/PaymentsTab.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPaymentSummary } from '@/components/residentui/modern-payment-summary';
import { formatCurrency } from '@/components/residentui/lib/resident-ui-utils';
import { Receipt, DollarSign } from 'lucide-react';
// Import the clearance-specific PaymentItem type
import { PaymentItem as ClearancePaymentItem } from '@/types/portal/clearances/clearance.types';

interface PaymentsTabProps {
    paymentItems: ClearancePaymentItem[];
    feeAmount: number;
    totalPaid: number;
    balance: number;
    isPaymentRequired: boolean; // Make sure this is required, not optional
}

export function PaymentsTab({ 
    paymentItems, 
    feeAmount, 
    totalPaid, 
    balance, 
    isPaymentRequired 
}: PaymentsTabProps) {
    // Helper function to safely get the total amount
    const getTotalAmount = (item: ClearancePaymentItem): number => {
        if (item.formatted_total) {
            const match = item.formatted_total.match(/[\d,]+\.?\d*/);
            if (match) {
                return parseFloat(match[0].replace(/,/g, ''));
            }
        }
        
        if (typeof item.total_amount === 'number') {
            return item.total_amount;
        }
        
        if (typeof item.total_amount === 'string') {
            const parsed = parseFloat(item.total_amount);
            return isNaN(parsed) ? 0 : parsed;
        }
        
        return 0;
    };

    // Helper function to safely get payment method display
    const getPaymentMethodDisplay = (item: ClearancePaymentItem): string => {
        if (item.payment?.payment_method_display) {
            return item.payment.payment_method_display;
        }
        if (item.payment?.payment_method) {
            return item.payment.payment_method.charAt(0).toUpperCase() + item.payment.payment_method.slice(1);
        }
        return 'Unknown';
    };

    return (
        <div className="space-y-3">
            <ModernPaymentSummary
                due={feeAmount}
                paid={totalPaid}
                balance={balance}
                showCompact={true}
            />

            {paymentItems.length > 0 ? (
                <ModernCard title="Payment History">
                    <div className="space-y-2">
                        {paymentItems.map((item) => (
                            <div key={item.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Receipt className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                            <p className="text-xs font-medium truncate">{item.fee_name}</p>
                                        </div>
                                        {item.payment && (
                                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                                                <div>
                                                    <p className="text-gray-500">OR #</p>
                                                    <p className="font-mono truncate">{item.payment.or_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Method</p>
                                                    <p className="truncate">{getPaymentMethodDisplay(item)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold">{formatCurrency(getTotalAmount(item))}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ModernCard>
            ) : (
                <ModernEmptyState
                    status={isPaymentRequired ? "info" : "empty"}
                    title={isPaymentRequired ? "No Payments Yet" : "No Payment Required"}
                    message={isPaymentRequired ? "Payment required to process this clearance" : "This clearance does not require payment"}
                    icon={DollarSign}
                />
            )}
        </div>
    );
}