// resources/js/components/admin/blotters/show/components/tabs/action-tab.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FileCheck, Clock, Edit } from 'lucide-react';
import { Blotter } from '@/types/admin/blotters/blotter';
import { formatDateTime } from '@/components/admin/blotters/show/utils/helpers';

interface ActionTabProps {
    blotter: Blotter;
}

export function ActionTab({ blotter }: ActionTabProps) {
    const hasActionTaken = !!blotter.action_taken;

    if (!hasActionTaken) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FileCheck className="h-5 w-5" />
                        No Action Taken Yet
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        This blotter is still pending action
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 space-y-4">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Pending Action</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Action hasn't been taken on this blotter yet
                            </p>
                        </div>
                        <Link href={`/admin/blotters/${blotter.id}/edit`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Edit className="h-4 w-4 mr-2" />
                                Take Action
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Action Taken
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap dark:text-gray-300">{blotter.action_taken}</p>
                {blotter.investigator && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Investigator</h3>
                        <p className="mt-1 dark:text-gray-300">{blotter.investigator}</p>
                    </div>
                )}
                {blotter.resolved_datetime && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved On</h3>
                        <p className="mt-1 dark:text-gray-300">{formatDateTime(blotter.resolved_datetime)}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}