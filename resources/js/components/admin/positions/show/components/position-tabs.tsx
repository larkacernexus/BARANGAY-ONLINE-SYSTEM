// resources/js/Pages/Admin/Positions/components/position-tabs.tsx
import React from 'react';
import { Shield, Target, Users } from 'lucide-react';
import { Position } from '../types';

// Import tab content components
import { DetailsTab } from './details-tab';
import { CommitteesTab } from './committees-tab';
import { OfficialsTab } from './officials-tab';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    position: Position;
    hasCommittees: boolean;
}

export const PositionTabs = ({ activeTab, setActiveTab, position, hasCommittees }: Props) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'details' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Shield className="h-4 w-4 inline mr-2" />
                    Details
                </button>
                <button
                    onClick={() => setActiveTab('committees')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                        activeTab === 'committees' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Target className="h-4 w-4 mr-2" />
                    Committees
                    {hasCommittees && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {(position.committee ? 1 : 0) + (position.additional_committees?.length || 0)}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('officials')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                        activeTab === 'officials' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Officials
                    {position.officials_count && position.officials_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {position.officials_count}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
};

// Static property to hold tab content components
PositionTabs.Content = function TabContent({ 
    activeTab, 
    position, 
    copied,
    isCaptainPosition,
    isKagawadPosition,
    onCopyCode,
    formatDateTime
}: { 
    activeTab: string; 
    position: Position;
    copied: boolean;
    isCaptainPosition: boolean;
    isKagawadPosition: boolean;
    onCopyCode: () => void;
    formatDateTime: (date: string) => string;
}) {
    switch (activeTab) {
        case 'details':
            return (
                <DetailsTab
                    position={position}
                    copied={copied}
                    onCopyCode={onCopyCode}
                    formatDateTime={formatDateTime}
                />
            );
        case 'committees':
            return <CommitteesTab position={position} />;
        case 'officials':
            return <OfficialsTab position={position} />;
        default:
            return null;
    }
};