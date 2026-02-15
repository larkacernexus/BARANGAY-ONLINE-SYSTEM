import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Users, Home, User, AlertCircle } from 'lucide-react';
import BulkSelectionPanel from './BulkSelectionPanel';
import { formatCurrency } from '@/admin-utils/fees/discount-display-utils';

interface BulkSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    bulkType: 'residents' | 'households' | 'custom';
    residents: any[];
    households: any[];
    puroks: string[];
    selectedResidentIds: (string | number)[];
    selectedHouseholdIds: (string | number)[];
    customPayers: any[];
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
    ...bulkPanelProps
}: BulkSelectionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] lg:max-w-7xl h-[85vh] overflow-hidden p-0 flex flex-col gap-0">
                
                {/* Header */}
                <div className="flex-none border-b px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                                {bulkType === 'residents' && <Users className="h-7 w-7 text-primary" />}
                                {bulkType === 'households' && <Home className="h-7 w-7 text-primary" />}
                                {bulkType === 'custom' && <User className="h-7 w-7 text-primary" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-xl font-bold truncate">
                                    Bulk {bulkType === 'residents' ? 'Resident' : 
                                         bulkType === 'households' ? 'Household' : 'Custom Payer'} Selection
                                </DialogTitle>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <DialogDescription className="text-sm text-gray-600">
                                        Select multiple {bulkType} to apply the same fee configuration
                                    </DialogDescription>
                                    {totalEstimatedAmount > 0 && (
                                        <Badge variant="outline" className="ml-0 sm:ml-2 font-medium">
                                            Total: {formatCurrency(totalEstimatedAmount)}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                                {totalPayersCount} selected
                            </Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-9 w-9 p-0 rounded-full flex-shrink-0"
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
                                {...bulkPanelProps}
                            />
                        </div>
                    </ScrollArea>
                </div>
                
                {/* Footer */}
                <div className="flex-none border-t px-6 py-4 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Changes are saved automatically</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 sm:flex-none h-10 px-6"
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