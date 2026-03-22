// resources/js/components/admin/blotters/show/components/tabs/details-tab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MapPin, User, Phone, FileText } from 'lucide-react';
import { Blotter } from '@/components/admin/blotters/show/types';

interface DetailsTabProps {
    blotter: Blotter;
}

export function DetailsTab({ blotter }: DetailsTabProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        Incident Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Incident Type</h3>
                        <p className="mt-1 dark:text-gray-300">{blotter.incident_type}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="dark:text-gray-300">{blotter.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Barangay {blotter.barangay}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Description</h3>
                        <p className="mt-1 whitespace-pre-wrap dark:text-gray-300">{blotter.incident_description}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Reporter Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                            <p className="mt-1 dark:text-gray-300">{blotter.reporter_name}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="dark:text-gray-300">{blotter.reporter_contact || 'N/A'}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="dark:text-gray-300">{blotter.reporter_address || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {(blotter.respondent_name || blotter.respondent_address) && (
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Respondent Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                                <p className="mt-1 dark:text-gray-300">{blotter.respondent_name || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="dark:text-gray-300">{blotter.respondent_address || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(blotter.witnesses || blotter.evidence) && (
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {blotter.witnesses && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Witnesses</h3>
                                    <p className="mt-1 whitespace-pre-wrap dark:text-gray-300">{blotter.witnesses}</p>
                                </div>
                            )}
                            {blotter.evidence && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Evidence</h3>
                                    <p className="mt-1 whitespace-pre-wrap dark:text-gray-300">{blotter.evidence}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}