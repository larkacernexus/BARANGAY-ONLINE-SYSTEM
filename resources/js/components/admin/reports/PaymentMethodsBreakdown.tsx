import { DollarSign, CreditCard, Wallet, Landmark, Receipt } from 'lucide-react';
import { useState } from 'react';

interface PaymentMethod {
    payment_method: string;
    total_revenue: number;
    transaction_count: number;
    percentage: number;
    averageValue: number;
    displayName: string;
}

interface PaymentMethodsBreakdownProps {
    methods: PaymentMethod[];
    formatCurrency: (amount: number) => string;
}

const getPaymentMethodIcon = (method: string) => {
    const iconMap: Record<string, any> = {
        'cash': DollarSign,
        'credit_card': CreditCard,
        'gcash': Wallet,
        'maya': Wallet,
        'bank_transfer': Landmark,
        'check': Receipt,
        'online': Wallet,
        'mobile': Wallet,
        'paypal': Wallet,
        'stripe': CreditCard,
        'other': DollarSign,
    };
    
    const IconComponent = iconMap[method?.toLowerCase()] || DollarSign;
    return <IconComponent className="h-4 w-4" />;
};

const getPaymentMethodColor = (method: string) => {
    const colorMap: Record<string, string> = {
        'cash': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'credit_card': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'gcash': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        'maya': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
        'bank_transfer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        'check': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
        'online': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
        'mobile': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
        'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    
    return colorMap[method?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

export default function PaymentMethodsBreakdown({ methods, formatCurrency }: PaymentMethodsBreakdownProps) {
    const [visibleMethods, setVisibleMethods] = useState<Set<string>>(new Set());

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Payment Methods Breakdown
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Revenue distribution across different payment methods
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {methods.map(method => (
                        <button
                            key={method.payment_method}
                            onClick={() => {
                                setVisibleMethods(prev => {
                                    const next = new Set(prev);
                                    if (next.has(method.payment_method)) {
                                        next.delete(method.payment_method);
                                    } else {
                                        next.add(method.payment_method);
                                    }
                                    return next;
                                });
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                visibleMethods.has(method.payment_method) || visibleMethods.size === 0
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 line-through'
                            }`}
                        >
                            {method.displayName}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {methods.map((method, index) => (
                    <div key={method.payment_method} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getPaymentMethodColor(method.payment_method)}`}>
                                    {getPaymentMethodIcon(method.payment_method)}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {method.displayName}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {method.transaction_count} transactions
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(method.total_revenue)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {method.percentage}% of total
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Share of revenue</span>
                                <span>{method.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${method.percentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Avg. transaction: {formatCurrency(method.averageValue)}</span>
                                <span>#{index + 1} by revenue</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}