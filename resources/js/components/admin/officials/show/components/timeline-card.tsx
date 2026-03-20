// resources/js/Pages/Admin/Officials/components/timeline-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    History,
    UserPlus,
    Calendar,
    Clock,
    RefreshCw,
} from 'lucide-react';

interface Props {
    official: any;
    formatDate: (date: string, includeTime?: boolean) => string;
}

export const TimelineCard = ({ official, formatDate }: Props) => {
    const events = [
        {
            icon: UserPlus,
            label: 'Official Appointed',
            date: official.created_at,
            color: 'blue'
        },
        {
            icon: Calendar,
            label: 'Term Started',
            date: official.term_start,
            color: 'green'
        },
        {
            icon: Clock,
            label: 'Term Ends',
            date: official.term_end,
            color: 'amber'
        },
        {
            icon: RefreshCw,
            label: 'Last Updated',
            date: official.updated_at,
            color: 'purple'
        }
    ];

    const getColorClass = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <History className="h-5 w-5" />
                    Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event, index) => {
                        const Icon = event.icon;
                        return (
                            <div key={index} className="relative pl-8">
                                <div className={`absolute left-0 top-1 h-6 w-6 rounded-full ${getColorClass(event.color)} flex items-center justify-center`}>
                                    <Icon className="h-3 w-3" />
                                </div>
                                <div>
                                    <p className="font-medium dark:text-gray-200">{event.label}</p>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 cursor-help">
                                                {formatDate(event.date)}
                                            </p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {formatDate(event.date, true)}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};