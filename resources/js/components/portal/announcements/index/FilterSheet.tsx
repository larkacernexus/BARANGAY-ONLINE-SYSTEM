// /components/residentui/announcements/FilterSheet.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTypeConfig, getPriorityConfig, getStatusConfig } from './constants';

interface FilterSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
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
    hasActiveFilters: boolean;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
    isOpen,
    onOpenChange,
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
    hasActiveFilters
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl dark:bg-gray-900">
                <SheetHeader className="mb-4">
                    <SheetTitle>Filter Announcements</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 overflow-y-auto pb-6">
                    {/* Type Filter */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={selectedType === 'all' ? "default" : "outline"}
                                size="sm"
                                onClick={() => onTypeChange('all')}
                                className={cn(
                                    "h-9 text-xs justify-start",
                                    selectedType === 'all' 
                                        ? "bg-primary text-primary-foreground" 
                                        : "dark:border-gray-700 dark:text-gray-300"
                                )}
                            >
                                All
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
                                        className={cn(
                                            "h-9 text-xs justify-start",
                                            selectedType === key 
                                                ? typeConfig.bgColor 
                                                : "dark:border-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <TypeIcon className={cn(
                                                "h-3.5 w-3.5",
                                                selectedType === key ? typeConfig.textColor : 'text-gray-500'
                                            )} />
                                            <span className={selectedType === key ? typeConfig.textColor : ''}>
                                                {value}
                                            </span>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Priority</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={selectedPriority === 'all' ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPriorityChange('all')}
                                className={cn(
                                    "h-9 text-xs justify-start",
                                    selectedPriority === 'all' 
                                        ? "bg-primary text-primary-foreground" 
                                        : "dark:border-gray-700 dark:text-gray-300"
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
                                        className={cn(
                                            "h-9 text-xs justify-start gap-2",
                                            selectedPriority === key 
                                                ? priorityConfig.bgColor 
                                                : "dark:border-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <PriorityIcon className={cn(
                                            "h-3.5 w-3.5",
                                            selectedPriority === key ? priorityConfig.textColor : 'text-gray-500'
                                        )} />
                                        <span className={selectedPriority === key ? priorityConfig.textColor : ''}>
                                            {value}
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={selectedStatus === 'all' ? "default" : "outline"}
                                size="sm"
                                onClick={() => onStatusChange('all')}
                                className={cn(
                                    "h-9 text-xs justify-start",
                                    selectedStatus === 'all' 
                                        ? "bg-primary text-primary-foreground" 
                                        : "dark:border-gray-700 dark:text-gray-300"
                                )}
                            >
                                All
                            </Button>
                            {Object.entries(statusOptions).map(([key, value]) => {
                                const statusConfig = getStatusConfig(key);
                                const StatusIcon = statusConfig.icon;
                                return (
                                    <Button
                                        key={key}
                                        variant={selectedStatus === key ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onStatusChange(key)}
                                        className={cn(
                                            "h-9 text-xs justify-start gap-2",
                                            selectedStatus === key 
                                                ? key === 'active' 
                                                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400'
                                                    : key === 'upcoming'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400'
                                                    : key === 'expired'
                                                    ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400'
                                                : "dark:border-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        <span>{value}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="w-full h-9 text-sm dark:border-gray-700"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear All Filters
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};