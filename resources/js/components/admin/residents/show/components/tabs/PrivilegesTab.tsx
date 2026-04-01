import { Link } from '@inertiajs/react';
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Award, 
    Edit, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    XCircle,
    Plus,
    Loader2,
    X
} from "lucide-react";
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Import types from main types file
import { 
    Privilege, 
    ResidentPrivilege 
} from '@/types/admin/residents/residents-types';
import { PrivilegesTable } from '../PrivilegesTable';

// Import shadcn dialog components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PrivilegesTabProps {
    privileges: ResidentPrivilege[];
    residentId: number;
    activePrivileges: ResidentPrivilege[];
    expiringSoonPrivileges: ResidentPrivilege[];
    pendingPrivileges: ResidentPrivilege[];
    expiredPrivileges: ResidentPrivilege[];
    availablePrivileges?: Privilege[];
}

export const PrivilegesTab = ({ 
    privileges, 
    residentId,
    activePrivileges,
    expiringSoonPrivileges,
    pendingPrivileges,
    expiredPrivileges,
    availablePrivileges: initialAvailablePrivileges = []
}: PrivilegesTabProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availablePrivileges, setAvailablePrivileges] = useState<Privilege[]>(initialAvailablePrivileges);
    const [isLoadingPrivileges, setIsLoadingPrivileges] = useState(false);
    
    // Form state
    const [selectedPrivilege, setSelectedPrivilege] = useState<string>('');
    const [idNumber, setIdNumber] = useState('');
    const [issuedDate, setIssuedDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const hasPrivileges = privileges.length > 0;

    // Fetch available privileges when modal opens only if we don't have them from props
    useEffect(() => {
        if (isModalOpen && availablePrivileges.length === 0) {
            fetchAvailablePrivileges();
        }
    }, [isModalOpen]);

    const fetchAvailablePrivileges = async () => {
        setIsLoadingPrivileges(true);
        try {
            // Fetch all active privileges that aren't already assigned to this resident
            const response = await fetch(`/admin/privileges/available?resident_id=${residentId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAvailablePrivileges(data);
        } catch (error) {
            console.error('Error fetching privileges:', error);
            alert('Failed to load available privileges. Please try again.');
        } finally {
            setIsLoadingPrivileges(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        // Reset form
        setSelectedPrivilege('');
        setIdNumber('');
        setIssuedDate('');
        setExpiryDate('');
        setRemarks('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddPrivilege = () => {
        if (!selectedPrivilege) return;

        setIsSubmitting(true);
        
        // Prepare data for submission
        const data = {
            privilege_id: selectedPrivilege,
            id_number: idNumber || null,
            issued_date: issuedDate || null,
            expiry_date: expiryDate || null,
            remarks: remarks || null,
        };

        // POST request to add privilege
        router.post(route('admin.residents.privileges.store', { resident: residentId }), data, {
            onSuccess: () => {
                setIsModalOpen(false);
                setIsSubmitting(false);
                // Reset form
                setSelectedPrivilege('');
                setIdNumber('');
                setIssuedDate('');
                setExpiryDate('');
                setRemarks('');
            },
            onError: (errors) => {
                console.error('Error adding privilege:', errors);
                setIsSubmitting(false);
            }
        });
    };

    const handleRemovePrivilege = (privilegeId: number) => {
        if (confirm('Are you sure you want to remove this privilege?')) {
            router.delete(route('admin.residents.privileges.destroy', { 
                resident: residentId, 
                privilege: privilegeId 
            }), {
                onSuccess: () => {
                    // Refresh will happen automatically
                }
            });
        }
    };

    // Get the selected privilege details for conditional rendering
    const selectedPrivilegeDetails = availablePrivileges.find(p => p.id.toString() === selectedPrivilege);

    // Helper function to get privilege name with fallback
    const getPrivilegeName = (privilege: Privilege) => {
        return privilege.name || privilege.code || 'Unknown Benefit';
    };

    // Helper function to get privilege discount display
    const getDiscountDisplay = (privilege: Privilege) => {
        if (privilege.default_discount_percentage && privilege.default_discount_percentage > 0) {
            return `${privilege.default_discount_percentage}% off`;
        }
        if (privilege.discount_type?.name) {
            return privilege.discount_type.name;
        }
        return null;
    };

    return (
        <>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <Award className="h-5 w-5" />
                                Benefits & Privileges
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Special categories and discount eligibilities
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="dark:border-gray-600 dark:text-gray-300"
                            onClick={handleOpenModal}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Benefit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {hasPrivileges ? (
                        <>
                            {/* Privilege Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activePrivileges.length}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                                </div>
                                
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2">
                                        <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{expiringSoonPrivileges.length}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
                                </div>
                                
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingPrivileges.length}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                </div>
                                
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{expiredPrivileges.length}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
                                </div>
                            </div>

                            {/* Benefits Details Table */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Benefits Details</h3>
                                <PrivilegesTable 
                                    privileges={privileges} 
                                    onRemove={handleRemovePrivilege}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                <Award className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No benefits assigned</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                This resident doesn't have any benefits or privileges yet.
                            </p>
                            <Button 
                                variant="outline" 
                                className="dark:border-gray-600 dark:text-gray-300"
                                onClick={handleOpenModal}
                            >
                                <Award className="h-4 w-4 mr-2" />
                                Add Benefits
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Privilege Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="dark:text-gray-100">Add Benefit</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Assign a new benefit or privilege to this resident.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Privilege Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="privilege" className="dark:text-gray-300">
                                Benefit Type <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={selectedPrivilege} 
                                onValueChange={setSelectedPrivilege}
                                disabled={isLoadingPrivileges}
                            >
                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                                    <SelectValue placeholder={isLoadingPrivileges ? "Loading privileges..." : "Select a benefit"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePrivileges.length > 0 ? (
                                        availablePrivileges.map((privilege) => {
                                            const discountDisplay = getDiscountDisplay(privilege);
                                            return (
                                                <SelectItem key={privilege.id} value={privilege.id.toString()}>
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span>{getPrivilegeName(privilege)}</span>
                                                            <span className="text-xs text-gray-500">({privilege.code})</span>
                                                        </div>
                                                        {discountDisplay && (
                                                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                                                                {discountDisplay}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    ) : !isLoadingPrivileges && (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            No available benefits to add
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ID Number - show if privilege requires it */}
                        {selectedPrivilegeDetails?.requires_id_number && (
                            <div className="space-y-2">
                                <Label htmlFor="idNumber" className="dark:text-gray-300">
                                    ID Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="idNumber"
                                    placeholder="Enter ID number"
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                    className="dark:bg-gray-900 dark:border-gray-700"
                                    required
                                />
                            </div>
                        )}

                        {/* Issued Date */}
                        <div className="space-y-2">
                            <Label htmlFor="issuedDate" className="dark:text-gray-300">
                                Issued Date
                            </Label>
                            <Input
                                id="issuedDate"
                                type="date"
                                value={issuedDate}
                                onChange={(e) => setIssuedDate(e.target.value)}
                                className="dark:bg-gray-900 dark:border-gray-700"
                            />
                        </div>

                        {/* Expiry Date */}
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate" className="dark:text-gray-300">
                                Expiry Date
                            </Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="dark:bg-gray-900 dark:border-gray-700"
                                placeholder={
                                    selectedPrivilegeDetails?.validity_years 
                                        ? `Auto-calculated (${selectedPrivilegeDetails.validity_years} years validity)` 
                                        : 'Optional'
                                }
                            />
                            {selectedPrivilegeDetails?.validity_years && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    This benefit is valid for {selectedPrivilegeDetails.validity_years} years
                                </p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <Label htmlFor="remarks" className="dark:text-gray-300">
                                Remarks (Optional)
                            </Label>
                            <Input
                                id="remarks"
                                placeholder="Add any additional notes"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="dark:bg-gray-900 dark:border-gray-700"
                            />
                        </div>
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
                        <Button
                            type="button"
                            onClick={handleAddPrivilege}
                            disabled={
                                isSubmitting || 
                                !selectedPrivilege || 
                                (selectedPrivilegeDetails?.requires_id_number && !idNumber)
                            }
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Award className="h-4 w-4 mr-2" />
                                    Add Benefit
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};