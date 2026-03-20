// resources/js/Pages/Admin/Reports/ReportTypes/components/required-fields-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListChecks } from 'lucide-react';

interface Props {
    requiredFields: any[];
}

export const RequiredFieldsTab = ({ requiredFields }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <ListChecks className="h-5 w-5" />
                    Required Fields
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Fields that must be filled when submitting this report type
                </CardDescription>
            </CardHeader>
            <CardContent>
                {requiredFields.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {requiredFields.map((field, index) => (
                            <Card key={index} className="border dark:border-gray-700 dark:bg-gray-900">
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium dark:text-gray-200">{field.label}</span>
                                                {field.required && (
                                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Key: <span className="font-mono">{field.key}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Type: <span className="capitalize">{field.type}</span>
                                            </p>
                                            {field.placeholder && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Placeholder: "{field.placeholder}"
                                                </p>
                                            )}
                                            {field.options && field.options.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-medium mb-1 dark:text-gray-300">Options:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {field.options.map((opt: string, i: number) => (
                                                            <Badge key={i} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                                {opt}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <ListChecks className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">No Custom Fields</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            This report type uses default fields only.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};