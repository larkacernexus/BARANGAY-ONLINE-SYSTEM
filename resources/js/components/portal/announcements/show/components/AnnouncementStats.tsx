// announcement-show/components/AnnouncementStats.tsx
import { ModernCard } from '@/components/residentui/modern-card';
import { Eye, Clock, Users, Target } from 'lucide-react';
import { Announcement } from '@/types/portal/announcements/announcement.types';
import { formatRelativeTime } from '@/utils/portal/announcements/announcement-utils';

interface AnnouncementStatsProps {
    announcement: Announcement;
}

export function AnnouncementStats({ announcement }: AnnouncementStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ModernCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {announcement.views_count?.toLocaleString() || 0}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatRelativeTime(announcement.created_at)}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {announcement.estimated_reach?.toLocaleString() || '—'}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Reach</p>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex items-center justify-between mb-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {announcement.audience_summary.split(' ')[0]}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Target Audience</p>
            </ModernCard>
        </div>
    );
}