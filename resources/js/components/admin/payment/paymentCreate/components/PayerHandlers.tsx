// app/components/admin/payment/paymentCreate/components/PayerHandlers.tsx
import { useCallback } from 'react';
import { 
    Resident, 
    Household, 
    ClearanceRequest, 
    BackendFee, 
    OutstandingFee, 
    PaymentFormData,
    FeeType 
} from '../types';
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
    setPayerSource: (source: 'residents' | 'households' | 'clearance' | 'fees') => void;
    setPayerOutstandingFees: (fees: OutstandingFee[]) => void;
    outstandingFeesForTab: OutstandingFee[];
    clearanceTypes: Record<string, string>;
    clearanceTypesDetails: any[];
    clearance_requests?: ClearanceRequest[];
    clearance_request?: ClearanceRequest | null;
    checkDiscountEligibilityForFees: (fees: OutstandingFee[], resident: Resident) => OutstandingFee[];
}

export function usePayerHandlers({
    data,
    setData,
    setSelectedPayer,
    setPayerSource,
    setPayerOutstandingFees,
    outstandingFeesForTab,
    clearanceTypes,
    clearanceTypesDetails,
    clearance_requests = [],
    clearance_request,
    checkDiscountEligibilityForFees
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
        
        const residentClearanceRequests = clearance_requests.filter(cr => 
            cr.resident_id == resident.id && 
            cr.can_be_paid && 
            !cr.already_paid
        );
        
        const hasClearanceRequests = residentClearanceRequests.length > 0;
        
        const updatedData = {
            ...data,
            payer_type: 'resident',
            payer_id: resident.id,
            payer_name: resident.name,
            contact_number: resident.contact_number || '',
            address: resident.address || '',
            household_number: resident.household_number || '',
            purok: resident.purok || '',
        };
        
        if (hasClearanceRequests && !clearance_request) {
            const firstRequest = residentClearanceRequests[0];
            const clearanceTypeCode = firstRequest.clearance_type?.code || 'BRGY_CLEARANCE';
            const clearanceTypeDetail = clearanceTypesDetails.find(
                type => type.code === clearanceTypeCode
            );
            
            const feeAmount = parseAmount(firstRequest.fee_amount);
                
            const clearanceFeeItem = {
                id: Date.now(),
                fee_id: `clearance-${firstRequest.id}`,
                fee_name: clearanceTypeDetail?.name || clearanceTypes[clearanceTypeCode] || 'Clearance Fee',
                fee_code: clearanceTypeCode,
                description: firstRequest.specific_purpose || firstRequest.purpose || 'Clearance Fee',
                base_amount: feeAmount,
                surcharge: 0,
                penalty: 0,
                discount: 0,
                total_amount: feeAmount,
                category: 'clearance',
                period_covered: '',
                months_late: 0,
                metadata: {
                    is_clearance_fee: true,
                    clearance_request_id: firstRequest.id,
                    clearance_type_id: clearanceTypeDetail?.id || firstRequest.clearance_type_id,
                    clearance_type_code: clearanceTypeCode,
                }
            };
            
            updatedData.clearance_request_id = firstRequest.id;
            updatedData.clearance_type = clearanceTypeCode;
            updatedData.clearance_type_id = clearanceTypeDetail?.id || firstRequest.clearance_type_id;
            updatedData.clearance_code = clearanceTypeCode;
            updatedData.purpose = clearanceTypeDetail?.name || clearanceTypes[clearanceTypeCode] || 'Clearance Fee';
            updatedData.items = [clearanceFeeItem];
            updatedData.subtotal = feeAmount;
            updatedData.total_amount = feeAmount;
            
            console.log('✅ Auto-selected clearance request');
        } else {
            updatedData.items = [];
            updatedData.subtotal = 0;
            updatedData.total_amount = 0;
            if (!clearance_request) {
                updatedData.clearance_request_id = undefined;
            }
        }
        
        setData(updatedData);
    }, [data, setData, outstandingFeesForTab, clearance_requests, clearance_request, clearanceTypes, clearanceTypesDetails, checkDiscountEligibilityForFees]);

    const handleHouseholdPayer = useCallback((household: Household) => {
        // Get outstanding fees for this household
        const householdOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'household' && 
            fee.payer_id == household.id
        );
        
        setPayerOutstandingFees(householdOutstandingFees);
        
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
    }, [data, setData, outstandingFeesForTab]);

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
            
        const clearanceFeeItem = {
            id: Date.now(),
            fee_id: `clearance-${clearancePayer.id}`,
            fee_name: clearanceTypeName,
            fee_code: clearanceTypeCode,
            description: clearancePayer.specific_purpose || clearancePayer.purpose || 'Clearance Fee',
            base_amount: feeAmount,
            surcharge: 0,
            penalty: 0,
            discount: 0,
            total_amount: feeAmount,
            category: 'clearance',
            period_covered: '',
            months_late: 0,
            metadata: {
                is_clearance_fee: true,
                clearance_request_id: clearancePayer.id,
                clearance_type_id: clearanceTypeId,
                clearance_type_code: clearanceTypeCode,
            }
        };
        
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
            items: [clearanceFeeItem],
            subtotal: feeAmount,
            total_amount: feeAmount,
        };
        
        console.log('✅ Clearance tab payer processed');
        
        setData(updatedData);
        
        // Get outstanding fees for this resident with discount info
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == clearancePayer.resident_id
        );
        
        const feesWithDiscountInfo = checkDiscountEligibilityForFees(residentOutstandingFees, residentPayer);
        setPayerOutstandingFees(feesWithDiscountInfo);
    }, [data, setData, clearanceTypes, clearanceTypesDetails, outstandingFeesForTab, checkDiscountEligibilityForFees]);

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
        const payerId = backendFee.payer_type === 'resident' ? backendFee.resident_id : 
                       backendFee.payer_type === 'household' ? backendFee.household_id : 
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
        setPayerOutstandingFees([]);
        
        console.log('✅ Backend fee payer processed');
    }, [data, setData]);

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
        setPayerOutstandingFees([]);
        
        console.log('✅ Outstanding fee payer processed');
    }, [data, setData]);

    const handleManualPayer = useCallback((): void => {
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
        handleClearanceTabPayer,
        handleBackendFeePayer,
        handleOutstandingFeePayer,
        handleManualPayer
    };
}