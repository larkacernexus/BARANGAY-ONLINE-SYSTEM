import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { Permission } from '@/types';
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
    PlusCircle,
    Edit,
    FileEdit
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

interface RoleCreateProps {
    available_permissions?: Permission[];
    validation_errors?: Record<string, string>;
    modules?: string[];
}

export default function RoleCreate({ available_permissions = [], validation_errors, modules = [] }: RoleCreateProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSystemRoleWarning, setShowSystemRoleWarning] = useState(false);

    const { data, setData, errors, processing, post, reset } = useForm({
        name: '',
        display_name: '',
        description: '',
        is_active: true,
        is_system_role: false,
        permission_ids: [] as number[],
    });

    // Check if role name suggests a system role
    useEffect(() => {
        const systemKeywords = ['admin', 'superadmin', 'system', 'root', 'super', 'owner'];
        const roleName = data.name.toLowerCase();
        const isPotentialSystemRole = systemKeywords.some(keyword => 
            roleName.includes(keyword) || roleName.startsWith(keyword)
        );
        
        setShowSystemRoleWarning(isPotentialSystemRole && !data.is_system_role);
    }, [data.name, data.is_system_role]);

    // Safely get modules from available_permissions or provided modules
    const availableModules = useMemo(() => {
        if (modules.length > 0) {
            return ['all', ...modules];
        }
        
        if (!Array.isArray(available_permissions)) {
            return ['all'];
        }
        
        const uniqueModules = [...new Set(available_permissions.map(p => p?.module).filter(Boolean))];
        return ['all', ...uniqueModules];
    }, [available_permissions, modules]);

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
        
        // Show confirmation for system roles
        if (data.is_system_role) {
            if (!confirm('Are you sure you want to create a system role? System roles have special privileges and cannot be deleted.')) {
                return;
            }
        }
        
        setIsSubmitting(true);
        
        post(route('roles.store'), {
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

    // Generate a suggested display name from the role name
    const generateDisplayName = () => {
        if (data.display_name.trim() !== '' || data.name.trim() === '') return;
        
        const name = data.name
            .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
            .replace(/\b\w/g, char => char.toUpperCase()) // Capitalize each word
            .trim();
        
        setData('display_name', name);
    };

    // Auto-generate display name when role name changes
    useEffect(() => {
        if (!data.display_name && data.name) {
            const timeoutId = setTimeout(generateDisplayName, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [data.name]);

    return (
        <AdminLayout
            title="Create New Role"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Roles', href: route('roles.index') },
                { title: 'Create', href: '#' }
            ]}
        >
            <Head title="Create New Role" />

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
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Role</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                    Define a new role with specific permissions
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                                        Define the basic information for the new role
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
                                                disabled={!data.name}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                {copiedField === 'name' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., admin, editor, moderator"
                                            className={`font-mono ${errors.name ? 'border-red-500' : ''}`}
                                            disabled={processing}
                                            onBlur={generateDisplayName}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Use lowercase letters, numbers, and underscores only. Example: content_editor
                                        </p>
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
                                                disabled={!data.display_name}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                {copiedField === 'display_name' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <Input
                                            id="display_name"
                                            value={data.display_name}
                                            onChange={(e) => setData('display_name', e.target.value)}
                                            placeholder="e.g., Administrator, Content Editor"
                                            className={errors.display_name ? 'border-red-500' : ''}
                                            disabled={processing}
                                        />
                                        {errors.display_name && (
                                            <p className="text-sm text-red-600">{errors.display_name}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            This is how the role will appear to users in the system
                                        </p>
                                    </div>

                                    {/* Description Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                            <span className="text-xs text-gray-500 font-normal ml-2">
                                                (Optional but recommended)
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe what this role can do and who should have it..."
                                            className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                                            disabled={processing}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600">{errors.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Helps users understand the purpose and scope of this role
                                        </p>
                                    </div>

                                    {/* Role Type and Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                        {/* System Role */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_system_role" className="text-base">
                                                    System Role
                                                </Label>
                                                <p className="text-sm text-gray-500">
                                                    Special privileges, cannot be deleted
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_system_role"
                                                checked={data.is_system_role}
                                                onCheckedChange={(checked) => setData('is_system_role', checked)}
                                                disabled={processing}
                                            />
                                        </div>
                                    </div>

                                    {/* System Role Warning */}
                                    {showSystemRoleWarning && (
                                        <Alert variant="warning" className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                                                This role name suggests it might be a system role. Consider enabling "System Role" above for roles with special administrative privileges.
                                            </AlertDescription>
                                        </Alert>
                                    )}

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
                                        Select the permissions to assign to this role
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
                                                    {availableModules.map((module) => (
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
                                            {available_permissions.length === 0 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.visit(route('permissions.index'))}
                                                >
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create Permissions First
                                                </Button>
                                            )}
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

                        {/* Right Column - Preview & Actions */}
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
                                                data.is_system_role
                                                    ? 'bg-purple-100 dark:bg-purple-900/30'
                                                    : 'bg-green-100 dark:bg-green-900/30'
                                            }`}>
                                                <Shield className={`h-5 w-5 ${
                                                    data.is_system_role
                                                        ? 'text-purple-600 dark:text-purple-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {data.display_name || 'New Role'}
                                                </div>
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
                                            <Badge variant={data.is_system_role ? "outline" : "default"}>
                                                {data.is_system_role ? 'System' : 'Custom'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Permissions</span>
                                            <Badge variant="outline">{data.permission_ids.length}</Badge>
                                        </div>
                                        {data.description && (
                                            <div>
                                                <span className="text-sm text-gray-500">Description</span>
                                                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 line-clamp-2">
                                                    {data.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Tips */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Quick Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Role Naming</h4>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                            <li>Use lowercase with underscores for technical names</li>
                                            <li>Keep role names descriptive but concise</li>
                                            <li>Consider naming conventions in your organization</li>
                                        </ul>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Permission Selection</h4>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                            <li>Follow the principle of least privilege</li>
                                            <li>Only assign permissions needed for the role's purpose</li>
                                            <li>Group related permissions by module</li>
                                        </ul>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">System Roles</h4>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                            <li>System roles cannot be deleted</li>
                                            <li>Use for core administrative functions</li>
                                            <li>Assign system roles carefully</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Common Role Templates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Common Templates
                                    </CardTitle>
                                    <CardDescription>
                                        Quick start with predefined permission sets
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="justify-start h-8"
                                            onClick={() => {
                                                // Example: Admin template
                                                setData({
                                                    ...data,
                                                    name: 'admin',
                                                    display_name: 'Administrator',
                                                    description: 'Full system administrator with all permissions',
                                                    is_system_role: true,
                                                });
                                            }}
                                        >
                                            <Shield className="h-3 w-3 mr-2" />
                                            Administrator
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="justify-start h-8"
                                            onClick={() => {
                                                // Example: Editor template
                                                setData({
                                                    ...data,
                                                    name: 'editor',
                                                    display_name: 'Content Editor',
                                                    description: 'Can create and edit content but not manage users',
                                                    is_system_role: false,
                                                });
                                            }}
                                        >
                                            <Edit className="h-3 w-3 mr-2" />
                                            Content Editor
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="justify-start h-8"
                                            onClick={() => {
                                                // Example: Viewer template
                                                setData({
                                                    ...data,
                                                    name: 'viewer',
                                                    display_name: 'Viewer',
                                                    description: 'Can view content but not create or edit',
                                                    is_system_role: false,
                                                });
                                            }}
                                        >
                                            <Eye className="h-3 w-3 mr-2" />
                                            Viewer
                                        </Button>
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
                                        disabled={processing || isSubmitting || !data.name.trim()}
                                        className="w-full"
                                    >
                                        {processing || isSubmitting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Create Role
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
                                        onClick={() => router.visit(route('permissions.index'))}
                                        className="w-full"
                                    >
                                        <Key className="mr-2 h-4 w-4" />
                                        Manage Permissions
                                    </Button>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4">
                                    <p className="text-xs text-gray-500 text-center w-full">
                                        {!data.name.trim() && 'Enter a role name to enable creation'}
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}