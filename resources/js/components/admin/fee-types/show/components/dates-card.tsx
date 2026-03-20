// resources/js/Pages/Admin/FeeTypes/components/dates-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
} from 'lucide-react';

interface Props {
    feeType: any;
    formatDate: (date: string) => string;
}

export const DatesCard = ({ feeType, formatDate }: Props) => {
    const isExpired = () => {
        if (!feeType.expiry_date) return false;
        return new Date() > new Date(feeType.expiry_date);
    };

    const expired = isExpired();

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Calendar className="h-5 w-5" />
                    Dates
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Effective Date</Label>
                    <div className="font-medium dark:text-gray-200">{formatDate(feeType.effective_date)}</div>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</Label>
                    <div className="font-medium flex items-center gap-2 dark:text-gray-200">
                        {feeType.expiry_date ? formatDate(feeType.expiry_date) : 'No expiry'}
                        {expired && (
                            <Badge variant="destructive" className="text-xs">
                                Expired
                            </Badge>
                        )}
                    </div>
                </div>
                {feeType.validity_days && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Validity Period</Label>
                            <div className="font-medium dark:text-gray-200">{feeType.validity_days} days</div>
                        </div>
                    </>
                )}
                {feeType.due_day && (
                    <>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Due Day of Month</Label>
                            <div className="font-medium dark:text-gray-200">{feeType.due_day}th</div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};