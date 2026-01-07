import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Mail,
    Phone,
    Shield,
    Building,
    Calendar,
    Activity,
    Edit,
    Key,
    Lock,
    History,
    FileText,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function UserShow() {
    const user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@barangaykibawe.ph',
        username: 'admin',
        role: 'Administrator',
        department: 'Barangay Office',
        position: 'System Administrator',
        contactNumber: '09123456789',
        status: 'Active',
        lastLogin: '2024-03-15 09:30 AM',
        lastLoginIp: '192.168.1.100',
        createdAt: '2023-01-15',
        updatedAt: '2024-03-10',
        permissions: ['Full Access'],
        twoFactorEnabled: true,
        emailVerified: true,
    };

    const userActivity = [
        { id: 1, action: 'Logged in', time: 'Today, 09:30 AM', ip: '192.168.1.100' },
        { id: 2, action: 'Updated resident record', time: 'Yesterday, 14:20 PM', details: 'Resident ID: 123' },
        { id: 3, action: 'Generated report', time: 'Mar 14, 11:15 AM', details: 'Monthly Collections Report' },
        { id: 4, action: 'Created new user', time: 'Mar 13, 10:05 AM', details: 'User: Treasury Officer' },
        { id: 5, action: 'Logged out', time: 'Mar 13, 17:30 PM', ip: '192.168.1.100' },
    ];

    const permissions = [
        { module: 'Dashboard', access: 'Full', description: 'View all dashboard statistics' },
        { module: 'Residents', access: 'Full', description: 'Manage resident records' },
        { module: 'Households', access: 'Full', description: 'Manage household records' },
        { module: 'Payments', access: 'Full', description: 'Manage payment transactions' },
        { module: 'Clearances', access: 'Full', description: 'Issue and manage clearances' },
        { module: 'Reports', access: 'Full', description: 'Generate and view all reports' },
        { module: 'Users', access: 'Full', description: 'Manage user accounts' },
        { module: 'Settings', access: 'Full', description: 'Configure system settings' },
    ];

    const getStatusIcon = () => {
        switch (user.status) {
            case 'Active': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Inactive': return <XCircle className="h-5 w-5 text-gray-400" />;
            default: return null;
        }
    };

    return (
        <AppLayout
            title="User Profile"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Users', href: '/users' },
                { title: user.name, href: `/users/${user.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge className="flex items-center gap-1">
                                    {getStatusIcon()}
                                    {user.status}
                                </Badge>
                                <Badge variant="secondary">{user.role}</Badge>
                                <Badge variant="outline">{user.department}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/users/${user.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        </Link>
                        <Button variant="outline">
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        <TabsTrigger value="activity">Activity Log</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* User Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Email</div>
                                                <div className="font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Contact Number</div>
                                                <div className="font-medium">{user.contactNumber}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Username</div>
                                                <div className="font-medium">{user.username}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Position</div>
                                                <div className="font-medium">{user.position}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Status Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Account Created</div>
                                                <div className="font-medium">{user.createdAt}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Last Login</div>
                                                <div className="font-medium">{user.lastLogin}</div>
                                                <div className="text-xs text-gray-500">IP: {user.lastLoginIp}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Security Features</div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        {user.twoFactorEnabled ? (
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3 text-gray-400" />
                                                        )}
                                                        <span className="text-sm">Two-factor authentication</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {user.emailVerified ? (
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3 text-gray-400" />
                                                        )}
                                                        <span className="text-sm">Email verified</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">156</div>
                                        <div className="text-sm text-gray-500">Residents Managed</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">45</div>
                                        <div className="text-sm text-gray-500">Payments Processed</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">23</div>
                                        <div className="text-sm text-gray-500">Clearances Issued</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">5</div>
                                        <div className="text-sm text-gray-500">Users Created</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Permissions</CardTitle>
                                <CardDescription>
                                    Modules and features accessible to this user
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {permissions.map((permission) => (
                                        <div key={permission.module} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{permission.module}</div>
                                                <div className="text-sm text-gray-500">{permission.description}</div>
                                            </div>
                                            <Badge variant={
                                                permission.access === 'Full' ? 'default' :
                                                permission.access === 'Read Only' ? 'secondary' : 'outline'
                                            }>
                                                {permission.access}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    User actions and system interactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {userActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                                                <History className="h-4 w-4 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{activity.action}</div>
                                                {activity.details && (
                                                    <div className="text-sm text-gray-500">{activity.details}</div>
                                                )}
                                                {activity.ip && (
                                                    <div className="text-xs text-gray-400">IP: {activity.ip}</div>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">{activity.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                                        <Button variant="outline" className="w-full">
                                            <Key className="h-4 w-4 mr-2" />
                                            Reset Password
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-500">
                                            {user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                                        </p>
                                        <Button variant="outline" className="w-full">
                                            {user.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Session Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Active Sessions</h4>
                                        <div className="p-3 border rounded-lg">
                                            <div className="font-medium">Current Session</div>
                                            <div className="text-sm text-gray-500">Browser: Chrome on Windows</div>
                                            <div className="text-xs text-gray-400">IP: {user.lastLoginIp}</div>
                                            <div className="text-xs text-gray-400">Started: {user.lastLogin}</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                                        Logout All Sessions
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}