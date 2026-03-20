// resources/js/Pages/Admin/ClearanceTypes/components/eligibility-criteria-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { getFieldLabel, getOperatorLabel } from '../utils/helpers';

interface Props {
    criteria: any[];
}

export const EligibilityCriteriaCard = ({ criteria }: Props) => {
    if (criteria.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Shield className="h-5 w-5" />
                    Eligibility Criteria
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Requirements that applicants must meet
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {criteria.map((criterion, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border dark:border-gray-700 rounded-lg">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium dark:text-gray-200">{getFieldLabel(criterion.field)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Must be {getOperatorLabel(criterion.operator)} {criterion.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};