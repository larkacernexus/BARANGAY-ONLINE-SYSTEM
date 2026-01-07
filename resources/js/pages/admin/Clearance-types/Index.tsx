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
    FileText,
    Clock,
    Calendar,
    DollarSign,
    Users,
    Edit,
    Eye,
    Trash2,
    MoreVertical,
    Copy,
    CheckCircle,
    XCircle,
    Shield,
    Globe,
    CreditCard,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Loader2,
    AlertCircle,
    ArrowUpDown,
    CopyCheck,
    ExternalLink,
    Printer
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, JSX } from 'react';

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    clearances_count?: number;
    created_at: string;
    updated_at: string;
    purpose_options?: string;
    document_types_count?: number;
}

interface PageProps {
    clearanceTypes: {
        data: ClearanceType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        status?: string;
        requires_payment?: string;
        sort?: string;
        direction?: string;
    };
    stats: {
        total: number;
        active: number;
        requires_payment: number;
        requires_approval: number;
        online_only: number;
    };
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export default function ClearanceTypesIndex() {
    const { props } = usePage<PageProps>();
    const { clearanceTypes, filters, stats } = props;
    
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentFilter, setPaymentFilter] = useState(filters.requires_payment || 'all');
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
    const getTruncationLength = (type: 'name' | 'description' | 'code' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 20;
                case 'description': return 25;
                case 'code': return 10;
                default: return 20;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 25;
                case 'description': return 30;
                case 'code': return 12;
                default: return 25;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 30;
                case 'description': return 35;
                case 'code': return 15;
                default: return 30;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 35;
            case 'description': return 40;
            case 'code': return 18;
            default: return 35;
        }
    };

    // Filter clearance types
    const filteredTypes = useMemo(() => {
        let result = [...clearanceTypes.data];
        
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(type => 
                type.name.toLowerCase().includes(searchLower) ||
                type.code.toLowerCase().includes(searchLower) ||
                type.description.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            result = result.filter(type => type.is_active === isActive);
        }
        
        // Payment filter
        if (paymentFilter !== 'all') {
            const requiresPayment = paymentFilter === 'yes';
            result = result.filter(type => type.requires_payment === requiresPayment);
        }
        
        return result;
    }, [clearanceTypes.data, searchTerm, statusFilter, paymentFilter]);

    // Calculate pagination
    const totalItems = filteredTypes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTypes = filteredTypes.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, paymentFilter]);

    const handleFilterChange = (filterType: string, value: string) => {
        const params: any = { ...filters };
        
        if (filterType === 'status') {
            setStatusFilter(value);
            params.status = value !== 'all' ? value : undefined;
        } else if (filterType === 'requires_payment') {
            setPaymentFilter(value);
            params.requires_payment = value !== 'all' ? value : undefined;
        }
        
        router.get(route('clearance-types.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (column: string) => {
        const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('clearance-types.index'), {
            ...filters,
            sort: column,
            direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPaymentFilter('all');
        router.get(route('clearance-types.index'));
    };

    const handleToggleStatus = (type: ClearanceType) => {
        router.post(route('clearance-types.toggle-status', type.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['clearanceTypes'] });
            },
        });
    };

    const handleDuplicate = (type: ClearanceType) => {
        if (confirm(`Duplicate "${type.name}" clearance type?`)) {
            router.post(route('clearance-types.duplicate', type.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log(`Copied ${label} to clipboard:`, text);
        });
    };

    const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return isActive ? 'default' : 'secondary';
    };

    const getStatusIcon = (isActive: boolean) => {
        return isActive ? 
            <CheckCircle className="h-4 w-4 text-green-500" /> : 
            <XCircle className="h-4 w-4 text-gray-500" />;
    };

    const getPurposeOptionsCount = (type: ClearanceType) => {
        if (!type.purpose_options) return 0;
        return type.purpose_options.split(',').length;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || paymentFilter !== 'all';

    return (
        <AppLayout
            title="Clearance Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearance Types', href: '/clearance-types' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clearance Types</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Manage different types of clearances and certificates
                        </p>
                    </div>
                    <Link href="/clearance-types/create">
                        <Button className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Create Type</span>
                            <span className="sm:hidden">Create</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                Total Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                All clearance types
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Active
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.active}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {Math.round((stats.active / stats.total) * 100)}% of total
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-amber-500" />
                                Paid Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.requires_payment}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {Math.round((stats.requires_payment / stats.total) * 100)}% of total
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-purple-500" />
                                Needs Approval
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.requires_approval}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {Math.round((stats.requires_approval / stats.total) * 100)}% of total
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <Globe className="h-4 w-4 mr-2 text-cyan-500" />
                                Online Only
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.online_only}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {Math.round((stats.online_only / stats.total) * 100)}% of total
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by name, code, or description..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="border rounded px-3 py-2 text-sm w-28"
                                        value={statusFilter}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    
                                    <select
                                        className="border rounded px-3 py-2 text-sm w-32"
                                        value={paymentFilter}
                                        onChange={(e) => handleFilterChange('requires_payment', e.target.value)}
                                    >
                                        <option value="all">All Payment</option>
                                        <option value="yes">Paid</option>
                                        <option value="no">Free</option>
                                    </select>
                                    
                                    <Button 
                                        variant="outline"
                                        className="h-9"
                                        onClick={() => {
                                            const exportUrl = new URL('/clearance-types/export', window.location.origin);
                                            if (searchTerm) exportUrl.searchParams.append('search', searchTerm);
                                            if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                            if (paymentFilter !== 'all') exportUrl.searchParams.append('requires_payment', paymentFilter);
                                            window.open(exportUrl.toString(), '_blank');
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Active filters indicator and clear button */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} types
                                    {searchTerm && ` matching "${searchTerm}"`}
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

                {/* Clearance Types Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">Clearance Types List</CardTitle>
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
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                                    <div className="flex items-center gap-1">
                                                        Name & Details
                                                        <button
                                                            onClick={() => handleSort('name')}
                                                            className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                                            title="Sort by name"
                                                        >
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    <div className="flex items-center gap-1">
                                                        Fee
                                                        <button
                                                            onClick={() => handleSort('fee')}
                                                            className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                                            title="Sort by fee"
                                                        >
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Processing
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    Validity
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                    <div className="flex items-center gap-1">
                                                        Issued
                                                        <button
                                                            onClick={() => handleSort('clearances_count')}
                                                            className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                                            title="Sort by issued count"
                                                        >
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedTypes.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                    No clearance types found
                                                                </h3>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {hasActiveFilters 
                                                                        ? 'Try changing your filters or search criteria.'
                                                                        : 'Get started by creating a clearance type.'}
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
                                                                <Link href="/clearance-types/create">
                                                                    <Button className="h-8">
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Create Type
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedTypes.map((type) => {
                                                    const nameLength = getTruncationLength('name');
                                                    const descLength = getTruncationLength('description');
                                                    const codeLength = getTruncationLength('code');
                                                    
                                                    return (
                                                        <TableRow key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                            <TableCell className="px-4 py-3">
                                                                <div 
                                                                    className="space-y-1 cursor-text select-text"
                                                                    onDoubleClick={(e) => {
                                                                        const selection = window.getSelection();
                                                                        if (selection) {
                                                                            const range = document.createRange();
                                                                            range.selectNodeContents(e.currentTarget);
                                                                            selection.removeAllRanges();
                                                                            selection.addRange(range);
                                                                        }
                                                                    }}
                                                                    title={`Double-click to select all\nName: ${type.name}\nCode: ${type.code}\nDescription: ${type.description}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div 
                                                                            className="font-medium text-gray-900 dark:text-white truncate"
                                                                            data-full-text={type.name}
                                                                        >
                                                                            {truncateText(type.name, nameLength)}
                                                                        </div>
                                                                        <Badge 
                                                                            variant={getStatusBadgeVariant(type.is_active)}
                                                                            className="flex items-center gap-1"
                                                                        >
                                                                            {getStatusIcon(type.is_active)}
                                                                            {type.is_active ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <code 
                                                                            className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 truncate"
                                                                            data-full-text={type.code}
                                                                        >
                                                                            {truncateText(type.code, codeLength)}
                                                                        </code>
                                                                        {type.requires_payment && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                <DollarSign className="h-3 w-3 mr-1" />
                                                                                Paid
                                                                            </Badge>
                                                                        )}
                                                                        {type.requires_approval && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                <Shield className="h-3 w-3 mr-1" />
                                                                                Approval
                                                                            </Badge>
                                                                        )}
                                                                        {type.is_online_only && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                <Globe className="h-3 w-3 mr-1" />
                                                                                Online
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div 
                                                                        className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1"
                                                                        data-full-text={type.description}
                                                                    >
                                                                        {truncateText(type.description, descLength)}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                        <div className="flex items-center gap-1">
                                                                            <FileText className="h-3 w-3" />
                                                                            <span>{type.document_types_count || 0} docs</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <CopyCheck className="h-3 w-3" />
                                                                            <span>{getPurposeOptionsCount(type)} purposes</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="font-medium text-gray-900 dark:text-white truncate" title={type.formatted_fee}>
                                                                    {type.formatted_fee}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <span>{type.processing_days} day{type.processing_days !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <span>{type.validity_days} day{type.validity_days !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                    <span className="font-medium">{type.clearances_count || 0}</span>
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
                                                                            <Link href={`/clearance-types/${type.id}`} className="flex items-center cursor-pointer">
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                <span>View Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/clearance-types/${type.id}/edit`} className="flex items-center cursor-pointer">
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                <span>Edit Type</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/clearances/create?type=${type.id}`} className="flex items-center cursor-pointer">
                                                                                <FileText className="mr-2 h-4 w-4" />
                                                                                <span>Issue Clearance</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(type.code, 'Clearance Type Code')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Code</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleCopyToClipboard(type.name, 'Clearance Type Name')}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Copy Name</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/clearance-types/${type.id}/print`} className="flex items-center cursor-pointer">
                                                                                <Printer className="mr-2 h-4 w-4" />
                                                                                <span>Print Details</span>
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuSeparator />
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleDuplicate(type)}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            <span>Duplicate Type</span>
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleToggleStatus(type)}
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            {type.is_active ? (
                                                                                <>
                                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                                    <span>Deactivate</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                                    <span>Activate</span>
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuItem>
                                                                        
                                                                        <DropdownMenuItem 
                                                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                            onClick={() => {
                                                                                if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
                                                                                    router.delete(route('clearance-types.destroy', type.id));
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            <span>Delete Type</span>
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

                {/* Quick Actions */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Link href="/clearance-types/create">
                                <Button variant="outline" className="w-full justify-start h-auto py-3">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                                            <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium truncate">Create New Type</div>
                                            <div className="text-sm text-gray-500 truncate">Add new clearance type</div>
                                        </div>
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/clearances/create">
                                <Button variant="outline" className="w-full justify-start h-auto py-3">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/30">
                                            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium truncate">Issue Clearance</div>
                                            <div className="text-sm text-gray-500 truncate">Process new clearance</div>
                                        </div>
                                    </div>
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full justify-start h-auto py-3">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/30">
                                        <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium truncate">Generate Report</div>
                                        <div className="text-sm text-gray-500 truncate">Clearance statistics</div>
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-auto py-3">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/30">
                                        <Download className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium truncate">Export Data</div>
                                        <div className="text-sm text-gray-500 truncate">Excel, PDF, CSV</div>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}