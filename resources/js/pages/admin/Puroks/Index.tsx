import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Filter,
    Download,
    Plus,
    MapPin,
    Users,
    Home,
    Phone,
    Edit,
    Eye,
    Trash2,
    RefreshCw,
    ExternalLink,
    MoreVertical,
    Copy,
    Printer,
    ChevronLeft,
    ChevronRight,
    Globe,
    AlertTriangle,
    BarChart3,
    Share2,
    Layers,
    Clipboard,
    FilterX,
    MousePointer,
    Rows,
    RotateCcw,
    Hash,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    KeyRound,
    X,
    ChevronUp,
    ChevronDown,
    Loader2,
    FileSpreadsheet,
    Mail,
    UserPlus,
    UserMinus,
    Square,
    CheckSquare,
    Grid3X3,
    List,
    Settings,
    ArrowUpDown,
    Users2,
    FileText,
    QrCode,
    Shield
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef, JSX } from 'react';
import { toast } from 'sonner';
import { PageProps } from '@/types';

interface Purok {
    id: number;
    name: string;
    slug: string;
    description: string;
    leader_name: string;
    leader_contact: string;
    google_maps_url: string;
    total_households: number;
    total_residents: number;
    status: string;
    created_at: string;
    households_count?: number;
    residents_count?: number;
}

interface PuroksProps extends PageProps {
    puroks: {
        data: Purok[];
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
    };
}

// Bulk operation types
type BulkOperation = 'export' | 'delete' | 'update_status' | 'update_leader' | 'send_message' | 'print' | 'export_csv' | 'generate_report';

// Bulk edit field types
type BulkEditField = 'status';

