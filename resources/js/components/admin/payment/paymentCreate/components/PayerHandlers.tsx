// app/components/admin/payment/paymentCreate/components/PayerHandlers.tsx
import { useCallback } from 'react';
import { 
    Resident, 
    Household, 
    Business,
    ClearanceRequest, 
    BackendFee, 
    OutstandingFee, 
    PaymentFormData,
    FeeType 
} from '@/types/admin/payments/payments';
import { 
    parseAmount, 
    calculateMonthsLate,
    getResidentDiscounts,
    checkIfDiscountAllowed,
    getDiscountPercentageForFeeType,
    getOutstandingFeeBalance as getOutstandingFeeBalanceUtil,
    getAmountPaid as getAmountPaidUtil
} from '../utils';

interface PayerHandlersProps {
    data: PaymentFormData;
    setData: (data: any) => void;
    setSelectedPayer: (payer: any) => void;
    setPayerSource: (source: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees') => void;
    setPayerOutstandingFees: (fees: OutstandingFee[]) => void;
    setPayerClearanceRequests?: (requests: ClearanceRequest[]) => void; // ADDED
    outstandingFeesForTab: OutstandingFee[];
    clearanceTypes: Record<string, string>;
    clearanceTypesDetails: any[];
    clearance_requests?: ClearanceRequest[];
    clearance_request?: ClearanceRequest | null;
    checkDiscountEligibilityForFees: (fees: OutstandingFee[], resident: Resident) => OutstandingFee[];
    fetchClearanceRequestsForPayer?: (type: string, id: string | number) => Promise<void>; // ADDED
}

export function usePayerHandlers({
    data,
    setData,
    setSelectedPayer,
    setPayerSource,
    setPayerOutstandingFees,
    setPayerClearanceRequests, // ADDED
    outstandingFeesForTab,
    clearanceTypes,
    clearanceTypesDetails,
    clearance_requests = [],
    clearance_request,
    checkDiscountEligibilityForFees,
    fetchClearanceRequestsForPayer // ADDED
}: PayerHandlersProps) {
    
    const handleResidentPayer = useCallback((resident: Resident) => {
        console.log('👤 Handling resident payer:', {
            residentId: resident.id,
            residentName: resident.name,
            discounts: resident.discount_eligibility_list
        });
        
        // Get outstanding fees for this resident
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == resident.id
        );
        
        // Check discount eligibility for each fee
        const feesWithDiscountInfo = checkDiscountEligibilityForFees(residentOutstandingFees, resident);
        setPayerOutstandingFees(feesWithDiscountInfo);
        
        // Filter clearance requests for this resident - but DON'T auto-add them
        const residentClearanceRequests = clearance_requests.filter(cr => 
            cr.resident_id == resident.id && 
            cr.can_be_paid && 
            !cr.already_paid
        );
        
        console.log('📋 Found clearance requests for resident:', {
            count: residentClearanceRequests.length,
            requests: residentClearanceRequests.map(cr => ({
                id: cr.id,
                reference: cr.reference_number,
                amount: cr.fee_amount
            }))
        });
        
        // Set clearance requests in state if the function exists
        if (setPayerClearanceRequests) {
            setPayerClearanceRequests(residentClearanceRequests);
        }
        
        // Fetch additional clearance requests if needed
        if (fetchClearanceRequestsForPayer) {
            fetchClearanceRequestsForPayer('resident', resident.id);
        }
        
        const updatedData = {
            ...data,
            payer_type: 'resident',
            payer_id: resident.id,
            payer_name: resident.name,
            contact_number: resident.contact_number || '',
            address: resident.address || '',
            household_number: resident.household_number || '',
            purok: resident.purok || '',
            // DON'T auto-add clearance items
            items: [],
            subtotal: 0,
            total_amount: 0,
            clearance_request_id: undefined,
            clearance_type: '',
            clearance_type_id: '',
            clearance_code: ''
        };
        
        setData(updatedData);
        setSelectedPayer(resident);
        setPayerSource('residents');
        
        console.log('✅ Resident payer processed - clearance requests available for manual selection');
    }, [data, setData, setSelectedPayer, setPayerSource, outstandingFeesForTab, clearance_requests, clearance_request, clearanceTypes, clearanceTypesDetails, checkDiscountEligibilityForFees, setPayerClearanceRequests, fetchClearanceRequestsForPayer]);

