import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { format, parseISO, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    Calendar,
    Bell,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Megaphone,
    MoreVertical,
    ChevronRight,
    ChevronLeft,
    Hash,
    Printer,
    Copy,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    CheckSquare,
    Square,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    Mail,
    Loader2,
    FilterX,
    RotateCcw,
    KeyRound,
    Clock4,
    EyeOff,
    PlayCircle,
    PauseCircle,
    CopyCheck,
    Grid3X3,
    List,
    Tags,
    Shield,
    Zap,
    RefreshCw,
    Info,
    ExternalLink,
    BarChart3,
    CalendarDays,
    Target,
    TrendingUp,
    AlertTriangle,
    FileText,
    Send,
    Archive,
    Globe,
    Building,
    Users,
    Wrench,
    Tag
} from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: string;
    type_label: string;
    priority: number;
    priority_label: string;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    is_currently_active: boolean;
    days_remaining: number | null;
}

interface PaginationData {
    current_page: number;
    data: Announcement[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface Filters {
    search?: string;
    type?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
}

interface Stats {
    total: number;
    active: number;
    expired: number;
    upcoming: number;
}

type BulkOperation = 'delete' | 'activate' | 'deactivate' | 'publish' | 'archive' | 'export' | 'print';
type SelectionMode = 'page' | 'filtered' | 'all';

declare module '@inertiajs/react' {
    interface PageProps {
        announcements: PaginationData;
        filters: Filters;
        types: Record<string, string>;
        priorities: Record<string, string>;
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

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    return format(parseISO(dateString), 'MMM dd, yyyy');
};

const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'important': return <AlertCircle className="h-4 w-4" />;
        case 'event': return <CalendarDays className="h-4 w-4" />;
        case 'maintenance': return <Wrench className="h-4 w-4" />;
        case 'other': return <Tag className="h-4 w-4" />;
        default: return <Megaphone className="h-4 w-4" />;
    }
};

const getTypeColor = (type: string): string => {
    switch (type) {
        case 'important': return 'bg-red-100 text-red-800 border-red-200';
        case 'event': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-green-100 text-green-800 border-green-200';
    }
};

const getPriorityIcon = (priority: number) => {
    switch (priority) {
        case 4: return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 3: return <Zap className="h-4 w-4 text-orange-500" />;
        case 2: return <Star className="h-4 w-4 text-yellow-500" />;
        case 1: return <Bell className="h-4 w-4 text-blue-500" />;
        default: return <Info className="h-4 w-4 text-gray-500" />;
    }
};

const getPriorityColor = (priority: number): string => {
    switch (priority) {
        case 4: return 'bg-red-50 text-red-700 border-red-200';
        case 3: return 'bg-orange-50 text-orange-700 border-orange-200';
        case 2: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 1: return 'bg-blue-50 text-blue-700 border-blue-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const getStatusBadgeVariant = (isActive: boolean, isCurrentlyActive: boolean) => {
    if (!isActive) return 'secondary';
    if (isCurrentlyActive) return 'default';
    return 'outline';
};

const getStatusIcon = (isActive: boolean, isCurrentlyActive: boolean) => {
    if (!isActive) return <XCircle className="h-4 w-4 text-gray-500" />;
    if (isCurrentlyActive) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
};

export default function AnnouncementsIndex({
    announcements,
    filters,
    types,
    priorities,
    stats
}: {
    announcements: PaginationData;
    filters: Filters;
    types: Record<string, string>;
    priorities: Record<string, string>;
    stats: Stats;
}) {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [fromDateFilter, setFromDateFilter] = useState(filters.from_date || '');
    const [toDateFilter, setToDateFilter] = useState(filters.to_date || '');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedAnnouncements, setSelectedAnnouncements] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            // Ctrl/Cmd + A to select all on current page
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape to exit bulk mode or clear selection
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedAnnouncements.length > 0) {
                        setSelectedAnnouncements([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
                if (showBulkActions) setShowBulkActions(false);
                if (showSelectionOptions) setShowSelectionOptions(false);
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Delete key to open delete dialog
            if (e.key === 'Delete' && isBulkMode && selectedAnnouncements.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedAnnouncements, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedAnnouncements([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Filter announcements client-side
    const filteredAnnouncements = useMemo(() => {
        let result = [...announcements.data];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(announcement => 
                announcement.title.toLowerCase().includes(searchLower) ||
                announcement.content.toLowerCase().includes(searchLower)
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            result = result.filter(announcement => announcement.type === typeFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            switch (statusFilter) {
                case 'active':
                    result = result.filter(announcement => announcement.is_active);
                    break;
                case 'inactive':
                    result = result.filter(announcement => !announcement.is_active);
                    break;
                case 'currently_active':
                    result = result.filter(announcement => announcement.is_currently_active);
                    break;
                case 'expired':
                    result = result.filter(announcement => 
                        announcement.end_date && 
                        isBefore(parseISO(announcement.end_date), new Date())
                    );
                    break;
                case 'upcoming':
                    result = result.filter(announcement => 
                        announcement.start_date && 
                        isAfter(parseISO(announcement.start_date), new Date())
                    );
                    break;
            }
        }

        // Date range filter
        if (fromDateFilter) {
            const fromDate = new Date(fromDateFilter);
            result = result.filter(announcement => {
                const createdDate = parseISO(announcement.created_at);
                return createdDate >= fromDate;
            });
        }

        if (toDateFilter) {
            const toDate = new Date(toDateFilter);
            result = result.filter(announcement => {
                const createdDate = parseISO(announcement.created_at);
                return createdDate <= toDate;
            });
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                case 'priority':
                    aValue = a.priority;
                    bValue = b.priority;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'start_date':
                    aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
                    bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
                    break;
                default:
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [announcements.data, search, typeFilter, statusFilter, fromDateFilter, toDateFilter, sortBy, sortOrder]);

    // Calculate pagination
    const totalItems = filteredAnnouncements.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, statusFilter, fromDateFilter, toDateFilter, sortBy, sortOrder]);

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedAnnouncements.map(announcement => announcement.id);
        if (isSelectAll) {
            setSelectedAnnouncements(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedAnnouncements, ...pageIds])];
            setSelectedAnnouncements(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items
    const handleSelectAllFiltered = () => {
        const allIds = filteredAnnouncements.map(announcement => announcement.id);
        if (selectedAnnouncements.length === allIds.length && allIds.every(id => selectedAnnouncements.includes(id))) {
            setSelectedAnnouncements(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedAnnouncements, ...allIds])];
            setSelectedAnnouncements(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${announcements.total} announcements. This action may take a moment.`)) {
            const pageIds = paginatedAnnouncements.map(announcement => announcement.id);
            setSelectedAnnouncements(pageIds);
            setSelectionMode('all');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedAnnouncements(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedAnnouncements.map(announcement => announcement.id);
        const allSelected = allPageIds.every(id => selectedAnnouncements.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedAnnouncements, paginatedAnnouncements]);

    // Get selected announcements data
    const selectedAnnouncementsData = useMemo(() => {
        return filteredAnnouncements.filter(announcement => selectedAnnouncements.includes(announcement.id));
    }, [selectedAnnouncements, filteredAnnouncements]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedAnnouncementsData;
        
        const activeCount = selectedData.filter(a => a.is_active).length;
        const currentlyActiveCount = selectedData.filter(a => a.is_currently_active).length;
        const expiredCount = selectedData.filter(a => 
            a.end_date && isBefore(parseISO(a.end_date), new Date())
        ).length;
        const highPriorityCount = selectedData.filter(a => a.priority >= 3).length;
        
        return {
            total: selectedData.length,
            activeCount,
            currentlyActiveCount,
            expiredCount,
            highPriorityCount,
            importantCount: selectedData.filter(a => a.type === 'important').length,
            eventCount: selectedData.filter(a => a.type === 'event').length,
            maintenanceCount: selectedData.filter(a => a.type === 'maintenance').length,
            generalCount: selectedData.filter(a => a.type === 'general').length,
        };
    }, [selectedAnnouncementsData]);

    // Enhanced bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation) => {
        if (selectedAnnouncements.length === 0) {
            alert('Please select at least one announcement');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedAnnouncements.length} selected announcement(s)? This action cannot be undone.`)) {
                        await router.post(route('announcements.bulk-action'), {
                            action: 'delete',
                            announcement_ids: selectedAnnouncements,
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedAnnouncements([]);
                                setShowBulkDeleteDialog(false);
                            },
                        });
                    }
                    break;

                case 'activate':
                    await router.post(route('announcements.bulk-action'), {
                        action: 'activate',
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                        },
                    });
                    break;

                case 'deactivate':
                    await router.post(route('announcements.bulk-action'), {
                        action: 'deactivate',
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                        },
                    });
                    break;

                case 'publish':
                    await router.post(route('announcements.bulk-action'), {
                        action: 'publish',
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                        },
                    });
                    break;

                case 'archive':
                    await router.post(route('announcements.bulk-action'), {
                        action: 'archive',
                        announcement_ids: selectedAnnouncements,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedAnnouncements([]);
                        },
                    });
                    break;

                case 'export':
                    const exportData = selectedAnnouncementsData.map(announcement => ({
                        'Title': announcement.title,
                        'Type': announcement.type_label,
                        'Priority': announcement.priority_label,
                        'Status': announcement.is_active ? 'Active' : 'Inactive',
                        'Start Date': announcement.start_date ? formatDate(announcement.start_date) : 'Immediate',
                        'End Date': announcement.end_date ? formatDate(announcement.end_date) : 'No end date',
                        'Created At': formatDateTime(announcement.created_at),
                        'Currently Active': announcement.is_currently_active ? 'Yes' : 'No',
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
                    a.download = `announcements-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    break;

                case 'print':
                    // Implement print functionality
                    alert('Print functionality to be implemented');
                    break;

                default:
                    alert('Operation not supported yet');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            alert('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedAnnouncementsData.length === 0) {
            alert('No data to copy');
            return;
        }
        
        const data = selectedAnnouncementsData.map(announcement => ({
            'Title': announcement.title,
            'Type': announcement.type_label,
            'Priority': announcement.priority_label,
            'Status': announcement.is_active ? 'Active' : 'Inactive',
            'Created': formatDate(announcement.created_at),
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
        setTypeFilter('all');
        setStatusFilter('all');
        setFromDateFilter('');
        setToDateFilter('');
        setSortBy('created_at');
        setSortOrder('desc');
    };

    const handleDelete = (announcement: Announcement) => {
        if (confirm(`Are you sure you want to delete announcement "${announcement.title}"? This action cannot be undone.`)) {
            router.delete(route('announcements.destroy', announcement.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedAnnouncements(selectedAnnouncements.filter(id => id !== announcement.id));
                },
            });
        }
    };

    const handleToggleStatus = (announcement: Announcement) => {
        router.post(route('announcements.toggle-status', announcement.id), {}, {
            preserveScroll: true,
        });
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Could add toast here
        });
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = 
        search || 
        typeFilter !== 'all' || 
        statusFilter !== 'all' ||
        fromDateFilter ||
        toDateFilter;

    // Get responsive truncation length
    const getTruncationLength = (): number => {
        if (typeof window === 'undefined') return 50;
        
        const width = window.innerWidth;
        if (width < 640) return 25;
        if (width < 768) return 35;
        if (width < 1024) return 45;
        return 50;
    };

    return (
        <AppLayout
            title="Announcements Management"
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Announcements', href: route('announcements.index') }
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

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Announcements Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage and publish barangay announcements and notices
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsBulkMode(!isBulkMode)}
                                        className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                                    >
                                        {isBulkMode ? (
                                            <>
                                                <List className="h-4 w-4 mr-2" />
                                                Bulk Mode
                                            </>
                                        ) : (
                                            <>
                                                <Target className="h-4 w-4 mr-2" />
                                                Bulk Select
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                                    <p className="text-xs text-gray-500">Select multiple announcements for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Link href={route('announcements.create')}>
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">New Announcement</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Bell className="h-4 w-4" />
                                    Total Announcements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.active} active • {stats.upcoming} upcoming
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Currently Active
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Displayed to residents
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Upcoming
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Scheduled for future
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Archive className="h-4 w-4" />
                                    Expired
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.expired}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Past end date
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
                                            ref={searchInputRef}
                                            placeholder="Search announcements by title or content... (Ctrl+F)"
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
                                            onClick={() => handleBulkOperation('export')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Active filters indicator and clear button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} announcements
                                        {search && ` matching "${search}"`}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="text-red-600 hover:text-red-700 h-8"
                                            >
                                                <FilterX className="h-3.5 w-3.5 mr-1" />
                                                Clear Filters
                                            </Button>
                                        )}
                                        {isBulkMode && (
                                            <div className="flex items-center gap-2" ref={selectionRef}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                                    className="h-8"
                                                >
                                                    <List className="h-3.5 w-3.5 mr-1" />
                                                    Select
                                                </Button>
                                                {showSelectionOptions && (
                                                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                        <div className="p-2">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                                SELECTION OPTIONS
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllOnPage}
                                                            >
                                                                <FileText className="h-3.5 w-3.5 mr-2" />
                                                                Current Page ({paginatedAnnouncements.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({filteredAnnouncements.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({announcements.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedAnnouncements([])}
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                                Clear Selection
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Filters */}
                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Type:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="all">All Types</option>
                                            {Object.entries(types).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
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
                                            <option value="currently_active">Currently Active</option>
                                            <option value="expired">Expired</option>
                                            <option value="upcoming">Upcoming</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="created_at">Date Created</option>
                                            <option value="title">Title</option>
                                            <option value="type">Type</option>
                                            <option value="priority">Priority</option>
                                            <option value="start_date">Start Date</option>
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Date Range */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Date Range</label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="From Date"
                                                        type="date"
                                                        className="w-full"
                                                        value={fromDateFilter}
                                                        onChange={(e) => setFromDateFilter(e.target.value)}
                                                    />
                                                    <span className="self-center text-sm">to</span>
                                                    <Input
                                                        placeholder="To Date"
                                                        type="date"
                                                        className="w-full"
                                                        value={toDateFilter}
                                                        onChange={(e) => setToDateFilter(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Priority Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Priority Level</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(priorities).map(([value, label]) => (
                                                        <Button
                                                            key={value}
                                                            variant="outline"
                                                            size="sm"
                                                            className={`h-8 ${sortBy === 'priority' && sortOrder === 'desc' ? 'bg-blue-50' : ''}`}
                                                            onClick={() => {
                                                                setSortBy('priority');
                                                                setSortOrder('desc');
                                                            }}
                                                        >
                                                            {label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${statusFilter === 'currently_active' ? 'bg-green-50 text-green-700' : ''}`}
                                                        onClick={() => setStatusFilter('currently_active')}
                                                    >
                                                        Active Now
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${statusFilter === 'expired' ? 'bg-gray-50 text-gray-700' : ''}`}
                                                        onClick={() => setStatusFilter('expired')}
                                                    >
                                                        Expired
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() => {
                                                            const today = new Date();
                                                            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                            setFromDateFilter(firstDay.toISOString().split('T')[0]);
                                                            setToDateFilter(today.toISOString().split('T')[0]);
                                                        }}
                                                    >
                                                        This Month
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Bulk Actions Bar */}
                    {isBulkMode && selectedAnnouncements.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedAnnouncements.length} selected
                                        </span>
                                        <Badge variant="outline" className="ml-1 h-5 text-xs">
                                            {selectionMode === 'page' ? 'Page' : 
                                             selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedAnnouncements([]);
                                                setIsSelectAll(false);
                                            }}
                                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <PackageX className="h-3.5 w-3.5 mr-1" />
                                            Clear
                                        </Button>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCopySelectedData}
                                                    className="h-7"
                                                >
                                                    <ClipboardCopy className="h-3.5 w-3.5" />
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Copy selected data as CSV
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('activate')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <PlayCircle className="h-3.5 w-3.5 mr-1" />
                                                    Activate
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Activate selected announcements
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('deactivate')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <PauseCircle className="h-3.5 w-3.5 mr-1" />
                                                    Deactivate
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Deactivate selected announcements
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('publish')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Send className="h-3.5 w-3.5 mr-1" />
                                                    Publish Now
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Publish selected announcements immediately
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    
                                    <div className="relative">
                                        <Button
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={isPerformingBulkAction}
                                        >
                                            {isPerformingBulkAction ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <MoreVertical className="h-3.5 w-3.5 mr-1" />
                                                    More
                                                </>
                                            )}
                                        </Button>
                                        
                                        {showBulkActions && (
                                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                <div className="p-2">
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                        BULK ACTIONS
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('archive')}
                                                    >
                                                        <Archive className="h-3.5 w-3.5 mr-2" />
                                                        Archive
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('export')}
                                                    >
                                                        <Download className="h-3.5 w-3.5 mr-2" />
                                                        Export as CSV
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('print')}
                                                    >
                                                        <Printer className="h-3.5 w-3.5 mr-2" />
                                                        Print
                                                    </Button>
                                                    <DropdownMenuSeparator />
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setShowBulkDeleteDialog(true)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        Delete Selected
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => setIsBulkMode(false)}
                                        disabled={isPerformingBulkAction}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Exit
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enhanced stats of selected items */}
                            {selectedAnnouncementsData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} announcements
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.currentlyActiveCount} active now
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                            <span>
                                                {selectionStats.highPriorityCount} high priority
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Archive className="h-3.5 w-3.5 text-gray-500" />
                                            <span>
                                                {selectionStats.expiredCount} expired
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                            <span>{selectionStats.importantCount} important</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="h-3 w-3 text-blue-500" />
                                            <span>{selectionStats.eventCount} events</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Wrench className="h-3 w-3 text-amber-500" />
                                            <span>{selectionStats.maintenanceCount} maintenance</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Megaphone className="h-3 w-3 text-green-500" />
                                            <span>{selectionStats.generalCount} general</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Announcements Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Announcements List
                                    {selectedAnnouncements.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedAnnouncements.length} selected
                                        </span>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('table')}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Table view</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('grid')}
                                            >
                                                <Grid3X3 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Grid view</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={isBulkMode}
                                                    onCheckedChange={setIsBulkMode}
                                                    className="data-[state=checked]:bg-blue-600"
                                                />
                                                <Label htmlFor="bulk-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                                                    Bulk Mode
                                                </Label>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Toggle bulk selection mode</p>
                                            <p className="text-xs text-gray-500">Ctrl+Shift+B • Ctrl+A to select</p>
                                            <p className="text-xs text-gray-500">Esc to exit • Del to delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                
                                <div className="text-sm text-gray-500 hidden sm:block">
                                    Page {currentPage} of {totalPages}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <div className="min-w-full inline-block align-middle">
                                    <div className="overflow-hidden">
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                    {isBulkMode && (
                                                        <TableHead className="px-4 py-3 text-center w-12">
                                                            <div className="flex items-center justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelectAll && paginatedAnnouncements.length > 0}
                                                                    onChange={handleSelectAllOnPage}
                                                                    className="rounded border-gray-300 dark:border-gray-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('title')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Title & Details
                                                            {getSortIcon('title')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('type')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Type
                                                            {getSortIcon('type')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('priority')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Priority
                                                            {getSortIcon('priority')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('start_date')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Date Range
                                                            {getSortIcon('start_date')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                    >
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {paginatedAnnouncements.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 8 : 7} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <Megaphone className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No announcements found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by creating a new announcement.'}
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
                                                                    <Link href={route('announcements.create')}>
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Create New Announcement
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedAnnouncements.map((announcement) => {
                                                        const isSelected = selectedAnnouncements.includes(announcement.id);
                                                        const truncateLength = getTruncationLength();
                                                        const daysRemaining = announcement.days_remaining;
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={announcement.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                } ${!announcement.is_active ? 'opacity-60' : ''}`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(announcement.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() => handleItemSelect(announcement.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="rounded border-gray-300 dark:border-gray-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="space-y-2">
                                                                        <div className="font-medium">
                                                                            <div className="truncate" title={announcement.title}>
                                                                                {truncateText(announcement.title, truncateLength)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 line-clamp-2" title={announcement.content}>
                                                                            {truncateText(announcement.content, truncateLength * 2)}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            Created: {formatDateTime(announcement.created_at)}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className={`flex items-center gap-1 ${getTypeColor(announcement.type)}`}
                                                                    >
                                                                        {getTypeIcon(announcement.type)}
                                                                        <span className="truncate max-w-[80px]">
                                                                            {announcement.type_label}
                                                                        </span>
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className={`flex items-center gap-1 ${getPriorityColor(announcement.priority)}`}
                                                                    >
                                                                        {getPriorityIcon(announcement.priority)}
                                                                        <span className="truncate max-w-[80px]">
                                                                            {announcement.priority_label}
                                                                        </span>
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-1 text-sm">
                                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                                            <span>
                                                                                {announcement.start_date 
                                                                                    ? formatDate(announcement.start_date) 
                                                                                    : 'Immediate'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-sm">
                                                                            <Clock className="h-3 w-3 text-gray-400" />
                                                                            <span>
                                                                                {announcement.end_date 
                                                                                    ? formatDate(announcement.end_date) 
                                                                                    : 'No end date'}
                                                                            </span>
                                                                        </div>
                                                                        {daysRemaining !== null && daysRemaining >= 0 && (
                                                                            <div className="text-xs text-gray-500">
                                                                                {daysRemaining > 0 
                                                                                    ? `${daysRemaining} days remaining`
                                                                                    : 'Ends today'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="space-y-2">
                                                                        <Badge 
                                                                            variant={getStatusBadgeVariant(announcement.is_active, announcement.is_currently_active)} 
                                                                            className="flex items-center gap-1"
                                                                        >
                                                                            {getStatusIcon(announcement.is_active, announcement.is_currently_active)}
                                                                            <span>
                                                                                {announcement.is_active 
                                                                                    ? (announcement.is_currently_active ? 'Active' : 'Scheduled')
                                                                                    : 'Inactive'}
                                                                            </span>
                                                                        </Badge>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 text-xs"
                                                                            onClick={() => handleToggleStatus(announcement)}
                                                                        >
                                                                            {announcement.is_active ? 'Deactivate' : 'Activate'}
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <span className="sr-only">Open menu</span>
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-48">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('announcements.show', announcement.id)} className="flex items-center cursor-pointer">
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>View Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('announcements.edit', announcement.id)} className="flex items-center cursor-pointer">
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Edit</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(announcement.title, 'Title')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Title</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleToggleStatus(announcement)}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                {announcement.is_active ? (
                                                                                    <>
                                                                                        <PauseCircle className="mr-2 h-4 w-4" />
                                                                                        <span>Deactivate</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <PlayCircle className="mr-2 h-4 w-4" />
                                                                                        <span>Activate</span>
                                                                                    </>
                                                                                )}
                                                                            </DropdownMenuItem>
                                                                            
                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(announcement.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        {isSelected ? (
                                                                                            <>
                                                                                                <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                                                <span className="text-green-600">Deselect</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Square className="mr-2 h-4 w-4" />
                                                                                                <span>Select for Bulk</span>
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleDelete(announcement)}
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete</span>
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

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBulkMode(false)}
                                    className="h-7 text-xs"
                                    disabled={isPerformingBulkAction}
                                >
                                    Exit Bulk Mode
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                                    <span>Select page</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
                                    <span>Select filtered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
                                    <span>Delete selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                                    <span>Exit/clear</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Announcements</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedAnnouncements.length} selected announcement{selectedAnnouncements.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {selectionStats.currentlyActiveCount > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                ⚠️ Warning: {selectionStats.currentlyActiveCount} selected announcement(s) are currently active
                                and being displayed to residents. They will be removed immediately.
                            </p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}