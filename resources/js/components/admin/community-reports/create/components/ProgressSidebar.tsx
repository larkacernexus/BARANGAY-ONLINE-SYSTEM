// components/community-report/ProgressSidebar.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Megaphone, Camera, UserPlus, Calendar, Clock } from 'lucide-react';
import { ReportType } from '@/types/admin/reports/community-report';

interface ProgressSidebarProps {
    completedRequired: number;
    requiredFieldsCount: number;
    totalProgress: number;
    selectedType: ReportType | null;
    filesCount: number;
    status?: string;
    priority?: string;
    createdAt?: string;
    updatedAt?: string;
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'pending':
            return 'secondary';
        case 'under_review':
            return 'outline';
        case 'in_progress':
            return 'default';
        case 'resolved':
            return 'default';
        case 'rejected':
            return 'destructive';
        default:
            return 'secondary';
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'under_review':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'in_progress':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        case 'resolved':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
};

const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'critical':
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
    filesCount,
    status,
    priority,
    createdAt,
    updatedAt
}: ProgressSidebarProps) => {
    return (
        <div className="space-y-6">
            {/* Form Progress Card */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 sticky top-6">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Form Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-3">
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
                        </div>

                        <Separator className="bg-gray-200 dark:bg-gray-700" />

                        {/* Status and Priority Section (for edit mode) */}
                        {(status || priority) && (
                            <>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Report Status</h4>
                                    <div className="space-y-2">
                                        {status && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <Badge className={getStatusColor(status)}>
                                                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
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

                        {/* Created/Updated Dates (for edit mode) */}
                        {(createdAt || updatedAt) && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Report Timeline</h4>
                                <div className="space-y-2 text-xs">
                                    {createdAt && (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
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
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Selected Type</h4>
                                <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className={`p-1.5 rounded ${
                                        selectedType.category?.toLowerCase().includes('issue')
                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                            : 'bg-purple-100 dark:bg-purple-900/30'
                                    }`}>
                                        {selectedType.category?.toLowerCase().includes('issue') ? (
                                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        ) : (
                                            <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{selectedType.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {selectedType.requires_evidence ? 'Evidence required' : 'Evidence optional'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File Count */}
                        {filesCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Camera className="h-4 w-4" />
                                <span>{filesCount} file(s) attached</span>
                            </div>
                        )}

                        <Separator className="bg-gray-200 dark:bg-gray-700" />

                        {/* Quick Tips */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Quick Tips</h4>
                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <li>• Be specific with location details</li>
                                <li>• Upload clear photos if possible</li>
                                <li>• Provide witness information if any</li>
                                <li>• Include time and date of incident</li>
                                <li>• Describe any recurring patterns</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
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