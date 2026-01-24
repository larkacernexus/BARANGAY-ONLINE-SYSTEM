import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    FileText,
    DollarSign,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    MoreVertical,
    Download,
    Upload,
    Copy,
    RefreshCw,
    AlertCircle,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Hash,
    Tag,
    AlertTriangle,
    User,
    Heart,
    HeartPulse,
    GraduationCap,
    Briefcase,
    Award,
    ShieldCheck,
    Scale,
    Home,
    CreditCard,
    AlertTriangle as AlertTriangleIcon,
    Car,
    Hammer,
    FileQuestion,
    Layers,
    MousePointer,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    FileSpreadsheet,
    Printer,
    Mail,
    Clipboard,
    PackageCheck,
    PackageX,
    RotateCcw,
    Rows,
    KeyRound,
    Loader2,
    Settings,
    List,
    Grid3X3,
    Square,
    CheckSquare,
    FilterX,
    AlertCircle as AlertCircleIcon,
    BarChart3,
    Shield,
    Globe,
    Zap,
    Clock
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DocumentCategory {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    order: number;
    is_active: boolean;
}

interface FeeType {
    id: number;
    code: string;
    name: string;
    short_name: string;
    document_category_id: number | null;
    document_category?: DocumentCategory;
    base_amount: number | string | null;
    amount_type: string;
    frequency: string;
    validity_days: number | null;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    created_at: string;
    updated_at: string;
    description?: string;
    has_surcharge: boolean;
    has_penalty: boolean;
    has_senior_discount: boolean;
    has_pwd_discount: boolean;
    has_solo_parent_discount: boolean;
    has_indigent_discount: boolean;
}

interface PageProps {
    feeTypes?: FeeType[] | null;
    categories?: Record<string, string>;
    filters?: {
        search?: string;
        category?: string;
        status?: string;
    };
    errors?: Record<string, string>;
}

// Bulk operation types
type BulkOperation = 'export' | 'print' | 'delete' | 'activate' | 'deactivate' | 'update_category' | 'export_csv' | 'export_pdf' | 'duplicate' | 'generate_reports' | 'send_message';

// Bulk edit field types
type BulkEditField = 'status' | 'category';

declare module '@inertiajs/react' {
    interface PageProps {
        feeTypes: FeeType[];
        categories: Record<string, string>;
        filters: {
            search?: string;
            category?: string;
            status?: string;
        };
    }
}

// Helper functions
const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined || amount === '') {
        return '₱0.00';
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    
    if (isNaN(numAmount)) {
        return '₱0.00';
    }
    
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return <Tag className="h-4 w-4" />;
    
    const iconMap: Record<string, React.ReactNode> = {
        'User': <User className="h-4 w-4" />,
        'Heart': <Heart className="h-4 w-4" />,
        'FileText': <FileText className="h-4 w-4" />,
        'HeartPulse': <HeartPulse className="h-4 w-4" />,
        'GraduationCap': <GraduationCap className="h-4 w-4" />,
        'Briefcase': <Briefcase className="h-4 w-4" />,
        'Award': <Award className="h-4 w-4" />,
        'ShieldCheck': <ShieldCheck className="h-4 w-4" />,
        'Scale': <Scale className="h-4 w-4" />,
        'Home': <Home className="h-4 w-4" />,
        'Users': <Users className="h-4 w-4" />,
        'CreditCard': <CreditCard className="h-4 w-4" />,
        'AlertTriangle': <AlertTriangleIcon className="h-4 w-4" />,
        'Car': <Car className="h-4 w-4" />,
        'Hammer': <Hammer className="h-4 w-4" />,
        'FileQuestion': <FileQuestion className="h-4 w-4" />,
        'DollarSign': <DollarSign className="h-4 w-4" />,
        'Calendar': <Calendar className="h-4 w-4" />,
    };
    
    return iconMap[iconName] || <Tag className="h-4 w-4" />;
};

