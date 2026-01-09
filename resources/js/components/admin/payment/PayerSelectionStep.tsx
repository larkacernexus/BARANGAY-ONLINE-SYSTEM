// resources/js/components/admin/payment/PayerSelectionStep.tsx
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Search,
    Plus,
    Home,
    Building,
    UserCircle,
    AlertCircle,
    User,
    Users,
    ChevronRight,
    Briefcase,
    Hash,
    FileText,
    Receipt,
    Clock,
    FileCheck,
    FileBadge,
    CreditCard,
    AlertTriangle,
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface Resident {
    id: string | number;
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    outstanding_fees?: any[];
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
}

interface Household {
    id: string | number;
    head_name: string;
    contact_number?: string;
    address: string;
    household_number: string;
    purok?: string;
    family_members?: number;
    outstanding_fees?: any[];
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
}

interface ClearanceRequest {
    id: string | number;
    resident_id: string | number;
    clearance_type_id: string | number;
    reference_number: string;
    purpose: string;
    specific_purpose?: string;
    fee_amount: number | string;
    status: string;
    status_display?: string;
    clearance_type?: {
        id: string | number;
        name: string;
        code: string;
    };
    resident?: {
        id: string | number;
        name: string;
        contact_number?: string;
        address?: string;
        household_number?: string;
        purok?: string;
    };
    can_be_paid?: boolean;
    has_payments?: boolean;
    payment_count?: number;
    total_paid?: number;
    balance?: number;
    is_fully_paid?: boolean;
}

interface Fee {
    id: string | number;
    fee_code: string;
    fee_type_id: string | number;
    fee_type_name: string;
    fee_type_category: string;
    payer_type: 'resident' | 'household';
    payer_id: string | number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    purok?: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: 'pending' | 'issued' | 'partially_paid' | 'overdue' | 'paid' | 'cancelled';
    issue_date: string;
    due_date: string;
    purpose?: string;
    remarks?: string;
    billing_period?: string;
    period_start?: string;
    period_end?: string;
}

interface PayerSelectionStepProps {
    residents: Resident[];
    households: Household[];
    clearanceRequests?: ClearanceRequest[];
    fees?: Fee[]; // CHANGED: from feeTypes to fees
    payerSource: 'residents' | 'households' | 'clearance' | 'fees';
    setPayerSource: (source: 'residents' | 'households' | 'clearance' | 'fees') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSelectPayer: (payer: Resident | Household | ClearanceRequest | Fee) => void; // CHANGED: Fee instead of FeeType
    handleManualPayer: () => void;
    preSelectedPayerId?: string | number;
    preSelectedPayerType?: string;
    isClearancePayment?: boolean;
    clearanceRequest?: ClearanceRequest | null;
    clearanceTypes?: Record<string, string>;
}

