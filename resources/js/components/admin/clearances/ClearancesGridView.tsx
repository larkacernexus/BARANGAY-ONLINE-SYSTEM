import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown'; // USE ACTION DROPDOWN
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { 
    FileText, User, DollarSign, Eye, Edit, Printer, Trash2, Clipboard, CheckCircle, XCircle
} from 'lucide-react';
import { ClearanceRequest } from '@/types/clearances';

interface ClearancesGridViewProps {
    clearances: ClearanceRequest[];
    isBulkMode: boolean;
    selectedClearances: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (clearance: ClearanceRequest) => void;
    onViewPhoto: (clearance: ClearanceRequest) => void;
    handleRecordPayment: (clearance: ClearanceRequest) => void;
}

export default function ClearancesGridView({
    clearances,
    isBulkMode,
    selectedClearances,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewPhoto,
    handleRecordPayment
}: ClearancesGridViewProps) {

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'pending': 'secondary',
            'pending_payment': 'outline',
            'processing': 'outline',
            'approved': 'outline',
            'issued': 'default',
            'rejected': 'destructive',
            'cancelled': 'outline',
            'expired': 'outline'
        };
        return variants[status] || 'outline';
    };

    const getUrgencyVariant = (urgency: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'normal': 'outline',
            'rush': 'secondary',
            'express': 'default'
        };
        return variants[urgency] || 'outline';
    };

    const getStatusDisplay = (status: string): string => {
        const statusMap: Record<string, string> = {
            'pending': 'Pending Review',
            'pending_payment': 'Pending Payment',
            'processing': 'Under Processing',
            'approved': 'Approved',
            'issued': 'Issued',
            'rejected': 'Rejected',
            'cancelled': 'Cancelled',
            'expired': 'Expired'
        };
        return statusMap[status] || status;
    };

    const getResidentName = (resident?: any): string => {
        if (!resident) return 'N/A';
        if (resident.full_name) return resident.full_name;
        if (resident.first_name || resident.last_name) {
            return `${resident.first_name || ''} ${resident.last_name || ''}`.trim();
        }
        return 'N/A';
    };

    const emptyState = (
        <EmptyState
            title="No clearance requests found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a clearance request.'}
            icon={<FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/clearances/create'}
            createLabel="Create Clearance"
        />
    );

    return (
        <GridLayout
            isEmpty={clearances.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {clearances.map((clearance) => {
                const isSelected = selectedClearances.includes(clearance.id);
                
                return (
                    <Card 
                        key={clearance.id}
                        className={`overflow-hidden transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(clearance.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with Checkbox and ActionDropdown - JUST LIKE RESIDENTS */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">
                                            {clearance.reference_number}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            ID: {clearance.id}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(clearance.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                    )}
                                    {/* USE ACTIONDROPDOWN INSTEAD OF BUTTONS - JUST LIKE RESIDENTS */}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/clearances/${clearance.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            href={`/clearances/${clearance.id}/edit`}
                                        >
                                            Edit Clearance
                                        </ActionDropdownItem>
                                        
                                        {clearance.status === 'pending_payment' && (
                                            <>
                                                <ActionDropdownSeparator />
                                                <ActionDropdownItem
                                                    icon={<DollarSign className="h-4 w-4" />}
                                                    onClick={() => handleRecordPayment(clearance)}
                                                >
                                                    Record Payment
                                                </ActionDropdownItem>
                                            </>
                                        )}
                                        
                                        {clearance.status === 'issued' && (
                                            <>
                                                <ActionDropdownSeparator />
                                                <ActionDropdownItem
                                                    icon={<Printer className="h-4 w-4" />}
                                                    href={`/clearances/${clearance.id}/print`}
                                                >
                                                    Print Clearance
                                                </ActionDropdownItem>
                                            </>
                                        )}
                                        
                                        {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                            <>
                                                <ActionDropdownSeparator />
                                                <ActionDropdownItem
                                                    icon={<Trash2 className="h-4 w-4" />}
                                                    onClick={() => onDelete(clearance)}
                                                    dangerous
                                                >
                                                    Delete Clearance
                                                </ActionDropdownItem>
                                            </>
                                        )}
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content - UNIFORM STYLING */}
                            <div className="space-y-3">
                                {/* Resident Info */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">Resident</div>
                                    <div className="truncate text-gray-900 flex items-center gap-1">
                                        <User className="h-3.5 w-3.5 text-gray-500" />
                                        {getResidentName(clearance.resident)}
                                    </div>
                                </div>

                                {/* Purpose */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">Purpose</div>
                                    <div className="text-sm text-gray-600 truncate">
                                        {clearance.purpose}
                                    </div>
                                </div>

                                {/* Fee & Urgency */}
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm">
                                        ₱{Number(clearance.fee_amount || 0).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                    <Badge variant={getUrgencyVariant(clearance.urgency)}>
                                        {clearance.urgency === 'express' ? 'Express' : 
                                         clearance.urgency === 'rush' ? 'Rush' : 'Normal'}
                                    </Badge>
                                </div>

                                {/* Status Badge at bottom - JUST LIKE RESIDENTS */}
                                <div className="pt-2 border-t">
                                    <Badge 
                                        variant={getStatusVariant(clearance.status)}
                                        className="w-full justify-center text-xs"
                                    >
                                        {getStatusDisplay(clearance.status)}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}