// resources/js/Pages/Admin/ClearanceTypes/components/status-banner.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Edit,
} from 'lucide-react';
import { ClearanceType } from '@/types/admin/clearance-types/clearance-types';

interface Props {
    clearanceType: ClearanceType;
}

export const StatusBanner = ({ clearanceType }: Props) => {
    return (
        <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">No Documents Required</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                This clearance type has no required documents configured.
                            </p>
                        </div>
                    </div>
                    <Link href={`/clearance-types/${clearanceType.id}/edit`}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Configure
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};