export function PayerSelectionStep({
    residents,
    households,
    clearanceRequests = [],
    fees = [], // CHANGED: from feeTypes to fees
    payerSource,
    setPayerSource,
    searchQuery,
    setSearchQuery,
    handleSelectPayer,
    handleManualPayer,
    preSelectedPayerId,
    preSelectedPayerType,
    isClearancePayment = false,
    clearanceRequest = null,
    clearanceTypes = {}
}: PayerSelectionStepProps) {
    
    const getClearanceTypeNameSafe = (code: string): string => {
        if (!code) return 'Clearance';
        
        if (clearanceTypes[code] && typeof clearanceTypes[code] === 'string') {
            return clearanceTypes[code];
        }
        
        return code;
    };

    const getPayerSourceIcon = (source: string) => {
        const icons = {
            'residents': User,
            'households': Home,
            'clearance': FileText,
            'fees': Receipt, // CHANGED: from FileCheck to Receipt
        };
        const IconComponent = icons[source as keyof typeof icons] || UserCircle;
        return <IconComponent className="h-5 w-5" />;
    };

    const filteredPayers = () => {
        let baseList: any[] = [];
        
        switch (payerSource) {
            case 'residents':
                baseList = residents;
                break;
            
            case 'households':
                baseList = households;
                break;
            
            case 'clearance':
                baseList = clearanceRequests.filter(cr => 
                    cr.can_be_paid === true
                );
                break;
            
            case 'fees':
                // Filter only fees with balance > 0 and status = 'pending'
                baseList = fees.filter(fee => 
                    fee.balance > 0 && fee.status === 'pending' // CHANGED: Filter for pending fees with balance
                );
                break;
            
            default:
                baseList = [];
        }
        
        if (!searchQuery.trim()) {
            return baseList;
        }
        
        const query = searchQuery.toLowerCase();
        
        return baseList.filter((payer: any) => {
            switch (payerSource) {
                case 'residents':
                    return payer.name.toLowerCase().includes(query) ||
                           (payer.household_number?.toLowerCase() || '').includes(query) ||
                           (payer.purok?.toLowerCase() || '').includes(query) ||
                           (payer.contact_number?.toLowerCase() || '').includes(query);
                
                case 'households':
                    return payer.head_name.toLowerCase().includes(query) ||
                           payer.household_number.toLowerCase().includes(query) ||
                           payer.address.toLowerCase().includes(query) ||
                           (payer.contact_number?.toLowerCase() || '').includes(query);
                
                case 'clearance':
                    return (payer.reference_number.toLowerCase().includes(query)) ||
                           (payer.resident?.name?.toLowerCase().includes(query)) ||
                           (payer.purpose.toLowerCase().includes(query)) ||
                           (payer.clearance_type?.name?.toLowerCase().includes(query)) ||
                           (payer.clearance_type?.code?.toLowerCase().includes(query));
                
                case 'fees':
                    // Search in fee properties
                    return payer.payer_name.toLowerCase().includes(query) ||
                           payer.fee_code.toLowerCase().includes(query) ||
                           payer.fee_type_name.toLowerCase().includes(query) ||
                           (payer.purpose?.toLowerCase() || '').includes(query) ||
                           (payer.contact_number?.toLowerCase() || '').includes(query);
                
                default:
                    return false;
            }
        });
    };

    const getPayerCount = (source: string) => {
        switch (source) {
            case 'residents':
                return residents.length;
            
            case 'households':
                return households.length;
            
            case 'clearance':
                return clearanceRequests.filter(cr => 
                    cr.can_be_paid === true
                ).length;
            
            case 'fees':
                // Count only pending fees with balance
                return fees.filter(fee => fee.balance > 0 && fee.status === 'pending').length;
            
            default:
                return 0;
        }
    };

    const getPayerDisplayName = (payer: any) => {
        if (payerSource === 'residents') {
            return payer.name;
        } else if (payerSource === 'households') {
            return payer.head_name;
        } else if (payerSource === 'clearance') {
            const clearanceTypeName = payer.clearance_type?.code ? 
                getClearanceTypeNameSafe(payer.clearance_type.code) : 
                payer.clearance_type?.name || 'Clearance';
            return `${payer.resident?.name || 'Unknown'} - ${clearanceTypeName}`;
        } else if (payerSource === 'fees') {
            return `${payer.payer_name} - ${payer.fee_type_name}`;
        }
        return payer.name || payer.head_name || payer.payer_name || 'Unknown';
    };

    const getPayerDescription = (payer: any) => {
        if (payerSource === 'residents') {
            const hasFees = payer.has_outstanding_fees || (payer.outstanding_fees && payer.outstanding_fees.length > 0);
            const clearanceRequestsForResident = clearanceRequests.filter(cr => 
                cr.resident?.id === payer.id && cr.can_be_paid === true
            );
            
            return (
                <>
                    <div className="text-xs">
                        {payer.purok && `Purok ${payer.purok} • `}
                        House #{payer.household_number || 'N/A'}
                    </div>
                    <div className="text-xs font-medium mt-1 flex items-center gap-1 flex-wrap">
                        {hasFees && (
                            <>
                                <CreditCard className="h-3 w-3 text-amber-600" />
                                <span className="text-amber-600">
                                    {payer.outstanding_fee_count || 0} outstanding fee{payer.outstanding_fee_count !== 1 ? 's' : ''}
                                    {payer.total_outstanding_balance && ` • ₱${payer.total_outstanding_balance}`}
                                </span>
                            </>
                        )}
                        {clearanceRequestsForResident.length > 0 && (
                            <>
                                {hasFees && <span className="mx-1">|</span>}
                                <FileText className="h-3 w-3 text-purple-600" />
                                <span className="text-purple-600">{clearanceRequestsForResident.length} clearance request{clearanceRequestsForResident.length !== 1 ? 's' : ''}</span>
                            </>
                        )}
                    </div>
                </>
            );
        } else if (payerSource === 'households') {
            const hasFees = payer.has_outstanding_fees || (payer.outstanding_fees && payer.outstanding_fees.length > 0);
            
            return (
                <>
                    <div className="flex items-center gap-1 mb-1">
                        <Hash className="h-3 w-3" />
                        <span className="font-medium">Household #{payer.household_number}</span>
                    </div>
                    <div className="text-xs">
                        {payer.address}
                        {payer.family_members && ` • ${payer.family_members} members`}
                    </div>
                    {hasFees && (
                        <div className="text-xs font-medium text-amber-600 mt-1 flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            <span>
                                {payer.outstanding_fee_count || 0} outstanding fee{payer.outstanding_fee_count !== 1 ? 's' : ''}
                                {payer.total_outstanding_balance && ` • ₱${payer.total_outstanding_balance}`}
                            </span>
                        </div>
                    )}
                </>
            );
        } else if (payerSource === 'clearance') {
            const feeAmount = typeof payer.fee_amount === 'string' 
                ? parseFloat(payer.fee_amount) 
                : payer.fee_amount || 0;
            
            const clearanceTypeName = payer.clearance_type?.code ? 
                getClearanceTypeNameSafe(payer.clearance_type.code) : 
                payer.clearance_type?.name || 'Clearance';
            
            return (
                <>
                    <div className="text-sm">
                        <span className="font-medium">Reference: {payer.reference_number}</span>
                        <div className="text-xs">
                            {clearanceTypeName || payer.purpose}
                            {payer.specific_purpose && ` • ${payer.specific_purpose}`}
                        </div>
                        <div className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{payer.status_display || payer.status.replace('_', ' ')}</span>
                            <span className="mx-1">•</span>
                            <span>Fee: ₱{feeAmount.toFixed(2)}</span>
                        </div>
                        
                        {payer.has_payments && (
                            <div className={`mt-1 text-xs ${
                                payer.is_fully_paid ? 'text-green-600' : 
                                payer.total_paid && payer.total_paid > 0 ? 'text-amber-600' : 'text-gray-600'
                            }`}>
                                <AlertCircle className="h-3 w-3 inline mr-1" />
                                {payer.payment_count} payment{payer.payment_count !== 1 ? 's' : ''}
                                {payer.total_paid && payer.total_paid > 0 && ` • Paid: ₱${payer.total_paid.toFixed(2)}`}
                                {payer.balance && payer.balance > 0 && ` • Balance: ₱${payer.balance.toFixed(2)}`}
                                {payer.is_fully_paid ? ' (Fully Paid)' : payer.total_paid && payer.total_paid > 0 ? ' (Partial)' : ''}
                            </div>
                        )}
                    </div>
                </>
            );
        } else if (payerSource === 'fees') {
            // Display fee details
            const isOverdue = new Date(payer.due_date) < new Date() && payer.status !== 'paid';
            const balance = payer.balance || 0;
            const amountPaid = payer.amount_paid || 0;
            const totalAmount = payer.total_amount || 0;
            
            return (
                <>
                    <div className="text-xs mb-1">
                        <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span className="font-mono">{payer.fee_code}</span>
                        </div>
                        <div className="mt-1">
                            {payer.payer_type === 'resident' ? 'Resident' : 'Household'} • 
                            {payer.purpose && ` • ${payer.purpose}`}
                            {payer.billing_period && ` • ${payer.billing_period}`}
                        </div>
                    </div>
                    <div className="text-xs font-medium space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Balance:</span>
                            <span className={`font-bold ${balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                ₱{balance.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="text-gray-900">₱{totalAmount.toFixed(2)}</span>
                        </div>
                        {amountPaid > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Paid:</span>
                                <span className="text-green-600">₱{amountPaid.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className={`text-xs ${
                            payer.status === 'pending' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            payer.status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200' :
                            payer.status === 'partially_paid' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                            {payer.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(payer.due_date).toLocaleDateString()}
                        </div>
                    </div>
                    {isOverdue && (
                        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>OVERDUE</span>
                        </div>
                    )}
                </>
            );
        }
        
        return '';
    };

    useEffect(() => {
        if (preSelectedPayerId && preSelectedPayerType) {
            if (preSelectedPayerType === 'resident') {
                const preSelectedResident = residents.find(r => r.id === preSelectedPayerId);
                if (preSelectedResident) {
                    handleSelectPayer(preSelectedResident);
                }
            } else if (preSelectedPayerType === 'household') {
                const preSelectedHousehold = households.find(h => h.id === preSelectedPayerId);
                if (preSelectedHousehold) {
                    handleSelectPayer(preSelectedHousehold);
                }
            }
        }
    }, [preSelectedPayerId, preSelectedPayerType, residents, households, handleSelectPayer]);

    useEffect(() => {
        if (isClearancePayment && clearanceRequest) {
            setPayerSource('clearance');
        }
    }, [isClearancePayment, clearanceRequest, setPayerSource]);

    const payers = filteredPayers();
    const hasPayers = payers.length > 0;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Who is Paying?
                        </CardTitle>
                        <CardDescription>
                            Select from residents, households, clearance requests, or outstanding fees
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <Label className="mb-3 block">Select Payment Type</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { value: 'residents', icon: User, label: 'Residents', count: getPayerCount('residents'), color: 'text-blue-600 border-blue-200' },
                                    { value: 'households', icon: Home, label: 'Households', count: getPayerCount('households'), color: 'text-green-600 border-green-200' },
                                    { value: 'clearance', icon: FileText, label: 'Clearance', count: getPayerCount('clearance'), color: 'text-purple-600 border-purple-200' },
                                    { value: 'fees', icon: Receipt, label: 'Fees Due', count: getPayerCount('fees'), color: 'text-amber-600 border-amber-200' }, // CHANGED: label and icon
                                ].map((source) => (
                                    <button
                                        key={source.value}
                                        type="button"
                                        onClick={() => setPayerSource(source.value as any)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer relative ${
                                            payerSource === source.value
                                                ? `${source.color} bg-opacity-10 border-opacity-100`
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <source.icon className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium text-center">{source.label}</span>
                                        {source.count > 0 && (
                                            <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                {source.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label className="mb-2 block">
                                {payerSource === 'residents' ? 'Search residents...' :
                                 payerSource === 'households' ? 'Search households...' :
                                 payerSource === 'clearance' ? 'Search clearance requests...' :
                                 'Search outstanding fees...'} {/* CHANGED */}
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={
                                        payerSource === 'residents' ? 'Search residents by name, household, or purok...' :
                                        payerSource === 'households' ? 'Search households by head name, household number, or address...' :
                                        payerSource === 'clearance' ? 'Search clearance requests by reference number, resident name, or purpose...' :
                                        'Search fees by payer name, fee code, or purpose...' // CHANGED
                                    }
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {!hasPayers ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <h4 className="font-medium text-gray-700">
                                        No {payerSource} found
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {payerSource === 'residents' 
                                            ? 'No residents found matching your search'
                                            : payerSource === 'households'
                                            ? 'No households found matching your search'
                                            : payerSource === 'clearance'
                                            ? 'No payable clearance requests found'
                                            : 'No outstanding fees found matching your search'} {/* CHANGED */}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-xs text-gray-500 mb-2">
                                        Showing {payers.length} {payerSource}
                                    </div>
                                    {payers.map((payer: any) => (
                                        <div
                                            key={payer.id}
                                            onClick={() => handleSelectPayer(payer)}
                                            className="w-full text-left p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-full ${
                                                    payerSource === 'clearance' ? 'bg-purple-100 text-purple-600' :
                                                    payerSource === 'fees' ? 'bg-amber-100 text-amber-600' : // CHANGED: color for fees
                                                    payerSource === 'residents' && payer.has_outstanding_fees ? 'bg-blue-100 text-blue-600' :
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                    {getPayerSourceIcon(payerSource)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">
                                                        {getPayerDisplayName(payer)}
                                                        {payerSource === 'clearance' && payer.status === 'pending_payment' && (
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                                                Payment Due
                                                            </Badge>
                                                        )}
                                                        {payerSource === 'fees' && payer.status === 'overdue' && ( // ADDED: overdue badge for fees
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                        {payerSource === 'fees' && payer.status === 'pending' && ( // ADDED: pending badge for fees
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {getPayerDescription(payer)}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleManualPayer}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Payer
                        </Button>
                        <div className="text-xs text-gray-500 pt-2">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            New payers are for one-time payments only
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div>
                                    <div className="font-medium text-blue-700">Residents</div>
                                    <p className="text-gray-500">Select from registered barangay residents</p>
                                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        <span>Auto-detects outstanding fees & clearances</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Home className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                    <div className="font-medium text-green-700">Households</div>
                                    <p className="text-gray-500">Select from registered households</p>
                                    <div className="text-xs text-green-600 mt-1">
                                        Collect household-level payments
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-purple-600 mt-0.5" />
                                <div>
                                    <div className="font-medium text-purple-700">Clearance</div>
                                    <p className="text-gray-500">Process clearance requests</p>
                                    <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Status: Pending Payment</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Receipt className="h-4 w-4 text-amber-600 mt-0.5" /> {/* CHANGED icon */}
                                <div>
                                    <div className="font-medium text-amber-700">Fees Due</div> {/* CHANGED label */}
                                    <p className="text-gray-500">Pay outstanding fees and bills</p> {/* CHANGED description */}
                                    <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>Pending fees with remaining balance</span> {/* CHANGED */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isClearancePayment && clearanceRequest && (
                    <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-purple-800 dark:text-purple-300 text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Pre-filled Clearance Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-sm space-y-2">
                                <div>
                                    <span className="font-medium text-purple-700 dark:text-purple-300">Reference:</span>
                                    <p className="text-purple-900 dark:text-purple-200">{clearanceRequest.reference_number}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-700 dark:text-purple-300">Type:</span>
                                    <p className="text-purple-900 dark:text-purple-200">
                                        {clearanceRequest.clearance_type?.code ? 
                                            getClearanceTypeNameSafe(clearanceRequest.clearance_type.code) :
                                            clearanceRequest.clearance_type?.name || 'Clearance'}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-purple-700 dark:text-purple-300">Fee:</span>
                                    <p className="text-purple-900 dark:text-purple-200">
                                        ₱{typeof clearanceRequest.fee_amount === 'string' 
                                            ? parseFloat(clearanceRequest.fee_amount).toFixed(2)
                                            : (clearanceRequest.fee_amount || 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 italic pt-2 border-t border-purple-200 dark:border-purple-800">
                                    This clearance request has been pre-selected for payment.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-gray-500">Total Residents</div>
                                <div className="font-semibold text-blue-600">{residents.length}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500">Total Households</div>
                                <div className="font-semibold text-green-600">{households.length}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500">Pending Clearance</div>
                                <div className="font-semibold text-purple-600">{getPayerCount('clearance')}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500">Fees Due</div> {/* CHANGED label */}
                                <div className="font-semibold text-amber-600">{getPayerCount('fees')}</div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                                <DollarSign className="h-3 w-3 inline mr-1" />
                                Total Outstanding Balance: 
                                <span className="font-semibold text-amber-600 ml-1">
                                    ₱{fees
                                        .filter(fee => fee.balance > 0 && fee.status === 'pending')
                                        .reduce((sum, fee) => sum + (fee.balance || 0), 0)
                                        .toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}