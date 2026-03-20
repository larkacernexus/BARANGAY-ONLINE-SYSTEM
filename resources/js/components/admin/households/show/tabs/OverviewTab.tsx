// resources/js/Pages/Admin/Households/Show/tabs/OverviewTab.tsx

import { Household } from '../types';
import { HouseholdInfo } from '../household/HouseholdInfo';
import { HousingInfo } from '../household/HousingInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface OverviewTabProps {
    household: Household;
}

export const OverviewTab = ({ household }: OverviewTabProps) => {
    return (
        <>
            <HouseholdInfo household={household} />
            <HousingInfo household={household} />
            
            {household.remarks && (
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <FileText className="h-5 w-5" />
                            Remarks & Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap dark:text-gray-300">{household.remarks}</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
};