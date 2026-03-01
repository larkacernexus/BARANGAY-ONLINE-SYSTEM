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

    return (
        <div className="mb-3 last:mb-0 animate-fade-in">
            <Card className={cn(
                "border-0 shadow-lg overflow-hidden transition-all duration-300",
                selectMode && selectedReports?.includes(report.id) && "ring-2 ring-blue-500 ring-offset-2",
                report.status === 'resolved' && "border-l-4 border-l-green-500",
                report.status === 'rejected' && "border-l-4 border-l-red-500"
            )}>
                <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectReport?.(report.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedReports?.includes(report.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    )}
                                >
                                    {selectedReports?.includes(report.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => onCopyReportNumber?.(report.report_number)}
                                        className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        #{report.report_number}
                                    </button>
                                    {report.is_anonymous && (
                                        <Badge variant="outline" className="text-xs">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Anonymous
                                        </Badge>
                                    )}
                                </div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                                    {report.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {report.location}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={`${urgencyConfig?.color} ${urgencyConfig?.textColor} border-0 flex items-center`}>
                                <span className={`h-2 w-2 rounded-full ${urgencyConfig?.dot} mr-2`}></span>
                                <span>{urgencyConfig?.label || report.urgency}</span>
                            </Badge>
                            <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-2 py-1 flex items-center gap-1`}>
                                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                <span>{statusConfig?.label || report.status}</span>
                            </Badge>
                        </div>
                    </div>

                    {/* Category and Evidence */}
                    <div className="flex items-center gap-3 mb-2 text-xs">
                        <div className="flex items-center gap-1">
                            <Flag className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {report.report_type.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                                {report.evidences_count || 0} file{(report.evidences_count || 0) !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-500">Filed:</span>
                            <span className="font-medium">{formatDate(report.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-500">Incident:</span>
                            <span className="font-medium">{formatDate(report.incident_date)}</span>
                        </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3 animate-slide-down">
                            {/* Full Description */}
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {report.description}
                                </p>
                            </div>

                            {/* Incident Time */}
                            {report.incident_time && (
                                <div>
                                    <p className="text-xs text-gray-500">Incident Time</p>
                                    <p className="text-sm">{report.incident_time}</p>
                                </div>
                            )}

                            {/* Report Type */}
                            <div>
                                <p className="text-xs text-gray-500">Report Type</p>
                                <p className="text-sm font-medium">{report.report_type.name}</p>
                            </div>

                            {/* Resolution */}
                            {report.resolved_at && (
                                <div>
                                    <p className="text-xs text-green-600">Resolved</p>
                                    <p className="text-sm text-green-600">{formatDate(report.resolved_at)}</p>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {report.admin_notes && (
                                <div>
                                    <p className="text-xs text-gray-500">Admin Notes</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.admin_notes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => onViewDetails?.(report.id)}
                                >
                                    <Eye className="h-3 w-3" />
                                    View Details
                                </Button>
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
                                        <DropdownMenuItem onClick={() => onCopyReportNumber?.(report.report_number)}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Report No.
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onGenerateReport?.(report)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Generate Report
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )}

                    {/* Expand/Collapse Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full mt-2 pt-2 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded && "transform rotate-180"
                        )} />
                        <span className="ml-1">{isExpanded ? 'Show Less' : 'Show More'}</span>
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};