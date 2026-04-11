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
} from 'lucide-react';
import { useState } from 'react';
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
    selectionStats
}: ReceiptsGridViewProps) {
    const [expandedReceipts, setExpandedReceipts] = useState<number[]>([]);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedReceipts(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    const handleCopyToClipboard = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            // Toast would be handled by parent
        }).catch(() => {
            // Toast would be handled by parent
        });
    };

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

    return (
        <GridLayout
            isEmpty={receipts.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {receipts.map((receipt) => {
                // ✅ Cast status to ReceiptStatus
                const statusConfig = getReceiptStatusConfig(castToReceiptStatus(receipt.status), receipt.is_voided);
                const paymentMethodConfig = getPaymentMethodConfig(receipt.payment_method);
                const isSelected = selectedReceipts.includes(receipt.id);
                const isExpanded = expandedReceipts.includes(receipt.id);
                
                return (
                    <Card 
                        key={receipt.id}
                        className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-900 border ${
                            isSelected 
                                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
                        } ${isExpanded ? 'shadow-lg' : ''}`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content') &&
                                !e.target.closest('input[type="checkbox"]')) {
                                onItemSelect(receipt.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        receipt.is_voided ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                                    }`}>
                                        {receipt.is_voided ? (
                                            <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        ) : (
                                            <ReceiptIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {truncateText(receipt.receipt_number, isMobile ? 15 : 25)}
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
                                            onCheckedChange={() => onItemSelect(receipt.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => onView(receipt.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Details</span>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={() => onPrint(receipt)}>
                                                <Printer className="mr-2 h-4 w-4" />
                                                <span>Print Receipt</span>
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => handleCopyToClipboard(receipt.receipt_number, 'Receipt #', e)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                <span>Copy Receipt #</span>
                                            </DropdownMenuItem>
                                            
                                            {receipt.or_number && (
                                                <DropdownMenuItem onClick={(e) => handleCopyToClipboard(receipt.or_number!, 'OR #', e)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    <span>Copy OR #</span>
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {!receipt.is_voided && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => onVoid(receipt.id, receipt.receipt_number)}
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        <span>Void Receipt</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
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

                            {/* Main Content */}
                            <div className="space-y-2">
                                {/* Payer Info */}
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="font-medium text-gray-900 dark:text-white truncate">
                                        {truncateText(receipt.payer_name, isMobile ? 20 : 30)}
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
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {receipt.payment_method_label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 justify-end">
                                        <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {formatDate(receipt.formatted_issued_date)}
                                        </span>
                                    </div>
                                </div>

                                {/* Reference Number */}
                                {receipt.reference_number && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        Ref: {truncateText(receipt.reference_number, 20)}
                                    </div>
                                )}

                                {/* Issued By */}
                                {receipt.issued_by && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Issued by: {receipt.issued_by}
                                    </div>
                                )}

                                {/* Fee Breakdown - Expandable */}
                                {receipt.fee_breakdown && receipt.fee_breakdown.length > 0 && (
                                    <div className="pt-2">
                                        <button
                                            onClick={(e) => toggleExpand(receipt.id, e)}
                                            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {isExpanded ? 'Hide' : 'Show'} Fee Breakdown
                                            {isExpanded ? '↑' : '↓'}
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                                                {receipt.fee_breakdown.map((fee: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {fee.fee_name}
                                                        </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {fee.formatted_amount || `₱${fee.total_amount?.toLocaleString()}`}
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView(receipt.id);
                                    }}
                                    title="View Details"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPrint(receipt);
                                    }}
                                    title="Print Receipt"
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                </Button>

                                {receipt.payer_address && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyToClipboard(receipt.payer_address!, 'Address', e);
                                        }}
                                        title="Copy Address"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}