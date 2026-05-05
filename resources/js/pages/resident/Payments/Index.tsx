import { useState, useEffect, useMemo } from 'react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, usePage, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { Calendar, AlertCircle, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PaymentTabs, PAYMENT_TABS_CONFIG } from '@/components/portal/payments/index/payment-tabs';
import { ModernSelect } from '@/components/residentui/modern-select';
import { ModernFilterModal } from '@/components/residentui/modern-filter-modal';
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ModernPagination } from '@/components/residentui/modern-pagination';
import { ModernLoadingOverlay } from '@/components/residentui/modern-loading-overlay';
import { ModernSelectionBanner } from '@/components/residentui/modern-selection-banner';
import { ModernCardHeader } from '@/components/residentui/modern/card-header';
import { ViewToggle } from '@/components/residentui/modern/view-toggle';
import { SortDropdown } from '@/components/residentui/modern/sort-dropdown';
import { ActionButtons } from '@/components/residentui/modern/action-buttons';
import { MobileHeader } from '@/components/residentui/modern/mobile-header';
import { DesktopHeader } from '@/components/residentui/modern/desktop-header';
import { ErrorState } from '@/components/residentui/modern/error-state';
import { ModernPaymentListView } from '@/components/portal/payments/index/modern-payment-list-view';
import { ModernPaymentGridView } from '@/components/portal/payments/index/modern-payment-grid-view';
import { ModernPaymentMobileListView } from '@/components/portal/payments/index/modern-payment-mobile-list-view';
import { ModernPaymentFilters } from '@/components/residentui/payments/modern-payment-filters';
import { SelectModeButton } from '@/components/residentui/modern/select-mode-button';
import type { Payment, PaymentStats, PaymentMethodType, ViewMode } from '@/types/portal/payments/payment.types';
import { formatDate, formatCurrency, printPaymentsList, exportToCSV } from '@/components/residentui/payments/payment-utils';
import { getPaymentStatsCards } from '@/components/residentui/payments/constants';

type StatusFilterValue = string;
type SortByValue = 'date' | 'amount' | 'status';
type SortOrderValue = 'asc' | 'desc';

interface PageProps {
    payments?: {
        data: Payment[];
    };
    stats?: PaymentStats;
    availableYears?: number[];
    availablePaymentMethods?: PaymentMethodType[];
    currentResident?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    hasProfile?: boolean;
    error?: string;
    [key: string]: unknown;
}

