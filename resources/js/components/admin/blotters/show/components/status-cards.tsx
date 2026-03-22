// resources/js/components/admin/blotters/show/components/status-cards.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface StatusCardsProps {
    status: string;
    statusColor: string;
    statusIcon: React.ReactNode;
    priority: string;
    priorityColor: string;
    priorityIcon: React.ReactNode;
    incidentDatetime: string;
    attachmentsCount: number;
}

export function StatusCards({
    status,
    statusColor,
    statusIcon,
    priority,
    priorityColor,
    priorityIcon,
    incidentDatetime,
    attachmentsCount
}: StatusCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <p className="text-lg font-semibold capitalize mt-1 dark:text-gray-200">
                                {status}
                            </p>
                        </div>
                        <div className={`p-2 rounded-full ${statusColor}`}>
                            {statusIcon}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                            <p className="text-lg font-semibold capitalize mt-1 dark:text-gray-200">
                                {priority}
                            </p>
                        </div>
                        <div className={`p-2 rounded-full ${priorityColor}`}>
                            {priorityIcon}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Incident Date</p>
                            <p className="text-lg font-semibold mt-1 dark:text-gray-200">
                                {format(new Date(incidentDatetime), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(incidentDatetime), 'hh:mm a')}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Calendar className="h-5 w-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="dark:bg-gray-900">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Attachments</p>
                            <p className="text-lg font-semibold mt-1 dark:text-gray-200">
                                {attachmentsCount}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                file(s) attached
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}