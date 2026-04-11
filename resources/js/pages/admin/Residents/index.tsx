import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { ResidentsProps, Resident, FilterState, SelectionMode, SelectionStats, Privilege, ResidentPrivilege } from '@/types/admin/residents/residents-types';
import { 
    filterResidents,
    getSelectionStats,
    formatForClipboard,
    getFullName,
    isHeadOfHousehold,
    getStatusBadgeVariant,
    formatDate,
} from '@/admin-utils/residentsUtils';

// Import reusable components
import { TooltipProvider } from '@/components/ui/tooltip';
import ResidentsHeader from '@/components/admin/residents/ResidentsHeader';
import ResidentsStats from '@/components/admin/residents/ResidentsStats';
import ResidentsFilters from '@/components/admin/residents/ResidentsFilters';
import ResidentsContent from '@/components/admin/residents/ResidentsContent';
import ResidentsDialogs from '@/components/admin/residents/ResidentsDialogs';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export default function Residents() {
    const { props } = usePage<ResidentsProps>();
    const { 
        residents, 
        stats, 
        filters, 
        puroks, 
        civilStatusOptions = [], 
        ageRanges = [], 
        allResidents,
        privileges = [] 
    } = props;
    
    // State management for client-side filtering/sorting
// State management for client-side filtering/sorting
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [purokFilter, setPurokFilter] = useState<string>(filters.purok_id ? String(filters.purok_id) : 'all');
    const [genderFilter, setGenderFilter] = useState<string>(filters.gender || 'all');
    const [civilStatusFilter, setCivilStatusFilter] = useState<string>(filters.civil_status || 'all');
    const [voterFilter, setVoterFilter] = useState<string>(filters.is_voter || 'all');
    const [headFilter, setHeadFilter] = useState<string>(filters.is_head || 'all');
    const [privilegeFilter, setPrivilegeFilter] = useState<string>(
        filters.privilege_id ? String(filters.privilege_id) : 'all'
    );
    const [minAge, setMinAge] = useState<string>(filters.min_age ? String(filters.min_age) : '');
    const [maxAge, setMaxAge] = useState<string>(filters.max_age ? String(filters.max_age) : '');
    const [sortBy, setSortBy] = useState<string>(filters.sort_by || 'last_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sort_order as 'asc' | 'desc' || 'asc');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, purokFilter, genderFilter, civilStatusFilter, voterFilter, headFilter, privilegeFilter, minAge, maxAge, sortBy, sortOrder]);

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedResidents([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Keyboard shortcuts
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedResidents.length > 0) {
                        setSelectedResidents([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Delete' && isBulkMode && selectedResidents.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedResidents, isMobile]);

    // Filter and sort residents (client-side)
    const filteredResidents = useMemo(() => {
        let filtered = [...allResidents];
        
        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(resident =>
                (resident.first_name?.toLowerCase() || '').includes(searchLower) ||
                (resident.last_name?.toLowerCase() || '').includes(searchLower) ||
                (resident.middle_name?.toLowerCase() || '').includes(searchLower) ||
                (resident.email?.toLowerCase() || '').includes(searchLower) ||
                (resident.contact_number?.toLowerCase() || '').includes(searchLower)
            );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(resident => resident.status === statusFilter);
        }
        
        // Apply purok filter
        if (purokFilter !== 'all') {
            filtered = filtered.filter(resident => resident.purok_id?.toString() === purokFilter);
        }
        
        // Apply gender filter
        if (genderFilter !== 'all') {
            filtered = filtered.filter(resident => resident.gender === genderFilter);
        }
        
        // Apply civil status filter
        if (civilStatusFilter !== 'all') {
            filtered = filtered.filter(resident => resident.civil_status === civilStatusFilter);
        }
        
        // Apply voter filter
        if (voterFilter !== 'all') {
            filtered = filtered.filter(resident => resident.is_voter === (voterFilter === 'yes'));
        }
        
        // Apply head filter
        if (headFilter !== 'all') {
            filtered = filtered.filter(resident => isHeadOfHousehold(resident) === (headFilter === 'yes'));
        }
        
        // Apply privilege filter
        if (privilegeFilter !== 'all') {
            filtered = filtered.filter(resident =>
                resident.privileges?.some(p => p.privilege_id?.toString() === privilegeFilter || p.privilege_code === privilegeFilter)
            );
        }
        
        // Apply age range filter
        if (minAge) {
            const min = parseInt(minAge);
            filtered = filtered.filter(resident => (resident.age || 0) >= min);
        }
        if (maxAge) {
            const max = parseInt(maxAge);
            filtered = filtered.filter(resident => (resident.age || 0) <= max);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let valueA: any;
            let valueB: any;
            
            switch (sortBy) {
                case 'first_name':
                    valueA = a.first_name || '';
                    valueB = b.first_name || '';
                    break;
                case 'last_name':
                    valueA = a.last_name || '';
                    valueB = b.last_name || '';
                    break;
                case 'age':
                    valueA = a.age || 0;
                    valueB = b.age || 0;
                    break;
                case 'gender':
                    valueA = a.gender || '';
                    valueB = b.gender || '';
                    break;
                case 'civil_status':
                    valueA = a.civil_status || '';
                    valueB = b.civil_status || '';
                    break;
                case 'status':
                    valueA = a.status || '';
                    valueB = b.status || '';
                    break;
                case 'purok':
                    valueA = a.purok?.name || '';
                    valueB = b.purok?.name || '';
                    break;
                case 'is_voter':
                    valueA = a.is_voter ? 1 : 0;
                    valueB = b.is_voter ? 1 : 0;
                    break;
                case 'created_at':
                    valueA = new Date(a.created_at).getTime();
                    valueB = new Date(b.created_at).getTime();
                    break;
                default:
                    valueA = a.last_name || '';
                    valueB = b.last_name || '';
            }
            
            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [allResidents, search, statusFilter, purokFilter, genderFilter, civilStatusFilter, voterFilter, headFilter, privilegeFilter, minAge, maxAge, sortBy, sortOrder]);

    // Pagination
    const totalItems = filteredResidents.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedResidents = filteredResidents.slice(startIndex, endIndex);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = paginatedResidents.map(resident => resident.id);
        if (isSelectAll) {
            setSelectedResidents(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedResidents, ...pageIds])];
            setSelectedResidents(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = filteredResidents.map(resident => resident.id);
        if (selectedResidents.length === allIds.length && allIds.every(id => selectedResidents.includes(id))) {
            setSelectedResidents(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedResidents, ...allIds])];
            setSelectedResidents(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${allResidents.length || 0} residents. This action may take a moment.`)) {
            const allIds = allResidents.map(resident => resident.id);
            setSelectedResidents(allIds);
            setSelectionMode('all');
        }
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
        const allPageIds = paginatedResidents.map(resident => resident.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedResidents.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedResidents, paginatedResidents]);

    // Get selected residents data
    const selectedResidentsData = useMemo(() => {
        return filteredResidents.filter(resident => selectedResidents.includes(resident.id));
    }, [selectedResidents, filteredResidents]);

    // Calculate selection stats
    const rawSelectionStats = useMemo(() => {
        const baseStats = getSelectionStats(selectedResidentsData);
        
        const privilegeCounts: Record<string, number> = {};
        const heads = selectedResidentsData.filter(r => isHeadOfHousehold(r)).length;
        
        selectedResidentsData.forEach(resident => {
            if (resident.privileges && Array.isArray(resident.privileges)) {
                resident.privileges.forEach((privilege: ResidentPrivilege) => {
                    const code = privilege.privilege?.code || privilege.privilege_code;
                    if (code) {
                        privilegeCounts[code] = (privilegeCounts[code] || 0) + 1;
                    }
                });
            }
        });
        
        return {
            ...baseStats,
            heads,
            privilegeCounts,
            hasPrivileges: selectedResidentsData.filter(r => r.privileges?.length > 0).length
        };
    }, [selectedResidentsData]);

    const selectionStats: SelectionStats = useMemo(() => {
        return {
            total: rawSelectionStats.total || 0,
            male: rawSelectionStats.male || 0,
            female: rawSelectionStats.female || 0,
            males: rawSelectionStats.male || 0,
            females: rawSelectionStats.female || 0,
            other: rawSelectionStats.other || 0,
            voters: rawSelectionStats.voters || 0,
            heads: rawSelectionStats.heads || 0,
            active: rawSelectionStats.active || 0,
            inactive: rawSelectionStats.inactive || 0,
            averageAge: rawSelectionStats.averageAge || 0,
            hasPhotos: rawSelectionStats.hasPhotos || 0,
            privilegeCounts: rawSelectionStats.privilegeCounts || {},
            hasPrivileges: rawSelectionStats.hasPrivileges || 0
        };
    }, [rawSelectionStats]);

    // Handle sort change from dropdown
    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    };

    // Get current sort value for dropdown
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
                case 'export':
                case 'print':
                case 'print_ids':
                case 'export_csv':
                    toast.info(`${operation} functionality to be implemented`);
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

    const handleCopySelectedData = () => {
        if (selectedResidentsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const csv = formatForClipboard(selectedResidentsData);
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success(`${selectedResidentsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleDelete = (resident: Resident) => {
        if (confirm(`Are you sure you want to delete resident "${getFullName(resident) || 'Untitled'}"?`)) {
            router.delete(`/admin/residents/${resident.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedResidents(selectedResidents.filter(id => id !== resident.id));
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
        setCurrentPage(1);
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
        maxAge
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
        search: search
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
        }
    };

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
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                    />

                    <ResidentsContent
                        residents={paginatedResidents}
                        stats={stats}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedResidents={selectedResidents}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onViewPhoto={handleViewPhoto}
                        onCopyToClipboard={handleCopyToClipboard}
                        onCopySelectedData={handleCopySelectedData}
                        onSort={() => {}} // No longer needed for server-side
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
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
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