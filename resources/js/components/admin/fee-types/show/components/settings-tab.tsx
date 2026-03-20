// resources/js/Pages/Admin/FeeTypes/components/settings-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Settings,
    CalendarDays,
    Calendar,
    Check,
    X,
} from 'lucide-react';

interface Props {
    feeType: any;
    formatDate: (date: string) => string;
    formatCurrency: (amount: any) => string;
    getFrequencyLabel: (frequency: string) => string;
}

export const SettingsTab = ({ feeType, formatDate, formatCurrency, getFrequencyLabel }: Props) => {
    const isExpired = () => {
        if (!feeType.expiry_date) return false;
        return new Date() > new Date(feeType.expiry_date);
    };

    const expired = isExpired();

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* System Settings Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Settings className="h-5 w-5" />
                        System Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Active Status</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Whether this fee type is active</div>
                            </div>
                            <Badge className={feeType.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}>
                                {feeType.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Mandatory</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Required for all applicable entities</div>
                            </div>
                            {feeType.is_mandatory ? (
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Auto-generate</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Automatically create fees</div>
                            </div>
                            {feeType.auto_generate ? (
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Approval Needed</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Requires approval before application</div>
                            </div>
                            {feeType.approval_needed ? (
                                <Check className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                                <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            )}
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Sort Order</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Display order in lists</div>
                            </div>
                            <span className="font-mono dark:text-gray-300">{feeType.sort_order || 'Default'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Frequency & Validity Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <CalendarDays className="h-5 w-5" />
                        Frequency & Validity
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="font-medium dark:text-gray-200">Frequency</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">How often this fee applies</div>
                            </div>
                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                {getFrequencyLabel(feeType.frequency)}
                            </Badge>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        {feeType.validity_days && (
                            <>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div>
                                        <div className="font-medium dark:text-gray-200">Validity Period</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">How long the fee is valid</div>
                                    </div>
                                    <span className="font-bold dark:text-gray-200">{feeType.validity_days} days</span>
                                </div>
                                <Separator className="dark:bg-gray-700" />
                            </>
                        )}
                        {feeType.due_day && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div>
                                    <div className="font-medium dark:text-gray-200">Due Day</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Day of month when due</div>
                                </div>
                                <span className="font-bold dark:text-gray-200">{feeType.due_day}th</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dates Information Card */}
            <Card className="lg:col-span-2 dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Calendar className="h-5 w-5" />
                        Date Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Effective Date</div>
                            <div className="text-2xl font-bold dark:text-gray-200">{formatDate(feeType.effective_date)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">When this fee type becomes active</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Expiry Date</div>
                            <div className="text-2xl font-bold dark:text-gray-200">
                                {feeType.expiry_date ? formatDate(feeType.expiry_date) : 'No expiry'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {expired ? 'This fee type has expired' : 'When this fee type expires'}
                            </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Created On</div>
                            <div className="text-2xl font-bold dark:text-gray-200">{formatDate(feeType.created_at)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">When this fee type was created</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};