// resources/js/Pages/Admin/Roles/components/details-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Activity,
    Shield,
    Key,
    Users,
    Copy,
} from 'lucide-react';
import { Role } from '../types';

// Helper Label component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}>
            {children}
        </div>
    );
}

interface Props {
    role: Role;
    onCopyToClipboard: (text: string, label: string) => void;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
}

export const DetailsTab = ({ role, onCopyToClipboard, formatDateTime, formatTimeAgo }: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Database Details Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FileText className="h-5 w-5" />
                        Database Details
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Raw data from the database
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</Label>
                                <div className="font-mono text-sm mt-1 dark:text-gray-300">{role.id}</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">System Role</Label>
                                <div className="mt-1">
                                    {role.is_system_role ? (
                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                            Yes
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                                            No
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</Label>
                            <div className="font-medium mt-1 dark:text-gray-300">{role.name}</div>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                            <div className="mt-1 dark:text-gray-300">{role.description || 'No description'}</div>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</Label>
                            <div className="font-mono text-sm mt-1 dark:text-gray-300">{role.created_at}</div>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        <div>
                            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</Label>
                            <div className="font-mono text-sm mt-1 dark:text-gray-300">{role.updated_at}</div>
                        </div>
                        
                        <Separator className="dark:bg-gray-700" />
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onCopyToClipboard(JSON.stringify(role, null, 2), 'Role JSON data')}
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy JSON Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Role Activity Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Activity className="h-5 w-5" />
                        Role Activity
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Recent activities related to this role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium dark:text-gray-200">Role created</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTimeAgo(role.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium dark:text-gray-200">Permissions assigned</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {role.permissions?.length || 0} permissions granted
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {role.users_count && role.users_count > 0 && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium dark:text-gray-200">User assignments</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {role.users_count} users currently assigned
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-center pt-2">
                            <Button variant="link" className="text-sm dark:text-blue-400">
                                View full activity log
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};