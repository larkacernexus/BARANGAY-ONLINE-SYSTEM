// resources/js/components/admin/announcements/AnnouncementsContent.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
    Megaphone, 
    Download, 
    FileSpreadsheet, 
    Printer, 
    Send, 
    Archive,
    Copy,
    Edit,
    Trash2,
    Bell,
    BellRing,
    Calendar,
    AlertCircle,
    CheckSquare,
    Square,
    Eye,
    Users,
    BarChart
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
    AnnouncementStats, 
    SelectionMode, 
    SelectionStats,
    BulkOperation
} from '@/types/admin/announcements/announcement.types';

interface AnnouncementsContentProps {
    announcements: Announcement[];
    stats?: AnnouncementStats;
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
    onSort: (column: string) => void;
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
    audienceTypes?: Record<string, string>;
}

export default function AnnouncementsContent({
    announcements,
    stats,
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
    onSort,
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
    audienceTypes = {}
}: AnnouncementsContentProps) {
    
    // Bulk action items configuration
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

    // Toggle handler for bulk mode
    const handleBulkModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        if (isBulkMode) {
            onClearSelection();
        }
    };

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
            {viewMode === 'grid' && announcements.length > 0 && selectedAnnouncements.length < announcements.length && isBulkMode && (
                <SelectAllFloat
                    isSelectAll={isSelectAll}
                    onSelectAll={onSelectAllOnPage}
                    selectedCount={selectedAnnouncements.length}
                    totalCount={announcements.length}
                    position="bottom-right"
                />
            )}

            {/* Announcements List/Grid View with dark mode */}
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
                        {/* Grid view select all checkbox */}
                        {viewMode === 'grid' && isBulkMode && announcements.length > 0 && (
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
                    {/* Empty State with dark mode */}
                    {announcements.length === 0 ? (
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
                                    onSort={onSort}
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

                            {/* Grid Selection Summary with dark mode */}
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