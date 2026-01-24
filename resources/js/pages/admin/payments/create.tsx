// app/Pages/Admin/Payments/CreatePayment.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, AlertCircle, FileCheck, RefreshCw, AlertTriangle } from 'lucide-react';

// Import child components
import { ProgressIndicator } from '@/components/admin/payment/ProgressIndicator';
import { PayerSelectionStep } from '@/components/admin/payment/PayerSelectionStep';
import { AddFeesStep } from '@/components/admin/payment/AddFeesStep';
import { PaymentDetailsStep } from '@/components/admin/payment/PaymentDetailsStep';

// Define types
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
}

interface BackendFee {
    id: string | number;
    fee_type_id: string | number;
    fee_code: string;
    payer_type: 'resident' | 'household' | 'business';
    resident_id: string | number | null;
    household_id: string | number | null;
    business_name: string | null;
    payer_name: string;
    contact_number: string | null;
    address: string | null;
    purok: string | null;
    zone: string | null;
    billing_period: string | null;
    period_start: string | null;
    period_end: string | null;
    issue_date: string;
    due_date: string;
    base_amount: number;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    discount_type: string | null;
    total_amount: number;
    status: 'pending' | 'issued' | 'partially_paid' | 'overdue' | 'paid' | 'cancelled' | 'waived';
    amount_paid: number | null;
    balance: number;
    purpose: string | null;
    fee_type_name?: string;
    fee_type_category?: string;
    [key: string]: any;
}

interface OutstandingFee {
    id: string | number;
    fee_type_id: string | number;
    fee_type?: FeeType;
    fee_code: string;
    payer_name: string;
    payer_type: 'resident' | 'household' | 'business';
    payer_id?: string | number;
    due_date: string;
    base_amount: string | number;
    surcharge_amount: string | number;
    penalty_amount: string | number;
    discount_amount: string | number;
    amount_paid: string | number;
    balance: string | number;
    total_amount?: string | number;
    status: string;
    purpose?: string;
    fee_type_name?: string;
    fee_type_category?: string;
    billing_period?: string;
    period_start?: string;
    period_end?: string;
    category?: string;
}

interface ClearanceType {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    fee: number | string;
    formatted_fee?: string;
    processing_days?: number;
    validity_days: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    eligibility_criteria?: string;
    purpose_options?: string[];
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
    clearance_type?: ClearanceType;
    resident?: Resident;
    can_be_paid?: boolean;
    already_paid?: boolean;
}

interface Resident {
    id: string | number;
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    outstanding_fees?: OutstandingFee[];
    household_id?: string | number;
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
}

interface Household {
    id: string | number;
    head_name: string;
    contact_number?: string;
    address: string;
    household_number: string;
    purok?: string;
    outstanding_fees?: OutstandingFee[];
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
}

interface PaymentItem {
    id: number;
    fee_id: string | number;
    fee_name: string;
    fee_code: string;
    description: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    discount: number;
    total_amount: number;
    category: string;
    period_covered: string;
    months_late: number;
    metadata?: {
        is_clearance_fee?: boolean;
        clearance_request_id?: string | number;
        clearance_type_id?: string | number;
        clearance_type_code?: string;
        is_outstanding_fee?: boolean;
        original_fee_id?: string | number;
        payer_type?: string;
        payer_id?: string | number;
        original_fee_data?: {
            base_amount: number;
            surcharge_amount: number;
            penalty_amount: number;
            discount_amount: number;
            amount_paid: number;
            balance: number;
            total_amount?: number;
        };
    };
}

interface PaymentFormData {
    payer_type: string;
    payer_id: string | number;
    payer_name: string;
    contact_number: string;
    address: string;
    household_number: string;
    purok: string;
    items: PaymentItem[];
    payment_date: string;
    period_covered: string;
    or_number: string;
    payment_method: string;
    reference_number: string;
    subtotal: number;
    surcharge: number;
    penalty: number;
    discount: number;
    discount_type: string;
    total_amount: number;
    purpose: string;
    remarks: string;
    is_cleared: boolean;
    clearance_type: string;
    clearance_type_id: string | number;
    clearance_code: string;
    validity_date: string;
    collection_type: 'manual' | 'system';
    clearance_request_id?: string | number;
}

interface PreFilledFeeData {
    fee_id?: number;
    fee_type_id?: number;
    payer_type?: string;
    payer_id?: number;
    payer_name?: string;
    contact_number?: string;
    address?: string;
    purok?: string;
    fee_code?: string;
    fee_name?: string;
    description?: string;
    total_amount?: number;
    balance?: number;
    clearance_request_id?: string | number;
    clearance_type_id?: string | number;
    clearance_type?: string;
    clearance_code?: string;
}

interface PageProps {
    residents: Resident[];
    households: Household[];
    fees: BackendFee[];
    feeTypes?: FeeType[];
    discountTypes?: Record<string, string>;
    pre_filled_data?: PreFilledFeeData;
    clearance_request?: ClearanceRequest | null;
    clearance_fee_type?: any;
    clearanceTypes?: Record<string, string>;
    clearanceTypesDetails?: ClearanceType[];
    clearance_requests?: ClearanceRequest[];
}

// ====================
// FIXED HELPER FUNCTIONS
// ====================

function generateORNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BAR-${year}${month}${day}-${random}`;
}

/**
 * FIXED: Consistent amount parsing with 2 decimal places
 */
function parseAmount(amount: string | number | null | undefined): number {
    if (amount === null || amount === undefined || amount === '') return 0;
    
    if (typeof amount === 'number') {
        return parseFloat(amount.toFixed(2));
    }
    
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[₱,$,\s,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
    }
    
    return 0;
}

/**
 * FIXED: Calculate item total consistently
 */
function calculateItemTotal(item: {
    base_amount: number | string;
    surcharge?: number | string;
    penalty?: number | string;
    discount?: number | string;
}): number {
    const base = parseAmount(item.base_amount);
    const surcharge = parseAmount(item.surcharge || 0);
    const penalty = parseAmount(item.penalty || 0);
    const discount = parseAmount(item.discount || 0);
    
    const total = base + surcharge + penalty - discount;
    return Math.max(0, parseFloat(total.toFixed(2)));
}

/**
 * FIXED: Get correct balance for outstanding fees
 */
function getOutstandingFeeBalance(fee: OutstandingFee): number {
    // Priority 1: Use balance from backend
    const balanceFromDB = parseAmount(fee.balance);
    if (balanceFromDB > 0) {
        return balanceFromDB;
    }
    
    // Priority 2: Calculate from components
    const base = parseAmount(fee.base_amount);
    const surcharge = parseAmount(fee.surcharge_amount || 0);
    const penalty = parseAmount(fee.penalty_amount || 0);
    const discount = parseAmount(fee.discount_amount || 0);
    const amountPaid = parseAmount(fee.amount_paid || 0);
    
    const totalAmount = base + surcharge + penalty - discount;
    const calculatedBalance = totalAmount - amountPaid;
    
    return Math.max(0, parseFloat(calculatedBalance.toFixed(2)));
}

/**
 * FIXED: Get amount already paid
 */
function getAmountPaid(fee: OutstandingFee): number {
    return parseAmount(fee.amount_paid || 0);
}

/**
 * FIXED: Get total amount (original amount)
 */
function getTotalOriginalAmount(fee: OutstandingFee): number {
    const base = parseAmount(fee.base_amount);
    const surcharge = parseAmount(fee.surcharge_amount || 0);
    const penalty = parseAmount(fee.penalty_amount || 0);
    const discount = parseAmount(fee.discount_amount || 0);
    
    return parseFloat((base + surcharge + penalty - discount).toFixed(2));
}

function calculateMonthsLate(dueDate: string, paymentDate: Date = new Date()): number {
    try {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return 0;
        
        if (due > paymentDate) return 0;
        
        const months = (paymentDate.getFullYear() - due.getFullYear()) * 12 + 
                      (paymentDate.getMonth() - due.getMonth());
        
        const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
        
        return Math.max(0, months + (daysLate > 0 && months === 0 ? 1 : 0));
    } catch {
        return 0;
    }
}

function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// Convert BackendFee to OutstandingFee format
function convertBackendFeeToOutstandingFee(fee: BackendFee, feeTypes: FeeType[]): OutstandingFee {
    const feeType = feeTypes.find(ft => ft.id == fee.fee_type_id);
    
    return {
        id: fee.id,
        fee_type_id: fee.fee_type_id,
        fee_type: feeType,
        fee_code: fee.fee_code,
        payer_name: fee.payer_name,
        payer_type: fee.payer_type,
        payer_id: fee.payer_type === 'resident' ? fee.resident_id : 
                 fee.payer_type === 'household' ? fee.household_id : null,
        due_date: fee.due_date,
        base_amount: fee.base_amount.toString(),
        surcharge_amount: fee.surcharge_amount.toString(),
        penalty_amount: fee.penalty_amount.toString(),
        discount_amount: fee.discount_amount.toString(),
        amount_paid: fee.amount_paid ? fee.amount_paid.toString() : '0',
        balance: fee.balance.toString(),
        total_amount: fee.total_amount ? fee.total_amount.toString() : '0',
        status: fee.status,
        purpose: fee.purpose || undefined,
        fee_type_name: fee.fee_type_name || feeType?.name,
        fee_type_category: fee.fee_type_category || feeType?.category || 'other',
        billing_period: fee.billing_period,
        period_start: fee.period_start || undefined,
        period_end: fee.period_end || undefined,
        category: fee.fee_type_category || feeType?.category || 'other',
    };
}

export default function CreatePayment() {
    const { 
        residents, 
        households, 
        fees,
        feeTypes = [],
        discountTypes = {}, 
        pre_filled_data, 
        clearance_request,
        clearanceTypes = {},
        clearanceTypesDetails = [],
        clearance_requests = []
    } = usePage<PageProps>().props;
    
    // State for multi-step process
    const [step, setStep] = useState<number>(1);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | ClearanceRequest | BackendFee | OutstandingFee | null>(null);
    const [payerSource, setPayerSource] = useState<'residents' | 'households' | 'clearance' | 'fees'>(
        pre_filled_data?.clearance_request_id ? 'clearance' : 'residents'
    );
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    const [selectedOutstandingFee, setSelectedOutstandingFee] = useState<OutstandingFee | null>(null);
    const [isLatePayment, setIsLatePayment] = useState<boolean>(false);
    const [monthsLate, setMonthsLate] = useState<number>(1);
    const [showLateSettings, setShowLateSettings] = useState<boolean>(false);
    const [selectedDiscountType, setSelectedDiscountType] = useState<string>('');
    const [userModifiedPurpose, setUserModifiedPurpose] = useState<boolean>(false);
    
    const [payerOutstandingFees, setPayerOutstandingFees] = useState<OutstandingFee[]>([]);
    
    // Convert backend fees to OutstandingFee format for the fees tab
    const outstandingFeesForTab = useMemo(() => {
        if (!fees || !Array.isArray(fees)) return [];
        
        return fees.map(fee => convertBackendFeeToOutstandingFee(fee as BackendFee, feeTypes));
    }, [fees, feeTypes]);
    
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

    const { data, setData, post, processing, errors } = useForm<PaymentFormData & { [key: string]: any }>(initialFormData);

    // Handle sessionStorage clearance data
    useEffect(() => {
        console.log('🚀 CreatePayment component mounted');
        
        // Check for pending clearance payment in session storage
        const pendingClearancePayment = sessionStorage.getItem('pending_clearance_payment');
        
        if (pendingClearancePayment && !clearance_request) {
            try {
                const clearanceData = JSON.parse(pendingClearancePayment);
                console.log('📋 Found pending clearance payment in session:', clearanceData);
                
                // Create a mock clearance request object
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
                        description: '',
                        fee: clearanceData.amount,
                        validity_days: 30,
                        requires_payment: true,
                        requires_approval: true,
                        is_online_only: false
                    },
                    resident: {
                        id: clearanceData.resident_id,
                        name: clearanceData.resident_name || 'Unknown Resident',
                        contact_number: '',
                        address: ''
                    }
                };
                
                // Handle the clearance request
                handleClearanceRequestDirectly(mockClearanceRequest);
                
                // Clear the session storage
                sessionStorage.removeItem('pending_clearance_payment');
                
            } catch (error) {
                console.error('Error parsing pending clearance payment:', error);
                sessionStorage.removeItem('pending_clearance_payment');
            }
        } else if (clearance_request) {
            console.log('📋 Clearance request from props:', clearance_request);
            handleClearanceRequestDirectly(clearance_request);
        }
    }, []);

    useEffect(() => {
        console.log('📊 Form data updated:', {
            itemsCount: data.items?.length || 0,
            subtotal: data.subtotal,
            surcharge: data.surcharge,
            penalty: data.penalty,
            discount: data.discount,
            total_amount: data.total_amount
        });
    }, [data.items, data.subtotal, data.surcharge, data.penalty, data.discount, data.total_amount]);

    const paymentItems = useMemo(() => {
        return data.items || [];
    }, [data.items]);

    /**
     * FIXED: Calculate totals from items with validation
     */
    const calculateTotalsFromItems = useCallback((items: PaymentItem[]) => {
        console.log('🧮 [FIXED] Calculating totals from items:', items.length);
        
        let subtotal = 0;
        let surcharge = 0;
        let penalty = 0;
        let discount = 0;
        let total = 0;
        
        // Validate and recalculate each item
        const validatedItems = items.map(item => {
            const base = parseAmount(item.base_amount);
            const itemSurcharge = parseAmount(item.surcharge || 0);
            const itemPenalty = parseAmount(item.penalty || 0);
            const itemDiscount = parseAmount(item.discount || 0);
            const itemTotal = parseAmount(item.total_amount);
            
            // Recalculate to ensure consistency
            const calculatedTotal = base + itemSurcharge + itemPenalty - itemDiscount;
            
            // If discrepancy > 0.01, use calculated total
            const finalTotal = Math.abs(itemTotal - calculatedTotal) > 0.01 
                ? parseFloat(calculatedTotal.toFixed(2))
                : itemTotal;
            
            subtotal += base;
            surcharge += itemSurcharge;
            penalty += itemPenalty;
            discount += itemDiscount;
            total += finalTotal;
            
            return {
                ...item,
                base_amount: base,
                surcharge: itemSurcharge,
                penalty: itemPenalty,
                discount: itemDiscount,
                total_amount: finalTotal
            };
        });
        
        // Validate overall consistency
        const calculatedTotal = subtotal + surcharge + penalty - discount;
        
        if (Math.abs(total - calculatedTotal) > 0.01) {
            console.warn(`⚠️ Total mismatch: sum(${total}) vs calc(${calculatedTotal})`);
            total = parseFloat(calculatedTotal.toFixed(2));
        }
        
        console.log('✅ [FIXED] Calculated totals:', { 
            subtotal: parseFloat(subtotal.toFixed(2)), 
            surcharge: parseFloat(surcharge.toFixed(2)), 
            penalty: parseFloat(penalty.toFixed(2)), 
            discount: parseFloat(discount.toFixed(2)), 
            total: parseFloat(total.toFixed(2)) 
        });
        
        return { 
            subtotal: parseFloat(subtotal.toFixed(2)), 
            surcharge: parseFloat(surcharge.toFixed(2)), 
            penalty: parseFloat(penalty.toFixed(2)), 
            discount: parseFloat(discount.toFixed(2)), 
            total_amount: parseFloat(total.toFixed(2)),
            items: validatedItems
        };
    }, []);

    /**
     * FIXED: Update items with validation
     */
    const updateItems = useCallback((items: PaymentItem[]) => {
        console.log('🔄 [FIXED] Updating items with validation');
        
        const totals = calculateTotalsFromItems(items);
        
        const updatedData = {
            ...data,
            items: totals.items,
            subtotal: totals.subtotal,
            surcharge: totals.surcharge,
            penalty: totals.penalty,
            discount: totals.discount,
            total_amount: totals.total_amount,
        };
        
        setData(updatedData);
        
        console.log('✅ [FIXED] Form data updated:', {
            itemsCount: totals.items.length,
            subtotal: totals.subtotal,
            surcharge: totals.surcharge,
            penalty: totals.penalty,
            discount: totals.discount,
            total_amount: totals.total_amount
        });
    }, [data, setData, calculateTotalsFromItems]);

    // Handle clearance request directly
    const handleClearanceRequestDirectly = useCallback((clearanceReq: ClearanceRequest) => {
        console.log('🔄 Handling clearance request directly:', {
            clearance_request_id: clearanceReq.id,
            resident_id: clearanceReq.resident_id
        });
        
        // Find resident payer
        const residentPayer = residents.find(r => r.id == clearanceReq.resident_id);
        if (!residentPayer) {
            console.error('❌ Resident not found for clearance request!');
            return;
        }
        
        const clearanceTypeDetail = clearanceTypesDetails.find(
            type => type.id == clearanceReq.clearance_type_id
        ) || clearanceReq.clearance_type;
        
        const clearanceTypeCode = clearanceTypeDetail?.code || 'BRGY_CLEARANCE';
        const clearanceTypeName = clearanceTypes[clearanceTypeCode] || 
                                 clearanceTypeDetail?.name ||
                                 clearanceReq.purpose || 
                                 'Clearance Fee';
        const clearanceTypeId = clearanceTypeDetail?.id || clearanceReq.clearance_type_id;
        
        const feeAmount = parseAmount(clearanceReq.fee_amount);
            
        const clearanceFeeItem: PaymentItem = {
            id: Date.now(),
            fee_id: `clearance-${clearanceReq.id}`,
            fee_name: clearanceTypeName,
            fee_code: clearanceTypeCode,
            description: clearanceReq.specific_purpose || clearanceReq.purpose || 'Clearance Fee',
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
            payer_id: clearanceReq.resident_id,
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
        
        // Get outstanding fees for this resident
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == clearanceReq.resident_id
        );
        setPayerOutstandingFees(residentOutstandingFees);
        
        console.log('✅ Clearance request processed directly');
        
        // Skip to step 2 automatically
        setTimeout(() => {
            setStep(2);
        }, 100);
        
    }, [residents, clearanceTypes, clearanceTypesDetails, setData, data, outstandingFeesForTab]);

    useEffect(() => {
        console.log('🚀 Initialization Effect Running', {
            step,
            hasPreFilledData: !!pre_filled_data,
            hasClearanceRequest: !!clearance_request,
        });

        if (clearance_request) {
            console.log('📋 Processing clearance request...');
            handleClearanceRequestDirectly(clearance_request);
            setPayerSource('clearance');
            setSelectedPayer(clearance_request);
        }
        else if (pre_filled_data?.payer_id && pre_filled_data?.payer_type) {
            console.log('💰 Processing pre-filled fee...');
            if (pre_filled_data.payer_type === 'resident') {
                const payer = residents.find(r => r.id == pre_filled_data.payer_id);
                if (payer) {
                    setSelectedPayer(payer);
                    handleResidentPayer(payer);
                    setPayerSource('residents');
                }
            } else if (pre_filled_data.payer_type === 'household') {
                const payer = households.find(h => h.id == pre_filled_data.payer_id);
                if (payer) {
                    setSelectedPayer(payer);
                    handleHouseholdPayer(payer);
                    setPayerSource('households');
                }
            }
            
            setTimeout(() => {
                setStep(2);
            }, 100);
        }
    }, []);

    const handleClearanceRequest = useCallback(() => {
        if (!clearance_request) return;
        
        console.log('🔄 Handling clearance request:', {
            clearance_request_id: clearance_request.id,
            resident_id: clearance_request.resident_id
        });
        
        const residentPayer = residents.find(r => r.id == clearance_request.resident_id);
        if (!residentPayer) {
            console.error('❌ Resident not found for clearance request!');
            return;
        }
        
        const clearanceTypeDetail = clearanceTypesDetails.find(
            type => type.id == clearance_request.clearance_type_id
        );
        
        const clearanceTypeCode = clearanceTypeDetail?.code || 
                                 clearance_request.clearance_type?.code || 
                                 'clearance';
        const clearanceTypeName = clearanceTypes[clearanceTypeCode] || 
                                 clearanceTypeDetail?.name ||
                                 clearance_request.clearance_type?.name || 
                                 clearance_request.purpose || 
                                 'Clearance Fee';
        const clearanceTypeId = clearanceTypeDetail?.id || 
                               clearance_request.clearance_type_id;
        
        const feeAmount = parseAmount(clearance_request.fee_amount);
            
        const clearanceFeeItem: PaymentItem = {
            id: Date.now(),
            fee_id: `clearance-${clearance_request.id}`,
            fee_name: clearanceTypeName,
            fee_code: clearanceTypeCode,
            description: clearance_request.specific_purpose || clearance_request.purpose || 'Clearance Fee',
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
            payer_id: clearance_request.resident_id,
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
        
        // Get outstanding fees for this resident
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == clearance_request.resident_id
        );
        setPayerOutstandingFees(residentOutstandingFees);
        
        console.log('✅ Clearance request processed');
        
        setTimeout(() => {
            setStep(2);
        }, 100);
        
    }, [clearance_request, residents, clearanceTypes, clearanceTypesDetails, setData, outstandingFeesForTab]);

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

    const handleSelectPayer = (payer: Resident | Household | ClearanceRequest | BackendFee | OutstandingFee) => {
        console.log('👤 Payer selected from source:', payerSource);
        
        setSelectedPayer(payer);
        
        if (payerSource === 'residents') {
            handleResidentPayer(payer as Resident);
        } else if (payerSource === 'households') {
            handleHouseholdPayer(payer as Household);
        } else if (payerSource === 'clearance') {
            handleClearanceTabPayer(payer as ClearanceRequest);
        } else if (payerSource === 'fees') {
            // Determine if it's a BackendFee or OutstandingFee
            if ('total_amount' in payer && typeof payer.total_amount === 'number') {
                handleBackendFeePayer(payer as BackendFee);
            } else {
                handleOutstandingFeePayer(payer as OutstandingFee);
            }
        }
        
        setTimeout(() => {
            setStep(2);
        }, 100);
    };

    const handleResidentPayer = (resident: Resident) => {
        console.log('👤 Handling resident payer:', {
            residentId: resident.id,
            residentName: resident.name
        });
        
        // Get outstanding fees for this resident
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == resident.id
        );
        
        setPayerOutstandingFees(residentOutstandingFees);
        
        const residentClearanceRequests = clearance_requests?.filter(cr => 
            cr.resident_id == resident.id && 
            cr.can_be_paid && 
            !cr.already_paid
        ) || [];
        
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
                
            const clearanceFeeItem: PaymentItem = {
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
    };

    const handleHouseholdPayer = (household: Household) => {
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
    };

    const handleClearanceTabPayer = (clearancePayer: ClearanceRequest) => {
        console.log('📋 Handling clearance tab payer:', {
            clearance_request_id: clearancePayer.id,
            resident_id: clearancePayer.resident_id
        });
        
        const residentPayer = residents.find(r => r.id == clearancePayer.resident_id);
        if (!residentPayer) {
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
            
        const clearanceFeeItem: PaymentItem = {
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
        
        // Get outstanding fees for this resident
        const residentOutstandingFees = outstandingFeesForTab.filter(fee => 
            fee.payer_type === 'resident' && 
            fee.payer_id == clearancePayer.resident_id
        );
        setPayerOutstandingFees(residentOutstandingFees);
    };

    const handleBackendFeePayer = (backendFee: BackendFee) => {
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
        
        const feeItem: PaymentItem = {
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
    };

    const handleOutstandingFeePayer = (outstandingFee: OutstandingFee) => {
        console.log('💰 Handling outstanding fee payer:', {
            feeId: outstandingFee.id,
            feeCode: outstandingFee.fee_code,
            payerName: outstandingFee.payer_name,
            balance: outstandingFee.balance
        });
        
        // Get the correct balance to pay
        const balanceToPay = getOutstandingFeeBalance(outstandingFee);
        const amountPaid = getAmountPaid(outstandingFee);
        
        // Parse amounts
        const baseAmount = parseAmount(outstandingFee.base_amount);
        const surchargeAmount = parseAmount(outstandingFee.surcharge_amount || 0);
        const penaltyAmount = parseAmount(outstandingFee.penalty_amount || 0);
        const discountAmount = parseAmount(outstandingFee.discount_amount || 0);
        
        const feeItem: PaymentItem = {
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
    };

    const handleManualPayer = (): void => {
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
        setStep(2);
    };

    const handleOutstandingFeeClick = (fee: OutstandingFee): void => {
        if (paymentItems.some(item => item.fee_id === fee.id)) {
            alert('This fee has already been added to the payment.');
            return;
        }
        
        if (!isValidDate(fee.due_date)) {
            alert(`Error: Invalid due date format for fee ${fee.fee_code}`);
            return;
        }
        
        const paymentDate = new Date(data.payment_date);
        const dueDate = new Date(fee.due_date);
        const isPaymentLate = paymentDate > dueDate;
        const feeType = feeTypes.find(f => f.id === fee.fee_type_id);
        
        const shouldShowModal = feeType && (feeType.has_surcharge || feeType.has_penalty) && isPaymentLate;
        
        if (shouldShowModal) {
            setSelectedOutstandingFee(fee);
            setShowLateSettings(true);
            setIsLatePayment(true);
            setMonthsLate(Math.max(1, calculateMonthsLate(fee.due_date, paymentDate)));
        } else {
            handleAddOutstandingFeeDirectly(fee);
        }
    };

    /**
     * FIXED: Handle adding outstanding fee with proper calculations
     */
    const handleAddOutstandingFeeDirectly = (outstandingFee: OutstandingFee): void => {
        console.log('💰 [FIXED] Adding outstanding fee:', {
            feeId: outstandingFee.id,
            feeCode: outstandingFee.fee_code,
            balance: outstandingFee.balance,
            amount_paid: outstandingFee.amount_paid
        });
        
        // Get correct balance to pay
        const balanceToPay = getOutstandingFeeBalance(outstandingFee);
        
        if (balanceToPay <= 0) {
            alert('This fee has already been fully paid.');
            return;
        }
        
        // Check if already added
        if (paymentItems.some(item => item.fee_id === outstandingFee.id)) {
            alert('This fee has already been added to the payment.');
            return;
        }
        
        // Get fee breakdown
        const baseAmount = parseAmount(outstandingFee.base_amount);
        const surchargeAmount = parseAmount(outstandingFee.surcharge_amount || 0);
        const penaltyAmount = parseAmount(outstandingFee.penalty_amount || 0);
        const discountAmount = parseAmount(outstandingFee.discount_amount || 0);
        const amountPaid = getAmountPaid(outstandingFee);
        const totalOriginal = getTotalOriginalAmount(outstandingFee);
        
        // Calculate unpaid ratios
        const paidRatio = totalOriginal > 0 ? amountPaid / totalOriginal : 0;
        
        // Calculate unpaid portions
        const unpaidBase = Math.max(0, baseAmount * (1 - paidRatio));
        const unpaidSurcharge = Math.max(0, surchargeAmount * (1 - paidRatio));
        const unpaidPenalty = Math.max(0, penaltyAmount * (1 - paidRatio));
        const unpaidDiscount = Math.max(0, discountAmount * (1 - paidRatio));
        
        // Create payment item
        const newItem: PaymentItem = {
            id: Date.now(),
            fee_id: outstandingFee.id,
            fee_name: outstandingFee.fee_type_name || outstandingFee.fee_type?.name || 'Fee',
            fee_code: outstandingFee.fee_code,
            description: outstandingFee.purpose || `Payment for ${outstandingFee.fee_type_name || 'Fee'}`,
            base_amount: parseFloat(unpaidBase.toFixed(2)),
            surcharge: parseFloat(unpaidSurcharge.toFixed(2)),
            penalty: parseFloat(unpaidPenalty.toFixed(2)),
            discount: parseFloat(unpaidDiscount.toFixed(2)),
            total_amount: parseFloat(balanceToPay.toFixed(2)),
            category: outstandingFee.fee_type_category || outstandingFee.fee_type?.category || outstandingFee.category || 'other',
            period_covered: outstandingFee.billing_period || '',
            months_late: calculateMonthsLate(outstandingFee.due_date),
            metadata: {
                is_outstanding_fee: true,
                original_fee_id: outstandingFee.id,
                payer_type: outstandingFee.payer_type,
                payer_id: outstandingFee.payer_id,
                original_fee_data: {
                    base_amount: baseAmount,
                    surcharge_amount: surchargeAmount,
                    penalty_amount: penaltyAmount,
                    discount_amount: discountAmount,
                    amount_paid: amountPaid,
                    balance: balanceToPay,
                    total_amount: totalOriginal
                }
            }
        };
        
        // Validate item total
        const calculatedTotal = unpaidBase + unpaidSurcharge + unpaidPenalty - unpaidDiscount;
        if (Math.abs(calculatedTotal - balanceToPay) > 0.01) {
            console.warn(`⚠️ Balance mismatch: ${calculatedTotal} vs ${balanceToPay}. Adjusting...`);
            newItem.total_amount = parseFloat(calculatedTotal.toFixed(2));
        }
        
        console.log('✅ Created payment item:', newItem);
        
        // Add to payment items
        const updatedItems = [...paymentItems, newItem];
        updateItems(updatedItems);
        
        // Update purpose if not modified
        if (!userModifiedPurpose && !data.purpose.includes('Clearance')) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            setData('purpose', newPurpose);
        }
    };

    const handleAddOutstandingFeeWithLateSettings = (): void => {
        if (!selectedOutstandingFee) return;
        
        handleAddOutstandingFeeDirectly(selectedOutstandingFee);
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

    const generatePurposeFromItems = (items: PaymentItem[]): string => {
        if (items.length === 0) return '';
        
        const itemNames = items.map(item => item.fee_name);
        
        if (items.length === 1) {
            return itemNames[0];
        }
        
        return itemNames.join(', ');
    };

    const removePaymentItem = (id: number): void => {
        console.log('🗑️ Removing payment item:', id);
        
        const updatedItems = paymentItems.filter(item => item.id !== id);
        
        updateItems(updatedItems);
        
        if (!userModifiedPurpose && updatedItems.length > 0) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            setData('purpose', newPurpose);
        } else if (updatedItems.length === 0) {
            setData('purpose', '');
        }
        
        // Check if we removed a clearance item
        const itemToRemove = paymentItems.find(item => item.id === id);
        if (itemToRemove?.metadata?.is_clearance_fee) {
            const hasOtherClearanceItems = updatedItems.some(item => 
                item.metadata?.is_clearance_fee
            );
            
            if (!hasOtherClearanceItems) {
                const updatedData = {
                    ...data,
                    clearance_type: '',
                    clearance_type_id: '',
                    clearance_code: '',
                    is_cleared: false,
                    validity_date: '',
                    clearance_request_id: undefined,
                };
                
                setData(updatedData);
                console.log('🗑️ Cleared clearance request ID after removing last clearance item');
            }
        }
    };

    const handleDiscountTypeChange = (type: string): void => {
        setSelectedDiscountType(type);
        setData('discount_type', type);
    };

    const handlePurposeChange = (value: string): void => {
        setData('purpose', value);
        if (value !== generatePurposeFromItems(paymentItems)) {
            setUserModifiedPurpose(true);
        }
    };

    const handlePeriodCoveredChange = (value: string): void => {
        setData('period_covered', value);
        
        if (!userModifiedPurpose && paymentItems.length > 0) {
            const newPurpose = generatePurposeFromItems(paymentItems);
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
                if (item.metadata?.is_clearance_fee || item.category === 'clearance') {
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
            
            if (updatedItems.some(item => item.metadata?.is_clearance_fee)) {
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

    const isClearancePayment = useMemo(() => {
        const hasClearanceItems = paymentItems.some(item => 
            item.metadata?.is_clearance_fee || 
            item.category === 'clearance' ||
            item.fee_code?.toUpperCase().includes('CLEARANCE')
        );
        
        const hasClearanceOutstandingFees = payerOutstandingFees.some(fee => 
            fee.category === 'clearance' || 
            fee.fee_type_category === 'clearance' ||
            fee.fee_code?.toUpperCase().includes('CLEARANCE') ||
            fee.fee_type_name?.toLowerCase().includes('clearance') ||
            fee.fee_type_name?.toLowerCase().includes('certificate')
        );
        
        const isClearance = !!pre_filled_data?.clearance_request_id || 
               hasClearanceItems ||
               hasClearanceOutstandingFees ||
               !!data.clearance_type ||
               !!data.clearance_type_id ||
               !!data.clearance_code ||
               !!clearance_request ||
               payerSource === 'clearance' ||
               !!data.clearance_request_id;
        
        return isClearance;
    }, [pre_filled_data, paymentItems, payerOutstandingFees, data.clearance_type, data.clearance_type_id, data.clearance_code, data.clearance_request_id, clearance_request, payerSource]);

    /**
     * FIXED: Form validation with calculation checks
     */
    const validateFormData = (): boolean => {
        console.log('🔍 [FIXED] Validating form data');
        
        // Check items
        if (!data.items || data.items.length === 0) {
            alert('Please add at least one payment item');
            return false;
        }
        
        // Validate each item's calculations
        let calculationErrors: string[] = [];
        
        data.items.forEach((item, index) => {
            const calculatedTotal = item.base_amount + item.surcharge + item.penalty - item.discount;
            const diff = Math.abs(calculatedTotal - item.total_amount);
            
            if (diff > 0.01) {
                calculationErrors.push(
                    `Item ${index + 1} (${item.fee_name}): ` +
                    `Calculated total ₱${calculatedTotal.toFixed(2)} doesn't match item total ₱${item.total_amount.toFixed(2)}`
                );
            }
        });
        
        if (calculationErrors.length > 0) {
            console.error('❌ Calculation errors:', calculationErrors);
            alert('Payment calculation errors:\n' + calculationErrors.join('\n'));
            return false;
        }
        
        // Validate overall totals
        const calculatedTotal = data.subtotal + data.surcharge + data.penalty - data.discount;
        const totalDiff = Math.abs(calculatedTotal - data.total_amount);
        
        if (totalDiff > 0.01) {
            console.error('❌ Total amount mismatch:', {
                calculatedTotal,
                storedTotal: data.total_amount,
                diff: totalDiff
            });
            alert(`Total amount mismatch: Calculated ₱${calculatedTotal.toFixed(2)} vs Stored ₱${data.total_amount.toFixed(2)}`);
            return false;
        }
        
        // Other validations
        if (!data.payer_id || String(data.payer_id).trim() === '') {
            alert('Missing payer information. Please go back to step 1 and select a payer.');
            return false;
        }
        
        if (!data.payer_name || data.payer_name.trim() === '') {
            alert('Missing payer name. Please go back to step 1 and select a payer.');
            return false;
        }
        
        if (!data.payment_date || data.payment_date.trim() === '') {
            alert('Payment date is required');
            return false;
        }
        
        if (!data.total_amount || data.total_amount <= 0) {
            alert('Total amount must be greater than 0');
            return false;
        }
        
        if (!data.purpose || data.purpose.trim() === '') {
            alert('Purpose of payment is required');
            return false;
        }
        
        console.log('✅ Form validation passed');
        return true;
    };

    const submit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        
        console.log('📤 [FIXED] Form submission triggered');
        
        if (!validateFormData()) {
            return;
        }
        
        const submissionData = {
            ...data,
            clearance_request_id: data.clearance_request_id || null,
            ...(isClearancePayment && {
                clearance_type: data.clearance_type || '',
                clearance_type_id: data.clearance_type_id || '',
                clearance_code: data.clearance_code || '',
                is_cleared: data.is_cleared || false,
                validity_date: data.validity_date || '',
            }),
            items: data.items?.map(item => ({
                ...item,
                item_type: item.metadata?.is_clearance_fee ? 'clearance' : 'fee',
                outstanding_fee_id: item.metadata?.is_outstanding_fee ? item.fee_id : null,
                metadata: item.metadata
            })) || []
        };
        
        console.log('🚀 Submitting form with validated data');
        
        post('/payments', submissionData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('✅ Payment submitted successfully');
                resetForm();
            },
            onError: (errors) => {
                console.error('❌ Payment submission errors:', errors);
                
                if (errors.payer_id) {
                    alert(`Error: ${errors.payer_id}. Please go back to step 1 and select a payer.`);
                } else if (errors.payer_name) {
                    alert(`Error: ${errors.payer_name}. Please ensure payer name is valid.`);
                } else if (errors.total_amount) {
                    alert(`Error: ${errors.total_amount}. Please check the payment amount.`);
                } else if (errors.purpose) {
                    alert(`Error: ${errors.purpose}. Please enter a valid purpose.`);
                } else if (errors.clearance_type_id) {
                    alert(`Error: ${errors.clearance_type_id}. Please select a valid clearance type.`);
                } else if (errors.clearance_request_id) {
                    alert(`Error with clearance request: ${errors.clearance_request_id}`);
                } else if (errors.items) {
                    alert(`Error with payment items: ${errors.items}. Please add at least one payment item.`);
                } else {
                    alert('Failed to process payment. Please check all required fields and try again.');
                }
            },
        });
    };

    const resetForm = () => {
        console.log('🔄 Resetting form');
        
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
        };
        
        setData(resetData);
        
        setSelectedPayer(null);
        setPayerOutstandingFees([]);
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
        setStep(1);
        setPayerSource('residents');
        setUserModifiedPurpose(false);
    };

    return (
        <AppLayout
            title="Record Payment"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Payments', href: '/payments' },
                { title: 'Record Payment', href: '/payments/create' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/payments">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Payments
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Record New Payment</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Collect payment for barangay fees and services
                            </p>
                            {isClearancePayment && (
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                    <FileCheck className="h-3 w-3" />
                                    <span>Clearance Payment</span>
                                    {data.clearance_request_id && (
                                        <span className="text-xs">(Request ID: {data.clearance_request_id})</span>
                                    )}
                                    {clearance_request?.reference_number && (
                                        <span className="text-xs">({clearance_request.reference_number})</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            type="submit" 
                            form="paymentForm"
                            disabled={processing || paymentItems.length === 0}
                            className="min-w-[160px]"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Processing...' : 'Complete Payment'}
                        </Button>
                    </div>
                </div>

                {/* Progress Indicator */}
                <ProgressIndicator step={step} onStepClick={handleStepClick} />

                <form id="paymentForm" onSubmit={submit}>
                    {/* Step 1: Select Payer with Tabs */}
                    {step === 1 && (
                        <PayerSelectionStep
                            residents={residents}
                            households={households}
                            clearanceRequests={clearance_requests || []}
                            fees={outstandingFeesForTab}
                            payerSource={payerSource}
                            setPayerSource={setPayerSource}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSelectPayer={handleSelectPayer}
                            handleManualPayer={handleManualPayer}
                            preSelectedPayerId={pre_filled_data?.payer_id}
                            preSelectedPayerType={pre_filled_data?.payer_type}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            clearanceTypes={clearanceTypes}
                        />
                    )}

                    {/* Step 2: Add Fees */}
                    {step === 2 && (
                        <AddFeesStep
                            data={data}
                            setStep={setStep}
                            selectedFee={selectedOutstandingFee}
                            showLateSettings={showLateSettings}
                            isLatePayment={isLatePayment}
                            setIsLatePayment={setIsLatePayment}
                            monthsLate={monthsLate}
                            setMonthsLate={setMonthsLate}
                            onFeeClick={handleOutstandingFeeClick}
                            onAddWithLateSettings={handleAddOutstandingFeeWithLateSettings}
                            onCancelLateSettings={handleCancelLateSettings}
                            onDirectAddFee={handleAddOutstandingFeeDirectly}
                            paymentItems={paymentItems}
                            removePaymentItem={removePaymentItem}
                            payerOutstandingFees={payerOutstandingFees}
                            feeTypes={feeTypes}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            clearanceTypes={clearanceTypes}
                            clearanceTypesDetails={clearanceTypesDetails}
                            payerSource={payerSource}
                        />
                    )}

                    {/* Step 3: Payment Details */}
                    {step === 3 && (
                        <PaymentDetailsStep
                            data={data}
                            setData={setData}
                            setStep={setStep}
                            paymentItems={paymentItems}
                            selectedDiscountType={selectedDiscountType}
                            handleDiscountTypeChange={handleDiscountTypeChange}
                            discountTypes={discountTypes}
                            processing={processing}
                            handlePurposeChange={handlePurposeChange}
                            handlePeriodCoveredChange={handlePeriodCoveredChange}
                            handleClearanceTypeChange={handleClearanceTypeChange}
                            userModifiedPurpose={userModifiedPurpose}
                            setUserModifiedPurpose={setUserModifiedPurpose}
                            generatePurpose={() => generatePurposeFromItems(paymentItems)}
                            clearanceTypes={clearanceTypes}
                            clearanceTypesDetails={clearanceTypesDetails}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            getClearanceTypeName={getClearanceTypeName}
                        />
                    )}
                </form>
            </div>
        </AppLayout>
    );
}