// resources/js/Pages/Admin/FeeTypes/components/status-banner.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Edit,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { FeeType } from '../types';

interface Props {
    feeType: FeeType;
    formatDate: (date: string) => string;
}

export const StatusBanner = ({ feeType, formatDate }: Props) => {
    return (
        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">Fee Type Expired</p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                This fee type expired on {formatDate(feeType.expiry_date!)}.
                            </p>
                        </div>
                    </div>
                    <Link href={route('admin.fee-types.edit', feeType.id)}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Extend Validity
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};