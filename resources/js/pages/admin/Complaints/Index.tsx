import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Search,
    Plus,
    Filter,
    Download,
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
    AlertTriangle,
    Archive,
    RefreshCw,
    Printer,
    Send,
    Copy,
    Layers,
    X,
    ChevronDown,
    ChevronUp,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    Loader2,
    FileSpreadsheet,
    Phone,
    Home,
    BarChart3,
    Settings,
    Hash,
    RotateCcw
} from 'lucide-react';

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
        purok?: string;
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
    assigned_to?: {
        id: number;
        name: string;
    };
};

interface PaginationData {
    current_page: number;
    data: Complaint[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface Filters {
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    from_date?: string;
    to_date?: string;
    purok?: string;
}

interface Stats {
    total: number;
    pending: number;
    under_review: number;
    resolved: number;
    dismissed: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    today: number;
    anonymous: number;
}

declare module '@inertiajs/react' {
    interface PageProps {
        complaints: PaginationData;
        filters: Filters;
        statuses: Record<string, string>;
        priorities: Record<string, string>;
        types: string[];
        puroks: string[];
        stats: Stats;
        flash?: {
            success?: string;
            error?: string;
        };
    }
}

// Helper functions
const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid Date';
    }
};

const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return 'Invalid Date';
    }
};

const getTimeAgo = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return formatDate(dateString);
    } catch (error) {
        return 'Invalid Date';
    }
};

