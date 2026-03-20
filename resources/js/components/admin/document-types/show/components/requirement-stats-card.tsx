// resources/js/Pages/Admin/DocumentTypes/components/requirement-stats-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, CheckCircle, XCircle, FileCheck, FileX } from 'lucide-react';

interface Props {
    isRequired: boolean;
    isActive: boolean;
}

export const RequirementStatsCard = ({ isRequired, isActive }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <BarChart className="h-5 w-5" />
                    Requirement Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Required</span>
                    {isRequired ? (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Yes
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            No
                        </Badge>
                    )}
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                    {isActive ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Yes
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            No
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};