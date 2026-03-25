// /components/residentui/reports/UrgencyBadge.tsx
import { Badge } from '@/components/ui/badge';
import { URGENCY_CONFIG } from '@/components/residentui/reports/constants';

interface UrgencyBadgeProps {
    urgency: string;
}

export const UrgencyBadge = ({ urgency }: UrgencyBadgeProps) => {
    const urgencyKey = urgency as keyof typeof URGENCY_CONFIG;
    const config = URGENCY_CONFIG[urgencyKey];
    
    if (!config) {
        return (
            <Badge variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
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
};