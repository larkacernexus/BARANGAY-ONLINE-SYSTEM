// resources/js/components/admin/payment/PayerSelectionStep.tsx

import React, { useEffect, useMemo, useCallback, useState } from 'react';
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
    DollarSign,
    Calendar,
    Phone,
    MapPin,
    Tag,
    Filter,
    CheckCircle
} from 'lucide-react';

// Import ResidentAvatar component
import { ResidentAvatar } from './ResidentAvatar';

// ========== TYPE DEFINITIONS ==========
interface Resident {
    id: string | number;
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    photo_path?: string | null;
    photo_url?: string | null;
    outstanding_fees?: any[];
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
    is_senior?: boolean;
    is_pwd?: boolean;
    [key: string]: any;
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
    [key: string]: any;
}

interface Business {
    id: string | number;
    business_name: string;
    owner_name: string;
    owner_id?: string | number;
    contact_number?: string;
    email?: string;
    address: string;
    purok?: string;
    purok_id?: string | number;
    business_type?: string;
    business_type_label?: string;
    status?: string;
    permit_expiry_date?: string;
    is_permit_valid?: boolean;
    outstanding_fees?: any[];
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
    [key: string]: any;
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
        photo_path?: string | null;
    };
    can_be_paid?: boolean;
    has_payments?: boolean;
    payment_count?: number;
    total_paid?: number;
    balance?: number;
    is_fully_paid?: boolean;
    [key: string]: any;
}

interface Fee {
    id: string | number;
    fee_type_id: string | number;
    fee_code: string;
    payer_type: 'resident' | 'household' | 'business';
    resident_id: string | number | null;
    household_id: string | number | null;
    business_id: string | number | null;
    business_name: string | null;
    payer_name: string;
    contact_number: string | null;
    address: string | null;
    purok: string | null;
    zone: string | null;
    billing_period: string | null;
    period_start: string | null;
    period_end: string | null;
    issue_date: string;
    due_date: string;
    base_amount: number | string;
    surcharge_amount: number | string;
    penalty_amount: number | string;
    discount_amount: number | string;
    discount_type: string | null;
    total_amount: number | string;
    status: 'pending' | 'issued' | 'partially_paid' | 'overdue' | 'paid' | 'cancelled' | 'waived';
    amount_paid: number | string | null;
    balance: number | string;
    payment_id: string | number | null;
    or_number: string | null;
    payment_date: string | null;
    payment_method: string | null;
    transaction_reference: string | null;
    certificate_number: string | null;
    valid_from: string | null;
    valid_until: string | null;
    purpose: string | null;
    property_description: string | null;
    business_type: string | null;
    area: number | string | null;
    issued_by: string | number | null;
    collected_by: string | number | null;
    approved_by: string | number | null;
    computation_details: string | null;
    requirements_submitted: string | null;
    remarks: string | null;
    waiver_reason: string | null;
    created_by: string | number | null;
    updated_by: string | number | null;
    cancelled_by: string | number | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    
    fee_type_name?: string;
    fee_type_category?: string;
    business_details?: any;
    resident_details?: any;
    household_details?: any;
    [key: string]: any;
}

type PayerSource = 'residents' | 'households' | 'businesses' | 'clearance' | 'fees';

interface PayerSelectionStepProps {
    residents: Resident[];
    households: Household[];
    businesses?: Business[];
    clearanceRequests?: ClearanceRequest[];
    fees?: Fee[];
    payerSource: PayerSource;
    setPayerSource: (source: PayerSource) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSelectPayer: (payer: Resident | Household | Business | ClearanceRequest | Fee) => void;
    handleManualPayer: (payer?: any) => void;
    preSelectedPayerId?: string | number;
    preSelectedPayerType?: string;
    isClearancePayment?: boolean;
    clearanceRequest?: ClearanceRequest | null;
    clearanceTypes?: Record<string, string>;
    preFilledData?: any;
    selectedFeeDetails?: any;
}

// ========== HELPER FUNCTIONS ==========
const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = parseAmount(amount);
    return `₱${num.toFixed(2)}`;
};

