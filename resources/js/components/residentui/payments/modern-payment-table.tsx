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
import { Eye, Download, MoreVertical, Copy, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from './constants';

interface ModernPaymentTableProps {
  payments: any[];
  selectMode: boolean;
  selectedPayments: number[];
  toggleSelectPayment: (id: number) => void;
  selectAllPayments: () => void;
  formatDate: (date: string) => string;
  onViewDetails: (id: number) => void;
  onMakePayment: (id: number) => void;
  onDownloadReceipt: (payment: any) => void;
  onCopyOrNumber: (orNumber: string) => void;
  onCopyReference: (ref: string) => void;
  onGenerateReceipt: (payment: any) => void;
}

export const ModernPaymentTable = ({
  payments,
  selectMode,
  selectedPayments,
  toggleSelectPayment,
  selectAllPayments,
  formatDate,
  onViewDetails,
  onMakePayment,
  onDownloadReceipt,
  onCopyOrNumber,
  onCopyReference,
  onGenerateReceipt,
}: ModernPaymentTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectMode && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPayments.length === payments.length && payments.length > 0}
                  onChange={selectAllPayments}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
            )}
            <TableHead className="font-semibold">OR Details</TableHead>
            <TableHead className="font-semibold">Purpose & Type</TableHead>
            <TableHead className="font-semibold">Dates</TableHead>
            <TableHead className="font-semibold">Method</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const statusConfig = PAYMENT_STATUS_CONFIG[payment.status as keyof typeof PAYMENT_STATUS_CONFIG];
            const methodConfig = PAYMENT_METHOD_CONFIG[payment.payment_method as keyof typeof PAYMENT_METHOD_CONFIG];
            const StatusIcon = statusConfig?.icon;
            const MethodIcon = methodConfig?.icon;

            return (
              <TableRow key={payment.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                {selectMode && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => toggleSelectPayment(payment.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1">
                    <button
                      onClick={() => onCopyOrNumber(payment.or_number)}
                      className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      OR #{payment.or_number}
                    </button>
                    {payment.reference_number && (
                      <Badge variant="outline" className="text-xs ml-2">
                        Ref: {payment.reference_number}
                      </Badge>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payment.collection_type_display}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payment.purpose}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payment.certificate_type_display || 'General Payment'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="text-sm">{formatDate(payment.payment_date)}</p>
                    </div>
                    {payment.due_date && (
                      <div>
                        <p className={cn(
                          "text-xs",
                          payment.status === 'overdue' ? "text-red-600" : "text-gray-500"
                        )}>
                          Due
                        </p>
                        <p className={cn(
                          "text-sm",
                          payment.status === 'overdue' ? "text-red-600 font-medium" : ""
                        )}>
                          {formatDate(payment.due_date)}
                        </p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${methodConfig?.color} ${methodConfig?.textColor} border-0 gap-1`}>
                    {MethodIcon && <MethodIcon className="h-3 w-3" />}
                    <span>{methodConfig?.label || payment.payment_method}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-2 py-1 gap-1`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    <span>{statusConfig?.label || payment.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-bold">{payment.formatted_total}</div>
                    {((payment.surcharge || 0) > 0 ||
                      (payment.penalty || 0) > 0 ||
                      (payment.discount || 0) > 0) && (
                      <div className="text-xs text-gray-500">
                        Base: {payment.formatted_subtotal}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onViewDetails(payment.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(payment.status === 'completed' || payment.status === 'paid') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onDownloadReceipt(payment)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {(payment.status === 'pending' || payment.status === 'overdue') && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600"
                        onClick={() => onMakePayment(payment.id)}
                      >
                        Pay
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onCopyOrNumber(payment.or_number)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy OR Number
                        </DropdownMenuItem>
                        {payment.reference_number && (
                          <DropdownMenuItem onClick={() => onCopyReference(payment.reference_number!)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Reference
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onGenerateReceipt(payment)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Receipt
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