// components/community-report/SidebarInfo.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, Save, Trash2, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { ReportType } from '@/types/portal/community-report';
import { steps, iconMap, isOtherType } from '@/types/portal/communityreports/utils/community-report-helpers';

interface SidebarInfoProps {
    activeStep: number;
    selectedType: ReportType | undefined;
    data: {
        report_type_id: number | null;
        title: string;
        description: string;
        location: string;
    };
    filesCount: number;
    existingFilesCount: number;
    currentDraftId: string | null;
    onDeleteDraft: () => void;
    onSaveDraft?: () => void;
    isSavingDraft?: boolean;
}

export const SidebarInfo: React.FC<SidebarInfoProps> = ({
    activeStep,
    selectedType,
    data,
    filesCount,
    existingFilesCount,
    currentDraftId,
    onDeleteDraft,
    onSaveDraft,
    isSavingDraft = false
}) => {
    const totalFiles = filesCount + existingFilesCount;

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                        Report Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {selectedType ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                                <div className="flex items-center gap-1">
                                    <span className={`text-sm font-medium ${
                                        isOtherType(selectedType) 
                                            ? 'text-amber-600 dark:text-amber-400' 
                                            : selectedType.category === 'issue'
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-purple-600 dark:text-purple-400'
                                    }`}>
                                        {isOtherType(selectedType) ? 'Other' : selectedType.category === 'issue' ? 'Issue' : 'Complaint'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                                <Badge 
                                    style={{ backgroundColor: selectedType.priority_color }}
                                    className="text-white"
                                >
                                    {selectedType.priority_label}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Evidence Required</span>
                                <span className={`text-sm font-medium ${
                                    selectedType.requires_evidence 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-green-600 dark:text-green-400'
                                }`}>
                                    {selectedType.requires_evidence ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Anonymous Allowed</span>
                                <span className={`text-sm font-medium ${
                                    selectedType.allows_anonymous 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {selectedType.allows_anonymous ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Time</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {selectedType.resolution_days} days
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select a report type to see details
                        </p>
                    )}
                    
                    <Separator className="bg-gray-200 dark:bg-gray-700" />
                    
                    <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                            <Clock className="h-4 w-4" />
                            <span>Current Step:</span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {steps[activeStep - 1].title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {steps[activeStep - 1].description}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Requirements Status */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                        Requirements
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className={`flex items-center justify-between ${
                        data.report_type_id 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-500'
                    }`}>
                        <span className="text-sm">Report Type</span>
                        {data.report_type_id ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Required</span>
                        )}
                    </div>
                    <div className={`flex items-center justify-between ${
                        data.title.trim() 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-500'
                    }`}>
                        <span className="text-sm">Title</span>
                        {data.title.trim() ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Required</span>
                        )}
                    </div>
                    <div className={`flex items-center justify-between ${
                        data.description.trim() 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-500'
                    }`}>
                        <span className="text-sm">Description</span>
                        {data.description.trim() ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Required</span>
                        )}
                    </div>
                    <div className={`flex items-center justify-between ${
                        data.location.trim() 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-500'
                    }`}>
                        <span className="text-sm">Location</span>
                        {data.location.trim() ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Required</span>
                        )}
                    </div>
                    {selectedType?.requires_evidence && (
                        <div className={`flex items-center justify-between ${
                            totalFiles > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                            <span className="text-sm">Evidence</span>
                            {totalFiles > 0 ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <span className="text-xs">Required</span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Draft Info */}
            {currentDraftId && (
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Save className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            Draft Saved Locally
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm space-y-2">
                            <p className="text-blue-700 dark:text-blue-300">
                                Your draft is saved in your browser's local storage.
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Note: Drafts will be lost if you clear browser data.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onDeleteDraft}
                                className="w-full mt-2 border-blue-200 dark:border-blue-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete Draft
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tips */}
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                        Helpful Tips
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400">Be specific with dates and locations</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400">Provide clear photos as evidence</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400">Use "Other" option if your issue isn't listed</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};