// /components/residentui/announcements/AnnouncementCard.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, Paperclip, Target, Bookmark, ChevronRight, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Announcement } from '@/types/portal/announcements/announcement.types';
import { getTypeConfig, getPriorityConfig, AUDIENCE_ICONS, AUDIENCE_LABELS } from './constants';

interface AnnouncementCardProps {
    announcement: Announcement;
    isBookmarked: boolean;
    onBookmark: (id: number, e: React.MouseEvent) => void;
    formatDate: (date: string) => string;
    truncateContent: (content: string, maxLength?: number) => string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
    announcement,
    isBookmarked,
    onBookmark,
    formatDate,
    truncateContent
}) => {
    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    const TypeIcon = typeConfig.icon;
    const PriorityIcon = priorityConfig.icon;
    
    // Get audience icon as a React element, not a component
    const audienceIcon = AUDIENCE_ICONS[announcement.audience_type] || <Globe className="h-3 w-3" />;

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border shadow-sm hover:-translate-y-0.5 cursor-pointer overflow-hidden dark:bg-gray-900 dark:border-gray-700 dark:hover:shadow-gray-900/50">
            {/* Type Indicator Bar */}
            <div className={cn("h-0.5 w-full", typeConfig.bgColor)} />
            
            <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                            <TypeIcon className="h-3.5 w-3.5" />
                            <span className={cn("text-xs font-medium", typeConfig.textColor)}>
                                {announcement.type_label}
                            </span>
                        </div>
                        {announcement.has_attachments && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-blue-600 dark:text-blue-400">
                                            <Paperclip className="h-3 w-3" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{announcement.attachments_count} attachment{announcement.attachments_count !== 1 ? 's' : ''}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {announcement.audience_type !== 'all' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-blue-600 dark:text-blue-400">
                                            {audienceIcon}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{announcement.audience_summary || AUDIENCE_LABELS[announcement.audience_type]}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {announcement.is_currently_active && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-green-600 dark:text-green-400">
                                            <Eye className="h-3 w-3" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Currently active</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 gap-0.5", priorityConfig.bgColor, priorityConfig.textColor, priorityConfig.borderColor)}>
                        <PriorityIcon className="h-2.5 w-2.5" />
                        {priorityConfig.label}
                    </Badge>
                </div>
                <CardTitle className="text-base line-clamp-2 font-semibold group-hover:text-primary dark:group-hover:text-primary-400 transition-colors dark:text-gray-100">
                    {announcement.title}
                </CardTitle>
                <CardDescription className="mt-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                                {formatDate(announcement.created_at)}
                            </span>
                        </div>
                        {announcement.views_count !== undefined && (
                            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                <Eye className="h-3 w-3 mr-1" />
                                {announcement.views_count}
                            </div>
                        )}
                    </div>
                </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-3 px-4">
                <div className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm leading-relaxed">
                    {truncateContent(announcement.content, 100)}
                </div>
            </CardContent>
            
            <CardFooter className="pt-0 px-4 pb-3">
                <div className="flex items-center gap-2 w-full">
                    <Link href={`/portal/announcements/${announcement.id}`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full justify-between text-primary hover:text-primary/80 hover:bg-primary/5 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-950/30 text-sm">
                            <span className="font-medium">View Details</span>
                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                        onClick={(e) => onBookmark(announcement.id, e)}
                    >
                        <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current text-yellow-500")} />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};