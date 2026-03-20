// resources/js/components/residentui/receipts/modern-receipt-table.tsx

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Download, MoreVertical, Copy, FileText, AlertCircle, Printer, Receipt, Hash, CreditCard, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Status configuration
const RECEIPT_STATUS_CONFIG = {
  paid: { 
    label: 'Paid', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: Check,
  },
  partial: { 
    label: 'Partial', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertCircle,
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertCircle,
  },
};

// Payment method icons
const PAYMENT_METHOD_ICONS = {
  cash: DollarSign,
  gcash: CreditCard,
  bank_transfer: CreditCard,
  cheque: FileText,
};

interface ReceiptItem {
  id: number;
  receipt_number: string;
  or_number: string | null;
  receipt_type: string;
  receipt_type_label: string;
  payer_name: string;
  formatted_total: string;
  formatted_amount_paid: string;
  payment_method: string;
  payment_method_label: string;
  formatted_payment_date: string;
  formatted_issued_date: string;
  issued_by: string;
  status: string;
  status_badge: string;
  items_count: number;
  has_discount: boolean;
  reference_number?: string;
}

interface ModernReceiptTableProps {
  receipts: ReceiptItem[];
  selectMode: boolean;
  selectedReceipts: number[];
  toggleSelectReceipt: (id: number) => void;
  selectAllReceipts: () => void;
  formatDate: (date: string, short?: boolean) => string;
  formatCurrency: (amount: string | number) => string;
  onView: (id: number) => void;
  onDownload: (id: number) => void;
  onPrint: (id: number) => void;
  onCopyReceiptNumber: (receiptNumber: string) => void;
  onCopyORNNumber: (orNumber: string | null) => void;
}

export const ModernReceiptTable = ({
  receipts,
  selectMode,
  selectedReceipts,
  toggleSelectReceipt,
  selectAllReceipts,
  formatDate,
  formatCurrency,
  onView,
  onDownload,
  onPrint,
  onCopyReceiptNumber,
  onCopyORNNumber,
}: ModernReceiptTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectMode && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedReceipts.length === receipts.length && receipts.length > 0}
                  onChange={selectAllReceipts}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
            )}
            <TableHead className="font-semibold">Receipt Details</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Payer</TableHead>
            <TableHead className="font-semibold">Payment Date</TableHead>
            <TableHead className="font-semibold">Method</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Amount</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => {
            const statusConfig = RECEIPT_STATUS_CONFIG[receipt.status as keyof typeof RECEIPT_STATUS_CONFIG] || RECEIPT_STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            const PaymentIcon = PAYMENT_METHOD_ICONS[receipt.payment_method as keyof typeof PAYMENT_METHOD_ICONS] || CreditCard;

            return (
              <TableRow key={receipt.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                {selectMode && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedReceipts.includes(receipt.id)}
                      onChange={() => toggleSelectReceipt(receipt.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCopyReceiptNumber(receipt.receipt_number)}
                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Receipt className="h-3 w-3" />
                        #{receipt.receipt_number}
                      </button>
                      {receipt.or_number && (
                        <Badge variant="outline" className="text-xs">
                          <Hash className="h-3 w-3 mr-1" />
                          OR: {receipt.or_number}
                        </Badge>
                      )}
                    </div>
                    {receipt.has_discount && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        With Discount
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {receipt.receipt_type_label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {receipt.items_count} item(s)
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {receipt.payer_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Issued: {formatDate(receipt.formatted_issued_date, true)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(receipt.formatted_payment_date, true)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <PaymentIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{receipt.payment_method_label || receipt.payment_method}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusConfig.color} border-0 px-2 py-1 flex items-center gap-1 w-fit`}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusConfig.label}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-bold">{formatCurrency(receipt.formatted_total)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onView(receipt.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onDownload(receipt.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onPrint(receipt.id)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onCopyReceiptNumber(receipt.receipt_number)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Receipt No.
                        </DropdownMenuItem>
                        {receipt.or_number && (
                          <DropdownMenuItem onClick={() => onCopyORNNumber(receipt.or_number)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy OR No.
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onPrint(receipt.id)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};