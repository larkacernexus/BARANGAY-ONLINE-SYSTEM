import { cn } from '@/lib/utils';
import { ModernFeeCard } from './modern-fee-card';
import { ModernFeeGridCard } from './modern-fee-grid-card';

interface Fee {
    id: number;
    // ... other properties
}

interface ModernFeeGridViewProps {
    fees: Fee[];
    selectMode?: boolean;
    selectedFees?: number[];
    onSelectFee?: (id: number) => void;
    getCategoryDisplay: (feeType: any) => string;
    formatDate: (date: string) => string;
    onPrint?: (fee: Fee) => void;
    isMobile?: boolean;
}

export function ModernFeeGridView({
    fees,
    selectMode,
    selectedFees = [],
    onSelectFee,
    getCategoryDisplay,
    formatDate,
    onPrint,
    isMobile
}: ModernFeeGridViewProps) {
    return (
        <div className={cn(
            isMobile ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
            {fees.map((fee) => (
                isMobile ? (
                    <ModernFeeCard
                        key={`fee-${fee.id}`}
                        fee={fee}
                        selectMode={selectMode || false}
                        selectedFees={selectedFees || []}
                        toggleSelectFee={(id) => onSelectFee?.(id)}
                        getCategoryDisplay={getCategoryDisplay}
                        formatDate={(date) => formatDate(date)}
                        isMobile={isMobile}
                    />
                ) : (
                    <ModernFeeGridCard
                        key={`fee-${fee.id}`}
                        fee={fee}
                        selectMode={selectMode || false}
                        selectedFees={selectedFees || []}
                        toggleSelectFee={(id) => onSelectFee?.(id)}
                        getCategoryDisplay={getCategoryDisplay}
                        formatDate={(date) => formatDate(date)}
                        onPrint={() => onPrint?.(fee)}
                    />
                )
            ))}
        </div>
    );
}