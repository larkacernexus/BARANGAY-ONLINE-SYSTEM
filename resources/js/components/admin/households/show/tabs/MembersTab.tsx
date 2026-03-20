// resources/js/Pages/Admin/Households/Show/tabs/MembersTab.tsx

import { Household } from '../types';
import { MemberList } from '../components/members/MemberList';

interface MembersTabProps {
    household: Household;
}

export const MembersTab = ({ household }: MembersTabProps) => {
    return (
        <MemberList 
            members={household.household_members || []} 
            householdId={household.id} 
        />
    );
};