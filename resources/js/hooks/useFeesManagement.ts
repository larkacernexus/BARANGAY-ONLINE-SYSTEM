// hooks/useFeesManagement.ts

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { format, isAfter } from 'date-fns';
import { route } from 'ziggy-js';
import { Fee, Filters, Stats, PaginationData, BulkOperation, SelectionMode, SelectionStats } from '@/types/admin/fees/fees';

export const useFeesManagement = (
    initialFees: PaginationData = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0
    },
    initialFilters: Filters = {
        status: 'all',
        category: 'all',
        purok: 'all',
        from_date: '',
        to_date: '',
        sort_by: 'created_at',
        sort_order: 'desc',
        search: ''
    },
    statuses: Record<string, string> = {},
    categories: Record<string, string> = {},
    puroks: string[] = [],
    initialStats: Stats = {
        total: 0,
        total_amount: 0,
        collected: 0,
        pending: 0,
        overdue_count: 0,
        due_soon_count: 0,
        today_count: 0,
        today_amount: 0,
        today_collected: 0,
        this_month_count: 0,
        this_month_amount: 0,
        this_month_collected: 0,
        status_counts: {},
        category_totals: {}
    }
) => {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(initialFilters.search || '');
    const [filters, setFilters] = useState<Filters>({
        status: initialFilters.status || 'all',
        category: initialFilters.category || 'all',
        purok: initialFilters.purok || 'all',
        from_date: initialFilters.from_date || '',
        to_date: initialFilters.to_date || '',
        sort_by: initialFilters.sort_by || 'created_at',
        sort_order: initialFilters.sort_order || 'desc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedFees, setSelectedFees] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Helper functions
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const isOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        return isAfter(today, due);
    };

    const getDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getTruncationLength = (type: 'name' | 'contact' | 'code' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        const width = window.innerWidth;
        if (width < 640) {
            switch(type) {
                case 'name': return 15;
                case 'contact': return 10;
                case 'code': return 12;
                default: return 15;
            }
        }
        if (width < 768) {
            switch(type) {
                case 'name': return 20;
                case 'contact': return 12;
                case 'code': return 15;
                default: return 20;
            }
        }
        if (width < 1024) {
            switch(type) {
                case 'name': return 25;
                case 'contact': return 15;
                case 'code': return 18;
                default: return 25;
            }
        }
        switch(type) {
            case 'name': return 30;
            case 'contact': return 15;
            case 'code': return 20;
            default: return 30;
        }
    };

    // Window resize handler
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter fees client-side
    const filteredFees = useMemo(() => {
        const feesData = initialFees?.data || [];
        let result = [...feesData];

        // Apply filters
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(fee => 
                (fee.fee_code?.toLowerCase() || '').includes(searchLower) ||
                (fee.payer_name?.toLowerCase() || '').includes(searchLower) ||
                (fee.contact_number && fee.contact_number.includes(search)) ||
                (fee.purok && fee.purok.toLowerCase().includes(searchLower)) ||
                (fee.fee_type?.name && fee.fee_type.name.toLowerCase().includes(searchLower)) ||
                (fee.certificate_number && fee.certificate_number.includes(search)) ||
                (fee.or_number && fee.or_number.includes(search))
            );
        }

        if (filters.status !== 'all') {
            result = result.filter(fee => fee.status === filters.status);
        }

        if (filters.category !== 'all') {
            result = result.filter(fee => fee.fee_type?.category === filters.category);
        }

        if (filters.purok !== 'all') {
            result = result.filter(fee => fee.purok === filters.purok);
        }

        if (filters.from_date) {
            const fromDate = new Date(filters.from_date);
            result = result.filter(fee => new Date(fee.issue_date || fee.created_at) >= fromDate);
        }

        if (filters.to_date) {
            const toDate = new Date(filters.to_date);
            result = result.filter(fee => new Date(fee.issue_date || fee.created_at) <= toDate);
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            const sortBy = filters.sort_by || 'created_at';
            
            switch (sortBy) {
                case 'fee_code':
                    aValue = (a.fee_code || '').toLowerCase();
                    bValue = (b.fee_code || '').toLowerCase();
                    break;
                case 'payer_name':
                    aValue = (a.payer_name || '').toLowerCase();
                    bValue = (b.payer_name || '').toLowerCase();
                    break;
                case 'total_amount':
                    aValue = a.total_amount || 0;
                    bValue = b.total_amount || 0;
                    break;
                case 'due_date':
                    aValue = new Date(a.due_date || 0).getTime();
                    bValue = new Date(b.due_date || 0).getTime();
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                default:
                    aValue = new Date(a.created_at || 0).getTime();
                    bValue = new Date(b.created_at || 0).getTime();
            }

            const sortOrder = filters.sort_order || 'desc';
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });

        return result;
    }, [initialFees?.data, search, filters]);

    // Pagination
    const totalItems = filteredFees.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFees = filteredFees.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filters]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedFees.map(fee => fee.id);
        if (isSelectAll) {
            setSelectedFees(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFees, ...pageIds])];
            setSelectedFees(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredFees.map(fee => fee.id);
        if (selectedFees.length === allIds.length && allIds.every(id => selectedFees.includes(id))) {
            setSelectedFees(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedFees, ...allIds])];
            setSelectedFees(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        const total = initialFees?.total || 0;
        if (confirm(`This will select ALL ${total} fees. This action may take a moment.`)) {
            const allIds = filteredFees.map(fee => fee.id);
            setSelectedFees(allIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedFees(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = paginatedFees.map(fee => fee.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedFees.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedFees, paginatedFees]);

    // Get selected fees data
    const selectedFeesData = useMemo(() => {
        return filteredFees.filter(fee => selectedFees.includes(fee.id));
    }, [selectedFees, filteredFees]);

    // Calculate selection stats
    const selectionStats = useMemo<SelectionStats>(() => {
        const selectedData = selectedFeesData;
        
        const totalAmount = selectedData.reduce((sum, fee) => sum + (fee.total_amount || 0), 0);
        const totalPaid = selectedData.reduce((sum, fee) => sum + (fee.amount_paid || 0), 0);
        const totalBalance = selectedData.reduce((sum, fee) => sum + (fee.balance || 0), 0);
        const overdueCount = selectedData.filter(fee => 
            isOverdue(fee.due_date) && fee.status !== 'paid'
        ).length;
        
        const paidCount = selectedData.filter(fee => fee.status === 'paid').length;
        const pendingCount = selectedData.filter(fee => fee.status === 'pending').length;
        const issuedCount = selectedData.filter(fee => fee.status === 'issued').length;
        const partiallyPaidCount = selectedData.filter(fee => fee.status === 'partial' || fee.status === 'partially_paid').length;
        const overdueStatusCount = selectedData.filter(fee => fee.status === 'overdue').length;
        
        return {
            total: selectedData.length,
            totalAmount: totalAmount,
            totalPaid: totalPaid,
            totalBalance: totalBalance,
            overdueCount: overdueCount,
            paidCount: paidCount,
            pendingCount: pendingCount,
            issuedCount: issuedCount,
            partiallyPaidCount: partiallyPaidCount,
            withCertificates: selectedData.filter(fee => fee.certificate_number).length,
            withReceipts: selectedData.filter(fee => fee.or_number).length,
            residents: selectedData.filter(fee => fee.payer_type === 'resident').length,
            households: selectedData.filter(fee => fee.payer_type === 'household').length,
            businesses: selectedData.filter(fee => fee.payer_type === 'business').length,
            paid: paidCount,
            pending: pendingCount,
            overdue: overdueStatusCount,
            paidAmount: totalPaid,
            pendingAmount: selectedData.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + (fee.total_amount || 0), 0),
            overdueAmount: selectedData.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + (fee.total_amount || 0), 0),
            byStatus: {
                paid: paidCount,
                pending: pendingCount,
                issued: issuedCount,
                partial: partiallyPaidCount,
                overdue: overdueStatusCount,
                cancelled: selectedData.filter(fee => fee.status === 'cancelled').length,
                refunded: selectedData.filter(fee => fee.status === 'refunded').length,
            }
        };
    }, [selectedFeesData]);

    // Bulk operations
    const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
        if (selectedFees.length === 0) {
            alert('Please select at least one fee');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    // Export logic here
                    break;
                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedFees.length} selected fee(s)?`)) {
                        await router.post('/fees/bulk-action', {
                            action: 'delete',
                            fee_ids: selectedFees,
                        }, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setSelectedFees([]);
                                setShowBulkDeleteDialog(false);
                            },
                        });
                    }
                    break;
                case 'mark_paid':
                case 'mark_pending':
                case 'send_reminders':
                case 'apply_penalties':
                case 'waive_penalties':
                    // Handle other operations
                    console.log(`Operation: ${operation} - To be implemented`);
                    break;
                default:
                    alert('Operation not supported yet');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
        } finally {
            setIsPerformingBulkAction(false);
        }
    }, [selectedFees]);

    // Individual fee operations
    const handleDelete = (fee: Fee) => {
        if (confirm(`Are you sure you want to delete fee ${fee.fee_code}?`)) {
            router.delete(route('fees.destroy', fee.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedFees(selectedFees.filter(id => id !== fee.id));
                },
            });
        }
    };

    const handleSort = (column: string) => {
        const newSortOrder = filters.sort_by === column && filters.sort_order === 'asc' ? 'desc' : 'asc';
        setFilters(prev => ({
            ...prev,
            sort_by: column,
            sort_order: newSortOrder
        }));
    };

    const handleClearFilters = () => {
        setSearch('');
        setFilters({
            status: 'all',
            category: 'all',
            purok: 'all',
            from_date: '',
            to_date: '',
            sort_by: 'created_at',
            sort_order: 'desc'
        });
    };

    const updateFilter = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // FIX: Convert hasActiveFilters to boolean using useMemo
    const hasActiveFilters = useMemo(() => {
        return Boolean(
            search || 
            filters.status !== 'all' || 
            filters.category !== 'all' || 
            filters.purok !== 'all' ||
            filters.from_date ||
            filters.to_date ||
            filters.amount_min ||
            filters.amount_max
        );
    }, [search, filters]);

    // Reset selection when bulk mode is turned off
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedFees([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    return {
        // State
        search,
        filters: filters,
        showAdvancedFilters,
        currentPage,
        windowWidth,
        selectedFees,
        isBulkMode,
        isSelectAll,
        showBulkDeleteDialog,
        isPerformingBulkAction,
        viewMode,
        selectionMode,
        searchInputRef,
        
        // Data
        paginatedFees,
        filteredFees,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        itemsPerPage,
        selectedFeesData,
        selectionStats,
        
        // Helpers
        formatCurrency,
        formatDate,
        isOverdue,
        getDaysOverdue,
        truncateText,
        getTruncationLength,
        
        // Handlers
        setSearch,
        setFilters,
        setShowAdvancedFilters,
        setCurrentPage,
        setIsBulkMode,
        setShowBulkDeleteDialog,
        setViewMode,
        
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect,
        handleBulkOperation,
        handleDelete,
        handleSort,
        handleClearFilters,
        updateFilter,
        
        // Computed - Now guaranteed to be boolean
        hasActiveFilters,
        
        // Props
        flash,
        statuses,
        categories,
        puroks,
        stats: initialStats,
    };
};