// forms-show/components/FormTabs.tsx
import { ModernTabs } from '@/components/residentui/modern-tabs';

interface FormTabsProps {
    tabs: Array<{ id: string; label: string; icon: any }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    getTabCount: (tabId: string) => number;
}

export function FormTabs({ tabs, activeTab, onTabChange, getTabCount }: FormTabsProps) {
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