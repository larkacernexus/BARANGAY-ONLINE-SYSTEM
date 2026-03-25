// /components/residentui/announcements/ResultsSummary.tsx
import React from 'react';
import { Target } from 'lucide-react';

interface ResultsSummaryProps {
    total: number;
    from: number;
    to: number;
    selectedType: string;
    types: Record<string, string>;
    personalizedCount: number;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
    total,
    from,
    to,
    selectedType,
    types,
    personalizedCount
}) => {
    return (
        <div className="px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium dark:text-white">{total}</span> announcement{total !== 1 ? 's' : ''} found
                    {selectedType !== 'all' && (
                        <span> in <span className="font-medium dark:text-white">{types[selectedType]}</span></span>
                    )}
                    {personalizedCount > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full dark:bg-purple-950/50 dark:text-purple-400">
                            <Target className="h-3 w-3" />
                            {personalizedCount} personalized for you
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {from} to {to} of {total}
                </div>
            </div>
        </div>
    );
};