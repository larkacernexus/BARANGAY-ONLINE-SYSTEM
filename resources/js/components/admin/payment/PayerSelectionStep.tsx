// resources/js/components/admin/payment/PayerSelectionStep.tsx

import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Search, Plus, Home, Building, UserCircle, AlertCircle, User,
    ChevronRight, Briefcase, Hash, FileText, Receipt, Clock,
    DollarSign, Filter, CheckCircle, Loader2, X,
} from 'lucide-react';
import { ResidentAvatar } from './ResidentAvatar';

// ========== TYPE DEFINITIONS ==========
interface Resident {
    id: string | number;
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: any;
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
    purok?: any;
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
    purok?: any;
    business_type?: string;
    business_type_label?: string;
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
    clearance_type?: { id: string | number; name: string; code: string; };
    resident?: {
        id: string | number;
        name: string;
        contact_number?: string;
        address?: string;
        household_number?: string;
        purok?: any;
        photo_path?: string | null;
    };
    can_be_paid?: boolean;
    balance?: number;
    is_fully_paid?: boolean;
    [key: string]: any;
}

interface Fee {
    id: string | number;
    fee_type_id: string | number;
    fee_code: string;
    payer_type: string;
    payer_name: string;
    contact_number: string | null;
    address: string | null;
    purok: string | null;
    billing_period: string | null;
    issue_date: string;
    due_date: string;
    base_amount: number | string;
    surcharge_amount: number | string;
    penalty_amount: number | string;
    discount_amount: number | string;
    total_amount: number | string;
    status: string;
    amount_paid: number | string | null;
    balance: number | string;
    fee_type_name?: string;
    fee_type_category?: string;
    business_name?: string | null;
    purpose?: string | null;
    [key: string]: any;
}

