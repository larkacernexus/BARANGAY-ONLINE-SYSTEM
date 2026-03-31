// resources/js/Pages/Admin/Households/Show/components/privileges/PrivilegesSummary.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface PrivilegesSummaryProps {
    active: number;
    expiringSoon: number;
    expired: number;
    pending: number;
}

export const PrivilegesSummary = ({ active, expiringSoon, expired, pending }: PrivilegesSummaryProps) => {
    const total = active + expiringSoon + expired + pending;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="dark:bg-gray-800/50">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <Award className="h-8 w-8 text-blue-500 mx-auto" />
                        <p className="text-2xl font-bold dark:text-gray-100">{total}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Privileges</p>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800/50">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                        <p className="text-2xl font-bold dark:text-gray-100">{active}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800/50">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <Clock className="h-8 w-8 text-yellow-500 mx-auto" />
                        <p className="text-2xl font-bold dark:text-gray-100">{expiringSoon}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800/50">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                        <p className="text-2xl font-bold dark:text-gray-100">{expired}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};