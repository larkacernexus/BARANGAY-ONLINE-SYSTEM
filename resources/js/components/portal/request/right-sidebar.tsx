import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, Check, Save, Trash2, CheckCircle } from 'lucide-react';

interface RightSidebarProps {
    isMobile: boolean;
    selectedClearance: any;
    steps: any[];
    activeStep: number;
    data: any;
    isCustomPurpose: boolean;
    requiresDocuments: boolean;
    documentRequirements: any;
    hasDraft: boolean;
    onDeleteDraft: () => void;
}

export function RightSidebar({
    isMobile,
    selectedClearance,
    steps,
    activeStep,
    data,
    isCustomPurpose,
    requiresDocuments,
    documentRequirements,
    hasDraft,
    onDeleteDraft
}: RightSidebarProps) {
    if (isMobile) return null;

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Clearance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {selectedClearance ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Type</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium text-blue-600">
                                        {selectedClearance.name}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Processing Time</span>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {selectedClearance.processing_days} days
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Validity Period</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {selectedClearance.validity_days} days
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Fee</span>
                                <span className={`text-sm font-medium ${selectedClearance.formatted_fee !== '₱0.00' ? 'text-amber-600' : 'text-green-600'}`}>
                                    {selectedClearance.formatted_fee !== '₱0.00' ? selectedClearance.formatted_fee : 'Free'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Documents Required</span>
                                <span className={`text-sm font-medium ${requiresDocuments ? 'text-red-600' : 'text-green-600'}`}>
                                    {requiresDocuments ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Select a clearance type to see details</p>
                    )}
                    
                    <Separator />
                    
                    <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span>Current Step:</span>
                        </div>
                        <p className="font-medium">{steps[activeStep - 1].title}</p>
                        <p className="text-xs text-gray-500 mt-1">{steps[activeStep - 1].description}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Requirements Status */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className={`flex items-center justify-between ${data.clearance_type_id ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="text-sm">Clearance Type</span>
                        {data.clearance_type_id ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <span className="text-xs">Required</span>
                        )}
                    </div>
                    <div className={`flex items-center justify-between ${(data.purpose || isCustomPurpose) ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="text-sm">Purpose</span>
                        {(data.purpose || isCustomPurpose) ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <span className="text-xs">Required</span>
                        )}
                    </div>
                    <div className={`flex items-center justify-between ${data.needed_date ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="text-sm">Date Needed</span>
                        {data.needed_date ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <span className="text-xs">Required</span>
                        )}
                    </div>
                    {requiresDocuments && (
                        <div className={`flex items-center justify-between ${documentRequirements.met ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="text-sm">Documents</span>
                            {documentRequirements.met ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <span className="text-xs">{documentRequirements.fulfilledCount}/{documentRequirements.requiredCount}</span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Draft Info */}
            {hasDraft && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Save className="h-4 w-4 text-blue-600" />
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
                                className="w-full mt-2"
                            >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete Draft
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tips */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Helpful Tips</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Provide complete and accurate information</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Upload clear copies of required documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Plan ahead for processing time</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}