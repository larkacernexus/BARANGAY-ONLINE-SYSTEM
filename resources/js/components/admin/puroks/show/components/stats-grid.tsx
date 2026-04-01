// resources/js/Pages/Admin/Puroks/components/stats-grid.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Home, Users, CheckCircle, XCircle } from 'lucide-react';

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
}

interface Props {
    stats: {
        total: number;
        active: number;
        totalHouseholds: number;
        totalResidents: number;
    };
}

const getIconComponent = (iconName: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
        'MapPin': <MapPin className="h-5 w-5" />,
        'Home': <Home className="h-5 w-5" />,
        'Users': <Users className="h-5 w-5" />,
        'CheckCircle': <CheckCircle className="h-5 w-5" />,
        'XCircle': <XCircle className="h-5 w-5" />,
    };
    return icons[iconName] || <MapPin className="h-5 w-5" />;
};

const getColorClass = (color: string): string => {
    const colors: Record<string, string> = {
        'blue': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'green': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        'gray': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        'amber': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        'purple': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[color] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
};

export const StatsGrid = ({ stats }: Props) => {
    const statItems = [
        { label: 'Total Puroks', value: stats.total, icon: 'MapPin', color: 'blue' },
        { label: 'Active Puroks', value: stats.active, icon: 'CheckCircle', color: 'green' },
        { label: 'Inactive Puroks', value: stats.total - stats.active, icon: 'XCircle', color: 'gray' },
        { label: 'Total Households', value: stats.totalHouseholds, icon: 'Home', color: 'amber' },
        { label: 'Total Residents', value: stats.totalResidents, icon: 'Users', color: 'purple' },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {statItems.map((stat, index) => (
                <Card key={index} className="dark:bg-gray-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1 dark:text-gray-100">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getColorClass(stat.color)}`}>
                                {getIconComponent(stat.icon)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};