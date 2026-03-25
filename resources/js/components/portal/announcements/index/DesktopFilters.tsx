// /components/residentui/announcements/DesktopFilters.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPriorityConfig, getTypeConfig } from './constants';

interface DesktopFiltersProps {
    selectedType: string;
    selectedPriority: string;
    selectedStatus: string;
    types: Record<string, string>;
    priorityOptions: Record<number, string>;
    statusOptions: Record<string, string>;
    onTypeChange: (type: string) => void;
    onPriorityChange: (priority: string) => void;
    onStatusChange: (status: string) => void;
    loading: boolean;
}

export const DesktopFilters: React.FC<DesktopFiltersProps> = ({
    selectedType,
    selectedPriority,
    selectedStatus,
    types,
    priorityOptions,
    statusOptions,
    onTypeChange,
    onPriorityChange,
    onStatusChange,
    loading
}) => {
    return (
        <div className="px-4 sm:px-0 space-y-4">
            {/* Type Tabs */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                <div className="flex gap-1.5 pb-1 min-w-max">
                    <Button
                        variant={selectedType === 'all' ? "default" : "outline"}
                        size="sm"
                        onClick={() => onTypeChange('all')}
                        disabled={loading}
                        className={cn(
                            "h-8 px-4 text-xs font-medium whitespace-nowrap",
                            selectedType === 'all' 
                                ? 'bg-primary text-primary-foreground shadow-sm border-0 rounded-lg dark:bg-primary-600 dark:hover:bg-primary-700' 
                                : 'bg-white border hover:bg-gray-50 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                    >
                        All Announcements
                    </Button>
                    
                    {Object.entries(types).map(([key, value]) => {
                        const typeConfig = getTypeConfig(key);
                        const TypeIcon = typeConfig.icon;
                        return (
                            <Button
                                key={key}
                                variant={selectedType === key ? "default" : "outline"}
                                size="sm"
                                onClick={() => onTypeChange(key)}
                                disabled={loading}
                                className={cn(
                                    "h-8 px-4 text-xs font-medium whitespace-nowrap border rounded-lg",
                                    selectedType === key 
                                        ? 'shadow-sm border-transparent' 
                                        : 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700',
                                    selectedType === key ? typeConfig.bgColor : ''
                                )}
                            >
                                <div className="flex items-center gap-1.5">
                                    <TypeIcon className={cn("h-3.5 w-3.5", selectedType === key ? typeConfig.textColor : 'text-gray-500')} />
                                    <span>{value}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Priority and Status Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={selectedPriority === 'all' ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPriorityChange('all')}
                            disabled={loading}
                            className={cn(
                                "h-8 px-3 text-xs",
                                selectedPriority === 'all' 
                                    ? "bg-primary text-primary-foreground dark:bg-primary-600 dark:hover:bg-primary-700" 
                                    : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                            )}
                        >
                            All
                        </Button>
                        {Object.entries(priorityOptions).map(([key, value]) => {
                            const priorityNum = parseInt(key);
                            const priorityConfig = getPriorityConfig(priorityNum);
                            const PriorityIcon = priorityConfig.icon;
                            return (
                                <Button
                                    key={key}
                                    variant={selectedPriority === key ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPriorityChange(key)}
                                    disabled={loading}
                                    className={cn(
                                        "h-8 px-3 text-xs gap-1",
                                        selectedPriority === key 
                                            ? priorityConfig.bgColor 
                                            : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                    )}
                                >
                                    <PriorityIcon className="h-3 w-3" />
                                    {value}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={selectedStatus === 'all' ? "default" : "outline"}
                            size="sm"
                            onClick={() => onStatusChange('all')}
                            disabled={loading}
                            className={cn(
                                "h-8 px-3 text-xs",
                                selectedStatus === 'all' 
                                    ? "bg-primary text-primary-foreground dark:bg-primary-600 dark:hover:bg-primary-700" 
                                    : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                            )}
                        >
                            All
                        </Button>
                        {Object.entries(statusOptions).map(([key, value]) => (
                            <Button
                                key={key}
                                variant={selectedStatus === key ? "default" : "outline"}
                                size="sm"
                                onClick={() => onStatusChange(key)}
                                disabled={loading}
                                className={cn(
                                    "h-8 px-3 text-xs",
                                    selectedStatus === key 
                                        ? key === 'active' 
                                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400'
                                            : key === 'upcoming'
                                            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400'
                                            : key === 'expired'
                                            ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400'
                                            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400'
                                        : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                )}
                            >
                                {value}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};