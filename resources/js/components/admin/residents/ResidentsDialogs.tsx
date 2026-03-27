// components/admin/residents/ResidentsDialogs.tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Award, CheckCircle, AlertCircle, Users, Shield, ShieldOff } from 'lucide-react';
import { Purok } from '@/types/admin/residents/residents-types';
import { useState, useEffect } from 'react';

interface Privilege {
    id: number;
    name: string;
    code: string;
    description?: string;
    category?: string;
    discount_percentage?: number;
    requires_id_number?: boolean;
    requires_verification?: boolean;
    validity_years?: number;
}

interface SelectionStats {
    total: number;
    active: number;
    male: number;
    female: number;
    other?: number;
    voters: number;
    seniors?: number; // Make optional
    pwds?: number;    // Make optional
    heads: number;
    avgAge?: number;   // Make optional
    hasPhotos?: number;
    privilegeCounts?: Record<string, number>;
    hasPrivileges?: number;
    // Add additional fields that might come from parent
    males?: number;
    females?: number;
    inactive?: number;
    averageAge?: number;
}

interface ResidentsDialogsProps {
    // Delete dialog
    showBulkDeleteDialog: boolean;
    setShowBulkDeleteDialog: (value: boolean) => void;
    
    // Status dialog
    showBulkStatusDialog: boolean;
    setShowBulkStatusDialog: (value: boolean) => void;
    
    // Purok dialog
    showBulkPurokDialog: boolean;
    setShowBulkPurokDialog: (value: boolean) => void;
    
    // Privilege dialogs
    showBulkPrivilegeDialog: boolean;
    setShowBulkPrivilegeDialog: (value: boolean) => void;
    showBulkRemovePrivilegeDialog: boolean;
    setShowBulkRemovePrivilegeDialog: (value: boolean) => void;
    
    // Common props
    isPerformingBulkAction: boolean;
    bulkEditValue: string;
    setBulkEditValue: (value: string) => void;
    selectedResidents: number[];
    handleBulkOperation: (operation: string) => Promise<void>;
    handleBulkPrivilegeAction: () => Promise<void>;
    handleBulkStatusUpdate: (status: string) => Promise<void>;
    handleBulkPurokUpdate: (purokId: number) => Promise<void>;
    handleBulkDelete: () => Promise<void>;
    
    // Data
    puroks: Purok[];
    privileges?: Privilege[];
    selectionStats?: SelectionStats;
    bulkPrivilegeAction: 'add' | 'remove';
}

