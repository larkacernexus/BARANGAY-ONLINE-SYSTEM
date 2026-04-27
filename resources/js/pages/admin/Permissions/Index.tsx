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
    X,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Filter,
    FilterX,
    Calendar,
    Activity,
    Hash,
    Shield,
    TrendingUp,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
type StatusFilterType = 'all' | 'active' | 'inactive';
type RolesCountFilterType = 'all' | '0' | '1-5' | '6-10' | '10+';

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
    // State management - only for UI, no URL updates
    const [search, setSearch] = useState<string>(initialFilters.search || '');
    const [moduleFilter, setModuleFilter] = useState<string>(initialFilters.module || 'all');
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>(
        initialFilters.status === 'active' ? 'active' : 
        initialFilters.status === 'inactive' ? 'inactive' : 'all'
    );
    const [rolesCountFilter, setRolesCountFilter] = useState<RolesCountFilterType>('all');
    // ✅ FIXED: Use 'all' instead of empty string
    const [dateRange, setDateRange] = useState<string>('all');
    
    // Separate sort states for table header
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);
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

    // Get all permissions data
    const allPermissions = permissions.data || [];

    // Helper function to check roles count range
    const checkRolesCountRange = (count: number, range: string): boolean => {
        switch (range) {
            case '0': return count === 0;
            case '1-5': return count >= 1 && count <= 5;
            case '6-10': return count >= 6 && count <= 10;
            case '10+': return count >= 10;
            default: return true;
        }
    };

    // ✅ FIXED: Helper function to check date range
    const checkDateRange = (dateString: string, range: string): boolean => {
        if (range === 'all') return true;  // ✅ Added this check
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (range) {
            case 'last_7_days': return diffDays <= 7;
            case 'last_30_days': return diffDays <= 30;
            case 'last_90_days': return diffDays <= 90;
            case 'last_year': return diffDays <= 365;
            default: return true;
        }
    };

    // Filter and sort permissions (client-side)
    const filteredAndSortedPermissions = useMemo(() => {
        let filtered = [...allPermissions];
        
        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(permission =>
                permission.name.toLowerCase().includes(searchLower) ||
                permission.display_name.toLowerCase().includes(searchLower) ||
                (permission.description?.toLowerCase() || '').includes(searchLower)
            );
        }
        
        // Apply module filter
        if (moduleFilter !== 'all') {
            filtered = filtered.filter(permission => permission.module === moduleFilter);
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(permission => {
                if (statusFilter === 'active') return permission.is_active;
                if (statusFilter === 'inactive') return !permission.is_active;
                return true;
            });
        }
        
        // Apply roles count filter
        if (rolesCountFilter !== 'all') {
            filtered = filtered.filter(permission => 
                checkRolesCountRange(permission.roles_count || 0, rolesCountFilter)
            );
        }
        
        // ✅ FIXED: Apply date range filter (now properly handles 'all')
        if (dateRange !== 'all') {
            filtered = filtered.filter(permission => 
                checkDateRange(permission.created_at, dateRange)
            );
        }
        
        // Apply sorting (for table header)
        filtered.sort((a, b) => {
            let valueA: any;
            let valueB: any;
            
            switch (sortBy) {
                case 'name':
                    valueA = a.name;
                    valueB = b.name;
                    break;
                case 'display_name':
                    valueA = a.display_name;
                    valueB = b.display_name;
                    break;
                case 'module':
                    valueA = a.module || '';
                    valueB = b.module || '';
                    break;
                case 'status':
                    valueA = a.is_active ? 1 : 0;
                    valueB = b.is_active ? 1 : 0;
                    break;
                case 'roles_count':
                    valueA = a.roles_count || 0;
                    valueB = b.roles_count || 0;
                    break;
                case 'created_at':
                    valueA = new Date(a.created_at).getTime();
                    valueB = new Date(b.created_at).getTime();
                    break;
                default:
                    valueA = a.name;
                    valueB = b.name;
            }
            
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [allPermissions, search, moduleFilter, statusFilter, rolesCountFilter, dateRange, sortBy, sortOrder]);

    // Calculate global stats
    const globalStats = useMemo((): PermissionStats => {
        const totalPermissions = allPermissions.length;
        const activePermissions = allPermissions.filter(p => p.is_active).length;
        const inactivePermissions = allPermissions.filter(p => !p.is_active).length;
        const totalModules = Array.from(new Set(allPermissions.map(p => p.module))).length;
        const totalRolesAssigned = allPermissions.reduce((sum, p) => sum + (p.roles_count || 0), 0);
        
        return {
            total: propsStats?.total ?? totalPermissions,
            active: propsStats?.active ?? activePermissions,
            inactive: propsStats?.inactive ?? inactivePermissions,
            modules: propsStats?.modules ?? totalModules,
            rolesAssigned: propsStats?.rolesAssigned ?? totalRolesAssigned,
        };
    }, [allPermissions, propsStats]);

    // Calculate filtered stats
    const filteredStats = useMemo((): PermissionStats => {
        const uniqueModules = new Set(filteredAndSortedPermissions.map(p => p.module)).size;
        
        return {
            total: filteredAndSortedPermissions.length,
            active: filteredAndSortedPermissions.filter(p => p.is_active).length,
            inactive: filteredAndSortedPermissions.filter(p => !p.is_active).length,
            modules: uniqueModules,
            rolesAssigned: filteredAndSortedPermissions.reduce((sum, p) => sum + (p.roles_count || 0), 0),
        };
    }, [filteredAndSortedPermissions]);

    // Get available modules from permissions
    const availableModules = useMemo((): string[] => {
        return Array.from(new Set(allPermissions.map(p => p.module))).filter(Boolean);
    }, [allPermissions]);

    // Roles count filter options
    const rolesCountOptions = [
        { value: 'all', label: 'All Permissions', color: 'gray' },
        { value: '0', label: 'No Roles Assigned (0)', color: 'red' },
        { value: '1-5', label: 'Low Usage (1-5 roles)', color: 'blue' },
        { value: '6-10', label: 'Moderate Usage (6-10 roles)', color: 'emerald' },
        { value: '10+', label: 'High Usage (10+ roles)', color: 'purple' }
    ];

    // ✅ FIXED: Date range options - no empty string!
    const dateRangeOptions = [
        { value: 'all', label: 'All Time', color: 'gray' },
        { value: 'last_7_days', label: 'Last 7 Days', color: 'blue' },
        { value: 'last_30_days', label: 'Last 30 Days', color: 'emerald' },
        { value: 'last_90_days', label: 'Last 90 Days', color: 'amber' },
        { value: 'last_year', label: 'Last Year', color: 'orange' }
    ];

    // Pagination
    const totalItems = filteredAndSortedPermissions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedPermissions = filteredAndSortedPermissions.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, moduleFilter, statusFilter, rolesCountFilter, dateRange]);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle sort from table header
    const handleSort = (column: string): void => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    // Format date utility
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get sort icon for table header
    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' 
            ? <ChevronUp className="h-4 w-4 ml-1" /> 
            : <ChevronDown className="h-4 w-4 ml-1" />;
    };

    // Event handlers
    const handleClearSearch = (): void => {
        setSearch('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // ✅ FIXED: Reset filters uses 'all' instead of empty string
    const resetFilters = (): void => {
        setSearch('');
        setModuleFilter('all');
        setStatusFilter('all');
        setRolesCountFilter('all');
        setDateRange('all');  // ✅ Changed from '' to 'all'
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
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
        const exportData = filteredAndSortedPermissions.map(permission => ({
            'Name': permission.name,
            'Display Name': permission.display_name,
            'Module': permission.module,
            'Description': permission.description || '',
            'Status': permission.is_active ? 'Active' : 'Inactive',
            'Roles Count': permission.roles_count || 0,
            'Created At': formatDate(permission.created_at),
        }));
        
        const csv = [
            Object.keys(exportData[0]).join(','),
            ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permissions-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            // Just trigger search (already handled by useMemo)
        }
    };

    const handleContactDeveloper = (): void => {
        setShowDeveloperModal(true);
    };

    // Computed values for UI
    const hasActiveFilters = Boolean(
        search || moduleFilter !== 'all' || statusFilter !== 'all' || rolesCountFilter !== 'all' || dateRange !== 'all'
    );
    
    // ✅ FIXED: Get active filter count - checks for 'all' instead of empty string
    const getActiveFilterCount = () => {
        let count = 0;
        if (search) count++;
        if (moduleFilter !== 'all') count++;
        if (statusFilter !== 'all') count++;
        if (rolesCountFilter !== 'all') count++;
        if (dateRange && dateRange !== 'all') count++;  // ✅ Changed from dateRange !== ''
        return count;
    };

    const activeFilterCount = getActiveFilterCount();
    
    // Generate pagination items
    const paginationItems = useMemo(() => {
        const items: number[] = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) items.push(i);
        } else if (currentPage >= totalPages - 2) {
            for (let i = totalPages - 4; i <= totalPages; i++) items.push(i);
        } else {
            for (let i = currentPage - 2; i <= currentPage + 2; i++) items.push(i);
        }
        
        return items;
    }, [totalPages, currentPage]);

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'emerald';
            case 'inactive': return 'gray';
            default: return 'gray';
        }
    };

    // Get roles count color
    const getRolesCountColor = (value: string) => {
        const option = rolesCountOptions.find(o => o.value === value);
        return option?.color || 'gray';
    };

    // Get date range color
    const getDateRangeColor = (value: string) => {
        const option = dateRangeOptions.find(o => o.value === value);
        return option?.color || 'gray';
    };

    // Get module label
    const getModuleLabel = (value: string) => {
        return value || 'N/A';
    };

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
                            <Button variant="outline" className="h-9 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 rounded-xl">
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
                                        className="h-9 border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200 rounded-xl"
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
                    isLoading={false}
                />

                {/* Search and Filters - Redesigned without sort dropdown */}
                <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col space-y-5">
                            {/* Search Bar - Enhanced */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
                                    <Input
                                        ref={searchInputRef}
                                        placeholder="Search permissions by name or description... (Ctrl+F)"
                                        className="pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                    {search && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            onClick={handleClearSearch}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline font-medium">
                                            {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                        </span>
                                        <span className="sm:hidden">
                                            {showAdvancedFilters ? 'Hide' : 'Filters'}
                                        </span>
                                        {!showAdvancedFilters && activeFilterCount > 0 && (
                                            <Badge variant="secondary" className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full px-1.5 py-0 text-xs">
                                                +{activeFilterCount}
                                            </Badge>
                                        )}
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="h-10 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all"
                                        onClick={handleExport}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline font-medium">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Results Info & Active Filters Bar */}
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span>
                                    <span className="mx-1">of</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>
                                    <span className="ml-1">permissions</span>
                                    {search && (
                                        <span className="ml-1">
                                            matching <span className="font-medium text-indigo-600 dark:text-indigo-400">"{search}"</span>
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Active filter badges */}
                                    {hasActiveFilters && (
                                        <>
                                            {moduleFilter !== 'all' && (
                                                <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 rounded-full px-2.5 py-1 text-xs font-medium">
                                                    <Layers className="h-3 w-3 mr-1 inline" />
                                                    Module: {getModuleLabel(moduleFilter)}
                                                </Badge>
                                            )}
                                            {statusFilter !== 'all' && (
                                                <Badge variant="secondary" className={`${
                                                    getStatusColor(statusFilter) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                                    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                                    <Activity className="h-3 w-3 mr-1 inline" />
                                                    Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                                                </Badge>
                                            )}
                                            {rolesCountFilter !== 'all' && (
                                                <Badge variant="secondary" className={`${
                                                    getRolesCountColor(rolesCountFilter) === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                    getRolesCountColor(rolesCountFilter) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                                    getRolesCountColor(rolesCountFilter) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                                    'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                                    <Users className="h-3 w-3 mr-1 inline" />
                                                    {rolesCountOptions.find(o => o.value === rolesCountFilter)?.label}
                                                </Badge>
                                            )}
                                            {/* ✅ FIXED: Check for 'all' instead of empty string */}
                                            {dateRange && dateRange !== 'all' && (
                                                <Badge variant="secondary" className={`${
                                                    getDateRangeColor(dateRange) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                                    getDateRangeColor(dateRange) === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                                    getDateRangeColor(dateRange) === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                                    'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                } border-0 rounded-full px-2.5 py-1 text-xs font-medium`}>
                                                    <Calendar className="h-3 w-3 mr-1 inline" />
                                                    {dateRangeOptions.find(o => o.value === dateRange)?.label}
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                    
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetFilters}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-7 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                        >
                                            <FilterX className="h-3 w-3 mr-1" />
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Basic Filters - Modern Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                                {/* Module Filter */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Layers className="h-3 w-3" />
                                        Module
                                    </Label>
                                    <Select
                                        value={moduleFilter}
                                        onValueChange={setModuleFilter}
                                    >
                                        <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500">
                                            <SelectValue placeholder="All Modules" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Modules</SelectItem>
                                            {availableModules.map((module) => (
                                                <SelectItem key={module} value={module}>
                                                    {module}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        Status
                                    </Label>
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) => setStatusFilter(value as StatusFilterType)}
                                    >
                                        <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Roles Count Filter */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Roles Count
                                    </Label>
                                    <Select
                                        value={rolesCountFilter}
                                        onValueChange={(value) => setRolesCountFilter(value as RolesCountFilterType)}
                                    >
                                        <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Permissions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rolesCountOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            option.color === 'red' ? 'bg-red-500' :
                                                            option.color === 'blue' ? 'bg-blue-500' :
                                                            option.color === 'emerald' ? 'bg-emerald-500' :
                                                            option.color === 'purple' ? 'bg-purple-500' :
                                                            'bg-gray-400'
                                                        }`} />
                                                        {option.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* ✅ FIXED: Created Date Filter - using 'all' as default */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Created Date
                                    </Label>
                                    <Select
                                        value={dateRange}
                                        onValueChange={setDateRange}
                                    >
                                        <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                            <SelectValue placeholder="All Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dateRangeOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            option.color === 'blue' ? 'bg-blue-500' :
                                                            option.color === 'emerald' ? 'bg-emerald-500' :
                                                            option.color === 'amber' ? 'bg-amber-500' :
                                                            option.color === 'orange' ? 'bg-orange-500' :
                                                            'bg-gray-400'
                                                        }`} />
                                                        {option.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Advanced Filters - Modern Accordion Style */}
                            {showAdvancedFilters && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">Quick Actions</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Quick Filters */}
                                        <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                Quick Filters
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                    onClick={() => {
                                                        setStatusFilter('active');
                                                        setShowAdvancedFilters(false);
                                                    }}
                                                >
                                                    <Activity className="h-3 w-3 mr-1" />
                                                    Active Only
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                    onClick={() => {
                                                        setStatusFilter('inactive');
                                                        setShowAdvancedFilters(false);
                                                    }}
                                                >
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive Only
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                    onClick={() => {
                                                        setRolesCountFilter('0');
                                                        setShowAdvancedFilters(false);
                                                    }}
                                                >
                                                    <Users className="h-3 w-3 mr-1" />
                                                    Unused Permissions
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                    onClick={() => {
                                                        setRolesCountFilter('10+');
                                                        setShowAdvancedFilters(false);
                                                    }}
                                                >
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    Popular Permissions
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
                                                    onClick={() => {
                                                        setDateRange('last_30_days');
                                                        setShowAdvancedFilters(false);
                                                    }}
                                                >
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Recently Added
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Information Section */}
                                        <div className="space-y-3 bg-gray-50/40 dark:bg-gray-800/20 p-3 rounded-xl">
                                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-indigo-500" />
                                                Information
                                            </Label>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Roles Count</span> - Number of roles using this permission</p>
                                                <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Created Date</span> - When the permission was added</p>
                                                <p>• <span className="font-medium text-gray-700 dark:text-gray-300">Module</span> - Category/group of the permission</p>
                                                <p>• Use the table header to sort by any column</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Table - Enhanced */}
                <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                        <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Permissions List</CardTitle>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800">
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Permission
                                                        {getSortIcon('name')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                                    onClick={() => handleSort('display_name')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Display Name
                                                        {getSortIcon('display_name')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                                    onClick={() => handleSort('module')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Module
                                                        {getSortIcon('module')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                                    onClick={() => handleSort('status')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Status
                                                        {getSortIcon('status')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                                    onClick={() => handleSort('roles_count')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Roles
                                                        {getSortIcon('roles_count')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                                    onClick={() => handleSort('created_at')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Created
                                                        {getSortIcon('created_at')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50/50 dark:bg-gray-800/30 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {paginatedPermissions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <Key className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                    No permissions found
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
                                                                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 rounded-lg"
                                                                    >
                                                                        Clear Filters
                                                                    </Button>
                                                                )}
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button 
                                                                                variant="outline"
                                                                                className="h-8 border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200 rounded-lg"
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
                                                paginatedPermissions.map((permission) => (
                                                    <TableRow key={permission.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors border-gray-100 dark:border-gray-800">
                                                        <TableCell className="px-4 py-3 whitespace-nowrap dark:text-gray-300">
                                                            <div className="flex items-center gap-3">
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
                                                                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 rounded-full"
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
                                                                className={`h-6 px-2 text-xs font-medium rounded-full ${
                                                                    permission.is_active
                                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                                }`}
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
                                                                <span className="font-medium truncate">{permission.roles_count || 0}</span>
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
                                                                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg dark:text-gray-400 dark:hover:text-gray-300"
                                                                    >
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                                                                    <DropdownMenuItem asChild className="dark:text-gray-200 dark:focus:bg-gray-800 rounded-lg">
                                                                        <Link href={route('admin.permissions.show', permission.id)} className="flex items-center cursor-pointer">
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            <span>View Details</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                    
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleCopyToClipboard(permission.name, 'Permission Name')}
                                                                        className="flex items-center cursor-pointer dark:text-gray-200 dark:focus:bg-gray-800 rounded-lg"
                                                                    >
                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                        <span>Copy Name</span>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleCopyToClipboard(permission.display_name, 'Display Name')}
                                                                        className="flex items-center cursor-pointer dark:text-gray-200 dark:focus:bg-gray-800 rounded-lg"
                                                                    >
                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                        <span>Copy Display Name</span>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                    
                                                                    <DropdownMenuItem 
                                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-950/30 rounded-lg"
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

                        {/* Pagination - Modern */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:opacity-50 rounded-lg"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {paginationItems.map((pageNum) => (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`h-8 w-8 p-0 rounded-lg ${
                                                    currentPage === pageNum 
                                                        ? 'dark:bg-indigo-600 dark:hover:bg-indigo-700' 
                                                        : 'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900'
                                                }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:disabled:opacity-50 rounded-lg"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions & Info - Modern */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
                        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                            <CardTitle className="text-lg dark:text-gray-100">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={route('admin.roles.index')}>
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 rounded-lg">
                                        <Users className="h-3 w-3 mr-2" />
                                        <span className="truncate">Manage Roles</span>
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full justify-start h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 rounded-lg"
                                    onClick={handleExport}
                                >
                                    <Download className="h-3 w-3 mr-2" />
                                    <span className="truncate">Export CSV</span>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 rounded-lg">
                                    <BarChart3 className="h-3 w-3 mr-2" />
                                    <span className="truncate">Usage Report</span>
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full justify-start h-8 col-span-2 border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-200 rounded-lg"
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

                    <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
                        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                            <CardTitle className="text-lg dark:text-gray-100">Module Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {filteredAndSortedPermissions.length > 0 ? (
                                <div className="space-y-3">
                                    {Array.from(new Set(filteredAndSortedPermissions.map(p => p.module))).slice(0, 4).map((module) => {
                                        const modulePermissions = filteredAndSortedPermissions.filter(p => p.module === module);
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
                                                    <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300 rounded-full">
                                                        {modulePermissions.length}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {activeCount} active
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Array.from(new Set(filteredAndSortedPermissions.map(p => p.module))).length > 4 && (
                                        <div className="text-center pt-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="h-8 dark:text-gray-300 dark:hover:bg-gray-900 rounded-lg"
                                                onClick={resetFilters}
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