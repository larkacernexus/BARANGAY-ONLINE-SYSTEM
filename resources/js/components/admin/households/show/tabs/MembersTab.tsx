// resources/js/Pages/Admin/Households/Show/tabs/MembersTab.tsx

import { Household } from '../types';
import { MemberList } from '../components/members/MemberList';

interface MembersTabProps {
    household: Household;
    availableResidents?: any[];
    headId?: number | null;
}

export const MembersTab = ({ household, availableResidents = [], headId = null }: MembersTabProps) => {
    return (
        <MemberList 
            members={household.household_members || []} 
            householdId={household.id}
            availableResidents={availableResidents}
            headId={headId}
        />
    );
};