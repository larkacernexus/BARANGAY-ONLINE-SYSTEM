import { useState, useEffect, useMemo, ChangeEvent, JSX, useRef } from 'react';
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
    Download,
    Plus,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    DollarSign,
    Eye,
    Edit,
    Printer,
    Trash2,
    RefreshCw,
    Filter,
    Zap,
    AlertTriangle,
    User,
    MoreVertical,
    Copy
} from 'lucide-react';
import { Link } from '@inertiajs/react';

// TypeScript Interfaces
interface Resident {
    id: number;
    full_name: string;
    first_name?: string;
    last_name?: string;
    address?: string;
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    fee: number;
    processing_days: number;
    validity_days?: number;
    description?: string;
    is_active: boolean;
    formatted_fee: string;
    document_types_count?: number;
    required_document_types_count?: number;
    total_requests?: number;
}

interface ClearanceRequest {
    id: number;
    reference_number: string;
    clearance_number?: string;
    resident_id: number;
    clearance_type_id: number;
    purpose: string;
    specific_purpose?: string;
    fee_amount: number;
    urgency: 'normal' | 'rush' | 'express';
    status: 'pending' | 'pending_payment' | 'processing' | 'approved' | 'issued' | 'rejected' | 'cancelled' | 'expired';
    issue_date?: string;
    valid_until?: string;
    created_at: string;
    updated_at: string;
    issuing_officer_name?: string;
    resident?: Resident;
    clearance_type?: ClearanceType;
    status_display?: string;
    urgency_display?: string;
    formatted_fee?: string;
    is_valid?: boolean;
    days_remaining?: number;
}

interface StatusOption {
    value: string;
    label: string;
}

interface Filters {
    search?: string;
    status?: string;
    type?: string;
    urgency?: string;
}

interface Stats {
    totalIssued?: number;
    issuedThisMonth?: number;
    pending?: number;
    pendingToday?: number;
    expiringSoon?: number;
    totalRevenue?: number;
    expressRequests?: number;
    rushRequests?: number;
}

interface PaginatedClearances {
    data: ClearanceRequest[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface ClearancesProps {
    clearances: PaginatedClearances;
    stats?: Stats;
    clearanceTypes: ClearanceType[];
    filters?: Filters;
    statusOptions?: StatusOption[];
}

// Custom hook for responsive truncation
const useResponsiveTruncation = () => {
    const getMaxLength = (): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) return 15; // Mobile
        if (width < 768) return 20; // Tablet
        if (width < 1024) return 25; // Small desktop
        if (width < 1280) return 30; // Medium desktop
        return 35; // Large desktop
    };

    return { getMaxLength };
};

