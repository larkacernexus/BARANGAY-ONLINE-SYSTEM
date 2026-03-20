import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, DollarSign, Download, Copy, MoreVertical, FileText, AlertCircle, Calendar, User, Clock, FileCheck } from 'lucide-react';
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
import { STATUS_CONFIG, URGENCY_CONFIG } from './constants';

interface ModernClearanceGridCardProps {
  clearance: any;
  selectMode?: boolean;
  selectedClearances?: number[];
  toggleSelectClearance?: (id: number) => void;
  getClearanceTypeDisplay: (clearanceType: any) => string;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number | string) => string;
  currentResident?: any;
  onCopyReference?: (ref: string) => void;
  onViewDetails?: (id: number) => void;
  onMakePayment?: (id: number) => void;
  onDownloadClearance?: (clearance: any) => void;
  onGenerateReport?: (clearance: any) => void;
  onReportIssue?: (clearance: any) => void;
}

export const ModernClearanceGridCard = ({
  clearance,
  selectMode,
  selectedClearances,
  toggleSelectClearance,
  getClearanceTypeDisplay,
  formatDate,
  formatCurrency,
  currentResident,
  onCopyReference,
  onViewDetails,
  onMakePayment,
  onDownloadClearance,
  onGenerateReport,
  onReportIssue,
}: ModernClearanceGridCardProps) => {
  const statusConfig = STATUS_CONFIG[clearance.status as keyof typeof STATUS_CONFIG];
  const urgencyConfig = URGENCY_CONFIG[clearance.urgency as keyof typeof URGENCY_CONFIG];
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <div className="animate-fade-in-up">
      <Card className={cn(
        "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group",
        selectMode && selectedClearances?.includes(clearance.id) && "ring-2 ring-blue-500 ring-offset-2",
        clearance.status === 'rejected' && "border-l-4 border-l-red-500",
        clearance.status === 'pending_payment' && "border-l-4 border-l-orange-500"
      )}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {selectMode && (
                <button
                  onClick={() => toggleSelectClearance?.(clearance.id)}
                  className={cn(
                    "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    selectedClearances?.includes(clearance.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                  )}
                >
                  {selectedClearances?.includes(clearance.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              )}
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => onCopyReference?.(clearance.reference_number)}
                    className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    #{clearance.reference_number}
                  </button>
                  {clearance.clearance_number && (
                    <Badge variant="outline" className="text-xs">
                      <FileCheck className="h-3 w-3 mr-1" />
                      #{clearance.clearance_number}
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {getClearanceTypeDisplay(clearance.clearance_type)}
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
                <DropdownMenuItem onClick={() => onCopyReference?.(clearance.reference_number)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Reference No.
                </DropdownMenuItem>
                {clearance.clearance_number && (
                  <DropdownMenuItem onClick={() => onCopyReference?.(clearance.clearance_number)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Clearance No.
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onGenerateReport?.(clearance)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => onReportIssue?.(clearance)}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Urgency */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className={`${urgencyConfig?.color} ${urgencyConfig?.textColor} border-0`}>
              <span className={`h-2 w-2 rounded-full ${urgencyConfig?.dot} mr-2`}></span>
              <span>{urgencyConfig?.label || clearance.urgency}</span>
            </Badge>
            <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-2 py-1 flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig?.label || clearance.status}</span>
            </Badge>
          </div>

          {/* Purpose */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {clearance.purpose}
            </p>
            {clearance.specific_purpose && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {clearance.specific_purpose}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Fee Amount</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(clearance.fee_amount)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {clearance.resident?.first_name} {clearance.resident?.last_name}
                {clearance.resident_id === currentResident?.id && ' (You)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Requested:</span>
                <span className="text-xs font-medium">{formatDate(clearance.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Needed:</span>
                <span className="text-xs font-medium">{formatDate(clearance.needed_date)}</span>
              </div>
            </div>

            {clearance.issue_date && (
              <div className="text-xs text-gray-500">
                Issued: {formatDate(clearance.issue_date)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onViewDetails?.(clearance.id)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            {clearance.status === 'pending_payment' && (
              <Button
                size="sm"
                className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-orange-600"
                onClick={() => onMakePayment?.(clearance.id)}
              >
                <DollarSign className="h-4 w-4" />
                Pay
              </Button>
            )}
            {clearance.status === 'issued' && clearance.clearance_number && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => onDownloadClearance?.(clearance)}
              >
                <Download className="h-4 w-4" />
                Get
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};