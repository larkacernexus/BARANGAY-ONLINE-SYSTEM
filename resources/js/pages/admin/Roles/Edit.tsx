// resources/js/Pages/Admin/Roles/Edit.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import {
    ArrowLeft,
    Save,
    Shield,
    Users,
    Eye,
    Key,
    AlertCircle,
    RefreshCw,
    Check,
    X,
    Search,
    Copy,
    Plus,
    Minus,
    Lock,
    Unlock,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { route } from 'ziggy-js';
import { Role, Permission } from '@/types/admin/roles/roles';
import { formatDate, canDeleteRole } from '@/admin-utils/rolesUtils';

interface RoleEditProps {
    role: Role;
    permissions?: Record<string, Permission[]>;
    validation_errors?: Record<string, string>;
}

export default function RoleEdit({ role, permissions = {}, validation_errors }: RoleEditProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Safe access with fallbacks
    const usersCount = role.users_count ?? 0;
    const isSystemRole = role.is_system_role;
    const rolePermissionIds = role.permissions?.map(p => p.id) || [];

    // Flatten permissions for easier manipulation
    const allPermissions = useMemo(() => {
        return Object.values(permissions).flat();
    }, [permissions]);

    const { data, setData, errors, processing, reset } = useForm({
        name: role.name || '',
        description: role.description || '',
        is_system_role: isSystemRole,
        permissions: rolePermissionIds,
    });

    // Get available modules
    const modules = useMemo(() => {
        const permissionModules = Object.keys(permissions);
        return ['all', ...permissionModules.sort()];
    }, [permissions]);

    // Filter permissions based on search and module
    const filteredPermissions = useMemo(() => {
        return allPermissions.filter(permission => {
            const permissionName = permission.name?.toLowerCase() || '';
            const displayName = permission.display_name?.toLowerCase() || '';
            const module = permission.module || '';
            
            const matchesSearch = searchTerm === '' || 
                permissionName.includes(searchTerm.toLowerCase()) ||
                displayName.includes(searchTerm.toLowerCase());
            
            const matchesModule = selectedModule === 'all' || module === selectedModule;
            
            return matchesSearch && matchesModule;
        });
    }, [allPermissions, searchTerm, selectedModule]);

    // Group filtered permissions by module
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        
        filteredPermissions.forEach(permission => {
            const module = permission.module || 'Uncategorized';
            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push(permission);
        });
        
        return groups;
    }, [filteredPermissions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSystemRole) {
            return;
        }
        
        // Validate name format
        const nameRegex = /^[a-z_]+$/;
        if (!nameRegex.test(data.name)) {
            alert('Role name must contain only lowercase letters and underscores.');
            return;
        }
        
        setIsSubmitting(true);
        
        router.put(route('admin.roles.update', role.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handlePermissionToggle = (permissionId: number) => {
        if (isSystemRole) return;
        
        const newPermissions = data.permissions.includes(permissionId)
            ? data.permissions.filter(id => id !== permissionId)
            : [...data.permissions, permissionId];
        
        setData('permissions', newPermissions);
    };

    const handleSelectAll = (module?: string) => {
        if (isSystemRole) return;
        
        let permissionIdsToAdd: number[];
        
        if (module && groupedPermissions[module]) {
            permissionIdsToAdd = groupedPermissions[module]
                .filter(p => !data.permissions.includes(p.id))
                .map(p => p.id);
        } else {
            permissionIdsToAdd = filteredPermissions
                .filter(p => !data.permissions.includes(p.id))
                .map(p => p.id);
        }
        
        setData('permissions', [...data.permissions, ...permissionIdsToAdd]);
    };

    const handleDeselectAll = (module?: string) => {
        if (isSystemRole) return;
        
        let newPermissions = [...data.permissions];
        
        if (module && groupedPermissions[module]) {
            const modulePermissionIds = groupedPermissions[module].map(p => p.id);
            newPermissions = newPermissions.filter(id => !modulePermissionIds.includes(id));
        } else {
            newPermissions = [];
        }
        
        setData('permissions', newPermissions);
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    const handleReset = () => {
        reset();
        setSearchTerm('');
        setSelectedModule('all');
    };

    const isAllSelected = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissions = groupedPermissions[module];
            return modulePermissions.length > 0 && modulePermissions.every(p => data.permissions.includes(p.id));
        }
        return filteredPermissions.length > 0 && filteredPermissions.every(p => data.permissions.includes(p.id));
    };

    const isAnySelected = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissions = groupedPermissions[module];
            return modulePermissions.some(p => data.permissions.includes(p.id));
        }
        return filteredPermissions.some(p => data.permissions.includes(p.id));
    };

    const getSelectedCount = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissionIds = groupedPermissions[module].map(p => p.id);
            return data.permissions.filter(id => modulePermissionIds.includes(id)).length;
        }
        return data.permissions.length;
    };

    // Early return if role is not available
    if (!role) {
        return (
            <AdminLayout
                title="Role Not Found"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Roles', href: route('admin.roles.index') },
                    { title: 'Edit', href: '#' }
                ]}
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Role Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The role you're trying to edit doesn't exist or has been deleted.
                    </p>
                    <Button onClick={() => router.visit(route('admin.roles.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Roles
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title={`Edit Role: ${role.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Roles', href: route('admin.roles.index') },
                { title: role.name, href: route('admin.roles.show', role.id) },
                { title: 'Edit', href: '#' }
            ]}
        >
            <Head title={`Edit ${role.name}`} />

            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit(route('admin.roles.index'))}
                                    className="h-8 w-8 p-0"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">
                                        Edit Role
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                        Update role details and permissions
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(route('admin.roles.show', role.id))}
                                className="h-9"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={processing || isSystemRole}
                                className="h-9"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>

                    {/* System Role Warning */}
                    {isSystemRole && (
                        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-800 dark:text-amber-300">
                                This is a system role. System role name and description cannot be modified. Only permissions can be updated.
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Role Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <Shield className="h-5 w-5" />
                                            Role Details
                                        </CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Update the basic information for this role
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="name" className="flex items-center gap-2 dark:text-gray-300">
                                                    Role Name
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                                        (Technical name - used in code)
                                                    </span>
                                                </Label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(data.name, 'name')}
                                                            className="h-6 text-xs"
                                                        >
                                                            <Copy className="h-3 w-3 mr-1" />
                                                            {copiedField === 'name' ? 'Copied!' : 'Copy'}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Copy role name</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value.toLowerCase())}
                                                placeholder="e.g., admin"
                                                className={`font-mono ${errors.name ? 'border-red-500' : ''} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                                                disabled={processing || isSystemRole}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                            {isSystemRole && (
                                                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    System role name cannot be changed
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Use lowercase letters and underscores only
                                            </p>
                                        </div>

                                        {/* Description Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="dark:text-gray-300">
                                                Description
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                                                    (Optional)
                                                </span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Describe what this role can do..."
                                                className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                                                disabled={processing || isSystemRole}
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                            )}
                                        </div>

                                        {/* System Role Status (Read-only) */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                                            <div className="space-y-0.5">
                                                <Label className="text-base dark:text-gray-300">
                                                    System Role
                                                </Label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Special privileges, cannot be deleted
                                                </p>
                                            </div>
                                            <Badge variant={isSystemRole ? "default" : "outline"} 
                                                className={isSystemRole 
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                                                    : 'dark:border-gray-600 dark:text-gray-300'}>
                                                {isSystemRole ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>

                                        {/* Validation Errors */}
                                        {validation_errors && Object.keys(validation_errors).length > 0 && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {Object.entries(validation_errors).map(([field, error]) => (
                                                            <li key={field}>
                                                                <span className="font-medium">{field}:</span> {error}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Permissions Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 dark:text-white">
                                                    <Key className="h-5 w-5" />
                                                    Permissions
                                                </CardTitle>
                                                <CardDescription className="dark:text-gray-400">
                                                    Select the permissions assigned to this role
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                {data.permissions.length} selected
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Search and Filter */}
                                        <div className="space-y-4 mb-6">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <Input
                                                    placeholder="Search permissions..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                <div className="flex-1 w-full">
                                                    <select
                                                        value={selectedModule}
                                                        onChange={(e) => setSelectedModule(e.target.value)}
                                                        className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    >
                                                        {modules.map((module) => (
                                                            <option key={module} value={module}>
                                                                {module === 'all' ? 'All Modules' : module}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSelectAll()}
                                                        className="flex-1 sm:flex-none"
                                                        disabled={filteredPermissions.length === 0 || isSystemRole}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Select All
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeselectAll()}
                                                        className="flex-1 sm:flex-none"
                                                        disabled={data.permissions.length === 0 || isSystemRole}
                                                    >
                                                        <Minus className="h-3 w-3 mr-1" />
                                                        Clear All
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions List or Empty State */}
                                        {filteredPermissions.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Key className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                    No Permissions Found
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                    {searchTerm || selectedModule !== 'all' 
                                                        ? 'Try changing your search or filter criteria.'
                                                        : 'No permissions are available to assign.'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                                                    const selectedCount = getSelectedCount(module);
                                                    const allSelected = isAllSelected(module);
                                                    const anySelected = isAnySelected(module);
                                                    
                                                    return (
                                                        <div key={module} className="space-y-3">
                                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-medium dark:text-white">{module}</h3>
                                                                    <Badge variant="secondary" className="dark:bg-gray-800 dark:text-gray-300">
                                                                        {modulePermissions.length}
                                                                    </Badge>
                                                                    {selectedCount > 0 && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {selectedCount} selected
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleSelectAll(module)}
                                                                        disabled={allSelected || isSystemRole}
                                                                        className="h-7 text-xs"
                                                                    >
                                                                        Select All
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeselectAll(module)}
                                                                        disabled={!anySelected || isSystemRole}
                                                                        className="h-7 text-xs"
                                                                    >
                                                                        Clear
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {modulePermissions.map((permission) => (
                                                                    <div
                                                                        key={permission.id}
                                                                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                                                            data.permissions.includes(permission.id)
                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                                                        }`}
                                                                    >
                                                                        <Checkbox
                                                                            id={`permission-${permission.id}`}
                                                                            checked={data.permissions.includes(permission.id)}
                                                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                                            disabled={processing || isSystemRole}
                                                                            className="mt-1"
                                                                        />
                                                                        <Label
                                                                            htmlFor={`permission-${permission.id}`}
                                                                            className="flex-1 cursor-pointer"
                                                                        >
                                                                            <div className="font-medium dark:text-white">
                                                                                {permission.display_name}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">
                                                                                {permission.name}
                                                                            </div>
                                                                            {permission.description && (
                                                                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                                    {permission.description}
                                                                                </div>
                                                                            )}
                                                                        </Label>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`text-xs shrink-0 ${
                                                                                permission.is_active
                                                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                                                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                                            }`}
                                                                        >
                                                                            {permission.is_active ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Information & Actions */}
                            <div className="space-y-6">
                                {/* Role Preview */}
                                <Card className="dark:bg-gray-900 sticky top-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <Eye className="h-5 w-5" />
                                            Preview
                                        </CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            How this role will appear in the system
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                                    isSystemRole
                                                        ? 'bg-purple-100 dark:bg-purple-900/30'
                                                        : 'bg-green-100 dark:bg-green-900/30'
                                                }`}>
                                                    <Shield className={`h-5 w-5 ${
                                                        isSystemRole
                                                            ? 'text-purple-600 dark:text-purple-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <div className="font-medium font-mono dark:text-white">
                                                        {data.name || 'role.name'}
                                                    </div>
                                                    {data.description && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                            {data.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant={isSystemRole ? "outline" : "default"} 
                                                className={isSystemRole 
                                                    ? 'dark:border-gray-600 dark:text-gray-300' 
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}>
                                                {isSystemRole ? 'System' : 'Custom'}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Permissions</span>
                                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                    {data.permissions.length}
                                                </Badge>
                                            </div>
                                            {data.description && (
                                                <div>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                                                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                                                        {data.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Statistics Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <Users className="h-5 w-5" />
                                            Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">ID</span>
                                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded dark:text-gray-300">
                                                {role.id}
                                            </code>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Slug</span>
                                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded dark:text-gray-300">
                                                {role.slug}
                                            </code>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                                            <span className="text-sm dark:text-gray-300">{formatDate(role.created_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Updated</span>
                                            <span className="text-sm dark:text-gray-300">{formatDate(role.updated_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Users</span>
                                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                {usersCount}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            type="submit"
                                            disabled={processing || isSubmitting || isSystemRole}
                                            className="w-full"
                                        >
                                            {processing || isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.roles.index'))}
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.roles.show', role.id))}
                                            className="w-full"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Danger Zone */}
                                {!isSystemRole && canDeleteRole(role) && (
                                    <Card className="border-red-200 dark:border-red-900">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                <AlertCircle className="h-5 w-5" />
                                                Danger Zone
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to delete "${role.name}"? This action cannot be undone.`)) {
                                                        router.delete(route('admin.roles.destroy', role.id), {
                                                            preserveScroll: true,
                                                            onFinish: () => {
                                                                router.visit(route('admin.roles.index'));
                                                            },
                                                        });
                                                    }
                                                }}
                                                disabled={processing || usersCount > 0}
                                            >
                                                Delete Role
                                            </Button>
                                            {usersCount > 0 && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">
                                                    Cannot delete: {usersCount} user(s) assigned
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </TooltipProvider>
        </AdminLayout>
    );
}