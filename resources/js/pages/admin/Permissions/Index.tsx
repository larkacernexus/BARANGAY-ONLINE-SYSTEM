// resources/js/pages/admin/permissions/index.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { 
    Permission, 
    Paginated, 
    FilterParams, 
    PermissionStats,
    ModuleInfo,
    PermissionsIndexProps,
    DeveloperContactDetails,
    PermissionStatus
} from '@/types/admin/permissions/permission.types';
import {
    Search,
    Download,
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
    MessageCircle,
    X
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

// Constants for better maintainability
const TRUNCATION_LENGTHS = {
    mobile: {
        name: 15,
        description: 20,
        module: 10
    },
    tablet: {
        name: 20,
        description: 25,
        module: 12
    },
    smallDesktop: {
        name: 25,
        description: 30,
        module: 15
    },
    largeDesktop: {
        name: 30,
        description: 35,
        module: 20
    }
} as const;

type DeviceType = 'mobile' | 'tablet' | 'smallDesktop' | 'largeDesktop';

const developerDetails: DeveloperContactDetails = {
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
};

export default function PermissionsIndex({ 
    permissions, 
    modules, 
    filters: initialFilters, 
    stats: propsStats 
}: PermissionsIndexProps) {
    // State management with proper types
    const [filters, setFilters] = useState<FilterParams>({
        search: initialFilters.search || '',
        module: initialFilters.module || 'all',
        status: initialFilters.status || PermissionStatus.ALL,
    });
    
    const [localSearch, setLocalSearch] = useState(initialFilters.search || '');
    const [isSearching, setIsSearching] = useState(false);
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(permissions.meta?.current_page || 1);
    const [windowWidth, setWindowWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Calculate device type based on window width
    const getDeviceType = (width: number): DeviceType => {
        if (width < 640) return 'mobile';
        if (width < 768) return 'tablet';
        if (width < 1024) return 'smallDesktop';
        return 'largeDesktop';
    };

    // Get responsive truncation length
    const getTruncationLength = useMemo(() => {
        const deviceType = getDeviceType(windowWidth);
        return (type: 'name' | 'description' | 'module' = 'name'): number => {
            return TRUNCATION_LENGTHS[deviceType][type];
        };
    }, [windowWidth]);

    // Calculate global stats
    const globalStats = useMemo((): PermissionStats => {
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

    // Calculate filtered stats
    const filteredStats = useMemo((): PermissionStats => {
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
            if (filters.status !== PermissionStatus.ALL) {
                const isActive = permission.is_active;
                if (filters.status === PermissionStatus.ACTIVE && !isActive) return false;
                if (filters.status === PermissionStatus.INACTIVE && isActive) return false;
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

    // Get available modules from permissions or provided modules
    const availableModules = useMemo((): string[] => {
        if (modules && modules.length > 0) {
            // Handle both string arrays and object arrays
            if (typeof modules[0] === 'string') {
                return modules as string[];
            } else if (typeof modules[0] === 'object' && modules[0] !== null) {
                // Extract module names from objects
                const moduleObjects = modules as ModuleInfo[];
                return moduleObjects.map(m => m.name).filter(Boolean);
            }
        }
        // Fallback: get modules from permissions data
        return Array.from(new Set(permissions.data.map(p => p.module))).filter(Boolean);
    }, [modules, permissions.data]);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Format date utility
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Helper function to convert FilterParams to router-compatible object
    const prepareFiltersForRouter = (filtersToPrepare: FilterParams): Record<string, string | number> => {
        const prepared: Record<string, string | number> = {};
        
        // Only add non-undefined values
        if (filtersToPrepare.search && filtersToPrepare.search !== '') {
            prepared.search = filtersToPrepare.search;
        }
        if (filtersToPrepare.module && filtersToPrepare.module !== 'all') {
            prepared.module = filtersToPrepare.module;
        }
        if (filtersToPrepare.status && filtersToPrepare.status !== PermissionStatus.ALL) {
            prepared.status = filtersToPrepare.status;
        }
        if (filtersToPrepare.page && filtersToPrepare.page > 1) {
            prepared.page = filtersToPrepare.page;
        }
        if (filtersToPrepare.per_page) {
            prepared.per_page = filtersToPrepare.per_page;
        }
        if (filtersToPrepare.sort_by) {
            prepared.sort_by = filtersToPrepare.sort_by;
        }
        if (filtersToPrepare.sort_order) {
            prepared.sort_order = filtersToPrepare.sort_order;
        }
        
        return prepared;
    };

    // Event handlers with proper types
    const handleApplyFilters = (): void => {
        setIsSearching(true);
        router.get(route('admin.permissions.index'), prepareFiltersForRouter(filters), {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleSearch = (): void => {
        setIsSearching(true);
        router.get(route('admin.permissions.index'), prepareFiltersForRouter(filters), {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleClearSearch = (): void => {
        const updatedFilters = { ...filters, search: '' };
        setFilters(updatedFilters);
        setLocalSearch('');
        router.get(route('admin.permissions.index'), prepareFiltersForRouter(updatedFilters), {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterChange = (key: keyof FilterParams, value: string): void => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = (): void => {
        const newFilters: FilterParams = {
            search: '',
            module: 'all',
            status: PermissionStatus.ALL,
        };
        setFilters(newFilters);
        setLocalSearch('');
        setIsSearching(true);
        router.get(route('admin.permissions.index'), prepareFiltersForRouter(newFilters), {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const togglePermissionStatus = (permission: Permission): void => {
        const action = permission.is_active ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} permission "${permission.display_name}"?`)) {
            router.put(route('admin.permissions.toggle-status', permission.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['permissions'] });
                },
            });
        }
    };

    const handleDelete = (permission: Permission): void => {
        if (confirm(`Are you sure you want to delete permission "${permission.display_name}"? This action cannot be undone.`)) {
            router.delete(route('admin.permissions.destroy', permission.id));
        }
    };

    const handleCopyToClipboard = (text: string, label: string): void => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label} to clipboard:`, text);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    const handleExport = (): void => {
        const exportUrl = new URL(route('admin.permissions.export'), window.location.origin);
        if (filters.search) exportUrl.searchParams.append('search', filters.search);
        if (filters.module && filters.module !== 'all') exportUrl.searchParams.append('module', filters.module);
        if (filters.status && filters.status !== PermissionStatus.ALL) exportUrl.searchParams.append('status', filters.status);
        window.open(exportUrl.toString(), '_blank');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleContactDeveloper = (): void => {
        setShowDeveloperModal(true);
    };

    const handlePageChange = (page: number): void => {
        setIsSearching(true);
        router.get(route('admin.permissions.index'), prepareFiltersForRouter({ ...filters, page }), {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // Computed values for UI
    const hasActiveFilters = Boolean(
        filters.search || (filters.module && filters.module !== 'all') || 
        (filters.status && filters.status !== PermissionStatus.ALL)
    );
    
    const totalItems = permissions.meta?.total || 0;
    const totalPages = permissions.meta?.last_page || 1;
    const currentPageNum = permissions.meta?.current_page || 1;
    const perPage = permissions.meta?.per_page || 10;
    const startIndex = (currentPageNum - 1) * perPage + 1;
    const endIndex = Math.min(currentPageNum * perPage, totalItems);

    // Generate pagination items
    const paginationItems = useMemo(() => {
        const items: number[] = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
        } else if (currentPageNum <= 3) {
            for (let i = 1; i <= 5; i++) items.push(i);
        } else if (currentPageNum >= totalPages - 2) {
            for (let i = totalPages - 4; i <= totalPages; i++) items.push(i);
        } else {
            for (let i = currentPageNum - 2; i <= currentPageNum + 2; i++) items.push(i);
        }
        
        return items;
    }, [totalPages, currentPageNum]);

    return (
        <AdminLayout
            title="Permissions Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Permissions', href: route('admin.permissions.index') }
            ]}
        >
            <Head title="Permissions Management" />

            <DeveloperContactModal
                isOpen={showDeveloperModal}
                onClose={() => setShowDeveloperModal(false)}
                developerDetails={developerDetails}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            Permissions Management
                        </h1>
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

                {/* Stats Cards */}
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
                                            aria-label="Clear search"
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
                                        aria-label="Filter by module"
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
                                        value={filters.status || PermissionStatus.ALL}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        disabled={isSearching}
                                        aria-label="Filter by status"
                                    >
                                        <option value={PermissionStatus.ALL}>All Status</option>
                                        <option value={PermissionStatus.ACTIVE}>Active</option>
                                        <option value={PermissionStatus.INACTIVE}>Inactive</option>
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

                            {/* Active filters indicator */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {startIndex} to {endIndex} of {totalItems} permissions
                                    {filters.search && ` matching "${filters.search}"`}
                                    {filters.module && filters.module !== 'all' && ` • Module: ${filters.module}`}
                                    {filters.status && filters.status !== PermissionStatus.ALL && ` • Status: ${filters.status}`}
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
                            Page {currentPageNum} of {totalPages}
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
                                                            <Key className="h-16 w-16 text-gray-300 dark:text-gray-700" />
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
                                                permissions.data.map((permission) => (
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
                                                                        title={permission.name}
                                                                    >
                                                                        {permission.name.length > getTruncationLength('name') 
                                                                            ? permission.name.substring(0, getTruncationLength('name')) + '...' 
                                                                            : permission.name}
                                                                    </div>
                                                                    {permission.description && (
                                                                        <div 
                                                                            className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                                                                            title={permission.description}
                                                                        >
                                                                            {permission.description.length > getTruncationLength('description') 
                                                                                ? permission.description.substring(0, getTruncationLength('description')) + '...' 
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
                                                                    {permission.module && permission.module.length > getTruncationLength('module') 
                                                                        ? permission.module.substring(0, getTruncationLength('module')) + '...' 
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
                                                ))
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
                                        onClick={() => handlePageChange(currentPageNum - 1)}
                                        disabled={currentPageNum === 1 || isSearching}
                                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {paginationItems.map((pageNum) => (
                                            <Button
                                                key={pageNum}
                                                variant={currentPageNum === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`h-8 w-8 p-0 ${
                                                    currentPageNum === pageNum 
                                                        ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                                                        : 'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900'
                                                }`}
                                                disabled={isSearching}
                                            >
                                                {pageNum}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPageNum + 1)}
                                        disabled={currentPageNum === totalPages || isSearching}
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
                                        
                                        return (
                                            <div key={module} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span 
                                                        className="text-sm font-medium truncate dark:text-gray-200"
                                                        title={module || 'N/A'}
                                                    >
                                                        {module && module.length > getTruncationLength('module') 
                                                            ? module.substring(0, getTruncationLength('module')) + '...' 
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
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                                    No permission data available
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}