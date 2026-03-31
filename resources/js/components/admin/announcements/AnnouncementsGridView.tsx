// resources/js/components/admin/announcements/AnnouncementsGridView.tsx

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/adminui/empty-state';
import { GridLayout } from '@/components/adminui/grid-layout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    Megaphone, Calendar, Clock, AlertCircle, Eye, 
    Edit, Trash2, PlayCircle, PauseCircle, Copy, Bell, AlertTriangle, BellRing, BarChart,
    ChevronDown, ChevronUp, ExternalLink, Users, Globe, Building, Home,
    MoreVertical, FileSpreadsheet, Archive, Send, CheckSquare, Square
} from 'lucide-react';
import { Announcement } from '@/types/admin/announcements/announcement.types';
import { announcementUtils } from '@/admin-utils/announcement-utils';

interface AnnouncementsGridViewProps {
    announcements: Announcement[];
    isBulkMode: boolean;
    selectedAnnouncements: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (announcement: Announcement) => void;
    onToggleStatus: (announcement: Announcement) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    // Notification-related props
    onSendNotifications?: (announcement: Announcement) => void;
    onResendNotifications?: (announcement: Announcement) => void;
    onViewNotificationStats?: (announcement: Announcement) => void;
    onDuplicate?: (announcement: Announcement) => void;
}

// Status color classes
const getStatusColor = (isActive: boolean) => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

