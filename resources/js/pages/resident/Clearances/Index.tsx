import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Filter,
    Search,
    Plus,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Eye,
    Calendar,
    DollarSign,
    Loader2,
    User,
    ChevronLeft,
    ChevronRight,
    FileCheck
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

// Import your mobile footer
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Status configuration
const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock, textColor: 'text-yellow-700' },
    pending_payment: { label: 'Pending Payment', color: 'bg-orange-500', icon: DollarSign, textColor: 'text-orange-700' },
    processing: { label: 'Processing', color: 'bg-blue-500', icon: Loader2, textColor: 'text-blue-700' },
    approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-700' },
    issued: { label: 'Issued', color: 'bg-purple-500', icon: FileCheck, textColor: 'text-purple-700' },
    rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle, textColor: 'text-red-700' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: XCircle, textColor: 'text-gray-700' },
    expired: { label: 'Expired', color: 'bg-red-400', icon: Clock, textColor: 'text-red-600' },
};

const PAYMENT_STATUS_CONFIG = {
    pending: { label: 'Unpaid', color: 'bg-red-500', textColor: 'text-red-700' },
    partial: { label: 'Partial', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    paid: { label: 'Paid', color: 'bg-green-500', textColor: 'text-green-700' },
    overdue: { label: 'Overdue', color: 'bg-red-600', textColor: 'text-red-600' },
};

interface ClearanceRequest {
    id: number;
    resident_id: number;
    clearance_type_id?: number;
    control_number: string;
    status: string;
    purpose: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes?: string;
    amount_due?: number;
    amount_paid?: number;
    payment_status?: string;
    issued_date?: string;
    expiry_date?: string;
    signed_by?: string;
    created_at: string;
    updated_at: string;
    resident?: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        suffix?: string;
    };
    clearance_type?: {
        id: number;
        name: string;
    };
}

interface PageProps {
    clearances: {
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
    };
    filters: {
        status?: string;
        type?: string;
        search?: string;
        resident?: string;
    };
    statistics: {
        total: number;
        pending: number;
        processing: number;
        approved: number;
        completed: number;
    };
    householdResidents: Array<{
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string;
        suffix?: string;
    }>;
    currentResident: {
        id: number;
        first_name: string;
        last_name: string;
    };
    household: {
        id: number;
        household_number: string;
        head_of_family: string;
    };
    error?: string;
}

