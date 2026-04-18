// components/admin/clearances/create/applicant-tab.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, User, Home, Building, Eye, Info } from 'lucide-react';
import { JSX } from 'react';
import type { Resident, Household, Business } from '@/types/admin/clearances/clearance';

interface ApplicantTabProps {
    payerType: 'resident' | 'household' | 'business';
    searchTerm: string;
    selectedPayerDisplay: { name: string; details: string; extra: string | null } | null;
    filteredResidents: Resident[];
    filteredHouseholds: Household[];
    filteredBusinesses: Business[];
    errors: Record<string, string>;
    isLocked?: boolean;
    isSubmitting: boolean;
    onPayerTypeChange: (type: 'resident' | 'household' | 'business') => void;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;
    onSelectResident: (resident: Resident) => void;
    onSelectHousehold: (household: Household) => void;
    onSelectBusiness: (business: Business) => void;
    onChangePayer: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    getPayerIcon: (type: string) => JSX.Element;
    formData: any;
}

export function ApplicantTab({
    payerType,
    searchTerm,
    selectedPayerDisplay,
    filteredResidents,
    filteredHouseholds,
    filteredBusinesses,
    errors,
    isLocked = false,
    isSubmitting,
    onPayerTypeChange,
    onSearchChange,
    onClearSearch,
    onSelectResident,
    onSelectHousehold,
    onSelectBusiness,
    onChangePayer,
    onInputChange,
    getPayerIcon,
    formData
}: ApplicantTabProps) {
    const hasSelection = !!selectedPayerDisplay;

    return (
        <div className="space-y-4">
            {/* Payer Type Selection */}
            <div className="space-y-2">
                <Label className="dark:text-gray-300">Payer Type <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={payerType === 'resident' ? 'default' : 'outline'}
                        onClick={() => onPayerTypeChange('resident')}
                        disabled={isLocked || isSubmitting}
                        className={`flex-1 ${
                            payerType === 'resident' 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700' 
                                : 'dark:border-gray-600 dark:text-gray-300'
                        }`}
                    >
                        <User className="h-4 w-4 mr-2" />
                        Resident
                    </Button>
                    <Button
                        type="button"
                        variant={payerType === 'household' ? 'default' : 'outline'}
                        onClick={() => onPayerTypeChange('household')}
                        disabled={isLocked || isSubmitting}
                        className={`flex-1 ${
                            payerType === 'household' 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700' 
                                : 'dark:border-gray-600 dark:text-gray-300'
                        }`}
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Household
                    </Button>
                    <Button
                        type="button"
                        variant={payerType === 'business' ? 'default' : 'outline'}
                        onClick={() => onPayerTypeChange('business')}
                        disabled={isLocked || isSubmitting}
                        className={`flex-1 ${
                            payerType === 'business' 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700' 
                                : 'dark:border-gray-600 dark:text-gray-300'
                        }`}
                    >
                        <Building className="h-4 w-4 mr-2" />
                        Business
                    </Button>
                </div>
            </div>

            {/* Search Section - Only show when no selection */}
            {!hasSelection && (
                <div className="space-y-2">
                    <Label htmlFor="payer-search" className="dark:text-gray-300">
                        Search {payerType === 'resident' ? 'Resident' : payerType === 'household' ? 'Household' : 'Business'} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            id="payer-search"
                            placeholder={`Search ${payerType} by name, address, or contact...`}
                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            disabled={isLocked || isSubmitting}
                        />
                        {searchTerm && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-7 w-7 p-0 dark:text-gray-400 dark:hover:text-white"
                                onClick={onClearSearch}
                                disabled={isLocked || isSubmitting}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Search Results - Residents */}
            {!hasSelection && payerType === 'resident' && filteredResidents.length > 0 && (
                <div className="border rounded-lg dark:border-gray-700 p-2 space-y-2 max-h-60 overflow-y-auto">
                    {filteredResidents.map(resident => (
                        <div
                            key={resident.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer border dark:border-gray-700 transition-colors"
                            onClick={() => onSelectResident(resident)}
                        >
                            <div className="font-medium dark:text-gray-200">{resident.full_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {resident.address || 'No address'} • {resident.contact_number || 'No contact'}
                                {resident.purok && ` • Purok ${resident.purok}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Results - Households */}
            {!hasSelection && payerType === 'household' && filteredHouseholds.length > 0 && (
                <div className="border rounded-lg dark:border-gray-700 p-2 space-y-2 max-h-60 overflow-y-auto">
                    {filteredHouseholds.map(household => (
                        <div
                            key={household.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer border dark:border-gray-700 transition-colors"
                            onClick={() => onSelectHousehold(household)}
                        >
                            <div className="font-medium dark:text-gray-200">{household.head_of_family}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {household.address || 'No address'} • Household #{household.household_number}
                                {household.purok && ` • Purok ${household.purok}`}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                Total Members: {household.total_members}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Results - Businesses */}
            {!hasSelection && payerType === 'business' && filteredBusinesses.length > 0 && (
                <div className="border rounded-lg dark:border-gray-700 p-2 space-y-2 max-h-60 overflow-y-auto">
                    {filteredBusinesses.map(business => (
                        <div
                            key={business.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer border dark:border-gray-700 transition-colors"
                            onClick={() => onSelectBusiness(business)}
                        >
                            <div className="font-medium dark:text-gray-200">{business.business_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Owner: {business.owner_name} • {business.contact_number}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {business.address} • Purok {business.purok}
                            </div>
                            {business.business_permit_number && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                    Permit: {business.business_permit_number}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* No Results Message */}
         {!hasSelection && searchTerm && (
                (payerType === 'resident' && filteredResidents.length === 0) ||
                (payerType === 'household' && filteredHouseholds.length === 0) ||
                (payerType === 'business' && filteredBusinesses.length === 0)
            ) && (
                <div className="text-center py-8 border rounded-lg dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No results found for "{searchTerm}"</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Try a different search term or check if the {payerType} exists in the system
                    </p>
                </div>
            )}

            {/* Selected Payer Display */}
            {hasSelection && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                            {getPayerIcon(payerType)}
                        </div>
                        <div>
                            <div className="font-medium text-lg dark:text-gray-200">{selectedPayerDisplay.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedPayerDisplay.details}
                            </div>
                            {selectedPayerDisplay.extra && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                    {selectedPayerDisplay.extra}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onChangePayer}
                        disabled={isLocked || isSubmitting}
                        className="dark:text-gray-400 dark:hover:text-white"
                    >
                        Change
                    </Button>
                </div>
            )}

            {errors.payer_id && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.payer_id}</p>
            )}

            {/* Remarks Card */}
            <div className="pt-4">
                <div className="space-y-2">
                    <Label htmlFor="remarks" className="dark:text-gray-300">Remarks/Notes</Label>
                    <Textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={onInputChange}
                        placeholder="Additional notes or special conditions..."
                        rows={3}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                        disabled={isLocked || isSubmitting}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Optional: Add any internal notes about this request
                    </p>
                </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">👤 Applicant Information</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>Select the correct payer type (Resident, Household, or Business)</li>
                            <li>Search by name, address, or contact number</li>
                            <li>Verify all information before proceeding</li>
                            <li>Add remarks for special instructions or notes</li>
                            <li>Business applicants need valid business permit</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}