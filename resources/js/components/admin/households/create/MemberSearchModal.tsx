// components/admin/households/create/MemberSearchModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    X, Search, User, Check, CheckSquare, Square, Users, 
    ChevronDown, AlertCircle, Plus, Home, Ban, AlertTriangle,
    ArrowRight, Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
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
import {
    Dialog as ConfirmDialog,
    DialogContent as ConfirmDialogContent,
    DialogHeader as ConfirmDialogHeader,
    DialogTitle as ConfirmDialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age?: number;
    address?: string;
    purok?: string;
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
    is_head?: boolean;
    current_household?: {
        id: number;
        number: string;
    } | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableResidents: Resident[];
    currentMembers: Member[];
    headResidentId: number | null;
    onAddMembers: (residents: Resident[], relationship: string) => void;
}

const relationshipTypes = [
    'Spouse', 'Son', 'Daughter', 'Father', 'Mother',
    'Brother', 'Sister', 'Grandparent', 'Grandchild',
    'Other Relative', 'Non-relative'
];

export default function MemberSearchModal({ 
    open, 
    onOpenChange, 
    availableResidents, 
    currentMembers, 
    headResidentId,
    onAddMembers 
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Resident[]>(availableResidents);
    const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [bulkRelationship, setBulkRelationship] = useState<string>('Other Relative');
    const [showBulkOptions, setShowBulkOptions] = useState(false);
    const [showTransferWarning, setShowTransferWarning] = useState(false);
    const [pendingTransferCount, setPendingTransferCount] = useState(0);
    
    // Confirmation modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAddResidents, setPendingAddResidents] = useState<Resident[]>([]);
    const [pendingRelationship, setPendingRelationship] = useState<string>('Other Relative');
    const [transferResidents, setTransferResidents] = useState<Resident[]>([]);

    // Get IDs of residents already in this household
    const currentMemberIds = currentMembers
        .map(m => m.resident_id)
        .filter(id => id !== undefined);

    // Filter search results based on query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(availableResidents);
        } else {
            const filtered = availableResidents.filter(resident => {
                const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
                const searchLower = searchQuery.toLowerCase();
                return fullName.includes(searchLower) ||
                    resident.first_name.toLowerCase().includes(searchLower) ||
                    resident.last_name.toLowerCase().includes(searchLower);
            });
            setSearchResults(filtered);
        }
    }, [searchQuery, availableResidents]);

    // Update transfer warning when selection changes
    useEffect(() => {
        if (selectedResidents.length > 0) {
            const transferCount = selectedResidents.filter(id => {
                const resident = availableResidents.find(r => r.id === id);
                return resident?.household_status === 'member' && !currentMemberIds.includes(id);
            }).length;
            setPendingTransferCount(transferCount);
            setShowTransferWarning(transferCount > 0);
        } else {
            setShowTransferWarning(false);
            setPendingTransferCount(0);
        }
    }, [selectedResidents, availableResidents, currentMemberIds]);

    // Reset when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedResidents([]);
            setSearchQuery('');
            setIsMultiSelectMode(false);
            setShowBulkOptions(false);
            setShowTransferWarning(false);
            setPendingTransferCount(0);
            setShowConfirmModal(false);
            setPendingAddResidents([]);
            setTransferResidents([]);
        }
    }, [open]);

    const toggleResidentSelection = (residentId: number) => {
        setSelectedResidents(prev => 
            prev.includes(residentId)
                ? prev.filter(id => id !== residentId)
                : [...prev, residentId]
        );
    };

    const handleAddSingleResident = (resident: Resident) => {
        // Check if this resident is from another household
        if (resident.household_status === 'member' && !currentMemberIds.includes(resident.id)) {
            // Show confirmation for transfer
            setTransferResidents([resident]);
            setPendingRelationship('Other Relative');
            setShowConfirmModal(true);
        } else {
            // Just add normally
            onAddMembers([resident], 'Other Relative');
        }
    };

    const handleAddMultipleResidents = () => {
        if (selectedResidents.length === 0) return;

        const residentsToAdd = availableResidents.filter(resident => 
            selectedResidents.includes(resident.id) && 
            !currentMemberIds.includes(resident.id) && // Not already in this household
            resident.household_status !== 'head' // Not a head of another household
        );

        if (residentsToAdd.length === 0) return;

        // Check if any are from other households
        const transferResidents = residentsToAdd.filter(r => r.household_status === 'member');
        
        if (transferResidents.length > 0) {
            // Show confirmation for transfers
            setTransferResidents(transferResidents);
            setPendingAddResidents(residentsToAdd);
            setPendingRelationship(bulkRelationship);
            setShowConfirmModal(true);
        } else {
            // No transfers, just add
            onAddMembers(residentsToAdd, bulkRelationship);
            setSelectedResidents([]);
            setShowBulkOptions(false);
        }
    };

    const confirmAddMembers = () => {
        if (pendingAddResidents.length > 0) {
            // Multi-select case
            onAddMembers(pendingAddResidents, pendingRelationship);
            setSelectedResidents([]);
        } else if (transferResidents.length > 0) {
            // Single select case
            onAddMembers(transferResidents, pendingRelationship);
        }
        
        // Close modals
        setShowConfirmModal(false);
        setShowBulkOptions(false);
        setTransferResidents([]);
        setPendingAddResidents([]);
    };

    const selectAllResults = () => {
        // Only select residents that can be added (not in this household and not heads)
        const selectableResidents = searchResults.filter(resident => 
            resident.id !== headResidentId &&
            !currentMemberIds.includes(resident.id) &&
            resident.household_status !== 'head'
        );
        
        setSelectedResidents(selectableResidents.map(r => r.id));
    };

    const clearSelection = () => {
        setSelectedResidents([]);
    };

    const isResidentSelectable = (resident: Resident) => {
        // Can't select if:
        // 1. Is the current head
        // 2. Already in this household
        // 3. Is a head of another household
        return resident.id !== headResidentId && 
               !currentMemberIds.includes(resident.id) && 
               resident.household_status !== 'head';
    };

    // Get status badge configuration
    const getStatusBadge = (resident: Resident) => {
        // Priority 1: Current head of this household
        if (resident.id === headResidentId) {
            return {
                label: 'Current Head',
                icon: <User className="h-3 w-3 mr-1" />,
                className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
                tooltip: 'This resident is the head of this household'
            };
        }
        
        // Priority 2: Already added to THIS household
        if (currentMemberIds.includes(resident.id)) {
            return {
                label: 'Already in This Household',
                icon: <Check className="h-3 w-3 mr-1" />,
                className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
                tooltip: 'This resident is already a member of this household'
            };
        }
        
        // Priority 3: Head of another household
        if (resident.household_status === 'head') {
            return {
                label: 'Head of Another Household',
                icon: <Home className="h-3 w-3 mr-1" />,
                className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
                tooltip: resident.restriction_reason || 'Cannot be added as a member'
            };
        }
        
        // Priority 4: Member of another household
        if (resident.household_status === 'member') {
            return {
                label: 'In Another Household',
                icon: <ArrowRight className="h-3 w-3 mr-1" />,
                className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
                tooltip: 'Will be transferred to this household'
            };
        }
        
        // Priority 5: Available (not in any household)
        return {
            label: 'Available',
            icon: <Check className="h-3 w-3 mr-1" />,
            className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
            tooltip: 'Available to add'
        };
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Add Family Members
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                        <div className="space-y-4">
                            {/* Search and Mode Toggle */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search by name..." 
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                
                                <Button
                                    type="button"
                                    variant={isMultiSelectMode ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setIsMultiSelectMode(!isMultiSelectMode);
                                        if (isMultiSelectMode) {
                                            setSelectedResidents([]);
                                        }
                                    }}
                                    className="whitespace-nowrap"
                                >
                                    {isMultiSelectMode ? (
                                        <>
                                            <CheckSquare className="h-4 w-4 mr-2" />
                                            Multi-Select Mode
                                        </>
                                    ) : (
                                        <>
                                            <Square className="h-4 w-4 mr-2" />
                                            Enable Multi-Select
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Legend for status indicators */}
                            <div className="flex items-center gap-4 text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="dark:text-gray-300">Current Head</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="dark:text-gray-300">Already in This HH</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span className="dark:text-gray-300">Head (Cannot Add)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="dark:text-gray-300">In Another HH</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                        <span className="dark:text-gray-300">Available</span>
                                    </div>
                                </div>
                            </div>

                            {/* Transfer Warning */}
                            {showTransferWarning && (
                                <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
                                    <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <AlertTitle className="text-purple-800 dark:text-purple-300">
                                        Transferring Residents
                                    </AlertTitle>
                                    <AlertDescription className="text-purple-700 dark:text-purple-400">
                                        {pendingTransferCount} selected resident(s) will be transferred from their current household to this one.
                                        They will be removed from their previous household.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Multi-select controls */}
                            {isMultiSelectMode && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {searchResults.length} resident{searchResults.length !== 1 ? 's' : ''}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                                            {selectedResidents.length} selected
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAllResults}
                                            disabled={searchResults.length === 0}
                                            className="h-7 px-2"
                                        >
                                            Select All Available
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSelection}
                                            disabled={selectedResidents.length === 0}
                                            className="h-7 px-2"
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Bulk Options */}
                            {isMultiSelectMode && selectedResidents.length > 0 && !showBulkOptions && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                                {selectedResidents.length} resident{selectedResidents.length !== 1 ? 's' : ''} selected
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => setShowBulkOptions(true)}
                                        >
                                            Set Relationship & Add
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Bulk Relationship Panel */}
                            {showBulkOptions && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium dark:text-gray-200">Add Multiple Residents</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowBulkOptions(false)}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="bulk-relationship" className="text-sm mb-2 block dark:text-gray-300">
                                                Set relationship for all selected residents:
                                            </Label>
                                            <Select
                                                value={bulkRelationship}
                                                onValueChange={setBulkRelationship}
                                            >
                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                                                    <SelectValue placeholder="Select relationship" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900">
                                                    {relationshipTypes.map((relationship) => (
                                                        <SelectItem key={relationship} value={relationship} className="dark:text-gray-300">
                                                            {relationship}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {/* Transfer Summary */}
                                        {pendingTransferCount > 0 && (
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm text-purple-700 dark:text-purple-300">
                                                <Info className="h-4 w-4 inline-block mr-1" />
                                                {pendingTransferCount} resident(s) will be transferred from their current households
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                type="button"
                                                onClick={handleAddMultipleResidents}
                                                className="flex-1"
                                            >
                                                Add {selectedResidents.length} Resident{selectedResidents.length !== 1 ? 's' : ''}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowBulkOptions(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resident List */}
                            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                                {availableResidents.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Available Residents</h4>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                            All residents already belong to households. You need to create new residents first.
                                        </p>
                                        <Link 
                                            href="/admin/residents/create?return_to=/households/create"
                                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create New Resident
                                        </Link>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">No Results Found</h4>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            No residents found for "<span className="font-medium">{searchQuery}</span>"
                                        </p>
                                        <Link 
                                            href={`/admin/residents/create?return_to=/households/create&name=${encodeURIComponent(searchQuery)}`}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create New Resident
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
                                        {searchResults.map((resident) => {
                                            const fullName = `${resident.first_name} ${resident.last_name}`.trim();
                                            const isSelectable = isResidentSelectable(resident);
                                            const isSelected = selectedResidents.includes(resident.id);
                                            const statusBadge = getStatusBadge(resident);
                                            const isInThisHousehold = currentMemberIds.includes(resident.id);
                                            
                                            return (
                                                <TooltipProvider key={resident.id}>
                                                    <div 
                                                        className={`p-4 transition-colors ${
                                                            isMultiSelectMode && isSelectable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                                                        } ${
                                                            !isSelectable && !isInThisHousehold ? 'opacity-60' : ''
                                                        } ${
                                                            isMultiSelectMode && isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                                                        }`}
                                                        onClick={() => isMultiSelectMode && isSelectable && toggleResidentSelection(resident.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <div className="relative">
                                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                                        resident.id === headResidentId 
                                                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                                                                            : isInThisHousehold
                                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                                            : resident.household_status === 'head'
                                                                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                                            : resident.household_status === 'member'
                                                                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                                                    }`}>
                                                                        <User className="h-5 w-5" />
                                                                    </div>
                                                                    {isMultiSelectMode && isSelected && (
                                                                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                                                            <Check className="h-3 w-3 text-white" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-medium dark:text-gray-200">
                                                                            {fullName}
                                                                        </span>
                                                                        
                                                                        {/* Status Badge with Tooltip */}
                                                                        {statusBadge.label && (
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Badge 
                                                                                        variant="outline" 
                                                                                        className={`${statusBadge.className} text-xs flex items-center gap-1`}
                                                                                    >
                                                                                        {statusBadge.icon}
                                                                                        {statusBadge.label}
                                                                                    </Badge>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{statusBadge.tooltip}</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                        {resident.age ? `${resident.age} years old` : 'Age not specified'}
                                                                        {resident.purok && ` • Purok ${resident.purok}`}
                                                                    </div>
                                                                    
                                                                    {/* Current household info for members being transferred */}
                                                                    {resident.household_status === 'member' && !isInThisHousehold && resident.current_household && (
                                                                        <div className="flex items-center gap-1 mt-1 text-xs text-purple-600 dark:text-purple-400">
                                                                            <ArrowRight className="h-3 w-3" />
                                                                            <span>
                                                                                Currently in Household #{resident.current_household.number} 
                                                                                {resident.current_household.relationship && ` as ${resident.current_household.relationship}`}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Restriction reason for heads */}
                                                                    {resident.household_status === 'head' && resident.restriction_reason && (
                                                                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                                            <Ban className="h-3 w-3" />
                                                                            <span>{resident.restriction_reason}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                {!isSelectable ? (
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                                                        {resident.id === headResidentId ? 'Current Head' : 
                                                                         isInThisHousehold ? 'Already Added' :
                                                                         resident.household_status === 'head' ? 'Cannot Add' : 
                                                                         'Not Available'}
                                                                    </div>
                                                                ) : isMultiSelectMode ? (
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant={isSelected ? "default" : "outline"}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleResidentSelection(resident.id);
                                                                        }}
                                                                        type="button"
                                                                        disabled={!isSelectable}
                                                                    >
                                                                        {isSelected ? 'Selected' : 'Select'}
                                                                    </Button>
                                                                ) : (
                                                                    <Button 
                                                                        size="sm" 
                                                                        onClick={() => handleAddSingleResident(resident)}
                                                                        type="button"
                                                                        disabled={!isSelectable}
                                                                        className={resident.household_status === 'member' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        {resident.household_status === 'member' ? 'Transfer' : 'Add'}
                                                                    </Button>
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
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        {isMultiSelectMode && selectedResidents.length > 0 && !showBulkOptions && (
                            <Button onClick={() => setShowBulkOptions(true)}>
                                Add Selected ({selectedResidents.length})
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal for Transfers */}
            <ConfirmDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <ConfirmDialogContent>
                    <ConfirmDialogHeader>
                        <ConfirmDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-purple-600" />
                            Confirm Resident Transfer
                        </ConfirmDialogTitle>
                        <DialogDescription className="space-y-4 pt-4">
                            {transferResidents.length === 1 ? (
                                <p>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {transferResidents[0].first_name} {transferResidents[0].last_name}
                                    </span>{' '}
                                    is currently a member of another household.
                                </p>
                            ) : (
                                <p>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {transferResidents.length} residents
                                    </span>{' '}
                                    are currently members of other households.
                                </p>
                            )}
                            
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-2">
                                <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                                    What will happen:
                                </p>
                                <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-400 space-y-1">
                                    <li>These residents will be removed from their current households</li>
                                    <li>They will be added as members to this new household</li>
                                    <li>Their previous households will be updated automatically</li>
                                </ul>
                            </div>

                            {transferResidents.length > 0 && (
                                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                                    <p className="text-sm font-medium mb-2">Residents to transfer:</p>
                                    <ul className="space-y-1">
                                        {transferResidents.map(r => (
                                            <li key={r.id} className="text-sm flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3 text-purple-500" />
                                                <span>{r.first_name} {r.last_name}</span>
                                                {r.current_household && (
                                                    <span className="text-xs text-gray-500">
                                                        (Currently in HH #{r.current_household.number})
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <p className="text-sm text-gray-500">
                                Are you sure you want to proceed?
                            </p>
                        </DialogDescription>
                    </ConfirmDialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowConfirmModal(false);
                                setTransferResidents([]);
                                setPendingAddResidents([]);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAddMembers}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Confirm Transfer
                        </Button>
                    </DialogFooter>
                </ConfirmDialogContent>
            </ConfirmDialog>
        </>
    );
}