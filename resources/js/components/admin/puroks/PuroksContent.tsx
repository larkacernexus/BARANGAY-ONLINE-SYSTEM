import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    MapPin, 
    Download, 
    FileSpreadsheet, 
    Printer, 
    Users2,
    Archive,
    Copy,
    Edit,
    Trash2,
    Home,
    Users,
    Calendar,
    AlertCircle,
    CheckSquare,
    Square,
    Share2,
    BarChart3,
    Filter,
    Hash,
    List,
    Grid3X3,
    MoreVertical,
    ExternalLink,
    Phone,
    Shield,
    ChevronUp,
    ChevronDown,
    ArrowUpDown
} from 'lucide-react';

import { Link } from '@inertiajs/react';
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import PuroksTableView from '@/components/admin/puroks/PuroksTableView';
import PuroksGridView from '@/components/admin/puroks/PuroksGridView';
import PuroksBulkActions from '@/components/admin/puroks/PuroksBulkActions';
import { Purok, PurokFilters, BulkOperation } from '@/types/admin/puroks/purok';
import { purokUtils } from '@/admin-utils/purok-utils';

interface PuroksContentProps {
    puroks: Purok[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedPuroks: number[];
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    isMobile: boolean;
    hasActiveFilters: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onSelectAllOnPage: () => void;
    onSelectAllFiltered: () => void;
    onSelectAll: () => void;
    onItemSelect: (id: number) => void;
    onClearFilters: () => void;
    onClearSelection: () => void;
    onDelete: (purok: Purok) => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: BulkOperation) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    filtersState: PurokFilters;
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats?: any;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (value: string) => void;
    getCurrentSortValue?: () => string;
}

