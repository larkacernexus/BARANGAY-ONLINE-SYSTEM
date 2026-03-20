// resources/js/Pages/Admin/Positions/components/details-tab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Shield,
    Copy,
    Key,
    BarChart3,
    Zap,
    UserPlus,
    XCircle,
    CheckCircle,
    Info,
    Target,
    Users,
    Calendar,
    Hash,
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { Position } from '../types';
import { formatShortDate } from '../utils/helpers';

// Helper Label component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}>
            {children}
        </div>
    );
}

interface Props {
    position: Position;
    copied: boolean;
    onCopyCode: () => void;
    formatDateTime: (date: string) => string;
}

export const DetailsTab = ({ position, copied, onCopyCode, formatDateTime }: Props) => {
    const getPrimaryCommittee = () => {
        return position.committee;
    };

    const getAdditionalCommittees = () => {
        if (!position.all_committees || !position.additional_committees) return [];
        return position.all_committees.filter(c => 
            position.additional_committees.includes(c.id)
        );
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
                {/* Position Details Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Shield className="h-5 w-5" />
                            Position Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Code Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Position Code</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCopyCode}
                                    className="h-6 text-xs dark:text-gray-400 dark:hover:text-white"
                                >
                                    {copied ? 'Copied!' : <Copy className="h-3 w-3 mr-1" />}
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <code className="font-mono text-sm flex-1 dark:text-gray-300">{position.code}</code>
                            </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        {/* Description Section */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                            {position.description ? (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{position.description}</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-500 dark:text-gray-400 italic">
                                    No description provided
                                </div>
                            )}
                        </div>

                        {/* System Role */}
                        {position.role && (
                            <>
                                <Separator className="dark:bg-gray-700" />
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">System Role</Label>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium dark:text-gray-200">{position.role.name}</p>
                                                {position.role.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{position.role.description}</p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                <Key className="h-3 w-3 mr-1" />
                                                System Role
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                {/* Quick Stats Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <BarChart3 className="h-5 w-5" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Officials</span>
                            <span className="font-bold text-lg dark:text-gray-200">{position.officials_count || 0}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Display Order</span>
                            <span className="font-bold text-lg dark:text-gray-200">{position.order}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Committees</span>
                            <span className="font-bold text-lg dark:text-gray-200">
                                {(position.committee ? 1 : 0) + (position.additional_committees?.length || 0)}
                            </span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Account Required</span>
                            <span className={`font-bold text-lg ${position.requires_account ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {position.requires_account ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                            <span className={`font-bold text-lg ${position.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {position.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Zap className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href={`/admin/officials/create?position_id=${position.id}`}>
                            <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign Official
                            </Button>
                        </Link>
                        
                        <Button
                            variant="outline"
                            className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                            onClick={onCopyCode}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Position Code
                        </Button>

                        <Separator className="dark:bg-gray-700" />

                        {position.is_active ? (
                            <Button
                                variant="outline"
                                className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/50"
                                onClick={() => {
                                    if (confirm('Set this position as inactive? It will not appear in selection lists.')) {
                                        router.put(`/admin/positions/${position.id}`, {
                                            is_active: false,
                                        });
                                    }
                                }}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate Position
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/50"
                                onClick={() => {
                                    if (confirm('Set this position as active?')) {
                                        router.put(`/admin/positions/${position.id}`, {
                                            is_active: true,
                                        });
                                    }
                                }}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate Position
                            </Button>
                        )}

                        {position.requires_account ? (
                            <Button
                                variant="outline"
                                className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/50"
                                onClick={() => {
                                    if (confirm('Remove account requirement? Officials won\'t need user accounts.')) {
                                        router.put(`/admin/positions/${position.id}`, {
                                            requires_account: false,
                                        });
                                    }
                                }}
                            >
                                <Key className="h-4 w-4 mr-2" />
                                Remove Account Requirement
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/50"
                                onClick={() => {
                                    if (confirm('Add account requirement? Officials will need user accounts.')) {
                                        router.put(`/admin/positions/${position.id}`, {
                                            requires_account: true,
                                        });
                                    }
                                }}
                            >
                                <Key className="h-4 w-4 mr-2" />
                                Require Account
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* System Information Card */}
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium dark:text-gray-100 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            System Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Created</span>
                            <span className="dark:text-gray-300">{formatDateTime(position.created_at)}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                            <span className="dark:text-gray-300">{formatDateTime(position.updated_at)}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">ID</span>
                            <code className="text-xs dark:text-gray-300">#{position.id}</code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};