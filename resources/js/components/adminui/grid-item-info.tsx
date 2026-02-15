// components/ui/grid-item-info.tsx
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GridItemInfoProps {
  icon: ReactNode;
  title: string;
  value: string | ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}

export function GridItemInfo({
  icon,
  title,
  value,
  iconClassName = '',
  valueClassName = '',
  className = ''
}: GridItemInfoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-shrink-0 text-gray-400', iconClassName)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500">{title}</div>
        <div className={cn('text-sm truncate', valueClassName)}>{value}</div>
      </div>
    </div>
  );
}