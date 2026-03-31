// resources/js/components/admin/community-reports/CommunityReportBulkActions.tsx

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    FileSpreadsheet,
    Printer,
    Edit,
    Layers,
    X,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    Loader2,
    FileText,
    UserCheck,
    Zap,
    Archive,
    Trash2,
    AlertTriangle,
    CheckCircle,
    User,
    FileText as FileTextIcon,
    ShieldAlert,
    Globe,
    RefreshCw,
    Users as UsersIcon,
    User as UserIcon,
    Zap as ZapIcon,
} from 'lucide-react';
import { useState, useRef } from 'react';

// Import types
import type { BulkOperation } from '@/types/admin/reports/community-report';

interface SelectionStats {
    total: number;
    pending: number;
    under_review: number;
    assigned: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    critical: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    high_urgency: number;
    anonymous: number;
    withEvidence: number;
    assignedCount: number;
    safetyConcern: number;
    environmentalImpact: number;
    recurringIssue: number;
    communityImpact: number;
    totalEstimatedAffected: number;
}

interface CommunityReportBulkActionsProps {
    selectedReports: number[];
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats: SelectionStats;
    isPerformingBulkAction: boolean;
    isSelectAll: boolean;
    totalItems: number;
    onClearSelection: () => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onBulkOperation: (operation: BulkOperation, customData?: any) => Promise<void>;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog: (show: boolean) => void;
    setShowBulkStatusDialog: (show: boolean) => void;
    setShowBulkPriorityDialog: (show: boolean) => void;
    setShowBulkAssignDialog: (show: boolean) => void;
    setIsBulkMode: (value: boolean) => void;
    bulkActionRef: React.RefObject<HTMLDivElement | null>;
    showBulkActions: boolean;
    setShowBulkActions: (show: boolean) => void;
}

export default function CommunityReportBulkActions({
    selectedReports,
    selectionMode,
    selectionStats,
    isPerformingBulkAction,
    isSelectAll,
    totalItems,
    onClearSelection,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    setShowBulkPriorityDialog,
    setShowBulkAssignDialog,
    setIsBulkMode,
    bulkActionRef,
    showBulkActions,
    setShowBulkActions
}: CommunityReportBulkActionsProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopySelectedData();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border dark:border-gray-700">
                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-sm dark:text-gray-200">
                            {selectedReports.length} selected
                        </span>
                        <Badge variant="outline" className="ml-1 h-5 text-xs dark:border-gray-600 dark:text-gray-400">
                            {selectionMode === 'page' ? 'Page' : 
                             selectionMode === 'filtered' ? 'Filtered' : 'All'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                        >
                            <PackageX className="h-3.5 w-3.5 mr-1" />
                            Clear
                        </Button>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-7 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <ClipboardCopy className="h-3.5 w-3.5" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                Copy selected data as CSV
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBulkOperation('export')}
                                    className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                    disabled={isPerformingBulkAction}
                                >
                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                    Export
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                Export selected reports
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBulkOperation('print')}
                                    className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                    disabled={isPerformingBulkAction}
                                >
                                    <Printer className="h-3.5 w-3.5 mr-1" />
                                    Print
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                Print report details
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowBulkStatusDialog(true)}
                                    className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                    disabled={isPerformingBulkAction}
                                >
                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                    Edit
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                Bulk edit selected reports
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    
                    <div className="relative">
                        <Button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                    More
                                </>
                            )}
                        </Button>
                        
                        {showBulkActions && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md shadow-lg">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                        BULK ACTIONS
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                                        onClick={() => setShowBulkPriorityDialog(true)}
                                    >
                                        <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                                        Update Priority
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                                        onClick={() => setShowBulkAssignDialog(true)}
                                    >
                                        <UserCheck className="h-3.5 w-3.5 mr-2" />
                                        Assign To
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                                        onClick={() => onBulkOperation('generate_report')}
                                    >
                                        <FileText className="h-3.5 w-3.5 mr-2" />
                                        Generate Report
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                                        onClick={() => onBulkOperation('escalate')}
                                    >
                                        <Zap className="h-3.5 w-3.5 mr-2" />
                                        Escalate
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm dark:text-gray-300 dark:hover:bg-gray-800"
                                        onClick={() => onBulkOperation('archive')}
                                    >
                                        <Archive className="h-3.5 w-3.5 mr-2" />
                                        Archive
                                    </Button>
                                    <div className="border-t my-1 dark:border-gray-700"></div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                        onClick={() => setShowBulkDeleteDialog(true)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete Selected
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        variant="outline"
                        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={() => setIsBulkMode(false)}
                        disabled={isPerformingBulkAction}
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Exit
                    </Button>
                </div>
            </div>
            
            {/* Enhanced stats of selected items */}
            {selectedReports.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <FileTextIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                            <span className="dark:text-gray-300">
                                {selectionStats.total} reports
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                            <span className="dark:text-gray-300">
                                {selectionStats.critical} critical
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                            <span className="dark:text-gray-300">
                                {selectionStats.resolved} resolved
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                            <span className="dark:text-gray-300">
                                {selectionStats.assignedCount} assigned
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <FileTextIcon className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                            <span>Evidence: {selectionStats.withEvidence}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                            <span>Safety: {selectionStats.safetyConcern}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-green-500 dark:text-green-400" />
                            <span>Community: {selectionStats.communityImpact}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 text-yellow-500 dark:text-yellow-400" />
                            <span>Recurring: {selectionStats.recurringIssue}</span>
                        </div>
                    </div>
                    {selectionStats.totalEstimatedAffected > 0 ? (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <UsersIcon className="h-3 w-3" />
                                <span>{selectionStats.totalEstimatedAffected} estimated affected</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <ZapIcon className="h-3 w-3" />
                                <span>{selectionStats.high_urgency} high urgency</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <UserIcon className="h-3 w-3" />
                                <span>{selectionStats.anonymous} anonymous</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}