// components/admin/clearances/create/requirements-tab.tsx
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info, Shield, DollarSign, Clock, Calendar, FileText, AlertCircle } from 'lucide-react';
import type { ClearanceType } from '@/types/admin/clearances/clearance';

interface RequirementsTabProps {
    requirements: string[];
    selectedClearanceType: ClearanceType | null;
    formatCurrency: (amount: number) => string;
    // Optional props for edit mode
    hasDocuments?: boolean;
    documentsCount?: number;
    verifiedDocuments?: number;
}

export function RequirementsTab({
    requirements,
    selectedClearanceType,
    formatCurrency,
    hasDocuments = false,
    documentsCount = 0,
    verifiedDocuments = 0
}: RequirementsTabProps) {
    const hasRequirements = requirements.length > 0;
    const isVerified = verifiedDocuments === documentsCount && documentsCount > 0;

    return (
        <div className="space-y-4">
            {/* Requirements Checklist */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium dark:text-gray-300">Requirements Checklist</h3>
                    {hasDocuments && (
                        <Badge className={isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                            {verifiedDocuments}/{documentsCount} Verified
                        </Badge>
                    )}
                </div>
                
                {hasRequirements ? (
                    <ul className="space-y-2">
                        {requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm dark:text-gray-300">
                                <div className="mt-0.5 text-blue-500 dark:text-blue-400">•</div>
                                <span>{requirement}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No specific requirements listed</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Standard requirements may apply based on clearance type
                        </p>
                    </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Note:</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        These requirements will need to be verified during processing.
                        Additional requirements may be requested based on your specific situation.
                    </p>
                </div>
            </div>

            {/* Clearance Type Details */}
            {selectedClearanceType && (
                <div className="pt-4 border-t dark:border-gray-700">
                    <h3 className="text-sm font-medium dark:text-gray-300 mb-4">Clearance Type Details</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                            <div className="text-sm font-medium dark:text-gray-300">
                                {selectedClearanceType.description || 'No description available'}
                            </div>
                        </div>

                        {selectedClearanceType.is_popular && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm font-medium">Popular Clearance Type</span>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    This clearance type is frequently requested by residents
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Normal Processing</div>
                                <div className="text-sm font-medium flex items-center gap-1 dark:text-gray-300">
                                    <Clock className="h-3 w-3" />
                                    {selectedClearanceType.processing_days} business day{selectedClearanceType.processing_days !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Validity Period</div>
                                <div className="text-sm font-medium flex items-center gap-1 dark:text-gray-300">
                                    <Calendar className="h-3 w-3" />
                                    {selectedClearanceType.validity_days} day{selectedClearanceType.validity_days !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedClearanceType.requires_payment && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Paid Service
                                </Badge>
                            )}
                            {selectedClearanceType.requires_approval && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Needs Approval
                                </Badge>
                            )}
                            {selectedClearanceType.requires_documents && (
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Documents Required
                                </Badge>
                            )}
                            {selectedClearanceType.requires_payment && selectedClearanceType.fee === 0 && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Free Service
                                </Badge>
                            )}
                        </div>

                        {/* Fee Information */}
                        {selectedClearanceType.requires_payment && selectedClearanceType.fee > 0 && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Standard Fee</div>
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(selectedClearanceType.fee)}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Fees are subject to change based on urgency and applicable discounts
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Document Status (for edit mode) */}
            {hasDocuments && documentsCount > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Documents Status</span>
                    </div>
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-700 dark:text-blue-400">Submitted Documents:</span>
                            <span className="font-medium text-blue-800 dark:text-blue-300">{documentsCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-700 dark:text-blue-400">Verified Documents:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{verifiedDocuments}</span>
                        </div>
                        {verifiedDocuments < documentsCount && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    {documentsCount - verifiedDocuments} document(s) pending verification
                                </p>
                            </div>
                        )}
                        {isVerified && documentsCount > 0 && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    All documents have been verified
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📋 Requirements Guide</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>All requirements must be submitted for processing</li>
                            <li>Original documents may be required for verification</li>
                            <li>Additional requirements may be requested based on clearance type</li>
                            <li>Requirements are subject to change based on LGU policies</li>
                            <li>Documents can be uploaded online or submitted in person</li>
                            <li>Keep digital copies of all requirements for reference</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}