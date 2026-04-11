// resources/js/Pages/Admin/Roles/components/role-tabs.tsx
import React from 'react';
import { Info, Lock, Users, FileText } from 'lucide-react';
import { Role, Permission } from '@/types/admin/roles/roles';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { PermissionsTab } from './permissions-tab';
import { UsersTab } from './users-tab';
import { DetailsTab } from './details-tab';

interface RoleTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
}

interface TabContentProps {
    activeTab: string;
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
    statistics: Array<{
        label: string;
        value: string | number;
        icon: React.ComponentType<{ className?: string }>;
        description: string;
        color: string;
    }>;
    onCopyToClipboard: (text: string, label: string) => void;
    onManagePermissions: () => void;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    getStatusBadge: (status: string) => { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string };
    getInitials: (name: string) => string;
}

export const RoleTabs = ({ activeTab, setActiveTab, role, groupedPermissions }: RoleTabsProps) => {
    // Safe access with fallbacks
    const permissionsCount = role.permissions?.length ?? role.permissions_count ?? 0;
    const usersCount = role.users_count ?? 0;

    return (
        <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-8" aria-label="Role information tabs">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`
                        py-3 px-3 sm:px-1 border-b-2 font-medium text-sm transition-all duration-200
                        flex items-center gap-2
                        ${activeTab === 'overview' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                    `}
                    aria-selected={activeTab === 'overview'}
                    role="tab"
                >
                    <Info className="h-4 w-4" />
                    <span>Overview</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`
                        py-3 px-3 sm:px-1 border-b-2 font-medium text-sm transition-all duration-200
                        flex items-center gap-2
                        ${activeTab === 'permissions' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                    `}
                    aria-selected={activeTab === 'permissions'}
                    role="tab"
                >
                    <Lock className="h-4 w-4" />
                    <span>Permissions</span>
                    {permissionsCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {permissionsCount}
                        </span>
                    )}
                </button>
                
                <button
                    onClick={() => setActiveTab('users')}
                    className={`
                        py-3 px-3 sm:px-1 border-b-2 font-medium text-sm transition-all duration-200
                        flex items-center gap-2
                        ${activeTab === 'users' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                    `}
                    aria-selected={activeTab === 'users'}
                    role="tab"
                >
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                    {usersCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {usersCount}
                        </span>
                    )}
                </button>
                
                <button
                    onClick={() => setActiveTab('details')}
                    className={`
                        py-3 px-3 sm:px-1 border-b-2 font-medium text-sm transition-all duration-200
                        flex items-center gap-2
                        ${activeTab === 'details' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                    `}
                    aria-selected={activeTab === 'details'}
                    role="tab"
                >
                    <FileText className="h-4 w-4" />
                    <span>Details</span>
                </button>
            </nav>
        </div>
    );
};

// Tab Content Component
const TabContent = ({ 
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
}: TabContentProps) => {
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

// Attach Content as a static property
RoleTabs.Content = TabContent;