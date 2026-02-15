import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Shield,
    Search,
    Filter,
    Clock,
    AlertTriangle,
    Eye,
    RefreshCw,
    Download,
    FileText,
    User,
    Calendar,
    FilePlus,
    Users,
    CheckSquare,
    XSquare,
    ArrowUpDown,
    FilterX,
    CheckCircle,
    XCircle,
    ChevronRight,
    BarChart3
} from 'lucide-react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, differenceInDays } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

interface ClearanceRequest {
    id: number;
    reference_number: string;
    purpose: string;
    urgency: string;
    needed_date: string;
    fee_amount: number;
    status: 'pending' | 'processing' | 'approved' | 'rejected';
    created_at: string;
    processed_at?: string;
    processed_by?: number;
    admin_notes?: string;
    resident?: {
        id: number;
        full_name: string;
        address: string;
        contact_number: string;
        household?: {
            household_number: string;
            purok?: {
                name: string;
            };
        };
    };
    clearanceType?: {
        id: number;
        name: string;
        code: string;
        description: string;
        fee: number;
        validity_days: number;
    };
    documents?: Array<{
        id: number;
        file_name: string;
        file_size: number;
        file_url?: string;
    }>;
    processor?: {
        id: number;
        full_name: string;
    };
}

interface PageProps {
    clearanceRequests?: {
        data: ClearanceRequest[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    stats?: {
        pending: number;
        processing: number;
        today: number;
        urgent: number;
        completed_today: number;
    };
    clearanceTypes?: Array<{ id: number; name: string }>;
    filters?: {
        search?: string;
        urgency?: string;
        type?: string;
        date_from?: string;
        date_to?: string;
        status?: string;
        sort_by?: 'created_at' | 'needed_date' | 'urgency' | 'fee_amount';
        sort_order?: 'asc' | 'desc';
    };
    user?: {
        role: string;
        id: number;
        permissions: string[];
    };
}

const urgencyOptions = [
    { value: 'normal', label: 'Normal', color: 'bg-gray-100 text-gray-800', badgeVariant: 'secondary' as const },
    { value: 'rush', label: 'Rush', color: 'bg-amber-100 text-amber-800', badgeVariant: 'warning' as const },
    { value: 'express', label: 'Express', color: 'bg-red-100 text-red-800', badgeVariant: 'destructive' as const },
];

const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800', badgeVariant: 'secondary' as const },
    { value: 'processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-800', badgeVariant: 'warning' as const },
];

export default function ApprovalQueue() {
    const { props } = usePage<PageProps>();
    const { clearanceRequests, stats, clearanceTypes = [], filters = {}, user } = props;
    const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [bulkSelection, setBulkSelection] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'processing'>('pending');

    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        urgency: filters.urgency || '',
        type: filters.type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        status: filters.status || 'all',
        sort_by: filters.sort_by || 'created_at',
        sort_order: filters.sort_order || 'desc',
    });

    const { data, setData, get, processing, post } = useForm({
        search: localFilters.search,
        urgency: localFilters.urgency || 'all',
        type: localFilters.type || 'all',
        date_from: localFilters.date_from,
        date_to: localFilters.date_to,
        status: localFilters.status || 'all',
        sort_by: localFilters.sort_by,
        sort_order: localFilters.sort_order,
    });

    // Define the missing function
    const confirmIssueClearance = useCallback(() => {
        if (!selectedRequest) return;

        // Redirect to create clearance page with request data
        const params = new URLSearchParams({
            resident_id: selectedRequest.resident?.id.toString() || '',
            clearance_type_id: selectedRequest.clearanceType?.id.toString() || '',
            purpose: selectedRequest.purpose || '',
            fee_amount: selectedRequest.fee_amount?.toString() || '0',
            reference_number: selectedRequest.reference_number || '',
        });

        router.visit(`/clearances/create?${params.toString()}`);
    }, [selectedRequest]);

    // Load data based on active tab
    useEffect(() => {
        if (activeTab === 'processing') {
            setData('status', 'processing');
        } else {
            setData('status', 'pending');
        }
        // Apply filters after a short delay
        const timer = setTimeout(() => {
            applyFilters();
        }, 300);

        return () => clearTimeout(timer);
    }, [activeTab]);

    const applyFilters = useCallback(() => {
        get(route('admin.clearances.approval.index'), {
            preserveState: true,
            preserveScroll: true,
            data: {
                ...data,
                page: 1, // Reset to first page when filters change
            },
        });
    }, [data, get]);

    const clearFilters = () => {
        const defaultFilters = {
            search: '',
            urgency: '',
            type: '',
            date_from: '',
            date_to: '',
            status: 'all',
            sort_by: 'created_at',
            sort_order: 'desc',
        };
        
        setLocalFilters(defaultFilters);
        setData(defaultFilters);
        
        get(route('admin.clearances.approval.index'), {
            preserveState: true,
            preserveScroll: true,
            data: defaultFilters,
        });
    };

    const handleSearchChange = useCallback((value: string) => {
        setData('search', value);
        // Debounced search
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);
        return () => clearTimeout(timer);
    }, [setData, applyFilters]);

    const handleBulkAction = async (action: 'process' | 'return' | 'reject') => {
        if (bulkSelection.length === 0) return;

        try {
            if (action === 'reject') {
                // Show reject dialog for bulk reject
                setRejectDialogOpen(true);
            } else {
                await Promise.all(
                    bulkSelection.map(id =>
                        post(route(`admin.clearances.approval.${action === 'process' ? 'mark-processing' : 'return-pending'}`, id))
                    )
                );
                setBulkSelection([]);
                router.reload();
            }
        } catch (error) {
            console.error('Bulk action failed:', error);
        }
    };

    const handleReject = async (requestId: number, reason?: string) => {
        try {
            await post(route('admin.clearances.approval.reject', requestId), {
                reason: reason || rejectReason,
            });
            setRejectDialogOpen(false);
            setRejectReason('');
            setSelectedRequest(null);
            router.reload();
        } catch (error) {
            console.error('Reject failed:', error);
        }
    };

    const handleBulkReject = async () => {
        if (bulkSelection.length === 0 || !rejectReason) return;

        try {
            await Promise.all(
                bulkSelection.map(id =>
                    post(route('admin.clearances.approval.reject', id), {
                        reason: rejectReason,
                    })
                )
            );
            setBulkSelection([]);
            setRejectReason('');
            setRejectDialogOpen(false);
            router.reload();
        } catch (error) {
            console.error('Bulk reject failed:', error);
        }
    };

    const toggleBulkSelect = (id: number) => {
        setBulkSelection(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const selectAllOnPage = () => {
        if (!clearanceRequests?.data) return;
        const allIds = clearanceRequests.data.map(request => request.id);
        setBulkSelection(allIds);
    };

    const calculateUrgencyBadge = (request: ClearanceRequest) => {
        const urgency = urgencyOptions.find(u => u.value === request.urgency);
        return urgency || urgencyOptions[0];
    };

    const calculateDaysLeft = (neededDate: string) => {
        const today = new Date();
        const needed = new Date(neededDate);
        return differenceInDays(needed, today);
    };

    const getUrgencyLevel = (request: ClearanceRequest): 'low' | 'medium' | 'high' | 'critical' => {
        const daysLeft = request.needed_date ? calculateDaysLeft(request.needed_date) : Infinity;
        
        if (request.urgency === 'express') return 'critical';
        if (request.urgency === 'rush') return daysLeft <= 1 ? 'critical' : 'high';
        if (daysLeft <= 0) return 'critical';
        if (daysLeft <= 1) return 'high';
        if (daysLeft <= 3) return 'medium';
        return 'low';
    };

    const getCanPerformAction = (request: ClearanceRequest) => {
        if (!user) return { canProcess: false, canReturn: false, canReject: false };
        
        const isAdmin = user.role === 'admin';
        const isClerk = user.role === 'clerk';
        const isAssigned = request.processor?.id === user.id;

        return {
            canProcess: (isAdmin || (isClerk && isAssigned)) && request.status === 'pending',
            canReturn: (isAdmin || (isClerk && isAssigned)) && request.status === 'processing',
            canReject: isAdmin && request.status !== 'rejected',
        };
    };

    const handleIssueRequest = (request: ClearanceRequest) => {
        setSelectedRequest(request);
        setIssueDialogOpen(true);
    };

    const sortedRequests = useMemo(() => {
        if (!clearanceRequests?.data) return [];
        
        return [...clearanceRequests.data].sort((a, b) => {
            // Sort by urgency level first
            const urgencyA = getUrgencyLevel(a);
            const urgencyB = getUrgencyLevel(b);
            
            const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            if (urgencyOrder[urgencyA] !== urgencyOrder[urgencyB]) {
                return urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
            }
            
            // Then by creation date
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [clearanceRequests]);

    // Loading state
    if (!clearanceRequests || !stats) {
        return (
            <AppLayout
                title="Approval Queue"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Clearances', href: '/clearances' },
                    { title: 'Approval Queue', href: '/clearances/approval' }
                ]}
            >
                <div className="space-y-6">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Approval Queue"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' },
                { title: 'Approval Queue', href: '/clearances/approval' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Shield className="h-8 w-8 text-blue-600" />
                            {stats.pending > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {stats.pending}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage pending clearance requests and approvals
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => router.reload()} disabled={processing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        {user?.permissions?.includes('create_clearances') && (
                            <Button asChild>
                                <Link href="/clearances/create">
                                    <FilePlus className="h-4 w-4 mr-2" />
                                    Issue New Clearance
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.pending || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting initial review
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Processing</CardTitle>
                            <RefreshCw className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.processing || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Under review
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's</CardTitle>
                            <Calendar className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.today || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Submitted today
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.urgent || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Rush or express priority
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed_today || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Processed today
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats Bar */}
                <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-4 rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{clearanceRequests.total} total requests</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                Pending: {stats.pending}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                Processing: {stats.processing}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                Urgent: {stats.urgent}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters and Tabs */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters & Requests
                            </CardTitle>
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
                                <TabsList>
                                    <TabsTrigger value="pending">
                                        Pending
                                        <Badge variant="secondary" className="ml-2">
                                            {stats.pending}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="processing">
                                        Processing
                                        <Badge variant="warning" className="ml-2">
                                            {stats.processing}
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Search and Quick Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by reference, name, contact, etc..."
                                            value={data.search}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={data.urgency === 'express' ? 'destructive' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setData('urgency', data.urgency === 'express' ? '' : 'express');
                                            applyFilters();
                                        }}
                                    >
                                        Express
                                    </Button>
                                    <Button
                                        variant={data.urgency === 'rush' ? 'warning' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setData('urgency', data.urgency === 'rush' ? '' : 'rush');
                                            applyFilters();
                                        }}
                                    >
                                        Rush
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setData('date_from', format(new Date(), 'yyyy-MM-dd'));
                                            applyFilters();
                                        }}
                                    >
                                        Today
                                    </Button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Clearance Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => {
                                            setData('type', value);
                                            applyFilters();
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {(clearanceTypes || []).map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Urgency Level</Label>
                                    <Select
                                        value={data.urgency}
                                        onValueChange={(value) => {
                                            setData('urgency', value);
                                            applyFilters();
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Levels" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Levels</SelectItem>
                                            {urgencyOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Date Range</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={data.date_from}
                                            onChange={(e) => setData('date_from', e.target.value)}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="date"
                                            value={data.date_to}
                                            onChange={(e) => setData('date_to', e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button onClick={applyFilters} disabled={processing} className="flex-1">
                                        {processing ? (
                                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Search className="h-4 w-4 mr-2" />
                                        )}
                                        Apply Filters
                                    </Button>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={clearFilters}
                                                    disabled={processing}
                                                >
                                                    <FilterX className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Clear all filters
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {bulkSelection.length > 0 && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800">
                                    {bulkSelection.length} request(s) selected
                                </AlertTitle>
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Bulk Actions
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleBulkAction('process')}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Mark as Processing
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleBulkAction('return')}>
                                            <Clock className="h-4 w-4 mr-2" />
                                            Return to Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleBulkAction('reject')}
                                            className="text-red-600"
                                        >
                                            <XSquare className="h-4 w-4 mr-2" />
                                            Reject Selected
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setBulkSelection([])}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Clearance Requests</CardTitle>
                                <CardDescription>
                                    Showing {clearanceRequests.data.length} of {clearanceRequests.total} request(s)
                                    {data.search && ` for "${data.search}"`}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={selectAllOnPage}
                                    disabled={bulkSelection.length === clearanceRequests.data.length}
                                >
                                    Select All
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <ArrowUpDown className="h-4 w-4 mr-2" />
                                            Sort
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setData('sort_by', 'created_at');
                                                setData('sort_order', 'desc');
                                                applyFilters();
                                            }}
                                        >
                                            Newest First
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setData('sort_by', 'created_at');
                                                setData('sort_order', 'asc');
                                                applyFilters();
                                            }}
                                        >
                                            Oldest First
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setData('sort_by', 'needed_date');
                                                setData('sort_order', 'asc');
                                                applyFilters();
                                            }}
                                        >
                                            Due Date
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setData('sort_by', 'urgency');
                                                setData('sort_order', 'desc');
                                                applyFilters();
                                            }}
                                        >
                                            Urgency Level
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {clearanceRequests.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                                <p className="text-gray-500 mb-4">
                                    {data.search || data.urgency || data.type || data.date_from
                                        ? 'Try adjusting your filters'
                                        : 'All clearance requests have been processed.'}
                                </p>
                                {(data.search || data.urgency || data.type || data.date_from) && (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-gray-50 dark:bg-gray-800">
                                                <th className="w-12 p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={bulkSelection.length === clearanceRequests.data.length}
                                                        onChange={selectAllOnPage}
                                                        className="rounded border-gray-300"
                                                    />
                                                </th>
                                                <th className="text-left p-4 font-medium">Reference No.</th>
                                                <th className="text-left p-4 font-medium">Applicant & Details</th>
                                                <th className="text-left p-4 font-medium">Type & Purpose</th>
                                                <th className="text-left p-4 font-medium">Urgency</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                <th className="text-left p-4 font-medium">Fee</th>
                                                <th className="text-left p-4 font-medium">Timeline</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedRequests.map((request) => {
                                                const urgencyInfo = calculateUrgencyBadge(request);
                                                const daysLeft = request.needed_date ? calculateDaysLeft(request.needed_date) : null;
                                                const canActions = getCanPerformAction(request);
                                                const isSelected = bulkSelection.includes(request.id);

                                                return (
                                                    <tr
                                                        key={request.id}
                                                        className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                                            isSelected ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <td className="p-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleBulkSelect(request.id)}
                                                                className="rounded border-gray-300"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <Link
                                                                href={route('admin.clearances.approval.show', request.id)}
                                                                className="font-mono font-medium text-blue-600 hover:text-blue-800 block"
                                                            >
                                                                {request.reference_number}
                                                            </Link>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-medium">{request.resident?.full_name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {request.resident?.contact_number}
                                                            </div>
                                                            {request.resident?.household && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    HH #{request.resident.household.household_number}
                                                                    {request.resident.household.purok && (
                                                                        <span> • {request.resident.household.purok.name}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant="outline" className="text-xs mb-1">
                                                                {request.clearanceType?.name}
                                                            </Badge>
                                                            <div className="text-sm line-clamp-2 mt-1">
                                                                {request.purpose}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col gap-1">
                                                                <Badge
                                                                    className={`text-xs ${urgencyInfo.color}`}
                                                                    variant={urgencyInfo.badgeVariant}
                                                                >
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    {urgencyInfo.label}
                                                                </Badge>
                                                                {daysLeft !== null && daysLeft <= 3 && (
                                                                    <div className={`text-xs px-2 py-1 rounded ${
                                                                        daysLeft <= 0 ? 'bg-red-100 text-red-800' :
                                                                        daysLeft <= 1 ? 'bg-amber-100 text-amber-800' :
                                                                        'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                        {daysLeft <= 0 ? 'Overdue' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col gap-1">
                                                                <Badge
                                                                    className="text-xs"
                                                                    variant={
                                                                        request.status === 'processing'
                                                                            ? 'warning'
                                                                            : 'secondary'
                                                                    }
                                                                >
                                                                    {request.status === 'processing' ? (
                                                                        <>
                                                                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                                                            Processing
                                                                        </>
                                                                    ) : (
                                                                        'Pending'
                                                                    )}
                                                                </Badge>
                                                                {request.processor && (
                                                                    <div className="text-xs text-gray-500">
                                                                        By: {request.processor.full_name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-medium">
                                                                ₱{parseFloat(request.fee_amount.toString()).toFixed(2)}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="space-y-1">
                                                                <div className="text-sm">
                                                                    Submitted: {format(new Date(request.created_at), 'MMM dd')}
                                                                </div>
                                                                {request.needed_date && (
                                                                    <div className="text-sm">
                                                                        Needed: {format(new Date(request.needed_date), 'MMM dd')}
                                                                    </div>
                                                                )}
                                                                {request.processed_at && (
                                                                    <div className="text-xs text-gray-500">
                                                                        Updated: {format(new Date(request.processed_at), 'MMM dd')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Link
                                                                                href={route('admin.clearances.approval.show', request.id)}
                                                                            >
                                                                                <Button variant="ghost" size="icon">
                                                                                    <Eye className="h-4 w-4" />
                                                                                </Button>
                                                                            </Link>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            View Details
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                {canActions.canProcess && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => post(route('admin.clearances.approval.mark-processing', request.id))}
                                                                                >
                                                                                    <RefreshCw className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                Start Processing
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}

                                                                {canActions.canReturn && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => post(route('admin.clearances.approval.return-pending', request.id))}
                                                                                >
                                                                                    <Clock className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                Return to Pending
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleIssueRequest(request)}
                                                                >
                                                                    <FilePlus className="h-4 w-4 mr-1" />
                                                                    Issue
                                                                </Button>

                                                                {canActions.canReject && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => {
                                                                            setSelectedRequest(request);
                                                                            setRejectDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {clearanceRequests.last_page > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                                        <div className="text-sm text-gray-500">
                                            Showing {clearanceRequests.data.length} of {clearanceRequests.total} requests
                                            • Page {clearanceRequests.current_page} of {clearanceRequests.last_page}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(route('admin.clearances.approval.index', {
                                                    ...data,
                                                    page: clearanceRequests.current_page - 1
                                                }))}
                                                disabled={clearanceRequests.current_page === 1}
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, clearanceRequests.last_page) }, (_, i) => {
                                                    let pageNum;
                                                    if (clearanceRequests.last_page <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (clearanceRequests.current_page <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (clearanceRequests.current_page >= clearanceRequests.last_page - 2) {
                                                        pageNum = clearanceRequests.last_page - 4 + i;
                                                    } else {
                                                        pageNum = clearanceRequests.current_page - 2 + i;
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={clearanceRequests.current_page === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => router.get(route('admin.clearances.approval.index', {
                                                                ...data,
                                                                page: pageNum
                                                            }))}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(route('admin.clearances.approval.index', {
                                                    ...data,
                                                    page: clearanceRequests.current_page + 1
                                                }))}
                                                disabled={clearanceRequests.current_page === clearanceRequests.last_page}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Request Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Pending</span>
                                    <span className="font-medium">{stats.pending}</span>
                                </div>
                                <Progress value={(stats.pending / clearanceRequests.total) * 100} className="h-2" />
                                
                                <div className="flex justify-between text-sm">
                                    <span>Processing</span>
                                    <span className="font-medium">{stats.processing}</span>
                                </div>
                                <Progress value={(stats.processing / clearanceRequests.total) * 100} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Urgency Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {urgencyOptions.map((urgency) => (
                                    <div key={urgency.value} className="flex justify-between text-sm">
                                        <span>{urgency.label}</span>
                                        <span className="font-medium">
                                            {clearanceRequests.data.filter(r => r.urgency === urgency.value).length}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/reports/clearances">
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        View Reports
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/clearances">
                                        <FileText className="h-4 w-4 mr-2" />
                                        All Clearances
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/residents">
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage Residents
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Issue Clearance Dialog */}
            <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Issue Clearance</DialogTitle>
                        <DialogDescription>
                            Create a clearance from this request. The resident information and clearance type will be pre-filled.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Reference Number</Label>
                                    <div className="text-sm font-mono p-2 bg-gray-50 rounded">
                                        {selectedRequest.reference_number}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Applicant</Label>
                                    <div className="text-sm p-2 bg-gray-50 rounded">
                                        {selectedRequest.resident?.full_name}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Clearance Type</Label>
                                    <div className="text-sm p-2 bg-gray-50 rounded">
                                        {selectedRequest.clearanceType?.name}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Fee</Label>
                                    <div className="text-sm p-2 bg-gray-50 rounded">
                                        ₱{parseFloat(selectedRequest.fee_amount.toString()).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium">Purpose</Label>
                                <div className="text-sm p-2 bg-gray-50 rounded min-h-[60px]">
                                    {selectedRequest.purpose}
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium">Supporting Documents</Label>
                                <div className="text-sm p-2 bg-gray-50 rounded">
                                    {selectedRequest.documents?.length ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            {selectedRequest.documents.map(doc => (
                                                <li key={doc.id}>
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {doc.file_name}
                                                    </a>
                                                    <span className="text-gray-500 text-xs ml-2">
                                                        ({(doc.file_size / 1024).toFixed(1)} KB)
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-gray-500">No documents attached</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIssueDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={confirmIssueClearance}
                            className="gap-2"
                        >
                            <FilePlus className="h-4 w-4" />
                            Continue to Issue Clearance
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {bulkSelection.length > 0 ? 'Reject Multiple Requests' : 'Reject Clearance Request'}
                        </DialogTitle>
                        <DialogDescription>
                            {bulkSelection.length > 0
                                ? `You are about to reject ${bulkSelection.length} request(s). Please provide a reason.`
                                : 'Are you sure you want to reject this clearance request?'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="rejectReason">Reason for rejection *</Label>
                            <Textarea
                                id="rejectReason"
                                placeholder="Please specify the reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-[100px]"
                                required
                            />
                        </div>
                        
                        {selectedRequest && !bulkSelection.length && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>This action cannot be undone</AlertTitle>
                                <AlertDescription>
                                    The request will be permanently marked as rejected.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                setRejectDialogOpen(false);
                                setRejectReason('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            variant="destructive"
                            onClick={() => {
                                if (bulkSelection.length > 0) {
                                    handleBulkReject();
                                } else if (selectedRequest) {
                                    handleReject(selectedRequest.id);
                                }
                            }}
                            disabled={!rejectReason.trim()}
                        >
                            {bulkSelection.length > 0 ? 'Reject All' : 'Reject Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}