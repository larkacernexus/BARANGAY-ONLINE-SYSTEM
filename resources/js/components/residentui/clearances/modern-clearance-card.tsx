import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Eye, Download, Copy, MoreVertical, FileText, AlertCircle, Calendar, User, Clock, FileCheck } from 'lucide-react';
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

interface ModernClearanceCardProps {
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
  onDownloadClearance?: (clearance: any) => void;
  onGenerateReport?: (clearance: any) => void;
  onReportIssue?: (clearance: any) => void;
  isMobile?: boolean;
}

export const ModernClearanceCard = ({
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
  onDownloadClearance,
  onGenerateReport,
  onReportIssue,
  isMobile = true,
}: ModernClearanceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = STATUS_CONFIG[clearance.status as keyof typeof STATUS_CONFIG];
  const urgencyConfig = URGENCY_CONFIG[clearance.urgency as keyof typeof URGENCY_CONFIG];
  const StatusIcon = statusConfig?.icon || Clock;

  // Check if there are any expandable details
  const hasExpandableDetails = clearance.specific_purpose || clearance.remarks;

  // Format date with year
  const formatDateWithYear = (date: string) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return formatDate(date);
    }
  };

  return (
    <div className="mb-2 last:mb-0 animate-fade-in">
      <Card className={cn(
        "border-0 shadow-md hover:shadow-lg transition-all duration-200 group bg-white dark:bg-gray-800",
        selectMode && selectedClearances?.includes(clearance.id) && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900",
        clearance.status === 'rejected' && "border-l-2 border-l-red-500",
        clearance.status === 'pending_payment' && "border-l-2 border-l-orange-500"
      )}>
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {selectMode && (
                <button
                  onClick={() => toggleSelectClearance?.(clearance.id)}
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                    selectedClearances?.includes(clearance.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                  )}
                >
                  {selectedClearances?.includes(clearance.id) && (
                    <Check className="h-2.5 w-2.5 text-white" />
                  )}
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <button
                    onClick={() => onCopyReference?.(clearance.reference_number)}
                    className="font-mono text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                  >
                    #{clearance.reference_number}
                  </button>
                  {clearance.clearance_number && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      <FileCheck className="h-2.5 w-2.5 mr-0.5" />
                      #{clearance.clearance_number}
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-xs text-gray-900 dark:text-white line-clamp-1">
                  {getClearanceTypeDisplay(clearance.clearance_type)}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {clearance.purpose}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={`${urgencyConfig?.color} ${urgencyConfig?.textColor} border-0 flex items-center text-[9px] px-1.5 py-0`}>
                <span className={`h-1.5 w-1.5 rounded-full ${urgencyConfig?.dot} mr-1`}></span>
                <span>{urgencyConfig?.label || clearance.urgency}</span>
              </Badge>
              <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-1.5 py-0 flex items-center gap-0.5 text-[9px]`}>
                <StatusIcon className="h-2.5 w-2.5" />
                <span>{statusConfig?.label || clearance.status}</span>
              </Badge>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400">Fee Amount</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(clearance.fee_amount)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-500 dark:text-gray-400">
              <User className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">
                {clearance.resident?.first_name} {clearance.resident?.last_name}
                {clearance.resident_id === currentResident?.id && ' (You)'}
              </span>
            </div>
          </div>

          {/* Dates - Two Column Layout with Year */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2 mb-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                <Calendar className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  Req: {formatDateWithYear(clearance.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                <Calendar className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  Need: {formatDateWithYear(clearance.needed_date)}
                </span>
              </div>
              {clearance.issue_date && (
                <div className="flex items-center gap-1.5 text-[9px] col-span-2 min-w-0">
                  <Calendar className="h-2.5 w-2.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-green-600 dark:text-green-400 truncate">
                    Issued: {formatDateWithYear(clearance.issue_date)}
                  </span>
                </div>
              )}
              {clearance.valid_until && (
                <div className="flex items-center gap-1.5 text-[9px] col-span-2 min-w-0">
                  <Calendar className="h-2.5 w-2.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-blue-600 dark:text-blue-400 truncate">
                    Valid: {formatDateWithYear(clearance.valid_until)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Details - Only show if there are details */}
          {hasExpandableDetails && isExpanded && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 animate-slide-down">
              {/* Specific Purpose */}
              {clearance.specific_purpose && (
                <div>
                  <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Specific Purpose</p>
                  <p className="text-[10px] text-gray-700 dark:text-gray-300">
                    {clearance.specific_purpose}
                  </p>
                </div>
              )}

              {/* Remarks */}
              {clearance.remarks && (
                <div>
                  <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Remarks</p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">{clearance.remarks}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1 h-7 text-[10px] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onViewDetails?.(clearance.id)}
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            
            {hasExpandableDetails && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title={isExpanded ? "Show Less" : "Show More"}
              >
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isExpanded && "transform rotate-180"
                )} />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};