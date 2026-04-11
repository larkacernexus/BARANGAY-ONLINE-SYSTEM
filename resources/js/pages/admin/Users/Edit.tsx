// pages/admin/users/edit.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { useForm } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
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
    Trash2,
    Mail,
    Lock,
    Phone,
    Shield,
    Building,
    Eye,
    EyeOff,
    Copy,
    User as UserIcon,
    AlertCircle,
    RefreshCw,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import type { 
    Permission, 
    UserRole as Role, 
    UserDepartment as Department,
    User,
    UserStatus
} from '@/types/admin/users/user-types';

interface EditUserProps {
    user: User & {
        permissions?: Permission[];
        roles?: Role[];
        department?: Department;
        username?: string;
        contact_number?: string;
        position?: string;
        require_password_change?: boolean;
    };
    permissions: Record<string, Permission[]>;
    roles: Role[];
    departments: Department[];
}

// Update FormData to match the actual status options available for editing
interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    contact_number: string;
    position: string;
    department_id: string;
    role_id: string;
    selected_permissions: number[];
    status: 'active' | 'inactive';
    require_password_change: boolean;
    is_email_verified: boolean;
    send_reset_email: boolean;
}

// Helper function to convert UserStatus to editable status
const getEditableStatus = (status: UserStatus): 'active' | 'inactive' => {
    if (status === 'suspended') {
        return 'inactive';
    }
    return status === 'active' ? 'active' : 'inactive';
};

// Helper to get initial form data
const getInitialFormData = (user: EditUserProps['user']): FormData => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || '',
    password: '',
    password_confirmation: '',
    contact_number: user?.contact_number || '',
    position: user?.position || '',
    department_id: user?.department_id?.toString() || '',
    role_id: user?.roles?.[0]?.id?.toString() || '',
    selected_permissions: user?.permissions?.map(p => p.id) || [],
    status: getEditableStatus(user?.status || 'inactive'),
    require_password_change: user?.require_password_change || false,
    is_email_verified: user?.email_verified_at !== null,
    send_reset_email: false,
});

