// announcement-show/components/AnnouncementHeader.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, Printer, Share2, Bookmark, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Announcement } from '@/types/portal/announcements/announcement.types';
import { formatRelativeTime, getTypeConfig, getPriorityConfig } from '@/utils/portal/announcements/announcement-utils';

interface AnnouncementHeaderProps {
    announcement: Announcement;
    isBookmarked: boolean;
    isLiked: boolean;
    isShareCopied: boolean;
    onShare: () => void;
    onBookmark: () => void;
    onLike: () => void;
    onPrint: () => void;
}

export function AnnouncementHeader({
    announcement,
    isBookmarked,
    isLiked,
    isShareCopied,
    onShare,
    onBookmark,
    onLike,
    onPrint
}: AnnouncementHeaderProps) {
    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    const TypeIcon = typeConfig.icon;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/portal/resident-announcements">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                            {announcement.title}
                        </h1>
                        <Badge className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            typeConfig.bgColor,
                            typeConfig.textColor
                        )}>
                            <TypeIcon className="h-3 w-3" />
                            {announcement.type_label}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        Posted {formatRelativeTime(announcement.created_at)}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={onLike}
                >
                    <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current text-blue-600' : ''}`} />
                    Helpful
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={onPrint}
                >
                    <Printer className="h-4 w-4" />
                    Print
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
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
                    variant={isBookmarked ? "default" : "outline"}
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={onBookmark}
                >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save'}
                </Button>
            </div>
        </div>
    );
}