const parseAmount = (amount: number | string | null | undefined): number => {
    if (amount === null || amount === undefined) return 0;
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[₱,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

export function PayerSelectionStep({
    residents,
    households,
    businesses = [],
    clearanceRequests = [],
    fees = [],
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
    clearanceTypes = {},
    preFilledData,
    selectedFeeDetails
}: PayerSelectionStepProps) {
    
    // ========== FILTER PAYERS WITH OUTSTANDING BALANCES ONLY ==========
    
    // Filter residents with outstanding fees or pending clearances
    const residentsWithPayments = useMemo(() => {
        return residents.filter(resident => {
            const hasOutstandingFees = resident.has_outstanding_fees || 
                                      (resident.outstanding_fees && resident.outstanding_fees.length > 0) ||
                                      (resident.outstanding_fee_count && resident.outstanding_fee_count > 0);
            
            const hasPendingClearances = clearanceRequests.some(cr => 
                cr.resident?.id === resident.id && 
                cr.can_be_paid === true &&
                parseAmount(cr.fee_amount) > 0 &&
                !cr.is_fully_paid
            );
            
            return hasOutstandingFees || hasPendingClearances;
        });
    }, [residents, clearanceRequests]);
    
    // Filter households with outstanding fees
    const householdsWithPayments = useMemo(() => {
        return households.filter(household => {
            return household.has_outstanding_fees || 
                   (household.outstanding_fees && household.outstanding_fees.length > 0) ||
                   (household.outstanding_fee_count && household.outstanding_fee_count > 0);
        });
    }, [households]);
    
    // Filter businesses with outstanding fees
    const businessesWithPayments = useMemo(() => {
        return businesses.filter(business => {
            return business.has_outstanding_fees || 
                   (business.outstanding_fees && business.outstanding_fees.length > 0) ||
                   (business.outstanding_fee_count && business.outstanding_fee_count > 0);
        });
    }, [businesses]);
    
    // Filter clearance requests that are payable and not fully paid
    const payableClearanceRequests = useMemo(() => {
        return clearanceRequests.filter(cr => {
            const feeAmount = parseAmount(cr.fee_amount);
            const isPayable = cr.can_be_paid === true && feeAmount > 0;
            const isNotFullyPaid = !cr.is_fully_paid;
            const hasBalance = (cr.balance && parseAmount(cr.balance) > 0) || feeAmount > 0;
            
            return isPayable && isNotFullyPaid && hasBalance;
        });
    }, [clearanceRequests]);
    
    // Filter fees with outstanding balance
    const outstandingFees = useMemo(() => {
        return fees.filter(fee => {
            const balance = parseAmount(fee.balance);
            const isPayableStatus = ['pending', 'issued', 'partially_paid', 'overdue'].includes(fee.status);
            return balance > 0 && isPayableStatus;
        });
    }, [fees]);
    
    // ========== GET FILTERED LIST BASED ON SOURCE ==========
    const getFilteredList = useCallback(() => {
        switch (payerSource) {
            case 'residents':
                return residentsWithPayments;
            case 'households':
                return householdsWithPayments;
            case 'businesses':
                return businessesWithPayments;
            case 'clearance':
                return payableClearanceRequests;
            case 'fees':
                return outstandingFees;
            default:
                return [];
        }
    }, [payerSource, residentsWithPayments, householdsWithPayments, businessesWithPayments, payableClearanceRequests, outstandingFees]);
    
    // ========== APPLY SEARCH FILTER ==========
    const filteredPayers = useMemo(() => {
        let baseList = getFilteredList();
        
        if (!searchQuery.trim()) {
            return baseList;
        }
        
        const query = searchQuery.toLowerCase();
        
        return baseList.filter((payer: any) => {
            switch (payerSource) {
                case 'residents':
                    return payer.name?.toLowerCase().includes(query) ||
                           payer.household_number?.toLowerCase().includes(query) ||
                           payer.purok?.toLowerCase().includes(query) ||
                           payer.contact_number?.toLowerCase().includes(query);
                
                case 'households':
                    return payer.head_name?.toLowerCase().includes(query) ||
                           payer.household_number?.toLowerCase().includes(query) ||
                           payer.address?.toLowerCase().includes(query) ||
                           payer.contact_number?.toLowerCase().includes(query);
                
                case 'businesses':
                    return payer.business_name?.toLowerCase().includes(query) ||
                           payer.owner_name?.toLowerCase().includes(query) ||
                           payer.business_type?.toLowerCase().includes(query) ||
                           payer.address?.toLowerCase().includes(query) ||
                           payer.contact_number?.toLowerCase().includes(query) ||
                           payer.purok?.toLowerCase().includes(query);
                
                case 'clearance':
                    return payer.reference_number?.toLowerCase().includes(query) ||
                           payer.resident?.name?.toLowerCase().includes(query) ||
                           payer.purpose?.toLowerCase().includes(query) ||
                           payer.clearance_type?.name?.toLowerCase().includes(query) ||
                           payer.clearance_type?.code?.toLowerCase().includes(query);
                
                case 'fees':
                    return payer.payer_name?.toLowerCase().includes(query) ||
                           payer.fee_code?.toLowerCase().includes(query) ||
                           payer.fee_type_name?.toLowerCase().includes(query) ||
                           payer.purpose?.toLowerCase().includes(query) ||
                           payer.contact_number?.toLowerCase().includes(query) ||
                           payer.address?.toLowerCase().includes(query) ||
                           payer.purok?.toLowerCase().includes(query) ||
                           payer.business_name?.toLowerCase().includes(query);
                
                default:
                    return false;
            }
        });
    }, [payerSource, getFilteredList, searchQuery]);
    
    // ========== GET PAYER COUNT WITH PAYMENTS ==========
    const getPayerCount = useCallback((source: string): number => {
        switch (source) {
            case 'residents':
                return residentsWithPayments.length;
            case 'households':
                return householdsWithPayments.length;
            case 'businesses':
                return businessesWithPayments.length;
            case 'clearance':
                return payableClearanceRequests.length;
            case 'fees':
                return outstandingFees.length;
            default:
                return 0;
        }
    }, [residentsWithPayments, householdsWithPayments, businessesWithPayments, payableClearanceRequests, outstandingFees]);
    
    // ========== GET PAYER DISPLAY NAME ==========
    const getPayerDisplayName = useCallback((payer: any): string => {
        if (payerSource === 'residents') {
            return payer.name;
        } else if (payerSource === 'households') {
            return payer.head_name;
        } else if (payerSource === 'businesses') {
            return payer.business_name;
        } else if (payerSource === 'clearance') {
            return `${payer.resident?.name || 'Unknown'} - ${payer.clearance_type?.name || 'Clearance'}`;
        } else if (payerSource === 'fees') {
            return `${payer.payer_name} - ${payer.fee_type_name || payer.fee_code}`;
        }
        return payer.name || payer.head_name || payer.business_name || payer.payer_name || 'Unknown';
    }, [payerSource]);
    
    // ========== GET PAYER DESCRIPTION ==========
    const getPayerDescription = useCallback((payer: any) => {
        if (payerSource === 'residents') {
            const hasFees = payer.has_outstanding_fees || (payer.outstanding_fees && payer.outstanding_fees.length > 0);
            const clearanceRequestsForResident = payableClearanceRequests.filter(cr => 
                cr.resident?.id === payer.id
            );
            
            const totalBalance = hasFees ? parseAmount(payer.total_outstanding_balance) : 0;
            const clearanceTotal = clearanceRequestsForResident.reduce((sum, cr) => sum + parseAmount(cr.fee_amount), 0);
            const totalDue = totalBalance + clearanceTotal;
            
            return (
                <>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payer.purok && `Purok ${payer.purok} • `}
                        House #{payer.household_number || 'N/A'}
                    </div>
                    <div className="text-xs font-medium mt-1 flex items-center gap-2 flex-wrap">
                        {hasFees && (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Fee: {formatCurrency(totalBalance)}
                            </span>
                        )}
                        {clearanceRequestsForResident.length > 0 && (
                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Clearance: {formatCurrency(clearanceTotal)}
                            </span>
                        )}
                        {totalDue > 0 && (
                            <span className="text-gray-600 dark:text-gray-400">
                                Total Due: {formatCurrency(totalDue)}
                            </span>
                        )}
                    </div>
                </>
            );
        } else if (payerSource === 'households') {
            const totalBalance = parseAmount(payer.total_outstanding_balance);
            
            return (
                <>
                    <div className="flex items-center gap-1 mb-1">
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Household #{payer.household_number}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payer.address}
                        {payer.family_members && ` • ${payer.family_members} members`}
                    </div>
                    {totalBalance > 0 && (
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total Due: {formatCurrency(totalBalance)}
                        </div>
                    )}
                </>
            );
        } else if (payerSource === 'businesses') {
            const totalBalance = parseAmount(payer.total_outstanding_balance);
            
            return (
                <>
                    <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{payer.business_type_label || payer.business_type || 'Business'}</span>
                        {payer.permit_expiry_date && !payer.is_permit_valid && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Expiring Permit
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Owner: {payer.owner_name}
                        {payer.purok && ` • Purok ${payer.purok}`}
                    </div>
                    {totalBalance > 0 && (
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total Due: {formatCurrency(totalBalance)}
                        </div>
                    )}
                </>
            );
        } else if (payerSource === 'clearance') {
            const feeAmount = parseAmount(payer.fee_amount);
            const amountPaid = parseAmount(payer.total_paid);
            const balance = parseAmount(payer.balance) || feeAmount - amountPaid;
            
            return (
                <>
                    <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-200">Ref: {payer.reference_number}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {payer.clearance_type?.name || payer.purpose}
                            {payer.specific_purpose && ` • ${payer.specific_purpose}`}
                        </div>
                        <div className="text-xs font-medium mt-1 flex items-center gap-2">
                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Fee: {formatCurrency(feeAmount)}
                            </span>
                            {balance > 0 && balance < feeAmount && (
                                <span className="text-amber-600 dark:text-amber-400">
                                    Balance: {formatCurrency(balance)}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            );
        } else if (payerSource === 'fees') {
            const balance = parseAmount(payer.balance);
            const totalAmount = parseAmount(payer.total_amount);
            const isOverdue = new Date(payer.due_date) < new Date() && 
                              !['paid', 'cancelled', 'waived'].includes(payer.status);
            
            return (
                <>
                    <div className="text-xs mb-1">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-400" />
                            <span className="font-mono text-gray-600 dark:text-gray-400">{payer.fee_code}</span>
                            {payer.billing_period && (
                                <span className="text-gray-500 dark:text-gray-500">{payer.billing_period}</span>
                            )}
                        </div>
                        {payer.purpose && (
                            <div className="text-gray-500 dark:text-gray-400 mt-0.5">{payer.purpose}</div>
                        )}
                    </div>
                    
                    <div className="text-xs font-medium flex items-center gap-2">
                        <span className="text-amber-600 dark:text-amber-400">
                            Balance: {formatCurrency(balance)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">
                            Total: {formatCurrency(totalAmount)}
                        </span>
                        {isOverdue && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                        )}
                    </div>
                </>
            );
        }
        
        return null;
    }, [payerSource, payableClearanceRequests]);
    
    // ========== GET PAYER SOURCE ICON ==========
    const getPayerSourceIcon = useCallback((source: string) => {
        const icons = {
            'residents': User,
            'households': Home,
            'businesses': Building,
            'clearance': FileText,
            'fees': Receipt,
        };
        const IconComponent = icons[source as keyof typeof icons] || UserCircle;
        return <IconComponent className="h-5 w-5" />;
    }, []);
    
    // ========== RENDER RESIDENT CARD ==========
    const renderResidentCard = (resident: Resident) => {
        const hasFees = resident.has_outstanding_fees || (resident.outstanding_fees && resident.outstanding_fees.length > 0);
        const clearanceRequestsForResident = payableClearanceRequests.filter(cr => 
            cr.resident?.id === resident.id
        );
        
        const totalBalance = hasFees ? parseAmount(resident.total_outstanding_balance) : 0;
        const clearanceTotal = clearanceRequestsForResident.reduce((sum, cr) => sum + parseAmount(cr.fee_amount), 0);
        const totalDue = totalBalance + clearanceTotal;
        
        return (
            <div
                key={resident.id}
                onClick={() => handleSelectPayer(resident)}
                className="w-full text-left p-4 border rounded-lg hover:border-primary dark:border-gray-700 dark:hover:border-blue-700 hover:bg-primary/5 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-4">
                    <ResidentAvatar 
                        resident={resident} 
                        size="lg"
                        className="flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-medium truncate dark:text-gray-200">
                                {resident.name}
                            </div>
                            {resident.is_senior && (
                                <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    Senior
                                </Badge>
                            )}
                            {resident.is_pwd && (
                                <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                    PWD
                                </Badge>
                            )}
                            {totalDue > 0 && (
                                <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    Due: {formatCurrency(totalDue)}
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {resident.purok && `Purok ${resident.purok} • `}
                            House #{resident.household_number || 'N/A'}
                        </div>
                        <div className="text-xs font-medium mt-1 flex items-center gap-2 flex-wrap">
                            {hasFees && totalBalance > 0 && (
                                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Receipt className="h-3 w-3" />
                                    Fees: {formatCurrency(totalBalance)}
                                </span>
                            )}
                            {clearanceRequestsForResident.length > 0 && clearanceTotal > 0 && (
                                <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Clearance: {formatCurrency(clearanceTotal)}
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
            </div>
        );
    };
    
    // ========== EFFECTS ==========
    useEffect(() => {
        if (preSelectedPayerId && preSelectedPayerType) {
            if (preSelectedPayerType === 'resident') {
                const preSelectedResident = residentsWithPayments.find(r => r.id == preSelectedPayerId);
                if (preSelectedResident) {
                    handleSelectPayer(preSelectedResident);
                }
            } else if (preSelectedPayerType === 'household') {
                const preSelectedHousehold = householdsWithPayments.find(h => h.id == preSelectedPayerId);
                if (preSelectedHousehold) {
                    handleSelectPayer(preSelectedHousehold);
                }
            } else if (preSelectedPayerType === 'business') {
                const preSelectedBusiness = businessesWithPayments.find(b => b.id == preSelectedPayerId);
                if (preSelectedBusiness) {
                    handleSelectPayer(preSelectedBusiness);
                }
            }
        }
    }, [preSelectedPayerId, preSelectedPayerType, residentsWithPayments, householdsWithPayments, businessesWithPayments, handleSelectPayer]);
    
    useEffect(() => {
        if (isClearancePayment && clearanceRequest) {
            setPayerSource('clearance');
        }
    }, [isClearancePayment, clearanceRequest, setPayerSource]);
    
    // ========== COMPUTED VALUES ==========
    const hasPayers = filteredPayers.length > 0;
    const totalOutstandingBalance = outstandingFees.reduce((sum, fee) => sum + parseAmount(fee.balance), 0);
    
    // ========== RENDER ==========
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                <Filter className="h-3 w-3 text-white" />
                            </div>
                            Who Needs to Pay?
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Showing only payers with outstanding balances or pending payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <Label className="mb-3 block dark:text-gray-300">Select Payment Type</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {[
                                    { value: 'residents' as const, icon: User, label: 'Residents', count: getPayerCount('residents'), color: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
                                    { value: 'households' as const, icon: Home, label: 'Households', count: getPayerCount('households'), color: 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
                                    { value: 'businesses' as const, icon: Building, label: 'Businesses', count: getPayerCount('businesses'), color: 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
                                    { value: 'clearance' as const, icon: FileText, label: 'Clearance', count: getPayerCount('clearance'), color: 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
                                    { value: 'fees' as const, icon: Receipt, label: 'Outstanding Fees', count: getPayerCount('fees'), color: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
                                ].map((source) => (
                                    <button
                                        key={source.value}
                                        type="button"
                                        onClick={() => setPayerSource(source.value)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer relative ${
                                            payerSource === source.value
                                                ? `${source.color} bg-opacity-10 border-opacity-100 dark:bg-opacity-20`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <source.icon className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium text-center dark:text-gray-300">{source.label}</span>
                                        {source.count > 0 && (
                                            <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                                                {source.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <Label className="mb-2 block dark:text-gray-300">
                                {payerSource === 'residents' ? 'Search residents with payments...' :
                                 payerSource === 'households' ? 'Search households with payments...' :
                                 payerSource === 'businesses' ? 'Search businesses with payments...' :
                                 payerSource === 'clearance' ? 'Search pending clearance requests...' :
                                 'Search outstanding fees...'}
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder={
                                        payerSource === 'residents' ? 'Search by name, household, or purok...' :
                                        payerSource === 'households' ? 'Search by head name, household number, or address...' :
                                        payerSource === 'businesses' ? 'Search by business name, owner, type, or address...' :
                                        payerSource === 'clearance' ? 'Search by reference number, resident name, or purpose...' :
                                        'Search by payer name, fee code, purpose, or address...'
                                    }
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {!hasPayers ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300 dark:text-green-600" />
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                        No payers with outstanding balances
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        All {payerSource} are up to date with their payments
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                                        <span>Showing {filteredPayers.length} {payerSource} with payments due</span>
                                        <span className="text-amber-600 dark:text-amber-400">
                                            Total Due: {formatCurrency(
                                                payerSource === 'fees' 
                                                    ? filteredPayers.reduce((sum, fee) => sum + parseAmount(fee.balance), 0)
                                                    : payerSource === 'clearance'
                                                    ? filteredPayers.reduce((sum, cr) => sum + parseAmount(cr.fee_amount), 0)
                                                    : 0
                                            )}
                                        </span>
                                    </div>
                                    {filteredPayers.map((payer: any) => {
                                        if (payerSource === 'residents') {
                                            return renderResidentCard(payer);
                                        }
                                        
                                        return (
                                            <div
                                                key={payer.id}
                                                onClick={() => handleSelectPayer(payer)}
                                                className="w-full text-left p-4 border rounded-lg hover:border-primary dark:border-gray-700 dark:hover:border-blue-700 hover:bg-primary/5 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${
                                                        payerSource === 'clearance' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                                        payerSource === 'fees' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        payerSource === 'households' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                        payerSource === 'businesses' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                        {getPayerSourceIcon(payerSource)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate dark:text-gray-200">
                                                            {getPayerDisplayName(payer)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {getPayerDescription(payer)}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Right Sidebar */}
            <div className="space-y-6">
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="dark:text-gray-100">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                            onClick={() => handleManualPayer()}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add One-Time Payer
                        </Button>
                        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            For non-registered or one-time payments
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="dark:text-gray-100">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">With Payments Due</div>
                                <div className="font-semibold text-blue-600 dark:text-blue-400">{getPayerCount('residents')} Residents</div>
                                <div className="font-semibold text-green-600 dark:text-green-400">{getPayerCount('households')} Households</div>
                                <div className="font-semibold text-orange-600 dark:text-orange-400">{getPayerCount('businesses')} Businesses</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">Pending</div>
                                <div className="font-semibold text-purple-600 dark:text-purple-400">{getPayerCount('clearance')} Clearances</div>
                                <div className="font-semibold text-amber-600 dark:text-amber-400">{getPayerCount('fees')} Outstanding Fees</div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <DollarSign className="h-3 w-3 inline mr-1" />
                                Total Outstanding Balance: 
                                <span className="font-semibold text-amber-600 dark:text-amber-400 ml-1">
                                    {formatCurrency(totalOutstandingBalance)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}