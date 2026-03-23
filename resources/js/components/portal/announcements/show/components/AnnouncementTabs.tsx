// announcement-show/components/AnnouncementTabs.tsx
import { ModernTabs } from '@/components/residentui/modern-tabs';

interface AnnouncementTabsProps {
    tabs: Array<{ id: string; label: string; icon: any }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    getTabCount: (tabId: string) => number;
}

export function AnnouncementTabs({ tabs, activeTab, onTabChange, getTabCount }: AnnouncementTabsProps) {
    return (
        <ModernTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            getTabCount={getTabCount}
            className="mb-3"
        />
    );
}