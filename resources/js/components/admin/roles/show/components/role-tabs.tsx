// resources/js/Pages/Admin/Roles/components/role-tabs.tsx
import React from 'react';
import { Info, Lock, Users, FileText } from 'lucide-react';
import { Role, Permission } from '../types';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { PermissionsTab } from './permissions-tab';
import { UsersTab } from './users-tab';
import { DetailsTab } from './details-tab';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
}

export const RoleTabs = ({ activeTab, setActiveTab, role, groupedPermissions }: Props) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'overview' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Info className="h-4 w-4 inline mr-2" />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                        activeTab === 'permissions' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Lock className="h-4 w-4 mr-2" />
                    Permissions
                    {role.permissions && role.permissions.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {role.permissions.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                        activeTab === 'users' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Users
                    {role.users_count && role.users_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {role.users_count}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'details' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Details
                </button>
            </nav>
        </div>
    );
};

// Static property to hold tab content components
RoleTabs.Content = function TabContent({ 
    activeTab, 
    role, 
    groupedPermissions,
    statistics,
    onCopyToClipboard,
    onManagePermissions,
    formatDateTime,
    formatTimeAgo,
    getStatusBadge,
    getInitials
}: { 
    activeTab: string; 
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
    statistics: any[];
    onCopyToClipboard: (text: string, label: string) => void;
    onManagePermissions: () => void;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    getStatusBadge: (status: string) => React.ReactNode;
    getInitials: (name: string) => string;
}) {
    switch (activeTab) {
        case 'overview':
            return (
                <OverviewTab
                    role={role}
                    groupedPermissions={groupedPermissions}
                    statistics={statistics}
                    onCopyToClipboard={onCopyToClipboard}
                    onManagePermissions={onManagePermissions}
                    formatDateTime={formatDateTime}
                    formatTimeAgo={formatTimeAgo}
                />
            );
        case 'permissions':
            return (
                <PermissionsTab
                    role={role}
                    groupedPermissions={groupedPermissions}
                    onCopyToClipboard={onCopyToClipboard}
                    onManagePermissions={onManagePermissions}
                />
            );
        case 'users':
            return (
                <UsersTab
                    role={role}
                    onCopyToClipboard={onCopyToClipboard}
                    getStatusBadge={getStatusBadge}
                    getInitials={getInitials}
                />
            );
        case 'details':
            return (
                <DetailsTab
                    role={role}
                    onCopyToClipboard={onCopyToClipboard}
                    formatDateTime={formatDateTime}
                    formatTimeAgo={formatTimeAgo}
                />
            );
        default:
            return null;
    }
};