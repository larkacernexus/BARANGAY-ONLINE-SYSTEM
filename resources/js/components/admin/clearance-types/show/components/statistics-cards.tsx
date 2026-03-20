// resources/js/Pages/Admin/ClearanceTypes/components/statistics-cards.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Statistic } from '../types';
import { getColorClass } from '../utils/helpers';

interface Props {
    statistics: Statistic[];
}

export const StatisticsCards = ({ statistics }: Props) => {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="dark:bg-gray-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    <p className="text-2xl font-bold mt-1 dark:text-gray-100">{stat.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getColorClass(stat.color)}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};