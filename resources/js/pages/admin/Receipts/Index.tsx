// resources/js/pages/admin/Receipts/Index.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Receipt, Search, Filter, Download, Printer, Eye, Plus, FileText, X, Calendar, CreditCard, User, MapPin, Tag, Clock, CheckCircle, XCircle, AlertCircle, MoreVertical, Copy, Ban, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useMemo, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintableReceipt from '@/components/admin/receipts/PrintableReceipt';
import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Keep the same interface definitions
interface Receipt {
    id: number;
    receipt_number: string;
    payment_id: number | null;
    clearance_request_id: number | null;
    or_number: string | null;
    receipt_type: string;
    receipt_type_label: string;
    payer_name: string;
    payer_address: string | null;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    amount_paid: number;
    change_due: number;
    formatted_subtotal: string;
    formatted_surcharge: string;
    formatted_penalty: string;
    formatted_discount: string;
    formatted_total: string;
    formatted_amount_paid: string;
    formatted_change: string;
    payment_method: string;
    payment_method_label: string;
    reference_number: string | null;
    payment_date: string;
    formatted_payment_date: string;
    issued_date: string;
    formatted_issued_date: string;
    issued_by: string;
    status: string;
    status_badge: string;
    is_voided: boolean;
    void_reason: string | null;
    printed_count: number;
    last_printed_at: string | null;
    fee_breakdown: Array<{
        fee_name: string;
        fee_code?: string;
        base_amount: number;
        total_amount: number;
    }>;
    notes: string | null;
}

interface Props {
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
        total: {
            count: number;
            amount: number;
            formatted_amount: string;
        };
        today: {
            count: number;
            amount: number;
            formatted_amount: string;
        };
        this_month: {
            count: number;
            amount: number;
            formatted_amount: string;
        };
        voided: number;
        by_method: Array<{
            method: string;
            method_label: string;
            count: number;
            total: number;
            formatted_total: string;
        }>;
        by_type: Array<{
            type: string;
            type_label: string;
            count: number;
        }>;
    };
    pendingClearances?: Array<{
        id: number;
        control_number: string;
        resident_name: string;
        clearance_type: string;
        fee: number;
        formatted_fee: string;
    }>;
    filterOptions: {
        payment_methods: Array<{ value: string; label: string }>;
        receipt_types: Array<{ value: string; label: string }>;
        status_options: Array<{ value: string; label: string }>;
    };
}

// Helper function to get status badge configuration
const getStatusConfig = (status: string, isVoided: boolean) => {
    if (isVoided) {
        return {
            variant: 'destructive' as const,
            className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
            icon: <Ban className="h-3 w-3 mr-1" />,
            label: 'Voided'
        };
    }
    
    switch (status.toLowerCase()) {
        case 'paid':
        case 'completed':
            return {
                variant: 'default' as const,
                className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
                icon: <CheckCircle className="h-3 w-3 mr-1" />,
                label: 'Paid'
            };
        case 'pending':
            return {
                variant: 'secondary' as const,
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
                icon: <Clock className="h-3 w-3 mr-1" />,
                label: 'Pending'
            };
        case 'failed':
            return {
                variant: 'destructive' as const,
                className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
                icon: <XCircle className="h-3 w-3 mr-1" />,
                label: 'Failed'
            };
        default:
            return {
                variant: 'outline' as const,
                className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
                icon: <AlertCircle className="h-3 w-3 mr-1" />,
                label: status
            };
    }
};

// Helper function to get payment method icon
const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
        case 'cash':
            return <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />;
        case 'card':
        case 'credit_card':
            return <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
        case 'bank_transfer':
        case 'bank':
            return <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
        case 'check':
            return <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
        default:
            return <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
};

