// announcement-show/tabs/RelatedTab.tsx
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ChevronUp, ChevronDown, Paperclip, Layers, Inbox } from 'lucide-react';
import { RelatedAnnouncement } from '@/types/portal/announcements/announcement.types';
import { getTypeConfig, getPriorityConfig, formatRelativeTime } from '@/utils/portal/announcements/announcement-utils';

interface RelatedTabProps {
    relatedAnnouncements: RelatedAnnouncement[];
    showAllRelated: boolean;
    onToggleShowAll: () => void;
}

export function RelatedTab({ relatedAnnouncements, showAllRelated, onToggleShowAll }: RelatedTabProps) {
    return (
        <>
            {relatedAnnouncements.length > 0 ? (
                <ModernCard
                    title="Related Announcements"
                    icon={Layers}
                    iconColor="from-purple-500 to-purple-600"
                >
                    <div className="space-y-3">
                        {(showAllRelated ? relatedAnnouncements : relatedAnnouncements.slice(0, 5)).map((related) => {
                            const relatedTypeConfig = getTypeConfig(related.type);
                            const relatedPriorityConfig = getPriorityConfig(related.priority);
                            const RelatedPriorityIcon = relatedPriorityConfig.icon;

                            return (
                                <Link
                                    key={related.id}
                                    href={`/portal/resident-announcements/${related.id}`}
                                    className="block"
                                >
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex gap-3">
                                            <div className={`h-10 w-10 rounded-lg ${relatedTypeConfig.color} flex items-center justify-center flex-shrink-0`}>
                                                <relatedTypeConfig.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <Badge className={`${relatedTypeConfig.color} text-xs px-2 py-0.5 rounded-full`}>
                                                        {related.type_label}
                                                    </Badge>
                                                    <Badge className={`${relatedPriorityConfig.color} text-xs px-2 py-0.5 rounded-full`}>
                                                        <RelatedPriorityIcon className="h-3 w-3 mr-1" />
                                                        {related.priority_label}
                                                    </Badge>
                                                    {related.has_attachments && (
                                                        <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200">
                                                            <Paperclip className="h-3 w-3 mr-1" />
                                                            {related.attachments_count}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-medium text-sm line-clamp-2">
                                                    {related.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatRelativeTime(related.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {relatedAnnouncements.length > 5 && (
                            <div className="text-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={onToggleShowAll}
                                    className="gap-2 rounded-lg"
                                    size="sm"
                                >
                                    {showAllRelated ? 'Show Less' : `Show ${relatedAnnouncements.length - 5} More`}
                                    {showAllRelated ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}
                    </div>
                </ModernCard>
            ) : (
                <ModernEmptyState
                    status="info"
                    title="No Related Announcements"
                    message="Check back later for updates"  
                    icon={Inbox}
                />
            )}
        </>
    );
}