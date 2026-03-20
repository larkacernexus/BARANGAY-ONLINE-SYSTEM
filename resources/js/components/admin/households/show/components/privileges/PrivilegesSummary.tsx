// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegesSummary.tsx

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface PrivilegesSummaryProps {
    active: number;
    expiringSoon: number;
    expired: number;
    pending: number;
}

export const PrivilegesSummary = ({ active, expiringSoon, expired, pending }: PrivilegesSummaryProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="dark:bg-gray-900">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold dark:text-gray-100">{active}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="dark:bg-gray-900">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-bold dark:text-gray-100">{expiringSoon}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="dark:bg-gray-900">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold dark:text-gray-100">{expired}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="dark:bg-gray-900">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold dark:text-gray-100">{pending}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};