// components/ui/grid-card.tsx
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GridCardProps {
  children: React.ReactNode;
  isSelected?: boolean;
  isHighlighted?: boolean;
  highlightColor?: 'blue' | 'red' | 'yellow' | 'green' | 'orange' | 'purple';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GridCard({
  children,
  isSelected = false,
  isHighlighted = false,
  highlightColor = 'blue',
  size = 'md',
  compact = false,
  onClick,
  className = ''
}: GridCardProps) {
  const highlightClasses = {
    blue: 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800',
    red: 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800',
    yellow: 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800',
    green: 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800',
    orange: 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800',
    purple: 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800',
  };

  const sizeClasses = {
    xs: {
      padding: 'p-2',
      text: 'text-xs',
      spacing: 'space-y-1',
    },
    sm: {
      padding: 'p-3',
      text: 'text-sm',
      spacing: 'space-y-1.5',
    },
    md: {
      padding: 'p-4',
      text: 'text-base',
      spacing: 'space-y-2',
    },
    lg: {
      padding: 'p-5',
      text: 'text-lg',
      spacing: 'space-y-3',
    },
    xl: {
      padding: 'p-6',
      text: 'text-xl',
      spacing: 'space-y-4',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Card
      className={cn(
        // Base styles
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        'border border-gray-200 dark:border-gray-800',
        'bg-white dark:bg-gray-900',
        
        // Size-based styles
        currentSize.padding,
        currentSize.text,
        
        // Compact mode reduces internal spacing
        compact && 'space-y-0.5',
        
        // Selection/Highlight styles
        (isSelected || isHighlighted) && highlightClasses[highlightColor],
        
        // Custom classes
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}