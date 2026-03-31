// components/residentui/receipts/ReceiptGridView.tsx

import { cn } from '@/lib/utils';
import { ReceiptCard } from './ReceiptCard';
import { ReceiptItem, ReceiptCardProps } from '@/types/portal/receipts/receipt.types';

interface ReceiptGridViewProps extends Omit<ReceiptCardProps, 'receipt' | 'isMobile'> {
    receipts: ReceiptItem[];
    isMobile?: boolean;
}

export const ReceiptGridView = ({
    receipts,
    selectMode = false,
    selectedReceipts = [],
    toggleSelectReceipt,
    formatDate,
    formatCurrency,
    onView,
    onDownload,
    onPrint,
    onCopyReceiptNumber,
    onCopyORNNumber,
    isMobile = false
}: ReceiptGridViewProps) => {
    return (
        <div className={cn(
            isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
            {receipts.map((receipt) => (
                <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    selectMode={selectMode}
                    selectedReceipts={selectedReceipts}
                    toggleSelectReceipt={toggleSelectReceipt}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    onView={onView}
                    onDownload={onDownload}
                    onPrint={onPrint}
                    onCopyReceiptNumber={onCopyReceiptNumber}
                    onCopyORNNumber={onCopyORNNumber}
                    isMobile={isMobile}
                />
            ))}
        </div>
    );
};