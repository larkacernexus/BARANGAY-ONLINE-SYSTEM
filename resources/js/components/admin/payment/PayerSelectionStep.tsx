import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    FileCheck
} from 'lucide-react';
import React from 'react';

interface Resident {
    id: string | number;
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    outstanding_fees?: any[];
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
}

interface FeeType {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    base_amount: number | string;
    category: string;
    frequency: string;
    has_surcharge: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
    validity_days?: number;
    applicable_to?: string[];
}

interface PayerSelectionStepProps {
    residents: Resident[];
    households: Household[];
    clearanceRequests?: ClearanceRequest[];
    feeTypes?: FeeType[];
    payerType: string;
    setPayerType: (type: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSelectPayer: (payer: Resident | Household | ClearanceRequest | FeeType) => void;
    handleManualPayer: () => void;
    preSelectedPayerId?: string | number;
    preSelectedPayerType?: string;
    isClearancePayment?: boolean;
    clearanceRequest?: ClearanceRequest | null;
}

// Helper function
const getPayerTypeIcon = (type: string) => {
    const icons = {
        'resident': User,
        'household': Users,
        'business': Briefcase,
        'clearance': FileText,
        'pending_fee': Receipt,
        'fee_type': FileCheck,
        'other': UserCircle
    };
    const IconComponent = icons[type as keyof typeof icons] || UserCircle;
    return <IconComponent className="h-5 w-5" />;
};

export function PayerSelectionStep({
    residents,
    households,
    clearanceRequests = [],
    feeTypes = [],
    payerType,
    setPayerType,
    searchQuery,
    setSearchQuery,
    handleSelectPayer,
    handleManualPayer,
    preSelectedPayerId,
    preSelectedPayerType,
    isClearancePayment = false,
    clearanceRequest = null
}: PayerSelectionStepProps) {
    
    // Filter payers based on search and type
    const filteredPayers = () => {
        if (!searchQuery.trim()) {
            switch (payerType) {
                case 'resident':
                    return residents;
                case 'household':
                    return households;
                case 'clearance':
                    return clearanceRequests.filter(cr => 
                        cr.status === 'pending_payment' || 
                        cr.status === 'pending' || 
                        cr.status === 'processing'
                    );
                case 'pending_fee':
                    const residentsWithFees = residents.filter(r => 
                        r.outstanding_fees && r.outstanding_fees.length > 0
                    );
                    const householdsWithFees = households.filter(h => 
                        h.outstanding_fees && h.outstanding_fees.length > 0
                    );
                    return [...residentsWithFees, ...householdsWithFees];
                case 'fee_type':
                    return feeTypes;
                default:
                    return residents;
            }
        }
        
        const query = searchQuery.toLowerCase();
        
        switch (payerType) {
            case 'resident':
                return residents.filter((resident: Resident) => 
                    resident.name.toLowerCase().includes(query) ||
                    (resident.household_number?.toLowerCase() || '').includes(query) ||
                    (resident.purok?.toLowerCase() || '').includes(query) ||
                    (resident.contact_number?.toLowerCase() || '').includes(query)
                );
            
            case 'household':
                return households.filter((household: Household) => 
                    household.head_name.toLowerCase().includes(query) ||
                    household.household_number.toLowerCase().includes(query) ||
                    household.address.toLowerCase().includes(query) ||
                    (household.contact_number?.toLowerCase() || '').includes(query)
                );
            
            case 'clearance':
                return clearanceRequests.filter((cr: ClearanceRequest) => 
                    (cr.reference_number.toLowerCase().includes(query)) ||
                    (cr.resident?.name?.toLowerCase().includes(query)) ||
                    (cr.purpose.toLowerCase().includes(query)) ||
                    (cr.clearance_type?.name.toLowerCase().includes(query))
                );
            
            case 'pending_fee':
                const filteredResidentsWithFees = residents.filter((resident: Resident) => 
                    resident.outstanding_fees && resident.outstanding_fees.length > 0 &&
                    (
                        resident.name.toLowerCase().includes(query) ||
                        (resident.household_number?.toLowerCase() || '').includes(query) ||
                        (resident.purok?.toLowerCase() || '').includes(query) ||
                        resident.outstanding_fees.some((fee: any) => 
                            fee.fee_code?.toLowerCase().includes(query) ||
                            fee.fee_type_name?.toLowerCase().includes(query)
                        )
                    )
                );
                
                const filteredHouseholdsWithFees = households.filter((household: Household) => 
                    household.outstanding_fees && household.outstanding_fees.length > 0 &&
                    (
                        household.head_name.toLowerCase().includes(query) ||
                        household.household_number.toLowerCase().includes(query) ||
                        household.address.toLowerCase().includes(query) ||
                        household.outstanding_fees.some((fee: any) => 
                            fee.fee_code?.toLowerCase().includes(query) ||
                            fee.fee_type_name?.toLowerCase().includes(query)
                        )
                    )
                );
                
                return [...filteredResidentsWithFees, ...filteredHouseholdsWithFees];
            
            case 'fee_type':
                return feeTypes.filter((feeType: FeeType) => 
                    feeType.name.toLowerCase().includes(query) ||
                    feeType.code.toLowerCase().includes(query) ||
                    feeType.description?.toLowerCase().includes(query) ||
                    feeType.category.toLowerCase().includes(query)
                );
            
            default:
                return residents;
        }
    };

    // Get payer count by type
    const getPayerCount = (type: string) => {
        switch (type) {
            case 'resident':
                return residents.length;
            case 'household':
                return households.length;
            case 'clearance':
                return clearanceRequests.filter(cr => 
                    cr.status === 'pending_payment' || 
                    cr.status === 'pending' || 
                    cr.status === 'processing'
                ).length;
            case 'pending_fee':
                const residentsWithFees = residents.filter(r => 
                    r.outstanding_fees && r.outstanding_fees.length > 0
                ).length;
                const householdsWithFees = households.filter(h => 
                    h.outstanding_fees && h.outstanding_fees.length > 0
                ).length;
                return residentsWithFees + householdsWithFees;
            case 'fee_type':
                return feeTypes.length;
            default:
                return 0;
        }
    };

    // Get payer display name
    const getPayerDisplayName = (payer: any) => {
        if (payerType === 'resident') {
            return payer.name;
        } else if (payerType === 'household') {
            return payer.head_name;
        } else if (payerType === 'clearance') {
            return `${payer.resident?.name || 'Unknown'} - ${payer.clearance_type?.name || 'Clearance'}`;
        } else if (payerType === 'pending_fee') {
            return payer.name || payer.head_name;
        } else if (payerType === 'fee_type') {
            return payer.name;
        }
        return payer.name || payer.head_name || 'Unknown';
    };

    // Get payer description/subtitle
    const getPayerDescription = (payer: any) => {
        if (payerType === 'resident') {
            return (
                <>
                    {payer.purok && `Purok ${payer.purok} • `}
                    House #{payer.household_number || 'N/A'}
                </>
            );
        } else if (payerType === 'household') {
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
                </>
            );
        } else if (payerType === 'clearance') {
            const feeAmount = typeof payer.fee_amount === 'string' 
                ? parseFloat(payer.fee_amount) 
                : payer.fee_amount || 0;
                
            return (
                <>
                    <div className="text-sm">
                        <span className="font-medium">Reference: {payer.reference_number}</span>
                        <div className="text-xs">
                            {payer.purpose}
                            {payer.specific_purpose && ` • ${payer.specific_purpose}`}
                        </div>
                        <div className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{payer.status.replace('_', ' ')}</span>
                            <span className="mx-1">•</span>
                            <span>Fee: ₱{feeAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </>
            );
        } else if (payerType === 'pending_fee') {
            const feeCount = payer.outstanding_fees?.length || 0;
            const totalBalance = payer.outstanding_fees?.reduce((sum: number, fee: any) => {
                if (fee.balance) {
                    const balanceStr = typeof fee.balance === 'string' ? fee.balance : fee.balance.toString();
                    return sum + parseFloat(balanceStr.replace(/[^0-9.-]+/g, ''));
                }
                return sum;
            }, 0) || 0;
            
            return (
                <>
                    <div className="text-xs">
                        {payer.name ? (
                            <>
                                {payer.purok && `Purok ${payer.purok} • `}
                                House #{payer.household_number || 'N/A'}
                            </>
                        ) : (
                            <>
                                House #{payer.household_number}
                                {payer.family_members && ` • ${payer.family_members} members`}
                            </>
                        )}
                    </div>
                    <div className="text-xs font-medium text-primary mt-1 flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        <span>{feeCount} outstanding fee{feeCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>Total: ₱{totalBalance.toFixed(2)}</span>
                    </div>
                </>
            );
        } else if (payerType === 'fee_type') {
            return (
                <>
                    <div className="text-xs">
                        Code: {payer.code} • Category: {payer.category}
                    </div>
                    <div className="text-xs font-medium text-primary mt-1">
                        Base Fee: ₱{typeof payer.base_amount === 'string' 
                            ? parseFloat(payer.base_amount).toFixed(2) 
                            : payer.base_amount?.toFixed(2) || '0.00'}
                    </div>
                </>
            );
        }
        
        return '';
    };

    // Handle pre-selected payer
    React.useEffect(() => {
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
    }, [preSelectedPayerId, preSelectedPayerType, residents, households]);

    // Auto-select clearance request if provided
    React.useEffect(() => {
        if (isClearancePayment && clearanceRequest) {
            setPayerType('clearance');
        }
    }, [isClearancePayment, clearanceRequest, setPayerType]);

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payer Selection */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Who is Paying?
                        </CardTitle>
                        <CardDescription>
                            Select from registered residents, households, clearance requests, or fee types
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Payer Type Selection */}
                        <div className="mb-6">
                            <Label className="mb-3 block">Select Payer Type</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                {[
                                    { value: 'resident', icon: User, label: 'Resident', count: getPayerCount('resident') },
                                    { value: 'household', icon: Home, label: 'Household', count: getPayerCount('household') },
                                    { value: 'clearance', icon: FileText, label: 'Clearance', count: getPayerCount('clearance'), badge: 'New' },
                                    { value: 'pending_fee', icon: Receipt, label: 'Pending Fees', count: getPayerCount('pending_fee'), badge: 'Due' },
                                    { value: 'fee_type', icon: FileCheck, label: 'Fee Types', count: getPayerCount('fee_type') },
                                    { value: 'other', icon: UserCircle, label: 'Other', count: 0 },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setPayerType(type.value)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer relative ${
                                            payerType === type.value
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <type.icon className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium text-center">{type.label}</span>
                                        {type.count > 0 && (
                                            <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                {type.count}
                                            </span>
                                        )}
                                        {type.badge && (
                                            <span className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full ${
                                                type.badge === 'New' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {type.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Search for Payer</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={
                                        payerType === 'resident' ? 'Search residents by name, house number, or purok...' :
                                        payerType === 'household' ? 'Search households by head name, address, or house number...' :
                                        payerType === 'clearance' ? 'Search clearance requests by reference, resident name, or purpose...' :
                                        payerType === 'pending_fee' ? 'Search residents/households with outstanding fees...' :
                                        payerType === 'fee_type' ? 'Search fee types by name, code, or category...' :
                                        'Search...'
                                    }
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Payer List */}
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {filteredPayers().length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    {payerType === 'clearance' ? (
                                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    ) : payerType === 'pending_fee' ? (
                                        <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    ) : payerType === 'fee_type' ? (
                                        <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    ) : (
                                        <UserCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    )}
                                    <h4 className="font-medium text-gray-700">
                                        {payerType === 'clearance' ? 'No clearance requests found' :
                                         payerType === 'pending_fee' ? 'No pending fees found' :
                                         payerType === 'fee_type' ? 'No fee types found' :
                                         `No ${payerType}s found`}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {searchQuery ? 'Try a different search term' : 
                                         payerType === 'clearance' ? 'All clearance requests have been processed' :
                                         payerType === 'pending_fee' ? 'No outstanding fees to collect' :
                                         payerType === 'fee_type' ? 'No fee types available' :
                                         'No records available'}
                                    </p>
                                </div>
                            ) : (
                                filteredPayers().map((payer: any) => (
                                    <div
                                        key={payer.id}
                                        onClick={() => handleSelectPayer(payer)}
                                        className="w-full text-left p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${
                                                payerType === 'clearance' ? 'bg-purple-100 text-purple-600' :
                                                payerType === 'pending_fee' ? 'bg-amber-100 text-amber-600' :
                                                payerType === 'fee_type' ? 'bg-blue-100 text-blue-600' :
                                                'bg-primary/10 text-primary'
                                            }`}>
                                                {getPayerTypeIcon(payerType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {getPayerDisplayName(payer)}
                                                    {payerType === 'clearance' && payer.status === 'pending_payment' && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                                            Payment Due
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {getPayerDescription(payer)}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Quick Actions & Info */}
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
                                <User className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Resident Payment</div>
                                    <p className="text-gray-500">Individual resident payments</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Home className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Household Payment</div>
                                    <p className="text-gray-500">Payments for entire households</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-purple-500 mt-0.5" />
                                <div>
                                    <div className="font-medium text-purple-700">Clearance Payment</div>
                                    <p className="text-gray-500">Process approved clearance requests</p>
                                    <div className="text-xs text-purple-600 mt-1">
                                        Status: Pending Payment
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Receipt className="h-4 w-4 text-amber-500 mt-0.5" />
                                <div>
                                    <div className="font-medium text-amber-700">Outstanding Fees</div>
                                    <p className="text-gray-500">Collect overdue or pending fees</p>
                                    <div className="text-xs text-amber-600 mt-1">
                                        Balance &gt; 0
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileCheck className="h-4 w-4 text-blue-500 mt-0.5" />
                                <div>
                                    <div className="font-medium text-blue-700">Fee Type Payment</div>
                                    <p className="text-gray-500">Create new fee payments</p>
                                    <div className="text-xs text-blue-600 mt-1">
                                        Base fee collection
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info for pre-filled clearance request */}
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
                                    <p className="text-purple-900 dark:text-purple-200">{clearanceRequest.clearance_type?.name || 'Clearance'}</p>
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

                {/* Statistics Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-gray-500">Residents</div>
                                <div className="font-semibold">{getPayerCount('resident')}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500">Households</div>
                                <div className="font-semibold">{getPayerCount('household')}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500">Pending Clearance</div>
                                <div className="font-semibold text-purple-600">{getPayerCount('clearance')}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-500">Outstanding Fees</div>
                                <div className="font-semibold text-amber-600">{getPayerCount('pending_fee')}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}