import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, FileText, FileWarning } from 'lucide-react';

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
    const requiredDocuments = documentTypes.filter(doc => doc.is_required);
    const completedCount = requiredDocuments.filter(doc => 
        selectedDocumentTypes.has(doc.id)
    ).length;

    return (
        <Card className="lg:rounded-xl shadow-sm">
            <CardHeader className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm lg:text-base font-semibold">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Document Requirements
                    </CardTitle>
                    <Badge 
                        variant={documentRequirements.met ? "default" : "destructive"}
                        className="gap-1"
                    >
                        {completedCount}/{requiredDocuments.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 space-y-4">
                {/* Progress Indicator */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs font-medium">{completedCount}/{requiredDocuments.length}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${(completedCount / requiredDocuments.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Requirements List */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        For {clearanceName}:
                    </p>
                    <div className="space-y-1">
                        {requiredDocuments.map((doc, index) => {
                            const isUploaded = selectedDocumentTypes.has(doc.id);
                            return (
                                <div 
                                    key={index} 
                                    className={`flex items-center justify-between p-2 rounded-lg ${isUploaded ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isUploaded ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                        )}
                                        <span className="text-sm">{doc.name}</span>
                                    </div>
                                    <Badge 
                                        variant={isUploaded ? "outline" : "secondary"}
                                        className="text-xs h-5"
                                    >
                                        {isUploaded ? "Uploaded" : "Pending"}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Missing Documents Alert */}
                {documentRequirements.missing.length > 0 && (
                    <Alert variant="destructive" className="p-3">
                        <FileWarning className="h-4 w-4" />
                        <AlertTitle className="text-sm">Missing Required Documents</AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                            <ul className="space-y-1">
                                {documentRequirements.missing.map((doc, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        {doc}
                                    </li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
                
                {documentRequirements.met && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-800 dark:text-green-300">
                            All required documents are uploaded
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}