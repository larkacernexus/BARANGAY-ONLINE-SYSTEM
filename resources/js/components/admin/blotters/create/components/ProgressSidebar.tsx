// components/admin/blotters/create/components/ProgressSidebar.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileUp, UserPlus, Calendar, Clock } from 'lucide-react';

interface ProgressSidebarProps {
    completedRequired: number;
    requiredFieldsCount: number;
    totalProgress: number;
    selectedType: any;
    attachmentsCount: number;
    status?: string;
    priority?: string;
    createdAt?: string;
    updatedAt?: string;
}

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'investigating':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'resolved':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'dismissed':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
};

const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'high':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'low':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
};

export const ProgressSidebar = ({
    completedRequired,
    requiredFieldsCount,
    totalProgress,
    selectedType,
    attachmentsCount,
    status,
    priority,
    createdAt,
    updatedAt
}: ProgressSidebarProps) => {
    return (
        <div className="space-y-6">
            {/* Progress Card */}
            <Card className="dark:bg-gray-900 sticky top-6">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Form Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Required Fields:</span>
                            <span className={`font-medium ${
                                completedRequired === requiredFieldsCount 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-amber-600 dark:text-amber-400'
                            }`}>
                                {completedRequired}/{requiredFieldsCount} completed
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center justify-between font-medium text-gray-900 dark:text-gray-100 mb-1">
                                <span>Overall Progress</span>
                                <span>{totalProgress}%</span>
                            </div>
                            <Progress value={totalProgress} className="h-2 bg-gray-200 dark:bg-gray-700" />
                        </div>

                        <Separator className="bg-gray-200 dark:bg-gray-700" />

                        {/* Status and Priority Section */}
                        {(status || priority) && (
                            <>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Case Status</h4>
                                    <div className="space-y-2">
                                        {status && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <Badge className={getStatusColor(status)}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </Badge>
                                            </div>
                                        )}
                                        {priority && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                                                <Badge className={getPriorityColor(priority)}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Separator className="bg-gray-200 dark:bg-gray-700" />
                            </>
                        )}

                        {/* Timeline Section */}
                        {(createdAt || updatedAt) && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Timeline</h4>
                                <div className="space-y-2 text-xs">
                                    {createdAt && (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            <span>Filed: {new Date(createdAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {updatedAt && (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            <span>Last Updated: {new Date(updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(status || priority || createdAt || updatedAt) && (
                            <Separator className="bg-gray-200 dark:bg-gray-700" />
                        )}

                        {/* Selected Type Summary */}
                        {selectedType && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Incident Type</h4>
                                <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{selectedType.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {selectedType.requires_evidence ? '📎 Evidence required' : '📄 Evidence optional'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File Count */}
                        {attachmentsCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FileUp className="h-4 w-4" />
                                <span>{attachmentsCount} file(s) attached</span>
                            </div>
                        )}

                        <Separator className="bg-gray-200 dark:bg-gray-700" />

                        {/* Quick Tips */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Quick Tips</h4>
                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <li>• Be specific with incident details</li>
                                <li>• Provide complete witness information</li>
                                <li>• Upload clear photos if available</li>
                                <li>• Include exact time and location</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100 text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 text-sm" 
                        type="button"
                        onClick={() => window.open('/admin/residents/create', '_blank')}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Resident
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};