// components/ui/form/required-fields-checklist.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface RequiredField {
    label: string;
    value: boolean;
    tabId: string;
}

interface MissingField {
    field: string;
    label: string;
    tabId: string;
}

interface RequiredFieldsChecklistProps {
    fields: RequiredField[];
    onTabClick?: (tabId: string) => void;
    missingFields?: MissingField[]; // Change from string[] to MissingField[]
}

export function RequiredFieldsChecklist({ fields, onTabClick, missingFields = [] }: RequiredFieldsChecklistProps) {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Required Fields
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {fields.map((field, index) => (
                    <div 
                        key={index} 
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => onTabClick?.(field.tabId)}
                    >
                        <span className="text-sm dark:text-gray-300">{field.label}</span>
                        {field.value ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                            <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                        )}
                    </div>
                ))}
                {missingFields.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Missing:</p>
                        <div className="flex flex-wrap gap-1">
                            {missingFields.map((field, index) => (
                                <Badge 
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 cursor-pointer"
                                    onClick={() => onTabClick?.(field.tabId)} // Use field.tabId instead of hardcoded 'basic'
                                >
                                    {field.label} {/* Display the label instead of raw field name */}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}