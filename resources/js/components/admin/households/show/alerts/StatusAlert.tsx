// resources/js/Pages/Admin/Households/Show/components/alerts/StatusAlert.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit } from 'lucide-react';

interface StatusAlertProps {
    householdId: number;
}

export const StatusAlert = ({ householdId }: StatusAlertProps) => {
    return (
        <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">Inactive Household</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                This household is currently marked as inactive.
                            </p>
                        </div>
                    </div>
                    <Link href={route('admin.households.edit', householdId)}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Reactivate
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};