export default function PuroksContent({
    puroks,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedPuroks,
    viewMode,
    setViewMode,
    isMobile,
    hasActiveFilters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onSelectAllOnPage,
    onSelectAllFiltered,
    onSelectAll,
    onItemSelect,
    onClearFilters,
    onClearSelection,
    onDelete,
    onSort,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats = {},
    sortBy = 'name',
    sortOrder = 'asc',
    onSortChange = () => {},
    getCurrentSortValue = () => 'name-asc'
}: PuroksContentProps) {
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected puroks'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print selected puroks'
            },
            {
                label: 'Report',
                icon: <BarChart3 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_report'),
                tooltip: 'Generate report for selected puroks'
            }
        ],
        secondary: [
            {
                label: 'Message Leaders',
                icon: <Share2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('send_message'),
                tooltip: 'Send message to purok leaders'
            },
            {
                label: 'View Residents',
                icon: <Users2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => {
                    const idsParam = selectedPuroks.join(',');
                    window.open(`/residents?purok_ids=${idsParam}`, '_blank');
                },
                tooltip: 'View all residents in selected puroks'
            },
            {
                label: 'Edit Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkStatusDialog?.(true),
                tooltip: 'Update status for selected puroks'
            },
            {
                label: 'Copy Data',
                icon: <Copy className="h-3.5 w-3.5 mr-1.5" />,
                onClick: onCopySelectedData,
                tooltip: 'Copy selected data to clipboard'
            }
        ],
        destructive: [
            {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkDeleteDialog?.(true),
                tooltip: 'Delete selected puroks',
                variant: 'destructive' as const
            }
        ]
    };

    // Toggle handler for bulk mode
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    const getSortIcon = (column: string) => {
        if (filtersState.sort_by !== column) return null;
        return filtersState.sort_order === 'asc' 
            ? <ChevronUp className="h-4 w-4 ml-1" /> 
            : <ChevronDown className="h-4 w-4 ml-1" />;
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedPuroks.length > 0 && (
                <PuroksBulkActions
                    selectedPuroks={selectedPuroks}
                    selectionMode={selectionMode}
                    selectionStats={selectionStats}
                    isPerformingBulkAction={isPerformingBulkAction}
                    isSelectAll={isSelectAll}
                    isMobile={isMobile}
                    totalItems={totalItems}
                    onClearSelection={onClearSelection}
                    onSelectAllOnPage={onSelectAllOnPage}
                    onSelectAllFiltered={onSelectAllFiltered}
                    onSelectAll={onSelectAll}
                    onBulkOperation={onBulkOperation}
                    onCopySelectedData={onCopySelectedData}
                    setShowBulkDeleteDialog={setShowBulkDeleteDialog}
                    bulkActions={bulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && puroks.length > 0 && selectedPuroks.length < puroks.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedPuroks.length}
                    totalCount={puroks.length}
                    position="bottom-right"
                />
            )}

            {/* Puroks List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Purok List
                                {selectedPuroks.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedPuroks.length} selected
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <ViewToggle
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            isMobile={isMobile}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Sort By Dropdown */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <Select
                                    value={getCurrentSortValue()}
                                    onValueChange={onSortChange}
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-xs">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                        <SelectItem value="total_households-asc">Households (Low to High)</SelectItem>
                                        <SelectItem value="total_households-desc">Households (High to Low)</SelectItem>
                                        <SelectItem value="total_residents-asc">Residents (Low to High)</SelectItem>
                                        <SelectItem value="total_residents-desc">Residents (High to Low)</SelectItem>
                                        <SelectItem value="leader_name-asc">Leader (A to Z)</SelectItem>
                                        <SelectItem value="leader_name-desc">Leader (Z to A)</SelectItem>
                                        <SelectItem value="status-asc">Status (Inactive to Active)</SelectItem>
                                        <SelectItem value="status-desc">Status (Active to Inactive)</SelectItem>
                                        <SelectItem value="created_at-asc">Created (Oldest first)</SelectItem>
                                        <SelectItem value="created_at-desc">Created (Newest first)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && puroks.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all-grid"
                                    checked={isSelectAll}
                                    onCheckedChange={onSelectAllOnPage}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                                />
                                <Label htmlFor="select-all-grid" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">
                                    {isSelectAll ? 'Deselect Page' : 'Select Page'}
                                </Label>
                            </div>
                        )}
                        
                        {/* Bulk Mode Toggle */}
                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="bulk-mode"
                                                checked={isBulkMode}
                                                onCheckedChange={handleBulkModeToggle}
                                                className="data-[state=checked]:bg-blue-600 h-5 w-9 dark:data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor="bulk-mode" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap dark:text-gray-300">
                                                Bulk Mode
                                            </Label>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
                                        <p>Toggle bulk selection mode</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        
                        {/* Page Info */}
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 dark:bg-gray-900">
                    {/* Empty State with dark mode */}
                    {puroks.length === 0 ? (
                        <EmptyState
                            icon={<MapPin className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No puroks found"
                            description={hasActiveFilters 
                                ? "No puroks match your current filters. Try adjusting your search or filters."
                                : "No puroks have been created yet."}
                            action={hasActiveFilters ? {
                                label: "Clear Filters",
                                onClick: onClearFilters
                            } : undefined}
                            className="py-12 sm:py-16 dark:bg-gray-900"
                        />
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <PuroksTableView
                                    puroks={puroks}
                                    isBulkMode={isBulkMode}
                                    selectedPuroks={selectedPuroks}
                                    isMobile={isMobile}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    selectionStats={selectionStats}
                                    getSortIcon={getSortIcon}
                                />
                            ) : (
                                // Grid View
                                <PuroksGridView
                                    puroks={puroks}
                                    isBulkMode={isBulkMode}
                                    selectedPuroks={selectedPuroks}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onDelete={onDelete}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    selectionStats={selectionStats}
                                    onCopyToClipboard={onCopySelectedData}
                                />
                            )}

                            {/* Grid Selection Summary with dark mode */}
                            {viewMode === 'grid' && isBulkMode && selectedPuroks.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedPuroks.length}
                                    totalCount={puroks.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                />
                            )}

                            {/* Pagination with dark mode */}
                            {totalPages > 1 && (
                                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={totalItems}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={onPageChange}
                                        showCount={true}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}