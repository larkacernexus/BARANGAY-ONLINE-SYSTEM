// pages/admin/users/create.tsx

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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    User,
    Hash,
    Key,
    AlertCircle,
    Info,
    BookOpen,
    Users,
    Crown,
    Briefcase,
    Calendar,
    CheckCircle,
    XCircle
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
        department_id: '', // Added this field
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
        post('/admin/users');
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

    const selectedRole = useMemo(() => {
        if (!Array.isArray(roles) || !data.role_id) return null;
        return roles.find(role => role && role.id && role.id.toString() === data.role_id.toString()) || null;
    }, [roles, data.role_id]);

    // Add this selectedDepartment memo
    const selectedDepartment = useMemo(() => {
        if (!Array.isArray(departments) || !data.department_id) return null;
        return departments.find(dept => dept && dept.id && dept.id.toString() === data.department_id.toString()) || null;
    }, [departments, data.department_id]);

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
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Users', href: '/admin/users' },
                    { title: 'Add User', href: '/admin/users/create' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading user creation form...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Add User"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Users', href: '/admin/users' },
                { title: 'Add User', href: '/admin/users/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/users">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <UserPlus className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Create New User
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Add a new user account with specific permissions
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save User'}
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - User Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                            <UserPlus className="h-3 w-3 text-white" />
                                        </div>
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Enter the user's personal details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name" className="dark:text-gray-300">
                                                First Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                id="first_name" 
                                                placeholder="Juan" 
                                                required 
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name" className="dark:text-gray-300">
                                                Last Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                id="last_name" 
                                                placeholder="Dela Cruz" 
                                                required 
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            {errors.last_name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="dark:text-gray-300">
                                                Email Address <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="juan@barangaykibawe.ph" 
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                                    required 
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number" className="dark:text-gray-300">Contact Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="contact_number" 
                                                    placeholder="09123456789" 
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300" 
                                                    value={data.contact_number}
                                                    onChange={(e) => setData('contact_number', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="dark:text-gray-300">
                                                Username <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="username" 
                                                    placeholder="juan.delacruz" 
                                                    required 
                                                    value={data.username}
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                            </div>
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
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {Array.isArray(departments) && departments.map((dept) => (
                                                        dept && dept.id && (
                                                            <SelectItem key={dept.id} value={dept.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                                <div>
                                                                    <div className="font-medium dark:text-gray-200">{dept.name || 'Unnamed Department'}</div>
                                                                    {dept.description && (
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{dept.description}</div>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role_id" className="dark:text-gray-300">
                                                User Role <span className="text-red-500">*</span>
                                            </Label>
                                            <Select 
                                                value={data.role_id} 
                                                onValueChange={(value) => setData('role_id', value)}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {Array.isArray(roles) && roles.map((role) => (
                                                        role && role.id && (
                                                            <SelectItem key={role.id} value={role.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                                <div>
                                                                    <div className="font-medium dark:text-gray-200">{role.name || 'Unnamed Role'}</div>
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
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.role_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security & Access */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <Lock className="h-3 w-3 text-white" />
                                        </div>
                                        Security & Access
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="dark:text-gray-300">
                                                Password <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input 
                                                    id="password" 
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter password"
                                                    className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    required
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
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
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="dark:text-gray-300">
                                                Confirm Password <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                id="password_confirmation" 
                                                type="password"
                                                placeholder="Confirm password"
                                                required
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
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
                                            className="dark:border-gray-600 dark:text-gray-300"
                                        >
                                            <Key className="h-4 w-4 mr-2" />
                                            {isGeneratingPassword ? 'Generating...' : 'Generate Password'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setData('send_setup_email', !data.send_setup_email)}
                                            className="dark:border-gray-600 dark:text-gray-300"
                                        >
                                            {data.send_setup_email ? (
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Mail className="h-4 w-4 mr-2" />
                                            )}
                                            Send Setup Email
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox 
                                                id="requirePasswordChange" 
                                                checked={data.require_password_change}
                                                onCheckedChange={(checked) => 
                                                    setData('require_password_change', checked as boolean)
                                                }
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="requirePasswordChange" className="text-sm cursor-pointer dark:text-gray-300">
                                                Require password change on first login
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox 
                                                id="is_email_verified" 
                                                checked={data.is_email_verified}
                                                onCheckedChange={(checked) => 
                                                    setData('is_email_verified', checked as boolean)
                                                }
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="is_email_verified" className="text-sm cursor-pointer dark:text-gray-300">
                                                Email verified
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Permissions */}
                            {permissionModules.length > 0 && (
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                                <Shield className="h-3 w-3 text-white" />
                                            </div>
                                            System Permissions
                                        </CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Select modules and features this user can access. 
                                            Role permissions are shown in <span className="text-blue-600 dark:text-blue-400">blue</span>.
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
                                                            <Label className="text-base font-semibold dark:text-gray-200">{module || 'Uncategorized'}</Label>
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
                                                                
                                                                return (
                                                                    <div 
                                                                        key={permission.id}
                                                                        className={`flex items-start space-x-2 p-3 rounded-lg border ${
                                                                            isFromRole 
                                                                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
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
                                                                            <div className="flex items-center justify-between">
                                                                                <Label 
                                                                                    htmlFor={`permission-${permission.id}`} 
                                                                                    className={`text-sm font-medium cursor-pointer ${
                                                                                        isFromRole ? 'text-blue-700 dark:text-blue-400' : 'dark:text-gray-300'
                                                                                    }`}
                                                                                >
                                                                                    {permission.display_name || permission.name || 'Unnamed Permission'}
                                                                                    {isFromRole && (
                                                                                        <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                                                            From Role
                                                                                        </Badge>
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
                                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium dark:text-gray-300">Permissions Summary:</span>
                                                <span className="text-sm dark:text-gray-300">
                                                    {localSelectedPermissions.length} custom + {selectedRolePermissions.length} from role
                                                </span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                                                {localSelectedPermissions.map(permissionId => {
                                                    const permission = getPermissionById(permissionId);
                                                    if (!permission) return null;
                                                    
                                                    return (
                                                        <span 
                                                            key={permissionId}
                                                            className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded"
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
                                                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded"
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
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="dark:text-gray-100">Account Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Total Permissions:</span>
                                            <span className="font-medium dark:text-gray-200">
                                                {selectedPermissionsCount}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 rounded-full" 
                                                style={{ 
                                                    width: `${Math.min(
                                                        (selectedPermissionsCount / Math.max(totalPermissionsCount, 1)) * 100, 
                                                        100
                                                    )}%` 
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="pt-4 space-y-2">
                                            <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
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
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Preview */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="dark:text-gray-100">User Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center text-center p-4 border rounded-lg dark:border-gray-700">
                                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 border-2 border-gray-200 dark:border-gray-600">
                                            <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="font-medium dark:text-gray-200">
                                            {data.first_name || data.last_name 
                                                ? `${data.first_name} ${data.last_name}`.trim() 
                                                : 'New User'
                                            }
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedRole?.name || 'No role selected'}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {selectedDepartment?.name || 'No department'}
                                        </div>
                                        <div className="mt-2 text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className={`h-2 w-2 rounded-full ${data.status === 'active' ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}></div>
                                                <span className="dark:text-gray-300">{data.status === 'active' ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Department Info */}
                            {selectedDepartment && (
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                                <Building className="h-3 w-3 text-white" />
                                            </div>
                                            Department Info
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <div className="text-gray-500 dark:text-gray-400">Department:</div>
                                                <div className="font-medium dark:text-gray-200">{selectedDepartment.name}</div>
                                            </div>
                                            {selectedDepartment.description && (
                                                <div>
                                                    <div className="text-gray-500 dark:text-gray-400">Description:</div>
                                                    <div className="font-medium dark:text-gray-200">{selectedDepartment.description}</div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="dark:text-gray-100">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                                        onClick={clearForm}
                                    >
                                        Clear Form
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                                        onClick={() => {
                                            console.log('Save as draft');
                                        }}
                                    >
                                        Save as Draft
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
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
                    <div className="flex items-center justify-between pt-6 border-t dark:border-gray-700">
                        <div>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={clearForm}
                                disabled={processing}
                                className="dark:text-gray-400 dark:hover:text-white"
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
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                Save as Draft
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
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