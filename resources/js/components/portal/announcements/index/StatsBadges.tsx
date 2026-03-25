// /components/residentui/announcements/StatsBadges.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, Eye, Paperclip } from 'lucide-react';

interface StatsBadgesProps {
    stats: {
        personalized: number;
        unread: number;
        with_attachments: number;
    };
}

export const StatsBadges: React.FC<StatsBadgesProps> = ({ stats }) => {
    return (
        <div className="hidden sm:flex items-center gap-2">
            {stats.personalized > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800">
                                <Target className="h-3 w-3 mr-1" />
                                {stats.personalized} For You
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Announcements personalized for you</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
            {stats.unread > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                                <Eye className="h-3 w-3 mr-1" />
                                {stats.unread} Unread
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Announcements you haven't read yet</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
            {stats.with_attachments > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {stats.with_attachments} With Files
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Announcements with attachments</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};