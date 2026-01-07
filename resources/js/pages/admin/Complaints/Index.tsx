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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Filter,
    Download,
    Plus,
    Eye,
    Edit,
    Trash2,
    MessageSquare,
    AlertCircle,
    CheckCircle,
    Clock,
    MapPin,
    Calendar,
    User,
    FileText,
    MoreVertical,
    ChevronRight,
    ChevronLeft,
    Shield,
    AlertTriangle,
    Archive,
    RefreshCw,
    Printer,
    Send,
    Bell,
    Copy,
    BarChart3,
    Users,
    Settings,
    Mail,
    Phone,
    Home,
    ExternalLink,
    FileCheck,
    FileX,
    UserCheck,
    UserX,
    Flag,
    Hash,
    Tag,
    Layers,
    Database,
    Server
} from 'lucide-react';
import { Link, Head, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

// Types based on your Complaint model
type Complaint = {
    id: number;
    complaint_number: string;
    user_id: number;
    user?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    type: string;
    subject: string;
    description: string;
    location: string;
    incident_date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
    is_anonymous: boolean;
    evidence_files?: string[];
    admin_notes?: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
    priority_color?: string;
    status_color?: string;
};

type PageProps = {
    complaints: Complaint[];
    stats: {
        total: number;
        pending: number;
        under_review: number;
        resolved: number;
        dismissed: number;
        high_priority: number;
        medium_priority: number;
        low_priority: number;
        today: number;
        this_week: number;
        this_month: number;
        anonymous: number;
    };
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        type?: string;
        date_from?: string;
        date_to?: string;
        date_range?: 'today' | 'week' | 'month' | 'all';
    };
    complaint_types: string[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper function to format date
const formatDate = (dateString: string | Date, includeTime: boolean = false): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-PH', options);
};

// Helper function to get time ago
const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(date);
};

