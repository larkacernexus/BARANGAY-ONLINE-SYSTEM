import React from 'react';
import { cn } from "@/lib/utils";
import { OverviewTab } from './overview-tab';
import { DetailsTab } from './details-tab';
import { TimelineTab } from './timeline-tab';

// Icons
import { Info, FileText, History } from 'lucide-react';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    official: any;
    formatDate: (date: string, includeTime?: boolean) => string;
    getStatusColor: (status: string, isCurrent: boolean) => string;
    getStatusIcon: (status: string, isCurrent: boolean) => React.ReactNode;
}

export const OfficialTabs = ({ 
    activeTab, 
    setActiveTab, 
    official,
    formatDate,
    getStatusColor,
    getStatusIcon 
}: Props) => {
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
        { id: 'details', label: 'Details', icon: <FileText className="h-4 w-4" /> },
        { id: 'timeline', label: 'Timeline', icon: <History className="h-4 w-4" /> }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab
                        official={official}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />
                );
            case 'details':
                return (
                    <DetailsTab
                        official={official}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />
                );
            case 'timeline':
                return (
                    <TimelineTab
                        official={official}
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
                {tabs.map((tab) => (
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
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};