// resources/js/Pages/Admin/FeeTypes/components/status-settings-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Settings,
    Check,
    X,
} from 'lucide-react';

interface Props {
    feeType: any;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
}

export const StatusSettingsCard = ({ feeType, getStatusIcon }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Settings className="h-5 w-5" />
                    Status & Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">Active Status</span>
                    <Badge variant={feeType.is_active ? 'default' : 'secondary'} className="flex items-center gap-1">
                        {getStatusIcon(feeType.is_active)}
                        {feeType.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">Mandatory</span>
                    {feeType.is_mandatory ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                        <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">Auto-generate</span>
                    {feeType.auto_generate ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                        <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">Unit</span>
                    <span className="font-medium dark:text-gray-200">{feeType.unit || 'None'}</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">Sort Order</span>
                    <span className="font-medium dark:text-gray-200">{feeType.sort_order || 'Default'}</span>
                </div>
            </CardContent>
        </Card>
    );
};