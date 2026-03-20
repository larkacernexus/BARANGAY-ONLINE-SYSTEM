import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import {
    ArrowLeft,
    Save,
    Users,
    Key,
    Shield,
    AlertCircle,
    RefreshCw,
    Check,
    Search,
    Filter,
    X,
    Eye,
    Lock,
    Unlock,
    ListFilter,
    Calendar,
    User,
    CheckCircle,
    PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    description?: string;
    is_system_role: boolean;
    users_count?: number;
    permissions?: number[];
}

interface Permission {
    id: number;
    name: string;
    display_name: string;
    module: string;
    description?: string;
    is_active: boolean;
}

interface RolePermissionCreateProps {
    roles?: Role[];
    permissions?: Permission[];
    modules?: string[];
    validation_errors?: Record<string, string>;
    success_message?: string;
}

interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

export default function RolePermissionCreate({
    roles: initialRoles = [],
    permissions: initialPermissions = [],
    modules: initialModules = [],
    validation_errors = {},
    success_message
}: RolePermissionCreateProps) {
    // Safe defaults for all props
    const safeRoles: Role[] = Array.isArray(initialRoles) ? initialRoles : [];
    const safePermissions: Permission[] = Array.isArray(initialPermissions) ? initialPermissions : [];
    const safeModules: string[] = Array.isArray(initialModules) ? initialModules : [];

    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
    const [showInactive, setShowInactive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, errors, processing, post, reset } = useForm({
        role_id: '',
        permission_ids: [] as number[],
        notes: '',
        grant_all_module_permissions: false,
    });

    // Update form data when selected role or permissions change
    useEffect(() => {
        setData('role_id', selectedRoleId);
    }, [selectedRoleId]);

    useEffect(() => {
        setData('permission_ids', Array.from(selectedPermissions));
    }, [selectedPermissions]);

    // Get selected role details
    const selectedRole = safeRoles.find(role => role.id.toString() === selectedRoleId);

    // Get available modules from permissions
    const availableModules = Array.from(
        new Set(safePermissions.map(p => p.module).filter(Boolean))
    ).sort();

    // When a role is selected, load its existing permissions
    useEffect(() => {
        if (selectedRole && selectedRole.permissions) {
            setSelectedPermissions(new Set(selectedRole.permissions));
        } else {
            setSelectedPermissions(new Set());
        }
    }, [selectedRole]);

    // Filter permissions based on search and filters
    const filteredPermissions = safePermissions.filter(permission => {
        // Filter by active status
        if (!showInactive && !permission.is_active) return false;

        // Filter by module
        if (moduleFilter !== 'all' && permission.module !== moduleFilter) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                permission.name.toLowerCase().includes(query) ||
                permission.display_name.toLowerCase().includes(query) ||
                (permission.description?.toLowerCase() || '').includes(query) ||
                (permission.module?.toLowerCase() || '').includes(query)
            );
        }

        return true;
    });

    // Group permissions by module
    const groupedPermissions: PermissionGroup[] = availableModules
        .map(module => ({
            module,
            permissions: filteredPermissions.filter(p => p.module === module)
        }))
        .filter(group => group.permissions.length > 0);

    // Check if all permissions in a module are selected
    const isModuleAllSelected = (module: string) => {
        const modulePermissions = safePermissions.filter(p => 
            p.module === module && (showInactive || p.is_active)
        );
        return modulePermissions.length > 0 && modulePermissions.every(p => selectedPermissions.has(p.id));
    };

    // Toggle all permissions in a module
    const toggleModulePermissions = (module: string, checked: boolean) => {
        const modulePermissions = safePermissions.filter(p => 
            p.module === module && (showInactive || p.is_active)
        );
        const newSelected = new Set(selectedPermissions);

        if (checked) {
            modulePermissions.forEach(p => newSelected.add(p.id));
        } else {
            modulePermissions.forEach(p => newSelected.delete(p.id));
        }

        setSelectedPermissions(newSelected);
    };

    // Toggle individual permission
    const togglePermission = (permissionId: number, checked: boolean) => {
        const newSelected = new Set(selectedPermissions);
        if (checked) {
            newSelected.add(permissionId);
        } else {
            newSelected.delete(permissionId);
        }
        setSelectedPermissions(newSelected);
    };

    // Grant all permissions
    const grantAllPermissions = () => {
        const allPermissionIds = safePermissions
            .filter(p => showInactive || p.is_active)
            .map(p => p.id);
        setSelectedPermissions(new Set(allPermissionIds));
    };

    // Revoke all permissions
    const revokeAllPermissions = () => {
        setSelectedPermissions(new Set());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedRoleId) {
            toast.error('Please select a role');
            return;
        }

        if (selectedPermissions.size === 0) {
            toast.error('Please select at least one permission');
            return;
        }

        setIsSubmitting(true);

        post(route('admin.role-permissions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Permissions assigned successfully');
            },
            onError: (errors) => {
                setIsSubmitting(false);
                if (errors.message) {
                    toast.error(errors.message);
                }
            },
        });
    };

    const handleReset = () => {
        reset();
        setSelectedRoleId('');
        setSelectedPermissions(new Set());
        setSearchQuery('');
        setModuleFilter('all');
        setShowInactive(false);
    };

    // Get system role warning
    const getSystemRoleWarning = () => {
        if (!selectedRole) return null;
        
        if (selectedRole.is_system_role) {
            return (
                <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:bg-gray-900/90">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                        <strong>System Role Detected:</strong> This is a system role. Changes to system roles 
                        may affect core system functionality. Proceed with caution.
                    </AlertDescription>
                </Alert>
            );
        }
        return null;
    };

    return (
        <AdminLayout
            title="Assign Permissions to Role"
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Role Permissions', href: route('admin.role-permissions.index') },
                { title: 'Assign Permissions', href: '#' }
            ]}
        >
            <Head title="Assign Permissions to Role" />

            <div className="space-y-6 min-h-screen p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.visit(route('admin.role-permissions.index'))}
                                className="h-8 w-8 p-0 dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="h-4 w-4 dark:text-gray-300" />
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Assign Permissions</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                    Manage role permissions and access control
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={processing || isSubmitting}
                            className="h-9 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Success Message */}
                {success_message && (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:bg-gray-900/90">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-300">
                            {success_message}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Role Selection & Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Role Selection Card */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Users className="h-5 w-5 dark:text-gray-300" />
                                        Select Role
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Choose a role to assign permissions to
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Role Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="dark:text-gray-300">Role *</Label>
                                        <Select
                                            value={selectedRoleId}
                                            onValueChange={setSelectedRoleId}
                                            disabled={processing || isSubmitting}
                                        >
                                            <SelectTrigger className={`dark:bg-gray-900 dark:border-gray-700 dark:text-white ${errors.role_id ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {safeRoles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()} className="dark:text-white dark:focus:bg-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4 dark:text-gray-400" />
                                                            <div className="flex-1">
                                                                <div className="font-medium">{role.name}</div>
                                                                {role.description && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {role.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {role.is_system_role && (
                                                                <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-300">
                                                                    System
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.role_id && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.role_id}</p>
                                        )}
                                    </div>

                                    {/* Selected Role Info */}
                                    {selectedRole && (
                                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                        <h3 className="font-semibold dark:text-white">{selectedRole.name}</h3>
                                                        {selectedRole.is_system_role && (
                                                            <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                                                                <Lock className="h-3 w-3 mr-1" />
                                                                System Role
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {selectedRole.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {selectedRole.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3 dark:text-gray-500" />
                                                            <span className="text-gray-500 dark:text-gray-400">Users:</span>
                                                            <span className="font-medium ml-1 dark:text-white">
                                                                {selectedRole.users_count || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Key className="h-3 w-3 dark:text-gray-500" />
                                                            <span className="text-gray-500 dark:text-gray-400">Current Permissions:</span>
                                                            <span className="font-medium ml-1 dark:text-white">
                                                                {selectedRole.permissions?.length || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(route('roles.show', selectedRole.id))}
                                                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View Role
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* System Role Warning */}
                                    {getSystemRoleWarning()}

                                    {/* Additional Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="dark:text-gray-300">
                                            Notes
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                                                (Optional - for tracking purposes)
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Add notes about this permission assignment..."
                                            className="min-h-[80px] dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                                            disabled={processing || isSubmitting}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            This note will be recorded in the assignment history
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permissions Selection Card */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                                <Key className="h-5 w-5 dark:text-gray-300" />
                                                Select Permissions
                                            </CardTitle>
                                            <CardDescription className="dark:text-gray-400">
                                                Choose permissions to assign to the selected role
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Selected: <span className="font-semibold dark:text-white">{selectedPermissions.size}</span> / {safePermissions.length}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Search and Filters */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    placeholder="Search permissions..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                                                    disabled={!selectedRoleId}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select 
                                                    value={moduleFilter} 
                                                    onValueChange={setModuleFilter}
                                                    disabled={!selectedRoleId}
                                                >
                                                    <SelectTrigger className="w-[150px] dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                        <Filter className="h-4 w-4 mr-2" />
                                                        <SelectValue placeholder="Module" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                        <SelectItem value="all" className="dark:text-white dark:focus:bg-gray-700">All Modules</SelectItem>
                                                        {availableModules.map(module => (
                                                            <SelectItem key={module} value={module} className="dark:text-white dark:focus:bg-gray-700">
                                                                {module}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select 
                                                    value={viewMode} 
                                                    onValueChange={(v: 'list' | 'grouped') => setViewMode(v)}
                                                    disabled={!selectedRoleId}
                                                >
                                                    <SelectTrigger className="w-[130px] dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                        <ListFilter className="h-4 w-4 mr-2" />
                                                        <SelectValue placeholder="View" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                        <SelectItem value="grouped" className="dark:text-white dark:focus:bg-gray-700">Grouped</SelectItem>
                                                        <SelectItem value="list" className="dark:text-white dark:focus:bg-gray-700">List</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="show-inactive"
                                                    checked={showInactive}
                                                    onCheckedChange={setShowInactive}
                                                    disabled={!selectedRoleId}
                                                    className="dark:data-[state=checked]:bg-gray-600"
                                                />
                                                <Label htmlFor="show-inactive" className="text-sm dark:text-gray-300">
                                                    Show inactive permissions
                                                </Label>
                                            </div>
                                            <div className="flex-1" />
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={grantAllPermissions}
                                                    disabled={!selectedRoleId}
                                                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Grant All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={revokeAllPermissions}
                                                    disabled={!selectedRoleId}
                                                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Revoke All
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Permissions List */}
                                    <div className="border rounded-lg dark:border-gray-700">
                                        <ScrollArea className="h-[400px]">
                                            {!selectedRoleId ? (
                                                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                                                    <Shield className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                                                        Select a Role First
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Please select a role to view and assign permissions
                                                    </p>
                                                </div>
                                            ) : viewMode === 'grouped' ? (
                                                /* Grouped View */
                                                <div className="p-4 space-y-6">
                                                    {groupedPermissions.map((group) => (
                                                        <div key={group.module} className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-semibold text-lg dark:text-white">{group.module}</h3>
                                                                    <Badge variant="secondary" className="ml-2 dark:bg-gray-700 dark:text-gray-300">
                                                                        {group.permissions.length}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        id={`module-${group.module}`}
                                                                        checked={isModuleAllSelected(group.module)}
                                                                        onCheckedChange={(checked) =>
                                                                            toggleModulePermissions(group.module, !!checked)
                                                                        }
                                                                        disabled={!selectedRoleId}
                                                                        className="dark:border-gray-600 dark:data-[state=checked]:bg-gray-600"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`module-${group.module}`}
                                                                        className="text-sm cursor-pointer dark:text-gray-300"
                                                                    >
                                                                        Select All
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {group.permissions.map((permission) => (
                                                                    <div
                                                                        key={permission.id}
                                                                        className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-700 ${
                                                                            !permission.is_active ? 'opacity-60' : ''
                                                                        }`}
                                                                    >
                                                                        <Checkbox
                                                                            id={`perm-${permission.id}`}
                                                                            checked={selectedPermissions.has(permission.id)}
                                                                            onCheckedChange={(checked) =>
                                                                                togglePermission(permission.id, !!checked)
                                                                            }
                                                                            disabled={!selectedRoleId}
                                                                            className="dark:border-gray-600 dark:data-[state=checked]:bg-gray-600"
                                                                        />
                                                                        <div className="flex-1 space-y-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label
                                                                                    htmlFor={`perm-${permission.id}`}
                                                                                    className="font-medium cursor-pointer dark:text-white"
                                                                                >
                                                                                    {permission.display_name}
                                                                                </Label>
                                                                                {!permission.is_active && (
                                                                                    <Badge variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                                                                        Inactive
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                                                {permission.name}
                                                                            </p>
                                                                            {permission.description && (
                                                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                                                    {permission.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                /* List View */
                                                <div className="p-4">
                                                    <div className="space-y-2">
                                                        {filteredPermissions.map((permission) => (
                                                            <div
                                                                key={permission.id}
                                                                className={`flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-700 ${
                                                                    !permission.is_active ? 'opacity-60' : ''
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    id={`perm-${permission.id}`}
                                                                    checked={selectedPermissions.has(permission.id)}
                                                                    onCheckedChange={(checked) =>
                                                                        togglePermission(permission.id, !!checked)
                                                                    }
                                                                    disabled={!selectedRoleId}
                                                                    className="dark:border-gray-600 dark:data-[state=checked]:bg-gray-600"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="space-y-1">
                                                                            <Label
                                                                                htmlFor={`perm-${permission.id}`}
                                                                                className="font-medium cursor-pointer dark:text-white"
                                                                            >
                                                                                {permission.display_name}
                                                                            </Label>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                                                {permission.name}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                                                                {permission.module}
                                                                            </Badge>
                                                                            {!permission.is_active && (
                                                                                <Badge variant="secondary" size="sm" className="dark:bg-gray-700 dark:text-gray-300">
                                                                                    Inactive
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {permission.description && (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                            {permission.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRoleId && filteredPermissions.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                                                    <Key className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                                                        No permissions found
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {searchQuery
                                                            ? 'Try a different search term'
                                                            : 'No permissions available for the selected filters'}
                                                    </p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>

                                    {/* Validation Errors */}
                                    {Object.keys(validation_errors).length > 0 && (
                                        <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="dark:text-red-300">
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

                                    {errors.permission_ids && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.permission_ids}</p>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t dark:border-gray-700 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.role-permissions.index'))}
                                        disabled={processing || isSubmitting}
                                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || isSubmitting || !selectedRoleId || selectedPermissions.size === 0}
                                        className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        {processing || isSubmitting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Assigning...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Assign Permissions
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Right Column - Summary & Info */}
                        <div className="space-y-6">
                            {/* Summary Card */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Eye className="h-5 w-5 dark:text-gray-300" />
                                        Assignment Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Selected Role</span>
                                            <span className="font-medium dark:text-white">
                                                {selectedRole?.name || 'None selected'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Permissions to Assign</span>
                                            <span className="font-medium dark:text-white">{selectedPermissions.size}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Active Permissions</span>
                                            <span className="font-medium dark:text-white">
                                                {Array.from(selectedPermissions).filter(id => {
                                                    const perm = safePermissions.find(p => p.id === id);
                                                    return perm?.is_active;
                                                }).length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Modules Covered</span>
                                            <span className="font-medium dark:text-white">
                                                {Array.from(new Set(
                                                    Array.from(selectedPermissions).map(id => {
                                                        const perm = safePermissions.find(p => p.id === id);
                                                        return perm?.module;
                                                    }).filter(Boolean)
                                                )).length}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator className="dark:bg-gray-700" />

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm dark:text-white">Module Distribution</h4>
                                        <div className="space-y-1">
                                            {groupedPermissions
                                                .filter(group =>
                                                    group.permissions.some(p => selectedPermissions.has(p.id))
                                                )
                                                .map(group => {
                                                    const selectedCount = group.permissions.filter(p =>
                                                        selectedPermissions.has(p.id)
                                                    ).length;
                                                    return (
                                                        <div key={group.module} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">{group.module}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="dark:text-white">{selectedCount}/{group.permissions.length}</span>
                                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                                                                        style={{
                                                                            width: `${(selectedCount / group.permissions.length) * 100}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('permissions.create'))}
                                        className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create New Permission
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('roles.create'))}
                                        className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        Create New Role
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.role-permissions.index'))}
                                        className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        View Assignments
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Tips Card */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-sm dark:text-white">Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5" />
                                        <span>Start by selecting a role, then choose permissions</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5" />
                                        <span>Use module-level select all for quick assignment</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5" />
                                        <span>Review the summary before final assignment</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}