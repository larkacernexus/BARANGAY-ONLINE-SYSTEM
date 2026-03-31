// components/residentui/payments/modern-payment-grid-view.tsx
import { cn } from '@/lib/utils';
import { ModernPaymentCard } from './modern-payment-card';
import { ModernPaymentGridCard } from './modern-payment-grid-card';
import { Payment } from '@/types/portal/payments/payment.types';

interface ModernPaymentGridViewProps {
    payments: Payment[];
    selectMode?: boolean;
    selectedPayments?: number[];
    onSelectPayment?: (id: number) => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: number) => string;
    onViewDetails: (id: number) => void;
    onMakePayment?: (id: number) => void;
    onDownloadReceipt?: (payment: Payment) => void;
    onCopyOrNumber: (orNumber: string) => void;
    onCopyReference: (ref: string) => void;
    onGenerateReceipt: (payment: Payment) => void;
    isMobile?: boolean;
}

export const ModernPaymentGridView = ({
    payments,
    selectMode = false,
    selectedPayments = [],
    onSelectPayment,
    formatDate,
    formatCurrency,
    onViewDetails,
    onMakePayment,
    onDownloadReceipt,
    onCopyOrNumber,
    onCopyReference,
    onGenerateReceipt,
    isMobile = false
}: ModernPaymentGridViewProps) => {
    const handleSelectPayment = (id: number) => {
        onSelectPayment?.(id);
    };

    return (
        <div className={cn(
            isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
            {payments.map((payment) => (
                isMobile ? (
                    <ModernPaymentCard
                        key={`payment-${payment.id}`}
                        payment={payment}
                        selectMode={selectMode}
                        selectedPayments={selectedPayments}
                        toggleSelectPayment={handleSelectPayment}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                        onViewDetails={onViewDetails}
                        onMakePayment={onMakePayment}
                        onDownloadReceipt={onDownloadReceipt}
                        onCopyOrNumber={onCopyOrNumber}
                        onCopyReference={onCopyReference}
                        onGenerateReceipt={onGenerateReceipt}
                        isMobile={isMobile}
                    />
                ) : (
                    <ModernPaymentGridCard
                        key={`payment-${payment.id}`}
                        payment={payment}
                        selectMode={selectMode}
                        selectedPayments={selectedPayments}
                        toggleSelectPayment={handleSelectPayment}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                        onViewDetails={onViewDetails}
                        onMakePayment={onMakePayment}
                        onDownloadReceipt={onDownloadReceipt}
                        onCopyOrNumber={onCopyOrNumber}
                        onCopyReference={onCopyReference}
                        onGenerateReceipt={onGenerateReceipt}
                    />
                )
            ))}
        </div>
    );
};