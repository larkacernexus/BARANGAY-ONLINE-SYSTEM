// resources/js/components/admin/announcements/AnnouncementsContent.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Megaphone, 
    FileSpreadsheet, 
    Send, 
    Archive,
    Copy,
    Trash2,
    Bell,
    BellRing,
    Users,
    ArrowUpDown
} from 'lucide-react';

import { ViewToggle } from '@/components/adminui/view-toggle';
import { Pagination } from '@/components/adminui/pagination';
import { EmptyState } from '@/components/adminui/empty-state';
import { SelectAllFloat } from '@/components/adminui/select-all-float';
import { GridSelectionSummary } from '@/components/adminui/grid-selection-summary';
import AnnouncementsTableView from '@/components/admin/announcements/AnnouncementsTableView';
import AnnouncementsGridView from '@/components/admin/announcements/AnnouncementsGridView';
import AnnouncementsBulkActions from './AnnouncementsBulkActions';
import { 
    Announcement, 
    AnnouncementFilters, 
    SelectionMode, 
    SelectionStats,
    BulkOperation
} from '@/types/admin/announcements/announcement.types';

interface SortOption {
    value: string;
    label: string;
}

interface AnnouncementsContentProps {
    announcements: Announcement[];
    isBulkMode: boolean;
    setIsBulkMode: (value: boolean) => void;
    isSelectAll: boolean;
    selectedAnnouncements: number[];
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
    onDelete: (announcement: Announcement) => void;
    onToggleStatus: (announcement: Announcement) => void;
    onSendNotifications?: (announcement: Announcement) => void;
    onResendNotifications?: (announcement: Announcement) => void;
    onViewNotificationStats?: (announcement: Announcement) => void;
    onDuplicate?: (announcement: Announcement) => void;
    onBulkOperation: (operation: BulkOperation, additionalData?: any) => void;
    onCopySelectedData: () => void;
    setShowBulkDeleteDialog?: (show: boolean) => void;
    setShowBulkNotifyDialog?: (show: boolean) => void;
    filtersState: AnnouncementFilters;
    isPerformingBulkAction: boolean;
    selectionMode: SelectionMode;
    selectionStats?: SelectionStats;
    types?: Record<string, string>;
    priorities?: Record<string, string>;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (value: string) => void;
    getCurrentSortValue: () => string;
    sortOptions?: readonly SortOption[];
}

const DEFAULT_SORT_OPTIONS: readonly SortOption[] = [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'created_at-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'priority-desc', label: 'Priority (High to Low)' },
    { value: 'priority-asc', label: 'Priority (Low to High)' },
    { value: 'type-asc', label: 'Type (A-Z)' },
    { value: 'type-desc', label: 'Type (Z-A)' },
    { value: 'status-asc', label: 'Status (A-Z)' },
    { value: 'status-desc', label: 'Status (Z-A)' },
    { value: 'audience_type-asc', label: 'Audience (A-Z)' },
    { value: 'audience_type-desc', label: 'Audience (Z-A)' },
] as const;

