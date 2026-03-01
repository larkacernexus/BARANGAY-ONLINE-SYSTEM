import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronDown, Eye, CreditCard, Copy, MoreVertical, FileText, Printer, Download } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from '@/components/residentui/payments/constants';

interface ModernPaymentCardProps {
  payment: any;
  selectMode?: boolean;
  selectedPayments?: number[];
  toggleSelectPayment?: (id: number) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  onViewDetails?: (id: number) => void;
  onMakePayment?: (id: number) => void;
  onDownloadReceipt?: (payment: any) => void;
  onCopyOrNumber?: (orNumber: string) => void;
  onCopyReference?: (ref: string) => void;
  onGenerateReceipt?: (payment: any) => void;
  isMobile?: boolean;
}

export const ModernPaymentCard = ({
  payment,
  selectMode,
  selectedPayments,
  toggleSelectPayment,
  formatDate,
  formatCurrency,
  onViewDetails,
  onMakePayment,
  onDownloadReceipt,
  onCopyOrNumber,
  onCopyReference,
  onGenerateReceipt,
  isMobile = true,
}: ModernPaymentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status as keyof typeof PAYMENT_STATUS_CONFIG];
  const methodConfig = PAYMENT_METHOD_CONFIG[payment.payment_method as keyof typeof PAYMENT_METHOD_CONFIG];
  const StatusIcon = statusConfig?.icon || null;
  const MethodIcon = methodConfig?.icon || null;

  const getStatusBadge = () => {
    if (payment.status === 'completed' || payment.status === 'paid') {
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">Paid</Badge>;
    }
    if (payment.status === 'pending') {
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30">Pending</Badge>;
    }
    if (payment.status === 'overdue') {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">Overdue</Badge>;
    }
    if (payment.status === 'cancelled') {
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/30">Cancelled</Badge>;
    }
    return <Badge variant="outline">{payment.status}</Badge>;
  };

  return (
    <div className="mb-3 last:mb-0 animate-fade-in">
      <Card className={cn(
        "border-0 shadow-lg overflow-hidden transition-all duration-300",
        selectMode && selectedPayments?.includes(payment.id) && "ring-2 ring-blue-500 ring-offset-2",
        payment.status === 'overdue' && "border-l-4 border-l-red-500"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              {selectMode && (
                <button
                  onClick={() => toggleSelectPayment?.(payment.id)}
                  className={cn(
                    "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    selectedPayments?.includes(payment.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {selectedPayments?.includes(payment.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => onCopyOrNumber?.(payment.or_number)}
                    className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    OR #{payment.or_number}
                  </button>
                  {getStatusBadge()}
                </div>
                <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                  {payment.purpose}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronDown className={cn(
                "h-4 w-4 text-gray-500 transition-transform duration-200",
                isExpanded && "transform rotate-180"
              )} />
            </button>
          </div>

          {/* Amount Summary */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {payment.formatted_total}
              </p>
            </div>
            {payment.status === 'completed' || payment.status === 'paid' ? (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {payment.formatted_total}
                </p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {payment.formatted_total}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Badge */}
          <div className="mb-3">
            <Badge variant="outline" className={`${methodConfig?.color} ${methodConfig?.textColor} border-0 gap-1`}>
              {MethodIcon && <MethodIcon className="h-3 w-3" />}
              <span>{methodConfig?.label || payment.payment_method}</span>
            </Badge>
          </div>

          {/* Expandable Details */}
          {isExpanded && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 animate-slide-down">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(payment.payment_date)}
                  </p>
                </div>
                {payment.due_date && (
                  <div>
                    <p className={cn(
                      "text-xs text-gray-500 dark:text-gray-400",
                      payment.status === 'overdue' && "text-red-500"
                    )}>
                      Due Date
                    </p>
                    <p className={cn(
                      "text-xs font-medium",
                      payment.status === 'overdue' ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {formatDate(payment.due_date)}
                      {payment.status === 'overdue' && (
                        <span className="ml-1 text-red-500">
                          (Overdue)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Reference Number if available */}
              {payment.reference_number && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reference Number</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {payment.reference_number}
                  </p>
                </div>
              )}

              {/* Collection Type */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Collection Type</p>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {payment.collection_type_display}
                </p>
              </div>

              {/* Breakdown */}
              {((payment.surcharge || 0) > 0 || (payment.penalty || 0) > 0 || (payment.discount || 0) > 0) && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">{payment.formatted_subtotal}</span>
                  </div>
                  {payment.surcharge > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Surcharge</span>
                      <span className="font-medium text-amber-600">+{payment.formatted_surcharge}</span>
                    </div>
                  )}
                  {payment.penalty > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Penalty</span>
                      <span className="font-medium text-red-600">+{payment.formatted_penalty}</span>
                    </div>
                  )}
                  {payment.discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Discount</span>
                      <span className="font-medium text-green-600">-{payment.formatted_discount}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => onViewDetails?.(payment.id)}
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
                {(payment.status === 'pending' || payment.status === 'overdue') && (
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => onMakePayment?.(payment.id)}
                  >
                    <CreditCard className="h-3 w-3" />
                    Pay Now
                  </Button>
                )}
                {(payment.status === 'completed' || payment.status === 'paid') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => onDownloadReceipt?.(payment)}
                  >
                    <Download className="h-3 w-3" />
                    Receipt
                  </Button>
                )}
              </div>

              {/* More Options */}
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <MoreVertical className="h-3 w-3" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onCopyOrNumber?.(payment.or_number)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy OR Number
                    </DropdownMenuItem>
                    {payment.reference_number && (
                      <DropdownMenuItem onClick={() => onCopyReference?.(payment.reference_number!)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Reference
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onGenerateReceipt?.(payment)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Receipt
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};