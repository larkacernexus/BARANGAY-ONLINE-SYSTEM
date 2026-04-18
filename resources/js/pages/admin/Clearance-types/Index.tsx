import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyRound, FileText } from 'lucide-react';
import { route } from 'ziggy-js';

// Import components
import ClearanceTypesStats from '@/components/admin/clearance-types/ClearanceTypesStats';
import ClearanceTypesFilters from '@/components/admin/clearance-types/ClearanceTypesFilters';
import ClearanceTypesContent from '@/components/admin/clearance-types/ClearanceTypesContent';
import ClearanceTypesDialogs from '@/components/admin/clearance-types/ClearanceTypesDialogs';

// Import types
import type {
    ClearanceType,
    PaginatedClearanceTypesResponse,
    ClearanceTypeFilters,
    ClearanceTypeStats,
    FilterState,
    BulkOperation,
    BulkEditField,
    SelectionMode,
    SelectionStats,
    PageProps
} from '@/types/admin/clearance-types/clearance-types';

// Import utilities
import {
    truncateText,
    safeNumber,
    getStatusBadgeVariant,
    getDiscountableBadgeVariant,
    getPurposeOptionsCount,
    formatClearanceTypeDate as formatDate,
    calculateSelectionStats,
    formatForClipboard,
    filterClearanceTypes
} from '@/types/admin/clearance-types/clearance-types';

// Helper functions for safe value extraction
const getSafeString = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return defaultValue;
};

const getSafeSortOrder = (value: any): 'asc' | 'desc' => {
    if (value === 'asc') return 'asc';
    if (value === 'desc') return 'desc';
    return 'asc';
};

declare module '@inertiajs/react' {
    interface PageProps {
        clearanceTypes: PaginatedClearanceTypesResponse;
        filters: ClearanceTypeFilters;
        stats: ClearanceTypeStats;
    }
}

