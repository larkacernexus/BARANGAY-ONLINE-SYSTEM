import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

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
        <Card className="lg:rounded-xl">
            <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-xs lg:text-sm">
                    <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                    Important Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                <ul className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm">
                    <li className="flex items-start gap-1.5 lg:gap-2">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                        <span>Ready in {processingDays} working days</span>
                    </li>
                    <li className="flex items-start gap-1.5 lg:gap-2">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                        <span>Bring valid ID when claiming</span>
                    </li>
                    <li className="flex items-start gap-1.5 lg:gap-2">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                        <span>Valid for {validityDays} days</span>
                    </li>
                    {requiresApproval && (
                        <li className="flex items-start gap-1.5 lg:gap-2">
                            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"></div>
                            <span>Requires barangay approval</span>
                        </li>
                    )}
                    {requiresDocuments && requiredCount > 0 && (
                        <li className="flex items-start gap-1.5 lg:gap-2">
                            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0"></div>
                            <span>{requiredCount} required document{requiredCount !== 1 ? 's' : ''}</span>
                        </li>
                    )}
                </ul>
            </CardContent>
        </Card>
    );
}