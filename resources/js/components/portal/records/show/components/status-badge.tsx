// components/document/status-badge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DOCUMENT_STATUS_CONFIG } from '@/components/residentui/constants/document-ui';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const statusConfig = DOCUMENT_STATUS_CONFIG[status as keyof typeof DOCUMENT_STATUS_CONFIG] || DOCUMENT_STATUS_CONFIG.active;
    const StatusIcon = statusConfig.icon;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
            statusConfig.badge,
            className
        )}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
        </div>
    );
}