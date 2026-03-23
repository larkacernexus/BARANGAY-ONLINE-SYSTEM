// announcement-show/components/PriorityAlertBanner.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityAlertBannerProps {
    priority: number;
}

export function PriorityAlertBanner({ priority }: PriorityAlertBannerProps) {
    const isUrgent = priority === 4;
    
    return (
        <Alert className={cn(
            "border-0 rounded-xl shadow-lg",
            isUrgent
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-orange-500 to-orange-600"
        )}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        {isUrgent ? (
                            <Shield className="h-5 w-5 text-white" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-white" />
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <AlertTitle className="text-white font-bold">
                        {isUrgent ? '🚨 URGENT ANNOUNCEMENT' : '⚠️ HIGH PRIORITY NOTICE'}
                    </AlertTitle>
                    <AlertDescription className="text-white/90 text-sm mt-1">
                        {isUrgent
                            ? 'Immediate action required. Please read this announcement carefully.'
                            : 'Important information that requires your attention.'}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}