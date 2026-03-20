// resources/js/Pages/Admin/Reports/ReportTypes/components/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Info,
    UserCog,
    BarChart,
    Zap,
    Clock,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { PriorityTimelineCard } from './priority-timeline-card';
import { RequirementStatsCard } from './requirement-stats-card';
import { SystemInfoCard } from './system-info-card';

interface Props {
    reportType: any;
    reportStats: any;
    IconComponent: React.ElementType;
    getPriorityIcon: (level: number) => React.ReactNode;
    formatDate: (date: string) => string;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
}

export const OverviewTab = ({
    reportType,
    reportStats,
    IconComponent,
    getPriorityIcon,
    formatDate,
    formatDateTime,
    formatTimeAgo
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Info className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</Label>
                                <p className="text-sm font-mono mt-1 dark:text-gray-300">{reportType.id}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</Label>
                                <p className="text-sm font-mono mt-1 dark:text-gray-300">{reportType.code}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</Label>
                                <p className="text-sm mt-1 capitalize dark:text-gray-300">{reportType.category || 'Uncategorized'}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory</Label>
                                <p className="text-sm mt-1 capitalize dark:text-gray-300">{reportType.subcategory || 'None'}</p>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                                <p className="text-sm mt-1 dark:text-gray-300">
                                    {reportType.description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Icon & Color</Label>
                            <div className="flex items-center gap-3 mt-2">
                                <div 
                                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: reportType.color + '20' }}
                                >
                                    <IconComponent className="h-5 w-5" style={{ color: reportType.color }} />
                                </div>
                                <div>
                                    <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">
                                        {reportType.icon}
                                    </code>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Color: {reportType.color}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment & Roles Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <UserCog className="h-5 w-5" />
                            Assignment & Roles
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Personnel assigned to handle this report type
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reportType.assigned_to_roles && reportType.assigned_to_roles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {reportType.assigned_to_roles.map((role: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                        <UserCog className="h-3 w-3 mr-1" />
                                        {role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No specific roles assigned</p>
                        )}
                    </CardContent>
                </Card>

                {/* Report Statistics Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <BarChart className="h-5 w-5" />
                            Report Statistics
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Overview of reports filed under this type
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold dark:text-gray-100">{reportStats?.total || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Reports</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{reportStats?.pending || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reportStats?.in_progress || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{reportStats?.resolved || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Resolved</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Progress 
                                value={reportStats?.total ? (reportStats.resolved / reportStats.total) * 100 : 0} 
                                className="h-2 dark:bg-gray-700" 
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>0%</span>
                            <span>{reportStats?.total ? Math.round((reportStats.resolved / reportStats.total) * 100) : 0}% Resolved</span>
                            <span>100%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                <PriorityTimelineCard
                    reportType={reportType}
                    getPriorityIcon={getPriorityIcon}
                />
                <RequirementStatsCard
                    reportStats={reportStats}
                />
                <SystemInfoCard
                    reportType={reportType}
                    formatDateTime={formatDateTime}
                    formatTimeAgo={formatTimeAgo}
                />
            </div>
        </div>
    );
};