// announcement-show/components/MobileAnnouncementHeader.tsx
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MoreVertical, ThumbsUp, Printer, Share2, Bookmark, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModernMobileHeader } from '@/components/residentui/modern-mobile-header';
import { Announcement } from '@/types/portal/announcements/announcement.types';
import { getTypeConfig, getPriorityConfig, formatRelativeTime } from '@/utils/portal/announcements/announcement-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileAnnouncementHeaderProps {
    announcement: Announcement;
    showStickyActions: boolean;
    isBookmarked: boolean;
    isLiked: boolean;
    isShareCopied: boolean;
    onBack: () => void;
    onShare: () => void;
    onBookmark: () => void;
    onLike: () => void;
    onPrint: () => void;
}

export function MobileAnnouncementHeader({
    announcement,
    showStickyActions,
    isBookmarked,
    isLiked,
    isShareCopied,
    onBack,
    onShare,
    onBookmark,
    onLike,
    onPrint
}: MobileAnnouncementHeaderProps) {
    const typeConfig = getTypeConfig(announcement.type);
    const priorityConfig = getPriorityConfig(announcement.priority);
    const TypeIcon = typeConfig.icon;
    const PriorityIcon = priorityConfig.icon;

    return (
        <>
            <ModernMobileHeader
                title={announcement.title}
                subtitle="Announcement"
                onBack={onBack}
                showSticky={showStickyActions}
                actions={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={onPrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onShare}>
                                {isShareCopied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2 text-green-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onBookmark}>
                                <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                                {isBookmarked ? 'Saved' : 'Save'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onLike}>
                                <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                                Helpful
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />

            <div className={cn(
                "sticky z-10 -mx-4 px-4 py-2 transition-all duration-200",
                showStickyActions ? "top-[73px]" : "top-[73px]"
            )}>
                <Alert className={cn(
                    "border-0 rounded-xl shadow-lg py-2",
                    typeConfig.bgColor
                )}>
                    <div className="flex items-center gap-2">
                        <TypeIcon className={cn("h-4 w-4 flex-shrink-0", typeConfig.textColor)} />
                        <div className="flex-1 min-w-0">
                            <AlertTitle className="font-semibold text-xs">
                                {announcement.type_label}
                            </AlertTitle>
                            <AlertDescription className="text-[10px] truncate">
                                Posted {formatRelativeTime(announcement.created_at)}
                            </AlertDescription>
                        </div>
                        <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium",
                            priorityConfig.bgColor,
                            priorityConfig.textColor
                        )}>
                            <PriorityIcon className="h-3 w-3" />
                            {announcement.priority_label}
                        </div>
                    </div>
                </Alert>
            </div>
        </>
    );
}