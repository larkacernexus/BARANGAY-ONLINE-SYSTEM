// components/adminui/empty-state.tsx

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    onCreateNew?: () => void;
    createLabel?: string;
    children?: ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon,
    hasFilters,
    onClearFilters,
    onCreateNew,
    createLabel = "Create New",
    children,
    action,
    className
}: EmptyStateProps) {
    // Determine which action to show
    const showAction = () => {
        // If action is provided directly, use that
        if (action) {
            return (
                <Button onClick={action.onClick} className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    {action.label}
                </Button>
            );
        }
        
        // If there are active filters, show clear filters button
        if (hasFilters && onClearFilters) {
            return (
                <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="h-8 text-xs"
                >
                    Clear Filters
                </Button>
            );
        }
        
        // If onCreateNew is provided, show create button
        if (onCreateNew) {
            return (
                <Button onClick={onCreateNew} className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    {createLabel}
                </Button>
            );
        }
        
        return null;
    };

    return (
        <div className={cn("text-center py-8 text-gray-500", className)}>
            <div className="flex flex-col items-center justify-center space-y-4">
                {icon}
                <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {description}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showAction()}
                </div>
                {children}
            </div>
        </div>
    );
}