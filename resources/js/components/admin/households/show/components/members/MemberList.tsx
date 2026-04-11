// resources/js/Pages/Admin/Households/Show/components/members/MemberList.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Clock, Calendar, ChevronDown, ChevronUp, AlertCircle, Award, Shield } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import types from shared types file
import { 
    HouseholdMember, 
    Resident, 
    ExtendedMember
} from '@/types/admin/households/household.types';
import { 
    getFullName, 
    formatDate, 
    getRelativeTime
} from '@/types/admin/households/household.types';

// Import components
import { MemberCard } from './MemberCard';
import AddMemberModal from './AddMemberModal';

// Local safe version of getRelationshipLabel
const getRelationshipLabelSafe = (relationship: string | undefined | null): string => {
    if (!relationship) return 'Unknown';
    
    const labels: Record<string, string> = {
        head: 'Head of Family',
        spouse: 'Spouse',
        child: 'Child',
        parent: 'Parent',
        sibling: 'Sibling',
        grandparent: 'Grandparent',
        other: 'Other'
    };
    return labels[relationship.toLowerCase()] || relationship;
};

// ========== PRIVILEGE HELPER FUNCTIONS ==========

/**
 * Get privilege icon based on code
 */
function getPrivilegeIcon(code: string): string {
    const codeUpper = (code || '').toUpperCase();
    
    const iconMap: Record<string, string> = {
        'SC': '👴',
        'SENIOR': '👴',
        'OSP': '👴',
        'PWD': '♿',
        'SP': '👨‍👧',
        'SOLO_PARENT': '👨‍👧',
        'IND': '🏠',
        'INDIGENT': '🏠',
        '4PS': '📦',
        'IP': '🌿',
        'FRM': '🌾',
        'FSH': '🎣',
        'OFW': '✈️',
        'SCH': '📚',
        'STUDENT': '📚',
        'UNE': '💼',
        'VETERAN': '🎖️',
    };
    
    if (iconMap[codeUpper]) {
        return iconMap[codeUpper];
    }
    
    const firstChar = codeUpper[0] || 'A';
    const fallbackMap: Record<string, string> = {
        'S': '👴',
        'P': '♿',
        'I': '🏠',
        'F': '🌾',
        'O': '✈️',
        '4': '📦',
        'U': '💼',
        'V': '🎖️',
    };
    
    return fallbackMap[firstChar] || '🎫';
}

/**
 * Get privilege color for badge
 */
