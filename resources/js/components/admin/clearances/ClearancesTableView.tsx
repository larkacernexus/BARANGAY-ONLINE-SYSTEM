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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    FileText, User, Clock, DollarSign, RefreshCw, 
    CheckCircle, XCircle, AlertCircle, Zap, AlertTriangle,
    Eye, Edit, Printer, Trash2, Copy, MoreVertical,
    ArrowUpDown
} from 'lucide-react';
import { ClearanceRequest, ClearanceType, StatusOption } from '@/types/clearances';
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

    const getResidentName = (resident?: any): string => {
        if (!resident) return 'N/A';
        if (resident.full_name) return resident.full_name;
        if (resident.first_name || resident.last_name) {
            return `${resident.first_name || ''} ${resident.last_name || ''}`.trim();
        }
        return 'N/A';
    };

    const isPriorityUrgency = (urgency: string): boolean => {
        return urgency === 'express' || urgency === 'rush';
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
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
                        <TableHead className="min-w-[160px] px-4">Resident</TableHead>
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
                                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <div className="truncate">
                                                {getResidentName(clearance.resident)}
                                            </div>
                                            {clearance.resident?.address && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {clearance.resident.address}
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
                                                <a href={`/clearances/${clearance.id}`} className="flex items-center cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <span>View Details</span>
                                                </a>
                                            </DropdownMenuItem>
                                            
                            {clearance.status === 'pending_payment' && (
                                    <DropdownMenuItem asChild>
                                        <a
                                            href={`/payments/payments/create?` + new URLSearchParams({
                                                clearance_request_id: clearance.id.toString(),
                                                payer_type: 'resident',
                                                payer_id: clearance.resident_id?.toString() || '',
                                                payer_name: getResidentName(clearance.resident),
                                                contact_number: clearance.resident?.contact_number || '',
                                                address: clearance.resident?.address || '',
                                                purok: clearance.resident?.purok || '',
                                                household_number: clearance.resident?.household_number || '',
                                                clearance_type_id: clearance.clearance_type_id?.toString() || '',
                                                clearance_code: clearance.clearance_type?.code || 
                                                    clearance.clearance_type?.name?.toUpperCase().replace(/\s+/g, '_') || 
                                                    'BRGY_CLEARANCE',
                                                purpose: clearance.purpose || '',
                                                fee_amount: clearance.fee_amount?.toString() || '0',
                                                balance: (clearance.balance || clearance.fee_amount || 0).toString()
                                            }).toString()}
                                            className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                                        >
                                            <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                            <span className="text-green-600 font-medium">Record Payment</span>
                                        </a>
                                    </DropdownMenuItem>
                                )}



                                            
                                            {['pending', 'processing', 'approved'].includes(clearance.status) && (
                                                <DropdownMenuItem asChild>
                                                    <a href={`/clearances/${clearance.id}/edit`} className="flex items-center cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit Request</span>
                                                    </a>
                                                </DropdownMenuItem>
                                            )}
                                            
                                            {clearance.status === 'issued' && (
                                                <DropdownMenuItem asChild>
                                                    <a href={`/clearances/${clearance.id}/print`} className="flex items-center cursor-pointer">
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        <span>Print Clearance</span>
                                                    </a>
                                                </DropdownMenuItem>
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
                                                <DropdownMenuItem 
                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    onClick={() => onDelete(clearance)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Cancel Request</span>
                                                </DropdownMenuItem>
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
