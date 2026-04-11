// /Pages/resident/Fees/Index.tsx
import { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { ModernCardHeader } from '@/components/residentui/modern/card-header';
import { ViewToggle } from '@/components/residentui/modern/view-toggle';
import { SortDropdown } from '@/components/residentui/modern/sort-dropdown';
import { SelectModeButton } from '@/components/residentui/modern/select-mode-button';
import { ActionButtons } from '@/components/residentui/modern/action-buttons';
import { MobileHeader } from '@/components/residentui/modern/mobile-header';
import { DesktopHeader } from '@/components/residentui/modern/desktop-header';
import { ErrorState } from '@/components/residentui/modern/error-state';
import { ModernFeeListView } from '@/components/residentui/fees/modern-fee-list-view';
import { ModernFeeMobileListView } from '@/components/residentui/fees/modern-fee-mobile-list-view'; // New import
import { ModernFeeGridView } from '@/components/residentui/fees/modern-fee-grid-view';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernFeeFilters } from '@/components/residentui/fees/modern-fee-filters';
import { CustomTabs } from '@/components/residentui/CustomTabs';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernSelect } from '@/components/residentui/modern-select';
import { getFeeStatsCards } from '@/components/residentui/fees/constants';
import { formatDate, formatCurrency, getCategoryDisplay, getStatusCount, printFeesList, exportToCSV } from '@/components/residentui/fees/fee-utils';
import { useMobile } from '@/components/residentui/hooks/use-mobile';
import { Receipt, User, Calendar } from 'lucide-react';
import { 
    Fee, 
    FeesPaginatedResponse, 
    FeeStats, 
    FeeType, 
    Resident,
    getFeeStatusLabel,
    getFeeStatusColor,
    formatFeeAmount
} from '@/types/portal/fees/my-fees';

// Update PageProps with proper types
interface PageProps extends Record<string, any> {
    fees?: FeesPaginatedResponse;
    stats?: FeeStats;
    availableYears?: number[];
    availableFeeTypes?: FeeType[];
    householdResidents?: Resident[];
    currentResident?: Resident;
    hasProfile?: boolean;
    error?: string;
}

