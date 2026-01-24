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
    FileText,
    Clock,
    Calendar,
    DollarSign,
    Users,
    Edit,
    Eye,
    Trash2,
    MoreVertical,
    Copy,
    CheckCircle,
    XCircle,
    Shield,
    Globe,
    CreditCard,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowUpDown,
    CopyCheck,
    Printer,
    Square,
    CheckSquare,
    FileSpreadsheet,
    X,
    Layers,
    MousePointer,
    FilterX,
    Grid3X3,
    Rows,
    RotateCcw,
    Hash,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    Timer,
    PlayCircle,
    PauseCircle,
    KeyRound,
    Check,
    File,
    Sparkles,
    Tag,
    CalendarDays,
    MoveHorizontal,
    ExternalLink,
    BarChart3,
    AlertCircle,
    Package,
    Archive,
    Send,
    Mail,
    CheckCheck,
    Ban,
    Grid,
    List,
    Settings,
    EyeOff,
    ChevronDown,
    MoreHorizontal,
    FileEdit,
    FileUp,
    Zap,
    Type,
    PlusCircle,
    MinusCircle,
    Save,
    Upload,
    Sheet
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import { route } from 'ziggy-js';

// Define the Inertia page props type
interface PageProps {
    clearanceTypes: {
        data: ClearanceType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search?: string;
        status?: string;
        requires_payment?: string;
        sort?: string;
        direction?: string;
    };
    stats: {
        total: number;
        active: number;
        requires_payment: number;
        requires_approval: number;
        online_only: number;
    };
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    clearances_count?: number;
    created_at: string;
    updated_at: string;
    purpose_options?: string;
    document_types_count?: number;
}

