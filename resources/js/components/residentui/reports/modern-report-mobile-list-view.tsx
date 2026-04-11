// components/residentui/reports/modern-report-mobile-list-view.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Check, 
    Eye, 
    MoreHorizontal, 
    FileText, 
    ChevronRight,
    ChevronDown,
    Calendar,
    MapPin,
    Copy,
    Printer,
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingUp,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CommunityReport } from '@/types/portal/reports/community-report';

interface ModernReportMobileListViewProps {
    reports: CommunityReport[];
    selectMode?: boolean;
    selectedReports?: number[];
    toggleSelectReport?: (id: number) => void;
    formatDate: (date: string | null | undefined) => string;
    onViewDetails: (id: number) => void;
    onCopyReportNumber: (reportNumber: string) => void;
    onGenerateReport: (report: CommunityReport) => void;
}

// Status badge config
const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', 
        label: 'Pending',
        icon: Clock
    },
    under_review: { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', 
        label: 'Under Review',
        icon: AlertCircle
    },
    in_progress: { 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', 
        label: 'In Progress',
        icon: TrendingUp
    },
    resolved: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', 
        label: 'Resolved',
        icon: CheckCircle
    },
    rejected: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', 
        label: 'Rejected',
        icon: XCircle
    },
};

// Urgency badge config
const urgencyConfig: Record<string, { color: string; label: string }> = {
    low: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', label: 'High' },
    critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', label: 'Critical' },
};

export function ModernReportMobileListView({
    reports,
    selectMode = false,
    selectedReports = [],
    toggleSelectReport,
    formatDate,
    onViewDetails,
    onCopyReportNumber,
    onGenerateReport,
}: ModernReportMobileListViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(expandedId === id ? null : id);
    };

    const getStatusBadge = (status?: string) => {
        const config = statusConfig[status || ''] || { 
            color: 'bg-gray-100 text-gray-800', 
            label: status || 'Unknown',
            icon: AlertCircle
        };
        return config;
    };

    const getUrgencyBadge = (urgency?: string) => {
        return urgencyConfig[urgency?.toLowerCase() || ''] || { 
            color: 'bg-gray-100 text-gray-700', 
            label: urgency || 'Normal' 
        };
    };

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reports.map((report) => {
                const isSelected = selectedReports.includes(report.id);
                const isExpanded = expandedId === report.id;
                const statusBadge = getStatusBadge(report.status);
                const urgencyBadge = getUrgencyBadge(report.urgency);
                const StatusIcon = statusBadge.icon;
                const reportNumber = report.report_number ?? 'N/A';
                const evidenceCount = report.evidences_count ?? 0;

                return (
                    <div
                        key={report.id}
                        className={cn(
                            "relative transition-colors",
                            isSelected && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                    >
                        {/* Main Row */}
                        <div 
                            className={cn(
                                "py-3 transition-colors cursor-pointer",
                                "active:bg-gray-50 dark:active:bg-gray-800/50"
                            )}
                            onClick={() => selectMode && toggleSelectReport?.(report.id)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Selection Checkbox */}
                                {selectMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelectReport?.(report.id);
                                        }}
                                        className={cn(
                                            "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "bg-blue-500 border-blue-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        )}
                                    >
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </button>
                                )}

                                {/* Expand/Collapse Button */}
                                <button
                                    onClick={(e) => toggleExpand(report.id, e)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* Report Icon */}
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center",
                                        report.status === 'resolved' 
                                            ? "bg-green-50 dark:bg-green-900/20" 
                                            : report.status === 'rejected'
                                                ? "bg-red-50 dark:bg-red-900/20"
                                                : "bg-blue-50 dark:bg-blue-900/20"
                                    )}>
                                        <FileText className={cn(
                                            "h-4 w-4",
                                            report.status === 'resolved'
                                                ? "text-green-600 dark:text-green-400"
                                                : report.status === 'rejected'
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-blue-600 dark:text-blue-400"
                                        )} />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (report.report_number) {
                                                    onCopyReportNumber(report.report_number);
                                                }
                                            }}
                                            className={cn(
                                                "font-mono text-xs font-medium",
                                                report.report_number ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                                            )}
                                        >
                                            {reportNumber}
                                        </button>
                                        {report.is_anonymous && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                Anonymous
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                                        {report.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                                        {report.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate max-w-[120px]">{report.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 flex-shrink-0" />
                                            <span>{formatDate(report.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[10px] px-1.5 py-0 h-4 border-0",
                                                statusBadge.color
                                            )}
                                        >
                                            <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                            {statusBadge.label}
                                        </Badge>
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-[10px] px-1.5 py-0 h-4 border-0",
                                                urgencyBadge.color
                                            )}
                                        >
                                            {urgencyBadge.label}
                                        </Badge>
                                        {evidenceCount > 0 && (
                                            <span className="text-[10px] text-gray-500">
                                                📎 {evidenceCount}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    {!selectMode && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(report.id);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => onViewDetails(report.id)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {report.report_number && (
                                                        <DropdownMenuItem onClick={() => onCopyReportNumber(report.report_number!)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy Report #
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => onGenerateReport(report)}>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Generate Report
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details Section */}
                        {isExpanded && !selectMode && (
                            <div className="px-3 pb-3 pl-14 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                                <div className="pt-3 space-y-2">
                                    {/* Report Number */}
                                    {report.report_number && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-gray-500 dark:text-gray-400">Report #:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                    {report.report_number}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyReportNumber(report.report_number!);
                                                }}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                    )}

                                    {/* Report Type */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {report.report_type?.name || 'N/A'}
                                        </span>
                                    </div>

                                    {/* Category */}
                                    {report.report_type?.category && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {report.report_type.category}
                                            </span>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {report.location && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {report.location}
                                            </span>
                                        </div>
                                    )}

                                    {/* Evidence Count in expanded section */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Evidence Files:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {evidenceCount} file{evidenceCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Dates */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Filed:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {formatDate(report.created_at)}
                                        </span>
                                    </div>

                                    {report.incident_date && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Incident:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(report.incident_date)}
                                                {report.incident_time && ` at ${report.incident_time}`}
                                            </span>
                                        </div>
                                    )}

                                    {report.resolved_at && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-gray-500 dark:text-gray-400">Resolved:</span>
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatDate(report.resolved_at)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {report.description && (
                                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description:</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {report.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(report.id);
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onGenerateReport(report);
                                            }}
                                        >
                                            <Printer className="h-3.5 w-3.5 mr-1" />
                                            Print
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}