// resources/js/Pages/Admin/Permissions/components/permission-tabs.tsx
import React from 'react';
import { Info, Shield, FileText } from 'lucide-react';
import { Permission } from '@/types';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { AccessTab } from './access-tab';
import { DetailsTab } from './details-tab';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    totalRoles: number;
    totalUsers: number;
}

export const PermissionTabs = ({ activeTab, setActiveTab, totalRoles, totalUsers }: Props) => {
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
                    onClick={() => setActiveTab('access')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                        activeTab === 'access' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Shield className="h-4 w-4 mr-2" />
                    Access
                    {totalRoles + totalUsers > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {totalRoles + totalUsers}
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
PermissionTabs.Content = function TabContent({ 
    activeTab, 
    permission, 
    roles,
    users,
    statistics,
    totalRolesWithAccess,
    totalUsersWithAccess,
    onContactDeveloper,
    formatDate,
    formatTimeAgo,
    getModuleDisplayName,
    getModuleIcon,
    getModuleColor,
    getColorClass
}: { 
    activeTab: string; 
    permission: any;
    roles: any[];
    users: any[];
    statistics: any[];
    totalRolesWithAccess: number;
    totalUsersWithAccess: number;
    onContactDeveloper: () => void;
    formatDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    getModuleDisplayName: (module: string) => string;
    getModuleIcon: (module: string) => React.ReactNode;
    getModuleColor: (module: string) => string;
    getColorClass: (color: string) => string;
}) {
    switch (activeTab) {
        case 'overview':
            return (
                <OverviewTab
                    permission={permission}
                    statistics={statistics}
                    totalRolesWithAccess={totalRolesWithAccess}
                    totalUsersWithAccess={totalUsersWithAccess}
                    onContactDeveloper={onContactDeveloper}
                    formatDate={formatDate}
                    formatTimeAgo={formatTimeAgo}
                    getModuleDisplayName={getModuleDisplayName}
                    getModuleIcon={getModuleIcon}
                    getModuleColor={getModuleColor}
                    getColorClass={getColorClass}
                />
            );
        case 'access':
            return (
                <AccessTab
                    permission={permission}
                    roles={roles}
                    users={users}
                    onContactDeveloper={onContactDeveloper}
                />
            );
        case 'details':
            return (
                <DetailsTab
                    permission={permission}
                    rolesCount={roles.length}
                    usersCount={users.length}
                    formatDate={formatDate}
                    formatTimeAgo={formatTimeAgo}
                />
            );
        default:
            return null;
    }
};