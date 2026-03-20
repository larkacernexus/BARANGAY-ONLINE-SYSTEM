// resources/js/Pages/Admin/Residents/Show/components/HouseholdManagement.tsx

import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { 
    Resident, 
    Household, 
    HouseholdMembership, 
    RelatedHouseholdMember,
    HouseholdOption 
} from '../types';
import { formatRelationship, getRelationshipColor } from '@/components/admin/residents/show/utils/badge-utils';
import { getPhotoUrl } from '@/components/admin/residents/show/utils/helpers';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

// Icons
import { 
    Home, 
    Users2, 
    Crown, 
    ExternalLink, 
    X, 
    Loader2, 
    Search, 
    Check, 
    UserPlus,
    User
} from 'lucide-react';

interface HouseholdManagementProps {
    resident: Resident;
    household?: Household | null;
    householdMembership?: HouseholdMembership | null;
    relatedMembers: RelatedHouseholdMember[];
    households?: HouseholdOption[];
}

// Helper function to get initials from name
const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const HouseholdManagement = ({ 
    resident, 
    household, 
    householdMembership, 
    relatedMembers,
    households = [],
}: HouseholdManagementProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'select' | 'create'>('select');
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [relationship, setRelationship] = useState<string>('');

    // Toggle logic: Auto-set 'head' for new households, reset for selection
    useEffect(() => {
        if (mode === 'create') setRelationship('head');
        else setRelationship('');
    }, [mode]);

    const relationshipOptions = [
        { value: 'head', label: 'Head of Household' },
        { value: 'spouse', label: 'Spouse' },
        { value: 'son', label: 'Son' },
        { value: 'daughter', label: 'Daughter' },
        { value: 'father', label: 'Father' },
        { value: 'mother', label: 'Mother' },
        { value: 'other', label: 'Other/Relative' },
    ];

    const filteredHouseholds = households.filter(h => 
        h.household_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.head_of_family.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Validation logic for the assignment button
    const isAssignDisabled = !selectedHouseholdId || !relationship || isSubmitting;

    const handleAddToHousehold = () => {
        if (isAssignDisabled) return;
        setIsSubmitting(true);
        router.post(`/admin/residents/${resident.id}/assign-household`, {
            household_id: selectedHouseholdId,
            relationship: relationship
        }, {
            onSuccess: () => {
                setIsOpen(false);
                resetForm();
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    const handleCreateHousehold = () => {
        router.visit(route('admin.households.create', {
            head_resident_id: resident.id,
            from_resident: resident.id
        }));
    };

    const handleRemoveFromHousehold = () => {
        if (!confirm('Are you sure you want to remove this resident from the household?')) return;
        setIsSubmitting(true);
        router.delete(`/admin/residents/${resident.id}/remove-from-household`, {
            onFinish: () => setIsSubmitting(false)
        });
    };

    const resetForm = () => {
        setMode('select');
        setSelectedHouseholdId('');
        setSearchTerm('');
        setRelationship('');
    };

    if (household && householdMembership) {
        return (
            <div className="space-y-4">
                <Card className="dark:bg-gray-900 border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Current Household
                        </CardTitle>
                        <Badge className={`${getRelationshipColor(householdMembership.relationship_to_head)} px-2 py-1`}>
                            {householdMembership.is_head && <Crown className="h-3 w-3 mr-1 inline" />}
                            {formatRelationship(householdMembership.relationship_to_head)}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        <Home className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold dark:text-gray-100">HH #{household.household_number}</p>
                                        <p className="text-xs text-gray-500">{household.address}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="font-mono">
                                    {household.member_count} Members
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('admin.households.show', household.id)} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full h-9">
                                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                        Manage Members
                                    </Button>
                                </Link>
                                {!householdMembership.is_head && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={handleRemoveFromHousehold}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {relatedMembers.length > 0 && (
                    <Card className="dark:bg-gray-900 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Users2 className="h-4 w-4 text-blue-500" />
                                Living with ({relatedMembers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-2 pb-2">
                            <div className="space-y-1 max-h-[300px] overflow-y-auto px-2">
                                {relatedMembers.map((member) => (
                                    <Link 
                                        key={member.id} 
                                        href={route('admin.residents.show', member.resident.id)}
                                        className={`flex items-center justify-between p-2 rounded-md transition-colors border ${
                                            member.resident.id === resident.id 
                                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                                                    <AvatarImage 
                                                        src={getPhotoUrl(member.resident.photo_path, member.resident.photo_url)} 
                                                        alt={`${member.resident.first_name} ${member.resident.last_name}`}
                                                    />
                                                    <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                                                        {getInitials(member.resident.first_name, member.resident.last_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {member.is_head && (
                                                    <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5 border border-white dark:border-gray-800">
                                                        <Crown className="h-2 w-2 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold dark:text-gray-200">
                                                    {member.resident.first_name} {member.resident.last_name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 uppercase">
                                                    {formatRelationship(member.relationship_to_head)}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <>
            <Card className="dark:bg-gray-900 border-dashed border-2">
                <CardContent className="pt-8 pb-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 rounded-full mb-4">
                            <Home className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold dark:text-white mb-1">Unassigned Resident</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[250px] mx-auto">
                            Associate this resident with a household to manage family records and clearances.
                        </p>
                        <Button 
                            onClick={() => setIsOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Household
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-[450px] dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle>Household Assignment</DialogTitle>
                        <DialogDescription>
                            Place {resident.first_name} into a family unit.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                        <button 
                            onClick={() => setMode('select')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'select' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            Select Existing
                        </button>
                        <button 
                            onClick={() => setMode('create')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'create' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                        >
                            New Household
                        </button>
                    </div>

                    {mode === 'select' ? (
                        <div className="space-y-4 py-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by HH# or Head Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>

                            <div className="max-h-52 overflow-y-auto rounded-md border dark:border-gray-700">
                                {filteredHouseholds.length > 0 ? (
                                    filteredHouseholds.map((h) => (
                                        <div
                                            key={h.id}
                                            className={`p-3 cursor-pointer border-b last:border-0 hover:bg-blue-50 dark:hover:bg-blue-900/10 ${selectedHouseholdId === h.id.toString() ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                            onClick={() => setSelectedHouseholdId(h.id.toString())}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold">HH #{h.household_number}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{h.head_of_family}</p>
                                                </div>
                                                {selectedHouseholdId === h.id.toString() && <Check className="h-4 w-4 text-blue-600" />}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm italic">No households match your search.</div>
                                )}
                            </div>

                            {selectedHouseholdId && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-xs font-bold uppercase text-gray-500 flex justify-between">
                                        Relationship to Head
                                        {!relationship && <span className="text-red-500 lowercase font-normal italic">Required*</span>}
                                    </Label>
                                    <Select value={relationship} onValueChange={setRelationship}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relationship..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {relationshipOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-6 text-center space-y-3">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs border border-amber-200 dark:border-amber-800">
                                This will create a <strong>new unique Household Number</strong> with {resident.first_name} as the primary head.
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        {mode === 'select' ? (
                            <Button 
                                onClick={handleAddToHousehold} 
                                disabled={isAssignDisabled} 
                                className="bg-blue-600"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Assign to Unit
                            </Button>
                        ) : (
                            <Button onClick={handleCreateHousehold} className="bg-green-600">
                                Register New Household
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};