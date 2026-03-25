// /components/residentui/clearances/DesktopStats.tsx
import { ModernStatsCards } from '@/components/residentui/modern-stats-cards';
import { getClearanceStatsCards } from '@/components/residentui/clearances/constants';

interface DesktopStatsProps {
    stats: any;
    formatCurrency: (amount: number) => string;
}

export const DesktopStats = ({ stats, formatCurrency }: DesktopStatsProps) => (
    <div className="hidden md:block">
        <ModernStatsCards 
            cards={getClearanceStatsCards(stats, formatCurrency)} 
            loading={false}
        />
    </div>
);