import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Eye, Copy, MoreVertical, FileText, Calendar, MapPin, Flag, Paperclip, Shield } from 'lucide-react';
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

interface ModernReportCardProps {
    report: any;
    selectMode?: boolean;
    selectedReports?: number[];
    toggleSelectReport?: (id: number) => void;
    formatDate: (date: string) => string;
    onViewDetails?: (id: number) => void;
    onCopyReportNumber?: (number: string) => void;
    onGenerateReport?: (report: any) => void;
    isMobile?: boolean;
}

export const ModernReportCard = ({
    report,
    selectMode,
    selectedReports,
    toggleSelectReport,
    formatDate,
    onViewDetails,
    onCopyReportNumber,
    onGenerateReport,
    isMobile = true,
}: ModernReportCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG];
    const urgencyConfig = URGENCY_CONFIG[report.urgency as keyof typeof URGENCY_CONFIG];
    const StatusIcon = statusConfig?.icon || null;

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
                selectMode && selectedReports?.includes(report.id) && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900",
                report.status === 'resolved' && "border-l-2 border-l-green-500",
                report.status === 'rejected' && "border-l-2 border-l-red-500"
            )}>
                <CardContent className="p-3">
                    {/* Header - More Compact */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectReport?.(report.id)}
                                    className={cn(
                                        "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                        selectedReports?.includes(report.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                                    )}
                                >
                                    {selectedReports?.includes(report.id) && (
                                        <Check className="h-2.5 w-2.5 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <button
                                        onClick={() => onCopyReportNumber?.(report.report_number)}
                                        className="font-mono text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                                    >
                                        #{report.report_number}
                                    </button>
                                    {report.is_anonymous && (
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                            <Shield className="h-2.5 w-2.5 mr-0.5" />
                                            Anonymous
                                        </Badge>
                                    )}
                                </div>
                                <p className="font-medium text-xs text-gray-900 dark:text-white line-clamp-1">
                                    {report.title}
                                </p>
                            </div>
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 -mt-0.5"
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <DropdownMenuItem 
                                    onClick={() => onCopyReportNumber?.(report.report_number)}
                                    className="text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    Copy Report No.
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                <DropdownMenuItem 
                                    onClick={() => onGenerateReport?.(report)}
                                    className="text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                    Generate Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Urgency and Status - More Compact */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className={`${urgencyConfig?.color} ${urgencyConfig?.textColor} border-0 flex items-center text-[9px] px-1.5 py-0`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${urgencyConfig?.dot} mr-1`}></span>
                            <span>{urgencyConfig?.label || report.urgency}</span>
                        </Badge>
                        <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-1.5 py-0 flex items-center gap-0.5 text-[9px]`}>
                            {StatusIcon && <StatusIcon className="h-2.5 w-2.5" />}
                            <span>{statusConfig?.label || report.status}</span>
                        </Badge>
                    </div>

                    {/* Location - More Compact */}
                    <div className="flex items-center gap-1 mb-1.5 text-[10px]">
                        <MapPin className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">{report.location}</span>
                    </div>

                    {/* Category and Evidence - More Compact */}
                    <div className="flex items-center justify-between mb-1.5 text-[10px]">
                        <div className="flex items-center gap-1">
                            <Flag className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400 capitalize truncate">
                                {report.report_type.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Paperclip className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                {report.evidences_count || 0}
                            </span>
                        </div>
                    </div>

                    {/* Description preview - More Compact */}
                    <div className="mb-1.5">
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1">
                            {report.description}
                        </p>
                    </div>

                    {/* Details Box - Two Column Layout with Year */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-2 mb-2">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                                <Calendar className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400 truncate">
                                    Filed: {formatDateWithYear(report.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] min-w-0">
                                <Calendar className="h-2.5 w-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400 truncate">
                                    Incident: {formatDateWithYear(report.incident_date)}
                                </span>
                            </div>
                            {report.incident_time && (
                                <div className="flex items-center gap-1.5 text-[9px] col-span-2 min-w-0">
                                    <span className="w-2.5 flex-shrink-0"></span>
                                    <span className="text-gray-600 dark:text-gray-400 truncate ml-3.5">
                                        Time: {report.incident_time}
                                    </span>
                                </div>
                            )}
                            {report.resolved_at && (
                                <div className="flex items-center gap-1.5 text-[9px] col-span-2 min-w-0">
                                    <Calendar className="h-2.5 w-2.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                    <span className="text-green-600 dark:text-green-400 truncate">
                                        Resolved: {formatDateWithYear(report.resolved_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expand/Collapse Section */}
                    {isExpanded && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 animate-slide-down">
                            {/* Full Description */}
                            <div>
                                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Full Description</p>
                                <p className="text-[10px] text-gray-700 dark:text-gray-300">
                                    {report.description}
                                </p>
                            </div>

                            {/* Report Type Details */}
                            <div>
                                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Report Type</p>
                                <p className="text-[10px] font-medium text-gray-900 dark:text-white">{report.report_type.name}</p>
                                {report.report_type.description && (
                                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{report.report_type.description}</p>
                                )}
                            </div>

                            {/* Admin Notes */}
                            {report.admin_notes && (
                                <div>
                                    <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Admin Notes</p>
                                    <p className="text-[10px] text-gray-600 dark:text-gray-400">{report.admin_notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions - More Compact */}
                    <div className="flex gap-1.5 mt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 h-7 text-[10px] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => onViewDetails?.(report.id)}
                        >
                            <Eye className="h-3 w-3" />
                            View
                        </Button>
                        
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};