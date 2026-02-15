import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import {
    Shield,
    Key,
    Users,
    Calendar,
    Clock,
    User,
    Copy,
    Trash2,
    ArrowLeft,
    MoreVertical,
    AlertTriangle,
    Check,
    Edit,
    Mail,
    FileText,
    Eye,
    Download,
    Printer,
    ChevronRight,
    Settings,
    RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RolePermissionShowProps {
    role_permission: {
        id: number;
        role_id: number;
        permission_id: number;
        granted_by: number;
        granted_at: string;
        role: {
            id: number;
            name: string;
            description?: string;
            is_system_role: boolean;
            users_count?: number;
            created_at: string;
            updated_at: string;
        };
        permission: {
            id: number;
            name: string;
            display_name: string;
            module: string;
            description?: string;
            is_active: boolean;
            created_at: string;
            updated_at: string;
        };
        granter: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
            role?: string;
        };
        notes?: string;
    };
}

export default function RolePermissionShow({ role_permission }: RolePermissionShowProps) {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [showRevokeDialog, setShowRevokeDialog] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return formatDate(dateString);
    };

    const handleCopyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${label} copied to clipboard!`);
            setTimeout(() => setCopySuccess(null), 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleRevoke = () => {
        setShowRevokeDialog(true);
    };

    const confirmRevoke = () => {
        setIsRevoking(true);
        router.delete(route('role-permissions.destroy', role_permission.id), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('role-permissions.index'));
            },
            onError: () => {
                setIsRevoking(false);
            },
        });
    };

    const handleExportDetails = () => {
        const data = {
            assignment_id: role_permission.id,
            role: role_permission.role,
            permission: role_permission.permission,
            granter: role_permission.granter,
            granted_at: role_permission.granted_at,
            notes: role_permission.notes,
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `permission-assignment-${role_permission.id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AdminLayout
            title={`Permission Assignment #${role_permission.id}`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Role Permissions', href: route('role-permissions.index') },
                { title: `Assignment #${role_permission.id}`, href: route('role-permissions.show', role_permission.id) }
            ]}
        >
            <Head title={`Permission Assignment #${role_permission.id}`} />

            {/* Success Alert */}
            {copySuccess && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>{copySuccess}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                {/* Header with Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('role-permissions.index')}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Permission Assignment
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
                                ID: {role_permission.id} • Assigned {formatTimeAgo(role_permission.granted_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleCopyToClipboard(
                                            `${role_permission.role.name} - ${role_permission.permission.display_name}`,
                                            'Assignment details'
                                        )}
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="hidden sm:inline ml-2">Copy Details</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy assignment details</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">More</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                    onClick={() => window.print()}
                                    className="flex items-center cursor-pointer"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    <span>Print Details</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                    onClick={handleExportDetails}
                                    className="flex items-center cursor-pointer"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Export as JSON</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                    onClick={() => {
                                        const url = window.location.href;
                                        handleCopyToClipboard(url, 'Assignment URL');
                                    }}
                                    className="flex items-center cursor-pointer"
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>Copy Link</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem 
                                    className="flex items-center cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                    onClick={handleRevoke}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Revoke Permission</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid grid-cols-4 w-full max-w-md">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="role">Role Details</TabsTrigger>
                        <TabsTrigger value="permission">Permission Details</TabsTrigger>
                        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Assignment Details Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        Assignment Details
                                    </CardTitle>
                                    <CardDescription>
                                        Information about this permission assignment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Assignment ID</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="font-mono text-sm">{role_permission.id}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => handleCopyToClipboard(role_permission.id.toString(), 'Assignment ID')}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Granted</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">{formatTimeAgo(role_permission.granted_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {role_permission.notes && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Notes</div>
                                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[60px]">
                                                <p className="text-sm">{role_permission.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <div className="text-sm font-medium text-gray-500 mb-2">Quick Links</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link href={route('roles.show', role_permission.role.id)}>
                                                <Button variant="outline" className="w-full justify-start h-10">
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    View Role
                                                </Button>
                                            </Link>
                                            <Link href={route('roles.permissions', role_permission.role.id)}>
                                                <Button variant="outline" className="w-full justify-start h-10">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Role Permissions
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Granter Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Granted By
                                    </CardTitle>
                                    <CardDescription>
                                        User who assigned this permission
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        <Avatar className="h-12 w-12">
                                            {role_permission.granter.avatar ? (
                                                <AvatarImage src={role_permission.granter.avatar} alt={role_permission.granter.name} />
                                            ) : null}
                                            <AvatarFallback>
                                                {getInitials(role_permission.granter.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium">{role_permission.granter.name}</div>
                                            <div className="text-sm text-gray-500">{role_permission.granter.email}</div>
                                            {role_permission.granter.role && (
                                                <Badge variant="outline" className="mt-1 text-xs">
                                                    {role_permission.granter.role}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => handleCopyToClipboard(role_permission.granter.email, 'Granter email')}
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Copy Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                // This would link to user profile if implemented
                                                toast.info('User profile view not implemented');
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Profile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Card */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <Shield className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">Role</div>
                                                    <div className="text-lg font-semibold">{role_permission.role.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {role_permission.role.is_system_role ? 'System Role' : 'Custom Role'}
                                                        {role_permission.role.users_count && ` • ${role_permission.role.users_count} users`}
                                                    </div>
                                                </div>
                                            </div>
                                            {role_permission.role.description && (
                                                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                                    {role_permission.role.description}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Key className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">Permission</div>
                                                    <div className="text-lg font-semibold">{role_permission.permission.display_name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        <code>{role_permission.permission.name}</code>
                                                        <Badge variant="outline" className="ml-2">
                                                            {role_permission.permission.module}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            {role_permission.permission.description && (
                                                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                                    {role_permission.permission.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Role Details Tab */}
                    <TabsContent value="role">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Role Information
                                </CardTitle>
                                <CardDescription>
                                    Complete details about the role in this assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Role Name</div>
                                                <div className="text-lg font-semibold mt-1">{role_permission.role.name}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Role Type</div>
                                                <div className="mt-1">
                                                    <Badge 
                                                        variant={role_permission.role.is_system_role ? "default" : "outline"}
                                                        className={role_permission.role.is_system_role 
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-green-100 text-green-800"
                                                        }
                                                    >
                                                        {role_permission.role.is_system_role ? 'System Role' : 'Custom Role'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Description</div>
                                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                    {role_permission.role.description || (
                                                        <span className="text-gray-400 italic">No description provided</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Role ID</div>
                                                <div className="font-mono text-sm mt-1">{role_permission.role.id}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Created</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">{formatDate(role_permission.role.created_at)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Last Updated</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">{formatTimeAgo(role_permission.role.updated_at)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Users Count</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-lg font-semibold">{role_permission.role.users_count || 0}</span>
                                                    <span className="text-sm text-gray-500">users assigned</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex gap-3">
                                        <Link href={route('roles.show', role_permission.role.id)}>
                                            <Button>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Full Role Details
                                            </Button>
                                        </Link>
                                        <Link href={route('roles.permissions', role_permission.role.id)}>
                                            <Button variant="outline">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Manage Role Permissions
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Permission Details Tab */}
                    <TabsContent value="permission">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Permission Information
                                </CardTitle>
                                <CardDescription>
                                    Complete details about the permission in this assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Display Name</div>
                                                <div className="text-lg font-semibold mt-1">{role_permission.permission.display_name}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Technical Name</div>
                                                <div className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded">
                                                    {role_permission.permission.name}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Description</div>
                                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                    {role_permission.permission.description || (
                                                        <span className="text-gray-400 italic">No description provided</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Module</div>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className="text-lg">
                                                        {role_permission.permission.module}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Permission ID</div>
                                                <div className="font-mono text-sm mt-1">{role_permission.permission.id}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Status</div>
                                                <div className="mt-1">
                                                    <Badge 
                                                        variant={role_permission.permission.is_active ? "default" : "outline"}
                                                        className={role_permission.permission.is_active 
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }
                                                    >
                                                        {role_permission.permission.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Created</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">{formatDate(role_permission.permission.created_at)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Last Updated</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">{formatTimeAgo(role_permission.permission.updated_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleCopyToClipboard(role_permission.permission.name, 'Permission name')}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Permission Name
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                router.get(route('permissions.show', role_permission.permission.id));
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Permission Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audit Trail Tab */}
                    <TabsContent value="audit">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Audit Trail
                                </CardTitle>
                                <CardDescription>
                                    History and activity log for this permission assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Permission Assigned</div>
                                                    <div className="text-sm text-gray-500">
                                                        Grant event recorded in system
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{formatDate(role_permission.granted_at)}</div>
                                                <div className="text-xs text-gray-500">{formatTimeAgo(role_permission.granted_at)}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Grant Details</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500">Granted By:</span>
                                                            <span className="font-medium">{role_permission.granter.name}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500">Grant Method:</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                Manual Assignment
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500">Granter Role:</span>
                                                            <span className="text-sm">{role_permission.granter.role || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">System Information</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500">Assignment ID:</span>
                                                            <code className="text-xs">{role_permission.id}</code>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500">Created Timestamp:</span>
                                                            <span className="text-xs text-gray-500">{role_permission.granted_at}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500">Status:</span>
                                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                                Active
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {role_permission.notes && (
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Assignment Notes</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="p-3 bg-gray-50 rounded">
                                                        <p className="text-sm whitespace-pre-wrap">{role_permission.notes}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="text-center">
                                        <Button variant="outline" onClick={() => window.print()}>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print Audit Trail
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Danger Zone */}
                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions for this permission assignment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                            <div className="flex-1">
                                <div className="font-medium text-red-800 dark:text-red-300">
                                    Revoke this permission
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    Once revoked, the role will lose this permission. Users with this role may lose access to certain features.
                                </div>
                            </div>
                            <Button 
                                variant="destructive"
                                onClick={handleRevoke}
                                disabled={isRevoking}
                            >
                                {isRevoking ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Revoking...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Revoke Permission
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revoke Permission Dialog */}
            <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Permission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to revoke this permission assignment?
                            <br /><br />
                            <strong>{role_permission.role.name}</strong> will lose the permission:
                            <br />
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                                {role_permission.permission.name}
                            </code>
                            <br />
                            <span className="text-sm text-gray-600">
                                ({role_permission.permission.display_name})
                            </span>
                            <br /><br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRevoke}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isRevoking}
                        >
                            {isRevoking ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Revoking...
                                </>
                            ) : (
                                'Revoke Permission'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}