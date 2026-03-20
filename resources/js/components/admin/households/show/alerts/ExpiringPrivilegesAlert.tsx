// resources/js/Pages/Admin/Households/Show/components/alerts/ExpiringPrivilegesAlert.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Award } from 'lucide-react';

interface ExpiringPrivilegesAlertProps {
    count: number;
    onReview: () => void;
}

export const ExpiringPrivilegesAlert = ({ count, onReview }: ExpiringPrivilegesAlertProps) => {
    if (count === 0) return null;

    return (
        <Card className="border-l-4 border-l-yellow-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">Privileges Expiring Soon</p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                {count} privilege(s) will expire within 30 days.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReview}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <Award className="h-4 w-4 mr-2" />
                        Review
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};