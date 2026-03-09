import { ClearanceRequest } from '@/types/clearance';

interface TabNavigationProps {
    activeTab: 'details' | 'documents' | 'payment' | 'history';
    onTabChange: (tab: 'details' | 'documents' | 'payment' | 'history') => void;
    clearance: ClearanceRequest;
}

export function TabNavigation({ activeTab, onTabChange, clearance }: TabNavigationProps) {
    return (
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
                <button
                    onClick={() => onTabChange('details')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Details
                </button>
                <button
                    onClick={() => onTabChange('documents')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm relative ${activeTab === 'documents' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Documents
                    {clearance.documents && clearance.documents.length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                            {clearance.documents.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onTabChange('payment')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'payment' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Payment
                    {clearance.payment_status && clearance.payment_status !== 'paid' && (
                        <span className={`ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-semibold rounded-full ${
                            clearance.payment_status === 'unpaid' ? 'bg-amber-100 text-amber-600' :
                            clearance.payment_status === 'partially_paid' ? 'bg-blue-100 text-blue-600' : ''
                        }`}>
                            !
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onTabChange('history')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    History
                </button>
            </nav>
        </div>
    );
}