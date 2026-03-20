// resources/js/Pages/Admin/Forms/components/form-tabs.tsx
import React from 'react';
import {
    FileText,
    Eye,
    BarChart3,
    FolderOpen,
} from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: string;
}

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tabs: Tab[];
}

const iconMap: Record<string, React.ElementType> = {
    FileText,
    Eye,
    BarChart3,
    FolderOpen,
};

export const FormTabs = ({ activeTab, setActiveTab, tabs }: Props) => {
    return (
        <div className="border-b dark:border-gray-700">
            <nav className="flex space-x-4" aria-label="Tabs">
                {tabs.map((tab) => {
                    const Icon = iconMap[tab.icon];
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                inline-flex items-center px-3 py-2 text-sm font-medium border-b-2
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="ml-2">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};