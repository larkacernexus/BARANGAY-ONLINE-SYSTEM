// resources/js/Pages/Admin/ClearanceTypes/components/recent-clearances-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    History,
    ChevronRight,
} from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

interface Props {
    clearances: any[];
    typeId: number;
}

export const RecentClearancesCard = ({ clearances, typeId }: Props) => {
    if (clearances.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <History className="h-5 w-5" />
                    Recent Clearances
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {clearances.map((clearance) => (
                        <div key={clearance.id} className="flex items-center justify-between text-sm">
                            <div className="truncate flex-1">
                                <p className="font-medium dark:text-gray-200">{clearance.resident_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatRelativeTime(clearance.created_at)}
                                </p>
                            </div>
                            <Badge variant={
                                clearance.status === 'approved' ? 'default' :
                                clearance.status === 'pending' ? 'outline' :
                                clearance.status === 'rejected' ? 'destructive' : 'secondary'
                            } className={clearance.status === 'approved' ? 'dark:bg-green-900/30 dark:text-green-300' : ''}>
                                {clearance.status}
                            </Badge>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <Link href={`/clearances?type=${typeId}`} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1">
                        View all clearances
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};