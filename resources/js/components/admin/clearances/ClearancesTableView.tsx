// components/admin/clearances/ClearancesTableView.tsx

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
import { ClearanceRequest, ClearanceType, StatusOption } from '@/types/admin/clearances/clearance';
import { toast } from 'sonner';
import { JSX } from 'react';

// Define simplified types for nested objects
interface SimpleResident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    full_name: string;
    contact_number?: string;
    email?: string;
    address?: string;
    purok?: string;
}

interface SimpleBusiness {
    business_name?: string;
}

interface SimpleHousehold {
    head_name?: string;
    household_number?: string;
}

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

    const getContactNumber = (clearance: ClearanceRequest): string => {
        const anyClearance = clearance as any;
        if (anyClearance.contact_number && typeof anyClearance.contact_number === 'string') {
            return anyClearance.contact_number;
        }
        if (clearance.resident?.contact_number && typeof clearance.resident.contact_number === 'string') {
            return clearance.resident.contact_number;
        }
        return '';
    };

    const getAddress = (clearance: ClearanceRequest): string => {
        const anyClearance = clearance as any;
        if (anyClearance.contact_address && typeof anyClearance.contact_address === 'string') {
            return anyClearance.contact_address;
        }
        if (clearance.resident?.address && typeof clearance.resident.address === 'string') {
            return clearance.resident.address;
        }
        return '';
    };

    const getPurok = (clearance: ClearanceRequest): string => {
        const anyClearance = clearance as any;
        if (anyClearance.contact_purok && typeof anyClearance.contact_purok === 'string') {
            return anyClearance.contact_purok;
        }
        if (clearance.resident && (clearance.resident as any).purok && typeof (clearance.resident as any).purok === 'string') {
            return (clearance.resident as any).purok;
        }
        return '';
    };

    const getResidentName = (resident?: SimpleResident): string => {
        if (!resident) return 'N/A';
        if (resident.full_name && typeof resident.full_name === 'string') return resident.full_name;
        if (resident.first_name || resident.last_name) {
            const firstName = resident.first_name || '';
            const lastName = resident.last_name || '';
            return `${firstName} ${lastName}`.trim();
        }
        return 'N/A';
    };

    const getBusinessName = (business?: SimpleBusiness): string => {
        if (!business) return '';
        if (business.business_name && typeof business.business_name === 'string') {
            return business.business_name;
        }
        return '';
    };

    const getHouseholdName = (household?: SimpleHousehold): string => {
        if (!household) return '';
        if (household.head_name && typeof household.head_name === 'string') {
            return household.head_name;
        }
        if (household.household_number) {
            return `Household ${household.household_number}`;
        }
        return '';
    };

    const getPayerName = (clearance: ClearanceRequest): string => {
        const anyClearance = clearance as any;
        
        // First check if we have payer_name from the clearance
        if (anyClearance.payer_name && typeof anyClearance.payer_name === 'string') {
            return anyClearance.payer_name;
        }
        
        // Check based on payer_type
        if (anyClearance.payer_type === 'resident') {
            return getResidentName(clearance.resident as SimpleResident);
        }
        
        if (anyClearance.payer_type === 'household') {
            const householdName = getHouseholdName(anyClearance.household);
            if (householdName) return householdName;
        }
        
        if (anyClearance.payer_type === 'business') {
            const businessName = getBusinessName(anyClearance.business);
            if (businessName) return businessName;
        }
        
        // Fallback to contact name
        if (anyClearance.contact_name && typeof anyClearance.contact_name === 'string') {
            return anyClearance.contact_name;
        }
        
        return getResidentName(clearance.resident as SimpleResident) || 'N/A';
    };

    const getPayerId = (clearance: ClearanceRequest): string => {
        const anyClearance = clearance as any;
        
        if (anyClearance.payer_id) {
            return anyClearance.payer_id.toString();
        }
        if (anyClearance.payer_type === 'resident' && anyClearance.resident_id) {
            return anyClearance.resident_id.toString();
        }
        if (anyClearance.payer_type === 'household' && anyClearance.household_id) {
            return anyClearance.household_id.toString();
        }
        if (anyClearance.payer_type === 'business' && anyClearance.business_id) {
            return anyClearance.business_id.toString();
        }
        return '';
    };

    const getBalance = (clearance: ClearanceRequest): number => {
        const anyClearance = clearance as any;
        
        if (anyClearance.balance !== undefined && anyClearance.balance !== null) {
            return Number(anyClearance.balance);
        }
        // If balance not provided, calculate from fee_amount and amount_paid
        const fee = Number(clearance.fee_amount) || 0;
        const paid = Number(anyClearance.amount_paid) || 0;
        return Math.max(0, fee - paid);
    };

    const isPriorityUrgency = (urgency: string): boolean => {
        return urgency === 'express' || urgency === 'rush';
    };

    // Handle Record Payment to go directly to Step 2 (Payment Page)
    const handlePaymentClick = (clearance: ClearanceRequest) => {
        const anyClearance = clearance as any;
        
        // Build parameters
        const params: Record<string, string> = {
            clearance_request_id: clearance.id.toString(),
            payer_type: anyClearance.payer_type || 'resident',
            payer_id: getPayerId(clearance),
            payer_name: getPayerName(clearance),
            contact_number: getContactNumber(clearance),
            address: getAddress(clearance),
            purok: getPurok(clearance),
            clearance_type: clearance.clearance_type?.name || 'Clearance',
            clearance_type_id: clearance.clearance_type_id?.toString() || '',
            purpose: clearance.purpose || '',
            fee_amount: (clearance.fee_amount || 0).toString(),
            balance: getBalance(clearance).toString(),
            from_clearance: 'true',
            source: 'clearance',
            reference_number: clearance.reference_number || '',
            _t: Date.now().toString()
        };

        // Filter out empty values
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '')
        );

        const url = `/payments/payments/create?${new URLSearchParams(filteredParams).toString()}`;
        
        toast.info('Redirecting to payment page...');
        window.location.href = url;
    };

    if (clearances.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No clearances found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No clearance requests match your current filters.</p>
                {hasActiveFilters && (
                    <Button variant="outline" onClick={onClearFilters}>
                        Clear Filters
                    </Button>
                )}
            </div>
        );
    }

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
                        const anyClearance = clearance as any;
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
                                        {getPayerIcon(anyClearance.payer_type)}
                                        <div className="min-w-0">
                                            <div className="truncate">
                                                {getPayerName(clearance)}
                                            </div>
                                            {anyClearance.payer_type && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {anyClearance.payer_type.charAt(0).toUpperCase() + anyClearance.payer_type.slice(1)}
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
                                                        className="flex items-center cursor-pointer"
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