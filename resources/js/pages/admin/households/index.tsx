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
    Home,
    Users,
    Phone,
    MapPin,
    Eye,
    Edit,
    Trash2,
    ChevronUp,
    ChevronDown,
    MoreVertical,
    Clipboard,
    FileText,
    Printer,
    AlertCircle,
    Link as LinkIcon,
    Layers,
    MousePointer,
    FilterX,
    Rows,
    RotateCcw,
    Hash,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    KeyRound,
    X,
    Check,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Mail,
    FileSpreadsheet,
    QrCode,
    FileEdit,
    CheckCircle,
    Clock,
    Crown,
    Camera,
    Square,
    CheckSquare,
    ExternalLink,
    User,
    Grid3X3,
    List,
    Settings,
    AlertTriangle
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { PageProps } from '@/types';

interface Purok {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    leader_name?: string;
    leader_contact?: string;
    total_households?: number;
    total_residents?: number;
    status?: string;
    google_maps_url?: string;
    created_at?: string;
    updated_at?: string;
}

interface Household {
    id: number;
    household_number: string;
    head_of_family: string;
    member_count: number;
    contact_number: string;
    address: string;
    purok_id?: number;
    purok?: Purok;
    created_at: string;
    status: string;
    members?: any[];
}

interface HouseholdsProps extends PageProps {
    households: {
        data: Household[];
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
        purok_id?: string;
        sort_by?: string;
        sort_order?: string;
    };
    puroks: Purok[];
    allHouseholds: Household[];
}

// Bulk operation types
type BulkOperation = 'export' | 'print' | 'delete' | 'update_status' | 'update_purok' | 'generate_ids' | 'send_message' | 'export_csv' | 'export_pdf';

// Bulk edit field types
type BulkEditField = 'status' | 'purok_id';

// Helper functions
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const truncateAddress = (address: string, maxLength: number = 40): string => {
    if (!address) return 'N/A';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
};

const formatContactNumber = (contact: string): string => {
    if (!contact) return 'N/A';
    if (contact.length <= 12) return contact;
    return truncateText(contact, 12);
};

