import { router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { ResidentsProps, Resident, SelectionMode, SelectionStats, ResidentPrivilege } from '@/types/admin/residents/residents-types';
import { 
    getSelectionStats,
    formatForClipboard,
    getFullName,
    isHeadOfHousehold,
} from '@/admin-utils/residentsUtils';

// Import reusable components
import { TooltipProvider } from '@/components/ui/tooltip';
import ResidentsHeader from '@/components/admin/residents/ResidentsHeader';
import ResidentsStats from '@/components/admin/residents/ResidentsStats';
import ResidentsFilters from '@/components/admin/residents/ResidentsFilters';
import ResidentsContent from '@/components/admin/residents/ResidentsContent';
import ResidentsDialogs from '@/components/admin/residents/ResidentsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2 } from 'lucide-react';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function Residents() {
    const { props } = usePage<ResidentsProps>();
    const { 
        residents: initialResidents, 
        stats, 
        filters: initialFilters, 
        puroks, 
        civilStatusOptions = [], 
        ageRanges = [], 
        privileges = [] 
    } = props;
    
    // State management for server-side filtering
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(initialFilters.status || 'all');
    const [purokFilter, setPurokFilter] = useState<string>(initialFilters.purok_id || 'all');
    const [genderFilter, setGenderFilter] = useState<string>(initialFilters.gender || 'all');
    const [civilStatusFilter, setCivilStatusFilter] = useState<string>(initialFilters.civil_status || 'all');
    const [voterFilter, setVoterFilter] = useState<string>(initialFilters.is_voter || 'all');
    const [headFilter, setHeadFilter] = useState<string>(initialFilters.is_head || 'all');
    const [privilegeFilter, setPrivilegeFilter] = useState<string>(initialFilters.privilege_id || 'all');
    const [minAge, setMinAge] = useState<string>(initialFilters.min_age || '');
    const [maxAge, setMaxAge] = useState<string>(initialFilters.max_age || '');
    const [sortBy, setSortBy] = useState<string>(initialFilters.sort_by || 'last_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (initialFilters.sort_order as 'asc' | 'desc') || 'asc'
    );
    const [perPage, setPerPage] = useState<string>(initialFilters.per_page || '15');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // UI states
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    
    // Dialog states
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkPurokDialog, setShowBulkPurokDialog] = useState(false);
    const [showBulkPrivilegeDialog, setShowBulkPrivilegeDialog] = useState(false);
    const [showBulkRemovePrivilegeDialog, setShowBulkRemovePrivilegeDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [bulkPrivilegeAction, setBulkPrivilegeAction] = useState<'add' | 'remove'>('add');

    const searchInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);
    
    // Debounce search to avoid too many requests
    const debouncedSearch = useDebounce(search, 300);
    const debouncedMinAge = useDebounce(minAge, 500);
    const debouncedMaxAge = useDebounce(maxAge, 500);

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

    // Get current page residents
    const currentResidents = initialResidents?.data || [];
    const paginationData = {
        current_page: initialResidents?.current_page || 1,
        last_page: initialResidents?.last_page || 1,
        total: initialResidents?.total || 0,
        from: initialResidents?.from || 0,
        to: initialResidents?.to || 0,
        per_page: initialResidents?.per_page || parseInt(perPage) || 15,
    };

    const getCurrentFilters = useCallback((): Record<string, any> => {
        const filters: Record<string, any> = {};
        
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (purokFilter !== 'all') filters.purok_id = purokFilter;
        if (genderFilter !== 'all') filters.gender = genderFilter;
        if (civilStatusFilter !== 'all') filters.civil_status = civilStatusFilter;
        if (voterFilter !== 'all') filters.is_voter = voterFilter;
        if (headFilter !== 'all') filters.is_head = headFilter;
        if (privilegeFilter !== 'all') filters.privilege_id = privilegeFilter;
        if (debouncedMinAge) filters.min_age = debouncedMinAge;
        if (debouncedMaxAge) filters.max_age = debouncedMaxAge;
        if (sortBy) filters.sort_by = sortBy;
        if (sortOrder) filters.sort_order = sortOrder;
        if (perPage) filters.per_page = perPage;
        
        return filters;
    }, [
        debouncedSearch, statusFilter, purokFilter, genderFilter, civilStatusFilter,
        voterFilter, headFilter, privilegeFilter, debouncedMinAge, debouncedMaxAge,
        sortBy, sortOrder, perPage
    ]);

    const reloadData = useCallback((page = 1) => {
        setIsLoading(true);
        
        const filters = { ...getCurrentFilters(), page };
        
        router.get('/admin/residents', filters, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
                setSelectedResidents([]);
                setIsSelectAll(false);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to load residents');
            }
        });
    }, [getCurrentFilters]);

    // Server-side filtering - reload data when filters change
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        
        reloadData();
    }, [
        debouncedSearch, statusFilter, purokFilter, genderFilter, civilStatusFilter,
        voterFilter, headFilter, privilegeFilter, debouncedMinAge, debouncedMaxAge,
        sortBy, sortOrder, perPage, reloadData
    ]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedResidents([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Handle per page change
    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        // Reset to page 1 when changing per page
        reloadData(1);
    };

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = currentResidents.map(resident => resident.id);
        if (isSelectAll) {
            setSelectedResidents(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedResidents, ...pageIds])];
            setSelectedResidents(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleItemSelect = (id: number) => {
        setSelectedResidents(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentResidents.map(resident => resident.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedResidents.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedResidents, currentResidents]);

    // Get selected residents data
    const selectedResidentsData = currentResidents.filter(resident => 
        selectedResidents.includes(resident.id)
    );

    // Calculate selection stats
    const selectionStats: SelectionStats = (() => {
        const baseStats = getSelectionStats(selectedResidentsData);
        
        const privilegeCounts: Record<string, number> = {};
        const heads = selectedResidentsData.filter(r => isHeadOfHousehold(r)).length;
        
        selectedResidentsData.forEach(resident => {
            if (resident.privileges && Array.isArray(resident.privileges)) {
                resident.privileges.forEach((privilege: ResidentPrivilege) => {
                    const code = privilege.privilege?.code || privilege.privilege_code || privilege.code;
                    if (code) {
                        privilegeCounts[code] = (privilegeCounts[code] || 0) + 1;
                    }
                });
            }
        });
        
        return {
            total: baseStats.total || 0,
            male: baseStats.male || 0,
            female: baseStats.female || 0,
            males: baseStats.male || 0,
            females: baseStats.female || 0,
            other: baseStats.other || 0,
            voters: baseStats.voters || 0,
            heads: heads || 0,
            active: baseStats.active || 0,
            inactive: baseStats.inactive || 0,
            averageAge: baseStats.averageAge || 0,
            hasPhotos: baseStats.hasPhotos || 0,
            privilegeCounts: privilegeCounts || {},
            hasPrivileges: selectedResidentsData.filter(r => r.privileges?.length > 0).length
        };
    })();

    // Handle page change
    const handlePageChange = (page: number) => {
        reloadData(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle sort change
    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    };

    const getCurrentSortValue = (): string => {
        return `${sortBy}-${sortOrder}`;
    };

    // Bulk operations
    const handleBulkOperation = async (operation: string, data?: any) => {
        if (selectedResidents.length === 0) {
            toast.error('Please select at least one resident');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'delete':
                    setShowBulkDeleteDialog(true);
                    break;
                case 'activate':
                case 'deactivate':
                    await router.post('/admin/residents/bulk-action', {
                        action: operation,
                        resident_ids: selectedResidents,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedResidents([]);
                            reloadData(paginationData.current_page);
                            toast.success(`${selectedResidents.length} residents ${operation}d successfully`);
                        },
                        onError: (errors) => {
                            toast.error(errors.message || `Failed to ${operation} residents`);
                        }
                    });
                    break;
                case 'update_status':
                    setShowBulkStatusDialog(true);
                    break;
                case 'update_purok':
                    setShowBulkPurokDialog(true);
                    break;
                case 'add_privilege':
                    setBulkPrivilegeAction('add');
                    setShowBulkPrivilegeDialog(true);
                    break;
                case 'remove_privilege':
                    setBulkPrivilegeAction('remove');
                    setShowBulkRemovePrivilegeDialog(true);
                    break;
                default:
                    toast.info(`Operation ${operation} to be implemented`);
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkPrivilegeAction = async () => {
        if (!bulkEditValue) {
            toast.error('Please select a privilege');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/residents/bulk-action', {
                action: bulkPrivilegeAction === 'add' ? 'add_privilege' : 'remove_privilege',
                resident_ids: selectedResidents,
                privilege_id: parseInt(bulkEditValue),
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedResidents([]);
                    setShowBulkPrivilegeDialog(false);
                    setShowBulkRemovePrivilegeDialog(false);
                    setBulkEditValue('');
                    reloadData(paginationData.current_page);
                    toast.success(`Privilege ${bulkPrivilegeAction === 'add' ? 'added to' : 'removed from'} ${selectedResidents.length} resident(s) successfully`);
                },
                onError: (errors) => {
                    toast.error(errors.message || `Failed to ${bulkPrivilegeAction} privilege`);
                }
            });
        } catch (error) {
            console.error('Bulk privilege operation error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkStatusUpdate = async (status: string) => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/residents/bulk-action', {
                action: 'update_status',
                resident_ids: selectedResidents,
                status: status,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedResidents([]);
                    setShowBulkStatusDialog(false);
                    setBulkEditValue('');
                    reloadData(paginationData.current_page);
                    toast.success(`Status updated to ${status} for ${selectedResidents.length} residents`);
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Failed to update status');
                }
            });
        } catch (error) {
            console.error('Bulk status update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkPurokUpdate = async (purokId: number) => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/residents/bulk-action', {
                action: 'update_purok',
                resident_ids: selectedResidents,
                purok_id: purokId,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedResidents([]);
                    setShowBulkPurokDialog(false);
                    setBulkEditValue('');
                    reloadData(paginationData.current_page);
                    toast.success(`Purok updated for ${selectedResidents.length} residents`);
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Failed to update purok');
                }
            });
        } catch (error) {
            console.error('Bulk purok update error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/residents/bulk-action', {
                action: 'delete',
                resident_ids: selectedResidents,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedResidents([]);
                    setShowBulkDeleteDialog(false);
                    reloadData(paginationData.current_page);
                    toast.success(`${selectedResidents.length} residents deleted successfully`);
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Failed to delete residents');
                }
            });
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleDelete = (resident: Resident) => {
        if (confirm(`Are you sure you want to delete resident "${getFullName(resident) || 'Untitled'}"?`)) {
            router.delete(`/admin/residents/${resident.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedResidents(selectedResidents.filter(id => id !== resident.id));
                    reloadData(paginationData.current_page);
                    toast.success('Resident deleted successfully');
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Failed to delete resident');
                }
            });
        }
    };

    const handleToggleStatus = (resident: Resident) => {
        const newStatus = resident.status === 'active' ? 'inactive' : 'active';
        router.post(`/admin/residents/${resident.id}/update-status`, {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                reloadData(paginationData.current_page);
                toast.success(`Resident status updated to ${newStatus}`);
            },
            onError: (errors) => {
                toast.error(errors.message || 'Failed to update resident status');
            }
        });
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleViewPhoto = (resident: Resident) => {
        console.log('View photo for:', getFullName(resident));
        toast.info('Photo viewer would open here');
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPurokFilter('all');
        setGenderFilter('all');
        setCivilStatusFilter('all');
        setVoterFilter('all');
        setHeadFilter('all');
        setPrivilegeFilter('all');
        setMinAge('');
        setMaxAge('');
        setSortBy('last_name');
        setSortOrder('asc');
        setPerPage('15');
    };

    const handleClearSelection = () => {
        setSelectedResidents([]);
        setIsSelectAll(false);
    };

    const hasActiveFilters = Boolean(
        search || 
        statusFilter !== 'all' || 
        purokFilter !== 'all' || 
        genderFilter !== 'all' ||
        civilStatusFilter !== 'all' ||
        voterFilter !== 'all' ||
        headFilter !== 'all' ||
        privilegeFilter !== 'all' ||
        minAge ||
        maxAge ||
        perPage !== '15'
    );

    // Prepare filters object for the Filters component
    const filtersStateForComponent = {
        status: statusFilter,
        purok_id: purokFilter,
        gender: genderFilter,
        privilege: privilegeFilter,
        civil_status: civilStatusFilter,
        is_voter: voterFilter,
        is_head: headFilter,
        privilege_id: privilegeFilter,
        min_age: minAge,
        max_age: maxAge,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: search,
        per_page: perPage
    };

    const updateFilter = (key: string, value: string) => {
        switch (key) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'purok_id':
                setPurokFilter(value);
                break;
            case 'gender':
                setGenderFilter(value);
                break;
            case 'civil_status':
                setCivilStatusFilter(value);
                break;
            case 'is_voter':
                setVoterFilter(value);
                break;
            case 'is_head':
                setHeadFilter(value);
                break;
            case 'privilege_id':
                setPrivilegeFilter(value);
                break;
            case 'min_age':
                setMinAge(value);
                break;
            case 'max_age':
                setMaxAge(value);
                break;
            case 'per_page':
                handlePerPageChange(value);
                break;
        }
    };

    // Keyboard shortcuts
    const bulkModeRef = useRef(isBulkMode);
    const selectedRef = useRef(selectedResidents);
    
    useEffect(() => {
        bulkModeRef.current = isBulkMode;
        selectedRef.current = selectedResidents;
    }, [isBulkMode, selectedResidents]);

    useEffect(() => {
        if (isMobile) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setIsBulkMode(prev => !prev);
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'a' && bulkModeRef.current) {
                e.preventDefault();
                const pageIds = currentResidents.map(r => r.id);
                setSelectedResidents(prev => {
                    const allSelected = pageIds.length > 0 && pageIds.every(id => prev.includes(id));
                    return allSelected 
                        ? prev.filter(id => !pageIds.includes(id))
                        : [...new Set([...prev, ...pageIds])];
                });
                setIsSelectAll(prev => !prev);
                setSelectionMode('page');
            }
            
            if (e.key === 'Escape' && bulkModeRef.current) {
                e.preventDefault();
                selectedRef.current.length > 0 ? setSelectedResidents([]) : setIsBulkMode(false);
            }
            
            if (e.ctrlKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            
            if (e.key === 'Delete' && bulkModeRef.current && selectedRef.current.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, currentResidents]);

    return (
        <AppLayout
            title="Residents"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Residents', href: '/admin/residents' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-4 sm:space-y-6">
                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading...</span>
                        </div>
                    )}
                    
                    <ResidentsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <ResidentsStats stats={stats} />

                    <ResidentsFilters
                        stats={stats}
                        search={search}
                        setSearch={setSearch}
                        onSearchChange={(e) => setSearch(e.target.value)}
                        filtersState={filtersStateForComponent}
                        updateFilter={updateFilter}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                        puroks={puroks}
                        privileges={privileges}
                        ageRanges={ageRanges}
                        civilStatusOptions={civilStatusOptions}
                        isMobile={isMobile}
                        totalItems={paginationData.total}
                        startIndex={paginationData.from}
                        endIndex={paginationData.to}
                        searchInputRef={searchInputRef}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                    />

                    <ResidentsContent
                        residents={currentResidents}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedResidents={selectedResidents}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={paginationData.current_page}
                        totalPages={paginationData.last_page}
                        totalItems={paginationData.total}
                        itemsPerPage={paginationData.per_page}
                        perPage={perPage}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={() => {}}
                        onSelectAll={() => {}}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onViewPhoto={handleViewPhoto}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={() => {}}
                        onSort={() => {}}
                        onBulkOperation={handleBulkOperation}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        setShowBulkPurokDialog={setShowBulkPurokDialog}
                        setShowBulkPrivilegeDialog={setShowBulkPrivilegeDialog}
                        setShowBulkRemovePrivilegeDialog={setShowBulkRemovePrivilegeDialog}
                        filtersState={filtersStateForComponent}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                        puroks={puroks}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        getCurrentSortValue={getCurrentSortValue}
                        isLoading={isLoading}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border hidden sm:block">
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                                    <span>Select page</span>
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

            <ResidentsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                showBulkPurokDialog={showBulkPurokDialog}
                setShowBulkPurokDialog={setShowBulkPurokDialog}
                showBulkPrivilegeDialog={showBulkPrivilegeDialog}
                setShowBulkPrivilegeDialog={setShowBulkPrivilegeDialog}
                showBulkRemovePrivilegeDialog={showBulkRemovePrivilegeDialog}
                setShowBulkRemovePrivilegeDialog={setShowBulkRemovePrivilegeDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                selectedResidents={selectedResidents}
                handleBulkOperation={handleBulkOperation}
                handleBulkPrivilegeAction={handleBulkPrivilegeAction}
                handleBulkStatusUpdate={handleBulkStatusUpdate}
                handleBulkPurokUpdate={handleBulkPurokUpdate}
                handleBulkDelete={handleBulkDelete}
                puroks={puroks}
                privileges={privileges}
                selectionStats={selectionStats}
                bulkPrivilegeAction={bulkPrivilegeAction}
            />
        </AppLayout>
    );
}