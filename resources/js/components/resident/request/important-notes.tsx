import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Calendar, Shield, FileText, DollarSign } from 'lucide-react';

interface ImportantNotesProps {
    processingDays?: number;
    validityDays?: number;
    requiresApproval?: boolean;
    requiresDocuments?: boolean;
    requiredCount?: number;
}

export function ImportantNotes({
    processingDays = 3,
    validityDays = 30,
    requiresApproval = false,
    requiresDocuments = false,
    requiredCount = 0,
}: ImportantNotesProps) {
    return (
        <Card className="lg:rounded-xl shadow-sm border-amber-200 dark:border-amber-800">
            <CardHeader className="p-4 lg:p-6 bg-amber-50 dark:bg-amber-900/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-sm lg:text-base font-semibold">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Important Notes & Reminders
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 space-y-3">
                <div className="space-y-2">
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10">
                        <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium">Processing Time</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Ready in <span className="font-semibold">{processingDays} working days</span>. You'll be notified when ready for pickup.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10">
                        <Calendar className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium">Validity Period</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Valid for <span className="font-semibold">{validityDays} days</span> from date of issuance.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10">
                        <Shield className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium">Claiming Requirements</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Bring a <span className="font-semibold">valid government-issued ID</span> when claiming.
                            </p>
                        </div>
                    </div>
                    
                    {requiresDocuments && requiredCount > 0 && (
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10">
                            <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium">Document Requirements</p>
                                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                                        {requiredCount} required
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                    All required documents must be uploaded before submission.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {requiresApproval && (
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10">
                            <Shield className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Barangay Approval</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                    Requires barangay official approval. Processing may take additional time.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Note: Submission times may vary during peak hours and holidays.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}