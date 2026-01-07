import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, CheckCircle, XCircle, FileWarning } from 'lucide-react';

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
    const getDocumentStatus = (docTypeId: number) => {
        return selectedDocumentTypes.has(docTypeId);
    };

    const checkDocumentRequirements = () => {
        if (!selectedClearance || !selectedClearance.document_types) {
            return { met: false, missing: [], fulfilled: [], requiredCount: 0, fulfilledCount: 0 };
        }
        
        const requiredDocuments = selectedClearance.document_types.filter(doc => doc.is_required);
        const fulfilledDocuments = requiredDocuments.filter(doc => 
            selectedDocumentTypes.has(doc.id)
        );
        const missingDocuments = requiredDocuments.filter(doc => 
            !selectedDocumentTypes.has(doc.id)
        ).map(doc => doc.name);
        
        return {
            met: missingDocuments.length === 0 && fulfilledDocuments.length > 0,
            missing: missingDocuments,
            fulfilled: fulfilledDocuments.map(doc => doc.name),
            requiredCount: requiredDocuments.length,
            fulfilledCount: fulfilledDocuments.length
        };
    };

    const documentRequirements = selectedClearance ? checkDocumentRequirements() : null;

    return (
        <Card className="lg:rounded-xl">
            <CardHeader className="p-4 lg:p-6">
                <CardTitle className="text-base lg:text-lg">Select Clearance Type</CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                    Choose the type of clearance or certificate you need
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                <Select
                    value={value}
                    onValueChange={onSelect}
                    required
                >
                    <SelectTrigger className="h-12 text-sm lg:text-base">
                        <SelectValue placeholder="Select a clearance type" />
                    </SelectTrigger>
                    <SelectContent>
                        {clearanceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                                <div className="flex items-center justify-between w-full text-sm lg:text-base">
                                    <span className="truncate">{type.name}</span>
                                    <span className="text-xs lg:text-sm font-medium ml-2">{type.formatted_fee}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {error && (
                    <p className="text-xs lg:text-sm text-red-600 mt-2">{error}</p>
                )}
                
                {selectedClearance && (
                    <div className="mt-4 lg:mt-6 p-3 lg:p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between mb-2 lg:mb-3">
                            <h3 className="font-semibold text-sm lg:text-lg truncate">{selectedClearance.name}</h3>
                            <div className="text-base lg:text-lg font-bold text-blue-600 whitespace-nowrap ml-2">
                                {selectedClearance.formatted_fee}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm mb-2 lg:mb-3">
                            <div className="flex items-center gap-1 lg:gap-2">
                                <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                                <span>{selectedClearance.processing_days} days processing</span>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-2">
                                <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                                <span>Valid for {selectedClearance.validity_days} days</span>
                            </div>
                        </div>
                        {selectedClearance.description && (
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                                {selectedClearance.description}
                            </p>
                        )}
                        
                        {/* Document Requirements Indicator */}
                        {selectedClearance.document_types_count > 0 && selectedClearance.document_types && (
                            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t">
                                <div className="flex items-center justify-between mb-1 lg:mb-2">
                                    <span className="text-xs lg:text-sm font-medium">Requirements:</span>
                                    <div className={`flex items-center gap-1 ${documentRequirements?.met ? 'text-green-600' : 'text-amber-600'}`}>
                                        {documentRequirements?.met ? (
                                            <>
                                                <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                                                <span className="text-xs">Complete</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileWarning className="h-3 w-3 lg:h-4 lg:w-4" />
                                                <span className="text-xs">Pending</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {selectedClearance.document_types.map((doc, index) => (
                                        <div key={index} className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                                            {getDocumentStatus(doc.id) ? (
                                                <CheckCircle className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-green-500" />
                                            ) : (
                                                <XCircle className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-red-500" />
                                            )}
                                            <span className="truncate">{doc.name}</span>
                                            {doc.is_required && (
                                                <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded whitespace-nowrap">Required</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}