// resources/js/components/admin/receipts/ReceiptsTableView.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Receipt as ReceiptIcon,
    MoreVertical,
    Eye,
    Printer,
    Copy,
    Ban,
} from 'lucide-react';
import { getReceiptStatusConfig, getPaymentMethodConfig, ReceiptStatus } from '@/components/admin/receipts/receipt';

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
    status: string; // Keep as string for flexibility
    is_voided: boolean;
    printed_count: number;
    fee_breakdown: Array<any>;
    reference_number?: string | null;
    issued_by?: string | null;
    void_reason?: string | null;
}

interface ReceiptsTableViewProps {
    receipts: ReceiptData[];
    isBulkMode: boolean;
    selectedReceipts: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onView: (id: number) => void;
    onPrint: (receipt: ReceiptData) => void;
    onVoid: (id: number, receiptNumber: string) => void;
    onDelete: (receipt: ReceiptData) => void;
    selectionStats: any;
    getSortIcon: (column: string) => string | null;
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

const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Helper to safely cast status to ReceiptStatus
const castToReceiptStatus = (status: string): ReceiptStatus => {
    const validStatuses: ReceiptStatus[] = ['completed', 'pending', 'failed', 'cancelled', 'refunded'];
    return validStatuses.includes(status as ReceiptStatus) ? (status as ReceiptStatus) : 'pending';
};

export default function ReceiptsTableView({
    receipts,
    isBulkMode,
    selectedReceipts,
    isMobile,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onView,
    onPrint,
    onVoid,
    onDelete,
    selectionStats,
    getSortIcon
}: ReceiptsTableViewProps) {
    
    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Toast would be handled by parent
        }).catch(() => {
            // Toast would be handled by parent
        });
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900">
                                {isBulkMode && (
                                    <TableHead className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={selectedReceipts.length === receipts.length && receipts.length > 0}
                                                onCheckedChange={() => {
                                                    if (selectedReceipts.length === receipts.length) {
                                                        receipts.forEach(r => onItemSelect(r.id));
                                                    } else {
                                                        receipts.forEach(r => {
                                                            if (!selectedReceipts.includes(r.id)) {
                                                                onItemSelect(r.id);
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('receipt_number')}
                                >
                                    <div className="flex items-center gap-1">
                                        Receipt #
                                        {getSortIcon('receipt_number')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        {getSortIcon('status')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('payer_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Payer
                                        {getSortIcon('payer_name')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('total_amount')}
                                >
                                    <div className="flex items-center gap-1 justify-end">
                                        Amount
                                        {getSortIcon('total_amount')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('payment_method')}
                                >
                                    <div className="flex items-center gap-1">
                                        Payment Method
                                        {getSortIcon('payment_method')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => onSort('issued_date')}
                                >
                                    <div className="flex items-center gap-1">
                                        Date
                                        {getSortIcon('issued_date')}
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {receipts.map((receipt) => {
                                // ✅ Cast status to ReceiptStatus
                                const statusConfig = getReceiptStatusConfig(castToReceiptStatus(receipt.status), receipt.is_voided);
                                const paymentMethodConfig = getPaymentMethodConfig(receipt.payment_method);
                                const isSelected = selectedReceipts.includes(receipt.id);
                                
                                return (
                                    <TableRow 
                                        key={receipt.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                        }`}
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
                                        {isBulkMode && (
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onItemSelect(receipt.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    receipt.is_voided ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                                                }`}>
                                                    {receipt.is_voided ? (
                                                        <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    ) : (
                                                        <ReceiptIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {receipt.receipt_number}
                                                    </div>
                                                    {receipt.or_number && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            OR: {receipt.or_number}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge className={`text-xs px-2 py-0.5 ${statusConfig.className}`}>
                                                {statusConfig.label}
                                            </Badge>
                                            {receipt.printed_count > 0 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <Printer className="h-3 w-3 inline mr-1" />
                                                    {receipt.printed_count} print(s)
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white truncate" title={receipt.payer_name}>
                                                    {truncateText(receipt.payer_name, isMobile ? 20 : 30)}
                                                </div>
                                                {receipt.payer_address && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                        {truncateText(receipt.payer_address, isMobile ? 25 : 40)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {receipt.formatted_total}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Paid: {receipt.formatted_amount_paid}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {receipt.payment_method_label}
                                                </span>
                                            </div>
                                            {receipt.reference_number && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                    Ref: {truncateText(receipt.reference_number, 15)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(receipt.formatted_issued_date)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
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
                                                    
                                                    <DropdownMenuItem onClick={() => handleCopyToClipboard(receipt.receipt_number, 'Receipt #')}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>Copy Receipt #</span>
                                                    </DropdownMenuItem>
                                                    
                                                    {receipt.or_number && (
                                                        <DropdownMenuItem onClick={() => handleCopyToClipboard(receipt.or_number!, 'OR #')}>
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
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}