// Priority color classes
const getPriorityColorClass = (priority: number) => {
    switch (priority) {
        case 1:
        case 2:
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 3:
        case 4:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 5:
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
};

// Audience icon helper
const getAudienceIcon = (audience?: string) => {
    switch (audience?.toLowerCase()) {
        case 'all':
        case 'everyone':
            return <Globe className="h-3 w-3" />;
        case 'officials':
            return <Building className="h-3 w-3" />;
        case 'residents':
            return <Users className="h-3 w-3" />;
        case 'purok':
            return <Home className="h-3 w-3" />;
        default:
            return <Users className="h-3 w-3" />;
    }
};

// Format date function
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function AnnouncementsGridView({
    announcements,
    isBulkMode,
    selectedAnnouncements,
    isMobile,
    onItemSelect,
    onDelete,
    onToggleStatus,
    hasActiveFilters,
    onClearFilters,
    onSendNotifications,
    onResendNotifications,
    onViewNotificationStats,
    onDuplicate
}: AnnouncementsGridViewProps) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    
    const isCompactView = isMobile;

    // Toggle card expansion
    const toggleCardExpansion = (id: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Handle card click
    const handleCardClick = (announcementId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        toggleCardExpansion(announcementId);
    };

    // Handle view details
    const handleViewDetails = (announcementId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(route('admin.announcements.show', announcementId));
    };

    // Handle edit
    const handleEdit = (announcementId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(route('admin.announcements.edit', announcementId));
    };

    // Handle duplicate
    const handleDuplicate = (announcement: Announcement, e: React.MouseEvent) => {
        e.stopPropagation();
        onDuplicate?.(announcement);
    };

    // Handle send notifications
    const handleSendNotifications = (announcement: Announcement, e: React.MouseEvent) => {
        e.stopPropagation();
        onSendNotifications?.(announcement);
    };

    // Handle resend notifications
    const handleResendNotifications = (announcement: Announcement, e: React.MouseEvent) => {
        e.stopPropagation();
        onResendNotifications?.(announcement);
    };

    // Handle view notification stats
    const handleViewNotificationStats = (announcement: Announcement, e: React.MouseEvent) => {
        e.stopPropagation();
        onViewNotificationStats?.(announcement);
    };

    // Handle export
    const handleExport = (announcementId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(route('admin.announcements.export', announcementId));
    };

    // Handle archive
    const handleArchive = (announcementId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(route('admin.announcements.archive', announcementId));
    };

    // Create empty state component
    const emptyState = (
        <EmptyState
            title="No announcements found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating an announcement.'}
            icon={<Megaphone className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => router.get('/announcements/create')}
            createLabel="Create Announcement"
        />
    );

    return (
        <GridLayout
            isEmpty={announcements.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {announcements.map(announcement => {
                const isSelected = selectedAnnouncements.includes(announcement.id);
                const isExpanded = expandedCards.has(announcement.id);
                const isActive = announcement.is_currently_active;
                const daysRemaining = announcement.end_date 
                    ? Math.ceil((new Date(announcement.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                const hasTargetAudience = !!(announcement.audience_summary && announcement.audience_summary.length > 0);
                
                // Truncation lengths based on view
                const titleLength = isCompactView ? 25 : 40;
                const contentLength = isCompactView ? 60 : 120;
                
                return (
                    <Card 
                        key={announcement.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
                        } ${!isActive ? 'opacity-60' : ''} ${
                            announcement.is_currently_active ? 'ring-1 ring-green-200 dark:ring-green-800' : ''
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(announcement.id, e)}
                    >
                        {/* Bulk selection checkbox */}
                        {isBulkMode && (
                            <div 
                                className="absolute top-2 left-2 z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemSelect(announcement.id);
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => onItemSelect(announcement.id)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-sm h-4 w-4"
                                />
                            </div>
                        )}

                        <CardContent className={`p-3 ${isCompactView && !isExpanded ? 'pb-1' : ''} bg-white dark:bg-gray-900`}>
                            {/* Header row with icon and status */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className={`p-1.5 rounded-lg ${
                                        announcement.is_currently_active ? 'bg-green-50 dark:bg-green-950/30' : 'bg-gray-50 dark:bg-gray-800'
                                    } flex-shrink-0`}>
                                        {announcement.type === 'important' ? (
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                        ) : announcement.type === 'event' ? (
                                            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        ) : announcement.type === 'maintenance' ? (
                                            <Bell className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <Megaphone className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                        )}
                                    </div>
                                    <span 
                                        className="font-medium text-xs text-blue-600 dark:text-blue-400 truncate hover:text-blue-700 dark:hover:text-blue-300 cursor-help"
                                        title={`Announcement ID: ${announcement.id}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(announcement.id.toString());
                                        }}
                                    >
                                        #{announcement.id}
                                    </span>
                                </div>
                                
                                <div className="flex gap-1 flex-shrink-0 items-center">
                                    {/* Status badge */}
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColor(isActive)}`}
                                    >
                                        {isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    
                                    {/* Three Dots Menu - Only show when not in bulk mode */}
                                    {!isBulkMode && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuItem 
                                                    onClick={(e) => handleViewDetails(announcement.id, e)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View Details</span>
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem 
                                                    onClick={(e) => handleEdit(announcement.id, e)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span>Edit Announcement</span>
                                                </DropdownMenuItem>
                                                
                                                {onDuplicate && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => handleDuplicate(announcement, e)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        <span>Duplicate</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                
                                                {/* Send Notifications */}
                                                {onSendNotifications && isActive && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => handleSendNotifications(announcement, e)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                        <span>Send Notifications</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {onResendNotifications && isActive && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => handleResendNotifications(announcement, e)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <BellRing className="h-4 w-4" />
                                                        <span>Resend Notifications</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                {onViewNotificationStats && (
                                                    <DropdownMenuItem 
                                                        onClick={(e) => handleViewNotificationStats(announcement, e)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <BarChart className="h-4 w-4" />
                                                        <span>View Stats</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <DropdownMenuSeparator />
                                                
                                                {/* Toggle Status */}
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleStatus(announcement);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    {isActive ? (
                                                        <>
                                                            <PauseCircle className="h-4 w-4" />
                                                            <span>Deactivate</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlayCircle className="h-4 w-4" />
                                                            <span>Activate</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                
                                                {/* Export */}
                                                <DropdownMenuItem 
                                                    onClick={(e) => handleExport(announcement.id, e)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <FileSpreadsheet className="h-4 w-4" />
                                                    <span>Export</span>
                                                </DropdownMenuItem>
                                                
                                                {/* Archive */}
                                                <DropdownMenuItem 
                                                    onClick={(e) => handleArchive(announcement.id, e)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Archive className="h-4 w-4" />
                                                    <span>Archive</span>
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuSeparator />
                                                
                                                {/* Delete - Destructive */}
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(announcement);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete Announcement</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                            
                            {/* Title - always visible */}
                            <h3 
                                className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                                title={announcement.title}
                                onClick={(e) => handleViewDetails(announcement.id, e)}
                            >
                                {announcementUtils.truncateText(announcement.title, titleLength)}
                            </h3>
                            
                            {/* Primary Info - always visible */}
                            <div className="space-y-1.5 mb-2">
                                {/* Type and Priority badges */}
                                <div className="flex flex-wrap gap-1">
                                    <Badge 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${announcementUtils.getTypeColor(announcement.type)}`}
                                    >
                                        {announcement.type_label}
                                    </Badge>
                                    <Badge 
                                        className={`text-[10px] px-1.5 py-0 h-4 border ${getPriorityColorClass(announcement.priority)}`}
                                    >
                                        {announcement.priority_label}
                                    </Badge>
                                    {announcement.is_currently_active && (
                                        <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Live
                                        </Badge>
                                    )}
                                </div>
                                
                                {/* Content preview */}
                                {announcement.content && (
                                    <div className="flex items-start gap-1.5">
                                        <Megaphone className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                                            {announcementUtils.truncateText(announcement.content, contentLength)}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Date Range */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {announcement.start_date 
                                                ? announcementUtils.formatDate(announcement.start_date) 
                                                : 'Immediate'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {announcement.end_date 
                                                ? announcementUtils.formatDate(announcement.end_date) 
                                                : 'No end date'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Target Audience (if available) */}
                                {hasTargetAudience && (
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <div className="flex flex-wrap gap-1">
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                {getAudienceIcon(announcement.audience_type)}
                                                <span className="ml-0.5">{announcement.audience_summary}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {/* Days remaining indicator */}
                                {daysRemaining !== null && daysRemaining >= 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <AlertCircle className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className={`text-xs ${
                                            daysRemaining === 0 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : daysRemaining <= 3 
                                                    ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {daysRemaining === 0 
                                                ? 'Ends today'
                                                : `${daysRemaining} days left`}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Expand/Collapse indicator */}
                            {!isBulkMode && !isExpanded && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Click to view details
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={(e) => toggleCardExpansion(announcement.id, e)}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-2 animate-in fade-in-50">
                                    {/* Full Content */}
                                    {announcement.content && (
                                        <div className="text-xs text-gray-700 dark:text-gray-300">
                                            <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Content:</p>
                                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                {announcement.content}
                                            </p>
                                        </div>
                                    )}

                                    {/* Audience Details */}
                                    <div className="text-xs">
                                        <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Target Audience:</p>
                                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-gray-300 dark:border-gray-600">
                                            {getAudienceIcon(announcement.audience_type)}
                                            <span className="ml-1">{announcement.audience_summary}</span>
                                        </Badge>
                                        {announcement.estimated_reach && (
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                (Estimated reach: {announcement.estimated_reach} residents)
                                            </span>
                                        )}
                                    </div>

                                    {/* Metadata */}
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{announcementUtils.formatDate(announcement.created_at)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-900 dark:text-white ml-1">{announcementUtils.formatDate(announcement.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Views count if available */}
                                    {announcement.views_count && announcement.views_count > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Eye className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">Views:</span>
                                            <span className="text-gray-900 dark:text-white">{announcement.views_count}</span>
                                        </div>
                                    )}

                                    {/* Attachments info */}
                                    {announcement.has_attachments && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Bell className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">Attachments:</span>
                                            <span className="text-gray-900 dark:text-white">{announcement.attachments_count} file(s)</span>
                                        </div>
                                    )}

                                    {/* Collapse button */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            onClick={(e) => handleViewDetails(announcement.id, e)}
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View full details
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={(e) => toggleCardExpansion(announcement.id, e)}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        {/* Footer Actions - Only show when not in bulk mode */}
                        {!isBulkMode && (
                            <CardFooter className={`px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isCompactView ? 'py-1.5' : ''}`}>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-0.5 flex-wrap">
                                        {/* Send Notification */}
                                        {onSendNotifications && isActive && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950`}
                                                        onClick={(e) => handleSendNotifications(announcement, e)}
                                                    >
                                                        <Bell className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Send Notification</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        {/* Copy Title */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(announcement.title);
                                                    }}
                                                >
                                                    <Copy className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Copy Title</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    {/* Delete button */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(announcement);
                                                }}
                                            >
                                                <Trash2 className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                );
            })}
        </GridLayout>
    );
}