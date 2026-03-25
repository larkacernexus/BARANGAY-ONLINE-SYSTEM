// /components/residentui/forms/DesktopStats.tsx
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { getFormStatsCards } from '@/utils/portal/forms/form-utils';


interface DesktopStatsProps {
    stats: any;
    formatNumber: (num: number) => string;
}

export const DesktopStats = ({ stats, formatNumber }: DesktopStatsProps) => (
    <div className="hidden md:block">
        <ModernStatsCards 
            cards={getFormStatsCards(stats, formatNumber)} 
            loading={false}
        />
    </div>
);