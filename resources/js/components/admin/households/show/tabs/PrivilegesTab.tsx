// resources/js/Pages/Admin/Households/Show/tabs/PrivilegesTab.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { useMemo } from 'react';

// Import types from shared types file
import { Household, HouseholdMember, Resident, Privilege } from '@/types/admin/households/household.types';
import { getFullName, calculateAge, formatDate } from '@/types/admin/households/household.types';

// Import components
import { PrivilegesSummary } from '../components/privileges/PrivilegesSummary';
import { PrivilegesByMember } from '../components/privileges/PrivilegesByMember';
import { PrivilegeCategories } from '../components/privileges/PrivilegeCategories';

// Extended types for the component
interface ExtendedHousehold extends Household {
    household_members?: (HouseholdMember & {
        resident?: Resident;
        privileges?: Privilege[];
        privileges_list?: Privilege[];
    })[];
}

interface PrivilegesTabProps {
    household: ExtendedHousehold;
    totalPrivileges: number;
    activePrivileges: number;
    expiringSoonPrivileges: number;
    expiredPrivileges: number;
    pendingPrivileges: number;
    privilegeCounts: Record<string, number>;
}

export const PrivilegesTab = ({ 
    household,
    totalPrivileges,
    activePrivileges,
    expiringSoonPrivileges,
    expiredPrivileges,
    pendingPrivileges,
    privilegeCounts
}: PrivilegesTabProps) => {
    // Transform members to include full name and other computed fields
    const membersWithPrivileges = useMemo(() => {
        return (household.household_members || []).map(member => {
            // Get privileges from either privileges or privileges_list
            const privileges = member.privileges || member.privileges_list || [];
            
            return {
                ...member,
                full_name: member.full_name || getFullName(member.first_name, member.last_name, member.middle_name),
                age: member.age || (member.date_of_birth ? calculateAge(member.date_of_birth) : member.resident?.age),
                privileges: privileges,
                resident: member.resident
            };
        }).filter(member => member.privileges.length > 0); // Only keep members with privileges
    }, [household.household_members]);

    // Check if there are any privileges
    const hasPrivileges = totalPrivileges > 0;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Award className="h-5 w-5" />
                    Household Privileges
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    All privileges across household members
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasPrivileges ? (
                    <div className="space-y-6">
                        <PrivilegesSummary 
                            active={activePrivileges}
                            expiringSoon={expiringSoonPrivileges}
                            expired={expiredPrivileges}
                            pending={pendingPrivileges}
                        />

                        <PrivilegesByMember members={membersWithPrivileges} />
                        <PrivilegeCategories counts={privilegeCounts} />
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Award className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No privileges found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            No privileges have been assigned to any household member.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};