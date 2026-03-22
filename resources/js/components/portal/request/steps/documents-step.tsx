import { CheckCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentUpload } from '@/components/resident/request/document-upload';

interface DocumentsStepProps {
    selectedClearance: any;
    requiresDocuments: boolean;
    uploadedFiles: any[];
    selectedDocumentTypes: Set<number>;
    onFileSelect: (files: File[]) => void;
    onFileRemove: (index: number) => void;
    onDescriptionChange: (index: number, description: string) => void;
    onDocumentTypeSelect: (fileIndex: number, documentTypeId: number) => void;
    onClearAll: () => void;
}

export function DocumentsStep({
    selectedClearance,
    requiresDocuments,
    uploadedFiles,
    selectedDocumentTypes,
    onFileSelect,
    onFileRemove,
    onDescriptionChange,
    onDocumentTypeSelect,
    onClearAll
}: DocumentsStepProps) {
    return (
        <div className="space-y-6">
            <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                    {requiresDocuments ? (
                        <DocumentUpload
                            documentTypes={selectedClearance?.document_types || []}
                            uploadedFiles={uploadedFiles}
                            selectedDocumentTypes={selectedDocumentTypes}
                            onFileSelect={onFileSelect}
                            onFileRemove={onFileRemove}
                            onDescriptionChange={onDescriptionChange}
                            onDocumentTypeSelect={onDocumentTypeSelect}
                            onClearAll={onClearAll}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                                No Documents Required
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                This clearance type does not require any supporting documents
                            </p>
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                                            You can proceed directly to review
                                        </h5>
                                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• No need to upload any files</li>
                                            <li>• Review your information before submitting</li>
                                            <li>• Processing time: {selectedClearance?.processing_days} days</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}