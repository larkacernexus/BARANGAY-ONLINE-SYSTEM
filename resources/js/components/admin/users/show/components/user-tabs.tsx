import React from 'react';
import { cn } from "@/lib/utils";
import { User, Shield, History, Lock } from 'lucide-react';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { PermissionsTab } from './tabs/permissions-tab';
import { ActivityTab } from './activity-tab';
import { SecurityTab } from './tabs/security-tab';

interface Tab {
    id: string;
    label: string;
    icon: React.ElementType;
    count?: number;
}

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tabs: Tab[];
    // Add any additional props needed for content rendering
    user: any;
    activityLogs: any[];
    stats: any;
    emailCopied: boolean;
    onCopyEmail: () => void;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onLogoutAll: () => void;
    onDelete: () => void;
    onToggle2FA: () => void;
    isResettingPassword: boolean;
    isLoggingOutAll: boolean;
    formatDate: (date: string | null, includeTime?: boolean) => string;
}

export const UserTabs = ({ 
    activeTab, 
    setActiveTab, 
    tabs,
    // Content props
    user,
    activityLogs,
    stats,
    emailCopied,
    onCopyEmail,
    onResetPassword,
    onToggleStatus,
    onLogoutAll,
    onDelete,
    onToggle2FA,
    isResettingPassword,
    isLoggingOutAll,
    formatDate
}: Props) => {
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab
                        user={user}
                        activityLogs={activityLogs}
                        stats={stats}
                        emailCopied={emailCopied}
                        onCopyEmail={onCopyEmail}
                        onResetPassword={onResetPassword}
                        onToggleStatus={onToggleStatus}
                        onLogoutAll={onLogoutAll}
                        onDelete={onDelete}
                        formatDate={formatDate}
                    />
                );
            case 'permissions':
                return <PermissionsTab user={user} />;
            case 'activity':
                return (
                    <ActivityTab
                        user={user}
                        activityLogs={activityLogs}
                        stats={stats}
                        onLogoutAll={onLogoutAll}
                        isLoggingOutAll={isLoggingOutAll}
                        formatDate={formatDate}
                    />
                );
            case 'security':
                return (
                    <SecurityTab
                        user={user}
                        onResetPassword={onResetPassword}
                        onToggle2FA={onToggle2FA}
                        onDelete={onDelete}
                        isResettingPassword={isResettingPassword}
                        formatDate={formatDate}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {/* Custom Tab Navigation - matching Residents design */}
            <div className="flex items-center border-b dark:border-gray-800 overflow-x-auto no-scrollbar gap-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.count ? <span className="ml-1">({tab.count})</span> : null}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};