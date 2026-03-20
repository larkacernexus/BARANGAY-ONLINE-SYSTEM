// resources/js/Pages/Admin/Households/Show/tabs/PrivilegesTab.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Household } from '../types';
import { PrivilegesSummary } from '../components/privileges/PrivilegesSummary';
import { PrivilegesByMember } from '../components/privileges/PrivilegesByMember';
import { PrivilegeCategories } from '../components/privileges/PrivilegeCategories';

interface PrivilegesTabProps {
    household: Household;
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
                {totalPrivileges > 0 ? (
                    <div className="space-y-6">
                        <PrivilegesSummary 
                            active={activePrivileges}
                            expiringSoon={expiringSoonPrivileges}
                            expired={expiredPrivileges}
                            pending={pendingPrivileges}
                        />

                        <PrivilegesByMember members={household.household_members || []} />
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