// /components/residentui/announcements/ActiveFiltersIndicator.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTypeConfig, getPriorityConfig, getStatusConfig } from './constants';

interface ActiveFiltersIndicatorProps {
    selectedType: string;
    selectedPriority: string;
    selectedStatus: string;
    types: Record<string, string>;
    priorityOptions: Record<number, string>;
    statusOptions: Record<string, string>;
    onTypeChange: (type: string) => void;
    onPriorityChange: (priority: string) => void;
    onStatusChange: (status: string) => void;
    onClearFilters: () => void;
    loading: boolean;
}

export const ActiveFiltersIndicator: React.FC<ActiveFiltersIndicatorProps> = ({
    selectedType,
    selectedPriority,
    selectedStatus,
    types,
    priorityOptions,
    statusOptions,
    onTypeChange,
    onPriorityChange,
    onStatusChange,
    onClearFilters,
    loading
}) => {
    const hasActiveFilters = selectedType !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all';
    
    if (!hasActiveFilters) return null;

    // Get configs once
    const typeConfig = getTypeConfig(selectedType);
    const priorityConfig = getPriorityConfig(parseInt(selectedPriority));
    const statusConfig = getStatusConfig(selectedStatus);
    
    const TypeIcon = typeConfig.icon;
    const PriorityIcon = priorityConfig.icon;
    const StatusIcon = statusConfig.icon;

    return (
        <div className="px-4 sm:px-0">
            <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                <Filter className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Active filters:</span>
                
                {/* Type Filter Badge */}
                {selectedType !== 'all' && (
                    <Badge 
                        variant="secondary" 
                        className={cn(
                            "flex items-center gap-1 text-xs px-2 py-0.5",
                            typeConfig.bgColor,
                            typeConfig.textColor
                        )}
                    >
                        {TypeIcon && <TypeIcon className="h-2.5 w-2.5" />}
                        <span className="truncate max-w-[80px]">{types[selectedType]}</span>
                        <button 
                            onClick={() => onTypeChange('all')} 
                            className="ml-1 hover:opacity-70"
                        >
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </Badge>
                )}
                
                {/* Priority Filter Badge */}
                {selectedPriority !== 'all' && (
                    <Badge 
                        variant="secondary" 
                        className={cn(
                            "flex items-center gap-1 text-xs px-2 py-0.5",
                            priorityConfig.bgColor,
                            priorityConfig.textColor
                        )}
                    >
                        {PriorityIcon && <PriorityIcon className="h-2.5 w-2.5" />}
                        <span className="truncate max-w-[80px]">{priorityOptions[parseInt(selectedPriority)]}</span>
                        <button 
                            onClick={() => onPriorityChange('all')} 
                            className="ml-1 hover:opacity-70"
                        >
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </Badge>
                )}

                {/* Status Filter Badge */}
                {selectedStatus !== 'all' && (
                    <Badge 
                        variant="secondary" 
                        className={cn(
                            "flex items-center gap-1 text-xs px-2 py-0.5",
                            selectedStatus === 'active' 
                                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400'
                                : selectedStatus === 'upcoming'
                                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400'
                                : selectedStatus === 'expired'
                                ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400'
                                : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400'
                        )}
                    >
                        {StatusIcon && <StatusIcon className="h-2.5 w-2.5" />}
                        <span className="truncate max-w-[80px]">{statusOptions[selectedStatus]}</span>
                        <button 
                            onClick={() => onStatusChange('all')} 
                            className="ml-1 hover:opacity-70"
                        >
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </Badge>
                )}
                
                {/* Clear All Button */}
                <button 
                    onClick={onClearFilters} 
                    className="text-primary dark:text-primary-400 text-xs font-medium hover:underline ml-auto" 
                    disabled={loading}
                >
                    Clear all
                </button>
            </div>
        </div>
    );
};