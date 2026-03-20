// resources/js/Pages/Admin/Privileges/components/requirements-tab-content.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RequirementsCard } from './requirements-card';

interface Privilege {
    requires_id_number: boolean;
    requires_verification: boolean;
    validity_years: number | null;
}

interface Props {
    privilege: Privilege;
}

export const RequirementsTabContent = ({ privilege }: Props) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <RequirementsCard privilege={privilege} />
            
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Additional Information</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Detailed requirement specifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h4 className="font-medium mb-2 dark:text-gray-200">ID Number Requirements</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {privilege.requires_id_number 
                                ? 'Residents must provide a valid ID number when this privilege is assigned. This could be government-issued ID, resident ID, or other official identification.'
                                : 'No ID number is required for this privilege. Residents can be assigned without providing identification.'}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h4 className="font-medium mb-2 dark:text-gray-200">Verification Process</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {privilege.requires_verification 
                                ? 'This privilege requires verification before it can be used. Staff must verify the resident\'s eligibility and approve the assignment.'
                                : 'No verification is required. The privilege is automatically active upon assignment.'}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h4 className="font-medium mb-2 dark:text-gray-200">Validity Period</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {privilege.validity_years 
                                ? `This privilege is valid for ${privilege.validity_years} year(s) from the date of assignment. After expiration, residents must re-apply or renew.`
                                : 'This privilege has no expiration date and remains valid indefinitely once assigned.'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};