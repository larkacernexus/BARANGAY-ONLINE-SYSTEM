// components/community-report/ReviewCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { ReportType } from '@/components/admin/community-reports/create/types/community-report';

interface ReviewCardProps {
    isAnonymous: boolean;
    reporterName: string;
    reporterContact: string;
    reporterAddress: string;
    selectedType: ReportType | null;
    title: string;
    description: string;
    detailedDescription: string;
    incidentDate: string;
    incidentTime: string;
    location: string;
    perpetratorDetails: string;
    preferredResolution: string;
    filesCount: number;
    recurringIssue: boolean;
    safetyConcern: boolean;
    environmentalImpact: boolean;
}

export const ReviewCard = ({
    isAnonymous,
    reporterName,
    reporterContact,
    reporterAddress,
    selectedType,
    title,
    description,
    detailedDescription,
    incidentDate,
    incidentTime,
    location,
    perpetratorDetails,
    preferredResolution,
    filesCount,
    recurringIssue,
    safetyConcern,
    environmentalImpact
}: ReviewCardProps) => {
    return (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Check className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    Review & Submit
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                    Review all information before submitting the report
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Complainant Info */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Complainant Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        {isAnonymous ? (
                            <p className="text-gray-600 dark:text-gray-400">Anonymous Report</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                <span className="text-gray-900 dark:text-gray-100">{reporterName || 'Not specified'}</span>
                                <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                                <span className="text-gray-900 dark:text-gray-100">{reporterContact || 'Not specified'}</span>
                                <span className="text-gray-500 dark:text-gray-400">Address:</span>
                                <span className="text-gray-900 dark:text-gray-100">{reporterAddress || 'Not specified'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Report Type */}
                {selectedType && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Report Type</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedType.name}</p>
                            {selectedType.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedType.description}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Incident Details */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Incident Details</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 block">Title:</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{title || 'Not specified'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 block">Description:</span>
                            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{description || 'Not specified'}</p>
                        </div>
                        {detailedDescription && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 block">Detailed Description:</span>
                                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{detailedDescription}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 block">Date:</span>
                                <p className="text-gray-900 dark:text-gray-100">{incidentDate}</p>
                            </div>
                            {incidentTime && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Time:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{incidentTime}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 block">Location:</span>
                            <p className="text-gray-900 dark:text-gray-100">{location || 'Not specified'}</p>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                {(perpetratorDetails || preferredResolution || filesCount > 0) && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Additional Information</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
                            {perpetratorDetails && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Perpetrator Details:</span>
                                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{perpetratorDetails}</p>
                                </div>
                            )}
                            {preferredResolution && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Preferred Resolution:</span>
                                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{preferredResolution}</p>
                                </div>
                            )}
                            {filesCount > 0 && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Evidence Files:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{filesCount} file(s) attached</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Flags */}
                {(recurringIssue || safetyConcern || environmentalImpact) && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Flags</h3>
                        <div className="flex flex-wrap gap-2">
                            {recurringIssue && (
                                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                                    Recurring Issue
                                </Badge>
                            )}
                            {safetyConcern && (
                                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                                    Safety Concern
                                </Badge>
                            )}
                            {environmentalImpact && (
                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                    Environmental Impact
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};