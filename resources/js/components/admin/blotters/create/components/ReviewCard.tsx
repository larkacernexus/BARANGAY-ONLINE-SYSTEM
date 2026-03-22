// components/blotter/ReviewCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { IncidentType, Resident } from './BlotterTypes';
import { JSX } from 'react';

interface ReviewCardProps {
    selectedType: IncidentType | null;
    incidentDatetime: string;
    location: string;
    priority: string;
    description: string;
    reporterName: string;
    reporterContact: string;
    reporterAddress: string;
    reporterIsResident: boolean;
    respondentName: string;
    respondentAddress: string;
    respondentIsResident: boolean;
    selectedResidents: Resident[];
    witnesses: string;
    evidence: string;
    attachmentsCount: number;
    getPriorityIcon: (priority: string) => JSX.Element;
    getPriorityColor: (priority: string) => string;
}

export const ReviewCard = ({
    selectedType,
    incidentDatetime,
    location,
    priority,
    description,
    reporterName,
    reporterContact,
    reporterAddress,
    reporterIsResident,
    respondentName,
    respondentAddress,
    respondentIsResident,
    selectedResidents,
    witnesses,
    evidence,
    attachmentsCount,
    getPriorityIcon,
    getPriorityColor
}: ReviewCardProps) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Eye className="h-5 w-5" />
                    Review & Submit
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Review all information before submitting the blotter
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Incident Summary */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Incident Details</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Type:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedType?.name || 'Not specified'}</span>
                            <span className="text-gray-500 dark:text-gray-400">Date/Time:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                                {incidentDatetime ? new Date(incidentDatetime).toLocaleString() : 'Not set'}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">Location:</span>
                            <span className="text-gray-900 dark:text-gray-100">{location}</span>
                            <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                            <span className={`flex items-center gap-1 ${getPriorityColor(priority)}`}>
                                {getPriorityIcon(priority)}
                                {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Description:</span>
                            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{description}</p>
                        </div>
                    </div>
                </div>

                {/* Parties Summary */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Parties Involved</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 block">Reporter:</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {reporterName}
                                {reporterIsResident && <Badge variant="outline" className="ml-2 text-xs">Resident</Badge>}
                            </p>
                            {reporterContact && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">📞 {reporterContact}</p>
                            )}
                            {reporterAddress && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">📍 {reporterAddress}</p>
                            )}
                        </div>
                        {respondentName && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 block">Respondent:</span>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {respondentName}
                                    {respondentIsResident && <Badge variant="outline" className="ml-2 text-xs">Resident</Badge>}
                                </p>
                                {respondentAddress && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">📍 {respondentAddress}</p>
                                )}
                            </div>
                        )}
                        {selectedResidents.length > 0 && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 block">Other Involved:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedResidents.map(r => (
                                        <Badge key={r.id} variant="secondary" className="text-xs">
                                            {r.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Info Summary */}
                {(witnesses || evidence || attachmentsCount > 0) && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Additional Information</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                            {witnesses && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Witnesses:</span>
                                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{witnesses}</p>
                                </div>
                            )}
                            {evidence && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Evidence:</span>
                                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{evidence}</p>
                                </div>
                            )}
                            {attachmentsCount > 0 && (
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Attachments:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{attachmentsCount} file(s) attached</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};