// /components/residentui/clearances/CollapsibleStats.tsx
import { Button } from '@/components/ui/button';
import { BarChart, ChevronUp, ChevronDown } from 'lucide-react';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { getClearanceStatsCards } from './constants';

interface CollapsibleStatsProps {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    stats: {
        total_clearances?: number;
        pending_clearances?: number;
        pending_payment_clearances?: number;
        processing_clearances?: number;
        approved_clearances?: number;
        issued_clearances?: number;
        rejected_clearances?: number;
        cancelled_clearances?: number;
        total_fees?: number;
        total_paid?: number;
        total_balance?: number;
        current_year_total?: number;
        current_year_issued?: number;
    };
    formatCurrency?: (amount: number | string) => string;
}

export const CollapsibleStats = ({ showStats, setShowStats, stats, formatCurrency }: CollapsibleStatsProps) => (
    <div className="md:hidden">
        <Button
            variant="outline"
            className="w-full justify-between bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-base md:text-sm py-6"
            onClick={() => setShowStats(!showStats)}
        >
            <div className="flex items-center gap-3">
                <BarChart className="h-5 w-5 md:h-4 md:w-4" />
                <span className="text-base md:text-sm font-medium">{showStats ? 'Hide Statistics' : 'Show Statistics'}</span>
            </div>
            {showStats ? (
                <ChevronUp className="h-5 w-5 md:h-4 md:w-4" />
            ) : (
                <ChevronDown className="h-5 w-5 md:h-4 md:w-4" />
            )}
        </Button>
        
        {showStats && (
            <div className="mt-4 animate-slide-down">
                <ModernStatsCards
                    cards={getClearanceStatsCards(stats, formatCurrency || ((amount: number | string) => {
                        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
                        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num);
                    }))}
                    loading={false}
                    gridCols="grid-cols-2"
                    labelPosition="top"  // ✅ ADD THIS LINE - puts title above value on mobile
                />
            </div>
        )}
    </div>
);