// components/ui/grid-item-header.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GridItemHeaderProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  className?: string;
}

export function GridItemHeader({
  title,
  subtitle,
  status,
  badge,
  className = ''
}: GridItemHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div>
        <div className="font-bold text-sm truncate">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 truncate">{subtitle}</div>
        )}
      </div>
      {status || (badge && (
        <Badge variant={badge.variant} className={badge.className}>
          {badge.text}
        </Badge>
      ))}
    </div>
  );
}