import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { Permission } from '@/types';
import {
    ArrowLeft,
    Key,
    Edit,
    Trash2,
    Copy,
    Check,
    X,
    Calendar,
    Shield,
    Users,
    FileText,
    LayoutDashboard,
    Home,
    Calendar as CalendarIcon,
    File,
    Settings,
    Bell,
    BarChart3,
    Database,
    AlertCircle,
    MessageCircle,
    Eye,
    User,
    Mail,
    Phone,
    Building,
    Clock,
    Info,
    BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DeveloperContactModal from '@/components/developer-contact-modal';
import { route } from 'ziggy-js';

interface PermissionShowProps {
    permission: Permission & {
        roles_count?: number;
        users_count?: number;
        created_by?: {
            name: string;
            email: string;
        };
    };
    roles?: Array<{
        id: number;
        name: string;
        display_name: string;
        description: string | null;
        users_count?: number;
        created_at?: string;
    }>;
    users?: Array<{
        id: number;
        name: string;
        email: string;
        position?: string;
        role_name?: string;
        status?: string;
        avatar?: string;
    }>;
    can?: {
        edit: boolean;
        delete: boolean;
    };
}

export default function PermissionShow({ 
    permission, 
    roles = [],
    users = [],
    can = { edit: true, delete: true }
}: PermissionShowProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleEdit = () => {
        router.visit(route('admin.permissions.edit', permission.id));
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.permissions.destroy', permission.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
                router.visit(route('admin.permissions.index'));
            },
            onError: () => {
                setIsDeleting(false);
                setShowDeleteDialog(false);
            },
        });
    };

    const handleContactDeveloper = () => {
        setShowDeveloperModal(true);
    };

    const getModuleDisplayName = (moduleName: string) => {
        switch (moduleName) {
            case 'Dashboard': return 'Dashboard';
            case 'Residents': return 'Residents Management';
            case 'Households': return 'Households Management';
            case 'Fees': return 'Fees Collection';
            case 'Calendar': return 'Calendar & Events';
            case 'Settings': return 'System Settings';
            case 'Notifications': return 'Notifications';
            case 'Reports': return 'Reports & Analytics';
            case 'Database': return 'Database Management';
            default: return moduleName;
        }
    };

    const getModuleIcon = (moduleName: string) => {
        switch (moduleName) {
            case 'Dashboard': return <LayoutDashboard className="h-5 w-5" />;
            case 'Residents': return <Users className="h-5 w-5" />;
            case 'Households': return <Home className="h-5 w-5" />;
            case 'Fees': return <File className="h-5 w-5" />;
            case 'Calendar': return <CalendarIcon className="h-5 w-5" />;
            case 'Settings': return <Settings className="h-5 w-5" />;
            case 'Notifications': return <Bell className="h-5 w-5" />;
            case 'Reports': return <BarChart3 className="h-5 w-5" />;
            case 'Database': return <Database className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    const getModuleColor = (moduleName: string) => {
        switch (moduleName) {
            case 'Dashboard': return 'bg-purple-100 text-purple-700';
            case 'Residents': return 'bg-blue-100 text-blue-700';
            case 'Households': return 'bg-green-100 text-green-700';
            case 'Fees': return 'bg-yellow-100 text-yellow-700';
            case 'Calendar': return 'bg-pink-100 text-pink-700';
            case 'Settings': return 'bg-gray-100 text-gray-700';
            case 'Notifications': return 'bg-indigo-100 text-indigo-700';
            case 'Reports': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Calculate summary stats
    const totalUsersWithAccess = users.length;
    const totalRolesWithAccess = roles.length;
    const activeRoles = roles.length; // You can add logic to filter active roles if needed
    const isSystemPermission = permission.name?.startsWith('system.') || false;

    return (
        <AdminLayout
            title={`Permission: ${permission.display_name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Permissions', href: route('admin.permissions.index') },
                { title: permission.display_name, href: '#' }
            ]}
        >
            <Head title={`${permission.display_name} - Permission Details`} />

            {/* Developer Contact Modal */}
            <DeveloperContactModal
                isOpen={showDeveloperModal}
                onClose={() => setShowDeveloperModal(false)}
                developerDetails={{
                    name: "Mr. Juan Dela Cruz",
                    position: "Barangay IT Support",
                    email: "it.support@barangay.gov.ph",
                    phone: "0917-123-4567",
                    office: "Barangay Hall - 2nd Floor",
                    schedule: "Monday - Friday, 8:00 AM - 5:00 PM",
                    notes: "For questions about permissions, please contact our IT support."
                }}
            />

            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit(route('admin.permissions.index'))}
                        className="h-8 w-8 p-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{permission.display_name}</h1>
                        <p className="text-gray-500">Permission details and access information</p>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`p-4 rounded-lg ${permission.is_active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        {permission.is_active ? (
                            <>
                                <Check className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Active Permission</p>
                                    <p className="text-sm text-green-600">This permission is currently active and can be assigned to roles.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <X className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-800">Inactive Permission</p>
                                    <p className="text-sm text-gray-600">This permission is inactive and cannot be used.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Stats Cards - Simplified for Barangay Officials */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Roles with Access</p>
                                    <p className="text-2xl font-bold">{totalRolesWithAccess}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Users with Access</p>
                                    <p className="text-2xl font-bold">{totalUsersWithAccess}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="text-sm font-medium">{formatDate(permission.created_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Basic Information */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Module Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Module Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`h-12 w-12 rounded-lg ${getModuleColor(permission.module)} flex items-center justify-center`}>
                                        {getModuleIcon(permission.module)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{getModuleDisplayName(permission.module)}</p>
                                        <p className="text-sm text-gray-500">Module</p>
                                    </div>
                                </div>

                                {permission.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            {permission.description}
                                        </p>
                                    </div>
                                )}

                                {isSystemPermission && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>
                                            This is a system permission. System permissions are managed by the IT department.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions - Simplified for Barangay Officials */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              

                                <Button
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.roles.index'))}
                                    className="w-full justify-start"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    View All Roles
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleContactDeveloper}
                                    className="w-full justify-start border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                >
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Need Help? Contact Support
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    About this Permission
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Technical Name:</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                        {permission.name}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Status:</span>
                                    <Badge variant={permission.is_active ? "default" : "secondary"}>
                                        {permission.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Module:</span>
                                    <span>{getModuleDisplayName(permission.module)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">Last Updated:</span>
                                    <span>{formatDate(permission.updated_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Access Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs for Roles and Users */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Access Information</CardTitle>
                                <CardDescription>
                                    Who has access to this permission
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="roles" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="roles">
                                            <Shield className="h-4 w-4 mr-2" />
                                            Roles ({roles.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="users">
                                            <Users className="h-4 w-4 mr-2" />
                                            Users ({users.length})
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="roles">
                                        {roles.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Shield className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500">No roles have this permission</p>
                                                <Button
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={() => router.visit(route('admin.roles.index'))}
                                                >
                                                    Go to Role Management
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {roles.map((role) => (
                                                    <div
                                                        key={role.id}
                                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                        onClick={() => router.visit(route('admin.roles.show', role.id))}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <Shield className="h-5 w-5 text-blue-700" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{role.display_name || role.name}</p>
                                                                {role.description && (
                                                                    <p className="text-sm text-gray-500">{role.description}</p>
                                                                )}
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {role.users_count || 0} users in this role
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm">
                                                            View Role
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="users">
                                        {users.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500">No users have direct access to this permission</p>
                                                <p className="text-sm text-gray-400 mt-2">
                                                    Users gain access through their assigned roles
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {users.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                        onClick={() => router.visit(route('admin.users.show', user.id))}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarFallback className="bg-gray-200">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{user.name}</p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                                {user.position && (
                                                                    <p className="text-xs text-gray-400">{user.position}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {user.role_name && (
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                                    {user.role_name}
                                                                </Badge>
                                                            )}
                                                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                                {user.status || 'Active'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Help Card */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-1">Need to modify this permission?</h4>
                                        <p className="text-sm text-blue-700 mb-3">
                                            If you need to change who can access this feature, please contact the IT support team.
                                            They can help you assign or remove permissions for different roles.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleContactDeveloper}
                                            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                                        >
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Contact IT Support
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Delete Dialog - Simplified Warning */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Permission</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this permission?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This will remove access from {roles.length} role(s) and affect {users.length} user(s).
                                    This action cannot be undone.
                                </AlertDescription>
                            </Alert>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Permission'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}