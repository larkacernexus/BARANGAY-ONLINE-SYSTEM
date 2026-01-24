import { Badge } from '@/components/ui/badge';

const URGENCY_CONFIG = {
    normal: { 
        label: 'Normal', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500'
    },
    rush: { 
        label: 'Rush', 
        color: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-700 dark:text-orange-300',
        dot: 'bg-orange-500'
    },
    express: { 
        label: 'Express', 
        color: 'bg-red-100 dark:bg-red-900/30', 
        textColor: 'text-red-700 dark:text-red-300',
        dot: 'bg-red-500'
    },
};

interface ClearanceUrgencyBadgeProps {
    urgency: string;
}

export function ClearanceUrgencyBadge({ urgency }: ClearanceUrgencyBadgeProps) {
    const urgencyKey = (urgency || '').toLowerCase() as keyof typeof URGENCY_CONFIG;
    const config = URGENCY_CONFIG[urgencyKey];
    
    if (!config) {
        return (
            <Badge variant="outline" className="text-gray-700 border-gray-300">
                {urgency}
            </Badge>
        );
    }
    
    return (
        <Badge variant="outline" className={`${config.color} ${config.textColor} border-0 flex items-center`}>
            <span className={`h-2 w-2 rounded-full ${config.dot} mr-2`}></span>
            <span>{config.label}</span>
        </Badge>
    );
}