export default function EditUser({ user, permissions = {}, roles = [], departments = [] }: EditUserProps) {
    const { data, setData, put, processing, errors, reset } = useForm<FormData>(
        getInitialFormData(user)
    );

    const [showPassword, setShowPassword] = useState(false);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([]);
    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
    const [localSelectedPermissions, setLocalSelectedPermissions] = useState<number[]>([]);
    const [passwordResetMode, setPasswordResetMode] = useState(false);
    const [isResettingPermissions, setIsResettingPermissions] = useState(false);

    // Sync local state with form data
    useEffect(() => {
        if (Array.isArray(data.selected_permissions)) {
            setLocalSelectedPermissions(data.selected_permissions);
        }
    }, [data.selected_permissions]);

    // Load user's initial data when user changes
    useEffect(() => {
        if (user) {
            const initialData = getInitialFormData(user);
            // Reset each field individually
            setData('first_name', initialData.first_name);
            setData('last_name', initialData.last_name);
            setData('email', initialData.email);
            setData('username', initialData.username);
            setData('password', initialData.password);
            setData('password_confirmation', initialData.password_confirmation);
            setData('contact_number', initialData.contact_number);
            setData('position', initialData.position);
            setData('department_id', initialData.department_id);
            setData('role_id', initialData.role_id);
            setData('selected_permissions', initialData.selected_permissions);
            setData('status', initialData.status);
            setData('require_password_change', initialData.require_password_change);
            setData('is_email_verified', initialData.is_email_verified);
            setData('send_reset_email', initialData.send_reset_email);
            
            setLocalSelectedPermissions(user.permissions?.map(p => p.id) || []);
            setPasswordResetMode(false);
        }
    }, [user, setData]);

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

    const togglePermission = (permissionId: number) => {
        if (!permissionId) return;
        
        if (localSelectedPermissions.includes(permissionId)) {
            const newPermissions = localSelectedPermissions.filter(id => id !== permissionId);
            updateSelectedPermissions(newPermissions);
        } else {
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
            const newPermissions = localSelectedPermissions.filter(id => !permissionIds.includes(id));
            updateSelectedPermissions(newPermissions);
        } else {
            const newIds = permissionIds.filter(id => !localSelectedPermissions.includes(id));
            const newPermissions = [...localSelectedPermissions, ...newIds];
            updateSelectedPermissions(newPermissions);
        }
    };

    const generatePassword = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleGeneratePassword = () => {
        setIsGeneratingPassword(true);
        const newPassword = generatePassword();
        setData({
            ...data,
            password: newPassword,
            password_confirmation: newPassword,
        });
        setPasswordResetMode(true);
        
        setTimeout(() => setIsGeneratingPassword(false), 500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    const handleDeleteUser = () => {
        console.log('Delete user:', user.id);
    };

    const handleForcePasswordReset = () => {
        handleGeneratePassword();
        setData('require_password_change', true);
        setData('send_reset_email', true);
    };

    const clearPasswordFields = () => {
        setData({
            ...data,
            password: '',
            password_confirmation: '',
        });
        setPasswordResetMode(false);
    };

    const handleResetPermissions = () => {
        setIsResettingPermissions(true);
        updateSelectedPermissions([]);
        setTimeout(() => setIsResettingPermissions(false), 500);
    };

    const handleResetForm = () => {
        const initialData = getInitialFormData(user);
        setData('first_name', initialData.first_name);
        setData('last_name', initialData.last_name);
        setData('email', initialData.email);
        setData('username', initialData.username);
        setData('password', initialData.password);
        setData('password_confirmation', initialData.password_confirmation);
        setData('contact_number', initialData.contact_number);
        setData('position', initialData.position);
        setData('department_id', initialData.department_id);
        setData('role_id', initialData.role_id);
        setData('selected_permissions', initialData.selected_permissions);
        setData('status', initialData.status);
        setData('require_password_change', initialData.require_password_change);
        setData('is_email_verified', initialData.is_email_verified);
        setData('send_reset_email', initialData.send_reset_email);
        
        setLocalSelectedPermissions(user.permissions?.map(p => p.id) || []);
        setPasswordResetMode(false);
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

    // User activity info
    const lastLogin = user.last_login_at 
        ? new Date(user.last_login_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Never';

    const createdAt = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const updatedAt = new Date(user.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Loading state if data is not ready
    if (!user || !permissions || !roles || !departments) {
        return (
            <AppLayout
                title="Edit User"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Users', href: '/admin/users' },
                    { title: 'Edit User', href: `/admin/users/${user?.id}/edit` }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading user data...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <TooltipProvider>
            <AppLayout
                title={`Edit ${user.first_name} ${user.last_name}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Users', href: '/admin/users' },
                    { title: `${user.first_name} ${user.last_name}`, href: `/admin/users/${user.id}` },
                    { title: 'Edit', href: `/admin/users/${user.id}/edit` }
                ]}
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/users">
                                    <Button variant="outline" size="sm" type="button" className="dark:border-gray-600 dark:text-gray-300">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Users
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">
                                        Edit User: {user.first_name} {user.last_name}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        User ID: {user.id} • Created: {createdAt}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={processing} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm">
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>

                        {/* Validation Errors Summary */}
                        {Object.keys(errors).length > 0 && (
                            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="font-medium">Please fix the following errors:</span>
                                    </div>
                                    <ul className="mt-2 list-disc list-inside text-sm text-red-600 dark:text-red-400">
                                        {Object.entries(errors).map(([key, error]) => (
                                            <li key={key}>{key}: {error}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* User Status Alert */}
                        {user.status !== data.status && (
                            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                <AlertDescription className="text-yellow-800 dark:text-yellow-400">
                                    User status will be changed from <strong>{user.status}</strong> to <strong>{data.status}</strong>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Suspended User Notice */}
                        {user.status === 'suspended' && (
                            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <AlertDescription className="text-red-800 dark:text-red-400">
                                    This account is currently suspended. To reactivate, change status to active.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - User Information */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information Card - Keep existing JSX */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <UserIcon className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Update the user's personal details
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Form fields remain the same */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name" className="dark:text-gray-300">First Name *</Label>
                                                <Input 
                                                    id="first_name" 
                                                    placeholder="Juan" 
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                                {errors.first_name && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name" className="dark:text-gray-300">Last Name *</Label>
                                                <Input 
                                                    id="last_name" 
                                                    placeholder="Dela Cruz" 
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                                {errors.last_name && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="dark:text-gray-300">Email Address *</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input 
                                                        id="email" 
                                                        type="email" 
                                                        placeholder="juan@example.com" 
                                                        className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                                )}
                                                {user.email_verified_at && (
                                                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                        ✓ Email Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_number" className="dark:text-gray-300">Contact Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input 
                                                        id="contact_number" 
                                                        placeholder="09123456789" 
                                                        className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
                                                        value={data.contact_number}
                                                        onChange={(e) => setData('contact_number', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="dark:text-gray-300">Username *</Label>
                                                <Input 
                                                    id="username" 
                                                    placeholder="juan.delacruz" 
                                                    value={data.username}
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                                {errors.username && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="position" className="dark:text-gray-300">Position/Title</Label>
                                                <Input 
                                                    id="position" 
                                                    placeholder="Barangay Secretary" 
                                                    value={data.position}
                                                    onChange={(e) => setData('position', e.target.value)}
                                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="department_id" className="dark:text-gray-300">Department</Label>
                                                <Select 
                                                    value={data.department_id} 
                                                    onValueChange={(value) => setData('department_id', value)}
                                                >
                                                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                                        <SelectItem value="">No Department</SelectItem>
                                                        {Array.isArray(departments) && departments.map((dept) => (
                                                            dept && dept.id && (
                                                                <SelectItem key={dept.id} value={dept.id.toString()} className="dark:text-white">
                                                                    {dept.name || 'Unnamed Department'}
                                                                </SelectItem>
                                                            )
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role_id" className="dark:text-gray-300">User Role *</Label>
                                                <Select 
                                                    value={data.role_id} 
                                                    onValueChange={(value) => setData('role_id', value)}
                                                >
                                                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                                        <SelectItem value="">No Role</SelectItem>
                                                        {Array.isArray(roles) && roles.map((role) => (
                                                            role && role.id && (
                                                                <SelectItem key={role.id} value={role.id.toString()} className="dark:text-white">
                                                                    {role.name || 'Unnamed Role'}
                                                                </SelectItem>
                                                            )
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.role_id && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.role_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Security & Access Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <ShieldAlert className="h-5 w-5" />
                                            Security & Access
                                        </CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Manage password and security settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {passwordResetMode && (
                                            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                                                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <AlertDescription className="text-blue-800 dark:text-blue-400">
                                                    Password reset mode active. Leave blank to keep current password.
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="ml-2 text-blue-600 dark:text-blue-400"
                                                        onClick={clearPasswordFields}
                                                    >
                                                        Cancel Reset
                                                    </Button>
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="dark:text-gray-300">
                                                    New Password {!passwordResetMode && '(Leave blank to keep current)'}
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input 
                                                        id="password" 
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter new password"
                                                        className="pl-10 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                        value={data.password}
                                                        onChange={(e) => {
                                                            setData('password', e.target.value);
                                                            if (e.target.value) {
                                                                setPasswordResetMode(true);
                                                            }
                                                        }}
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
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation" className="dark:text-gray-300">Confirm New Password</Label>
                                                <Input 
                                                    id="password_confirmation" 
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                                {errors.password_confirmation && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={handleGeneratePassword}
                                                        disabled={isGeneratingPassword}
                                                        className="dark:border-gray-600 dark:text-gray-300"
                                                    >
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        {isGeneratingPassword ? 'Generating...' : 'Generate Password'}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Generate a random secure password</TooltipContent>
                                            </Tooltip>
                                            
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={handleForcePasswordReset}
                                                        className="dark:border-gray-600 dark:text-gray-300"
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Force Reset
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Force password reset on next login</TooltipContent>
                                            </Tooltip>
                                            
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setData('send_reset_email', !data.send_reset_email)}
                                                className={`dark:border-gray-600 ${data.send_reset_email ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                                            >
                                                {data.send_reset_email ? (
                                                    <span className="text-green-600 dark:text-green-400">✓ </span>
                                                ) : null}
                                                Send Reset Email
                                            </Button>
                                        </div>

                                        <Separator className="dark:bg-gray-800" />

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700">
                                                <Checkbox 
                                                    id="requirePasswordChange" 
                                                    checked={data.require_password_change}
                                                    onCheckedChange={(checked) => 
                                                        setData('require_password_change', checked as boolean)
                                                    }
                                                    className="dark:border-gray-600"
                                                />
                                                <Label htmlFor="requirePasswordChange" className="text-sm cursor-pointer dark:text-gray-300">
                                                    Require password change on next login
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700">
                                                <Checkbox 
                                                    id="is_email_verified" 
                                                    checked={data.is_email_verified}
                                                    onCheckedChange={(checked) => 
                                                        setData('is_email_verified', checked as boolean)
                                                    }
                                                    className="dark:border-gray-600"
                                                />
                                                <Label htmlFor="is_email_verified" className="text-sm cursor-pointer dark:text-gray-300">
                                                    Mark email as verified
                                                </Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Permissions Section - Keep existing JSX */}
                                {permissionModules.length > 0 && (
                                    <Card className="dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                                <Shield className="h-5 w-5" />
                                                System Permissions
                                            </CardTitle>
                                            <CardDescription className="dark:text-gray-400">
                                                Current permissions: {user.permissions?.length || 0} direct permissions
                                                {user.roles?.[0] && ` + ${user.roles[0].permissions?.length || 0} from role`}
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
                                                                <Label className="text-base font-semibold dark:text-white">{module}</Label>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleAllPermissions(module, safePermissions)}
                                                                    className="dark:text-gray-400"
                                                                >
                                                                    Toggle All
                                                                </Button>
                                                            </div>
                                                            <div className="grid gap-3 md:grid-cols-2">
                                                                {safePermissions.map((permission) => {
                                                                    if (!permission || permission.id === undefined) return null;
                                                                    
                                                                    const permissionId = permission.id;
                                                                    const isFromRole = selectedRolePermissions.includes(permissionId);
                                                                    const isSelected = localSelectedPermissions.includes(permissionId);
                                                                    const hadPermission = user.permissions?.some(p => p.id === permissionId);
                                                                    
                                                                    return (
                                                                        <div 
                                                                            key={permission.id}
                                                                            className={`flex items-start space-x-2 p-3 rounded-lg border ${
                                                                                isFromRole 
                                                                                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30' 
                                                                                    : hadPermission && !isSelected
                                                                                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30'
                                                                                    : 'border-gray-200 dark:border-gray-700'
                                                                            }`}
                                                                        >
                                                                            <Checkbox 
                                                                                id={`permission-${permission.id}`}
                                                                                checked={isSelected || isFromRole}
                                                                                onCheckedChange={() => togglePermission(permissionId)}
                                                                                disabled={isFromRole}
                                                                                className="mt-0.5 dark:border-gray-600"
                                                                            />
                                                                            <div className="space-y-1 flex-1">
                                                                                <div className="flex items-center justify-between flex-wrap gap-1">
                                                                                    <Label 
                                                                                        htmlFor={`permission-${permission.id}`} 
                                                                                        className={`text-sm font-medium cursor-pointer ${
                                                                                            isFromRole ? 'text-blue-700 dark:text-blue-400' : 
                                                                                            hadPermission && !isSelected ? 'text-yellow-700 dark:text-yellow-400' : 'dark:text-gray-300'
                                                                                        }`}
                                                                                    >
                                                                                        {permission.display_name || permission.name}
                                                                                        {isFromRole && (
                                                                                            <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                                                From Role
                                                                                            </Badge>
                                                                                        )}
                                                                                        {hadPermission && !isSelected && !isFromRole && (
                                                                                            <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                                                Removing
                                                                                            </Badge>
                                                                                        )}
                                                                                    </Label>
                                                                                </div>
                                                                                {permission.description && (
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {permission.description}
                                                                                    </p>
                                                                                )}
                                                                                <code className="text-xs text-gray-400 dark:text-gray-500">
                                                                                    {permission.name}
                                                                                </code>
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
                                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-medium dark:text-gray-300">Permissions Summary:</span>
                                                    <span className="text-sm dark:text-gray-300">
                                                        {localSelectedPermissions.length} custom + {selectedRolePermissions.length} from role
                                                    </span>
                                                </div>
                                                {user.permissions && user.permissions.length > 0 && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        Previously: {user.permissions.length} permissions
                                                    </div>
                                                )}
                                                <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                                                    {localSelectedPermissions.map(permissionId => {
                                                        const permission = getPermissionById(permissionId);
                                                        if (!permission) return null;
                                                        
                                                        const hadPermission = user.permissions?.some(p => p.id === permissionId);
                                                        
                                                        return (
                                                            <span 
                                                                key={permissionId}
                                                                className={`text-xs px-2 py-1 rounded ${
                                                                    hadPermission 
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                }`}
                                                            >
                                                                {permission.display_name || permission.name}
                                                                {!hadPermission && <span className="ml-1">(new)</span>}
                                                            </span>
                                                        );
                                                    })}
                                                    {selectedRolePermissions.map(permissionId => {
                                                        const permission = getPermissionById(permissionId);
                                                        if (!permission) return null;
                                                        
                                                        return (
                                                            <span 
                                                                key={`role-${permissionId}`}
                                                                className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded"
                                                            >
                                                                {permission.display_name || permission.name} (role)
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
                                {/* Account Status Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">Account Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Total Permissions:</span>
                                                <span className="font-medium dark:text-white">
                                                    {selectedPermissionsCount}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                                                    style={{ 
                                                        width: `${Math.min(
                                                            (selectedPermissionsCount / Math.max(totalPermissionsCount, 1)) * 100, 
                                                            100
                                                        )}%` 
                                                    }}
                                                />
                                            </div>
                                            
                                            <Separator className="dark:bg-gray-800" />
                                            
                                            <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700">
                                                <Checkbox 
                                                    id="status" 
                                                    checked={data.status === 'active'}
                                                    onCheckedChange={(checked) => 
                                                        setData('status', checked ? 'active' : 'inactive')
                                                    }
                                                    className="dark:border-gray-600"
                                                />
                                                <Label htmlFor="status" className="text-sm cursor-pointer dark:text-gray-300">
                                                    Account is active
                                                </Label>
                                            </div>
                                        </div>

                                        {/* Account Activity */}
                                        <div className="pt-4 space-y-3">
                                            <h4 className="text-sm font-medium dark:text-gray-300">Account Activity</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                                                    <span className="dark:text-gray-300">{lastLogin}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                                    <span className="dark:text-gray-300">{createdAt}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                                                    <span className="dark:text-gray-300">{updatedAt}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Email Verified:</span>
                                                    <span className="dark:text-gray-300">
                                                        {user.email_verified_at 
                                                            ? new Date(user.email_verified_at).toLocaleDateString()
                                                            : 'Not Verified'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* User Preview Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">User Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col items-center text-center p-4 border rounded-lg dark:border-gray-700">
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-3">
                                                <UserIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div className="font-medium dark:text-white">
                                                {data.first_name || data.last_name 
                                                    ? `${data.first_name} ${data.last_name}`.trim() 
                                                    : user.first_name || user.last_name
                                                    ? `${user.first_name} ${user.last_name}`.trim()
                                                    : 'No name'
                                                }
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {selectedRole?.name || user.roles?.[0]?.name || 'No role selected'}
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {selectedDepartment?.name || user.department?.name || 'No department'}
                                            </div>
                                            <div className="mt-2">
                                                <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
                                                    {data.status === 'active' ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                                ID: {user.id}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Department Info Card */}
                                {(selectedDepartment || user.department) && (
                                    <Card className="dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 dark:text-white">
                                                <Building className="h-4 w-4" />
                                                Department Info
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <div className="text-gray-500 dark:text-gray-400">Department:</div>
                                                    <div className="font-medium dark:text-white">
                                                        {selectedDepartment?.name || user.department?.name}
                                                    </div>
                                                </div>
                                                {(selectedDepartment?.description || user.department?.description) && (
                                                    <div>
                                                        <div className="text-gray-500 dark:text-gray-400">Description:</div>
                                                        <div className="font-medium dark:text-white">
                                                            {selectedDepartment?.description || user.department?.description}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Danger Zone Card */}
                                <Card className="border-red-200 dark:border-red-900">
                                    <CardHeader>
                                        <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Danger Zone
                                        </CardTitle>
                                        <CardDescription className="text-red-600 dark:text-red-400">
                                            Irreversible and destructive actions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full justify-start text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-950/30"
                                                >
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Reset All Permissions
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="dark:text-white">Reset all permissions?</AlertDialogTitle>
                                                    <AlertDialogDescription className="dark:text-gray-400">
                                                        This will remove all custom permissions and only keep role-based permissions.
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleResetPermissions}
                                                        disabled={isResettingPermissions}
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                                    >
                                                        {isResettingPermissions ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Resetting...
                                                            </>
                                                        ) : (
                                                            'Reset Permissions'
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="destructive"
                                                    className="w-full justify-start"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete User Account
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="dark:text-white">Delete this user?</AlertDialogTitle>
                                                    <AlertDialogDescription className="dark:text-gray-400">
                                                        This will permanently delete the user account and all associated data.
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDeleteUser}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Delete User
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-between pt-6 border-t dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Last updated: {updatedAt}
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/admin/users/${user.id}`}>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        disabled={processing}
                                        className="dark:border-gray-600 dark:text-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    disabled={processing}
                                    onClick={handleResetForm}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    Reset Changes
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </AppLayout>
        </TooltipProvider>
    );
}