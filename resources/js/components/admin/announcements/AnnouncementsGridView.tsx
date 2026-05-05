// resources/js/components/admin/announcements/AnnouncementsGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/adminui/empty-state';
import { GridLayout } from '@/components/adminui/grid-layout';
import { useState, useMemo, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    Megaphone, Calendar, AlertCircle, Eye, 
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
    onSendNotifications?: (announcement: Announcement) => void;
    onResendNotifications?: (announcement: Announcement) => void;
    onViewNotificationStats?: (announcement: Announcement) => void;
    onDuplicate?: (announcement: Announcement) => void;
    windowWidth?: number;
}

const getStatusColor = (isActive: boolean) => {
    return isActive
        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
};

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
    onDuplicate,
    windowWidth = 1024
}: AnnouncementsGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    
    const isCompactView = isMobile;
    
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;
        if (windowWidth < 1024) return 2;
        if (windowWidth < 1800) return 3;
        return 4;
    }, [windowWidth]);

    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const handleCardClick = (announcementId: number, e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        setExpandedId(prev => prev === announcementId ? null : announcementId);
    };

    const handleCopyTitle = (title: string) => {
        navigator.clipboard.writeText(title).catch(() => {
            // Silently handle clipboard failure
        });
    };
    
    const selectedSet = useMemo(() => new Set(selectedAnnouncements), [selectedAnnouncements]);

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

    if (announcements.length === 0) {
        return emptyState;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {announcements.map(announcement => {
                const isSelected = selectedSet.has(announcement.id);
                const isExpanded = expandedId === announcement.id;
                const isActive = announcement.is_currently_active;
                const daysRemaining = announcement.end_date 
                    ? Math.ceil((new Date(announcement.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                const hasTargetAudience = !!(announcement.audience_summary && announcement.audience_summary.length > 0);
                
                const titleLength = isCompactView ? 25 : 35;
                const contentLength = isCompactView ? 60 : 100;
                
                return (
                    <Card 
                        key={announcement.id}
                        className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                            isSelected 
                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
                        } ${!isActive ? 'opacity-60' : ''} ${
                            announcement.is_currently_active ? 'ring-1 ring-green-200 dark:ring-green-800' : ''
                        } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
                        onClick={(e) => handleCardClick(announcement.id, e)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`h-10 w-10 rounded-full ${
                                        announcement.is_currently_active 
                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                            : 'bg-gray-100 dark:bg-gray-800'
                                    } flex items-center justify-center flex-shrink-0`}>
                                        {announcement.type === 'important' ? (
                                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        ) : announcement.type === 'event' ? (
                                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        ) : announcement.type === 'maintenance' ? (
                                            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        ) : (
                                            <Megaphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        )}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {announcementUtils.truncateText(announcement.title, titleLength)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            ID: #{announcement.id}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(announcement.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                router.get(route('admin.announcements.show', announcement.id));
                                            }}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                router.get(route('admin.announcements.edit', announcement.id));
                                            }}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Announcement
                                            </DropdownMenuItem>
                                            
                                            {onDuplicate && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDuplicate(announcement);
                                                }}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            {onSendNotifications && isActive && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSendNotifications(announcement);
                                                }}>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Notifications
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {onResendNotifications && isActive && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onResendNotifications(announcement);
                                                }}>
                                                    <BellRing className="h-4 w-4 mr-2" />
                                                    Resend Notifications
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {onViewNotificationStats && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewNotificationStats(announcement);
                                                }}>
                                                    <BarChart className="h-4 w-4 mr-2" />
                                                    View Stats
                                                </DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleStatus(announcement);
                                            }}>
                                                {isActive ? (
                                                    <>
                                                        <PauseCircle className="h-4 w-4 mr-2" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlayCircle className="h-4 w-4 mr-2" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(announcement.title).catch(() => {
                                                    // Silently handle clipboard failure
                                                });
                                            }}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Title
                                            </DropdownMenuItem>

                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemSelect(announcement.id);
                                                    }}>
                                                        {isSelected ? (
                                                            <>
                                                                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                                <span className="text-green-600">Deselect</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square className="h-4 w-4 mr-2" />
                                                                Select for Bulk
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(announcement);
                                                }}
                                                className="text-red-600 dark:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Announcement
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs px-2 py-0.5 ${getStatusColor(isActive)}`}
                                >
                                    {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                
                                <Badge 
                                    className={`text-xs px-2 py-0.5 ${announcementUtils.getTypeColor(announcement.type)}`}
                                >
                                    {announcement.type_label}
                                </Badge>
                                
                                <Badge 
                                    className={`text-xs px-2 py-0.5 ${getPriorityColorClass(announcement.priority)}`}
                                >
                                    {announcement.priority_label}
                                </Badge>
                                
                                {announcement.is_currently_active && (
                                    <Badge className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Live
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2 mb-2">
                                {announcement.content && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {announcementUtils.truncateText(announcement.content, contentLength)}
                                    </p>
                                )}
                                
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                        {announcement.start_date 
                                            ? announcementUtils.formatDate(announcement.start_date) 
                                            : 'Immediate'}
                                        {announcement.end_date && ` - ${announcementUtils.formatDate(announcement.end_date)}`}
                                    </span>
                                </div>
                                
                                {hasTargetAudience && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                        <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="flex items-center gap-1">
                                            {getAudienceIcon(announcement.audience_type)}
                                            {announcement.audience_summary}
                                        </span>
                                    </div>
                                )}

                                {daysRemaining !== null && daysRemaining >= 0 && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <AlertCircle className={`h-3.5 w-3.5 flex-shrink-0 ${
                                            daysRemaining === 0 
                                                ? 'text-red-500' 
                                                : daysRemaining <= 3 
                                                    ? 'text-amber-500'
                                                    : 'text-gray-500'
                                        }`} />
                                        <span className={
                                            daysRemaining === 0 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : daysRemaining <= 3 
                                                    ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-gray-600 dark:text-gray-400'
                                        }>
                                            {daysRemaining === 0 
                                                ? 'Ends today'
                                                : `${daysRemaining} days left`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!isBulkMode && (
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isExpanded ? 'Hide details' : 'Click to view details'}
                                    </div>
                                    <button
                                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={(e) => handleToggleExpand(announcement.id, e)}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                                    {announcement.content && (
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Content:</p>
                                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                {announcement.content}
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-sm">
                                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience:</p>
                                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                                            {getAudienceIcon(announcement.audience_type)}
                                            <span className="ml-1">{announcement.audience_summary}</span>
                                        </Badge>
                                        {announcement.estimated_reach && (
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                (Estimated reach: {announcement.estimated_reach} residents)
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">
                                                {announcementUtils.formatDate(announcement.created_at)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                            <span className="text-gray-700 dark:text-gray-300 ml-1">
                                                {announcementUtils.formatDate(announcement.updated_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {announcement.views_count && announcement.views_count > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">Views:</span>
                                            <span className="text-gray-900 dark:text-white">{announcement.views_count}</span>
                                        </div>
                                    )}

                                    {announcement.has_attachments && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">Attachments:</span>
                                            <span className="text-gray-900 dark:text-white">{announcement.attachments_count} file(s)</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.get(route('admin.announcements.show', announcement.id));
                                            }}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View full details
                                        </button>
                                        <button
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={(e) => handleToggleExpand(announcement.id, e)}
                                        >
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}