import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface DocumentType {
    id: number;
    name: string;
    is_required: boolean;
}

interface DocumentRequirements {
    met: boolean;
    missing: string[];
    fulfilled: string[];
}

interface DocumentRequirementsCardProps {
    clearanceName: string;
    documentTypes: DocumentType[];
    selectedDocumentTypes: Set<number>;
    documentRequirements: DocumentRequirements;
}

export function DocumentRequirementsCard({
    clearanceName,
    documentTypes,
    selectedDocumentTypes,
    documentRequirements,
}: DocumentRequirementsCardProps) {
    return (
        <Card className="lg:rounded-xl">
            <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-xs lg:text-sm">
                    <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                    Required Documents
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                <div className="space-y-2 lg:space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm font-medium">Status:</span>
                        <div className={`flex items-center gap-1 ${documentRequirements.met ? 'text-green-600' : 'text-amber-600'}`}>
                            {documentRequirements.met ? (
                                <>
                                    <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs font-medium">Complete</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs font-medium">Incomplete</span>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-1.5 lg:space-y-2">
                        <p className="text-xs text-gray-600">Required for {clearanceName}:</p>
                        <div className="space-y-1">
                            {documentTypes
                                .filter(doc => doc.is_required)
                                .map((doc, index) => {
                                    const isUploaded = selectedDocumentTypes.has(doc.id);
                                    return (
                                        <div key={index} className="flex items-center gap-1.5 lg:gap-2 text-xs">
                                            {isUploaded ? (
                                                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <div className="h-3 w-3 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                                            )}
                                            <span className="flex-1 truncate">
                                                {doc.name}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    
                    {documentRequirements.missing.length > 0 && (
                        <Alert variant="destructive" className="mt-2 lg:mt-3 p-2 lg:p-3">
                            <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                            <AlertTitle className="text-xs lg:text-sm">Missing Documents</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside space-y-1">
                                    {documentRequirements.missing.map((doc, index) => (
                                        <li key={index} className="text-xs">{doc}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}