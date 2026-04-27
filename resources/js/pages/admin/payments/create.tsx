// resources/js/pages/admin/Payments/Create.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Import child components
import { ProgressIndicator } from '@/components/admin/payment/ProgressIndicator';
import { PayerSelectionStepWrapper } from '@/components/admin/payment/PayerSelectionStepWrapper';
import { AddFeesStep } from '@/components/admin/payment/AddFeesStep';
import { PaymentDetailsStep } from '@/components/admin/payment/PaymentDetailsStep';

// Import local components
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
} from '@/types/admin/payments/payments';
import { 
    generateORNumber, 
    convertBackendFeeToOutstandingFee,
    getResidentDiscounts,
    checkIfDiscountAllowed,
    getDiscountPercentageForFeeType,
    formatCurrency,
    parseAmount
} from '@/components/admin/payment/paymentCreate/utils';
import { useFormSubmission } from '@/components/admin/payment/paymentCreate/hooks/useFormSubmission';
import { useFeeCalculations } from '@/components/admin/payment/paymentCreate/hooks/useFeeCalculations';

// ============================================
// SESSION STORAGE CACHE
// ============================================
const CACHE_KEY_PREFIX = 'payment_create_cache_';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

interface CacheData {
    timestamp: number;
    url: string;
    props: {
        residents: Resident[];
        households: Household[];
        businesses: Business[];
        clearance_requests: ClearanceRequest[];
        fees: OutstandingFee[];
        feeTypes: FeeType[];
        discountRules: DiscountRule[];
        clearanceTypes: Record<string, string>;
        clearanceTypesDetails: any[];
        pagination: any;
        payerClearanceRequests: ClearanceRequest[];
    };
    state: {
        step: number;
        payerSource: string;
        selectedPayer: any;
        payerOutstandingFees: OutstandingFee[];
        payerClearanceRequests: ClearanceRequest[];
        searchQuery: string;
        formData: PaymentFormData;
    };
}

function getCacheKey(): string {
    const url = window.location.pathname + window.location.search;
    return CACHE_KEY_PREFIX + btoa(url).replace(/[+/=]/g, '');
}

function saveToCache(props: any, state: any): void {
    try {
        const cacheData: CacheData = {
            timestamp: Date.now(),
            url: window.location.pathname + window.location.search,
            props: {
                residents: props.residents || [],
                households: props.households || [],
                businesses: props.businesses || [],
                clearance_requests: props.clearance_requests || [],
                fees: props.fees || [],
                feeTypes: props.feeTypes || [],
                discountRules: props.discountRules || [],
                clearanceTypes: props.clearanceTypes || {},
                clearanceTypesDetails: props.clearanceTypesDetails || [],
                pagination: props.pagination || null,
                payerClearanceRequests: props.payerClearanceRequests || [],
            },
            state: {
                step: state.step || 1,
                payerSource: state.payerSource || 'residents',
                selectedPayer: state.selectedPayer || null,
                payerOutstandingFees: state.payerOutstandingFees || [],
                payerClearanceRequests: state.payerClearanceRequests || [],
                searchQuery: state.searchQuery || '',
                formData: state.formData || null,
            }
        };
        
        sessionStorage.setItem(getCacheKey(), JSON.stringify(cacheData));
    } catch (e) {
        // Storage quota exceeded or unavailable - non-critical
    }
}

function loadFromCache(): CacheData | null {
    try {
        const cached = sessionStorage.getItem(getCacheKey());
        if (!cached) {
            return null;
        }
        
        const data: CacheData = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        
        if (age > CACHE_EXPIRY) {
            sessionStorage.removeItem(getCacheKey());
            return null;
        }
        
        // Verify URL matches (prevents cache collision between different query params)
        if (data.url !== window.location.pathname + window.location.search) {
            sessionStorage.removeItem(getCacheKey());
            return null;
        }
        
        return data;
    } catch (e) {
        sessionStorage.removeItem(getCacheKey());
        return null;
    }
}

function clearCache(): void {
    sessionStorage.removeItem(getCacheKey());
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getPhotoUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http') || photoPath.startsWith('/storage')) {
        return photoPath;
    }
    return `/storage/${photoPath}`;
};

const getInitialPayerSource = (pre_filled_data: any): 'residents' | 'households' | 'businesses' | 'clearance' | 'fees' => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasFeeId = urlParams.has('fee_id') || !!pre_filled_data?.fee_id;
    const hasClearanceId = urlParams.has('clearance_request_id') || !!pre_filled_data?.clearance_request_id;
    
    if (hasFeeId) return 'fees';
    if (hasClearanceId) return 'clearance';
    if (pre_filled_data?.payer_type === 'business') return 'businesses';
    
    return 'residents';
};

const createInitialFormData = (pre_filled_data: any, clearance_request: any): PaymentFormData => ({
    payer_type: pre_filled_data?.payer_type || '',
    payer_id: pre_filled_data?.payer_id || '',
    payer_name: pre_filled_data?.payer_name || '',
    contact_number: pre_filled_data?.contact_number || '',
    address: pre_filled_data?.address || '',
    household_number: pre_filled_data?.household_number || '',
    purok: pre_filled_data?.purok || '',
    photo_path: null,
    photo_url: null,
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
    amount_paid: 0,
    purpose: pre_filled_data?.clearance_request_id ? (clearance_request?.purpose || 'Clearance Fee') : '',
    remarks: '',
    is_cleared: false,
    clearance_type: pre_filled_data?.clearance_type || '',
    clearance_type_id: pre_filled_data?.clearance_type_id || '',
    clearance_code: pre_filled_data?.clearance_code || '',
    validity_date: '',
    collection_type: 'manual',
    clearance_request_id: pre_filled_data?.clearance_request_id || undefined,
});

