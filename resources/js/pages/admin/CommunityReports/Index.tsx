import AppLayout from '@/layouts/admin-app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect } from 'react';

// Custom hooks
import { useCommunityReportsManagement } from '@/hooks/useCommunityReportsManagement';

// Components
import CommunityReportsHeader from '@/components/admin/community-reports/CommunityReportsHeader';
import CommunityReportsStats from '@/components/admin/community-reports/CommunityReportsStats';
import CommunityReportsFilters from '@/components/admin/community-reports/CommunityReportsFilters';
import QuickFilters from '@/components/admin/community-reports/QuickFilters';
import CommunityReportsContent from '@/components/admin/community-reports/CommunityReportsContent';
import CommunityReportsDialogs from '@/components/admin/community-reports/CommunityReportsDialogs';
import FlashMessages from '@/components/admin/community-reports/FlashMessages';
import QuickInsights from '@/components/admin/community-reports/QuickInsights';
import RecentReports from '@/components/admin/community-reports/RecentReports';
import KeyboardShortcutsHelp from '@/components/admin/community-reports/KeyboardShortcutsHelp';

// Types
import { Filters, Stats } from '@/admin-utils/communityReportTypes';

interface CommunityReportsIndexProps {
    reports: any;
    filters: Filters;
    statuses?: Record<string, string>;
    priorities?: Record<string, string>;
    urgencies?: Record<string, string>;
    report_types?: Array<{id: number, name: string, category: string}>;
    categories?: string[];
    puroks?: string[];
    staff?: Array<{id: number, name: string}>;
    stats: Stats;
}

