// announcement-show/tabs/DetailsTab.tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernExpandableSection } from '@/components/residentui/modern-expandable-section';
import { formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { cn } from '@/lib/utils';
import { Calendar, Clock, BellRing, Paperclip, Target, LucideIcon } from 'lucide-react';
import { Announcement, TypeConfig, PriorityConfig } from '@/types/portal/announcements/announcement.types';
import { formatRelativeTime } from '@/utils/portal/announcements/announcement-utils';

interface DetailsTabProps {
    announcement: Announcement;
    typeConfig: TypeConfig;
    priorityConfig: PriorityConfig;
    isUpcoming: boolean;
    isExpired: boolean;
    isMobile: boolean;
    expandedSections: Record<string, boolean>;
    toggleSection: (section: string) => void;
}

export function DetailsTab({
    announcement,
    typeConfig,
    priorityConfig,
    isUpcoming,
    isExpired,
    isMobile,
    expandedSections,
    toggleSection
}: DetailsTabProps) {
    // Cast the icons to LucideIcon
    const TypeIcon = typeConfig.icon as LucideIcon;
    const PriorityIcon = priorityConfig.icon as LucideIcon;

    if (isMobile) {
        return (
            <>
                {/* Personalized Audience Badge */}
                {announcement.audience_type !== 'all' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Target className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-purple-900 mb-1">Personalized for You</h3>
                                <p className="text-sm text-purple-700">{announcement.audience_summary}</p>
                                {announcement.estimated_reach && (
                                    <p className="text-xs text-purple-600 mt-2">
                                        Target audience: {announcement.estimated_reach.toLocaleString()} residents
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <ModernExpandableSection
                    title="Announcement Details"
                    icon={
                        <div className={cn("h-6 w-6 rounded-lg bg-gradient-to-r flex items-center justify-center", typeConfig.gradient)}>
                            <TypeIcon className="h-3.5 w-3.5 text-white" />
                        </div>
                    }
                    isExpanded={expandedSections.announcementInfo}
                    onToggle={() => toggleSection('announcementInfo')}
                >
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge className={`${typeConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                <TypeIcon className="h-3.5 w-3.5" />
                                {announcement.type_label}
                            </Badge>
                            <Badge className={`${priorityConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                                <PriorityIcon className="h-3.5 w-3.5" />
                                {announcement.priority_label}
                            </Badge>
                            {announcement.has_attachments && (
                                <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border rounded-full bg-blue-50 text-blue-700 border-blue-200">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    {announcement.attachments_count}
                                </Badge>
                            )}
                            <Badge className={cn(
                                "gap-1.5 px-3 py-1.5 border rounded-full",
                                isExpired ? 'bg-gray-100 text-gray-700' :
                                    isUpcoming ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                            )}>
                                {isExpired ? (
                                    <>
                                        <Clock className="h-3.5 w-3.5" />
                                        Expired
                                    </>
                                ) : isUpcoming ? (
                                    <>
                                        <Calendar className="h-3.5 w-3.5" />
                                        Upcoming
                                    </>
                                ) : (
                                    <>
                                        <BellRing className="h-3.5 w-3.5" />
                                        Active
                                    </>
                                )}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Posted</p>
                                <p className="text-xs">{formatRelativeTime(announcement.created_at)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Views</p>
                                <p className="text-xs">{announcement.views_count?.toLocaleString() || 0}</p>
                            </div>
                        </div>

                        {announcement.author && (
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500 mb-1">Author</p>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-gray-200">
                                            {announcement.author.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-medium">{announcement.author.name}</p>
                                        {announcement.author.role && (
                                            <p className="text-[10px] text-gray-500">{announcement.author.role}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(announcement.start_date || announcement.end_date) && (
                            <div className="space-y-2">
                                {announcement.start_date && (
                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-[10px] text-gray-500">Starts</p>
                                        <p className="text-xs">{formatDate(announcement.start_date, 'MMM D, YYYY')}</p>
                                        {announcement.start_time && (
                                            <p className="text-[10px] text-gray-500">{announcement.start_time}</p>
                                        )}
                                    </div>
                                )}
                                {announcement.end_date && (
                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-[10px] text-gray-500">Ends</p>
                                        <p className="text-xs">{formatDate(announcement.end_date, 'MMM D, YYYY')}</p>
                                        {announcement.end_time && (
                                            <p className="text-[10px] text-gray-500">{announcement.end_time}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ModernExpandableSection>

                <ModernCard title="Content">
                    <div
                        className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: announcement.content }}
                    />
                </ModernCard>
            </>
        );
    }

    // Desktop version
    return (
        <>
            {/* Personalized Audience Badge */}
            {announcement.audience_type !== 'all' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Target className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-purple-900 mb-1">Personalized for You</h3>
                            <p className="text-sm text-purple-700">{announcement.audience_summary}</p>
                            {announcement.estimated_reach && (
                                <p className="text-xs text-purple-600 mt-2">
                                    Target audience: {announcement.estimated_reach.toLocaleString()} residents
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ModernCard
                title="Announcement Information"
                icon={TypeIcon}
                iconColor={typeConfig.gradient}
            >
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${typeConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                        <TypeIcon className="h-3.5 w-3.5" />
                        {announcement.type_label}
                    </Badge>
                    <Badge className={`${priorityConfig.color} gap-1.5 px-3 py-1.5 border rounded-full`}>
                        <PriorityIcon className="h-3.5 w-3.5" />
                        {announcement.priority_label}
                    </Badge>
                    {announcement.has_attachments && (
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border rounded-full bg-blue-50 text-blue-700 border-blue-200">
                            <Paperclip className="h-3.5 w-3.5" />
                            {announcement.attachments_count} attachment{announcement.attachments_count !== 1 ? 's' : ''}
                        </Badge>
                    )}
                    <Badge className={cn(
                        "gap-1.5 px-3 py-1.5 border rounded-full",
                        isExpired ? 'bg-gray-100 text-gray-700' :
                            isUpcoming ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                    )}>
                        {isExpired ? (
                            <>
                                <Clock className="h-3.5 w-3.5" />
                                Expired
                            </>
                        ) : isUpcoming ? (
                            <>
                                <Calendar className="h-3.5 w-3.5" />
                                Upcoming
                            </>
                        ) : (
                            <>
                                <BellRing className="h-3.5 w-3.5" />
                                Active
                            </>
                        )}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Posted</p>
                        <p className="font-medium mt-1">{formatRelativeTime(announcement.created_at)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="font-medium mt-1">{announcement.views_count?.toLocaleString() || 0}</p>
                    </div>
                </div>

                {announcement.author && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Author</p>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gray-200">
                                    {announcement.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{announcement.author.name}</p>
                                {announcement.author.role && (
                                    <p className="text-sm text-gray-500">{announcement.author.role}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(announcement.start_date || announcement.end_date) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {announcement.start_date && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500">Starts</p>
                                <p className="font-medium mt-1">{formatDate(announcement.start_date, 'MMM D, YYYY')}</p>
                                {announcement.start_time && (
                                    <p className="text-sm text-gray-500 mt-1">at {announcement.start_time}</p>
                                )}
                            </div>
                        )}
                        {announcement.end_date && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500">Ends</p>
                                <p className="font-medium mt-1">{formatDate(announcement.end_date, 'MMM D, YYYY')}</p>
                                {announcement.end_time && (
                                    <p className="text-sm text-gray-500 mt-1">at {announcement.end_time}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </ModernCard>

            <ModernCard title="Content">
                <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
            </ModernCard>
        </>
    );
}