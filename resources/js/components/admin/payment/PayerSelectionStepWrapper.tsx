// resources/js/components/admin/payment/PayerSelectionStepWrapper.tsx

import React, { useCallback, useMemo } from 'react';
import { PayerSelectionStep } from './PayerSelectionStep';
import { OutstandingFee, Resident, Household, Business, ClearanceRequest } from '@/types/admin/payments/payments';

// Helper function to get image URL
const getPhotoUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    if (photoPath.startsWith('/storage')) return photoPath;
    return `/storage/${photoPath}`;
};

interface WrapperProps {
    residents: Resident[];
    households: Household[];
    businesses: Business[];
    clearanceRequests: ClearanceRequest[];
    fees: OutstandingFee[];
    payerSource: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees';
    setPayerSource: (source: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSelectPayer: (payer: any, type: string) => void;
    handleManualPayer: (payer?: any) => void;
    preSelectedPayerId?: string | number;
    preSelectedPayerType?: string;
    isClearancePayment?: boolean;
    clearanceRequest?: ClearanceRequest | null;
    clearanceTypes?: Record<string, string>;
    preFilledData?: any;
    selectedFeeDetails?: any;
    handleAddClearanceRequest?: (clearance: ClearanceRequest) => void;
    handleOutstandingFeeDirectly?: (fee: OutstandingFee) => void;
    residentsList?: Resident[];
    householdsList?: Household[];
    businessesList?: Business[];
}

export function PayerSelectionStepWrapper({
    residents,
    households,
    businesses,
    clearanceRequests,
    fees,
    payerSource,
    setPayerSource,
    searchQuery,
    setSearchQuery,
    handleSelectPayer,
    handleManualPayer,
    preSelectedPayerId,
    preSelectedPayerType,
    isClearancePayment,
    clearanceRequest,
    clearanceTypes,
    preFilledData,
    selectedFeeDetails,
    handleAddClearanceRequest,
    handleOutstandingFeeDirectly,
    residentsList = [],
    householdsList = [],
    businessesList = [],
}: WrapperProps) {
    
    // Memoize enhanced residents to prevent unnecessary recalculations
    const enhancedResidents = useMemo(() => {
        return residents.map(resident => ({
            ...resident,
            photo_url: getPhotoUrl(resident.photo_path),
            has_photo: !!resident.photo_path
        }));
    }, [residents]);
    
    // FIXED: This function now properly returns void and matches the expected type
    const wrappedHandleSelectPayer = useCallback((payer: any) => {
        // Just call handleSelectPayer and return void (implicitly)
        if (payerSource === 'residents') {
            handleSelectPayer(payer, 'resident');
        } else if (payerSource === 'households') {
            handleSelectPayer(payer, 'household');
        } else if (payerSource === 'businesses') {
            handleSelectPayer(payer, 'business');
        } else if (payerSource === 'clearance') {
            if (payer && payer.resident && handleAddClearanceRequest) {
                const mockPayer = {
                    id: payer.resident.id,
                    name: payer.resident.name,
                    contact_number: payer.resident.contact_number || '',
                    address: payer.resident.address || '',
                    purok: payer.resident.purok || '',
                    household_number: payer.resident.household_number || '',
                    photo_path: payer.resident.photo_path,
                    photo_url: getPhotoUrl(payer.resident.photo_path),
                };
                handleSelectPayer(mockPayer, 'resident');
                handleAddClearanceRequest(payer);
            }
        } else if (payerSource === 'fees') {
            if (handleOutstandingFeeDirectly) {
                handleOutstandingFeeDirectly(payer);
                
                if (payer.payer_type === 'resident' && payer.payer_id) {
                    const resident = residentsList.find(r => r.id == payer.payer_id);
                    if (resident) {
                        const residentWithPhoto = {
                            ...resident,
                            photo_url: getPhotoUrl(resident.photo_path)
                        };
                        handleSelectPayer(residentWithPhoto, 'resident');
                    }
                } else if (payer.payer_type === 'household' && payer.payer_id) {
                    const household = householdsList.find(h => h.id == payer.payer_id);
                    if (household) {
                        handleSelectPayer(household, 'household');
                    }
                } else if (payer.payer_type === 'business' && payer.payer_id) {
                    const business = businessesList.find(b => b.id == payer.payer_id);
                    if (business) {
                        handleSelectPayer(business, 'business');
                    }
                }
            }
        }
        // No return statement needed - this function returns void
    }, [payerSource, handleSelectPayer, handleAddClearanceRequest, handleOutstandingFeeDirectly, residentsList, householdsList, businessesList]);
    
    return (
        <PayerSelectionStep
            residents={enhancedResidents}
            households={households}
            businesses={businesses}
            clearanceRequests={clearanceRequests}
            fees={fees as any}
            payerSource={payerSource}
            setPayerSource={setPayerSource}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSelectPayer={wrappedHandleSelectPayer}
            handleManualPayer={handleManualPayer}
            preSelectedPayerId={preSelectedPayerId}
            preSelectedPayerType={preSelectedPayerType}
            isClearancePayment={isClearancePayment}
            clearanceRequest={clearanceRequest}
            clearanceTypes={clearanceTypes}
            preFilledData={preFilledData}
            selectedFeeDetails={selectedFeeDetails}
        />
    );
}