export default function MyFees() {
    const page = usePage<PageProps>();
    const { props } = page;
    
    const fees = props.fees || { 
        data: [], 
        current_page: 1, 
        last_page: 1, 
        total: 0, 
        from: 0, 
        to: 0, 
        per_page: 10,
        links: [] 
    };
    const stats = props.stats || {};
    const availableYears = props.availableYears || [];
    const availableFeeTypes = props.availableFeeTypes || [];
    const householdResidents = props.householdResidents || [];
    const hasProfile = props.hasProfile || false;
    
    const isMobile = useMobile();
    const [showStats, setShowStats] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'grid' : 'grid');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Client-side filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [feeTypeFilter, setFeeTypeFilter] = useState('all');
    const [residentFilter, setResidentFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Fee[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Filter fees client-side
    const filteredFees = useMemo(() => {
        let filtered = [...fees.data];
        
        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(fee => fee.status === statusFilter);
        }
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(fee => 
                fee.fee_code?.toLowerCase().includes(query) ||
                fee.description?.toLowerCase().includes(query) ||
                fee.amount?.toString().includes(query)
            );
        }
        
        // Fee type filter
        if (feeTypeFilter !== 'all') {
            filtered = filtered.filter(fee => fee.fee_type_id?.toString() === feeTypeFilter);
        }
        
        // Resident filter
        if (residentFilter !== 'all') {
            filtered = filtered.filter(fee => fee.resident_id?.toString() === residentFilter);
        }
        
        // Year filter
        if (yearFilter !== 'all') {
            filtered = filtered.filter(fee => {
                if (!fee.created_at) return false;
                try {
                    const feeYear = new Date(fee.created_at).getFullYear().toString();
                    return feeYear === yearFilter;
                } catch {
                    return false;
                }
            });
        }
        
        // Sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'date':
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
                case 'amount':
                    comparison = (a.amount || 0) - (b.amount || 0);
                    break;
                case 'status':
                    comparison = (a.status || '').localeCompare(b.status || '');
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return filtered;
    }, [fees.data, statusFilter, searchQuery, feeTypeFilter, residentFilter, yearFilter, sortBy, sortOrder]);
    
    // Pagination
    const itemsPerPage = fees.per_page || 10;
    const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
    const paginatedFees = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredFees.slice(start, end);
    }, [filteredFees, currentPage, itemsPerPage]);
    
    // Reset to first page when filters change
    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentPage(1);
        
        switch (filterType) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'search':
                setSearchQuery(value);
                break;
            case 'feeType':
                setFeeTypeFilter(value);
                break;
            case 'resident':
                setResidentFilter(value);
                break;
            case 'year':
                setYearFilter(value);
                break;
        }
        
        // Clear selection when changing filters
        clearSelection();
        setSelectMode(false);
    };
    
    const hasActiveFilters = statusFilter !== 'all' || 
                            searchQuery !== '' || 
                            feeTypeFilter !== 'all' || 
                            residentFilter !== 'all' || 
                            yearFilter !== 'all';
    
    const clearFilters = () => {
        setStatusFilter('all');
        setSearchQuery('');
        setFeeTypeFilter('all');
        setResidentFilter('all');
        setYearFilter('all');
        setCurrentPage(1);
        clearSelection();
        setSelectMode(false);
    };
    
    const toggleSelect = (fee: Fee) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(item => item.id === fee.id);
            if (isSelected) {
                return prev.filter(item => item.id !== fee.id);
            } else {
                return [...prev, fee];
            }
        });
    };
    
    const selectAll = () => {
        setSelectedItems([...paginatedFees]);
    };
    
    const clearSelection = () => {
        setSelectedItems([]);
    };
    
    const toggleSelectMode = () => {
        setSelectMode(prev => !prev);
        if (selectMode) {
            clearSelection();
        }
    };
    
    const selectedFeeIds = selectedItems.map(fee => fee.id);
    
    const handleTabChange = (tab: string) => {
        handleFilterChange('status', tab);
        if (isMobile) setShowMobileFilters(false);
    };
    
    const handlePrintFees = () => {
        printFeesList(filteredFees, statusFilter, formatDate, getCategoryDisplay, formatCurrency);
    };
    
    const handleExportCSV = () => {
        exportToCSV(filteredFees, statusFilter, formatDate, getCategoryDisplay, setIsExporting, toast);
    };
    
    const handleCopyFeeCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied: ${code}`);
    };
    
    const handleSelectFee = (fee: Fee) => {
        toggleSelect(fee);
    };
    
    const getResidentName = (residentId?: number): string => {
        if (!residentId) return 'N/A';
        const resident = householdResidents.find(r => r.id === residentId);
        if (resident) {
            return `${resident.first_name} ${resident.last_name}`;
        }
        return 'Unknown';
    };
    
    if (!hasProfile) {
        return (
            <ResidentLayout breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Fees', href: '/portal/fees' }
            ]}>
                <Head title="My Fees" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 w-16 h-16 flex items-center justify-center mx-auto">
                                    <User className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Profile Required</h3>
                                <p className="text-sm text-muted-foreground">
                                    Please complete your profile to view and manage fees.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }
    
    if (props.error) {
        return (
            <ResidentLayout breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Fees', href: '/portal/fees' }
            ]}>
                <Head title="My Fees" />
                <div className="space-y-6">
                    <DesktopHeader title="My Fees" description="View and manage your barangay fees and assessments" />
                    <ErrorState 
                        message={props.error} 
                        onGoHome={() => window.location.href = '/dashboard'} 
                    />
                </div>
            </ResidentLayout>
        );
    }
    
    const tabHasData = paginatedFees.length > 0;
    
    // Calculate stats for each tab based on filtered data
    const getStatusCountForTab = (status: string) => {
        if (status === 'all') return filteredFees.length;
        return filteredFees.filter(fee => fee.status === status).length;
    };
    
    return (
        <>
            <Head title="My Fees" />
            
            <ResidentLayout breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Fees', href: '/portal/fees' }
            ]}>
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {isMobile ? (
                        <MobileHeader
                            title="My Fees"
                            subtitle={`${stats.total_fees || 0} fee${stats.total_fees !== 1 ? 's' : ''} total`}
                            showStats={showStats}
                            onToggleStats={() => setShowStats(!showStats)}
                            onOpenFilters={() => setShowMobileFilters(true)}
                            hasActiveFilters={hasActiveFilters}
                        />
                    ) : (
                        <DesktopHeader
                            title="My Fees"
                            description="View and manage your barangay fees and assessments"
                            actions={
                                <ActionButtons
                                    onPrint={handlePrintFees}
                                    onExport={handleExportCSV}
                                    isExporting={isExporting}
                                />
                            }
                        />
                    )}
                    
                    {showStats && (
                        <div className="animate-slide-down">
                            <ModernStatsCards cards={getFeeStatsCards(stats)} loading={loading} />
                        </div>
                    )}
                    
                    {!isMobile && (
                        <ModernFeeFilters
                            search={searchQuery}
                            setSearch={(value) => handleFilterChange('search', value)}
                            handleSearchSubmit={(e) => { e.preventDefault(); }}
                            handleSearchClear={() => handleFilterChange('search', '')}
                            feeTypeFilter={feeTypeFilter}
                            handleFeeTypeChange={(type) => handleFilterChange('feeType', type)}
                            residentFilter={residentFilter}
                            handleResidentChange={(resident) => handleFilterChange('resident', resident)}
                            yearFilter={yearFilter}
                            handleYearChange={(year) => handleFilterChange('year', year)}
                            loading={loading}
                            availableFeeTypes={availableFeeTypes}
                            availableYears={availableYears}
                            householdResidents={householdResidents}
                            printFees={handlePrintFees}
                            exportToCSV={handleExportCSV}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={clearFilters}
                            onCopySummary={() => {
                                const summary = `Fees Summary: Total ${filteredFees.length}`;
                                navigator.clipboard.writeText(summary);
                                toast.success('Summary copied');
                            }}
                        />
                    )}
                    
                    <div className="mt-4">
                        <CustomTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={getStatusCountForTab}
                        />
                        
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardContent className="p-4 md:p-6">
                                {selectMode && tabHasData && (
                                    <ModernSelectionBanner
                                        selectedCount={selectedItems.length}
                                        totalCount={paginatedFees.length}
                                        onSelectAll={selectAll}
                                        onDeselectAll={clearSelection}
                                        onCancel={toggleSelectMode}
                                        onDelete={() => {
                                            toast.success(`Deleted ${selectedItems.length} fees`);
                                            clearSelection();
                                            setSelectMode(false);
                                        }}
                                        deleteLabel="Delete Selected"
                                    />
                                )}
                                
                                <ModernCardHeader
                                    title={`${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('_', ' ')} Fees`}
                                    description={tabHasData 
                                        ? `Showing ${paginatedFees.length} of ${filteredFees.length} fee${filteredFees.length !== 1 ? 's' : ''}`
                                        : `No ${statusFilter === 'all' ? 'fees' : statusFilter.replace('_', ' ')} found`
                                    }
                                    action={
                                        <div className="flex items-center gap-2">
                                            <SortDropdown
                                                sortBy={sortBy}
                                                sortOrder={sortOrder}
                                                onSort={(by, order) => {
                                                    setSortBy(by as 'date' | 'amount' | 'status');
                                                    setSortOrder(order);
                                                }}
                                            />
                                            {!selectMode && tabHasData && (
                                                <ViewToggle
                                                    viewMode={viewMode}
                                                    onViewChange={setViewMode}
                                                    disabled={false}
                                                />
                                            )}
                                            {tabHasData && (
                                                <SelectModeButton
                                                    isActive={selectMode}
                                                    onToggle={toggleSelectMode}
                                                />
                                            )}
                                        </div>
                                    }
                                />
                                
                                {!tabHasData ? (
                                    <ModernEmptyState 
                                        status={statusFilter} 
                                        hasFilters={hasActiveFilters}
                                        onClearFilters={clearFilters}
                                    />
                                ) : (
                                    // Mobile-specific rendering
                                    isMobile ? (
                                        viewMode === 'grid' ? (
                                            <ModernFeeGridView
                                                fees={paginatedFees}
                                                selectMode={selectMode}
                                                selectedFees={selectedFeeIds}
                                                onSelectFee={handleSelectFee}
                                                getCategoryDisplay={getCategoryDisplay}
                                                formatDate={(date: string) => formatDate(date, true)}
                                                onPrint={(fee: Fee) => printFeesList([fee], 'single', formatDate, getCategoryDisplay, formatCurrency)}
                                                isMobile={true}
                                            />
                                        ) : (
                                            <ModernFeeMobileListView
                                                fees={paginatedFees}
                                                selectMode={selectMode}
                                                selectedFees={selectedFeeIds}
                                                onSelectFee={handleSelectFee}
                                                getResidentName={getResidentName}
                                                getCategoryDisplay={getCategoryDisplay}
                                                formatDate={(date: string) => formatDate(date, true)}
                                                formatCurrency={formatCurrency}
                                                formatFeeAmount={formatFeeAmount}
                                                getFeeStatusLabel={getFeeStatusLabel}
                                                getFeeStatusColor={getFeeStatusColor}
                                                onPrintFee={(fee: Fee) => printFeesList([fee], 'single', formatDate, getCategoryDisplay, formatCurrency)}
                                                onCopyFeeCode={handleCopyFeeCode}
                                            />
                                        )
                                    ) : (
                                        // Desktop rendering
                                        viewMode === 'grid' ? (
                                            <ModernFeeGridView
                                                fees={paginatedFees}
                                                selectMode={selectMode}
                                                selectedFees={selectedFeeIds}
                                                onSelectFee={handleSelectFee}
                                                getCategoryDisplay={getCategoryDisplay}
                                                formatDate={(date: string) => formatDate(date, false)}
                                                onPrint={(fee: Fee) => printFeesList([fee], 'single', formatDate, getCategoryDisplay, formatCurrency)}
                                                isMobile={false}
                                            />
                                        ) : (
                                            <ModernFeeListView
                                                fees={paginatedFees}
                                                selectMode={selectMode}
                                                selectedFees={selectedFeeIds}
                                                onSelectFee={handleSelectFee}
                                                onSelectAll={selectAll}
                                                onCopyFeeCode={handleCopyFeeCode}
                                                onPrint={handlePrintFees}
                                            />
                                        )
                                    )
                                )}
                                
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <ModernPagination
                                            currentPage={currentPage}
                                            lastPage={totalPages}
                                            onPageChange={(page: number) => setCurrentPage(page)}
                                            loading={loading}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                
                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Fees"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={searchQuery}
                    onSearchChange={(value: string) => handleFilterChange('search', value)}
                    onSearchSubmit={(e: React.FormEvent) => { e.preventDefault(); }}
                    onSearchClear={() => handleFilterChange('search', '')}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fee Type</label>
                        <ModernSelect
                            value={feeTypeFilter}
                            onValueChange={(value) => handleFilterChange('feeType', value)}
                            placeholder="All fee types"
                            options={[
                                { value: 'all', label: 'All fee types' },
                                ...availableFeeTypes.map((type: FeeType) => ({ 
                                    value: type.id.toString(), 
                                    label: type.name 
                                }))
                            ]}
                            disabled={loading}
                            icon={Receipt}
                        />
                    </div>
                    
                    {householdResidents.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resident</label>
                            <ModernSelect
                                value={residentFilter}
                                onValueChange={(value) => handleFilterChange('resident', value)}
                                placeholder="All residents"
                                options={[
                                    { value: 'all', label: 'All residents' },
                                    ...householdResidents.map((resident: Resident) => ({
                                        value: resident.id.toString(),
                                        label: `${resident.first_name} ${resident.last_name}`
                                    }))
                                ]}
                                disabled={loading}
                                icon={User}
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                        <ModernSelect
                            value={yearFilter}
                            onValueChange={(value) => handleFilterChange('year', value)}
                            placeholder="All years"
                            options={[
                                { value: 'all', label: 'All years' },
                                ...availableYears.map((year: number) => ({ 
                                    value: year.toString(), 
                                    label: year.toString() 
                                }))
                            ]}
                            disabled={loading}
                            icon={Calendar}
                        />
                    </div>
                </ModernFilterModal>
                
                <ModernLoadingOverlay loading={loading} message="Loading fees..." />
            </ResidentLayout>
        </>
    );
}