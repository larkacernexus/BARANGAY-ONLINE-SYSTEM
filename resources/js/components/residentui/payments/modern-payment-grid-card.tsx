import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, CreditCard, Copy, MoreVertical, FileText, Printer, Download } from 'lucide-react';
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
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from './constants';

interface ModernPaymentGridCardProps {
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
}

export const ModernPaymentGridCard = ({
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
}: ModernPaymentGridCardProps) => {
  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status as keyof typeof PAYMENT_STATUS_CONFIG];
  const methodConfig = PAYMENT_METHOD_CONFIG[payment.payment_method as keyof typeof PAYMENT_METHOD_CONFIG];
  const StatusIcon = statusConfig?.icon;
  const MethodIcon = methodConfig?.icon;

  return (
    <div className="animate-fade-in-up">
      <Card className={cn(
        "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800",
        selectMode && selectedPayments?.includes(payment.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
        payment.status === 'overdue' && "border-l-4 border-l-red-500"
      )}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {selectMode && (
                <button
                  onClick={() => toggleSelectPayment?.(payment.id)}
                  className={cn(
                    "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    selectedPayments?.includes(payment.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                  )}
                >
                  {selectedPayments?.includes(payment.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              )}
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => onCopyOrNumber?.(payment.or_number)}
                    className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    OR #{payment.or_number}
                  </button>
                  {payment.reference_number && (
                    <Badge 
                      variant="outline" 
                      className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Ref
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {payment.purpose}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <DropdownMenuItem 
                  onClick={() => onCopyOrNumber?.(payment.or_number)}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy OR Number
                </DropdownMenuItem>
                {payment.reference_number && (
                  <DropdownMenuItem 
                    onClick={() => onCopyReference?.(payment.reference_number!)}
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Reference
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem 
                  onClick={() => onGenerateReceipt?.(payment)}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Receipt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
              <div className="flex items-center gap-1 mt-1">
                {MethodIcon && <MethodIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />}
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {methodConfig?.label || payment.payment_method}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(payment.payment_date)}
              </p>
            </div>
            {payment.due_date && (
              <div className="col-span-2">
                <p className={cn(
                  "text-xs",
                  payment.status === 'overdue' ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                )}>
                  Due Date
                </p>
                <p className={cn(
                  "text-sm font-medium",
                  payment.status === 'overdue' ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                )}>
                  {formatDate(payment.due_date)}
                </p>
              </div>
            )}
          </div>

          {/* Status and Amount */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {StatusIcon && (
                  <div className={`p-1 rounded-lg ${statusConfig?.color}`}>
                    <StatusIcon className="h-3 w-3" />
                  </div>
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusConfig?.color} ${statusConfig?.textColor}`}>
                  {statusConfig?.label || payment.status}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {payment.formatted_total}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {payment.collection_type_display}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onViewDetails?.(payment.id)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            {(payment.status === 'pending' || payment.status === 'overdue') && (
              <Button
                size="sm"
                className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                onClick={() => onMakePayment?.(payment.id)}
              >
                <CreditCard className="h-4 w-4" />
                Pay
              </Button>
            )}
            {(payment.status === 'completed' || payment.status === 'paid') && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => onDownloadReceipt?.(payment)}
              >
                <Download className="h-4 w-4" />
                Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};