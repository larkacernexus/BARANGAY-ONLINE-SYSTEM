// components/residentui/clearances/modern-clearance-mobile-list-view.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Check, 
    Download,
    MoreHorizontal, 
    FileCheck, 
    ChevronRight,
    ChevronDown,
    Calendar,
    Hash,
    CreditCard,
    Copy,
    Eye,
    Printer,
    Flag,
    User,
    Clock,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { ClearanceRequest } from '@/types/portal/clearances/clearance.types';

interface ModernClearanceMobileListViewProps {
    clearances: ClearanceRequest[];
    selectMode?: boolean;
    selectedClearances?: number[];
    toggleSelectClearance?: (id: number) => void;
    getClearanceTypeDisplay: (type: any) => string;
    getResidentName: (residentId?: number) => string;
    formatDate: (date: string | null | undefined) => string;
    formatCurrency: (amount: number | undefined) => string;
    onCopyReference: (ref: string) => void;
    onViewDetails: (id: number) => void;
    onDownloadClearance: (clearance: ClearanceRequest) => void;
    onGenerateReport: (clearance: ClearanceRequest) => void;
    onReportIssue: (clearance: ClearanceRequest) => void;
}

// Status badge config
const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    pending: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', 
        label: 'Pending',
        icon: Clock
    },
    pending_payment: { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', 
        label: 'Pending Payment',
        icon: CreditCard
    },
    processing: { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', 
        label: 'Processing',
        icon: AlertCircle
    },
    approved: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', 
        label: 'Approved',
        icon: Check
    },
    issued: { 
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', 
        label: 'Issued',
        icon: FileCheck
    },
    rejected: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', 
        label: 'Rejected',
        icon: AlertCircle
    },
    cancelled: { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', 
        label: 'Cancelled',
        icon: AlertCircle
    },
};

// Urgency badge config
const urgencyConfig: Record<string, { color: string; label: string }> = {
    normal: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'Normal' },
    rush: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', label: 'Rush' },
    express: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', label: 'Express' },
};

export function ModernClearanceMobileListView({
    clearances,
    selectMode = false,
    selectedClearances = [],
    toggleSelectClearance,
    getClearanceTypeDisplay,
    getResidentName,
    formatDate,
    formatCurrency,
    onCopyReference,
    onViewDetails,
    onDownloadClearance,
    onGenerateReport,
    onReportIssue,
}: ModernClearanceMobileListViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(expandedId === id ? null : id);
    };

    const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!text) {
            toast.error(`No ${label} to copy`);
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
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
        return urgencyConfig[urgency || ''] || { color: 'bg-gray-100 text-gray-700', label: urgency || 'Normal' };
    };

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {clearances.map((clearance) => {
                const isSelected = selectedClearances.includes(clearance.id);
                const isExpanded = expandedId === clearance.id;
                const statusBadge = getStatusBadge(clearance.status);
                const urgencyBadge = getUrgencyBadge(clearance.urgency);
                const StatusIcon = statusBadge.icon;
                const residentName = getResidentName(clearance.resident_id);
                const feeAmount = clearance.fee_amount ?? 0;
                const referenceNumber = clearance.reference_number ?? 'N/A';

                return (
                    <div
                        key={clearance.id}
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
                            onClick={() => selectMode && toggleSelectClearance?.(clearance.id)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Selection Checkbox */}
                                {selectMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelectClearance?.(clearance.id);
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
                                    onClick={(e) => toggleExpand(clearance.id, e)}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* Clearance Icon */}
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center",
                                        clearance.status === 'issued' 
                                            ? "bg-green-50 dark:bg-green-900/20" 
                                            : clearance.status === 'approved'
                                                ? "bg-blue-50 dark:bg-blue-900/20"
                                                : "bg-gray-50 dark:bg-gray-800"
                                    )}>
                                        <FileCheck className={cn(
                                            "h-4 w-4",
                                            clearance.status === 'issued'
                                                ? "text-green-600 dark:text-green-400"
                                                : clearance.status === 'approved'
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-600 dark:text-gray-400"
                                        )} />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {getClearanceTypeDisplay(clearance.clearance_type)}
                                        </h3>
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white ml-2">
                                            {formatCurrency(feeAmount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (clearance.reference_number) {
                                                    onCopyReference(clearance.reference_number);
                                                }
                                            }}
                                            className={cn(
                                                "font-mono",
                                                clearance.reference_number ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                                            )}
                                        >
                                            {referenceNumber}
                                        </button>
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
                                        {clearance.created_at && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(clearance.created_at)}</span>
                                            </div>
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
                                                    onViewDetails(clearance.id);
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
                                                    <DropdownMenuItem onClick={() => onViewDetails(clearance.id)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDownloadClearance(clearance)}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onGenerateReport(clearance)}>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Print Report
                                                    </DropdownMenuItem>
                                                    {clearance.reference_number && (
                                                        <DropdownMenuItem onClick={() => onCopyReference(clearance.reference_number!)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy Reference
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => onReportIssue(clearance)}>
                                                        <Flag className="h-4 w-4 mr-2" />
                                                        Report Issue
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
                                    {/* Reference Number */}
                                    {clearance.reference_number && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Hash className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-gray-500 dark:text-gray-400">Reference #:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                                    {clearance.reference_number}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => handleCopy(clearance.reference_number!, 'Reference number', e)}
                                            >
                                                <Copy className="h-3 w-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                    )}

                                    {/* Clearance Type */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <FileCheck className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {getClearanceTypeDisplay(clearance.clearance_type)}
                                        </span>
                                    </div>

                                    {/* Resident */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Requested by:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {residentName}
                                        </span>
                                    </div>

                                    {/* Purpose */}
                                    {clearance.purpose && (
                                        <div className="flex items-start gap-2 text-xs">
                                            <FileCheck className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                            <span className="text-gray-500 dark:text-gray-400">Purpose:</span>
                                            <span className="text-gray-700 dark:text-gray-300 flex-1">
                                                {clearance.purpose}
                                            </span>
                                        </div>
                                    )}

                                    {/* Fee Amount */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(feeAmount)}
                                        </span>
                                    </div>

                                    {/* Dates */}
                                    {clearance.created_at && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Requested:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(clearance.created_at)}
                                            </span>
                                        </div>
                                    )}

                                    {clearance.issued_at && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-gray-500 dark:text-gray-400">Issued:</span>
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatDate(clearance.issued_at)}
                                            </span>
                                        </div>
                                    )}

                                    {clearance.valid_until && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-gray-500 dark:text-gray-400">Valid Until:</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {formatDate(clearance.valid_until)}
                                            </span>
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
                                                onViewDetails(clearance.id);
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDownloadClearance(clearance);
                                            }}
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1" />
                                            Download
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