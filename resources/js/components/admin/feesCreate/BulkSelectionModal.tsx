// components/admin/feesCreate/BulkSelectionModal.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Users, Home, User, AlertCircle } from 'lucide-react';
import BulkSelectionPanel from './BulkSelectionPanel';
import { Resident, Household, PrivilegeData } from '@/types/admin/fees/fees';

// Format currency helper
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

interface BulkSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    bulkType: 'residents' | 'households' | 'custom';
    residents: Resident[];
    households: Household[];
    puroks: string[];
    allPrivileges?: PrivilegeData[];
    selectedResidentIds: string[];
    selectedHouseholdIds: string[];
    customPayers: Array<{
        id: string;
        name: string;
        contact_number?: string;
        purok?: string;
        address?: string;
        type: 'custom';
    }>;
    filterPurok?: string;
    filterDiscountEligible?: boolean;
    applyToAllResidents: boolean;
    applyToAllHouseholds: boolean;
    searchTerm: string;
    toggleResidentSelection: (id: string | number) => void;
    toggleHouseholdSelection: (id: string | number) => void;
    addCustomPayer: () => void;
    removeCustomPayer: (id: string) => void;
    updateCustomPayer: (id: string, field: string, value: string) => void;
    handleSelectAllResidents: () => void;
    handleSelectAllHouseholds: () => void;
    setData: (key: string, value: any) => void;
    setSearchTerm: (term: string) => void;
    selectAllResidents: boolean;
    selectAllHouseholds: boolean;
    totalPayersCount: number;
    totalEstimatedAmount: number;
}

export default function BulkSelectionModal({
    isOpen,
    onClose,
    bulkType,
    totalPayersCount,
    totalEstimatedAmount,
    residents,
    households,
    puroks,
    allPrivileges,
    selectedResidentIds,
    selectedHouseholdIds,
    customPayers,
    filterPurok,
    filterDiscountEligible,
    applyToAllResidents,
    applyToAllHouseholds,
    searchTerm,
    toggleResidentSelection,
    toggleHouseholdSelection,
    addCustomPayer,
    removeCustomPayer,
    updateCustomPayer,
    handleSelectAllResidents,
    handleSelectAllHouseholds,
    setData,
    setSearchTerm,
    selectAllResidents,
    selectAllHouseholds
}: BulkSelectionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] lg:max-w-7xl h-[85vh] overflow-hidden p-0 flex flex-col gap-0">
                
                {/* Header */}
                <div className="flex-none border-b px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                                {bulkType === 'residents' && <Users className="h-7 w-7 text-primary dark:text-blue-400" />}
                                {bulkType === 'households' && <Home className="h-7 w-7 text-primary dark:text-blue-400" />}
                                {bulkType === 'custom' && <User className="h-7 w-7 text-primary dark:text-blue-400" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-xl font-bold truncate dark:text-gray-100">
                                    Bulk {bulkType === 'residents' ? 'Resident' : 
                                         bulkType === 'households' ? 'Household' : 'Custom Payer'} Selection
                                </DialogTitle>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                                        Select multiple {bulkType === 'residents' ? 'residents' : 
                                                         bulkType === 'households' ? 'households' : 'custom payers'} 
                                        to apply the same fee configuration
                                    </DialogDescription>
                                    {totalEstimatedAmount > 0 && (
                                        <Badge variant="outline" className="ml-0 sm:ml-2 font-medium dark:border-gray-700 dark:text-gray-300">
                                            Total: {formatCurrency(totalEstimatedAmount)}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                            <Badge variant="secondary" className="px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-300">
                                {totalPayersCount} selected
                            </Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-9 w-9 p-0 rounded-full flex-shrink-0 dark:hover:bg-gray-800"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0 overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        <div className="p-6">
                            <BulkSelectionPanel
                                bulkType={bulkType}
                                residents={residents}
                                households={households}
                                puroks={puroks}
                                allPrivileges={allPrivileges}
                                selectedResidentIds={selectedResidentIds}
                                selectedHouseholdIds={selectedHouseholdIds}
                                customPayers={customPayers}
                                filterPurok={filterPurok}
                                filterDiscountEligible={filterDiscountEligible}
                                applyToAllResidents={applyToAllResidents}
                                applyToAllHouseholds={applyToAllHouseholds}
                                searchTerm={searchTerm}
                                toggleResidentSelection={toggleResidentSelection}
                                toggleHouseholdSelection={toggleHouseholdSelection}
                                addCustomPayer={addCustomPayer}
                                removeCustomPayer={removeCustomPayer}
                                updateCustomPayer={updateCustomPayer}
                                handleSelectAllResidents={handleSelectAllResidents}
                                handleSelectAllHouseholds={handleSelectAllHouseholds}
                                setData={setData}
                                setSearchTerm={setSearchTerm}
                                selectAllResidents={selectAllResidents}
                                selectAllHouseholds={selectAllHouseholds}
                            />
                        </div>
                    </ScrollArea>
                </div>
                
                {/* Footer */}
                <div className="flex-none border-t px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Changes are saved automatically</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 sm:flex-none h-10 px-6 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
                
            </DialogContent>
        </Dialog>
    );
}