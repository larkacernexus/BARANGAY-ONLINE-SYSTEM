// app/components/admin/payment/paymentCreate/components/ClearanceHandlers.tsx
import { useCallback } from 'react';
import { 
    ClearanceRequest, 
    Resident,
    PaymentFormData,
    OutstandingFee 
} from '../types';
import { 
    parseAmount,
    generateORNumber
} from '../utils';

interface ClearanceHandlersProps {
    data: PaymentFormData;
    setData: (data: any) => void;
    setSelectedPayer: (payer: any) => void;
    setPayerSource: (source: 'residents' | 'households' | 'clearance' | 'fees') => void;
    setPayerOutstandingFees: (fees: OutstandingFee[]) => void;
    outstandingFeesForTab: OutstandingFee[];
    clearanceTypes: Record<string, string>;
    clearanceTypesDetails: any[];
    checkDiscountEligibilityForFees: (fees: OutstandingFee[], resident: Resident) => OutstandingFee[];
}

export function useClearanceHandlers({
    data,
    setData,
    setSelectedPayer,
    setPayerSource,
    setPayerOutstandingFees,
    outstandingFeesForTab,
    clearanceTypes,
    clearanceTypesDetails,
    checkDiscountEligibilityForFees
}: ClearanceHandlersProps) {
    
    const handleClearanceRequestDirectly = useCallback((clearanceReq: ClearanceRequest, residents: Resident[]) => {
        console.log('🔄 Handling clearance request directly:', {
            clearance_request_id: clearanceReq.id,
            resident_id: clearanceReq.resident_id,
            resident_id_type: typeof clearanceReq.resident_id,
            hasNestedResident: !!clearanceReq.resident,
            nestedResidentId: clearanceReq.resident?.id,
            residentsAvailable: residents?.length
        });
        
        // Try MULTIPLE ways to find the resident
        let residentPayer = null;
        const searchMethods = [];
        
        // Method 1: Direct ID match (convert both to string for safe comparison)
        const residentIdStr = String(clearanceReq.resident_id).trim();
        searchMethods.push({ method: 'direct_id', value: residentIdStr });
        residentPayer = residents.find(r => String(r.id) === residentIdStr);
        
        // Method 2: If not found, try using nested resident ID
        if (!residentPayer && clearanceReq.resident?.id) {
            const nestedIdStr = String(clearanceReq.resident.id).trim();
            searchMethods.push({ method: 'nested_id', value: nestedIdStr });
            residentPayer = residents.find(r => String(r.id) === nestedIdStr);
        }
        
        // Method 3: Try loose equality (==) with original values
        if (!residentPayer) {
            searchMethods.push({ method: 'loose_equality', value: clearanceReq.resident_id });
            residentPayer = residents.find(r => r.id == clearanceReq.resident_id);
        }
        
        // Method 4: Try finding by name if available
        if (!residentPayer && clearanceReq.resident?.name) {
            const residentName = clearanceReq.resident.name.toLowerCase().trim();
            searchMethods.push({ method: 'by_name', value: residentName });
            residentPayer = residents.find(r => 
                r.name?.toLowerCase().includes(residentName) || 
                residentName.includes(r.name?.toLowerCase() || '')
            );
        }
        
        console.log('🔍 Resident search results:', {
            searchMethods,
            foundResident: residentPayer ? {
                id: residentPayer.id,
                name: residentPayer.name
            } : null
        });
        
        if (!residentPayer) {
            console.error('❌ Resident not found for clearance request after all attempts!');
            console.error('Clearance Request Data:', JSON.stringify(clearanceReq, null, 2));
            console.error('Available Residents:', residents.map(r => ({ id: r.id, name: r.name })));
            alert(`Resident not found for clearance request! Resident ID: ${clearanceReq.resident_id}`);
            return;
        }
        
        const clearanceTypeDetail = clearanceTypesDetails.find(
            type => type.id == clearanceReq.clearance_type_id
        ) || clearanceReq.clearance_type;
        
        const clearanceTypeCode = clearanceTypeDetail?.code || 
                                 clearanceReq.clearance_type?.code || 
                                 'BRGY_CLEARANCE';
        const clearanceTypeName = clearanceTypes[clearanceTypeCode] || 
                                 clearanceTypeDetail?.name ||
                                 clearanceReq.clearance_type?.name || 
                                 clearanceReq.purpose || 
                                 'Barangay Clearance';
        const clearanceTypeId = clearanceTypeDetail?.id || 
                               clearanceReq.clearance_type_id;
        
        const feeAmount = parseAmount(clearanceReq.fee_amount);
            
        const clearanceFeeItem = {
            id: Date.now(),
            fee_id: `clearance-${clearanceReq.id}`,
            fee_name: clearanceTypeName,
            fee_code: clearanceTypeCode,
            description: clearanceReq.specific_purpose || clearanceReq.purpose || 'Barangay Clearance Fee',
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
                clearance_request_id: clearanceReq.id,
                clearance_type_id: clearanceTypeId,
                clearance_type_code: clearanceTypeCode,
            }
        };
        
        const updatedData = {
            ...data,
            payer_type: 'resident',
            payer_id: residentPayer.id,
            payer_name: residentPayer.name || clearanceReq.resident?.name || 'Unknown',
            contact_number: residentPayer.contact_number || clearanceReq.resident?.contact_number || '',
            address: residentPayer.address || clearanceReq.resident?.address || '',
            household_number: residentPayer.household_number || clearanceReq.resident?.household_number || '',
            purok: residentPayer.purok || clearanceReq.resident?.purok || '',
            
            items: [clearanceFeeItem],
            
            payment_date: new Date().toISOString().split('T')[0],
            period_covered: '',
            or_number: generateORNumber(),
            payment_method: 'cash',
            reference_number: '',
            
            subtotal: feeAmount,
            surcharge: 0,
            penalty: 0,
            discount: 0,
            discount_type: '',
            total_amount: feeAmount,
            
            purpose: clearanceTypeName,
            remarks: '',
            is_cleared: false,
            clearance_type: clearanceTypeCode,
            clearance_type_id: clearanceTypeId,
            clearance_code: clearanceTypeCode,
            validity_date: '',
            collection_type: 'manual',
            clearance_request_id: clearanceReq.id,
        };
        
        setData(updatedData);
        setSelectedPayer(clearanceReq);
        setPayerSource('clearance');
        
        // Get outstanding fees for this resident with discount info
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == residentPayer.id
        );
        
        // Check discount eligibility for each fee
        const feesWithDiscountInfo = checkDiscountEligibilityForFees(residentOutstandingFees, residentPayer);
        setPayerOutstandingFees(feesWithDiscountInfo);
        
        console.log('✅ Clearance request processed directly successfully:', {
            residentName: residentPayer.name,
            clearanceId: clearanceReq.id,
            amount: feeAmount
        });
        
        return true;
    }, [data, setData, setSelectedPayer, setPayerSource, setPayerOutstandingFees, outstandingFeesForTab, clearanceTypes, clearanceTypesDetails, checkDiscountEligibilityForFees]);

    const handleClearanceRequest = useCallback((clearance_request: ClearanceRequest | null, residents: Resident[]) => {
        if (!clearance_request) return;
        
        console.log('🔄 Handling clearance request:', {
            clearance_request_id: clearance_request.id,
            resident_id: clearance_request.resident_id
        });
        
        // Try MULTIPLE ways to find the resident
        let residentPayer = null;
        
        // Method 1: Direct ID match (convert both to string)
        const residentIdStr = String(clearance_request.resident_id).trim();
        residentPayer = residents.find(r => String(r.id) === residentIdStr);
        
        // Method 2: If not found, try using nested resident ID
        if (!residentPayer && clearance_request.resident?.id) {
            const nestedIdStr = String(clearance_request.resident.id).trim();
            residentPayer = residents.find(r => String(r.id) === nestedIdStr);
        }
        
        // Method 3: Try loose equality
        if (!residentPayer) {
            residentPayer = residents.find(r => r.id == clearance_request.resident_id);
        }
        
        if (!residentPayer) {
            console.error('❌ Resident not found for clearance request!');
            return;
        }
        
        const clearanceTypeDetail = clearanceTypesDetails.find(
            type => type.id == clearance_request.clearance_type_id
        );
        
        const clearanceTypeCode = clearanceTypeDetail?.code || 
                                 clearance_request.clearance_type?.code || 
                                 'BRGY_CLEARANCE';
        const clearanceTypeName = clearanceTypes[clearanceTypeCode] || 
                                 clearanceTypeDetail?.name ||
                                 clearance_request.clearance_type?.name || 
                                 clearance_request.purpose || 
                                 'Barangay Clearance';
        const clearanceTypeId = clearanceTypeDetail?.id || 
                               clearance_request.clearance_type_id;
        
        const feeAmount = parseAmount(clearance_request.fee_amount);
            
        const clearanceFeeItem = {
            id: Date.now(),
            fee_id: `clearance-${clearance_request.id}`,
            fee_name: clearanceTypeName,
            fee_code: clearanceTypeCode,
            description: clearance_request.specific_purpose || clearance_request.purpose || 'Barangay Clearance Fee',
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
                clearance_request_id: clearance_request.id,
                clearance_type_id: clearanceTypeId,
                clearance_type_code: clearanceTypeCode,
            }
        };
        
        const updatedData = {
            payer_type: 'resident',
            payer_id: residentPayer.id,
            payer_name: residentPayer.name || clearance_request.resident?.name || 'Unknown',
            contact_number: residentPayer.contact_number || clearance_request.resident?.contact_number || '',
            address: residentPayer.address || clearance_request.resident?.address || '',
            household_number: residentPayer.household_number || clearance_request.resident?.household_number || '',
            purok: residentPayer.purok || clearance_request.resident?.purok || '',
            items: [clearanceFeeItem],
            payment_date: new Date().toISOString().split('T')[0],
            period_covered: '',
            or_number: generateORNumber(),
            payment_method: 'cash',
            reference_number: '',
            subtotal: feeAmount,
            surcharge: 0,
            penalty: 0,
            discount: 0,
            discount_type: '',
            total_amount: feeAmount,
            purpose: clearanceTypeName,
            remarks: '',
            is_cleared: false,
            clearance_type: clearanceTypeCode,
            clearance_type_id: clearanceTypeId,
            clearance_code: clearanceTypeCode,
            validity_date: '',
            collection_type: 'manual',
            clearance_request_id: clearance_request.id,
        };
        
        setData(updatedData);
        setSelectedPayer(clearance_request);
        
        // Get outstanding fees for this resident with discount info
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == residentPayer.id
        );
        
        const feesWithDiscountInfo = checkDiscountEligibilityForFees(residentOutstandingFees, residentPayer);
        setPayerOutstandingFees(feesWithDiscountInfo);
        
        console.log('✅ Clearance request processed');
        
        return true;
    }, [setData, setSelectedPayer, setPayerOutstandingFees, outstandingFeesForTab, clearanceTypes, clearanceTypesDetails, checkDiscountEligibilityForFees]);

    return {
        handleClearanceRequestDirectly,
        handleClearanceRequest
    };
}