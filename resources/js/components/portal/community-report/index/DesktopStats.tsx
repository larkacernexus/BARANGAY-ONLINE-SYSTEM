// /components/residentui/reports/DesktopStats.tsx
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { getReportStatsCards } from '@/components/residentui/reports/constants';

interface DesktopStatsProps {
    stats: any;
}

export const DesktopStats = ({ stats }: DesktopStatsProps) => (
    <div className="hidden md:block">
        <ModernStatsCards
            cards={getReportStatsCards(stats)}
            loading={false}
        />
    </div>
);