// resources/js/pages/admin/Receipts/Index.tsx
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyRound, Receipt as ReceiptIcon } from 'lucide-react';
import { route } from 'ziggy-js';

// Import components
import ReceiptsHeader from '@/components/admin/receipts/ReceiptsHeader';
import ReceiptsStats from '@/components/admin/receipts/ReceiptsStats';
import ReceiptsFilters from '@/components/admin/receipts/ReceiptsFilters';
import ReceiptsContent from '@/components/admin/receipts/ReceiptsContent';
import ReceiptsDialogs from '@/components/admin/receipts/ReceiptsDialogs';

type SelectionMode = 'page' | 'filtered' | 'all';

interface Receipt {
    id: number;
    receipt_number: string;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    formatted_total: string;
    formatted_amount_paid: string;
    payment_method: string;
    payment_method_label: string;
    formatted_issued_date: string;
    status: string;
    is_voided: boolean;
    printed_count: number;
    fee_breakdown: Array<any>;
    // ... other fields
}

interface ReceiptsPageProps {
    receipts: {
        data: Receipt[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        receipt_type?: string;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
    stats: {
        total: { count: number; amount: number; formatted_amount: string };
        today: { count: number; amount: number; formatted_amount: string };
        this_month: { count: number; amount: number; formatted_amount: string };
        voided: number;
        by_method: Array<{ method: string; method_label: string; count: number; total: number; formatted_total: string }>;
        by_type: Array<{ type: string; type_label: string; count: number }>;
    };
    pendingClearances?: Array<any>;
    filterOptions: {
        payment_methods: Array<{ value: string; label: string }>;
        receipt_types: Array<{ value: string; label: string }>;
        status_options: Array<{ value: string; label: string }>;
    };
}

export default function ReceiptsIndex({ 
    receipts, 
    filters: initialFilters, 
    stats, 
    pendingClearances = [],
    filterOptions 
}: ReceiptsPageProps) {
    const { flash } = usePage().props as any;
    
    // State management
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');
    const [methodFilter, setMethodFilter] = useState(initialFilters.payment_method || '');
    const [typeFilter, setTypeFilter] = useState(initialFilters.receipt_type || '');
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(initialFilters.per_page || 15);
    const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    // Bulk selection states
    const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('page');
    const [showBulkVoidDialog, setShowBulkVoidDialog] = useState(false);
    const [showBulkExportDialog, setShowBulkExportDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

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

    // Auto switch to grid view on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && viewMode === 'table') {
            setViewMode('grid');
        }
    }, []);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Get current page receipts
    const currentPageReceipts = receipts.data;

