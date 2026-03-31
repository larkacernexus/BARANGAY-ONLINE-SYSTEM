// resources/js/components/admin/community-reports/CommunityReportsContent.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { 
    FileText, 
    List, 
    Grid3X3, 
    Plus,
    Smartphone
} from 'lucide-react';
import CommunityReportsTableView from './CommunityReportsTableView';
import CommunityReportsGridView from './CommunityReportsGridView';
import CommunityReportBulkActions from './CommunityReportBulkActions';
import { useEffect, useState, useRef } from 'react';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';

// Import types from the correct path
import type { CommunityReport, BulkOperation } from '@/types/admin/reports/community-report';

interface CommunityReportsContentProps {
    reports: CommunityReport[];
    isBulkMode: boolean;
    setIsBulkMode?: (value: boolean) => void;
    selectedReports: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onSelectAllOnPage: () => void;
    onItemSelect: (id: number) => void;
    onClearFilters: () => void;
    onDelete: (report: any) => void; // Use any to handle both old and new types
    onCopyToClipboard: (text: string, label: string) => void;
    onSort: (column: string) => void;
    isSelectAll: boolean;
    expandedReport: number | null;
    toggleReportExpansion: (id: number) => void;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    safeUrgencies: Record<string, string>;
    windowWidth: number;
    hasActiveFilters: boolean | string; // Allow both boolean and string
    isPerformingBulkAction?: boolean;
    onMarkResolved?: (report: any) => void; // Use any to handle both old and new types
    onViewDetails?: (report: CommunityReport) => void;
    onPrintReport?: (report: CommunityReport) => void;
    onBulkOperation?: (operation: string, customData?: any) => Promise<void>; // Expect string
    onCopySelectedData?: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    setShowBulkPriorityDialog?: (show: boolean) => void;
    setShowBulkAssignDialog?: (show: boolean) => void;
    selectionStats?: any;
    selectionMode?: 'page' | 'filtered' | 'all';
    onSelectAllFiltered?: () => void;
    onSelectAll?: () => void;
    onClearSelection?: () => void;
}

