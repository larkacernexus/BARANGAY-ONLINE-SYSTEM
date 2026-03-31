// resources/js/Pages/Admin/Households/Show/tabs/MembersTab.tsx

import { Household, HouseholdMember, Resident } from '@/types/admin/households/household.types';
import { MemberList } from '../components/members/MemberList';

interface MembersTabProps {
    household: Household & {
        household_members?: (HouseholdMember & {
            resident?: Resident;
        })[];
    };
    availableResidents?: Resident[];
    headId?: number | null;
}

export const MembersTab = ({ household, availableResidents = [], headId = null }: MembersTabProps) => {
    // Ensure members is always an array
    const members = household.household_members || [];
    
    return (
        <MemberList 
            members={members}
            householdId={household.id}
            availableResidents={availableResidents}
            headId={headId}
        />
    );
};