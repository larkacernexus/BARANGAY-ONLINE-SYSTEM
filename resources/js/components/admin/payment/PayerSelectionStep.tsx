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
    XCircle,
    Phone,
    MapPin,
    Tag
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

// ADD BUSINESS INTERFACE
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
}

interface PayerSelectionStepProps {
    residents: Resident[];
    households: Household[];
    businesses?: Business[]; // ADDED
    clearanceRequests?: ClearanceRequest[];
    fees?: Fee[];
    payerSource: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees'; // UPDATED
    setPayerSource: (source: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees') => void; // UPDATED
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSelectPayer: (payer: Resident | Household | Business | ClearanceRequest | Fee) => void; // UPDATED
    handleManualPayer: () => void;
    preSelectedPayerId?: string | number;
    preSelectedPayerType?: string;
    isClearancePayment?: boolean;
    clearanceRequest?: ClearanceRequest | null;
    clearanceTypes?: Record<string, string>;
    preFilledData?: any;
    selectedFeeDetails?: any;
}

export function PayerSelectionStep({
    residents,
    households,
    businesses = [], // ADDED with default
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
            'businesses': Building, // ADDED
            'clearance': FileText,
            'fees': Receipt,
        };
        const IconComponent = icons[source as keyof typeof icons] || UserCircle;
        return <IconComponent className="h-5 w-5" />;
    };

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        if (typeof amount === 'number') return amount;
        if (typeof amount === 'string') {
            const cleaned = amount.replace(/[₱,]/g, '').trim();
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const getFeeTypeName = (fee: Fee): string => {
        return fee.fee_type_name || 'Fee';
    };

    const getFeeCategory = (fee: Fee): string => {
        return fee.fee_type_category || 'other';
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
            
            case 'businesses': // ADDED
                baseList = businesses;
                break;
            
            case 'clearance':
                baseList = clearanceRequests.filter(cr => 
                    cr.can_be_paid === true
                );
                break;
            
            case 'fees':
                baseList = fees.filter(fee => {
                    const balance = parseAmount(fee.balance);
                    const isPayableStatus = ['pending', 'issued', 'partially_paid', 'overdue'].includes(fee.status);
                    return balance > 0 && isPayableStatus;
                });
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
                
                case 'businesses': // ADDED
                    return payer.business_name.toLowerCase().includes(query) ||
                           (payer.owner_name?.toLowerCase() || '').includes(query) ||
                           (payer.business_type?.toLowerCase() || '').includes(query) ||
                           payer.address.toLowerCase().includes(query) ||
                           (payer.contact_number?.toLowerCase() || '').includes(query) ||
                           (payer.purok?.toLowerCase() || '').includes(query);
                
                case 'clearance':
                    return (payer.reference_number.toLowerCase().includes(query)) ||
                           (payer.resident?.name?.toLowerCase().includes(query)) ||
                           (payer.purpose.toLowerCase().includes(query)) ||
                           (payer.clearance_type?.name?.toLowerCase().includes(query)) ||
                           (payer.clearance_type?.code?.toLowerCase().includes(query));
                
                case 'fees':
                    return payer.payer_name.toLowerCase().includes(query) ||
                           payer.fee_code.toLowerCase().includes(query) ||
                           (payer.fee_type_name?.toLowerCase() || '').includes(query) ||
                           (payer.purpose?.toLowerCase() || '').includes(query) ||
                           (payer.contact_number?.toLowerCase() || '').includes(query) ||
                           (payer.address?.toLowerCase() || '').includes(query) ||
                           (payer.purok?.toLowerCase() || '').includes(query) ||
                           (payer.business_name?.toLowerCase() || '').includes(query) ||
                           (payer.property_description?.toLowerCase() || '').includes(query);
                
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
            
            case 'businesses': // ADDED
                return businesses.length;
            
            case 'clearance':
                return clearanceRequests.filter(cr => 
                    cr.can_be_paid === true
                ).length;
            
            case 'fees':
                return fees.filter(fee => {
                    const balance = parseAmount(fee.balance);
                    const isPayableStatus = ['pending', 'issued', 'partially_paid', 'overdue'].includes(fee.status);
                    return balance > 0 && isPayableStatus;
                }).length;
            
            default:
                return 0;
        }
    };

