import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/components/residentui/lib/resident-ui-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Banknote, CreditCard, Store } from 'lucide-react';

interface PaymentSummaryProps {
    due: number;
    paid: number;
    balance: number;
    className?: string;
    showCompact?: boolean;
}

export function ModernPaymentSummary({ due, paid, balance, className, showCompact = false }: PaymentSummaryProps) {
    if (showCompact) {
        return (
            <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50", className)}>
                <div className="p-4 grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-[10px] text-gray-500">Due</p>
                        <p className="text-sm font-bold">{formatCurrency(due)}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-[10px] text-green-600">Paid</p>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(paid)}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <p className="text-[10px] text-red-600">Balance</p>
                        <p className={cn(
                            "text-sm font-bold",
                            balance > 0 ? 'text-red-600' : 'text-green-600'
                        )}>
                            {formatCurrency(balance)}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50", className)}>
            <div className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Payment Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Due</span>
                        <span className="font-bold text-lg">{formatCurrency(due)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <span className="text-sm text-green-600">Amount Paid</span>
                        <span className="font-bold text-lg text-green-600">{formatCurrency(paid)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <span className="text-sm text-red-600">Balance</span>
                        <span className={cn(
                            "font-bold text-lg",
                            balance > 0 ? 'text-red-600' : 'text-green-600'
                        )}>
                            {formatCurrency(balance)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function ModernPaymentMethodsInfo() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <div className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Payment Methods</h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <Store className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Over-the-Counter</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Pay at the Barangay Treasurer's Office during office hours
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Accepted Payments</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Cash • Manager's Check • Postal Money Order
                            </p>
                        </div>
                    </div>
                </div>
                <Alert className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-0 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-400">
                        Please bring your valid ID and reference number when paying.
                    </AlertDescription>
                </Alert>
            </div>
        </Card>
    );
}