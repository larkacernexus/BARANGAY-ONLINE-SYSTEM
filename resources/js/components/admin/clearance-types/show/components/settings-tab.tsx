// resources/js/Pages/Admin/ClearanceTypes/components/settings-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Settings,
    Tag,
    Edit,
    DollarSign,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { DangerZoneCard } from './danger-zone-card';

interface Props {
    clearanceType: any;
    fee: number;
    onToggleDiscountable: () => void;
    onToggleStatus: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    formatCurrency: (amount: number | string) => string;
}

export const SettingsTab = ({
    clearanceType,
    fee,
    onToggleDiscountable,
    onToggleStatus,
    onDuplicate,
    onDelete,
    formatCurrency
}: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Configuration Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Configuration</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Clearance type settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Status</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {clearanceType.is_active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onToggleStatus}
                        >
                            {clearanceType.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Discountable</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {clearanceType.is_discountable ? 'Yes' : 'No'}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onToggleDiscountable}
                        >
                            <Tag className="h-4 w-4 mr-2" />
                            {clearanceType.is_discountable ? 'Disable' : 'Enable'}
                        </Button>
                    </div>

                    <Separator className="dark:bg-gray-700" />
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium dark:text-gray-200">Fee Amount</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatCurrency(fee)}
                            </p>
                        </div>
                        <Link href={`/clearance-types/${clearanceType.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <DangerZoneCard 
                clearanceType={clearanceType}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
            />
        </div>
    );
};