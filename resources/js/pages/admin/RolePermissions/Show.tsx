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
import { route } from 'ziggy-js';
import { toast } from '@/hooks/use-toast';

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
            avatar?: string | null;
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

    // Add null check for role_permission
    if (!role_permission) {
        return (
            <AdminLayout title="Permission Assignment">
                <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
                    <Alert className="w-96 dark:bg-gray-900 dark:border-gray-700">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Permission assignment data not found.</AlertDescription>
                    </Alert>
                </div>
            </AdminLayout>
        );
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
            
            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
            return formatDate(dateString);
        } catch {
            return 'Invalid date';
        }
    };

    const handleCopyToClipboard = async (text: string, label: string) => {
        if (!text) return;
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
                router.visit(route('admin.role-permissions.index'));
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
            notes: role_permission.notes || null,
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
        if (!name) return '??';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Safe access helpers
    const granter = role_permission.granter || {
        id: 0,
        name: 'Unknown',
        email: '',
        avatar: null,
        role: 'Unknown'
    };

    const role = role_permission.role || {
        id: 0,
        name: 'Unknown',
        is_system_role: false,
        created_at: '',
        updated_at: ''
    };

    const permission = role_permission.permission || {
        id: 0,
        name: 'unknown',
        display_name: 'Unknown',
        module: 'unknown',
        is_active: false,
        created_at: '',
        updated_at: ''
    };

    return (
        <AdminLayout
            title={`Permission Assignment #${role_permission.id}`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Role Permissions', href: route('admin.role-permissions.index') },
                { title: `Assignment #${role_permission.id}`, href: route('admin.role-permissions.show', role_permission.id) }
            ]}
        >
            <Head title={`Permission Assignment #${role_permission.id}`} />

            <div className="space-y-6 dark:bg-gray-900 min-h-screen p-6">
                {/* Success Alert */}
                {copySuccess && (
                    <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                        <Check className="h-4 w-4" />
                        <AlertTitle className="dark:text-green-300">Success!</AlertTitle>
                        <AlertDescription className="dark:text-green-400">{copySuccess}</AlertDescription>
                    </Alert>
                )}

                {/* Header with Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('admin.role-permissions.index')}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:hover:bg-gray-700">
                                <ArrowLeft className="h-4 w-4 dark:text-gray-300" />
                                <span className="sr-only">Back</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">
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
                                            `${role.name} - ${permission.display_name}`,
                                            'Assignment details'
                                        )}
                                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="hidden sm:inline ml-2">Copy Details</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                    Copy assignment details
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">More</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                <DropdownMenuItem 
                                    onClick={() => window.print()}
                                    className="flex items-center cursor-pointer dark:text-white dark:focus:bg-gray-700"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    <span>Print Details</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                    onClick={handleExportDetails}
                                    className="flex items-center cursor-pointer dark:text-white dark:focus:bg-gray-700"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Export as JSON</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                    onClick={() => {
                                        const url = window.location.href;
                                        handleCopyToClipboard(url, 'Assignment URL');
                                    }}
                                    className="flex items-center cursor-pointer dark:text-white dark:focus:bg-gray-700"
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>Copy Link</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="dark:bg-gray-700" />

                                <DropdownMenuItem 
                                    className="flex items-center cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-900/20"
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
                    <TabsList className="grid grid-cols-4 w-full max-w-md dark:bg-gray-900">
                        <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-900 dark:text-gray-400 dark:data-[state=active]:text-white">Overview</TabsTrigger>
                        <TabsTrigger value="role" className="dark:data-[state=active]:bg-gray-900 dark:text-gray-400 dark:data-[state=active]:text-white">Role Details</TabsTrigger>
                        <TabsTrigger value="permission" className="dark:data-[state=active]:bg-gray-900 dark:text-gray-400 dark:data-[state=active]:text-white">Permission Details</TabsTrigger>
                        <TabsTrigger value="audit" className="dark:data-[state=active]:bg-gray-900 dark:text-gray-400 dark:data-[state=active]:text-white">Audit Trail</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Assignment Details Card */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Key className="h-5 w-5 dark:text-gray-300" />
                                        Assignment Details
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Information about this permission assignment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignment ID</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="font-mono text-sm dark:text-white">{role_permission.id}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 dark:hover:bg-gray-700"
                                                    onClick={() => handleCopyToClipboard(role_permission.id.toString(), 'Assignment ID')}
                                                >
                                                    <Copy className="h-3 w-3 dark:text-gray-400" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Granted</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span className="text-sm dark:text-white">{formatTimeAgo(role_permission.granted_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {role_permission.notes && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</div>
                                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 rounded-md min-h-[60px]">
                                                <p className="text-sm dark:text-gray-300">{role_permission.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Quick Links</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link href={route('admin.roles.show', role.id)}>
                                                <Button variant="outline" className="w-full justify-start h-10 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    View Role
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.roles.permissions', role.id)}>
                                                <Button variant="outline" className="w-full justify-start h-10 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Role Permissions
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Granter Information Card */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <User className="h-5 w-5 dark:text-gray-300" />
                                        Granted By
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        User who assigned this permission
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 rounded-md">
                                        <Avatar className="h-12 w-12 dark:border-gray-700">
                                            {granter.avatar && (
                                                <AvatarImage src={granter.avatar} alt={granter.name} />
                                            )}
                                            <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                                                {getInitials(granter.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium dark:text-white">{granter.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{granter.email || 'No email'}</div>
                                            {granter.role && (
                                                <Badge variant="outline" className="mt-1 text-xs dark:border-gray-600 dark:text-gray-300">
                                                    {granter.role}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            onClick={() => granter.email && handleCopyToClipboard(granter.email, 'Granter email')}
                                            disabled={!granter.email}
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Copy Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            onClick={() => {
                                                toast({
                                                    title: "Info",
                                                    description: "User profile view not implemented",
                                                });
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Profile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Card */}
                            <Card className="md:col-span-2 dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <FileText className="h-5 w-5 dark:text-gray-300" />
                                        Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-700">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium dark:text-white">Role</div>
                                                    <div className="text-lg font-semibold dark:text-white">{role.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {role.is_system_role ? 'System Role' : 'Custom Role'}
                                                        {role.users_count && ` • ${role.users_count} users`}
                                                    </div>
                                                </div>
                                            </div>
                                            {role.description && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                                                    {role.description}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-700">
                                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                    <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium dark:text-white">Permission</div>
                                                    <div className="text-lg font-semibold dark:text-white">{permission.display_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        <code className="dark:text-gray-400">{permission.name}</code>
                                                        <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-300">
                                                            {permission.module}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            {permission.description && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                                                    {permission.description}
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
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Shield className="h-5 w-5 dark:text-gray-300" />
                                    Role Information
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Complete details about the role in this assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Role Name</div>
                                                <div className="text-lg font-semibold mt-1 dark:text-white">{role.name}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Role Type</div>
                                                <div className="mt-1">
                                                    <Badge 
                                                        variant={role.is_system_role ? "default" : "outline"}
                                                        className={role.is_system_role 
                                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800"
                                                            : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800"
                                                        }
                                                    >
                                                        {role.is_system_role ? 'System Role' : 'Custom Role'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</div>
                                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                                    {role.description || (
                                                        <span className="text-gray-400 dark:text-gray-600 italic">No description provided</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Role ID</div>
                                                <div className="font-mono text-sm mt-1 dark:text-white">{role.id}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-sm dark:text-white">{formatDate(role.created_at)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-sm dark:text-white">{formatTimeAgo(role.updated_at)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Users Count</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-lg font-semibold dark:text-white">{role.users_count || 0}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">users assigned</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="dark:bg-gray-700" />

                                    <div className="flex gap-3">
                                        <Link href={route('admin.roles.show', role.id)}>
                                            <Button className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Full Role Details
                                            </Button>
                                        </Link>
                                        <Link href={route('admin.roles.permissions', role.id)}>
                                            <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
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
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <Key className="h-5 w-5 dark:text-gray-300" />
                                    Permission Information
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Complete details about the permission in this assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</div>
                                                <div className="text-lg font-semibold mt-1 dark:text-white">{permission.display_name}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Technical Name</div>
                                                <div className="font-mono text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-900/50 dark:text-gray-300 rounded">
                                                    {permission.name}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</div>
                                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                                    {permission.description || (
                                                        <span className="text-gray-400 dark:text-gray-600 italic">No description provided</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Module</div>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className="text-lg dark:border-gray-600 dark:text-gray-300">
                                                        {permission.module}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Permission ID</div>
                                                <div className="font-mono text-sm mt-1 dark:text-white">{permission.id}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
                                                <div className="mt-1">
                                                    <Badge 
                                                        variant={permission.is_active ? "default" : "outline"}
                                                        className={permission.is_active 
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700"
                                                        }
                                                    >
                                                        {permission.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-sm dark:text-white">{formatDate(permission.created_at)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-sm dark:text-white">{formatTimeAgo(permission.updated_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="dark:bg-gray-700" />

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleCopyToClipboard(permission.name, 'Permission name')}
                                            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Permission Name
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                router.get(route('permissions.show', permission.id));
                                            }}
                                            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                        <Card className="dark:bg-gray-900 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                    <FileText className="h-5 w-5 dark:text-gray-300" />
                                    Audit Trail
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    History and activity log for this permission assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                    <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium dark:text-white">Permission Assigned</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Grant event recorded in system
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium dark:text-white">{formatDate(role_permission.granted_at)}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(role_permission.granted_at)}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm dark:text-white">Grant Details</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Granted By:</span>
                                                            <span className="font-medium dark:text-white">{granter.name}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Grant Method:</span>
                                                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                                Manual Assignment
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Granter Role:</span>
                                                            <span className="text-sm dark:text-white">{granter.role || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm dark:text-white">System Information</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Assignment ID:</span>
                                                            <code className="text-xs dark:text-gray-300">{role_permission.id}</code>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Created Timestamp:</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{role_permission.granted_at}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                                                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">
                                                                Active
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {role_permission.notes && (
                                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm dark:text-white">Assignment Notes</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                                                        <p className="text-sm whitespace-pre-wrap dark:text-gray-300">{role_permission.notes}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    <Separator className="dark:bg-gray-700" />

                                    <div className="text-center">
                                        <Button variant="outline" onClick={() => window.print()} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
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
                <Card className="border-red-200 dark:border-red-800 dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
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
                                className="dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
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
                <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">Revoke Permission</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to revoke this permission assignment?
                            <br /><br />
                            <strong className="dark:text-white">{role.name}</strong> will lose the permission:
                            <br />
                            <code className="text-sm bg-gray-100 dark:bg-gray-900 dark:text-gray-300 px-2 py-1 rounded mt-2 inline-block">
                                {permission.name}
                            </code>
                            <br />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                ({permission.display_name})
                            </span>
                            <br /><br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRevoking} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:bg-gray-900">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRevoke}
                            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-900 dark:hover:bg-red-800"
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