// Receipt Card Component
function ReceiptCard({ 
    receipt, 
    isSelected,
    isBulkMode,
    onSelect,
    onView,
    onPrint,
    onVoid,
    truncationLength = 25
}: { 
    receipt: Receipt;
    isSelected: boolean;
    isBulkMode: boolean;
    onSelect: (id: number) => void;
    onView: (id: number) => void;
    onPrint: (receipt: Receipt) => void;
    onVoid: (id: number, number: string) => void;
    truncationLength?: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const statusConfig = getStatusConfig(receipt.status, receipt.is_voided);
    
    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <Card 
            className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-950 border ${
                isSelected 
                    ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
            } ${expanded ? 'shadow-lg' : ''}`}
            onClick={(e) => {
                if (isBulkMode && e.target instanceof HTMLElement && 
                    !e.target.closest('a') && 
                    !e.target.closest('button') &&
                    !e.target.closest('.dropdown-menu-content')) {
                    onSelect(receipt.id);
                }
            }}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            receipt.is_voided 
                                ? 'bg-red-100 dark:bg-red-900/30' 
                                : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                            {receipt.is_voided ? (
                                <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
                            ) : (
                                <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {truncateText(receipt.receipt_number, truncationLength)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                OR: {receipt.or_number || '—'} • {receipt.receipt_type_label}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onSelect(receipt.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                            />
                        )}
                        <ActionDropdown>
                            <ActionDropdownItem
                                icon={<Eye className="h-4 w-4" />}
                                onClick={() => onView(receipt.id)}
                            >
                                View Details
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<Printer className="h-4 w-4" />}
                                onClick={() => onPrint(receipt)}
                            >
                                Print Receipt
                            </ActionDropdownItem>
                            
                            <ActionDropdownSeparator />
                            
                            <ActionDropdownItem
                                icon={<Copy className="h-4 w-4" />}
                                onClick={() => navigator.clipboard.writeText(receipt.receipt_number)}
                            >
                                Copy Receipt #
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<Copy className="h-4 w-4" />}
                                onClick={() => navigator.clipboard.writeText(receipt.or_number || '')}
                            >
                                Copy OR #
                            </ActionDropdownItem>
                            
                            {!receipt.is_voided && (
                                <>
                                    <ActionDropdownSeparator />
                                    <ActionDropdownItem
                                        icon={<Ban className="h-4 w-4" />}
                                        onClick={() => onVoid(receipt.id, receipt.receipt_number)}
                                        dangerous
                                    >
                                        Void Receipt
                                    </ActionDropdownItem>
                                </>
                            )}
                        </ActionDropdown>
                    </div>
                </div>

                {/* Status Badge and Basic Info */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <Badge 
                        variant={statusConfig.variant}
                        className={`text-xs px-2 py-0.5 ${statusConfig.className}`}
                    >
                        {statusConfig.icon}
                        {statusConfig.label}
                    </Badge>
                    
                    {receipt.printed_count > 0 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800">
                            <Printer className="h-3 w-3 mr-1" />
                            {receipt.printed_count} print(s)
                        </Badge>
                    )}
                </div>

                {/* Main Content */}
                <div className="space-y-2">
                    {/* Payer Info */}
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                            {receipt.payer_name}
                        </span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                            {receipt.formatted_total}
                        </div>
                    </div>

                    {/* Paid Amount */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                        </div>
                        <div className="font-medium text-green-600 dark:text-green-400">
                            {receipt.formatted_amount_paid}
                        </div>
                    </div>

                    {/* Payment Method & Date */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center gap-1">
                            {getPaymentMethodIcon(receipt.payment_method)}
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                                {receipt.payment_method_label}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                            <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                                {receipt.formatted_issued_date}
                            </span>
                        </div>
                    </div>

                    {/* Reference Number */}
                    {receipt.reference_number && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Ref: {receipt.reference_number}
                        </div>
                    )}

                    {/* Issued By */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Issued by: {receipt.issued_by}
                    </div>

                    {/* Fee Breakdown - Expandable */}
                    {receipt.fee_breakdown && receipt.fee_breakdown.length > 0 && (
                        <div className="pt-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpanded(!expanded);
                                }}
                                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {expanded ? 'Hide' : 'Show'} Fee Breakdown
                                {expanded ? (
                                    <ChevronUp className="h-3 w-3" />
                                ) : (
                                    <ChevronDown className="h-3 w-3" />
                                )}
                            </button>
                            
                            {expanded && (
                                <div className="mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                                    {receipt.fee_breakdown.map((fee, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {fee.fee_name}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                ₱{fee.total_amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Void Reason */}
                    {receipt.is_voided && receipt.void_reason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                            <p className="text-xs text-red-700 dark:text-red-400">
                                <span className="font-medium">Void Reason:</span> {receipt.void_reason}
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView(receipt.id);
                                }}
                            >
                                <Eye className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">View Details</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPrint(receipt);
                                }}
                            >
                                <Printer className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Print Receipt</p>
                        </TooltipContent>
                    </Tooltip>

                    {receipt.payer_address && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(receipt.payer_address || '');
                                    }}
                                >
                                    <MapPin className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Copy Address</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ReceiptsIndex({ 
    receipts, 
    filters: initialFilters, 
    stats, 
    pendingClearances = [],
    filterOptions 
}: Props) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');
    const [methodFilter, setMethodFilter] = useState(initialFilters.payment_method || '');
    const [typeFilter, setTypeFilter] = useState(initialFilters.receipt_type || '');
    const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
    const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
    
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `receipt-${selectedReceipt?.receipt_number || 'document'}`,
        onAfterPrint: () => {
            setSelectedReceipt(null);
        },
    });

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
        setSelectedReceipt(receipt);
        setTimeout(() => {
            handlePrint();
        }, 100);
    }, [handlePrint]);

    // Void receipt
    const voidReceipt = useCallback((id: number, receiptNumber: string) => {
        const reason = prompt(`Enter reason for voiding receipt #${receiptNumber}:`);
        if (reason && reason.trim().length >= 10) {
            router.post(route('receipts.void', id), {
                void_reason: reason
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Optionally show success message
                },
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

    // Handle item select in bulk mode
    const handleItemSelect = useCallback((id: number) => {
        setSelectedReceipts(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    }, []);

    // Handle select all
    const handleSelectAll = useCallback(() => {
        if (selectedReceipts.length === receipts.data.length) {
            setSelectedReceipts([]);
        } else {
            setSelectedReceipts(receipts.data.map(r => r.id));
        }
    }, [receipts.data, selectedReceipts.length]);

    // Handle clear selection
    const handleClearSelection = useCallback(() => {
        setSelectedReceipts([]);
        setIsBulkMode(false);
    }, []);

    // Check if filters are active
    const hasActiveFilters = useMemo(() => 
        !!(search || statusFilter || methodFilter || typeFilter || dateFrom || dateTo),
    [search, statusFilter, methodFilter, typeFilter, dateFrom, dateTo]);

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

    // Empty state component
    const emptyState = useMemo(() => (
        <EmptyState
            title="No receipts found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Generate your first receipt by creating a payment or clearance.'}
            icon={<Receipt className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onCreateNew={() => router.get(route('receipts.create'))}
            createLabel="Generate Receipt"
        />
    ), [hasActiveFilters, clearFilters]);

    return (
        <AppLayout>
            <Head title="Receipts Management" />

            {/* Hidden Print Preview */}
            {selectedReceipt && (
                <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                    <PrintableReceipt 
                        ref={printRef} 
                        receipt={selectedReceipt}
                        copyType="original"
                    />
                </div>
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Receipts Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage and track official receipts
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isBulkMode ? (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedReceipts.length} selected
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearSelection}
                                >
                                    Cancel
                                </Button>
                                {selectedReceipts.length === receipts.data.length && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                    >
                                        Deselect All
                                    </Button>
                                )}
                                {selectedReceipts.length !== receipts.data.length && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                    >
                                        Select All
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsBulkMode(true)}
                                >
                                    Bulk Select
                                </Button>
                                <Link
                                    href={route('receipts.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    Generate Receipt
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Receipts</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total.count}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.total.formatted_amount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.today.count}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.today.formatted_amount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Printer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.this_month.count}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.this_month.formatted_amount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Voided</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.voided}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.total.count > 0 
                                        ? ((stats.voided / stats.total.count) * 100).toFixed(1) 
                                        : 0}% of total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Clearances Alert */}
                {pendingClearances.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-800 dark:text-amber-400">
                                    Pending Receipt Generation
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                                    {pendingClearances.length} approved clearance(s) need receipts
                                </p>
                                <div className="mt-3 space-y-2">
                                    {pendingClearances.map((clearance) => (
                                        <div key={clearance.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {clearance.resident_name}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {clearance.clearance_type} • {clearance.control_number}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {clearance.formatted_fee}
                                                </span>
                                                <button
                                                    onClick={() => generateFromClearance(clearance.id)}
                                                    className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                                                >
                                                    Generate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col gap-4">
                            {/* Basic Search */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="search"
                                        placeholder="Search by receipt #, OR #, payer name..."
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                >
                                    Search
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors inline-flex items-center gap-2"
                                >
                                    <Filter className="h-5 w-5" />
                                    {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                                </button>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Status</option>
                                            {filterOptions.status_options.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            value={methodFilter}
                                            onChange={(e) => setMethodFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Methods</option>
                                            {filterOptions.payment_methods.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Receipt Type
                                        </label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Types</option>
                                            {filterOptions.receipt_types.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Per Page
                                        </label>
                                        <select
                                            value={initialFilters.per_page || 15}
                                            onChange={handlePerPageChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="15">15 per page</option>
                                            <option value="30">30 per page</option>
                                            <option value="50">50 per page</option>
                                            <option value="100">100 per page</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2 lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date Range
                                        </label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                            <div className="flex-1 relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active Filters and Actions */}
                            {hasActiveFilters && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Active filters:
                                        </span>
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                            Clear all
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={applyFilters}
                                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Grid View */}
                <GridLayout
                    isEmpty={receipts.data.length === 0}
                    emptyState={emptyState}
                    gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
                    gap={{ base: '3', sm: '4' }}
                    padding="p-4"
                >
                    {receipts.data.map((receipt) => (
                        <ReceiptCard
                            key={receipt.id}
                            receipt={receipt}
                            isSelected={selectedReceipts.includes(receipt.id)}
                            isBulkMode={isBulkMode}
                            onSelect={handleItemSelect}
                            onView={viewReceipt}
                            onPrint={printReceipt}
                            onVoid={voidReceipt}
                            truncationLength={window.innerWidth < 640 ? 15 : 25}
                        />
                    ))}
                </GridLayout>

                {/* Pagination */}
                {receipts.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {receipts.from} to {receipts.to} of {receipts.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(receipts.current_page - 1)}
                                disabled={receipts.current_page === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: Math.min(5, receipts.last_page) }, (_, i) => {
                                let pageNum;
                                if (receipts.last_page <= 5) {
                                    pageNum = i + 1;
                                } else if (receipts.current_page <= 3) {
                                    pageNum = i + 1;
                                } else if (receipts.current_page >= receipts.last_page - 2) {
                                    pageNum = receipts.last_page - 4 + i;
                                } else {
                                    pageNum = receipts.current_page - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            receipts.current_page === pageNum
                                                ? 'bg-primary-600 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => handlePageChange(receipts.current_page + 1)}
                                disabled={receipts.current_page === receipts.last_page}
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Method Breakdown */}
                {stats.by_method && stats.by_method.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Payment Method Breakdown
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {stats.by_method.map((method) => (
                                <div key={method.method} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {method.method_label}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {method.count} receipt(s)
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {method.formatted_total}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Receipt Type Breakdown */}
                {stats.by_type && stats.by_type.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Receipt Type Breakdown
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {stats.by_type.map((type) => (
                                <div key={type.type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {type.type_label}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {type.count} receipt(s)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href={route('receipts.create')}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Receipt className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Generate Receipt
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Create new official receipt
                            </span>
                        </Link>

                        <Link
                            href={route('admin.payments.index')}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                View Payments
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Go to payments management
                            </span>
                        </Link>

                        <Link
                            href={route('admin.clearances.index')}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/10 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/30 dark:hover:to-violet-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Clearance Requests
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                View pending clearances
                            </span>
                        </Link>

                        <button
                            onClick={() => router.post(route('receipts.export'), {
                                format: 'csv',
                                date_from: dateFrom,
                                date_to: dateTo,
                            })}
                            className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/20 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-full bg-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Download className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-center">
                                Export Reports
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                                Export receipt data
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}