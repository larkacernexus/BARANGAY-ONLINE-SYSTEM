import { useState } from 'react';
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
import { useFilters } from '@/components/residentui/hooks/use-filters';
import { useMobile } from '@/components/residentui/hooks/use-mobile';
import { useSelection } from '@/components/residentui/hooks/use-selection';
import { Receipt, User, Calendar } from 'lucide-react';
import { 
    Fee, 
    FeesPaginatedResponse, 
    FeeStats, 
    FeeType, 
    Resident, 
    FeeFilters,
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
    filters?: FeeFilters;
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
    const [statusFilter, setStatusFilter] = useState('all');
    
    const { filters, updateFilters, loading, hasActiveFilters, clearFilters } = useFilters({
        initialFilters: props.filters || {},
        route: '/portal/fees'
    });
    
    // Custom selection state management since useSelection expects string | number ID
    const [selectedItems, setSelectedItems] = useState<Fee[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    
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
        setSelectedItems([...fees.data]);
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
    
    const [isExporting, setIsExporting] = useState(false);
    
    // Convert selected fees to number array for components that need just IDs
    const selectedFeeIds = selectedItems.map(fee => fee.id);
    
    const handleTabChange = (tab: string) => {
        setStatusFilter(tab);
        updateFilters({ status: tab === 'all' ? '' : tab, page: '1' });
        if (isMobile) setShowMobileFilters(false);
        // Clear selection when changing tabs
        clearSelection();
        setSelectMode(false);
    };
    
    const handleFeeTypeChange = (type: string) => {
        updateFilters({ fee_type: type === 'all' ? '' : type, page: '1' });
        if (isMobile) setShowMobileFilters(false);
        // Clear selection when changing filters
        clearSelection();
        setSelectMode(false);
    };
    
    const handleResidentChange = (resident: string) => {
        updateFilters({ resident: resident === 'all' ? '' : resident, page: '1' });
        if (isMobile) setShowMobileFilters(false);
        // Clear selection when changing filters
        clearSelection();
        setSelectMode(false);
    };
    
    const handleYearChange = (year: string) => {
        updateFilters({ year: year === 'all' ? '' : year, page: '1' });
        if (isMobile) setShowMobileFilters(false);
        // Clear selection when changing filters
        clearSelection();
        setSelectMode(false);
    };
    
    const handlePrintFees = () => {
        printFeesList(fees.data, statusFilter, formatDate, getCategoryDisplay, formatCurrency);
    };
    
    const handleExportCSV = () => {
        exportToCSV(fees.data, statusFilter, formatDate, getCategoryDisplay, setIsExporting, toast);
    };
    
    const handleCopyFeeCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied: ${code}`);
    };
    
    // Handle single fee selection for grid view
    const handleSelectFee = (fee: Fee) => {
        toggleSelect(fee);
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
    
    const currentFees = fees.data;
    const tabHasData = currentFees.length > 0;
    
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
                            search={filters.search || ''}
                            setSearch={(value) => updateFilters({ search: value, page: '1' })}
                            handleSearchSubmit={(e) => { e.preventDefault(); updateFilters({ search: filters.search, page: '1' }); }}
                            handleSearchClear={() => updateFilters({ search: '', page: '1' })}
                            feeTypeFilter={filters.fee_type || 'all'}
                            handleFeeTypeChange={handleFeeTypeChange}
                            residentFilter={filters.resident || 'all'}
                            handleResidentChange={handleResidentChange}
                            yearFilter={filters.year || 'all'}
                            handleYearChange={handleYearChange}
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
                                const summary = `Fees Summary: Total ${availableFeeTypes.length}`;
                                navigator.clipboard.writeText(summary);
                                toast.success('Summary copied');
                            }}
                        />
                    )}
                    
                    <div className="mt-4">
                        <CustomTabs 
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={(status) => getStatusCount(stats, status, currentFees)}
                        />
                        
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardContent className="p-4 md:p-6">
                                {selectMode && tabHasData && (
                                    <ModernSelectionBanner
                                        selectedCount={selectedItems.length}
                                        totalCount={currentFees.length}
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
                                    title={`${statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Fees`}
                                    description={tabHasData 
                                        ? `Showing ${currentFees.length} fee${currentFees.length !== 1 ? 's' : ''}`
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
                                                    disabled={isMobile}
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
                                ) : viewMode === 'grid' ? (
                                    <ModernFeeGridView
                                        fees={currentFees}
                                        selectMode={selectMode}
                                        selectedFees={selectedFeeIds}
                                        onSelectFee={handleSelectFee}
                                        getCategoryDisplay={getCategoryDisplay}
                                        formatDate={(date: string) => formatDate(date, isMobile)}
                                        onPrint={(fee: Fee) => printFeesList([fee], 'single', formatDate, getCategoryDisplay, formatCurrency)}
                                        isMobile={isMobile}
                                    />
                                ) : (
                                    <ModernFeeListView
                                        fees={currentFees}
                                        selectMode={selectMode}
                                        selectedFees={selectedFeeIds}
                                        onSelectFee={handleSelectFee}
                                        onSelectAll={selectAll}
                                        onCopyFeeCode={handleCopyFeeCode}
                                        onPrint={handlePrintFees}
                                    />
                                )}
                                
                                {fees.last_page > 1 && (
                                    <div className="mt-6">
                                        <ModernPagination
                                            currentPage={fees.current_page}
                                            lastPage={fees.last_page}
                                            onPageChange={(page: number) => updateFilters({ page: page.toString() })}
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
                    search={filters.search || ''}
                    onSearchChange={(value: string) => updateFilters({ search: value, page: '1' })}
                    onSearchSubmit={(e: React.FormEvent) => { e.preventDefault(); updateFilters({ search: filters.search, page: '1' }); }}
                    onSearchClear={() => updateFilters({ search: '', page: '1' })}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fee Type</label>
                        <ModernSelect
                            value={filters.fee_type || 'all'}
                            onValueChange={handleFeeTypeChange}
                            placeholder="All fee types"
                            options={availableFeeTypes.map((type: FeeType) => ({ value: type.id.toString(), label: type.name }))}
                            disabled={loading}
                            icon={Receipt}
                        />
                    </div>
                    
                    {householdResidents.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resident</label>
                            <ModernSelect
                                value={filters.resident || 'all'}
                                onValueChange={handleResidentChange}
                                placeholder="All residents"
                                options={householdResidents.map((resident: Resident) => ({
                                    value: resident.id.toString(),
                                    label: `${resident.first_name} ${resident.last_name}`
                                }))}
                                disabled={loading}
                                icon={User}
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                        <ModernSelect
                            value={filters.year || 'all'}
                            onValueChange={handleYearChange}
                            placeholder="All years"
                            options={availableYears.map((year: number) => ({ value: year.toString(), label: year.toString() }))}
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