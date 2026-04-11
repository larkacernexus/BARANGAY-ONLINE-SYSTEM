import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import { SidebarHeaderComponent } from './admin/sidebar/SidebarHeader';
import { SidebarFooterComponent } from './admin/sidebar/SidebarFooter';
import { SidebarContentComponent } from './admin/sidebar/SidebarContent';
import { TabSwitcher } from './admin/sidebar/TabSwitcher';
import { SidebarTab } from './admin/sidebar/types';
import { useSidebarData } from './admin/sidebar/useSidebarData';

export function AppSidebar({ className }: { className?: string }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const { url: currentUrl, props } = usePage() as any;
    const [activeTab, setActiveTab] = useState<SidebarTab>('operations');

    const reportStats = props?.reportStats || {
        total: 0,
        pending: 0,
        community_reports: 0,
        blotters: 0,
        today: 0,
        high_priority: 0,
        pending_clearances: 0,
    };

    const {
        operationsCategories,
        settingsCategories,
        mainOperationsQuickActions,
        remainingOperationsByCategory,
        remainingOperationsActions,
        mainSettingsQuickActions,
        remainingSettingsByCategory,
        remainingSettingsActions,
        hasAnyAccess,
    } = useSidebarData();

    // Set initial tab based on URL
    useEffect(() => {
        const url = currentUrl.split('?')[0];
        const settingsPaths = [
            '/admin/settings', '/admin/users', '/admin/roles', '/admin/permissions',
            '/admin/role-permissions', '/admin/reports/audit-logs', '/admin/reports/activity-logs',
            '/admin/reports/login-logs', '/admin/security', '/admin/backup', '/admin/puroks',
            '/admin/positions', '/admin/committees', '/admin/officials', '/admin/clearance-types',
            '/admin/fee-types', '/admin/report-types', '/admin/document-types',
        ];

        if (settingsPaths.some((path) => url.startsWith(path))) {
            setActiveTab('settings');
        }
    }, [currentUrl]);

    if (!hasAnyAccess) return null;

    return (
        <TooltipProvider delayDuration={300}>
            <Sidebar
                collapsible="icon"
                variant="inset"
                className={cn('border-r border-gray-200 dark:border-gray-800', className)}
            >
                <SidebarHeader>
                    <SidebarHeaderComponent isCollapsed={isCollapsed} />
                </SidebarHeader>

                <SidebarContent className="overflow-y-auto p-3">
                    <TabSwitcher
                        activeTab={activeTab}
                        handleTabChange={setActiveTab}
                        isCollapsed={isCollapsed}
                    />

                    <SidebarContentComponent
                        activeTab={activeTab}
                        isCollapsed={isCollapsed}
                        reportStats={reportStats}
                        operationsCategories={operationsCategories}
                        settingsCategories={settingsCategories}
                        mainOperationsQuickActions={mainOperationsQuickActions}
                        remainingOperationsByCategory={remainingOperationsByCategory}
                        remainingOperationsActions={remainingOperationsActions}
                        mainSettingsQuickActions={mainSettingsQuickActions}
                        remainingSettingsByCategory={remainingSettingsByCategory}
                        remainingSettingsActions={remainingSettingsActions}
                    />
                </SidebarContent>

                <SidebarFooter>
                    <SidebarFooterComponent isCollapsed={isCollapsed} activeTab={activeTab} />
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}