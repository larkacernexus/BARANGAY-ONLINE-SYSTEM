// resources/js/Pages/Admin/DocumentTypes/components/document-type-tabs.tsx
import React from 'react';
import { FileText, ListChecks, Users, Settings } from 'lucide-react';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { RequirementsTab } from './requirements-tab';
import { ApplicationsTab } from './applications-tab';
import { SettingsTab } from './settings-tab';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    requiredCount: number;
    applicationsCount: number;
}

export const DocumentTypeTabs = ({ 
    activeTab, 
    setActiveTab, 
    requiredCount, 
    applicationsCount 
}: Props) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === 'overview' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('requirements')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap inline-flex items-center ${
                        activeTab === 'requirements' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <ListChecks className="h-4 w-4 mr-2" />
                    Requirements
                    {requiredCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {requiredCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap inline-flex items-center ${
                        activeTab === 'applications' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Recent Applications
                    {applicationsCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {applicationsCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === 'settings' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Settings
                </button>
            </nav>
        </div>
    );
};

// Static property to hold tab content components
DocumentTypeTabs.Content = function TabContent({ 
    activeTab, 
    documentType,
    requiredClearanceTypes,
    recentApplications,
    max_file_size_mb,
    formatDate,
    formatDateTime,
    formatShortDate,
    formatTimeAgo,
    formatFileSize
}: { 
    activeTab: string; 
    documentType: any;
    requiredClearanceTypes: any[];
    recentApplications: any[];
    max_file_size_mb: number;
    formatDate: (date: string) => string;
    formatDateTime: (date: string) => string;
    formatShortDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    formatFileSize: (kb: number) => string;
}) {
    switch (activeTab) {
        case 'overview':
            return (
                <OverviewTab
                    documentType={documentType}
                    requiredCount={requiredClearanceTypes.length}
                    applicationsCount={recentApplications.length}
                    max_file_size_mb={max_file_size_mb}
                    formatDateTime={formatDateTime}
                    formatTimeAgo={formatTimeAgo}
                    formatFileSize={formatFileSize}
                />
            );
        case 'requirements':
            return (
                <RequirementsTab
                    requiredClearanceTypes={requiredClearanceTypes}
                />
            );
        case 'applications':
            return (
                <ApplicationsTab
                    recentApplications={recentApplications}
                    formatShortDate={formatShortDate}
                />
            );
        case 'settings':
            return (
                <SettingsTab
                    documentType={documentType}
                    onToggleStatus={() => {}}
                    onToggleRequired={() => {}}
                    onDuplicate={() => {}}
                />
            );
        default:
            return null;
    }
};