type PayerSource = 'residents' | 'households' | 'businesses' | 'clearance' | 'fees';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface PayerSelectionStepProps {
    residents: Resident[];
    households: Household[];
    businesses: Business[];
    clearanceRequests: ClearanceRequest[];
    fees: Fee[];
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
    pagination?: Record<string, PaginationMeta>;
    isLoadingMore?: boolean;
    loadMore?: () => void;
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

const getPurokDisplay = (purok: any): string => {
    if (!purok) return '';
    if (typeof purok === 'string') return purok;
    if (typeof purok === 'object' && purok !== null) {
        return purok.name || purok.slug || (purok.id ? String(purok.id) : '');
    }
    return '';
};

const getHouseholdDisplay = (payer: any): string => {
    if (payer.household_number) return String(payer.household_number);
    if (payer.household_id) return String(payer.household_id);
    return 'N/A';
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
    pagination,
    isLoadingMore = false,
    loadMore,
}: PayerSelectionStepProps) {
    
    const isSearchMode = searchQuery.trim().length > 0;
    
    const observerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const getPaginationKey = useCallback((source: PayerSource): string => {
        const keyMap: Record<string, string> = {
            'residents': 'residents',
            'households': 'households',
            'businesses': 'businesses',
            'clearance': 'clearance_requests',
            'fees': 'fees',
        };
        return keyMap[source] || source;
    }, []);
    
    const currentPagination = pagination?.[getPaginationKey(payerSource)];
    
    const handleSourceChange = useCallback((source: PayerSource) => {
        setPayerSource(source);
        setSearchQuery('');
    }, [setPayerSource, setSearchQuery]);
    
    // ========== CLIENT-SIDE FILTERING (search handled by parent via server) ==========
    const clientFilteredResidents = useMemo(() => {
        if (!isSearchMode) {
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
        }
        
        const query = searchQuery.toLowerCase();
        return residents.filter(resident => {
            return resident.name?.toLowerCase().includes(query) ||
                   resident.address?.toLowerCase().includes(query) ||
                   getPurokDisplay(resident.purok).toLowerCase().includes(query) ||
                   getHouseholdDisplay(resident).toLowerCase().includes(query);
        });
    }, [residents, clearanceRequests, isSearchMode, searchQuery]);
    
    const clientFilteredHouseholds = useMemo(() => {
        if (!isSearchMode) {
            return households.filter(household => {
                return household.has_outstanding_fees || 
                       (household.outstanding_fees && household.outstanding_fees.length > 0) ||
                       (household.outstanding_fee_count && household.outstanding_fee_count > 0);
            });
        }
        
        const query = searchQuery.toLowerCase();
        return households.filter(household => {
            return household.head_name?.toLowerCase().includes(query) ||
                   household.address?.toLowerCase().includes(query) ||
                   String(household.household_number).toLowerCase().includes(query) ||
                   getPurokDisplay(household.purok).toLowerCase().includes(query);
        });
    }, [households, isSearchMode, searchQuery]);
    
    const clientFilteredBusinesses = useMemo(() => {
        if (!isSearchMode) {
            return businesses.filter(business => {
                return business.has_outstanding_fees || 
                       (business.outstanding_fees && business.outstanding_fees.length > 0) ||
                       (business.outstanding_fee_count && business.outstanding_fee_count > 0);
            });
        }
        
        const query = searchQuery.toLowerCase();
        return businesses.filter(business => {
            return business.business_name?.toLowerCase().includes(query) ||
                   business.owner_name?.toLowerCase().includes(query) ||
                   business.address?.toLowerCase().includes(query) ||
                   (business.business_type_label || business.business_type || '').toLowerCase().includes(query);
        });
    }, [businesses, isSearchMode, searchQuery]);
    
    const clientFilteredClearanceRequests = useMemo(() => {
        const payable = clearanceRequests.filter(cr => {
            const feeAmount = parseAmount(cr.fee_amount);
            return cr.can_be_paid === true && feeAmount > 0 && !cr.is_fully_paid && 
                   (cr.balance ? parseAmount(cr.balance) > 0 : true);
        });
        
        if (!isSearchMode) return payable;
        
        const query = searchQuery.toLowerCase();
        return payable.filter(cr => {
            return cr.resident?.name?.toLowerCase().includes(query) ||
                   cr.reference_number?.toLowerCase().includes(query) ||
                   cr.purpose?.toLowerCase().includes(query) ||
                   cr.clearance_type?.name?.toLowerCase().includes(query);
        });
    }, [clearanceRequests, isSearchMode, searchQuery]);
    
    const clientFilteredFees = useMemo(() => {
        const outstanding = fees.filter(fee => {
            const balance = parseAmount(fee.balance);
            return balance > 0 && ['pending', 'issued', 'partially_paid', 'overdue'].includes(fee.status);
        });
        
        if (!isSearchMode) return outstanding;
        
        const query = searchQuery.toLowerCase();
        return outstanding.filter(fee => {
            return fee.payer_name?.toLowerCase().includes(query) ||
                   fee.fee_code?.toLowerCase().includes(query) ||
                   (fee.fee_type_name || '').toLowerCase().includes(query) ||
                   (fee.business_name || '').toLowerCase().includes(query);
        });
    }, [fees, isSearchMode, searchQuery]);
    
    const getFilteredList = useCallback(() => {
        switch (payerSource) {
            case 'residents': return clientFilteredResidents;
            case 'households': return clientFilteredHouseholds;
            case 'businesses': return clientFilteredBusinesses;
            case 'clearance': return clientFilteredClearanceRequests;
            case 'fees': return clientFilteredFees;
            default: return [];
        }
    }, [payerSource, clientFilteredResidents, clientFilteredHouseholds, clientFilteredBusinesses, clientFilteredClearanceRequests, clientFilteredFees]);
    
    const filteredPayers = getFilteredList();
    
    // ========== GET PAYER COUNT ==========
    const getPayerCount = useCallback((source: string): number => {
        const keyMap: Record<string, string> = {
            'residents': 'residents',
            'households': 'households',
            'businesses': 'businesses',
            'clearance': 'clearance_requests',
            'fees': 'fees',
        };
        return pagination?.[keyMap[source] || source]?.total || 0;
    }, [pagination]);
    
    // ========== GET PAYER DISPLAY NAME ==========
    const getPayerDisplayName = useCallback((payer: any): string => {
        if (payerSource === 'residents') return payer.name || 'Unknown';
        if (payerSource === 'households') return payer.head_name || `Household #${payer.household_number}`;
        if (payerSource === 'businesses') return payer.business_name || 'Unknown';
        if (payerSource === 'clearance') return `${payer.resident?.name || 'Unknown'} - ${payer.clearance_type?.name || 'Clearance'}`;
        if (payerSource === 'fees') return `${payer.payer_name} - ${payer.fee_type_name || payer.fee_code}`;
        return 'Unknown';
    }, [payerSource]);
    
    // ========== GET PAYER DESCRIPTION ==========
    const getPayerDescription = useCallback((payer: any): React.ReactNode => {
        if (payerSource === 'residents') {
            const hasFees = payer.has_outstanding_fees || (payer.outstanding_fees && payer.outstanding_fees.length > 0);
            const clearanceRequestsForResident = clientFilteredClearanceRequests.filter(
                cr => cr.resident?.id === payer.id
            );
            const totalBalance = hasFees ? parseAmount(payer.total_outstanding_balance) : 0;
            const clearanceTotal = clearanceRequestsForResident.reduce(
                (sum, cr) => sum + parseAmount(cr.fee_amount), 0
            );
            const totalDue = totalBalance + clearanceTotal;
            
            const purokStr = getPurokDisplay(payer.purok);
            const householdStr = getHouseholdDisplay(payer);
            
            return (
                <>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {purokStr ? `${purokStr} • ` : ''}
                        House #{householdStr}
                    </div>
                    <div className="text-xs font-medium mt-1 flex items-center gap-2 flex-wrap">
                        {hasFees && totalBalance > 0 && (
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
                    </div>
                </>
            );
        } else if (payerSource === 'households') {
            const totalBalance = parseAmount(payer.total_outstanding_balance);
            return (
                <>
                    <div className="flex items-center gap-1 mb-1">
                        <Hash className="h-3 w-3 text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            Household #{payer.household_number}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payer.address}
                        {payer.family_members && ` • ${payer.family_members} members`}
                    </div>
                    {totalBalance > 0 && (
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">
                            <DollarSign className="h-3 w-3 inline" /> Total Due: {formatCurrency(totalBalance)}
                        </div>
                    )}
                </>
            );
        } else if (payerSource === 'businesses') {
            const totalBalance = parseAmount(payer.total_outstanding_balance);
            const purokStr = getPurokDisplay(payer.purok);
            
            return (
                <>
                    <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {payer.business_type_label || payer.business_type || 'Business'}
                        </span>
                        {payer.permit_expiry_date && !payer.is_permit_valid && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Expiring Permit
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Owner: {payer.owner_name}
                        {purokStr && ` • ${purokStr}`}
                    </div>
                    {totalBalance > 0 && (
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">
                            <DollarSign className="h-3 w-3 inline" /> Total Due: {formatCurrency(totalBalance)}
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
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                        Ref: {payer.reference_number}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payer.clearance_type?.name || payer.purpose}
                        {payer.specific_purpose && ` • ${payer.specific_purpose}`}
                    </div>
                    <div className="text-xs font-medium mt-1 flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400">
                            <Clock className="h-3 w-3 inline" /> Fee: {formatCurrency(feeAmount)}
                        </span>
                        {balance > 0 && balance < feeAmount && (
                            <span className="text-amber-600 dark:text-amber-400">
                                Balance: {formatCurrency(balance)}
                            </span>
                        )}
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
                        <span className="font-mono text-gray-600 dark:text-gray-400">
                            {payer.fee_code}
                        </span>
                        {payer.billing_period && (
                            <span className="text-gray-500 dark:text-gray-500 ml-2">
                                {payer.billing_period}
                            </span>
                        )}
                    </div>
                    <div className="text-xs font-medium flex items-center gap-2">
                        <span className="text-amber-600 dark:text-amber-400">
                            Balance: {formatCurrency(balance)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">
                            Total: {formatCurrency(totalAmount)}
                        </span>
                        {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                    </div>
                </>
            );
        }
        return null;
    }, [payerSource, clientFilteredClearanceRequests]);
    
    // ========== GET PAYER SOURCE ICON ==========
    const getPayerSourceIcon = useCallback((source: string) => {
        const icons: Record<string, React.ComponentType<any>> = {
            'residents': User,
            'households': Home,
            'businesses': Building,
            'clearance': FileText,
            'fees': Receipt,
        };
        const IconComponent = icons[source] || UserCircle;
        return <IconComponent className="h-5 w-5" />;
    }, []);
    
    // ========== RENDER RESIDENT CARD ==========
    const renderResidentCard = useCallback((resident: Resident) => {
        const hasFees = resident.has_outstanding_fees || 
                        (resident.outstanding_fees && resident.outstanding_fees.length > 0);
        const clearanceRequestsForResident = clientFilteredClearanceRequests.filter(
            cr => cr.resident?.id === resident.id
        );
        const totalBalance = hasFees ? parseAmount(resident.total_outstanding_balance) : 0;
        const clearanceTotal = clearanceRequestsForResident.reduce(
            (sum, cr) => sum + parseAmount(cr.fee_amount), 0
        );
        const totalDue = totalBalance + clearanceTotal;
        
        const purokStr = getPurokDisplay(resident.purok);
        const householdStr = getHouseholdDisplay(resident);
        
        return (
            <div
                key={resident.id}
                onClick={() => handleSelectPayer(resident)}
                className="w-full text-left p-4 border rounded-lg hover:border-primary dark:border-gray-700 dark:hover:border-blue-700 hover:bg-primary/5 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-4">
                    <ResidentAvatar resident={resident} size="lg" className="flex-shrink-0" />
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
                            {purokStr ? `${purokStr} • ` : ''}House #{householdStr}
                        </div>
                        <div className="text-xs font-medium mt-1 flex items-center gap-2 flex-wrap">
                            {hasFees && totalBalance > 0 && (
                                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Receipt className="h-3 w-3" />Fees: {formatCurrency(totalBalance)}
                                </span>
                            )}
                            {clearanceTotal > 0 && (
                                <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                    <FileText className="h-3 w-3" />Clearance: {formatCurrency(clearanceTotal)}
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
            </div>
        );
    }, [handleSelectPayer, clientFilteredClearanceRequests]);
    
    // ========== LOAD MORE HANDLER ==========
    const handleLoadMore = useCallback(() => {
        if (loadMore && !isLoadingMore) {
            loadMore();
        }
    }, [loadMore, isLoadingMore]);
    
    // ========== INFINITE SCROLL OBSERVER ==========
    useEffect(() => {
        if (!currentPagination?.has_more || isLoadingMore) return;
        if (isSearchMode) return; // Don't infinite scroll during search mode
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && currentPagination?.has_more && !isLoadingMore) {
                    handleLoadMore();
                }
            },
            { root: scrollContainerRef.current, threshold: 0.1, rootMargin: '100px' }
        );
        
        const currentObserver = observerRef.current;
        if (currentObserver) {
            observer.observe(currentObserver);
        }
        
        return () => observer.disconnect();
    }, [currentPagination?.has_more, isLoadingMore, isSearchMode, handleLoadMore]);
    
    // ========== PRE-SELECTED PAYER EFFECT ==========
    useEffect(() => {
        if (!preSelectedPayerId || !preSelectedPayerType) return;
        
        if (preSelectedPayerType === 'resident') {
            const found = residents.find(r => r.id == preSelectedPayerId);
            if (found) handleSelectPayer(found);
        } else if (preSelectedPayerType === 'household') {
            const found = households.find(h => h.id == preSelectedPayerId);
            if (found) handleSelectPayer(found);
        } else if (preSelectedPayerType === 'business') {
            const found = businesses.find(b => b.id == preSelectedPayerId);
            if (found) handleSelectPayer(found);
        }
    }, []); // Run once on mount
    
    // ========== CLEARANCE MODE EFFECT ==========
    useEffect(() => {
        if (isClearancePayment && clearanceRequest) {
            setPayerSource('clearance');
        }
    }, []); // Run once on mount
    
    // ========== COMPUTED VALUES ==========
    const hasPayers = filteredPayers.length > 0;
    const displayedTotal = currentPagination?.total ?? filteredPayers.length;
    const totalOutstandingBalance = useMemo(() => {
        return fees
            .filter(fee => parseAmount(fee.balance) > 0 && ['pending', 'issued', 'partially_paid', 'overdue'].includes(fee.status))
            .reduce((sum, fee) => sum + parseAmount(fee.balance), 0);
    }, [fees]);
    
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
                            {isSearchMode ? (
                                <span>
                                    Searching "{searchQuery}" in {payerSource}
                                </span>
                            ) : (
                                <span>
                                    Showing payers with outstanding balances
                                    {currentPagination && (
                                        <span className="ml-2 text-xs">
                                            ({filteredPayers.length} of {currentPagination.total})
                                        </span>
                                    )}
                                </span>
                            )}
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
                                        onClick={() => handleSourceChange(source.value)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer relative ${
                                            payerSource === source.value
                                                ? `${source.color} bg-opacity-10 border-opacity-100 dark:bg-opacity-20`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <source.icon className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium text-center dark:text-gray-300">
                                            {source.label}
                                        </span>
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
                                Search {payerSource}...
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    placeholder={`Search ${payerSource}...`}
                                    className="pl-10 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div ref={scrollContainerRef} className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {!hasPayers && !isLoadingMore ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300 dark:text-green-600" />
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                        {isSearchMode ? 'No search results found' : 'No payers with outstanding balances'}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {isSearchMode 
                                            ? `No ${payerSource} matching "${searchQuery}"` 
                                            : `All ${payerSource} are up to date`
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex justify-between">
                                        <span>
                                            {isSearchMode 
                                                ? `${filteredPayers.length} results` 
                                                : `${filteredPayers.length} ${payerSource}`}
                                        </span>
                                    </div>
                                    {filteredPayers.map((payer: any, index: number) => {
                                        if (payerSource === 'residents') {
                                            return renderResidentCard(payer);
                                        }
                                        
                                        return (
                                            <div
                                                key={payer.id || index}
                                                onClick={() => handleSelectPayer(payer)}
                                                className="w-full text-left p-4 border rounded-lg hover:border-primary dark:border-gray-700 dark:hover:border-blue-700 hover:bg-primary/5 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${
                                                        payerSource === 'clearance' 
                                                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                                                            : payerSource === 'fees' 
                                                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                                                                : payerSource === 'households' 
                                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                                                    : payerSource === 'businesses' 
                                                                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                                                                        : 'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-400'
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
                                    
                                    <div ref={observerRef} className="py-4 text-center">
                                        {isLoadingMore && (
                                            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Loading...</span>
                                            </div>
                                        )}
                                        {currentPagination?.has_more && !isLoadingMore && !isSearchMode && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={handleLoadMore} 
                                                className="dark:border-gray-600 dark:text-gray-300"
                                            >
                                                Load More ({filteredPayers.length} of {currentPagination.total})
                                            </Button>
                                        )}
                                        {!currentPagination?.has_more && filteredPayers.length > 0 && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                All {displayedTotal} {payerSource} loaded
                                            </p>
                                        )}
                                    </div>
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
                            onClick={() => handleManualPayer()}
                        >
                            <Plus className="h-4 w-4 mr-2" />Add One-Time Payer
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
                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                    {getPayerCount('residents')} Residents
                                </div>
                                <div className="font-semibold text-green-600 dark:text-green-400">
                                    {getPayerCount('households')} Households
                                </div>
                                <div className="font-semibold text-orange-600 dark:text-orange-400">
                                    {getPayerCount('businesses')} Businesses
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500 dark:text-gray-400">Pending</div>
                                <div className="font-semibold text-purple-600 dark:text-purple-400">
                                    {getPayerCount('clearance')} Clearances
                                </div>
                                <div className="font-semibold text-amber-600 dark:text-amber-400">
                                    {getPayerCount('fees')} Outstanding Fees
                                </div>
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