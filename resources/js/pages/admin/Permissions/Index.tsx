// resources/js/pages/admin/permissions/index.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { Permission, Paginated, FilterParams, Stats } from '@/types';
import {
    Search,
    Download,
    Plus,
    Shield,
    Users,
    Key,
    Eye,
    Trash2,
    RefreshCw,
    MoreVertical,
    Copy,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    BarChart3,
    Layers,
    AlertCircle,
    Lock,
    Unlock,
    FileText,
    Filter,
    X,
    MessageCircle
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import DeveloperContactModal from '@/components/developer-contact-modal';
import PermissionsStats from '@/components/admin/permissions/PermissionsStats';
import { route } from 'ziggy-js';

interface PermissionsIndexProps {
    permissions: Paginated<Permission>;
    modules: string[] | Array<{ name: string; display_name?: string; description?: string; icon?: string }>;
    filters: FilterParams;
    stats?: {
        total: number;
        active: number;
        inactive: number;
        modules: number;
        rolesAssigned: number;
    };
}

export default function PermissionsIndex({ 
    permissions, 
    modules, 
    filters: initialFilters, 
    stats: propsStats 
}: PermissionsIndexProps) {
    const [filters, setFilters] = useState<FilterParams>({
        search: initialFilters.search || '',
        module: initialFilters.module || 'all',
        status: initialFilters.status || 'all',
    });
    const [localSearch, setLocalSearch] = useState(initialFilters.search || '');
    const [isSearching, setIsSearching] = useState(false);
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(permissions.meta?.current_page || 1);
    const [itemsPerPage] = useState(permissions.meta?.per_page || 10);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Calculate global stats from props
    const globalStats = useMemo(() => {
        const totalPermissions = permissions.meta?.total || 0;
        const activePermissions = permissions.data.filter(p => p.is_active).length;
        const inactivePermissions = permissions.data.filter(p => !p.is_active).length;
        const totalModules = Array.isArray(modules) ? modules.length : 0;
        const totalRolesAssigned = permissions.data.reduce((sum, p) => sum + (p.roles_count || 0), 0);
        
        return {
            total: propsStats?.total ?? totalPermissions,
            active: propsStats?.active ?? activePermissions,
            inactive: propsStats?.inactive ?? inactivePermissions,
            modules: propsStats?.modules ?? totalModules,
            rolesAssigned: propsStats?.rolesAssigned ?? totalRolesAssigned,
        };
    }, [propsStats, permissions, modules]);

    // Calculate filtered stats from current view
    const filteredStats = useMemo(() => {
        const filteredData = permissions.data.filter(permission => {
            // Apply search filter
            if (filters.search && !permission.name.toLowerCase().includes(filters.search.toLowerCase()) && 
                !permission.display_name.toLowerCase().includes(filters.search.toLowerCase()) &&
                !permission.description?.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            
            // Apply module filter
            if (filters.module !== 'all' && permission.module !== filters.module) {
                return false;
            }
            
            // Apply status filter
            if (filters.status !== 'all') {
                const isActive = permission.is_active;
                if (filters.status === 'active' && !isActive) return false;
                if (filters.status === 'inactive' && isActive) return false;
            }
            
            return true;
        });

        const uniqueModules = new Set(filteredData.map(p => p.module)).size;

        return {
            total: filteredData.length,
            active: filteredData.filter(p => p.is_active).length,
            inactive: filteredData.filter(p => !p.is_active).length,
            modules: uniqueModules,
            rolesAssigned: filteredData.reduce((sum, p) => sum + (p.roles_count || 0), 0),
        };
    }, [permissions.data, filters]);

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
    const getTruncationLength = (type: 'name' | 'description' | 'module' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'description': return 20;
                case 'module': return 10;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'description': return 25;
                case 'module': return 12;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'description': return 30;
                case 'module': return 15;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'description': return 35;
            case 'module': return 20;
            default: return 30;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleApplyFilters = () => {
        setIsSearching(true);
        router.get(route('admin.permissions.index'), filters, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleSearch = () => {
        setIsSearching(true);
        router.get(route('admin.permissions.index'), filters, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleClearSearch = () => {
        setFilters(prev => ({ ...prev, search: '' }));
        setLocalSearch('');
        router.get(route('admin.permissions.index'), { ...filters, search: '' }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (key: keyof FilterParams, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        const newFilters = {
            search: '',
            module: 'all',
            status: 'all',
        };
        setFilters(newFilters);
        setLocalSearch('');
        setIsSearching(true);
        router.get(route('admin.permissions.index'), newFilters, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const togglePermissionStatus = (permission: Permission) => {
        if (confirm(`Are you sure you want to ${permission.is_active ? 'deactivate' : 'activate'} permission "${permission.display_name}"?`)) {
            router.put(route('admin.permissions.toggle-status', permission.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['permissions'] });
                },
            });
        }
    };

    const handleDelete = (permission: Permission) => {
        if (confirm(`Are you sure you want to delete permission "${permission.display_name}"? This action cannot be undone.`)) {
            router.delete(route('admin.permissions.destroy', permission.id));
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const handleExport = () => {
        const exportUrl = new URL(route('admin.permissions.export'), window.location.origin);
        if (filters.search) exportUrl.searchParams.append('search', filters.search);
        if (filters.module !== 'all') exportUrl.searchParams.append('module', filters.module);
        if (filters.status !== 'all') exportUrl.searchParams.append('status', filters.status);
        window.open(exportUrl.toString(), '_blank');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle contact developer
    const handleContactDeveloper = () => {
        setShowDeveloperModal(true);
    };

    const hasActiveFilters = filters.search || filters.module !== 'all' || filters.status !== 'all';

    // Calculate pagination
    const totalItems = permissions.meta?.total || 0;
    const totalPages = permissions.meta?.last_page || 1;
    const startIndex = (permissions.meta?.current_page || 1) - 1 * (permissions.meta?.per_page || 10) + 1;
    const endIndex = Math.min((permissions.meta?.current_page || 1) * (permissions.meta?.per_page || 10), totalItems);

    // Get unique modules from permissions if not provided
    const availableModules = useMemo(() => {
        if (modules && modules.length > 0) {
            // Handle both string arrays and object arrays
            if (typeof modules[0] === 'string') {
                return modules as string[];
            } else if (typeof modules[0] === 'object' && modules[0] !== null) {
                // Extract module names from objects
                const moduleObjects = modules as Array<{ name: string; [key: string]: any }>;
                return moduleObjects.map(m => m.name).filter(Boolean);
            }
        }
        // Fallback: get modules from permissions data
        return Array.from(new Set(permissions.data.map(p => p.module))).filter(Boolean) as string[];
    }, [modules, permissions.data]);

    return (
        <AdminLayout
            title="Permissions Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Permissions', href: route('admin.permissions.index') }
            ]}
        >
            <Head title="Permissions Management" />

            {/* Developer Contact Modal */}
            <DeveloperContactModal
                isOpen={showDeveloperModal}
                onClose={() => setShowDeveloperModal(false)}
                developerDetails={{
                    name: "System Security Team",
                    email: "support@larkacernexus.com",
                    phone: "+1 (555) 987-6543",
                    department: "Security & Permissions",
                    company: "LARKACER NEXUS IT SOLUTIONS",
                    website: "https://security.yourcompany.com/permissions",
                    officeHours: "Monday - Friday, 8:00 AM - 5:00 PM",
                    specialization: "Role-Based Access Control",
                    responseTime: "24-48 business hours",
                    notes: "All permission requests go through security review. Please include justification and which user roles need access."
                }}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">Permissions Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage system permissions and access control
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('admin.roles.index')}>
                            <Button variant="outline" className="h-9 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900">
                                <Users className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Manage Roles</span>
                                <span className="sm:hidden">Roles</span>
                            </Button>
                        </Link>
                        
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline"
                                        className="h-9 border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200"
                                        onClick={handleContactDeveloper}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Request Permission</span>
                                        <span className="sm:hidden">Request</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                    <p className="text-sm max-w-xs">Contact the security team to request new permissions</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Stats Cards - Now using the separate component */}
                <PermissionsStats 
                    globalStats={globalStats}
                    filteredStats={filteredStats}
                    isLoading={isSearching}
                />

                {/* Search and Filters */}
                <Card className="overflow-hidden border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                    <Input 
                                        ref={searchInputRef}
                                        placeholder="Search permissions by name or description... (Ctrl+F)" 
                                        className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500"
                                        value={filters.search || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        onKeyPress={handleKeyPress}
                                        disabled={isSearching}
                                    />
                                    {filters.search && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        className="border rounded px-3 py-2 text-sm w-32 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                                        value={filters.module || 'all'}
                                        onChange={(e) => handleFilterChange('module', e.target.value)}
                                        disabled={isSearching}
                                    >
                                        <option value="all">All Modules</option>
                                        {availableModules.map((module) => (
                                            <option key={module} value={module}>
                                                {module}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <select 
                                        className="border rounded px-3 py-2 text-sm w-28 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                                        value={filters.status || 'all'}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        disabled={isSearching}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    
                                    <Button 
                                        variant="outline"
                                        className="h-9 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                        onClick={handleApplyFilters}
                                        disabled={isSearching}
                                    >
                                        {isSearching ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4 mr-2" />
                                        )}
                                        <span className="hidden sm:inline">Search</span>
                                    </Button>

                                    <Button 
                                        variant="outline"
                                        className="h-9 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                        onClick={handleExport}
                                        disabled={isSearching}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {startIndex} to {endIndex} of {totalItems} permissions
                                    {filters.search && ` matching "${filters.search}"`}
                                    {filters.module !== 'all' && ` • Module: ${filters.module}`}
                                    {filters.status !== 'all' && ` • Status: ${filters.status}`}
                                </div>
                                
                                <div className="flex gap-2">
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetFilters}
                                            disabled={isSearching}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8"
                                        >
                                            Clear All Filters
                                        </Button>
                                    )}
                                    
                                    {isSearching && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                            Searching...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Table */}
                <Card className="overflow-hidden border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Permissions List</CardTitle>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Page {permissions.meta?.current_page || 1} of {totalPages}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                                                    Permission
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                                                    Display Name
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                                    Module
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                                                    Status
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                                                    Roles
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                                                    Created
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900/50 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {permissions.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <Shield className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                    {isSearching ? 'Searching...' : 'No permissions found'}
                                                                </h3>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {hasActiveFilters 
                                                                        ? 'Try changing your filters or search criteria.'
                                                                        : 'Permissions are managed by the system developer. Contact administrator for assistance.'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {hasActiveFilters && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={resetFilters}
                                                                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                                                        disabled={isSearching}
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                )}
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button 
                                                                                variant="outline"
                                                                                className="h-8 border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200"
                                                                                onClick={handleContactDeveloper}
                                                                            >
                                                                                <MessageCircle className="h-3 w-3 mr-1" />
                                                                                Request Permission
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                                                            <p className="text-sm max-w-xs">Contact the security team to request new permissions</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                permissions.data.map((permission) => {
                                                    const nameLength = getTruncationLength('name');
                                                    const descLength = getTruncationLength('description');
                                                    const moduleLength = getTruncationLength('module');
                                                    
                                                    return (
                                                        <TableRow key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors border-gray-200 dark:border-gray-700">
                                                            <TableCell className="px-4 py-3 whitespace-nowrap dark:text-gray-300">
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
                                                                    title={`Double-click to select all\nPermission: ${permission.name}\nDescription: ${permission.description || 'No description'}`}
                                                                >
                                                                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                                                        <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div 
                                                                            className="font-medium text-gray-900 dark:text-white truncate"
                                                                            data-full-text={permission.name}
                                                                        >
                                                                            {permission.name.length > nameLength 
                                                                                ? permission.name.substring(0, nameLength) + '...' 
                                                                                : permission.name}
                                                                        </div>
                                                                        {permission.description && (
                                                                            <div 
                                                                                className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                                                                                data-full-text={permission.description}
                                                                            >
                                                                                {permission.description.length > descLength 
                                                                                    ? permission.description.substring(0, descLength) + '...' 
                                                                                    : permission.description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 dark:text-gray-300">
                                                                <div 
                                                                    className="font-medium truncate"
                                                                    title={permission.display_name}
                                                                >
                                                                    {permission.display_name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                                                    title={permission.module}
                                                                >
                                                                    <span className="truncate">
                                                                        {permission.module && permission.module.length > moduleLength 
                                                                            ? permission.module.substring(0, moduleLength) + '...' 
                                                                            : permission.module || 'N/A'}
                                                                    </span>
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => togglePermissionStatus(permission)}
                                                                    className={`h-6 px-2 text-xs font-medium ${
                                                                        permission.is_active
                                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                                                                    }`}
                                                                    disabled={isSearching}
                                                                >
                                                                    {permission.is_active ? (
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                    ) : (
                                                                        <XCircle className="h-3 w-3 mr-1" />
                                                                    )}
                                                                    <span className="ml-1">
                                                                        {permission.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 dark:text-gray-300">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                                    <span className="truncate">{permission.roles_count || 0}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="text-sm text-gray-500 dark:text-gray-400 truncate"
                                                                    title={formatDate(permission.created_at)}
                                                                >
                                                                    {formatDate(permission.created_at)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                                            disabled={isSearching}
                                                                        >
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                                                                        <DropdownMenuItem asChild className="dark:text-gray-200 dark:focus:bg-gray-700">
                                                                            <Link href={route('admin.permissions.show', permission.id)} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(permission.name, 'Permission Name')}
                                                                            className="flex items-center cursor-pointer dark:text-gray-200 dark:focus:bg-gray-700"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(permission.display_name, 'Display Name')}
                                                                            className="flex items-center cursor-pointer dark:text-gray-200 dark:focus:bg-gray-700"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Display Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-950/30"
                                                                            onClick={() => handleDelete(permission)}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            <span>Delete Permission</span>
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
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {startIndex} to {endIndex} of {totalItems} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const prevPage = Math.max(1, (permissions.meta?.current_page || 1) - 1);
                                            setIsSearching(true);
                                            router.get(route('admin.permissions.index'), { ...filters, page: prevPage }, {
                                                preserveState: true,
                                                replace: true,
                                                onFinish: () => setIsSearching(false),
                                            });
                                        }}
                                        disabled={(permissions.meta?.current_page || 1) === 1 || isSearching}
                                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            const currentPage = permissions.meta?.current_page || 1;
                                            
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
                                                        setIsSearching(true);
                                                        router.get(route('admin.permissions.index'), { ...filters, page: pageNum }, {
                                                            preserveState: true,
                                                            replace: true,
                                                            onFinish: () => setIsSearching(false),
                                                        });
                                                    }}
                                                    className={`h-8 w-8 p-0 ${
                                                        currentPage === pageNum 
                                                            ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                                                            : 'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900'
                                                    }`}
                                                    disabled={isSearching}
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
                                            const nextPage = Math.min(totalPages, (permissions.meta?.current_page || 1) + 1);
                                            setIsSearching(true);
                                            router.get(route('admin.permissions.index'), { ...filters, page: nextPage }, {
                                                preserveState: true,
                                                replace: true,
                                                onFinish: () => setIsSearching(false),
                                            });
                                        }}
                                        disabled={(permissions.meta?.current_page || 1) === totalPages || isSearching}
                                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:opacity-50"
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
                    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                        <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
                            <CardTitle className="text-lg dark:text-gray-100">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={route('admin.roles.index')}>
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900" disabled={isSearching}>
                                        <Users className="h-3 w-3 mr-2" />
                                        <span className="truncate">Manage Roles</span>
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full justify-start h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                    onClick={() => {
                                        // Bulk assign feature
                                        alert('Bulk assign feature coming soon!');
                                    }}
                                    disabled={isSearching}
                                >
                                    <Layers className="h-3 w-3 mr-2" />
                                    <span className="truncate">Bulk Assign</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full justify-start h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                    onClick={handleExport}
                                    disabled={isSearching}
                                >
                                    <Download className="h-3 w-3 mr-2" />
                                    <span className="truncate">Export CSV</span>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900" disabled={isSearching}>
                                    <BarChart3 className="h-3 w-3 mr-2" />
                                    <span className="truncate">Usage Report</span>
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full justify-start h-8 col-span-2 border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200"
                                                onClick={handleContactDeveloper}
                                            >
                                                <MessageCircle className="h-3 w-3 mr-2" />
                                                <span className="truncate">Request New Permission</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                            <p className="text-sm max-w-xs">Contact the security team to request new permissions</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                        <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
                            <CardTitle className="text-lg dark:text-gray-100">Module Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {permissions.data.length > 0 ? (
                                <div className="space-y-3">
                                    {Array.from(new Set(permissions.data.map(p => p.module))).slice(0, 4).map((module) => {
                                        const modulePermissions = permissions.data.filter(p => p.module === module);
                                        const activeCount = modulePermissions.filter(p => p.is_active).length;
                                        const moduleLength = getTruncationLength('module');
                                        
                                        return (
                                            <div key={module} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span 
                                                        className="text-sm font-medium truncate dark:text-gray-200"
                                                        title={module || 'N/A'}
                                                    >
                                                        {module && module.length > moduleLength 
                                                            ? module.substring(0, moduleLength) + '...' 
                                                            : module || 'N/A'}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                                        {modulePermissions.length}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {activeCount} active
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Array.from(new Set(permissions.data.map(p => p.module))).length > 4 && (
                                        <div className="text-center pt-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-8 dark:text-gray-300 dark:hover:bg-gray-900"
                                                onClick={resetFilters}
                                                disabled={isSearching}
                                            >
                                                View All Modules
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">No permission data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}