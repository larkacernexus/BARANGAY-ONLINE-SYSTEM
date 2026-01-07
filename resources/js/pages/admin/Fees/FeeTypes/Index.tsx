import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    FileText,
    DollarSign,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    MoreVertical,
    Download,
    Upload,
    Copy,
    RefreshCw,
    AlertCircle,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Hash,
    Tag,
    AlertTriangle
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface FeeType {
    id: number;
    code: string;
    name: string;
    short_name: string;
    category: string;
    base_amount: number | string | null;
    amount_type: string;
    frequency: string;
    validity_days: number | null;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    created_at: string;
    updated_at: string;
    description?: string;
    has_surcharge: boolean;
    has_penalty: boolean;
    has_senior_discount: boolean;
    has_pwd_discount: boolean;
    has_solo_parent_discount: boolean;
    has_indigent_discount: boolean;
}

interface PageProps {
    feeTypes?: FeeType[] | null;
    categories?: Record<string, string>;
    errors?: Record<string, string>;
}

// Format currency with proper error handling
function formatCurrency(amount: any): string {
    if (amount === null || amount === undefined || amount === '') {
        return '₱0.00';
    }
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    
    // Check if it's a valid number
    if (isNaN(numAmount)) {
        return '₱0.00';
    }
    
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

// Format date
function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
}

// Get category icon
const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
        'tax': <DollarSign className="h-4 w-4" />,
        'clearance': <FileText className="h-4 w-4" />,
        'certificate': <FileText className="h-4 w-4" />,
        'service': <FileText className="h-4 w-4" />,
        'rental': <Calendar className="h-4 w-4" />,
        'fine': <AlertCircle className="h-4 w-4" />,
        'contribution': <Users className="h-4 w-4" />,
        'other': <Tag className="h-4 w-4" />
    };
    return icons[category] || <Tag className="h-4 w-4" />;
};