export default function AnnouncementsContent({
    announcements,
    isBulkMode,
    setIsBulkMode,
    isSelectAll,
    selectedAnnouncements,
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
    onSendNotifications,
    onResendNotifications,
    onViewNotificationStats,
    onDuplicate,
    onBulkOperation,
    onCopySelectedData,
    setShowBulkDeleteDialog,
    setShowBulkNotifyDialog,
    filtersState,
    isPerformingBulkAction,
    selectionMode,
    selectionStats,
    types = {},
    priorities = {},
    sortBy,
    sortOrder,
    onSortChange,
    getCurrentSortValue,
    sortOptions = DEFAULT_SORT_OPTIONS,
}: AnnouncementsContentProps) {
    
    const bulkActions = {
        primary: [
            {
                label: 'Send Notifications',
                icon: <BellRing className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkNotifyDialog?.(true),
                tooltip: 'Send notifications to target audience',
                variant: 'default' as const
            },
            {
                label: 'Export',
                icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('export' as BulkOperation),
                tooltip: 'Export selected announcements'
            },
            {
                label: 'Publish',
                icon: <Send className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('publish' as BulkOperation),
                tooltip: 'Publish selected announcements'
            }
        ],
        secondary: [
            {
                label: 'Activate',
                icon: <Bell className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('activate' as BulkOperation),
                tooltip: 'Activate selected announcements'
            },
            {
                label: 'Deactivate',
                icon: <Bell className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('deactivate' as BulkOperation),
                tooltip: 'Deactivate selected announcements'
            },
            {
                label: 'Archive',
                icon: <Archive className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => onBulkOperation('archive' as BulkOperation),
                tooltip: 'Archive selected announcements'
            },
            {
                label: 'Change Audience',
                icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
                onClick: () => setShowBulkNotifyDialog?.(true),
                tooltip: 'Change audience for selected announcements'
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
                tooltip: 'Delete selected announcements',
                variant: 'destructive' as const
            }
        ]
    };

    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

    const hasAnnouncements = announcements.length > 0;

    return (
        <>
            {/* Enhanced Bulk Actions Bar */}
            {isBulkMode && selectedAnnouncements.length > 0 && (
                <AnnouncementsBulkActions
                    selectedAnnouncements={selectedAnnouncements}
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
                    setShowBulkNotifyDialog={setShowBulkNotifyDialog}
                    bulkActions={bulkActions}
                />
            )}

            {/* Floating Select All for Grid View */}
            {viewMode === 'grid' && hasAnnouncements && selectedAnnouncements.length < announcements.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedAnnouncements.length}
                    totalCount={announcements.length}
                    position="bottom-right"
                />
            )}

            {/* Announcements List/Grid View */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold dark:text-gray-100">
                                Announcements List
                                {selectedAnnouncements.length > 0 && isBulkMode && (
                                    <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        {selectedAnnouncements.length} selected
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
                        {/* Sort Dropdown */}
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
                                        {sortOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && hasAnnouncements && (
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
                                        <p>Toggle bulk selection mode (Ctrl+Shift+B)</p>
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
                    {/* Empty State */}
                    {!hasAnnouncements ? (
                        <div className="py-12 sm:py-16 dark:bg-gray-900">
                            <EmptyState
                                icon={<Megaphone className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
                                title="No announcements found"
                                description={hasActiveFilters 
                                    ? "No announcements match your current filters. Try adjusting your search or filters."
                                    : "No announcements have been created yet."}
                                action={hasActiveFilters ? {
                                    label: "Clear Filters",
                                    onClick: onClearFilters
                                } : undefined}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Table View */}
                            {viewMode === 'table' ? (
                                <AnnouncementsTableView
                                    announcements={announcements}
                                    isBulkMode={isBulkMode}
                                    selectedAnnouncements={selectedAnnouncements}
                                    isMobile={isMobile}
                                    filtersState={filtersState}
                                    onItemSelect={onItemSelect}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onSendNotifications={onSendNotifications}
                                    onResendNotifications={onResendNotifications}
                                    onViewNotificationStats={onViewNotificationStats}
                                    onDuplicate={onDuplicate}
                                    onSelectAllOnPage={onSelectAllOnPage}
                                    isSelectAll={isSelectAll}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSortChange={onSortChange}
                                    getCurrentSortValue={getCurrentSortValue}
                                />
                            ) : (
                                // Grid View
                                <AnnouncementsGridView
                                    announcements={announcements}
                                    isBulkMode={isBulkMode}
                                    selectedAnnouncements={selectedAnnouncements}
                                    isMobile={isMobile}
                                    onItemSelect={onItemSelect}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    onSendNotifications={onSendNotifications}
                                    onResendNotifications={onResendNotifications}
                                    onViewNotificationStats={onViewNotificationStats}
                                    onDuplicate={onDuplicate}
                                    hasActiveFilters={hasActiveFilters}
                                    onClearFilters={onClearFilters}
                                />
                            )}

                            {/* Grid Selection Summary */}
                            {viewMode === 'grid' && isBulkMode && selectedAnnouncements.length > 0 && (
                                <GridSelectionSummary
                                    selectedCount={selectedAnnouncements.length}
                                    totalCount={announcements.length}
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