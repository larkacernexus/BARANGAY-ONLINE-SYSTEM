// resources/js/components/admin/community-reports/CommunityReportsTableView.tsx

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import CommunityReportRow from './CommunityReportRow';
import CommunityReportExpandedRow from './CommunityReportExpandedRow';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

// Import types
import type { CommunityReport } from '@/types/admin/reports/community-report';

interface CommunityReportsTableViewProps {
    reports: CommunityReport[];
    isBulkMode: boolean;
    selectedReports: number[];
    isSelectAll: boolean;
    expandedReport: number | null;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    isPerformingBulkAction: boolean;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeUrgencies: Record<string, string>;
    windowWidth: number;
    onSelectAllOnPage: () => void;
    onItemSelect: (id: number) => void;
    onDelete: (report: CommunityReport) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onSort: (column: string) => void;
    onPageChange: (page: number) => void;
    toggleReportExpansion: (id: number) => void;
    onMarkResolved?: (report: CommunityReport) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export default function CommunityReportsTableView({
    reports,
    isBulkMode,
    selectedReports,
    isSelectAll,
    expandedReport,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isPerformingBulkAction,
    safeStatuses,
    safePriorities,
    safeUrgencies,
    windowWidth,
    onSelectAllOnPage,
    onItemSelect,
    onDelete,
    onCopyToClipboard,
    onSort,
    onPageChange,
    toggleReportExpansion,
    onMarkResolved,
    sortBy = 'created_at',
    sortOrder = 'desc'
}: CommunityReportsTableViewProps) {
    
    const getSortIcon = (column: string) => {
        if (sortBy !== column) {
            return <ArrowUpDown className="h-3 w-3 ml-1" />;
        }
        return sortOrder === 'asc' 
            ? <ChevronUp className="h-3 w-3 ml-1" /> 
            : <ChevronDown className="h-3 w-3 ml-1" />;
    };

    return (
        <>
            <div className="overflow-x-auto bg-white dark:bg-gray-900">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg">
                        <Table className="min-w-full">
                            <TableHeader className="bg-gray-50 dark:bg-gray-900">
                                <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/80">
                                    {isBulkMode && (
                                        <TableHead className="px-4 py-3 text-center w-12 bg-gray-50 dark:bg-gray-900">
                                            <div className="flex items-center justify-center">
                                                <Checkbox
                                                    checked={isSelectAll && reports.length > 0}
                                                    onCheckedChange={onSelectAllOnPage}
                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                                                    disabled={isPerformingBulkAction}
                                                />
                                            </div>
                                        </TableHead>
                                    )}
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => onSort('report_number')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Report ID
                                            {getSortIcon('report_number')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => onSort('title')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Title & Details
                                            {getSortIcon('title')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => onSort('priority')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Priority & Status
                                            {getSortIcon('priority')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => onSort('incident_date')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Timeline & Impact
                                            {getSortIcon('incident_date')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => onSort('assigned_to')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Reporter & Assignment
                                            {getSortIcon('assigned_to')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[100px] border-gray-200 dark:border-gray-700">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                {reports.map((report) => {
                                    const isSelected = selectedReports.includes(report.id);
                                    const isExpanded = expandedReport === report.id;
                                    
                                    return (
                                        <>
                                            <CommunityReportRow
                                                key={report.id}
                                                report={report}
                                                isBulkMode={isBulkMode}
                                                isSelected={isSelected}
                                                isExpanded={isExpanded}
                                                windowWidth={windowWidth}
                                                safeStatuses={safeStatuses}
                                                safePriorities={safePriorities}
                                                safeUrgencies={safeUrgencies}
                                                onItemSelect={onItemSelect}
                                                onDelete={onDelete}
                                                onCopyToClipboard={onCopyToClipboard}
                                                onToggleExpand={toggleReportExpansion}
                                                onMarkResolved={onMarkResolved}
                                            />
                                            
                                            {isExpanded && (
                                                <CommunityReportExpandedRow
                                                    report={report}
                                                    isBulkMode={isBulkMode}
                                                />
                                            )}
                                        </>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Pagination for Table View */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                        >
                            ← Prev
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum)}
                                        className={`h-8 w-8 p-0 ${
                                            currentPage === pageNum 
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700' 
                                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}