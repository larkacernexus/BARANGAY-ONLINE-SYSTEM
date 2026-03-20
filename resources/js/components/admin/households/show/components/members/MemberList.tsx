// resources/js/Pages/Admin/Households/Show/components/members/MemberList.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import { HouseholdMember } from '../../types';
import { MemberCard } from './MemberCard';

interface MemberListProps {
    members: HouseholdMember[];
    householdId: number;
}

export const MemberList = ({ members, householdId }: MemberListProps) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Users className="h-5 w-5" />
                            Household Members
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            All residents belonging to this household
                        </CardDescription>
                    </div>
                    <Link href={route('admin.residents.create', { household_id: householdId })}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {members && members.length > 0 ? (
                        members.map((member) => (
                            <MemberCard key={member.id} member={member} />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No members found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                This household has no members yet.
                            </p>
                            <Link href={route('admin.residents.create', { household_id: householdId })}>
                                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add First Member
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};