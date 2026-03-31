// resources/js/Pages/Admin/Households/Show/components/members/AddMemberModal.tsx

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    X, Search, User, Users, ArrowRight, Ban, Info, Loader2, AlertTriangle, Check
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { route } from 'ziggy-js';

// Import types from shared types file
import { Resident, Household } from '@/types/admin/households/household.types';
import { getFullName, formatDate, calculateAge } from '@/types/admin/households/household.types';

// Extended Resident type for modal display
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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableResidents: ExtendedResident[];
    householdId: number;
    currentMemberIds: number[];
    headId: number | null;
}

const relationshipTypes = [
    'Spouse', 'Son', 'Daughter', 'Father', 'Mother',
    'Brother', 'Sister', 'Grandparent', 'Grandchild',
    'Other Relative', 'Non-relative'
] as const;

type RelationshipType = typeof relationshipTypes[number];

export default function AddMemberModal({ 
    open, 
    onOpenChange, 
    availableResidents, 
    householdId,
    currentMemberIds,
    headId
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ExtendedResident[]>([]);
    const [selectedResident, setSelectedResident] = useState<ExtendedResident | null>(null);
    const [relationship, setRelationship] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter search results based on query
    useEffect(() => {
        if (!open) return;

        // Filter out residents who are already in this household or are the head
        const filtered = availableResidents.filter(resident => 
            !currentMemberIds.includes(resident.id) && 
            resident.id !== headId &&
            resident.can_be_added
        );
        
        if (!searchQuery.trim()) {
            setSearchResults(filtered);
        } else {
            const searched = filtered.filter(resident => 
                (resident.full_name || getFullName(resident.first_name, resident.last_name, resident.middle_name))
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setSearchResults(searched);
        }
    }, [searchQuery, availableResidents, currentMemberIds, headId, open]);

    // Check if selected resident will be transferred
    const showTransferWarning = useMemo(() => {
        return selectedResident?.household_status === 'member';
    }, [selectedResident]);

    // Reset when modal closes
    useEffect(() => {
        if (!open) {
            setSearchQuery('');
            setSelectedResident(null);
            setRelationship('');
            setIsSubmitting(false);
        }
    }, [open]);

    const handleResidentSelect = (resident: ExtendedResident) => {
        setSelectedResident(resident);
        setSearchQuery('');
    };

    const handleCloseModal = () => {
        onOpenChange(false);
    };

    const handleAddMember = () => {
        if (!selectedResident || !relationship) return;

        setIsSubmitting(true);

        router.post(route('admin.households.members.add', householdId), {
            resident_id: selectedResident.id,
            relationship: relationship
        }, {
            onSuccess: () => {
                handleCloseModal();
            },
            onError: (errors) => {
                console.error('Error adding member:', errors);
                setIsSubmitting(false);
            }
        });
    };

    const clearSelection = () => {
        setSelectedResident(null);
        setRelationship('');
    };

    // Get status badge for resident
    const getStatusBadge = (resident: ExtendedResident) => {
        if (resident.household_status === 'head') {
            return {
                label: 'Head of Another Household',
                icon: <Ban className="h-3 w-3 mr-1" />,
                className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
                tooltip: resident.restriction_reason
            };
        }
        
        if (resident.household_status === 'member') {
            return {
                label: 'In Another Household',
                icon: <ArrowRight className="h-3 w-3 mr-1" />,
                className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
                tooltip: resident.restriction_reason
            };
        }
        
        return {
            label: 'Available',
            icon: <Check className="h-3 w-3 mr-1" />,
            className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
            tooltip: 'Not in any household'
        };
    };

    const getResidentAge = (resident: ExtendedResident): string => {
        if (resident.age) return `${resident.age} years old`;
        if (resident.date_of_birth) return `${calculateAge(resident.date_of_birth)} years old`;
        return 'Age not specified';
    };

    const getResidentDisplayName = (resident: ExtendedResident): string => {
        return resident.full_name || getFullName(resident.first_name, resident.last_name, resident.middle_name);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">Add Household Member</DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                        Add a new member to this household.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!selectedResident ? (
                        /* Step 1: Select Resident */
                        <>
                            {/* Search Input */}
                            <div className="space-y-2">
                                <Label htmlFor="search" className="dark:text-gray-300">
                                    Search Resident
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name..."
                                        className="pl-10 dark:bg-gray-900 dark:border-gray-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-4 text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span className="dark:text-gray-300">Head (Cannot Add)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="dark:text-gray-300">Will Transfer</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                        <span className="dark:text-gray-300">Available</span>
                                    </div>
                                </div>
                            </div>

                            {/* Resident List */}
                            <div className="border rounded-lg overflow-hidden dark:border-gray-700 max-h-64 overflow-y-auto">
                                {availableResidents.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Available Residents</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            All residents already belong to households.
                                        </p>
                                        <Link 
                                            href={route('admin.residents.create', { household_id: householdId })}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            Create New Resident
                                        </Link>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Results Found</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            No residents found matching your search.
                                        </p>
                                        <Link 
                                            href={route('admin.residents.create', { 
                                                household_id: householdId,
                                                name: searchQuery 
                                            })}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            Create "{searchQuery}"
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y dark:divide-gray-700">
                                        {searchResults.map((resident) => {
                                            const statusBadge = getStatusBadge(resident);
                                            const displayName = getResidentDisplayName(resident);
                                            const age = getResidentAge(resident);
                                            
                                            return (
                                                <TooltipProvider key={resident.id}>
                                                    <div 
                                                        className={`p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                                            !resident.can_be_added ? 'opacity-60' : ''
                                                        }`}
                                                        onClick={() => resident.can_be_added && handleResidentSelect(resident)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                                resident.household_status === 'head'
                                                                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                                                    : resident.household_status === 'member'
                                                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}>
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-sm font-medium dark:text-gray-200">
                                                                        {displayName}
                                                                    </span>
                                                                    
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className={`${statusBadge.className} text-xs flex items-center gap-1 px-1.5 py-0`}
                                                                    >
                                                                        {statusBadge.icon}
                                                                        <span className="text-[10px]">{statusBadge.label}</span>
                                                                    </Badge>
                                                                </div>
                                                                
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                    {age}
                                                                </div>
                                                                
                                                                {resident.current_household && (
                                                                    <div className="flex items-center gap-1 mt-1 text-xs text-purple-600 dark:text-purple-400">
                                                                        <Info className="h-3 w-3" />
                                                                        <span className="text-[10px]">
                                                                            HH #{resident.current_household.number}
                                                                            {resident.current_household.relationship && ` as ${resident.current_household.relationship}`}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipProvider>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Step 2: Set Relationship */
                        <>
                            {/* Selected Resident Summary */}
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium dark:text-gray-200">
                                                {getResidentDisplayName(selectedResident)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {getResidentAge(selectedResident)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={clearSelection}
                                        className="h-7 px-2"
                                    >
                                        Change
                                    </Button>
                                </div>
                            </div>

                            {/* Transfer Warning */}
                            {showTransferWarning && selectedResident.current_household && (
                                <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
                                    <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <AlertTitle className="text-sm text-purple-800 dark:text-purple-300">
                                        Transferring Resident
                                    </AlertTitle>
                                    <AlertDescription className="text-xs text-purple-700 dark:text-purple-400">
                                        This resident will be transferred from Household #{selectedResident.current_household.number}
                                        {selectedResident.current_household.relationship && ` where they are listed as ${selectedResident.current_household.relationship}`}.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Relationship Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="relationship" className="dark:text-gray-300">
                                    Relationship to Head <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={relationship}
                                    onValueChange={setRelationship}
                                >
                                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-gray-900">
                                        {relationshipTypes.map((type) => (
                                            <SelectItem key={type} value={type} className="dark:text-gray-300">
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseModal}
                        className="dark:border-gray-600 dark:text-gray-300"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    {selectedResident && (
                        <Button
                            type="button"
                            onClick={handleAddMember}
                            disabled={isSubmitting || !relationship}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Users className="h-4 w-4 mr-2" />
                                    Add Member
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}