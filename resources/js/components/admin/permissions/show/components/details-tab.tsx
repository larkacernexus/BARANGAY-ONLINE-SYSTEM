import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    Database,
    Clock,
    Key,
    Users,
    User as UserIcon,
    BookOpen,
    MessageCircle,
} from 'lucide-react';
import { Permission } from '@/types'; // Import your interface

interface Props {
    permission: Permission;
    rolesCount: number;
    usersCount: number;
    formatDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    onContactDeveloper: () => void; // Added missing prop
}

// Helper Label component for consistent styling
const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {children}
    </div>
);

// Row component to reduce repetition
const DataRow = ({ label, value, isMono = false }: { label: string, value: React.ReactNode, isMono?: boolean }) => (
    <div>
        <Label>{label}</Label>
        <div className={`mt-1 dark:text-gray-300 ${isMono ? 'font-mono text-sm' : 'font-medium'}`}>
            {value}
        </div>
    </div>
);

export const DetailsTab = ({ 
    permission, 
    rolesCount, 
    usersCount, 
    formatDate, 
    formatTimeAgo,
    onContactDeveloper 
}: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Database Details Card */}
            <Card className="dark:bg-gray-900 border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Database className="h-5 w-5 text-indigo-500" />
                        Database Details
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Raw data and system identifiers
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <DataRow label="ID" value={permission.id} isMono />
                        <div>
                            <Label>Active</Label>
                            <div className="mt-1">
                                <Badge variant={permission.is_active ? "default" : "secondary"}>
                                    {permission.is_active ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    <DataRow label="Name" value={permission.name} isMono />
                    
                    <Separator className="dark:bg-gray-700" />
                    <DataRow label="Display Name" value={permission.display_name} />
                    
                    <Separator className="dark:bg-gray-700" />
                    <DataRow label="Module" value={permission.module || 'System'} />
                    
                    <Separator className="dark:bg-gray-700" />
                    <DataRow 
                        label="Description" 
                        value={permission.description || <span className="text-gray-400 italic">No description provided</span>} 
                    />
                    
                    <Separator className="dark:bg-gray-700" />
                    <div className="grid grid-cols-2 gap-4">
                        <DataRow label="Created At" value={formatDate(permission.created_at)} isMono />
                        <DataRow label="Updated At" value={formatDate(permission.updated_at)} isMono />
                    </div>
                </CardContent>
            </Card>

            {/* Activity Timeline Card */}
            <Card className="dark:bg-gray-900 border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Clock className="h-5 w-5 text-purple-500" />
                        Activity Summary
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Assignment and usage statistics
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Timeline Item: Created */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                            <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold dark:text-gray-200">Permission Established</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Created {formatTimeAgo(permission.created_at)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Timeline Item: Roles */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold dark:text-gray-200">Role Assignment</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Linked to {rolesCount} role{rolesCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    
                    {/* Timeline Item: Users */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold dark:text-gray-200">User Reach</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {usersCount > 0 
                                    ? `Accessible by ${usersCount} user${usersCount !== 1 ? 's' : ''}`
                                    : 'No users currently assigned via roles'}
                            </p>
                        </div>
                    </div>

                    {/* Timeline Item: Updated */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold dark:text-gray-200">Last System Update</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Modified {formatTimeAgo(permission.updated_at)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Help Card - Full Width */}
            <Card className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/50 shadow-none">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Administrative Guidance</h4>
                                <p className="text-sm text-indigo-700/80 dark:text-indigo-400 mt-1 leading-relaxed">
                                    Permissions are core security components. Modifying display names or modules 
                                    is safe, but changing the <strong>system name</strong> may break application 
                                    logic. Contact IT Support for architectural changes.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onContactDeveloper}
                                className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                            >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact IT Support
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};