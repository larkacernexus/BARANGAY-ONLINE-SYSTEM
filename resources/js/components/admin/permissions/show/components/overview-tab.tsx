// resources/js/Pages/Admin/Permissions/components/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Building,
    Users,
    Shield,
    Info,
    Zap,
    MessageCircle,
    Tag,
    FileText,
    Clock,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { QuickActionsCard } from './quick-actions-card';
import { InformationCard } from './information-card';
import { SystemInfoCard } from './system-info-card';

// Helper Label component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}>
            {children}
        </div>
    );
}

interface Props {
    permission: any;
    statistics: any[];
    totalRolesWithAccess: number;
    totalUsersWithAccess: number;
    onContactDeveloper: () => void;
    formatDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    getModuleDisplayName: (module: string) => string;
    getModuleIcon: (module: string) => React.ReactNode;
    getModuleColor: (module: string) => string;
    getColorClass: (color: string) => string;
}

export const OverviewTab = ({
    permission,
    totalRolesWithAccess,
    totalUsersWithAccess,
    onContactDeveloper,
    formatDate,
    formatTimeAgo,
    getModuleDisplayName,
    getModuleIcon,
    getModuleColor,
    getColorClass
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
                {/* Module Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Building className="h-5 w-5" />
                            Module Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className={`h-16 w-16 rounded-lg ${getModuleColor(permission.module)} flex items-center justify-center`}>
                                {getModuleIcon(permission.module)}
                            </div>
                            <div>
                                <p className="font-medium text-lg dark:text-gray-200">{getModuleDisplayName(permission.module)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Module</p>
                                <Badge variant="outline" className="mt-2 dark:border-gray-600 dark:text-gray-300">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {permission.module}
                                </Badge>
                            </div>
                        </div>

                        {permission.description && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</Label>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                        {permission.description}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Access Summary Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Users className="h-5 w-5" />
                            Access Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Shield className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalRolesWithAccess}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Roles</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Users className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalUsersWithAccess}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                <QuickActionsCard onContactDeveloper={onContactDeveloper} />
                <InformationCard
                    permission={permission}
                    formatDate={formatDate}
                    formatTimeAgo={formatTimeAgo}
                    getModuleDisplayName={getModuleDisplayName}
                />
                <SystemInfoCard permission={permission} />
            </div>
        </div>
    );
};