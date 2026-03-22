// resources/js/Pages/Admin/Households/Show/components/members/MemberList.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { HouseholdMember } from '../../types';
import { MemberCard } from './MemberCard';
import AddMemberModal from './AddMemberModal';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MemberListProps {
    members: HouseholdMember[];
    householdId: number;
    availableResidents?: any[];
    headId?: number | null;
}

export const MemberList = ({ members, householdId, availableResidents = [], headId }: MemberListProps) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    
    // Fix: Add type predicate to ensure filtered array is number[]
    const currentMemberIds = members
        .map(m => m.resident_id)
        .filter((id): id is number => id !== undefined);

    // Fix: Convert undefined to null to match expected prop type
    const safeHeadId = headId === undefined ? null : headId;

    // Sort members by creation date (newest first)
    const sortedMembers = [...members].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });

    // Get member addition timeline
    const getMemberTimeline = () => {
        return sortedMembers.map(member => ({
            id: member.id,
            name: member.resident?.first_name + ' ' + member.resident?.last_name,
            relationship: member.relationship_to_head,
            addedAt: member.created_at,
            updatedAt: member.updated_at,
            isHead: member.is_head
        }));
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get relative time (e.g., "2 days ago")
    const getRelativeTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''} ago`;
    };

    const timeline = getMemberTimeline();

    return (
        <>
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
                        {members && members.length > 0 ? (
                            <>
                                {/* Member Cards */}
                                {members.map((member) => (
                                    <MemberCard key={member.id} member={member} />
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
                                                                <div className="flex items-center gap-2">
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
                availableResidents={availableResidents}
                householdId={householdId}
                currentMemberIds={currentMemberIds}
                headId={safeHeadId}
            />
        </>
    );
};