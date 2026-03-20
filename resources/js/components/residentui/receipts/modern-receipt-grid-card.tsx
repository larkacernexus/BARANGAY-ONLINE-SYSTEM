// resources/js/components/residentui/receipts/modern-receipt-grid-card.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Download, Copy, MoreVertical, FileText, AlertCircle, Calendar, User, Clock, CreditCard, Printer, Receipt, Hash, Tag, DollarSign } from 'lucide-react';
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
    dot: 'bg-green-500'
  },
  partial: { 
    label: 'Partial', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
    dot: 'bg-yellow-500'
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertCircle,
    dot: 'bg-orange-500'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertCircle,
    dot: 'bg-red-500'
  },
};

// Payment method configuration
const PAYMENT_METHOD_CONFIG = {
  cash: { label: 'Cash', icon: DollarSign, color: 'text-green-500' },
  gcash: { label: 'GCash', icon: CreditCard, color: 'text-blue-500' },
  bank_transfer: { label: 'Bank Transfer', icon: CreditCard, color: 'text-purple-500' },
  cheque: { label: 'Cheque', icon: FileText, color: 'text-gray-500' },
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

interface ModernReceiptGridCardProps {
  receipt: ReceiptItem;
  selectMode?: boolean;
  selectedReceipts?: number[];
  toggleSelectReceipt?: (id: number) => void;
  formatDate: (date: string, short?: boolean) => string;
  formatCurrency: (amount: string | number) => string;
  onView: (id: number) => void;
  onDownload: (id: number) => void;
  onPrint: (id: number) => void;
  onCopyReceiptNumber: (receiptNumber: string) => void;
  onCopyORNNumber: (orNumber: string | null) => void;
}

export const ModernReceiptGridCard = ({
  receipt,
  selectMode,
  selectedReceipts,
  toggleSelectReceipt,
  formatDate,
  formatCurrency,
  onView,
  onDownload,
  onPrint,
  onCopyReceiptNumber,
  onCopyORNNumber,
}: ModernReceiptGridCardProps) => {
  const statusConfig = RECEIPT_STATUS_CONFIG[receipt.status as keyof typeof RECEIPT_STATUS_CONFIG] || RECEIPT_STATUS_CONFIG.pending;
  const paymentMethodIcon = PAYMENT_METHOD_CONFIG[receipt.payment_method as keyof typeof PAYMENT_METHOD_CONFIG]?.icon || CreditCard;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="animate-fade-in-up">
      <Card className={cn(
        "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group",
        selectMode && selectedReceipts?.includes(receipt.id) && "ring-2 ring-blue-500 ring-offset-2",
        receipt.status === 'paid' && "border-l-4 border-l-green-500",
        receipt.status === 'partial' && "border-l-4 border-l-yellow-500",
        receipt.status === 'pending' && "border-l-4 border-l-orange-500",
        receipt.status === 'cancelled' && "border-l-4 border-l-red-500"
      )}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {selectMode && (
                <button
                  onClick={() => toggleSelectReceipt?.(receipt.id)}
                  className={cn(
                    "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    selectedReceipts?.includes(receipt.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                  )}
                >
                  {selectedReceipts?.includes(receipt.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              )}
              
              <div>
                <div className="flex items-center gap-2 mb-1">
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
                <p className="font-medium text-gray-900 dark:text-white">
                  {receipt.receipt_type_label}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

          {/* Status Badge */}
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${statusConfig.color} border-0 px-2 py-1 flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.label}</span>
            </Badge>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(receipt.formatted_total)}
            </span>
          </div>

          {/* Details Grid */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{receipt.payer_name}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {React.createElement(paymentMethodIcon, { className: "h-3 w-3 text-gray-400" })}
              <span className="text-gray-600 dark:text-gray-400">{receipt.payment_method_label || receipt.payment_method}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Payment:</span>
                <span className="text-xs font-medium">{formatDate(receipt.formatted_payment_date, true)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Issued:</span>
                <span className="text-xs font-medium">{formatDate(receipt.formatted_issued_date, true)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-500">Items: {receipt.items_count}</span>
              {receipt.has_discount && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Discount
                </Badge>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Issued by: {receipt.issued_by}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onView(receipt.id)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onDownload(receipt.id)}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onPrint(receipt.id)}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};