// Helper to detect if fees array items are already OutstandingFee format
function isOutstandingFeeArray(fees: any[]): boolean {
    if (!fees || fees.length === 0) return true;
    const firstFee = fees[0];
    // OutstandingFee has 'fee_name' and 'balance' but BackendFee has 'amount'
    return 'fee_name' in firstFee && 'balance' in firstFee;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CreatePayment() {
    // ========== CACHE MANAGEMENT ==========
    const cachedDataRef = useRef<CacheData | null>(null);
    
    // Try to load cache before accessing page props
    const loadCachedData = useCallback((): boolean => {
        const navigationEntries = performance?.getEntriesByType?.('navigation') as PerformanceNavigationTiming[] | undefined;
        const navigationType = navigationEntries?.[0]?.type;
        
        // Only use cache for back-forward navigation to avoid stale data on normal navigation
        if (navigationType === 'back_forward') {
            const cache = loadFromCache();
            if (cache) {
                cachedDataRef.current = cache;
                return true;
            }
        }
        
        return false;
    }, []);
    
    // Determine props source
    const rawPageProps = usePage<PageProps>().props;
    const hasCache = loadCachedData();
    
    const props = useMemo(() => {
        if (hasCache && cachedDataRef.current) {
            return {
                ...rawPageProps,
                ...cachedDataRef.current.props,
            };
        }
        return rawPageProps;
    }, [rawPageProps, hasCache]);
    
    const { 
        residents = [], 
        households = [], 
        businesses = [],
        fees = [],
        feeTypes = [],
        discountRules = [],
        discountTypes = {}, 
        discountCodeToIdMap = {},
        pre_filled_data = null, 
        clearance_request = null, 
        clearanceTypes = {},
        clearanceTypesDetails = [],
        clearance_requests = [],
        selected_fee_details = null,
        selected_fee_type_id = null,
        payerClearanceRequests: serverPayerClearanceRequests = [],
        pagination = null,
    } = props;
    
    // ========== STATE DECLARATIONS ==========
    const [step, setStep] = useState<number>(() => cachedDataRef.current?.state?.step ?? 1);
    
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | Business | ClearanceRequest | BackendFee | OutstandingFee | null>(() => {
        return cachedDataRef.current?.state?.selectedPayer ?? null;
    });
    
    const [payerClearanceRequests, setPayerClearanceRequests] = useState<ClearanceRequest[]>(() => {
        return cachedDataRef.current?.state?.payerClearanceRequests ?? serverPayerClearanceRequests ?? [];
    });
    
    const [payerSource, setPayerSource] = useState<'residents' | 'households' | 'businesses' | 'clearance' | 'fees'>(() => {
        if (cachedDataRef.current?.state?.payerSource) {
            return cachedDataRef.current.state.payerSource as any;
        }
        return getInitialPayerSource(pre_filled_data);
    });
    
    const [searchQuery, setSearchQuery] = useState<string>(() => {
        return cachedDataRef.current?.state?.searchQuery ?? '';
    });
    
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
    
    const [payerOutstandingFees, setPayerOutstandingFees] = useState<OutstandingFee[]>(() => {
        return cachedDataRef.current?.state?.payerOutstandingFees ?? [];
    });
    
    const [isLoadingClearances, setIsLoadingClearances] = useState<boolean>(false);
    
    // ========== REFS ==========
    const hasInitializedRef = useRef(false);
    const feePaymentProcessedRef = useRef(false);
    const processedClearanceIdsRef = useRef<Set<number>>(new Set());
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    
    // Refs for beforeunload handler (prevents stale closures)
    const stateRef = useRef({
        step, payerSource, selectedPayer, payerOutstandingFees,
        payerClearanceRequests, searchQuery, data: null as PaymentFormData | null
    });
    const propsRef = useRef(props);
    
    // Keep refs synchronized
    useEffect(() => { 
        stateRef.current = { 
            step, payerSource, selectedPayer, payerOutstandingFees, 
            payerClearanceRequests, searchQuery, data: stateRef.current.data 
        }; 
    }, [step, payerSource, selectedPayer, payerOutstandingFees, payerClearanceRequests, searchQuery]);
    
    useEffect(() => { 
        propsRef.current = props; 
    });
    
    // ========== INITIAL FORM DATA ==========
    const initialFormData = useMemo(() => {
        if (cachedDataRef.current?.state?.formData) {
            return cachedDataRef.current.state.formData;
        }
        return createInitialFormData(pre_filled_data, clearance_request);
    }, [pre_filled_data, clearance_request]);
    
    // ========== HOOKS ==========
    const { data, setData, submit, processing, submissionErrors } = useFormSubmission(initialFormData, false, resetForm);

    // ========== SYNCHRONIZE DATA TO REF ==========
    useEffect(() => {
        stateRef.current = { ...stateRef.current, data };
    }, [data]);
    
    // ========== COMPUTED VALUES ==========
    const selectedResidentFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        if (data.payer_type === 'resident' && residents?.length) {
            return residents.find((r: Resident) => r.id == data.payer_id) || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, residents]);

    const selectedHouseholdFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        if (data.payer_type === 'household' && households?.length) {
            return households.find((h: Household) => h.id == data.payer_id) || null;
        }
        return null;
    }, [data.payer_type, data.payer_id, households]);

    const selectedBusinessFromData = useMemo(() => {
        if (!data.payer_type || !data.payer_id) return null;
        if (data.payer_type === 'business' && businesses?.length) {
            return businesses.find((b: Business) => b.id == data.payer_id) || null;
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
        if (isSelectedPayerResident && selectedPayer) return selectedPayer as Resident;
        if (data.payer_type === 'resident' && data.payer_id && residents?.length) {
            return residents.find((r: Resident) => r.id == data.payer_id) || null;
        }
        return null;
    }, [selectedResidentFromData, isSelectedPayerResident, selectedPayer, data.payer_type, data.payer_id, residents]);

    const finalSelectedHousehold = useMemo(() => {
        if (selectedHouseholdFromData) return selectedHouseholdFromData;
        if (isSelectedPayerHousehold && selectedPayer) return selectedPayer as Household;
        if (data.payer_type === 'household' && data.payer_id && households?.length) {
            return households.find((h: Household) => h.id == data.payer_id) || null;
        }
        return null;
    }, [selectedHouseholdFromData, isSelectedPayerHousehold, selectedPayer, data.payer_type, data.payer_id, households]);

    const finalSelectedBusiness = useMemo(() => {
        if (selectedBusinessFromData) return selectedBusinessFromData;
        if (isSelectedPayerBusiness && selectedPayer) return selectedPayer as Business;
        if (data.payer_type === 'business' && data.payer_id && businesses?.length) {
            return businesses.find((b: Business) => b.id == data.payer_id) || null;
        }
        return null;
    }, [selectedBusinessFromData, isSelectedPayerBusiness, selectedPayer, data.payer_type, data.payer_id, businesses]);

    const currentPayerId = useMemo(() => {
        if (data.payer_id) return data.payer_id;
        if (finalSelectedResident) return finalSelectedResident.id;
        if (finalSelectedHousehold) return finalSelectedHousehold.id;
        if (finalSelectedBusiness) return finalSelectedBusiness.id;
        return null;
    }, [data.payer_id, finalSelectedResident, finalSelectedHousehold, finalSelectedBusiness]);

    const currentPayerType = useMemo(() => {
        if (data.payer_type) return data.payer_type;
        if (finalSelectedResident) return 'resident';
        if (finalSelectedHousehold) return 'household';
        if (finalSelectedBusiness) return 'business';
        return '';
    }, [data.payer_type, finalSelectedResident, finalSelectedHousehold, finalSelectedBusiness]);

    // ========== MEMOIZED VALUES ==========
    const convertFee = useCallback((fee: BackendFee): OutstandingFee => {
        return convertBackendFeeToOutstandingFee(fee, feeTypes);
    }, [feeTypes]);

    const outstandingFeesForTab: OutstandingFee[] = useMemo(() => {
        if (!fees?.length) return [];
        // Check if fees are already in OutstandingFee format (from cache)
        if (isOutstandingFeeArray(fees)) {
            return fees as unknown as OutstandingFee[];
        }
        // Convert from BackendFee format
        return (fees as BackendFee[]).map(fee => convertFee(fee));
    }, [fees, convertFee]);

    const { updateItems, clearItems, applyDiscount, removeDiscount } = useFeeCalculations({
        setData,
        data,
        discountRules: discountRules || []
    });

    const paymentItems = useMemo(() => data.items || [], [data.items]);

    const isClearancePayment = useMemo(() => {
        if (pre_filled_data?.fee_id) return false;
        if (payerSource === 'fees') return false;
        if (!!data.clearance_request_id || !!pre_filled_data?.clearance_request_id) return true;
        if (payerSource === 'clearance') return true;
        if (clearance_request) return true;
        if (paymentItems.some((item: PaymentItem) => item.metadata?.is_clearance_fee === true || item.metadata?.clearance_request_id)) return true;
        return false;
    }, [pre_filled_data, payerSource, data.clearance_request_id, clearance_request, paymentItems]);
    
    // ========== BEFOREUNLOAD HANDLER (single attachment, refs for current state) ==========
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (hasInitializedRef.current) {
                saveToCache(propsRef.current, stateRef.current);
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (hasInitializedRef.current) {
                saveToCache(propsRef.current, stateRef.current);
            }
        };
    }, []);
    
    // ========== HELPER: Get expected payer types ==========
    const getExpectedTypes = useCallback((payerType: string): string[] => {
        if (payerType === 'resident') return ['App\\Models\\Resident', 'App\Models\Resident', 'resident'];
        if (payerType === 'household') return ['App\\Models\\Household', 'App\Models\Household', 'household'];
        if (payerType === 'business') return ['App\\Models\\Business', 'App\Models\Business', 'business'];
        return [];
    }, []);
    
    // ========== CLEANUP FUNCTION ==========
    const cleanup = useCallback(() => {
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // ========== FETCH CLEARANCE REQUESTS ==========
    const fetchClearanceRequestsForPayer = useCallback(async (payerType: string, payerId: string | number) => {
        if (!payerId || !payerType) return;
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        
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
            
            let matchingClearances: ClearanceRequest[] = [];
            
            if (normalizedPayerType === 'resident') {
                matchingClearances = clearance_requests.filter((cr: ClearanceRequest) => {
                    const matchesPayer = cr.payer_type === 'resident' && cr.payer_id == payerId;
                    const matchesResidentId = cr.resident_id == payerId;
                    const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                    const hasValidAmount = parseAmount(cr.fee_amount) > 0;
                    
                    return (matchesPayer || matchesResidentId) && isPayable && hasValidAmount;
                });
            } else if (normalizedPayerType === 'household') {
                const household = households.find((h: Household) => h.id == payerId);
                
                if (household?.members) {
                    const residentIds = household.members
                        .map((m: any) => m.resident_id)
                        .filter(Boolean);
                    
                    if (residentIds.length > 0) {
                        matchingClearances = clearance_requests.filter((cr: ClearanceRequest) => {
                            const matchesPayer = cr.payer_type === 'resident' && residentIds.some(id => id == cr.payer_id);
                            const matchesResidentId = residentIds.some(id => id == cr.resident_id);
                            const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                            const hasValidAmount = parseAmount(cr.fee_amount) > 0;
                            
                            return (matchesPayer || matchesResidentId) && isPayable && hasValidAmount;
                        });
                    }
                }
            } else if (normalizedPayerType === 'business') {
                const businessMatches = clearance_requests.filter((cr: ClearanceRequest) => {
                    const matchesPayer = cr.payer_type === 'business' && cr.payer_id == payerId;
                    const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                    const hasValidAmount = parseAmount(cr.fee_amount) > 0;
                    
                    return matchesPayer && isPayable && hasValidAmount;
                });
                
                if (businessMatches.length > 0) {
                    matchingClearances = businessMatches;
                } else {
                    const business = businesses.find((b: Business) => b.id == payerId);
                    
                    if (business?.owner_id) {
                        matchingClearances = clearance_requests.filter((cr: ClearanceRequest) => {
                            const matchesPayer = cr.payer_type === 'resident' && cr.payer_id == business.owner_id;
                            const matchesResidentId = cr.resident_id == business.owner_id;
                            const isPayable = cr.can_be_paid !== false && !cr.already_paid;
                            const hasValidAmount = parseAmount(cr.fee_amount) > 0;
                            
                            return (matchesPayer || matchesResidentId) && isPayable && hasValidAmount;
                        });
                    }
                }
            }
            
            if (abortController.signal.aborted) return;
            
            setPayerClearanceRequests(matchingClearances);
            
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return;
            setPayerClearanceRequests([]);
        } finally {
            if (abortController === abortControllerRef.current) {
                setIsLoadingClearances(false);
                abortControllerRef.current = null;
            }
        }
    }, [clearance_requests, households, businesses]);

      // ========== HANDLE PAYER SELECTION ==========
    const handlePayerSelected = useCallback((payer: Resident | Household | Business, type: string) => {
        const targetId = payer.id;
        
        let photoPath: string | null = null;
        let photoUrl: string | null = null;
        
        if (type === 'resident') {
            const resident = payer as Resident;
            photoPath = resident.photo_path || null;
            photoUrl = getPhotoUrl(resident.photo_path);
        }
        
        const updates = {
            payer_type: type === 'resident' ? 'resident' : type === 'household' ? 'household' : 'business',
            payer_id: targetId,
            payer_name: type === 'business' 
                ? (payer as Business).business_name 
                : type === 'household'
                    ? `Household ${(payer as Household).household_number}`
                    : (payer as Resident).name,
            contact_number: payer.contact_number || '',
            address: payer.address || '',
            household_number: type === 'household' 
                ? (payer as Household).household_number 
                : ((payer as any).household_number || ''),
            purok: payer.purok || '',
            photo_path: photoPath,
            photo_url: photoUrl,
            items: [],
            subtotal: 0,
            total_amount: 0,
            clearance_request_id: undefined,
            clearance_type: '',
            clearance_type_id: '',
            clearance_code: '',
            is_cleared: false,
        };
        
        setData((prev: any) => ({ ...prev, ...updates }));
        setSelectedPayer(payer);
        
        let feesList: OutstandingFee[] = [];
        
        // FIRST: Try to use fees attached to the payer object
        const payerFees = (payer as any).outstanding_fees;
        if (payerFees && Array.isArray(payerFees) && payerFees.length > 0) {
            feesList = payerFees
                .filter((fee: any) => {
                    const balance = parseAmount(fee.balance);
                    const status = fee.status || '';
                    return status !== 'paid' && balance > 0;
                })
                .map((fee: any) => {
                    const getVal = (key: string, defaultVal: any = '') => {
                        if (typeof fee[key] === 'function') return fee[key]();
                        return fee[key] !== undefined && fee[key] !== null ? fee[key] : defaultVal;
                    };
                    
                    return {
                        id: getVal('id'),
                        fee_id: getVal('id'),
                        fee_code: getVal('fee_code', ''),
                        fee_name: getVal('fee_name', getVal('fee_type_name', getVal('payer_name', 'Fee'))),
                        payer_type: getVal('payer_type', 'resident'),
                        payer_id: getVal('payer_id', targetId),
                        payer_name: getVal('payer_name', (payer as Resident).name || ''),
                        balance: parseAmount(getVal('balance', 0)),
                        total_amount: parseAmount(getVal('total_amount', getVal('base_amount', 0))),
                        base_amount: parseAmount(getVal('base_amount', 0)),
                        surcharge_amount: parseAmount(getVal('surcharge_amount', 0)),
                        penalty_amount: parseAmount(getVal('penalty_amount', 0)),
                        discount_amount: parseAmount(getVal('discount_amount', 0)),
                        amount_paid: parseAmount(getVal('amount_paid', 0)),
                        status: getVal('status', 'pending'),
                        category: getVal('fee_type_category', getVal('category', 'fee')),
                        period_covered: getVal('period_covered', getVal('billing_period', '')),
                        due_date: getVal('due_date', ''),
                        issue_date: getVal('issue_date', ''),
                        contact_number: getVal('contact_number', ''),
                        address: getVal('address', ''),
                        purok: getVal('purok', ''),
                        fee_type_id: getVal('fee_type_id', ''),
                        business_name: getVal('business_name', null),
                        purpose: getVal('purpose', null),
                        applicableDiscounts: [],
                        canApplyDiscount: false,
                        fee_type: getVal('fee_type', null),
                        resident_id: getVal('resident_id', null),
                        household_id: getVal('household_id', null),
                        business_id: getVal('business_id', null),
                        months_late: getVal('months_late', 0),
                        is_overdue: getVal('is_overdue', false),
                        penalty_rate: getVal('penalty_rate', 0),
                    } as unknown as OutstandingFee;  // ← THIS IS THE ONLY CHANGE
                });
        }
        
        // FALLBACK: Filter from global fees list
        if (feesList.length === 0) {
            feesList = outstandingFeesForTab.filter(f => {
                const payerIdMatches = String(f.payer_id) === String(targetId);
                const isNotPaid = f.status !== 'paid';
                const hasBalance = parseAmount(f.balance) > 0;
                return payerIdMatches && isNotPaid && hasBalance;
            });
        }
        
        setPayerOutstandingFees(feesList);
        fetchClearanceRequestsForPayer(type, targetId);
        setStep(2);
    }, [setData, outstandingFeesForTab, fetchClearanceRequestsForPayer]);

    // ========== HANDLE ADD CLEARANCE REQUEST ==========
    const handleAddClearanceRequest = useCallback((clearanceRequest: ClearanceRequest) => {
        const isAlreadyAdded = data.items?.some(
            (item: PaymentItem) => item.metadata?.clearance_request_id === clearanceRequest.id
        );
        
        if (isAlreadyAdded) {
            alert('This clearance request is already added to the payment.');
            return;
        }
        
        const clearanceTypeName = clearanceRequest.clearance_type?.name || clearanceRequest.purpose || 'Barangay Clearance';
        const feeAmount = parseAmount(clearanceRequest.fee_amount);
        
        const newItem: PaymentItem = {
            id: Date.now() + Math.random(),
            fee_id: `clearance-${clearanceRequest.id}`,
            fee_name: clearanceTypeName,
            fee_code: clearanceRequest.reference_number || `CLR-${clearanceRequest.id}`,
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
                clearance_request_id: clearanceRequest.id,
                clearance_type_id: clearanceRequest.clearance_type_id,
                clearance_type_code: clearanceRequest.clearance_type?.code,
                clearance_type_name: clearanceTypeName,
                reference_number: clearanceRequest.reference_number,
                purpose: clearanceRequest.purpose,
                specific_purpose: clearanceRequest.specific_purpose
            }
        };
        
        const updatedItems = [...(data.items || []), newItem];
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        
        const hasExistingClearance = data.items?.some((item: PaymentItem) => item.metadata?.is_clearance_fee);
        
        setData((prev: PaymentFormData) => {
            let primaryClearanceId = prev.clearance_request_id;
            let primaryClearanceTypeId = prev.clearance_type_id;
            let primaryClearanceCode = prev.clearance_code;
            
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
                clearance_request_id: primaryClearanceId,
                clearance_type_id: primaryClearanceTypeId,
                clearance_code: primaryClearanceCode,
                purpose: !userModifiedPurpose 
                    ? (updatedItems.length === 1 
                        ? (clearanceRequest.purpose || clearanceTypeName)
                        : `${updatedItems.length} items selected`)
                    : prev.purpose
            };
        });
        
        setPayerClearanceRequests(prev => prev.filter(cr => cr.id !== clearanceRequest.id));
        
    }, [data.items, setData, userModifiedPurpose]);

    // ========== DISCOUNT HANDLERS ==========
    const handleDiscountCodeChange = useCallback((code: string) => {
        if (code === 'no_discount' || !code) {
            removeDiscount();
            setSelectedDiscountCode('');
            setPendingDiscountCode('');
            return;
        }
        
        const selectedRule = discountRules?.find(r => r.code === code);
        
        if (!selectedRule) {
            alert(`Discount rule "${code}" not found. Please refresh the page.`);
            return;
        }
        
        const totalBaseAmount = data.subtotal + data.surcharge + data.penalty;
        const minPurchase = selectedRule.minimum_purchase_amount || 0;
        
        if (minPurchase > 0 && totalBaseAmount < minPurchase) {
            alert(`This discount requires a minimum purchase of ${formatCurrency(minPurchase)}`);
            return;
        }
        
        if (selectedRule.requires_verification) {
            if (!currentPayerId) {
                alert('Please select a payer first before applying this discount.');
                return;
            }
            
            setPendingDiscountCode(code);
            setVerificationIdNumber('');
            setVerificationRemarks('');
            setShowVerificationModal(true);
            return;
        }
        
        applyDiscount(code);
        setSelectedDiscountCode(code);
    }, [discountRules, data.subtotal, data.surcharge, data.penalty, currentPayerId, applyDiscount, removeDiscount]);

    const handleVerificationSubmit = useCallback((verificationData: {
        idNumber: string;
        remarks: string;
        isValid: boolean;
        privilegeId?: number;
        privilegeData?: any;
        discountTypeId?: number;
        discountTypeCode?: string;
        discountPercentage?: number;
    }) => {
        if (!verificationData.isValid) {
            alert('Invalid verification. Please try again.');
            return;
        }
        
        applyDiscount(pendingDiscountCode);
        setSelectedDiscountCode(pendingDiscountCode);
        
        setData((prev: PaymentFormData) => ({
            ...prev,
            verification_id_number: verificationData.idNumber,
            verification_remarks: verificationData.remarks,
            verified_privilege_id: verificationData.privilegeId,
            verified_discount_type_id: verificationData.discountTypeId,
            verified_percentage: verificationData.discountPercentage,
        }));
        
        setShowVerificationModal(false);
        setPendingDiscountCode('');
        setVerificationIdNumber('');
        setVerificationRemarks('');
    }, [pendingDiscountCode, applyDiscount, setData]);

    // ========== HANDLE OUTSTANDING FEE DIRECTLY ==========
    const handleOutstandingFeeDirectly = useCallback((fee: OutstandingFee) => {
        const balance = parseAmount(fee.balance);
        
        const newItem: PaymentItem = {
            id: Date.now(),
            fee_id: String(fee.id),
            fee_name: fee.fee_name,
            fee_code: fee.fee_code || '',
            base_amount: balance,
            surcharge: 0,
            penalty: 0,
            discount: 0,
            total_amount: balance,
            category: fee.category || 'fee',
            period_covered: fee.period_covered || '',
            months_late: fee.months_late || 0,
        };
        
        const updatedItems = [...(data.items || []), newItem];
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
        
        setData((prev: PaymentFormData) => ({
            ...prev,
            items: updatedItems,
            subtotal: parseFloat(newSubtotal.toFixed(2)),
            total_amount: parseFloat(newTotal.toFixed(2)),
        }));
    }, [data.items, setData]);

    // ========== INITIALIZATION EFFECT ==========
    useEffect(() => {
        if (cachedDataRef.current && cachedDataRef.current.state.step > 1 && cachedDataRef.current.state.selectedPayer) {
            hasInitializedRef.current = true;
            return;
        }
        
        if (hasInitializedRef.current) return;
        
        const initializePayment = () => {
            hasInitializedRef.current = true;
            
            // Case 1: Direct fee payment
            if (pre_filled_data?.fee_id && !feePaymentProcessedRef.current) {
                feePaymentProcessedRef.current = true;
                
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
                
                const feeToPay: OutstandingFee | undefined = outstandingFeesForTab.find(
                    fee => fee.id == pre_filled_data.fee_id
                );
                
                if (feeToPay) {
                    const payerType = feeToPay.payer_type;
                    const payerId = feeToPay.payer_id;
                    
                    if (payerType?.includes('Resident') && payerId) {
                        const resident = residents.find(r => r.id == payerId);
                        if (resident) {
                            handlePayerSelected(resident, 'resident');
                            handleOutstandingFeeDirectly(feeToPay);
                        } else {
                            handleOutstandingFeeDirectly(feeToPay);
                        }
                    } else if (payerType?.includes('Household') && payerId) {
                        const household = households.find(h => h.id == payerId);
                        if (household) {
                            handlePayerSelected(household, 'household');
                            handleOutstandingFeeDirectly(feeToPay);
                        } else {
                            handleOutstandingFeeDirectly(feeToPay);
                        }
                    } else if (payerType?.includes('Business') && payerId) {
                        const business = businesses.find(b => b.id == payerId);
                        if (business) {
                            handlePayerSelected(business, 'business');
                            handleOutstandingFeeDirectly(feeToPay);
                        } else {
                            handleOutstandingFeeDirectly(feeToPay);
                        }
                    } else {
                        handleOutstandingFeeDirectly(feeToPay);
                    }
                    
                    if (pre_filled_data?.payer_type && pre_filled_data?.payer_id) {
                        const expectedTypes = getExpectedTypes(pre_filled_data.payer_type);
                        const payerFees = outstandingFeesForTab.filter(f => {
                            const payerIdMatches = f.payer_id == pre_filled_data.payer_id;
                            const payerTypeMatches = expectedTypes.some(pt => f.payer_type === pt);
                            const hasBalance = parseAmount(f.balance) > 0;
                            const isNotPaid = f.status !== 'paid';
                            return payerIdMatches && payerTypeMatches && isNotPaid && hasBalance;
                        });
                        setPayerOutstandingFees(payerFees);
                        fetchClearanceRequestsForPayer(pre_filled_data.payer_type, pre_filled_data.payer_id);
                    }
                }
                
                setStep(2);
                setIsProcessingFee(false);
                return;
            }
            
            // Case 2: Clearance request payment
            if (clearance_request) {
                if (processedClearanceIdsRef.current.has(clearance_request.id)) {
                    return;
                }
                
                setPayerSource('clearance');
                setSelectedPayer(clearance_request);
                
                const mockPayer: Resident = {
                    id: clearance_request.resident_id,
                    name: clearance_request.resident?.name || 'Unknown',
                    contact_number: clearance_request.resident?.contact_number || '',
                    address: clearance_request.resident?.address || '',
                    purok: clearance_request.resident?.purok || '',
                    household_number: clearance_request.resident?.household_number || '',
                    photo_path: clearance_request.resident?.photo_path || null,
                    is_senior: false,
                    is_pwd: false,
                } as Resident;
                
                handlePayerSelected(mockPayer, 'resident');
                processedClearanceIdsRef.current.add(clearance_request.id);
                return;
            }
            
            // Case 3: Pre-filled payer
            if (pre_filled_data?.payer_id && pre_filled_data?.payer_type) {
                const { payer_type, payer_id } = pre_filled_data;
                
                if (payer_type === 'resident') {
                    const payer = residents.find(r => r.id == payer_id);
                    if (payer) {
                        setSelectedPayer(payer);
                        handlePayerSelected(payer, 'resident');
                        setPayerSource('residents');
                    }
                } else if (payer_type === 'household') {
                    const payer = households.find(h => h.id == payer_id);
                    if (payer) {
                        setSelectedPayer(payer);
                        handlePayerSelected(payer, 'household');
                        setPayerSource('households');
                    }
                } else if (payer_type === 'business') {
                    const payer = businesses.find(b => b.id == payer_id);
                    if (payer) {
                        setSelectedPayer(payer);
                        handlePayerSelected(payer, 'business');
                        setPayerSource('businesses');
                    }
                }
                
                setStep(2);
                return;
            }
        };
        
        initializePayment();
    }, []);

    // ========== SESSION STORAGE HANDLING FOR CLEARANCE PAYMENTS ==========
    useEffect(() => {
        const pendingClearancePayment = sessionStorage.getItem('pending_clearance_payment');
        
        if (pendingClearancePayment && !clearance_request) {
            try {
                const clearanceData = JSON.parse(pendingClearancePayment);
                
                if (processedClearanceIdsRef.current.has(clearanceData.clearance_request_id)) {
                    sessionStorage.removeItem('pending_clearance_payment');
                    return;
                }
                
                if (!clearanceData.resident_id || !clearanceData.clearance_request_id) {
                    sessionStorage.removeItem('pending_clearance_payment');
                    return;
                }
                
                const mockClearanceRequest: ClearanceRequest = {
                    id: clearanceData.clearance_request_id,
                    resident_id: clearanceData.resident_id,
                    clearance_type_id: clearanceData.clearance_type_id,
                    reference_number: clearanceData.reference || `CLR-${clearanceData.clearance_request_id}`,
                    purpose: clearanceData.purpose || 'Clearance Fee',
                    specific_purpose: clearanceData.specific_purpose || '',
                    fee_amount: clearanceData.amount || '0',
                    status: 'pending_payment',
                    can_be_paid: true,
                    already_paid: false,
                    clearance_type: {
                        id: clearanceData.clearance_type_id,
                        name: clearanceData.clearance_type_name || 'Clearance Fee',
                        code: clearanceData.clearance_type_code || 'BRGY_CLEARANCE',
                        fee: clearanceData.amount,
                        formatted_fee: formatCurrency(parseAmount(clearanceData.amount)),
                        validity_days: 30,
                        processing_days: 3,
                        description: '',
                        requires_payment: true,
                        requires_approval: false,
                        is_online_only: false,
                        is_discountable: true,
                    },
                    resident: {
                        id: clearanceData.resident_id,
                        name: clearanceData.resident_name || 'Unknown Resident',
                        contact_number: '',
                        address: '',
                        purok: '',
                        household_number: '',
                        photo_path: clearanceData.resident_photo_path || null,
                        photo_url: undefined,
                    },
                };

                const mockPayer: Resident = {
                    id: mockClearanceRequest.resident_id,
                    name: mockClearanceRequest.resident?.name || 'Unknown Resident',
                    contact_number: mockClearanceRequest.resident?.contact_number || '',
                    address: mockClearanceRequest.resident?.address || '',
                    purok: mockClearanceRequest.resident?.purok || '',
                    household_number: mockClearanceRequest.resident?.household_number || '',
                    photo_path: mockClearanceRequest.resident?.photo_path || null,
                    is_senior: false,
                    is_pwd: false,
                } as Resident;
                
                handlePayerSelected(mockPayer, 'resident');
                setPayerSource('clearance');
                processedClearanceIdsRef.current.add(clearanceData.clearance_request_id);
                sessionStorage.removeItem('pending_clearance_payment');
                
            } catch (error) {
                sessionStorage.removeItem('pending_clearance_payment');
            }
        }
        
        return () => {
            processedClearanceIdsRef.current.clear();
        };
    }, []);

    // ========== CLEANUP ON UNMOUNT ==========
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    // ========== HANDLER FUNCTIONS ==========
    const handleStepClick = useCallback((stepNumber: number) => {
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
    }, [data.payer_id, data.payer_name, paymentItems.length]);

    const handleSelectPayer = useCallback((payer: any, type: string) => {
        handlePayerSelected(payer, type);
    }, [handlePayerSelected]);

    const handleAddOutstandingFeeWithLateSettings = useCallback((): void => {
        if (!selectedOutstandingFee) return;
        
        handleOutstandingFeeDirectly(selectedOutstandingFee);
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
    }, [selectedOutstandingFee, handleOutstandingFeeDirectly]);

    const handleCancelLateSettings = useCallback((): void => {
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
    }, []);

    const handlePurposeChange = useCallback((value: string): void => {
        setData('purpose', value);
        if (value !== generatePurposeFromItems(paymentItems)) {
            setUserModifiedPurpose(true);
        }
    }, [setData, paymentItems]);

    const generatePurposeFromItems = useCallback((items: PaymentItem[]): string => {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0].fee_name;
        return `${items.length} items selected`;
    }, []);

    const handlePeriodCoveredChange = useCallback((value: string): void => {
        setData('period_covered', value);
        
        if (!userModifiedPurpose && paymentItems.length > 0) {
            const newPurpose = generatePurposeFromItems(paymentItems);
            setData('purpose', newPurpose);
        }
    }, [setData, userModifiedPurpose, paymentItems, generatePurposeFromItems]);

    const handleClearanceTypeChange = useCallback((value: string): void => {
        const clearanceTypeDetail = clearanceTypesDetails.find(
            (type: any) => type.code === value
        );
        
        if (clearanceTypeDetail) {
            setData((prev: PaymentFormData) => {
                const updatedData = {
                    ...prev,
                    clearance_type: clearanceTypeDetail.code,
                    clearance_type_id: clearanceTypeDetail.id,
                    clearance_code: clearanceTypeDetail.code,
                };
                
                if (!userModifiedPurpose) {
                    updatedData.purpose = clearanceTypes[value] || value;
                }
                
                return updatedData;
            });
            
            const updatedItems = paymentItems.map((item: PaymentItem) => {
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
            
            if (updatedItems.some((item: PaymentItem) => item.metadata?.is_clearance_fee === true)) {
                updateItems(updatedItems);
            }
        } else {
            setData((prev: PaymentFormData) => {
                const updatedData = {
                    ...prev,
                    clearance_type: value,
                    clearance_type_id: '',
                    clearance_code: value,
                };
                
                if (!userModifiedPurpose && value) {
                    updatedData.purpose = clearanceTypes[value] || value;
                }
                
                return updatedData;
            });
        }
    }, [clearanceTypesDetails, clearanceTypes, userModifiedPurpose, paymentItems, updateItems, setData]);

    const getClearanceTypeName = useCallback((code: string): string => {
        if (!code) return '';
        return clearanceTypes[code] || code;
    }, [clearanceTypes]);

    // ========== RESET FORM ==========
    function resetForm() {
        cleanup();
        clearCache();
        
        setData((prev: PaymentFormData) => ({
            ...prev,
            payer_type: '',
            payer_id: '',
            payer_name: '',
            contact_number: '',
            address: '',
            household_number: '',
            purok: '',
            photo_path: null,
            photo_url: null,
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
        }));
        
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
        hasInitializedRef.current = false;
        feePaymentProcessedRef.current = false;
        processedClearanceIdsRef.current.clear();
    }
    
    // ========== HANDLE REFRESH DATA ==========
    const handleRefreshData = useCallback(() => {
        clearCache();
        hasInitializedRef.current = false;
        window.location.reload();
    }, []);
    
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
                <div className="flex justify-end">
                    <button 
                        type="button"
                        onClick={handleRefreshData}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Refresh Data
                    </button>
                </div>

                <ProgressIndicator 
                    step={step} 
                    onStepClick={handleStepClick} 
                    paymentItemsCount={paymentItems.length}
                />

                <ProcessingLoader
                    isProcessingFee={isProcessingFee}
                    step={step}
                    pre_filled_data={pre_filled_data}
                    selected_fee_details={selected_fee_details}
                />

                <DiscountSelectionModal
                    showDiscountSelection={showDiscountSelection}
                    selectedOutstandingFee={selectedOutstandingFee}
                    selectedDiscount={selectedDiscount}
                    setSelectedDiscount={setSelectedDiscount}
                    setShowDiscountSelection={setShowDiscountSelection}
                    setSelectedOutstandingFee={setSelectedOutstandingFee}
                    handleAddOutstandingFeeDirectly={handleOutstandingFeeDirectly}
                    handleAddOutstandingFeeWithDiscount={(fee) => {
                        handleOutstandingFeeDirectly(fee);
                    }}
                    data={data}
                    onDiscountApplied={(discountedAmount: number) => {
                        const amountInput = document.querySelector('input[placeholder="0.00"], input.pl-8') as HTMLInputElement;
                        if (amountInput) {
                            amountInput.value = discountedAmount.toFixed(2);
                            amountInput.dispatchEvent(new Event('input', { bubbles: true }));
                            amountInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }}
                    setData={setData}
                />

                <VerificationModal
                    show={showVerificationModal}
                    onClose={() => {
                        setShowVerificationModal(false);
                        setPendingDiscountCode('');
                        setVerificationIdNumber('');
                        setVerificationRemarks('');
                    }}
                    onSubmit={handleVerificationSubmit}
                    discountRule={discountRules?.find(r => r.code === pendingDiscountCode)}
                    idNumber={verificationIdNumber}
                    onIdNumberChange={setVerificationIdNumber}
                    remarks={verificationRemarks}
                    onRemarksChange={setVerificationRemarks}
                    payerId={currentPayerId}
                    payerType={currentPayerType}
                    discountCode={pendingDiscountCode}
                    isLoading={processing}
                />

                <form id="paymentForm" onSubmit={submit}>
                    {step === 1 && !isProcessingFee && (
                        <PayerSelectionStepWrapper
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
                            handleManualPayer={(payer: any) => handleSelectPayer(payer, 'resident')}
                            preSelectedPayerId={pre_filled_data?.payer_id}
                            preSelectedPayerType={pre_filled_data?.payer_type}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            preFilledData={pre_filled_data}
                            handleAddClearanceRequest={handleAddClearanceRequest}
                            handleOutstandingFeeDirectly={handleOutstandingFeeDirectly}
                            residentsList={residents}
                            householdsList={households}
                            businessesList={businesses}
                            pagination={pagination}
                        />
                    )}

                    {step === 2 && (
                        <AddFeesStep
                            key="add-fees-step"
                            data={data}
                            setData={setData}
                            setStep={setStep}
                            selectedFee={selectedOutstandingFee}
                            showLateSettings={showLateSettings}
                            isLatePayment={isLatePayment}
                            setIsLatePayment={setIsLatePayment}
                            monthsLate={monthsLate}
                            setMonthsLate={setMonthsLate}
                            onFeeClick={handleOutstandingFeeDirectly}
                            onAddWithLateSettings={handleAddOutstandingFeeWithLateSettings}
                            onCancelLateSettings={handleCancelLateSettings}
                            onDirectAddFee={handleOutstandingFeeDirectly}
                            paymentItems={paymentItems}
                            removePaymentItem={(id) => {
                                const updatedItems = paymentItems.filter((item: PaymentItem) => item.id !== id);
                                const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.base_amount || 0), 0);
                                const newTotal = updatedItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                                setData((prev: PaymentFormData) => ({
                                    ...prev,
                                    items: updatedItems,
                                    subtotal: parseFloat(newSubtotal.toFixed(2)),
                                    total_amount: parseFloat(newTotal.toFixed(2)),
                                }));
                            }}
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

                    {step === 3 && (
                        <PaymentDetailsStep
                            data={data}
                            setData={setData}
                            setStep={setStep}
                            paymentItems={paymentItems}
                            selectedDiscountCode={data.discount_code || ''}
                            discountTypes={discountTypes}
                            discountRules={discountRules || []}
                            discountCodeToIdMap={discountCodeToIdMap}
                            handleDiscountCodeChange={handleDiscountCodeChange}
                            processing={processing}
                            handlePurposeChange={handlePurposeChange}
                            handlePeriodCoveredChange={handlePeriodCoveredChange}
                            userModifiedPurpose={userModifiedPurpose}
                            setUserModifiedPurpose={setUserModifiedPurpose}
                            generatePurpose={() => generatePurposeFromItems(paymentItems)}
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