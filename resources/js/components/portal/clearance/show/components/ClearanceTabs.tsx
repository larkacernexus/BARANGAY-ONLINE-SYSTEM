// clearance-show/components/ClearanceTabs.tsx
import { ModernTabs } from '@/components/residentui/modern-tabs';

interface ClearanceTabsProps {
    tabs: Array<{ id: string; label: string; icon: any }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    getTabCount: (tabId: string) => number;
    className?: string;
}

export function ClearanceTabs({ tabs, activeTab, onTabChange, getTabCount, className }: ClearanceTabsProps) {
    return (
        <ModernTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            getTabCount={getTabCount}
            className={className}
        />
    );
}