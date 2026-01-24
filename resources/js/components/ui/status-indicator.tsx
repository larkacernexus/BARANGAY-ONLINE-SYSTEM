// components/ui/status-indicator.tsx
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, FileText, LucideIcon, XCircle } from 'lucide-react';

interface StatusConfig {
    label: string;
    color: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
    icon?: LucideIcon;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
    active: {
        label: 'Active',
        color: 'success',
        icon: CheckCircle
    },
    pending: {
        label: 'Pending',
        color: 'warning',
        icon: Clock
    },
    inactive: {
        label: 'Inactive',
        color: 'secondary',
        icon: XCircle
    },
    completed: {
        label: 'Completed',
        color: 'success',
        icon: CheckCircle
    },
    cancelled: {
        label: 'Cancelled',
        color: 'destructive',
        icon: XCircle
    },
    draft: {
        label: 'Draft',
        color: 'secondary',
        icon: FileText
    },
    published: {
        label: 'Published',
        color: 'success',
        icon: CheckCircle
    }
};

interface StatusIndicatorProps {
    status: string;
    customConfigs?: Record<string, StatusConfig>;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({
    status,
    customConfigs = {},
    showIcon = true,
    size = 'md'
}: StatusIndicatorProps) {
    const configs = { ...STATUS_CONFIGS, ...customConfigs };
    const config = configs[status.toLowerCase()] || {
        label: status,
        color: 'default' as const
    };

    const Icon = config.icon;
    const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-3 py-1' : 'text-sm px-2.5 py-0.5';

    // Map custom variants to supported Badge variants
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined> = {
        'success': 'default',
        'warning': 'secondary',
        'info': 'outline'
    };

    const badgeVariant = variantMap[config.color] || (config.color as any);

    return (
        <Badge variant={badgeVariant} className={`gap-1 ${sizeClasses}`}>
            {showIcon && Icon && <Icon className="h-3 w-3" />}
            {config.label}
        </Badge>
    );
}