const getCategoryColor = (color?: string) => {
    if (!color) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    const colorMap: Record<string, string> = {
        'purple': 'bg-purple-100 text-purple-800 border-purple-200',
        'pink': 'bg-pink-100 text-pink-800 border-pink-200',
        'green': 'bg-green-100 text-green-800 border-green-200',
        'red': 'bg-red-100 text-red-800 border-red-200',
        'amber': 'bg-amber-100 text-amber-800 border-amber-200',
        'indigo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'blue': 'bg-blue-100 text-blue-800 border-blue-200',
        'orange': 'bg-orange-100 text-orange-800 border-orange-200',
        'gray': 'bg-gray-100 text-gray-800 border-gray-200',
        'teal': 'bg-teal-100 text-teal-800 border-teal-200',
        'cyan': 'bg-cyan-100 text-cyan-800 border-cyan-200',
        'violet': 'bg-violet-100 text-violet-800 border-violet-200',
        'lime': 'bg-lime-100 text-lime-800 border-lime-200',
        'rose': 'bg-rose-100 text-rose-800 border-rose-200',
        'sky': 'bg-sky-100 text-sky-800 border-sky-200',
        'stone': 'bg-stone-100 text-stone-800 border-stone-200',
        'slate': 'bg-slate-100 text-slate-800 border-slate-200',
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function FeeTypesIndex({ 
    feeTypes = [], 
    categories = {},
    filters = {},
}: PageProps) {
    const safeFeeTypes = Array.isArray(feeTypes) ? feeTypes : [];
    
    // Initialize state
    const [searchQuery, setSearchQuery] = useState<string>(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    
    // Bulk mode states
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedFeeTypes, setSelectedFeeTypes] = useState<number[]>([]);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkCategoryDialog, setShowBulkCategoryDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    
    // Refs
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter and sort fee types (client-side)
    const filteredFeeTypes = useMemo(() => {
        let filtered = [...safeFeeTypes];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(feeType =>
                feeType.code?.toLowerCase().includes(query) ||
                feeType.name?.toLowerCase().includes(query) ||
                feeType.short_name?.toLowerCase().includes(query) ||
                feeType.description?.toLowerCase().includes(query) ||
                feeType.document_category?.name?.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            const categoryId = parseInt(selectedCategory);
            filtered = filtered.filter(feeType => feeType.document_category_id === categoryId);
        }

        // Apply status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(feeType => 
                selectedStatus === 'active' ? feeType.is_active : !feeType.is_active
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sortField as keyof FeeType];
            let bValue: any = b[sortField as keyof FeeType];

            if (sortField === 'base_amount') {
                const aNum = typeof a.base_amount === 'string' ? parseFloat(a.base_amount) : Number(a.base_amount);
                const bNum = typeof b.base_amount === 'string' ? parseFloat(b.base_amount) : Number(b.base_amount);
                aValue = isNaN(aNum) ? 0 : aNum;
                bValue = isNaN(bNum) ? 0 : bNum;
            } else if (sortField === 'created_at') {
                aValue = new Date(a.created_at || '').getTime();
                bValue = new Date(b.created_at || '').getTime();
            } else if (sortField === 'name') {
                aValue = a.name || '';
                bValue = b.name || '';
            } else if (sortField === 'code') {
                aValue = a.code || '';
                bValue = b.code || '';
            } else if (sortField === 'category') {
                const aCategoryName = a.document_category?.name || '';
                const bCategoryName = b.document_category?.name || '';
                aValue = aCategoryName.toLowerCase();
                bValue = bCategoryName.toLowerCase();
            }

            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [safeFeeTypes, searchQuery, selectedCategory, selectedStatus, sortField, sortDirection]);

    // Calculate pagination
    const totalItems = filteredFeeTypes.length;
    const totalPages = Math.ceil(filteredFeeTypes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFeeTypes = filteredFeeTypes.slice(startIndex, endIndex);

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedFeeTypes([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedFeeTypes.map(feeType => feeType.id);
        const allSelected = allPageIds.every(id => selectedFeeTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedFeeTypes, paginatedFeeTypes]);

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
            // Escape to exit bulk mode
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedFeeTypes.length > 0) {
                        setSelectedFeeTypes([]);
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
            if (e.key === 'Delete' && isBulkMode && selectedFeeTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedFeeTypes, showBulkActions, showSelectionOptions]);

    // Handle sort
    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField, sortDirection]);

    // Bulk selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedFeeTypes.map(feeType => feeType.id);
        if (isSelectAll) {
            setSelectedFeeTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFeeTypes, ...pageIds])];
            setSelectedFeeTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredFeeTypes.map(feeType => feeType.id);
        if (selectedFeeTypes.length === allIds.length && allIds.every(id => selectedFeeTypes.includes(id))) {
            setSelectedFeeTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFeeTypes, ...allIds])];
            setSelectedFeeTypes(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${safeFeeTypes.length} fee types. This action may take a moment.`)) {
            const pageIds = paginatedFeeTypes.map(feeType => feeType.id);
            setSelectedFeeTypes(pageIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = useCallback((id: number) => {
        setSelectedFeeTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Get selected fee types data
    const selectedFeeTypesData = useMemo(() => {
        return filteredFeeTypes.filter(feeType => selectedFeeTypes.includes(feeType.id));
    }, [selectedFeeTypes, filteredFeeTypes]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedFeeTypesData;
        
        const totalAmount = selectedData.reduce((sum, ft) => {
            const amount = ft.base_amount;
            if (amount === null || amount === undefined || amount === '') return sum;
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
            return sum + (isNaN(numAmount) ? 0 : numAmount);
        }, 0);

        return {
            total: selectedData.length,
            active: selectedData.filter(ft => ft.is_active).length,
            inactive: selectedData.filter(ft => !ft.is_active).length,
            mandatory: selectedData.filter(ft => ft.is_mandatory).length,
            autoGenerate: selectedData.filter(ft => ft.auto_generate).length,
            totalAmount: totalAmount,
            fixedAmount: selectedData.filter(ft => ft.amount_type === 'fixed').length,
            variableAmount: selectedData.filter(ft => ft.amount_type === 'variable').length,
        };
    }, [selectedFeeTypesData]);

    // Enhanced bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedFeeTypes.length === 0) {
            toast.error('Please select at least one fee type');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    // Export to CSV
                    const exportData = selectedFeeTypesData.map(feeType => ({
                        'ID': feeType.id,
                        'Code': feeType.code,
                        'Name': feeType.name,
                        'Short Name': feeType.short_name || '',
                        'Description': feeType.description || '',
                        'Category': feeType.document_category?.name || 'Uncategorized',
                        'Base Amount': formatCurrency(feeType.base_amount),
                        'Amount Type': feeType.amount_type || 'fixed',
                        'Frequency': feeType.frequency || 'one_time',
                        'Validity Days': feeType.validity_days || '',
                        'Status': feeType.is_active ? 'Active' : 'Inactive',
                        'Mandatory': feeType.is_mandatory ? 'Yes' : 'No',
                        'Auto Generate': feeType.auto_generate ? 'Yes' : 'No',
                        'Created At': feeType.created_at,
                        'Updated At': feeType.updated_at,
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
                    a.download = `fee-types-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'activate':
                    if (confirm(`Activate ${selectedFeeTypes.length} selected fee type(s)?`)) {
                        await router.post('/fee-types/bulk-action', { 
                            action: 'activate',
                            fee_type_ids: selectedFeeTypes 
                        }, {
                            onSuccess: () => {
                                toast.success(`${selectedFeeTypes.length} fee type(s) activated successfully`);
                                setSelectedFeeTypes([]);
                            },
                            onError: (errors) => {
                                toast.error('Failed to activate fee types');
                            }
                        });
                    }
                    break;

                case 'deactivate':
                    if (confirm(`Deactivate ${selectedFeeTypes.length} selected fee type(s)?`)) {
                        await router.post('/fee-types/bulk-action', { 
                            action: 'deactivate',
                            fee_type_ids: selectedFeeTypes 
                        }, {
                            onSuccess: () => {
                                toast.success(`${selectedFeeTypes.length} fee type(s) deactivated successfully`);
                                setSelectedFeeTypes([]);
                            },
                            onError: (errors) => {
                                toast.error('Failed to deactivate fee types');
                            }
                        });
                    }
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedFeeTypes.length} selected fee type(s)? This action cannot be undone.`)) {
                        await router.post('/fee-types/bulk-action', { 
                            action: 'delete',
                            fee_type_ids: selectedFeeTypes 
                        }, {
                            onSuccess: () => {
                                toast.success(`${selectedFeeTypes.length} fee type(s) deleted successfully`);
                                setSelectedFeeTypes([]);
                                setShowBulkDeleteDialog(false);
                            },
                            onError: (errors) => {
                                toast.error('Failed to delete fee types');
                            }
                        });
                    }
                    break;

                case 'update_category':
                    if (!bulkEditValue) {
                        toast.error('Please select a category');
                        return;
                    }
                    
                    if (confirm(`Update category for ${selectedFeeTypes.length} selected fee type(s)?`)) {
                        await router.post('/fee-types/bulk-update', {
                            ids: selectedFeeTypes,
                            field: 'document_category_id',
                            value: bulkEditValue
                        }, {
                            onSuccess: () => {
                                toast.success(`${selectedFeeTypes.length} fee type(s) category updated`);
                                setShowBulkCategoryDialog(false);
                                setBulkEditValue('');
                                setSelectedFeeTypes([]);
                            },
                            onError: (errors) => {
                                toast.error('Failed to update category');
                            }
                        });
                    }
                    break;

                case 'duplicate':
                    if (confirm(`Duplicate ${selectedFeeTypes.length} selected fee type(s)?`)) {
                        await router.post('/fee-types/bulk-duplicate', {
                            ids: selectedFeeTypes
                        }, {
                            onSuccess: () => {
                                toast.success(`${selectedFeeTypes.length} fee type(s) duplicated successfully`);
                                setSelectedFeeTypes([]);
                            },
                            onError: (errors) => {
                                toast.error('Failed to duplicate fee types');
                            }
                        });
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
        if (selectedFeeTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedFeeTypesData.map(feeType => ({
            Code: feeType.code,
            Name: feeType.name,
            Category: feeType.document_category?.name || 'Uncategorized',
            Amount: formatCurrency(feeType.base_amount),
            Frequency: feeType.frequency,
            Status: feeType.is_active ? 'Active' : 'Inactive',
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
    const handleFilterChange = useCallback((type: 'search' | 'category' | 'status', value: string) => {
        const filters: any = {};
        
        if (type === 'search') {
            setSearchQuery(value);
            filters.search = value || undefined;
        }
        if (type === 'category') {
            setSelectedCategory(value);
            filters.category = value !== 'all' ? value : undefined;
        }
        if (type === 'status') {
            setSelectedStatus(value);
            filters.status = value !== 'all' ? value : undefined;
        }
        
        setCurrentPage(1);
        setSelectedFeeTypes([]);
        
        router.get('/fee-types', filters, {
            preserveState: true,
            preserveScroll: true
        });
    }, []);

    // Handle clear filters
    const handleClearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedStatus('all');
        setCurrentPage(1);
        setSelectedFeeTypes([]);
        router.get('/fee-types');
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Statistics
    const stats = useMemo(() => {
        const totalAmount = filteredFeeTypes.reduce((sum, ft) => {
            const amount = ft.base_amount;
            if (amount === null || amount === undefined || amount === '') return sum;
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
            return sum + (isNaN(numAmount) ? 0 : numAmount);
        }, 0);

        return {
            total: filteredFeeTypes.length,
            active: filteredFeeTypes.filter(ft => ft.is_active).length,
            inactive: filteredFeeTypes.filter(ft => !ft.is_active).length,
            mandatory: filteredFeeTypes.filter(ft => ft.is_mandatory).length,
            autoGenerate: filteredFeeTypes.filter(ft => ft.auto_generate).length,
            totalAmount: totalAmount
        };
    }, [filteredFeeTypes]);

    // Category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredFeeTypes.forEach(feeType => {
            const categoryId = feeType.document_category_id?.toString() || 'uncategorized';
            counts[categoryId] = (counts[categoryId] || 0) + 1;
        });
        return counts;
    }, [filteredFeeTypes]);

    // Get category details
    const getCategoryDetails = useCallback((feeType: FeeType) => {
        if (!feeType.document_category) {
            return {
                name: 'Uncategorized',
                icon: <Tag className="h-4 w-4" />,
                color: 'bg-gray-100 text-gray-800 border-gray-200'
            };
        }
        
        return {
            name: feeType.document_category.name,
            icon: getCategoryIcon(feeType.document_category.icon),
            color: getCategoryColor(feeType.document_category.color)
        };
    }, []);

    // Get sort icon
    const getSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = 
        searchQuery || 
        selectedCategory !== 'all' || 
        selectedStatus !== 'all';

    return (
        <AppLayout
            title="Fee Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Fee Types', href: '/fee-types' }
            ]}
        >
            <Head title="Fee Types" />

            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fee Types Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage barangay fees, taxes, and services
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
                                    <p className="text-xs text-gray-500">Select multiple fee types for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Link href="/fee-types/create">
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">New Fee Type</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Filtered Fee Types
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.total.toLocaleString()}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.active} active • {stats.inactive} inactive
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Active
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {stats.mandatory} mandatory • {stats.autoGenerate} auto-gen
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Total Base Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Average per fee type
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{Object.keys(categoryCounts).length}</div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {categoryCounts['uncategorized'] || 0} uncategorized
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
                                            placeholder="Search fee types by code, name, description, or category... (Ctrl+F)"
                                            className="pl-10"
                                            value={searchQuery}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                        />
                                        {searchQuery && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => handleFilterChange('search', '')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            className="h-9"
                                            onClick={() => handleBulkOperation('export')}
                                            disabled={filteredFeeTypes.length === 0}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Active filters indicator */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} fee types
                                        {searchQuery && ` matching "${searchQuery}"`}
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
                                                                Current Page ({paginatedFeeTypes.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({filteredFeeTypes.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({safeFeeTypes.length})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedFeeTypes([])}
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
                                        <span className="text-sm text-gray-500 hidden sm:inline">Category:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={selectedCategory}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                        >
                                            <option value="all">All Categories</option>
                                            {Object.entries(categories).map(([id, name]) => (
                                                <option key={id} value={id}>
                                                    {name} ({categoryCounts[id] || 0})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={selectedStatus}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={sortField}
                                            onChange={(e) => setSortField(e.target.value)}
                                        >
                                            <option value="name">Name</option>
                                            <option value="code">Code</option>
                                            <option value="base_amount">Amount</option>
                                            <option value="created_at">Date Added</option>
                                            <option value="category">Category</option>
                                        </select>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-7 p-0"
                                            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                        >
                                            {sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Bulk Actions Bar */}
                    {isBulkMode && selectedFeeTypes.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedFeeTypes.length} selected
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
                                                setSelectedFeeTypes([]);
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
                                                    <Clipboard className="h-3.5 w-3.5" />
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
                                                Export selected fee types
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
                                                Bulk edit selected fee types
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
                                                        onClick={() => setShowBulkCategoryDialog(true)}
                                                    >
                                                        <Tag className="h-3.5 w-3.5 mr-2" />
                                                        Update Category
                                                    </Button>
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
                                        disabled={isPerformingBulkAction}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Exit
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enhanced stats of selected items */}
                            {selectedFeeTypesData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} total
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.active} active • {selectionStats.inactive} inactive
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {selectionStats.mandatory} mandatory
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {formatCurrency(selectionStats.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fee Types Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    Fee Types List
                                    {selectedFeeTypes.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedFeeTypes.length} selected
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
                                                                    checked={isSelectAll && paginatedFeeTypes.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('code')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Code
                                                            {getSortIcon('code')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Name
                                                            {getSortIcon('name')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('category')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Category
                                                            {getSortIcon('category')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('base_amount')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Amount
                                                            {getSortIcon('base_amount')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                        Frequency
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {paginatedFeeTypes.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 9 : 8} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                        No fee types found
                                                                    </h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by adding a fee type.'}
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
                                                                    <Link href="/fee-types/create">
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Add Fee Type
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedFeeTypes.map((feeType) => {
                                                        const categoryDetails = getCategoryDetails(feeType);
                                                        const isSelected = selectedFeeTypes.includes(feeType.id);
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={feeType.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                }`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(feeType.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleItemSelect(feeType.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                    <div className="font-mono font-medium">{feeType.code || 'N/A'}</div>
                                                                    {feeType.short_name && (
                                                                        <div className="text-xs text-gray-500">{feeType.short_name}</div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="font-medium">{feeType.name || 'Unnamed'}</div>
                                                                    {feeType.description && (
                                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                            {feeType.description}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge variant="outline" className={categoryDetails.color}>
                                                                        <span className="flex items-center gap-1">
                                                                            {categoryDetails.icon}
                                                                            {categoryDetails.name}
                                                                        </span>
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="font-medium">{formatCurrency(feeType.base_amount)}</div>
                                                                    <div className="text-xs text-gray-500 capitalize">
                                                                        {(feeType.amount_type || 'fixed') === 'fixed' ? 'Fixed' : 'Variable'}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge variant="secondary" className="capitalize">
                                                                        {(feeType.frequency || 'one_time').replace('_', ' ')}
                                                                    </Badge>
                                                                    {feeType.validity_days && (
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            {feeType.validity_days} days valid
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant={feeType.is_active ? "default" : "secondary"}>
                                                                            {feeType.is_active ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                        {feeType.is_mandatory && (
                                                                            <Badge variant="outline" className="text-red-600 border-red-200">
                                                                                Mandatory
                                                                            </Badge>
                                                                        )}
                                                                        {feeType.auto_generate && (
                                                                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                                                Auto-gen
                                                                            </Badge>
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
                                                                            >
                                                                                <span className="sr-only">Open menu</span>
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-48">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/fee-types/${feeType.id}`} className="flex items-center cursor-pointer">
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>View Details</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/fee-types/${feeType.id}/edit`} className="flex items-center cursor-pointer">
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Edit Fee Type</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>

                                                                            <DropdownMenuItem 
                                                                                onClick={() => {
                                                                                    router.post(`/fee-types/${feeType.id}/duplicate`);
                                                                                }}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Duplicate</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(feeType.code || '');
                                                                                    toast.success('Code copied to clipboard');
                                                                                }}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Clipboard className="mr-2 h-4 w-4" />
                                                                                <span>Copy Code</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/fees?fee_type=${feeType.id}`} className="flex items-center cursor-pointer">
                                                                                    <DollarSign className="mr-2 h-4 w-4" />
                                                                                    <span>View Fees</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>

                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(feeType.id)}
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
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                onClick={() => {
                                                                                    if (confirm('Are you sure you want to delete this fee type?')) {
                                                                                        router.delete(`/fee-types/${feeType.id}`);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete Fee Type</span>
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
                        <AlertDialogTitle>Delete Selected Fee Types</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedFeeTypes.length} selected fee type{selectedFeeTypes.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
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
                            Update status for {selectedFeeTypes.length} selected fee types.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Action</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => {
                                    setBulkEditValue(e.target.value);
                                    setBulkEditField('status');
                                }}
                            >
                                <option value="">Select Action</option>
                                <option value="activate">Activate Selected</option>
                                <option value="deactivate">Deactivate Selected</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total fee types</li>
                                <li>{selectionStats.active} active • {selectionStats.inactive} inactive</li>
                                <li>{selectionStats.mandatory} mandatory</li>
                                <li>{selectionStats.autoGenerate} auto-generated</li>
                                <li>Total amount: {formatCurrency(selectionStats.totalAmount)}</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (bulkEditValue === 'activate') {
                                    handleBulkOperation('activate');
                                } else if (bulkEditValue === 'deactivate') {
                                    handleBulkOperation('deactivate');
                                }
                            }}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                bulkEditValue === 'activate' ? 'Activate Selected' : 'Deactivate Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Category Update Dialog */}
            <AlertDialog open={showBulkCategoryDialog} onOpenChange={setShowBulkCategoryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update category for {selectedFeeTypes.length} selected fee types.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Category</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => {
                                    setBulkEditValue(e.target.value);
                                    setBulkEditField('category');
                                }}
                            >
                                <option value="">Select Category</option>
                                <option value="">Uncategorized</option>
                                {Object.entries(categories).map(([id, name]) => (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current category distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                {(() => {
                                    const categoryCounts: Record<string, number> = {};
                                    selectedFeeTypesData.forEach(feeType => {
                                        const categoryName = feeType.document_category?.name || 'Uncategorized';
                                        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
                                    });
                                    
                                    return Object.entries(categoryCounts).map(([category, count]) => (
                                        <li key={category}>{category}: {count} fee type(s)</li>
                                    ));
                                })()}
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_category')}
                            disabled={isPerformingBulkAction || bulkEditValue === undefined}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Category'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}