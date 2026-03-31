// resources/js/components/admin/blotters/show/components/cards/timeline-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { Blotter } from '@/types/admin/blotters/blotter';
import { formatDateTime } from '@/components/admin/blotters/show/utils/helpers';

interface TimelineCardProps {
    blotter: Blotter;
}

export function TimelineCard({ blotter }: TimelineCardProps) {
    const events = [
        {
            icon: Calendar,
            label: 'Incident Date',
            date: blotter.incident_datetime,
            color: 'blue'
        },
        {
            icon: Clock,
            label: 'Filed On',
            date: blotter.created_at,
            color: 'green'
        },
        {
            icon: RefreshCw,
            label: 'Last Updated',
            date: blotter.updated_at,
            color: 'purple'
        }
    ];

    if (blotter.resolved_datetime) {
        events.push({
            icon: CheckCircle,
            label: 'Resolved On',
            date: blotter.resolved_datetime,
            color: 'green'
        });
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Clock className="h-5 w-5" />
                    Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event, index) => {
                        const Icon = event.icon;
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`h-8 w-8 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`h-4 w-4 text-${event.color}-600 dark:text-${event.color}-400`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium dark:text-gray-200">{event.label}</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 cursor-help">
                                                    {formatDateTime(event.date)}
                                                </p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {formatDateTime(event.date)}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}