function getPrivilegeBadgeColor(code: string): string {
    const codeUpper = (code || '').toUpperCase();
    
    const colorMap: Record<string, string> = {
        'SC': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        'SENIOR': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        'OSP': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        'PWD': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        'SP': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        'SOLO_PARENT': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        'IND': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        'INDIGENT': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        '4PS': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
        'IP': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        'VETERAN': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    
    if (colorMap[codeUpper]) {
        return colorMap[codeUpper];
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
}

/**
 * Get active privileges from resident
 */
function getActivePrivileges(resident: any): any[] {
    if (!resident?.privileges || !Array.isArray(resident.privileges)) {
        return [];
    }
    
    return resident.privileges.filter((p: any) => {
        if (p.status) {
            return p.status === 'active' || p.status === 'expiring_soon';
        }
        
        const isVerified = p.verified_at;
        const isExpired = p.expires_at && new Date(p.expires_at) <= new Date();
        
        return isVerified && !isExpired;
    });
}

/**
 * Get privilege badges for display
 */
function getPrivilegeBadges(resident: any): Array<{
    code: string;
    name: string;
    icon: string;
    color: string;
    id_number?: string;
    discount_percentage?: number;
    expires_at?: string;
}> {
    const activePrivileges = getActivePrivileges(resident);
    
    return activePrivileges.map((p: any) => {
        const privilege = p.privilege || p;
        const code = privilege.code || p.code;
        const discountPercentage = p.discount_percentage ?? privilege.discount_percentage ?? 0;
        const name = privilege.name || p.name || code;
        
        return {
            code: code,
            name: name,
            icon: getPrivilegeIcon(code),
            color: getPrivilegeBadgeColor(code),
            id_number: p.id_number,
            discount_percentage: typeof discountPercentage === 'number' ? discountPercentage : parseFloat(discountPercentage) || 0,
            expires_at: p.expires_at,
        };
    });
}

interface MemberListProps {
    members: (HouseholdMember & {
        resident?: Resident;
    })[];
    householdId: number;
    availableResidents?: Resident[];
    headId?: number | null;
}

// Extended Resident type for modal
interface ExtendedResident extends Resident {
    full_name: string;
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

export const MemberList = ({ members, householdId, availableResidents = [], headId }: MemberListProps) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    
    // Transform availableResidents to ExtendedResident type for the modal
    const extendedAvailableResidents: ExtendedResident[] = useMemo(() => {
        return availableResidents.map(resident => {
            const isHeadOfAnotherHousehold = (resident as any).is_head_of_household === true;
            const currentHousehold = (resident as any).current_household;
            
            let household_status: 'none' | 'member' | 'head' = 'none';
            
            if (isHeadOfAnotherHousehold) {
                household_status = 'head';
            } else if (currentHousehold) {
                household_status = 'member';
            } else {
                household_status = 'none';
            }
            
            return {
                ...resident,
                full_name: getFullName(resident.first_name, resident.last_name, resident.middle_name),
                household_status,
                status_label: household_status === 'head' ? 'Head of Another Household' : 
                              household_status === 'member' ? 'In Another Household' : 'Available',
                status_color: household_status === 'head' ? 'amber' : 
                             household_status === 'member' ? 'purple' : 'gray',
                can_be_added: household_status !== 'head',
                restriction_reason: household_status === 'head' 
                    ? 'Resident is already head of another household' 
                    : household_status === 'member'
                    ? 'Resident already belongs to another household. Adding will transfer them.'
                    : null,
                current_household: currentHousehold ? {
                    id: currentHousehold.id,
                    number: currentHousehold.household_number || currentHousehold.number,
                    is_head: currentHousehold.is_head || false,
                    relationship: currentHousehold.relationship || ''
                } : null
            };
        });
    }, [availableResidents]);
    
    // Cast members to ExtendedMember[] with safe relationship
    const extendedMembers: ExtendedMember[] = useMemo(() => {
        return members.map(member => ({
            ...member,
            resident: member.resident,
            relationship: member.relationship || 'other'
        })) as ExtendedMember[];
    }, [members]);

    // Get current member IDs (filter out undefined)
    const currentMemberIds = useMemo(() => {
        return members
            .map(m => m.resident_id)
            .filter((id): id is number => id !== undefined);
    }, [members]);

    // Sort members by creation date (newest first)
    const sortedMembers = useMemo(() => {
        return [...extendedMembers].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });
    }, [extendedMembers]);

    // Get member addition timeline - using safe relationship label
    const timeline = useMemo(() => {
        return sortedMembers.map(member => {
            const name = getFullName(member.first_name, member.last_name, member.middle_name);
            const relationship = getRelationshipLabelSafe(member.relationship);
            
            return {
                id: member.id,
                name: name || 'Unknown Member',
                relationship: relationship,
                addedAt: member.created_at,
                updatedAt: member.updated_at,
                isHead: member.is_head === true
            };
        });
    }, [sortedMembers]);

    // Safe head ID (convert undefined to null)
    const safeHeadId = headId === undefined ? null : headId;

    // Check if members array is valid
    const hasMembers = extendedMembers && extendedMembers.length > 0;

    // Render privilege badges for a resident
    const renderPrivilegeBadges = (resident: any) => {
        if (!resident) return null;
        
        const privilegeBadges = getPrivilegeBadges(resident);
        
        if (privilegeBadges.length === 0) return null;
        
        return (
            <div className="flex flex-wrap gap-1 mt-2">
                {privilegeBadges.map((badge, idx) => (
                    <TooltipProvider key={idx}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge 
                                    variant="outline" 
                                    className={cn(
                                        "text-xs px-2 py-0.5 cursor-help",
                                        badge.color
                                    )}
                                >
                                    <span className="mr-1">{badge.icon}</span>
                                    {badge.name.length > 15 ? badge.name.substring(0, 12) + '…' : badge.name}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="space-y-1">
                                    <p className="font-medium">{badge.name}</p>
                                    {badge.discount_percentage !== undefined && badge.discount_percentage > 0 && (
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            {badge.discount_percentage}% Discount
                                        </p>
                                    )}
                                    {badge.id_number && (
                                        <p className="text-xs text-gray-500">ID: {badge.id_number}</p>
                                    )}
                                    {badge.expires_at && (
                                        <p className="text-xs text-orange-500">Expires: {formatDate(badge.expires_at)}</p>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        );
    };

    return (
        <>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <Users className="h-5 w-5" />
                                Household Members
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                All residents belonging to this household
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="dark:border-gray-600 dark:text-gray-300"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {hasMembers ? (
                            <>
                                {/* Member Cards */}
                                {sortedMembers.map((member) => (
                                    <div key={member.id} className="relative">
                                        <MemberCard 
                                            member={member}
                                            isHead={member.is_head === true || member.id === safeHeadId}
                                        />
                                        {/* Show privileges for the resident */}
                                        {member.resident && renderPrivilegeBadges(member.resident)}
                                    </div>
                                ))}

                                {/* Timeline Section */}
                                {timeline.length > 0 && (
                                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                                        <button
                                            onClick={() => setShowTimeline(!showTimeline)}
                                            className="flex items-center justify-between w-full group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Member Addition Timeline
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {timeline.length} {timeline.length === 1 ? 'member' : 'members'}
                                                </Badge>
                                            </div>
                                            {showTimeline ? (
                                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                                            )}
                                        </button>
                                        
                                        {showTimeline && (
                                            <div className="mt-4 space-y-3">
                                                {timeline.map((item, index) => (
                                                    <div 
                                                        key={item.id}
                                                        className={cn(
                                                            "relative pl-6 pb-4",
                                                            index !== timeline.length - 1 && "border-l-2 border-gray-200 dark:border-gray-700"
                                                        )}
                                                    >
                                                        {/* Timeline dot */}
                                                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                                                        
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {item.name}
                                                                    {item.isHead && (
                                                                        <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                                                                            Head
                                                                        </Badge>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Relationship: {item.relationship}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Added {formatDate(item.addedAt)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                                    {getRelativeTime(item.addedAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Show update info if different from creation */}
                                                        {item.updatedAt && item.updatedAt !== item.addedAt && (
                                                            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>Updated: {formatDate(item.updatedAt)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No members found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    This household has no members yet.
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="dark:border-gray-600 dark:text-gray-300"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add First Member
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AddMemberModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                availableResidents={extendedAvailableResidents}
                householdId={householdId}
                currentMemberIds={currentMemberIds}
                headId={safeHeadId}
            />
        </>
    );
};