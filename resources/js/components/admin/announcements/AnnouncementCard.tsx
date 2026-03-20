import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { 
    Megaphone, Calendar, Clock, AlertCircle, Eye, 
    Edit, Trash2, PlayCircle, PauseCircle, Copy, Bell, AlertTriangle,
    ChevronDown, ChevronUp, ExternalLink, User, Users, MapPin, Globe, Building, Home
} from 'lucide-react';
import { Announcement } from '@/types';

interface AnnouncementCardProps {
    announcement: Announcement;
    isSelected: boolean;
    isBulkMode: boolean;
    isMobile: boolean;
    onSelect: (id: number) => void;
    onDelete: (announcement: Announcement) => void;
    onToggleStatus: (announcement: Announcement) => void;
    truncateText: (text: string, maxLength: number) => string;
    formatDate: (dateString: string | null) => string;
    getTypeColor: (type: string) => string;
    getPriorityColor: (priority: number) => string;
}

// Status color classes matching community reports pattern
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

export function AnnouncementCard({
    announcement,
    isSelected,
    isBulkMode,
    isMobile,
    onSelect,
    onDelete,
    onToggleStatus,
    truncateText,
    formatDate,
    getTypeColor,
    getPriorityColor
}: AnnouncementCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const isCompactView = isMobile;
    const isActive = announcement.is_active;
    const daysRemaining = announcement.days_remaining;
    const hasTargetAudience = announcement.target_audience && announcement.target_audience.length > 0;
    
    // Truncation lengths based on view
    const titleLength = isCompactView ? 25 : 40;
    const contentLength = isCompactView ? 60 : 120;

    // Handle card click
    const handleCardClick = (e: React.MouseEvent) => {
        if (isBulkMode) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // Handle view details
    const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = route('admin.announcements.show', announcement.id);
    };

    // Handle edit
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = route('admin.announcements.edit', announcement.id);
    };

    return (
        <Card 
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                isSelected 
                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400 dark:shadow-blue-400/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50'
            } ${!isActive ? 'opacity-60' : ''} ${
                announcement.is_currently_active ? 'ring-1 ring-green-200 dark:ring-green-800' : ''
            } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
            onClick={handleCardClick}
        >
            {/* Bulk selection checkbox */}
            {isBulkMode && (
                <div 
                    className="absolute top-2 left-2 z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(announcement.id);
                    }}
                >
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(announcement.id)}
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
                    
                    {/* Status badge */}
                    <div className="flex gap-1 flex-shrink-0">
                        <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 h-4 border ${getStatusColor(isActive)}`}
                        >
                            {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </div>
                
                {/* Title - always visible */}
                <h3 
                    className="font-semibold text-sm mb-1.5 line-clamp-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                    title={announcement.title}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(e);
                    }}
                >
                    {truncateText(announcement.title, titleLength)}
                </h3>
                
                {/* Primary Info - always visible */}
                <div className="space-y-1.5 mb-2">
                    {/* Type and Priority badges */}
                    <div className="flex flex-wrap gap-1">
                        <Badge 
                            className={`text-[10px] px-1.5 py-0 h-4 border ${getTypeColor(announcement.type)}`}
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
                                {truncateText(announcement.content, contentLength)}
                            </p>
                        </div>
                    )}
                    
                    {/* Date Range */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                                {announcement.start_date 
                                    ? formatDate(announcement.start_date) 
                                    : 'Immediate'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                                {announcement.end_date 
                                    ? formatDate(announcement.end_date) 
                                    : 'No end date'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Target Audience (if available) */}
                    {hasTargetAudience && (
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <div className="flex flex-wrap gap-1">
                                {Array.isArray(announcement.target_audience) 
                                    ? announcement.target_audience.slice(0, 2).map((audience, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            {getAudienceIcon(audience)}
                                            <span className="ml-0.5">{audience}</span>
                                        </Badge>
                                    ))
                                    : (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            {getAudienceIcon(announcement.target_audience as string)}
                                            <span className="ml-0.5">{announcement.target_audience}</span>
                                        </Badge>
                                    )
                                }
                                {Array.isArray(announcement.target_audience) && announcement.target_audience.length > 2 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        +{announcement.target_audience.length - 2}
                                    </Badge>
                                )}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
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

                        {/* Location */}
                        {announcement.location && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                <span className="text-gray-900 dark:text-white">{announcement.location}</span>
                            </div>
                        )}

                        {/* Created by */}
                        {announcement.created_by && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <User className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">Created by:</span>
                                <span className="text-gray-900 dark:text-white">
                                    {typeof announcement.created_by === 'object' 
                                        ? announcement.created_by.name 
                                        : announcement.created_by}
                                </span>
                            </div>
                        )}

                        {/* Full Target Audience */}
                        {hasTargetAudience && (
                            <div className="text-xs">
                                <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">Target Audience:</p>
                                <div className="flex flex-wrap gap-1">
                                    {Array.isArray(announcement.target_audience) 
                                        ? announcement.target_audience.map((audience, idx) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 border-gray-300 dark:border-gray-600">
                                                {getAudienceIcon(audience)}
                                                <span className="ml-1">{audience}</span>
                                            </Badge>
                                        ))
                                        : (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-gray-300 dark:border-gray-600">
                                                {getAudienceIcon(announcement.target_audience as string)}
                                                <span className="ml-1">{announcement.target_audience}</span>
                                            </Badge>
                                        )
                                    }
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                <span className="text-gray-900 dark:text-white ml-1">{formatDate(announcement.created_at)}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                <span className="text-gray-900 dark:text-white ml-1">{formatDate(announcement.updated_at)}</span>
                            </div>
                        </div>

                        {/* Views count if available */}
                        {announcement.views_count > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <Eye className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Views:</span>
                                <span className="text-gray-900 dark:text-white">{announcement.views_count}</span>
                            </div>
                        )}

                        {/* Collapse button */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="link"
                                size="sm"
                                className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                onClick={handleViewDetails}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View full details
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(false);
                                }}
                            >
                                <ChevronUp className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Footer Actions */}
            <CardFooter className={`px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isCompactView ? 'py-1.5' : ''}`}>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-0.5">
                        {/* View Details */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                    onClick={handleViewDetails}
                                >
                                    <Eye className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">View Details</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700`}
                                    onClick={handleEdit}
                                >
                                    <Edit className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">Edit</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Toggle Status */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${isCompactView ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'} ${
                                        isActive 
                                            ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950' 
                                            : 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleStatus(announcement);
                                    }}
                                >
                                    {isActive ? (
                                        <PauseCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                    ) : (
                                        <PlayCircle className={`${isCompactView ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                                <p className="text-xs">{isActive ? 'Deactivate' : 'Activate'}</p>
                            </TooltipContent>
                        </Tooltip>

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
                            <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
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
                        <TooltipContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                            <p className="text-xs">Delete</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </CardFooter>
        </Card>
    );
}