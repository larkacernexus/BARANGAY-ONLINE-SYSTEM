// @/components/adminui/grid-layout.tsx
import { ReactNode } from 'react';

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface GridLayoutProps {
    children: ReactNode;
    isEmpty: boolean;
    emptyState: ReactNode;
    gridCols?: {                    // ✅ Make it optional with ?
        base?: GridColumns;
        sm?: GridColumns;
        md?: GridColumns;
        lg?: GridColumns;
        xl?: GridColumns;
        '2xl'?: GridColumns;
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
    gridCols = {                     // ✅ Default values
        base: 1,
        sm: 2,
        md: 3,
        lg: 3,
        xl: 4,
        '2xl': 4
    },
    gap = { base: '3', sm: '4' },
    padding = 'p-4',
    className = ''
}: GridLayoutProps) {
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

    if (isEmpty) {
        return (
            <div className={`${padding} ${className} bg-gray-50 dark:bg-gray-950 min-h-[400px] flex items-center justify-center`}>
                {emptyState}
            </div>
        );
    }

    return (
        <div className={`${padding} ${className} bg-gray-50 dark:bg-gray-950`}>
            <div className={gridClass}>
                {children}
            </div>
        </div>
    );
}