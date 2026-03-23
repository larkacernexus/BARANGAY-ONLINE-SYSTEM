// payment-show/components/PaymentTabs.tsx
import { ModernTabs } from '@/components/residentui/modern-tabs';
import { Receipt, Layers, Paperclip, MessageSquare, History } from 'lucide-react';

interface PaymentTabsProps {
    tabs: Array<{ id: string; label: string; icon: any }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    getTabCount: (tabId: string) => number;
    className?: string;
}

export function PaymentTabs({ tabs, activeTab, onTabChange, getTabCount, className }: PaymentTabsProps) {
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