// resources/js/components/admin/privileges/PrivilegesContent.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
    Award,
    Download,
    FileSpreadsheet,
    Printer,
    Users,
    CheckCircle,
    Copy,
    Edit,
    Trash2,
    BarChart3,
    Filter,
    List,
    Grid3X3,
    Percent,
    Shield,
    IdCard,
    UserPlus
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import PrivilegesTableView from '@/components/admin/privileges/PrivilegesTableView';
import PrivilegesGridView from '@/components/admin/privileges/PrivilegesGridView';
import PrivilegesBulkActions from '@/components/admin/privileges/PrivilegesBulkActions';

interface DiscountType {
    id: number;
    name: string;
    code: string;
}

interface Privilege {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    discount_type_id: number;
    default_discount_percentage: string | number;
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
    created_at: string;
    updated_at: string;
    discount_type?: DiscountType;
    residents_count?: number;
    active_residents_count?: number;
}

interface PrivilegeFilters {
    status?: string;
    discount_type?: string;
    requires_verification?: string;
    requires_id_number?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

interface SelectionStats {
    total: number;
    active: number;
    inactive: number;
    requiresVerification: number;
    requiresIdNumber: number;
    totalAssignments: number;
    avgDiscount?: number;
}

interface PrivilegesContentProps {
    privileges: Privilege[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedPrivileges: number[];
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
    onDelete: (privilege: Privilege) => void;
    onToggleStatus: (privilege: Privilege) => void;
    onDuplicate: (privilege: Privilege) => void;
    onSort: (column: string) => void;
    onBulkOperation: (operation: string) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkStatusDialog?: (show: boolean) => void;
    filtersState: PrivilegeFilters;
    isPerformingBulkAction: boolean;
    selectionMode: 'page' | 'filtered' | 'all';
    selectionStats: SelectionStats;
    discountTypes: DiscountType[];
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
}

export default function PrivilegesContent({
    privileges,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedPrivileges,
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
    onToggleStatus,
    onDuplicate,
    onSort,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkStatusDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    discountTypes,
    can
}: PrivilegesContentProps) {
    
    // Bulk action items configuration
    const bulkActions = {
        primary: [
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export'),
                tooltip: 'Export selected privileges'
            },
            {
                label: 'Print',
                icon: <Printer className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('print'),
                tooltip: 'Print selected privileges'
            },
            {
                label: 'Report',
                icon: <BarChart3 className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('generate_report'),
                tooltip: 'Generate report for selected privileges'
            }
        ],
        secondary: [
            {
                label: 'Edit Status',
                icon: <Edit className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkStatusDialog?.(true),
                tooltip: 'Update status for selected privileges'
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
                tooltip: 'Delete selected privileges',
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
        return filtersState.sort_order === 'asc' ? '↑' : '↓';
    };

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedPrivileges.length > 0 && (
                <PrivilegesBulkActions
                    selectedPrivileges={selectedPrivileges}
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
            {viewMode === 'grid' && privileges.length > 0 && selectedPrivileges.length < privileges.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedPrivileges.length}
                    totalCount={privileges.length}
                    position="bottom-right"
                />
            )}

            {/* Privileges List/Grid View with dark mode */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Privileges List
                                {selectedPrivileges.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedPrivileges.length} selected
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
                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && privileges.length > 0 && (
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
                    {privileges.length === 0 ? (
                        <EmptyState
                            icon={<Award className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                            title="No privileges found"
                            description={hasActiveFilters 
                                ? "No privileges match your current filters. Try adjusting your search or filters."
                                : "No privileges have been created yet."}
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
                                <PrivilegesTableView
                                    privileges={privileges}
                                    isBulkMode={isBulkMode}
                                    selectedPrivileges={selectedPrivileges}
                                    isMobile={isMobile}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    onSort={onSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDuplicate={onDuplicate}
                                    selectionStats={selectionStats}
                                    getSortIcon={getSortIcon}
                                    discountTypes={discountTypes}
                                    can={can}
                                />
                            ) : (
                                // Grid View
                                <PrivilegesGridView
                                    privileges={privileges}
                                    isBulkMode={isBulkMode}
                                    selectedPrivileges={selectedPrivileges}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onDuplicate={onDuplicate}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    selectionStats={selectionStats}
                                    discountTypes={discountTypes}
                                    can={can}
                                />
                            )}

                            {/* Grid Selection Summary */}
                            {viewMode === 'grid' && isBulkMode && selectedPrivileges.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedPrivileges.length}
                                    totalCount={privileges.length}
                                    isSelectAll={isSelectAll}
                                    onSelectAll={onSelectAllOnPage}
                                    onClearSelection={onClearSelection}
                                    className="mt-4 mx-4 dark:text-gray-300"
                                />
                            )}

                            {/* Pagination */}
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