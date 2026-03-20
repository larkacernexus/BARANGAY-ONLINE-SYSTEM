// components/admin/residents/create/forms/FormSummaryCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Award, FileText } from 'lucide-react';
import { ResidentFormData } from '@/components/admin/residents/create/hooks/useResidentForm';

interface Props {
    data: ResidentFormData;
    requiredFields: string[];
}

export default function FormSummaryCard({ data, requiredFields }: Props) {
    const optionalFields = [
        'middle_name', 'suffix', 'email', 'occupation', 
        'education', 'religion', 'place_of_birth', 'remarks'
    ];

    const completedRequired = requiredFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        if (field === 'purok_id' || field === 'household_id') {
            return value !== null && value !== undefined && value !== 0;
        }
        if (field === 'new_household_name') {
            return value !== '' && value !== null && value !== undefined;
        }
        if (field === 'birth_date') {
            return value !== '' && value !== null && value !== undefined;
        }
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const completedOptional = optionalFields.filter(field => {
        const value = data[field as keyof ResidentFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalProgress = Math.round(
        ((completedRequired + completedOptional) / (requiredFields.length + optionalFields.length)) * 100
    );

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm dark:text-gray-100">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                        <FileText className="h-3 w-3 text-white" />
                    </div>
                    Form Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Required Fields</span>
                            <div className="flex items-center gap-2">
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

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Optional Fields</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {completedOptional}/{optionalFields.length}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                            <div className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                <span className="font-medium text-purple-600 dark:text-purple-400">
                                    {data.privileges.length} assigned
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm font-medium mb-2">
                            <span className="text-gray-700 dark:text-gray-300">Total Progress</span>
                            <span className={totalProgress === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                                {totalProgress}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                    totalProgress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600' : 
                                    totalProgress >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600' : 
                                    'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600'
                                }`} 
                                style={{ width: `${totalProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Required Fields Remaining */}
                    {completedRequired < requiredFields.length && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                <span className="font-medium">Missing required fields:</span>{' '}
                                {requiredFields
                                    .filter(field => {
                                        const value = data[field as keyof ResidentFormData];
                                        if (field === 'purok_id' || field === 'household_id') {
                                            return value === null || value === undefined || value === 0;
                                        }
                                        if (field === 'new_household_name') {
                                            return value === '' || value === null || value === undefined;
                                        }
                                        if (field === 'birth_date') {
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