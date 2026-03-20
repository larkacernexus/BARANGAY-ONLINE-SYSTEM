// resources/js/Pages/Admin/Residents/Show/components/tabs/HouseholdTab.tsx

import { HouseholdManagement } from '../HouseholdManagement';
import { Resident, Household, HouseholdMembership, RelatedHouseholdMember, HouseholdOption } from '@/components/admin/residents/show/types';

interface HouseholdTabProps {
    resident: Resident;
    household?: Household | null;
    householdMembership?: HouseholdMembership | null;
    relatedMembers: RelatedHouseholdMember[];
    households?: HouseholdOption[];
    puroks?: Array<{ id: number; name: string }>;
}

export const HouseholdTab = ({ 
    resident, 
    household, 
    householdMembership, 
    relatedMembers,
    households = [],
    puroks = []
}: HouseholdTabProps) => {
    return (
        <HouseholdManagement
            resident={resident}
            household={household}
            householdMembership={householdMembership}
            relatedMembers={relatedMembers}
            households={households}
            puroks={puroks}
        />
    );
};