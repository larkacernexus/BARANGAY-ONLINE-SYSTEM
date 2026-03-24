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
import { Eye, Download, MoreVertical, Copy, FileText, AlertCircle, FileCheck, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STATUS_CONFIG, URGENCY_CONFIG } from './constants';

interface ModernClearanceTableProps {
  clearances: any[];
  selectMode: boolean;
  selectedClearances: number[];
  toggleSelectClearance: (id: number) => void;
  selectAllClearances: () => void;
  getClearanceTypeDisplay: (clearanceType: any) => string;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number | string) => string;
  currentResident?: any;
  onCopyReference: (ref: string) => void;
  onViewDetails: (id: number) => void;
  onDownloadClearance: (clearance: any) => void;
  onGenerateReport: (clearance: any) => void;
  onReportIssue: (clearance: any) => void;
}

export const ModernClearanceTable = ({
  clearances,
  selectMode,
  selectedClearances,
  toggleSelectClearance,
  selectAllClearances,
  getClearanceTypeDisplay,
  formatDate,
  formatCurrency,
  currentResident,
  onCopyReference,
  onViewDetails,
  onDownloadClearance,
  onGenerateReport,
  onReportIssue,
}: ModernClearanceTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectMode && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedClearances.length === clearances.length && clearances.length > 0}
                  onChange={selectAllClearances}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
            )}
            <TableHead className="font-semibold">Reference Details</TableHead>
            <TableHead className="font-semibold">Type & Purpose</TableHead>
            <TableHead className="font-semibold">Dates</TableHead>
            <TableHead className="font-semibold">Urgency</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Fee</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clearances.map((clearance) => {
            const statusConfig = STATUS_CONFIG[clearance.status as keyof typeof STATUS_CONFIG];
            const urgencyConfig = URGENCY_CONFIG[clearance.urgency as keyof typeof URGENCY_CONFIG];
            const StatusIcon = statusConfig?.icon;

            return (
              <TableRow key={clearance.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                {selectMode && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedClearances.includes(clearance.id)}
                      onChange={() => toggleSelectClearance(clearance.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCopyReference(clearance.reference_number)}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Requested by: {clearance.resident?.first_name} {clearance.resident?.last_name}
                      {clearance.resident_id === currentResident?.id && ' (You)'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getClearanceTypeDisplay(clearance.clearance_type)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {clearance.purpose}
                    </p>
                    {clearance.specific_purpose && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {clearance.specific_purpose}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>
                      <p className="text-xs text-gray-500">Requested</p>
                      <p className="text-sm">{formatDate(clearance.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Needed By</p>
                      <p className="text-sm">{formatDate(clearance.needed_date)}</p>
                    </div>
                    {clearance.issue_date && (
                      <div>
                        <p className="text-xs text-gray-500">Issued</p>
                        <p className="text-sm">{formatDate(clearance.issue_date)}</p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${urgencyConfig?.color} ${urgencyConfig?.textColor} border-0`}>
                    <span className={`h-2 w-2 rounded-full ${urgencyConfig?.dot} mr-2`}></span>
                    <span>{urgencyConfig?.label || clearance.urgency}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-2 py-1 flex items-center gap-1 w-fit`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    <span>{statusConfig?.label || clearance.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-bold">{formatCurrency(clearance.fee_amount)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onViewDetails(clearance.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {clearance.status === 'issued' && clearance.clearance_number && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onDownloadClearance(clearance)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onCopyReference(clearance.reference_number)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Reference No.
                        </DropdownMenuItem>
                        {clearance.clearance_number && (
                          <DropdownMenuItem onClick={() => onCopyReference(clearance.clearance_number)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Clearance No.
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onGenerateReport(clearance)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => onReportIssue(clearance)}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Report Issue
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