import { FileText, File, DollarSign, History } from 'lucide-react';
import { ClearanceRequest } from '@/types/admin/clearances/clearance-types';

interface TabNavigationProps {
    activeTab: 'details' | 'documents' | 'payment' | 'history';
    onTabChange: (tab: 'details' | 'documents' | 'payment' | 'history') => void;
    clearance?: ClearanceRequest;
}

export function TabNavigation({ activeTab, onTabChange, clearance }: TabNavigationProps) {
    const safeClearance = clearance || { documents: [], payment: null, payment_status: null };
    const documentsCount = safeClearance.documents?.length || 0;
    
    // Check if payment is pending or not completed
    const isPaymentCompleted = safeClearance.payment?.status === 'completed' || 
                               safeClearance.payment_status === 'completed';
    const hasPaymentWarning = !isPaymentCompleted;

    const tabs = [
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'documents', label: 'Documents', icon: File, count: documentsCount },
        { id: 'payment', label: 'Payment', icon: DollarSign, warning: hasPaymentWarning },
        { id: 'history', label: 'History', icon: History },
    ];

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4" aria-label="Tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as any)}
                            className={`
                                inline-flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors
                                ${isActive
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1">({tab.count})</span>
                            )}
                            {tab.warning && (
                                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-semibold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                    !
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}