export default function MyPayments() {
    const { props } = usePage<PageProps>();

    const allPayments: Payment[] = props.payments?.data ?? [];

    const stats: PaymentStats = props.stats ?? {
        total_payments: 0,
        pending_payments: 0,
        total_paid: 0,
        balance_due: 0,
        completed_payments: 0,
        overdue_payments: 0,
        cancelled_payments: 0,
        current_year_total: 0,
        current_year_paid: 0,
        current_year_balance: 0,
    };

    const availableYears: number[] = props.availableYears ?? [];
    const availablePaymentMethods: PaymentMethodType[] = props.availablePaymentMethods ?? [];
    const currentResident = props.currentResident ?? { id: 0, first_name: '', last_name: '' };
    const hasProfile: boolean = props.hasProfile ?? false;

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [loading] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showStats, setShowStats] = useState<boolean>(true);
    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortByValue>('date');
    const [sortOrder, setSortOrder] = useState<SortOrderValue>('desc');

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

    const filteredPayments: Payment[] = useMemo((): Payment[] => {
        if (!allPayments || !Array.isArray(allPayments)) {
            return [];
        }

        let filtered = [...allPayments];

        if (statusFilter !== 'all') {
            filtered = filtered.filter((payment) => payment?.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (payment) =>
                    payment?.or_number?.toLowerCase().includes(query) ||
                    payment?.purpose?.toLowerCase().includes(query) ||
                    payment?.reference_number?.toLowerCase().includes(query) ||
                    payment?.total_amount?.toString().includes(query),
            );
        }

        if (paymentMethodFilter !== 'all') {
            filtered = filtered.filter((payment) => payment?.payment_method === paymentMethodFilter);
        }

        if (yearFilter !== 'all') {
            filtered = filtered.filter((payment) => {
                if (!payment?.payment_date) return false;
                try {
                    const paymentYear = new Date(payment.payment_date).getFullYear().toString();
                    return paymentYear === yearFilter;
                } catch {
                    return false;
                }
            });
        }

        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'date': {
                    const dateA = a?.payment_date ? new Date(a.payment_date).getTime() : 0;
                    const dateB = b?.payment_date ? new Date(b.payment_date).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
                }
                case 'amount': {
                    comparison = (a?.total_amount ?? 0) - (b?.total_amount ?? 0);
                    break;
                }
                case 'status': {
                    comparison = (a?.status ?? '').localeCompare(b?.status ?? '');
                    break;
                }
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [allPayments, statusFilter, searchQuery, paymentMethodFilter, yearFilter, sortBy, sortOrder]);

    const tabCounts: Record<string, number> = useMemo((): Record<string, number> => {
        const counts: Record<string, number> = {};

        for (const tab of PAYMENT_TABS_CONFIG) {
            counts[tab.id] = 0;
        }

        counts.all = allPayments.length;

        for (const payment of allPayments) {
            const status = payment?.status;
            if (status && status in counts) {
                counts[status]++;
            }
        }

        return counts;
    }, [allPayments]);

    const itemsPerPage = 15;
    const totalPages: number = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
    const safeCurrentPage: number = Math.min(currentPage, totalPages);

    const paginatedPayments: Payment[] = useMemo((): Payment[] => {
        if (!filteredPayments || filteredPayments.length === 0) {
            return [];
        }
        const start = (safeCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredPayments.slice(start, end);
    }, [filteredPayments, safeCurrentPage, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handleFilterChange = (filterType: string, value: string): void => {
        setCurrentPage(1);

        switch (filterType) {
            case 'status':
                setStatusFilter(value);
                break;
            case 'search':
                setSearchQuery(value);
                break;
            case 'paymentMethod':
                setPaymentMethodFilter(value);
                break;
            case 'year':
                setYearFilter(value);
                break;
        }

        setSelectedPayments([]);
        setSelectMode(false);
    };

    const hasActiveFilters: boolean =
        statusFilter !== 'all' ||
        searchQuery !== '' ||
        paymentMethodFilter !== 'all' ||
        yearFilter !== 'all';

    const clearFilters = (): void => {
        setStatusFilter('all');
        setSearchQuery('');
        setPaymentMethodFilter('all');
        setYearFilter('all');
        setCurrentPage(1);
        setShowMobileFilters(false);
        setSelectedPayments([]);
        setSelectMode(false);
    };

    const handleTabChange = (tab: string): void => {
        handleFilterChange('status', tab);
        if (isMobile) {
            setShowMobileFilters(false);
        }
    };

    const toggleSelectPayment = (id: number): void => {
        setSelectedPayments((prev) =>
            prev.includes(id) ? prev.filter((paymentId) => paymentId !== id) : [...prev, id],
        );
    };

    const selectAllPayments = (): void => {
        if (paginatedPayments.length === 0) return;

        if (selectedPayments.length === paginatedPayments.length) {
            setSelectedPayments([]);
        } else {
            setSelectedPayments(
                paginatedPayments.map((p) => p?.id).filter((id): id is number => id !== undefined && id !== null),
            );
        }
    };

    const toggleSelectMode = (): void => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedPayments([]);
        } else {
            setSelectMode(true);
        }
    };

    const getStatusCountForTab = (status: string): number => {
        return tabCounts[status] ?? 0;
    };

    const handlePrintPayments = (): void => {
        if (filteredPayments.length === 0) {
            toast.error('No payments to print');
            return;
        }
        printPaymentsList(filteredPayments, statusFilter, stats, formatDate, formatCurrency);
    };

    const handleExportCSV = (): void => {
        if (filteredPayments.length === 0) {
            toast.error('No payments to export');
            return;
        }
        exportToCSV(filteredPayments, statusFilter, formatDate, setIsExporting, toast);
    };

    const handleCopyOrNumber = (orNumber: string): void => {
        if (!orNumber) return;
        navigator.clipboard.writeText(orNumber).then(
            () => toast.success(`Copied: ${orNumber}`),
            () => toast.error('Failed to copy'),
        );
    };

    const handleCopyReference = (ref: string): void => {
        if (!ref) return;
        navigator.clipboard.writeText(ref).then(
            () => toast.success(`Copied: ${ref}`),
            () => toast.error('Failed to copy'),
        );
    };

    const handleViewDetails = (id: number): void => {
        if (id) {
            window.location.href = `/portal/payments/${id}`;
        }
    };

    const handleDownloadReceipt = (payment: Payment): void => {
        if (!payment) return;
        toast.info(`Receipt download for ${payment.or_number} would be implemented here`);
    };

    const handleGenerateReceipt = (payment: Payment): void => {
        if (!payment) return;

        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            toast.error('Unable to open receipt. Please check pop-up blocker settings.');
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
                <title>Payment Receipt - ${sanitizeHTML(payment.or_number ?? 'N/A')}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .amount { font-size: 24px; font-weight: bold; color: #059669; }
                    .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
                    .status-paid { background: #d1fae5; color: #065f46; }
                    .status-pending { background: #fef3c7; color: #92400e; }
                    .status-overdue { background: #fee2e2; color: #991b1b; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h1>Barangay Payment Receipt</h1>
                        <p>Official Receipt #: ${sanitizeHTML(payment.or_number ?? 'N/A')}</p>
                    </div>
                    <div>
                        <p><strong>Purpose:</strong> ${sanitizeHTML(payment.purpose ?? 'N/A')}</p>
                        <p><strong>Amount:</strong> <span class="amount">${sanitizeHTML(formatCurrency(payment.total_amount))}</span></p>
                        <p><strong>Status:</strong> <span class="status status-${sanitizeHTML(payment.status ?? '')}">${sanitizeHTML((payment.status ?? 'PENDING').toUpperCase())}</span></p>
                        <p><strong>Payment Date:</strong> ${sanitizeHTML(formatDate(payment.payment_date ?? ''))}</p>
                        ${payment.reference_number ? `<p><strong>Reference #:</strong> ${sanitizeHTML(payment.reference_number)}</p>` : ''}
                    </div>
                    <hr />
                    <p style="text-align: center; font-size: 12px; color: #666;">
                        Generated from Barangay Management System
                    </p>
                </div>
            </body>
            </html>
        `);
        reportWindow.document.close();
        reportWindow.print();
    };

    const handleDeleteSelected = (): void => {
        if (selectedPayments.length === 0) return;

        if (
            confirm(
                `Are you sure you want to delete ${selectedPayments.length} selected payment${selectedPayments.length > 1 ? 's' : ''}?`,
            )
        ) {
            toast.success(`Deleted ${selectedPayments.length} payment${selectedPayments.length > 1 ? 's' : ''}`);
            setSelectedPayments([]);
            setSelectMode(false);
        }
    };

    const tabHasData: boolean = paginatedPayments && paginatedPayments.length > 0;

    const displayStatus: string =
        statusFilter !== 'all'
            ? statusFilter
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
            : 'All';

    const getEmptyStateIcon = () => {
        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
            all: FileText,
            pending: Clock,
            paid: CheckCircle,
            completed: CheckCircle,
            overdue: AlertCircle,
            cancelled: XCircle,
        };
        return iconMap[statusFilter] || FileText;
    };

    if (!hasProfile) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' },
                ]}
            >
                <Head title="My Payments" />
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                Complete Your Profile
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You need to complete your resident profile before you can view payments.
                            </p>
                            <Link href="/resident/profile/create">
                                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                    Complete Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </ResidentLayout>
        );
    }

    if (props.error) {
        return (
            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' },
                ]}
            >
                <Head title="My Payments" />
                <div className="space-y-6">
                    <DesktopHeader
                        title="My Payments"
                        description="View and manage your barangay payments"
                    />
                    <ErrorState
                        message={props.error}
                        onGoHome={() => (window.location.href = '/dashboard')}
                    />
                </div>
            </ResidentLayout>
        );
    }

    return (
        <>
            <Head title="My Payments" />

            <ResidentLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/portal/dashboard' },
                    { title: 'My Payments', href: '/portal/payments' },
                ]}
            >
                <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
                    {isMobile ? (
                        <MobileHeader
                            title="My Payments"
                            subtitle={`${tabCounts.all} payment${tabCounts.all !== 1 ? 's' : ''} total`}
                            showStats={showStats}
                            onToggleStats={() => setShowStats(!showStats)}
                            onOpenFilters={() => setShowMobileFilters(true)}
                            hasActiveFilters={hasActiveFilters}
                        />
                    ) : (
                        <DesktopHeader
                            title="My Payments"
                            description="View and manage your barangay payments"
                            actions={
                                <ActionButtons
                                    onPrint={handlePrintPayments}
                                    onExport={handleExportCSV}
                                    isExporting={isExporting}
                                />
                            }
                        />
                    )}

                    {showStats && stats && (
                        <div className="animate-slide-down">
                            <ModernStatsCards
                                cards={getPaymentStatsCards(stats, formatCurrency)}
                                loading={loading}
                            />
                        </div>
                    )}

                    {!isMobile && (
                        <ModernPaymentFilters
                            search={searchQuery}
                            setSearch={(value) => handleFilterChange('search', value)}
                            handleSearchSubmit={(e) => {
                                e.preventDefault();
                            }}
                            handleSearchClear={() => handleFilterChange('search', '')}
                            paymentMethodFilter={paymentMethodFilter}
                            handlePaymentMethodChange={(method) =>
                                handleFilterChange('paymentMethod', method)
                            }
                            yearFilter={yearFilter}
                            handleYearChange={(year) => handleFilterChange('year', year)}
                            loading={loading}
                            availablePaymentMethods={availablePaymentMethods}
                            availableYears={availableYears}
                            printPayments={handlePrintPayments}
                            exportToCSV={handleExportCSV}
                            isExporting={isExporting}
                            hasActiveFilters={hasActiveFilters}
                            handleClearFilters={clearFilters}
                            tabCounts={tabCounts}
                            statusFilter={statusFilter}
                            onCopySummary={async () => {
                                const parts: string[] = ['Payments Summary:\n'];
                                for (const [key, count] of Object.entries(tabCounts)) {
                                    if (key !== 'all') {
                                        parts.push(
                                            `${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}: ${count}`,
                                        );
                                    }
                                }
                                parts.push('');
                                parts.push(`Total: ${tabCounts.all}`);
                                parts.push(`Paid Amount: ${formatCurrency(stats.total_paid)}`);
                                parts.push(`Balance Due: ${formatCurrency(stats.balance_due)}`);
                                parts.push(`Generated on: ${new Date().toLocaleDateString()}`);

                                const summary = parts.join('\n');
                                navigator.clipboard.writeText(summary).then(
                                    () => toast.success('Summary copied'),
                                    () => toast.error('Failed to copy summary'),
                                );
                            }}
                        />
                    )}

                    <div className="mt-4">
                        <PaymentTabs
                            statusFilter={statusFilter}
                            handleTabChange={handleTabChange}
                            getStatusCount={getStatusCountForTab}
                            tabsConfig={PAYMENT_TABS_CONFIG}
                        />

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mt-4">
                            <CardContent className="p-4 md:p-6">
                                {selectMode && tabHasData && (
                                    <ModernSelectionBanner
                                        selectedCount={selectedPayments.length}
                                        totalCount={paginatedPayments.length}
                                        onSelectAll={selectAllPayments}
                                        onDeselectAll={() => setSelectedPayments([])}
                                        onCancel={toggleSelectMode}
                                        onDelete={handleDeleteSelected}
                                        deleteLabel="Delete Selected"
                                    />
                                )}

                                <ModernCardHeader
                                    title={`${displayStatus} Payments`}
                                    description={
                                        tabHasData
                                            ? `Showing ${paginatedPayments.length} of ${filteredPayments.length} payment${filteredPayments.length !== 1 ? 's' : ''}`
                                            : `No ${statusFilter === 'all' ? 'payments' : statusFilter.replace('_', ' ')} found`
                                    }
                                    action={
                                        <div className="flex items-center gap-2">
                                            <SortDropdown
                                                sortBy={sortBy}
                                                sortOrder={sortOrder}
                                                onSort={(by, order) => {
                                                    setSortBy(by as SortByValue);
                                                    setSortOrder(order as SortOrderValue);
                                                    setCurrentPage(1);
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
                                        icon={getEmptyStateIcon()}
                                    />
                                ) : isMobile ? (
                                    viewMode === 'grid' ? (
                                        <ModernPaymentGridView
                                            payments={paginatedPayments}
                                            selectMode={selectMode}
                                            selectedPayments={selectedPayments}
                                            onSelectPayment={toggleSelectPayment}
                                            formatDate={(date: string) => formatDate(date, true)}
                                            formatCurrency={formatCurrency}
                                            onViewDetails={handleViewDetails}
                                            onDownloadReceipt={handleDownloadReceipt}
                                            onCopyOrNumber={handleCopyOrNumber}
                                            onCopyReference={handleCopyReference}
                                            onGenerateReceipt={handleGenerateReceipt}
                                            isMobile={true}
                                        />
                                    ) : (
                                        <ModernPaymentMobileListView
                                            payments={paginatedPayments}
                                            selectMode={selectMode}
                                            selectedPayments={selectedPayments}
                                            onSelectPayment={toggleSelectPayment}
                                            formatDate={(date: string) => formatDate(date, true)}
                                            formatCurrency={formatCurrency}
                                            onViewDetails={handleViewDetails}
                                            onDownloadReceipt={handleDownloadReceipt}
                                            onCopyOrNumber={handleCopyOrNumber}
                                            onCopyReference={handleCopyReference}
                                            onGenerateReceipt={handleGenerateReceipt}
                                        />
                                    )
                                ) : viewMode === 'grid' ? (
                                    <ModernPaymentGridView
                                        payments={paginatedPayments}
                                        selectMode={selectMode}
                                        selectedPayments={selectedPayments}
                                        onSelectPayment={toggleSelectPayment}
                                        formatDate={(date: string) => formatDate(date, false)}
                                        formatCurrency={formatCurrency}
                                        onViewDetails={handleViewDetails}
                                        onDownloadReceipt={handleDownloadReceipt}
                                        onCopyOrNumber={handleCopyOrNumber}
                                        onCopyReference={handleCopyReference}
                                        onGenerateReceipt={handleGenerateReceipt}
                                        isMobile={false}
                                    />
                                ) : (
                                    <ModernPaymentListView
                                        payments={paginatedPayments}
                                        selectMode={selectMode}
                                        selectedPayments={selectedPayments}
                                        onSelectPayment={toggleSelectPayment}
                                        onSelectAll={selectAllPayments}
                                        formatDate={(date: string) => formatDate(date, false)}
                                        formatCurrency={formatCurrency}
                                        onViewDetails={handleViewDetails}
                                        onDownloadReceipt={handleDownloadReceipt}
                                        onCopyOrNumber={handleCopyOrNumber}
                                        onCopyReference={handleCopyReference}
                                        onGenerateReceipt={handleGenerateReceipt}
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

                <ModernFilterModal
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    title="Filter Payments"
                    description={
                        hasActiveFilters ? 'Filters are currently active' : 'No filters applied'
                    }
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
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Payment Method
                            </label>
                            <ModernSelect
                                value={paymentMethodFilter}
                                onValueChange={(value) => handleFilterChange('paymentMethod', value)}
                                placeholder="All payment methods"
                                options={[
                                    { value: 'all', label: 'All payment methods' },
                                    ...availablePaymentMethods.map((method) => ({
                                        value: method.type,
                                        label: method.display_name,
                                    })),
                                ]}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Year
                            </label>
                            <ModernSelect
                                value={yearFilter}
                                onValueChange={(value) => handleFilterChange('year', value)}
                                placeholder="All years"
                                options={[
                                    { value: 'all', label: 'All years' },
                                    ...availableYears.map((year) => ({
                                        value: year.toString(),
                                        label: year.toString(),
                                    })),
                                ]}
                                disabled={loading}
                                icon={Calendar}
                            />
                        </div>
                    </div>
                </ModernFilterModal>

                <ModernLoadingOverlay loading={loading} message="Loading payments..." />
            </ResidentLayout>
        </>
    );
}