// resources/js/Pages/Admin/ClearanceTypes/components/discounts-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Award,
    Shield,
    File,
    Plus,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { DiscountConfig, PrivilegeData } from '../types';
import { getPrivilegeIcon, getPrivilegeColor } from '../utils/helpers';

interface Props {
    discounts: DiscountConfig[];
    privileges: PrivilegeData[];
    showAll: boolean;
    onToggle: () => void;
    clearanceTypeId: number;
}

export const DiscountsTab = ({ discounts, privileges, showAll, onToggle, clearanceTypeId }: Props) => {
    const displayedDiscounts = showAll ? discounts : discounts.slice(0, 3);

    if (discounts.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Award className="h-5 w-5" />
                        Eligible Discounts
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No discounts configured</p>
                    <Link href={`/admin/clearance-types/${clearanceTypeId}/edit`}>
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Discounts
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Award className="h-5 w-5" />
                        Eligible Discounts
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {discounts.length} discount{discounts.length !== 1 ? 's' : ''} available
                    </CardDescription>
                </div>
                {discounts.length > 3 && (
                    <Button variant="ghost" size="sm" onClick={onToggle}>
                        {showAll ? 'Show Less' : 'Show All'}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayedDiscounts.map((discount) => (
                        <div key={discount.privilege_id} className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    getPrivilegeColor(discount.privilege_code).split(' ')[0]
                                }`}>
                                    {getPrivilegeIcon(discount.privilege_code)}
                                </div>
                                <div>
                                    <p className="font-medium dark:text-gray-200">{discount.privilege_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{discount.privilege_code}</span>
                                        {discount.requires_verification && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Shield className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>Requires verification</TooltipContent>
                                            </Tooltip>
                                        )}
                                        {discount.requires_id_number && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <File className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>Requires ID number</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Badge className="text-sm bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                {discount.discount_percentage}% off
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};