import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Filter,
    Download,
    Plus,
    User,
    Mail,
    Shield,
    Edit,
    Eye,
    Trash2,
    MoreVertical,
    CheckCircle,
    XCircle,
    UserCog,
    Clock,
    Calendar,
    Key,
    Lock,
    Unlock,
    Copy,
    AlertTriangle,
    RefreshCw,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useMemo, useEffect, JSX } from 'react';

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper function for email
const truncateEmail = (email: string, maxLength: number = 25): string => {
    if (!email) return '';
    if (email.length <= maxLength) return email;
    const [local, domain] = email.split('@');
    if (!domain) return truncateText(email, maxLength);
    
    const maxLocal = Math.floor(maxLength / 2);
    const maxDomain = maxLength - maxLocal - 1; // -1 for the @ symbol
    
    const truncatedLocal = truncateText(local, maxLocal);
    const truncatedDomain = truncateText(domain, maxDomain);
    
    return `${truncatedLocal}@${truncatedDomain}`;
};

export default function Users() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get responsive truncation length
    const getTruncationLength = (type: 'name' | 'email' | 'role' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'email': return 20;
                case 'role': return 12;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'email': return 25;
                case 'role': return 15;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'email': return 30;
                case 'role': return 18;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'email': return 35;
            case 'role': return 20;
            default: return 30;
        }
    };

    const users = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@barangaykibawe.ph',
            role: 'Administrator',
            department: 'Barangay Office',
            status: 'Active',
            lastLogin: '2024-03-15 09:30 AM',
            createdAt: '2023-01-15',
            permissions: ['Full Access'],
            twoFactorEnabled: true,
            lastActive: '2 hours ago'
        },
        {
            id: 2,
            name: 'Treasury Officer',
            email: 'treasury@barangaykibawe.ph',
            role: 'Treasury',
            department: 'Finance',
            status: 'Active',
            lastLogin: '2024-03-15 10:15 AM',
            createdAt: '2023-02-20',
            permissions: ['Payments', 'Reports'],
            twoFactorEnabled: true,
            lastActive: '5 hours ago'
        },
        {
            id: 3,
            name: 'Records Officer',
            email: 'records@barangaykibawe.ph',
            role: 'Records Clerk',
            department: 'Registry',
            status: 'Inactive',
            lastLogin: '2024-03-10 02:45 PM',
            createdAt: '2023-03-10',
            permissions: ['Residents', 'Households'],
            twoFactorEnabled: false,
            lastActive: '3 days ago'
        },
        {
            id: 4,
            name: 'Clearance Officer',
            email: 'clearance@barangaykibawe.ph',
            role: 'Clearance Officer',
            department: 'Services',
            status: 'Active',
            lastLogin: '2024-03-14 11:20 AM',
            createdAt: '2023-04-05',
            permissions: ['Clearances', 'Certificates'],
            twoFactorEnabled: true,
            lastActive: '1 day ago'
        },
        {
            id: 5,
            name: 'Data Analyst',
            email: 'analyst@barangaykibawe.ph',
            role: 'Analyst',
            department: 'Planning',
            status: 'Active',
            lastLogin: '2024-03-14 03:30 PM',
            createdAt: '2023-05-12',
            permissions: ['Reports', 'Analytics'],
            twoFactorEnabled: true,
            lastActive: '6 hours ago'
        },
        {
            id: 6,
            name: 'System Auditor',
            email: 'auditor@barangaykibawe.ph',
            role: 'Auditor',
            department: 'Internal Audit',
            status: 'Active',
            lastLogin: '2024-03-15 08:45 AM',
            createdAt: '2023-06-20',
            permissions: ['Audit Logs', 'Reports'],
            twoFactorEnabled: true,
            lastActive: '1 hour ago'
        },
    ];

    const roles = [
        { name: 'Administrator', count: 1, color: 'bg-red-500' },
        { name: 'Treasury', count: 1, color: 'bg-green-500' },
        { name: 'Records Clerk', count: 1, color: 'bg-blue-500' },
        { name: 'Clearance Officer', count: 1, color: 'bg-purple-500' },
        { name: 'Analyst', count: 1, color: 'bg-amber-500' },
        { name: 'Auditor', count: 1, color: 'bg-indigo-500' },
    ];

    // Filter users
    const filteredUsers = useMemo(() => {
        let result = [...users];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(user => 
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.role.toLowerCase().includes(searchLower) ||
                user.department.toLowerCase().includes(searchLower)
            );
        }
        
        // Role filter
        if (roleFilter !== 'all') {
            result = result.filter(user => user.role === roleFilter);
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(user => user.status === statusFilter);
        }
        
        return result;
    }, [search, roleFilter, statusFilter]);

    // Calculate pagination
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter, statusFilter]);

    const handleClearFilters = () => {
        setSearch('');
        setRoleFilter('all');
        setStatusFilter('all');
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'Active': 'default',
            'Inactive': 'secondary',
            'Suspended': 'destructive',
            'Pending': 'outline'
        };
        return variants[status] || 'outline';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'Active': <CheckCircle className="h-4 w-4 text-green-500" />,
            'Inactive': <XCircle className="h-4 w-4 text-gray-500" />,
            'Suspended': <AlertTriangle className="h-4 w-4 text-red-500" />,
            'Pending': <Clock className="h-4 w-4 text-amber-500" />
        };
        return icons[status] || null;
    };

    const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'Administrator': 'destructive',
            'Treasury': 'outline',
            'Records Clerk': 'outline',
            'Clearance Officer': 'outline',
            'Analyst': 'secondary',
            'Auditor': 'outline'
        };
        return variants[role] || 'outline';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const hasActiveFilters = search || roleFilter !== 'all' || statusFilter !== 'all';

    // Calculate stats
    const stats = [
        { label: 'Total Users', value: filteredUsers.length },
        { label: 'Active Users', value: filteredUsers.filter(u => u.status === 'Active').length },
        { label: 'Administrators', value: filteredUsers.filter(u => u.role === 'Administrator').length },
        { label: '2FA Enabled', value: filteredUsers.filter(u => u.twoFactorEnabled).length },
    ];

    return (
        <AppLayout
            title="Users"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Administration', href: '/administration' },
                { title: 'Users', href: '/users' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage user accounts and access permissions
                        </p>
                    </div>
                    <Link href="/users/create">
                        <Button className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Add User</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {stat.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Roles Overview */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5" />
                            User Roles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                            {roles.map((role) => (
                                <div 
                                    key={role.name} 
                                    className={`border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${roleFilter === role.name ? 'ring-2 ring-primary-500' : ''}`}
                                    onClick={() => setRoleFilter(role.name)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${role.color}`} />
                                        <div className="text-sm font-medium truncate" title={role.name}>
                                            {truncateText(role.name, 15)}
                                        </div>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold mt-2">{role.count}</div>
                                    <div className="text-xs text-gray-500 truncate">users</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Search users by name, email, or role..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="h-9"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Filters</span>
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = new URL('/users/export', window.location.origin);
                                            if (search) exportUrl.searchParams.append('search', search);
                                            if (roleFilter !== 'all') exportUrl.searchParams.append('role', roleFilter);
                                            if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                            window.open(exportUrl.toString(), '_blank');
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Basic Filters */}
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Role:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        {roles.map((role) => (
                                            <option key={role.name} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Suspended">Suspended</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value="name"
                                        onChange={(e) => {}}
                                    >
                                        <option value="name">Name</option>
                                        <option value="role">Role</option>
                                        <option value="created">Date Created</option>
                                        <option value="last_login">Last Login</option>
                                    </select>
                                </div>
                            </div>

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} users
                                    {search && ` matching "${search}"`}
                                </div>
                                
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-red-600 hover:text-red-700 h-8"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">User Accounts</CardTitle>
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                    User
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Role
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Department
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                    Status
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                    Last Activity
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <User className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {hasActiveFilters 
                                                                        ? 'Try changing your filters or search criteria.'
                                                                        : 'Get started by creating a new user.'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {hasActiveFilters && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={handleClearFilters}
                                                                        className="h-8"
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                )}
                                                                <Link href="/users/create">
                                                                    <Button className="h-8">
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Create New User
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedUsers.map((user) => {
                                                    const nameLength = getTruncationLength('name');
                                                    const emailLength = getTruncationLength('email');
                                                    const roleLength = getTruncationLength('role');
                                                    
                                                    return (
                                                        <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                <div 
                                                                    className="flex items-center gap-3 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nName: ${user.name}\nEmail: ${user.email}`}
                                                                >
                                                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium">
                                                                            <div 
                                                                                className="truncate"
                                                                                data-full-text={user.name}
                                                                            >
                                                                                {truncateText(user.name, nameLength)}
                                                                            </div>
                                                                        </div>
                                                                        <div 
                                                                            className="text-sm text-gray-500 truncate flex items-center gap-1 mt-1"
                                                                            data-full-text={user.email}
                                                                        >
                                                                            <Mail className="h-3 w-3 flex-shrink-0" />
                                                                            {truncateEmail(user.email, emailLength)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant={getRoleBadgeVariant(user.role)}
                                                                    className="truncate max-w-full"
                                                                    title={user.role}
                                                                >
                                                                    {truncateText(user.role, roleLength)}
                                                                </Badge>
                                                                {user.twoFactorEnabled && (
                                                                    <div className="mt-1">
                                                                        <Badge 
                                                                            variant="outline" 
                                                                            className="text-xs flex items-center gap-1"
                                                                            title="Two-Factor Authentication Enabled"
                                                                        >
                                                                            <Key className="h-2 w-2" />
                                                                            2FA
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="text-sm truncate"
                                                                    title={user.department}
                                                                >
                                                                    {truncateText(user.department, 20)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant={getStatusBadgeVariant(user.status)} 
                                                                    className="flex items-center gap-1 truncate max-w-full"
                                                                    title={user.status}
                                                                >
                                                                    {getStatusIcon(user.status)}
                                                                    <span className="truncate">
                                                                        {user.status}
                                                                    </span>
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="space-y-1">
                                                                    <div className="text-sm text-gray-500 truncate" title={user.lastLogin}>
                                                                        {truncateText(user.lastLogin, 20)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                                        Last active: {user.lastActive}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                                        Created: {formatDate(user.createdAt)}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                        >
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-48">
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/users/${user.id}`} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Profile</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/users/${user.id}/edit`} className="flex items-center cursor-pointer">
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                <span>Edit User</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/users/${user.id}/permissions`} className="flex items-center cursor-pointer">
                                                                                <UserCog className="mr-2 h-4 w-4" />
                                                                                <span>Manage Permissions</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(user.email, 'Email')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Email</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(user.name, 'Name')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/users/${user.id}/audit`} className="flex items-center cursor-pointer">
                                                                                <Clock className="mr-2 h-4 w-4" />
                                                                                <span>View Activity</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        {user.status === 'Active' ? (
                                                                            <DropdownMenuItem 
                                                                                className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                                                            >
                                                                                <Lock className="mr-2 h-4 w-4" />
                                                                                <span>Suspend User</span>
                                                                            </DropdownMenuItem>
                                                                        ) : (
                                                                            <DropdownMenuItem 
                                                                                className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                                                            >
                                                                                <Unlock className="mr-2 h-4 w-4" />
                                                                                <span>Activate User</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        {user.status === 'Inactive' && (
                                                                            <DropdownMenuItem 
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                onClick={() => {
                                                                                    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
                                                                                        // Handle delete
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete User</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Permissions Overview */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">System Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <h4 className="font-medium mb-2 truncate" title="Administrator">
                                    Administrator
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="truncate">• Full system access</li>
                                    <li className="truncate">• User management</li>
                                    <li className="truncate">• System configuration</li>
                                    <li className="truncate">• Audit logs access</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <h4 className="font-medium mb-2 truncate" title="Treasury Officer">
                                    Treasury Officer
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="truncate">• Payment management</li>
                                    <li className="truncate">• Financial reports</li>
                                    <li className="truncate">• Receipt generation</li>
                                    <li className="truncate">• Tax collection</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <h4 className="font-medium mb-2 truncate" title="Records Clerk">
                                    Records Clerk
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="truncate">• Resident registration</li>
                                    <li className="truncate">• Household management</li>
                                    <li className="truncate">• Data entry</li>
                                    <li className="truncate">• Basic reports</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <h4 className="font-medium mb-2 truncate" title="Clearance Officer">
                                    Clearance Officer
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="truncate">• Clearance issuance</li>
                                    <li className="truncate">• Certificate processing</li>
                                    <li className="truncate">• Fee collection</li>
                                    <li className="truncate">• Document verification</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <h4 className="font-medium mb-2 truncate" title="Analyst">
                                    Analyst
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="truncate">• Data analysis</li>
                                    <li className="truncate">• Report generation</li>
                                    <li className="truncate">• Trend analysis</li>
                                    <li className="truncate">• Performance metrics</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <h4 className="font-medium mb-2 truncate" title="Auditor">
                                    Auditor
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="truncate">• Audit logs review</li>
                                    <li className="truncate">• Compliance checks</li>
                                    <li className="truncate">• Security audits</li>
                                    <li className="truncate">• Activity monitoring</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}