// AnnouncementBanner.tsx
import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { formatDate } from '@/utils/portal/dashboard/dashboard-utils'; // ✅ Import from utils, not types
import { Announcement } from '@/types/portal/dashboard/dashboard-types';

interface AnnouncementBannerProps {
    announcement: Announcement;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement }) => {
    const priorityColors: Record<string, string> = {
        high: 'from-rose-500 to-pink-500',
        medium: 'from-amber-500 to-orange-500',
        low: 'from-blue-500 to-cyan-500',
    };

    const gradient = priorityColors[announcement.priority] || priorityColors.low;

    return (
        <GlassCard gradient className={cn(`p-4 sm:p-5 bg-gradient-to-r ${gradient}`)}>
            <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base text-white truncate">{announcement.title}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white backdrop-blur-sm self-start sm:self-auto">
                            {announcement.priority === 'high' ? 'Important' : 'Update'}
                        </span>
                    </div>
                    <p className="text-white/90 text-xs sm:text-sm mb-2 break-words">{announcement.content}</p>
                    <p className="text-white/70 text-xs">{formatDate(announcement.created_at)}</p>
                </div>
            </div>
        </GlassCard>
    );
};