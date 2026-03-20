// resources/js/Pages/Admin/FeeTypes/components/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Users,
    MapPin,
    Check,
    ShieldCheck,
    Settings,
    Calendar,
    Info,
    AlertCircle,
    X,
} from 'lucide-react';
import { StatusSettingsCard } from './status-settings-card';
import { DatesCard } from './dates-card';
import { SystemInfoCard } from './system-info-card';

interface Props {
    feeType: any;
    applicablePuroks: string[];
    requirements: string[];
    formatCurrency: (amount: any) => string;
    formatDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    getCategoryColor: (category: string) => string;
    getCategoryLabel: (category: string) => string;
    getAmountTypeLabel: (type: string) => string;
    getApplicableToLabel: (type: string) => string;
    getFrequencyLabel: (frequency: string) => string;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
}

export const OverviewTab = ({
    feeType,
    applicablePuroks,
    requirements,
    formatCurrency,
    formatDate,
    formatTimeAgo,
    getCategoryColor,
    getCategoryLabel,
    getAmountTypeLabel,
    getApplicableToLabel,
    getFrequencyLabel,
    getStatusIcon
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <FileText className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fee Type Code</Label>
                                <div className="font-mono mt-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md dark:text-gray-300">
                                    {feeType.code}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Short Name</Label>
                                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md dark:text-gray-300">
                                    {feeType.short_name || '—'}
                                </div>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {feeType.description || 'No description provided'}
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</Label>
                                <div className="mt-1">
                                    <Badge className={getCategoryColor(feeType.category)}>
                                        {getCategoryLabel(feeType.category)}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount Type</Label>
                                <div className="mt-1 dark:text-gray-300">
                                    {getAmountTypeLabel(feeType.amount_type)}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Frequency</Label>
                                <div className="mt-1 capitalize dark:text-gray-300">
                                    {getFrequencyLabel(feeType.frequency)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applicability Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Users className="h-5 w-5" />
                            Applicability
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicable To</Label>
                            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md dark:text-gray-300">
                                {getApplicableToLabel(feeType.applicable_to)}
                            </div>
                        </div>

                        {applicablePuroks.length > 0 && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Specific Puroks</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {applicablePuroks.map((purok, index) => (
                                            <Badge key={index} variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {purok}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {requirements.length > 0 && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Requirements</Label>
                                    <div className="mt-2 space-y-2">
                                        {requirements.map((requirement, index) => (
                                            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                                <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <span className="dark:text-gray-300">{requirement}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {feeType.approval_needed && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                        <span className="font-medium dark:text-yellow-300">Approval Required</span>
                                    </div>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                        This fee type requires approval before it can be applied.
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
                <StatusSettingsCard
                    feeType={feeType}
                    getStatusIcon={getStatusIcon}
                />
                <DatesCard
                    feeType={feeType}
                    formatDate={formatDate}
                />
                {feeType.computation_formula && Object.keys(feeType.computation_formula).length > 0 && (
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <AlertCircle className="h-5 w-5" />
                                Computation Formula
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <pre className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                    {JSON.stringify(feeType.computation_formula, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <SystemInfoCard
                    feeType={feeType}
                    formatTimeAgo={formatTimeAgo}
                />
            </div>
        </div>
    );
};