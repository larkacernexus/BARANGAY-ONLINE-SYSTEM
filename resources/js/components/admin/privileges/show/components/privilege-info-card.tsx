// resources/js/Pages/Admin/Privileges/components/privilege-info-card.tsx
import React from 'react';
import { format, parseISO } from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Award, CreditCard, Percent, Calendar } from 'lucide-react';

interface DiscountType {
    id: number;
    name: string;
    code: string;
}

interface Privilege {
    id: number;
    name: string;
    code: string;
    description: string | null;
    discount_type?: DiscountType;
    default_discount_percentage: string | number;
    validity_years: number | null;
    updated_at: string;
}

interface Props {
    privilege: Privilege;
}

const formatDate = (dateString: string | null, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

export const PrivilegeInfoCard = ({ privilege }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Award className="h-5 w-5" />
                    Privilege Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Privilege Name</p>
                        <p className="text-base dark:text-gray-200">{privilege.name}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</p>
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300 font-mono">
                            {privilege.code}
                        </code>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                        {privilege.description || 'No description provided.'}
                    </p>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount Type</p>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="dark:text-gray-200">{privilege.discount_type?.name || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Discount</p>
                        <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-gray-400" />
                            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                {privilege.default_discount_percentage}%
                            </span>
                        </div>
                    </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Validity Period</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="dark:text-gray-200">
                                {privilege.validity_years ? `${privilege.validity_years} year(s)` : 'Lifetime (No expiration)'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">
                                    {formatDate(privilege.updated_at)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {formatDate(privilege.updated_at, true)}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};