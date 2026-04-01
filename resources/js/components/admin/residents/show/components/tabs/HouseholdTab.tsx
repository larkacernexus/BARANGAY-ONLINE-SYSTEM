// resources/js/Pages/Admin/Residents/Show/components/tabs/HouseholdTab.tsx

import { HouseholdManagement } from '../HouseholdManagement';
import { Resident, Household } from '@/types/admin/residents/residents-types';

// Define local types that match your actual data structure
interface RelatedHouseholdMember {
    id: number;
    resident_id: number;
    relationship_to_head: string;
    is_head: boolean;
    resident: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string | null;
        age: number;
        gender: string;
        civil_status: string;
        contact_number?: string | null;
        purok_id?: number | null;
        photo_path?: string | null;
        photo_url?: string | null;
    };
}

interface HouseholdOption {
    id: number;
    household_number: string;
    head_of_family: string;
    member_count: number;
    address?: string;
    purok?: string;
}

// Define the actual household membership structure from your backend
interface HouseholdMembershipType {
    id: number;
    is_head: boolean;
    relationship?: string;
    joined_at?: string;
    household_id?: number;
    resident_id?: number;
    is_active?: boolean;
}

interface HouseholdTabProps {
    resident: Resident;
    household?: Household | null;
    householdMembership?: HouseholdMembershipType | null;
    relatedMembers: RelatedHouseholdMember[];
    households?: HouseholdOption[];
    puroks?: Array<{ id: number; name: string; code?: string }>;
}

export const HouseholdTab = ({ 
    resident, 
    household, 
    householdMembership, 
    relatedMembers = [],
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
        />
    );
};