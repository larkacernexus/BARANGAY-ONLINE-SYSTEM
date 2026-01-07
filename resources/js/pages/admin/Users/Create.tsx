import AppLayout from '@/layouts/admin-app-layout';
import { useForm } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { Permission, Role, Department } from '@/types';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    UserPlus,
    Mail,
    Lock,
    Phone,
    Shield,
    Building,
    Eye,
    EyeOff,
    Copy,
    User
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface CreateUserProps {
    permissions: Record<string, Permission[]> | null;
    roles: Role[] | null;
    departments: Department[] | null;
}

export default function CreateUser({ permissions = {}, roles = [], departments = [] }: CreateUserProps) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        contact_number: '',
        position: '',
        department_id: '',
        role_id: '',
        selected_permissions: [] as number[],
        status: 'active',
        require_password_change: false,
        is_email_verified: false,
        send_setup_email: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([]);
    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

    // Local state for selected permissions to avoid the function issue
    const [localSelectedPermissions, setLocalSelectedPermissions] = useState<number[]>([]);

    // Sync local state with form data
    useEffect(() => {
        if (Array.isArray(data.selected_permissions)) {
            setLocalSelectedPermissions(data.selected_permissions);
        }
    }, [data.selected_permissions]);

    // Update form data when local state changes
    const updateSelectedPermissions = (newPermissions: number[]) => {
        setLocalSelectedPermissions(newPermissions);
        setData('selected_permissions', newPermissions);
    };

    // Memoize flattened permissions for better performance
    const flattenedPermissions = useMemo(() => {
        if (!permissions) return [];
        return Object.values(permissions).flat();
    }, [permissions]);

    // When role changes, load its permissions
    useEffect(() => {
        if (data.role_id && roles) {
            const role = Array.isArray(roles) 
                ? roles.find(r => r && r.id && r.id.toString() === data.role_id.toString())
                : null;
            
            if (role && role.permissions) {
                const rolePermissionIds = Array.isArray(role.permissions)
                    ? role.permissions
                        .filter(p => p && p.id !== undefined && p.id !== null)
                        .map(p => p.id)
                    : [];
                setSelectedRolePermissions(rolePermissionIds);
            } else {
                setSelectedRolePermissions([]);
            }
        } else {
            setSelectedRolePermissions([]);
        }
    }, [data.role_id, roles]);

    const togglePermission = (permissionId: number) => {
        if (!permissionId) return;
        
        if (localSelectedPermissions.includes(permissionId)) {
            // Remove permission
            const newPermissions = localSelectedPermissions.filter(id => id !== permissionId);
            updateSelectedPermissions(newPermissions);
        } else {
            // Add permission
            const newPermissions = [...localSelectedPermissions, permissionId];
            updateSelectedPermissions(newPermissions);
        }
    };

    const toggleAllPermissions = (module: string, modulePermissions: Permission[]) => {
        const permissionsArray = Array.isArray(modulePermissions) ? modulePermissions : [];
        if (permissionsArray.length === 0) return;

        const permissionIds = permissionsArray
            .filter((p: Permission) => p && p.id !== undefined && p.id !== null)
            .map((p: Permission) => p.id);
        
        if (permissionIds.length === 0) return;

        const allSelected = permissionIds.every(id => localSelectedPermissions.includes(id));
        
        if (allSelected) {
            // Remove all permissions from this module
            const newPermissions = localSelectedPermissions.filter(id => !permissionIds.includes(id));
            updateSelectedPermissions(newPermissions);
        } else {
            // Add all permissions from this module
            const newIds = permissionIds.filter(id => !localSelectedPermissions.includes(id));
            const newPermissions = [...localSelectedPermissions, ...newIds];
            updateSelectedPermissions(newPermissions);
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleGeneratePassword = () => {
        setIsGeneratingPassword(true);
        const password = generatePassword();
        setData({
            ...data,
            password,
            password_confirmation: password,
        });
        
        setTimeout(() => setIsGeneratingPassword(false), 500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users');
    };

    const clearForm = () => {
        setData({
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: '',
            password_confirmation: '',
            contact_number: '',
            position: '',
            department_id: '',
            role_id: '',
            selected_permissions: [],
            status: 'active',
            require_password_change: false,
            is_email_verified: false,
            send_setup_email: false,
        });
        setLocalSelectedPermissions([]);
        setSelectedRolePermissions([]);
    };

    // Safe department/role finding
    const selectedDepartment = useMemo(() => {
        if (!Array.isArray(departments) || !data.department_id) return null;
        return departments.find(dept => dept && dept.id && dept.id.toString() === data.department_id.toString()) || null;
    }, [departments, data.department_id]);

    const selectedRole = useMemo(() => {
        if (!Array.isArray(roles) || !data.role_id) return null;
        return roles.find(role => role && role.id && role.id.toString() === data.role_id.toString()) || null;
    }, [roles, data.role_id]);

    // Calculate total permissions safely
    const totalPermissionsCount = useMemo(() => {
        if (!permissions) return 0;
        const allPermissions = Object.values(permissions).flat();
        return allPermissions.filter(p => p && p.id !== undefined && p.id !== null).length;
    }, [permissions]);

    const selectedPermissionsCount = useMemo(() => {
        return localSelectedPermissions.length + selectedRolePermissions.length;
    }, [localSelectedPermissions, selectedRolePermissions]);

    // Get permission by ID safely
    const getPermissionById = useMemo(() => {
        return (permissionId: number): Permission | undefined => {
            if (!permissionId || !flattenedPermissions) return undefined;
            return flattenedPermissions.find(p => p && p.id === permissionId);
        };
    }, [flattenedPermissions]);

    // Get all modules from permissions
    const permissionModules = useMemo(() => {
        if (!permissions || typeof permissions !== 'object') return [];
        return Object.keys(permissions).filter(key => 
            Array.isArray(permissions[key]) && permissions[key].length > 0
        );
    }, [permissions]);

    // Loading state if data is not ready
    if (!permissions || !roles || !departments) {
        return (
            <AppLayout
                title="Add User"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Users', href: '/users' },
                    { title: 'Add User', href: '/users/create' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading user creation form...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Add User"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Users', href: '/users' },
                { title: 'Add User', href: '/users/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/users">
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Add a new user account with specific permissions
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save User'}
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - User Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Enter the user's personal details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name *</Label>
                                            <Input 
                                                id="first_name" 
                                                placeholder="Juan" 
                                                required 
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-500">{errors.first_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name *</Label>
                                            <Input 
                                                id="last_name" 
                                                placeholder="Dela Cruz" 
                                                required 
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-500">{errors.last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="juan@barangaykibawe.ph" 
                                                    className="pl-10" 
                                                    required 
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number">Contact Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input 
                                                    id="contact_number" 
                                                    placeholder="09123456789" 
                                                    className="pl-10" 
                                                    value={data.contact_number}
                                                    onChange={(e) => setData('contact_number', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <Input 
                                                id="username" 
                                                placeholder="juan.delacruz" 
                                                required 
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                            />
                                            {errors.username && (
                                                <p className="text-sm text-red-500">{errors.username}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="position">Position/Title</Label>
                                            <Input 
                                                id="position" 
                                                placeholder="Barangay Secretary" 
                                                value={data.position}
                                                onChange={(e) => setData('position', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="department_id">Department *</Label>
                                            <Select 
                                                value={data.department_id} 
                                                onValueChange={(value) => setData('department_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.isArray(departments) && departments.map((dept) => (
                                                        dept && dept.id && (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                {dept.name || 'Unnamed Department'}
                                                            </SelectItem>
                                                        )
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.department_id && (
                                                <p className="text-sm text-red-500">{errors.department_id}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role_id">User Role *</Label>
                                            <Select 
                                                value={data.role_id} 
                                                onValueChange={(value) => setData('role_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.isArray(roles) && roles.map((role) => (
                                                        role && role.id && (
                                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                                <div>
                                                                    <div className="font-medium">{role.name || 'Unnamed Role'}</div>
                                                                    {role.description && (
                                                                        <div className="text-xs text-gray-500">{role.description}</div>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.role_id && (
                                                <p className="text-sm text-red-500">{errors.role_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security & Access */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Security & Access
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input 
                                                    id="password" 
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter password"
                                                    className="pl-10 pr-10"
                                                    required
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-sm text-red-500">{errors.password}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                            <Input 
                                                id="password_confirmation" 
                                                type="password"
                                                placeholder="Confirm password"
                                                required
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleGeneratePassword}
                                            disabled={isGeneratingPassword}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            {isGeneratingPassword ? 'Generating...' : 'Generate Password'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setData('send_setup_email', !data.send_setup_email)}
                                        >
                                            {data.send_setup_email ? '✓ ' : ''}Send Setup Email
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="requirePasswordChange" 
                                                checked={data.require_password_change}
                                                onCheckedChange={(checked) => 
                                                    setData('require_password_change', checked as boolean)
                                                }
                                            />
                                            <Label htmlFor="requirePasswordChange" className="text-sm">
                                                Require password change on first login
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="is_email_verified" 
                                                checked={data.is_email_verified}
                                                onCheckedChange={(checked) => 
                                                    setData('is_email_verified', checked as boolean)
                                                }
                                            />
                                            <Label htmlFor="is_email_verified" className="text-sm">
                                                Email verified
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permissions */}
                            {permissionModules.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            System Permissions
                                        </CardTitle>
                                        <CardDescription>
                                            Select modules and features this user can access. 
                                            Role permissions are shown in <span className="text-blue-500">blue</span>.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {permissionModules.map((module) => {
                                                const modulePermissions = permissions[module];
                                                const safePermissions = Array.isArray(modulePermissions) ? modulePermissions : [];
                                                
                                                if (safePermissions.length === 0) return null;

                                                return (
                                                    <div key={module} className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-base font-semibold">{module || 'Uncategorized'}</Label>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleAllPermissions(module, safePermissions)}
                                                            >
                                                                Toggle All
                                                            </Button>
                                                        </div>
                                                        <div className="grid gap-3 md:grid-cols-2">
                                                            {safePermissions.map((permission) => {
                                                                if (!permission || permission.id === undefined || permission.id === null) return null;
                                                                
                                                                const permissionId = permission.id;
                                                                const isFromRole = selectedRolePermissions.includes(permissionId);
                                                                const isSelected = localSelectedPermissions.includes(permissionId);
                                                                
                                                                return (
                                                                    <div 
                                                                        key={permission.id}
                                                                        className={`flex items-start space-x-2 p-3 rounded-lg border ${
                                                                            isFromRole 
                                                                                ? 'border-blue-200 bg-blue-50' 
                                                                                : 'border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <Checkbox 
                                                                            id={`permission-${permission.id}`}
                                                                            checked={isSelected || isFromRole}
                                                                            onCheckedChange={() => togglePermission(permissionId)}
                                                                            disabled={isFromRole}
                                                                        />
                                                                        <div className="space-y-1 flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label 
                                                                                    htmlFor={`permission-${permission.id}`} 
                                                                                    className={`text-sm font-medium ${
                                                                                        isFromRole ? 'text-blue-700' : ''
                                                                                    }`}
                                                                                >
                                                                                    {permission.display_name || permission.name || 'Unnamed Permission'}
                                                                                    {isFromRole && (
                                                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                                                            From Role
                                                                                        </span>
                                                                                    )}
                                                                                </Label>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {permission.name}
                                                                                </span>
                                                                            </div>
                                                                            {permission.description && (
                                                                                <p className="text-xs text-gray-500">
                                                                                    {permission.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Permissions Summary */}
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Permissions Summary:</span>
                                                <span className="text-sm">
                                                    {localSelectedPermissions.length} custom + {selectedRolePermissions.length} from role
                                                </span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {localSelectedPermissions.map(permissionId => {
                                                    const permission = getPermissionById(permissionId);
                                                    if (!permission) return null;
                                                    
                                                    return (
                                                        <span 
                                                            key={permissionId}
                                                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                                        >
                                                            {permission.display_name || permission.name || 'Unknown Permission'}
                                                        </span>
                                                    );
                                                })}
                                                {selectedRolePermissions.map(permissionId => {
                                                    const permission = getPermissionById(permissionId);
                                                    if (!permission) return null;
                                                    
                                                    return (
                                                        <span 
                                                            key={`role-${permissionId}`}
                                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                                        >
                                                            {permission.display_name || permission.name || 'Unknown Permission'}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Summary & Actions */}
                        <div className="space-y-6">
                            {/* Account Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Total Permissions:</span>
                                            <span className="font-medium">
                                                {selectedPermissionsCount}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 rounded-full" 
                                                style={{ 
                                                    width: `${Math.min(
                                                        (selectedPermissionsCount / Math.max(totalPermissionsCount, 1)) * 100, 
                                                        100
                                                    )}%` 
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="pt-4 space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id="status" 
                                                    checked={data.status === 'active'}
                                                    onCheckedChange={(checked) => 
                                                        setData('status', checked ? 'active' : 'inactive')
                                                    }
                                                />
                                                <Label htmlFor="status" className="text-sm">
                                                    Account is active
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <User className="h-8 w-8 text-gray-600" />
                                        </div>
                                        <div className="font-medium">
                                            {data.first_name || data.last_name 
                                                ? `${data.first_name} ${data.last_name}`.trim() 
                                                : 'New User'
                                            }
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {selectedRole?.name || 'No role selected'}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {selectedDepartment?.name || 'No department'}
                                        </div>
                                        <div className="mt-2 text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className={`h-2 w-2 rounded-full ${data.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span>{data.status === 'active' ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Department Info */}
                            {selectedDepartment && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Department Info
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <div className="text-gray-500">Department:</div>
                                                <div className="font-medium">{selectedDepartment.name}</div>
                                            </div>
                                            {selectedDepartment.description && (
                                                <div>
                                                    <div className="text-gray-500">Description:</div>
                                                    <div className="font-medium">{selectedDepartment.description}</div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={clearForm}
                                    >
                                        Clear Form
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={() => {
                                            console.log('Save as draft');
                                        }}
                                    >
                                        Save as Draft
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={() => {
                                            window.print();
                                        }}
                                    >
                                        Print User Credentials
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <div>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={clearForm}
                                disabled={processing}
                            >
                                Clear Form
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                disabled={processing}
                                onClick={() => {
                                    console.log('Save as draft clicked');
                                }}
                            >
                                Save as Draft
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Creating...' : 'Create User Account'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}