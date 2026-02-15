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

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    module: string;
    is_active: boolean;
}

interface RoleCreateProps {
    permissions?: Record<string, Permission[]>;
    validation_errors?: Record<string, string>;
    modules?: string[];
}

export default function RoleCreate({ permissions = {}, validation_errors, modules = [] }: RoleCreateProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSystemRoleWarning, setShowSystemRoleWarning] = useState(false);

    const { data, setData, errors, processing, post, reset } = useForm({
        name: '',
        description: '',
        is_system_role: false,
        permissions: [] as number[], // Changed from permission_ids to match Laravel
    });

    // Flatten permissions array for easier manipulation
    const allPermissions = useMemo(() => {
        return Object.values(permissions).flat();
    }, [permissions]);

    // Check if role name suggests a system role
    useEffect(() => {
        const systemKeywords = ['admin', 'superadmin', 'system', 'root', 'super', 'owner'];
        const roleName = data.name.toLowerCase();
        const isPotentialSystemRole = systemKeywords.some(keyword => 
            roleName.includes(keyword) || roleName.startsWith(keyword)
        );
        
        setShowSystemRoleWarning(isPotentialSystemRole && !data.is_system_role);
    }, [data.name, data.is_system_role]);

    // Get available modules
    const availableModules = useMemo(() => {
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
        
        // Validate name format
        const nameRegex = /^[a-z_]+$/;
        if (!nameRegex.test(data.name)) {
            alert('Role name must contain only lowercase letters and underscores.');
            return;
        }
        
        // Show confirmation for system roles
        if (data.is_system_role) {
            if (!confirm('Are you sure you want to create a system role? System roles cannot be deleted.')) {
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
        const newPermissions = data.permissions.includes(permissionId)
            ? data.permissions.filter(id => id !== permissionId)
            : [...data.permissions, permissionId];
        
        setData('permissions', newPermissions);
    };

    const handleSelectAll = (module?: string) => {
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
                                            onChange={(e) => setData('name', e.target.value.toLowerCase())}
                                            placeholder="e.g., admin, content_editor, moderator"
                                            className={`font-mono ${errors.name ? 'border-red-500' : ''}`}
                                            disabled={processing}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Use lowercase letters and underscores only. Example: content_editor
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

                                    {/* System Role Toggle */}
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
                                            {data.permissions.length} selected
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
                                                    disabled={data.permissions.length === 0}
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
                                            {allPermissions.length === 0 && (
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
                                            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                                                <div key={module} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium">{module}</h3>
                                                            <Badge variant="secondary">
                                                                {modulePermissions.length}
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
                                                        {modulePermissions.map((permission) => (
                                                            <div
                                                                key={permission.id}
                                                                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                                                                    data.permissions.includes(permission.id)
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    id={`permission-${permission.id}`}
                                                                    checked={data.permissions.includes(permission.id)}
                                                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                                    disabled={processing}
                                                                />
                                                                <Label
                                                                    htmlFor={`permission-${permission.id}`}
                                                                    className="flex-1 cursor-pointer"
                                                                >
                                                                    <div className="font-medium">{permission.display_name}</div>
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
                                                <div className="font-medium font-mono">
                                                    {data.name || 'role.name'}
                                                </div>
                                                {data.description && (
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {data.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={data.is_system_role ? "outline" : "default"}>
                                            {data.is_system_role ? 'System' : 'Custom'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Permissions</span>
                                            <Badge variant="outline">{data.permissions.length}</Badge>
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
                                            <li>Use lowercase with underscores only (e.g., content_editor)</li>
                                            <li>Keep role names descriptive but concise</li>
                                            <li>System roles should have "admin" or "system" in name</li>
                                        </ul>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Permission Selection</h4>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                            <li>Follow the principle of least privilege</li>
                                            <li>Only assign permissions needed for the role's purpose</li>
                                            <li>Review inactive permissions carefully</li>
                                        </ul>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">System Roles</h4>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                            <li>System roles cannot be deleted</li>
                                            <li>Use for core administrative functions</li>
                                            <li>Assign system roles carefully to trusted users</li>
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
                                                // Admin template - select all active permissions
                                                const allActivePermissionIds = allPermissions
                                                    .filter(p => p.is_active)
                                                    .map(p => p.id);
                                                
                                                setData({
                                                    name: 'admin',
                                                    description: 'Full system administrator with all permissions',
                                                    is_system_role: true,
                                                    permissions: allActivePermissionIds,
                                                });
                                            }}
                                        >
                                            <Shield className="h-3 w-3 mr-2" />
                                            Administrator (All Permissions)
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="justify-start h-8"
                                            onClick={() => {
                                                // Editor template - focus on content permissions
                                                const contentPermissions = allPermissions
                                                    .filter(p => p.is_active && 
                                                        (p.module.toLowerCase().includes('content') || 
                                                         p.module.toLowerCase().includes('post') ||
                                                         p.name.includes('create') ||
                                                         p.name.includes('edit')))
                                                    .map(p => p.id);
                                                
                                                setData({
                                                    name: 'content_editor',
                                                    description: 'Can create and edit content',
                                                    is_system_role: false,
                                                    permissions: contentPermissions.slice(0, 10), // Limit to 10 permissions
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
                                                // Viewer template - mostly view permissions
                                                const viewPermissions = allPermissions
                                                    .filter(p => p.is_active && 
                                                        (p.name.includes('view') || 
                                                         p.name.includes('read') ||
                                                         p.name.includes('list')))
                                                    .map(p => p.id);
                                                
                                                setData({
                                                    name: 'viewer',
                                                    description: 'Can view content but not create or edit',
                                                    is_system_role: false,
                                                    permissions: viewPermissions,
                                                });
                                            }}
                                        >
                                            <Eye className="h-3 w-3 mr-2" />
                                            Viewer (Read-Only)
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