// resources/js/Pages/Admin/ClearanceTypes/components/quick-actions-card.tsx
import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Zap,
    Edit,
    Eye,
    Copy,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Props {
    clearanceType: any;
}

export const QuickActionsCard = ({ clearanceType }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href={`/clearance-types/${clearanceType.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Clearance Type
                    </Button>
                </Link>

                <Link href={`/clearances?type=${clearanceType.id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Eye className="h-4 w-4 mr-2" />
                        View Clearances
                    </Button>
                </Link>

                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={() => {
                        if (confirm(`Duplicate "${clearanceType.name}"?`)) {
                            router.post(route('clearance-types.duplicate', clearanceType.id), {});
                        }
                    }}
                >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Type
                </Button>
            </CardContent>
        </Card>
    );
};