// resources/js/Pages/Admin/Users/components/timeline-card.tsx
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
    KeyRound,
    LogOut,
    RefreshCw,
} from 'lucide-react';

interface Props {
    user: any;
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const TimelineCard = ({ user, formatDate }: Props) => {
    const events = [
        {
            icon: UserPlus,
            label: 'Account Created',
            date: user.created_at,
            color: 'blue'
        },
        {
            icon: KeyRound,
            label: 'Last Password Change',
            date: user.password_changed_at,
            color: 'amber'
        },
        {
            icon: LogOut,
            label: 'Last Login',
            date: user.last_login_at,
            color: 'green'
        },
        {
            icon: RefreshCw,
            label: 'Last Updated',
            date: user.updated_at,
            color: 'purple'
        }
    ];

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
                        if (!event.date) return null;
                        const Icon = event.icon;
                        return (
                            <div key={index} className="relative pl-8">
                                <div className={`absolute left-0 top-1 h-6 w-6 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900/30 flex items-center justify-center`}>
                                    <Icon className={`h-3 w-3 text-${event.color}-600 dark:text-${event.color}-400`} />
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