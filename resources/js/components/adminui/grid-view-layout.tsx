// @/components/adminui/grid-view-layout.tsx
import { ReactNode } from 'react';
import { EmptyState } from '@/components/adminui/empty-state';
import { LucideIcon } from 'lucide-react';

interface GridViewLayoutProps {
    items: any[];
    renderItem: (item: any) => ReactNode;
    emptyStateTitle: string;
    emptyStateDescription: string;
    emptyStateIcon: LucideIcon | ReactNode;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onCreateNew?: () => void;
    createLabel?: string;
    gridCols?: {
        base: number;
        sm: number;
        lg: number;
        xl: number;
    };
    gap?: string;
    className?: string;
}

export function GridViewLayout({
    items,
    renderItem,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateIcon,
    hasActiveFilters,
    onClearFilters,
    onCreateNew,
    createLabel = "Create New",
    gridCols = { base: 1, sm: 2, lg: 3, xl: 4 },
    gap = "gap-3 sm:gap-4",
    className = ""
}: GridViewLayoutProps) {
    const gridClasses = `grid grid-cols-${gridCols.base} sm:grid-cols-${gridCols.sm} lg:grid-cols-${gridCols.lg} xl:grid-cols-${gridCols.xl} ${gap}`;

    return (
        <div className={`p-4 ${className}`}>
            {items.length === 0 ? (
                <EmptyState
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                    icon={typeof emptyStateIcon === 'function' 
                        ? emptyStateIcon({ className: "h-12 w-12 text-gray-300 dark:text-gray-700" })
                        : emptyStateIcon}
                    hasFilters={hasActiveFilters}
                    onClearFilters={onClearFilters}
                    onCreateNew={onCreateNew}
                    createLabel={createLabel}
                />
            ) : (
                <div className={gridClasses}>
                    {items.map((item) => renderItem(item))}
                </div>
            )}
        </div>
    );
}