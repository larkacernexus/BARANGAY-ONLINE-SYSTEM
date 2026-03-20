// resources/js/Pages/Admin/Reports/ReportTypes/components/resolution-steps-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface Props {
    resolutionSteps: any[];
}

export const ResolutionStepsTab = ({ resolutionSteps }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Activity className="h-5 w-5" />
                    Resolution Steps
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Standard process for resolving this type of report
                </CardDescription>
            </CardHeader>
            <CardContent>
                {resolutionSteps.length > 0 ? (
                    <div className="space-y-4">
                        {resolutionSteps.map((step, index) => (
                            <div key={index} className="flex gap-4 p-3 border dark:border-gray-700 rounded-lg">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{step.step}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium dark:text-gray-200">{step.action}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">No Resolution Steps Defined</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            This report type uses default resolution steps.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};