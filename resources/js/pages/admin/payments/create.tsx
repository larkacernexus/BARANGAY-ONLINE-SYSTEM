// resources/js/components/admin/Payments/Create.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Import child components
import { ProgressIndicator } from '@/components/admin/payment/ProgressIndicator';
import { PayerSelectionStep } from '@/components/admin/payment/PayerSelectionStep';
import { AddFeesStep } from '@/components/admin/payment/AddFeesStep';
import { PaymentDetailsStep } from '@/components/admin/payment/PaymentDetailsStep';

// Import local components
import Header from '@/components/admin/payment/paymentCreate/components/Header';
import ProcessingLoader from '@/components/admin/payment/paymentCreate/components/ProcessingLoader';
import DiscountSelectionModal from '@/components/admin/payment/paymentCreate/components/DiscountSelectionModal';
import VerificationModal from '@/components/admin/payment/paymentCreate/components/VerificationModal';

// Import types, utils, and hooks
import { 
    PageProps, 
    PaymentFormData, 
    OutstandingFee, 
    Resident, 
    Household, 
    Business,
    ClearanceRequest, 
    BackendFee,
    FeeType,
    PaymentItem,
    DiscountRule
} from '@/components/admin/payment/paymentCreate/types';
import { 
    generateORNumber, 
    parseAmount, 
    getOutstandingFeeBalance, 
    getAmountPaid, 
    getTotalOriginalAmount,
    calculateMonthsLate, 
    isValidDate, 
    convertBackendFeeToOutstandingFee,
    getResidentDiscounts,
    checkIfDiscountAllowed,
    getDiscountPercentageForFeeType 
} from '@/components/admin/payment/paymentCreate/utils';
import { useFormSubmission } from '@/components/admin/payment/paymentCreate/hooks/useFormSubmission';
import { useFeeCalculations } from '@/components/admin/payment/paymentCreate/hooks/useFeeCalculations';
import { usePayerHandlers } from '@/components/admin/payment/paymentCreate/components/PayerHandlers';
import { useFeeHandlers } from '@/components/admin/payment/paymentCreate/components/FeeHandlers';
import { useClearanceHandlers } from '@/components/admin/payment/paymentCreate/components/ClearanceHandlers';

