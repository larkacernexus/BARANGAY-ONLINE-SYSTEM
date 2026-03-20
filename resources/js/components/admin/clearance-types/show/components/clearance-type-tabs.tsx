import React from 'react';
import { cn } from "@/lib/utils";
import { FileText, FileCheck, Award, Settings } from 'lucide-react';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { RequirementsTab } from './requirements-tab';
import { DiscountsTab } from './discounts-tab';
import { SettingsTab } from './settings-tab';

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
    // Content props
    clearanceType: any;
    recentClearances: any[];
    privileges: any[];
    parsedEligibilityCriteria: any[];
    parsedPurposeOptions: string[];
    activeDiscounts: any[];
    fee: number;
    processingDays: number;
    validityDays: number;
    showAllDocuments: boolean;
    showAllDiscounts: boolean;
    onToggleDocuments: () => void;
    onToggleDiscounts: () => void;
    onToggleDiscountable: () => void;
    onToggleStatus: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    formatCurrency: (amount: number | string) => string;
    getStatusColor: (isActive: boolean) => string;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
}

export const ClearanceTypeTabs = ({ 
    activeTab, 
    setActiveTab, 
    tabs,
    // Content props
    clearanceType,
    recentClearances,
    privileges,
    parsedEligibilityCriteria,
    parsedPurposeOptions,
    activeDiscounts,
    fee,
    processingDays,
    validityDays,
    showAllDocuments,
    showAllDiscounts,
    onToggleDocuments,
    onToggleDiscounts,
    onToggleDiscountable,
    onToggleStatus,
    onDuplicate,
    onDelete,
    formatCurrency,
    getStatusColor,
    getStatusIcon
}: Props) => {
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab
                        clearanceType={clearanceType}
                        recentClearances={recentClearances}
                        parsedEligibilityCriteria={parsedEligibilityCriteria}
                        parsedPurposeOptions={parsedPurposeOptions}
                        activeDiscounts={activeDiscounts}
                        fee={fee}
                        processingDays={processingDays}
                        validityDays={validityDays}
                        formatCurrency={formatCurrency}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />
                );
            case 'requirements':
                return (
                    <RequirementsTab
                        documentTypes={clearanceType.document_types || []}
                        showAll={showAllDocuments}
                        onToggle={onToggleDocuments}
                    />
                );
            case 'discounts':
                return (
                    <DiscountsTab
                        discounts={activeDiscounts}
                        privileges={privileges}
                        showAll={showAllDiscounts}
                        onToggle={onToggleDiscounts}
                        clearanceTypeId={clearanceType.id}
                    />
                );
            case 'settings':
                return (
                    <SettingsTab
                        clearanceType={clearanceType}
                        fee={fee}
                        onToggleDiscountable={onToggleDiscountable}
                        onToggleStatus={onToggleStatus}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        formatCurrency={formatCurrency}
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