export default function CommunityReportsContent({
    reports,
    isBulkMode,
    setIsBulkMode,
    selectedReports,
    viewMode,
    setViewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onSelectAllOnPage,
    onItemSelect,
    onClearFilters,
    onDelete,
    onCopyToClipboard,
    onSort,
    isSelectAll,
    expandedReport,
    toggleReportExpansion,
    safeStatuses,
    safePriorities,
    safeUrgencies,
    windowWidth,
    hasActiveFilters,
    isPerformingBulkAction = false,
    onMarkResolved,
    onViewDetails = () => {},
    onPrintReport = () => {},
    onBulkOperation = async () => {},
    onCopySelectedData = () => {},
    setShowBulkDeleteDialog = () => {},
    setShowBulkStatusDialog = () => {},
    setShowBulkPriorityDialog = () => {},
    setShowBulkAssignDialog = () => {},
    selectionStats = null,
    selectionMode = 'page',
    onSelectAllFiltered = () => {},
    onSelectAll = () => {},
    onClearSelection = () => {}
}: CommunityReportsContentProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [localBulkMode, setLocalBulkMode] = useState(isBulkMode);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);
    
    // Convert hasActiveFilters to boolean
    const activeFilters = typeof hasActiveFilters === 'string' 
        ? hasActiveFilters === 'true' || hasActiveFilters === '1'
        : Boolean(hasActiveFilters);
    
    // Use the provided setIsBulkMode or fall back to local state
    const handleSetIsBulkMode = setIsBulkMode || setLocalBulkMode;
    const currentBulkMode = setIsBulkMode ? isBulkMode : localBulkMode;
    
    // Auto-detect mobile and switch to grid view
    useEffect(() => {
        const checkIsMobile = () => {
            const mobile = windowWidth < 768;
            setIsMobile(mobile);
            
            if (mobile && viewMode === 'table') {
                setViewMode('grid');
            }
        };
        
        checkIsMobile();
    }, [windowWidth, viewMode, setViewMode]);

    const handleBulkModeToggle = () => {
        const newBulkMode = !currentBulkMode;
        handleSetIsBulkMode(newBulkMode);
        
        if (!newBulkMode) {
            onClearSelection();
        }
    };

    const handleViewDetails = (report: CommunityReport) => {
        if (onViewDetails) {
            onViewDetails(report);
        }
    };

    // Wrapper for delete to handle type conversion
    const handleDelete = (report: CommunityReport) => {
        onDelete(report as any);
    };

    // Wrapper for mark resolved
    const handleMarkResolved = (report: CommunityReport) => {
        if (onMarkResolved) {
            onMarkResolved(report as any);
        }
    };

    // Close bulk actions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Calculate selection stats if not provided
    const calculatedSelectionStats = selectionStats || {
        total: selectedReports.length,
        pending: 0,
        under_review: 0,
        assigned: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
        critical: 0,
        high_priority: 0,
        medium_priority: 0,
        low_priority: 0,
        high_urgency: 0,
        anonymous: 0,
        withEvidence: 0,
        assignedCount: 0,
        safetyConcern: 0,
        environmentalImpact: 0,
        recurringIssue: 0,
        communityImpact: 0,
        totalEstimatedAffected: 0
    };

    // Mobile-optimized empty state
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-8 text-center px-4 dark:bg-gray-900">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No reports found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {activeFilters
                    ? 'Try changing your filters.'
                    : 'No community reports yet.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
                {activeFilters && (
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        size={isMobile ? "sm" : "default"}
                        className={`${isMobile ? "h-8 text-xs" : ""} dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800`}
                    >
                        Clear Filters
                    </Button>
                )}
                <Link href="/admin/community-reports/create">
                    <Button 
                        size={isMobile ? "sm" : "default"} 
                        className={`${isMobile ? "h-8 text-xs" : ""} dark:bg-blue-600 dark:hover:bg-blue-700`}
                    >
                        <Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
                        {isMobile ? "New" : "New Report"}
                    </Button>
                </Link>
            </div>
        </div>
    );

    // Check if all items on current page are selected
    const areAllOnPageSelected = reports.length > 0 && 
        selectedReports.length === reports.length &&
        reports.every(report => selectedReports.includes(report.id));

    return (
        <>
            {/* Render Bulk Actions Bar when in bulk mode with selections */}
            {currentBulkMode && selectedReports.length > 0 && (
                <CommunityReportBulkActions
                    selectedReports={selectedReports}
                    selectionMode={selectionMode}
                    selectionStats={calculatedSelectionStats}
                    isPerformingBulkAction={isPerformingBulkAction}
                    isSelectAll={isSelectAll}
                    totalItems={totalItems}
                    onClearSelection={onClearSelection}
                    onSelectAllOnPage={onSelectAllOnPage}
                    onSelectAllFiltered={onSelectAllFiltered}
                    onSelectAll={onSelectAll}
                    onBulkOperation={onBulkOperation}
                    onCopySelectedData={onCopySelectedData}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    setShowBulkStatusDialog={setShowBulkStatusDialog}
                    setShowBulkPriorityDialog={setShowBulkPriorityDialog}
                    setShowBulkAssignDialog={setShowBulkAssignDialog}
                    setIsBulkMode={handleSetIsBulkMode}
                    bulkActionRef={bulkActionRef}
                    showBulkActions={showBulkActions}
                    setShowBulkActions={setShowBulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && 
             reports.length > 0 && 
             selectedReports.length < reports.length && 
             currentBulkMode && (
                <SelectAllFloat
                    isSelectAll={areAllOnPageSelected}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedReports.length}
                    totalCount={reports.length}
                    position="bottom-right"
                />
            )}

            {/* Main Content Card */}
            <Card className="overflow-hidden border shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'pb-2 px-3' : 'pb-3 border-b dark:border-gray-800'}`}>
                    <div className="flex items-center gap-3">
                        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} dark:text-gray-100`}>
                            {isMobile ? 'Reports' : 'Community Reports'}
                            {selectedReports.length > 0 && currentBulkMode && (
                                <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                    {selectedReports.length} sel.
                                </span>
                            )}
                        </CardTitle>
                        
                        {/* View toggle */}
                        {!isMobile && (
                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200' : ''}`}
                                            onClick={() => setViewMode('table')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                        Table view
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-8 w-8 p-0 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200' : ''}`}
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                        Grid view
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        
                        {/* Mobile indicator */}
                        {isMobile && (
                            <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-300">
                                <Smartphone className="h-3 w-3 mr-1" />
                                Mobile
                            </Badge>
                        )}
                    </div>
                    
                    {/* Bulk mode toggle */}
                    <div className="flex items-center gap-2">
                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && currentBulkMode && reports.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all-grid"
                                    checked={areAllOnPageSelected}
                                    onCheckedChange={onSelectAllOnPage}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600"
                                    disabled={isPerformingBulkAction}
                                />
                                <Label htmlFor="select-all-grid" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">
                                    {areAllOnPageSelected ? 'Deselect Page' : 'Select Page'}
                                </Label>
                            </div>
                        )}
                        
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={currentBulkMode}
                                                onCheckedChange={handleBulkModeToggle}
                                                className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-600"
                                                disabled={isPerformingBulkAction}
                                            />
                                            <Label htmlFor="bulk-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">
                                                Bulk Mode
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                        <p>Toggle bulk selection mode</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ctrl+Shift+B • Ctrl+A to select</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        
                        {/* Simplified bulk toggle for mobile */}
                        {isMobile && (
                            <Button
                                variant={currentBulkMode ? "default" : "outline"}
                                size="sm"
                                onClick={handleBulkModeToggle}
                                className={`h-8 px-2 text-xs dark:border-gray-700 ${
                                    currentBulkMode 
                                        ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                                        : 'dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                                disabled={isPerformingBulkAction}
                            >
                                {currentBulkMode ? "Bulk On" : "Bulk"}
                            </Button>
                        )}
                        
                        {/* Page info */}
                        {!isMobile && totalPages > 1 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                Page {currentPage} of {totalPages}
                            </div>
                        )}
                        
                        {isMobile && totalPages > 1 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {currentPage}/{totalPages}
                            </div>
                        )}
                    </div>
                </CardHeader>
                
                <CardContent className="p-0 dark:bg-gray-900">
                    {reports.length === 0 ? (
                        <EmptyState />
                    ) : viewMode === 'table' && !isMobile ? (
                        <CommunityReportsTableView
                            reports={reports}
                            isBulkMode={currentBulkMode}
                            selectedReports={selectedReports}
                            isSelectAll={isSelectAll}
                            expandedReport={expandedReport}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            isPerformingBulkAction={isPerformingBulkAction}
                            safeStatuses={safeStatuses}
                            safePriorities={safePriorities}
                            safeUrgencies={safeUrgencies}
                            windowWidth={windowWidth}
                            onSelectAllOnPage={onSelectAllOnPage}
                            onItemSelect={onItemSelect}
                            onDelete={handleDelete}
                            onCopyToClipboard={onCopyToClipboard}
                            onSort={onSort}
                            onPageChange={onPageChange}
                            toggleReportExpansion={toggleReportExpansion}
                            onMarkResolved={handleMarkResolved}
                        />
                    ) : (
                        <>
                            <CommunityReportsGridView
                                reports={reports}
                                isBulkMode={currentBulkMode}
                                selectedReports={selectedReports}
                                onItemSelect={onItemSelect}
                                onDelete={handleDelete}
                                onViewDetails={handleViewDetails}
                                onCopyToClipboard={onCopyToClipboard}
                                onMarkResolved={handleMarkResolved}
                                safeStatuses={safeStatuses}
                                safePriorities={safePriorities}
                                safeUrgencies={safeUrgencies}
                                windowWidth={windowWidth}
                                isMobile={isMobile}
                            />
                            
                            {/* Grid Selection Summary */}
                            {viewMode === 'grid' && currentBulkMode && selectedReports.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedReports.length}
                                    totalCount={reports.length}
                                    isSelectAll={areAllOnPageSelected}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4"
                                />
                            )}
                            
                            {/* Simplified pagination for grid view */}
                            {totalPages > 1 && (
                                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 items-center justify-between ${isMobile ? 'p-3' : 'mt-4 pt-4 px-4 border-t dark:border-gray-800'}`}>
                                    <div className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs mb-2' : 'text-sm'}`}>
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size={isMobile ? "sm" : "default"}
                                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className={`${isMobile ? "h-8 px-3 text-xs" : ""} dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800`}
                                        >
                                            {isMobile ? "←" : "Previous"}
                                        </Button>
                                        
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= (isMobile ? 3 : 5)) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 2) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 1) {
                                                    pageNum = totalPages - (isMobile ? 2 : 4) + i;
                                                } else {
                                                    pageNum = currentPage - 1 + i;
                                                }
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size={isMobile ? "sm" : "default"}
                                                        onClick={() => onPageChange(pageNum)}
                                                        className={`${isMobile ? "h-8 w-8 p-0 text-xs" : "h-8 w-8 p-0"} ${
                                                            currentPage === pageNum 
                                                                ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                                                                : 'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        
                                        <Button
                                            variant="outline"
                                            size={isMobile ? "sm" : "default"}
                                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`${isMobile ? "h-8 px-3 text-xs" : ""} dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800`}
                                        >
                                            {isMobile ? "→" : "Next"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}