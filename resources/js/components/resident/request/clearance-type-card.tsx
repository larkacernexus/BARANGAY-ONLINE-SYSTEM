import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, CheckCircle, XCircle, FileText, AlertCircle, Tag, Info } from 'lucide-react';

interface DocumentType {
    id: number;
    name: string;
    description: string;
    is_required: boolean;
    sort_order: number;
}

interface ClearanceType {
    id: number;
    name: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    description: string;
    document_types?: DocumentType[];
    document_types_count: number;
}

interface ClearanceTypeCardProps {
    clearanceTypes: ClearanceType[];
    selectedClearance: ClearanceType | null;
    selectedDocumentTypes: Set<number>;
    value: string;
    error?: string;
    onSelect: (value: string) => void;
}

export function ClearanceTypeCard({
    clearanceTypes,
    selectedClearance,
    selectedDocumentTypes,
    value,
    error,
    onSelect,
}: ClearanceTypeCardProps) {
    const checkDocumentRequirements = () => {
        if (!selectedClearance || !selectedClearance.document_types) {
            return { met: false, missing: [], fulfilled: [], requiredCount: 0, fulfilledCount: 0 };
        }
        
        const requiredDocuments = selectedClearance.document_types.filter(doc => doc.is_required);
        const fulfilledDocuments = requiredDocuments.filter(doc => 
            selectedDocumentTypes.has(doc.id)
        );
        
        return {
            met: fulfilledDocuments.length === requiredDocuments.length,
            fulfilledCount: fulfilledDocuments.length,
            requiredCount: requiredDocuments.length
        };
    };

    const documentRequirements = selectedClearance ? checkDocumentRequirements() : null;
    const allDocumentsUploaded = selectedClearance?.document_types?.every(
        doc => !doc.is_required || selectedDocumentTypes.has(doc.id)
    );

    return (
        <Card className="lg:rounded-xl shadow-sm">
            <CardHeader className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm lg:text-base font-semibold flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-blue-600" />
                            Clearance Type
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Choose the type you need
                        </CardDescription>
                    </div>
                    {selectedClearance && selectedClearance.document_types_count > 0 && (
                        <Badge variant="outline" className="text-xs h-5 px-1.5 gap-1">
                            <Tag className="h-3 w-3" />
                            {selectedClearance.document_types_count}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-3 lg:p-4 pt-0 space-y-3">
                <Select
                    value={value}
                    onValueChange={onSelect}
                    required
                >
                    <SelectTrigger className="h-10 text-sm border focus:border-blue-500">
                        <SelectValue placeholder="Select clearance type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                        {clearanceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()} className="py-2 text-sm">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="font-medium text-sm truncate">{type.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{type.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{type.formatted_fee}</p>
                                        <p className="text-xs text-gray-500">{type.processing_days}d</p>
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {error && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}
                
                {selectedClearance && (
                    <div className="border rounded-lg p-3 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900">
                        <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm lg:text-base text-gray-900 dark:text-white truncate">
                                    {selectedClearance.name}
                                </h3>
                                {selectedClearance.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                                        {selectedClearance.description}
                                    </p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {selectedClearance.formatted_fee}
                                </p>
                                <p className="text-xs text-gray-500">Fee</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-gray-900 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-3 w-3 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-500">Processing</p>
                                    <p className="font-semibold text-xs">{selectedClearance.processing_days} days</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-gray-900 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-3 w-3 text-green-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-500">Validity</p>
                                    <p className="font-semibold text-xs">{selectedClearance.validity_days} days</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Document Requirements Indicator */}
                        {selectedClearance.document_types && selectedClearance.document_types.length > 0 && (
                            <div className="border-t pt-2">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5 text-gray-600" />
                                        <span className="font-medium text-xs">Required Docs</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${allDocumentsUploaded ? 'text-green-600' : 'text-amber-600'}`}>
                                        {allDocumentsUploaded ? (
                                            <>
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">Complete</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">
                                                    {documentRequirements?.fulfilledCount}/{documentRequirements?.requiredCount}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                    {selectedClearance.document_types.map((doc, index) => {
                                        const isUploaded = selectedDocumentTypes.has(doc.id);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded text-xs">
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    {isUploaded ? (
                                                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3 text-gray-300 flex-shrink-0" />
                                                    )}
                                                    <span className="truncate">{doc.name}</span>
                                                </div>
                                                {doc.is_required && (
                                                    <Badge 
                                                        variant={isUploaded ? "default" : "destructive"} 
                                                        className="text-[10px] h-4 px-1.5"
                                                    >
                                                        Required
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}