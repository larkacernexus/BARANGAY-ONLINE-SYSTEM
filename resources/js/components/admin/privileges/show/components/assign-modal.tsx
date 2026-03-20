import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, Loader2, ChevronDown, UserPlus, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Privilege, Resident } from '@/components/admin/privileges/show/privilege';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    privilege: Privilege;
    onSuccess?: () => void;
}

const getFullName = (resident: Resident) => {
    const middle = resident.middle_name ? ` ${resident.middle_name.charAt(0)}.` : '';
    return `${resident.last_name}, ${resident.first_name}${middle}`;
};

export const AssignModal = ({ isOpen, onClose, privilege, onSuccess }: Props) => {
    // List States
    const [residents, setResidents] = useState<Resident[]>([]);
    const [selectedResidents, setSelectedResidents] = useState<Set<number>>(new Set());
    const [idNumbers, setIdNumbers] = useState<Record<number, string>>({});
    
    // UI/UX States
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Form States
    const [expiresAt, setExpiresAt] = useState('');
    const [notes, setNotes] = useState('');
    const [verifyNow, setVerifyNow] = useState(!privilege.requires_verification);

    // Get discount values from privilege (to be stored in resident_privileges table)
    const discountTypeId = useMemo(() => {
        return privilege.discount_type_id;
    }, [privilege.discount_type_id]);

    const discountPercentage = useMemo(() => {
        return privilege.default_discount_percentage;
    }, [privilege.default_discount_percentage]);

    // Auto-set expiration date based on validity_years
    useEffect(() => {
        if (isOpen && privilege.validity_years && !expiresAt) {
            const date = new Date();
            date.setFullYear(date.getFullYear() + privilege.validity_years);
            setExpiresAt(date.toISOString().split('T')[0]);
        }
    }, [isOpen, privilege.validity_years, expiresAt]);

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedResidents(new Set());
            setIdNumbers({});
            setSearchTerm('');
            setResidents([]);
            setNotes('');
            setExpiresAt('');
            setVerifyNow(!privilege.requires_verification);
            setSearchError(null);
        }
    }, [isOpen, privilege.requires_verification]);

    const searchResidents = useCallback(async (query: string, pageNum: number = 1) => {
        if (!isOpen) return;
        
        setLoading(true);
        setSearchError(null);
        
        try {
            const response = await fetch(
                `/admin/privileges/${privilege.id}/search-residents?q=${encodeURIComponent(query)}&page=${pageNum}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            setResidents(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
            setHasMore(data.current_page < data.last_page);
            setPage(data.current_page);
        } catch (error) {
            console.error('Error searching residents:', error);
            setSearchError(error instanceof Error ? error.message : 'Failed to search residents');
        } finally {
            setLoading(false);
        }
    }, [privilege.id, isOpen]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;
        
        const delayDebounce = setTimeout(() => {
            searchResidents(searchTerm, 1);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, isOpen, searchResidents]);

    const toggleResident = (id: number) => {
        const next = new Set(selectedResidents);
        if (next.has(id)) {
            next.delete(id);
            
            // Clean up ID number when deselecting
            const nextIds = { ...idNumbers };
            delete nextIds[id];
            setIdNumbers(nextIds);
        } else {
            next.add(id);
        }
        setSelectedResidents(next);
    };

    const handleSelectAllVisible = () => {
        const allVisibleIds = residents.map(r => r.id);
        const areAllVisibleSelected = allVisibleIds.every(id => selectedResidents.has(id));

        const next = new Set(selectedResidents);
        if (areAllVisibleSelected) {
            allVisibleIds.forEach(id => {
                next.delete(id);
                
                // Clean up ID numbers
                const nextIds = { ...idNumbers };
                delete nextIds[id];
                setIdNumbers(nextIds);
            });
        } else {
            allVisibleIds.forEach(id => next.add(id));
        }
        setSelectedResidents(next);
    };

    const validateAssignment = (): boolean => {
        if (selectedResidents.size === 0) {
            alert('Please select at least one resident.');
            return false;
        }

        // Validation: If ID is required, check if selected residents have it
        if (privilege.requires_id_number) {
            const missingId = Array.from(selectedResidents).some(id => !idNumbers[id]?.trim());
            if (missingId) {
                alert('Please provide ID numbers for all selected residents.');
                return false;
            }
        }

        return true;
    };

    const handleAssign = async () => {
        if (!validateAssignment()) return;

        setAssigning(true);
        try {
            const residentIds = Array.from(selectedResidents);
            
            // Prepare payload with all fields needed for resident_privileges table
            const payload = {
                resident_ids: residentIds,
                id_numbers: residentIds.map(id => idNumbers[id] || null),
                discount_type_id: discountTypeId,
                discount_percentage: discountPercentage,
                expires_at: expiresAt || null,
                remarks: notes || null,
                verified_at: verifyNow ? new Date().toISOString() : null,
            };

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch(`/admin/privileges/${privilege.id}/assign-bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            } else {
                alert(data.message || 'Error occurred while assigning privileges.');
            }
        } catch (error) {
            console.error('Assignment error:', error);
            alert('Failed to connect to server. Please try again.');
        } finally {
            setAssigning(false);
        }
    };

    // Get configuration summary for display
    const configSummary = useMemo(() => {
        const items = [];
        
        if (discountPercentage) {
            items.push(`${discountPercentage}% discount`);
        }
        
        if (privilege.discount_type) {
            items.push(privilege.discount_type.name);
        }
        
        if (privilege.validity_years) {
            items.push(`${privilege.validity_years} year${privilege.validity_years === 1 ? '' : 's'} validity`);
        }
        
        if (privilege.requires_id_number) {
            items.push('ID required');
        }
        
        if (privilege.requires_verification) {
            items.push('Requires verification');
        } else {
            items.push('Auto-verified');
        }
        
        return items.join(' • ');
    }, [discountPercentage, privilege]);

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                
                <div className="p-6 border-b dark:border-slate-800">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-blue-500" />
                            <AlertDialogTitle>Assign {privilege.name}</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            {privilege.description || `Assign this privilege to barangay residents.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Configuration Summary Banner */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Privilege Configuration
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    {configSummary || 'No specific configuration set'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search residents by name, email, or contact number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-50 dark:bg-slate-800 border-none"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Assignment Configuration - Values to be stored in resident_privileges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                        {/* Discount Information (will be stored) */}
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-500">Discount %</Label>
                            <div className="text-sm font-semibold">
                                {discountPercentage !== null ? `${discountPercentage}%` : 'No discount'}
                            </div>
                            <p className="text-[11px] text-slate-400">From privilege default</p>
                        </div>

                        {/* Discount Type (will be stored) */}
                        {privilege.discount_type && (
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-500">Discount Type</Label>
                                <div className="text-sm font-semibold">{privilege.discount_type.name}</div>
                                <p className="text-[11px] text-slate-400">{privilege.discount_type.code}</p>
                            </div>
                        )}

                        {/* Expiration Date (will be stored) */}
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-500">Expiration Date</Label>
                            {privilege.validity_years ? (
                                <>
                                    <div className="text-sm font-semibold">
                                        {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'Auto-calculated'}
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        {privilege.validity_years} year(s) from assignment
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Input 
                                        type="date" 
                                        value={expiresAt}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="h-8 text-sm mt-1"
                                        placeholder="No default expiration"
                                    />
                                    <p className="text-[11px] text-slate-400">Optional - set custom date</p>
                                </>
                            )}
                        </div>

                        {/* Verification Status (will be stored) */}
                        <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-500">Verification</Label>
                            {privilege.requires_verification ? (
                                <>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Checkbox 
                                            id="verifyNow" 
                                            checked={verifyNow}
                                            onCheckedChange={(checked) => setVerifyNow(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="verifyNow"
                                            className="text-sm font-medium leading-none"
                                        >
                                            Verify immediately
                                        </label>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        {verifyNow ? 'Will be verified now' : 'Will be pending'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-sm font-semibold text-green-600">Auto-verified</div>
                                    <p className="text-[11px] text-slate-400">Privilege does not require verification</p>
                                </>
                            )}
                        </div>

                        {/* Notes (will be stored as remarks) */}
                        <div className="space-y-1 md:col-span-2 lg:col-span-4">
                            <Label className="text-xs font-medium text-slate-500">Remarks (Optional)</Label>
                            <Textarea 
                                placeholder="Add any remarks about these assignments..."
                                className="resize-none h-20 mt-1"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Residents Selection Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    Selected Residents: {selectedResidents.size}
                                </Label>
                                {selectedResidents.size > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Ready to assign
                                    </Badge>
                                )}
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleSelectAllVisible} 
                                className="h-8 text-xs"
                                disabled={residents.length === 0}
                            >
                                {residents.length > 0 && residents.every(r => selectedResidents.has(r.id)) 
                                    ? 'Deselect Page' 
                                    : 'Select Page'}
                            </Button>
                        </div>

                        <div className="border rounded-md dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableRow>
                                            <TableHead className="w-[50px]"></TableHead>
                                            <TableHead>Resident Name</TableHead>
                                            <TableHead>Contact</TableHead>
                                            {privilege.requires_id_number && (
                                                <TableHead className="w-[200px]">
                                                    ID Number <span className="text-red-500 ml-1">*</span>
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {residents.map((resident) => (
                                            <TableRow 
                                                key={resident.id} 
                                                className={`group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${
                                                    selectedResidents.has(resident.id) 
                                                        ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                                                        : ''
                                                }`}
                                            >
                                                <TableCell>
                                                    <Checkbox 
                                                        checked={selectedResidents.has(resident.id)}
                                                        onCheckedChange={() => toggleResident(resident.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">
                                                            {getFullName(resident)}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {resident.email || 'No email'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {resident.contact_number || 'No contact'}
                                                    </span>
                                                </TableCell>
                                                {privilege.requires_id_number && (
                                                    <TableCell>
                                                        <Input 
                                                            size={1}
                                                            placeholder="Enter ID number"
                                                            value={idNumbers[resident.id] || ''}
                                                            onChange={(e) => setIdNumbers(prev => ({...prev, [resident.id]: e.target.value}))}
                                                            disabled={!selectedResidents.has(resident.id)}
                                                            className={`h-8 text-sm ${!selectedResidents.has(resident.id) ? 'opacity-50' : ''}`}
                                                        />
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {loading && (
                                <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <p className="text-sm">Fetching residents...</p>
                                </div>
                            )}

                            {searchError && !loading && (
                                <div className="py-10 text-center text-red-500 text-sm">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                    <p>{searchError}</p>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => searchResidents(searchTerm, 1)}
                                        className="mt-2"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {!loading && !searchError && residents.length === 0 && (
                                <div className="py-10 text-center text-slate-500 text-sm">
                                    {searchTerm ? (
                                        <div className="space-y-1">
                                            <p>No residents found matching "{searchTerm}"</p>
                                            <p className="text-xs">Try different search terms</p>
                                        </div>
                                    ) : (
                                        <p>Start typing to search for residents</p>
                                    )}
                                </div>
                            )}

                            {hasMore && !loading && residents.length > 0 && (
                                <Button 
                                    variant="ghost" 
                                    className="w-full rounded-none border-t dark:border-slate-800 h-10 text-xs text-blue-500 hover:text-blue-600"
                                    onClick={() => searchResidents(searchTerm, page + 1)}
                                >
                                    <ChevronDown className="h-4 w-4 mr-1" /> Load More Residents
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                            <span>Selected: <strong>{selectedResidents.size}</strong></span>
                            
                            {privilege.requires_id_number && (
                                <span>ID Required: <strong className="text-amber-600">Yes</strong></span>
                            )}
                            
                            {discountPercentage !== null && (
                                <span>{discountPercentage}% discount</span>
                            )}
                            
                            {privilege.requires_verification ? (
                                verifyNow ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Will be verified
                                    </span>
                                ) : (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Pending verification
                                    </span>
                                )
                            ) : (
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Auto-verified
                                </span>
                            )}
                            
                            {expiresAt && (
                                <span>Expires: {new Date(expiresAt).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={assigning}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleAssign();
                            }}
                            disabled={assigning || selectedResidents.size === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 min-w-[200px]"
                        >
                            {assigning ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning...</>
                            ) : (
                                `Assign to ${selectedResidents.size} Resident${selectedResidents.size === 1 ? '' : 's'}`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};