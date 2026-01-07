import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
    CheckCircle, 
    FileWarning, 
    Check,
    Clock,
    Calendar,
    AlertCircle,
    FileText
} from 'lucide-react';

interface DocumentRequirements {
    met: boolean;
    missing: string[];
    fulfilled: string[];
    requiredCount: number;
    fulfilledCount: number;
}

interface RequirementsStatusProps {
    clearanceName?: string;
    processingDays?: number;
    validityDays?: number;
    fee?: string;
    requiresPayment?: boolean;
    requiresApproval?: boolean;
    documentRequirements?: DocumentRequirements;
    clearanceTypeSelected: boolean;
    purposeSelected: boolean;
    detailsProvided: boolean;
    dateSpecified: boolean;
}

export function RequirementsStatus({
    clearanceName,
    processingDays = 0,
    validityDays = 0,
    fee = '₱0.00',
    requiresPayment = false,
    requiresApproval = false,
    documentRequirements,
    clearanceTypeSelected,
    purposeSelected,
    detailsProvided,
    dateSpecified,
}: RequirementsStatusProps) {
    return (
        <div className="space-y-6">
            {/* Order Summary */}
            <Card className="lg:rounded-xl">
                <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-base lg:text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                    <div className="space-y-3 lg:space-y-4">
                        <div className="space-y-2 lg:space-y-3">
                            <div className="flex justify-between text-xs lg:text-sm">
                                <span className="text-gray-600">Clearance Type:</span>
                                <span className="font-medium text-right max-w-[60%] truncate">
                                    {clearanceName || 'None'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs lg:text-sm">
                                <span className="text-gray-600">Fee:</span>
                                <span className="font-medium">{fee}</span>
                            </div>
                            <div className="flex justify-between text-xs lg:text-sm">
                                <span className="text-gray-600">Processing:</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {processingDays} days
                                </span>
                            </div>
                            <div className="flex justify-between text-xs lg:text-sm">
                                <span className="text-gray-600">Validity:</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {validityDays} days
                                </span>
                            </div>
                            
                            {documentRequirements && (
                                <div className="flex justify-between items-center text-xs lg:text-sm pt-2 border-t">
                                    <span className="text-gray-600">Requirements:</span>
                                    <div className={`flex items-center gap-1 ${documentRequirements.met ? 'text-green-600' : 'text-amber-600'}`}>
                                        {documentRequirements.met ? (
                                            <>
                                                <CheckCircle className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                                                <span className="text-xs font-medium">
                                                    {documentRequirements.fulfilledCount}/{documentRequirements.requiredCount}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <FileWarning className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                                                <span className="text-xs font-medium">
                                                    {documentRequirements.fulfilledCount}/{documentRequirements.requiredCount}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-1 lg:space-y-2">
                            <div className="flex justify-between font-bold text-base lg:text-lg">
                                <span>Total:</span>
                                <span>{fee}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                {requiresPayment ? 'Payment upon claim' : 'No payment required'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requirements Checklist */}
            <Card className="lg:rounded-xl">
                <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-base lg:text-lg">Requirements Status</CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                    <div className="space-y-2 lg:space-y-3">
                        <div className={`flex items-center gap-2 lg:gap-3 ${clearanceTypeSelected ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center ${clearanceTypeSelected ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {clearanceTypeSelected ? <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3" /> : <span className="text-xs">1</span>}
                            </div>
                            <span className="text-xs lg:text-sm">Clearance type selected</span>
                        </div>
                        <div className={`flex items-center gap-2 lg:gap-3 ${purposeSelected ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center ${purposeSelected ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {purposeSelected ? <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3" /> : <span className="text-xs">2</span>}
                            </div>
                            <span className="text-xs lg:text-sm">Purpose selected</span>
                        </div>
                        <div className={`flex items-center gap-2 lg:gap-3 ${documentRequirements?.met ? 'text-green-600' : 'text-amber-600'}`}>
                            <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center ${documentRequirements?.met ? 'bg-green-100' : 'bg-amber-100'}`}>
                                {documentRequirements?.met ? <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3" /> : <span className="text-xs">3</span>}
                            </div>
                            <span className="text-xs lg:text-sm">
                                Documents {documentRequirements?.met ? 'uploaded' : 'required'} 
                                {documentRequirements && ` (${documentRequirements.fulfilledCount}/${documentRequirements.requiredCount})`}
                            </span>
                        </div>
                        <div className={`flex items-center gap-2 lg:gap-3 ${detailsProvided ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center ${detailsProvided ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {detailsProvided ? <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3" /> : <span className="text-xs">4</span>}
                            </div>
                            <span className="text-xs lg:text-sm">Details provided</span>
                        </div>
                        <div className={`flex items-center gap-2 lg:gap-3 ${dateSpecified ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center ${dateSpecified ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {dateSpecified ? <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3" /> : <span className="text-xs">5</span>}
                            </div>
                            <span className="text-xs lg:text-sm">Date specified</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}