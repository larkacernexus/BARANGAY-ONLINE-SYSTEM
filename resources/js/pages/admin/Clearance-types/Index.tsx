// app/pages/admin/clearance-types/index.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { route } from 'ziggy-js';

// Import reusable components (to be created)
import ClearanceTypesHeader from '@/components/admin/clearance-types/ClearanceTypesHeader';
import ClearanceTypesStats from '@/components/admin/clearance-types/ClearanceTypesStats';
import ClearanceTypesFilters from '@/components/admin/clearance-types/ClearanceTypesFilters';
import ClearanceTypesContent from '@/components/admin/clearance-types/ClearanceTypesContent';
import ClearanceTypesDialogs from '@/components/admin/clearance-types/ClearanceTypesDialogs';

// Types
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
        discountable?: string;
        sort?: string;
        direction?: string;
    };
    stats: {
        total: number;
        active: number;
        discountable: number;
        non_discountable: number;
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
    is_discountable: boolean;
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

type BulkOperation = 'activate' | 'deactivate' | 'delete' | 'export' | 'duplicate' | 'toggle-payment' | 'toggle-approval' | 'toggle-online' | 'update' | 'mark_discountable' | 'mark_non_discountable';
type BulkEditField = 'processing_days' | 'validity_days' | 'fee' | 'requires_payment' | 'requires_approval' | 'is_online_only' | 'is_discountable';
type SelectionMode = 'page' | 'filtered' | 'all';

interface FilterState {
    search: string;
    status: string;
    requires_payment: string;
    discountable: string;
    sort: string;
    direction: string;
}

declare module '@inertiajs/react' {
    interface PageProps {
        clearanceTypes: PageProps['clearanceTypes'];
        filters: PageProps['filters'];
        stats: PageProps['stats'];
    }
}

// Helper functions
const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isActive ? 'default' : 'secondary';
};

