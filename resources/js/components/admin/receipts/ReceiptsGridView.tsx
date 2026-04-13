// resources/js/components/admin/receipts/ReceiptsGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import {
    Receipt as ReceiptIcon,
    Eye,
    Printer,
    Copy,
    Ban,
    CreditCard,
    User,
    Calendar,
    MoreVertical,
    Tag,
    ChevronDown,
    ChevronUp,
    Square,
    CheckSquare,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
    getReceiptStatusConfig, 
    getPaymentMethodConfig,
    ReceiptStatus 
} from '@/components/admin/receipts/receipt';

// Define ReceiptData interface that matches actual data
interface ReceiptData {
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
    reference_number?: string | null;
    issued_by?: string | null;
    void_reason?: string | null;
}

interface ReceiptsGridViewProps {
    receipts: ReceiptData[];
    isBulkMode: boolean;
    selectedReceipts: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onView: (id: number) => void;
    onPrint: (receipt: ReceiptData) => void;
    onVoid: (id: number, receiptNumber: string) => void;
    onDelete: (receipt: ReceiptData) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats: any;
    windowWidth?: number;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

const truncateText = (text: string, maxLength: number = 25): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper to safely cast status to ReceiptStatus
const castToReceiptStatus = (status: string): ReceiptStatus => {
    const validStatuses: ReceiptStatus[] = ['completed', 'pending', 'failed', 'cancelled', 'refunded'];
    return validStatuses.includes(status as ReceiptStatus) ? (status as ReceiptStatus) : 'pending';
};

export default function ReceiptsGridView({
    receipts,
    isBulkMode,
    selectedReceipts,
    isMobile,
    onItemSelect,
    onView,
    onPrint,
    onVoid,
    onDelete,
    hasActiveFilters,
    onClearFilters,
    selectionStats,
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: ReceiptsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    const isCompactView = isMobile;
    
    // Determine grid columns - 3 for laptops, 4 for wide screens
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;      // Mobile: 1 column
        if (windowWidth < 1024) return 2;     // Tablet: 2 columns
        if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
        return 4;                              // Wide desktop: 4 columns
    }, [windowWidth, devicePixelRatio]);

    // Toggle card expansion
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Handle card click
    const handleCardClick = (receiptId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        handleToggleExpand(receiptId, e);
    };

    const handleCopyToClipboard = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).catch(() => {
            console.error(`Failed to copy ${label}`);
        });
    };
    
    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedReceipts), [selectedReceipts]);

    const emptyState = (
        <EmptyState
            title="No receipts found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Generate your first receipt by creating a payment or clearance.'}
            icon={<ReceiptIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/receipts/create'}
            createLabel="Generate Receipt"
        />
    );

    // Early return for empty state
    if (receipts.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {receipts.map((receipt) => {
                const statusConfig = getReceiptStatusConfig(castToReceiptStatus(receipt.status), receipt.is_voided);
                const paymentMethodConfig = getPaymentMethodConfig(receipt.payment_method);
                const isSelected = selectedSet.has(receipt.id);
                const isExpanded = expandedId === receipt.id;
                
                // Truncation lengths based on view
                const nameLength = isCompactView ? 20 : 30;
                const receiptNumberLength = isCompactView ? 15 : 25;
                
                return (
                    <Card 
                        key={receipt.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(receipt.id, e)}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        receipt.is_voided 
                                            ? 'bg-red-100 dark:bg-red-900/30' 
                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                    }`}>
                                        {receipt.is_voided ? (
                                            <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        ) : (
                                            <ReceiptIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {truncateText(receipt.receipt_number, receiptNumberLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            OR: {receipt.or_number || '—'} • {receipt.receipt_type_label}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(receipt.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onView(receipt.id);
                                            }}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onPrint(receipt);
                                            }}>
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Receipt
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => handleCopyToClipboard(receipt.receipt_number, 'Receipt #', e)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Receipt #
                                            </DropdownMenuItem>
                                            
                                            {receipt.or_number && (
                                                <DropdownMenuItem onClick={(e) => handleCopyToClipboard(receipt.or_number!, 'OR #', e)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy OR #
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {receipt.payer_address && (
                                                <DropdownMenuItem onClick={(e) => handleCopyToClipboard(receipt.payer_address!, 'Address', e)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Address
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(receipt.id);
                                                    }}>
                                                        {isSelected ? (
                                                            <>
                                                                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                                <span className="text-green-600">Deselect</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square className="h-4 w-4 mr-2" />
                                                                Select for Bulk
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            {!receipt.is_voided && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onVoid(receipt.id, receipt.receipt_number);
                                                        }}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Ban className="h-4 w-4 mr-2" />
                                                        Void Receipt
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge className={`text-xs px-2 py-0.5 ${statusConfig.className}`}>
                                    {statusConfig.label}
                                </Badge>
                                
                                {receipt.printed_count > 0 && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800">
                                        <Printer className="h-3 w-3 mr-1" />
                                        {receipt.printed_count} print(s)
                                    </Badge>
                                )}
                            </div>

                            {/* Payer Info */}
                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <User className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate" title={receipt.payer_name}>
                                    {truncateText(receipt.payer_name, nameLength)}
                                </span>
                            </div>

                            {/* Amount Summary */}
                            <div className="space-y-1.5 mb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {receipt.formatted_total}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Paid:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        {receipt.formatted_amount_paid}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method & Date */}
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <span>{receipt.payment_method_label}</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(receipt.formatted_issued_date)}</span>
                                </div>
                            </div>

                            {/* Reference Number */}
                            {receipt.reference_number && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Ref: {truncateText(receipt.reference_number, 20)}
                                </div>
                            )}

                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(receipt.id, e)}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                    {/* Issued By */}
                                    {receipt.issued_by && (
                                        <div className="text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Issued by:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{receipt.issued_by}</span>
                                        </div>
                                    )}

                                    {/* Fee Breakdown */}
                                    {receipt.fee_breakdown && receipt.fee_breakdown.length > 0 && (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Fee Breakdown:</p>
                                            <div className="space-y-1 pl-2">
                                                {receipt.fee_breakdown.map((fee: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {fee.fee_name}
                                                        </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {fee.formatted_amount || `₱${fee.total_amount?.toLocaleString()}`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Void Reason */}
                                    {receipt.is_voided && receipt.void_reason && (
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                                            <p className="text-sm text-red-700 dark:text-red-400">
                                                <span className="font-medium">Void Reason:</span> {receipt.void_reason}
                                            </p>
                                        </div>
                                    )}

                                    {/* View full details link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onView(receipt.id);
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(receipt.id, e)}
                                        >
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}