export default function ClearanceTypesIndex() {
    const { props } = usePage<PageProps>();
    const { clearanceTypes, filters, stats } = props;
    
    // Safe data extraction
    const allTypes = clearanceTypes?.data || [];
    const safeStats = stats || { total: 0, active: 0, inactive: 0, discountable: 0, non_discountable: 0, requires_payment: 0, averageFee: 0 };
    
    // Filter states - client-side only
    const [search, setSearch] = useState<string>(getSafeString(filters?.search));
    const [statusFilter, setStatusFilter] = useState<string>(getSafeString(filters?.status, 'all'));
    const [requiresPaymentFilter, setRequiresPaymentFilter] = useState<string>(getSafeString(filters?.requires_payment, 'all'));
    const [discountableFilter, setDiscountableFilter] = useState<string>(getSafeString(filters?.discountable, 'all'));
    const [sortBy, setSortBy] = useState<string>(getSafeString(filters?.sort, 'name'));
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSafeSortOrder(filters?.direction));
    
    // Additional filter states
    const [feeRange, setFeeRange] = useState<string>('');
    const [dateRangePreset, setDateRangePreset] = useState<string>('');
    
    const [windowWidth, setWindowWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 15;
    
    // Bulk selection states
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkActivateDialog, setShowBulkActivateDialog] = useState(false);
    const [showBulkDeactivateDialog, setShowBulkDeactivateDialog] = useState(false);
    const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('processing_days');
    const [bulkEditValue, setBulkEditValue] = useState<string | number | boolean>('');

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            const mobile = width < 768;
            setIsMobile(mobile);
            if (mobile && viewMode === 'table') {
                setViewMode('grid');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, requiresPaymentFilter, discountableFilter, feeRange, dateRangePreset, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedTypes([]);
            setIsSelectAll(false);
            setSelectionMode('page');
        }
    }, [isBulkMode]);

    // Filter and sort clearance types client-side
    const filteredTypes = useMemo(() => {
        if (!allTypes || allTypes.length === 0) {
            return [];
        }
        
        let filtered = [...allTypes];
        
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(type =>
                type?.name?.toLowerCase().includes(searchLower) ||
                type?.code?.toLowerCase().includes(searchLower) ||
                type?.description?.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(type => type?.is_active === (statusFilter === 'active'));
        }
        
        // Requires payment filter
        if (requiresPaymentFilter && requiresPaymentFilter !== 'all') {
            filtered = filtered.filter(type => type?.requires_payment === (requiresPaymentFilter === 'yes'));
        }
        
        // Discountable filter
        if (discountableFilter && discountableFilter !== 'all') {
            filtered = filtered.filter(type => type?.is_discountable === (discountableFilter === 'yes'));
        }
        
        // Fee range filter
        if (feeRange && feeRange !== '') {
            filtered = filtered.filter(type => {
                const fee = Number(type?.fee) || 0;
                switch (feeRange) {
                    case '0':
                        return fee === 0;
                    case '1-50':
                        return fee >= 1 && fee <= 50;
                    case '51-100':
                        return fee >= 51 && fee <= 100;
                    case '101-200':
                        return fee >= 101 && fee <= 200;
                    case '200+':
                        return fee > 200;
                    default:
                        return true;
                }
            });
        }
        
        // Date range filter (using created_at)
        if (dateRangePreset && dateRangePreset !== '') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let startDate: Date | null = null;
            
            switch (dateRangePreset) {
                case 'today':
                    startDate = today;
                    break;
                case 'yesterday':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 1);
                    break;
                case 'this_week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay());
                    break;
                case 'last_week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay() - 7);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);
                    filtered = filtered.filter(type => {
                        const createdAt = type?.created_at ? new Date(type.created_at) : null;
                        return createdAt && createdAt >= startDate! && createdAt <= endDate;
                    });
                    startDate = null;
                    break;
                case 'this_month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'last_month':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    filtered = filtered.filter(type => {
                        const createdAt = type?.created_at ? new Date(type.created_at) : null;
                        return createdAt && createdAt >= startDate! && createdAt <= lastMonthEnd;
                    });
                    startDate = null;
                    break;
                case 'this_quarter':
                    const quarter = Math.floor(today.getMonth() / 3);
                    startDate = new Date(today.getFullYear(), quarter * 3, 1);
                    break;
                case 'this_year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    break;
            }
            
            if (startDate) {
                filtered = filtered.filter(type => {
                    const createdAt = type?.created_at ? new Date(type.created_at) : null;
                    return createdAt && createdAt >= startDate!;
                });
            }
        }
        
        // Apply sorting
        if (filtered.length > 0) {
            filtered.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortBy) {
                    case 'name':
                        valueA = a?.name || '';
                        valueB = b?.name || '';
                        break;
                    case 'code':
                        valueA = a?.code || '';
                        valueB = b?.code || '';
                        break;
                    case 'fee':
                        valueA = Number(a?.fee) || 0;
                        valueB = Number(b?.fee) || 0;
                        break;
                    case 'processing_days':
                        valueA = a?.processing_days || 0;
                        valueB = b?.processing_days || 0;
                        break;
                    case 'validity_days':
                        valueA = a?.validity_days || 0;
                        valueB = b?.validity_days || 0;
                        break;
                    case 'status':
                        valueA = a?.is_active ? 1 : 0;
                        valueB = b?.is_active ? 1 : 0;
                        break;
                    case 'requires_payment':
                        valueA = a?.requires_payment ? 1 : 0;
                        valueB = b?.requires_payment ? 1 : 0;
                        break;
                    case 'is_discountable':
                        valueA = a?.is_discountable ? 1 : 0;
                        valueB = b?.is_discountable ? 1 : 0;
                        break;
                    case 'created_at':
                        valueA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        valueB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    default:
                        valueA = a?.name || '';
                        valueB = b?.name || '';
                }
                
                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
                if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return filtered;
    }, [allTypes, search, statusFilter, requiresPaymentFilter, discountableFilter, feeRange, dateRangePreset, sortBy, sortOrder]);

    // Calculate filtered stats - UPDATED with all required fields
    const filteredStats = useMemo(() => {
        if (!filteredTypes || filteredTypes.length === 0) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                discountable: 0,
                non_discountable: 0,
                requires_payment: 0,
                requires_approval: 0,
                online_only: 0,
                averageFee: 0
            };
        }
        
        const active = filteredTypes.filter(t => t?.is_active).length;
        const inactive = filteredTypes.filter(t => !t?.is_active).length;
        const discountable = filteredTypes.filter(t => t?.is_discountable).length;
        const non_discountable = filteredTypes.filter(t => !t?.is_discountable).length;
        const requires_payment = filteredTypes.filter(t => t?.requires_payment).length;
        const requires_approval = filteredTypes.filter(t => t?.requires_approval).length;
        const online_only = filteredTypes.filter(t => t?.is_online_only).length;
        const totalFee = filteredTypes.reduce((sum, t) => sum + (Number(t?.fee) || 0), 0);
        const averageFee = filteredTypes.length > 0 ? totalFee / filteredTypes.length : 0;
        
        return {
            total: filteredTypes.length,
            active,
            inactive,
            discountable,
            non_discountable,
            requires_payment,
            requires_approval,
            online_only,
            averageFee: isNaN(averageFee) ? 0 : averageFee
        };
    }, [filteredTypes]);

    // Pagination
    const totalItems = filteredTypes.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedTypes = filteredTypes.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = useCallback(() => {
        const pageIds = paginatedTypes.map(type => type.id);
        if (isSelectAll) {
            setSelectedTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedTypes, ...pageIds])];
            setSelectedTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    }, [paginatedTypes, selectedTypes, isSelectAll]);

    const handleSelectAllFiltered = useCallback(() => {
        const allIds = filteredTypes.map(type => type.id);
        const allSelected = allIds.length > 0 && allIds.every(id => selectedTypes.includes(id));
        
        if (allSelected) {
            setSelectedTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedTypes, ...allIds])];
            setSelectedTypes(newSelected);
            setSelectionMode('filtered');
        }
    }, [filteredTypes, selectedTypes]);

    const handleSelectAll = useCallback(() => {
        if (confirm(`This will select ALL ${totalItems} clearance types. This action may take a moment.`)) {
            const allIds = filteredTypes.map(type => type.id);
            setSelectedTypes(allIds);
            setSelectionMode('all');
            toast.info(`Selected all ${totalItems} clearance types`);
        }
    }, [filteredTypes, totalItems]);

    const handleItemSelect = useCallback((id: number) => {
        setSelectedTypes(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedTypes.map(type => type.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedTypes, paginatedTypes]);

    // Get selected types data
    const selectedTypesData = useMemo(() => {
        return filteredTypes.filter(type => selectedTypes.includes(type.id));
    }, [selectedTypes, filteredTypes]);

    // Calculate selection stats
    const selectionStats = useMemo((): SelectionStats => {
        return calculateSelectionStats(selectedTypesData);
    }, [selectedTypesData]);

    // Handle sort change from dropdown
    const handleSortChange = useCallback((value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    }, []);

    // Get current sort value for dropdown
    const getCurrentSortValue = useCallback((): string => {
        return `${sortBy}-${sortOrder}`;
    }, [sortBy, sortOrder]);

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
            
            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape key
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedTypes.length > 0) {
                        setSelectedTypes([]);
                        toast.info('Selection cleared');
                    } else {
                        setIsBulkMode(false);
                        toast.info('Bulk mode disabled');
                    }
                }
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(prev => !prev);
                toast.info(!isBulkMode ? 'Bulk mode enabled' : 'Bulk mode disabled');
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Delete key for bulk delete
            if (e.key === 'Delete' && isBulkMode && selectedTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedTypes, isMobile]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedTypes.length === 0) {
            toast.error('Please select at least one clearance type');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;

                case 'activate':
                    setShowBulkActivateDialog(true);
                    break;

                case 'deactivate':
                    setShowBulkDeactivateDialog(true);
                    break;

                case 'mark_discountable':
                    if (confirm(`Mark ${selectedTypes.length} clearance type(s) as discountable?`)) {
                        await router.post(route('clearance-types.bulk-mark-discountable'), {
                            ids: selectedTypes
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedTypes.length} clearance type(s) marked as discountable`);
                                setSelectedTypes([]);
                            },
                            onError: () => {
                                toast.error('Failed to mark as discountable');
                            }
                        });
                    }
                    break;

                case 'mark_non_discountable':
                    if (confirm(`Mark ${selectedTypes.length} clearance type(s) as non-discountable?`)) {
                        await router.post(route('clearance-types.bulk-mark-non-discountable'), {
                            ids: selectedTypes
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedTypes.length} clearance type(s) marked as non-discountable`);
                                setSelectedTypes([]);
                            },
                            onError: () => {
                                toast.error('Failed to mark as non-discountable');
                            }
                        });
                    }
                    break;

                case 'export':
                    const exportData = selectedTypesData.map(type => ({
                        Name: type.name,
                        Code: type.code,
                        Fee: type.fee,
                        'Processing Days': type.processing_days,
                        'Validity Days': type.validity_days,
                        'Discountable': type.is_discountable ? 'Yes' : 'No',
                        'Active': type.is_active ? 'Yes' : 'No',
                        'Requires Payment': type.requires_payment ? 'Yes' : 'No'
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
                    a.download = `clearance-types-export-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'duplicate':
                    if (confirm(`Duplicate ${selectedTypes.length} clearance type(s)?`)) {
                        await router.post(route('clearance-types.bulk-duplicate'), {
                            ids: selectedTypes
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${selectedTypes.length} clearance type(s) duplicated successfully`);
                                setSelectedTypes([]);
                            },
                            onError: () => {
                                toast.error('Failed to duplicate clearance types');
                            }
                        });
                    }
                    break;

                case 'update':
                    setShowBulkEditDialog(true);
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
    }, [selectedTypes, selectedTypesData]);

    // Smart bulk toggle status
    const handleSmartBulkToggle = useCallback(() => {
        const hasInactive = selectedTypesData.some(t => !t.is_active);
        if (hasInactive) {
            setShowBulkActivateDialog(true);
        } else {
            setShowBulkDeactivateDialog(true);
        }
    }, [selectedTypesData]);

    // Smart bulk toggle discountable
    const handleSmartBulkDiscountableToggle = useCallback(() => {
        const hasNonDiscountable = selectedTypesData.some(t => !t.is_discountable);
        if (hasNonDiscountable) {
            handleBulkOperation('mark_discountable');
        } else {
            handleBulkOperation('mark_non_discountable');
        }
    }, [selectedTypesData, handleBulkOperation]);

    // Copy selected data to clipboard
    const handleCopySelectedData = useCallback(() => {
        if (selectedTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedTypesData.map(type => ({
            'Name': type.name,
            'Code': type.code,
            'Fee': type.fee,
            'Processing Days': type.processing_days,
            'Validity Days': type.validity_days,
            'Status': type.is_active ? 'Active' : 'Inactive'
        }));
        
        const csv = [
            Object.keys(data[0]).join('\t'),
            ...data.map(row => Object.values(row).join('\t'))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedTypesData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedTypesData]);

    // Individual type operations
    const handleToggleStatus = useCallback((type: ClearanceType) => {
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
    }, []);

    const handleToggleDiscountable = useCallback((type: ClearanceType) => {
        if (confirm(`Are you sure you want to mark "${type.name}" as ${type.is_discountable ? 'non-discountable' : 'discountable'}?`)) {
            router.post(route('clearance-types.toggle-discountable', type.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Clearance type marked as ${type.is_discountable ? 'non-discountable' : 'discountable'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to toggle discountable status');
                },
            });
        }
    }, []);

    const handleDuplicate = useCallback((type: ClearanceType) => {
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
    }, []);

    const handleCopyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, []);

    const handleDelete = useCallback((type: ClearanceType) => {
        if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
            router.delete(route('clearance-types.destroy', type.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Clearance type deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete clearance type');
                }
            });
        }
    }, []);

    const handleSort = useCallback((column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    }, [sortBy, sortOrder]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setRequiresPaymentFilter('all');
        setDiscountableFilter('all');
        setFeeRange('');
        setDateRangePreset('');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
        toast.info('All filters cleared');
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedTypes([]);
        setIsSelectAll(false);
        toast.info('Selection cleared');
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleViewPhoto = useCallback(() => {
        toast.info('Feature to be implemented');
    }, []);

    const hasActiveFilters: boolean = Boolean(
        search || 
        (statusFilter && statusFilter !== 'all') || 
        (requiresPaymentFilter && requiresPaymentFilter !== 'all') ||
        (discountableFilter && discountableFilter !== 'all') ||
        (feeRange && feeRange !== '') ||
        (dateRangePreset && dateRangePreset !== '')
    );

    // Create filters object for the Filters component - FIXED with all required properties
    const filtersStateForComponent: FilterState = {
        search: search,
        status: statusFilter,
        requires_payment: requiresPaymentFilter,
        discountable: discountableFilter,
        fee_range: feeRange,
        date_range: dateRangePreset,
        sort: '',
        direction: 'asc'
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'requires_payment':
                setRequiresPaymentFilter(value);
                break;
            case 'discountable':
                setDiscountableFilter(value);
                break;
            case 'search':
                setSearch(value);
                break;
            case 'fee_range':
                setFeeRange(value);
                break;
            case 'date_range':
                setDateRangePreset(value);
                break;
            default:
                console.log('Unknown filter key:', key);
        }
    };

    return (
        <AppLayout
            title="Clearance Types"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearance Types', href: '/admin/clearance-types' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header - Matching ResidentsHeader and AnnouncementsHeader style */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Clearance Types
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Manage clearance types, fees, and requirements
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsBulkMode(!isBulkMode)}
                                className={isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : ''}
                            >
                                {isBulkMode ? (
                                    <>
                                        <KeyRound className="h-4 w-4 mr-2" />
                                        Bulk Mode Active ({selectedTypes.length})
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="h-4 w-4 mr-2" />
                                        Bulk Select
                                    </>
                                )}
                            </Button>
                            <Button asChild>
                                <a href="/admin/clearance-types/clearance-types/create">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Add Type
                                </a>
                            </Button>
                        </div>
                    </div>

                    <ClearanceTypesStats stats={filteredStats} />

                    <ClearanceTypesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={totalItems}
                        startIndex={startIndex + 1}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        isLoading={isPerformingBulkAction}
                        feeRange={feeRange}
                        setFeeRange={setFeeRange}
                        dateRangePreset={dateRangePreset}
                        setDateRangePreset={setDateRangePreset}
                    />

                    <ClearanceTypesContent
                        clearanceTypes={{
                            ...clearanceTypes,
                            data: paginatedTypes,
                            total: totalItems,
                            current_page: currentPage,
                            last_page: totalPages,
                            from: startIndex + 1,
                            to: endIndex
                        }}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedTypes={selectedTypes}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onToggleDiscountable={handleToggleDiscountable}
                        onDuplicate={handleDuplicate}
                        onViewPhoto={handleViewPhoto}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onSmartBulkToggle={handleSmartBulkToggle}
                        onSmartBulkDiscountableToggle={handleSmartBulkDiscountableToggle}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkEditDialog={setShowBulkEditDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                        getTruncationLength={(type: 'name' | 'description' | 'code') => {
                            if (windowWidth < 640) {
                                switch(type) {
                                    case 'name': return 20;
                                    case 'description': return 25;
                                    case 'code': return 10;
                                    default: return 20;
                                }
                            }
                            if (windowWidth < 768) {
                                switch(type) {
                                    case 'name': return 25;
                                    case 'description': return 30;
                                    case 'code': return 12;
                                    default: return 25;
                                }
                            }
                            if (windowWidth < 1024) {
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
                        }}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBulkMode(false)}
                                    className="h-7 text-xs dark:hover:bg-gray-700"
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
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+F</kbd>
                                    <span>Focus search</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TooltipProvider>

            <ClearanceTypesDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkActivateDialog={showBulkActivateDialog}
                setShowBulkActivateDialog={setShowBulkActivateDialog}
                showBulkDeactivateDialog={showBulkDeactivateDialog}
                setShowBulkDeactivateDialog={setShowBulkDeactivateDialog}
                showBulkEditDialog={showBulkEditDialog}
                setShowBulkEditDialog={setShowBulkEditDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                bulkEditField={bulkEditField}
                setBulkEditField={setBulkEditField}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                selectedTypes={selectedTypes}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
            />
        </AppLayout>
    );
}