// resources/js/Pages/Admin/Users/components/overview-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    User as UserIcon,
    Mail,
    Phone,
    Key,
    Briefcase,
    Building,
    History,
    ChevronRight,
    Copy,
    Check,
    AlertCircle,
    Shield,
    Calendar,
    MapPin,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ProfileSummaryCard } from './profile-summary-card';
import { SecurityScoreCard } from './security-score-card';
import { ActivityStatsCard } from './activity-stats-card';
import { QuickActionsCard } from './quick-actions-card';
import { SystemInfoCard } from './system-info-card';

interface Props {
    user: any;
    activityLogs: any[];
    stats: any;
    emailCopied: boolean;
    onCopyEmail: () => void;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onLogoutAll: () => void;
    onDelete: () => void;
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const OverviewTab = ({
    user,
    activityLogs,
    stats,
    emailCopied,
    onCopyEmail,
    onResetPassword,
    onToggleStatus,
    onLogoutAll,
    onDelete,
    formatDate
}: Props) => {
    function setActiveTab(arg0: string): void {
        throw new Error('Function not implemented.');
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
                {/* User Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <UserIcon className="h-5 w-5" />
                            User Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</p>
                                <p className="text-base dark:text-gray-200">{user.first_name || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</p>
                                <p className="text-base dark:text-gray-200">{user.last_name || 'Not set'}</p>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-base dark:text-gray-200">{user.email}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 dark:text-gray-400 dark:hover:text-white"
                                        onClick={onCopyEmail}
                                    >
                                        {emailCopied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </div>
                                {!user.email_verified_at && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Not verified
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-base dark:text-gray-200">{user.contact_number || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-base dark:text-gray-200">{user.username || 'Not set'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-base dark:text-gray-200">{user.position || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        {user.department && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                                    <div className="flex items-start gap-2 mt-1">
                                        <Building className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-base dark:text-gray-200">{user.department.name}</p>
                                            {user.department.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {user.department.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Role Information Card */}
                {user.role && (
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <Shield className="h-5 w-5" />
                                Role Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role Name</p>
                                <p className="text-lg font-semibold dark:text-gray-200 mt-1">{user.role.name}</p>
                            </div>
                            {user.role.description && (
                                <>
                                    <Separator className="dark:bg-gray-700" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                                        <p className="text-base text-gray-700 dark:text-gray-300 mt-1">{user.role.description}</p>
                                    </div>
                                </>
                            )}
                            <div className="pt-2">
                                <Link href={`/roles/${user.role.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        View Role Details
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity Preview */}
                {activityLogs.length > 0 && (
                    <Card className="dark:bg-gray-900">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <History className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Latest user actions
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab('activity')}
                                className="dark:text-gray-400 dark:hover:text-white"
                            >
                                View All
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activityLogs.slice(0, 3).map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between text-sm">
                                        <div className="truncate flex-1">
                                            <p className="font-medium dark:text-gray-200">{activity.description}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(activity.created_at, true)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                <ProfileSummaryCard user={user} />
                <SecurityScoreCard user={user} />
                <ActivityStatsCard user={user} stats={stats} />
                <QuickActionsCard
                    user={user}
                    onResetPassword={onResetPassword}
                    onToggleStatus={onToggleStatus}
                    onLogoutAll={onLogoutAll}
                    onDelete={onDelete}
                />
                <SystemInfoCard user={user} formatDate={formatDate} />
            </div>
        </div>
    );
};

import { ExternalLink } from 'lucide-react';