export default function ResidentsDialogs({
    // Delete dialog
    showBulkDeleteDialog,
    setShowBulkDeleteDialog,
    
    // Status dialog
    showBulkStatusDialog,
    setShowBulkStatusDialog,
    
    // Purok dialog
    showBulkPurokDialog,
    setShowBulkPurokDialog,
    
    // Privilege dialogs
    showBulkPrivilegeDialog,
    setShowBulkPrivilegeDialog,
    showBulkRemovePrivilegeDialog,
    setShowBulkRemovePrivilegeDialog,
    
    // Common props
    isPerformingBulkAction,
    bulkEditValue,
    setBulkEditValue,
    selectedResidents,
    handleBulkOperation,
    handleBulkPrivilegeAction,
    handleBulkStatusUpdate,
    handleBulkPurokUpdate,
    handleBulkDelete,
    
    // Data
    puroks,
    privileges = [],
    selectionStats,
    bulkPrivilegeAction
}: ResidentsDialogsProps) {
    const [selectedCount, setSelectedCount] = useState(selectedResidents.length);
    
    useEffect(() => {
        setSelectedCount(selectedResidents.length);
    }, [selectedResidents]);

    // Helper function to safely get stats values
    const getStat = (value: number | undefined, fallback: number = 0): number => {
        return value !== undefined ? value : fallback;
    };

    // Group privileges by category for better organization
    const groupedPrivileges = privileges.reduce((acc, privilege) => {
        const category = privilege.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(privilege);
        return acc;
    }, {} as Record<string, Privilege[]>);

    const handleCloseDialogs = () => {
        setShowBulkDeleteDialog(false);
        setShowBulkStatusDialog(false);
        setShowBulkPurokDialog(false);
        setShowBulkPrivilegeDialog(false);
        setShowBulkRemovePrivilegeDialog(false);
        setBulkEditValue('');
    };

    // Get safe stats values
    const headsCount = getStat(selectionStats?.heads);
    const hasPrivilegesCount = getStat(selectionStats?.hasPrivileges);
    const seniorsCount = getStat(selectionStats?.seniors);
    const pwdsCount = getStat(selectionStats?.pwds);
    const avgAgeValue = getStat(selectionStats?.avgAge, getStat(selectionStats?.averageAge));

    return (
        <>
            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Selected Residents
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <p>
                                Are you sure you want to delete <span className="font-bold text-foreground">{selectedCount}</span> selected resident{selectedCount !== 1 ? 's' : ''}?
                                This action cannot be undone.
                            </p>
                            
                            {/* Heads warning */}
                            {headsCount > 0 && (
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-amber-800">Warning: Household Heads Selected</p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                {headsCount} of the selected residents {headsCount === 1 ? 'is' : 'are'} household heads. 
                                                Deleting them will:
                                            </p>
                                            <ul className="list-disc list-inside text-sm text-amber-700 mt-2 space-y-1">
                                                <li>Remove them as head of their household</li>
                                                <li>Require reassigning a new household head</li>
                                                <li>Affect household records and reports</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Seniors warning */}
                            {seniorsCount > 0 && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Users className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-700">
                                            <span className="font-semibold">{seniorsCount}</span> senior citizen{seniorsCount !== 1 ? 's' : ''} selected. 
                                            Deleting them will remove their senior citizen privileges and records.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* PWDs warning */}
                            {pwdsCount > 0 && (
                                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Shield className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-purple-700">
                                            <span className="font-semibold">{pwdsCount}</span> PWD{ pwdsCount !== 1 ? 's' : ''} selected. 
                                            Deleting them will remove their PWD privileges and records.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Privileges warning */}
                            {hasPrivilegesCount > 0 && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Award className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-700">
                                            <span className="font-semibold">{hasPrivilegesCount}</span> resident{hasPrivilegesCount !== 1 ? 's' : ''} with active privileges will lose all privilege benefits.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel 
                            onClick={() => setShowBulkDeleteDialog(false)}
                            disabled={isPerformingBulkAction}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Resident Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change status for <span className="font-bold">{selectedCount}</span> selected resident{selectedCount !== 1 ? 's' : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="py-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="status-select" className="text-sm font-medium">
                                    New Status
                                </Label>
                                <Select
                                    value={bulkEditValue}
                                    onValueChange={setBulkEditValue}
                                >
                                    <SelectTrigger id="status-select" className="mt-1.5">
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                                Active
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-gray-400" />
                                                Inactive
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {bulkEditValue && (
                                <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-medium">Note:</span> Changing status will affect the residents' access to privileges and services.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel 
                            onClick={() => {
                                setShowBulkStatusDialog(false);
                                setBulkEditValue('');
                            }}
                            disabled={isPerformingBulkAction}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkStatusUpdate(bulkEditValue)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction || !bulkEditValue}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Purok Update Dialog */}
            <AlertDialog open={showBulkPurokDialog} onOpenChange={setShowBulkPurokDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Purok Assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change purok for <span className="font-bold">{selectedCount}</span> selected resident{selectedCount !== 1 ? 's' : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="py-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="purok-select" className="text-sm font-medium">
                                    New Purok
                                </Label>
                                <Select
                                    value={bulkEditValue}
                                    onValueChange={setBulkEditValue}
                                >
                                    <SelectTrigger id="purok-select" className="mt-1.5">
                                        <SelectValue placeholder="Select purok" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {puroks.map((purok) => (
                                            <SelectItem key={purok.id} value={purok.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-500" />
                                                    <span>{purok.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {headsCount > 0 && (
                                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                                    <p className="text-xs text-amber-700">
                                        <span className="font-medium">Note:</span> Moving household heads will also affect their household's purok assignment.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel 
                            onClick={() => {
                                setShowBulkPurokDialog(false);
                                setBulkEditValue('');
                            }}
                            disabled={isPerformingBulkAction}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkPurokUpdate(parseInt(bulkEditValue))}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isPerformingBulkAction || !bulkEditValue}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Purok'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Add Privilege Dialog */}
            <Dialog open={showBulkPrivilegeDialog} onOpenChange={setShowBulkPrivilegeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-500" />
                            Add Privilege to Residents
                        </DialogTitle>
                        <DialogDescription>
                            Adding a privilege to <span className="font-bold">{selectedCount}</span> selected resident{selectedCount !== 1 ? 's' : ''}.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto px-1">
                        <div>
                            <Label htmlFor="privilege-add-select" className="text-sm font-medium">
                                Select Privilege
                            </Label>
                            <Select
                                value={bulkEditValue}
                                onValueChange={setBulkEditValue}
                            >
                                <SelectTrigger id="privilege-add-select" className="mt-1.5 border-purple-200 focus:ring-purple-500">
                                    <SelectValue placeholder="Choose a privilege to add" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {Object.entries(groupedPrivileges).map(([category, categoryPrivileges]) => (
                                        <div key={category}>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                                {category}
                                            </div>
                                            {categoryPrivileges.map((privilege) => (
                                                <SelectItem key={privilege.id} value={privilege.id.toString()}>
                                                    <div className="flex items-center gap-2 py-1">
                                                        <Award className="h-4 w-4 text-purple-500 shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{privilege.name}</span>
                                                            <span className="text-xs text-gray-500">{privilege.code}</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {bulkEditValue && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-purple-800">
                                        <p className="font-semibold mb-2">What happens when you add a privilege:</p>
                                        <ul className="list-disc list-inside space-y-1.5 text-xs text-purple-700">
                                            <li>Privilege will be assigned to all selected residents</li>
                                            <li>Initial status will be <span className="font-medium">pending</span> (requires verification)</li>
                                            <li>Residents can access benefits after verification</li>
                                            <li>Each resident can have multiple privileges</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectionStats?.privilegeCounts && Object.keys(selectionStats.privilegeCounts).length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Current Privilege Distribution
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(selectionStats.privilegeCounts).map(([code, count]) => {
                                        const privilege = privileges.find(p => p.code === code);
                                        return (
                                            <div key={code} className="flex items-center gap-1.5 bg-white p-2 rounded border">
                                                <Award className="h-3 w-3 text-purple-500 shrink-0" />
                                                <span className="font-medium truncate">{privilege?.name || code}:</span>
                                                <span className="text-gray-600">{String(count)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowBulkPrivilegeDialog(false);
                                setBulkEditValue('');
                            }}
                            disabled={isPerformingBulkAction}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleBulkPrivilegeAction}
                            disabled={!bulkEditValue || isPerformingBulkAction}
                            className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Award className="h-4 w-4 mr-2" />
                                    Add Privilege
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Remove Privilege Dialog */}
            <Dialog open={showBulkRemovePrivilegeDialog} onOpenChange={setShowBulkRemovePrivilegeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldOff className="h-5 w-5 text-red-500" />
                            Remove Privilege from Residents
                        </DialogTitle>
                        <DialogDescription>
                            Removing a privilege from <span className="font-bold">{selectedCount}</span> selected resident{selectedCount !== 1 ? 's' : ''}. 
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="privilege-remove-select" className="text-sm font-medium">
                                Select Privilege to Remove
                            </Label>
                            <Select
                                value={bulkEditValue}
                                onValueChange={setBulkEditValue}
                            >
                                <SelectTrigger id="privilege-remove-select" className="mt-1.5 border-red-200 focus:ring-red-500">
                                    <SelectValue placeholder="Choose a privilege to remove" />
                                </SelectTrigger>
                                <SelectContent>
                                    {privileges.map((privilege) => {
                                        const hasPrivilege = selectionStats?.privilegeCounts?.[privilege.code] ? true : false;
                                        return (
                                            <SelectItem 
                                                key={privilege.id} 
                                                value={privilege.id.toString()}
                                                disabled={!hasPrivilege}
                                                className={!hasPrivilege ? 'opacity-50' : ''}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Award className={`h-4 w-4 ${hasPrivilege ? 'text-red-500' : 'text-gray-400'}`} />
                                                    <div className="flex flex-col">
                                                        <span>{privilege.name}</span>
                                                        {hasPrivilege && selectionStats?.privilegeCounts?.[privilege.code] && (
                                                            <span className="text-xs text-gray-500">
                                                                ({selectionStats.privilegeCounts[privilege.code]} currently have this)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {bulkEditValue && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-red-800">
                                        <p className="font-semibold mb-2">Warning: This action is permanent</p>
                                        <ul className="list-disc list-inside space-y-1.5 text-xs text-red-700">
                                            <li>Privilege will be immediately removed from all selected residents</li>
                                            <li>Residents will lose access to associated benefits</li>
                                            <li>All verification records for this privilege will be cleared</li>
                                            <li>You will need to re-apply and re-verify if needed later</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {bulkEditValue && selectionStats?.privilegeCounts && (
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Impact Summary:
                                </p>
                                <p className="text-sm">
                                    This will remove the privilege from <span className="font-bold text-red-600">
                                        {selectionStats.privilegeCounts[privileges.find(p => p.id.toString() === bulkEditValue)?.code || ''] || 0}
                                    </span> of the selected residents.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowBulkRemovePrivilegeDialog(false);
                                setBulkEditValue('');
                            }}
                            disabled={isPerformingBulkAction}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleBulkPrivilegeAction}
                            disabled={!bulkEditValue || isPerformingBulkAction}
                            className="min-w-[120px]"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <ShieldOff className="h-4 w-4 mr-2" />
                                    Remove Privilege
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}