    const handleHouseholdPayer = useCallback((household: Household) => {
        console.log('🏠 Handling household payer:', {
            householdId: household.id,
            householdNumber: household.household_number,
            headName: household.head_name
        });
        
        // Get outstanding fees for this household
        const householdOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'household' && 
            fee.payer_id == household.id
        );
        
        setPayerOutstandingFees(householdOutstandingFees);
        
        // Fetch clearance requests for household members
        if (fetchClearanceRequestsForPayer) {
            fetchClearanceRequestsForPayer('household', household.id);
        }
        
        const updatedData = {
            ...data,
            payer_type: 'household',
            payer_id: household.id,
            payer_name: household.head_name,
            contact_number: household.contact_number || '',
            address: household.address || '',
            household_number: household.household_number || '',
            purok: household.purok || '',
            items: [],
            subtotal: 0,
            total_amount: 0,
            clearance_request_id: undefined,
        };
        
        setData(updatedData);
        setSelectedPayer(household);
        setPayerSource('households');
    }, [data, setData, setSelectedPayer, setPayerSource, outstandingFeesForTab, fetchClearanceRequestsForPayer]);

    const handleBusinessPayer = useCallback((business: Business) => {
        console.log('🏢 Handling business payer:', {
            businessId: business.id,
            businessName: business.business_name,
            ownerName: business.owner_name
        });
        
        // Get outstanding fees for this business
        const businessOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'business' && 
            fee.payer_id == business.id
        );
        
        setPayerOutstandingFees(businessOutstandingFees);
        
        // Fetch clearance requests for business owner
        if (fetchClearanceRequestsForPayer) {
            fetchClearanceRequestsForPayer('business', business.id);
        }
        
        const updatedData = {
            ...data,
            payer_type: 'business',
            payer_id: business.id,
            payer_name: business.business_name,
            contact_number: business.contact_number || '',
            address: business.address || '',
            household_number: '',
            purok: business.purok || '',
            items: [],
            subtotal: 0,
            total_amount: 0,
            clearance_request_id: undefined,
        };
        
        setData(updatedData);
        setSelectedPayer(business);
        setPayerSource('businesses');
        
        console.log('✅ Business payer processed');
    }, [data, setData, setSelectedPayer, setPayerSource, outstandingFeesForTab, fetchClearanceRequestsForPayer]);

    const handleClearanceTabPayer = useCallback((clearancePayer: ClearanceRequest, residents?: Resident[]) => {
        console.log('📋 Handling clearance tab payer:', {
            clearance_request_id: clearancePayer.id,
            resident_id: clearancePayer.resident_id,
            residentsAvailable: !!residents
        });
        
        // Check if residents array is provided
        if (!residents || !Array.isArray(residents)) {
            console.error('❌ Residents data not provided to handleClearanceTabPayer');
            alert('Unable to process clearance: Resident data not available');
            return;
        }
        
        const residentPayer = residents.find(r => r.id == clearancePayer.resident_id);
        if (!residentPayer) {
            console.error('❌ Resident not found for clearance request:', clearancePayer.resident_id);
            alert('Resident not found for this clearance request');
            return;
        }
        
        const clearanceTypeDetail = clearanceTypesDetails.find(
            type => type.id == clearancePayer.clearance_type_id
        );
        
        const clearanceTypeCode = clearanceTypeDetail?.code || 
                                 clearancePayer.clearance_type?.code || 
                                 'clearance';
        const clearanceTypeName = clearanceTypes[clearanceTypeCode] || 
                                 clearanceTypeDetail?.name ||
                                 clearancePayer.clearance_type?.name || 
                                 clearancePayer.purpose || 
                                 'Clearance Fee';
        const clearanceTypeId = clearanceTypeDetail?.id || 
                               clearancePayer.clearance_type_id;
        
        const feeAmount = parseAmount(clearancePayer.fee_amount);
        
        // DON'T auto-add the clearance item - just set the data and let user add it in Step 2
        const updatedData = {
            ...data,
            payer_type: 'resident',
            payer_id: clearancePayer.resident_id,
            payer_name: residentPayer.name || clearancePayer.resident?.name || 'Unknown',
            contact_number: residentPayer.contact_number || clearancePayer.resident?.contact_number || '',
            address: residentPayer.address || clearancePayer.resident?.address || '',
            household_number: residentPayer.household_number || clearancePayer.resident?.household_number || '',
            purok: residentPayer.purok || clearancePayer.resident?.purok || '',
            purpose: clearanceTypeName,
            clearance_type: clearanceTypeCode,
            clearance_type_id: clearanceTypeId,
            clearance_code: clearanceTypeCode,
            clearance_request_id: clearancePayer.id,
            // Don't auto-add to items
            items: [],
            subtotal: 0,
            total_amount: 0,
        };
        
        console.log('✅ Clearance tab payer processed - clearance available for manual addition');
        
        setData(updatedData);
        setSelectedPayer(clearancePayer);
        setPayerSource('clearance');
        
        // Get outstanding fees for this resident with discount info
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == clearancePayer.resident_id
        );
        
        const feesWithDiscountInfo = checkDiscountEligibilityForFees(residentOutstandingFees, residentPayer);
        setPayerOutstandingFees(feesWithDiscountInfo);
        
        // Set clearance requests in state if the function exists
        if (setPayerClearanceRequests) {
            setPayerClearanceRequests([clearancePayer]);
        }
    }, [data, setData, setSelectedPayer, setPayerSource, clearanceTypes, clearanceTypesDetails, outstandingFeesForTab, checkDiscountEligibilityForFees, setPayerClearanceRequests]);

    const handleBackendFeePayer = useCallback((backendFee: BackendFee) => {
        console.log('💰 Handling backend fee payer:', {
            feeId: backendFee.id,
            feeCode: backendFee.fee_code,
            payerName: backendFee.payer_name,
            balance: backendFee.balance
        });
        
        // Parse amounts
        const baseAmount = backendFee.base_amount;
        const surchargeAmount = backendFee.surcharge_amount;
        const penaltyAmount = backendFee.penalty_amount;
        const discountAmount = backendFee.discount_amount;
        const balanceAmount = backendFee.balance;
        const amountPaid = backendFee.amount_paid || 0;
        
        const feeItem = {
            id: Date.now(),
            fee_id: backendFee.id,
            fee_name: backendFee.fee_type_name || backendFee.purpose || 'Fee',
            fee_code: backendFee.fee_code,
            description: backendFee.purpose || `Payment for ${backendFee.fee_type_name || 'Fee'}`,
            base_amount: baseAmount,
            surcharge: surchargeAmount,
            penalty: penaltyAmount,
            discount: discountAmount,
            total_amount: balanceAmount,
            category: backendFee.fee_type_category || 'other',
            period_covered: backendFee.billing_period || '',
            months_late: calculateMonthsLate(backendFee.due_date),
            metadata: {
                is_outstanding_fee: true,
                original_fee_id: backendFee.id,
                payer_type: backendFee.payer_type || 'resident',
                payer_id: backendFee.payer_type === 'resident' ? backendFee.resident_id : 
                         backendFee.payer_type === 'household' ? backendFee.household_id : 
                         backendFee.payer_type === 'business' ? backendFee.business_id :
                         backendFee.id,
                original_fee_data: {
                    base_amount: baseAmount,
                    surcharge_amount: surchargeAmount,
                    penalty_amount: penaltyAmount,
                    discount_amount: discountAmount,
                    amount_paid: amountPaid,
                    balance: balanceAmount,
                    total_amount: backendFee.total_amount || 0
                }
            }
        };
        
        const payerType = backendFee.payer_type || 'resident';
        let payerId = backendFee.payer_type === 'resident' ? backendFee.resident_id : 
                     backendFee.payer_type === 'household' ? backendFee.household_id : 
                     backendFee.payer_type === 'business' ? backendFee.business_id :
                     backendFee.id;
        
        const updatedData = {
            ...data,
            payer_type: payerType,
            payer_id: payerId,
            payer_name: backendFee.payer_name,
            contact_number: backendFee.contact_number || '',
            address: backendFee.address || '',
            household_number: '',
            purok: backendFee.purok || '',
            purpose: backendFee.purpose || `Payment for ${backendFee.fee_type_name || 'Fee'}`,
            items: [feeItem],
            subtotal: balanceAmount,
            total_amount: balanceAmount,
            clearance_request_id: undefined,
        };
        
        setData(updatedData);
        setSelectedPayer(backendFee);
        setPayerSource('fees');
        setPayerOutstandingFees([]);
        
        console.log('✅ Backend fee payer processed');
    }, [data, setData, setSelectedPayer, setPayerSource]);

    const handleOutstandingFeePayer = useCallback((outstandingFee: OutstandingFee) => {
        console.log('💰 Handling outstanding fee payer:', {
            feeId: outstandingFee.id,
            feeCode: outstandingFee.fee_code,
            payerName: outstandingFee.payer_name,
            balance: outstandingFee.balance
        });
        
        // Get the correct balance to pay
        const balanceToPay = getOutstandingFeeBalanceUtil(outstandingFee);
        const amountPaid = getAmountPaidUtil(outstandingFee);
        
        // Parse amounts
        const baseAmount = parseAmount(outstandingFee.base_amount);
        const surchargeAmount = parseAmount(outstandingFee.surcharge_amount || 0);
        const penaltyAmount = parseAmount(outstandingFee.penalty_amount || 0);
        const discountAmount = parseAmount(outstandingFee.discount_amount || 0);
        
        const feeItem = {
            id: Date.now(),
            fee_id: outstandingFee.id,
            fee_name: outstandingFee.fee_type_name || outstandingFee.purpose || 'Fee',
            fee_code: outstandingFee.fee_code,
            description: outstandingFee.purpose || `Payment for ${outstandingFee.fee_type_name || 'Fee'}`,
            base_amount: baseAmount,
            surcharge: surchargeAmount,
            penalty: penaltyAmount,
            discount: discountAmount,
            total_amount: balanceToPay,
            category: outstandingFee.fee_type_category || outstandingFee.category || 'other',
            period_covered: outstandingFee.billing_period || '',
            months_late: calculateMonthsLate(outstandingFee.due_date),
            metadata: {
                is_outstanding_fee: true,
                original_fee_id: outstandingFee.id,
                payer_type: outstandingFee.payer_type || 'resident',
                payer_id: outstandingFee.payer_id,
                original_fee_data: {
                    base_amount: baseAmount,
                    surcharge_amount: surchargeAmount,
                    penalty_amount: penaltyAmount,
                    discount_amount: discountAmount,
                    amount_paid: amountPaid,
                    balance: balanceToPay,
                    total_amount: parseAmount(outstandingFee.total_amount || 0)
                }
            }
        };
        
        const payerType = outstandingFee.payer_type || 'resident';
        const payerId = outstandingFee.payer_id || outstandingFee.id;
        
        const updatedData = {
            ...data,
            payer_type: payerType,
            payer_id: payerId,
            payer_name: outstandingFee.payer_name,
            contact_number: '',
            address: '',
            household_number: '',
            purok: '',
            purpose: outstandingFee.purpose || `Payment for ${outstandingFee.fee_type_name || 'Fee'}`,
            items: [feeItem],
            subtotal: balanceToPay,
            total_amount: balanceToPay,
            clearance_request_id: undefined,
        };
        
        setData(updatedData);
        setSelectedPayer(outstandingFee);
        setPayerSource('fees');
        setPayerOutstandingFees([]);
        
        console.log('✅ Outstanding fee payer processed');
    }, [data, setData, setSelectedPayer, setPayerSource]);

    const handleManualPayer = useCallback((): void => {
        console.log('👤 Handling manual payer');
        
        const updatedData = {
            ...data,
            payer_type: 'other',
            payer_id: 'manual-' + Date.now(),
            payer_name: '',
            contact_number: '',
            address: '',
            household_number: '',
            purok: '',
            items: [],
            subtotal: 0,
            total_amount: 0,
            clearance_request_id: undefined,
        };
        
        setData(updatedData);
        setSelectedPayer(null);
        setPayerOutstandingFees([]);
        setPayerSource('residents');
    }, [data, setData, setSelectedPayer, setPayerOutstandingFees, setPayerSource]);

    return {
        handleResidentPayer,
        handleHouseholdPayer,
        handleBusinessPayer,
        handleClearanceTabPayer,
        handleBackendFeePayer,
        handleOutstandingFeePayer,
        handleManualPayer
    };
}