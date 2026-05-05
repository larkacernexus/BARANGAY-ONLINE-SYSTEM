import { useState, useEffect, useMemo } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Clock, DollarSign, Loader2, CheckCircle, FileCheck, XCircle, Plus } from 'lucide-react';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ClearanceTabs, CLEARANCE_TABS_CONFIG } from '@/components/portal/clearance/index/clearance-tabs';
import {
    formatDate as baseFormatDate,
    formatCurrency as baseFormatCurrency,
    getClearanceTypeDisplay,
    copyToClipboard,
    printClearancesList,
    exportClearancesToCSV,
} from '@/components/residentui/clearances/clearance-utils';
import { ModernClearanceCard } from '@/components/residentui/clearances/modern-clearance-card';
import { ModernClearanceGridCard } from '@/components/residentui/clearances/modern-clearance-grid-card';
import { ModernClearanceMobileListView } from '@/components/residentui/clearances/modern-clearance-mobile-list-view';
import { ModernClearanceFilters } from '@/components/residentui/clearances/modern-clearance-filters';
import { ModernClearanceTable } from '@/components/residentui/clearances/modern-clearance-table';
import { CollapsibleStats } from '@/components/residentui/clearances/CollapsibleStats';
import { DesktopStats } from '@/components/portal/clearance/index/DesktopStats';
import { HeaderSection } from '@/components/portal/clearance/index/HeaderSection';
import { TabHeader } from '@/components/portal/clearance/index/TabHeader';
import { FilterModalContent } from '@/components/portal/clearance/index/FilterModalContent';
import type { ClearanceRequest, Household, ClearanceStats } from '@/types/portal/clearances/clearance.types';

const formatDate = (date: string | null | undefined, isMobile: boolean = false): string => {
    if (!date) return '—';
    return baseFormatDate(date, isMobile);
};

const formatCurrency = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null) return '₱0.00';
    return baseFormatCurrency(amount);
};

interface PageProps {
    clearances?: {
        data: ClearanceRequest[];
    };
    stats?: ClearanceStats;
    availableYears?: number[];
    availableClearanceTypes?: Array<{ id: number; name: string }>;
    householdResidents?: Array<{ id: number; first_name: string; last_name: string }>;
    currentResident?: { id: number; first_name: string; last_name: string };
    household?: Household;
    error?: string;
    [key: string]: unknown;
}

type StatusFilterValue =
    | 'pending'
    | 'pending_payment'
    | 'processing'
    | 'approved'
    | 'issued'
    | 'rejected'
    | 'cancelled'
    | 'all';
type UrgencyFilterValue = 'normal' | 'rush' | 'express' | 'all';

