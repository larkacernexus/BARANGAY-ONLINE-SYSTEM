import { cn } from '@/lib/utils';
import { URGENCY_CONFIG } from '@/components/residentui/constants/resident-ui';
import { Zap } from 'lucide-react';

interface UrgencyBadgeProps {
    urgency: string;
    className?: string;
    showDot?: boolean;
}

export function ModernUrgencyBadge({ urgency, className, showDot = true }: UrgencyBadgeProps) {
    const config = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG];
    if (!config) return null;
    
    return (
        <div className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            config.color,
            className
        )}>
            {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />}
            <span>{config.label}</span>
            {urgency === 'express' && <Zap className="h-2.5 w-2.5 ml-0.5" />}
        </div>
    );
}