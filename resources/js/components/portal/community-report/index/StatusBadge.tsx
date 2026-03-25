// /components/residentui/reports/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/components/residentui/reports/constants';

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusKey = status as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[statusKey];
    
    if (!config) {
        return (
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-0 px-2 py-1 flex items-center gap-1">
                <span className="capitalize">{status.replace('_', ' ')}</span>
            </Badge>
        );
    }
    
    const Icon = config.icon;
    return (
        <Badge className={`${config.color} ${config.textColor} border-0 px-2 py-1 flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </Badge>
    );
};