// Helper functions
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const formatContactNumber = (contact: string): string => {
    if (!contact) return 'Not assigned';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

export default function Puroks({ puroks, stats, filters }: PuroksProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [sortBy, setSortBy] = useState<'name' | 'total_households' | 'total_residents' | 'created_at' | 'status'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedPuroks, setSelectedPuroks] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    
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
                    if (selectedPuroks.length > 0) {
                        setSelectedPuroks([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedPuroks.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedPuroks, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedPuroks([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Get responsive truncation length
    const getTruncationLength = (type: 'name' | 'description' | 'contact' | 'leader' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'description': return 20;
                case 'contact': return 10;
                case 'leader': return 12;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'description': return 25;
                case 'contact': return 12;
                case 'leader': return 15;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'description': return 30;
                case 'contact': return 15;
                case 'leader': return 18;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'description': return 35;
            case 'contact': return 15;
            case 'leader': return 20;
            default: return 30;
        }
    };

    // Filter puroks
    const filteredPuroks = useMemo(() => {
        let result = [...puroks.data];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(purok => 
                purok.name.toLowerCase().includes(searchLower) ||
                purok.leader_name.toLowerCase().includes(searchLower) ||
                purok.description.toLowerCase().includes(searchLower) ||
                purok.leader_contact.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(purok => purok.status === statusFilter);
        }
        
        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'total_households':
                    aValue = a.total_households;
                    bValue = b.total_households;
                    break;
                case 'total_residents':
                    aValue = a.total_residents;
                    bValue = b.total_residents;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
        
        return result;
    }, [puroks.data, search, statusFilter, sortBy, sortOrder]);

    // Calculate pagination
    const totalItems = filteredPuroks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPuroks = filteredPuroks.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortBy, sortOrder]);

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedPuroks.map(purok => purok.id);
        if (isSelectAll) {
            setSelectedPuroks(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPuroks, ...pageIds])];
            setSelectedPuroks(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items (client-side filtered)
    const handleSelectAllFiltered = () => {
        const allIds = filteredPuroks.map(purok => purok.id);
        if (selectedPuroks.length === allIds.length && allIds.every(id => selectedPuroks.includes(id))) {
            setSelectedPuroks(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedPuroks, ...allIds])];
            setSelectedPuroks(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${puroks.total} puroks. This action may take a moment.`)) {
            // For now, just select all on current page
            const pageIds = paginatedPuroks.map(purok => purok.id);
            setSelectedPuroks(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page.');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedPuroks(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedPuroks.map(purok => purok.id);
        const allSelected = allPageIds.every(id => selectedPuroks.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedPuroks, paginatedPuroks]);

    // Get selected puroks data
    const selectedPuroksData = useMemo(() => {
        return filteredPuroks.filter(purok => selectedPuroks.includes(purok.id));
    }, [selectedPuroks, filteredPuroks]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedPuroksData;
        
        const totalHouseholds = selectedData.reduce((sum, p) => sum + p.total_households, 0);
        const totalResidents = selectedData.reduce((sum, p) => sum + p.total_residents, 0);
        const avgHouseholds = selectedData.length > 0 ? totalHouseholds / selectedData.length : 0;
        const avgResidents = selectedData.length > 0 ? totalResidents / selectedData.length : 0;
        
        return {
            total: selectedData.length,
            active: selectedData.filter(p => p.status === 'active').length,
            inactive: selectedData.filter(p => p.status === 'inactive').length,
            totalHouseholds: totalHouseholds,
            totalResidents: totalResidents,
            avgHouseholds: avgHouseholds,
            avgResidents: avgResidents,
            hasLeaders: selectedData.filter(p => p.leader_name).length,
            hasMaps: selectedData.filter(p => p.google_maps_url).length,
        };
    }, [selectedPuroksData]);

    // Bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedPuroks.length === 0) {
            toast.error('Please select at least one purok');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    // Export to CSV
                    const exportData = selectedPuroksData.map(purok => ({
                        'ID': purok.id,
                        'Name': purok.name,
                        'Description': purok.description || '',
                        'Leader Name': purok.leader_name || '',
                        'Leader Contact': purok.leader_contact || '',
                        'Google Maps URL': purok.google_maps_url || '',
                        'Total Households': purok.total_households,
                        'Total Residents': purok.total_residents,
                        'Status': purok.status,
                        'Created At': purok.created_at,
                    }));
                    
                    // Convert to CSV
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
                    
                    // Create and download file
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `puroks-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'print':
                    // Open print preview for each selected purok
                    selectedPuroks.forEach(id => {
                        window.open(`/admin/puroks/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedPuroks.length} purok(s) opened for printing`);
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedPuroks.length} selected purok(s)? This action cannot be undone.`)) {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        toast.success(`${selectedPuroks.length} purok(s) deleted successfully`);
                        setSelectedPuroks([]);
                        setShowBulkDeleteDialog(false);
                    }
                    break;

                case 'update_status':
                    if (!bulkEditValue) {
                        toast.error('Please select a status');
                        return;
                    }
                    
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    toast.success(`${selectedPuroks.length} purok(s) status updated to ${bulkEditValue}`);
                    setShowBulkStatusDialog(false);
                    setBulkEditValue('');
                    setSelectedPuroks([]);
                    break;

                case 'generate_report':
                    // Generate report for selected puroks
                    const idsParam = selectedPuroks.join(',');
                    window.open(`/admin/puroks/report?ids=${idsParam}`, '_blank');
                    toast.success(`Generating report for ${selectedPuroks.length} purok(s)`);
                    break;

                case 'send_message':
                    // Get leaders with contact numbers
                    const leadersWithContacts = selectedPuroksData
                        .filter(p => p.leader_contact)
                        .map(p => ({ name: p.leader_name, contact: p.leader_contact }));
                    
                    if (leadersWithContacts.length > 0) {
                        const contacts = leadersWithContacts.map(l => l.contact).join(',');
                        const smsLink = `sms:${contacts}`;
                        window.location.href = smsLink;
                        toast.success(`Opening SMS for ${leadersWithContacts.length} purok leader(s)`);
                    } else {
                        toast.error('No contact numbers available for selected purok leaders');
                    }
                    break;

                default:
                    toast.error('Operation not supported');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedPuroksData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedPuroksData.map(purok => ({
            Name: purok.name,
            Leader: purok.leader_name || 'Not assigned',
            Contact: purok.leader_contact || 'Not assigned',
            Households: purok.total_households,
            Residents: purok.total_residents,
            Status: purok.status,
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        
        const params: any = { ...filters };
        if (value) params.search = value;
        if (statusFilter !== 'all') params.status = statusFilter;
        
        router.get('/admin/puroks', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        
        const params: any = { ...filters };
        if (search) params.search = search;
        if (status !== 'all') params.status = status;
        
        router.get('/admin/puroks', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setSortBy('name');
        setSortOrder('asc');
        router.get('/admin/puroks', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (purok: Purok) => {
        if (confirm(`Are you sure you want to delete purok "${purok.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/puroks/${purok.id}`);
        }
    };

    const handleUpdateStatistics = () => {
        if (confirm('Update statistics for all puroks? This will recalculate household and resident counts.')) {
            router.post('/admin/puroks/update-statistics');
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'active': 'default',
            'inactive': 'secondary',
            'pending': 'outline',
            'archived': 'outline'
        };
        return variants[status.toLowerCase()] || 'outline';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'active': <div className="h-2 w-2 rounded-full bg-green-500"></div>,
            'inactive': <div className="h-2 w-2 rounded-full bg-gray-400"></div>,
            'pending': <AlertTriangle className="h-3 w-3 text-amber-500" />,
            'archived': <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        };
        return icons[status.toLowerCase()] || null;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSort = (column: 'name' | 'total_households' | 'total_residents' | 'created_at' | 'status') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = search || statusFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc';

    return (
        <AppLayout
            title="Puroks"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Purok Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage barangay puroks/zones and their information
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
                                                <Layers className="h-4 w-4 mr-2" />
                                                Bulk Mode
                                            </>
                                        ) : (
                                            <>
                                                <MousePointer className="h-4 w-4 mr-2" />
                                                Bulk Select
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                                    <p className="text-xs text-gray-500">Select multiple puroks for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Button 
                                variant="outline" 
                                onClick={handleUpdateStatistics}
                                className="h-9"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Update Stats</span>
                                <span className="sm:hidden">Stats</span>
                            </Button>
                            <Link href="/admin/puroks/create">
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Add Purok</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
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
                                            ref={searchInputRef}
                                            placeholder="Search puroks by name, leader, or description... (Ctrl+F)"
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                        {search && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => handleSearch('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <select 
                                            className="border rounded px-3 py-2 text-sm w-28"
                                            value={statusFilter}
                                            onChange={(e) => handleStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        
                                        <Button 
                                            variant="outline"
                                            className="h-9"
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                                                const exportUrl = new URL('/admin/puroks/export', window.location.origin);
                                                if (search) exportUrl.searchParams.append('search', search);
                                                if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                                window.open(exportUrl.toString(), '_blank');
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <div className="border-t pt-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Sort Options */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Sort By</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${sortBy === 'name' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        Name
                                                        {getSortIcon('name')}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${sortBy === 'total_households' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                        onClick={() => handleSort('total_households')}
                                                    >
                                                        Households
                                                        {getSortIcon('total_households')}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${sortBy === 'total_residents' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                                                        onClick={() => handleSort('total_residents')}
                                                    >
                                                        Residents
                                                        {getSortIcon('total_residents')}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Size Filters */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Size Filters</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() => {
                                                            setSortBy('total_households');
                                                            setSortOrder('desc');
                                                        }}
                                                    >
                                                        Largest Households
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() => {
                                                            setSortBy('total_residents');
                                                            setSortOrder('desc');
                                                        }}
                                                    >
                                                        Most Residents
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Quick Filters */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${statusFilter === 'active' ? 'bg-green-50 text-green-700' : ''}`}
                                                        onClick={() => handleStatusFilter('active')}
                                                    >
                                                        Active
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${statusFilter === 'inactive' ? 'bg-gray-50 text-gray-700' : ''}`}
                                                        onClick={() => handleStatusFilter('inactive')}
                                                    >
                                                        Inactive
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() => {
                                                            // Filter puroks with leaders
                                                            const withLeaders = filteredPuroks.filter(p => p.leader_name);
                                                            toast.info(`${withLeaders.length} puroks with leaders`);
                                                        }}
                                                    >
                                                        With Leaders
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Active filters indicator and clear button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} puroks
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
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
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
                                                                <Rows className="h-3.5 w-3.5 mr-2" />
                                                                Current Page ({paginatedPuroks.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({filteredPuroks.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({puroks.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedPuroks([])}
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Bulk Actions Bar */}
                    {isBulkMode && selectedPuroks.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedPuroks.length} selected
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
                                                setSelectedPuroks([]);
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
                                                    onClick={() => handleBulkOperation('export')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                                    Export
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Export selected puroks
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('print')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Printer className="h-3.5 w-3.5 mr-1" />
                                                    Print
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Print purok details
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowBulkStatusDialog(true)}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Bulk edit selected puroks
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
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
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
                                                        onClick={() => handleBulkOperation('generate_report')}
                                                    >
                                                        <BarChart3 className="h-3.5 w-3.5 mr-2" />
                                                        Generate Report
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('send_message')}
                                                    >
                                                        <Share2 className="h-3.5 w-3.5 mr-2" />
                                                        Message Leaders
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => {
                                                            const idsParam = selectedPuroks.join(',');
                                                            window.open(`/residents?purok_ids=${idsParam}`, '_blank');
                                                        }}
                                                    >
                                                        <Users2 className="h-3.5 w-3.5 mr-2" />
                                                        View All Residents
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
                            {selectedPuroksData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} puroks
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Home className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.totalHouseholds} households
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5 text-purple-500" />
                                            <span>
                                                {selectionStats.totalResidents} residents
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {selectionStats.active} active
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <UserPlus className="h-3 w-3 text-cyan-500" />
                                            <span>{selectionStats.hasLeaders} with leaders</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Globe className="h-3 w-3 text-red-500" />
                                            <span>{selectionStats.hasMaps} with maps</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Puroks Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Purok List
                                    {selectedPuroks.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedPuroks.length} selected
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
                                                                <Checkbox
                                                                    checked={isSelectAll && paginatedPuroks.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Purok Name
                                                            {getSortIcon('name')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                                        Leader
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                        Map
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('total_households')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Households
                                                            {getSortIcon('total_households')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('total_residents')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Residents
                                                            {getSortIcon('total_residents')}
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
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('created_at')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Created
                                                            {getSortIcon('created_at')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {paginatedPuroks.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 9 : 8} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <MapPin className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No puroks found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by creating a purok.'}
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
                                                                    <Link href="/admin/puroks/create">
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Create First Purok
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedPuroks.map((purok) => {
                                                        const nameLength = getTruncationLength('name');
                                                        const descLength = getTruncationLength('description');
                                                        const leaderLength = getTruncationLength('leader');
                                                        const contactLength = getTruncationLength('contact');
                                                        const isSelected = selectedPuroks.includes(purok.id);
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={purok.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                }`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(purok.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleItemSelect(purok.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                    <div 
                                                                        className="flex items-center gap-3 cursor-text select-text"
                                                                        onDoubleClick={(e) => {
                                                                            const selection = window.getSelection();
                                                                            if (selection) {
                                                                                const range = document.createRange();
                                                                                range.selectNodeContents(e.currentTarget);
                                                                                selection.removeAllRanges();
                                                                                selection.addRange(range);
                                                                            }
                                                                        }}
                                                                        title={`Double-click to select all\nPurok: ${purok.name}\nDescription: ${purok.description}`}
                                                                    >
                                                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                                            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div 
                                                                                className="font-medium text-gray-900 dark:text-white truncate"
                                                                                data-full-text={purok.name}
                                                                            >
                                                                                {truncateText(purok.name, nameLength)}
                                                                            </div>
                                                                            {purok.description && (
                                                                                <div 
                                                                                    className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                                                                                    data-full-text={purok.description}
                                                                                >
                                                                                    {truncateText(purok.description, descLength)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    {purok.leader_name ? (
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
                                                                            title={`Double-click to select all\nLeader: ${purok.leader_name}\nContact: ${purok.leader_contact || 'Not assigned'}`}
                                                                        >
                                                                            <div 
                                                                                className="font-medium truncate"
                                                                                data-full-text={purok.leader_name}
                                                                            >
                                                                                {truncateText(purok.leader_name, leaderLength)}
                                                                            </div>
                                                                            {purok.leader_contact && (
                                                                                <div 
                                                                                    className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 flex items-center gap-1"
                                                                                    data-full-text={purok.leader_contact}
                                                                                >
                                                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                                                    {formatContactNumber(purok.leader_contact)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic text-sm">Not assigned</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    {purok.google_maps_url ? (
                                                                        <a 
                                                                            href={purok.google_maps_url} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                                                            title="Open in Google Maps"
                                                                        >
                                                                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                                                            <span className="truncate">View Map</span>
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic text-sm truncate">No map link</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <span className="truncate">{purok.total_households.toLocaleString()}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <span className="truncate">{purok.total_residents.toLocaleString()}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge 
                                                                        variant={getStatusBadgeVariant(purok.status)} 
                                                                        className="flex items-center gap-1 truncate max-w-full"
                                                                        title={purok.status}
                                                                    >
                                                                        {getStatusIcon(purok.status)}
                                                                        <span className="truncate capitalize">
                                                                            {purok.status}
                                                                        </span>
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div 
                                                                        className="text-sm text-gray-500 dark:text-gray-400 truncate"
                                                                        title={formatDate(purok.created_at)}
                                                                    >
                                                                        {formatDate(purok.created_at)}
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
                                                                                <Link href={`/admin/puroks/${purok.id}`} className="flex items-center cursor-pointer">
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>View Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/admin/puroks/${purok.id}/edit`} className="flex items-center cursor-pointer">
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Edit Purok</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/residents?purok_id=${purok.id}`} className="flex items-center cursor-pointer">
                                                                                    <Users className="mr-2 h-4 w-4" />
                                                                                    <span>View Residents</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/households?purok_id=${purok.id}`} className="flex items-center cursor-pointer">
                                                                                    <Home className="mr-2 h-4 w-4" />
                                                                                    <span>View Households</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(purok.name, 'Purok Name')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Name</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            {purok.leader_name && (
                                                                                <DropdownMenuItem 
                                                                                    onClick={() => handleCopyToClipboard(purok.leader_name, 'Leader Name')}
                                                                                    className="flex items-center cursor-pointer"
                                                                                >
                                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                                    <span>Copy Leader</span>
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            
                                                                            {purok.google_maps_url && (
                                                                                <DropdownMenuItem 
                                                                                    onClick={() => handleCopyToClipboard(purok.google_maps_url, 'Map Link')}
                                                                                    className="flex items-center cursor-pointer"
                                                                                >
                                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                                    <span>Copy Map Link</span>
                                                                                </DropdownMenuItem>
                                                                            )}

                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(purok.id)}
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
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/admin/puroks/${purok.id}/print`} className="flex items-center cursor-pointer">
                                                                                    <Printer className="mr-2 h-4 w-4" />
                                                                                    <span>Print Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                onClick={() => handleDelete(purok)}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete Purok</span>
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

                    {/* Quick Actions & Info */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/admin/puroks/assign-leaders">
                                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                            <Users className="h-3 w-3 mr-2" />
                                            <span className="truncate">Assign Leaders</span>
                                        </Button>
                                    </Link>
                                    <Link href="/admin/puroks/map">
                                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                            <MapPin className="h-3 w-3 mr-2" />
                                            <span className="truncate">View Map</span>
                                        </Button>
                                    </Link>
                                    <Link href="/admin/puroks/print">
                                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                            <Printer className="h-3 w-3 mr-2" />
                                            <span className="truncate">Print Directory</span>
                                        </Button>
                                    </Link>
                                    <Link href="/admin/puroks/alerts">
                                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                            <Share2 className="h-3 w-3 mr-2" />
                                            <span className="truncate">Send Alerts</span>
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start h-8 col-span-2"
                                        onClick={() => handleBulkOperation('generate_report')}
                                    >
                                        <BarChart3 className="h-3 w-3 mr-2" />
                                        <span className="truncate">Generate Statistics Report</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Purok Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {paginatedPuroks.length > 0 ? (
                                    <div className="space-y-3">
                                        {paginatedPuroks.slice(0, 3).map((purok) => {
                                            const nameLength = getTruncationLength('name');
                                            
                                            return (
                                                <div key={purok.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span 
                                                            className="text-sm font-medium truncate"
                                                            title={purok.name}
                                                        >
                                                            {truncateText(purok.name, nameLength)}
                                                        </span>
                                                        {purok.google_maps_url && (
                                                            <a 
                                                                href={purok.google_maps_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                title="View on Google Maps"
                                                            >
                                                                <ExternalLink className="h-3 w-3 text-gray-400 hover:text-blue-600 flex-shrink-0" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Badge variant="outline" className="text-xs">
                                                            {purok.total_households} HH
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {purok.total_residents} P
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {paginatedPuroks.length > 3 && (
                                            <div className="text-center pt-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => setCurrentPage(1)}
                                                    className="h-8"
                                                >
                                                    View All Puroks
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4 text-sm">No purok data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TooltipProvider>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Puroks</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedPuroks.length} selected purok{selectedPuroks.length !== 1 ? 's' : ''}?
                            This action cannot be undone. This will also remove all associated households and residents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
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

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status for {selectedPuroks.length} selected puroks.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total puroks</li>
                                <li>{selectionStats.active} active • {selectionStats.inactive} inactive</li>
                                <li>{selectionStats.totalHouseholds} total households</li>
                                <li>{selectionStats.totalResidents} total residents</li>
                                <li>{selectionStats.hasLeaders} with assigned leaders</li>
                                <li>Avg: {selectionStats.avgHouseholds.toFixed(1)} HH, {selectionStats.avgResidents.toFixed(1)} residents per purok</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_status')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}