// Define route types for Inertia
declare module '@inertiajs/react' {
    interface PageProps {
        clearanceTypes: PageProps['clearanceTypes'];
        filters: PageProps['filters'];
        stats: PageProps['stats'];
    }
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Bulk operation types
type BulkOperation = 'activate' | 'deactivate' | 'delete' | 'export' | 'duplicate' | 'toggle-payment' | 'toggle-approval' | 'toggle-online' | 'update';

// Bulk edit field types
type BulkEditField = 'processing_days' | 'validity_days' | 'fee' | 'requires_payment' | 'requires_approval' | 'is_online_only';

// Safe number conversion helper
const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

export default function ClearanceTypesIndex() {
    const { props } = usePage<PageProps>();
    const { clearanceTypes, filters, stats } = props;
    
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentFilter, setPaymentFilter] = useState(filters.requires_payment || 'all');
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkActivateDialog, setShowBulkActivateDialog] = useState(false);
    const [showBulkDeactivateDialog, setShowBulkDeactivateDialog] = useState(false);
    const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('processing_days');
    const [bulkEditValue, setBulkEditValue] = useState<string | number | boolean>('');
    const [isLoading, setIsLoading] = useState(false);
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

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params: any = {};
            if (value) params.search = value;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (paymentFilter !== 'all') params.requires_payment = paymentFilter;
            
            router.get(route('clearance-types.index'), params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        }, 500),
        [statusFilter, paymentFilter]
    );

    // Handle search term change
    useEffect(() => {
        if (searchTerm !== filters.search) {
            debouncedSearch(searchTerm);
        }
        return () => debouncedSearch.cancel();
    }, [searchTerm, debouncedSearch]);

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
                    if (selectedTypes.length > 0) {
                        setSelectedTypes([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedTypes, showBulkActions, showSelectionOptions]);

    // Get responsive truncation length
    const getTruncationLength = useCallback((type: 'name' | 'description' | 'code' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) {
            switch(type) {
                case 'name': return 20;
                case 'description': return 25;
                case 'code': return 10;
                default: return 20;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'name': return 25;
                case 'description': return 30;
                case 'code': return 12;
                default: return 25;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'name': return 30;
                case 'description': return 35;
                case 'code': return 15;
                default: return 30;
            }
        }
        switch(type) {
            case 'name': return 35;
            case 'description': return 40;
            case 'code': return 18;
            default: return 35;
        }
    }, []);

    // Handle pagination - Using Inertia's built-in links
    const handlePageChange = (pageUrl: string) => {
        if (!pageUrl) return;
        
        router.get(pageUrl, {}, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle sort
    const handleSort = (column: string) => {
        const params: any = { ...filters };
        const direction = params.sort === column && params.direction === 'asc' ? 'desc' : 'asc';
        params.sort = column;
        params.direction = direction;
        
        router.get(route('clearance-types.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedTypes([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        if (isSelectAll) {
            const pageIds = clearanceTypes.data.map(type => type.id);
            setSelectedTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const pageIds = clearanceTypes.data.map(type => type.id);
            const newSelected = [...new Set([...selectedTypes, ...pageIds])];
            setSelectedTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items (client-side filtered)
    const handleSelectAllFiltered = () => {
        // For client-side filtering, we need to filter the data first
        const filteredData = clearanceTypes.data.filter(type => {
            let matches = true;
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                matches = matches && (
                    type.name.toLowerCase().includes(searchLower) ||
                    type.code.toLowerCase().includes(searchLower) ||
                    type.description.toLowerCase().includes(searchLower)
                );
            }
            if (statusFilter !== 'all') {
                const isActive = statusFilter === 'active';
                matches = matches && type.is_active === isActive;
            }
            if (paymentFilter !== 'all') {
                const requiresPayment = paymentFilter === 'yes';
                matches = matches && type.requires_payment === requiresPayment;
            }
            return matches;
        });
        
        if (selectedTypes.length === filteredData.length) {
            setSelectedTypes([]);
            setSelectionMode('page');
        } else {
            const allIds = filteredData.map(type => type.id);
            setSelectedTypes(allIds);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${clearanceTypes.total} clearance types. This action may take a moment.`)) {
            // This is a conceptual example. In practice, you'd need to:
            // 1. Fetch all IDs from the server
            // 2. Store them in state
            // 3. Handle pagination for selection
            toast.info('Selecting all items... This feature would need server-side implementation.');
            setSelectionMode('all');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = clearanceTypes.data.map(type => type.id);
        const allSelected = allPageIds.every(id => selectedTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedTypes, clearanceTypes.data]);

    // Get selected clearance types data
    const selectedTypesData = useMemo(() => {
        return clearanceTypes.data.filter(type => selectedTypes.includes(type.id));
    }, [selectedTypes, clearanceTypes.data]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedTypesData;
        
        // Safely calculate total value
        const totalValue = selectedData.reduce((sum, t) => {
            return sum + safeNumber(t.fee, 0);
        }, 0);
        
        // Safely calculate average processing days
        let avgProcessingDays = 0;
        if (selectedData.length > 0) {
            const totalProcessingDays = selectedData.reduce((sum, t) => {
                return sum + safeNumber(t.processing_days, 0);
            }, 0);
            avgProcessingDays = totalProcessingDays / selectedData.length;
        }
        
        return {
            active: selectedData.filter(t => Boolean(t.is_active)).length,
            inactive: selectedData.filter(t => !t.is_active).length,
            paid: selectedData.filter(t => Boolean(t.requires_payment)).length,
            free: selectedData.filter(t => !t.requires_payment).length,
            needsApproval: selectedData.filter(t => Boolean(t.requires_approval)).length,
            onlineOnly: selectedData.filter(t => Boolean(t.is_online_only)).length,
            totalValue: safeNumber(totalValue, 0),
            avgProcessingDays: safeNumber(avgProcessingDays, 0),
        };
    }, [selectedTypesData]);

    // Enhanced bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedTypes.length === 0) {
            toast.error('Please select at least one clearance type');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'activate':
                    await router.post(route('clearance-types.bulk-activate'), {
                        ids: selectedTypes
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedTypes.length} clearance type(s) activated successfully`);
                            setSelectedTypes([]);
                            setShowBulkActivateDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to activate clearance types');
                            console.error('Activation errors:', errors);
                        }
                    });
                    break;

                case 'deactivate':
                    await router.post(route('clearance-types.bulk-deactivate'), {
                        ids: selectedTypes
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedTypes.length} clearance type(s) deactivated successfully`);
                            setSelectedTypes([]);
                            setShowBulkDeactivateDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to deactivate clearance types');
                            console.error('Deactivation errors:', errors);
                        }
                    });
                    break;

                case 'delete':
                    await router.post(route('clearance-types.bulk-delete'), {
                        ids: selectedTypes
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedTypes.length} clearance type(s) deleted successfully`);
                            setSelectedTypes([]);
                            setShowBulkDeleteDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to delete clearance types');
                            console.error('Delete errors:', errors);
                        }
                    });
                    break;

                case 'export':
                    // In a real app, you'd generate a CSV/Excel file
                    const exportData = selectedTypesData.map(type => ({
                        ID: type.id,
                        Name: type.name,
                        Code: type.code,
                        Description: type.description,
                        Fee: type.fee,
                        'Processing Days': type.processing_days,
                        'Validity Days': type.validity_days,
                        Active: type.is_active ? 'Yes' : 'No',
                        'Requires Payment': type.requires_payment ? 'Yes' : 'No',
                        'Requires Approval': type.requires_approval ? 'Yes' : 'No',
                        'Online Only': type.is_online_only ? 'Yes' : 'No',
                        'Created At': type.created_at,
                        'Updated At': type.updated_at,
                    }));
                    
                    // Convert to CSV
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                // Handle values that might contain commas
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
                    a.download = `clearance-types-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'duplicate':
                    if (confirm(`Duplicate ${selectedTypes.length} clearance type(s)? This will create copies with "- Copy" appended to the names.`)) {
                        await router.post(route('clearance-types.bulk-duplicate'), {
                            ids: selectedTypes
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedTypes.length} clearance type(s) duplicated successfully`);
                                setSelectedTypes([]);
                            },
                            onError: (errors) => {
                                toast.error('Failed to duplicate clearance types');
                                console.error('Duplicate errors:', errors);
                            }
                        });
                    }
                    break;

                case 'update':
                    await router.post(route('clearance-types.bulk-update'), {
                        ids: selectedTypes,
                        field: bulkEditField,
                        value: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedTypes.length} clearance type(s) updated successfully`);
                            setShowBulkEditDialog(false);
                            setBulkEditValue('');
                            setSelectedTypes([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update clearance types');
                            console.error('Update errors:', errors);
                        }
                    });
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

    // Smart bulk toggle status
    const handleSmartBulkToggle = () => {
        const hasInactive = selectedTypesData.some(t => !t.is_active);
        if (hasInactive) {
            setShowBulkActivateDialog(true);
        } else {
            setShowBulkDeactivateDialog(true);
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedTypesData.map(type => ({
            Name: type.name,
            Code: type.code,
            Fee: type.formatted_fee,
            Status: type.is_active ? 'Active' : 'Inactive',
            Processing: `${type.processing_days} days`,
            Issued: type.clearances_count || 0
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

    const handleFilterChange = (filterType: string, value: string) => {
        const params: any = {};
        
        if (filterType === 'status') {
            setStatusFilter(value);
            if (value !== 'all') params.status = value;
        } else if (filterType === 'requires_payment') {
            setPaymentFilter(value);
            if (value !== 'all') params.requires_payment = value;
        }
        
        if (searchTerm) params.search = searchTerm;
        
        router.get(route('clearance-types.index'), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPaymentFilter('all');
        router.get(route('clearance-types.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleToggleStatus = (type: ClearanceType) => {
        if (confirm(`Are you sure you want to ${type.is_active ? 'deactivate' : 'activate'} "${type.name}"?`)) {
            router.post(route('clearance-types.toggle-status', type.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Clearance type ${type.is_active ? 'deactivated' : 'activated'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to toggle status');
                },
            });
        }
    };

    const handleDuplicate = (type: ClearanceType) => {
        if (confirm(`Duplicate "${type.name}" clearance type?`)) {
            router.post(route('clearance-types.duplicate', type.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Clearance type duplicated successfully');
                },
                onError: () => {
                    toast.error('Failed to duplicate clearance type');
                },
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

    const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return isActive ? 'default' : 'secondary';
    };

    const getStatusIcon = (isActive: boolean) => {
        return isActive ? 
            <CheckCircle className="h-4 w-4 text-green-500" /> : 
            <XCircle className="h-4 w-4 text-gray-500" />;
    };

    const getPurposeOptionsCount = (type: ClearanceType) => {
        if (!type.purpose_options) return 0;
        return type.purpose_options.split(',').filter(opt => opt.trim() !== '').length;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || paymentFilter !== 'all';

    // Loading overlay
    if (isLoading) {
        return (
            <AppLayout
                title="Clearance Types"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Clearance Types', href: '/clearance-types' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                        <p className="mt-2 text-gray-500">Loading clearance types...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Clearance Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearance Types', href: '/clearance-types' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clearance Types</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage different types of clearances and certificates
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
                                    <p className="text-xs text-gray-500">Select multiple items for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Link href={route('clearance-types.create')}>
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Create Type</span>
                                    <span className="sm:hidden">Create</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                    Total Types
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    All clearance types
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    Active
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.active}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2 text-amber-500" />
                                    Paid Types
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.requires_payment}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.total > 0 ? Math.round((stats.requires_payment / stats.total) * 100) : 0}% of total
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-purple-500" />
                                    Needs Approval
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.requires_approval}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.total > 0 ? Math.round((stats.requires_approval / stats.total) * 100) : 0}% of total
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                                    <Globe className="h-4 w-4 mr-2 text-cyan-500" />
                                    Online Only
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.online_only}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.total > 0 ? Math.round((stats.online_only / stats.total) * 100) : 0}% of total
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
                                            placeholder="Search by name, code, or description... (Ctrl+F)"
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="border rounded px-3 py-2 text-sm w-28"
                                            value={statusFilter}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        
                                        <select
                                            className="border rounded px-3 py-2 text-sm w-32"
                                            value={paymentFilter}
                                            onChange={(e) => handleFilterChange('requires_payment', e.target.value)}
                                        >
                                            <option value="all">All Payment</option>
                                            <option value="yes">Paid</option>
                                            <option value="no">Free</option>
                                        </select>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="outline"
                                                    className="h-9"
                                                    onClick={() => {
                                                        // Export current filter results
                                                        const exportUrl = route('clearance-types.export', {
                                                            search: searchTerm || undefined,
                                                            status: statusFilter !== 'all' ? statusFilter : undefined,
                                                            requires_payment: paymentFilter !== 'all' ? paymentFilter : undefined,
                                                        });
                                                        window.open(exportUrl, '_blank');
                                                    }}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    <span className="hidden sm:inline">Export</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Export filtered results</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Active filters indicator and clear button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {clearanceTypes.from} to {clearanceTypes.to} of {clearanceTypes.total} types
                                        {searchTerm && ` matching "${searchTerm}"`}
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
                                                                Current Page ({clearanceTypes.data.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered (Filtered)
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({clearanceTypes.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedTypes([])}
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
                    {isBulkMode && selectedTypes.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedTypes.length} selected
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
                                                setSelectedTypes([]);
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
                                                    onClick={handleSmartBulkToggle}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    {selectedTypesData.some(t => !t.is_active) ? (
                                                        <>
                                                            <PlayCircle className="h-3.5 w-3.5 mr-1" />
                                                            Activate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PauseCircle className="h-3.5 w-3.5 mr-1" />
                                                            Deactivate
                                                        </>
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Smart toggle based on selection
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('export')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Download className="h-3.5 w-3.5 mr-1" />
                                                    Export
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Export selected items
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowBulkEditDialog(true)}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Bulk edit selected items
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
                                                        onClick={() => handleBulkOperation('duplicate')}
                                                    >
                                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                                        Duplicate
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
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Exit
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enhanced stats of selected items */}
                            {selectedTypesData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.active} active
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-3.5 w-3.5 text-gray-500" />
                                            <span>
                                                {selectionStats.inactive} inactive
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {selectionStats.paid} paid • {selectionStats.free} free
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-purple-500" />
                                            <span>
                                                {selectionStats.needsApproval} need approval
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-3.5 w-3.5 text-cyan-500" />
                                            <span>
                                                {selectionStats.onlineOnly} online only
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Timer className="h-3 w-3" />
                                            <span>Avg processing: {
                                                selectionStats.avgProcessingDays.toFixed(1)
                                            } days</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            <span>Total value: ${
                                                selectionStats.totalValue.toFixed(2)
                                            }</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Clearance Types Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Clearance Types
                                    {selectedTypes.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedTypes.length} selected
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
                                                <Rows className="h-4 w-4" />
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
                                    Page {clearanceTypes.current_page} of {clearanceTypes.last_page}
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
                                                                    checked={isSelectAll && clearanceTypes.data.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                                        <div className="flex items-center gap-1">
                                                            Name & Details
                                                            <button
                                                                onClick={() => handleSort('name')}
                                                                className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                                                title="Sort by name"
                                                            >
                                                                <ArrowUpDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        <div className="flex items-center gap-1">
                                                            Fee
                                                            <button
                                                                onClick={() => handleSort('fee')}
                                                                className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                                                title="Sort by fee"
                                                            >
                                                                <ArrowUpDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        Processing
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        Validity
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        <div className="flex items-center gap-1">
                                                            Issued
                                                            <button
                                                                onClick={() => handleSort('clearances_count')}
                                                                className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                                                title="Sort by issued count"
                                                            >
                                                                <ArrowUpDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {clearanceTypes.data.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 7 : 6} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No clearance types found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by creating a clearance type.'}
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
                                                                    <Link href={route('clearance-types.create')}>
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Create Type
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    clearanceTypes.data.map((type) => {
                                                        const nameLength = getTruncationLength('name');
                                                        const descLength = getTruncationLength('description');
                                                        const codeLength = getTruncationLength('code');
                                                        const isSelected = selectedTypes.includes(type.id);
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={type.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                }`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(type.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleItemSelect(type.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
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
                                                                        title={`Double-click to select all\nName: ${type.name}\nCode: ${type.code}\nDescription: ${type.description}`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div 
                                                                                className="font-medium text-gray-900 dark:text-white truncate"
                                                                                data-full-text={type.name}
                                                                            >
                                                                                {truncateText(type.name, nameLength)}
                                                                            </div>
                                                                            <Badge 
                                                                                variant={getStatusBadgeVariant(type.is_active)}
                                                                                className="flex items-center gap-1"
                                                                            >
                                                                                {getStatusIcon(type.is_active)}
                                                                                {type.is_active ? 'Active' : 'Inactive'}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <code 
                                                                                className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 truncate"
                                                                                data-full-text={type.code}
                                                                            >
                                                                                {truncateText(type.code, codeLength)}
                                                                            </code>
                                                                            {type.requires_payment && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                                                    Paid
                                                                                </Badge>
                                                                            )}
                                                                            {type.requires_approval && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                                    Approval
                                                                                </Badge>
                                                                            )}
                                                                            {type.is_online_only && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    <Globe className="h-3 w-3 mr-1" />
                                                                                    Online
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div 
                                                                            className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1"
                                                                            data-full-text={type.description}
                                                                        >
                                                                            {truncateText(type.description, descLength)}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                            <div className="flex items-center gap-1">
                                                                                <FileText className="h-3 w-3" />
                                                                                <span>{type.document_types_count || 0} docs</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <CopyCheck className="h-3 w-3" />
                                                                                <span>{getPurposeOptionsCount(type)} purposes</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="font-medium text-gray-900 dark:text-white truncate" title={type.formatted_fee}>
                                                                        {type.formatted_fee}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <span>{type.processing_days} day{type.processing_days !== 1 ? 's' : ''}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <span>{type.validity_days} day{type.validity_days !== 1 ? 's' : ''}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                        <span className="font-medium">{type.clearances_count || 0}</span>
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
                                                                                <Link href={route('clearance-types.show', type.id)} className="flex items-center cursor-pointer">
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>View Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('clearance-types.edit', type.id)} className="flex items-center cursor-pointer">
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Edit Type</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('clearances.create', { type: type.id })} className="flex items-center cursor-pointer">
                                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                                    <span>Issue Clearance</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleCopyToClipboard(type.code, 'Clearance Type Code');
                                                                                }}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Code</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleCopyToClipboard(type.name, 'Clearance Type Name');
                                                                                }}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Name</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('clearance-types.print', type.id)} className="flex items-center cursor-pointer">
                                                                                    <Printer className="mr-2 h-4 w-4" />
                                                                                    <span>Print Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuItem 
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleItemSelect(type.id);
                                                                                        }}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        {isSelected ? (
                                                                                            <>
                                                                                                <CheckSquare className="mr-2 h-4 w-4" />
                                                                                                <span>Deselect</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Square className="mr-2 h-4 w-4" />
                                                                                                <span>Select</span>
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuSeparator />
                                                                                </>
                                                                            )}
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDuplicate(type);
                                                                                }}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Duplicate Type</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleToggleStatus(type);
                                                                                }}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                {type.is_active ? (
                                                                                    <>
                                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                                        <span>Deactivate</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                                        <span>Activate</span>
                                                                                    </>
                                                                                )}
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem 
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
                                                                                        router.delete(route('clearance-types.destroy', type.id));
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete Type</span>
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

                            {/* Enhanced Pagination */}
                            {clearanceTypes.last_page > 1 && (
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        Showing {clearanceTypes.from} to {clearanceTypes.to} of {clearanceTypes.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(clearanceTypes.links[0].url || '')}
                                            disabled={!clearanceTypes.links[0].url}
                                            className="h-8"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        
                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {clearanceTypes.links.slice(1, -1).map((link, index) => {
                                                if (link.label === '...') {
                                                    return (
                                                        <span key={`ellipsis-${index}`} className="px-2">...</span>
                                                    );
                                                }
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(link.url || '')}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {link.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Next Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(clearanceTypes.links[clearanceTypes.links.length - 1].url || '')}
                                            disabled={!clearanceTypes.links[clearanceTypes.links.length - 1].url}
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
                        <AlertDialogTitle>Delete Selected Clearance Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedTypes.length} selected clearance type{selectedTypes.length !== 1 ? 's' : ''}?
                            This action cannot be undone. This will permanently delete the clearance types
                            and remove them from our servers.
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

            {/* Bulk Activate Confirmation Dialog */}
            <AlertDialog open={showBulkActivateDialog} onOpenChange={setShowBulkActivateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Activate Selected Clearance Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to activate {selectedTypes.length} selected clearance type{selectedTypes.length !== 1 ? 's' : ''}?
                            Activated clearance types will be available for use.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('activate')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Activating...
                                </>
                            ) : (
                                'Activate Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Deactivate Confirmation Dialog */}
            <AlertDialog open={showBulkDeactivateDialog} onOpenChange={setShowBulkDeactivateDialog}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate Selected Clearance Types</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to deactivate {selectedTypes.length} selected clearance type{selectedTypes.length !== 1 ? 's' : ''}?
                        Deactivated clearance types will not be available for new requests.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleBulkOperation('deactivate')}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={isPerformingBulkAction}
                    >
                        {isPerformingBulkAction ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deactivating...
                            </>
                        ) : (
                            'Deactivate Selected'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Edit Dialog */}
            <AlertDialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Edit Selected Items</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update {selectedTypes.length} selected clearance types at once.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Field to Update</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditField}
                                onChange={(e) => {
                                    setBulkEditField(e.target.value as BulkEditField);
                                    setBulkEditValue('');
                                }}
                            >
                                <option value="processing_days">Processing Days</option>
                                <option value="validity_days">Validity Days</option>
                                <option value="fee">Fee Amount</option>
                                <option value="requires_payment">Payment Requirement</option>
                                <option value="requires_approval">Approval Requirement</option>
                                <option value="is_online_only">Online Only</option>
                            </select>
                        </div>
                        <div>
                            <Label>
                                New Value
                                {['requires_payment', 'requires_approval', 'is_online_only'].includes(bulkEditField) && (
                                    <span className="text-sm text-gray-500 ml-2">(Toggle on/off)</span>
                                )}
                            </Label>
                            {['requires_payment', 'requires_approval', 'is_online_only'].includes(bulkEditField) ? (
                                <div className="flex items-center gap-4 mt-2">
                                    <Button
                                        variant={bulkEditValue === true ? "default" : "outline"}
                                        onClick={() => setBulkEditValue(true)}
                                        className="flex-1"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Enable
                                    </Button>
                                    <Button
                                        variant={bulkEditValue === false ? "destructive" : "outline"}
                                        onClick={() => setBulkEditValue(false)}
                                        className="flex-1"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Disable
                                    </Button>
                                </div>
                            ) : (
                                <Input
                                    type="number"
                                    value={bulkEditValue as string | number}
                                    onChange={(e) => setBulkEditValue(e.target.value)}
                                    min={bulkEditField === 'fee' ? 0 : 1}
                                    placeholder={`Enter new ${bulkEditField.replace('_', ' ')}`}
                                />
                            )}
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">This will affect:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectedTypes.length} clearance types</li>
                                <li>{selectionStats.active} active types</li>
                                <li>{selectionStats.paid} paid types</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update')}
                            disabled={isPerformingBulkAction || bulkEditValue === ''}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}