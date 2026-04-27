// components/admin/households/create/MembersCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, User, Home, AlertCircle, X, Plus, Shield, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import MemberSearchModal from './MemberSearchModal';

// Updated Resident interface to match MemberSearchModal expectations
interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age?: number;
    address?: string;
    purok?: string;
    purok_id?: number;
    photo_path?: string;
    photo_url?: string;
    household_status: 'none' | 'member' | 'head';
    status_label: string;
    status_color: string;
    can_be_added: boolean;
    restriction_reason?: string | null;
    current_household?: {
        id: number;
        number: string;
        is_head: boolean;
        relationship: string;
    } | null;
}

interface Member {
    id: number;
    name: string;
    relationship: string;
    age: number;
    resident_id?: number;
    purok_id?: number;
    purok_name?: string;
    photo_path?: string;
    photo_url?: string;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    availableResidents: Resident[];
    heads: Resident[];
}

const relationshipTypes = [
    'Spouse', 'Son', 'Daughter', 'Father', 'Mother',
    'Brother', 'Sister', 'Grandparent', 'Grandchild',
    'Other Relative', 'Non-relative'
];

export default function MembersCard({ data, setData, errors, availableResidents, heads }: Props) {
    const [showMemberSearch, setShowMemberSearch] = useState(false);
    const [members, setMembers] = useState<Member[]>(data.members || []);

    const updateMembers = (newMembers: Member[]) => {
        setMembers(newMembers);
        setData('members', newMembers);
    };

    const removeMember = (id: number) => {
        const memberToRemove = members.find(m => m.id === id);
        if (memberToRemove?.relationship === 'Head') {
            alert('Cannot remove the head of family. Change the head first.');
            return;
        }
        
        if (members.length > 1) {
            updateMembers(members.filter(member => member.id !== id));
        }
    };

    const updateMember = (id: number, field: string, value: string | number) => {
        updateMembers(members.map(member => 
            member.id === id ? { ...member, [field]: value } : member
        ));
    };

    const addMembers = (selectedResidents: Resident[], relationship: string) => {
        const existingResidentIds = members.map(m => m.resident_id).filter((id): id is number => id !== undefined);
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        
        const newMembers = selectedResidents
            .filter(resident => !existingResidentIds.includes(resident.id) && resident.id !== data.head_resident_id)
            .map((resident, index) => ({
                id: newId + index,
                name: `${resident.first_name} ${resident.last_name}`.trim(),
                relationship,
                age: resident.age || 0,
                resident_id: resident.id,
                purok_id: resident.purok_id,
                purok_name: resident.purok,
            }));

        if (newMembers.length > 0) {
            updateMembers([...members, ...newMembers]);
        }
        setShowMemberSearch(false);
    };

    const EmptyState = ({ icon: Icon, title, description, action }: { 
        icon: React.ElementType; 
        title: string; 
        description: string; 
        action?: React.ReactNode;
    }) => (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <Icon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
            {action}
        </div>
    );

    return (
        <>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 dark:text-gray-100">
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                <Users className="h-3 w-3 text-white" />
                            </div>
                            Household Members
                            <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-300">
                                {members.length} member{members.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowMemberSearch(true)}
                            disabled={availableResidents.length === 0}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Add Other Members
                        </Button>
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        The head of family will appear here automatically when selected above. Add other family members below.
                    </CardDescription>
                    {availableResidents.length === 0 && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="h-3 w-3" />
                            All residents already belong to households. <Link href="/admin/residents/create" className="text-blue-600 dark:text-blue-400 hover:underline">Create new residents</Link>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        {members.length === 0 ? (
                            <EmptyState
                                icon={User}
                                title="No members added"
                                description="Select a head of family from the dropdown above to start. Once selected, they will appear here automatically."
                            />
                        ) : (
                            members.map((member) => (
                                <div key={member.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-900/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                member.relationship === 'Head' 
                                                    ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-800' 
                                                    : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                            }`}>
                                                {member.relationship === 'Head' ? (
                                                    <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium flex items-center gap-2 flex-wrap dark:text-gray-100">
                                                    {member.name || `Member #${member.id}`}
                                                    {member.relationship === 'Head' && (
                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                            <Home className="h-3 w-3 mr-1" />
                                                            Head of Family
                                                        </Badge>
                                                    )}
                                                    {data.create_user_account && member.relationship === 'Head' && (
                                                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            User Account
                                                        </Badge>
                                                    )}
                                                    {member.resident_id && member.relationship !== 'Head' && (
                                                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                            <UserPlus className="h-3 w-3 mr-1" />
                                                            Existing Resident
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {member.relationship}
                                                    {member.age > 0 && ` • ${member.age} years old`}
                                                </div>
                                            </div>
                                        </div>
                                        {member.relationship !== 'Head' && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMember(member.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {/* Relationship Selection for non-head members */}
                                    {member.relationship !== 'Head' && (
                                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                            <Label htmlFor={`relationship-${member.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Relationship to Head
                                            </Label>
                                            <Select 
                                                value={member.relationship}
                                                onValueChange={(value) => updateMember(member.id, 'relationship', value)}
                                            >
                                                <SelectTrigger className="mt-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                    <SelectValue placeholder="Select relationship" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {relationshipTypes.map((relationship) => (
                                                        <SelectItem key={relationship} value={relationship} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                            {relationship}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    
                                    {!member.resident_id && member.name && member.relationship !== 'Head' && (
                                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                This member is not in the residents database yet.
                                            </div>
                                            <Link 
                                                href={`/admin/residents/create?return_to=/households/create&name=${encodeURIComponent(member.name)}&age=${member.age}&relationship=${encodeURIComponent(member.relationship)}&household_head_id=${data.head_resident_id || ''}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Add to Residents Database
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <MemberSearchModal
                open={showMemberSearch}
                onOpenChange={setShowMemberSearch}
                availableResidents={availableResidents}
                currentMembers={members}
                headResidentId={data.head_resident_id}
                onAddMembers={addMembers}
            />
        </>
    );
}