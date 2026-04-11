import { Button } from '@/components/ui/button';
import { Filter, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface MobileHeaderProps {
    statsTotal: number;
    currentResident?: { first_name: string; last_name: string };
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    hasActiveFilters: boolean;
    setShowMobileFilters: (show: boolean) => void;
}

export const MobileHeader = ({
    statsTotal,
    currentResident,
    showStats,
    setShowStats,
    hasActiveFilters,
    setShowMobileFilters
}: MobileHeaderProps) => (
    <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-10 py-3 px-4 -mx-4">
        <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Community Reports</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {statsTotal} report{statsTotal !== 1 ? 's' : ''} total
                {currentResident && (
                    <span className="block text-xs">
                        {currentResident.first_name} {currentResident.last_name}
                    </span>
                )}
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
            <Link href="/portal/community-reports/create">
                <Button size="sm" className="h-8 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Report
                </Button>
            </Link>
        </div>
    </div>
);