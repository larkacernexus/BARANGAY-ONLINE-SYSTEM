import AppLayout from '@/layouts/admin-app-layout';
import { useForm } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { Permission, Role, Department, User as UserType } from '@/types';
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
    UserPlus,
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
    ShieldAlert
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

interface EditUserProps {
    user: UserType & {
        permissions?: Permission[];
        roles?: Role[];
        department?: Department;
    };
    permissions: Record<string, Permission[]>;
    roles: Role[];
    departments: Department[];
}

export default function EditUser({ user, permissions = {}, roles = [], departments = [] }: EditUserProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
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
        selected_permissions: user?.permissions?.map(p => p.id) || [] as number[],
        status: user?.status || 'active',
        require_password_change: user?.require_password_change || false,
        is_email_verified: user?.email_verified_at !== null,
        send_reset_email: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([]);
    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
    const [localSelectedPermissions, setLocalSelectedPermissions] = useState<number[]>([]);
    const [passwordResetMode, setPasswordResetMode] = useState(false);

    // Sync local state with form data
    useEffect(() => {
        if (Array.isArray(data.selected_permissions)) {
            setLocalSelectedPermissions(data.selected_permissions);
        }
    }, [data.selected_permissions]);

    // Load user's initial data
    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                username: user.username || '',
                password: '',
                password_confirmation: '',
                contact_number: user.contact_number || '',
                position: user.position || '',
                department_id: user.department_id?.toString() || '',
                role_id: user.roles?.[0]?.id?.toString() || '',
                selected_permissions: user.permissions?.map(p => p.id) || [],
                status: user.status || 'active',
                require_password_change: user.require_password_change || false,
                is_email_verified: user.email_verified_at !== null,
                send_reset_email: false,
            });
            
            // Set local permissions
            setLocalSelectedPermissions(user.permissions?.map(p => p.id) || []);
        }
    }, [user]);

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
        setPasswordResetMode(true);
        
        setTimeout(() => setIsGeneratingPassword(false), 500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    const handleDeleteUser = () => {
        // This would trigger a delete request
        // Inertia.delete(`/users/${user.id}`);
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

    // Loading state if data is not ready
    if (!user || !permissions || !roles || !departments) {
        return (
            <AppLayout
                title="Edit User"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Users', href: '/users' },
                    { title: 'Edit User', href: `/users/${user?.id}/edit` }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading user data...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title={`Edit ${user.first_name} ${user.last_name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Users', href: '/users' },
                { title: `${user.first_name} ${user.last_name}`, href: `/users/${user.id}` },
                { title: 'Edit', href: `/users/${user.id}/edit` }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/users">
                                <Button variant="ghost" size="sm" type="button" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Users
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight dark:text-white">
                                    Edit User: {user.first_name} {user.last_name}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    User ID: {user.id} • Created: {createdAt}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" type="button" className="dark:bg-red-900 dark:hover:bg-red-800">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete User
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="dark:text-gray-400">
                                            This action cannot be undone. This will permanently delete the user account
                                            and remove all associated data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteUser}
                                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                        >
                                            Delete User
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button type="submit" disabled={processing} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {/* User Status Alert */}
                    {user.status !== data.status && (
                        <Alert className="dark:bg-yellow-950 dark:border-yellow-800">
                            <AlertCircle className="h-4 w-4 dark:text-yellow-400" />
                            <AlertDescription className="dark:text-yellow-400">
                                User status will be changed from <strong>{user.status}</strong> to <strong>{data.status}</strong>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - User Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
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
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name" className="dark:text-gray-300">First Name *</Label>
                                            <Input 
                                                id="first_name" 
                                                placeholder="Juan" 
                                                required 
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.first_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name" className="dark:text-gray-300">Last Name *</Label>
                                            <Input 
                                                id="last_name" 
                                                placeholder="Dela Cruz" 
                                                required 
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="dark:text-gray-300">Email Address *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="juan@barangaykibawe.ph" 
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white" 
                                                    required 
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                                            )}
                                            {user.email_verified_at && (
                                                <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800">
                                                    ✓ Email Verified
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number" className="dark:text-gray-300">Contact Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="contact_number" 
                                                    placeholder="09123456789" 
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white" 
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
                                                required 
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                            {errors.username && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.username}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="position" className="dark:text-gray-300">Position/Title</Label>
                                            <Input 
                                                id="position" 
                                                placeholder="Barangay Secretary" 
                                                value={data.position}
                                                onChange={(e) => setData('position', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="department_id" className="dark:text-gray-300">Department *</Label>
                                            <Select 
                                                value={data.department_id} 
                                                onValueChange={(value) => setData('department_id', value)}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {Array.isArray(departments) && departments.map((dept) => (
                                                        dept && dept.id && (
                                                            <SelectItem key={dept.id} value={dept.id.toString()} className="dark:text-white dark:focus:bg-gray-700">
                                                                {dept.name || 'Unnamed Department'}
                                                            </SelectItem>
                                                        )
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.department_id && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.department_id}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role_id" className="dark:text-gray-300">User Role *</Label>
                                            <Select 
                                                value={data.role_id} 
                                                onValueChange={(value) => setData('role_id', value)}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {Array.isArray(roles) && roles.map((role) => (
                                                        role && role.id && (
                                                            <SelectItem key={role.id} value={role.id.toString()} className="dark:text-white dark:focus:bg-gray-700">
                                                                <div>
                                                                    <div className="font-medium">{role.name || 'Unnamed Role'}</div>
                                                                    {role.description && (
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{role.description}</div>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.role_id && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.role_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security & Access */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
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
                                        <Alert className="dark:bg-blue-950 dark:border-blue-800">
                                            <AlertCircle className="h-4 w-4 dark:text-blue-400" />
                                            <AlertDescription className="dark:text-blue-400">
                                                Password reset mode active. Leave blank to keep current password.
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="ml-2 dark:text-blue-400 dark:hover:text-blue-300"
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
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="password" 
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
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
                                                    className="absolute right-0 top-0 h-full px-3 dark:text-gray-400 dark:hover:text-white"
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
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.password}</p>
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
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.password_confirmation}</p>
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
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            {isGeneratingPassword ? 'Generating...' : 'Generate New Password'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleForcePasswordReset}
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Force Password Reset
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setData('send_reset_email', !data.send_reset_email)}
                                            className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 ${
                                                data.send_reset_email ? 'dark:bg-blue-600 dark:hover:bg-blue-700' : ''
                                            }`}
                                        >
                                            {data.send_reset_email ? '✓ ' : ''}Send Reset Email
                                        </Button>
                                    </div>

                                    <Separator className="dark:bg-gray-700" />

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="requirePasswordChange" 
                                                checked={data.require_password_change}
                                                onCheckedChange={(checked) => 
                                                    setData('require_password_change', checked as boolean)
                                                }
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="requirePasswordChange" className="text-sm dark:text-gray-300">
                                                Require password change on next login
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="is_email_verified" 
                                                checked={data.is_email_verified}
                                                onCheckedChange={(checked) => 
                                                    setData('is_email_verified', checked as boolean)
                                                }
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="is_email_verified" className="text-sm dark:text-gray-300">
                                                Email verified
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permissions */}
                            {permissionModules.length > 0 && (
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
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
                                                            <Label className="text-base font-semibold dark:text-white">{module || 'Uncategorized'}</Label>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleAllPermissions(module, safePermissions)}
                                                                className="dark:text-gray-400 dark:hover:text-white"
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
                                                                const hadPermission = user.permissions?.some(p => p.id === permissionId);
                                                                
                                                                return (
                                                                    <div 
                                                                        key={permission.id}
                                                                        className={`flex items-start space-x-2 p-3 rounded-lg border ${
                                                                            isFromRole 
                                                                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' 
                                                                                : hadPermission && !isSelected
                                                                                ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50'
                                                                                : 'border-gray-200 dark:border-gray-700'
                                                                        }`}
                                                                    >
                                                                        <Checkbox 
                                                                            id={`permission-${permission.id}`}
                                                                            checked={isSelected || isFromRole}
                                                                            onCheckedChange={() => togglePermission(permissionId)}
                                                                            disabled={isFromRole}
                                                                            className="dark:border-gray-600"
                                                                        />
                                                                        <div className="space-y-1 flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label 
                                                                                    htmlFor={`permission-${permission.id}`} 
                                                                                    className={`text-sm font-medium ${
                                                                                        isFromRole ? 'text-blue-700 dark:text-blue-400' : 
                                                                                        hadPermission && !isSelected ? 'text-yellow-700 dark:text-yellow-400' : 'dark:text-gray-300'
                                                                                    }`}
                                                                                >
                                                                                    {permission.display_name || permission.name || 'Unnamed Permission'}
                                                                                    {isFromRole && (
                                                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                                                                                            From Role
                                                                                        </span>
                                                                                    )}
                                                                                    {hadPermission && !isSelected && !isFromRole && (
                                                                                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
                                                                                            Removing
                                                                                        </span>
                                                                                    )}
                                                                                </Label>
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                    {permission.name}
                                                                                </span>
                                                                            </div>
                                                                            {permission.description && (
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
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
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-900">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium dark:text-gray-300">Permissions Summary:</span>
                                                <span className="text-sm dark:text-gray-300">
                                                    {localSelectedPermissions.length} custom + {selectedRolePermissions.length} from role
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                Previously: {user.permissions?.length || 0} permissions
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {localSelectedPermissions.map(permissionId => {
                                                    const permission = getPermissionById(permissionId);
                                                    if (!permission) return null;
                                                    
                                                    const hadPermission = user.permissions?.some(p => p.id === permissionId);
                                                    
                                                    return (
                                                        <span 
                                                            key={permissionId}
                                                            className={`text-xs px-2 py-1 rounded ${
                                                                hadPermission 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                                                            }`}
                                                        >
                                                            {permission.display_name || permission.name || 'Unknown Permission'}
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
                                                            className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 px-2 py-1 rounded"
                                                        >
                                                            {permission.display_name || permission.name || 'Unknown Permission'} (role)
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
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
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
                                                className="h-full bg-green-500 rounded-full" 
                                                style={{ 
                                                    width: `${Math.min(
                                                        (selectedPermissionsCount / Math.max(totalPermissionsCount, 1)) * 100, 
                                                        100
                                                    )}%` 
                                                }}
                                            />
                                        </div>
                                        
                                        <Separator className="dark:bg-gray-700" />
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id="status" 
                                                    checked={data.status === 'active'}
                                                    onCheckedChange={(checked) => 
                                                        setData('status', checked ? 'active' : 'inactive')
                                                    }
                                                    className="dark:border-gray-600"
                                                />
                                                <Label htmlFor="status" className="text-sm dark:text-gray-300">
                                                    Account is active
                                                </Label>
                                            </div>
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

                            {/* User Preview */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">User Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center text-center p-4 border rounded-lg dark:border-gray-700">
                                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
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
                                        <div className="mt-2 text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className={`h-2 w-2 rounded-full ${data.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="dark:text-gray-300">{data.status === 'active' ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                            ID: {user.id}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Department Info */}
                            {(selectedDepartment || user.department) && (
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-white">
                                            <Building className="h-5 w-5" />
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

                            {/* Danger Zone */}
                            <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Irreversible and destructive actions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50"
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
                                                    onClick={() => updateSelectedPermissions([])}
                                                    className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                                                >
                                                    Reset Permissions
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="destructive"
                                                className="w-full justify-start dark:bg-red-900 dark:hover:bg-red-800"
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
                                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
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
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            User last updated: {new Date(user.updated_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/users/${user.id}`}>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    disabled={processing}
                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                >
                                    View Profile
                                </Button>
                            </Link>
                            <Button 
                                type="button" 
                                variant="outline" 
                                disabled={processing}
                                onClick={() => {
                                    // Reset form to original values
                                    reset({
                                        first_name: user.first_name || '',
                                        last_name: user.last_name || '',
                                        email: user.email || '',
                                        username: user.username || '',
                                        password: '',
                                        password_confirmation: '',
                                        contact_number: user.contact_number || '',
                                        position: user.position || '',
                                        department_id: user.department_id?.toString() || '',
                                        role_id: user.roles?.[0]?.id?.toString() || '',
                                        selected_permissions: user.permissions?.map(p => p.id) || [],
                                        status: user.status || 'active',
                                        require_password_change: user.require_password_change || false,
                                        is_email_verified: user.email_verified_at !== null,
                                        send_reset_email: false,
                                    });
                                    setLocalSelectedPermissions(user.permissions?.map(p => p.id) || []);
                                    setPasswordResetMode(false);
                                }}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                Reset Changes
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}