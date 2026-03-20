// resources/js/Pages/Admin/DocumentTypes/components/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Info,
    Folder,
    HardDrive,
    FileCode,
    Zap,
    BarChart,
    CheckCircle,
    XCircle,
    FileCheck,
    FileX,
    ListOrdered,
} from 'lucide-react';
import { QuickStatsCard } from './quick-stats-card';
import { RequirementStatsCard } from './requirement-stats-card';
import { SystemInfoCard } from './system-info-card';

interface Props {
    documentType: any;
    requiredCount: number;
    applicationsCount: number;
    max_file_size_mb: number;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    formatFileSize: (kb: number) => string;
}

export const OverviewTab = ({
    documentType,
    requiredCount,
    applicationsCount,
    max_file_size_mb,
    formatDateTime,
    formatTimeAgo,
    formatFileSize
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
                                <p className="text-sm font-mono mt-1 dark:text-gray-300">{documentType.id}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</Label>
                                <p className="text-sm font-mono mt-1 dark:text-gray-300">{documentType.code}</p>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</Label>
                                <p className="text-sm mt-1 dark:text-gray-300">{documentType.name}</p>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                                <p className="text-sm mt-1 dark:text-gray-300">
                                    {documentType.description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</Label>
                            <div className="mt-2">
                                {documentType.category ? (
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                            <Folder className="h-3 w-3 mr-1" />
                                            {documentType.category.name}
                                        </Badge>
                                        {documentType.category.description && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {documentType.category.description}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No category assigned</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* File Specifications Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <HardDrive className="h-5 w-5" />
                            File Specifications
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Accepted formats and file size limits
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Accepted Formats
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(documentType.accepted_formats) 
                                    ? documentType.accepted_formats.map((format: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                            <FileCode className="h-3 w-3 mr-1" />
                                            {format.toUpperCase()}
                                        </Badge>
                                    ))
                                    : typeof documentType.accepted_formats === 'string' 
                                        ? documentType.accepted_formats.split(',').map((format: string, index: number) => (
                                            <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                <FileCode className="h-3 w-3 mr-1" />
                                                {format.trim().toUpperCase()}
                                            </Badge>
                                        ))
                                        : <p className="text-sm text-gray-500 dark:text-gray-400">All formats accepted</p>
                                }
                            </div>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Max File Size
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <HardDrive className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-lg font-semibold dark:text-gray-200">
                                        {max_file_size_mb} MB
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({formatFileSize(documentType.max_file_size)})
                                    </span>
                                </div>
                            </div>
                            <Progress value={75} className="w-24 h-2 dark:bg-gray-700" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                <QuickStatsCard
                    sortOrder={documentType.sort_order}
                    requiredCount={requiredCount}
                    applicationsCount={applicationsCount}
                />
                <RequirementStatsCard
                    isRequired={documentType.is_required}
                    isActive={documentType.is_active}
                />
                <SystemInfoCard
                    documentType={documentType}
                    formatDateTime={formatDateTime}
                    formatTimeAgo={formatTimeAgo}
                />
            </div>
        </div>
    );
};