export default function Clearances({ 
    clearances = { data: [], links: [] } as unknown as PaginatedClearances, 
    stats = {}, 
    clearanceTypes = [],
    filters = {},
    statusOptions = []
}: ClearancesProps) {
    // Initialize state
    const [searchTerm, setSearchTerm] = useState<string>(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || '');
    const [typeFilter, setTypeFilter] = useState<string>(filters?.type || '');
    const [urgencyFilter, setUrgencyFilter] = useState<string>(filters?.urgency || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Local state for all clearances (client-side filtering)
    const [allClearances, setAllClearances] = useState<ClearanceRequest[]>([]);
    
    // Pagination state for client-side pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(20);
    
    // Custom hook for responsive truncation
    const { getMaxLength } = useResponsiveTruncation();

    // Initialize with all clearances from the paginated object
    useEffect(() => {
        if (clearances && clearances.data && Array.isArray(clearances.data)) {
            setAllClearances(clearances.data);
        } else {
            console.error('clearances.data is not an array:', clearances?.data);
            setAllClearances([]);
        }
    }, [clearances]);

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
    const getTruncationLength = (type: 'reference' | 'name' | 'address' | 'purpose' | 'type' | 'status' = 'reference'): number => {
        const baseLength = getMaxLength();
        
        switch (type) {
            case 'reference':
                return Math.max(15, Math.floor(baseLength * 0.8));
            case 'name':
                return Math.max(20, Math.floor(baseLength * 1.2));
            case 'address':
                return Math.max(25, Math.floor(baseLength * 1.5));
            case 'purpose':
                return Math.max(25, Math.floor(baseLength * 1.3));
            case 'type':
                return Math.max(20, Math.floor(baseLength * 1.1));
            case 'status':
                return Math.max(15, Math.floor(baseLength * 0.9));
            default:
                return baseLength;
        }
    };

    // Truncate text but keep full text in data attribute
    const truncateText = (text: string, type: 'reference' | 'name' | 'address' | 'purpose' | 'type' | 'status' = 'reference'): { display: string; full: string } => {
        if (!text) return { display: '', full: '' };
        
        const maxLength = getTruncationLength(type);
        if (text.length <= maxLength) return { display: text, full: text };
        
        return { 
            display: text.substring(0, maxLength) + '...', 
            full: text 
        };
    };

    // Handle copy to clipboard
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            console.log('Copied to clipboard:', text);
        });
    };

    // Client-side filtering function
    const filteredClearances = useMemo(() => {
        if (!Array.isArray(allClearances)) {
            return [];
        }
        
        let filtered = [...allClearances];
        
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(clearance => 
                clearance?.reference_number?.toLowerCase().includes(searchLower) ||
                clearance?.clearance_number?.toLowerCase().includes(searchLower) ||
                clearance?.purpose?.toLowerCase().includes(searchLower) ||
                clearance?.resident?.full_name?.toLowerCase().includes(searchLower) ||
                clearance?.resident?.first_name?.toLowerCase().includes(searchLower) ||
                clearance?.resident?.last_name?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(clearance => clearance?.status === statusFilter);
        }
        
        // Type filter
        if (typeFilter) {
            filtered = filtered.filter(clearance => 
                clearance?.clearance_type?.id?.toString() === typeFilter
            );
        }
        
        // Urgency filter
        if (urgencyFilter) {
            filtered = filtered.filter(clearance => clearance?.urgency === urgencyFilter);
        }
        
        return filtered;
    }, [allClearances, searchTerm, statusFilter, typeFilter, urgencyFilter]);

    // Sort by urgency (express first, then rush, then normal)
    const sortedClearances = useMemo(() => {
        if (!Array.isArray(filteredClearances)) {
            return [];
        }
        
        const urgencyOrder: Record<string, number> = {
            'express': 1,
            'rush': 2,
            'normal': 3
        };
        
        return [...filteredClearances].sort((a, b) => {
            const orderA = urgencyOrder[a?.urgency || 'normal'] || 4;
            const orderB = urgencyOrder[b?.urgency || 'normal'] || 4;
            return orderA - orderB;
        });
    }, [filteredClearances]);

    // Pagination calculations for client-side pagination
    const totalPages = Math.ceil(sortedClearances.length / itemsPerPage);
    const paginatedClearances = useMemo(() => {
        if (!Array.isArray(sortedClearances)) {
            return [];
        }
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedClearances.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedClearances, currentPage, itemsPerPage]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Generate pagination links for client-side pagination
    const paginationLinks = useMemo(() => {
        const links = [];
        
        // Previous link
        links.push({
            url: currentPage > 1 ? String(currentPage - 1) : null,
            label: 'Previous',
            active: false
        });
        
        // Page number links
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            links.push({
                url: String(i),
                label: String(i),
                active: i === currentPage
            });
        }
        
        // Next link
        links.push({
            url: currentPage < totalPages ? String(currentPage + 1) : null,
            label: 'Next',
            active: false
        });
        
        return links;
    }, [currentPage, totalPages]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, urgencyFilter]);

    // Format date
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Get status badge variant
    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'pending': 'secondary',
            'pending_payment': 'outline',
            'processing': 'outline',
            'approved': 'outline',
            'issued': 'default',
            'rejected': 'destructive',
            'cancelled': 'outline',
            'expired': 'outline'
        };
        return variants[status] || 'outline';
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'pending': <Clock className="h-4 w-4 text-amber-500" />,
            'pending_payment': <DollarSign className="h-4 w-4 text-amber-500" />,
            'processing': <RefreshCw className="h-4 w-4 text-blue-500" />,
            'approved': <CheckCircle className="h-4 w-4 text-green-500" />,
            'issued': <CheckCircle className="h-4 w-4 text-green-500" />,
            'rejected': <XCircle className="h-4 w-4 text-red-500" />,
            'cancelled': <XCircle className="h-4 w-4 text-gray-500" />,
            'expired': <AlertCircle className="h-4 w-4 text-gray-500" />
        };
        return icons[status] || null;
    };

    // Get status display text
    const getStatusDisplay = (status: string): string => {
        const statusMap: Record<string, string> = {
            'pending': 'Pending Review',
            'pending_payment': 'Pending Payment',
            'processing': 'Under Processing',
            'approved': 'Approved',
            'issued': 'Issued',
            'rejected': 'Rejected',
            'cancelled': 'Cancelled',
            'expired': 'Expired'
        };
        return statusMap[status] || status;
    };

    // Get urgency display with priority indicators
    const getUrgencyDisplay = (urgency: string): string => {
        const urgencyMap: Record<string, string> = {
            'normal': 'Normal',
            'rush': 'Rush',
            'express': 'Express'
        };
        return urgencyMap[urgency] || 'Normal';
    };

    // Get urgency badge variant
    const getUrgencyVariant = (urgency: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'normal': 'outline',
            'rush': 'secondary',
            'express': 'default'
        };
        return variants[urgency] || 'outline';
    };

    // Get urgency icon
    const getUrgencyIcon = (urgency: string) => {
        const icons: Record<string, JSX.Element> = {
            'normal': null,
            'rush': <AlertTriangle className="h-3 w-3" />,
            'express': <Zap className="h-3 w-3" />
        };
        return icons[urgency] || null;
    };

    // Check if urgency is priority
    const isPriorityUrgency = (urgency: string): boolean => {
        return urgency === 'express' || urgency === 'rush';
    };

    // Check if clearance is valid
    const isValidClearance = (clearance: ClearanceRequest): boolean => {
        if (!clearance || clearance.status !== 'issued') return false;
        if (clearance.is_valid !== undefined) return clearance.is_valid;
        if (!clearance.valid_until) return false;
        return new Date(clearance.valid_until) > new Date();
    };

    // Get days remaining
    const getDaysRemaining = (validUntil?: string): number | null => {
        if (!validUntil) return null;
        try {
            const diffTime = new Date(validUntil).getTime() - new Date().getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            return null;
        }
    };

    // Get resident full name
    const getResidentName = (resident?: Resident): string => {
        if (!resident) return 'N/A';
        if (resident.full_name) return resident.full_name;
        if (resident.first_name || resident.last_name) {
            return `${resident.first_name || ''} ${resident.last_name || ''}`.trim();
        }
        return 'N/A';
    };

    // Export clearances
    const handleExport = () => {
        const exportUrl = new URL('/clearances/export', window.location.origin);
        
        if (searchTerm) exportUrl.searchParams.append('search', searchTerm);
        if (statusFilter) exportUrl.searchParams.append('status', statusFilter);
        if (typeFilter) exportUrl.searchParams.append('type', typeFilter);
        if (urgencyFilter) exportUrl.searchParams.append('urgency', urgencyFilter);
        
        window.open(exportUrl.toString(), '_blank');
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setTypeFilter('');
        setUrgencyFilter('');
    };

    // Handle select change
    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
    };

    const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setTypeFilter(e.target.value);
    };

    const handleUrgencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setUrgencyFilter(e.target.value);
    };

    // Handle delete
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to cancel this request?')) {
            setIsLoading(true);
            import('@inertiajs/react').then(({ router }) => {
                router.delete(`/clearances/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setAllClearances(prev => {
                            if (Array.isArray(prev)) {
                                return prev.filter(clearance => clearance.id !== id);
                            }
                            return [];
                        });
                        setIsLoading(false);
                    },
                    onError: () => {
                        setIsLoading(false);
                    }
                });
            });
        }
    };

    // Safely get display values
    const safeSortedClearances = Array.isArray(sortedClearances) ? sortedClearances : [];
    const safePaginatedClearances = Array.isArray(paginatedClearances) ? paginatedClearances : [];
    const safeClearanceTypes = Array.isArray(clearanceTypes) ? clearanceTypes : [];

    return (
        <AppLayout
            title="Clearance Requests"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clearance Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            Issue and manage barangay clearances and certificates
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link href="/clearance-types">
                            <Button variant="outline" disabled={isLoading} size="sm" className="h-9">
                                <Filter className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Manage Types</span>
                                <span className="sm:hidden">Types</span>
                            </Button>
                        </Link>
                        <Link href="/clearances/create">
                            <Button disabled={isLoading} size="sm" className="h-9">
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">New Request</span>
                                <span className="sm:hidden">New</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Total Issued
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats?.totalIssued?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats?.issuedThisMonth || 0} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats?.pending?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats?.pendingToday || 0} new today
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <Zap className="h-4 w-4 mr-2 text-red-500" />
                                Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">
                                {(stats?.expressRequests || 0) + (stats?.rushRequests || 0)}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3 text-red-500" />
                                    {stats?.expressRequests || 0} Express
                                </span>
                                <span className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                    {stats?.rushRequests || 0} Rush
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-purple-500" />
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">
                                ₱{(stats?.totalRevenue || 0).toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                All time
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Clearance Types */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Clearance Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {safeClearanceTypes.length > 0 ? (
                            <>
                                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {safeClearanceTypes.filter(type => type.is_active).slice(0, 8).map((type) => (
                                        <div key={type.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={type.name}>
                                                        {type.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 truncate" title={type.code}>
                                                        {type.code}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                                                    {type.total_requests?.toLocaleString() || 0}
                                                </Badge>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-xl sm:text-2xl font-bold truncate">
                                                    {type.formatted_fee || `₱${(type.fee || 0).toLocaleString('en-PH')}`}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center justify-between gap-1">
                                                    <span>{type.processing_days || 3} processing days</span>
                                                    {type.validity_days && (
                                                        <span>{type.validity_days} days validity</span>
                                                    )}
                                                </div>
                                            </div>
                                            {type.document_types_count !== undefined && (
                                                <div className="text-xs text-gray-400 mt-2 truncate">
                                                    {type.required_document_types_count || 0} required documents
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {safeClearanceTypes.filter(type => type.is_active).length > 8 && (
                                    <div className="mt-4 text-center">
                                        <Link href="/clearance-types">
                                            <Button variant="outline" size="sm">
                                                View All Types ({safeClearanceTypes.filter(type => type.is_active).length})
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No clearance types found
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Search and Filters */}
                <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                    placeholder="Search by reference, name, clearance number..." 
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <div className="relative min-w-[120px]">
                                    <select 
                                        className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 pr-8 appearance-none w-full"
                                        value={statusFilter}
                                        onChange={handleStatusChange}
                                        disabled={isLoading}
                                    >
                                        <option value="">All Status</option>
                                        {statusOptions.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <div className="relative min-w-[120px]">
                                    <select 
                                        className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 pr-8 appearance-none w-full"
                                        value={typeFilter}
                                        onChange={handleTypeChange}
                                        disabled={isLoading}
                                    >
                                        <option value="">All Types</option>
                                        {safeClearanceTypes.filter(type => type.is_active).map((type) => (
                                            <option key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <div className="relative min-w-[120px]">
                                    <select 
                                        className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 pr-8 appearance-none w-full"
                                        value={urgencyFilter}
                                        onChange={handleUrgencyChange}
                                        disabled={isLoading}
                                    >
                                        <option value="">All Urgency</option>
                                        <option value="express">Express</option>
                                        <option value="rush">Rush</option>
                                        <option value="normal">Normal</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {(searchTerm || statusFilter || typeFilter || urgencyFilter) && (
                                    <Button 
                                        variant="outline" 
                                        onClick={clearFilters}
                                        disabled={isLoading}
                                        size="sm"
                                        className="h-9"
                                    >
                                        Clear
                                    </Button>
                                )}
                                
                                <Button 
                                    variant="outline" 
                                    onClick={handleExport}
                                    disabled={isLoading || allClearances.length === 0}
                                    size="sm"
                                    className="h-9"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Clearances Table */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg sm:text-xl">Clearance Requests</span>
                                {isLoading && (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                )}
                            </div>
                            {safeSortedClearances.length > 0 && (
                                <div className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, safeSortedClearances.length)} of {safeSortedClearances.length} requests
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {safeSortedClearances.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold">No clearance requests found</h3>
                                <p className="text-gray-500 mt-1">
                                    {searchTerm || statusFilter || typeFilter || urgencyFilter
                                        ? 'Try adjusting your filters' 
                                        : 'Get started by creating a new clearance request'}
                                </p>
                                {!(searchTerm || statusFilter || typeFilter || urgencyFilter) && (
                                    <Link href="/clearances/create" className="mt-4 inline-block">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create First Request
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <div className="min-w-full inline-block align-middle">
                                        <div className="overflow-hidden">
                                            <Table className="min-w-full">
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                            Reference No.
                                                        </TableHead>
                                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                                                            Resident
                                                        </TableHead>
                                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                            Purpose & Type
                                                        </TableHead>
                                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                            Fee & Urgency
                                                        </TableHead>
                                                        <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                                                            Status
                                                        </TableHead>
                                                        <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                            Actions
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {safePaginatedClearances.map((clearance) => {
                                                        if (!clearance) return null;
                                                        
                                                        const daysRemaining = clearance.days_remaining !== undefined 
                                                            ? clearance.days_remaining 
                                                            : getDaysRemaining(clearance.valid_until);
                                                        const isValid = clearance.is_valid !== undefined 
                                                            ? clearance.is_valid 
                                                            : isValidClearance(clearance);
                                                        
                                                        const refText = truncateText(clearance.reference_number, 'reference');
                                                        const clearanceNumText = clearance.clearance_number ? truncateText(clearance.clearance_number, 'reference') : null;
                                                        const residentName = getResidentName(clearance.resident);
                                                        const residentText = truncateText(residentName, 'name');
                                                        const addressText = clearance.resident?.address ? truncateText(clearance.resident.address, 'address') : null;
                                                        const purposeText = truncateText(clearance.purpose, 'purpose');
                                                        const typeText = truncateText(clearance.clearance_type?.name || 'N/A', 'type');
                                                        const urgencyText = truncateText(getUrgencyDisplay(clearance.urgency), 'status');
                                                        const statusText = truncateText(getStatusDisplay(clearance.status), 'status');
                                                        const officerText = clearance.issuing_officer_name ? truncateText(clearance.issuing_officer_name, 'name') : null;
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={clearance.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                                                    clearance.urgency === 'express' ? 'border-l-4 border-l-red-500' :
                                                                    clearance.urgency === 'rush' ? 'border-l-4 border-l-amber-500' : ''
                                                                }`}
                                                            >
                                                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <div 
                                                                            className="min-w-0 cursor-text select-text"
                                                                            onDoubleClick={(e) => {
                                                                                const selection = window.getSelection();
                                                                                if (selection) {
                                                                                    const range = document.createRange();
                                                                                    range.selectNodeContents(e.currentTarget);
                                                                                    selection.removeAllRanges();
                                                                                    selection.addRange(range);
                                                                                }
                                                                            }}
                                                                            title={`Double-click to select all\n${clearance.reference_number}${clearance.clearance_number ? `\n${clearance.clearance_number}` : ''}`}
                                                                        >
                                                                            <div 
                                                                                className="font-mono text-sm truncate"
                                                                                data-full-text={clearance.reference_number}
                                                                            >
                                                                                {refText.display}
                                                                            </div>
                                                                            {clearanceNumText && (
                                                                                <div 
                                                                                    className="text-xs text-gray-500 truncate"
                                                                                    data-full-text={clearance.clearance_number}
                                                                                >
                                                                                    {clearanceNumText.display}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <div 
                                                                            className="min-w-0 cursor-text select-text"
                                                                            onDoubleClick={(e) => {
                                                                                const selection = window.getSelection();
                                                                                if (selection) {
                                                                                    const range = document.createRange();
                                                                                    range.selectNodeContents(e.currentTarget);
                                                                                    selection.removeAllRanges();
                                                                                    selection.addRange(range);
                                                                                }
                                                                            }}
                                                                            title={`Double-click to select all\n${residentName}${clearance.resident?.address ? `\n${clearance.resident.address}` : ''}`}
                                                                        >
                                                                            <div 
                                                                                className="truncate"
                                                                                data-full-text={residentName}
                                                                            >
                                                                                {residentText.display}
                                                                            </div>
                                                                            {addressText && (
                                                                                <div 
                                                                                    className="text-xs text-gray-500 truncate"
                                                                                    data-full-text={clearance.resident?.address}
                                                                                >
                                                                                    {addressText.display}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
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
                                                                        title={`Double-click to select all\nPurpose: ${clearance.purpose}\nType: ${clearance.clearance_type?.name || 'N/A'}`}
                                                                    >
                                                                        <div 
                                                                            className="font-medium truncate"
                                                                            data-full-text={clearance.purpose}
                                                                        >
                                                                            {purposeText.display}
                                                                        </div>
                                                                        <Badge 
                                                                            variant="outline" 
                                                                            className="font-normal text-xs truncate max-w-full"
                                                                            data-full-text={clearance.clearance_type?.name}
                                                                        >
                                                                            {typeText.display}
                                                                        </Badge>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="space-y-1">
                                                                        <div className="font-medium truncate">
                                                                            {clearance.formatted_fee || `₱${(clearance.fee_amount || 0).toLocaleString('en-PH', {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2
                                                                            })}`}
                                                                        </div>
                                                                        <Badge 
                                                                            variant={getUrgencyVariant(clearance.urgency)} 
                                                                            className={`flex items-center gap-1 truncate max-w-full ${isPriorityUrgency(clearance.urgency) ? 'font-semibold' : ''}`}
                                                                            data-full-text={getUrgencyDisplay(clearance.urgency)}
                                                                            title={getUrgencyDisplay(clearance.urgency)}
                                                                        >
                                                                            {getUrgencyIcon(clearance.urgency)}
                                                                            <span className="truncate">
                                                                                {urgencyText.display}
                                                                            </span>
                                                                        </Badge>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex flex-col gap-1">
                                                                        <Badge 
                                                                            variant={getStatusVariant(clearance.status)} 
                                                                            className="flex items-center gap-1 truncate max-w-full"
                                                                            data-full-text={getStatusDisplay(clearance.status)}
                                                                            title={getStatusDisplay(clearance.status)}
                                                                        >
                                                                            {getStatusIcon(clearance.status)}
                                                                            <span className="truncate">
                                                                                {statusText.display}
                                                                            </span>
                                                                        </Badge>
                                                                        {isPriorityUrgency(clearance.urgency) && (
                                                                            <Badge 
                                                                                variant={clearance.urgency === 'express' ? "destructive" : "secondary"} 
                                                                                className="text-xs flex items-center gap-1 truncate max-w-full"
                                                                                title={clearance.urgency === 'express' ? 'High Priority' : 'Priority'}
                                                                            >
                                                                                {clearance.urgency === 'express' ? (
                                                                                    <>
                                                                                        <Zap className="h-3 w-3 flex-shrink-0" />
                                                                                        <span className="truncate">High Priority</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                                                                        <span className="truncate">Priority</span>
                                                                                    </>
                                                                                )}
                                                                            </Badge>
                                                                        )}
                                                                        {officerText && (
                                                                            <div 
                                                                                className="text-xs text-gray-500 truncate max-w-full"
                                                                                data-full-text={clearance.issuing_officer_name}
                                                                                title={clearance.issuing_officer_name}
                                                                            >
                                                                                {officerText.display}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                                disabled={isLoading}
                                                                            >
                                                                                <span className="sr-only">Open menu</span>
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-48">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/clearances/${clearance.id}`} className="flex items-center cursor-pointer">
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>View Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            {/* Record Payment Button - Only show for pending_payment status */}
                                                                            {clearance.status === 'pending_payment' && (
                                                                                <DropdownMenuItem asChild>
                                                                                    <Link 
                                                                                        href={`/payments/create?clearance_request_id=${clearance.id}&resident_id=${clearance.resident_id}&amount=${clearance.fee_amount}&type=clearance&reference=${clearance.reference_number}`}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                                                                        <span className="text-green-600 font-medium">Record Payment</span>
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            
                                                                            {['pending', 'processing', 'approved'].includes(clearance.status) && (
                                                                                <DropdownMenuItem asChild>
                                                                                    <Link href={`/clearances/${clearance.id}/edit`} className="flex items-center cursor-pointer">
                                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                                        <span>Edit Request</span>
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            
                                                                            {clearance.status === 'issued' && (
                                                                                <DropdownMenuItem asChild>
                                                                                    <Link href={`/clearances/${clearance.id}/print`} className="flex items-center cursor-pointer">
                                                                                        <Printer className="mr-2 h-4 w-4" />
                                                                                        <span>Print Clearance</span>
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(clearance.reference_number)}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Reference</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                                                                <DropdownMenuItem 
                                                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                    onClick={() => handleDelete(clearance.id)}
                                                                                    disabled={isLoading}
                                                                                >
                                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                                    <span>Cancel Request</span>
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 px-4 border-t">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, safeSortedClearances.length)}</span> of{' '}
                                            <span className="font-medium">{safeSortedClearances.length}</span> results
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1 || isLoading}
                                            >
                                                Previous
                                            </Button>
                                            
                                            {paginationLinks.filter(link => 
                                                link.label !== 'Previous' && link.label !== 'Next'
                                            ).map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(Number(link.url))}
                                                    disabled={!link.url || isLoading || link.active}
                                                >
                                                    {link.label}
                                                </Button>
                                            ))}
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages || isLoading}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}