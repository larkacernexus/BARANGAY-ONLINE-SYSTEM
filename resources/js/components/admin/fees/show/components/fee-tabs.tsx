// resources/js/Pages/Admin/Fees/components/fee-tabs.tsx
import React from 'react';

interface Props {
    activeTab: 'details' | 'computation' | 'requirements' | 'history';
    setActiveTab: (tab: 'details' | 'computation' | 'requirements' | 'history') => void;
    paymentCount: number;
}

export const FeeTabs = ({ activeTab, setActiveTab, paymentCount }: Props) => {
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
                    Details
                </button>
                <button
                    onClick={() => setActiveTab('computation')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'computation' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    Computation
                </button>
                <button
                    onClick={() => setActiveTab('requirements')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'requirements' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    Requirements
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'history' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    Payment History
                    {paymentCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                            {paymentCount}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
};