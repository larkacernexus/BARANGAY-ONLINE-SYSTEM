// resources/js/Pages/Admin/Officials/components/overview-tab.tsx
import React from 'react';
import { Card } from '@/components/ui/card';

// Import components
import { ResponsibilitiesCard } from './responsibilities-card';
import { AchievementsCard } from './achievements-card';
import { ContactInfoCard } from './contact-info-card';
import { ProfileSummaryCard } from './profile-summary-card';
import { TermProgressCard } from './term-progress-card';
import { QuickStatsCard } from './quick-stats-card';
import { QuickActionsCard } from './quick-actions-card';

interface Props {
    official: any;
    formatDate: (date: string, includeTime?: boolean) => string;
    getStatusColor: (status: string, isCurrent: boolean) => string;
    getStatusIcon: (status: string, isCurrent: boolean) => React.ReactNode;
}

export const OverviewTab = ({
    official,
    formatDate,
    getStatusColor,
    getStatusIcon
}: Props) => {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
                <ResponsibilitiesCard official={official} />
                <AchievementsCard official={official} />
                <ContactInfoCard official={official} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                <ProfileSummaryCard official={official} />
                <TermProgressCard official={official} formatDate={formatDate} />
                <QuickStatsCard official={official} />
                <QuickActionsCard official={official} onDelete={() => {}} />
            </div>
        </div>
    );
};