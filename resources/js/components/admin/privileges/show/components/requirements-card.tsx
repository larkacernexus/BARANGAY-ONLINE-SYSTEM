// resources/js/Pages/Admin/Privileges/components/requirements-card.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, IdCard } from 'lucide-react';

interface Privilege {
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
}

interface Props {
    privilege: Privilege;
}

export const RequirementsCard = ({ privilege }: Props) => (
    <Card className="dark:bg-gray-900">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <Shield className="h-5 w-5" />
                Requirements & Verification
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <IdCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="font-medium dark:text-gray-200">Require ID Number</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Resident must provide ID number
                        </p>
                    </div>
                </div>
                {privilege.requires_id_number ? (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        Required
                    </Badge>
                ) : (
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        Not Required
                    </Badge>
                )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="font-medium dark:text-gray-200">Requires Verification</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Privilege needs verification before use
                        </p>
                    </div>
                </div>
                {privilege.requires_verification ? (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                        Required
                    </Badge>
                ) : (
                    <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        Not Required
                    </Badge>
                )}
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Validity Period</span>
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                    {privilege.validity_years ? `${privilege.validity_years} year(s)` : 'Lifetime'}
                </Badge>
            </div>
        </CardContent>
    </Card>
);