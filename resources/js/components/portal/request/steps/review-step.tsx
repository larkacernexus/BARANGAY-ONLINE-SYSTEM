import { FileCheck, Info, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Resident } from '@/components/portal/request/types'; // ✅ Import from correct path

interface ReviewStepProps {
    selectedClearance: any;
    data: any;
    isCustomPurpose: boolean;
    availablePurposes: Array<{value: string, label: string, icon: any}>;
    uploadedFiles: any[];
    currentDraftId: string | null;
    resident: Resident; // ✅ Now using the correct Resident type
}

export function ReviewStep({
    selectedClearance,
    data,
    isCustomPurpose,
    availablePurposes,
    uploadedFiles,
    currentDraftId,
    resident
}: ReviewStepProps) {
    // Format full name safely
    const getFullName = () => {
        const firstName = resident.first_name || '';
        const lastName = resident.last_name || '';
        const middleName = resident.middle_name ? ` ${resident.middle_name}` : '';
        const suffix = resident.suffix ? ` ${resident.suffix}` : '';
        return `${firstName}${middleName} ${lastName}${suffix}`.trim();
    };

    // Format address safely
    const getAddress = () => {
        return resident.address || 'Not specified';
    };

    // Get contact number
    const getContactNumber = () => {
        return resident.contact_number || 'Not specified';
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {/* Clearance Summary */}
                <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <CardContent className="p-4 lg:p-6">
                        <h3 className="font-medium mb-4 text-lg text-gray-900 dark:text-white">Clearance Summary</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Type</span>
                                <div className="flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium text-gray-900 dark:text-white">{selectedClearance?.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Purpose</span>
                                <span className="font-medium text-right max-w-[200px] truncate text-gray-900 dark:text-white">
                                    {isCustomPurpose ? data.purpose_custom : availablePurposes.find(p => p.value === data.purpose)?.label || 'Not specified'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Date Needed</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {data.needed_date ? new Date(data.needed_date).toLocaleDateString() : 'Not specified'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Processing Time</span>
                                <span className="font-medium text-gray-900 dark:text-white">{selectedClearance?.processing_days} days</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Validity</span>
                                <span className="font-medium text-gray-900 dark:text-white">{selectedClearance?.validity_days} days</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Documents</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                                </span>
                            </div>
                            {currentDraftId && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <span className="text-gray-600 dark:text-gray-400">Draft Status</span>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                                        <Save className="h-3 w-3 mr-1" />
                                        Saved in Browser
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Applicant Info */}
                <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <CardContent className="p-4 lg:p-6">
                        <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Applicant Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-400">Name</span>
                                <span className="font-medium text-gray-900 dark:text-white">{getFullName()}</span>
                            </div>
                            {resident.address && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <span className="text-gray-600 dark:text-gray-400">Address</span>
                                    <span className="font-medium text-right max-w-[200px] truncate text-gray-900 dark:text-white">
                                        {getAddress()}
                                    </span>
                                </div>
                            )}
                            {resident.contact_number && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <span className="text-gray-600 dark:text-gray-400">Contact Number</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {getContactNumber()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Terms Agreement */}
                <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                By submitting, you confirm:
                            </p>
                            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                <li>• All information is accurate and truthful</li>
                                <li>• You have provided all required documents</li>
                                <li>• You'll receive updates on your request status</li>
                                <li>• You understand the processing timeline</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}