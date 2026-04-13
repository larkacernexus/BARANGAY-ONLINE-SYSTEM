// /components/residentui/receipts/CollapsibleStats.tsx

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { BarChart, ChevronDown } from 'lucide-react';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { getReceiptStatsCards } from './constants';
import { cn } from '@/lib/utils';
import { ReceiptStats } from '@/types/portal/receipts/receipt.types';
import { ReceiptItem } from '@/types/portal/receipts/receipt.types';

interface CollapsibleStatsProps {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    stats: ReceiptStats;
    receiptsData?: ReceiptItem[];
    loading?: boolean;
    formatCurrency: (amount: string | number | undefined | null) => string;
    variant?: 'default' | 'compact' | 'mobile';
}

export const CollapsibleStats = ({ 
    showStats, 
    setShowStats, 
    stats, 
    receiptsData,
    loading = false,
    formatCurrency,
    variant = 'mobile'
}: CollapsibleStatsProps) => {
    const statsCards = getReceiptStatsCards(stats, receiptsData, formatCurrency);
    
    return (
        <Collapsible 
            open={showStats} 
            onOpenChange={setShowStats} 
            className="w-full"
        >
            <CollapsibleTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-6"
                >
                    <div className="flex items-center gap-3">
                        <BarChart className="h-5 w-5" />
                        <span className="text-base font-medium">
                            {showStats ? 'Hide Statistics' : 'Show Statistics'}
                        </span>
                    </div>
                    <ChevronDown className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        showStats && "rotate-180"
                    )} />
                </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="animate-slide-down">
                <div className="mt-4">
                    <ModernStatsCards
                        cards={statsCards}
                        loading={loading}
                        gridCols="grid-cols-2"
                        variant={variant}
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};