export default function AdminComplaintIndex() {
    const { props } = usePage<PageProps>();
    const { complaints: initialComplaints, stats: initialStats, complaint_types } = props;
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedComplaints, setSelectedComplaints] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Get all complaints initially
    const allComplaints = initialComplaints;
    
    // Filter complaints client-side
    const filteredComplaints = useMemo(() => {
        let filtered = [...allComplaints];
        
        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(complaint => 
                complaint.complaint_number.toLowerCase().includes(searchLower) ||
                complaint.subject.toLowerCase().includes(searchLower) ||
                complaint.description.toLowerCase().includes(searchLower) ||
                complaint.location.toLowerCase().includes(searchLower) ||
                (!complaint.is_anonymous && complaint.user?.name?.toLowerCase().includes(searchLower)) ||
                (!complaint.is_anonymous && complaint.user?.email?.toLowerCase().includes(searchLower)) ||
                complaint.type.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(complaint => complaint.status === statusFilter);
        }
        
        // Apply priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
        }
        
        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(complaint => complaint.type === typeFilter);
        }
        
        // Apply date filters
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            if (dateFilter === 'today') {
                filtered = filtered.filter(complaint => {
                    const incidentDate = new Date(complaint.incident_date);
                    return incidentDate >= today;
                });
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                filtered = filtered.filter(complaint => {
                    const incidentDate = new Date(complaint.incident_date);
                    return incidentDate >= weekAgo;
                });
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                filtered = filtered.filter(complaint => {
                    const incidentDate = new Date(complaint.incident_date);
                    return incidentDate >= monthAgo;
                });
            } else if (dateFilter === 'custom' && (customDateFrom || customDateTo)) {
                filtered = filtered.filter(complaint => {
                    const incidentDate = new Date(complaint.incident_date);
                    
                    if (customDateFrom && customDateTo) {
                        const fromDate = new Date(customDateFrom);
                        const toDate = new Date(customDateTo);
                        return incidentDate >= fromDate && incidentDate <= toDate;
                    } else if (customDateFrom) {
                        const fromDate = new Date(customDateFrom);
                        return incidentDate >= fromDate;
                    } else if (customDateTo) {
                        const toDate = new Date(customDateTo);
                        return incidentDate <= toDate;
                    }
                    return true;
                });
            }
        }
        
        return filtered;
    }, [allComplaints, search, statusFilter, priorityFilter, typeFilter, dateFilter, customDateFrom, customDateTo]);
    
    // Calculate pagination
    const itemsPerPage = 20;
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
    const paginatedComplaints = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredComplaints.slice(startIndex, endIndex);
    }, [filteredComplaints, currentPage, itemsPerPage]);
    
    // Calculate real-time stats based on filtered data
    const realTimeStats = useMemo(() => {
        const total = filteredComplaints.length;
        const pending = filteredComplaints.filter(c => c.status === 'pending').length;
        const under_review = filteredComplaints.filter(c => c.status === 'under_review').length;
        const resolved = filteredComplaints.filter(c => c.status === 'resolved').length;
        const dismissed = filteredComplaints.filter(c => c.status === 'dismissed').length;
        const high_priority = filteredComplaints.filter(c => c.priority === 'high').length;
        const medium_priority = filteredComplaints.filter(c => c.priority === 'medium').length;
        const low_priority = filteredComplaints.filter(c => c.priority === 'low').length;
        const anonymous = filteredComplaints.filter(c => c.is_anonymous).length;
        
        // Calculate time-based stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        const todayComplaints = filteredComplaints.filter(c => {
            const createdDate = new Date(c.created_at);
            return createdDate >= today;
        }).length;
        
        const thisWeekComplaints = filteredComplaints.filter(c => {
            const createdDate = new Date(c.created_at);
            return createdDate >= weekAgo;
        }).length;
        
        const thisMonthComplaints = filteredComplaints.filter(c => {
            const createdDate = new Date(c.created_at);
            return createdDate >= monthAgo;
        }).length;
        
        return {
            total,
            pending,
            under_review,
            resolved,
            dismissed,
            high_priority,
            medium_priority,
            low_priority,
            today: todayComplaints,
            this_week: thisWeekComplaints,
            this_month: thisMonthComplaints,
            anonymous
        };
    }, [filteredComplaints]);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, priorityFilter, typeFilter, dateFilter, customDateFrom, customDateTo]);
    
    // Get priority badge variant
    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'outline';
            case 'low': return 'secondary';
            default: return 'outline';
        }
    };
    
    // Get priority icon
    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="h-3 w-3" />;
            case 'medium': return <AlertCircle className="h-3 w-3" />;
            case 'low': return <Clock className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };
    
    // Get status badge variant
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'resolved': return 'default';
            case 'under_review': return 'outline';
            case 'pending': return 'secondary';
            case 'dismissed': return 'destructive';
            default: return 'outline';
        }
    };
    
    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved': return <CheckCircle className="h-3 w-3" />;
            case 'under_review': return <Clock className="h-3 w-3" />;
            case 'pending': return <AlertCircle className="h-3 w-3" />;
            case 'dismissed': return <Archive className="h-3 w-3" />;
            default: return <AlertCircle className="h-3 w-3" />;
        }
    };
    
    // Handle bulk actions
    const handleBulkAction = async (action: string) => {
        if (selectedComplaints.length === 0) {
            toast({
                title: "No complaints selected",
                description: "Please select at least one complaint to perform this action.",
                variant: "destructive",
            });
            return;
        }
        
        switch (action) {
            case 'mark_resolved':
                if (confirm(`Mark ${selectedComplaints.length} complaint(s) as resolved?`)) {
                    setLoading(true);
                    router.post('/admin/complaints/bulk-action', {
                        complaint_ids: selectedComplaints,
                        action: 'mark_resolved'
                    }, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            toast({
                                title: "Complaints updated",
                                description: `${selectedComplaints.length} complaint(s) marked as resolved.`,
                            });
                            setSelectedComplaints([]);
                        },
                        onError: (errors) => {
                            toast({
                                title: "Error",
                                description: "Failed to update complaints. Please try again.",
                                variant: "destructive",
                            });
                        },
                        onFinish: () => setLoading(false),
                    });
                }
                break;
                
            case 'mark_under_review':
                if (confirm(`Mark ${selectedComplaints.length} complaint(s) as under review?`)) {
                    setLoading(true);
                    router.post('/admin/complaints/bulk-action', {
                        complaint_ids: selectedComplaints,
                        action: 'mark_under_review'
                    }, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            toast({
                                title: "Complaints updated",
                                description: `${selectedComplaints.length} complaint(s) marked as under review.`,
                            });
                            setSelectedComplaints([]);
                        },
                        onError: (errors) => {
                            toast({
                                title: "Error",
                                description: "Failed to update complaints. Please try again.",
                                variant: "destructive",
                            });
                        },
                        onFinish: () => setLoading(false),
                    });
                }
                break;
                
            case 'mark_pending':
                if (confirm(`Mark ${selectedComplaints.length} complaint(s) as pending?`)) {
                    setLoading(true);
                    router.post('/admin/complaints/bulk-action', {
                        complaint_ids: selectedComplaints,
                        action: 'mark_pending'
                    }, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            toast({
                                title: "Complaints updated",
                                description: `${selectedComplaints.length} complaint(s) marked as pending.`,
                            });
                            setSelectedComplaints([]);
                        },
                        onError: (errors) => {
                            toast({
                                title: "Error",
                                description: "Failed to update complaints. Please try again.",
                                variant: "destructive",
                            });
                        },
                        onFinish: () => setLoading(false),
                    });
                }
                break;
                
            case 'delete':
                if (confirm(`Delete ${selectedComplaints.length} complaint(s)? This action cannot be undone.`)) {
                    setLoading(true);
                    router.post('/admin/complaints/bulk-action', {
                        complaint_ids: selectedComplaints,
                        action: 'delete'
                    }, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            toast({
                                title: "Complaints deleted",
                                description: `${selectedComplaints.length} complaint(s) have been deleted.`,
                            });
                            setSelectedComplaints([]);
                        },
                        onError: (errors) => {
                            toast({
                                title: "Error",
                                description: "Failed to delete complaints. Please try again.",
                                variant: "destructive",
                            });
                        },
                        onFinish: () => setLoading(false),
                    });
                }
                break;
                
            case 'export':
                // Handle bulk export
                const exportUrl = new URL('/admin/complaints/export', window.location.origin);
                exportUrl.searchParams.append('ids', selectedComplaints.join(','));
                window.open(exportUrl.toString(), '_blank');
                break;
        }
    };
    
    // Handle copy to clipboard
    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Copied to clipboard",
                description: `${label} has been copied.`,
            });
        });
    };
    
    // Clear all filters
    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setTypeFilter('all');
        setDateFilter('all');
        setCustomDateFrom('');
        setCustomDateTo('');
        setSelectedComplaints([]);
        setCurrentPage(1);
    };
    
    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedComplaints.length === paginatedComplaints.length) {
            setSelectedComplaints([]);
        } else {
            setSelectedComplaints(paginatedComplaints.map(c => c.id));
        }
    };
    
    // Toggle single complaint selection
    const toggleComplaintSelection = (id: number) => {
        setSelectedComplaints(prev => 
            prev.includes(id) 
                ? prev.filter(complaintId => complaintId !== id)
                : [...prev, id]
        );
    };
    
    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const hasActiveFilters = search || statusFilter !== 'all' || priorityFilter !== 'all' || 
                           typeFilter !== 'all' || dateFilter !== 'all' || customDateFrom || customDateTo;
    
    // Get unique complaint types from all data
    const uniqueComplaintTypes = useMemo(() => {
        const types = allComplaints.map(c => c.type);
        return Array.from(new Set(types));
    }, [allComplaints]);
    
    return (
        <AppLayout
            title="Admin - Complaints Management"
            breadcrumbs={[
                { title: 'Admin Dashboard', href: '/admin/dashboard' },
                { title: 'Complaints Management', href: '/admin/complaints' }
            ]}
        >
            <Head title="Admin - Complaints Management | Barangay Kibawe" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Complaints Management</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                    Admin panel - Manage all resident complaints and concerns
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className="h-8"
                            >
                                <Layers className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8"
                            >
                                <Database className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.visit('/admin/complaints', { 
                                preserveState: false,
                                preserveScroll: true,
                                onStart: () => setLoading(true),
                                onFinish: () => setLoading(false),
                            })}
                            disabled={loading}
                            className="h-9"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Comprehensive Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{realTimeStats.total}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                All complaints
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">{realTimeStats.pending}</div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                Awaiting action
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Under Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{realTimeStats.under_review}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                In progress
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                High Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">{realTimeStats.high_priority}</div>
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Urgent attention
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Resolved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{realTimeStats.resolved}</div>
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Successfully closed
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Anonymous
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{realTimeStats.anonymous}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                No identity disclosed
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Search complaints by ID, subject, location, resident name, email, or description..." 
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="h-9"
                                        onClick={() => setShowFilters(!showFilters)}
                                        disabled={loading}
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Advanced Filters</span>
                                        {hasActiveFilters && (
                                            <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {hasActiveFilters ? 1 : 0}
                                            </span>
                                        )}
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="h-9" disabled={loading || selectedComplaints.length === 0}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                                                Export Selected ({selectedComplaints.length})
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open('/admin/complaints/export?format=csv', '_blank')}>
                                                Export All as CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open('/admin/complaints/export?format=pdf', '_blank')}>
                                                Export All as PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open('/admin/complaints/export?format=excel', '_blank')}>
                                                Export All as Excel
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="flex flex-wrap gap-2">
                                <Badge 
                                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => setStatusFilter('all')}
                                >
                                    All Status
                                </Badge>
                                {['pending', 'under_review', 'resolved', 'dismissed'].map(status => (
                                    <Badge 
                                        key={status}
                                        variant={statusFilter === status ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => setStatusFilter(status)}
                                    >
                                        {status.replace('_', ' ')}
                                    </Badge>
                                ))}
                                
                                <Badge 
                                    variant={priorityFilter === 'all' ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => setPriorityFilter('all')}
                                >
                                    All Priority
                                </Badge>
                                {['high', 'medium', 'low'].map(priority => (
                                    <Badge 
                                        key={priority}
                                        variant={priorityFilter === priority ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => setPriorityFilter(priority)}
                                    >
                                        {priority} Priority
                                    </Badge>
                                ))}
                            </div>

                            {/* Advanced Filters (Collapsible) */}
                            {showFilters && (
                                <div className="grid gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Status</label>
                                            <select
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="under_review">Under Review</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="dismissed">Dismissed</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Priority</label>
                                            <select
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                value={priorityFilter}
                                                onChange={(e) => setPriorityFilter(e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="all">All Priorities</option>
                                                <option value="high">High</option>
                                                <option value="medium">Medium</option>
                                                <option value="low">Low</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Type</label>
                                            <select
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                value={typeFilter}
                                                onChange={(e) => setTypeFilter(e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="all">All Types</option>
                                                {uniqueComplaintTypes?.map(type => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Date Range</label>
                                            <select
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                value={dateFilter}
                                                onChange={(e) => setDateFilter(e.target.value as any)}
                                                disabled={loading}
                                            >
                                                <option value="all">All Dates</option>
                                                <option value="today">Today</option>
                                                <option value="week">Last 7 Days</option>
                                                <option value="month">Last 30 Days</option>
                                                <option value="custom">Custom Range</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {dateFilter === 'custom' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">From Date</label>
                                                <Input
                                                    type="date"
                                                    value={customDateFrom}
                                                    onChange={(e) => setCustomDateFrom(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">To Date</label>
                                                <Input
                                                    type="date"
                                                    value={customDateTo}
                                                    onChange={(e) => setCustomDateTo(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setCustomDateFrom('');
                                                        setCustomDateTo('');
                                                    }}
                                                    disabled={loading}
                                                    className="w-full"
                                                >
                                                    Clear Dates
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                disabled={loading}
                                            >
                                                Clear All Filters
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => setShowFilters(false)}
                                                disabled={loading}
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active filters indicator */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                            Loading complaints...
                                        </span>
                                    ) : (
                                        `Page ${currentPage} of ${totalPages} • Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of ${filteredComplaints.length} complaints`
                                    )}
                                </div>
                                
                                {hasActiveFilters && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            disabled={loading}
                                            className="text-red-600 hover:text-red-700 h-8"
                                        >
                                            Clear All Filters
                                        </Button>
                                        <Badge variant="outline" className="text-xs">
                                            Filtered: {filteredComplaints.length} of {allComplaints.length}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions Bar */}
                {selectedComplaints.length > 0 && (
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                        <CardContent className="pt-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-800 dark:text-blue-300">
                                            {selectedComplaints.length} complaint(s) selected
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            Perform bulk actions on selected items
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="default" size="sm" disabled={loading}>
                                                {loading ? 'Processing...' : 'Bulk Actions'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                            <DropdownMenuItem 
                                                onClick={() => handleBulkAction('mark_resolved')}
                                                disabled={loading}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Mark as Resolved
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleBulkAction('mark_under_review')}
                                                disabled={loading}
                                            >
                                                <Clock className="mr-2 h-4 w-4" />
                                                Mark as Under Review
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleBulkAction('mark_pending')}
                                                disabled={loading}
                                            >
                                                <AlertCircle className="mr-2 h-4 w-4" />
                                                Mark as Pending
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Other Actions</DropdownMenuLabel>
                                            <DropdownMenuItem 
                                                onClick={() => handleBulkAction('export')}
                                                disabled={loading}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Export Selected
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleBulkAction('delete')}
                                                disabled={loading}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Selected
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setSelectedComplaints([])}
                                        disabled={loading}
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Complaints Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg sm:text-xl">
                            {selectedComplaints.length > 0 ? (
                                <span className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedComplaints.length === paginatedComplaints.length && paginatedComplaints.length > 0}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded"
                                        disabled={loading}
                                    />
                                    Selected {selectedComplaints.length} of {paginatedComplaints.length}
                                </span>
                            ) : (
                                'All Complaints'
                            )}
                        </CardTitle>
                        <div className="text-sm text-gray-500">
                            Total: {filteredComplaints.length} complaints
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedComplaints.length === paginatedComplaints.length && paginatedComplaints.length > 0}
                                                        onChange={toggleSelectAll}
                                                        className="h-4 w-4 rounded"
                                                        disabled={loading}
                                                    />
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="h-3 w-3" />
                                                        Complaint Details
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-3 w-3" />
                                                        Type & Priority
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        Resident Information
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" />
                                                        Timeline
                                                    </div>
                                                </TableHead>
                                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Settings className="h-3 w-3" />
                                                        Admin Actions
                                                    </div>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedComplaints.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                        <div className="flex flex-col items-center justify-center space-y-4">
                                                            <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                            <div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No complaints found</h3>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {hasActiveFilters 
                                                                        ? 'Try changing your filters or search criteria.'
                                                                        : 'No complaints have been submitted yet.'}
                                                                </p>
                                                            </div>
                                                            {hasActiveFilters && (
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={handleClearFilters}
                                                                    className="h-8"
                                                                >
                                                                    Clear Filters
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedComplaints.map((complaint) => (
                                                    <TableRow 
                                                        key={complaint.id} 
                                                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                            selectedComplaints.includes(complaint.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                        }`}
                                                    >
                                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedComplaints.includes(complaint.id)}
                                                                onChange={() => toggleComplaintSelection(complaint.id)}
                                                                className="h-4 w-4 rounded"
                                                                disabled={loading}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="font-mono text-xs">
                                                                        {complaint.complaint_number}
                                                                    </Badge>
                                                                    {complaint.is_anonymous && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            <User className="h-3 w-3 mr-1" />
                                                                            Anonymous
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div 
                                                                    className="font-medium truncate cursor-pointer hover:text-blue-600"
                                                                    title={complaint.subject}
                                                                    onClick={() => router.visit(`/admin/complaints/${complaint.id}`)}
                                                                >
                                                                    {truncateText(complaint.subject, 50)}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                                                    <span className="truncate" title={complaint.location}>
                                                                        {truncateText(complaint.location, 35)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3">
                                                            <div className="space-y-2">
                                                                <Badge 
                                                                    variant={getStatusBadgeVariant(complaint.status)}
                                                                    className="flex items-center gap-1 w-fit"
                                                                >
                                                                    {getStatusIcon(complaint.status)}
                                                                    <span className="capitalize">{complaint.status.replace('_', ' ')}</span>
                                                                </Badge>
                                                                <div className="space-y-1">
                                                                    <Badge 
                                                                        variant={getPriorityBadgeVariant(complaint.priority)}
                                                                        className="flex items-center gap-1 w-fit"
                                                                    >
                                                                        {getPriorityIcon(complaint.priority)}
                                                                        {complaint.priority} Priority
                                                                    </Badge>
                                                                    <div className="text-xs text-gray-500">
                                                                        Type: {complaint.type}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <span className="font-medium">
                                                                        {complaint.is_anonymous ? 'Anonymous Resident' : complaint.user?.name || 'Unknown Resident'}
                                                                    </span>
                                                                </div>
                                                                {!complaint.is_anonymous && complaint.user && (
                                                                    <div className="space-y-1 pl-6">
                                                                        {complaint.user.email && (
                                                                            <div 
                                                                                className="text-sm text-gray-500 truncate flex items-center gap-1 cursor-pointer hover:text-blue-600"
                                                                                onClick={() => handleCopyToClipboard(complaint.user!.email!, 'Email')}
                                                                                title="Click to copy email"
                                                                            >
                                                                                <Mail className="h-3 w-3" />
                                                                                {truncateText(complaint.user.email, 25)}
                                                                            </div>
                                                                        )}
                                                                        {complaint.user.phone && (
                                                                            <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                                                                                <Phone className="h-3 w-3" />
                                                                                {complaint.user.phone}
                                                                            </div>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 text-xs"
                                                                            asChild
                                                                        >
                                                                            <Link href={`/admin/residents/${complaint.user_id}`}>
                                                                                View Resident Profile
                                                                            </Link>
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-1 text-sm">
                                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                                    Incident: {formatDate(complaint.incident_date)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Reported: {getTimeAgo(complaint.created_at)}
                                                                </div>
                                                                {complaint.resolved_at && (
                                                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Resolved: {formatDate(complaint.resolved_at, true)}
                                                                    </div>
                                                                )}
                                                                {complaint.evidence_files && complaint.evidence_files.length > 0 && (
                                                                    <div className="text-xs text-blue-600 flex items-center gap-1">
                                                                        <FileText className="h-3 w-3" />
                                                                        {complaint.evidence_files.length} evidence file(s)
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-right">
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
                                                                <DropdownMenuContent align="end" className="w-56">
                                                                    <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <Link 
                                                                            href={`/admin/complaints/${complaint.id}`} 
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            <span>View Full Details</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuItem asChild>
                                                                        <Link 
                                                                            href={`/admin/complaints/${complaint.id}/edit`} 
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            <span>Edit Complaint</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleCopyToClipboard(complaint.complaint_number, 'Complaint ID')}
                                                                        className="flex items-center cursor-pointer"
                                                                    >
                                                                        <Copy className="mr-2 h-4 w-4" />
                                                                        <span>Copy Complaint ID</span>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuSeparator />
                                                                    
                                                                    <DropdownMenuItem asChild>
                                                                        <Link 
                                                                            href={`/admin/complaints/${complaint.id}/response`} 
                                                                            className="flex items-center cursor-pointer"
                                                                        >
                                                                            <Send className="mr-2 h-4 w-4" />
                                                                            <span>Send Official Response</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuSeparator />
                                                                    
                                                                    <DropdownMenuItem 
                                                                        className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                                                        asChild
                                                                    >
                                                                        <Link href={`/admin/complaints/${complaint.id}?action=resolve`}>
                                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                                            <span>Mark as Resolved</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuItem 
                                                                        className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                                                        asChild
                                                                    >
                                                                        <Link href={`/admin/complaints/${complaint.id}?action=review`}>
                                                                            <Clock className="mr-2 h-4 w-4" />
                                                                            <span>Mark as Under Review</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuItem 
                                                                        className="text-gray-600 focus:text-gray-700 focus:bg-gray-50"
                                                                        asChild
                                                                    >
                                                                        <Link href={`/admin/complaints/${complaint.id}?action=dismiss`}>
                                                                            <Archive className="mr-2 h-4 w-4" />
                                                                            <span>Dismiss Complaint</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuSeparator />
                                                                    
                                                                    <DropdownMenuItem 
                                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                        onClick={() => {
                                                                            if (confirm(`Are you sure you want to delete complaint ${complaint.complaint_number}? This action cannot be undone.`)) {
                                                                                router.delete(`/admin/complaints/${complaint.id}`, {
                                                                                    preserveScroll: true,
                                                                                    preserveState: true,
                                                                                    onSuccess: () => {
                                                                                        toast({
                                                                                            title: "Complaint deleted",
                                                                                            description: "The complaint has been successfully deleted.",
                                                                                        });
                                                                                    },
                                                                                    onError: () => {
                                                                                        toast({
                                                                                            title: "Error",
                                                                                            description: "Failed to delete complaint. Please try again.",
                                                                                            variant: "destructive",
                                                                                        });
                                                                                    },
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        <span>Delete Complaint</span>
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
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                <div className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
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
                                                    onClick={() => handlePageChange(pageNum)}
                                                    disabled={loading}
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
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || loading}
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

                {/* Admin Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200" onClick={() => router.visit('/admin/complaints/reports', { preserveScroll: true })}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Printer className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Generate Reports</h3>
                                    <p className="text-sm text-gray-500">Monthly/Quarterly summaries</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200" onClick={() => router.visit('/admin/complaints/analytics', { preserveScroll: true })}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <BarChart3 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">View Analytics</h3>
                                    <p className="text-sm text-gray-500">Trends and insights</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-amber-200" onClick={() => {
                        setStatusFilter('pending');
                        setPriorityFilter('high');
                    }}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Urgent Cases</h3>
                                    <p className="text-sm text-gray-500">{realTimeStats.high_priority} high priority</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200" onClick={() => router.visit('/admin/complaints/settings', { preserveScroll: true })}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Settings className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">System Settings</h3>
                                    <p className="text-sm text-gray-500">Configure complaint types</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}