const getDiscountableBadgeVariant = (isDiscountable: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isDiscountable ? 'default' : 'secondary';
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

// Selection stats calculator
const getSelectionStats = (selectedTypes: ClearanceType[]) => {
    const totalValue = selectedTypes.reduce((sum, t) => sum + safeNumber(t.fee, 0), 0);
    
    let avgProcessingDays = 0;
    if (selectedTypes.length > 0) {
        const totalProcessingDays = selectedTypes.reduce((sum, t) => sum + safeNumber(t.processing_days, 0), 0);
        avgProcessingDays = totalProcessingDays / selectedTypes.length;
    }
    
    return {
        active: selectedTypes.filter(t => Boolean(t.is_active)).length,
        inactive: selectedTypes.filter(t => !t.is_active).length,
        discountable: selectedTypes.filter(t => Boolean(t.is_discountable)).length,
        non_discountable: selectedTypes.filter(t => !t.is_discountable).length,
        paid: selectedTypes.filter(t => Boolean(t.requires_payment)).length,
        free: selectedTypes.filter(t => !t.requires_payment).length,
        needsApproval: selectedTypes.filter(t => Boolean(t.requires_approval)).length,
        onlineOnly: selectedTypes.filter(t => Boolean(t.is_online_only)).length,
        totalValue: safeNumber(totalValue, 0),
        avgProcessingDays: safeNumber(avgProcessingDays, 0),
    };
};

// Filter clearance types
const filterClearanceTypes = (
    types: ClearanceType[],
    search: string,
    filters: FilterState,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
): ClearanceType[] => {
    let filtered = [...types];
    
    // Apply search
    if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(type =>
            type.name.toLowerCase().includes(searchLower) ||
            type.code.toLowerCase().includes(searchLower) ||
            type.description.toLowerCase().includes(searchLower)
        );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
        const isActive = filters.status === 'active';
        filtered = filtered.filter(type => type.is_active === isActive);
    }
    
    // Apply payment filter
    if (filters.requires_payment !== 'all') {
        const requiresPayment = filters.requires_payment === 'yes';
        filtered = filtered.filter(type => type.requires_payment === requiresPayment);
    }
    
    // Apply discountable filter
    if (filters.discountable !== 'all') {
        const isDiscountable = filters.discountable === 'yes';
        filtered = filtered.filter(type => type.is_discountable === isDiscountable);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'fee':
                aValue = a.fee;
                bValue = b.fee;
                break;
            case 'is_discountable':
                aValue = a.is_discountable ? 1 : 0;
                bValue = b.is_discountable ? 1 : 0;
                break;
            case 'clearances_count':
                aValue = a.clearances_count || 0;
                bValue = b.clearances_count || 0;
                break;
            default:
                aValue = a[sortBy as keyof ClearanceType];
                bValue = b[sortBy as keyof ClearanceType];
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    return filtered;
};

// Format for clipboard
const formatForClipboard = (types: ClearanceType[]): string => {
    const data = types.map(type => ({
        Name: type.name,
        Code: type.code,
        Fee: type.formatted_fee,
        Discountable: type.is_discountable ? 'Yes' : 'No',
        Status: type.is_active ? 'Active' : 'Inactive',
        Processing: `${type.processing_days} days`,
        Issued: type.clearances_count || 0
    }));
    
    return [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n');
};

export default function ClearanceTypesIndex() {
    const { props } = usePage<PageProps>();
    const { clearanceTypes, filters, stats } = props;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [filtersState, setFiltersState] = useState<FilterState>({
        search: filters.search || '',
        status: filters.status || 'all',
        requires_payment: filters.requires_payment || 'all',
        discountable: filters.discountable || 'all',
        sort: filters.sort || 'name',
        direction: filters.direction || 'asc'
    });
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
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

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params = {
                ...filtersState,
                search: value
            };
            
            // Clean up empty values
            Object.keys(params).forEach(key => {
                const k = key as keyof typeof params;
                if (!params[k] || params[k] === 'all') {
                    delete params[k];
                }
            });
            
            router.get(route('clearance-types.index'), params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 500),
        [filtersState]
    );

    // Handle search change
    useEffect(() => {
        if (search !== filters.search) {
            debouncedSearch(search);
        }
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    // Handle window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            setIsMobile(width < 768);
            if (width < 768 && viewMode === 'table') {
                setViewMode('grid');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedTypes([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
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
                    } else {
                        setIsBulkMode(false);
                    }
                }
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
            // Delete key for bulk delete
            if (e.key === 'Delete' && isBulkMode && selectedTypes.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedTypes, isMobile]);

    // Handle client-side filtered items (for bulk selection)
    const filteredTypes = useMemo(() => {
        return filterClearanceTypes(
            clearanceTypes.data,
            search,
            filtersState,
            filtersState.sort,
            filtersState.direction
        );
    }, [clearanceTypes.data, search, filtersState]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = clearanceTypes.data.map(type => type.id);
        if (isSelectAll) {
            setSelectedTypes(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedTypes, ...pageIds])];
            setSelectedTypes(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredTypes.map(type => type.id);
        if (selectedTypes.length === allIds.length && allIds.every(id => selectedTypes.includes(id))) {
            setSelectedTypes(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedTypes, ...allIds])];
            setSelectedTypes(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${clearanceTypes.total} clearance types. This action may take a moment.`)) {
            toast.info('Selecting all items... This feature would need server-side implementation.');
            setSelectionMode('all');
        }
    };

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
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedTypes.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedTypes, clearanceTypes.data]);

    // Get selected types data
    const selectedTypesData = useMemo(() => {
        return clearanceTypes.data.filter(type => selectedTypes.includes(type.id));
    }, [selectedTypes, clearanceTypes.data]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        return getSelectionStats(selectedTypesData);
    }, [selectedTypesData]);

    // Bulk operations
    const handleBulkOperation = async (operation: BulkOperation) => {
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
                            onError: (errors) => {
                                toast.error('Failed to mark as discountable');
                                console.error('Mark discountable errors:', errors);
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
                            onError: (errors) => {
                                toast.error('Failed to mark as non-discountable');
                                console.error('Mark non-discountable errors:', errors);
                            }
                        });
                    }
                    break;

                case 'export':
                    const exportData = selectedTypesData.map(type => ({
                        ID: type.id,
                        Name: type.name,
                        Code: type.code,
                        Description: type.description,
                        Fee: type.fee,
                        Discountable: type.is_discountable ? 'Yes' : 'No',
                        'Processing Days': type.processing_days,
                        'Validity Days': type.validity_days,
                        Active: type.is_active ? 'Yes' : 'No',
                        'Requires Payment': type.requires_payment ? 'Yes' : 'No',
                        'Requires Approval': type.requires_approval ? 'Yes' : 'No',
                        'Online Only': type.is_online_only ? 'Yes' : 'No',
                        'Created At': type.created_at,
                        'Updated At': type.updated_at,
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

    // Smart bulk toggle discountable
    const handleSmartBulkDiscountableToggle = () => {
        const hasNonDiscountable = selectedTypesData.some(t => !t.is_discountable);
        if (hasNonDiscountable) {
            handleBulkOperation('mark_discountable');
        } else {
            handleBulkOperation('mark_non_discountable');
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedTypesData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedTypesData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    // Individual type operations
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

    const handleToggleDiscountable = (type: ClearanceType) => {
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

    const handleSort = (column: string) => {
        setFiltersState(prev => ({
            ...prev,
            sort: column,
            direction: prev.sort === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        
        // Also update server-side sort
        const params = { ...filtersState };
        const direction = params.sort === column && params.direction === 'asc' ? 'desc' : 'asc';
        params.sort = column;
        params.direction = direction;
        
        router.get(route('clearance-types.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
        
        const params = { ...filtersState, [key]: value };
        Object.keys(params).forEach(k => {
            const key = k as keyof typeof params;
            if (!params[key] || params[key] === 'all') {
                delete params[key];
            }
        });
        
        router.get(route('clearance-types.index'), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFiltersState({
            search: '',
            status: 'all',
            requires_payment: 'all',
            discountable: 'all',
            sort: 'name',
            direction: 'asc'
        });
        
        router.get(route('clearance-types.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearSelection = () => {
        setSelectedTypes([]);
        setIsSelectAll(false);
    };

    const handlePageChange = (pageUrl: string) => {
        if (!pageUrl) return;
        
        router.get(pageUrl, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = 
        search || 
        filtersState.status !== 'all' || 
        filtersState.requires_payment !== 'all' ||
        filtersState.discountable !== 'all';

    const handleViewPhoto = (type: ClearanceType) => {
        // Implement if needed
        toast.info('Feature to be implemented');
    };

    const handleDelete = (type: ClearanceType) => {
        if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
            router.delete(route('clearance-types.destroy', type.id));
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
                    <ClearanceTypesHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <ClearanceTypesStats stats={stats} />

                    <ClearanceTypesFilters
                        search={search}
                        setSearch={setSearch}
                        filtersState={filtersState}
                        updateFilter={updateFilter}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={clearanceTypes.total}
                        startIndex={clearanceTypes.from}
                        endIndex={clearanceTypes.to}
                        searchInputRef={searchInputRef}
                    />

                    <ClearanceTypesContent
                        clearanceTypes={clearanceTypes}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedTypes={selectedTypes}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={clearanceTypes.current_page}
                        totalPages={clearanceTypes.last_page}
                        totalItems={clearanceTypes.total}
                        itemsPerPage={clearanceTypes.per_page}
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
                        filtersState={filtersState}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        truncateText={truncateText}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        getDiscountableBadgeVariant={getDiscountableBadgeVariant}
                        getPurposeOptionsCount={getPurposeOptionsCount}
                        formatDate={formatDate}
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