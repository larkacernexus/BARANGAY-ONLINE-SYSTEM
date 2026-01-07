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
    Home,
    Users,
    Phone,
    MapPin,
    Eye,
    Edit,
    Trash2,
    ChevronUp,
    ChevronDown,
    MoreVertical,
    Clipboard,
    FileText,
    Printer,
    AlertCircle,
    Link as LinkIcon
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, JSX } from 'react';
import { PageProps } from '@/types';

interface Purok {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    leader_name?: string;
    leader_contact?: string;
    total_households?: number;
    total_residents?: number;
    status?: string;
    google_maps_url?: string;
    created_at?: string;
    updated_at?: string;
}

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    member_count: number;
    contact_number: string;
    address: string;
    purok_id?: number;
    purok?: Purok;
    created_at: string;
    status: string;
    members?: any[];
}

interface HouseholdsProps extends PageProps {
    households: {
        data: Household[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
    stats: Array<{label: string, value: number | string}>;
    filters: {
        search?: string;
        status?: string;
        purok_id?: string;
        sort_by?: string;
        sort_order?: string;
    };
    puroks: Purok[];
    allHouseholds: Household[];
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper function to truncate address
const truncateAddress = (address: string, maxLength: number = 40): string => {
    if (!address) return 'N/A';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
};

// Helper function for contact number
const formatContactNumber = (contact: string): string => {
    if (!contact) return 'N/A';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

export default function Households({ households, stats, filters, puroks, allHouseholds }: HouseholdsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [purokFilter, setPurokFilter] = useState(filters.purok_id || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'household_number');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
    const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'household' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'address': return 20;
                case 'contact': return 10;
                case 'household': return 12;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'address': return 25;
                case 'contact': return 12;
                case 'household': return 15;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'address': return 30;
                case 'contact': return 15;
                case 'household': return 18;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'address': return 35;
            case 'contact': return 15;
            case 'household': return 20;
            default: return 30;
        }
    };

    // Helper function to get purok name from household
    const getPurokName = (household: Household): string => {
        if (household.purok && typeof household.purok === 'object') {
            return household.purok.name;
        }
        if (household.purok_id) {
            const purok = puroks.find(p => p.id === household.purok_id);
            return purok ? purok.name : 'Unknown';
        }
        return 'No Purok';
    };

    // Helper function to get purok object from household
    const getPurok = (household: Household): Purok | null => {
        if (household.purok && typeof household.purok === 'object') {
            return household.purok;
        }
        if (household.purok_id) {
            return puroks.find(p => p.id === household.purok_id) || null;
        }
        return null;
    };

    // Filter households client-side
    const filteredHouseholds = useMemo(() => {
        let result = [...allHouseholds];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(household => 
                household.household_number.toLowerCase().includes(searchLower) ||
                household.head_of_family.toLowerCase().includes(searchLower) ||
                household.address.toLowerCase().includes(searchLower) ||
                (household.contact_number && household.contact_number.toLowerCase().includes(searchLower))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(household => household.status === statusFilter);
        }

        // Purok filter
        if (purokFilter !== 'all') {
            const purokId = parseInt(purokFilter);
            result = result.filter(household => {
                const householdPurok = getPurok(household);
                return householdPurok && householdPurok.id === purokId;
            });
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'household_number':
                    const aNum = parseInt(a.household_number.replace(/\D/g, ''));
                    const bNum = parseInt(b.household_number.replace(/\D/g, ''));
                    aValue = isNaN(aNum) ? a.household_number : aNum;
                    bValue = isNaN(bNum) ? b.household_number : bNum;
                    break;
                case 'head_of_family':
                    aValue = a.head_of_family.toLowerCase();
                    bValue = b.head_of_family.toLowerCase();
                    break;
                case 'member_count':
                    aValue = a.member_count;
                    bValue = b.member_count;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'purok':
                    aValue = getPurokName(a).toLowerCase();
                    bValue = getPurokName(b).toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a.household_number;
                    bValue = b.household_number;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [allHouseholds, search, statusFilter, purokFilter, sortBy, sortOrder, puroks]);

    // Calculate pagination
    const totalItems = filteredHouseholds.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHouseholds = filteredHouseholds.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, purokFilter, sortBy, sortOrder]);

    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPurokFilter('all');
        setSortBy('household_number');
        setSortOrder('asc');
    };

    const handleDelete = (household: Household) => {
        if (confirm(`Are you sure you want to delete household ${household.household_number}?`)) {
            router.delete(`/households/${household.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Show success message or refresh
                }
            });
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            default: return 'outline';
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = search || statusFilter !== 'all' || purokFilter !== 'all';

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        const activeCount = filteredHouseholds.filter(h => h.status === 'active').length;
        const totalMembers = filteredHouseholds.reduce((sum, h) => sum + h.member_count, 0);
        const avgMembers = filteredHouseholds.length > 0 
            ? (totalMembers / filteredHouseholds.length).toFixed(1)
            : '0.0';

        return [
            { label: 'Total Households', value: filteredHouseholds.length },
            { label: 'Active Households', value: activeCount },
            { label: 'Total Members', value: totalMembers },
            { label: 'Average Members', value: avgMembers },
        ];
    }, [filteredHouseholds]);

    return (
        <AppLayout
            title="Households"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Households', href: '/households' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Household Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage household registrations and information
                        </p>
                    </div>
                    <Link href="/households/create">
                        <Button className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Register Household</span>
                            <span className="sm:hidden">Register</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredStats.map((stat, index) => (
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

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Search households by name, number, or address..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className="h-9"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">
                                            {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                        </span>
                                        <span className="sm:hidden">
                                            {showAdvancedFilters ? 'Hide' : 'Filters'}
                                        </span>
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = new URL('/households/export', window.location.origin);
                                            if (search) exportUrl.searchParams.append('search', search);
                                            if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                            if (purokFilter !== 'all') exportUrl.searchParams.append('purok_id', purokFilter);
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
                                    <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                    <select 
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Purok:</span>
                                    <select 
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={purokFilter}
                                        onChange={(e) => setPurokFilter(e.target.value)}
                                    >
                                        <option value="all">All Puroks</option>
                                        {puroks.map((purok) => (
                                            <option key={purok.id} value={purok.id}>
                                                {truncateText(purok.name, 15)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                                    <select 
                                        className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="household_number">Household No.</option>
                                        <option value="head_of_family">Head of Family</option>
                                        <option value="member_count">Members</option>
                                        <option value="created_at">Date Registered</option>
                                        <option value="purok">Purok</option>
                                        <option value="status">Status</option>
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="border-t pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Member Count Filter */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Member Count</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Min members"
                                                    type="number"
                                                    className="w-24 sm:w-32"
                                                />
                                                <span className="self-center text-sm">to</span>
                                                <Input
                                                    placeholder="Max members"
                                                    type="number"
                                                    className="w-24 sm:w-32"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {[
                                                    { label: 'Single (1)', min: 1, max: 1 },
                                                    { label: 'Small (2-4)', min: 2, max: 4 },
                                                    { label: 'Medium (5-7)', min: 5, max: 7 },
                                                    { label: 'Large (8+)', min: 8, max: 100 }
                                                ].map((range, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="cursor-pointer hover:bg-gray-100 text-xs"
                                                        // onClick={() => handleMemberRangeSelect(range)}
                                                    >
                                                        {windowWidth < 640 ? range.label.split(' ')[0] : range.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Status Filter */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`h-8 ${statusFilter === 'active' ? 'bg-green-50 text-green-700' : ''}`}
                                                    onClick={() => setStatusFilter('active')}
                                                >
                                                    Active
                                                </Button>
                                                {puroks.slice(0, 3).map(purok => (
                                                    <Button
                                                        key={purok.id}
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${purokFilter === purok.id.toString() ? 'bg-blue-50 text-blue-700' : ''}`}
                                                        onClick={() => setPurokFilter(purok.id.toString())}
                                                    >
                                                        {windowWidth < 640 ? truncateText(purok.name, 8) : truncateText(purok.name, 12)}
                                                    </Button>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => {
                                                        setSortBy('member_count');
                                                        setSortOrder('desc');
                                                    }}
                                                >
                                                    Largest
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} households
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

                {/* Households Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">Household List</CardTitle>
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
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('household_number')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Household No.
                                                        {getSortIcon('household_number')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('head_of_family')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Head of Family
                                                        {getSortIcon('head_of_family')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('member_count')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Members
                                                        {getSortIcon('member_count')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Contact
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                    Address
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('purok')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Purok
                                                        {getSortIcon('purok')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('status')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Status
                                                        {getSortIcon('status')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedHouseholds.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                        No households found. {hasActiveFilters && 'Try changing your filters.'}
                                                        {!hasActiveFilters && (
                                                            <div className="mt-2">
                                                                <Link href="/households/create">
                                                                    <Button size="sm" className="h-8">
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Register First Household
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedHouseholds.map((household) => {
                                                    const purokName = getPurokName(household);
                                                    const householdLength = getTruncationLength('household');
                                                    const nameLength = getTruncationLength('name');
                                                    const addressLength = getTruncationLength('address');
                                                    const contactLength = getTruncationLength('contact');
                                                    
                                                    return (
                                                        <TableRow key={household.id}>
                                                            <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                <div 
                                                                    className="flex items-center gap-2 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nHousehold Number: ${household.household_number}`}
                                                                >
                                                                    <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <div 
                                                                        className="font-medium truncate"
                                                                        data-full-text={household.household_number}
                                                                    >
                                                                        {truncateText(household.household_number, householdLength)}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nHead of Family: ${household.head_of_family}`}
                                                                >
                                                                    <div 
                                                                        className="truncate"
                                                                        data-full-text={household.head_of_family}
                                                                    >
                                                                        {truncateText(household.head_of_family, nameLength)}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <span>{household.member_count} member{household.member_count !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="flex items-center gap-1 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nContact: ${household.contact_number || 'N/A'}`}
                                                                >
                                                                    <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                    <div 
                                                                        className="truncate"
                                                                        data-full-text={household.contact_number}
                                                                    >
                                                                        {formatContactNumber(household.contact_number)}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="flex items-center gap-1 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nAddress: ${household.address}`}
                                                                >
                                                                    <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                    <div 
                                                                        className="truncate"
                                                                        data-full-text={household.address}
                                                                    >
                                                                        {truncateAddress(household.address, addressLength)}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className="truncate max-w-full"
                                                                    title={purokName}
                                                                >
                                                                    {truncateText(purokName, 15)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <Badge 
                                                                    variant={getStatusBadgeVariant(household.status)}
                                                                    className="truncate max-w-full"
                                                                    title={household.status}
                                                                >
                                                                    {household.status}
                                                                </Badge>
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
                                                                            <Link href={`/households/${household.id}`} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/households/${household.id}/edit`} className="flex items-center cursor-pointer">
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                <span>Edit Household</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(household.household_number, 'Household Number')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Clipboard className="mr-2 h-4 w-4" />
                                                                            <span>Copy Household No.</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        {household.contact_number && (
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(household.contact_number, 'Contact')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Clipboard className="mr-2 h-4 w-4" />
                                                                                <span>Copy Contact</span>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/clearances/create?household_id=${household.id}`} className="flex items-center cursor-pointer">
                                                                                <FileText className="mr-2 h-4 w-4" />
                                                                                <span>Create Clearance</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/households/${household.id}/print`} className="flex items-center cursor-pointer">
                                                                                <Printer className="mr-2 h-4 w-4" />
                                                                                <span>Print Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        {household.status !== 'inactive' && (
                                                                            <DropdownMenuItem 
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                onClick={() => handleDelete(household)}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete Household</span>
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
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Recent Registrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {paginatedHouseholds.slice(0, 3).length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">No recent registrations</p>
                            ) : (
                                <div className="space-y-3">
                                    {paginatedHouseholds.slice(0, 3).map((household) => {
                                        const purokName = getPurokName(household);
                                        const nameLength = getTruncationLength('name');
                                        
                                        return (
                                            <div key={household.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                                <div className="flex-1 min-w-0">
                                                    <p 
                                                        className="font-medium truncate"
                                                        title={household.head_of_family}
                                                    >
                                                        {truncateText(household.head_of_family, nameLength)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {household.household_number} • {formatDate(household.created_at)}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {household.member_count} members • {truncateText(purokName, 20)}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="ml-2 flex-shrink-0">New</Badge>
                                            </div>
                                        );
                                    })}
                                    {paginatedHouseholds.length > 3 && (
                                        <div className="text-center pt-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setCurrentPage(1)}
                                                className="h-8"
                                            >
                                                View All Households
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/households/import">
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        <Download className="h-3 w-3 mr-2" />
                                        Bulk Import
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full justify-start h-8"
                                    onClick={() => {
                                        const exportUrl = new URL('/households/export', window.location.origin);
                                        if (search) exportUrl.searchParams.append('search', search);
                                        if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                        if (purokFilter !== 'all') exportUrl.searchParams.append('purok_id', purokFilter);
                                        window.open(exportUrl.toString(), '_blank');
                                    }}
                                >
                                    Export Data
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                    Generate Report
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                    Print List
                                </Button>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-500 mb-2">Distribution by Purok:</p>
                                <div className="space-y-1 text-sm">
                                    {puroks.map((purok) => {
                                        const count = filteredHouseholds.filter(h => {
                                            const householdPurok = getPurok(h);
                                            return householdPurok && householdPurok.id === purok.id;
                                        }).length;
                                        if (count === 0) return null;
                                        return (
                                            <div key={purok.id} className="flex items-center justify-between">
                                                <span className="truncate max-w-[100px]" title={purok.name}>
                                                    {truncateText(purok.name, 15)}
                                                </span>
                                                <Badge variant="outline">{count}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}