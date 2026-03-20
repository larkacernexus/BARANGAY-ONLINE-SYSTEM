// resources/js/Pages/Admin/Fees/components/fee-requirements-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FileCheck,
    FileText,
    CheckCircle,
} from 'lucide-react';
import { Fee } from '../types';

interface Props {
    fee: Fee;
    submittedRequirements: string[];
}

export const FeeRequirementsTab = ({ fee, submittedRequirements }: Props) => {
    return (
        <div>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FileCheck className="h-5 w-5" />
                        Requirements
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Requirements for this fee type and submitted documents
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Fee Type Requirements */}
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Fee Type Requirements</p>
                            {(() => {
                                const requirements = fee.fee_type?.requirements;
                                let requirementsArray: string[] = [];
                                
                                if (requirements) {
                                    if (Array.isArray(requirements)) {
                                        requirementsArray = requirements;
                                    } else if (typeof requirements === 'string') {
                                        try {
                                            const parsed = JSON.parse(requirements);
                                            requirementsArray = Array.isArray(parsed) ? parsed : [];
                                        } catch {
                                            requirementsArray = [];
                                        }
                                    }
                                }
                                
                                if (requirementsArray.length > 0) {
                                    return (
                                        <ul className="space-y-2">
                                            {requirementsArray.map((req: string, index: number) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="text-sm dark:text-gray-300">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                }
                                return <p className="text-gray-500 dark:text-gray-400 text-sm">No requirements specified for this fee type.</p>;
                            })()}
                        </div>

                        {/* Submitted Requirements */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Submitted Requirements</p>
                            {(() => {
                                if (submittedRequirements.length > 0) {
                                    return (
                                        <ul className="space-y-2">
                                            {submittedRequirements.map((req: string, index: number) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                    <span className="text-sm dark:text-gray-300">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                }
                                return <p className="text-gray-500 dark:text-gray-400 text-sm">No requirements submitted for this fee.</p>;
                            })()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};