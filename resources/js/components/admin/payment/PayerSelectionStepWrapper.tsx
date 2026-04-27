// resources/js/components/admin/payment/PayerSelectionStepWrapper.tsx

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { PayerSelectionStep } from './PayerSelectionStep';
import { OutstandingFee, Resident, Household, Business, ClearanceRequest } from '@/types/admin/payments/payments';
import axios from 'axios';

const getPhotoUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http') || photoPath.startsWith('/storage')) {
        return photoPath;
    }
    return `/storage/${photoPath}`;
};

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

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
    preFilledData?: any;
    handleAddClearanceRequest?: (clearance: ClearanceRequest) => void;
    handleOutstandingFeeDirectly?: (fee: OutstandingFee) => void;
    residentsList?: Resident[];
    householdsList?: Household[];
    businessesList?: Business[];
    pagination?: Record<string, PaginationMeta>;
}

const WRAPPER_CACHE_KEY = 'payment_create_wrapper_cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes
const MAX_BACKGROUND_PAGES = 30;
const LOAD_MORE_PER_PAGE = 50;
const RATE_LIMIT_MS = 200;
const BACKGROUND_LOAD_DELAY_MS = 2000;

function getInitialCachedState() {
    try {
        const cached = sessionStorage.getItem(WRAPPER_CACHE_KEY);
        if (!cached) return null;
        
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        
        if (age >= CACHE_EXPIRY) {
            sessionStorage.removeItem(WRAPPER_CACHE_KEY);
            return null;
        }
        
        return parsed;
    } catch {
        sessionStorage.removeItem(WRAPPER_CACHE_KEY);
        return null;
    }
}

function getDefaultPagination(total: number, perPage: number = 20): PaginationMeta {
    return {
        current_page: 1,
        last_page: Math.ceil(total / perPage) || 1,
        per_page: perPage,
        total: total,
        has_more: total > perPage,
    };
}

function getInitialValues(
    cachedState: any,
    initialResidents: Resident[],
    initialHouseholds: Household[],
    initialBusinesses: Business[],
    initialClearanceRequests: ClearanceRequest[],
    initialFees: OutstandingFee[],
    serverPagination: any
) {
    const useCached = cachedState && 
        cachedState.residents?.length >= initialResidents.length &&
        cachedState.households?.length >= initialHouseholds.length &&
        cachedState.businesses?.length >= initialBusinesses.length &&
        cachedState.clearanceRequests?.length >= initialClearanceRequests.length &&
        cachedState.fees?.length >= initialFees.length;

    if (useCached) {
        return {
            residents: cachedState.residents,
            households: cachedState.households,
            businesses: cachedState.businesses,
            clearanceRequests: cachedState.clearanceRequests,
            fees: cachedState.fees,
            pageRef: cachedState.pageRef || createDefaultPageRef(),
            backgroundLoadStarted: cachedState.backgroundLoadStarted || createDefaultBackgroundFlags(),
            pagination: cachedState.pagination || buildDefaultPagination(initialResidents, initialHouseholds, initialBusinesses, initialClearanceRequests, initialFees, serverPagination),
        };
    }

    return {
        residents: initialResidents,
        households: initialHouseholds,
        businesses: initialBusinesses,
        clearanceRequests: initialClearanceRequests,
        fees: initialFees,
        pageRef: createDefaultPageRef(),
        backgroundLoadStarted: createDefaultBackgroundFlags(),
        pagination: buildDefaultPagination(initialResidents, initialHouseholds, initialBusinesses, initialClearanceRequests, initialFees, serverPagination),
    };
}

function createDefaultPageRef(): Record<string, number> {
    return {
        residents: 1,
        households: 1,
        businesses: 1,
        clearance_requests: 1,
        fees: 1,
    };
}

function createDefaultBackgroundFlags(): Record<string, boolean> {
    return {
        residents: false,
        households: false,
        businesses: false,
        clearance_requests: false,
        fees: false,
    };
}

function buildDefaultPagination(
    residents: Resident[],
    households: Household[],
    businesses: Business[],
    clearanceRequests: ClearanceRequest[],
    fees: OutstandingFee[],
    serverPagination: any
): Record<string, PaginationMeta> {
    return {
        residents: serverPagination?.residents || getDefaultPagination(residents.length),
        households: serverPagination?.households || getDefaultPagination(households.length),
        businesses: serverPagination?.businesses || getDefaultPagination(businesses.length),
        clearance_requests: serverPagination?.clearance_requests || getDefaultPagination(clearanceRequests.length),
        fees: serverPagination?.fees || getDefaultPagination(fees.length),
    };
}

