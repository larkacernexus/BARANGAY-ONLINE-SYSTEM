import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { 
    FileText, User, DollarSign, Eye, Edit, Printer, Trash2, Copy, CheckCircle, 
    CreditCard, Home, Building, Zap, AlertTriangle, Clock
} from 'lucide-react';
import { ClearanceRequest } from '@/types/clearances';
import { toast } from 'sonner';

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

    const getUrgencyDisplay = (urgency: string): string => {
        const urgencyMap: Record<string, string> = {
            'normal': 'Normal',
            'rush': 'Rush',
            'express': 'Express'
        };
        return urgencyMap[urgency] || 'Normal';
    };

    const getPayerIcon = (payerType?: string) => {
        switch (payerType) {
            case 'household': return <Home className="h-3.5 w-3.5 text-gray-500" />;
            case 'business': return <Building className="h-3.5 w-3.5 text-gray-500" />;
            default: return <User className="h-3.5 w-3.5 text-gray-500" />;
        }
    };

    const safeString = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return '';
        if (typeof value === 'object') return '';
        return String(value);
    };

    const getContactNumber = (clearance: ClearanceRequest): string => {
        if (clearance.contact_number && typeof clearance.contact_number === 'string') {
            return clearance.contact_number;
        }
        if (clearance.resident?.contact_number && typeof clearance.resident.contact_number === 'string') {
            return clearance.resident.contact_number;
        }
        return '';
    };

    const getAddress = (clearance: ClearanceRequest): string => {
        if (clearance.contact_address && typeof clearance.contact_address === 'string') {
            return clearance.contact_address;
        }
        if (clearance.resident?.address && typeof clearance.resident.address === 'string') {
            return clearance.resident.address;
        }
        return '';
    };

    const getPurok = (clearance: ClearanceRequest): string => {
        if (clearance.contact_purok && typeof clearance.contact_purok === 'string') {
            return clearance.contact_purok;
        }
        if (clearance.resident?.purok && typeof clearance.resident.purok === 'string') {
            return clearance.resident.purok;
        }
        return '';
    };

    const getResidentName = (resident?: any): string => {
        if (!resident) return 'N/A';
        if (resident.full_name && typeof resident.full_name === 'string') return resident.full_name;
        if (resident.first_name || resident.last_name) {
            const firstName = typeof resident.first_name === 'string' ? resident.first_name : '';
            const lastName = typeof resident.last_name === 'string' ? resident.last_name : '';
            return `${firstName} ${lastName}`.trim();
        }
        return 'N/A';
    };

    const getBusinessName = (business: any): string => {
        if (!business || typeof business !== 'object') return '';
        if (business && typeof business === 'object' && 'business_name' in business) {
            const businessName = (business as any).business_name;
            if (typeof businessName === 'string') return businessName;
        }
        return '';
    };

    const getHouseholdName = (household: any): string => {
        if (!household || typeof household !== 'object') return '';
        if (household && typeof household === 'object') {
            if ('head_name' in household && typeof (household as any).head_name === 'string') {
                return (household as any).head_name;
            }
            if ('household_number' in household && (household as any).household_number) {
                return `Household ${(household as any).household_number}`;
            }
        }
        return '';
    };

    const getPayerName = (clearance: ClearanceRequest): string => {
        if (clearance.payer_name && typeof clearance.payer_name === 'string') {
            return clearance.payer_name;
        }
        
        if (clearance.payer_type === 'resident') {
            return getResidentName(clearance.resident);
        }
        
        if (clearance.payer_type === 'household') {
            const householdName = getHouseholdName(clearance.household);
            if (householdName) return householdName;
        }
        
        if (clearance.payer_type === 'business') {
            const businessName = getBusinessName(clearance.business);
            if (businessName) return businessName;
        }
        
        if (clearance.contact_name && typeof clearance.contact_name === 'string') {
            return clearance.contact_name;
        }
        
        return getResidentName(clearance.resident) || 'N/A';
    };

    // ===== UPDATED: Handle Record Payment to pass data to AddFeesStep =====
    const handlePaymentClick = (clearance: ClearanceRequest) => {
        console.log('=== RECORD PAYMENT CLICKED (GRID) ===');
        console.log('Clearance:', {
            id: clearance.id,
            reference: clearance.reference_number,
            fee_amount: clearance.fee_amount
        });

        // Build parameters - FOCUS ON CLEARANCE_REQUEST_ID
        const params: Record<string, string> = {
            // PRIMARY IDENTIFIER - this will load the clearance in AddFeesStep
            clearance_request_id: clearance.id.toString(),
            
            // Payer info
            payer_type: clearance.payer_type || 'resident',
            payer_id: safeString(clearance.payer_id || clearance.resident_id || ''),
            payer_name: getPayerName(clearance),
            
            // Contact info
            contact_number: getContactNumber(clearance),
            address: getAddress(clearance),
            purok: getPurok(clearance),
            
            // Clearance details
            clearance_type: clearance.clearance_type?.name || 'Clearance',
            clearance_type_id: clearance.clearance_type_id?.toString() || '',
            purpose: clearance.purpose || '',
            fee_amount: (clearance.fee_amount || 0).toString(),
            
            // Explicitly set source to avoid confusion
            source: 'clearance',
            from_clearance: 'true',
            
            // Optional: include fee_code as a descriptive field only
            fee_code: clearance.clearance_type?.code || `CLR-${clearance.id}`,
            
            // Timestamp to prevent caching
            _t: Date.now().toString()
        };

        // Filter out empty values
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '')
        );

        // Use the correct URL path: /payments/payments/create
        const url = `/payments/payments/create?${new URLSearchParams(filteredParams).toString()}`;
        
        console.log('Final Payment URL (Grid):', url);
        
        // Show loading toast
        toast.info('Redirecting to payment page...');
        
        // Navigate
        window.location.href = url;
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
            onCreateNew={() => window.location.href = '/admin/clearances/create'}
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
                const isPriority = clearance.urgency === 'express' || clearance.urgency === 'rush';
                
                return (
                    <Card 
                        key={clearance.id}
                        className={`overflow-hidden transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
                        } ${isPriority ? 'border-yellow-300 dark:border-yellow-700' : ''}`}
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
                            {/* Header with Reference and Actions */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isPriority ? 'bg-yellow-100' : 'bg-blue-100'
                                    }`}>
                                        {isPriority ? (
                                            clearance.urgency === 'express' ? 
                                                <Zap className="h-5 w-5 text-orange-600" /> :
                                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        )}
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
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/admin/clearances/${clearance.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        {['pending', 'processing', 'approved'].includes(clearance.status) && (
                                            <ActionDropdownItem
                                                icon={<Edit className="h-4 w-4" />}
                                                href={`/admin/clearances/${clearance.id}/edit`}
                                            >
                                                Edit Clearance
                                            </ActionDropdownItem>
                                        )}
                                        
                                        {/* Payment options - show for pending_payment */}
                                        {clearance.status === 'pending_payment' && (
                                            <>
                                                <ActionDropdownSeparator />
                                                <ActionDropdownItem
                                                    icon={<CreditCard className="h-4 w-4" />}
                                                    onClick={() => handlePaymentClick(clearance)}
                                                >
                                                    <span className="text-green-600 font-medium">Record Payment</span>
                                                </ActionDropdownItem>
                                            </>
                                        )}
                                        
                                        {clearance.status === 'issued' && (
                                            <>
                                                <ActionDropdownSeparator />
                                                <ActionDropdownItem
                                                    icon={<Printer className="h-4 w-4" />}
                                                    href={`/admin/clearances/${clearance.id}/print`}
                                                >
                                                    Print Clearance
                                                </ActionDropdownItem>
                                            </>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => {
                                                navigator.clipboard.writeText(clearance.reference_number);
                                                toast.success('Reference number copied to clipboard');
                                            }}
                                        >
                                            Copy Reference
                                        </ActionDropdownItem>
                                        
                                        {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                            <>
                                                <ActionDropdownSeparator />
                                                <ActionDropdownItem
                                                    icon={<Trash2 className="h-4 w-4" />}
                                                    onClick={() => onDelete(clearance)}
                                                    dangerous
                                                >
                                                    Cancel Request
                                                </ActionDropdownItem>
                                            </>
                                        )}
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Payer Info */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">Payer</div>
                                    <div className="truncate text-gray-900 flex items-center gap-1">
                                        {getPayerIcon(clearance.payer_type)}
                                        {getPayerName(clearance)}
                                    </div>
                                    {clearance.payer_type && (
                                        <div className="text-xs text-gray-500 truncate">
                                            {clearance.payer_type.charAt(0).toUpperCase() + clearance.payer_type.slice(1)}
                                        </div>
                                    )}
                                </div>

                                {/* Purpose */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700">Purpose</div>
                                    <div className="text-sm text-gray-600 truncate">
                                        {clearance.purpose}
                                    </div>
                                </div>

                                {/* Clearance Type */}
                                <div className="space-y-1">
                                    <div className="text-xs text-gray-500">Type</div>
                                    <Badge variant="outline" className="font-normal text-xs truncate max-w-full">
                                        {clearance.clearance_type?.name || 'N/A'}
                                    </Badge>
                                </div>

                                {/* Fee & Urgency */}
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm">
                                        ₱{Number(clearance.fee_amount || 0).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                    <Badge 
                                        variant={getUrgencyVariant(clearance.urgency)} 
                                        className={`flex items-center gap-1 ${isPriority ? 'font-semibold' : ''}`}
                                    >
                                        {clearance.urgency === 'express' ? <Zap className="h-3 w-3" /> : 
                                         clearance.urgency === 'rush' ? <AlertTriangle className="h-3 w-3" /> : 
                                         <Clock className="h-3 w-3" />}
                                        {getUrgencyDisplay(clearance.urgency)}
                                    </Badge>
                                </div>

                                {/* Status Badge at bottom */}
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