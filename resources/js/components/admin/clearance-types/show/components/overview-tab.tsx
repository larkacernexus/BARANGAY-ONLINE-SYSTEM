// resources/js/Pages/Admin/ClearanceTypes/components/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    DollarSign,
    Clock,
    Calendar,
    Tag,
    CreditCard,
    Shield,
    Globe,
    Settings,
    BarChart3,
    Award,
    BookOpen,
    History,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { EligibilityCriteriaCard } from './eligibility-criteria-card';
import { PurposeOptionsCard } from './purpose-options-card';
import { RecentClearancesCard } from './recent-clearances-card';
import { SystemInfoCard } from './system-info-card';
import { QuickActionsCard } from './quick-actions-card';
import { StatisticsCard } from './statistics-card';

interface Props {
    clearanceType: any;
    recentClearances: any[];
    parsedEligibilityCriteria: any[];
    parsedPurposeOptions: string[];
    activeDiscounts: any[];
    fee: number;
    processingDays: number;
    validityDays: number;
    formatCurrency: (amount: number | string) => string;
    getStatusColor: (isActive: boolean) => string;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
}

export const OverviewTab = ({
    clearanceType,
    recentClearances,
    parsedEligibilityCriteria,
    parsedPurposeOptions,
    activeDiscounts,
    fee,
    processingDays,
    validityDays,
    formatCurrency,
    getStatusColor,
    getStatusIcon
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <FileText className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                            <p className="text-gray-700 dark:text-gray-300">
                                {clearanceType.description || 'No description provided.'}
                            </p>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fee</p>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-xl font-bold dark:text-gray-100">
                                        {formatCurrency(fee)}
                                    </span>
                                    {!clearanceType.requires_payment && (
                                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                            Free
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Processing Time</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-lg dark:text-gray-200">
                                        {processingDays} day{processingDays !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Validity Period</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-lg dark:text-gray-200">
                                        {validityDays} day{validityDays !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${clearanceType.requires_payment ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                <span className="text-sm dark:text-gray-300">Payment Required: {clearanceType.requires_payment ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${clearanceType.requires_approval ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                <span className="text-sm dark:text-gray-300">Approval Required: {clearanceType.requires_approval ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${clearanceType.is_online_only ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                <span className="text-sm dark:text-gray-300">Online Only: {clearanceType.is_online_only ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${clearanceType.is_discountable ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                <span className="text-sm dark:text-gray-300">Discountable: {clearanceType.is_discountable ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Eligibility Criteria */}
                <EligibilityCriteriaCard criteria={parsedEligibilityCriteria} />

                {/* Purpose Options */}
                <PurposeOptionsCard options={parsedPurposeOptions} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                {/* Status & Settings Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Settings className="h-5 w-5" />
                            Status & Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                <Badge className={getStatusColor(clearanceType.is_active)}>
                                    {getStatusIcon(clearanceType.is_active)}
                                    <span className="ml-1">{clearanceType.is_active ? 'Active' : 'Inactive'}</span>
                                </Badge>
                            </div>
                            <Separator className="dark:bg-gray-700" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Discountable</span>
                                {clearanceType.is_discountable ? (
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <Tag className="h-4 w-4" />
                                        <span>Yes</span>
                                        <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 ml-1">
                                            {activeDiscounts.length} eligible
                                        </Badge>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">No</span>
                                )}
                            </div>
                            <Separator className="dark:bg-gray-700" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Payment Required</span>
                                {clearanceType.requires_payment ? (
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <CreditCard className="h-4 w-4" />
                                        <span>Yes</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">No</span>
                                )}
                            </div>
                            <Separator className="dark:bg-gray-700" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Approval Required</span>
                                {clearanceType.requires_approval ? (
                                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                        <Shield className="h-4 w-4" />
                                        <span>Yes</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">No</span>
                                )}
                            </div>
                            <Separator className="dark:bg-gray-700" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Online Only</span>
                                {clearanceType.is_online_only ? (
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                        <Globe className="h-4 w-4" />
                                        <span>Yes</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">No</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <QuickActionsCard 
                    clearanceType={clearanceType}
                />

                {/* Statistics Card */}
                <StatisticsCard 
                    clearanceType={clearanceType}
                    fee={fee}
                    processingDays={processingDays}
                    activeDiscounts={activeDiscounts}
                    formatCurrency={formatCurrency}
                />

                {/* Recent Clearances */}
                <RecentClearancesCard clearances={recentClearances} typeId={clearanceType.id} />

                {/* System Info Card */}
                <SystemInfoCard clearanceType={clearanceType} />
            </div>
        </div>
    );
};