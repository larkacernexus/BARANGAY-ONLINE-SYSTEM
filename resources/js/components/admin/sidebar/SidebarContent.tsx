import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { Zap } from 'lucide-react';
import { SidebarTab, SidebarCategory, QuickAction } from './types';
import { QuickActionItem } from './QuickActionItem';
import { CategoryItem } from './CategoryItem';
import { MoreActionsDropdown } from './MoreActionsDropdown';
import { TodayStats, PendingAlert, UrgentAlert, CollapsedStats } from './Alerts';
import { RegularMenuItem } from './RegularMenuItem';

interface SidebarContentProps {
    activeTab: SidebarTab;
    isCollapsed: boolean;
    reportStats: any;
    operationsCategories: SidebarCategory[];
    settingsCategories: SidebarCategory[];
    mainOperationsQuickActions: QuickAction[];
    remainingOperationsByCategory: Array<[string, QuickAction[]]>;
    remainingOperationsActions: QuickAction[];
    mainSettingsQuickActions: QuickAction[];
    remainingSettingsByCategory: Array<[string, QuickAction[]]>;
    remainingSettingsActions: QuickAction[];
}

export function SidebarContentComponent({
    activeTab,
    isCollapsed,
    reportStats,
    operationsCategories,
    settingsCategories,
    mainOperationsQuickActions,
    remainingOperationsByCategory,
    remainingOperationsActions,
    mainSettingsQuickActions,
    remainingSettingsByCategory,
    remainingSettingsActions,
}: SidebarContentProps) {
    
    const renderOperationsContent = () => (
        <>
            <TodayStats reportStats={reportStats} isCollapsed={isCollapsed} />
            <PendingAlert reportStats={reportStats} isCollapsed={isCollapsed} />
            <UrgentAlert reportStats={reportStats} isCollapsed={isCollapsed} />
            <CollapsedStats reportStats={reportStats} isCollapsed={isCollapsed} />

            {mainOperationsQuickActions.length > 0 && (
                <SidebarGroup className="mb-2">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 flex items-center gap-1 px-1">
                            <Zap className="h-2.5 w-2.5 text-amber-500" />
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Quick Actions
                            </span>
                        </SidebarGroupLabel>
                    )}
                    
                    <SidebarMenu className="space-y-0.5">
                        {mainOperationsQuickActions.map((action) => (
                            <QuickActionItem
                                key={`${action.title}-${action.href}`}
                                action={action}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                        
                        {!isCollapsed && remainingOperationsByCategory.length > 0 && (
                            <MoreActionsDropdown
                                itemsByCategory={remainingOperationsByCategory}
                                totalCount={remainingOperationsActions.length}
                                type="operations"
                            />
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {operationsCategories.length > 0 && (
                <SidebarGroup>
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 px-1">
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Operations
                            </span>
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu className="space-y-0.5">
                        {operationsCategories.map((category) => (
                            <CategoryItem
                                key={category.title}
                                category={category}
                                type="operations"
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
    );

    const renderSettingsContent = () => (
        <>
            {mainSettingsQuickActions.length > 0 && (
                <SidebarGroup className="mb-2">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 flex items-center gap-1 px-1">
                            <Zap className="h-2.5 w-2.5 text-purple-500" />
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Settings Quick Actions
                            </span>
                        </SidebarGroupLabel>
                    )}
                    
                    <SidebarMenu className="space-y-0.5">
                        {mainSettingsQuickActions.map((action) => (
                            <QuickActionItem
                                key={`${action.title}-${action.href}`}
                                action={action}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                        
                        {!isCollapsed && remainingSettingsByCategory.length > 0 && (
                            <MoreActionsDropdown
                                itemsByCategory={remainingSettingsByCategory}
                                totalCount={remainingSettingsActions.length}
                                type="settings"
                            />
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {settingsCategories.length > 0 && (
                <SidebarGroup>
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 px-1">
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Settings
                            </span>
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu className="space-y-0.5">
                        {settingsCategories.map((category) => {
                            // For Personal category, render each item as a direct link
                            if (category.title === 'Personal') {
                                return category.items.map((item) => (
                                    <RegularMenuItem
                                        key={item.title}
                                        item={item}
                                        isCollapsed={isCollapsed}
                                        type="settings"
                                    />
                                ));
                            }
                            
                            return (
                                <CategoryItem
                                    key={`settings-${category.title}`}
                                    category={category}
                                    type="settings"
                                    isCollapsed={isCollapsed}
                                />
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
    );

    return activeTab === 'operations' ? renderOperationsContent() : renderSettingsContent();
}