// /components/residentui/clearances/CollapsibleStats.tsx
import { Button } from '@/components/ui/button';
import { BarChart, ChevronUp, ChevronDown } from 'lucide-react';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { getClearanceStatsCards } from '@/components/residentui/clearances/constants';

interface CollapsibleStatsProps {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    stats: any;
    formatCurrency: (amount: number) => string;
}

export const CollapsibleStats = ({ 
    showStats, 
    setShowStats, 
    stats, 
    formatCurrency 
}: CollapsibleStatsProps) => (
    <div className="md:hidden">
        <Button 
            variant="outline" 
            className="w-full justify-between bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            onClick={() => setShowStats(!showStats)}
        >
            <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span>{showStats ? 'Hide Statistics' : 'Show Statistics'}</span>
            </div>
            {showStats ? (
                <ChevronUp className="h-4 w-4" />
            ) : (
                <ChevronDown className="h-4 w-4" />
            )}
        </Button>
        
        {showStats && (
            <div className="mt-2 animate-slide-down">
                <ModernStatsCards 
                    cards={getClearanceStatsCards(stats, formatCurrency)} 
                    loading={false}
                    gridCols="grid-cols-2"
                />
            </div>
        )}
    </div>
);