    const getPayerDisplayName = (payer: any) => {
        if (payerSource === 'residents') {
            return payer.name;
        } else if (payerSource === 'households') {
            return payer.head_name;
        } else if (payerSource === 'businesses') { // ADDED
            return payer.business_name;
        } else if (payerSource === 'clearance') {
            const clearanceTypeName = payer.clearance_type?.code ? 
                getClearanceTypeNameSafe(payer.clearance_type.code) : 
                payer.clearance_type?.name || 'Clearance';
            return `${payer.resident?.name || 'Unknown'} - ${clearanceTypeName}`;
        } else if (payerSource === 'fees') {
            const feeTypeName = getFeeTypeName(payer);
            return `${payer.payer_name} - ${feeTypeName}`;
        }
        return payer.name || payer.head_name || payer.business_name || payer.payer_name || 'Unknown';
    };

    const getPayerDescription = (payer: any) => {
        if (payerSource === 'residents') {
            const hasFees = payer.has_outstanding_fees || (payer.outstanding_fees && payer.outstanding_fees.length > 0);
            const clearanceRequestsForResident = clearanceRequests.filter(cr => 
                cr.resident?.id === payer.id && cr.can_be_paid === true
            );
            
            return (
                <>
                    <div className="text-xs dark:text-gray-400">
                        {payer.purok && `Purok ${payer.purok} • `}
                        House #{payer.household_number || 'N/A'}
                    </div>
                    <div className="text-xs font-medium mt-1 flex items-center gap-1 flex-wrap">
                        {hasFees && (
                            <>
                                <CreditCard className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                <span className="text-amber-600 dark:text-amber-400">
                                    {payer.outstanding_fee_count || 0} outstanding fee{payer.outstanding_fee_count !== 1 ? 's' : ''}
                                    {payer.total_outstanding_balance && ` • ${payer.total_outstanding_balance}`}
                                </span>
                            </>
                        )}
                        {clearanceRequestsForResident.length > 0 && (
                            <>
                                {hasFees && <span className="mx-1 text-gray-400 dark:text-gray-600">|</span>}
                                <FileText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                <span className="text-purple-600 dark:text-purple-400">{clearanceRequestsForResident.length} clearance request{clearanceRequestsForResident.length !== 1 ? 's' : ''}</span>
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
                        <Hash className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <span className="font-medium dark:text-gray-300">Household #{payer.household_number}</span>
                    </div>
                    <div className="text-xs dark:text-gray-400">
                        {payer.address}
                        {payer.family_members && ` • ${payer.family_members} members`}
                    </div>
                    {hasFees && (
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            <span>
                                {payer.outstanding_fee_count || 0} outstanding fee{payer.outstanding_fee_count !== 1 ? 's' : ''}
                                {payer.total_outstanding_balance && ` • ${payer.total_outstanding_balance}`}
                            </span>
                        </div>
                    )}
                </>
            );
        } else if (payerSource === 'businesses') { // ADDED
            const hasFees = payer.has_outstanding_fees || (payer.outstanding_fees && payer.outstanding_fees.length > 0);
            const permitStatus = payer.is_permit_valid ? 'Valid Permit' : 
                                (payer.permit_expiry_date ? 'Permit Expiring' : 'No Permit');
            
            return (
                <>
                    <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs dark:text-gray-400">{payer.business_type_label || payer.business_type || 'Business'}</span>
                        {payer.permit_expiry_date && (
                            <Badge variant="outline" className={`text-xs ${
                                payer.is_permit_valid 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                            }`}>
                                {permitStatus}
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs dark:text-gray-400">
                        Owner: {payer.owner_name}
                        {payer.purok && ` • Purok ${payer.purok}`}
                    </div>
                    {hasFees && (
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            <span>
                                {payer.outstanding_fee_count || 0} outstanding fee{payer.outstanding_fee_count !== 1 ? 's' : ''}
                                {payer.total_outstanding_balance && ` • ${payer.total_outstanding_balance}`}
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
                        <span className="font-medium dark:text-gray-200">Reference: {payer.reference_number}</span>
                        <div className="text-xs dark:text-gray-400">
                            {clearanceTypeName || payer.purpose}
                            {payer.specific_purpose && ` • ${payer.specific_purpose}`}
                        </div>
                        <div className="text-xs text-primary dark:text-blue-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{payer.status_display || payer.status.replace('_', ' ')}</span>
                            <span className="mx-1 text-gray-400 dark:text-gray-600">•</span>
                            <span>Fee: ₱{feeAmount.toFixed(2)}</span>
                        </div>
                        
                        {payer.has_payments && (
                            <div className={`mt-1 text-xs ${
                                payer.is_fully_paid ? 'text-green-600 dark:text-green-400' : 
                                payer.total_paid && payer.total_paid > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'
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
            const baseAmount = parseAmount(payer.base_amount);
            const surchargeAmount = parseAmount(payer.surcharge_amount);
            const penaltyAmount = parseAmount(payer.penalty_amount);
            const discountAmount = parseAmount(payer.discount_amount);
            const totalAmount = parseAmount(payer.total_amount);
            const amountPaid = parseAmount(payer.amount_paid);
            const balance = parseAmount(payer.balance);
            
            const feeTypeName = getFeeTypeName(payer);
            const feeCategory = getFeeCategory(payer);
            
            const isOverdue = new Date(payer.due_date) < new Date() && 
                              !['paid', 'cancelled', 'waived'].includes(payer.status);
            
            const isBusinessFee = payer.payer_type === 'business' || payer.business_name;
            const isHouseholdFee = payer.payer_type === 'household' || payer.household_id;
            
            return (
                <>
                    <div className="text-xs mb-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="font-mono dark:text-gray-300">{payer.fee_code}</span>
                            </div>
                            <Badge variant="outline" className="text-xs px-2 py-0 dark:border-gray-600 dark:text-gray-300">
                                {payer.payer_type === 'resident' ? 'Resident' : 
                                 payer.payer_type === 'household' ? 'Household' : 
                                 payer.payer_type === 'business' ? 'Business' : 'Other'}
                            </Badge>
                        </div>
                        
                        <div className="mt-1 space-y-0.5">
                            {payer.billing_period && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">{payer.billing_period}</span>
                                </div>
                            )}
                            
                            {payer.purok && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">Purok {payer.purok}</span>
                                </div>
                            )}
                            
                            {payer.purpose && (
                                <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">{payer.purpose}</span>
                                </div>
                            )}
                            
                            {isBusinessFee && payer.business_name && (
                                <div className="flex items-center gap-1">
                                    <Building className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">{payer.business_name}</span>
                                    {payer.business_type && ` • ${payer.business_type}`}
                                </div>
                            )}
                            
                            {payer.contact_number && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="dark:text-gray-400">{payer.contact_number}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="text-xs font-medium space-y-1 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                            <span className={`font-bold ${balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                                ₱{balance.toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Base:</span>
                                <span className="dark:text-gray-300">₱{baseAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Surcharge:</span>
                                <span className={surchargeAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'dark:text-gray-300'}>
                                    ₱{surchargeAmount.toFixed(2)}
                                </span>
                            </div>
                            {penaltyAmount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Penalty:</span>
                                    <span className="text-red-600 dark:text-red-400">₱{penaltyAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                                    <span className="text-green-600 dark:text-green-400">₱{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Total:</span>
                            <span className="text-gray-900 dark:text-gray-100 font-bold">₱{totalAmount.toFixed(2)}</span>
                        </div>
                        
                        {amountPaid > 0 && (
                            <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                                <span>Paid:</span>
                                <span className="font-bold">₱{amountPaid.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className={`text-xs ${
                            payer.status === 'pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                            payer.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                            payer.status === 'partially_paid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                            payer.status === 'issued' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                        }`}>
                            {payer.status.replace('_', ' ')}
                        </Badge>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                                Due: {new Date(payer.due_date).toLocaleDateString()}
                                {payer.issue_date && (
                                    <span className="ml-1">
                                        (Issued: {new Date(payer.issue_date).toLocaleDateString()})
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    
                    {isOverdue && (
                        <div className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>OVERDUE</span>
                        </div>
                    )}
                    
                    {payer.amount_paid && parseAmount(payer.amount_paid) > 0 && (
                        <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Partial payment: ₱{parseAmount(payer.amount_paid).toFixed(2)}</span>
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
                const preSelectedResident = residents.find(r => r.id == preSelectedPayerId);
                if (preSelectedResident) {
                    handleSelectPayer(preSelectedResident);
                }
            } else if (preSelectedPayerType === 'household') {
                const preSelectedHousehold = households.find(h => h.id == preSelectedPayerId);
                if (preSelectedHousehold) {
                    handleSelectPayer(preSelectedHousehold);
                }
            } else if (preSelectedPayerType === 'business') { // ADDED
                const preSelectedBusiness = businesses.find(b => b.id == preSelectedPayerId);
                if (preSelectedBusiness) {
                    handleSelectPayer(preSelectedBusiness);
                }
            }
        }
    }, [preSelectedPayerId, preSelectedPayerType, residents, households, businesses, handleSelectPayer]);

    useEffect(() => {
        if (isClearancePayment && clearanceRequest) {
            setPayerSource('clearance');
        }
    }, [isClearancePayment, clearanceRequest, setPayerSource]);

    const payers = filteredPayers();
    const hasPayers = payers.length > 0;

    const totalOutstandingBalance = fees
        .filter(fee => {
            const balance = parseAmount(fee.balance);
            const isPayableStatus = ['pending', 'issued', 'partially_paid', 'overdue'].includes(fee.status);
            return balance > 0 && isPayableStatus;
        })
        .reduce((sum, fee) => sum + parseAmount(fee.balance), 0);

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                <Users className="h-3 w-3 text-white" />
                            </div>
                            Who is Paying?
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Select from residents, households, businesses, clearance requests, or outstanding fees
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <Label className="mb-3 block dark:text-gray-300">Select Payment Type</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2"> {/* UPDATED to 5 columns */}
                                {[
                                    { value: 'residents', icon: User, label: 'Residents', count: getPayerCount('residents'), color: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
                                    { value: 'households', icon: Home, label: 'Households', count: getPayerCount('households'), color: 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
                                    { value: 'businesses', icon: Building, label: 'Businesses', count: getPayerCount('businesses'), color: 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' }, // ADDED
                                    { value: 'clearance', icon: FileText, label: 'Clearance', count: getPayerCount('clearance'), color: 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
                                    { value: 'fees', icon: Receipt, label: 'Outstanding Fees', count: getPayerCount('fees'), color: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
                                ].map((source) => (
                                    <button
                                        key={source.value}
                                        type="button"
                                        onClick={() => setPayerSource(source.value as any)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer relative ${
                                            payerSource === source.value
                                                ? `${source.color} bg-opacity-10 border-opacity-100 dark:bg-opacity-20`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900'
                                        }`}
                                    >
                                        <source.icon className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium text-center dark:text-gray-300">{source.label}</span>
                                        {source.count > 0 && (
                                            <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                {source.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label className="mb-2 block dark:text-gray-300">
                                {payerSource === 'residents' ? 'Search residents...' :
                                 payerSource === 'households' ? 'Search households...' :
                                 payerSource === 'businesses' ? 'Search businesses...' : // ADDED
                                 payerSource === 'clearance' ? 'Search clearance requests...' :
                                 'Search outstanding fees...'}
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder={
                                        payerSource === 'residents' ? 'Search residents by name, household, or purok...' :
                                        payerSource === 'households' ? 'Search households by head name, household number, or address...' :
                                        payerSource === 'businesses' ? 'Search businesses by name, owner, type, or address...' : // ADDED
                                        payerSource === 'clearance' ? 'Search clearance requests by reference number, resident name, or purpose...' :
                                        'Search fees by payer name, fee code, purpose, or address...'
                                    }
                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {!hasPayers ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                        No {payerSource} found
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {payerSource === 'residents' 
                                            ? 'No residents found matching your search'
                                            : payerSource === 'households'
                                            ? 'No households found matching your search'
                                            : payerSource === 'businesses' // ADDED
                                            ? 'No businesses found matching your search'
                                            : payerSource === 'clearance'
                                            ? 'No payable clearance requests found'
                                            : 'No outstanding fees found matching your search'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Showing {payers.length} {payerSource}
                                    </div>
                                    {payers.map((payer: any) => (
                                        <div
                                            key={payer.id}
                                            onClick={() => handleSelectPayer(payer)}
                                            className="w-full text-left p-4 border rounded-lg hover:border-primary dark:border-gray-700 dark:hover:border-blue-700 hover:bg-primary/5 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-full ${
                                                    payerSource === 'clearance' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    payerSource === 'fees' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    payerSource === 'residents' && payer.has_outstanding_fees ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    payerSource === 'businesses' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : // ADDED
                                                    'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                    {getPayerSourceIcon(payerSource)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate dark:text-gray-200">
                                                        {getPayerDisplayName(payer)}
                                                        {payerSource === 'clearance' && payer.status === 'pending_payment' && (
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                                                Payment Due
                                                            </Badge>
                                                        )}
                                                        {payerSource === 'fees' && payer.status === 'overdue' && (
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                        {payerSource === 'fees' && payer.status === 'pending' && (
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                        {payerSource === 'fees' && payer.status === 'partially_paid' && (
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                                                Partial Payment
                                                            </Badge>
                                                        )}
                                                        {payerSource === 'businesses' && payer.permit_expiry_date && !payer.is_permit_valid && (
                                                            <Badge className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                                                Permit Expiring
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {getPayerDescription(payer)}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors" />
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
                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="dark:text-gray-100">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                            onClick={handleManualPayer}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Payer
                        </Button>
                        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            New payers are for one-time payments only
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="dark:text-gray-100">Payment Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-blue-700 dark:text-blue-300">Residents</div>
                                    <p className="text-gray-500 dark:text-gray-400">Select from registered barangay residents</p>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        <span>Auto-detects outstanding fees & clearances</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                                    <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-green-700 dark:text-green-300">Households</div>
                                    <p className="text-gray-500 dark:text-gray-400">Select from registered households</p>
                                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Collect household-level payments
                                    </div>
                                </div>
                            </div>
                            {/* ADDED BUSINESS SECTION */}
                            <div className="flex items-start gap-2">
                                <div className="p-1.5 rounded bg-orange-100 dark:bg-orange-900/30">
                                    <Building className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-orange-700 dark:text-orange-300">Businesses</div>
                                    <p className="text-gray-500 dark:text-gray-400">Select from registered businesses</p>
                                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" />
                                        <span>Business permits and fees</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-purple-700 dark:text-purple-300">Clearance</div>
                                    <p className="text-gray-500 dark:text-gray-400">Process clearance requests</p>
                                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Status: Pending Payment</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-900/30">
                                    <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-amber-700 dark:text-amber-300">Outstanding Fees</div>
                                    <p className="text-gray-500 dark:text-gray-400">Pay outstanding fees and bills</p>
                                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>Includes all pending and overdue fees</span>
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

                <Card className="dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="dark:text-gray-100">Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">Total Residents</div>
                                <div className="font-semibold text-blue-600 dark:text-blue-400">{residents.length}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">Total Households</div>
                                <div className="font-semibold text-green-600 dark:text-green-400">{households.length}</div>
                            </div>
                            {/* ADDED BUSINESS COUNT */}
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">Total Businesses</div>
                                <div className="font-semibold text-orange-600 dark:text-orange-400">{businesses.length}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">Pending Clearance</div>
                                <div className="font-semibold text-purple-600 dark:text-purple-400">{getPayerCount('clearance')}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">Outstanding Fees</div>
                                <div className="font-semibold text-amber-600 dark:text-amber-400">{getPayerCount('fees')}</div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <DollarSign className="h-3 w-3 inline mr-1" />
                                Total Outstanding Balance (Fees): 
                                <span className="font-semibold text-amber-600 dark:text-amber-400 ml-1">
                                    ₱{totalOutstandingBalance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}