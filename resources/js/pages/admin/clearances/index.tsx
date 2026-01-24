import { useState, useEffect, useMemo, ChangeEvent, JSX, useRef, useCallback } from 'react';
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
    Copy,
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
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowUpDown,
    FileSpreadsheet,
    Mail,
    CheckCheck,
    Ban,
    Archive,
    Send,
    ExternalLink,
    BarChart3,
    Package,
    List,
    Settings,
    EyeOff,
    ChevronDown,
    MoreHorizontal,
    FileEdit,
    FileUp,
    Type,
    PlusCircle,
    MinusCircle,
    Save,
    Upload,
    Sheet
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

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

interface PageProps {
    clearances: PaginatedClearances;
    stats?: Stats;
    clearanceTypes: ClearanceType[];
    filters?: Filters;
    statusOptions?: StatusOption[];
}

// Bulk operation types
type BulkOperation = 'process' | 'approve' | 'issue' | 'reject' | 'cancel' | 'delete' | 'export' | 'print' | 'resend' | 'update_status';

// Bulk edit field types
type BulkEditField = 'status' | 'urgency';

declare module '@inertiajs/react' {
    interface PageProps {
        clearances: PageProps['clearances'];
        stats: PageProps['stats'];
        clearanceTypes: PageProps['clearanceTypes'];
        filters: PageProps['filters'];
        statusOptions: PageProps['statusOptions'];
    }
}

// Safe number conversion helper
const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// Safe toFixed helper
const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
};

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