function getApiType(source: string): string {
    const typeMap: Record<string, string> = {
        'residents': 'residents',
        'households': 'households',
        'businesses': 'businesses',
        'clearance': 'clearance_requests',
        'fees': 'fees',
    };
    return typeMap[source] || source;
}

function getBaseUrl(): string {
    return window.location.pathname.includes('/admin/') ? '/admin/payments' : '/payments';
}

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

function getPayerCountForApiType(apiType: string, state: any): number {
    switch (apiType) {
        case 'residents': return state.residents?.length || 0;
        case 'households': return state.households?.length || 0;
        case 'businesses': return state.businesses?.length || 0;
        case 'clearance_requests': return state.clearanceRequests?.length || 0;
        case 'fees': return state.fees?.length || 0;
        default: return 0;
    }
}

function hasDataForApiType(apiType: string, state: any): boolean {
    const meta = state.pagination?.[apiType];
    if (!meta || meta.total === 0) return true;
    return getPayerCountForApiType(apiType, state) >= meta.total;
}

export function PayerSelectionStepWrapper({
    residents: initialResidents,
    households: initialHouseholds,
    businesses: initialBusinesses,
    clearanceRequests: initialClearanceRequests,
    fees: initialFees,
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
    preFilledData,
    handleAddClearanceRequest,
    handleOutstandingFeeDirectly,
    residentsList = [],
    householdsList = [],
    businessesList = [],
    pagination: serverPagination,
}: WrapperProps) {
    
    const cachedState = getInitialCachedState();
    
    const initialValues = getInitialValues(
        cachedState,
        initialResidents, initialHouseholds, initialBusinesses,
        initialClearanceRequests, initialFees,
        serverPagination
    );
    
    // ========== STATE ==========
    const [residents, setResidents] = useState<Resident[]>(initialValues.residents);
    const [households, setHouseholds] = useState<Household[]>(initialValues.households);
    const [businesses, setBusinesses] = useState<Business[]>(initialValues.businesses);
    const [clearanceRequests, setClearanceRequests] = useState<ClearanceRequest[]>(initialValues.clearanceRequests);
    const [fees, setFees] = useState<OutstandingFee[]>(initialValues.fees);
    const [pagination, setPagination] = useState<Record<string, PaginationMeta>>(initialValues.pagination);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
    
    // ========== REFS ==========
    const pageRef = useRef<Record<string, number>>(initialValues.pageRef);
    const backgroundLoadStartedRef = useRef<Record<string, boolean>>(initialValues.backgroundLoadStarted);
    const isLoadingRef = useRef(false);
    const hasInitializedRef = useRef(false);
    const initialBackgroundStartedRef = useRef(false);
    
    // ========== SAVE STATE TO CACHE ==========
    const saveState = useCallback(() => {
        try {
            const state = {
                timestamp: Date.now(),
                residents,
                households,
                businesses,
                clearanceRequests,
                fees,
                pagination,
                pageRef: pageRef.current,
                backgroundLoadStarted: backgroundLoadStartedRef.current,
            };
            sessionStorage.setItem(WRAPPER_CACHE_KEY, JSON.stringify(state));
        } catch {
            // Storage quota exceeded - non-critical
        }
    }, [residents, households, businesses, clearanceRequests, fees, pagination]);
    
    // ========== UPDATE STATE FROM PROPS (one-time) ==========
    useEffect(() => {
        if (hasInitializedRef.current) return;
        
        if (initialResidents.length > residents.length) setResidents(initialResidents);
        if (initialHouseholds.length > households.length) setHouseholds(initialHouseholds);
        if (initialBusinesses.length > businesses.length) setBusinesses(initialBusinesses);
        if (initialClearanceRequests.length > clearanceRequests.length) setClearanceRequests(initialClearanceRequests);
        if (initialFees.length > fees.length) setFees(initialFees);
        
        if (serverPagination) {
            setPagination(prev => ({
                ...prev,
                ...(serverPagination.residents && { residents: serverPagination.residents }),
                ...(serverPagination.households && { households: serverPagination.households }),
                ...(serverPagination.businesses && { businesses: serverPagination.businesses }),
                ...(serverPagination.clearance_requests && { clearance_requests: serverPagination.clearance_requests }),
                ...(serverPagination.fees && { fees: serverPagination.fees }),
            }));
            
            if (serverPagination.residents) pageRef.current.residents = serverPagination.residents.current_page;
            if (serverPagination.households) pageRef.current.households = serverPagination.households.current_page;
            if (serverPagination.businesses) pageRef.current.businesses = serverPagination.businesses.current_page;
            if (serverPagination.clearance_requests) pageRef.current.clearance_requests = serverPagination.clearance_requests.current_page;
            if (serverPagination.fees) pageRef.current.fees = serverPagination.fees.current_page;
        }
        
        hasInitializedRef.current = true;
    }, []); // Run once on mount
    
    // ========== PERSIST CACHE ==========
    useEffect(() => {
        const interval = setInterval(saveState, 5000);
        return () => clearInterval(interval);
    }, [saveState]);
    
    useEffect(() => {
        return () => saveState();
    }, [saveState]);
    
    // ========== LOAD PAGE ==========
    const loadPage = useCallback(async (apiType: string, page: number): Promise<boolean> => {
        if (isLoadingRef.current) return false;
        
        isLoadingRef.current = true;
        
        try {
            const params = new URLSearchParams({
                type: apiType,
                page: String(page),
                per_page: String(LOAD_MORE_PER_PAGE),
            });
            
            if (searchQuery) params.append('search', searchQuery);
            if (preFilledData?.payer_type) params.append('payer_type', preFilledData.payer_type);
            if (preFilledData?.payer_id) params.append('payer_id', String(preFilledData.payer_id));
            
            const url = `${getBaseUrl()}/load-more-payers?${params.toString()}`;
            
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                }
            });
            
            if (!response.data.success) return false;
            
            const newData = response.data.data || [];
            const newPagination = response.data.pagination;
            
            if (newData.length > 0) {
                switch (apiType) {
                    case 'residents':
                        setResidents(prev => {
                            const existingIds = new Set(prev.map(r => String(r.id)));
                            const uniqueNewData = newData.filter((item: any) => !existingIds.has(String(item.id)));
                            return [...prev, ...uniqueNewData];
                        });
                        break;
                    case 'households':
                        setHouseholds(prev => {
                            const existingIds = new Set(prev.map(h => String(h.id)));
                            const uniqueNewData = newData.filter((item: any) => !existingIds.has(String(item.id)));
                            return [...prev, ...uniqueNewData];
                        });
                        break;
                    case 'businesses':
                        setBusinesses(prev => {
                            const existingIds = new Set(prev.map(b => String(b.id)));
                            const uniqueNewData = newData.filter((item: any) => !existingIds.has(String(item.id)));
                            return [...prev, ...uniqueNewData];
                        });
                        break;
                    case 'clearance_requests':
                        setClearanceRequests(prev => {
                            const existingIds = new Set(prev.map(c => String(c.id)));
                            const uniqueNewData = newData.filter((item: any) => !existingIds.has(String(item.id)));
                            return [...prev, ...uniqueNewData];
                        });
                        break;
                    case 'fees':
                        setFees(prev => {
                            const existingIds = new Set(prev.map(f => String(f.id)));
                            const uniqueNewData = newData.filter((item: any) => !existingIds.has(String(item.id)));
                            return [...prev, ...uniqueNewData];
                        });
                        break;
                }
            }
            
            if (newPagination) {
                setPagination(prev => ({
                    ...prev,
                    [apiType]: {
                        current_page: newPagination.current_page || page,
                        last_page: newPagination.last_page || 1,
                        per_page: newPagination.per_page || LOAD_MORE_PER_PAGE,
                        total: newPagination.total || 0,
                        has_more: newPagination.has_more ?? false,
                    }
                }));
                pageRef.current[apiType] = page;
                return newPagination.has_more ?? false;
            }
            
            setPagination(prev => ({
                ...prev,
                [apiType]: { ...prev[apiType], current_page: page, has_more: false }
            }));
            
            return false;
        } catch {
            return false;
        } finally {
            isLoadingRef.current = false;
        }
    }, [searchQuery, preFilledData]);
    
    // ========== BACKGROUND LOAD ALL PAGES ==========
    const loadAllInBackground = useCallback(async (apiType: string, startPage: number) => {
        if (backgroundLoadStartedRef.current[apiType]) return;
        
        if (hasDataForApiType(apiType, { residents, households, businesses, clearanceRequests, fees, pagination })) {
            backgroundLoadStartedRef.current[apiType] = true;
            return;
        }
        
        backgroundLoadStartedRef.current[apiType] = true;
        setIsBackgroundLoading(true);
        
        let currentPage = startPage;
        let hasMore = true;
        let totalPagesLoaded = 0;
        
        while (hasMore && totalPagesLoaded < MAX_BACKGROUND_PAGES) {
            await new Promise(resolve => setTimeout(resolve, 150));
            hasMore = await loadPage(apiType, currentPage);
            
            if (hasMore) {
                totalPagesLoaded++;
                currentPage++;
            }
        }
        
        setIsBackgroundLoading(false);
    }, [loadPage, residents, households, businesses, clearanceRequests, fees, pagination]);
    
    // ========== INITIAL BACKGROUND LOAD (runs once) ==========
    useEffect(() => {
        if (initialBackgroundStartedRef.current) return;
        initialBackgroundStartedRef.current = true;
        
        const timer = setTimeout(() => {
            const typesToLoad = ['residents', 'households', 'businesses', 'clearance_requests', 'fees'];
            
            typesToLoad.forEach(type => {
                const meta = pagination[type];
                if (!meta?.has_more || backgroundLoadStartedRef.current[type]) return;
                
                const currentCount = getPayerCountForApiType(type, {
                    residents, households, businesses, clearanceRequests, fees
                });
                
                if (currentCount < meta.total) {
                    const nextPage = (pageRef.current[type] || 1) + 1;
                    loadAllInBackground(type, nextPage);
                }
            });
        }, BACKGROUND_LOAD_DELAY_MS);
        
        return () => clearTimeout(timer);
    }, []); // Run once on mount
    
    // ========== TAB CHANGE: LOAD CURRENT TAB ==========
    useEffect(() => {
        const apiType = getApiType(payerSource);
        const meta = pagination[apiType];
        
        if (meta?.has_more && !backgroundLoadStartedRef.current[apiType]) {
            const nextPage = (pageRef.current[apiType] || 1) + 1;
            loadAllInBackground(apiType, nextPage);
        }
    }, [payerSource]); // Re-run when tab changes
    
    // ========== LOAD MORE (USER TRIGGERED) ==========
    const loadMore = useCallback(async () => {
        const apiType = getApiType(payerSource);
        const meta = pagination[apiType];
        
        if (!meta?.has_more || isLoadingRef.current) return;
        
        setIsLoadingMore(true);
        const nextPage = (pageRef.current[apiType] || 1) + 1;
        
        try {
            await loadPage(apiType, nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [payerSource, pagination, loadPage]);
    
    // ========== ENHANCED RESIDENTS WITH PHOTO URLS ==========
    const enhancedResidents = useMemo(() => {
        return residents.map(resident => ({
            ...resident,
            photo_url: getPhotoUrl(resident.photo_path),
        }));
    }, [residents]);
    
    // ========== WRAPPED SELECT PAYER ==========
    const wrappedHandleSelectPayer = useCallback((payer: any) => {
        if (payerSource === 'residents') {
            handleSelectPayer({
                ...payer,
                photo_url: payer.photo_url || getPhotoUrl(payer.photo_path),
                outstanding_fees: payer.outstanding_fees || [],
            }, 'resident');
        } else if (payerSource === 'households') {
            handleSelectPayer(payer, 'household');
        } else if (payerSource === 'businesses') {
            handleSelectPayer(payer, 'business');
        } else if (payerSource === 'clearance') {
            if (payer?.resident && handleAddClearanceRequest) {
                handleSelectPayer({
                    id: payer.resident.id,
                    name: payer.resident.name,
                    contact_number: payer.resident.contact_number || '',
                    address: payer.resident.address || '',
                    purok: typeof payer.resident.purok === 'object' 
                        ? (payer.resident.purok?.name || '') 
                        : (payer.resident.purok || ''),
                    household_number: payer.resident.household_number || '',
                    photo_path: payer.resident.photo_path,
                    photo_url: getPhotoUrl(payer.resident.photo_path),
                }, 'resident');
                handleAddClearanceRequest(payer);
            }
        } else if (payerSource === 'fees' && handleOutstandingFeeDirectly) {
            handleOutstandingFeeDirectly(payer);
            
            const payerType = payer.payer_type || '';
            const payerId = payer.payer_id;
            
            if (payerType.includes('Resident') && payerId) {
                const resident = residentsList.find(r => r.id == payerId);
                if (resident) {
                    handleSelectPayer({
                        ...resident, 
                        photo_url: getPhotoUrl(resident.photo_path),
                        outstanding_fees: resident.outstanding_fees || [],
                    }, 'resident');
                }
            } else if (payerType.includes('Household') && payerId) {
                const household = householdsList.find(h => h.id == payerId);
                if (household) handleSelectPayer(household, 'household');
            } else if (payerType.includes('Business') && payerId) {
                const business = businessesList.find(b => b.id == payerId);
                if (business) handleSelectPayer(business, 'business');
            }
        }
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
            pagination={pagination}
            isLoadingMore={isLoadingMore || isBackgroundLoading}
            loadMore={loadMore}
        />
    );
}