export default function AdminComplaintIndex({
    complaints: rawComplaints,
    filters,
    statuses: rawStatuses,
    priorities: rawPriorities,
    types: rawTypes,
    puroks: rawPuroks,
    stats: rawStats
}: {
    complaints: any;
    filters: Filters;
    statuses?: Record<string, string>;
    priorities?: Record<string, string>;
    types?: string[];
    puroks?: string[];
    stats: Stats;
}) {
    const { flash } = usePage().props as any;
    
    // Debug logging
    useEffect(() => {
        console.log('=== COMPLAINTS DEBUG ===');
        console.log('Raw complaints:', rawComplaints);
        console.log('Raw complaints.data:', rawComplaints?.data);
        console.log('Is complaints.data array?', Array.isArray(rawComplaints?.data));
        console.log('Raw stats:', rawStats);
        console.log('Raw statuses:', rawStatuses);
        console.log('Raw priorities:', rawPriorities);
        console.log('Raw types:', rawTypes);
        console.log('Raw puroks:', rawPuroks);
        console.log('=== END DEBUG ===');
    }, [rawComplaints, rawStats, rawStatuses, rawPriorities, rawTypes, rawPuroks]);

    // SAFE initialization with proper fallbacks
    const safeComplaints = useMemo(() => {
        // Handle case where rawComplaints might be an array directly
        if (Array.isArray(rawComplaints)) {
            return {
                data: rawComplaints,
                total: rawComplaints.length,
                current_page: 1,
                per_page: 10,
                last_page: 1,
                from: 1,
                to: rawComplaints.length,
            };
        }
        
        // Handle case where rawComplaints has a data property
        if (rawComplaints && typeof rawComplaints === 'object') {
            const data = Array.isArray(rawComplaints.data) 
                ? rawComplaints.data 
                : [];
            
            return {
                data,
                total: rawComplaints.total || data.length || 0,
                current_page: rawComplaints.current_page || 1,
                per_page: rawComplaints.per_page || 10,
                last_page: rawComplaints.last_page || 1,
                from: rawComplaints.from || 0,
                to: rawComplaints.to || data.length,
            };
        }
        
        // Default fallback
        return {
            data: [],
            total: 0,
            current_page: 1,
            per_page: 10,
            last_page: 1,
            from: 0,
            to: 0,
        };
    }, [rawComplaints]);

    // SAFE props with defaults
    const safeStatuses = useMemo(() => {
        if (rawStatuses && typeof rawStatuses === 'object' && Object.keys(rawStatuses).length > 0) {
            return rawStatuses;
        }
        // Default statuses
        return {
            pending: 'Pending',
            under_review: 'Under Review',
            resolved: 'Resolved',
            dismissed: 'Dismissed'
        };
    }, [rawStatuses]);

    const safePriorities = useMemo(() => {
        if (rawPriorities && typeof rawPriorities === 'object' && Object.keys(rawPriorities).length > 0) {
            return rawPriorities;
        }
        // Default priorities
        return {
            low: 'Low',
            medium: 'Medium',
            high: 'High'
        };
    }, [rawPriorities]);

    const safeTypes = useMemo(() => {
        return Array.isArray(rawTypes) ? rawTypes : [];
    }, [rawTypes]);

    const safePuroks = useMemo(() => {
        return Array.isArray(rawPuroks) ? rawPuroks : [];
    }, [rawPuroks]);

    const safeStats = useMemo(() => ({
        total: rawStats?.total || safeComplaints.total || 0,
        pending: rawStats?.pending || 0,
        under_review: rawStats?.under_review || 0,
        resolved: rawStats?.resolved || 0,
        dismissed: rawStats?.dismissed || 0,
        high_priority: rawStats?.high_priority || 0,
        medium_priority: rawStats?.medium_priority || 0,
        low_priority: rawStats?.low_priority || 0,
        today: rawStats?.today || 0,
        anonymous: rawStats?.anonymous || 0,
    }), [rawStats, safeComplaints.total]);
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [purokFilter, setPurokFilter] = useState(filters.purok || 'all');
    const [fromDateFilter, setFromDateFilter] = useState(filters.from_date || '');
    const [toDateFilter, setToDateFilter] = useState(filters.to_date || '');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Bulk selection states
    const [selectedComplaints, setSelectedComplaints] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
            if (selectionRef.current && !selectionRef.current.contains(event.target as Node)) {
                setShowSelectionOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedComplaints.length > 0) {
                        setSelectedComplaints([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
                if (showBulkActions) setShowBulkActions(false);
                if (showSelectionOptions) setShowSelectionOptions(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Delete' && isBulkMode && selectedComplaints.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedComplaints, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedComplaints([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter complaints client-side
    const filteredComplaints = useMemo(() => {
        let result = [...safeComplaints.data];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(complaint => 
                complaint.complaint_number?.toLowerCase().includes(searchLower) ||
                complaint.subject?.toLowerCase().includes(searchLower) ||
                complaint.description?.toLowerCase().includes(searchLower) ||
                complaint.location?.toLowerCase().includes(searchLower) ||
                complaint.type?.toLowerCase().includes(searchLower) ||
                (!complaint.is_anonymous && complaint.user?.name?.toLowerCase().includes(searchLower)) ||
                (!complaint.is_anonymous && complaint.user?.email?.toLowerCase().includes(searchLower)) ||
                (!complaint.is_anonymous && complaint.user?.phone?.includes(search))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(complaint => complaint.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            result = result.filter(complaint => complaint.priority === priorityFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            result = result.filter(complaint => complaint.type === typeFilter);
        }

        // Purok filter
        if (purokFilter !== 'all') {
            result = result.filter(complaint => !complaint.is_anonymous && complaint.user?.purok === purokFilter);
        }

        // Date range filter
        if (fromDateFilter) {
            try {
                const fromDate = new Date(fromDateFilter);
                result = result.filter(complaint => {
                    try {
                        return new Date(complaint.incident_date) >= fromDate;
                    } catch {
                        return false;
                    }
                });
            } catch {}
        }

        if (toDateFilter) {
            try {
                const toDate = new Date(toDateFilter);
                result = result.filter(complaint => {
                    try {
                        return new Date(complaint.incident_date) <= toDate;
                    } catch {
                        return false;
                    }
                });
            } catch {}
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            try {
                switch (sortBy) {
                    case 'complaint_number':
                        aValue = a.complaint_number?.toLowerCase() || '';
                        bValue = b.complaint_number?.toLowerCase() || '';
                        break;
                    case 'subject':
                        aValue = a.subject?.toLowerCase() || '';
                        bValue = b.subject?.toLowerCase() || '';
                        break;
                    case 'incident_date':
                        aValue = new Date(a.incident_date).getTime();
                        bValue = new Date(b.incident_date).getTime();
                        break;
                    case 'created_at':
                        aValue = new Date(a.created_at).getTime();
                        bValue = new Date(b.created_at).getTime();
                        break;
                    case 'status':
                        aValue = a.status || '';
                        bValue = b.status || '';
                        break;
                    case 'priority':
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        aValue = priorityOrder[a.priority] || 0;
                        bValue = priorityOrder[b.priority] || 0;
                        break;
                    default:
                        aValue = new Date(a.created_at).getTime();
                        bValue = new Date(b.created_at).getTime();
                }
            } catch {
                aValue = 0;
                bValue = 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [safeComplaints.data, search, statusFilter, priorityFilter, typeFilter, purokFilter, fromDateFilter, toDateFilter, sortBy, sortOrder]);

    // Calculate pagination
    const totalItems = filteredComplaints.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, priorityFilter, typeFilter, purokFilter, fromDateFilter, toDateFilter, sortBy, sortOrder]);

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedComplaints.map(complaint => complaint.id);
        if (isSelectAll) {
            setSelectedComplaints(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedComplaints, ...pageIds])];
            setSelectedComplaints(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items
    const handleSelectAllFiltered = () => {
        const allIds = filteredComplaints.map(complaint => complaint.id);
        if (selectedComplaints.length === allIds.length && allIds.every(id => selectedComplaints.includes(id))) {
            setSelectedComplaints(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedComplaints, ...allIds])];
            setSelectedComplaints(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${safeComplaints.total} complaints. This action may take a moment.`)) {
            const pageIds = paginatedComplaints.map(complaint => complaint.id);
            setSelectedComplaints(pageIds);
            setSelectionMode('all');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedComplaints(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedComplaints.map(complaint => complaint.id);
        const allSelected = allPageIds.every(id => selectedComplaints.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedComplaints, paginatedComplaints]);

    // Get selected complaints data
    const selectedComplaintsData = useMemo(() => {
        return filteredComplaints.filter(complaint => selectedComplaints.includes(complaint.id));
    }, [selectedComplaints, filteredComplaints]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedComplaintsData;
        const evidenceCount = selectedData.filter(complaint => complaint.evidence_files && complaint.evidence_files.length > 0).length;
        
        return {
            total: selectedData.length,
            pending: selectedData.filter(c => c.status === 'pending').length,
            under_review: selectedData.filter(c => c.status === 'under_review').length,
            resolved: selectedData.filter(c => c.status === 'resolved').length,
            dismissed: selectedData.filter(c => c.status === 'dismissed').length,
            high_priority: selectedData.filter(c => c.priority === 'high').length,
            medium_priority: selectedData.filter(c => c.priority === 'medium').length,
            low_priority: selectedData.filter(c => c.priority === 'low').length,
            anonymous: selectedData.filter(c => c.is_anonymous).length,
            withEvidence: evidenceCount,
            assigned: selectedData.filter(c => c.assigned_to).length,
        };
    }, [selectedComplaintsData]);

    // Enhanced bulk operation handler
    const handleBulkOperation = async (operation: string) => {
        if (selectedComplaints.length === 0) {
            alert('Please select at least one complaint');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                    const exportData = selectedComplaintsData.map(complaint => ({
                        'Complaint ID': complaint.complaint_number || 'N/A',
                        'Subject': complaint.subject || 'N/A',
                        'Type': complaint.type || 'N/A',
                        'Location': complaint.location || 'N/A',
                        'Incident Date': formatDate(complaint.incident_date),
                        'Priority': safePriorities[complaint.priority] || complaint.priority || 'N/A',
                        'Status': safeStatuses[complaint.status] || complaint.status || 'N/A',
                        'Anonymous': complaint.is_anonymous ? 'Yes' : 'No',
                        'Resident Name': complaint.is_anonymous ? 'Anonymous' : complaint.user?.name || 'N/A',
                        'Purok': complaint.is_anonymous ? 'N/A' : complaint.user?.purok || 'N/A',
                    }));
                    
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') 
                                    ? `"${value}"` 
                                    : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedComplaints.length} selected complaint(s)? This action cannot be undone.`)) {
                        await router.post('/admin/complaints/bulk-action', {
                            action: 'delete',
                            complaint_ids: selectedComplaints,
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedComplaints([]);
                                setShowBulkDeleteDialog(false);
                            },
                        });
                    }
                    break;

                case 'update_status':
                    const newStatus = prompt('Enter new status (pending, under_review, resolved, dismissed):');
                    if (newStatus && ['pending', 'under_review', 'resolved', 'dismissed'].includes(newStatus)) {
                        await router.post('/admin/complaints/bulk-action', {
                            action: 'update_status',
                            complaint_ids: selectedComplaints,
                            status: newStatus
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedComplaints([]);
                            },
                        });
                    }
                    break;

                default:
                    alert('Operation not supported yet');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedComplaintsData.length === 0) {
            alert('No data to copy');
            return;
        }
        
        const data = selectedComplaintsData.map(complaint => ({
            'Complaint ID': complaint.complaint_number || 'N/A',
            'Subject': complaint.subject || 'N/A',
            'Type': complaint.type || 'N/A',
            'Status': safeStatuses[complaint.status] || complaint.status || 'N/A',
            'Priority': safePriorities[complaint.priority] || complaint.priority || 'N/A',
            'Incident Date': formatDate(complaint.incident_date),
            'Resident': complaint.is_anonymous ? 'Anonymous' : complaint.user?.name || 'N/A',
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    };

    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setTypeFilter('all');
        setPurokFilter('all');
        setFromDateFilter('');
        setToDateFilter('');
        setSortBy('created_at');
        setSortOrder('desc');
    };

    const handleDelete = (complaint: Complaint) => {
        if (confirm(`Are you sure you want to delete complaint ${complaint.complaint_number}? This action cannot be undone.`)) {
            router.delete(route('admin.complaints.destroy', complaint.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedComplaints(selectedComplaints.filter(id => id !== complaint.id));
                },
            });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'default';
            case 'under_review': return 'outline';
            case 'pending': return 'secondary';
            case 'dismissed': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'under_review': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'pending': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'dismissed': return <Archive className="h-4 w-4 text-gray-500" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'destructive';
            case 'medium': return 'outline';
            case 'low': return 'secondary';
            default: return 'outline';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'medium': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'low': return <Clock className="h-4 w-4 text-green-500" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = 
        search || 
        statusFilter !== 'all' || 
        priorityFilter !== 'all' || 
        typeFilter !== 'all' ||
        purokFilter !== 'all' ||
        fromDateFilter ||
        toDateFilter;

    return (
        <AppLayout
            title="Complaints Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Complaints', href: '/admin/complaints' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                                <div>
                                    <p className="text-green-800 font-medium">Success</p>
                                    <p className="text-green-700 text-sm mt-1">{flash.success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                                <div>
                                    <p className="text-red-800 font-medium">Error</p>
                                    <p className="text-red-700 text-sm mt-1">{flash.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Debug Banner - Shows data mismatch */}
                    {safeStats.total > 0 && safeComplaints.data.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <h3 className="font-medium text-yellow-800">Data Loading Issue</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Statistics show {safeStats.total} complaints, but no complaint data was loaded. 
                                        This might be a backend data format issue.
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.location.reload()}
                                            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                                        >
                                            <RefreshCw className="h-3 w-3 mr-2" />
                                            Refresh Page
                                        </Button>
                                       
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Complaints Management</h1>
                            <p className="text-gray-600 mt-2">
                                Manage and track resident complaints and concerns
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsBulkMode(!isBulkMode)}
                                className={`${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                            >
                                {isBulkMode ? (
                                    <>
                                        <Layers className="h-4 w-4 mr-2" />
                                        Bulk Mode
                                    </>
                                ) : (
                                    <>
                                        <Layers className="h-4 w-4 mr-2" />
                                        Select
                                    </>
                                )}
                            </Button>
                           
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{safeStats.total}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-blue-100">
                                        <MessageSquare className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-500">
                                    <span className="inline-flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {safeStats.today} today
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-amber-600 mt-2">{safeStats.pending}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-amber-100">
                                        <AlertCircle className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-500">
                                    <span className="inline-flex items-center">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {safeStats.high_priority} high priority
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Resolved</p>
                                        <p className="text-2xl font-bold text-green-600 mt-2">{safeStats.resolved}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-green-100">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-500">
                                    <span className="inline-flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {safeStats.resolved} cases
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Anonymous</p>
                                        <p className="text-2xl font-bold text-gray-600 mt-2">{safeStats.anonymous}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-gray-100">
                                        <User className="h-6 w-6 text-gray-600" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-500">
                                    <span className="inline-flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        Protected identity
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filters */}
                    <Card className="border shadow-sm">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {/* Search Bar */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            ref={searchInputRef}
                                            placeholder="Search complaints..."
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        {search && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => setSearch('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filters
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => {
                                                const exportUrl = new URL('/admin/complaints/export', window.location.origin);
                                                if (search) exportUrl.searchParams.append('search', search);
                                                if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                                if (priorityFilter !== 'all') exportUrl.searchParams.append('priority', priorityFilter);
                                                window.open(exportUrl.toString(), '_blank');
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                </div>

                                {/* Active Filters Info */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {safeComplaints.data.length > 0 ? `${startIndex + 1} to ${Math.min(endIndex, totalItems)} of ${totalItems}` : '0'} complaints
                                        {search && ` matching "${search}"`}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <X className="h-3.5 w-3.5 mr-1" />
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Filters */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            className="w-full border rounded-md px-3 py-2 text-sm"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            {Object.entries(safeStatuses).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                        <select
                                            className="w-full border rounded-md px-3 py-2 text-sm"
                                            value={priorityFilter}
                                            onChange={(e) => setPriorityFilter(e.target.value)}
                                        >
                                            <option value="all">All Priorities</option>
                                            {Object.entries(safePriorities).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                        <select
                                            className="w-full border rounded-md px-3 py-2 text-sm"
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="all">All Types</option>
                                            {safeTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 border rounded-md px-3 py-2 text-sm"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                            >
                                                <option value="created_at">Date Added</option>
                                                <option value="complaint_number">Complaint ID</option>
                                                <option value="subject">Subject</option>
                                                <option value="incident_date">Incident Date</option>
                                                <option value="priority">Priority</option>
                                                <option value="status">Status</option>
                                            </select>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="px-3"
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            >
                                                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <div className="border-t pt-6 space-y-4">
                                        <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="From Date"
                                                        type="date"
                                                        value={fromDateFilter}
                                                        onChange={(e) => setFromDateFilter(e.target.value)}
                                                    />
                                                    <Input
                                                        placeholder="To Date"
                                                        type="date"
                                                        value={toDateFilter}
                                                        onChange={(e) => setToDateFilter(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Purok</label>
                                                <select
                                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                                    value={purokFilter}
                                                    onChange={(e) => setPurokFilter(e.target.value)}
                                                >
                                                    <option value="all">All Puroks</option>
                                                    {safePuroks.map((purok) => (
                                                        <option key={purok} value={purok}>
                                                            {purok}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Actions</label>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => {
                                                            setStatusFilter('pending');
                                                            setPriorityFilter('high');
                                                        }}
                                                    >
                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                        Urgent Cases
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => {
                                                            const today = new Date();
                                                            const twoDaysAgo = new Date(today);
                                                            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                                                            setFromDateFilter(twoDaysAgo.toISOString().split('T')[0]);
                                                            setToDateFilter(today.toISOString().split('T')[0]);
                                                        }}
                                                    >
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Last 2 Days
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bulk Actions Bar */}
                    {isBulkMode && selectedComplaints.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-sm">
                                            {selectedComplaints.length} selected
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedComplaints([])}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <PackageX className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkOperation('export')}
                                        disabled={isPerformingBulkAction}
                                    >
                                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkOperation('update_status')}
                                        disabled={isPerformingBulkAction}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Update Status
                                    </Button>
                                    
                                    <Button
                                        onClick={() => setShowBulkActions(!showBulkActions)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={isPerformingBulkAction}
                                    >
                                        {isPerformingBulkAction ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Layers className="h-4 w-4 mr-2" />
                                                More Actions
                                            </>
                                        )}
                                    </Button>
                                    
                                    {showBulkActions && (
                                        <div className="absolute right-0 mt-2 z-50 w-48 bg-white border rounded-md shadow-lg">
                                            <div className="p-2">
                                                <div className="text-xs font-medium text-gray-500 px-2 py-1">
                                                    BULK ACTIONS
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm"
                                                    onClick={() => handleBulkOperation('update_status')}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Update Status
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setShowBulkDeleteDialog(true)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Selected
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsBulkMode(false)}
                                        disabled={isPerformingBulkAction}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Exit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complaints Table */}
                    <Card className="border shadow-sm">
                        <CardHeader className="border-b bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                        Complaints List
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        {selectedComplaints.length > 0 && isBulkMode ? (
                                            <span className="text-blue-600">
                                                {selectedComplaints.length} complaints selected
                                            </span>
                                        ) : (
                                            `Showing ${safeComplaints.data.length} of ${safeStats.total} total complaints`
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={isBulkMode}
                                            onCheckedChange={setIsBulkMode}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                        <Label className="text-sm font-medium text-gray-700">
                                            Bulk Mode
                                        </Label>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            {isBulkMode && (
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={isSelectAll && paginatedComplaints.length > 0}
                                                        onCheckedChange={handleSelectAllOnPage}
                                                    />
                                                </TableHead>
                                            )}
                                            <TableHead className="font-semibold text-gray-700">
                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('complaint_number')}>
                                                    Complaint ID
                                                    {getSortIcon('complaint_number')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">Subject & Details</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Priority & Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Timeline</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Resident Info</TableHead>
                                            <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {safeComplaints.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={isBulkMode ? 8 : 7} className="text-center py-12">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <MessageSquare className="h-12 w-12 text-gray-300" />
                                                        <div>
                                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                                No complaints found
                                                            </h3>
                                                            <p className="text-gray-500 mb-4">
                                                                {safeStats.total > 0 
                                                                    ? `Statistics show ${safeStats.total} complaints exist, but data couldn't be loaded. Check the console for details.`
                                                                    : 'No complaints have been submitted yet.'}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => window.location.reload()}
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Refresh
                                                            </Button>
                                                         
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : paginatedComplaints.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={isBulkMode ? 8 : 7} className="text-center py-12">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <Filter className="h-12 w-12 text-gray-300" />
                                                        <div>
                                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                                No matching complaints
                                                            </h3>
                                                            <p className="text-gray-500">
                                                                Try adjusting your search or filters
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleClearFilters}
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Clear All Filters
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedComplaints.map((complaint) => {
                                                const isSelected = selectedComplaints.includes(complaint.id);
                                                const hasEvidence = complaint.evidence_files && complaint.evidence_files.length > 0;
                                                
                                                return (
                                                    <TableRow 
                                                        key={complaint.id} 
                                                        className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                                    >
                                                        {isBulkMode && (
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onCheckedChange={() => handleItemSelect(complaint.id)}
                                                                />
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="font-medium">
                                                            <div className="space-y-1">
                                                                <div className="font-mono text-sm text-blue-600">
                                                                    {complaint.complaint_number}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {complaint.type}
                                                                </div>
                                                                {hasEvidence && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <FileText className="h-3 w-3 mr-1" />
                                                                        Evidence
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-2">
                                                                <div className="font-medium">
                                                                    {truncateText(complaint.subject, 40)}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <MapPin className="h-3.5 w-3.5" />
                                                                    {truncateText(complaint.location, 30)}
                                                                </div>
                                                                {complaint.assigned_to && (
                                                                    <div className="text-xs text-blue-600">
                                                                        Assigned: {complaint.assigned_to.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-2">
                                                                <Badge 
                                                                    variant={getPriorityBadgeVariant(complaint.priority)} 
                                                                    className="flex items-center gap-1 w-fit"
                                                                >
                                                                    {getPriorityIcon(complaint.priority)}
                                                                    {/* SAFE ACCESS: Using safePriorities */}
                                                                    {safePriorities[complaint.priority] || complaint.priority || 'N/A'}
                                                                </Badge>
                                                                <Badge 
                                                                    variant={getStatusBadgeVariant(complaint.status)} 
                                                                    className="flex items-center gap-1 w-fit"
                                                                >
                                                                    {getStatusIcon(complaint.status)}
                                                                    {/* SAFE ACCESS: Using safeStatuses */}
                                                                    {safeStatuses[complaint.status] || complaint.status || 'N/A'}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">Incident:</span>{' '}
                                                                    <span className="font-medium">{formatDate(complaint.incident_date)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Reported:</span>{' '}
                                                                    <span className="font-medium">{getTimeAgo(complaint.created_at)}</span>
                                                                </div>
                                                                {complaint.resolved_at && (
                                                                    <div className="text-xs text-green-600">
                                                                        Resolved: {formatDateTime(complaint.resolved_at)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-2">
                                                                {complaint.is_anonymous ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="h-4 w-4 text-gray-400" />
                                                                        <span className="font-medium text-gray-600">
                                                                            Anonymous Resident
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-1">
                                                                        <div className="font-medium">
                                                                            {complaint.user?.name || 'Unknown Resident'}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 space-y-1">
                                                                            {complaint.user?.phone && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Phone className="h-3 w-3" />
                                                                                    {complaint.user.phone}
                                                                                </div>
                                                                            )}
                                                                            {complaint.user?.purok && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Home className="h-3 w-3" />
                                                                                    Purok {complaint.user.purok}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={route('admin.complaints.show', complaint.id)}>
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            View Details
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDelete(complaint)}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
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

                            {/* Pagination */}
                            {safeComplaints.data.length > 0 && totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-6 py-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} complaints
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-2">
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
                                                        className="min-w-[40px]"
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
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => router.visit('/admin/complaints/reports')}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <Printer className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Generate Reports</h3>
                                        <p className="text-sm text-gray-500">Create summary reports</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:border-green-300 transition-colors" onClick={() => router.visit('/admin/complaints/analytics')}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">View Analytics</h3>
                                        <p className="text-sm text-gray-500">Track trends and insights</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:border-amber-300 transition-colors" onClick={() => {
                            setStatusFilter('pending');
                            setPriorityFilter('high');
                        }}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-100">
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Urgent Cases</h3>
                                        <p className="text-sm text-gray-500">{selectionStats.high_priority} high priority</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:border-purple-300 transition-colors" onClick={() => router.visit('/admin/complaints/settings')}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-100">
                                        <Settings className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Settings</h3>
                                        <p className="text-sm text-gray-500">Configure system</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TooltipProvider>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Complaints</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedComplaints.length} selected complaints?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}