export default function Clearances() {
    const { props } = usePage<PageProps>();
    const { clearances, stats = {}, clearanceTypes = [], filters = {}, statusOptions = [] } = props;
    
    // Initialize state
    const [searchTerm, setSearchTerm] = useState<string>(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || '');
    const [typeFilter, setTypeFilter] = useState<string>(filters?.type || '');
    const [urgencyFilter, setUrgencyFilter] = useState<string>(filters?.urgency || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedClearances, setSelectedClearances] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkProcessDialog, setShowBulkProcessDialog] = useState(false);
    const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
    const [showBulkIssueDialog, setShowBulkIssueDialog] = useState(false);
    const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
    const [showBulkCancelDialog, setShowBulkCancelDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    // Custom hook for responsive truncation
    const { getMaxLength } = useResponsiveTruncation();

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
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.type = typeFilter;
            if (urgencyFilter) params.urgency = urgencyFilter;
            
            router.get('/clearances', params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        }, 500),
        [statusFilter, typeFilter, urgencyFilter]
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
                    if (selectedClearances.length > 0) {
                        setSelectedClearances([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedClearances.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedClearances, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedClearances([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

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

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = clearances.data.map(clearance => clearance.id);
        if (isSelectAll) {
            setSelectedClearances(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedClearances, ...pageIds])];
            setSelectedClearances(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items (client-side filtered)
    const handleSelectAllFiltered = () => {
        // Filter the current page data
        const filteredData = clearances.data.filter(clearance => {
            let matches = true;
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                matches = matches && (
                    clearance.reference_number.toLowerCase().includes(searchLower) ||
                    clearance.clearance_number?.toLowerCase().includes(searchLower) ||
                    clearance.purpose.toLowerCase().includes(searchLower) ||
                    clearance.resident?.full_name?.toLowerCase().includes(searchLower)
                );
            }
            if (statusFilter) {
                matches = matches && clearance.status === statusFilter;
            }
            if (typeFilter) {
                matches = matches && clearance.clearance_type_id.toString() === typeFilter;
            }
            if (urgencyFilter) {
                matches = matches && clearance.urgency === urgencyFilter;
            }
            return matches;
        });
        
        const allIds = filteredData.map(clearance => clearance.id);
        if (selectedClearances.length === allIds.length && allIds.every(id => selectedClearances.includes(id))) {
            setSelectedClearances(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedClearances, ...allIds])];
            setSelectedClearances(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${clearances.total} clearance requests. This action may take a moment.`)) {
            // For now, just select all on current page
            // In production, you'd make an API call to get all IDs
            const pageIds = clearances.data.map(clearance => clearance.id);
            setSelectedClearances(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page. For full selection, implement server-side API.');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedClearances(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = clearances.data.map(clearance => clearance.id);
        const allSelected = allPageIds.every(id => selectedClearances.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedClearances, clearances.data]);

    // Get selected clearances data
    const selectedClearancesData = useMemo(() => {
        return clearances.data.filter(clearance => selectedClearances.includes(clearance.id));
    }, [selectedClearances, clearances.data]);

    // Calculate selection stats - FIXED VERSION
    const selectionStats = useMemo(() => {
        const selectedData = selectedClearancesData;
        
        // Safely calculate total value
        const totalValue = selectedData.reduce((sum, c) => {
            return sum + safeNumber(c.fee_amount, 0);
        }, 0);
        
        // Safely calculate average value
        let avgValue = 0;
        if (selectedData.length > 0) {
            avgValue = totalValue / selectedData.length;
        }
        
        return {
            pending: selectedData.filter(c => c.status === 'pending').length,
            pendingPayment: selectedData.filter(c => c.status === 'pending_payment').length,
            processing: selectedData.filter(c => c.status === 'processing').length,
            approved: selectedData.filter(c => c.status === 'approved').length,
            issued: selectedData.filter(c => c.status === 'issued').length,
            rejected: selectedData.filter(c => c.status === 'rejected').length,
            cancelled: selectedData.filter(c => c.status === 'cancelled').length,
            expired: selectedData.filter(c => c.status === 'expired').length,
            express: selectedData.filter(c => c.urgency === 'express').length,
            rush: selectedData.filter(c => c.urgency === 'rush').length,
            normal: selectedData.filter(c => c.urgency === 'normal').length,
            totalValue: totalValue, // This is now guaranteed to be a number
            avgValue: avgValue,     // This is now guaranteed to be a number
        };
    }, [selectedClearancesData]);

    // Enhanced bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedClearances.length === 0) {
            toast.error('Please select at least one clearance request');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'process':
                    await router.post('/clearances/bulk-process', {
                        ids: selectedClearances
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedClearances.length} clearance(s) marked as processing`);
                            setSelectedClearances([]);
                            setShowBulkProcessDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to process clearances');
                            console.error('Process errors:', errors);
                        }
                    });
                    break;

                case 'approve':
                    await router.post('/clearances/bulk-approve', {
                        ids: selectedClearances
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedClearances.length} clearance(s) approved`);
                            setSelectedClearances([]);
                            setShowBulkApproveDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to approve clearances');
                            console.error('Approve errors:', errors);
                        }
                    });
                    break;

                case 'issue':
                    await router.post('/clearances/bulk-issue', {
                        ids: selectedClearances
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedClearances.length} clearance(s) issued`);
                            setSelectedClearances([]);
                            setShowBulkIssueDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to issue clearances');
                            console.error('Issue errors:', errors);
                        }
                    });
                    break;

                case 'reject':
                    await router.post('/clearances/bulk-reject', {
                        ids: selectedClearances,
                        reason: customData?.reason || 'Bulk rejection'
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedClearances.length} clearance(s) rejected`);
                            setSelectedClearances([]);
                            setShowBulkRejectDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to reject clearances');
                            console.error('Reject errors:', errors);
                        }
                    });
                    break;

                case 'cancel':
                    await router.post('/clearances/bulk-cancel', {
                        ids: selectedClearances,
                        reason: customData?.reason || 'Bulk cancellation'
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedClearances.length} clearance(s) cancelled`);
                            setSelectedClearances([]);
                            setShowBulkCancelDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to cancel clearances');
                            console.error('Cancel errors:', errors);
                        }
                    });
                    break;

                case 'delete':
                    await router.post('/clearances/bulk-delete', {
                        ids: selectedClearances
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedClearances.length} clearance(s) deleted`);
                            setSelectedClearances([]);
                            setShowBulkDeleteDialog(false);
                        },
                        onError: (errors) => {
                            toast.error('Failed to delete clearances');
                            console.error('Delete errors:', errors);
                        }
                    });
                    break;

                case 'export':
                    // Export to CSV
                    const exportData = selectedClearancesData.map(clearance => ({
                        'Reference Number': clearance.reference_number,
                        'Clearance Number': clearance.clearance_number || '',
                        'Resident Name': clearance.resident?.full_name || '',
                        'Clearance Type': clearance.clearance_type?.name || '',
                        'Purpose': clearance.purpose,
                        'Fee Amount': clearance.fee_amount,
                        'Urgency': clearance.urgency,
                        'Status': clearance.status,
                        'Issue Date': clearance.issue_date || '',
                        'Valid Until': clearance.valid_until || '',
                        'Created At': clearance.created_at,
                        'Issuing Officer': clearance.issuing_officer_name || '',
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
                    a.download = `clearances-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'print':
                    // Open print preview for each selected clearance
                    selectedClearances.forEach(id => {
                        window.open(`/clearances/${id}/print`, '_blank');
                    });
                    toast.success(`${selectedClearances.length} clearance(s) opened for printing`);
                    break;

                case 'update_status':
                    await router.post('/clearances/bulk-update-status', {
                        ids: selectedClearances,
                        status: bulkEditValue
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`${selectedClearances.length} clearance(s) status updated`);
                            setShowBulkStatusDialog(false);
                            setBulkEditValue('');
                            setSelectedClearances([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update status');
                            console.error('Status update errors:', errors);
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

    // Smart bulk action based on selection
    const handleSmartBulkAction = () => {
        const hasPendingPayment = selectedClearancesData.some(c => c.status === 'pending_payment');
        const hasPending = selectedClearancesData.some(c => c.status === 'pending');
        const hasProcessing = selectedClearancesData.some(c => c.status === 'processing');
        const hasApproved = selectedClearancesData.some(c => c.status === 'approved');
        
        if (hasPendingPayment) {
            toast.info('Selected items include pending payments. Consider processing payments first.');
        } else if (hasPending) {
            setShowBulkProcessDialog(true);
        } else if (hasProcessing) {
            setShowBulkApproveDialog(true);
        } else if (hasApproved) {
            setShowBulkIssueDialog(true);
        } else {
            toast.info('Select items with appropriate status for bulk actions');
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedClearancesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedClearancesData.map(clearance => ({
            Reference: clearance.reference_number,
            'Clearance #': clearance.clearance_number || '',
            Resident: clearance.resident?.full_name || '',
            Type: clearance.clearance_type?.name || '',
            Status: clearance.status,
            Fee: `₱${safeToFixed(clearance.fee_amount)}`,
            Urgency: clearance.urgency
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

    // Handle filter changes
    const handleFilterChange = (filterType: string, value: string) => {
        const params: any = {};
        
        if (filterType === 'status') {
            setStatusFilter(value);
            if (value) params.status = value;
        } else if (filterType === 'type') {
            setTypeFilter(value);
            if (value) params.type = value;
        } else if (filterType === 'urgency') {
            setUrgencyFilter(value);
            if (value) params.urgency = value;
        }
        
        if (searchTerm) params.search = searchTerm;
        
        router.get('/clearances', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        handleFilterChange('status', e.target.value);
    };

    const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        handleFilterChange('type', e.target.value);
    };

    const handleUrgencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
        handleFilterChange('urgency', e.target.value);
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setTypeFilter('');
        setUrgencyFilter('');
        router.get('/clearances', {}, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle copy to clipboard
    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
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

    // Get urgency display
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

    const hasActiveFilters = searchTerm || statusFilter || typeFilter || urgencyFilter;

    // Handle Record Payment Click
    const handleRecordPayment = (clearance: ClearanceRequest) => {
        // Store clearance data in session storage
        const clearanceData = {
            clearance_request_id: clearance.id,
            resident_id: clearance.resident_id,
            amount: clearance.fee_amount,
            type: 'clearance',
            reference: clearance.reference_number,
            clearance_type_id: clearance.clearance_type_id,
            purpose: clearance.purpose,
            specific_purpose: clearance.specific_purpose || '',
            resident_name: clearance.resident?.full_name,
            clearance_type_name: clearance.clearance_type?.name
        };
        
        // Store in sessionStorage
        sessionStorage.setItem('pending_clearance_payment', JSON.stringify(clearanceData));
        
        // Redirect to payments create page
        window.location.href = '/payments/create';
    };

    return (
        <AppLayout
            title="Clearance Requests"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearances', href: '/clearances' }
            ]}
        >
            <TooltipProvider>
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsBulkMode(!isBulkMode)}
                                        className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                                        disabled={isLoading}
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
                                <div className="text-xl sm:text-2xl font-bold">{safeNumber(stats?.totalIssued).toLocaleString()}</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {safeNumber(stats?.issuedThisMonth)} this month
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
                                <div className="text-xl sm:text-2xl font-bold">{safeNumber(stats?.pending).toLocaleString()}</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {safeNumber(stats?.pendingToday)} new today
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
                                    {safeNumber(stats?.expressRequests) + safeNumber(stats?.rushRequests)}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Zap className="h-3 w-3 text-red-500" />
                                        {safeNumber(stats?.expressRequests)} Express
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                                        {safeNumber(stats?.rushRequests)} Rush
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
                                    ₱{safeNumber(stats?.totalRevenue).toLocaleString('en-PH', {
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

                    {/* Search and Filters */}
                    <Card className="overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            ref={searchInputRef}
                                            placeholder="Search by reference, name, clearance number... (Ctrl+F)"
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        {searchTerm && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => setSearchTerm('')}
                                                disabled={isLoading}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
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
                                                {clearanceTypes.filter(type => type.is_active).map((type) => (
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
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={handleExport}
                                                    disabled={isLoading || clearances.data.length === 0}
                                                    size="sm"
                                                    className="h-9"
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
                                        Showing {clearances.from} to {clearances.to} of {clearances.total} requests
                                        {searchTerm && ` matching "${searchTerm}"`}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearFilters}
                                                className="text-red-600 hover:text-red-700 h-8"
                                                disabled={isLoading}
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
                                                    disabled={isLoading}
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
                                                                Current Page ({clearances.data.length})
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
                                                                All ({clearances.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedClearances([])}
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
                    {isBulkMode && selectedClearances.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedClearances.length} selected
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
                                                setSelectedClearances([]);
                                                setIsSelectAll(false);
                                            }}
                                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            disabled={isPerformingBulkAction}
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
                                                    disabled={isPerformingBulkAction}
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
                                                    onClick={handleSmartBulkAction}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                                    Process
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Smart action based on selection status
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
                                                    onClick={() => setShowBulkStatusDialog(true)}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    Status
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Bulk update status
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
                                                        onClick={() => handleBulkOperation('print')}
                                                    >
                                                        <Printer className="h-3.5 w-3.5 mr-2" />
                                                        Print Selected
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => setShowBulkApproveDialog(true)}
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" />
                                                        <span className="text-green-600">Approve</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => setShowBulkIssueDialog(true)}
                                                    >
                                                        <Check className="h-3.5 w-3.5 mr-2 text-green-600" />
                                                        <span className="text-green-600">Issue</span>
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
                            {selectedClearancesData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {selectionStats.pending + selectionStats.pendingPayment} pending
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.processing} processing
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.approved + selectionStats.issued} approved/issued
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-3.5 w-3.5 text-purple-500" />
                                            <span>
                                                Total: ₱{safeToFixed(selectionStats.totalValue)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Zap className="h-3 w-3 text-red-500" />
                                            <span>Express: {selectionStats.express}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                                            <span>Rush: {selectionStats.rush}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Clearances Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Clearance Requests
                                    {selectedClearances.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedClearances.length} selected
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
                                                disabled={isLoading}
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
                                                disabled={isLoading}
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
                                                    disabled={isLoading}
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
                                    Page {clearances.current_page} of {clearances.last_page}
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
                                                                    checked={isSelectAll && clearances.data.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                    disabled={isLoading}
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                        <div className="flex items-center gap-1">
                                                            Reference No.
                                                            <button
                                                                onClick={() => {
                                                                    const params: any = { ...filters };
                                                                    const direction = params.sort === 'reference_number' && params.direction === 'asc' ? 'desc' : 'asc';
                                                                    params.sort = 'reference_number';
                                                                    params.direction = direction;
                                                                    
                                                                    router.get('/clearances', params, {
                                                                        preserveState: true,
                                                                        preserveScroll: true,
                                                                    });
                                                                }}
                                                                className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                                                title="Sort by reference"
                                                                disabled={isLoading}
                                                            >
                                                                <ArrowUpDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
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
                                                {clearances.data.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 7 : 6} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No clearance requests found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by creating a clearance request.'}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    {hasActiveFilters && (
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={clearFilters}
                                                                            className="h-8"
                                                                            disabled={isLoading}
                                                                        >
                                                                            Clear Filters
                                                                        </Button>
                                                                    )}
                                                                    <Link href="/clearances/create">
                                                                        <Button className="h-8" disabled={isLoading}>
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Create Request
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    clearances.data.map((clearance) => {
                                                        if (!clearance) return null;
                                                        
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
                                                        const isSelected = selectedClearances.includes(clearance.id);
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={clearance.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                } ${isPriorityUrgency(clearance.urgency) ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(clearance.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleItemSelect(clearance.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                                disabled={isLoading}
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
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
                                                                            ₱{safeNumber(clearance.fee_amount, 0).toLocaleString('en-PH', {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2
                                                                            })}
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
                                                                                onClick={(e) => e.stopPropagation()}
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
                                                                                <DropdownMenuItem 
                                                                                    className="flex items-center cursor-pointer"
                                                                                    onClick={() => handleRecordPayment(clearance)}
                                                                                >
                                                                                    <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                                                                    <span className="text-green-600 font-medium">Record Payment</span>
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
                                                                                onClick={() => handleCopyToClipboard(clearance.reference_number, 'Reference Number')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Reference</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(clearance.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        {isSelected ? (
                                                                                            <>
                                                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                                                <span className="text-green-600">Deselect</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                                                                <span>Select for Bulk</span>
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                            
                                                                            {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                                                                <DropdownMenuItem 
                                                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                    onClick={() => {
                                                                                        if (confirm('Are you sure you want to cancel this request?')) {
                                                                                            router.delete(`/clearances/${clearance.id}`, {
                                                                                                preserveScroll: true,
                                                                                            });
                                                                                        }
                                                                                    }}
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
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Pagination */}
                            {clearances.last_page > 1 && (
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        Showing {clearances.from} to {clearances.to} of {clearances.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (clearances.prev_page_url) {
                                                    router.get(clearances.prev_page_url, {}, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        onStart: () => setIsLoading(true),
                                                        onFinish: () => setIsLoading(false),
                                                    });
                                                }
                                            }}
                                            disabled={!clearances.prev_page_url || isLoading}
                                            className="h-8"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        
                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {clearances.links.slice(1, -1).map((link, index) => {
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
                                                        onClick={() => {
                                                            if (link.url) {
                                                                router.get(link.url, {}, {
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                    onStart: () => setIsLoading(true),
                                                                    onFinish: () => setIsLoading(false),
                                                                });
                                                            }
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                        disabled={!link.url || isLoading || link.active}
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
                                            onClick={() => {
                                                if (clearances.next_page_url) {
                                                    router.get(clearances.next_page_url, {}, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        onStart: () => setIsLoading(true),
                                                        onFinish: () => setIsLoading(false),
                                                    });
                                                }
                                            }}
                                            disabled={!clearances.next_page_url || isLoading}
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
                        <AlertDialogTitle>Delete Selected Clearance Requests</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedClearances.length} selected clearance request{selectedClearances.length !== 1 ? 's' : ''}?
                            This action cannot be undone. Only pending and processing requests can be deleted.
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

            {/* Bulk Process Confirmation Dialog */}
            <AlertDialog open={showBulkProcessDialog} onOpenChange={setShowBulkProcessDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Process Selected Clearance Requests</AlertDialogTitle>
                        <AlertDialogDescription>
                            Mark {selectedClearances.length} selected clearance request{selectedClearances.length !== 1 ? 's' : ''} as "Processing"?
                            This will move them to the next stage in the workflow.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('process')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Mark as Processing'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Approve Confirmation Dialog */}
            <AlertDialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Selected Clearance Requests</AlertDialogTitle>
                        <AlertDialogDescription>
                            Approve {selectedClearances.length} selected clearance request{selectedClearances.length !== 1 ? 's' : ''}?
                            Approved requests are ready to be issued.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('approve')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                'Approve Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Issue Confirmation Dialog */}
            <AlertDialog open={showBulkIssueDialog} onOpenChange={setShowBulkIssueDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Issue Selected Clearance Requests</AlertDialogTitle>
                        <AlertDialogDescription>
                            Issue {selectedClearances.length} selected clearance request{selectedClearances.length !== 1 ? 's' : ''}?
                            Issued clearances will be marked as completed and ready for pickup.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('issue')}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Issuing...
                                </>
                            ) : (
                                'Issue Selected'
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
                            Update status for {selectedClearances.length} selected clearance requests.
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
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectedClearances.length} total requests</li>
                                <li>{selectionStats.pending} pending</li>
                                <li>{selectionStats.processing} processing</li>
                                <li>{selectionStats.approved} approved</li>
                                <li>{selectionStats.issued} issued</li>
                                <li>Total value: ₱{safeToFixed(selectionStats.totalValue)}</li>
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