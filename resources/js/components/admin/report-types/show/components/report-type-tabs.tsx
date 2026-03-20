// resources/js/Pages/Admin/Reports/ReportTypes/components/report-type-tabs.tsx
import React from 'react';
import { FileText, ListChecks, Activity, Eye } from 'lucide-react';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { RequiredFieldsTab } from './required-fields-tab';
import { ResolutionStepsTab } from './resolution-steps-tab';
import { RecentReportsTab } from './recent-reports-tab';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    requiredFieldsCount: number;
    resolutionStepsCount: number;
    recentReportsCount: number;
}

export const ReportTypeTabs = ({ 
    activeTab, 
    setActiveTab, 
    requiredFieldsCount, 
    resolutionStepsCount, 
    recentReportsCount 
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
                    onClick={() => setActiveTab('fields')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap inline-flex items-center ${
                        activeTab === 'fields' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <ListChecks className="h-4 w-4 mr-2" />
                    Required Fields
                    {requiredFieldsCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {requiredFieldsCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('steps')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap inline-flex items-center ${
                        activeTab === 'steps' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Activity className="h-4 w-4 mr-2" />
                    Resolution Steps
                    {resolutionStepsCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {resolutionStepsCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap inline-flex items-center ${
                        activeTab === 'reports' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Recent Reports
                    {recentReportsCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {recentReportsCount}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
};

// Static property to hold tab content components
ReportTypeTabs.Content = function TabContent({ 
    activeTab, 
    reportType,
    recentReports,
    reportStats,
    IconComponent,
    getPriorityIcon,
    formatDate,
    formatDateTime,
    formatShortDate,
    formatTimeAgo
}: { 
    activeTab: string; 
    reportType: any;
    recentReports: any[];
    reportStats: any;
    IconComponent: React.ElementType;
    getPriorityIcon: (level: number) => React.ReactNode;
    formatDate: (date: string) => string;
    formatDateTime: (date: string) => string;
    formatShortDate: (date: string) => string;
    formatTimeAgo: (date: string) => string;
}) {
    switch (activeTab) {
        case 'overview':
            return (
                <OverviewTab
                    reportType={reportType}
                    reportStats={reportStats}
                    IconComponent={IconComponent}
                    getPriorityIcon={getPriorityIcon}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                    formatTimeAgo={formatTimeAgo}
                />
            );
        case 'fields':
            return (
                <RequiredFieldsTab
                    requiredFields={reportType.required_fields || []}
                />
            );
        case 'steps':
            return (
                <ResolutionStepsTab
                    resolutionSteps={reportType.resolution_steps || []}
                />
            );
        case 'reports':
            return (
                <RecentReportsTab
                    recentReports={recentReports}
                    reportTypeId={reportType.id}
                    getPriorityIcon={getPriorityIcon}
                    formatShortDate={formatShortDate}
                />
            );
        default:
            return null;
    }
};