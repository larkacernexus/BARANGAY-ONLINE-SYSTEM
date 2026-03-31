import { cn } from '@/lib/utils';
import { ModernFeeCard } from './modern-fee-card';
import { ModernFeeGridCard } from './modern-fee-grid-card';
import { Fee } from '@/types/portal/fees/my-fees';

interface ModernFeeGridViewProps {
    fees: Fee[];
    selectMode?: boolean;
    selectedFees?: number[];
    onSelectFee?: (fee: Fee) => void;
    getCategoryDisplay: (feeType: any) => string;
    formatDate: (date: string) => string;
    onPrint?: (fee: Fee) => void;
    isMobile?: boolean;
}

export function ModernFeeGridView({
    fees,
    selectMode = false,
    selectedFees = [],
    onSelectFee,
    getCategoryDisplay,
    formatDate,
    onPrint,
    isMobile = false
}: ModernFeeGridViewProps) {
    // Handle fee selection
    const handleSelectFee = (feeId: number) => {
        if (onSelectFee) {
            const fee = fees.find(f => f.id === feeId);
            if (fee) {
                onSelectFee(fee);
            }
        }
    };

    return (
        <div className={cn(
            isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
            {fees.map((fee) => (
                isMobile ? (
                    <ModernFeeCard
                        key={`fee-${fee.id}`}
                        fee={fee}
                        selectMode={selectMode}
                        selectedFees={selectedFees}
                        toggleSelectFee={handleSelectFee}
                        getCategoryDisplay={getCategoryDisplay}
                        formatDate={formatDate}
                        isMobile={isMobile}
                    />
                ) : (
                    <ModernFeeGridCard
                        key={`fee-${fee.id}`}
                        fee={fee}
                        selectMode={selectMode}
                        selectedFees={selectedFees}
                        toggleSelectFee={handleSelectFee}
                        getCategoryDisplay={getCategoryDisplay}
                        formatDate={formatDate}
                        onPrint={() => onPrint?.(fee)}
                    />
                )
            ))}
        </div>
    );
}