export default function MyClearances({ 
    clearances, 
    filters, 
    statistics,
    householdResidents,
    currentResident,
    household,
    error 
}: PageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [residentFilter, setResidentFilter] = useState(filters.resident || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle filter changes without page reload
    const applyFilters = useCallback(() => {
        if (isLoading) return;
        
        // Only apply filters if something has changed from the current URL params
        const params: any = {};
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (residentFilter !== 'all') params.resident = residentFilter;
        
        setIsLoading(true);
        
        // Use router.get with params - this will trigger Inertia to update the component
        router.get('/my-clearances', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['clearances', 'filters', 'statistics', 'householdResidents', 'currentResident', 'household', 'error'],
            onFinish: () => setIsLoading(false),
        });
    }, [debouncedSearchTerm, statusFilter, residentFilter, isLoading]);

    // Apply filters when any filter changes
    useEffect(() => {
        applyFilters();
    }, [debouncedSearchTerm, statusFilter, residentFilter]);

    // Handle clear filters - navigate to clean URL
    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setResidentFilter('all');
        
        // Navigate to clean URL without query params
        router.get('/my-clearances', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['clearances', 'filters', 'statistics', 'householdResidents', 'currentResident', 'household', 'error'],
        });
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    // SAFE version of getStatusBadge
    const getStatusBadge = (status: string) => {
        // Convert to lowercase for case-insensitive matching
        const statusKey = (status || '').toLowerCase();
        const config = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG];
        
        if (!config) {
            // Fallback for unknown status
            return (
                <Badge variant="outline" className="text-gray-700 border-current flex items-center gap-1 w-fit">
                    <AlertCircle className="h-3 w-3" />
                    {status || 'Unknown'}
                </Badge>
            );
        }
        
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={`${config.textColor} border-current flex items-center gap-1 w-fit`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    // SAFE version of getPaymentBadge
    const getPaymentBadge = (status: string | undefined) => {
        if (!status) return null;
        
        const statusKey = status.toLowerCase();
        const config = PAYMENT_STATUS_CONFIG[statusKey as keyof typeof PAYMENT_STATUS_CONFIG];
        
        if (!config) {
            return (
                <Badge variant="outline" className="text-gray-700 border-current text-xs">
                    {status}
                </Badge>
            );
        }
        
        return (
            <Badge variant="outline" className={`${config.textColor} border-current text-xs`}>
                {config.label}
            </Badge>
        );
    };

    // Handle pagination (preserves current filters)
    const handlePageChange = (url: string | null) => {
        if (!url || isLoading) return;
        
        setIsLoading(true);
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['clearances', 'filters', 'statistics', 'householdResidents', 'currentResident', 'household', 'error'],
            onFinish: () => setIsLoading(false),
        });
    };

    // Check if clearances exists and has data property
    const clearanceList = clearances?.data || [];
    const hasClearances = Array.isArray(clearanceList) && clearanceList.length > 0;

    // Show error if exists
    if (error) {
        return (
            <ResidentLayout
                title="My Clearances"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Clearances', href: '#' }
                ]}
            >
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
                        <h3 className="mt-4 text-lg font-semibold">Error</h3>
                        <p className="text-gray-500 mt-2">
                            {error}
                        </p>
                        <Button 
                            className="mt-4"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </ResidentLayout>
        );
    }

    // If clearances is not properly structured, show error
    if (!clearances || typeof clearances !== 'object') {
        return (
            <ResidentLayout
                title="My Clearances"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/resident/dashboard' },
                    { title: 'My Clearances', href: '#' }
                ]}
            >
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
                        <h3 className="mt-4 text-lg font-semibold">Data Error</h3>
                        <p className="text-gray-500 mt-2">
                            Unable to load clearance data. Please try again later.
                        </p>
                        <Button 
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    </CardContent>
                </Card>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            title="My Clearances"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Clearances', href: '#' }
            ]}
        >
            <div className="space-y-6 lg:space-y-8">
                {/* Header with Stats */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Clearances</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Household: {household?.household_number || 'N/A'} - {household?.head_of_family || 'N/A'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                            </div>
                        )}
                        <Link href="/my-clearances/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Request
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl font-bold">{statistics?.total || 0}</div>
                                <div className="text-sm text-gray-500">Total Requests</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl font-bold text-yellow-600">{statistics?.pending || 0}</div>
                                <div className="text-sm text-gray-500">Pending</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl font-bold text-blue-600">{statistics?.processing || 0}</div>
                                <div className="text-sm text-gray-500">Processing</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl font-bold text-green-600">{statistics?.completed || 0}</div>
                                <div className="text-sm text-gray-500">Completed</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by control number, purpose..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={isLoading}
                                />
                                {isLoading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    </div>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                            <select
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="processing">Processing</option>
                                <option value="approved">Approved</option>
                                <option value="issued">Issued</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="expired">Expired</option>
                            </select>

                                <select
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={residentFilter}
                                    onChange={(e) => setResidentFilter(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="all">All Household Members</option>
                                    {Array.isArray(householdResidents) && householdResidents.map(resident => (
                                        <option key={resident?.id || Math.random()} value={resident?.id}>
                                            {resident?.first_name || ''} {resident?.last_name || ''}
                                            {resident?.id === currentResident?.id && ' (You)'}
                                        </option>
                                    ))}
                                </select>

                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="whitespace-nowrap"
                                    disabled={isLoading}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Clearances List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : !hasClearances ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold">No clearance requests found</h3>
                            <p className="text-gray-500 mt-2">
                                {searchTerm || statusFilter !== 'all' || residentFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by requesting a new clearance'}
                            </p>
                            <Link href="/my-clearances/create">
                                <Button className="mt-4 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Request Clearance
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {clearanceList.map((clearance) => {
                                // Add safety checks for each property
                                const clearanceId = clearance?.id || Math.random();
                                const status = clearance?.status || 'unknown';
                                const controlNumber = clearance?.control_number || 'N/A';
                                const resident = clearance?.resident;
                                const residentName = resident 
                                    ? `${resident.first_name || ''} ${resident.last_name || ''}`.trim()
                                    : 'Unknown Resident';
                                const createdDate = formatDate(clearance?.created_at || '');
                                const neededDate = formatDate(clearance?.needed_date || '');
                                const amountDue = clearance?.amount_due;
                                const specificPurpose = clearance?.specific_purpose || 'No purpose specified';

                                return (
                                    <Card key={clearanceId} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 lg:p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold text-lg">
                                                            Clearance Request
                                                        </h3>
                                                        {getStatusBadge(status)}
                                                        {getPaymentBadge(clearance?.payment_status)}
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="h-4 w-4" />
                                                            <span>Control #: {controlNumber}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            <span>{residentName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>Requested: {createdDate}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Needed by: {neededDate}</span>
                                                        </div>
                                                        {amountDue !== undefined && amountDue !== null && (
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="h-4 w-4" />
                                                                <span>₱{amountDue.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-700 line-clamp-2">
                                                        {specificPurpose}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                                                    <Link href={`/my-clearances/${clearanceId}`}>
                                                        <Button variant="outline" size="sm" className="gap-2 w-full">
                                                            <Eye className="h-4 w-4" />
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                    
                                                    {status === 'completed' && (
                                                        <Button variant="outline" size="sm" className="gap-2 w-full">
                                                            <Download className="h-4 w-4" />
                                                            Download
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination - Only show if we have pagination data */}
                        {clearances?.last_page > 1 && (
                            <div className="flex items-center justify-between border-t pt-4">
                                <div className="text-sm text-gray-700">
                                    Showing {clearances.from || 0} to {clearances.to || 0} of {clearances.total || 0} results
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(clearances.prev_page_url)}
                                        disabled={!clearances.prev_page_url || isLoading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    
                                    <div className="flex items-center space-x-1">
                                        {Array.isArray(clearances.links) && clearances.links.map((link, index) => {
                                            if (link.url === null) {
                                                return (
                                                    <span key={index} className="px-3 py-1 text-gray-500">
                                                        {link.label}
                                                    </span>
                                                );
                                            }
                                            
                                            return (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(link.url)}
                                                    disabled={isLoading}
                                                    className="min-w-[2.5rem]"
                                                >
                                                    {link.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(clearances.next_page_url)}
                                        disabled={!clearances.next_page_url || isLoading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Mobile Footer */}
            <div className="lg:hidden">
                <ResidentMobileFooter />
            </div>
        </ResidentLayout>
    );
}