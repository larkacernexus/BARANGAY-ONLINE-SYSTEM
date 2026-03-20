import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
    CheckCircle, 
    FileWarning, 
    Clock,
    Calendar,
    AlertCircle,
    FileText,
    DollarSign,
    Shield
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
    const getCompletionStatus = () => {
        const checks = [
            clearanceTypeSelected,
            purposeSelected,
            documentRequirements?.met || documentRequirements?.requiredCount === 0,
            detailsProvided,
            dateSpecified
        ];
        const completed = checks.filter(Boolean).length;
        const total = checks.length;
        const percentage = Math.round((completed / total) * 100);
        
        return {
            completed,
            total,
            percentage,
            isComplete: completed === total
        };
    };

    const completion = getCompletionStatus();

    return (
        <div className="space-y-4">
            {/* Order Summary - Compact */}
            <Card className="lg:rounded-xl">
                <CardHeader className="p-3 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Order Summary</CardTitle>
                        {completion.isComplete ? (
                            <Badge className="h-5 gap-1 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                Ready
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="h-5 text-xs">
                                {completion.percentage}%
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-3">
                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ${
                                    completion.isComplete ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${completion.percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="h-3.5 w-3.5" />
                                <span>Clearance</span>
                            </div>
                            <span className="font-medium truncate max-w-[150px]">{clearanceName || 'Not selected'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Processing</span>
                            </div>
                            <span className="font-medium">{processingDays} days</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Validity</span>
                            </div>
                            <span className="font-medium">{validityDays} days</span>
                        </div>
                        
                        {requiresApproval && (
                            <div className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Shield className="h-3.5 w-3.5" />
                                    <span>Approval</span>
                                </div>
                                <Badge variant="outline" className="h-5 text-xs">Required</Badge>
                            </div>
                        )}
                        
                        {documentRequirements && documentRequirements.requiredCount > 0 && (
                            <div className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>Documents</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Badge 
                                        variant={documentRequirements.met ? "default" : "destructive"} 
                                        className="h-5 text-xs px-1.5"
                                    >
                                        {documentRequirements.fulfilledCount}/{documentRequirements.requiredCount}
                                    </Badge>
                                    {documentRequirements.met ? (
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                    )}
                                </div>
                            </div>
                        )}

                        <Separator className="my-2" />
                        
                        {/* Total Fee */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold">Total Fee</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-blue-600">{fee}</p>
                                <p className="text-xs text-gray-500">
                                    {requiresPayment ? 'Pay on claim' : 'No payment'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requirements Checklist - Compact */}
            <Card className="lg:rounded-xl">
                <CardHeader className="p-3 border-b">
                    <CardTitle className="text-sm font-semibold">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="space-y-2">
                        {[
                            {
                                id: 1,
                                label: 'Clearance type',
                                completed: clearanceTypeSelected,
                                icon: FileText
                            },
                            {
                                id: 2,
                                label: 'Purpose',
                                completed: purposeSelected,
                                icon: CheckCircle
                            },
                            {
                                id: 3,
                                label: 'Documents',
                                completed: documentRequirements?.met || documentRequirements?.requiredCount === 0,
                                icon: FileText,
                                status: documentRequirements ? 
                                    `${documentRequirements.fulfilledCount}/${documentRequirements.requiredCount}` : 
                                    '0/0'
                            },
                            {
                                id: 4,
                                label: 'Details',
                                completed: detailsProvided,
                                icon: CheckCircle
                            },
                            {
                                id: 5,
                                label: 'Date',
                                completed: dateSpecified,
                                icon: Calendar
                            }
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div 
                                    key={item.id}
                                    className={`flex items-center justify-between py-2 px-2 rounded transition-colors ${
                                        item.completed 
                                            ? 'bg-green-50 dark:bg-green-900/10' 
                                            : 'bg-gray-50 dark:bg-gray-900/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 flex-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            item.completed 
                                                ? 'bg-green-100 dark:bg-green-800' 
                                                : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                            {item.completed ? (
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <span className="text-xs font-medium text-gray-500">{item.id}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm truncate ${item.completed ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                                                {item.label}
                                            </p>
                                            {item.status && (
                                                <p className="text-xs text-gray-500">{item.status}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {item.completed ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}