    // Reset selection when exiting bulk mode
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedReceipts([]);
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
                    if (selectedReceipts.length > 0) {
                        setSelectedReceipts([]);
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
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedReceipts, isMobile]);

    // Selection handlers
    const handleSelectAllOnPage = () => {
        const pageIds = currentPageReceipts.map(r => r.id);
        if (isSelectAll) {
            setSelectedReceipts(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReceipts, ...pageIds])];
            setSelectedReceipts(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    const handleSelectAllFiltered = () => {
        const allIds = receipts.data.map(r => r.id);
        if (selectedReceipts.length === allIds.length && allIds.every(id => selectedReceipts.includes(id))) {
            setSelectedReceipts(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedReceipts, ...allIds])];
            setSelectedReceipts(newSelected);
            setSelectionMode('filtered');
        }
    };

    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${receipts.total} receipts. This action may take a moment.`)) {
            const allIds = receipts.data.map(r => r.id);
            setSelectedReceipts(allIds);
            setSelectionMode('all');
        }
    };

    const handleItemSelect = (id: number) => {
        setSelectedReceipts(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = currentPageReceipts.map(r => r.id);
        const allSelected = allPageIds.length > 0 && allPageIds.every(id => selectedReceipts.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedReceipts, currentPageReceipts]);

    // Get selected receipts data
    const selectedReceiptsData = useMemo(() => {
        return receipts.data.filter(r => selectedReceipts.includes(r.id));
    }, [selectedReceipts, receipts.data]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const totalAmount = selectedReceiptsData.reduce((sum, r) => sum + parseFloat(r.formatted_total.replace(/[^0-9.-]/g, '')), 0);
        const paidAmount = selectedReceiptsData.reduce((sum, r) => sum + parseFloat(r.formatted_amount_paid.replace(/[^0-9.-]/g, '')), 0);
        const voidedCount = selectedReceiptsData.filter(r => r.is_voided).length;
        
        return {
            count: selectedReceiptsData.length,
            totalAmount,
            formattedTotalAmount: `₱${totalAmount.toLocaleString()}`,
            paidAmount,
            formattedPaidAmount: `₱${paidAmount.toLocaleString()}`,
            voidedCount,
            paymentMethods: selectedReceiptsData.reduce((acc, r) => {
                acc[r.payment_method] = (acc[r.payment_method] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }, [selectedReceiptsData]);

    // Apply filters
    const applyFilters = useCallback(() => {
        router.get(route('receipts.index'), {
            search: search || undefined,
            status: statusFilter || undefined,
            payment_method: methodFilter || undefined,
            receipt_type: typeFilter || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [search, statusFilter, methodFilter, typeFilter, dateFrom, dateTo]);

    // Handle search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    // Clear filters
    const clearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('');
        setMethodFilter('');
        setTypeFilter('');
        setDateFrom('');
        setDateTo('');
        
        router.get(route('receipts.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    // View receipt
    const viewReceipt = useCallback((id: number) => {
        router.get(route('receipts.show', id));
    }, []);

    // Print receipt
    const printReceipt = useCallback((receipt: Receipt) => {
        // Handle print logic
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Receipt</title></head><body>');
            printWindow.document.write('<div>' + JSON.stringify(receipt) + '</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }, []);

    // Void receipt
    const voidReceipt = useCallback((id: number, receiptNumber: string) => {
        const reason = prompt(`Enter reason for voiding receipt #${receiptNumber}:`);
        if (reason && reason.trim().length >= 10) {
            router.post(route('receipts.void', id), {
                void_reason: reason
            }, {
                preserveScroll: true,
            });
        } else if (reason) {
            alert('Void reason must be at least 10 characters long.');
        }
    }, []);

    // Generate receipt from clearance
    const generateFromClearance = useCallback((clearanceId: number) => {
        router.post(route('receipts.generate-from-clearance', clearanceId), {
            receipt_type: 'clearance'
        }, {
            preserveScroll: true,
        });
    }, []);

    // Handle clear selection
    const handleClearSelection = useCallback(() => {
        setSelectedReceipts([]);
        setIsBulkMode(false);
    }, []);

    // Handle copy selected data
    const handleCopySelectedData = useCallback(() => {
        if (selectedReceiptsData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedReceiptsData.map(r => ({
            'Receipt #': r.receipt_number,
            'OR #': r.or_number || 'N/A',
            'Payer': r.payer_name,
            'Amount': r.formatted_total,
            'Paid': r.formatted_amount_paid,
            'Method': r.payment_method_label,
            'Date': r.formatted_issued_date,
            'Status': r.is_voided ? 'Voided' : r.status,
        }));
        
        const csvData = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csvData).then(() => {
            toast.success(`${selectedReceiptsData.length} records copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    }, [selectedReceiptsData]);

    // Bulk operations
    const handleBulkOperation = async (operation: string) => {
        if (selectedReceipts.length === 0) {
            toast.error('Please select at least one receipt');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                    setShowBulkExportDialog(true);
                    break;

                case 'void':
                    setShowBulkVoidDialog(true);
                    break;

                case 'copy_data':
                    handleCopySelectedData();
                    break;

                default:
                    toast.info('Functionality to be implemented');
                    break;
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during the bulk operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkVoid = async () => {
        if (!bulkEditValue) {
            toast.error('Please provide a reason for voiding');
            return;
        }
        
        setIsPerformingBulkAction(true);

        try {
            await router.post('/admin/receipts/bulk-action', {
                action: 'void',
                receipt_ids: selectedReceipts,
                void_reason: bulkEditValue
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedReceipts([]);
                    setBulkEditValue('');
                    setShowBulkVoidDialog(false);
                    toast.success(`${selectedReceipts.length} receipts voided successfully`);
                },
                onError: () => {
                    toast.error('Failed to void receipts');
                }
            });
        } catch (error) {
            console.error('Bulk void error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    const handleBulkExport = async () => {
        setIsPerformingBulkAction(true);

        try {
            const response = await fetch('/admin/receipts/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    receipt_ids: selectedReceipts,
                    format: 'csv'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipts-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success(`${selectedReceipts.length} receipts exported successfully`);
                setSelectedReceipts([]);
                setShowBulkExportDialog(false);
            } else {
                toast.error('Failed to export receipts');
            }
        } catch (error) {
            console.error('Bulk export error:', error);
            toast.error('An error occurred during the operation.');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Handle sort
    const handleSort = (column: string) => {
        // Implement sort logic
        console.log('Sort by:', column);
    };

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        router.get(route('receipts.index'), {
            ...initialFilters,
            page
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [initialFilters]);

    // Handle per page change
    const handlePerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('receipts.index'), {
            ...initialFilters,
            per_page: e.target.value,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [initialFilters]);

    const hasActiveFilters = useMemo(() => 
        !!(search || statusFilter || methodFilter || typeFilter || dateFrom || dateTo),
    [search, statusFilter, methodFilter, typeFilter, dateFrom, dateTo]);

    // Get current page stats
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, receipts.total);

    return (
        <AppLayout>
            <TooltipProvider>
                <div className="space-y-6">
                    <ReceiptsHeader 
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isMobile={isMobile}
                    />

                    <ReceiptsStats 
                        globalStats={stats}
                        filteredStats={null}
                        isLoading={isPerformingBulkAction}
                    />

                    <ReceiptsFilters
                        search={search}
                        setSearch={setSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        methodFilter={methodFilter}
                        setMethodFilter={setMethodFilter}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        dateFrom={dateFrom}
                        setDateFrom={setDateFrom}
                        dateTo={dateTo}
                        setDateTo={setDateTo}
                        showAdvancedFilters={showAdvancedFilters}
                        setShowAdvancedFilters={setShowAdvancedFilters}
                        handleClearFilters={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                        isMobile={isMobile}
                        totalItems={receipts.total}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        searchInputRef={searchInputRef}
                        isLoading={isPerformingBulkAction}
                        filterOptions={filterOptions}
                        onApplyFilters={applyFilters}
                    />

                    <ReceiptsContent
                        receipts={currentPageReceipts}
                        isBulkMode={isBulkMode}
                        setIsBulkMode={setIsBulkMode}
                        isSelectAll={isSelectAll}
                        selectedReceipts={selectedReceipts}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        isMobile={isMobile}
                        hasActiveFilters={hasActiveFilters}
                        currentPage={currentPage}
                        totalPages={receipts.last_page}
                        totalItems={receipts.total}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onSelectAllOnPage={handleSelectAllOnPage}
                        onSelectAllFiltered={handleSelectAllFiltered}
                        onSelectAll={handleSelectAll}
                        onItemSelect={handleItemSelect}
                        onClearFilters={clearFilters}
                        onClearSelection={handleClearSelection}
                        onDelete={() => {}} // Not applicable for receipts
                        onSort={handleSort}
                        onBulkOperation={handleBulkOperation}
                        onCopySelectedData={handleCopySelectedData}
                        onView={viewReceipt}
                        onPrint={printReceipt}
                        onVoid={voidReceipt}
                        onGenerateFromClearance={generateFromClearance}
                        setShowBulkVoidDialog={setShowBulkVoidDialog}
                        setShowBulkExportDialog={setShowBulkExportDialog}
                        pendingClearances={pendingClearances}
                        isPerformingBulkAction={isPerformingBulkAction}
                        selectionMode={selectionMode}
                        selectionStats={selectionStats}
                    />

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && !isMobile && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
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
                                    <span>Void selected</span>
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

            <ReceiptsDialogs
                showBulkVoidDialog={showBulkVoidDialog}
                setShowBulkVoidDialog={setShowBulkVoidDialog}
                showBulkExportDialog={showBulkExportDialog}
                setShowBulkExportDialog={setShowBulkExportDialog}
                isPerformingBulkAction={isPerformingBulkAction}
                selectedReceipts={selectedReceipts}
                handleBulkVoid={handleBulkVoid}
                handleBulkExport={handleBulkExport}
                selectionStats={selectionStats}
                bulkEditValue={bulkEditValue}
                setBulkEditValue={setBulkEditValue}
            />
        </AppLayout>
    );
}