import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    onCreateNew?: () => void;
    createLabel?: string;
    children?: ReactNode;
}

export function EmptyState({
    title,
    description,
    icon,
    hasFilters,
    onClearFilters,
    onCreateNew,
    createLabel = "Create New",
    children
}: EmptyStateProps) {
    return (
        <div className="text-center py-8 text-gray-500">
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
                    {hasFilters && onClearFilters && (
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            className="h-8 text-xs"
                        >
                            Clear Filters
                        </Button>
                    )}
                    {onCreateNew && (
                        <Button onClick={onCreateNew} className="h-8 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            {createLabel}
                        </Button>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}