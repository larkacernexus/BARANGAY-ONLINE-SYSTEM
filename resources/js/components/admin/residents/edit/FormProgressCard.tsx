// components/admin/residents/edit/FormProgressCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Award, FileText } from 'lucide-react';

// Import types from main types file
import { ResidentFormData } from '@/types/admin/residents/residents-types';

interface Props {
    data: ResidentFormData;
    requiredFields: string[];
    optionalFields: string[];
}

export default function FormProgressCard({ data, requiredFields, optionalFields }: Props) {
    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        if (field === 'purok_id') {
            return value !== null && value !== undefined && value !== 0;
        }
        if (field === 'birth_date') {
            return value && value !== '';
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const completedOptional = optionalFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalFields = requiredFields.length + optionalFields.length;
    const totalCompleted = completedRequired + completedOptional;
    const totalProgress = Math.round((totalCompleted / totalFields) * 100);

    // Helper to safely get privileges length
    const privilegesLength = data.privileges?.length || 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                        <FileText className="h-3 w-3 text-white" />
                    </div>
                    Form Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Overall Progress */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion</span>
                            <span className={`text-sm font-bold ${
                                totalProgress === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                {totalProgress}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                    totalProgress === 100 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600' 
                                        : totalProgress >= 75 
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600' 
                                            : totalProgress >= 50 
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600' 
                                                : 'bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600'
                                }`} 
                                style={{ width: `${totalProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Required/Optional Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Required</span>
                                <div className="flex items-center gap-1">
                                    {completedRequired === requiredFields.length ? (
                                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                    )}
                                    <span className={`font-medium ${
                                        completedRequired === requiredFields.length 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-amber-600 dark:text-amber-400'
                                    }`}>
                                        {completedRequired}/{requiredFields.length}
                                    </span>
                                </div>
                            </div>
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" 
                                    style={{ width: `${(completedRequired / requiredFields.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Optional</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {completedOptional}/{optionalFields.length}
                                </span>
                            </div>
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gray-400 dark:bg-gray-500 rounded-full" 
                                    style={{ width: `${(completedOptional / optionalFields.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Benefits Count */}
                    <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Benefits</span>
                        <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                                {privilegesLength} assigned
                            </span>
                        </div>
                    </div>

                    {/* Missing Required Fields Warning */}
                    {completedRequired < requiredFields.length && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                <span className="font-medium">Missing required fields:</span>{' '}
                                {requiredFields
                                    .filter(field => {
                                        const value = data[field as keyof ResidentFormData];
                                        if (field === 'purok_id') {
                                            return value === null || value === undefined || value === 0;
                                        }
                                        if (field === 'birth_date') {
                                            return !value || value === '';
                                        }
                                        if (field === 'education_level') {
                                            return value === '' || value === null || value === undefined;
                                        }
                                        return value === '' || value === null || value === undefined;
                                    })
                                    .map(f => f.replace(/_/g, ' '))
                                    .join(', ')}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}