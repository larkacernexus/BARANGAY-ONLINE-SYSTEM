// components/residentui/receipts/modern-receipt-grid-view.tsx

import { cn } from '@/lib/utils';
import { ModernReceiptCard } from './modern-receipt-card';
import { ModernReceiptGridCard } from './modern-receipt-grid-card';
import { ReceiptItem } from '@/types/portal/receipts/receipt.types';

interface ModernReceiptGridViewProps {
    receipts: ReceiptItem[];
    selectMode?: boolean;
    selectedReceipts?: number[];
    onSelectReceipt?: (receipt: ReceiptItem) => void;
    formatDate: (date: string | null) => string;
    formatCurrency: (amount: string | number) => string;
    onView: (id: number) => void;
    onDownload: (id: number) => void;
    onPrint: (id: number) => void;
    onCopyReceiptNumber: (receiptNumber: string) => void;
    onCopyORNNumber: (orNumber: string | null) => void;
    isMobile?: boolean;
}

export function ModernReceiptGridView({
    receipts,
    selectMode = false,
    selectedReceipts = [],
    onSelectReceipt,
    formatDate,
    formatCurrency,
    onView,
    onDownload,
    onPrint,
    onCopyReceiptNumber,
    onCopyORNNumber,
    isMobile = false
}: ModernReceiptGridViewProps) {
    const handleSelectReceipt = (receiptId: number) => {
        if (onSelectReceipt) {
            const receipt = receipts.find(r => r.id === receiptId);
            if (receipt) {
                onSelectReceipt(receipt);
            }
        }
    };

    return (
        <div className={cn(
            isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
            {receipts.map((receipt) => (
                isMobile ? (
                    <ModernReceiptCard
                        key={`receipt-${receipt.id}`}
                        receipt={receipt}
                        selectMode={selectMode}
                        selectedReceipts={selectedReceipts}
                        toggleSelectReceipt={handleSelectReceipt}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                        onView={onView}
                        onDownload={onDownload}
                        onPrint={onPrint}
                        onCopyReceiptNumber={onCopyReceiptNumber}
                        onCopyORNNumber={onCopyORNNumber}
                        isMobile={isMobile}
                    />
                ) : (
                    <ModernReceiptGridCard
                        key={`receipt-${receipt.id}`}
                        receipt={receipt}
                        selectMode={selectMode}
                        selectedReceipts={selectedReceipts}
                        toggleSelectReceipt={handleSelectReceipt}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                        onView={onView}
                        onDownload={onDownload}
                        onPrint={onPrint}
                        onCopyReceiptNumber={onCopyReceiptNumber}
                        onCopyORNNumber={onCopyORNNumber}
                    />
                )
            ))}
        </div>
    );
}