import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import {
    Shield,
    Users,
    Key,
    Calendar,
    Clock,
    Check,
    X,
    Edit,
    Copy,
    Trash2,
    ArrowLeft,
    MoreVertical,
    AlertTriangle,
    Lock,
    UserCheck,
    FileText,
    Eye,
    Save,
    Download,
    Printer,
    Mail,
    Link as LinkIcon,
    ChevronRight,
    Settings,
    Bell,
    Activity,
    User as UserIcon,
    Hash,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    module: string;
    description?: string;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    username: string;
    status: 'active' | 'inactive';
}

interface RolesShowProps {
    role: {
        id: number;
        name: string;
        description: string;
        is_system_role: boolean;
        created_at: string;
        updated_at: string;
        users_count?: number;
        permissions?: Permission[];
        recent_users?: RecentUser[];
    };
}

export default function RolesShow({ role }: RolesShowProps) {
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
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

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete role "${role.name}"? This action cannot be undone.`)) {
            router.delete(route('roles.destroy', role.id), {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit(route('roles.index'));
                },
                onError: (errors) => {
                    // Handle errors from controller
                    if (errors.error) {
                        alert(errors.error);
                    }
                },
            });
        }
    };

    const canDeleteRole = () => {
        return !role.is_system_role && (role.users_count || 0) === 0;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'bg-green-100 text-green-800 hover:bg-green-100',
            inactive: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
            pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        };
        return variants[status as keyof typeof variants] || variants.inactive;
    };

    // Group permissions by module
    const groupedPermissions = role.permissions?.reduce((groups, permission) => {
        const module = permission.module || 'General';
        if (!groups[module]) {
            groups[module] = [];
        }
        groups[module].push(permission);
        return groups;
    }, {} as Record<string, Permission[]>) || {};

    // Statistics based on actual data
    const statistics = [
        { 
            label: 'Total Users', 
            value: role.users_count || 0, 
            icon: Users,
            description: 'Users assigned to this role'
        },
        { 
            label: 'Permissions', 
            value: role.permissions?.length || 0, 
            icon: Key,
            description: 'Total permissions granted'
        },
        { 
            label: 'Active Users', 
            value: role.recent_users?.filter(u => u.status === 'active').length || 0, 
            icon: UserCheck,
            description: 'Currently active users'
        },
        { 
            label: 'System Role', 
            value: role.is_system_role ? 'Yes' : 'No', 
            icon: Shield,
            description: 'Predefined system role'
        },
    ];

    // System role warnings
    const systemWarnings = role.is_system_role ? [
        'System roles cannot be deleted',
        'Changes to system roles may affect system functionality',
    ] : [];

    const handleManagePermissions = () => {
        router.get(route('roles.permissions', role.id));
    };

    const handleExportDetails = () => {
        const data = {
            id: role.id,
            name: role.name,
            description: role.description,
            is_system_role: role.is_system_role,
            users_count: role.users_count,
            permissions: role.permissions?.map(p => ({
                id: p.id,
                name: p.name,
                display_name: p.display_name,
                module: p.module,
            })) || [],
            created_at: role.created_at,
            updated_at: role.updated_at,
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `role-${role.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <AdminLayout
            title={`Role: ${role.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Roles', href: route('roles.index') },
                { title: role.name, href: route('roles.show', role.id) }
            ]}
        >
            <Head title={`Role: ${role.name}`} />

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
                        <Link href={route('roles.index')}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{role.name}</h1>
                                <Badge 
                                    variant={role.is_system_role ? "default" : "outline"}
                                    className={role.is_system_role 
                                        ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                        : "bg-green-100 text-green-800 hover:bg-green-100"
                                    }
                                >
                                    {role.is_system_role ? 'System Role' : 'Custom Role'}
                                </Badge>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
                                Role ID: {role.id} • Created {formatTimeAgo(role.created_at)}
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
                                        onClick={() => handleCopyToClipboard(role.name, 'Role name')}
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="hidden sm:inline ml-2">Copy Name</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy role name to clipboard</TooltipContent>
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
                                {!role.is_system_role && (
                                    <DropdownMenuItem asChild>
                                        <Link href={route('roles.edit', role.id)} className="flex items-center cursor-pointer">
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit Role</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem 
                                    onClick={handleManagePermissions}
                                    className="flex items-center cursor-pointer"
                                >
                                    <Key className="mr-2 h-4 w-4" />
                                    <span>Manage Permissions</span>
                                </DropdownMenuItem>

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
                                        handleCopyToClipboard(url, 'Role URL');
                                    }}
                                    className="flex items-center cursor-pointer"
                                >
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    <span>Copy Link</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem 
                                    className={`flex items-center cursor-pointer ${
                                        canDeleteRole() 
                                            ? 'text-red-600 focus:text-red-700 focus:bg-red-50' 
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    onClick={canDeleteRole() ? handleDelete : undefined}
                                    disabled={!canDeleteRole()}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete Role</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {!role.is_system_role && (
                            <Link href={route('roles.edit', role.id)}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Role
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Warning for System Roles */}
                {systemWarnings.length > 0 && (
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>System Role Notice</AlertTitle>
                        <AlertDescription className="mt-2">
                            <ul className="list-disc list-inside space-y-1">
                                {systemWarnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Statistics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statistics.map((stat, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <stat.icon className="h-4 w-4" />
                                    {stat.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {stat.description}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid grid-cols-4 w-full max-w-md">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions ({role.permissions?.length || 0})</TabsTrigger>
                        <TabsTrigger value="users">Users ({role.users_count || 0})</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Role Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Role Information
                                    </CardTitle>
                                    <CardDescription>
                                        Complete details about this role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Role ID</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="font-mono text-sm">{role.id}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => handleCopyToClipboard(role.id.toString(), 'Role ID')}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Type</div>
                                            <div className="mt-1">
                                                <Badge 
                                                    variant={role.is_system_role ? "default" : "outline"}
                                                    className={role.is_system_role 
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-green-100 text-green-800"
                                                    }
                                                >
                                                    {role.is_system_role ? 'System Role' : 'Custom Role'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Description</div>
                                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[80px]">
                                            {role.description || (
                                                <span className="text-gray-400 italic">No description provided</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Created</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">{formatDate(role.created_at)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Last Updated</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">{formatTimeAgo(role.updated_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start h-10"
                                            onClick={handleManagePermissions}
                                            disabled={role.is_system_role}
                                        >
                                            <Key className="h-4 w-4 mr-2" />
                                            Manage Permissions
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start h-10"
                                            onClick={() => {
                                                router.get(route('users.index'), { role: role.id });
                                            }}
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Manage Users
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start h-10"
                                            onClick={handleExportDetails}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Export Details
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-start h-10"
                                            onClick={() => {
                                                router.get(route('roles.create'), {
                                                    duplicate: role.id,
                                                });
                                            }}
                                            disabled={role.is_system_role}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Duplicate Role
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permissions Summary Card */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Permissions Summary
                                    </CardTitle>
                                    <CardDescription>
                                        {role.permissions?.length || 0} permissions assigned to this role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {Object.keys(groupedPermissions).length > 0 ? (
                                        <div className="space-y-4">
                                            {Object.entries(groupedPermissions).slice(0, 3).map(([module, permissions]) => (
                                                <div key={module}>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {module} ({permissions.length})
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {permissions.slice(0, 5).map(permission => (
                                                            <TooltipProvider key={permission.id}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge variant="outline" className="text-xs cursor-help">
                                                                            {permission.display_name}
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="max-w-xs">
                                                                            <div className="font-medium">{permission.display_name}</div>
                                                                            <div className="text-xs text-gray-500">{permission.name}</div>
                                                                            {permission.description && (
                                                                                <div className="text-xs mt-1">{permission.description}</div>
                                                                            )}
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ))}
                                                        {permissions.length > 5 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{permissions.length - 5} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.keys(groupedPermissions).length > 3 && (
                                                <div className="pt-2">
                                                    <Button 
                                                        variant="link" 
                                                        className="p-0 h-auto"
                                                        onClick={() => setActiveTab('permissions')}
                                                    >
                                                        View all {Object.keys(groupedPermissions).length} permission modules
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Key className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">No permissions assigned</p>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="mt-3"
                                                onClick={handleManagePermissions}
                                                disabled={role.is_system_role}
                                            >
                                                Assign Permissions
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lock className="h-5 w-5" />
                                            Assigned Permissions
                                        </CardTitle>
                                        <CardDescription>
                                            {role.permissions?.length || 0} permissions across {Object.keys(groupedPermissions).length} modules
                                        </CardDescription>
                                    </div>
                                    <Button 
                                        size="sm"
                                        onClick={handleManagePermissions}
                                        disabled={role.is_system_role}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Manage Permissions
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(groupedPermissions).length > 0 ? (
                                    <div className="space-y-6">
                                        {Object.entries(groupedPermissions).map(([module, permissions]) => (
                                            <div key={module} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {module}
                                                    </h3>
                                                    <Badge variant="outline" className="text-sm">
                                                        {permissions.length} permissions
                                                    </Badge>
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                    {permissions.map(permission => (
                                                        <Card key={permission.id} className="overflow-hidden">
                                                            <CardHeader className="pb-2">
                                                                <CardTitle className="text-sm font-medium">
                                                                    {permission.display_name}
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="pb-3">
                                                                <div className="space-y-2">
                                                                    <code className="text-xs text-gray-500 block">
                                                                        {permission.name}
                                                                    </code>
                                                                    {permission.description && (
                                                                        <p className="text-xs text-gray-600">
                                                                            {permission.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                            <CardFooter className="pt-0">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2"
                                                                    onClick={() => handleCopyToClipboard(permission.name, 'Permission name')}
                                                                >
                                                                    <Copy className="h-3 w-3 mr-1" />
                                                                    Copy
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Key className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No permissions assigned
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                                            This role doesn't have any permissions assigned yet.
                                        </p>
                                        <Button 
                                            onClick={handleManagePermissions}
                                            disabled={role.is_system_role}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Assign Permissions
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Assigned Users
                                        </CardTitle>
                                        <CardDescription>
                                            {role.users_count || 0} users assigned to this role
                                        </CardDescription>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            router.get(route('users.index'), { role: role.id });
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View All Users
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {role.recent_users && role.recent_users.length > 0 ? (
                                    <div className="space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Username</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {role.recent_users.map(user => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback>
                                                                        {getInitials(user.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">{user.name}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        ID: {user.id}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>{user.username}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusBadge(user.status)}>
                                                                {user.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/users/${user.id}`}>
                                                                    <Button variant="ghost" size="sm" className="h-8">
                                                                        <Eye className="h-3 w-3" />
                                                                        <span className="sr-only">View</span>
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8"
                                                                    onClick={() => handleCopyToClipboard(user.email, 'User email')}
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                    <span className="sr-only">Copy email</span>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {role.users_count && role.users_count > (role.recent_users?.length || 0) && (
                                            <div className="text-center pt-4">
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => {
                                                        router.get(route('users.index'), { role: role.id });
                                                    }}
                                                >
                                                    View all {role.users_count} users
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No users assigned
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                                            No users have been assigned to this role yet.
                                        </p>
                                        <Button 
                                            variant="outline"
                                            onClick={() => {
                                                router.get(route('users.index'), { assign_role: role.id });
                                            }}
                                        >
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Assign Users
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Database Details
                                    </CardTitle>
                                    <CardDescription>
                                        Raw data from the database
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">ID</div>
                                                <div className="font-mono text-sm mt-1">{role.id}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">System Role</div>
                                                <div className="mt-1">
                                                    {role.is_system_role ? (
                                                        <Badge className="bg-purple-100 text-purple-800">
                                                            Yes
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                                            No
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Created At</div>
                                            <div className="font-mono text-sm mt-1">{role.created_at}</div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Updated At</div>
                                            <div className="font-mono text-sm mt-1">{role.updated_at}</div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleCopyToClipboard(JSON.stringify(role, null, 2), 'Role JSON data')}
                                            className="w-full"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy JSON Data
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Role Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Recent activities related to this role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">Role created</div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatTimeAgo(role.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                    <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">Permissions assigned</div>
                                                    <div className="text-xs text-gray-500">
                                                        {role.permissions?.length || 0} permissions granted
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {role.users_count && role.users_count > 0 && (
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">User assignments</div>
                                                        <div className="text-xs text-gray-500">
                                                            {role.users_count} users currently assigned
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-center pt-2">
                                            <Button variant="link" className="text-sm">
                                                View full activity log
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Danger Zone */}
                {!role.is_system_role && (
                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Irreversible actions for this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                                    <div className="flex-1">
                                        <div className="font-medium text-red-800 dark:text-red-300">
                                            Delete this role
                                        </div>
                                        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            Once deleted, this role cannot be recovered. Users assigned to this role will lose their role-based permissions.
                                        </div>
                                    </div>
                                    <Button 
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={!canDeleteRole()}
                                        className="whitespace-nowrap"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Role
                                        {!canDeleteRole() && role.users_count && role.users_count > 0 && (
                                            <span className="ml-2 text-xs">({role.users_count} users assigned)</span>
                                        )}
                                    </Button>
                                </div>

                                {role.users_count && role.users_count > 0 && (
                                    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Cannot Delete Role</AlertTitle>
                                        <AlertDescription>
                                            This role has {role.users_count} users assigned. You must reassign or remove all users before deleting this role.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}