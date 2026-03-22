// resources/js/components/admin/blotters/show/components/cards/quick-stats-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, Users } from 'lucide-react';
import { Blotter } from '@/components/admin/blotters/show/types';
import { getStatusColor, getStatusIcon, getPriorityColor, getPriorityIcon } from '@/components/admin/blotters/show/utils/helpers';

interface QuickStatsCardProps {
    blotter: Blotter;
    attachmentsCount: number;
}

export function QuickStatsCard({ blotter, attachmentsCount }: QuickStatsCardProps) {
    const stats = [
        { 
            label: 'Status', 
            value: blotter.status.charAt(0).toUpperCase() + blotter.status.slice(1), 
            icon: getStatusIcon(blotter.status), // This returns a JSX element
            color: getStatusColor(blotter.status) 
        },
        { 
            label: 'Priority', 
            value: blotter.priority.charAt(0).toUpperCase() + blotter.priority.slice(1), 
            icon: getPriorityIcon(blotter.priority), // This returns a JSX element
            color: getPriorityColor(blotter.priority) 
        },
        { 
            label: 'Attachments', 
            value: attachmentsCount, 
            icon: <FileText className="h-4 w-4" />, // This is a JSX element
            color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' 
        },
        { 
            label: 'Involved', 
            value: blotter.involved_residents?.length || 0, 
            icon: <Users className="h-4 w-4" />, // This is a JSX element
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
        },
    ];

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart3 className="h-5 w-5" />
                    Quick Stats
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.color.split(' ')[0]} dark:${stat.color.split(' ')[3]}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-bold dark:text-gray-100">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}