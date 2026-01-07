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
    CheckCircle,
    XCircle,
    Eye,
    RefreshCw,
    Download,
    FileText,
    User,
    Calendar,
    DollarSign,
    ChevronRight,
    Loader2,
    BarChart3,
    TrendingUp,
    FilePlus
} from 'lucide-react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface ClearanceRequest {
    id: number;
    reference_number: string;
    purpose: string;
    urgency: string;
    needed_date: string;
    fee_amount: number;
    status: string;
    created_at: string;
    resident?: {
        id: number;
        full_name: string;
        address: string;
        contact_number: string;
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
    }>;
}

interface PageProps {
    clearanceRequests?: {
        data: ClearanceRequest[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: {
        pending: number;
        processing: number;
        today: number;
        urgent: number;
    };
    clearanceTypes?: Array<{ id: number; name: string }>;
    filters?: {
        search?: string;
        urgency?: string;
        type?: string;
        date_from?: string;
        date_to?: string;
    };
}

const urgencyOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'rush', label: 'Rush' },
    { value: 'express', label: 'Express' },
];

export default function ApprovalQueue() {
    const { props } = usePage<PageProps>();
    const { clearanceRequests, stats, clearanceTypes = [], filters = {} } = props;
    const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);

    // Add loading state
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
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-600">Loading approval queue...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        urgency: filters.urgency || '',
        type: filters.type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const { data, setData, get, processing } = useForm({
        search: localFilters.search,
        urgency: localFilters.urgency || 'all',
        type: localFilters.type || 'all',
        date_from: localFilters.date_from,
        date_to: localFilters.date_to,
    });

    const applyFilters = () => {
        get(route('admin.clearances.approval.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({
            search: '',
            urgency: '',
            type: '',
            date_from: '',
            date_to: '',
        });
        setData({
            search: '',
            urgency: '',
            type: '',
            date_from: '',
            date_to: '',
        });
        get(route('admin.clearances.approval.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            if (data.search !== localFilters.search) {
                applyFilters();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [data.search]);

    const handleIssueRequest = (request: ClearanceRequest) => {
        setSelectedRequest(request);
        setIssueDialogOpen(true);
    };

    const confirmIssueClearance = () => {
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
    };

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Manage pending clearance requests and approvals
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting initial review
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Processing</CardTitle>
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.processing || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently being processed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.today || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Submitted today
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.urgent || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Rush or express requests
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder="Search by reference, name, etc..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                    />
                                </div>
                                <div className="w-48">
                                    <Label htmlFor="urgency">Clearance Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {(clearanceTypes || []).map((type) => {
                                                const value = type?.id?.toString() || `type-${Math.random()}`;
                                                const label = type?.name || 'Unnamed Type';
                                                
                                                return (
                                                    <SelectItem key={type.id || value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-48">
                                    <Label htmlFor="type">Urgency</Label>
                                    <Select
                                        value={data.urgency}
                                        onValueChange={(value) => setData('urgency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Urgency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Urgency</SelectItem>
                                            {urgencyOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-48">
                                    <Label htmlFor="date_from">From Date</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={data.date_from}
                                        onChange={(e) => setData('date_from', e.target.value)}
                                    />
                                </div>
                                <div className="w-48">
                                    <Label htmlFor="date_to">To Date</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={data.date_to}
                                        onChange={(e) => setData('date_to', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button onClick={applyFilters} disabled={processing}>
                                        {processing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4 mr-2" />
                                        )}
                                        Apply
                                    </Button>
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clearance Requests</CardTitle>
                        <CardDescription>
                            {(clearanceRequests?.total || 0)} request(s) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!clearanceRequests.data || clearanceRequests.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                                <p className="text-gray-500">All clearance requests have been processed.</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-gray-50 dark:bg-gray-800">
                                                <th className="text-left p-4 font-medium">Reference No.</th>
                                                <th className="text-left p-4 font-medium">Applicant</th>
                                                <th className="text-left p-4 font-medium">Type</th>
                                                <th className="text-left p-4 font-medium">Urgency</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                <th className="text-left p-4 font-medium">Fee</th>
                                                <th className="text-left p-4 font-medium">Needed By</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(clearanceRequests.data || []).map((request) => (
                                                <tr key={request.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-4">
                                                        <Link 
                                                            href={route('admin.clearances.approval.show', request.id)}
                                                            className="font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            {request.reference_number || 'N/A'}
                                                        </Link>
                                                        <div className="text-xs text-gray-500">
                                                            {request.created_at ? format(new Date(request.created_at), 'MMM dd, yyyy HH:mm') : 'Date unknown'}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium">{request.resident?.full_name || 'Unknown Applicant'}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {request.resident?.contact_number || 'No contact'}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className="text-xs">
                                                            {request.clearanceType?.name || 'Unknown Type'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge 
                                                            className="text-xs" 
                                                            variant={
                                                                request.urgency === 'express' ? 'destructive' :
                                                                request.urgency === 'rush' ? 'warning' : 'secondary'
                                                            }
                                                        >
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {request.urgency === 'express' ? 'Express' :
                                                             request.urgency === 'rush' ? 'Rush' : 'Normal'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge 
                                                            className="text-xs" 
                                                            variant={
                                                                request.status === 'processing' ? 'warning' : 'secondary'
                                                            }
                                                        >
                                                            {request.status === 'processing' ? (
                                                                <>
                                                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                                                    Processing
                                                                </>
                                                            ) : 'Pending'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium">
                                                            ₱{parseFloat(request.fee_amount || 0).toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div>
                                                            {request.needed_date ? format(new Date(request.needed_date), 'MMM dd, yyyy') : 'Not specified'}
                                                            {request.needed_date && (() => {
                                                                const neededDate = new Date(request.needed_date);
                                                                const today = new Date();
                                                                const daysDiff = Math.ceil((neededDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                                                                
                                                                if (daysDiff <= 2) {
                                                                    return (
                                                                        <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            {daysDiff <= 0 ? 'Overdue' : `${daysDiff} days left`}
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('admin.clearances.approval.show', request.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleIssueRequest(request)}
                                                            >
                                                                <FilePlus className="h-4 w-4 mr-1" />
                                                                Issue Request
                                                            </Button>
                                                            {request.status === 'pending' && (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => router.post(route('admin.clearances.approval.mark-processing', request.id))}
                                                                >
                                                                    <RefreshCw className="h-4 w-4 mr-1" />
                                                                    Process
                                                                </Button>
                                                            )}
                                                            {request.status === 'processing' && (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => router.post(route('admin.clearances.approval.return-pending', request.id))}
                                                                >
                                                                    <Clock className="h-4 w-4 mr-1" />
                                                                    Return
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {clearanceRequests.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing {clearanceRequests.data.length} of {clearanceRequests.total} requests
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(clearanceRequests.current_page > 1 ? 
                                            route('admin.clearances.approval.index', { page: clearanceRequests.current_page - 1 }) : '#')}
                                        disabled={clearanceRequests.current_page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(clearanceRequests.current_page < clearanceRequests.last_page ?
                                            route('admin.clearances.approval.index', { page: clearanceRequests.current_page + 1 }) : '#')}
                                        disabled={clearanceRequests.current_page === clearanceRequests.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="justify-start" asChild>
                                <Link href="/clearances">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View All Clearances
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start" asChild>
                                <Link href="/clearances/create">
                                    <User className="h-4 w-4 mr-2" />
                                    Issue New Clearance
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start" asChild>
                                <Link href="/reports/clearances">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Reports
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Issue Clearance Dialog */}
            <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
                <DialogContent className="sm:max-w-md">
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
                                    <div className="text-sm">{selectedRequest.reference_number}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Applicant</Label>
                                    <div className="text-sm">{selectedRequest.resident?.full_name}</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Clearance Type</Label>
                                    <div className="text-sm">{selectedRequest.clearanceType?.name}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Fee</Label>
                                    <div className="text-sm">₱{parseFloat(selectedRequest.fee_amount || 0).toFixed(2)}</div>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium">Purpose</Label>
                                <div className="text-sm">{selectedRequest.purpose}</div>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="sm:justify-start">
                        <Button 
                            type="button" 
                            variant="secondary" 
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
        </AppLayout>
    );
}