export default function CommunityReportsIndex({
    reports: rawReports,
    filters,
    statuses: rawStatuses,
    priorities: rawPriorities,
    urgencies: rawUrgencies,
    report_types: rawReportTypes,
    categories: rawCategories,
    puroks: rawPuroks,
    staff: rawStaff,
    stats: rawStats
}: CommunityReportsIndexProps) {
    
    const { flash } = usePage().props as any;
    
    // Use the custom hook for state management
    const {
        // State
        search, setSearch,
        statusFilter, setStatusFilter,
        priorityFilter, setPriorityFilter,
        urgencyFilter, setUrgencyFilter,
        reportTypeFilter, setReportTypeFilter,
        categoryFilter, setCategoryFilter,
        impactFilter, setImpactFilter,
        purokFilter, setPurokFilter,
        assignedFilter, setAssignedFilter,
        sourceFilter, setSourceFilter,
        fromDateFilter, setFromDateFilter,
        toDateFilter, setToDateFilter,
        hasEvidencesFilter, setHasEvidencesFilter,
        safetyConcernFilter, setSafetyConcernFilter,
        environmentalFilter, setEnvironmentalFilter,
        recurringFilter, setRecurringFilter,
        anonymousFilter, setAnonymousFilter,
        affectedPeopleFilter, setAffectedPeopleFilter,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        showAdvancedFilters, setShowAdvancedFilters,
        currentPage, setCurrentPage,
        itemsPerPage,
        windowWidth,
        selectedReports,
        isBulkMode, setIsBulkMode,
        showBulkActions, setShowBulkActions,
        isSelectAll,
        showBulkDeleteDialog, setShowBulkDeleteDialog,
        showBulkStatusDialog, setShowBulkStatusDialog,
        showBulkPriorityDialog, setShowBulkPriorityDialog,
        showBulkAssignDialog, setShowBulkAssignDialog,
        isPerformingBulkAction,
        viewMode, setViewMode,
        bulkEditValue, setBulkEditValue,
        selectionMode,
        showSelectionOptions, setShowSelectionOptions,
        expandedReport, setExpandedReport,
        
        // Refs
        bulkActionRef,
        selectionRef,
        searchInputRef,
        
        // Computed values
        filteredReports,
        paginatedReports,
        safeStats,
        safeStatuses,
        safePriorities,
        safeUrgencies,
        safeReportTypes,
        safeCategories,
        safePuroks,
        safeStaff,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        hasActiveFilters,
        selectionStats,
        
        // Handlers
        handleSelectAllOnPage,
        handleSelectAllFiltered,
        handleSelectAll,
        handleItemSelect,
        handleBulkOperation,
        handleCopySelectedData,
        handleCopyToClipboard,
        handleClearFilters,
        handleSort,
        handleDelete,
        toggleReportExpansion,
        handleExport,
        handleClearSelection // THIS IS ALREADY DEFINED HERE
    } = useCommunityReportsManagement({
        reports: rawReports,
        filters,
        statuses: rawStatuses,
        priorities: rawPriorities,
        urgencies: rawUrgencies,
        report_types: rawReportTypes,
        categories: rawCategories,
        puroks: rawPuroks,
        staff: rawStaff,
        stats: rawStats
    });

    // Add mark as resolved handler
    const handleMarkResolved = (report: any) => {
        // Implement mark as resolved logic here
        console.log('Mark as resolved:', report.id);
    };

    return (
        <AppLayout
            title="Community Reports Management"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Community Reports', href: '/admin/community-reports' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Flash Messages */}
                    <FlashMessages flash={flash} />
                    
                    {/* Header */}
                    <CommunityReportsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                    />
                    
                    {/* Stats Cards */}
                    <CommunityReportsStats stats={safeStats} />
                    
                    {/* Search and Filters */}
                    <CommunityReportsFilters
                        search={search}
                        setSearch={setSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        priorityFilter={priorityFilter}
                        setPriorityFilter={setPriorityFilter}
                        urgencyFilter={urgencyFilter}
                        setUrgencyFilter={setUrgencyFilter}
                        reportTypeFilter={reportTypeFilter}
                        setReportTypeFilter={setReportTypeFilter}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        impactFilter={impactFilter}
                        setImpactFilter={setImpactFilter}
                        purokFilter={purokFilter}
                        setPurokFilter={setPurokFilter}
                        assignedFilter={assignedFilter}
                        setAssignedFilter={setAssignedFilter}
                        sourceFilter={sourceFilter}
                        setSourceFilter={setSourceFilter}
                        fromDateFilter={fromDateFilter}
                        setFromDateFilter={setFromDateFilter}
                        toDateFilter={toDateFilter}
                        setToDateFilter={setToDateFilter}
                        hasEvidencesFilter={hasEvidencesFilter}
                        setHasEvidencesFilter={setHasEvidencesFilter}
                        safetyConcernFilter={safetyConcernFilter}
                        setSafetyConcernFilter={setSafetyConcernFilter}
                        environmentalFilter={environmentalFilter}
                        setEnvironmentalFilter={setEnvironmentalFilter}
                        recurringFilter={recurringFilter}
                        setRecurringFilter={setRecurringFilter}
                        anonymousFilter={anonymousFilter}
                        setAnonymousFilter={setAnonymousFilter}
                        affectedPeopleFilter={affectedPeopleFilter}
                        setAffectedPeopleFilter={setAffectedPeopleFilter}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        safeStatuses={safeStatuses}
                        safePriorities={safePriorities}
                        safeUrgencies={safeUrgencies}
                        safeReportTypes={safeReportTypes}
                        safeCategories={safeCategories}
                        safePuroks={safePuroks}
                        safeStaff={safeStaff}
                        isBulkMode={isBulkMode}
                        selectedReports={selectedReports}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        hasActiveFilters={hasActiveFilters}
                        showSelectionOptions={showSelectionOptions}
                        setShowSelectionOptions={setShowSelectionOptions}
                        handleClearFilters={handleClearFilters}
                        handleSelectAllOnPage={handleSelectAllOnPage}
                        handleSelectAllFiltered={handleSelectAllFiltered}
                        handleSelectAll={handleSelectAll}
                        handleExport={handleExport}
                        searchInputRef={searchInputRef}
                        selectionRef={selectionRef}
                        windowWidth={windowWidth}
                    />

                    {/* Quick Filters */}
                    <QuickFilters
                        filters={{
                            priorityFilter,
                            safetyConcernFilter,
                            urgencyFilter,
                            assignedFilter,
                            hasEvidencesFilter,
                            affectedPeopleFilter,
                            environmentalFilter,
                            recurringFilter
                        }}
                        onFilterChange={{
                            setPriorityFilter,
                            setSafetyConcernFilter,
                            setUrgencyFilter,
                            setAssignedFilter,
                            setHasEvidencesFilter,
                            setAffectedPeopleFilter,
                            setEnvironmentalFilter,
                            setRecurringFilter,
                            setStatusFilter
                        }}
                    />
                    
                    
                    {/* Main Content */}
                    <CommunityReportsContent
                        reports={paginatedReports}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        selectedReports={selectedReports}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onItemSelect={handleItemSelect}
                        onClearFilters={handleClearFilters}
                        onDelete={handleDelete}
                        onCopyToClipboard={handleCopyToClipboard}
                        onSort={handleSort}
                        isSelectAll={isSelectAll}
                        expandedReport={expandedReport}
                        toggleReportExpansion={toggleReportExpansion}
                        safeStatuses={safeStatuses}
                        safePriorities={safePriorities}
                        safeUrgencies={safeUrgencies}
                        windowWidth={windowWidth}
                        hasActiveFilters={hasActiveFilters}
                        isPerformingBulkAction={isPerformingBulkAction}
                        onMarkResolved={handleMarkResolved}
                        onViewDetails={(report) => {
                            router.visit(`/admin/community-reports/${report.id}`);
                        }}
                        onPrintReport={(report) => {
                            window.open(`/admin/community-reports/${report.id}/print`, '_blank');
                        }}
                        // Add bulk operation props
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                        setShowBulkStatusDialog={setShowBulkStatusDialog}
                        setShowBulkPriorityDialog={setShowBulkPriorityDialog}
                        setShowBulkAssignDialog={setShowBulkAssignDialog}
                        selectionStats={selectionStats}
                        selectionMode={selectionMode}
                    />
                    
                    {/* Additional Information */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <RecentReports reports={paginatedReports} windowWidth={windowWidth} />
                        <QuickInsights filteredReports={filteredReports} />
                    </div>
                    
                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && (
                        <KeyboardShortcutsHelp 
                            isBulkMode={isBulkMode}
                            setIsBulkMode={setIsBulkMode}
                            isPerformingBulkAction={isPerformingBulkAction}
                        />
                    )}
                </div>
            </TooltipProvider>
            
            {/* Dialogs */}
            <CommunityReportsDialogs
                showBulkDeleteDialog={showBulkDeleteDialog}
                setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                showBulkStatusDialog={showBulkStatusDialog}
                setShowBulkStatusDialog={setShowBulkStatusDialog}
                showBulkPriorityDialog={showBulkPriorityDialog}
                setShowBulkPriorityDialog={setShowBulkPriorityDialog}
                showBulkAssignDialog={showBulkAssignDialog}
                setShowBulkAssignDialog={setShowBulkAssignDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedReports={selectedReports}
                handleBulkOperation={handleBulkOperation}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
                safeStatuses={safeStatuses}
                safePriorities={safePriorities}
                safeStaff={safeStaff}
            />
        </AppLayout>
    );
}