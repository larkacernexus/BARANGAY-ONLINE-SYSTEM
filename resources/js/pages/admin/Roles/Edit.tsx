import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { Role, Permission } from '@/types';
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
    Unlock
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

interface RoleEditProps {
    role: Role & {
        permissions?: Permission[];
        all_permissions?: Permission[];
    };
    available_permissions?: Permission[]; // Make optional
    validation_errors?: Record<string, string>;
}

export default function RoleEdit({ role, available_permissions = [], validation_errors }: RoleEditProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ensure role.permissions is always an array
    const rolePermissions = Array.isArray(role?.permissions) ? role.permissions : [];

    const { data, setData, errors, processing, put, reset } = useForm({
        name: role?.name || '',
        display_name: role?.display_name || '',
        description: role?.description || '',
        is_active: role?.is_active ?? true,
        is_system_role: role?.is_system_role ?? false,
        permission_ids: rolePermissions.map(p => p.id) || [],
    });

    // Safely get modules from available_permissions
    const modules = useMemo(() => {
        if (!Array.isArray(available_permissions)) {
            return ['all'];
        }
        const uniqueModules = [...new Set(available_permissions.map(p => p?.module).filter(Boolean))];
        return ['all', ...uniqueModules];
    }, [available_permissions]);

    // Filter permissions with null checks
    const filteredPermissions = useMemo(() => {
        if (!Array.isArray(available_permissions)) {
            return [];
        }
        
        return available_permissions.filter(permission => {
            if (!permission) return false;
            
            const permissionName = permission.name?.toLowerCase() || '';
            const displayName = permission.display_name?.toLowerCase() || '';
            const module = permission.module || '';
            
            const matchesSearch = searchTerm === '' || 
                permissionName.includes(searchTerm.toLowerCase()) ||
                displayName.includes(searchTerm.toLowerCase());
            
            const matchesModule = selectedModule === 'all' || module === selectedModule;
            
            return matchesSearch && matchesModule;
        });
    }, [available_permissions, searchTerm, selectedModule]);

    // Group permissions with null checks
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        
        filteredPermissions.forEach(permission => {
            if (!permission) return;
            
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
        setIsSubmitting(true);
        
        put(route('roles.update', role.id), {
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
        const newPermissionIds = data.permission_ids.includes(permissionId)
            ? data.permission_ids.filter(id => id !== permissionId)
            : [...data.permission_ids, permissionId];
        
        setData('permission_ids', newPermissionIds);
    };

    const handleSelectAll = (module?: string) => {
        let permissionIdsToAdd: number[];
        
        if (module && groupedPermissions[module]) {
            permissionIdsToAdd = groupedPermissions[module]
                .filter(p => p && !data.permission_ids.includes(p.id))
                .map(p => p.id);
        } else {
            permissionIdsToAdd = filteredPermissions
                .filter(p => p && !data.permission_ids.includes(p.id))
                .map(p => p.id);
        }
        
        setData('permission_ids', [...data.permission_ids, ...permissionIdsToAdd]);
    };

    const handleDeselectAll = (module?: string) => {
        let newPermissionIds = [...data.permission_ids];
        
        if (module && groupedPermissions[module]) {
            const modulePermissionIds = groupedPermissions[module].map(p => p.id);
            newPermissionIds = newPermissionIds.filter(id => !modulePermissionIds.includes(id));
        } else {
            newPermissionIds = [];
        }
        
        setData('permission_ids', newPermissionIds);
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

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isAllSelected = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissions = groupedPermissions[module];
            return modulePermissions.every(p => data.permission_ids.includes(p.id));
        }
        return filteredPermissions.every(p => data.permission_ids.includes(p.id));
    };

    const isAnySelected = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissions = groupedPermissions[module];
            return modulePermissions.some(p => data.permission_ids.includes(p.id));
        }
        return filteredPermissions.some(p => data.permission_ids.includes(p.id));
    };

    // Early return if role is not available
    if (!role) {
        return (
            <AdminLayout
                title="Role Not Found"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Roles', href: route('roles.index') },
                    { title: 'Edit', href: '#' }
                ]}
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Role Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The role you're trying to edit doesn't exist or has been deleted.
                    </p>
                    <Button onClick={() => router.visit(route('roles.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Roles
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    const roleName = role.display_name || role.name || 'Unknown Role';
    const roleId = role.id || 'N/A';

    return (
        <AdminLayout
            title={`Edit Role: ${roleName}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Roles', href: route('roles.index') },
                { title: roleName, href: route('roles.show', role.id) },
                { title: 'Edit', href: '#' }
            ]}
        >
            <Head title={`Edit ${roleName}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.visit(route('roles.index'))}
                                className="h-8 w-8 p-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Role</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                    Update role details and permissions
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('roles.show', role.id))}
                            className="h-9"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={processing}
                            className="h-9"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Role Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Role Details
                                    </CardTitle>
                                    <CardDescription>
                                        Update the basic information for this role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                Role Name
                                                <span className="text-xs text-gray-500 font-normal">
                                                    (Technical name - used in code)
                                                </span>
                                            </Label>
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
                                        </div>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., admin"
                                            className={`font-mono ${errors.name ? 'border-red-500' : ''}`}
                                            disabled={processing || role.is_system_role}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                        {role.is_system_role && (
                                            <p className="text-sm text-yellow-600 flex items-center gap-1">
                                                <Lock className="h-3 w-3" />
                                                System role name cannot be changed
                                            </p>
                                        )}
                                    </div>

                                    {/* Display Name Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="display_name">
                                                Display Name
                                                <span className="text-xs text-gray-500 font-normal ml-2">
                                                    (User-friendly name)
                                                </span>
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(data.display_name, 'display_name')}
                                                className="h-6 text-xs"
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                {copiedField === 'display_name' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <Input
                                            id="display_name"
                                            value={data.display_name}
                                            onChange={(e) => setData('display_name', e.target.value)}
                                            placeholder="e.g., Administrator"
                                            className={errors.display_name ? 'border-red-500' : ''}
                                            disabled={processing}
                                        />
                                        {errors.display_name && (
                                            <p className="text-sm text-red-600">{errors.display_name}</p>
                                        )}
                                    </div>

                                    {/* Description Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                            <span className="text-xs text-gray-500 font-normal ml-2">
                                                (Optional)
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe what this role can do..."
                                            className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                                            disabled={processing}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-base">
                                                Status
                                            </Label>
                                            <p className="text-sm text-gray-500">
                                                Enable or disable this role
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                            disabled={processing}
                                        />
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        Permissions
                                        <Badge variant="outline" className="ml-2">
                                            {data.permission_ids.length} selected
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Select the permissions assigned to this role
                                    </CardDescription>
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
                                                className="pl-10"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <select
                                                    value={selectedModule}
                                                    onChange={(e) => setSelectedModule(e.target.value)}
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                >
                                                    {modules.map((module) => (
                                                        <option key={module} value={module}>
                                                            {module === 'all' ? 'All Modules' : module}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSelectAll()}
                                                    className="h-8"
                                                    disabled={filteredPermissions.length === 0}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Select All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeselectAll()}
                                                    className="h-8"
                                                    disabled={data.permission_ids.length === 0}
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
                                            <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
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
                                            {Object.entries(groupedPermissions).map(([module, permissions]) => (
                                                <div key={module} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium">{module}</h3>
                                                            <Badge variant="secondary">
                                                                {permissions.length}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleSelectAll(module)}
                                                                disabled={isAllSelected(module)}
                                                                className="h-7 text-xs"
                                                            >
                                                                Select All
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeselectAll(module)}
                                                                disabled={!isAnySelected(module)}
                                                                className="h-7 text-xs"
                                                            >
                                                                Clear
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {permissions.map((permission) => (
                                                            <div
                                                                key={permission.id}
                                                                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                                                                    data.permission_ids.includes(permission.id)
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    id={`permission-${permission.id}`}
                                                                    checked={data.permission_ids.includes(permission.id)}
                                                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                                    disabled={processing}
                                                                />
                                                                <Label
                                                                    htmlFor={`permission-${permission.id}`}
                                                                    className="flex-1 cursor-pointer"
                                                                >
                                                                    <div className="font-medium">{permission.display_name || permission.name}</div>
                                                                    <div className="text-sm text-gray-500 font-mono truncate">
                                                                        {permission.name}
                                                                    </div>
                                                                    {permission.description && (
                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                            {permission.description}
                                                                        </div>
                                                                    )}
                                                                </Label>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs ${
                                                                        permission.is_active
                                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                                                    }`}
                                                                >
                                                                    {permission.is_active ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Information & Actions */}
                        <div className="space-y-6">
                            {/* Role Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Preview
                                    </CardTitle>
                                    <CardDescription>
                                        How this role will appear in the system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                                role.is_system_role
                                                    ? 'bg-purple-100 dark:bg-purple-900/30'
                                                    : 'bg-green-100 dark:bg-green-900/30'
                                            }`}>
                                                <Shield className={`h-5 w-5 ${
                                                    role.is_system_role
                                                        ? 'text-purple-600 dark:text-purple-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <div className="font-medium">{data.display_name || 'Display Name'}</div>
                                                <div className="text-sm text-gray-500 font-mono">
                                                    {data.name || 'role.name'}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={data.is_active ? "default" : "secondary"}>
                                            {data.is_active ? (
                                                <Check className="mr-1 h-3 w-3" />
                                            ) : (
                                                <X className="mr-1 h-3 w-3" />
                                            )}
                                            {data.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Type</span>
                                            <Badge variant={role.is_system_role ? "outline" : "default"}>
                                                {role.is_system_role ? 'System' : 'Custom'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Permissions</span>
                                            <Badge variant="outline">{data.permission_ids.length}</Badge>
                                        </div>
                                        {data.description && (
                                            <div>
                                                <span className="text-sm text-gray-500">Description</span>
                                                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                                                    {data.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Role Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">ID</span>
                                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {roleId}
                                        </code>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Created</span>
                                        <span className="text-sm">{formatDate(role.created_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Updated</span>
                                        <span className="text-sm">{formatDate(role.updated_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Users</span>
                                        <Badge variant="outline">{role.users_count || 0}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || isSubmitting}
                                        className="w-full"
                                    >
                                        {processing || isSubmitting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
                                        onClick={() => router.visit(route('roles.index'))}
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('roles.show', role.id))}
                                        className="w-full"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            {!role.is_system_role && (
                                <Card className="border-red-200 dark:border-red-800">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            Danger Zone
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete "${roleName}"? This action cannot be undone.`)) {
                                                    router.delete(route('roles.destroy', role.id), {
                                                        preserveScroll: true,
                                                        onFinish: () => {
                                                            router.visit(route('roles.index'));
                                                        },
                                                    });
                                                }
                                            }}
                                            disabled={processing || (role.users_count || 0) > 0}
                                        >
                                            Delete Role
                                        </Button>
                                        {(role.users_count || 0) > 0 && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                                Cannot delete: {role.users_count} user(s) assigned
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}