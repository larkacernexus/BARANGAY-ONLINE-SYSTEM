// components/residentui/reports/modern-report-list-card.tsx

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, MoreVertical, Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STATUS_CONFIG, URGENCY_CONFIG } from './constants';

interface ModernReportListCardProps {
    report: any;
    selectMode?: boolean;
    selectedReports?: number[];
    toggleSelectReport?: (id: number) => void;
    formatDate: (date: string) => string;
    onViewDetails?: (id: number) => void;
    onCopyReportNumber?: (number: string) => void;
    onGenerateReport?: (report: any) => void;
}

export const ModernReportListCard = ({
    report,
    selectMode,
    selectedReports,
    toggleSelectReport,
    formatDate,
    onViewDetails,
    onCopyReportNumber,
    onGenerateReport,
}: ModernReportListCardProps) => {
    const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG];
    const urgencyConfig = URGENCY_CONFIG[report.urgency as keyof typeof URGENCY_CONFIG];
    const StatusIcon = statusConfig?.icon;
    const isSelected = selectedReports?.includes(report.id);

    return (
        <Card 
            className={cn(
                "border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 overflow-hidden",
                "border-l-4",
                isSelected && "ring-2 ring-blue-500",
                report.status === 'resolved' && "border-l-green-500",
                report.status === 'rejected' && "border-l-red-500",
                report.status === 'pending' && "border-l-yellow-500",
                report.status === 'under_review' && "border-l-blue-500",
                report.status === 'in_progress' && "border-l-purple-500",
                !['resolved', 'rejected', 'pending', 'under_review', 'in_progress'].includes(report.status) && "border-l-gray-300"
            )}
            onClick={() => selectMode && toggleSelectReport?.(report.id)}
        >
            <div className="p-3">
                <div className="flex items-start gap-3">
                    {/* Selection Checkbox */}
                    {selectMode && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectReport?.(report.id);
                            }}
                            className={cn(
                                "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5",
                                isSelected
                                    ? "bg-blue-500 border-blue-500"
                                    : "border-gray-300 dark:border-gray-600"
                            )}
                        >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                        </button>
                    )}

                    {/* Status Indicator Dot */}
                    <div className="flex-shrink-0 mt-1">
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            statusConfig?.dot || "bg-gray-400"
                        )} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {report.report_number}
                                </span>
                                <Badge 
                                    variant="outline" 
                                    className={cn(
                                        "text-[10px] px-1.5 py-0 border-0",
                                        urgencyConfig?.color,
                                        urgencyConfig?.textColor
                                    )}
                                >
                                    {urgencyConfig?.label || report.urgency}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <Badge 
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.5 border-0",
                                        statusConfig?.color,
                                        statusConfig?.textColor
                                    )}
                                >
                                    {statusConfig?.label || report.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {report.title}
                        </h3>

                        {/* Meta Info Row */}
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                            {report.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate max-w-[120px]">{report.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(report.created_at)}</span>
                            </div>
                            {report.incident_time && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{report.incident_time}</span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Row - Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails?.(report.id);
                                    }}
                                >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    View
                                </Button>
                            </div>

                            <div className="flex items-center gap-1">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0 text-gray-500 dark:text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onClick={() => onViewDetails?.(report.id)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onCopyReportNumber?.(report.report_number)}>
                                            <ChevronRight className="h-4 w-4 mr-2" />
                                            Copy Number
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onGenerateReport?.(report)}>
                                            <ChevronRight className="h-4 w-4 mr-2" />
                                            Generate PDF
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ModernReportListCard;