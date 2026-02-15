// @/components/adminui/grid-layout.tsx
import { ReactNode } from 'react';

interface GridLayoutProps {
    children: ReactNode;
    isEmpty: boolean;
    emptyState: ReactNode;
    gridCols?: {
        base?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
    };
    gap?: {
        base?: string;
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
    };
    padding?: string;
    className?: string;
}

export function GridLayout({
    children,
    isEmpty,
    emptyState,
    gridCols = { base: 1, sm: 2, lg: 3, xl: 4 },
    gap = { base: '3', sm: '4' },
    padding = 'p-4',
    className = ''
}: GridLayoutProps) {
    // Build responsive grid classes
    const gridClass = [
        'grid',
        `grid-cols-${gridCols.base || 1}`,
        gridCols.sm && `sm:grid-cols-${gridCols.sm}`,
        gridCols.md && `md:grid-cols-${gridCols.md}`,
        gridCols.lg && `lg:grid-cols-${gridCols.lg}`,
        gridCols.xl && `xl:grid-cols-${gridCols.xl}`,
        gridCols['2xl'] && `2xl:grid-cols-${gridCols['2xl']}`,
        `gap-${gap.base || '3'}`,
        gap.sm && `sm:gap-${gap.sm}`,
        gap.md && `md:gap-${gap.md}`,
        gap.lg && `lg:gap-${gap.lg}`,
        gap.xl && `xl:gap-${gap.xl}`
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