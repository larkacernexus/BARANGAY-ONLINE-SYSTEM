// resources/js/Pages/Admin/Officials/components/quick-stats-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    Calendar,
    Hash,
    CheckCircle,
    Clock,
    Award,
    Users,
} from 'lucide-react';

interface Props {
    official: any;
}

export const QuickStatsCard = ({ official }: Props) => {
    const stats = [
        {
            label: 'Term Length',
            value: official.term_duration,
            icon: Calendar,
            color: 'blue'
        },
        {
            label: 'Display Order',
            value: official.order,
            icon: Hash,
            color: 'purple'
        },
        {
            label: 'Status',
            value: official.is_current ? 'Current' : official.status,
            icon: official.is_current ? CheckCircle : Clock,
            color: official.is_current ? 'green' : 'amber'
        },
        {
            label: 'Type',
            value: official.is_regular ? 'Regular' : 'Ex-Officio',
            icon: official.is_regular ? Award : Users,
            color: official.is_regular ? 'green' : 'purple'
        }
    ];

    const getColorClass = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'purple': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

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
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="space-y-1">
                                <div className={`h-8 w-8 rounded-full ${getColorClass(stat.color)} flex items-center justify-center mb-1`}>
                                    <Icon className={`h-4 w-4`} />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-sm font-medium dark:text-gray-200">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};