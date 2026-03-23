// announcement-show/components/AnnouncementSidebar.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModernCard } from '@/components/residentui/modern-card';
import { formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { 
    Share2, Bookmark, ThumbsUp, Printer, Check, 
    FileImage, FileText, User, Building, Phone, Mail, MapPin,
    Target, Eye, Clock, Users, Calendar, BellRing, Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Announcement } from '@/types/portal/announcements/announcement.types';
import { getTypeConfig, getPriorityConfig, formatRelativeTime } from '@/utils/portal/announcements/announcement-utils';

interface AnnouncementSidebarProps {
    announcement: Announcement;
    resident?: {
        full_name: string;
        household_number?: string;
        purok?: string;
    } | null;
    isBookmarked: boolean;
    isLiked: boolean;
    isShareCopied: boolean;
    isDownloading: boolean;
    imageAttachmentsCount: number;
    documentAttachmentsCount: number;
    onShare: () => void;
    onBookmark: () => void;
    onLike: () => void;
    onPrint: () => void;
    onViewAttachments: () => void;
}

export function AnnouncementSidebar({
    announcement,
    resident,
    isBookmarked,
    isLiked,
    isShareCopied,
    isDownloading,
    imageAttachmentsCount,
    documentAttachmentsCount,
    onShare,
    onBookmark,
    onLike,
    onPrint,
    onViewAttachments
}: AnnouncementSidebarProps) {
    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    const TypeIcon = typeConfig.icon;
    const PriorityIcon = priorityConfig.icon;
    const isExpired = announcement.end_date && new Date(announcement.end_date) < new Date();
    const isUpcoming = announcement.start_date && new Date(announcement.start_date) > new Date();

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Quick Actions */}
            <ModernCard title="Quick Actions">
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl"
                        onClick={onShare}
                    >
                        {isShareCopied ? (
                            <>
                                <Check className="h-4 w-4 text-green-600" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4" />
                                Share
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl"
                        onClick={onBookmark}
                    >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl"
                        onClick={onLike}
                    >
                        <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        Helpful
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl"
                        onClick={onPrint}
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
            </ModernCard>

            {/* Announcement Summary */}
            <ModernCard title="Announcement Summary">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Type</p>
                        <Badge className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            typeConfig.bgColor,
                            typeConfig.textColor
                        )}>
                            <TypeIcon className="h-3 w-3" />
                            {announcement.type_label}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Priority</p>
                        <Badge className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            priorityConfig.bgColor,
                            priorityConfig.textColor
                        )}>
                            <PriorityIcon className="h-3 w-3" />
                            {announcement.priority_label}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            isExpired ? 'bg-gray-100 text-gray-700' :
                                isUpcoming ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                        )}>
                            {isExpired ? (
                                <>
                                    <Clock className="h-3 w-3" />
                                    Expired
                                </>
                            ) : isUpcoming ? (
                                <>
                                    <Calendar className="h-3 w-3" />
                                    Upcoming
                                </>
                            ) : (
                                <>
                                    <BellRing className="h-3 w-3" />
                                    Active
                                </>
                            )}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Views</p>
                        <p className="font-bold">{announcement.views_count?.toLocaleString() || 0}</p>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Posted</p>
                        <p className="font-medium">{formatRelativeTime(announcement.created_at)}</p>
                    </div>

                    {announcement.start_date && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-sm text-gray-500">Starts</p>
                            <p className="font-medium">{formatDate(announcement.start_date)}</p>
                        </div>
                    )}

                    {announcement.end_date && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-sm text-gray-500">Ends</p>
                            <p className="font-medium">{formatDate(announcement.end_date)}</p>
                        </div>
                    )}
                </div>
            </ModernCard>

            {/* Resident Information */}
            {resident && (
                <ModernCard title="Your Information" icon={User} iconColor="from-blue-500 to-blue-600">
                    <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-medium mt-1">{resident.full_name}</p>
                        </div>
                        {resident.household_number && (
                            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500">Household</p>
                                <p className="font-medium mt-1">{resident.household_number}</p>
                            </div>
                        )}
                        {resident.purok && (
                            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500">Purok</p>
                                <p className="font-medium mt-1">{resident.purok}</p>
                            </div>
                        )}
                    </div>
                </ModernCard>
            )}

            {/* Attachments Summary */}
            {announcement.has_attachments && (
                <ModernCard title="Attachments" icon={Paperclip} iconColor="from-green-500 to-green-600">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center gap-2">
                                <FileImage className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">Images</span>
                            </div>
                            <Badge>{imageAttachmentsCount}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">Documents</span>
                            </div>
                            <Badge>{documentAttachmentsCount}</Badge>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="w-full mt-2"
                            onClick={onViewAttachments}
                        >
                            View All Attachments
                        </Button>
                    </div>
                </ModernCard>
            )}

            {/* Contact Information */}
            <ModernCard title="Contact Information" icon={Phone} iconColor="from-purple-500 to-purple-600">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Barangay Hall</p>
                            <p className="text-xs text-gray-500">Mon-Fri, 8AM-5PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Emergency Hotline</p>
                            <p className="text-xs text-gray-500">(02) 8888-9999</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Email</p>
                            <p className="text-xs text-gray-500">barangay@example.com</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Location</p>
                            <p className="text-xs text-gray-500">Barangay Hall, Main Street</p>
                        </div>
                    </div>
                </div>
            </ModernCard>
        </div>
    );
}