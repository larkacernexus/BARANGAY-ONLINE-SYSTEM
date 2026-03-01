import { cn } from '@/lib/utils';
import { STATUS_CONFIG as DEFAULT_STATUS_CONFIG } from '@/components/residentui/constants/resident-ui';

interface StatusBadgeProps {
    status: string;
    className?: string;
    showIcon?: boolean;
    config?: Record<string, any>; // Allow custom config
}

export function ModernStatusBadge({ 
    status, 
    className, 
    showIcon = true,
    config = DEFAULT_STATUS_CONFIG 
}: StatusBadgeProps) {
    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;
    
    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            statusConfig.color,
            className
        )}>
            {showIcon && <Icon className="h-3.5 w-3.5" />}
            <span>{statusConfig.label}</span>
        </div>
    );
}