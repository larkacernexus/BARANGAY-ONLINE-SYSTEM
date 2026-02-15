// @/components/adminui/simple-grid-layout.tsx
import { ReactNode } from 'react';

interface SimpleGridLayoutProps {
    children: ReactNode;
    isEmpty: boolean;
    emptyState: ReactNode;
    /**
     * Grid columns configuration
     * @default 4 columns on xl, 3 on lg, 2 on sm, 1 on base
     */
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    /**
     * Gap between items
     * @default '4' (1rem = 16px)
     */
    gap?: '2' | '3' | '4' | '5' | '6' | '8';
    /**
     * Padding around the grid
     * @default 'p-4'
     */
    padding?: 'p-2' | 'p-3' | 'p-4' | 'p-6' | 'p-8';
    className?: string;
}

export function SimpleGridLayout({
    children,
    isEmpty,
    emptyState,
    columns = 4,
    gap = '4',
    padding = 'p-4',
    className = ''
}: SimpleGridLayoutProps) {
    // Map columns to responsive grid classes
    const getGridCols = () => {
        const cols = Math.min(Math.max(columns, 1), 6);
        return {
            base: 1,
            sm: Math.min(cols, 2),
            md: Math.min(cols, 3),
            lg: Math.min(cols, 4),
            xl: cols
        };
    };

    const gridCols = getGridCols();
    
    const gridClass = [
        'grid',
        `grid-cols-${gridCols.base}`,
        `sm:grid-cols-${gridCols.sm}`,
        gridCols.md > 1 && `md:grid-cols-${gridCols.md}`,
        gridCols.lg > 2 && `lg:grid-cols-${gridCols.lg}`,
        gridCols.xl > 3 && `xl:grid-cols-${gridCols.xl}`,
        `gap-${gap}`,
        `sm:gap-${gap}`
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={`${padding} ${className}`}>
            {isEmpty ? (
                emptyState
            ) : (
                <div className={gridClass}>
                    {children}
                </div>
            )}
        </div>
    );
}