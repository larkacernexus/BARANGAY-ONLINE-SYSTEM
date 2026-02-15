// components/ui/grid-card.tsx
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GridCardProps {
  children: React.ReactNode;
  isSelected?: boolean;
  isHighlighted?: boolean;
  highlightColor?: 'blue' | 'red' | 'yellow' | 'green';
  onClick?: () => void;
  className?: string;
}

export function GridCard({
  children,
  isSelected = false,
  isHighlighted = false,
  highlightColor = 'blue',
  onClick,
  className = ''
}: GridCardProps) {
  const highlightClasses = {
    blue: 'ring-2 ring-blue-500 bg-blue-50',
    red: 'ring-2 ring-red-500 bg-red-50/30 border-red-300',
    yellow: 'ring-2 ring-yellow-500 bg-yellow-50/30',
    green: 'ring-2 ring-green-500 bg-green-50/30'
  };

  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-shadow cursor-pointer',
        isSelected && highlightClasses[highlightColor],
        isHighlighted && highlightClasses[highlightColor],
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}