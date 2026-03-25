// /components/residentui/announcements/FeaturedAnnouncement.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Paperclip, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Announcement } from '@/types/portal/announcements/announcement.types';
import { getTypeConfig, getPriorityConfig } from './constants';

interface FeaturedAnnouncementProps {
    announcement: Announcement;
}

export const FeaturedAnnouncement: React.FC<FeaturedAnnouncementProps> = ({ announcement }) => {
    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    const TypeIcon = typeConfig.icon;
    const PriorityIcon = priorityConfig.icon;

    return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                        </Badge>
                        <Badge variant="outline" className={cn("gap-1", typeConfig.bgColor, typeConfig.textColor, typeConfig.borderColor)}>
                            <TypeIcon className="h-3 w-3" />
                            {announcement.type_label}
                        </Badge>
                        <Badge variant="outline" className={cn("gap-1", priorityConfig.bgColor, priorityConfig.textColor, priorityConfig.borderColor)}>
                            <PriorityIcon className="h-3 w-3" />
                            {priorityConfig.label}
                        </Badge>
                        {announcement.has_attachments && (
                            <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                                <Paperclip className="h-3 w-3" />
                                {announcement.attachments_count}
                            </Badge>
                        )}
                    </div>
                    
                    <h2 className="text-xl lg:text-2xl font-bold mb-2">{announcement.title}</h2>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                        {announcement.audience_type === 'specific_users' && (
                            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <Target className="h-3 w-3" />
                                Personalized for you
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center justify-end p-6 bg-gradient-to-l from-primary/10 to-transparent">
                    <Link href={`/portal/announcements/${announcement.id}`}>
                        <Button className="gap-2">
                            Read Now
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};