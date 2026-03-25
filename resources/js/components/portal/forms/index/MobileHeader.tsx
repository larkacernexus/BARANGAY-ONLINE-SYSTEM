// /components/residentui/forms/MobileHeader.tsx
import { Button } from '@/components/ui/button';
import { Filter, ChevronUp, ChevronDown } from 'lucide-react';

interface MobileHeaderProps {
    statsTotal: number;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    hasActiveFilters: boolean;
    setShowMobileFilters: (show: boolean) => void;
}

export const MobileHeader = ({
    statsTotal,
    showStats,
    setShowStats,
    hasActiveFilters,
    setShowMobileFilters
}: MobileHeaderProps) => (
    <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
        <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Forms Catalog</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {statsTotal} form{statsTotal !== 1 ? 's' : ''} available
            </p>
        </div>
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="h-8 px-2 rounded-lg border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
                {showStats ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(true)}
                className="h-8 px-2 rounded-lg relative border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse" />
                )}
            </Button>
        </div>
    </div>
);