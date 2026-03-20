import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    FileText, User, Clock, DollarSign, RefreshCw, 
    CheckCircle, XCircle, AlertCircle, Zap, AlertTriangle,
    Eye, Edit, Printer, Trash2, Copy, MoreVertical,
    ArrowUpDown, CreditCard, Home, Building
} from 'lucide-react';
import { ClearanceRequest, ClearanceType, Resident, StatusOption } from '@/types/clearances';
import { toast } from 'sonner';
import { JSX } from 'react';

interface ClearancesTableViewProps {
    clearances: ClearanceRequest[];
    isBulkMode: boolean;
    selectedClearances: number[];
    filtersState: any;
    onItemSelect: (id: number) => void;
    onSort: (column: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (clearance: ClearanceRequest) => void;
    onViewPhoto: (clearance: ClearanceRequest) => void;
    onSelectAllOnPage: () => void;
    isSelectAll: boolean;
    handleRecordPayment: (clearance: ClearanceRequest) => void;
    isLoading: boolean;
    clearanceTypes: ClearanceType[];
    statusOptions: StatusOption[];
}

export default function ClearancesTableView({
    clearances,
    isBulkMode,
    selectedClearances,
    filtersState,
    onItemSelect,
    onSort,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onViewPhoto,
    onSelectAllOnPage,
    isSelectAll,
    handleRecordPayment,
    isLoading,
    clearanceTypes,
    statusOptions
}: ClearancesTableViewProps) {

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

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'pending': <Clock className="h-4 w-4 text-amber-500" />,
            'pending_payment': <DollarSign className="h-4 w-4 text-amber-500" />,
            'processing': <RefreshCw className="h-4 w-4 text-blue-500" />,
            'approved': <CheckCircle className="h-4 w-4 text-green-500" />,
            'issued': <CheckCircle className="h-4 w-4 text-green-500" />,
            'rejected': <XCircle className="h-4 w-4 text-red-500" />,
            'cancelled': <XCircle className="h-4 w-4 text-gray-500" />,
            'expired': <AlertCircle className="h-4 w-4 text-gray-500" />
        };
        return icons[status] || null;
    };

    const getPayerIcon = (payerType?: string) => {
        switch (payerType) {
            case 'household': return <Home className="h-4 w-4 text-gray-500" />;
            case 'business': return <Building className="h-4 w-4 text-gray-500" />;
            default: return <User className="h-4 w-4 text-gray-500" />;
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

    const getResidentName = (resident?: Resident): string => {
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
        // First check if we have payer_name from the clearance
        if (clearance.payer_name && typeof clearance.payer_name === 'string') {
            return clearance.payer_name;
        }
        
        // Check based on payer_type
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
        
        // Fallback to contact name
        if (clearance.contact_name && typeof clearance.contact_name === 'string') {
            return clearance.contact_name;
        }
        
        return getResidentName(clearance.resident) || 'N/A';
    };

    const getPayerId = (clearance: ClearanceRequest): string => {
        if (clearance.payer_id) {
            return clearance.payer_id.toString();
        }
        if (clearance.payer_type === 'resident' && clearance.resident_id) {
            return clearance.resident_id.toString();
        }
        if (clearance.payer_type === 'household' && clearance.household_id) {
            return clearance.household_id.toString();
        }
        if (clearance.payer_type === 'business' && clearance.business_id) {
            return clearance.business_id.toString();
        }
        return '';
    };

    const getBalance = (clearance: ClearanceRequest): number => {
        if (clearance.balance !== undefined && clearance.balance !== null) {
            return Number(clearance.balance);
        }
        // If balance not provided, calculate from fee_amount and amount_paid
        const fee = Number(clearance.fee_amount) || 0;
        const paid = Number(clearance.amount_paid) || 0;
        return Math.max(0, fee - paid);
    };

    const isPriorityUrgency = (urgency: string): boolean => {
        return urgency === 'express' || urgency === 'rush';
    };

    // ===== REVISED: Handle Record Payment to go directly to Step 2 (Payment Page) =====
    const handlePaymentClick = (clearance: ClearanceRequest) => {
        console.log('=== RECORD PAYMENT CLICKED - GOING TO STEP 2 ===');
        console.log('Clearance:', {
            id: clearance.id,
            reference: clearance.reference_number,
            fee_amount: clearance.fee_amount,
            status: clearance.status,
            payment_status: clearance.payment_status,
            payer_type: clearance.payer_type,
            resident: clearance.resident?.full_name
        });

        // Build parameters - MATCHING what Create.tsx expects
        const params: Record<string, string> = {
            // PRIMARY IDENTIFIER - this is what Create.tsx uses to pre-fill
            clearance_request_id: clearance.id.toString(),
            
            // Payer info (for the form)
            payer_type: clearance.payer_type || 'resident',
            payer_id: getPayerId(clearance),
            payer_name: getPayerName(clearance),
            
            // Contact details (for display and pre-filling)
            contact_number: getContactNumber(clearance),
            address: getAddress(clearance),
            purok: getPurok(clearance),
            
            // Clearance details that Create.tsx uses
            clearance_type: clearance.clearance_type?.name || 'Clearance',
            clearance_type_id: clearance.clearance_type_id?.toString() || '',
            purpose: clearance.purpose || '',
            fee_amount: (clearance.fee_amount || 0).toString(),
            balance: getBalance(clearance).toString(),
            
            // Source flags
            from_clearance: 'true',
            source: 'clearance',
            
            // Additional context for the payment page
            reference_number: clearance.reference_number || '',
            
            // Timestamp to prevent caching
            _t: Date.now().toString()
        };

        // Filter out empty values
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '')
        );

        // Use the correct URL path - MATCHING the route in Create.tsx
        const url = `/payments/payments/create?${new URLSearchParams(filteredParams).toString()}`;
        
        console.log('✅ GOING TO STEP 2 - Payment URL:', url);
        console.log('Params being sent:', filteredParams);
        
        // Show loading toast
        toast.info('Redirecting to payment page...');
        
        // Navigate directly to payment page (Step 2)
        window.location.href = url;
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900">
                        {isBulkMode && (
                            <TableHead className="w-12 px-4">
                                <div className="flex items-center">
                                    <Checkbox
                                        checked={isSelectAll && clearances.length > 0}
                                        onCheckedChange={onSelectAllOnPage}
                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        disabled={isLoading}
                                    />
                                </div>
                            </TableHead>
                        )}
                        <TableHead className="min-w-[140px] px-4">
                            <div className="flex items-center gap-1">
                                Reference No.
                                <button
                                    onClick={() => onSort('reference_number')}
                                    className="ml-1 hover:text-gray-900 dark:hover:text-gray-300"
                                    title="Sort by reference"
                                    disabled={isLoading}
                                >
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </div>
                        </TableHead>
                        <TableHead className="min-w-[160px] px-4">Payer</TableHead>
                        <TableHead className="min-w-[180px] px-4">Purpose & Type</TableHead>
                        <TableHead className="min-w-[140px] px-4">Fee & Urgency</TableHead>
                        <TableHead className="min-w-[160px] px-4">Status</TableHead>
                        <TableHead className="text-right min-w-[80px] px-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clearances.map((clearance) => {
                        const isSelected = selectedClearances.includes(clearance.id);
                        const isPriority = isPriorityUrgency(clearance.urgency);
                        
                        return (
                            <TableRow 
                                key={clearance.id}
                                className={`${isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''} ${isPriority ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}
                                onClick={(e) => {
                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                        !e.target.closest('a') && 
                                        !e.target.closest('button') &&
                                        !e.target.closest('.dropdown-menu-content') &&
                                        !e.target.closest('input[type="checkbox"]')) {
                                        onItemSelect(clearance.id);
                                    }
                                }}
                            >
                                {isBulkMode && (
                                    <TableCell className="px-4">
                                        <div className="flex items-center">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => onItemSelect(clearance.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-mono text-sm truncate">
                                                {clearance.reference_number}
                                            </div>
                                            {clearance.clearance_number && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {clearance.clearance_number}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4">
                                    <div className="flex items-center gap-2">
                                        {getPayerIcon(clearance.payer_type)}
                                        <div className="min-w-0">
                                            <div className="truncate">
                                                {getPayerName(clearance)}
                                            </div>
                                            {clearance.payer_type && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {clearance.payer_type.charAt(0).toUpperCase() + clearance.payer_type.slice(1)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4">
                                    <div className="space-y-1">
                                        <div className="font-medium truncate">
                                            {clearance.purpose}
                                        </div>
                                        <Badge variant="outline" className="font-normal text-xs truncate max-w-full">
                                            {clearance.clearance_type?.name || 'N/A'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4">
                                    <div className="space-y-1">
                                        <div className="font-medium truncate">
                                            ₱{Number(clearance.fee_amount || 0).toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </div>
                                        <Badge 
                                            variant={getUrgencyVariant(clearance.urgency)} 
                                            className={`flex items-center gap-1 truncate max-w-full ${isPriority ? 'font-semibold' : ''}`}
                                        >
                                            {clearance.urgency === 'express' ? <Zap className="h-3 w-3" /> : 
                                             clearance.urgency === 'rush' ? <AlertTriangle className="h-3 w-3" /> : null}
                                            <span className="truncate">
                                                {getUrgencyDisplay(clearance.urgency)}
                                            </span>
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4">
                                    <div className="flex flex-col gap-1">
                                        <Badge 
                                            variant={getStatusVariant(clearance.status)} 
                                            className="flex items-center gap-1 truncate max-w-full"
                                        >
                                            {getStatusIcon(clearance.status)}
                                            <span className="truncate">
                                                {getStatusDisplay(clearance.status)}
                                            </span>
                                        </Badge>
                                        {isPriority && (
                                            <Badge 
                                                variant={clearance.urgency === 'express' ? "destructive" : "secondary"} 
                                                className="text-xs flex items-center gap-1 truncate max-w-full"
                                            >
                                                {clearance.urgency === 'express' ? (
                                                    <>
                                                        <Zap className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">High Priority</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">Priority</span>
                                                    </>
                                                )}
                                            </Badge>
                                        )}
                                        {clearance.issuing_officer_name && (
                                            <div className="text-xs text-gray-500 truncate max-w-full">
                                                {clearance.issuing_officer_name}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={isLoading}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem asChild>
                                                <a href={`/admin/clearances/${clearance.id}`} className="flex items-center cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <span>View Details</span>
                                                </a>
                                            </DropdownMenuItem>
                                            
                                            {['pending', 'processing', 'approved'].includes(clearance.status) && (
                                                <DropdownMenuItem asChild>
                                                    <a href={`/admin/clearances/${clearance.id}/edit`} className="flex items-center cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit Request</span>
                                                    </a>
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {/* Payment options - ONLY for pending_payment */}
                                            {clearance.status === 'pending_payment' && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handlePaymentClick(clearance);
                                                        }}
                                                        className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md cursor-pointer"
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4 text-green-600" />
                                                        <span className="text-green-600 font-medium">Record Payment</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            {clearance.status === 'issued' && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/admin/clearances/${clearance.id}/print`} className="flex items-center cursor-pointer">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            <span>Print Clearance</span>
                                                        </a>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            <DropdownMenuSeparator />
                                            
                                            <DropdownMenuItem 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(clearance.reference_number);
                                                    toast.success('Reference number copied to clipboard');
                                                }}
                                                className="flex items-center cursor-pointer"
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                <span>Copy Reference</span>
                                            </DropdownMenuItem>
                                            
                                            {isBulkMode && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => onItemSelect(clearance.id)}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        {isSelected ? (
                                                            <>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Deselect</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                <span>Select for Bulk</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            
                                            {['pending', 'pending_payment', 'processing'].includes(clearance.status) && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        onClick={() => onDelete(clearance)}
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Cancel Request</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}