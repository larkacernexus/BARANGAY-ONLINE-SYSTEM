// resources/js/Pages/Admin/FeeTypes/components/fee-type-tabs.tsx
import React from 'react';
import { FileText, DollarSign, Settings, CreditCard, Clock } from 'lucide-react';

// Import tab content components
import { OverviewTab } from './overview-tab';
import { PricingTab } from './pricing-tab';
import { SettingsTab } from './settings-tab';
import { RecentFeesTab } from './recent-fees-tab';
import { HistoryTab } from './history-tab';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    hasDiscounts: boolean;
    recentFeesCount: number;
}

export const FeeTypeTabs = ({ activeTab, setActiveTab, hasDiscounts, recentFeesCount }: Props) => {
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
                    onClick={() => setActiveTab('pricing')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap inline-flex items-center ${
                        activeTab === 'pricing' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pricing Details
                    {hasDiscounts && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            Discounts
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
                <button
                    onClick={() => setActiveTab('fees')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap inline-flex items-center ${
                        activeTab === 'fees' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Recent Fees
                    {recentFeesCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {recentFeesCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === 'history' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <Clock className="h-4 w-4 inline mr-2" />
                    History
                </button>
            </nav>
        </div>
    );
};

// Static property to hold tab content components
FeeTypeTabs.Content = function TabContent({ 
    activeTab, 
    feeType,
    recentFees,
    statistics,
    applicablePuroks,
    requirements,
    hasDiscounts,
    activeDiscountFeeTypes,
    expired,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatTimeAgo,
    getCategoryColor,
    getCategoryLabel,
    getAmountTypeLabel,
    getApplicableToLabel,
    getFrequencyLabel,
    getDiscountPercentage,
    getFeeStatusClass,
    getStatusIcon
}: { 
    activeTab: string; 
    feeType: any;
    recentFees: any[];
    statistics: any;
    applicablePuroks: string[];
    requirements: string[];
    hasDiscounts: boolean;
    activeDiscountFeeTypes: any[];
    expired: boolean;
    formatCurrency: (amount: any) => string;
    formatDate: (date: string) => string;
    formatDateTime: (date: string) => string;
    formatTimeAgo: (date: string) => string;
    getCategoryColor: (category: string) => string;
    getCategoryLabel: (category: string) => string;
    getAmountTypeLabel: (type: string) => string;
    getApplicableToLabel: (type: string) => string;
    getFrequencyLabel: (frequency: string) => string;
    getDiscountPercentage: (specific: any, general: any) => string;
    getFeeStatusClass: (status: string) => string;
    getStatusIcon: (isActive: boolean) => React.ReactNode;
}) {
    switch (activeTab) {
        case 'overview':
            return (
                <OverviewTab
                    feeType={feeType}
                    applicablePuroks={applicablePuroks}
                    requirements={requirements}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    formatTimeAgo={formatTimeAgo}
                    getCategoryColor={getCategoryColor}
                    getCategoryLabel={getCategoryLabel}
                    getAmountTypeLabel={getAmountTypeLabel}
                    getApplicableToLabel={getApplicableToLabel}
                    getFrequencyLabel={getFrequencyLabel}
                    getStatusIcon={getStatusIcon}
                />
            );
        case 'pricing':
            return (
                <PricingTab
                    feeType={feeType}
                    hasDiscounts={hasDiscounts}
                    activeDiscountFeeTypes={activeDiscountFeeTypes}
                    formatCurrency={formatCurrency}
                    getAmountTypeLabel={getAmountTypeLabel}
                    getDiscountPercentage={getDiscountPercentage}
                />
            );
        case 'settings':
            return (
                <SettingsTab
                    feeType={feeType}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getFrequencyLabel={getFrequencyLabel}
                />
            );
        case 'fees':
            return (
                <RecentFeesTab
                    recentFees={recentFees}
                    feeTypeId={feeType.id}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getFeeStatusClass={getFeeStatusClass}
                />
            );
        case 'history':
            return (
                <HistoryTab
                    feeType={feeType}
                    statistics={statistics}
                    formatDateTime={formatDateTime}
                    formatTimeAgo={formatTimeAgo}
                    formatCurrency={formatCurrency}
                />
            );
        default:
            return null;
    }
};