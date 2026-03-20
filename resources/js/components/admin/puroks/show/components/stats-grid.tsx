// resources/js/Pages/Admin/Puroks/components/stats-grid.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stat } from '../types';
import { getIconComponent, getColorClass } from '../utils/helpers';

interface Props {
    stats: Stat[];
}

export const StatsGrid = ({ stats }: Props) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => (
                <Card key={index} className="dark:bg-gray-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1 dark:text-gray-100">{stat.value}</p>
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