export default function MyClearances() {
    const { props } = usePage<PageProps>();

    const allClearances: ClearanceRequest[] = props.clearances?.data ?? [];

    const stats: ClearanceStats = props.stats ?? {
        total_clearances: 0,
        pending_clearances: 0,
        pending_payment_clearances: 0,
        processing_clearances: 0,
        approved_clearances: 0,
        issued_clearances: 0,
        rejected_clearances: 0,
        cancelled_clearances: 0,
        total_fees: 0,
        total_paid: 0,
        total_balance: 0,
        current_year_total: 0,
        current_year_issued: 0,
    };

    const availableYears: number[] = props.availableYears ?? [];
    const availableClearanceTypes = props.availableClearanceTypes ?? [];
    const householdResidents = props.householdResidents ?? [];
    const currentResident = props.currentResident ?? { id: 0, first_name: '', last_name: '' };
    const household: Household = props.household ?? { id: 0, household_number: '', head_of_family: '' };

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
    const [clearanceTypeFilter, setClearanceTypeFilter] = useState<string>('all');
    const [residentFilter, setResidentFilter] = useState<string>('all');
    const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilterValue>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [loading] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(true);
    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
    const [selectedClearances, setSelectedClearances] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const filteredClearances: ClearanceRequest[] = useMemo((): ClearanceRequest[] => {
        let filtered = [...allClearances];

        if (statusFilter !== 'all') {
            filtered = filtered.filter((clearance) => clearance.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (clearance) =>
                    clearance.reference_number?.toLowerCase().includes(query) ||
                    clearance.purpose?.toLowerCase().includes(query) ||
                    clearance.clearance_type_name?.toLowerCase().includes(query),
            );
        }

        if (clearanceTypeFilter !== 'all') {
            filtered = filtered.filter(
                (clearance) => clearance.clearance_type_id?.toString() === clearanceTypeFilter,
            );
        }

        if (residentFilter !== 'all') {
            filtered = filtered.filter(
                (clearance) => clearance.resident_id?.toString() === residentFilter,
            );
        }

        if (urgencyFilter !== 'all') {
            filtered = filtered.filter((clearance) => clearance.urgency === urgencyFilter);
        }

        if (yearFilter !== 'all') {
            filtered = filtered.filter((clearance) => {
                if (!clearance.created_at) return false;
                try {
                    const clearanceYear = new Date(clearance.created_at).getFullYear().toString();
                    return clearanceYear === yearFilter;
                } catch {
                    return false;
                }
            });
        }

        filtered.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

        return filtered;
    }, [allClearances, statusFilter, searchQuery, clearanceTypeFilter, residentFilter, urgencyFilter, yearFilter]);

    const tabCounts: Record<string, number> = useMemo((): Record<string, number> => {
        const counts: Record<string, number> = {};

        for (const tab of CLEARANCE_TABS_CONFIG) {
            counts[tab.id] = 0;
        }

        counts.all = allClearances.length;

        for (const clearance of allClearances) {
            const status = clearance?.status;
            if (status && status in counts) {
                counts[status]++;
            }
        }

        return counts;
    }, [allClearances]);

    const itemsPerPage = 15;
    const totalPages: number = Math.max(1, Math.ceil(filteredClearances.length / itemsPerPage));
    const safeCurrentPage: number = Math.min(currentPage, totalPages);

    const paginatedClearances: ClearanceRequest[] = useMemo((): ClearanceRequest[] => {
        const start = (safeCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredClearances.slice(start, end);
    }, [filteredClearances, safeCurrentPage, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handleFilterChange = (filterType: string, value: string): void => {
        setCurrentPage(1);

        switch (filterType) {
            case 'status':
                setStatusFilter(value as StatusFilterValue);
                break;
            case 'search':
                setSearchQuery(value);
                break;
            case 'clearanceType':
                setClearanceTypeFilter(value);
                break;
            case 'resident':
                setResidentFilter(value);
                break;
            case 'urgency':
                setUrgencyFilter(value as UrgencyFilterValue);
                break;
            case 'year':
                setYearFilter(value);
                break;
        }

        setSelectedClearances([]);
        setSelectMode(false);
    };

    const hasActiveFilters: boolean =
        statusFilter !== 'all' ||
        searchQuery !== '' ||
        clearanceTypeFilter !== 'all' ||
        residentFilter !== 'all' ||
        urgencyFilter !== 'all' ||
        yearFilter !== 'all';

    const clearFilters = (): void => {
        setStatusFilter('all');
        setSearchQuery('');
        setClearanceTypeFilter('all');
        setResidentFilter('all');
        setUrgencyFilter('all');
        setYearFilter('all');
        setCurrentPage(1);
        setShowMobileFilters(false);
        setSelectedClearances([]);
        setSelectMode(false);
    };

    const handleTabChange = (tab: string): void => {
        handleFilterChange('status', tab);
        if (isMobile) {
            setShowMobileFilters(false);
        }
    };

    const toggleSelectClearance = (id: number): void => {
        setSelectedClearances((prev) =>
            prev.includes(id) ? prev.filter((clearanceId) => clearanceId !== id) : [...prev, id],
        );
    };

    const selectAllClearances = (): void => {
        if (paginatedClearances.length === 0) return;

        if (selectedClearances.length === paginatedClearances.length) {
            setSelectedClearances([]);
        } else {
            setSelectedClearances(
                paginatedClearances.map((c) => c.id).filter((id): id is number => id !== undefined && id !== null),
            );
        }
    };

    const toggleSelectMode = (): void => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedClearances([]);
        } else {
            setSelectMode(true);
        }
    };

    const handleDeleteSelected = (): void => {
        if (selectedClearances.length === 0) return;

        if (
            confirm(
                `Are you sure you want to delete ${selectedClearances.length} selected clearance request${selectedClearances.length > 1 ? 's' : ''}?`,
            )
        ) {
            toast.success(`Deleted ${selectedClearances.length} clearance request${selectedClearances.length > 1 ? 's' : ''}`);
            setSelectedClearances([]);
            setSelectMode(false);
        }
    };

    const handleViewDetails = (id: number): void => {
        if (id) {
            window.location.href = `/portal/my-clearances/${id}`;
        }
    };

    const handleDownloadClearance = (clearance: ClearanceRequest): void => {
        toast.info('Download functionality would be implemented here');
    };

    const handleGenerateReport = (clearance: ClearanceRequest): void => {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            toast.error('Unable to open report. Please check pop-up blocker settings.');
            return;
        }

        const sanitizeHTML = (str: string): string =>
            str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Clearance Request: ${sanitizeHTML(clearance.reference_number ?? 'N/A')}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .detail { margin: 10px 0; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Clearance Request Details</h1>
                <div class="detail"><span class="label">Reference Number:</span> ${sanitizeHTML(clearance.reference_number ?? 'N/A')}</div>
                <div class="detail"><span class="label">Type:</span> ${sanitizeHTML(getClearanceTypeDisplay(clearance.clearance_type))}</div>
                <div class="detail"><span class="label">Purpose:</span> ${sanitizeHTML(clearance.purpose ?? 'N/A')}</div>
                <div class="detail"><span class="label">Fee:</span> ${sanitizeHTML(formatCurrency(clearance.fee_amount))}</div>
                <div class="detail"><span class="label">Status:</span> ${sanitizeHTML(clearance.status ?? 'N/A')}</div>
                <div class="detail"><span class="label">Request Date:</span> ${sanitizeHTML(formatDate(clearance.created_at, false))}</div>
            </body>
            </html>
        `);
        reportWindow.document.close();
    };

    const handleReportIssue = (clearance: ClearanceRequest): void => {
        toast.info('Report issue feature would open a form');
    };

    const handleCopyReference = (ref: string): void => {
        copyToClipboard(ref, `Copied: ${ref}`);
    };

    const handlePrint = (): void => {
        if (filteredClearances.length === 0) {
            toast.error('No clearances to print');
            return;
        }
        printClearancesList(
            filteredClearances,
            statusFilter,
            household,
            stats,
            (date: string) => formatDate(date, false),
            formatCurrency,
            getClearanceTypeDisplay,
        );
    };

    const handleExport = (): void => {
        if (filteredClearances.length === 0) {
            toast.error('No clearances to export');
            return;
        }
        exportClearancesToCSV(
            filteredClearances,
            statusFilter,
            (date: string) => formatDate(date, false),
            formatCurrency,
            getClearanceTypeDisplay,
            setIsExporting,
            toast,
        );
    };

    const handleCopySummary = async (): Promise<void> => {
        const parts: string[] = [];
        parts.push('My Clearance Requests Summary:\n');
        parts.push(`Household: ${household?.household_number || 'N/A'}`);
        parts.push(`Head of Family: ${household?.head_of_family || 'N/A'}`);
        parts.push('');

        for (const [key, count] of Object.entries(tabCounts)) {
            if (key !== 'all') {
                parts.push(`${key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: ${count}`);
            }
        }
        parts.push('');
        parts.push(`Total: ${tabCounts.all}`);
        parts.push(`Total Fees: ${formatCurrency(stats.total_fees)}`);
        parts.push(`Total Paid: ${formatCurrency(stats.total_paid)}`);
        parts.push(`Balance Due: ${formatCurrency(stats.total_balance)}`);
        parts.push('');
        parts.push(`Generated on: ${new Date().toLocaleDateString()}`);
        parts.push(`View online: ${window.location.origin}/portal/my-clearances`);

        const summary = parts.join('\n');
        await copyToClipboard(summary, 'Summary copied to clipboard');
    };

    const handleEmailSummary = (): void => {
        const parts: string[] = [];
        parts.push('Hello,');
        parts.push('');
        parts.push("Here's a summary of my clearance requests:");
        parts.push('');
        parts.push(`Total Requests: ${tabCounts.all}`);

        for (const [key, count] of Object.entries(tabCounts)) {
            if (key !== 'all') {
                parts.push(
                    `- ${key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: ${count}`,
                );
            }
        }
        parts.push('');
        parts.push(`Total Fees: ${formatCurrency(stats.total_fees)}`);
        parts.push(`Total Paid: ${formatCurrency(stats.total_paid)}`);
        parts.push(`Balance Due: ${formatCurrency(stats.total_balance)}`);
        parts.push('');
        parts.push('This summary was generated from the Barangay Management System.');
        parts.push('');
        parts.push('Best regards,');
        parts.push(`${currentResident?.first_name || ''} ${currentResident?.last_name || ''}`);

        const body = parts.join('\n');
        const subject = `My Clearance Requests Summary - ${new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const getResidentName = (residentId?: number): string => {
        if (!residentId) return 'N/A';
        const resident = householdResidents.find((r) => r.id === residentId);
        if (resident) {
            return `${resident.first_name} ${resident.last_name}`;
        }
        return currentResident
            ? `${currentResident.first_name} ${currentResident.last_name}`
            : 'Unknown';
    };

    const getStatusCountForTab = (status: string): number => {
        return tabCounts[status] ?? 0;
    };

    const tabHasData: boolean = paginatedClearances.length > 0;

    const displayStatus: string =
        statusFilter !== 'all'
            ? statusFilter.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : 'All';

    const getEmptyStateIcon = () => {
        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
            all: FileText,
            pending: Clock,
            pending_payment: DollarSign,
            processing: Loader2,
            approved: CheckCircle,
            issued: FileCheck,
            rejected: XCircle,
            cancelled: XCircle,
        };
        return iconMap[statusFilter] || FileText;
    };

    if (props.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Clearances', href: '/portal/my-clearances' },
                ]}
            >
                <Head title="My Clearances" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Error</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{props.error}</p>
                            <Button
                                onClick={() => (window.location.href = '/dashboard')}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/portal/dashboard' },
                { title: 'My Clearances', href: '/portal/my-clearances' },
            ]}
        >
            <Head title="My Clearances" />

            <div className="space-y-4 md:space-y-6 pb-28 md:pb-6">
                <HeaderSection
                    isMobile={isMobile}
                    statsTotal={tabCounts.all}
                    householdNumber={household?.household_number}
                    headOfFamily={household?.head_of_family}
                    showStats={showStats}
                    setShowStats={setShowStats}
                    hasActiveFilters={hasActiveFilters}
                    setShowMobileFilters={setShowMobileFilters}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    isExporting={isExporting}
                />

                {showStats && (
                    <div className="animate-slide-down">
                        <CollapsibleStats
                            showStats={showStats}
                            setShowStats={setShowStats}
                            stats={stats}
                            formatCurrency={formatCurrency}
                        />
                        <DesktopStats stats={stats} formatCurrency={formatCurrency} />
                    </div>
                )}

                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Clearance Requests"
                    description={hasActiveFilters ? 'Filters are currently active' : 'No filters applied'}
                    search={searchQuery}
                    onSearchChange={(value) => setSearchQuery(value)}
                    onSearchSubmit={(e) => {
                        e.preventDefault();
                        handleFilterChange('search', searchQuery);
                        setShowMobileFilters(false);
                    }}
                    onSearchClear={() => handleFilterChange('search', '')}
                    loading={loading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                >
                    <FilterModalContent
                        clearanceTypeFilter={clearanceTypeFilter}
                        onClearanceTypeChange={(type) => handleFilterChange('clearanceType', type)}
                        residentFilter={residentFilter}
                        onResidentChange={(resident) => handleFilterChange('resident', resident)}
                        urgencyFilter={urgencyFilter}
                        onUrgencyChange={(urgency) => handleFilterChange('urgency', urgency)}
                        yearFilter={yearFilter}
                        onYearChange={(year) => handleFilterChange('year', year)}
                        loading={loading}
                        availableClearanceTypes={availableClearanceTypes}
                        householdResidents={householdResidents}
                        availableYears={availableYears}
                        currentResidentId={currentResident?.id}
                    />
                </ModernFilterModal>

                {!isMobile && (
                    <ModernClearanceFilters
                        search={searchQuery}
                        setSearch={(value) => handleFilterChange('search', value)}
                        handleSearchSubmit={(e) => {
                            e.preventDefault();
                        }}
                        handleSearchClear={() => handleFilterChange('search', '')}
                        clearanceTypeFilter={clearanceTypeFilter}
                        handleClearanceTypeChange={(type) => handleFilterChange('clearanceType', type)}
                        residentFilter={residentFilter}
                        handleResidentChange={(resident) => handleFilterChange('resident', resident)}
                        urgencyFilter={urgencyFilter}
                        handleUrgencyChange={(urgency) => handleFilterChange('urgency', urgency)}
                        yearFilter={yearFilter}
                        handleYearChange={(year) => handleFilterChange('year', year)}
                        loading={loading}
                        availableClearanceTypes={availableClearanceTypes}
                        householdResidents={householdResidents}
                        availableYears={availableYears}
                        printClearances={handlePrint}
                        exportToCSV={handleExport}
                        isExporting={isExporting}
                        hasActiveFilters={hasActiveFilters}
                        handleClearFilters={clearFilters}
                        onCopySummary={handleCopySummary}
                        onEmailSummary={handleEmailSummary}
                        currentResident={currentResident}
                        tabCounts={tabCounts}
                        statusFilter={statusFilter}
                    />
                )}

                <div className="mt-4">
                    <ClearanceTabs
                        statusFilter={statusFilter}
                        handleTabChange={handleTabChange}
                        tabCounts={tabCounts}
                        tabsConfig={CLEARANCE_TABS_CONFIG}
                    />

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mt-4">
                        <CardContent className="p-4 md:p-6">
                            {selectMode && tabHasData && (
                                <ModernSelectionBanner
                                    selectedCount={selectedClearances.length}
                                    totalCount={paginatedClearances.length}
                                    onSelectAll={selectAllClearances}
                                    onDeselectAll={() => setSelectedClearances([])}
                                    onCancel={() => {
                                        setSelectMode(false);
                                        setSelectedClearances([]);
                                    }}
                                    onDelete={handleDeleteSelected}
                                    deleteLabel="Delete Selected"
                                />
                            )}

                            <TabHeader
                                displayStatus={displayStatus}
                                count={paginatedClearances.length}
                                selectMode={selectMode}
                                selectedCount={selectedClearances.length}
                                hasFilters={hasActiveFilters}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                onToggleSelectMode={toggleSelectMode}
                                tabHasData={tabHasData}
                            />

                            {!tabHasData ? (
                                <ModernEmptyState
                                    status={statusFilter}
                                    hasFilters={hasActiveFilters}
                                    onClearFilters={clearFilters}
                                    icon={getEmptyStateIcon()}
                                />
                            ) : isMobile ? (
                                viewMode === 'grid' ? (
                                    <div className="pb-4 space-y-3">
                                        {paginatedClearances.map((clearance) => (
                                            <ModernClearanceCard
                                                key={clearance.id}
                                                clearance={clearance}
                                                selectMode={selectMode}
                                                selectedClearances={selectedClearances}
                                                toggleSelectClearance={toggleSelectClearance}
                                                getClearanceTypeDisplay={getClearanceTypeDisplay}
                                                formatDate={(date) => formatDate(date, true)}
                                                formatCurrency={formatCurrency}
                                                currentResident={currentResident}
                                                onCopyReference={handleCopyReference}
                                                onViewDetails={handleViewDetails}
                                                onDownloadClearance={handleDownloadClearance}
                                                onGenerateReport={handleGenerateReport}
                                                onReportIssue={handleReportIssue}
                                                isMobile={true}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <ModernClearanceMobileListView
                                        clearances={paginatedClearances}
                                        selectMode={selectMode}
                                        selectedClearances={selectedClearances}
                                        toggleSelectClearance={toggleSelectClearance}
                                        getClearanceTypeDisplay={getClearanceTypeDisplay}
                                        getResidentName={getResidentName}
                                        formatDate={(date) => formatDate(date, true)}
                                        formatCurrency={formatCurrency}
                                        onCopyReference={handleCopyReference}
                                        onViewDetails={handleViewDetails}
                                        onDownloadClearance={handleDownloadClearance}
                                        onGenerateReport={handleGenerateReport}
                                        onReportIssue={handleReportIssue}
                                    />
                                )
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paginatedClearances.map((clearance) => (
                                        <ModernClearanceGridCard
                                            key={clearance.id}
                                            clearance={clearance}
                                            selectMode={selectMode}
                                            selectedClearances={selectedClearances}
                                            toggleSelectClearance={toggleSelectClearance}
                                            getClearanceTypeDisplay={getClearanceTypeDisplay}
                                            formatDate={(date) => formatDate(date, false)}
                                            formatCurrency={formatCurrency}
                                            currentResident={currentResident}
                                            onCopyReference={handleCopyReference}
                                            onViewDetails={handleViewDetails}
                                            onDownloadClearance={handleDownloadClearance}
                                            onGenerateReport={handleGenerateReport}
                                            onReportIssue={handleReportIssue}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <ModernClearanceTable
                                    clearances={paginatedClearances}
                                    selectMode={selectMode}
                                    selectedClearances={selectedClearances}
                                    toggleSelectClearance={toggleSelectClearance}
                                    selectAllClearances={selectAllClearances}
                                    getClearanceTypeDisplay={getClearanceTypeDisplay}
                                    formatDate={(date) => formatDate(date, false)}
                                    formatCurrency={formatCurrency}
                                    currentResident={currentResident}
                                    onCopyReference={handleCopyReference}
                                    onViewDetails={handleViewDetails}
                                    onDownloadClearance={handleDownloadClearance}
                                    onGenerateReport={handleGenerateReport}
                                    onReportIssue={handleReportIssue}
                                />
                            )}

                            {totalPages > 1 && (
                                <div className="mt-6">
                                    <ModernPagination
                                        currentPage={safeCurrentPage}
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

            {isMobile && !showMobileFilters && (
                <div className="fixed bottom-20 right-6 z-50 animate-scale-in">
                    <Link href="/portal/my-clearances/request">
                        <Button
                            size="lg"
                            className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            )}

            <ModernLoadingOverlay loading={loading} message="Loading clearance requests..." />
        </ResidentLayout>
    );
}