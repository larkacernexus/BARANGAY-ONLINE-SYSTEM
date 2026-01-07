import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { Role, Paginated, FilterParams, Stats } from '@/types';
import {
    Search,
    Download,
    Plus,
    Users,
    Shield,
    Edit,
    Eye,
    Trash2,
    MoreVertical,
    Copy,
    ChevronLeft,
    ChevronRight,
    Key,
} from 'lucide-react';
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
import { route } from 'ziggy-js';

interface RolesIndexProps {
    roles: Paginated<Role>;
    filters: FilterParams;
    stats?: Stats[] | any;
}

export default function RolesIndex({ 
    roles, 
    filters: initialFilters, 
    stats: propsStats 
}: RolesIndexProps) {
    // State for local filter changes (not yet applied)
    const [localFilters, setLocalFilters] = useState<FilterParams>({
        search: initialFilters.search || '',
        type: initialFilters.type || 'all',
    });

    // State for currently applied filters
    const [appliedFilters, setAppliedFilters] = useState<FilterParams>({
        search: initialFilters.search || '',
        type: initialFilters.type || 'all',
    });

    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // Normalize stats to always be an array
    const stats = useMemo(() => {
        if (Array.isArray(propsStats)) {
            return propsStats;
        }
        
        // If stats is an object, convert to array
        if (propsStats && typeof propsStats === 'object' && !Array.isArray(propsStats)) {
            return Object.entries(propsStats).map(([label, value]) => ({
                label: typeof label === 'string' ? label.replace(/_/g, ' ') : 'Stat',
                value: typeof value === 'number' || typeof value === 'string' ? value : String(value),
            })) as Stats[];
        }
        
        // Generate default stats from available data
        const totalRoles = roles.meta?.total || 0;
        const systemRoles = roles.data.filter(r => r.is_system_role).length;
        const customRoles = roles.data.filter(r => !r.is_system_role).length;
        const totalUsers = roles.data.reduce((sum, r) => sum + (r.users_count || 0), 0);
        
        return [
            { label: 'Total Roles', value: totalRoles },
            { label: 'System Roles', value: systemRoles },
            { label: 'Custom Roles', value: customRoles },
            { label: 'Total Users', value: totalUsers },
        ] as Stats[];
    }, [propsStats, roles]);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync applied filters when initial filters change
    useEffect(() => {
        setAppliedFilters({
            search: initialFilters.search || '',
            type: initialFilters.type || 'all',
        });
        // Also update local filters to match
        setLocalFilters({
            search: initialFilters.search || '',
            type: initialFilters.type || 'all',
        });
    }, [initialFilters]);

    // Get responsive truncation length
    const getTruncationLength = (type: 'name' | 'description' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            return type === 'name' ? 15 : 20;
        }
        if (width < 768) { // Tablet
            return type === 'name' ? 20 : 25;
        }
        if (width < 1024) { // Small desktop
            return type === 'name' ? 25 : 30;
        }
        // Large desktop
        return type === 'name' ? 30 : 35;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleFilterChange = (key: keyof FilterParams, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters({ ...localFilters });
        router.get(route('roles.index'), localFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const resetFilterState = {
            search: '',
            type: 'all',
        };
        setLocalFilters(resetFilterState);
        setAppliedFilters(resetFilterState);
        router.get(route('roles.index'), resetFilterState, {
            preserveState: true,
            replace: true,
        });
    };

    const resetLocalChanges = () => {
        setLocalFilters({ ...appliedFilters });
    };

    const confirmDelete = (role: Role) => {
        if (canDeleteRole(role)) {
            setRoleToDelete(role);
            if (confirm(`Are you sure you want to delete role "${role.name}"? This action cannot be undone.`)) {
                deleteRole(role);
            }
        } else {
            if (role.is_system_role) {
                alert('System roles cannot be deleted.');
            } else if (role.users_count && role.users_count > 0) {
                alert('Cannot delete role that has users assigned. Please reassign users first.');
            }
        }
    };

    const deleteRole = (role: Role) => {
        setDeleting(true);
        router.delete(route('roles.destroy', role.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRoleToDelete(null);
                setDeleting(false);
                router.reload({ only: ['roles'] });
            },
            onError: () => {
                setDeleting(false);
            },
        });
    };

    const canDeleteRole = (role: Role) => {
        return !role.is_system_role && (role.users_count || 0) === 0;
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const handleExport = () => {
        const exportUrl = new URL(route('roles.export'), window.location.origin);
        if (appliedFilters.search) exportUrl.searchParams.append('search', appliedFilters.search);
        if (appliedFilters.type !== 'all') exportUrl.searchParams.append('type', appliedFilters.type);
        window.open(exportUrl.toString(), '_blank');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    // Check if there are unsaved filter changes
    const hasUnsavedFilters = 
        localFilters.search !== appliedFilters.search || 
        localFilters.type !== appliedFilters.type;

    // Check if there are active filters applied
    const hasActiveFilters = appliedFilters.search || appliedFilters.type !== 'all';

    // Calculate pagination
    const totalItems = roles.meta?.total || 0;
    const totalPages = roles.meta?.last_page || 1;
    const startIndex = (roles.meta?.current_page || 1) - 1 * (roles.meta?.per_page || 10) + 1;
    const endIndex = Math.min((roles.meta?.current_page || 1) * (roles.meta?.per_page || 10), totalItems);

    return (
        <AdminLayout
            title="Roles Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Roles', href: route('roles.index') }
            ]}
        >
            <Head title="Roles Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Roles Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage user roles and their permissions
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('permissions.index')}>
                            <Button variant="outline" className="h-9">
                                <Key className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Permissions</span>
                                <span className="sm:hidden">Perms</span>
                            </Button>
                        </Link>
                        <Link href={route('roles.create')}>
                            <Button className="h-9">
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Create Role</span>
                                <span className="sm:hidden">Create</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card key={index} className="overflow-hidden">
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
                )}

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Search roles by name or description..." 
                                        className="pl-10"
                                        value={localFilters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        className="border rounded px-3 py-2 text-sm w-32"
                                        value={localFilters.type || 'all'}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="custom">Custom Roles</option>
                                        <option value="system">System Roles</option>
                                    </select>
                                    
                                    <Button 
                                        variant="default"
                                        className="h-9"
                                        onClick={applyFilters}
                                        disabled={!hasUnsavedFilters}
                                    >
                                        Apply Filters
                                    </Button>
                                    
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={handleExport}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex} to {endIndex} of {totalItems} roles
                                    {appliedFilters.search && ` matching "${appliedFilters.search}"`}
                                    {appliedFilters.type !== 'all' && ` (${appliedFilters.type} roles)`}
                                </div>
                                
                                <div className="flex gap-2">
                                    {hasUnsavedFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetLocalChanges}
                                            className="h-8"
                                        >
                                            Reset Changes
                                        </Button>
                                    )}
                                    
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetFilters}
                                            className="text-red-600 hover:text-red-700 h-8"
                                        >
                                            Clear All Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">Roles List</CardTitle>
                        <div className="text-sm text-gray-500">
                            Page {roles.meta?.current_page || 1} of {totalPages}
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
                                                    Role Name
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Type
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                    Users
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                                    Description
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Created
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {roles.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <Shield className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                    No roles found
                                                                </h3>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {hasActiveFilters 
                                                                        ? 'Try changing your filters or search criteria.'
                                                                        : 'Get started by creating a role.'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {hasActiveFilters && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={resetFilters}
                                                                        className="h-8"
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                )}
                                                                <Link href={route('roles.create')}>
                                                                    <Button className="h-8">
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Create First Role
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                roles.data.map((role) => {
                                                    const nameLength = getTruncationLength('name');
                                                    const descLength = getTruncationLength('description');
                                                    
                                                    return (
                                                        <TableRow key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
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
                                                                    title={`Double-click to select all\nRole: ${role.name}\nDescription: ${role.description || 'No description'}`}
                                                                >
                                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                        role.is_system_role 
                                                                            ? 'bg-purple-100 dark:bg-purple-900/30' 
                                                                            : 'bg-green-100 dark:bg-green-900/30'
                                                                    }`}>
                                                                        <Shield className={`h-4 w-4 ${
                                                                            role.is_system_role 
                                                                                ? 'text-purple-600 dark:text-purple-400' 
                                                                                : 'text-green-600 dark:text-green-400'
                                                                        }`} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div 
                                                                            className="font-medium text-gray-900 dark:text-white truncate"
                                                                            data-full-text={role.name}
                                                                        >
                                                                            {role.name.length > nameLength 
                                                                                ? role.name.substring(0, nameLength) + '...' 
                                                                                : role.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                                            ID: {role.id}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant={role.is_system_role ? "outline" : "default"}
                                                                    className={role.is_system_role 
                                                                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                                                                        : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                                                                    }
                                                                >
                                                                    {role.is_system_role ? 'System' : 'Custom'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <span className="truncate">{role.users_count || 0}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="text-sm text-gray-600 dark:text-gray-400 truncate"
                                                                    title={role.description || 'No description'}
                                                                >
                                                                    {role.description 
                                                                        ? (role.description.length > descLength 
                                                                            ? role.description.substring(0, descLength) + '...' 
                                                                            : role.description)
                                                                        : <span className="text-gray-400 italic">No description</span>
                                                                    }
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="text-sm text-gray-500 dark:text-gray-400 truncate"
                                                                    title={formatDate(role.created_at)}
                                                                >
                                                                    {formatDate(role.created_at)}
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
                                                                            <Link href={route('roles.show', role.id)} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={route('roles.edit', role.id)} className="flex items-center cursor-pointer">
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                <span>Edit Role</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={route('roles.permissions', role.id)} className="flex items-center cursor-pointer">
                                                                                <Key className="mr-2 h-4 w-4" />
                                                                                <span>Manage Permissions</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(role.name, 'Role Name')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        {role.description && (
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(role.description || '', 'Role Description')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Description</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            className={`flex items-center cursor-pointer ${
                                                                                canDeleteRole(role) 
                                                                                    ? 'text-red-600 focus:text-red-700 focus:bg-red-50' 
                                                                                    : 'text-gray-400 cursor-not-allowed'
                                                                            }`}
                                                                            onClick={() => canDeleteRole(role) ? confirmDelete(role) : null}
                                                                            disabled={!canDeleteRole(role)}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            <span>Delete Role</span>
                                                                            {!canDeleteRole(role) && (
                                                                                <span className="ml-auto text-xs text-gray-500">
                                                                                    {role.is_system_role ? 'System' : 'Has users'}
                                                                                </span>
                                                                            )}
                                                                        </DropdownMenuItem>
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
                                    Showing {startIndex} to {endIndex} of {totalItems} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const prevPage = Math.max(1, (roles.meta?.current_page || 1) - 1);
                                            router.get(route('roles.index'), { ...appliedFilters, page: prevPage }, {
                                                preserveState: true,
                                                replace: true,
                                            });
                                        }}
                                        disabled={(roles.meta?.current_page || 1) === 1}
                                        className="h-8"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            const currentPage = roles.meta?.current_page || 1;
                                            
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
                                                    onClick={() => {
                                                        router.get(route('roles.index'), { ...appliedFilters, page: pageNum }, {
                                                            preserveState: true,
                                                            replace: true,
                                                        });
                                                    }}
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
                                        onClick={() => {
                                            const nextPage = Math.min(totalPages, (roles.meta?.current_page || 1) + 1);
                                            router.get(route('roles.index'), { ...appliedFilters, page: nextPage }, {
                                                preserveState: true,
                                                replace: true,
                                            });
                                        }}
                                        disabled={(roles.meta?.current_page || 1) === totalPages}
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

                {/* Quick Actions & Info */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={route('permissions.index')}>
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        <Key className="h-3 w-3 mr-2" />
                                        <span className="truncate">Permissions</span>
                                    </Button>
                                </Link>
                                
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full justify-start h-8"
                                    onClick={handleExport}
                                >
                                    <Download className="h-3 w-3 mr-2" />
                                    <span className="truncate">Export CSV</span>
                                </Button>
                                
                                <Link href={route('users.index')}>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start h-8"
                                    >
                                        <Users className="h-3 w-3 mr-2" />
                                        <span className="truncate">User Management</span>
                                    </Button>
                                </Link>
                                
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full justify-start h-8"
                                    onClick={() => {
                                        alert('Role hierarchy feature coming soon!');
                                    }}
                                >
                                    <Shield className="h-3 w-3 mr-2" />
                                    <span className="truncate">Role Hierarchy</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Role Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {roles.data.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Roles</span>
                                        <Badge variant="outline">{roles.meta?.total || 0}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">System Roles</span>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                            {roles.data.filter(r => r.is_system_role).length}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Custom Roles</span>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {roles.data.filter(r => !r.is_system_role).length}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Users Assigned</span>
                                        <Badge variant="outline">
                                            {roles.data.reduce((sum, r) => sum + (r.users_count || 0), 0)}
                                        </Badge>
                                    </div>
                                    <div className="pt-2">
                                        <div className="text-xs text-gray-500">
                                            Roles with most users:
                                        </div>
                                        {roles.data
                                            .sort((a, b) => (b.users_count || 0) - (a.users_count || 0))
                                            .slice(0, 3)
                                            .map((role) => (
                                                <div key={role.id} className="flex items-center justify-between mt-2">
                                                    <span className="text-sm truncate">{role.name}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {role.users_count || 0} users
                                                    </Badge>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4 text-sm">No role data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}