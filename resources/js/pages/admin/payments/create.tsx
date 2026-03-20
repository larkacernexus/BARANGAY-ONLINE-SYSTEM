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
        businesses = [],
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
        selected_fee_type_id,
        payerClearanceRequests: initialPayerClearanceRequests = []
    } = usePage<PageProps>().props;
    
    // ========== DEBUG LOGS ==========
    console.log('🔍 ========== CREATE COMPONENT MOUNTED ==========');
    console.log('🔍 Timestamp:', new Date().toISOString());
    console.log('🔍 Initial props:', {
        residentsCount: residents?.length || 0,
        householdsCount: households?.length || 0,
        businessesCount: businesses?.length || 0,
        clearanceRequestsCount: clearance_requests?.length || 0,
        initialPayerClearanceRequestsCount: initialPayerClearanceRequests?.length || 0,
        pre_filled_data,
        clearance_request: clearance_request ? 'exists' : null,
    });

    // Log all clearance requests to see their structure
    if (clearance_requests && clearance_requests.length > 0) {
        console.log('📋 ALL CLEARANCE REQUESTS FROM SERVER:');
        clearance_requests.forEach((cr, index) => {
            console.log(`  [${index}] ID: ${cr.id}, Resident: ${cr.resident_id}, Payer: ${cr.payer_type}:${cr.payer_id}, Ref: ${cr.reference_number}, Amount: ${cr.fee_amount}, Status: ${cr.status}`);
        });
    } else {
        console.log('❌ No clearance requests from server');
    }
    
    // ========== STATE DECLARATIONS ==========
    const [step, setStep] = useState<number>(1);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | Business | ClearanceRequest | BackendFee | OutstandingFee | null>(null);
    
    // State for clearance requests of the selected payer
    const [payerClearanceRequests, setPayerClearanceRequests] = useState<ClearanceRequest[]>(
        initialPayerClearanceRequests || []
    );
    
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
    const [isLoadingClearances, setIsLoadingClearances] = useState<boolean>(false);
    const [functionCallCount, setFunctionCallCount] = useState<number>(0);
    
    const hasInitializedRef = useRef(false);
    const feePaymentProcessedRef = useRef(false);
    const processedClearanceIdsRef = useRef<Set<number>>(new Set());
    const handleClearanceRequestDirectlyRef = useRef<Function | null>(null);
    
    // Track component mounts and updates
    useEffect(() => {
        console.log('🔄 Component mounted/updated - step:', step);
    }, [step]);
    
    useEffect(() => {
        console.log('📋 initialPayerClearanceRequests changed:', {
            count: initialPayerClearanceRequests?.length,
            data: initialPayerClearanceRequests
        });
        if (initialPayerClearanceRequests && initialPayerClearanceRequests.length > 0) {
            setPayerClearanceRequests(initialPayerClearanceRequests);
        }
    }, [initialPayerClearanceRequests]);
    
    // ========== MEMOIZED VALUES ==========
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

    // ========== HOOKS ==========
    const { data, setData, submit, processing, submissionErrors } = useFormSubmission(initialFormData, false, resetForm);
    
    console.log('🔍 Form data:', data);
    
    // ========== COMPUTED VALUES ==========
    const selectedResidentFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        if (data.payer_type === 'resident' && residents) {
            return residents.find((r: any) => r.id == data.payer_id) || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, residents]);

    const selectedHouseholdFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        if (data.payer_type === 'household' && households) {
            return households.find((h: any) => h.id == data.payer_id) || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, households]);

    const selectedBusinessFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        if (data.payer_type === 'business' && businesses) {
            return businesses.find((b: any) => b.id == data.payer_id) || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, businesses]);

    const isSelectedPayerResident = useMemo(() => {
        return selectedPayer && 'is_senior' in selectedPayer;
    }, [selectedPayer]);

    const isSelectedPayerHousehold = useMemo(() => {
        return selectedPayer && 'household_number' in selectedPayer && !('is_senior' in selectedPayer);
    }, [selectedPayer]);

    const isSelectedPayerBusiness = useMemo(() => {
        return selectedPayer && 'business_name' in selectedPayer;
    }, [selectedPayer]);

    const finalSelectedResident = useMemo(() => {
        if (selectedResidentFromData) return selectedResidentFromData;
        if (isSelectedPayerResident && selectedPayer) return selectedPayer as any;
        if (data.payer_type === 'resident' && data.payer_id && residents) {
            return residents.find((r: any) => r.id == data.payer_id) || null;
        }
        return null;
    }, [selectedResidentFromData, isSelectedPayerResident, selectedPayer, data.payer_type, data.payer_id, residents]);

    const finalSelectedHousehold = useMemo(() => {
        if (selectedHouseholdFromData) return selectedHouseholdFromData;
        if (isSelectedPayerHousehold && selectedPayer) return selectedPayer as any;
        if (data.payer_type === 'household' && data.payer_id && households) {
            return households.find((h: any) => h.id == data.payer_id) || null;
        }
        return null;
    }, [selectedHouseholdFromData, isSelectedPayerHousehold, selectedPayer, data.payer_type, data.payer_id, households]);

    const finalSelectedBusiness = useMemo(() => {
        if (selectedBusinessFromData) return selectedBusinessFromData;
        if (isSelectedPayerBusiness && selectedPayer) return selectedPayer as any;
        if (data.payer_type === 'business' && data.payer_id && businesses) {
            return businesses.find((b: any) => b.id == data.payer_id) || null;
        }
        return null;
    }, [selectedBusinessFromData, isSelectedPayerBusiness, selectedPayer, data.payer_type, data.payer_id, businesses]);

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

    const isClearancePayment = useMemo(() => {
        if (pre_filled_data?.fee_id) return false;
        if (payerSource === 'fees') return false;
        if (!!data.clearance_request_id || !!pre_filled_data?.clearance_request_id) return true;
        if (payerSource === 'clearance') return true;
        if (clearance_request) return true;
        if (paymentItems.some(item => item.metadata?.is_clearance_fee === true || item.metadata?.clearance_request_id)) return true;
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

    // ========== FETCH CLEARANCE REQUESTS WITH DEBUGGING ==========
    const fetchClearanceRequestsForPayer = useCallback(async (payerType: string, payerId: string | number) => {
        const callCount = functionCallCount + 1;
        setFunctionCallCount(callCount);
        
        console.log('🔍 ========== FETCH_CLEARANCE_REQUESTS_FOR_PAYER CALL #' + callCount + ' ==========');
        console.log('📋 Call stack:', new Error().stack);
        console.log('📋 Parameters:', { 
            payerType, 
            payerId, 
            payerIdType: typeof payerId,
            timestamp: new Date().toISOString()
        });
        
        if (!payerId || !payerType) {
            console.log('❌ Invalid parameters, returning early');
            return;
        }
        
        console.log('📋 Available clearance_requests from props:', {
            count: clearance_requests?.length || 0,
            type: Array.isArray(clearance_requests) ? 'array' : typeof clearance_requests
        });
        
        setIsLoadingClearances(true);
        
        try {
            let normalizedPayerType = '';
            if (payerType.toLowerCase().includes('resident') || payerType === 'resident' || payerType === 'App\\Models\\Resident') {
                normalizedPayerType = 'resident';
            } else if (payerType.toLowerCase().includes('household') || payerType === 'household' || payerType === 'App\\Models\\Household') {
                normalizedPayerType = 'household';
            } else if (payerType.toLowerCase().includes('business') || payerType === 'business' || payerType === 'App\\Models\\Business') {
                normalizedPayerType = 'business';
            }
            
            console.log('📋 Normalized payer type:', normalizedPayerType);
            
            let matchingClearances: ClearanceRequest[] = [];
            
            if (normalizedPayerType === 'resident') {
                console.log('🔍 Checking for resident clearance requests with ID:', payerId);
                
                matchingClearances = clearance_requests.filter((cr: ClearanceRequest) => {
                    const matchesPayer = cr.payer_type === 'resident' && cr.payer_id == payerId;
                    const matchesResidentId = cr.resident_id == payerId;
                    const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                    const hasValidAmount = parseFloat(String(cr.fee_amount)) > 0;
                    
                    const matches = (matchesPayer || matchesResidentId) && isPayable && hasValidAmount;
                    
                    if (matches) {
                        console.log(`✅ Resident match found:`, {
                            id: cr.id,
                            matchesPayer,
                            matchesResidentId,
                            isPayable,
                            hasValidAmount
                        });
                    }
                    
                    return matches;
                });
            } else if (normalizedPayerType === 'household') {
                const household = households.find((h: any) => h.id == payerId);
                
                if (household && household.members) {
                    const residentIds = household.members
                        .map((m: any) => m.resident_id)
                        .filter(Boolean);
                    
                    console.log('📋 Resident IDs in household:', residentIds);
                    
                    if (residentIds.length > 0) {
                        matchingClearances = clearance_requests.filter((cr: ClearanceRequest) => {
                            const matchesPayer = cr.payer_type === 'resident' && residentIds.some(id => id == cr.payer_id);
                            const matchesResidentId = residentIds.some(id => id == cr.resident_id);
                            const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                            const hasValidAmount = parseFloat(String(cr.fee_amount)) > 0;
                            
                            const matches = (matchesPayer || matchesResidentId) && isPayable && hasValidAmount;
                            
                            if (matches) {
                                console.log(`✅ Household member match found:`, {
                                    id: cr.id,
                                    matchesPayer,
                                    matchesResidentId,
                                    isPayable,
                                    hasValidAmount
                                });
                            }
                            
                            return matches;
                        });
                    }
                }
            } else if (normalizedPayerType === 'business') {
                const businessMatches = clearance_requests.filter((cr: ClearanceRequest) => {
                    const matchesPayer = cr.payer_type === 'business' && cr.payer_id == payerId;
                    const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                    const hasValidAmount = parseFloat(String(cr.fee_amount)) > 0;
                    
                    return matchesPayer && isPayable && hasValidAmount;
                });
                
                if (businessMatches.length > 0) {
                    matchingClearances = businessMatches;
                } else {
                    const business = businesses.find((b: any) => b.id == payerId);
                    
                    if (business && business.owner_id) {
                        matchingClearances = clearance_requests.filter((cr: ClearanceRequest) => {
                            const matchesPayer = cr.payer_type === 'resident' && cr.payer_id == business.owner_id;
                            const matchesResidentId = cr.resident_id == business.owner_id;
                            const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                            const hasValidAmount = parseFloat(String(cr.fee_amount)) > 0;
                            
                            return (matchesPayer || matchesResidentId) && isPayable && hasValidAmount;
                        });
                    }
                }
            }
            
            console.log(`✅ Found ${matchingClearances.length} clearance requests:`, 
                matchingClearances.map(cr => ({
                    id: cr.id,
                    reference: cr.reference_number,
                    amount: cr.fee_amount
                }))
            );
            
            setPayerClearanceRequests(matchingClearances);
            
        } catch (error) {
            console.error('❌ Error fetching clearance requests:', error);
            setPayerClearanceRequests([]);
        } finally {
            setIsLoadingClearances(false);
            console.log('🔍 ========== FETCH_CLEARANCE_REQUESTS_FOR_PAYER END ==========');
        }
    }, [clearance_requests, households, businesses, functionCallCount]);

    // ========== FIXED: Handle payer selection ==========
    const handlePayerSelected = useCallback((payer: any, type: string) => {
        console.log('👤 ========== PAYER SELECTED ==========');
        console.log('👤 Timestamp:', new Date().toISOString());
        console.log('👤 Payer:', { 
            id: payer.id, 
            idType: typeof payer.id,
            name: payer.name, 
            type 
        });
        
        setSelectedPayer(payer);
        
        if (type === 'resident') {
            console.log('👤 Setting resident data for ID:', payer.id);
            setData((prev: PaymentFormData) => ({
                ...prev,
                payer_type: 'resident',
                payer_id: payer.id,
                payer_name: payer.name,
                contact_number: payer.contact_number || '',
                address: payer.address || '',
                household_number: payer.household_number || '',
                purok: payer.purok || '',
            }));
            
            const residentFees = outstandingFeesForTab.filter(f => 
                f.payer_type === 'App\\Models\\Resident' && 
                f.payer_id == payer.id &&
                parseFloat(f.balance) > 0
            );
            console.log('👤 Resident fees found:', residentFees.length);
            setPayerOutstandingFees(residentFees);
            
            // ALWAYS fetch clearance requests when a resident is selected
            console.log('👤 FETCHING clearance requests for resident:', payer.id);
            fetchClearanceRequestsForPayer('resident', payer.id);
            
        } else if (type === 'household') {
            console.log('👤 Setting household data for ID:', payer.id);
            setData((prev: PaymentFormData) => ({
                ...prev,
                payer_type: 'household',
                payer_id: payer.id,
                payer_name: payer.head_name || `Household ${payer.household_number}`,
                contact_number: payer.contact_number || '',
                address: payer.address || '',
                household_number: payer.household_number || '',
                purok: payer.purok || '',
            }));
            
            const householdFees = outstandingFeesForTab.filter(f => 
                f.payer_type === 'App\\Models\\Household' && 
                f.payer_id == payer.id &&
                parseFloat(f.balance) > 0
            );
            console.log('👤 Household fees found:', householdFees.length);
            setPayerOutstandingFees(householdFees);
            
            console.log('👤 FETCHING clearance requests for household:', payer.id);
            fetchClearanceRequestsForPayer('household', payer.id);
            
        } else if (type === 'business') {
            console.log('👤 Setting business data for ID:', payer.id);
            setData((prev: PaymentFormData) => ({
                ...prev,
                payer_type: 'business',
                payer_id: payer.id,
                payer_name: payer.business_name,
                contact_number: payer.contact_number || '',
                address: payer.address || '',
                household_number: '',
                purok: payer.purok || '',
            }));
            
            const businessFees = outstandingFeesForTab.filter(f => 
                f.payer_type === 'App\\Models\\Business' && 
                f.payer_id == payer.id &&
                parseFloat(f.balance) > 0
            );
            console.log('👤 Business fees found:', businessFees.length);
            setPayerOutstandingFees(businessFees);
            
            console.log('👤 FETCHING clearance requests for business:', payer.id);
            fetchClearanceRequestsForPayer('business', payer.id);
        }
        
        console.log('👤 Moving to step 2...');
        setTimeout(() => setStep(2), 100);
        
    }, [setData, outstandingFeesForTab, fetchClearanceRequestsForPayer]);

    // ========== INITIALIZE HANDLERS ==========
    const payerHandlers = usePayerHandlers({
        data,
        setData,
        setSelectedPayer,
        setPayerSource,
        setPayerOutstandingFees,
        setPayerClearanceRequests,
        outstandingFeesForTab,
        clearanceTypes,
        clearanceTypesDetails,
        clearance_requests: clearance_requests || [],
        clearance_request,
        checkDiscountEligibilityForFees,
        fetchClearanceRequestsForPayer
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
        setSelectedDiscount,
        onDiscountApplied: (discountedAmount) => {
            console.log('💰 Discount applied with amount:', discountedAmount);
            // Force update the amount paid field
            setTimeout(() => {
                const amountInput = document.querySelector('input[placeholder="0.00"], input.pl-8') as HTMLInputElement;
                if (amountInput) {
                    amountInput.value = discountedAmount.toFixed(2);
                    amountInput.dispatchEvent(new Event('input', { bubbles: true }));
                    amountInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, 100);
        }
    });

    const clearanceHandlers = useClearanceHandlers({
        data,
        setData,
        setSelectedPayer,
        setPayerSource,
        setPayerOutstandingFees,
        setPayerClearanceRequests,
        outstandingFeesForTab,
        clearanceTypes,
        clearanceTypesDetails,
        checkDiscountEligibilityForFees,
        fetchClearanceRequestsForPayer
    });

    useEffect(() => {
        handleClearanceRequestDirectlyRef.current = clearanceHandlers.handleClearanceRequestDirectly;
    }, [clearanceHandlers.handleClearanceRequestDirectly]);

    // ========== REF HANDLERS ==========
    const handleResidentPayerWithFeeRef = useRef<Function | null>(null);
    const handleOutstandingFeePayerRef = useRef<Function | null>(null);
    const handleBusinessPayerRef = useRef<Function | null>(null);

    useEffect(() => {
        handleResidentPayerWithFeeRef.current = async (resident: Resident, fee: OutstandingFee) => {
            console.log('👤 REF: handleResidentPayerWithFee called', { resident, fee });
            
            const residentOutstandingFees = fees
                .filter((f: any) => 
                    f.payer_type === 'resident' && 
                    f.payer_id == resident.id &&
                    f.balance > 0
                )
                .map((f: any) => convertBackendFeeToOutstandingFee(f as BackendFee, feeTypes));
            
            const feesWithDiscountInfo = checkDiscountEligibilityForFees(residentOutstandingFees, resident);
            setPayerOutstandingFees(feesWithDiscountInfo);
            
            // Always fetch clearance requests
            console.log('📋 (Ref) FETCHING clearance requests for resident:', resident.id);
            await fetchClearanceRequestsForPayer('resident', resident.id);
            
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
            console.log('👤 REF: handleBusinessPayer called', { business, fee });
            
            const businessOutstandingFees = outstandingFeesForTab.filter(f => 
                f.payer_type === 'business' && 
                f.payer_id == business.id &&
                parseFloat(f.balance) > 0
            );
            
            setPayerOutstandingFees(businessOutstandingFees);
            
            console.log('📋 (Ref) FETCHING clearance requests for business:', business.id);
            fetchClearanceRequestsForPayer('business', business.id);
            
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
            
            feeHandlers.handleAddOutstandingFeeDirectly(fee);
        };
    }, [data, setData, fees, feeTypes, feeHandlers, checkDiscountEligibilityForFees, payerHandlers, outstandingFeesForTab, fetchClearanceRequestsForPayer]);

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
        
        console.log('💰 handleFeeBasedPayment called', { pre_filled_data });
        
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
            // Fee handling code...
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
            
            console.log('📋 (FeePayment) FETCHING clearance requests for payer:', pre_filled_data.payer_type, pre_filled_data.payer_id);
            await fetchClearanceRequestsForPayer(
                pre_filled_data.payer_type, 
                pre_filled_data.payer_id
            );
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
        fetchClearanceRequestsForPayer,
        setData
    ]);

    // ========== SESSION STORAGE HANDLING ==========
    useEffect(() => {
        const pendingClearancePayment = sessionStorage.getItem('pending_clearance_payment');
        
        if (pendingClearancePayment && !clearance_request) {
            try {
                const clearanceData = JSON.parse(pendingClearancePayment);
                
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
                
                if (handleClearanceRequestDirectlyRef.current) {
                    handleClearanceRequestDirectlyRef.current(mockClearanceRequest, residents);
                    processedClearanceIdsRef.current.add(clearanceData.clearance_request_id);
                }
                
                setPayerSource('clearance');
                sessionStorage.removeItem('pending_clearance_payment');
                
            } catch (error) {
                console.error('Error parsing pending clearance payment:', error);
                sessionStorage.removeItem('pending_clearance_payment');
            }
        } else if (clearance_request) {
            if (processedClearanceIdsRef.current.has(clearance_request.id)) {
                console.log('🔄 Clearance request already processed, skipping:', clearance_request.id);
                return;
            }
            
            if (handleClearanceRequestDirectlyRef.current) {
                handleClearanceRequestDirectlyRef.current(clearance_request, residents);
                processedClearanceIdsRef.current.add(clearance_request.id);
            }
            
            setPayerSource('clearance');
        }
        
        return () => {
            processedClearanceIdsRef.current.clear();
        };
    }, [clearance_request, residents]);

    // ========== MAIN INITIALIZATION EFFECT ==========
    useEffect(() => {
        if (hasInitializedRef.current) {
            return;
        }
        
        console.log('🔄 Main initialization effect running...');
        
        if (pre_filled_data?.fee_id && !feePaymentProcessedRef.current) {
            console.log('🔄 Initializing with fee payment');
            setPayerSource('fees');
            
            setTimeout(() => {
                hasInitializedRef.current = true;
                handleFeeBasedPayment();
            }, 100);
        }
        else if (clearance_request) {
            console.log('🔄 Initializing with clearance request');
            
            if (processedClearanceIdsRef.current.has(clearance_request.id)) {
                hasInitializedRef.current = true;
                return;
            }
            
            hasInitializedRef.current = true;
            setPayerSource('clearance');
            
            if (handleClearanceRequestDirectlyRef.current) {
                handleClearanceRequestDirectlyRef.current(clearance_request, residents);
                processedClearanceIdsRef.current.add(clearance_request.id);
            }
            
            setSelectedPayer(clearance_request);
        }
        else if (pre_filled_data?.payer_id && pre_filled_data?.payer_type) {
            console.log('🔄 Initializing with pre-filled payer');
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
            console.log('🔄 No pre-filled data, normal initialization');
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

    // ========== FIXED: handleAddClearanceRequest - NOW HANDLES MULTIPLE CLEARANCES CORRECTLY ==========
    const handleAddClearanceRequest = useCallback((clearanceRequest: ClearanceRequest) => {
        console.log('📋 Adding clearance request to payment:', clearanceRequest);
        
        // Check if this clearance request is already added
        if (data.items?.some(item => 
            item.metadata?.clearance_request_id === clearanceRequest.id
        )) {
            alert('This clearance request is already added to the payment.');
            return;
        }
        
        // Get clearance type name from various sources
        const clearanceTypeName = 
            clearanceRequest.clearance_type?.name || 
            clearanceRequest.purpose || 
            'Barangay Clearance';
        
        // Create new payment item with ALL metadata fields
        const newItem: PaymentItem = {
            id: Date.now() + Math.random(), // Ensure truly unique ID
            fee_id: `clearance-${clearanceRequest.id}`,
            fee_name: clearanceTypeName,
            fee_code: clearanceRequest.reference_number || `CLR-${clearanceRequest.id}`,
            base_amount: parseFloat(String(clearanceRequest.fee_amount)),
            surcharge: 0,
            penalty: 0,
            discount: 0,
            total_amount: parseFloat(String(clearanceRequest.fee_amount)),
            category: 'clearance',
            period_covered: '',
            months_late: 0,
            metadata: {
                is_clearance_fee: true,
                clearance_request_id: clearanceRequest.id,
                clearance_type_id: clearanceRequest.clearance_type_id,
                clearance_type_code: clearanceRequest.clearance_type?.code,
                clearance_type_name: clearanceTypeName, // CRITICAL: This is what PaymentDetailsStep looks for
                reference_number: clearanceRequest.reference_number,
                purpose: clearanceRequest.purpose,
                specific_purpose: clearanceRequest.specific_purpose
            }
        };
        
        console.log('✅ Created clearance item with metadata:', newItem.metadata);
        
        // Update items - append to existing items
        const updatedItems = [...(data.items || []), newItem];
        
        // Calculate new totals
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        
        // Update form data - IMPORTANT: Don't override clearance_request_id if multiple clearances
        // We'll store the first one as the primary, but all will be in items
        const hasExistingClearance = data.items?.some(item => item.metadata?.is_clearance_fee);
        
        setData((prev: PaymentFormData) => {
            console.log('📝 Updating form data with new clearance item');
            
            // Determine what to set as primary clearance_request_id
            let primaryClearanceId = prev.clearance_request_id;
            let primaryClearanceTypeId = prev.clearance_type_id;
            let primaryClearanceCode = prev.clearance_code;
            
            // If this is the first clearance, set it as primary
            if (!hasExistingClearance) {
                primaryClearanceId = clearanceRequest.id;
                primaryClearanceTypeId = clearanceRequest.clearance_type_id;
                primaryClearanceCode = clearanceRequest.clearance_type?.code || '';
            }
            
            return {
                ...prev,
                items: updatedItems,
                subtotal: parseFloat(newSubtotal.toFixed(2)),
                total_amount: parseFloat(newTotal.toFixed(2)),
                clearance_request_id: primaryClearanceId, // Don't override if multiple
                clearance_type_id: primaryClearanceTypeId,
                clearance_code: primaryClearanceCode,
                // Update the purpose if not modified by user
                purpose: !userModifiedPurpose 
                    ? (updatedItems.length === 1 
                        ? (clearanceRequest.purpose || clearanceTypeName)
                        : `${updatedItems.length} items selected`)
                    : prev.purpose
            };
        });
        
        // Remove from available list
        setPayerClearanceRequests(prev => {
            console.log('📝 Removing clearance from available list, previous count:', prev.length);
            const filtered = prev.filter(cr => cr.id !== clearanceRequest.id);
            console.log('📝 New available clearance count:', filtered.length);
            return filtered;
        });
        
        // Force a re-render to update the UI
        setTimeout(() => {
            console.log('✅ Clearance request added - updated items count:', updatedItems.length);
            console.log('📊 Current payment items:', updatedItems.map(item => ({
                name: item.fee_name,
                isClearance: item.metadata?.is_clearance_fee,
                clearanceTypeName: item.metadata?.clearance_type_name,
                id: item.id
            })));
        }, 100);
        
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
        setPayerClearanceRequests([]);
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
        setFunctionCallCount(0);
        hasInitializedRef.current = false;
        feePaymentProcessedRef.current = false;
        processedClearanceIdsRef.current.clear();
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
                    onDiscountApplied={(discountedAmount) => {
                        console.log('💰 Discount applied with amount:', discountedAmount);
                        // Force update the amount paid field
                        setTimeout(() => {
                            const amountInput = document.querySelector('input[placeholder="0.00"], input.pl-8') as HTMLInputElement;
                            if (amountInput) {
                                amountInput.value = discountedAmount.toFixed(2);
                                amountInput.dispatchEvent(new Event('input', { bubbles: true }));
                                amountInput.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }, 100);
                    }}
                    setData={setData}
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
                            payerClearanceRequests={payerClearanceRequests}
                            onAddClearanceRequest={handleAddClearanceRequest}
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
                            userModifiedPurpose={userModifiedPurpose}
                            setUserModifiedPurpose={setUserModifiedPurpose}
                            generatePurpose={() => feeHandlers.generatePurposeFromItems(paymentItems)}
                            selectedResident={finalSelectedResident}
                            selectedHousehold={finalSelectedHousehold}
                            selectedBusiness={finalSelectedBusiness}
                            payerSource={payerSource}
                            feeTypes={feeTypes}
                        />
                    )}
                </form>
            </div>
        </AppLayout>
    );
}