export default function Households({ households, stats, filters, puroks, allHouseholds }: HouseholdsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [purokFilter, setPurokFilter] = useState(filters.purok_id || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'household_number');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedHouseholds, setSelectedHouseholds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkPurokDialog, setShowBulkPurokDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');
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
                    if (selectedHouseholds.length > 0) {
                        setSelectedHouseholds([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedHouseholds.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedHouseholds, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedHouseholds([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Get responsive truncation length
    const getTruncationLength = (type: 'name' | 'address' | 'contact' | 'household' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'address': return 20;
                case 'contact': return 10;
                case 'household': return 12;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'address': return 25;
                case 'contact': return 12;
                case 'household': return 15;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'address': return 30;
                case 'contact': return 15;
                case 'household': return 18;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'address': return 35;
            case 'contact': return 15;
            case 'household': return 20;
            default: return 30;
        }
    };

    // Helper function to get purok name from household
    const getPurokName = (household: Household): string => {
        if (household.purok && typeof household.purok === 'object') {
            return household.purok.name;
        }
        if (household.purok_id) {
            const purok = puroks.find(p => p.id === household.purok_id);
            return purok ? purok.name : 'Unknown';
        }
        return 'No Purok';
    };

    // Helper function to get purok object from household
    const getPurok = (household: Household): Purok | null => {
        if (household.purok && typeof household.purok === 'object') {
            return household.purok;
        }
        if (household.purok_id) {
            return puroks.find(p => p.id === household.purok_id) || null;
        }
        return null;
    };

    // Filter households client-side
    const filteredHouseholds = useMemo(() => {
        let result = [...allHouseholds];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(household => 
                household.household_number.toLowerCase().includes(searchLower) ||
                household.head_of_family.toLowerCase().includes(searchLower) ||
                household.address.toLowerCase().includes(searchLower) ||
                (household.contact_number && household.contact_number.toLowerCase().includes(searchLower))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(household => household.status === statusFilter);
        }

        // Purok filter
        if (purokFilter !== 'all') {
            const purokId = parseInt(purokFilter);
            result = result.filter(household => {
                const householdPurok = getPurok(household);
                return householdPurok && householdPurok.id === purokId;
            });
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'household_number':
                    const aNum = parseInt(a.household_number.replace(/\D/g, ''));
                    const bNum = parseInt(b.household_number.replace(/\D/g, ''));
                    aValue = isNaN(aNum) ? a.household_number : aNum;
                    bValue = isNaN(bNum) ? b.household_number : bNum;
                    break;
                case 'head_of_family':
                    aValue = a.head_of_family.toLowerCase();
                    bValue = b.head_of_family.toLowerCase();
                    break;
                case 'member_count':
                    aValue = a.member_count;
                    bValue = b.member_count;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'purok':
                    aValue = getPurokName(a).toLowerCase();
                    bValue = getPurokName(b).toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a.household_number;
                    bValue = b.household_number;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [allHouseholds, search, statusFilter, purokFilter, sortBy, sortOrder, puroks]);

    // Calculate pagination
    const totalItems = filteredHouseholds.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHouseholds = filteredHouseholds.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, purokFilter, sortBy, sortOrder]);

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedHouseholds.map(household => household.id);
        if (isSelectAll) {
            setSelectedHouseholds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedHouseholds, ...pageIds])];
            setSelectedHouseholds(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items (client-side filtered)
    const handleSelectAllFiltered = () => {
        const allIds = filteredHouseholds.map(household => household.id);
        if (selectedHouseholds.length === allIds.length && allIds.every(id => selectedHouseholds.includes(id))) {
            setSelectedHouseholds(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedHouseholds, ...allIds])];
            setSelectedHouseholds(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${households.total} households. This action may take a moment.`)) {
            // For now, just select all on current page
            // In production, you'd make an API call to get all IDs
            const pageIds = paginatedHouseholds.map(household => household.id);
            setSelectedHouseholds(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page. For full selection, implement server-side API.');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedHouseholds(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedHouseholds.map(household => household.id);
        const allSelected = allPageIds.every(id => selectedHouseholds.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedHouseholds, paginatedHouseholds]);

    // Get selected households data
    const selectedHouseholdsData = useMemo(() => {
        return filteredHouseholds.filter(household => selectedHouseholds.includes(household.id));
    }, [selectedHouseholds, filteredHouseholds]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedHouseholdsData;
        
        const avgMembers = selectedData.length > 0 
            ? selectedData.reduce((sum, h) => sum + h.member_count, 0) / selectedData.length
            : 0;
        
        return {
            total: selectedData.length,
            active: selectedData.filter(h => h.status === 'active').length,
            inactive: selectedData.filter(h => h.status === 'inactive').length,
            totalMembers: selectedData.reduce((sum, h) => sum + h.member_count, 0),
            avgMembers: avgMembers,
            hasContacts: selectedData.filter(h => h.contact_number).length,
        };
    }, [selectedHouseholdsData]);

    // Bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedHouseholds.length === 0) {
            toast.error('Please select at least one household');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    // Export to CSV
                    const exportData = selectedHouseholdsData.map(household => ({
                        'ID': household.id,
                        'Household Number': household.household_number,
                        'Head of Family': household.head_of_family,
                        'Member Count': household.member_count,
                        'Contact Number': household.contact_number || '',
                        'Address': household.address,
                        'Purok': getPurokName(household),
                        'Status': household.status,
                        'Created At': household.created_at,
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
                    a.download = `households-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'print':
                    // Open print preview for each selected household
                    selectedHouseholds.forEach(id => {
                        window.open(`/households/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedHouseholds.length} household(s) opened for printing`);
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedHouseholds.length} selected household(s)? This action cannot be undone.`)) {
                        await router.post('/households/bulk-delete', {
                            ids: selectedHouseholds
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedHouseholds.length} household(s) deleted successfully`);
                                setSelectedHouseholds([]);
                                setShowBulkDeleteDialog(false);
                            },
                            onError: (errors) => {
                                toast.error('Failed to delete households');
                                console.error('Delete errors:', errors);
                            }
                        });
                    }
                    break;

                case 'update_status':
                    await router.post('/households/bulk-update-status', {
                        ids: selectedHouseholds,
                        status: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedHouseholds.length} household(s) status updated`);
                            setShowBulkStatusDialog(false);
                            setBulkEditValue('');
                            setSelectedHouseholds([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update status');
                            console.error('Status update errors:', errors);
                        }
                    });
                    break;

                case 'update_purok':
                    await router.post('/households/bulk-update-purok', {
                        ids: selectedHouseholds,
                        purok_id: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedHouseholds.length} household(s) purok updated`);
                            setShowBulkPurokDialog(false);
                            setBulkEditValue('');
                            setSelectedHouseholds([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update purok');
                            console.error('Purok update errors:', errors);
                        }
                    });
                    break;

                case 'generate_ids':
                    // Open ID generation for selected households
                    const idsParam = selectedHouseholds.join(',');
                    window.open(`/households/generate-bulk-ids?ids=${idsParam}`, '_blank');
                    toast.success(`Generating IDs for ${selectedHouseholds.length} household(s)`);
                    break;

                case 'send_message':
                    // Open message composition with selected households
                    const contacts = selectedHouseholdsData
                        .filter(h => h.contact_number)
                        .map(h => h.contact_number)
                        .join(',');
                    
                    if (contacts) {
                        const smsLink = `sms:${contacts}`;
                        window.location.href = smsLink;
                    } else {
                        toast.error('No contact numbers available for selected households');
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
        if (selectedHouseholdsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedHouseholdsData.map(household => ({
            'Household Number': household.household_number,
            'Head of Family': household.head_of_family,
            'Members': household.member_count,
            'Contact': household.contact_number || 'N/A',
            'Address': household.address,
            'Status': household.status,
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

    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPurokFilter('all');
        setSortBy('household_number');
        setSortOrder('asc');
    };

    const handleDelete = (household: Household) => {
        if (confirm(`Are you sure you want to delete household ${household.household_number}?`)) {
            router.delete(`/households/${household.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Show success message or refresh
                }
            });
        }
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            default: return 'outline';
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = search || statusFilter !== 'all' || purokFilter !== 'all';

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        const activeCount = filteredHouseholds.filter(h => h.status === 'active').length;
        const totalMembers = filteredHouseholds.reduce((sum, h) => sum + h.member_count, 0);
        const avgMembers = filteredHouseholds.length > 0 
            ? (totalMembers / filteredHouseholds.length).toFixed(1)
            : '0.0';

        return [
            { label: 'Total Households', value: filteredHouseholds.length },
            { label: 'Active Households', value: activeCount },
            { label: 'Total Members', value: totalMembers },
            { label: 'Average Members', value: avgMembers },
        ];
    }, [filteredHouseholds]);

    return (
        <AppLayout
            title="Households"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Households', href: '/households' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Household Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage household registrations and information
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
                                    <p className="text-xs text-gray-500">Select multiple households for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Link href="/households/create">
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Register Household</span>
                                    <span className="sm:hidden">Register</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredStats.map((stat, index) => (
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
                                            placeholder="Search households by name, number, or address... (Ctrl+F)"
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
                                            onClick={() => {
                                                const exportUrl = new URL('/households/export', window.location.origin);
                                                if (search) exportUrl.searchParams.append('search', search);
                                                if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                                if (purokFilter !== 'all') exportUrl.searchParams.append('purok_id', purokFilter);
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
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} households
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
                                                                Current Page ({paginatedHouseholds.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({filteredHouseholds.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({households.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedHouseholds([])}
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
                                        <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                        <select 
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Purok:</span>
                                        <select 
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={purokFilter}
                                            onChange={(e) => setPurokFilter(e.target.value)}
                                        >
                                            <option value="all">All Puroks</option>
                                            {puroks.map((purok) => (
                                                <option key={purok.id} value={purok.id}>
                                                    {truncateText(purok.name, 15)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                                        <select 
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="household_number">Household No.</option>
                                            <option value="head_of_family">Head of Family</option>
                                            <option value="member_count">Members</option>
                                            <option value="created_at">Date Registered</option>
                                            <option value="purok">Purok</option>
                                            <option value="status">Status</option>
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Member Count Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Member Count</label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Min members"
                                                        type="number"
                                                        className="w-24 sm:w-32"
                                                    />
                                                    <span className="self-center text-sm">to</span>
                                                    <Input
                                                        placeholder="Max members"
                                                        type="number"
                                                        className="w-24 sm:w-32"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {[
                                                        { label: 'Single (1)', min: 1, max: 1 },
                                                        { label: 'Small (2-4)', min: 2, max: 4 },
                                                        { label: 'Medium (5-7)', min: 5, max: 7 },
                                                        { label: 'Large (8+)', min: 8, max: 100 }
                                                    ].map((range, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="cursor-pointer hover:bg-gray-100 text-xs"
                                                        >
                                                            {windowWidth < 640 ? range.label.split(' ')[0] : range.label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Quick Status Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`h-8 ${statusFilter === 'active' ? 'bg-green-50 text-green-700' : ''}`}
                                                        onClick={() => setStatusFilter('active')}
                                                    >
                                                        Active
                                                    </Button>
                                                    {puroks.slice(0, 3).map(purok => (
                                                        <Button
                                                            key={purok.id}
                                                            variant="outline"
                                                            size="sm"
                                                            className={`h-8 ${purokFilter === purok.id.toString() ? 'bg-blue-50 text-blue-700' : ''}`}
                                                            onClick={() => setPurokFilter(purok.id.toString())}
                                                        >
                                                            {windowWidth < 640 ? truncateText(purok.name, 8) : truncateText(purok.name, 12)}
                                                        </Button>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() => {
                                                            setSortBy('member_count');
                                                            setSortOrder('desc');
                                                        }}
                                                    >
                                                        Largest
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
                    {isBulkMode && selectedHouseholds.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedHouseholds.length} selected
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
                                                setSelectedHouseholds([]);
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
                                                Export selected households
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
                                                Print household details
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
                                                Bulk edit selected households
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
                                                        onClick={() => setShowBulkPurokDialog(true)}
                                                    >
                                                        <Home className="h-3.5 w-3.5 mr-2" />
                                                        Update Purok
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('generate_ids')}
                                                    >
                                                        <QrCode className="h-3.5 w-3.5 mr-2" />
                                                        Generate IDs
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('send_message')}
                                                    >
                                                        <Mail className="h-3.5 w-3.5 mr-2" />
                                                        Send SMS
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
                            {selectedHouseholdsData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Home className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} households
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.totalMembers} members
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.active} active
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {selectionStats.hasContacts} with contacts
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-purple-500" />
                                            <span>Avg members: {selectionStats.avgMembers.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-cyan-500" />
                                            <span>{selectionStats.inactive} inactive</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Households Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Household List
                                    {selectedHouseholds.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedHouseholds.length} selected
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
                                                                    checked={isSelectAll && paginatedHouseholds.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('household_number')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Household No.
                                                            {getSortIcon('household_number')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('head_of_family')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Head of Family
                                                            {getSortIcon('head_of_family')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('member_count')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Members
                                                            {getSortIcon('member_count')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        Contact
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                                        Address
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('purok')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Purok
                                                            {getSortIcon('purok')}
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
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {paginatedHouseholds.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 9 : 8} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <Home className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No households found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by registering a household.'}
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
                                                                    <Link href="/households/create">
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Register Household
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedHouseholds.map((household) => {
                                                        const purokName = getPurokName(household);
                                                        const householdLength = getTruncationLength('household');
                                                        const nameLength = getTruncationLength('name');
                                                        const addressLength = getTruncationLength('address');
                                                        const contactLength = getTruncationLength('contact');
                                                        const isSelected = selectedHouseholds.includes(household.id);
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={household.id}
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                }`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(household.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleItemSelect(household.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                    <div 
                                                                        className="flex items-center gap-2 cursor-text select-text"
                                                                        onDoubleClick={(e) => {
                                                                            const selection = window.getSelection();
                                                                            if (selection) {
                                                                                const range = document.createRange();
                                                                                range.selectNodeContents(e.currentTarget);
                                                                                selection.removeAllRanges();
                                                                                selection.addRange(range);
                                                                            }
                                                                        }}
                                                                        title={`Double-click to select all\nHousehold Number: ${household.household_number}`}
                                                                    >
                                                                        <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <div 
                                                                            className="font-medium truncate"
                                                                            data-full-text={household.household_number}
                                                                        >
                                                                            {truncateText(household.household_number, householdLength)}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
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
                                                                        title={`Double-click to select all\nHead of Family: ${household.head_of_family}`}
                                                                    >
                                                                        <div 
                                                                            className="truncate"
                                                                            data-full-text={household.head_of_family}
                                                                        >
                                                                            {truncateText(household.head_of_family, nameLength)}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <span>{household.member_count} member{household.member_count !== 1 ? 's' : ''}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div 
                                                                        className="flex items-center gap-1 cursor-text select-text"
                                                                        onDoubleClick={(e) => {
                                                                            const selection = window.getSelection();
                                                                            if (selection) {
                                                                                const range = document.createRange();
                                                                                range.selectNodeContents(e.currentTarget);
                                                                                selection.removeAllRanges();
                                                                                selection.addRange(range);
                                                                            }
                                                                        }}
                                                                        title={`Double-click to select all\nContact: ${household.contact_number || 'N/A'}`}
                                                                    >
                                                                        <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                        <div 
                                                                            className="truncate"
                                                                            data-full-text={household.contact_number}
                                                                        >
                                                                            {formatContactNumber(household.contact_number)}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div 
                                                                        className="flex items-center gap-1 cursor-text select-text"
                                                                        onDoubleClick={(e) => {
                                                                            const selection = window.getSelection();
                                                                            if (selection) {
                                                                                const range = document.createRange();
                                                                                range.selectNodeContents(e.currentTarget);
                                                                                selection.removeAllRanges();
                                                                                selection.addRange(range);
                                                                            }
                                                                        }}
                                                                        title={`Double-click to select all\nAddress: ${household.address}`}
                                                                    >
                                                                        <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                        <div 
                                                                            className="truncate"
                                                                            data-full-text={household.address}
                                                                        >
                                                                            {truncateAddress(household.address, addressLength)}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className="truncate max-w-full"
                                                                        title={purokName}
                                                                    >
                                                                        {truncateText(purokName, 15)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge 
                                                                        variant={getStatusBadgeVariant(household.status)}
                                                                        className="truncate max-w-full"
                                                                        title={household.status}
                                                                    >
                                                                        {household.status}
                                                                    </Badge>
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
                                                                                <Link href={`/households/${household.id}`} className="flex items-center cursor-pointer">
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>View Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/households/${household.id}/edit`} className="flex items-center cursor-pointer">
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Edit Household</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(household.household_number, 'Household Number')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Clipboard className="mr-2 h-4 w-4" />
                                                                                <span>Copy Household No.</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            {household.contact_number && (
                                                                                <DropdownMenuItem 
                                                                                    onClick={() => handleCopyToClipboard(household.contact_number, 'Contact')}
                                                                                    className="flex items-center cursor-pointer"
                                                                                >
                                                                                    <Clipboard className="mr-2 h-4 w-4" />
                                                                                    <span>Copy Contact</span>
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/clearances/create?household_id=${household.id}`} className="flex items-center cursor-pointer">
                                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                                    <span>Create Clearance</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/households/${household.id}/print`} className="flex items-center cursor-pointer">
                                                                                    <Printer className="mr-2 h-4 w-4" />
                                                                                    <span>Print Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>

                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(household.id)}
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
                                                                            
                                                                            {household.status !== 'inactive' && (
                                                                                <DropdownMenuItem 
                                                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                    onClick={() => handleDelete(household)}
                                                                                >
                                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                                    <span>Delete Household</span>
                                                                                </DropdownMenuItem>
                                                                            )}
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

                    {/* Additional Information */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Recent Registrations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {paginatedHouseholds.slice(0, 3).length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 text-sm">No recent registrations</p>
                                ) : (
                                    <div className="space-y-3">
                                        {paginatedHouseholds.slice(0, 3).map((household) => {
                                            const purokName = getPurokName(household);
                                            const nameLength = getTruncationLength('name');
                                            
                                            return (
                                                <div key={household.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                                    <div className="flex-1 min-w-0">
                                                        <p 
                                                            className="font-medium truncate"
                                                            title={household.head_of_family}
                                                        >
                                                            {truncateText(household.head_of_family, nameLength)}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {household.household_number} • {formatDate(household.created_at)}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {household.member_count} members • {truncateText(purokName, 20)}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="ml-2 flex-shrink-0">New</Badge>
                                                </div>
                                            );
                                        })}
                                        {paginatedHouseholds.length > 3 && (
                                            <div className="text-center pt-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => setCurrentPage(1)}
                                                    className="h-8"
                                                >
                                                    View All Households
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/households/import">
                                        <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                            <Download className="h-3 w-3 mr-2" />
                                            Bulk Import
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start h-8"
                                        onClick={() => {
                                            const exportUrl = new URL('/households/export', window.location.origin);
                                            if (search) exportUrl.searchParams.append('search', search);
                                            if (statusFilter !== 'all') exportUrl.searchParams.append('status', statusFilter);
                                            if (purokFilter !== 'all') exportUrl.searchParams.append('purok_id', purokFilter);
                                            window.open(exportUrl.toString(), '_blank');
                                        }}
                                    >
                                        Export Data
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        Generate Report
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                        Print List
                                    </Button>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-500 mb-2">Distribution by Purok:</p>
                                    <div className="space-y-1 text-sm">
                                        {puroks.map((purok) => {
                                            const count = filteredHouseholds.filter(h => {
                                                const householdPurok = getPurok(h);
                                                return householdPurok && householdPurok.id === purok.id;
                                            }).length;
                                            if (count === 0) return null;
                                            return (
                                                <div key={purok.id} className="flex items-center justify-between">
                                                    <span className="truncate max-w-[100px]" title={purok.name}>
                                                        {truncateText(purok.name, 15)}
                                                    </span>
                                                    <Badge variant="outline">{count}</Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TooltipProvider>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Households</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedHouseholds.length} selected household{selectedHouseholds.length !== 1 ? 's' : ''}?
                            This action cannot be undone. Inactive households cannot be deleted.
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
                            Update status for {selectedHouseholds.length} selected households.
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
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total households</li>
                                <li>{selectionStats.active} active</li>
                                <li>{selectionStats.inactive} inactive</li>
                                <li>{selectionStats.totalMembers} total members</li>
                                <li>{selectionStats.hasContacts} with contact numbers</li>
                                <li>Average members: {selectionStats.avgMembers.toFixed(1)}</li>
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

            {/* Bulk Purok Update Dialog */}
            <AlertDialog open={showBulkPurokDialog} onOpenChange={setShowBulkPurokDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Purok</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update purok for {selectedHouseholds.length} selected households.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Purok</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Purok</option>
                                {puroks.map((purok) => (
                                    <option key={purok.id} value={purok.id}>
                                        {purok.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current purok distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                {(() => {
                                    const purokCounts: Record<string, number> = {};
                                    selectedHouseholdsData.forEach(household => {
                                        const purokName = getPurokName(household);
                                        purokCounts[purokName] = (purokCounts[purokName] || 0) + 1;
                                    });
                                    
                                    return Object.entries(purokCounts).map(([purok, count]) => (
                                        <li key={purok}>{purok}: {count} household(s)</li>
                                    ));
                                })()}
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_purok')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Purok'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}