// Get category color
const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        'tax': 'bg-blue-100 text-blue-800 border-blue-200',
        'clearance': 'bg-green-100 text-green-800 border-green-200',
        'certificate': 'bg-purple-100 text-purple-800 border-purple-200',
        'service': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'rental': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'fine': 'bg-red-100 text-red-800 border-red-200',
        'contribution': 'bg-orange-100 text-orange-800 border-orange-200',
        'other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function FeeTypesIndex({ 
    feeTypes = [], 
    categories = {}, 
}: PageProps) {
    // Ensure feeTypes is always an array
    const safeFeeTypes = Array.isArray(feeTypes) ? feeTypes : [];

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [selectedFeeTypes, setSelectedFeeTypes] = useState<number[]>([]);

    // Filter and sort fee types (client-side)
    const filteredFeeTypes = useMemo(() => {
        let filtered = [...safeFeeTypes];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(feeType =>
                feeType.code?.toLowerCase().includes(query) ||
                feeType.name?.toLowerCase().includes(query) ||
                feeType.short_name?.toLowerCase().includes(query) ||
                feeType.description?.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(feeType => feeType.category === selectedCategory);
        }

        // Apply status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(feeType => 
                selectedStatus === 'active' ? feeType.is_active : !feeType.is_active
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sortField as keyof FeeType];
            let bValue: any = b[sortField as keyof FeeType];

            // Handle special cases
            if (sortField === 'base_amount') {
                // Handle string or number values for base_amount
                const aNum = typeof a.base_amount === 'string' ? parseFloat(a.base_amount) : Number(a.base_amount);
                const bNum = typeof b.base_amount === 'string' ? parseFloat(b.base_amount) : Number(b.base_amount);
                aValue = isNaN(aNum) ? 0 : aNum;
                bValue = isNaN(bNum) ? 0 : bNum;
            } else if (sortField === 'created_at') {
                aValue = new Date(a.created_at || '').getTime();
                bValue = new Date(b.created_at || '').getTime();
            } else if (sortField === 'name') {
                aValue = a.name || '';
                bValue = b.name || '';
            } else if (sortField === 'code') {
                aValue = a.code || '';
                bValue = b.code || '';
            } else if (sortField === 'category') {
                aValue = a.category || '';
                bValue = b.category || '';
            }

            // Handle null/undefined values
            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [safeFeeTypes, searchQuery, selectedCategory, selectedStatus, sortField, sortDirection]);

    // Calculate pagination
    const totalItems = filteredFeeTypes.length;
    const totalPages = Math.ceil(filteredFeeTypes.length / itemsPerPage);
    
    // Get paginated items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFeeTypes = filteredFeeTypes.slice(startIndex, endIndex);

    // Handle sort
    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField, sortDirection]);

    // Handle select all
    const handleSelectAll = useCallback(() => {
        if (selectedFeeTypes.length === paginatedFeeTypes.length) {
            setSelectedFeeTypes([]);
        } else {
            setSelectedFeeTypes(paginatedFeeTypes.map(feeType => feeType.id));
        }
    }, [paginatedFeeTypes, selectedFeeTypes.length]);

    // Handle individual selection
    const handleSelectFeeType = useCallback((id: number) => {
        setSelectedFeeTypes(prev =>
            prev.includes(id)
                ? prev.filter(feeTypeId => feeTypeId !== id)
                : [...prev, id]
        );
    }, []);

    // Handle bulk actions
    const handleBulkAction = useCallback((action: string) => {
        if (selectedFeeTypes.length === 0) {
            alert('Please select fee types to perform this action');
            return;
        }

        switch (action) {
            case 'activate':
                if (confirm(`Activate ${selectedFeeTypes.length} fee type(s)?`)) {
                    router.post('/admin/fee-types/bulk-activate', { ids: selectedFeeTypes }, {
                        onSuccess: () => {
                            // Clear selection after successful action
                            setSelectedFeeTypes([]);
                        }
                    });
                }
                break;
            case 'deactivate':
                if (confirm(`Deactivate ${selectedFeeTypes.length} fee type(s)?`)) {
                    router.post('/admin/fee-types/bulk-deactivate', { ids: selectedFeeTypes }, {
                        onSuccess: () => {
                            // Clear selection after successful action
                            setSelectedFeeTypes([]);
                        }
                    });
                }
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete ${selectedFeeTypes.length} fee type(s)? This action cannot be undone.`)) {
                    router.post('/admin/fee-types/bulk-delete', { ids: selectedFeeTypes }, {
                        onSuccess: () => {
                            // Clear selection after successful action
                            setSelectedFeeTypes([]);
                        }
                    });
                }
                break;
            case 'export':
                // For export, we might want to use server-side filtering
                router.get('/admin/fee-types/export', {
                    search: searchQuery,
                    category: selectedCategory !== 'all' ? selectedCategory : undefined,
                    status: selectedStatus !== 'all' ? selectedStatus : undefined,
                    ids: selectedFeeTypes.length > 0 ? selectedFeeTypes : undefined
                });
                break;
        }
    }, [selectedFeeTypes, searchQuery, selectedCategory, selectedStatus]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Handle clear filters
    const handleClearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedStatus('all');
        setCurrentPage(1);
        setSelectedFeeTypes([]);
    }, []);

    // Handle filter changes - reset to page 1
    const handleFilterChange = useCallback((type: 'search' | 'category' | 'status', value: string) => {
        if (type === 'search') setSearchQuery(value);
        if (type === 'category') setSelectedCategory(value);
        if (type === 'status') setSelectedStatus(value);
        setCurrentPage(1);
        setSelectedFeeTypes([]);
    }, []);

    // Statistics based on filtered data
    const stats = useMemo(() => {
        const totalAmount = filteredFeeTypes.reduce((sum, ft) => {
            const amount = ft.base_amount;
            if (amount === null || amount === undefined || amount === '') return sum;
            
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
            return sum + (isNaN(numAmount) ? 0 : numAmount);
        }, 0);

        return {
            total: filteredFeeTypes.length,
            active: filteredFeeTypes.filter(ft => ft.is_active).length,
            inactive: filteredFeeTypes.filter(ft => !ft.is_active).length,
            mandatory: filteredFeeTypes.filter(ft => ft.is_mandatory).length,
            autoGenerate: filteredFeeTypes.filter(ft => ft.auto_generate).length,
            totalAmount: totalAmount
        };
    }, [filteredFeeTypes]);

    // Category counts based on filtered data
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredFeeTypes.forEach(feeType => {
            const category = feeType.category || 'other';
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }, [filteredFeeTypes]);

    return (
        <AppLayout
            title="Fee Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Fee Types', href: '/fee-types' }
            ]}
        >
            <Head title="Fee Types" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Fee Types</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage barangay fees, taxes, and services
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBulkAction('export')}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Link href="/admin/fee-types/import">
                            <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                            </Button>
                        </Link>
                        <Link href="/fee-types/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Fee Type
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Filtered Fee Types</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Hash className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="rounded-lg bg-green-100 p-3">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                                </div>
                                <div className="rounded-lg bg-red-100 p-3">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Base Amount</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters & Search
                        </CardTitle>
                        <CardDescription>
                            Filter and search fee types (Client-side filtering)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <Label htmlFor="search">Search Fee Types</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Search by code, name, or description..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                    value={selectedCategory} 
                                    onValueChange={(value) => handleFilterChange('category', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {Object.entries(categories).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label} ({categoryCounts[value] || 0})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={selectedStatus} 
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active Only</SelectItem>
                                        <SelectItem value="inactive">Inactive Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-500">
                                Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of {totalItems} fee types
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedFeeTypes.length > 0 && (
                                    <div className="text-sm font-medium text-primary">
                                        {selectedFeeTypes.length} selected
                                    </div>
                                )}
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleClearFilters}
                                    disabled={!searchQuery && selectedCategory === 'all' && selectedStatus === 'all'}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>

                        {/* Selected actions */}
                        {selectedFeeTypes.length > 0 && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-primary/5 rounded-lg border">
                                <div className="flex-1">
                                    <span className="font-medium">{selectedFeeTypes.length} fee type(s) selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('activate')}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('deactivate')}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Deactivate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('export')}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Selected
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleBulkAction('delete')}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Selected
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Fee Types Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Fee Types List</CardTitle>
                                <CardDescription>
                                    Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of {totalItems} fee types
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                                    setItemsPerPage(parseInt(value));
                                    setCurrentPage(1);
                                }}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Items per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 per page</SelectItem>
                                        <SelectItem value="25">25 per page</SelectItem>
                                        <SelectItem value="50">50 per page</SelectItem>
                                        <SelectItem value="100">100 per page</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {safeFeeTypes.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg">
                                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-700 mb-2">No fee types yet</h3>
                                <p className="text-gray-500 mb-6">
                                    Start by creating your first fee type for barangay collections
                                </p>
                                <Link href="/admin/fee-types/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Fee Type
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={
                                                            paginatedFeeTypes.length > 0 &&
                                                            selectedFeeTypes.length === paginatedFeeTypes.length
                                                        }
                                                        onCheckedChange={handleSelectAll}
                                                        aria-label="Select all"
                                                    />
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('code')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Code
                                                        {sortField === 'code' && (
                                                            <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                                                        )}
                                                        {sortField !== 'code' && (
                                                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Name
                                                        {sortField === 'name' && (
                                                            <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                                                        )}
                                                        {sortField !== 'name' && (
                                                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('category')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Category
                                                        {sortField === 'category' && (
                                                            <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                                                        )}
                                                        {sortField !== 'category' && (
                                                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('base_amount')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Amount
                                                        {sortField === 'base_amount' && (
                                                            <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                                                        )}
                                                        {sortField !== 'base_amount' && (
                                                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Frequency</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('created_at')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Created
                                                        {sortField === 'created_at' && (
                                                            <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                                                        )}
                                                        {sortField !== 'created_at' && (
                                                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedFeeTypes.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-8">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <Search className="h-12 w-12 text-gray-300 mb-3" />
                                                            <h3 className="text-lg font-medium text-gray-700">No matching fee types</h3>
                                                            <p className="text-gray-500 mt-1">
                                                                Try adjusting your filters or search terms
                                                            </p>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="mt-3"
                                                                onClick={handleClearFilters}
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Clear All Filters
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedFeeTypes.map((feeType) => (
                                                    <TableRow key={feeType.id} className="hover:bg-gray-50">
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedFeeTypes.includes(feeType.id)}
                                                                onCheckedChange={() => handleSelectFeeType(feeType.id)}
                                                                aria-label={`Select ${feeType.name}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-mono font-medium">{feeType.code || 'N/A'}</div>
                                                            {feeType.short_name && (
                                                                <div className="text-xs text-gray-500">{feeType.short_name}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{feeType.name || 'Unnamed'}</div>
                                                            {feeType.description && (
                                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                    {feeType.description}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={getCategoryColor(feeType.category || 'other')}>
                                                                <span className="flex items-center gap-1">
                                                                    {getCategoryIcon(feeType.category || 'other')}
                                                                    {categories[feeType.category] || feeType.category || 'Other'}
                                                                </span>
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{formatCurrency(feeType.base_amount)}</div>
                                                            <div className="text-xs text-gray-500 capitalize">
                                                                {(feeType.amount_type || 'fixed') === 'fixed' ? 'Fixed' : 'Variable'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="capitalize">
                                                                {(feeType.frequency || 'one_time').replace('_', ' ')}
                                                            </Badge>
                                                            {feeType.validity_days && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {feeType.validity_days} days valid
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={feeType.is_active ? "default" : "secondary"}>
                                                                    {feeType.is_active ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                                {feeType.is_mandatory && (
                                                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                                                        Mandatory
                                                                    </Badge>
                                                                )}
                                                                {feeType.auto_generate && (
                                                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                        Auto-gen
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">{formatDate(feeType.created_at)}</div>
                                                            <div className="text-xs text-gray-500">
                                                                Updated {formatDate(feeType.updated_at)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link href={`/admin/fee-types/${feeType.id}`}>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <Eye className="h-4 w-4" />
                                                                        <span className="sr-only">View</span>
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/admin/fee-types/${feeType.id}/edit`}>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <Edit className="h-4 w-4" />
                                                                        <span className="sr-only">Edit</span>
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/admin/fee-types/${feeType.id}/duplicate`}>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <Copy className="h-4 w-4" />
                                                                        <span className="sr-only">Duplicate</span>
                                                                    </Button>
                                                                </Link>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                            <span className="sr-only">More</span>
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/fee-types/${feeType.id}`}>
                                                                                View Details
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/fee-types/${feeType.id}/edit`}>
                                                                                Edit Fee Type
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/fee-types/${feeType.id}/duplicate`}>
                                                                                Duplicate
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/fees?fee_type=${feeType.id}`}>
                                                                                View Associated Fees
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/admin/payments?fee_type=${feeType.id}`}>
                                                                                View Payment History
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() => {
                                                                                if (confirm('Are you sure you want to delete this fee type?')) {
                                                                                    router.delete(`/admin/fee-types/${feeType.id}`);
                                                                                }
                                                                            }}
                                                                        >
                                                                            Delete Fee Type
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-gray-500">
                                            Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of {totalItems} results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
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
                                                            className="w-8 h-8 p-0"
                                                            onClick={() => handlePageChange(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                                    <>
                                                        <span className="px-2">...</span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-8 h-8 p-0"
                                                            onClick={() => handlePageChange(totalPages)}
                                                        >
                                                            {totalPages}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions & Info */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/admin/fee-types/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Fee Type
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => handleBulkAction('export')}
                                disabled={filteredFeeTypes.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export All ({filteredFeeTypes.length})
                            </Button>
                            <Link href="/admin/fee-types/import">
                                <Button variant="outline" className="w-full justify-start">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Fee Types
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={handleClearFilters}
                                disabled={!searchQuery && selectedCategory === 'all' && selectedStatus === 'all'}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Categories Overview</CardTitle>
                            <CardDescription>
                                Distribution of filtered fee types by category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(categories).length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>No categories configured</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(categories).map(([value, label]) => {
                                        const count = categoryCounts[value] || 0;
                                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                        
                                        if (count === 0 && selectedCategory !== 'all' && selectedCategory !== value) {
                                            return null;
                                        }
                                        
                                        return (
                                            <div key={value} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={getCategoryColor(value)}>
                                                            <span className="flex items-center gap-1">
                                                                {getCategoryIcon(value)}
                                                                {label}
                                                            </span>
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">{count} fee type(s)</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${getCategoryColor(value).split(' ')[0]}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}