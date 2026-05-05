// resources/js/components/admin/announcements/AnnouncementsTableView.tsx

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    ChevronUp, 
    ChevronDown, 
    Eye, 
    Edit, 
    Trash2, 
    MoreVertical, 
    Calendar, 
    Clock, 
    Megaphone, 
    Copy, 
    PlayCircle, 
    PauseCircle, 
    CheckCircle, 
    Bell, 
    BellRing, 
    BarChart 
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { EmptyState } from '@/components/adminui/empty-state';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { Announcement } from '@/types/admin/announcements/announcement.types';
import { announcementUtils } from '@/admin-utils/announcement-utils';

interface AnnouncementsTableViewProps {
    announcements: Announcement[];
    isBulkMode: boolean;
    selectedAnnouncements: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (announcement: Announcement) => void;
    onToggleStatus: (announcement: Announcement) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    onSendNotifications?: (announcement: Announcement) => void;
    onResendNotifications?: (announcement: Announcement) => void;
    onViewNotificationStats?: (announcement: Announcement) => void;
    onDuplicate?: (announcement: Announcement) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (value: string) => void;
}

export default function AnnouncementsTableView({
    announcements,
    isBulkMode,
    selectedAnnouncements,
    isMobile,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onToggleStatus,
    onSelectAllOnPage,
    isSelectAll,
    onSendNotifications,
    onResendNotifications,
    onViewNotificationStats,
    onDuplicate,
    sortBy,
    sortOrder,
    onSortChange,
}: AnnouncementsTableViewProps) {
    
    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />;
    };

    const handleSort = (column: string) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        onSortChange(`${column}-${newOrder}`);
    };

    const getTruncationLength = (): number => {
        return isMobile ? 30 : 50;
    };

    const handleCopyTitle = (title: string) => {
        navigator.clipboard.writeText(title).catch(() => {
            // Silently handle clipboard write failure
        });
    };

    const renderTableRow = (announcement: Announcement) => {
        const truncateLength = getTruncationLength();
        const isSelected = selectedAnnouncements.includes(announcement.id);
        const daysRemaining = announcement.days_remaining;
        
        return (
            <TableRow 
                key={announcement.id} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                } ${!announcement.is_active ? 'opacity-60' : ''}`}
                onClick={(e) => {
                    if (isBulkMode && e.target instanceof HTMLElement && 
                        !e.target.closest('a') && 
                        !e.target.closest('button') &&
                        !e.target.closest('.dropdown-menu-content') &&
                        !e.target.closest('input[type="checkbox"]')) {
                        onItemSelect(announcement.id);
                    }
                }}
            >
                {isBulkMode && (
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-center">
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(announcement.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        </div>
                    </TableCell>
                )}
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Megaphone className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {announcementUtils.truncateText(announcement.title, truncateLength)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {announcementUtils.truncateText(announcement.content, truncateLength * 2)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {announcementUtils.formatDateTime(announcement.created_at)}
                            </div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <Badge className={announcementUtils.getTypeColor(announcement.type)}>
                        {announcement.type_label}
                    </Badge>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <Badge className={announcementUtils.getPriorityColor(announcement.priority)}>
                        {announcement.priority_label}
                    </Badge>
                </TableCell>
                {!isMobile && (
                    <TableCell className="px-4 py-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>
                                    {announcement.start_date 
                                        ? announcementUtils.formatDate(announcement.start_date) 
                                        : 'Immediate'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span>
                                    {announcement.end_date 
                                        ? announcementUtils.formatDate(announcement.end_date) 
                                        : 'No end date'}
                                </span>
                            </div>
                            {daysRemaining !== null && daysRemaining >= 0 && (
                                <div className="text-xs text-gray-500">
                                    {daysRemaining > 0 
                                        ? `${daysRemaining} days remaining`
                                        : 'Ends today'}
                                </div>
                            )}
                        </div>
                    </TableCell>
                )}
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                    <Badge 
                        variant={announcement.is_active ? (announcement.is_currently_active ? "default" : "outline") : "secondary"}
                        className="flex items-center gap-1"
                    >
                        {announcement.is_active 
                            ? (announcement.is_currently_active ? 'Active' : 'Scheduled')
                            : 'Inactive'}
                    </Badge>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                    <ActionDropdown>
                        <Link href={route('admin.announcements.show', announcement.id)}>
                            <ActionDropdownItem icon={<Eye className="h-4 w-4" />}>
                                View Details
                            </ActionDropdownItem>
                        </Link>

                        <Link href={route('admin.announcements.edit', announcement.id)}>
                            <ActionDropdownItem icon={<Edit className="h-4 w-4" />}>
                                Edit Announcement
                            </ActionDropdownItem>
                        </Link>

                        {onDuplicate && (
                            <ActionDropdownItem
                                icon={<Copy className="h-4 w-4" />}
                                onClick={() => onDuplicate(announcement)}
                            >
                                Duplicate
                            </ActionDropdownItem>
                        )}

                        <ActionDropdownSeparator />

                        {onSendNotifications && announcement.is_active && announcement.is_currently_active && (
                            <ActionDropdownItem
                                icon={<Bell className="h-4 w-4" />}
                                onClick={() => onSendNotifications(announcement)}
                            >
                                Send Notification
                            </ActionDropdownItem>
                        )}

                        {onResendNotifications && announcement.is_active && announcement.is_currently_active && (
                            <ActionDropdownItem
                                icon={<BellRing className="h-4 w-4" />}
                                onClick={() => onResendNotifications(announcement)}
                            >
                                Resend Notification
                            </ActionDropdownItem>
                        )}

                        {onViewNotificationStats && (
                            <ActionDropdownItem
                                icon={<BarChart className="h-4 w-4" />}
                                onClick={() => onViewNotificationStats(announcement)}
                            >
                                View Notification Stats
                            </ActionDropdownItem>
                        )}

                        <ActionDropdownSeparator />

                        <ActionDropdownItem
                            icon={<Copy className="h-4 w-4" />}
                            onClick={() => handleCopyTitle(announcement.title)}
                        >
                            Copy Title
                        </ActionDropdownItem>

                        <ActionDropdownItem
                            icon={announcement.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                            onClick={() => onToggleStatus(announcement)}
                        >
                            {announcement.is_active ? 'Deactivate' : 'Activate'}
                        </ActionDropdownItem>

                        {isBulkMode && (
                            <>
                                <ActionDropdownSeparator />
                                <ActionDropdownItem
                                    icon={isSelected ? <CheckCircle className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
                                    onClick={() => onItemSelect(announcement.id)}
                                >
                                    {isSelected ? 'Deselect for Bulk' : 'Select for Bulk'}
                                </ActionDropdownItem>
                            </>
                        )}

                        <ActionDropdownSeparator />

                        <ActionDropdownItem
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => onDelete(announcement)}
                            dangerous
                        >
                            Delete Announcement
                        </ActionDropdownItem>
                    </ActionDropdown>
                </TableCell>
            </TableRow>
        );
    };

    const calculateColumnSpan = () => {
        let baseCols = isMobile ? 4 : 5;
        if (isBulkMode) baseCols += 1;
        return baseCols + 1;
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900">
                                {isBulkMode && (
                                    <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-center w-10 sm:w-12">
                                        <div className="flex items-center justify-center">
                                            <Checkbox
                                                checked={isSelectAll && announcements.length > 0}
                                                onCheckedChange={onSelectAllOnPage}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                                            />
                                        </div>
                                    </TableHead>
                                )}
                                
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] sm:min-w-[200px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('title')}
                                >
                                    <div className="flex items-center gap-1">
                                        Title & Details
                                        {getSortIcon('title')}
                                    </div>
                                </TableHead>
                                
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('type')}
                                >
                                    <div className="flex items-center gap-1">
                                        Type
                                        {getSortIcon('type')}
                                    </div>
                                </TableHead>
                                
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('priority')}
                                >
                                    <div className="flex items-center gap-1">
                                        Priority
                                        {getSortIcon('priority')}
                                    </div>
                                </TableHead>
                                
                                {!isMobile && (
                                    <TableHead 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('start_date')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date Range
                                            {getSortIcon('start_date')}
                                        </div>
                                    </TableHead>
                                )}
                                
                                <TableHead 
                                    className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[120px] cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        {getSortIcon('status')}
                                    </div>
                                </TableHead>
                                
                                <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 min-w-[60px] sm:min-w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {announcements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={calculateColumnSpan()} className="text-center py-8">
                                        <EmptyState
                                            title="No announcements found"
                                            description={hasActiveFilters 
                                                ? 'Try changing your filters or search criteria.'
                                                : 'Get started by creating an announcement.'}
                                            icon={<Megaphone className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
                                            hasFilters={hasActiveFilters}
                                            onClearFilters={onClearFilters}
                                            onCreateNew={() => router.get('/admin/announcements/create')}
                                            createLabel="Create Announcement"
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                announcements.map(announcement => renderTableRow(announcement))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}