// resources/js/Pages/Admin/Puroks/components/purok-statistics-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Info,
} from 'lucide-react';
import { Purok } from '../types';

interface Props {
    purok: Purok;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
}

export const PurokStatisticsCard = ({ purok, getStatusColor, getStatusIcon }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Info className="h-5 w-5" />
                    Purok Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Household Size</span>
                        <span className="font-bold dark:text-gray-200">
                            {purok.total_households > 0 
                                ? (purok.total_residents / purok.total_households).toFixed(1)
                                : '0.0'}
                        </span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Population Density</span>
                        <span className="font-bold dark:text-gray-200">
                            {purok.total_residents} residents
                        </span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <Badge className={getStatusColor(purok.status)}>
                            {getStatusIcon(purok.status)}
                            <span className="ml-1">{purok.status.charAt(0).toUpperCase() + purok.status.slice(1)}</span>
                        </Badge>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Map Link</span>
                        <Badge variant={purok.google_maps_url ? "outline" : "secondary"} className={purok.google_maps_url ? 'dark:border-gray-600 dark:text-gray-300' : 'dark:bg-gray-700 dark:text-gray-300'}>
                            {purok.google_maps_url ? 'Available' : 'Not Set'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};