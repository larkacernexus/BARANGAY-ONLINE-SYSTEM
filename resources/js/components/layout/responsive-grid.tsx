// components/layout/responsive-grid.tsx
import { ReactNode } from 'react';

interface ResponsiveGridProps {
    children: ReactNode;
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: number | {
        sm?: number;
        md?: number;
        lg?: number;
    };
    className?: string;
}

export function ResponsiveGrid({
    children,
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    gap = 4,
    className = ''
}: ResponsiveGridProps) {
    const getGridColumns = () => {
        return [
            columns.sm ? `grid-cols-${columns.sm}` : '',
            columns.md ? `md:grid-cols-${columns.md}` : '',
            columns.lg ? `lg:grid-cols-${columns.lg}` : '',
            columns.xl ? `xl:grid-cols-${columns.xl}` : '',
        ].filter(Boolean).join(' ');
    };

    const getGap = () => {
        if (typeof gap === 'number') {
            return `gap-${gap}`;
        }
        return [
            gap.sm ? `gap-${gap.sm}` : '',
            gap.md ? `md:gap-${gap.md}` : '',
            gap.lg ? `lg:gap-${gap.lg}` : '',
        ].filter(Boolean).join(' ');
    };

    return (
        <div className={`grid ${getGridColumns()} ${getGap()} ${className}`}>
            {children}
        </div>
    );
}