export default function CreatePayment() {
    const { 
        residents, 
        households, 
        businesses = [], // ADDED with default
        fees,
        feeTypes = [],
        discountRules = [],
        discountTypes = {}, 
        discountCodeToIdMap = {},
        pre_filled_data, 
        clearance_request, 
        clearanceTypes = {},
        clearanceTypesDetails = [],
        clearance_requests = [],
        selected_fee_details,
        selected_fee_type_id
    } = usePage<PageProps>().props;
    
    // Log the data to see what we're getting
    console.log('🔍 Residents from props:', residents);
    console.log('🔍 Households from props:', households);
    console.log('🔍 Businesses from props:', businesses);
    console.log('🔍 Clearance requests from props:', clearance_requests);
    
    // ========== STATE DECLARATIONS ==========
    const [step, setStep] = useState<number>(1);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | Business | ClearanceRequest | BackendFee | OutstandingFee | null>(null);
    
    // ADDED: State for clearance requests of the selected payer
    const [payerClearanceRequests, setPayerClearanceRequests] = useState<ClearanceRequest[]>([]);
    
    const [payerSource, setPayerSource] = useState<'residents' | 'households' | 'businesses' | 'clearance' | 'fees'>(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const hasFeeId = urlParams.has('fee_id') || !!pre_filled_data?.fee_id;
        const hasClearanceId = urlParams.has('clearance_request_id') || !!pre_filled_data?.clearance_request_id;
        
        if (hasFeeId) {
            return 'fees';
        }
        if (hasClearanceId) {
            return 'clearance';
        }
        
        // Check if we have a pre-selected business
        if (pre_filled_data?.payer_type === 'business') {
            return 'businesses';
        }
        
        return 'residents';
    });
    
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedOutstandingFee, setSelectedOutstandingFee] = useState<OutstandingFee | null>(null);
    const [isLatePayment, setIsLatePayment] = useState<boolean>(false);
    const [monthsLate, setMonthsLate] = useState<number>(1);
    const [showLateSettings, setShowLateSettings] = useState<boolean>(false);
    const [showDiscountSelection, setShowDiscountSelection] = useState<boolean>(false);
    const [selectedDiscount, setSelectedDiscount] = useState<string>('');
    const [selectedDiscountCode, setSelectedDiscountCode] = useState<string>('');
    const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
    const [pendingDiscountCode, setPendingDiscountCode] = useState<string>('');
    const [verificationIdNumber, setVerificationIdNumber] = useState<string>('');
    const [verificationRemarks, setVerificationRemarks] = useState<string>('');
    const [userModifiedPurpose, setUserModifiedPurpose] = useState<boolean>(false);
    const [isProcessingFee, setIsProcessingFee] = useState<boolean>(false);
    const [payerOutstandingFees, setPayerOutstandingFees] = useState<OutstandingFee[]>([]);
    
    const hasInitializedRef = useRef(false);
    const feePaymentProcessedRef = useRef(false);
    // ADDED: Ref to track processed clearance IDs to prevent infinite loops
    const processedClearanceIdsRef = useRef<Set<number>>(new Set());
    // ADDED: Ref to store clearance handler to avoid dependency issues
    const handleClearanceRequestDirectlyRef = useRef<Function | null>(null);
    
    // ========== MEMOIZED VALUES THAT DON'T DEPEND ON data ==========
    const outstandingFeesForTab = useMemo(() => {
        if (!fees || !Array.isArray(fees)) return [];
        return fees.map(fee => convertBackendFeeToOutstandingFee(fee as BackendFee, feeTypes));
    }, [fees, feeTypes]);

    // ========== INITIAL FORM DATA ==========
    const initialFormData: PaymentFormData = {
        payer_type: pre_filled_data?.payer_type || '',
        payer_id: pre_filled_data?.payer_id || '',
        payer_name: pre_filled_data?.payer_name || '',
        contact_number: pre_filled_data?.contact_number || '',
        address: pre_filled_data?.address || '',
        household_number: pre_filled_data?.household_number || '',
        purok: pre_filled_data?.purok || '',
        
        items: [],
        
        payment_date: new Date().toISOString().split('T')[0],
        period_covered: '',
        or_number: generateORNumber(),
        payment_method: 'cash',
        reference_number: '',
        
        subtotal: 0,
        surcharge: 0,
        penalty: 0,
        discount: 0,
        discount_code: '',
        discount_id: undefined,
        discount_type: '',
        total_amount: 0,
        
        purpose: pre_filled_data?.clearance_request_id ? (clearance_request?.purpose || 'Clearance Fee') : '',
        remarks: '',
        is_cleared: false,
        clearance_type: pre_filled_data?.clearance_type || '',
        clearance_type_id: pre_filled_data?.clearance_type_id || '',
        clearance_code: pre_filled_data?.clearance_code || '',
        validity_date: '',
        collection_type: 'manual',
        clearance_request_id: pre_filled_data?.clearance_request_id || undefined,
    };

    // ========== HOOKS - data IS CREATED HERE ==========
    const { data, setData, submit, processing, submissionErrors } = useFormSubmission(initialFormData, false, resetForm);
    
    // Log data after it's created
    console.log('🔍 Form data:', data);
    
    // ========== COMPUTED VALUES THAT DEPEND ON 'data' ==========
    // Find resident from residents array using data.payer_id
    const selectedResidentFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) {
            console.log('🔍 No payer type or ID in data');
            return null;
        }
        
        if (data.payer_type === 'resident' && residents) {
            console.log('🔍 Looking for resident with ID:', data.payer_id);
            const found = residents.find((r: any) => r.id == data.payer_id);
            console.log('🔍 Found resident:', found);
            return found || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, residents]);

    // Find household from households array using data.payer_id
    const selectedHouseholdFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        
        if (data.payer_type === 'household' && households) {
            console.log('🔍 Looking for household with ID:', data.payer_id);
            const found = households.find((h: any) => h.id == data.payer_id);
            console.log('🔍 Found household:', found);
            return found || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, households]);

    // Find business from businesses array using data.payer_id
    const selectedBusinessFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        
        if (data.payer_type === 'business' && businesses) {
            console.log('🔍 Looking for business with ID:', data.payer_id);
            const found = businesses.find((b: any) => b.id == data.payer_id);
            console.log('🔍 Found business:', found);
            return found || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, businesses]);

    // Helper to check if selectedPayer is a resident
    const isSelectedPayerResident = useMemo(() => {
        return selectedPayer && 'is_senior' in selectedPayer;
    }, [selectedPayer]);

    const isSelectedPayerHousehold = useMemo(() => {
        return selectedPayer && 'household_number' in selectedPayer && !('is_senior' in selectedPayer);
    }, [selectedPayer]);

    const isSelectedPayerBusiness = useMemo(() => {
        return selectedPayer && 'business_name' in selectedPayer;
    }, [selectedPayer]);

    // Final selected resident - try multiple sources
    const finalSelectedResident = useMemo(() => {
        console.log('🔍 Computing finalSelectedResident:', {
            selectedResidentFromData,
            isSelectedPayerResident,
            selectedPayer: selectedPayer,
            dataPayerType: data.payer_type,
            dataPayerId: data.payer_id
        });
        
        // Priority 1: Resident found from data
        if (selectedResidentFromData) {
            console.log('🔍 Using selectedResidentFromData');
            return selectedResidentFromData;
        }
        
        // Priority 2: Selected payer is a resident
        if (isSelectedPayerResident && selectedPayer) {
            console.log('🔍 Using selectedPayer as resident');
            return selectedPayer as any;
        }
        
        // Priority 3: Try to find resident from residents array using data
        if (data.payer_type === 'resident' && data.payer_id && residents) {
            console.log('🔍 Trying direct lookup from residents');
            return residents.find((r: any) => r.id == data.payer_id) || null;
        }
        
        console.log('🔍 No resident found');
        return null;
    }, [selectedResidentFromData, isSelectedPayerResident, selectedPayer, data.payer_type, data.payer_id, residents]);

    const finalSelectedHousehold = useMemo(() => {
        console.log('🔍 Computing finalSelectedHousehold:', {
            selectedHouseholdFromData,
            isSelectedPayerHousehold,
            selectedPayer: selectedPayer
        });
        
        if (selectedHouseholdFromData) {
            return selectedHouseholdFromData;
        }
        
        if (isSelectedPayerHousehold && selectedPayer) {
            return selectedPayer as any;
        }
        
        if (data.payer_type === 'household' && data.payer_id && households) {
            return households.find((h: any) => h.id == data.payer_id) || null;
        }
        
        return null;
    }, [selectedHouseholdFromData, isSelectedPayerHousehold, selectedPayer, data.payer_type, data.payer_id, households]);

    const finalSelectedBusiness = useMemo(() => {
        console.log('🔍 Computing finalSelectedBusiness:', {
            selectedBusinessFromData,
            isSelectedPayerBusiness,
            selectedPayer: selectedPayer
        });
        
        if (selectedBusinessFromData) {
            return selectedBusinessFromData;
        }
        
        if (isSelectedPayerBusiness && selectedPayer) {
            return selectedPayer as any;
        }
        
        if (data.payer_type === 'business' && data.payer_id && businesses) {
            return businesses.find((b: any) => b.id == data.payer_id) || null;
        }
        
        return null;
    }, [selectedBusinessFromData, isSelectedPayerBusiness, selectedPayer, data.payer_type, data.payer_id, businesses]);

    // Initialize fee calculations with discount rules
    const { updateItems, clearItems, applyDiscount, removeDiscount } = useFeeCalculations({
        setData,
        data,
        discountRules
    });

    const paymentItems = useMemo(() => {
        return data.items || [];
    }, [data.items]);

    // ========== LOGGING EFFECTS ==========
    useEffect(() => {
        console.log('📊 Payment items updated:', {
            count: data.items?.length || 0,
            items: data.items?.map(item => ({
                id: item.id,
                fee_name: item.fee_name,
                has_clearance_id: !!item.metadata?.clearance_request_id,
                clearance_id: item.metadata?.clearance_request_id,
                category: item.category
            })),
            total: data.total_amount,
            discount: data.discount,
            discountCode: data.discount_code
        });
    }, [data.items, data.discount, data.discount_code]);

    // Log when payerClearanceRequests changes
    useEffect(() => {
        console.log('📋 Payer clearance requests updated:', {
            count: payerClearanceRequests.length,
            requests: payerClearanceRequests.map(cr => ({
                id: cr.id,
                reference: cr.reference_number,
                amount: cr.fee_amount,
                status: cr.status
            }))
        });
    }, [payerClearanceRequests]);

    // 🔴 CRITICAL FIX: isClearancePayment
    const isClearancePayment = useMemo(() => {
        if (pre_filled_data?.fee_id) {
            return false;
        }
        
        if (payerSource === 'fees') {
            return false;
        }
        
        const hasClearanceRequestId = !!data.clearance_request_id || !!pre_filled_data?.clearance_request_id;
        
        if (hasClearanceRequestId) {
            return true;
        }
        
        if (payerSource === 'clearance') {
            return true;
        }
        
        if (clearance_request) {
            return true;
        }
        
        const hasClearanceItems = paymentItems.some(item => 
            item.metadata?.is_clearance_fee === true || item.metadata?.clearance_request_id
        );
        
        if (hasClearanceItems) {
            return true;
        }
        
        return false;
        
    }, [pre_filled_data, payerSource, data.clearance_request_id, clearance_request, paymentItems]);

    // ========== DISCOUNT HANDLERS ==========
    const handleDiscountCodeChange = (code: string) => {
        if (code === 'no_discount' || !code) {
            removeDiscount();
            setSelectedDiscountCode('');
            setPendingDiscountCode('');
            return;
        }
        
        const selectedRule = discountRules.find(r => r.code === code);
        
        if (!selectedRule) {
            alert(`Discount rule "${code}" not found. Please refresh the page.`);
            return;
        }
        
        const totalBaseAmount = data.subtotal + data.surcharge + data.penalty;
        if (selectedRule.minimum_purchase_amount && totalBaseAmount < selectedRule.minimum_purchase_amount) {
            alert(`This discount requires a minimum purchase of ₱${selectedRule.minimum_purchase_amount.toFixed(2)}`);
            return;
        }
        
        if (selectedRule.requires_verification) {
            setPendingDiscountCode(code);
            setVerificationIdNumber('');
            setVerificationRemarks('');
            setShowVerificationModal(true);
            return;
        }
        
        applyDiscount(code);
        setSelectedDiscountCode(code);
    };

    const handleVerificationSubmit = () => {
        if (!verificationIdNumber) {
            alert('Please enter ID number for verification');
            return;
        }
        
        applyDiscount(pendingDiscountCode);
        setSelectedDiscountCode(pendingDiscountCode);
        
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('verification_id_number', verificationIdNumber);
                setData('verification_remarks', verificationRemarks);
            } else {
                setData((prev: PaymentFormData) => ({
                    ...prev,
                    verification_id_number: verificationIdNumber,
                    verification_remarks: verificationRemarks
                }));
            }
        }
        
        setShowVerificationModal(false);
        setPendingDiscountCode('');
        setVerificationIdNumber('');
        setVerificationRemarks('');
    };

    const formatCurrency = (amount: number): string => {
        return `₱${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

    const checkDiscountEligibilityForFees = useCallback((fees: OutstandingFee[], resident: Resident): OutstandingFee[] => {
        const residentDiscounts = getResidentDiscounts(resident);
        
        return fees.map(fee => {
            const applicableDiscounts: any[] = [];
            
            if (residentDiscounts.length > 0) {
                for (const discount of residentDiscounts) {
                    const isAllowed = checkIfDiscountAllowed(fee, discount.type);
                    if (isAllowed) {
                        const percentage = getDiscountPercentageForFeeType(fee, discount.type);
                        applicableDiscounts.push({
                            type: discount.type,
                            label: discount.label,
                            percentage: discount.percentage,
                            applicablePercentage: percentage,
                            id_number: discount.id_number,
                            has_id: discount.has_id,
                        });
                    }
                }
            }
            
            return {
                ...fee,
                applicableDiscounts,
                canApplyDiscount: applicableDiscounts.length > 0
            };
        });
    }, []);

    // ========== HELPER FUNCTION TO GET CLEARANCE REQUESTS FOR PAYER ==========
    const getClearanceRequestsForPayer = useCallback((payerType: string, payerId: string | number): ClearanceRequest[] => {
        if (!payerId) return [];
        
        if (payerType === 'resident') {
            // Filter clearance requests for this resident
            return clearance_requests.filter(cr => 
                cr.resident_id == payerId && 
                cr.can_be_paid && 
                !cr.already_paid
            );
        } else if (payerType === 'household') {
            // For households, we need to get all resident IDs in the household
            const household = households.find(h => h.id == payerId);
            if (!household || !household.members) return [];
            
            const residentIds = household.members.map((m: any) => m.resident_id).filter(Boolean);
            
            // Filter clearance requests for these residents
            return clearance_requests.filter(cr => 
                residentIds.includes(cr.resident_id) && 
                cr.can_be_paid && 
                !cr.already_paid
            );
        } else if (payerType === 'business') {
            // For businesses, get clearance requests for the owner (if resident)
            const business = businesses.find(b => b.id == payerId);
            if (!business || !business.owner_id) return [];
            
            // Filter clearance requests for the owner
            return clearance_requests.filter(cr => 
                cr.resident_id == business.owner_id && 
                cr.can_be_paid && 
                !cr.already_paid
            ).map(cr => ({
                ...cr,
                for_business_owner: true,
                business_name: business.business_name,
                business_id: business.id
            }));
        }
        
        return [];
    }, [clearance_requests, households, businesses]);

    // ========== INITIALIZE HANDLERS ==========
    const payerHandlers = usePayerHandlers({
        data,
        setData,
        setSelectedPayer,
        setPayerSource,
        setPayerOutstandingFees,
        setPayerClearanceRequests, // PASS THIS
        outstandingFeesForTab,
        clearanceTypes,
        clearanceTypesDetails,
        clearance_requests: clearance_requests || [],
        clearance_request,
        checkDiscountEligibilityForFees,
        getClearanceRequestsForPayer // PASS THIS
    });

    const feeHandlers = useFeeHandlers({
        data,
        setData,
        updateItems,
        paymentItems,
        userModifiedPurpose,
        setUserModifiedPurpose,
        feeTypes,
        setSelectedOutstandingFee,
        setShowDiscountSelection,
        setShowLateSettings,
        setIsLatePayment,
        setMonthsLate,
        setSelectedDiscount
    });

    const clearanceHandlers = useClearanceHandlers({
        data,
        setData,
        setSelectedPayer,
        setPayerSource,
        setPayerOutstandingFees,
        setPayerClearanceRequests, // PASS THIS
        outstandingFeesForTab,
        clearanceTypes,
        clearanceTypesDetails,
        checkDiscountEligibilityForFees,
        getClearanceRequestsForPayer // PASS THIS
    });

    // ========== UPDATE REF WHEN CLEARANCE HANDLER CHANGES ==========
    // This prevents the effect from depending on the handler directly
    useEffect(() => {
        handleClearanceRequestDirectlyRef.current = clearanceHandlers.handleClearanceRequestDirectly;
    }, [clearanceHandlers.handleClearanceRequestDirectly]);

    // ========== REF HANDLERS ==========
    const handleResidentPayerWithFeeRef = useRef<Function | null>(null);
    const handleOutstandingFeePayerRef = useRef<Function | null>(null);
    const handleBusinessPayerRef = useRef<Function | null>(null);

    useEffect(() => {
        handleResidentPayerWithFeeRef.current = async (resident: Resident, fee: OutstandingFee) => {
            const residentOutstandingFees = fees
                .filter((f: any) => 
                    f.payer_type === 'resident' && 
                    f.payer_id == resident.id &&
                    f.balance > 0
                )
                .map((f: any) => convertBackendFeeToOutstandingFee(f as BackendFee, feeTypes));
            
            const feesWithDiscountInfo = checkDiscountEligibilityForFees(residentOutstandingFees, resident);
            setPayerOutstandingFees(feesWithDiscountInfo);
            
            // Get clearance requests for this resident
            const clearanceReqs = getClearanceRequestsForPayer('resident', resident.id);
            setPayerClearanceRequests(clearanceReqs);
            
            const updatedData = {
                ...data,
                payer_type: 'resident',
                payer_id: resident.id,
                payer_name: resident.name,
                contact_number: resident.contact_number || '',
                address: resident.address || '',
                household_number: resident.household_number || '',
                purok: resident.purok || '',
                items: [],
                subtotal: 0,
                total_amount: 0,
                clearance_request_id: undefined,
                clearance_type: '',
                clearance_type_id: '',
                clearance_code: '',
                is_cleared: false,
            };
            
            setData(updatedData);
            setSelectedPayer(resident);
            setPayerSource('residents');
            
            const feeWithDiscount = feesWithDiscountInfo.find(f => f.id === fee.id) || fee;
            
            if (feeWithDiscount.applicableDiscounts && feeWithDiscount.applicableDiscounts.length > 0) {
                setSelectedOutstandingFee(feeWithDiscount);
                setShowDiscountSelection(true);
            } else {
                feeHandlers.handleAddOutstandingFeeDirectly(feeWithDiscount);
            }
        };

        handleOutstandingFeePayerRef.current = (outstandingFee: OutstandingFee) => {
            payerHandlers.handleOutstandingFeePayer(outstandingFee);
        };

        handleBusinessPayerRef.current = (business: Business, fee: OutstandingFee) => {
            const businessOutstandingFees = outstandingFeesForTab.filter(f => 
                f.payer_type === 'business' && 
                f.payer_id == business.id &&
                parseFloat(f.balance) > 0
            );
            
            setPayerOutstandingFees(businessOutstandingFees);
            
            // Get clearance requests for this business owner
            const clearanceReqs = getClearanceRequestsForPayer('business', business.id);
            setPayerClearanceRequests(clearanceReqs);
            
            const updatedData = {
                ...data,
                payer_type: 'business',
                payer_id: business.id,
                payer_name: business.business_name,
                contact_number: business.contact_number || '',
                address: business.address || '',
                purok: business.purok || '',
                household_number: '',
                items: [],
                subtotal: 0,
                total_amount: 0,
                clearance_request_id: undefined,
            };
            
            setData(updatedData);
            setSelectedPayer(business);
            setPayerSource('businesses');
            
            // Add the specific fee
            feeHandlers.handleAddOutstandingFeeDirectly(fee);
        };
    }, [data, setData, fees, feeTypes, feeHandlers, checkDiscountEligibilityForFees, payerHandlers, outstandingFeesForTab, getClearanceRequestsForPayer]);

    const handleResidentPayerWithFee = useCallback(async (resident: Resident, fee: OutstandingFee) => {
        if (handleResidentPayerWithFeeRef.current) {
            return handleResidentPayerWithFeeRef.current(resident, fee);
        }
    }, []);

    const handleOutstandingFeePayer = useCallback((outstandingFee: OutstandingFee) => {
        if (handleOutstandingFeePayerRef.current) {
            return handleOutstandingFeePayerRef.current(outstandingFee);
        }
    }, []);

    const handleBusinessPayerWithFee = useCallback((business: Business, fee: OutstandingFee) => {
        if (handleBusinessPayerRef.current) {
            return handleBusinessPayerRef.current(business, fee);
        }
    }, []);

    const handleFeeBasedPayment = useCallback(async () => {
        if (!pre_filled_data?.fee_id) return;
        
        setPayerSource('fees');
        
        setData((prev: PaymentFormData) => ({
            ...prev,
            clearance_request_id: undefined,
            clearance_type: '',
            clearance_type_id: '',
            clearance_code: '',
            is_cleared: false,
            validity_date: '',
        }));
        
        setIsProcessingFee(true);
        
        if (selected_fee_details) {
            const feeWithDiscountInfo: OutstandingFee = {
                id: selected_fee_details.id,
                fee_type_id: selected_fee_details.fee_type_id,
                fee_type: feeTypes.find(ft => ft.id == selected_fee_details.fee_type_id),
                fee_code: selected_fee_details.fee_code,
                payer_name: selected_fee_details.payer_name,
                payer_type: selected_fee_details.payer_type as any,
                payer_id: selected_fee_details.payer_id,
                due_date: selected_fee_details.due_date,
                base_amount: selected_fee_details.base_amount.toString(),
                surcharge_amount: selected_fee_details.surcharge_amount.toString(),
                penalty_amount: selected_fee_details.penalty_amount.toString(),
                discount_amount: selected_fee_details.total_discounts.toString(),
                amount_paid: '0',
                balance: selected_fee_details.balance.toString(),
                total_amount: selected_fee_details.total_amount.toString(),
                status: selected_fee_details.status,
                purpose: selected_fee_details.purpose,
                fee_type_name: selected_fee_details.fee_type_name,
                fee_type_category: selected_fee_details.fee_type_category,
                category: selected_fee_details.fee_type_category,
                fee_type_has_senior_discount: selected_fee_details.fee_type_has_senior_discount,
                fee_type_senior_discount_percentage: selected_fee_details.fee_type_senior_discount_percentage,
                fee_type_has_pwd_discount: selected_fee_details.fee_type_has_pwd_discount,
                fee_type_pwd_discount_percentage: selected_fee_details.fee_type_pwd_discount_percentage,
                fee_type_has_solo_parent_discount: selected_fee_details.fee_type_has_solo_parent_discount,
                fee_type_solo_parent_discount_percentage: selected_fee_details.fee_type_solo_parent_discount_percentage,
                fee_type_has_indigent_discount: selected_fee_details.fee_type_has_indigent_discount,
                fee_type_indigent_discount_percentage: selected_fee_details.fee_type_indigent_discount_percentage,
                applicableDiscounts: selected_fee_details.applicable_discounts?.map((d: any) => ({
                    type: d.type,
                    label: d.label,
                    percentage: d.percentage,
                    applicablePercentage: d.percentage,
                    has_id: d.has_id,
                    id_number: d.id_number
                })) || [],
                canApplyDiscount: (selected_fee_details.applicable_discounts?.length || 0) > 0
            };
            
            if (feeWithDiscountInfo.payer_type === 'resident' && feeWithDiscountInfo.payer_id) {
                const resident = residents.find(r => r.id == feeWithDiscountInfo.payer_id);
                if (resident) {
                    await handleResidentPayerWithFee(resident, feeWithDiscountInfo);
                } else {
                    handleOutstandingFeePayer(feeWithDiscountInfo);
                }
            } else if (feeWithDiscountInfo.payer_type === 'household' && feeWithDiscountInfo.payer_id) {
                const household = households.find(h => h.id == feeWithDiscountInfo.payer_id);
                if (household) {
                    payerHandlers.handleHouseholdPayer(household);
                    setTimeout(() => {
                        feeHandlers.handleOutstandingFeeClick(feeWithDiscountInfo);
                    }, 200);
                } else {
                    handleOutstandingFeePayer(feeWithDiscountInfo);
                }
            } else if (feeWithDiscountInfo.payer_type === 'business' && feeWithDiscountInfo.payer_id) {
                const business = businesses.find(b => b.id == feeWithDiscountInfo.payer_id);
                if (business) {
                    payerHandlers.handleBusinessPayer(business);
                    setTimeout(() => {
                        feeHandlers.handleOutstandingFeeClick(feeWithDiscountInfo);
                    }, 200);
                } else {
                    handleOutstandingFeePayer(feeWithDiscountInfo);
                }
            } else {
                handleOutstandingFeePayer(feeWithDiscountInfo);
            }
        } else {
            const feeToPay = outstandingFeesForTab.find(fee => 
                fee.id == pre_filled_data.fee_id
            );
            
            if (!feeToPay) {
                setIsProcessingFee(false);
                return;
            }
            
            if (feeToPay.payer_type === 'resident' && feeToPay.payer_id) {
                const resident = residents.find(r => r.id == feeToPay.payer_id);
                if (resident) {
                    await handleResidentPayerWithFee(resident, feeToPay);
                } else {
                    handleOutstandingFeePayer(feeToPay);
                }
            } else if (feeToPay.payer_type === 'household' && feeToPay.payer_id) {
                const household = households.find(h => h.id == feeToPay.payer_id);
                if (household) {
                    payerHandlers.handleHouseholdPayer(household);
                    setTimeout(() => {
                        feeHandlers.handleOutstandingFeeClick(feeToPay);
                    }, 200);
                } else {
                    handleOutstandingFeePayer(feeToPay);
                }
            } else if (feeToPay.payer_type === 'business' && feeToPay.payer_id) {
                const business = businesses.find(b => b.id == feeToPay.payer_id);
                if (business) {
                    payerHandlers.handleBusinessPayer(business);
                    setTimeout(() => {
                        feeHandlers.handleOutstandingFeeClick(feeToPay);
                    }, 200);
                } else {
                    handleOutstandingFeePayer(feeToPay);
                }
            } else {
                handleOutstandingFeePayer(feeToPay);
            }
        }
        
        if (pre_filled_data?.payer_type && pre_filled_data?.payer_id) {
            const payerFees = outstandingFeesForTab.filter(f => 
                f.payer_type === pre_filled_data.payer_type && 
                f.payer_id == pre_filled_data.payer_id &&
                parseFloat(f.balance) > 0
            );
            
            setPayerOutstandingFees(payerFees);
            
            // Also get clearance requests for this payer
            const clearanceReqs = getClearanceRequestsForPayer(
                pre_filled_data.payer_type, 
                pre_filled_data.payer_id
            );
            setPayerClearanceRequests(clearanceReqs);
        }
        
        setTimeout(() => {
            setStep(2);
            setIsProcessingFee(false);
            feePaymentProcessedRef.current = true;
        }, 300);
        
    }, [
        pre_filled_data, 
        selected_fee_details, 
        outstandingFeesForTab, 
        residents, 
        households, 
        businesses,
        feeTypes, 
        payerHandlers, 
        feeHandlers, 
        handleResidentPayerWithFee, 
        handleOutstandingFeePayer,
        getClearanceRequestsForPayer,
        setData
    ]);

    // ========== FIXED: SESSION STORAGE HANDLING WITH INFINITE LOOP PREVENTION ==========
    useEffect(() => {
        const pendingClearancePayment = sessionStorage.getItem('pending_clearance_payment');
        
        if (pendingClearancePayment && !clearance_request) {
            try {
                const clearanceData = JSON.parse(pendingClearancePayment);
                
                // Check if we've already processed this clearance ID
                if (processedClearanceIdsRef.current.has(clearanceData.clearance_request_id)) {
                    console.log('🔄 Clearance already processed, skipping:', clearanceData.clearance_request_id);
                    sessionStorage.removeItem('pending_clearance_payment');
                    return;
                }
                
                const mockClearanceRequest: ClearanceRequest = {
                    id: clearanceData.clearance_request_id,
                    resident_id: clearanceData.resident_id,
                    clearance_type_id: clearanceData.clearance_type_id,
                    reference_number: clearanceData.reference,
                    purpose: clearanceData.purpose,
                    specific_purpose: clearanceData.specific_purpose || '',
                    fee_amount: clearanceData.amount,
                    status: 'pending_payment',
                    can_be_paid: true,
                    already_paid: false,
                    clearance_type: {
                        id: clearanceData.clearance_type_id,
                        name: clearanceData.clearance_type_name || 'Clearance Fee',
                        code: 'BRGY_CLEARANCE',
                        fee: clearanceData.amount,
                        formatted_fee: '₱' + parseFloat(clearanceData.amount).toFixed(2),
                        validity_days: 30,
                        processing_days: 3,
                        description: '',
                        has_senior_discount: false,
                        senior_discount_percentage: 0,
                        has_pwd_discount: false,
                        pwd_discount_percentage: 0,
                        has_solo_parent_discount: false,
                        solo_parent_discount_percentage: 0,
                        has_indigent_discount: false,
                        indigent_discount_percentage: 0,
                    },
                    resident: {
                        id: clearanceData.resident_id,
                        name: clearanceData.resident_name || 'Unknown Resident',
                        contact_number: '',
                        address: '',
                        purok: '',
                        household_number: '',
                    }
                };
                
                // Use the ref to call the handler (prevents dependency issues)
                if (handleClearanceRequestDirectlyRef.current) {
                    handleClearanceRequestDirectlyRef.current(mockClearanceRequest, residents);
                    // Mark this clearance as processed
                    processedClearanceIdsRef.current.add(clearanceData.clearance_request_id);
                }
                
                setPayerSource('clearance');
                sessionStorage.removeItem('pending_clearance_payment');
                
            } catch (error) {
                console.error('Error parsing pending clearance payment:', error);
                sessionStorage.removeItem('pending_clearance_payment');
            }
        } else if (clearance_request) {
            // Check if we've already processed this clearance ID
            if (processedClearanceIdsRef.current.has(clearance_request.id)) {
                console.log('🔄 Clearance request already processed, skipping:', clearance_request.id);
                return;
            }
            
            // Use the ref to call the handler
            if (handleClearanceRequestDirectlyRef.current) {
                handleClearanceRequestDirectlyRef.current(clearance_request, residents);
                // Mark this clearance as processed
                processedClearanceIdsRef.current.add(clearance_request.id);
            }
            
            setPayerSource('clearance');
        }
        
        // Clean up the ref when component unmounts (optional)
        return () => {
            processedClearanceIdsRef.current.clear();
        };
    }, [clearance_request, residents]); // REMOVED clearanceHandlers from dependencies

    // ========== MAIN INITIALIZATION EFFECT ==========
    useEffect(() => {
        if (hasInitializedRef.current) {
            return;
        }
        
        if (pre_filled_data?.fee_id && !feePaymentProcessedRef.current) {
            setPayerSource('fees');
            
            setTimeout(() => {
                hasInitializedRef.current = true;
                handleFeeBasedPayment();
            }, 100);
        }
        else if (clearance_request) {
            // Check if already processed
            if (processedClearanceIdsRef.current.has(clearance_request.id)) {
                hasInitializedRef.current = true;
                return;
            }
            
            hasInitializedRef.current = true;
            setPayerSource('clearance');
            
            // Use the ref to call the handler
            if (handleClearanceRequestDirectlyRef.current) {
                handleClearanceRequestDirectlyRef.current(clearance_request, residents);
                processedClearanceIdsRef.current.add(clearance_request.id);
            }
            
            setSelectedPayer(clearance_request);
        }
        else if (pre_filled_data?.payer_id && pre_filled_data?.payer_type) {
            hasInitializedRef.current = true;
            
            if (pre_filled_data.payer_type === 'resident') {
                const payer = residents.find(r => r.id == pre_filled_data.payer_id);
                if (payer) {
                    setSelectedPayer(payer);
                    payerHandlers.handleResidentPayer(payer);
                    setPayerSource('residents');
                }
            } else if (pre_filled_data.payer_type === 'household') {
                const payer = households.find(h => h.id == pre_filled_data.payer_id);
                if (payer) {
                    setSelectedPayer(payer);
                    payerHandlers.handleHouseholdPayer(payer);
                    setPayerSource('households');
                }
            } else if (pre_filled_data.payer_type === 'business') {
                const payer = businesses.find(b => b.id == pre_filled_data.payer_id);
                if (payer) {
                    setSelectedPayer(payer);
                    payerHandlers.handleBusinessPayer(payer);
                    setPayerSource('businesses');
                }
            }
            
            setTimeout(() => {
                setStep(2);
            }, 100);
        } else {
            hasInitializedRef.current = true;
        }
        
    }, [pre_filled_data, clearance_request, residents, households, businesses, payerHandlers, handleFeeBasedPayment]);

    // ========== HANDLER FUNCTIONS ==========
    const handleStepClick = (stepNumber: number) => {
        if (stepNumber === 1) {
            setStep(1);
        } else if (stepNumber === 2) {
            if (!data.payer_id || !data.payer_name) {
                alert('Please select a payer first');
                return;
            }
            setStep(2);
        } else if (stepNumber === 3) {
            if (paymentItems.length === 0) {
                alert('Please add at least one payment item first');
                return;
            }
            setStep(3);
        }
    };

    const handleSelectPayer = (payer: Resident | Household | Business | ClearanceRequest | BackendFee | OutstandingFee) => {
        setSelectedPayer(payer);
        
        if (payerSource === 'residents') {
            payerHandlers.handleResidentPayer(payer as Resident);
        } else if (payerSource === 'households') {
            payerHandlers.handleHouseholdPayer(payer as Household);
        } else if (payerSource === 'businesses') {
            payerHandlers.handleBusinessPayer(payer as Business);
        } else if (payerSource === 'clearance') {
            payerHandlers.handleClearanceTabPayer(payer as ClearanceRequest, residents);
        } else if (payerSource === 'fees') {
            if ('total_amount' in payer && typeof payer.total_amount === 'number') {
                payerHandlers.handleBackendFeePayer(payer as BackendFee);
            } else {
                payerHandlers.handleOutstandingFeePayer(payer as OutstandingFee);
            }
        }
        
        setTimeout(() => {
            setStep(2);
        }, 100);
    };

    // ========== ADD MISSING HANDLER FUNCTIONS ==========
    const handleAddOutstandingFeeWithLateSettings = (): void => {
        if (!selectedOutstandingFee) return;
        
        feeHandlers.handleAddOutstandingFeeDirectly(selectedOutstandingFee);
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
    };

    const handleCancelLateSettings = (): void => {
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
    };

    const handleAddClearanceRequest = useCallback((clearanceRequest: ClearanceRequest) => {
        console.log('📋 Adding clearance request to payment:', clearanceRequest);
        
        // Check if this clearance request is already added
        if (data.items?.some(item => 
            item.metadata?.clearance_request_id === clearanceRequest.id
        )) {
            alert('This clearance request is already added to the payment.');
            return;
        }
        
        // Create new payment item with CLEARANCE_REQUEST_ID in metadata
        const newItem: PaymentItem = {
            id: `clearance-${clearanceRequest.id}-${Date.now()}`,
            fee_name: clearanceRequest.clearance_type?.name || 'Barangay Clearance',
            fee_code: clearanceRequest.reference_number || 'CLR',
            description: clearanceRequest.purpose || 'Clearance Fee',
            base_amount: clearanceRequest.fee_amount,
            surcharge: 0,
            penalty: 0,
            total_amount: clearanceRequest.fee_amount,
            category: 'clearance',
            period_covered: '',
            months_late: 0,
            metadata: {
                is_clearance_fee: true,
                clearance_request_id: clearanceRequest.id, // CRITICAL: This is what the backend looks for
                clearance_type_id: clearanceRequest.clearance_type_id,
                clearance_type_code: clearanceRequest.clearance_type?.code,
            },
            // Also include at top level for redundancy
            clearance_request_id: clearanceRequest.id
        };
        
        // Update items
        const updatedItems = [...(data.items || []), newItem];
        
        // Calculate new totals
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        
        // Update form data
        setData((prev: PaymentFormData) => ({
            ...prev,
            items: updatedItems,
            subtotal: newSubtotal,
            total_amount: newTotal,
            clearance_request_id: clearanceRequest.id, // Also set at payment level
            clearance_type_id: clearanceRequest.clearance_type_id,
            clearance_code: clearanceRequest.clearance_type?.code || '',
        }));
        
        // Update purpose if not modified by user
        if (!userModifiedPurpose) {
            setData((prev: PaymentFormData) => ({
                ...prev,
                purpose: clearanceRequest.purpose || 'Clearance Fee'
            }));
        }
        
        // Remove from available list
        setPayerClearanceRequests(prev => prev.filter(cr => cr.id !== clearanceRequest.id));
        
        // Move to step 3
        setTimeout(() => setStep(3), 300);
        
    }, [data.items, setData, userModifiedPurpose]);

    const handlePurposeChange = (value: string): void => {
        setData('purpose', value);
        if (value !== feeHandlers.generatePurposeFromItems(paymentItems)) {
            setUserModifiedPurpose(true);
        }
    };

    const handlePeriodCoveredChange = (value: string): void => {
        setData('period_covered', value);
        
        if (!userModifiedPurpose && paymentItems.length > 0) {
            const newPurpose = feeHandlers.generatePurposeFromItems(paymentItems);
            setData('purpose', newPurpose);
        }
    };

    const handleClearanceTypeChange = (value: string): void => {
        const clearanceTypeDetail = clearanceTypesDetails.find(
            type => type.code === value
        );
        
        if (clearanceTypeDetail) {
            const updatedData = {
                ...data,
                clearance_type: clearanceTypeDetail.code,
                clearance_type_id: clearanceTypeDetail.id,
                clearance_code: clearanceTypeDetail.code,
            };
            
            if (!userModifiedPurpose) {
                updatedData.purpose = clearanceTypes[value] || value;
            }
            
            setData(updatedData);
            
            const updatedItems = paymentItems.map(item => {
                if (item.metadata?.is_clearance_fee === true) {
                    return {
                        ...item,
                        metadata: {
                            ...item.metadata,
                            clearance_type_id: clearanceTypeDetail.id,
                            clearance_type_code: clearanceTypeDetail.code,
                        }
                    };
                }
                return item;
            });
            
            if (updatedItems.some(item => item.metadata?.is_clearance_fee === true)) {
                updateItems(updatedItems);
            }
        } else {
            const updatedData = {
                ...data,
                clearance_type: value,
                clearance_type_id: '',
                clearance_code: value,
            };
            
            if (!userModifiedPurpose && value) {
                updatedData.purpose = clearanceTypes[value] || value;
            }
            
            setData(updatedData);
        }
    };

    const getClearanceTypeName = (code: string): string => {
        if (!code) return '';
        return clearanceTypes[code] || code;
    };

    function resetForm() {
        const resetData = {
            payer_type: '',
            payer_id: '',
            payer_name: '',
            contact_number: '',
            address: '',
            household_number: '',
            purok: '',
            items: [],
            payment_date: new Date().toISOString().split('T')[0],
            period_covered: '',
            or_number: generateORNumber(),
            payment_method: 'cash',
            reference_number: '',
            subtotal: 0,
            surcharge: 0,
            penalty: 0,
            discount: 0,
            discount_code: '',
            discount_id: undefined,
            discount_type: '',
            total_amount: 0,
            purpose: '',
            remarks: '',
            is_cleared: false,
            clearance_type: '',
            clearance_type_id: '',
            clearance_code: '',
            validity_date: '',
            collection_type: 'manual',
            clearance_request_id: undefined,
            verification_id_number: '',
            verification_remarks: '',
        };
        
        setData(resetData);
        
        setSelectedPayer(null);
        setPayerOutstandingFees([]);
        setPayerClearanceRequests([]); // CLEAR CLEARANCE REQUESTS
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
        setStep(1);
        setPayerSource('residents');
        setUserModifiedPurpose(false);
        setShowDiscountSelection(false);
        setSelectedDiscount('');
        setSelectedDiscountCode('');
        setIsProcessingFee(false);
        hasInitializedRef.current = false;
        feePaymentProcessedRef.current = false;
        processedClearanceIdsRef.current.clear(); // Clear processed IDs on reset
    }

    // ========== RENDER ==========
    return (
        <AppLayout
            title="Record Payment"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Payments', href: '/admin/payments' },
                { title: 'Record Payment', href: '/admin/payments/create' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <Header
                    isClearancePayment={isClearancePayment}
                    pre_filled_data={pre_filled_data}
                    clearance_request={clearance_request}
                    selected_fee_details={selected_fee_details}
                    processing={processing}
                    paymentItemsCount={paymentItems.length}
                    payerSource={payerSource}
                />

                {/* Progress Indicator */}
                <ProgressIndicator step={step} onStepClick={handleStepClick} />

                {/* Processing Loader */}
                <ProcessingLoader
                    isProcessingFee={isProcessingFee}
                    step={step}
                    pre_filled_data={pre_filled_data}
                    selected_fee_details={selected_fee_details}
                />

                {/* Discount Selection Modal */}
                <DiscountSelectionModal
                    showDiscountSelection={showDiscountSelection}
                    selectedOutstandingFee={selectedOutstandingFee}
                    selectedDiscount={selectedDiscount}
                    setSelectedDiscount={setSelectedDiscount}
                    setShowDiscountSelection={setShowDiscountSelection}
                    setSelectedOutstandingFee={setSelectedOutstandingFee}
                    handleAddOutstandingFeeDirectly={feeHandlers.handleAddOutstandingFeeDirectly}
                    handleAddOutstandingFeeWithDiscount={feeHandlers.handleAddOutstandingFeeWithDiscount}
                    data={data}
                />

                {/* Verification Modal */}
                <VerificationModal
                    show={showVerificationModal}
                    onClose={() => {
                        setShowVerificationModal(false);
                        setPendingDiscountCode('');
                        setVerificationIdNumber('');
                        setVerificationRemarks('');
                    }}
                    onSubmit={handleVerificationSubmit}
                    discountRule={discountRules.find(r => r.code === pendingDiscountCode)}
                    idNumber={verificationIdNumber}
                    onIdNumberChange={setVerificationIdNumber}
                    remarks={verificationRemarks}
                    onRemarksChange={setVerificationRemarks}
                />

                <form id="paymentForm" onSubmit={submit}>
                    {/* Step 1: Select Payer */}
                    {step === 1 && !isProcessingFee && (
                        <PayerSelectionStep
                            residents={residents}
                            households={households}
                            businesses={businesses}
                            clearanceRequests={clearance_requests || []}
                            fees={outstandingFeesForTab}
                            payerSource={payerSource}
                            setPayerSource={setPayerSource}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSelectPayer={handleSelectPayer}
                            handleManualPayer={payerHandlers.handleManualPayer}
                            preSelectedPayerId={pre_filled_data?.payer_id}
                            preSelectedPayerType={pre_filled_data?.payer_type}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            clearanceTypes={clearanceTypes}
                            preFilledData={pre_filled_data}
                            selectedFeeDetails={selected_fee_details}
                        />
                    )}

                    {/* Step 2: Add Fees */}
                    {step === 2 && (
                        <AddFeesStep
                            key="add-fees-step"
                            data={data}
                            setStep={setStep}
                            selectedFee={selectedOutstandingFee}
                            showLateSettings={showLateSettings}
                            isLatePayment={isLatePayment}
                            setIsLatePayment={setIsLatePayment}
                            monthsLate={monthsLate}
                            setMonthsLate={setMonthsLate}
                            onFeeClick={feeHandlers.handleOutstandingFeeClick}
                            onAddWithLateSettings={handleAddOutstandingFeeWithLateSettings}
                            onCancelLateSettings={handleCancelLateSettings}
                            onDirectAddFee={feeHandlers.handleAddOutstandingFeeDirectly}
                            paymentItems={paymentItems}
                            removePaymentItem={feeHandlers.removePaymentItem}
                            payerOutstandingFees={payerOutstandingFees}
                            payerClearanceRequests={payerClearanceRequests} // PASS THIS
                            onAddClearanceRequest={handleAddClearanceRequest} // PASS THIS
                            feeTypes={feeTypes}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            clearanceTypes={clearanceTypes}
                            clearanceTypesDetails={clearanceTypesDetails}
                            payerSource={payerSource}
                            pre_filled_data={pre_filled_data}
                            selectedFeeDetails={selected_fee_details}
                        />
                    )}

                    {/* Step 3: Payment Details */}
                    {step === 3 && (
                        <PaymentDetailsStep
                            data={data}
                            setData={setData}
                            setStep={setStep}
                            paymentItems={paymentItems}
                            selectedDiscountCode={data.discount_code || ''}
                            discountTypes={discountTypes}
                            discountRules={discountRules}
                            discountCodeToIdMap={discountCodeToIdMap}
                            handleDiscountCodeChange={handleDiscountCodeChange}
                            processing={processing}
                            handlePurposeChange={handlePurposeChange}
                            handlePeriodCoveredChange={handlePeriodCoveredChange}
                            handleClearanceTypeChange={handleClearanceTypeChange}
                            userModifiedPurpose={userModifiedPurpose}
                            setUserModifiedPurpose={setUserModifiedPurpose}
                            generatePurpose={() => feeHandlers.generatePurposeFromItems(paymentItems)}
                            clearanceTypes={clearanceTypesDetails}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            getClearanceTypeName={getClearanceTypeName}
                            selectedResident={finalSelectedResident}
                            selectedHousehold={finalSelectedHousehold}
                            selectedBusiness={finalSelectedBusiness}
                            payerSource={payerSource}
                        />
                    )}
                </form>
            </div>
        </AppLayout>
    );
}