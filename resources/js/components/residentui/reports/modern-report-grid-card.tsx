import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Copy, MoreVertical, FileText, Calendar, MapPin, Flag, Paperclip, Shield } from 'lucide-react';
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

interface ModernReportGridCardProps {
    report: any;
    selectMode?: boolean;
    selectedReports?: number[];
    toggleSelectReport?: (id: number) => void;
    formatDate: (date: string) => string;
    onViewDetails?: (id: number) => void;
    onCopyReportNumber?: (number: string) => void;
    onGenerateReport?: (report: any) => void;
}

export const ModernReportGridCard = ({
    report,
    selectMode,
    selectedReports,
    toggleSelectReport,
    formatDate,
    onViewDetails,
    onCopyReportNumber,
    onGenerateReport,
}: ModernReportGridCardProps) => {
    const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG];
    const urgencyConfig = URGENCY_CONFIG[report.urgency as keyof typeof URGENCY_CONFIG];
    const StatusIcon = statusConfig?.icon;

    return (
        <div className="animate-fade-in-up">
            <Card className={cn(
                "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800",
                selectMode && selectedReports?.includes(report.id) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900",
                report.status === 'resolved' && "border-l-4 border-l-green-500",
                report.status === 'rejected' && "border-l-4 border-l-red-500"
            )}>
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            {selectMode && (
                                <button
                                    onClick={() => toggleSelectReport?.(report.id)}
                                    className={cn(
                                        "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedReports?.includes(report.id)
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                                    )}
                                >
                                    {selectedReports?.includes(report.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </button>
                            )}
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => onCopyReportNumber?.(report.report_number)}
                                        className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        #{report.report_number}
                                    </button>
                                    {report.is_anonymous && (
                                        <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Anonymous
                                        </Badge>
                                    )}
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {report.title}
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
                                    onClick={() => onCopyReportNumber?.(report.report_number)}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Report No.
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                                <DropdownMenuItem 
                                    onClick={() => onGenerateReport?.(report)}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Urgency and Status */}
                    <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className={`${urgencyConfig?.color} ${urgencyConfig?.textColor} border-0 flex items-center`}>
                            <span className={`h-2 w-2 rounded-full ${urgencyConfig?.dot} mr-2`}></span>
                            <span>{urgencyConfig?.label || report.urgency}</span>
                        </Badge>
                        <Badge className={`${statusConfig?.color} ${statusConfig?.textColor} border-0 px-2 py-1 flex items-center gap-1`}>
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            <span>{statusConfig?.label || report.status}</span>
                        </Badge>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 mb-2 text-xs">
                        <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400 line-clamp-1">{report.location}</span>
                    </div>

                    {/* Category and Evidence */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                        <div className="flex items-center gap-1">
                            <Flag className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {report.report_type.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                {report.evidences_count || 0}
                            </span>
                        </div>
                    </div>

                    {/* Description preview */}
                    <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {report.description}
                        </p>
                    </div>

                    {/* Details Box */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                Filed: {formatDate(report.created_at)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                Incident: {formatDate(report.incident_date)}
                                {report.incident_time && ` at ${report.incident_time}`}
                            </span>
                        </div>
                        {report.resolved_at && (
                            <div className="flex items-center gap-2 text-xs">
                                <Calendar className="h-3 w-3 text-green-500 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400">
                                    Resolved: {formatDate(report.resolved_at)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => onViewDetails?.(report.id)}
                        >
                            <Eye className="h-4 w-4" />
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};