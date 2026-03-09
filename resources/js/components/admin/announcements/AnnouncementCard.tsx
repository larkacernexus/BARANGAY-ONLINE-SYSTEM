import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    Megaphone, Calendar, Clock, AlertCircle, Eye, 
    Edit, Trash2, PlayCircle, PauseCircle, Copy, Bell, AlertTriangle
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
    const daysRemaining = announcement.days_remaining;
    
    return (
        <Card 
            className={`overflow-hidden transition-all hover:shadow-md ${
                isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
            } ${!announcement.is_active ? 'opacity-60' : ''} ${
                announcement.is_currently_active ? 'ring-1 ring-green-200 dark:ring-green-800' : ''
            }`}
            onClick={(e) => {
                if (isBulkMode && e.target instanceof HTMLElement && 
                    !e.target.closest('a') && 
                    !e.target.closest('button') &&
                    !e.target.closest('.dropdown-menu-content')) {
                    onSelect(announcement.id);
                }
            }}
        >
            <CardContent className="p-4">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full ${
                            announcement.is_currently_active ? 'bg-green-100' : 'bg-gray-100'
                        } flex items-center justify-center overflow-hidden flex-shrink-0`}>
                            {announcement.type === 'important' ? (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            ) : announcement.type === 'event' ? (
                                <Calendar className="h-5 w-5 text-blue-600" />
                            ) : announcement.type === 'maintenance' ? (
                                <Bell className="h-5 w-5 text-amber-600" />
                            ) : (
                                <Megaphone className="h-5 w-5 text-gray-600" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate flex items-center gap-1">
                                {truncateText(announcement.title, isMobile ? 25 : 35)}
                                {announcement.is_currently_active && (
                                    <Badge variant="default" className="text-xs h-4">
                                        Live
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {announcement.type_label}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onSelect(announcement.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                        )}
                        <ActionDropdown>
                            <ActionDropdownItem
                                icon={<Eye className="h-4 w-4" />}
                                href={route('admin.announcements.show', announcement.id)}
                            >
                                View Details
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<Edit className="h-4 w-4" />}
                                href={route('admin.announcements.edit', announcement.id)}
                            >
                                Edit
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={<Copy className="h-4 w-4" />}
                                onClick={() => navigator.clipboard.writeText(announcement.title)}
                            >
                                Copy Title
                            </ActionDropdownItem>
                            
                            <ActionDropdownItem
                                icon={announcement.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                onClick={() => onToggleStatus(announcement)}
                            >
                                {announcement.is_active ? 'Deactivate' : 'Activate'}
                            </ActionDropdownItem>
                            
                            <ActionDropdownSeparator />
                            
                            <ActionDropdownItem
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => onDelete(announcement)}
                                dangerous
                            >
                                Delete
                            </ActionDropdownItem>
                        </ActionDropdown>
                    </div>
                </div>

                {/* Card Content */}
                <div className="space-y-3">
                    {/* Description */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {truncateText(announcement.content, 80)}
                    </div>

                    {/* Type & Priority */}
                    <div className="flex items-center justify-between">
                        <Badge 
                            className={getTypeColor(announcement.type)}
                        >
                            {announcement.type_label}
                        </Badge>
                        
                        <Badge 
                            className={getPriorityColor(announcement.priority)}
                        >
                            {announcement.priority_label}
                        </Badge>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="text-gray-700">
                                {announcement.start_date 
                                    ? formatDate(announcement.start_date) 
                                    : 'Immediate'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <div className="text-gray-700">
                                {announcement.end_date 
                                    ? formatDate(announcement.end_date) 
                                    : 'No end date'}
                            </div>
                        </div>
                    </div>

                    {/* Status & Days Remaining */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Badge 
                            variant={announcement.is_active ? (announcement.is_currently_active ? "default" : "outline") : "secondary"}
                            className="flex items-center gap-1 text-xs"
                        >
                            {announcement.is_active 
                                ? (announcement.is_currently_active ? 'Active Now' : 'Scheduled')
                                : 'Inactive'}
                        </Badge>
                        
                        {daysRemaining !== null && daysRemaining >= 0 && (
                            <div className={`text-xs px-2 py-1 rounded ${
                                daysRemaining === 0 
                                    ? 'bg-red-50 text-red-700' 
                                    : daysRemaining <= 3 
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-gray-50 text-gray-700'
                            }`}>
                                {daysRemaining === 0 
                                    ? 'Ends today'
                                    : `${daysRemaining} days left`}
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <Button
                        size="sm"
                        className="w-full mt-2"
                        variant={announcement.is_active ? "outline" : "default"}
                        onClick={() => onToggleStatus(announcement)}
                    >
                        {announcement.is_active ? (
                            <>
                                <PauseCircle className="h-3 w-3 mr-1" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <PlayCircle className="h-3 w-3 mr-1" />
                                Activate
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}