// components/ui/grid-container.tsx
import { cn } from '@/lib/utils';

interface GridContainerProps {
  children: React.ReactNode;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  padding?: boolean;
  className?: string;
}

export function GridContainer({
  children,
  columns = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  padding = true,
  className = ''
}: GridContainerProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div
      className={cn(
        'grid',
        gridCols[columns.base || 1],
        columns.sm && `sm:${gridCols[columns.sm]}`,
        columns.md && `md:${gridCols[columns.md]}`,
        columns.lg && `lg:${gridCols[columns.lg]}`,
        columns.xl && `xl:${gridCols[columns.xl]}`,
        `gap-${gap}`,
        padding && 'p-4',
        className
      )}
    >
      {children}
    </div>
  );
}