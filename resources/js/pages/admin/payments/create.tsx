// Replace the entire CreatePayment.tsx with this version:

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

// Define types (keep as is)
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

interface OutstandingFee {
    id: string | number;
    fee_type_id: string | number;
    fee_type?: FeeType;
    fee_code: string;
    payer_name: string;
    due_date: string;
    base_amount: string;
    surcharge_amount: string;
    penalty_amount: string;
    discount_amount: string;
    amount_paid: string;
    balance: string;
    status: string;
    purpose?: string;
    fee_type_name?: string;
    fee_type_category?: string;
    payer_type?: string;
    payer_id?: string | number;
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
    fees: FeeType[];
    discountTypes?: Record<string, string>;
    pre_filled_data?: PreFilledFeeData;
    clearance_request?: ClearanceRequest | null;
    clearance_fee_type?: any;
    clearanceTypes?: Record<string, string>;
    clearanceTypesDetails?: ClearanceType[];
    clearance_requests?: ClearanceRequest[];
}

// Helper functions (keep as is)
function generateORNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BAR-${year}${month}${day}-${random}`;
}

function parseCurrencyString(amountString: string): number {
    if (!amountString || amountString.trim() === '') return 0;
    const parsed = parseFloat(amountString.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
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

export default function CreatePayment() {
    const { 
        residents, 
        households, 
        fees, 
        discountTypes = {}, 
        pre_filled_data, 
        clearance_request,
        clearanceTypes = {},
        clearanceTypesDetails = [],
        clearance_requests = []
    } = usePage<PageProps>().props;
    
    // State for multi-step process
    const [step, setStep] = useState<number>(1);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | ClearanceRequest | FeeType | null>(null);
    const [payerSource, setPayerSource] = useState<'residents' | 'households' | 'clearance' | 'fees'>(
        pre_filled_data?.clearance_request_id ? 'clearance' : 'residents'
    );
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // CRITICAL CHANGE: Use a single source of truth for items
    const [selectedOutstandingFee, setSelectedOutstandingFee] = useState<OutstandingFee | null>(null);
    const [isLatePayment, setIsLatePayment] = useState<boolean>(false);
    const [monthsLate, setMonthsLate] = useState<number>(1);
    const [showLateSettings, setShowLateSettings] = useState<boolean>(false);
    const [selectedDiscountType, setSelectedDiscountType] = useState<string>('');
    const [userModifiedPurpose, setUserModifiedPurpose] = useState<boolean>(false);
    
    // Store payer's outstanding fees
    const [payerOutstandingFees, setPayerOutstandingFees] = useState<OutstandingFee[]>([]);
    
    // Initialize form data with proper defaults - FIXED: Include clearance_request_id from pre_filled_data
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
        clearance_request_id: pre_filled_data?.clearance_request_id || undefined, // FIXED: Include from pre_filled_data
    };

    const { data, setData, post, processing, errors } = useForm<PaymentFormData & { [key: string]: any }>(initialFormData);

    // Debug: Track when data changes
    useEffect(() => {
        console.log('📊 Form data updated:', {
            clearance_request_id: data.clearance_request_id,
            clearance_type: data.clearance_type,
            clearance_type_id: data.clearance_type_id,
            itemsCount: data.items?.length || 0,
            total_amount: data.total_amount
        });
    }, [data.clearance_request_id, data.clearance_type, data.clearance_type_id, data.items, data.total_amount]);

    // Get payment items from form data (single source of truth)
    const paymentItems = useMemo(() => {
        return data.items || [];
    }, [data.items]);

    // Calculate totals from items
    const calculateTotalsFromItems = useCallback((items: PaymentItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.base_amount, 0);
        const surcharge = items.reduce((sum, item) => sum + item.surcharge, 0);
        const penalty = items.reduce((sum, item) => sum + item.penalty, 0);
        const discount = items.reduce((sum, item) => sum + item.discount, 0);
        const total = subtotal + surcharge + penalty - discount;
        
        return { subtotal, surcharge, penalty, discount, total_amount: total };
    }, []);

    // Update items and totals in form data
    const updateItems = useCallback((items: PaymentItem[]) => {
        console.log('🔄 Updating form data items:', {
            itemsCount: items.length,
            items: items,
            currentClearanceRequestId: data.clearance_request_id
        });
        
        const totals = calculateTotalsFromItems(items);
        
        // Update all at once to avoid state sync issues
        const updatedData = {
            ...data,
            items: items,
            subtotal: totals.subtotal,
            surcharge: totals.surcharge,
            penalty: totals.penalty,
            discount: totals.discount,
            total_amount: totals.total_amount,
        };
        
        setData(updatedData);
        
        console.log('✅ Form data updated:', {
            itemsInData: updatedData.items?.length || 0,
            total_amount: updatedData.total_amount,
            clearance_request_id: updatedData.clearance_request_id
        });
    }, [data, setData, calculateTotalsFromItems]);

    // Handle pre-filled data on mount
    useEffect(() => {
        console.log('🚀 Initialization Effect Running', {
            step,
            hasPreFilledData: !!pre_filled_data,
            hasClearanceRequest: !!clearance_request,
            currentPayerId: data.payer_id,
            currentPayerName: data.payer_name,
            pre_filled_data,
            clearance_request,
            initialClearanceRequestId: initialFormData.clearance_request_id
        });

        // If we have a clearance request, handle it first
        if (clearance_request) {
            console.log('📋 Processing clearance request...');
            handleClearanceRequest();
            setPayerSource('clearance');
            setSelectedPayer(clearance_request);
        }
        // Otherwise, handle regular pre-filled fee
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
            
            // Auto-advance to step 2 if we have a payer
            setTimeout(() => {
                setStep(2);
            }, 100);
        }
    }, []);

    // Handle clearance request
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
        
        // Create clearance fee item
        const feeAmount = typeof clearance_request.fee_amount === 'string' 
            ? parseCurrencyString(clearance_request.fee_amount)
            : Number(clearance_request.fee_amount || 0);
            
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
                clearance_request_id: clearance_request.id, // FIXED: Include clearance_request_id in metadata
                clearance_type_id: clearanceTypeId,
                clearance_type_code: clearanceTypeCode,
            }
        };
        
        // Update form data with payer info and items
        const updatedData = {
            payer_type: 'resident',
            payer_id: clearance_request.resident_id,
            payer_name: residentPayer.name || clearance_request.resident?.name || 'Unknown',
            contact_number: residentPayer.contact_number || clearance_request.resident?.contact_number || '',
            address: residentPayer.address || clearance_request.resident?.address || '',
            household_number: residentPayer.household_number || clearance_request.resident?.household_number || '',
            purok: residentPayer.purok || clearance_request.resident?.purok || '',
            
            items: [clearanceFeeItem], // DIRECTLY SET ITEMS HERE
            
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
            clearance_request_id: clearance_request.id, // FIXED: Set clearance_request_id
        };
        
        setData(updatedData);
        setSelectedPayer(clearance_request);
        setPayerOutstandingFees(residentPayer.outstanding_fees || []);
        
        console.log('✅ Clearance request processed:', {
            clearance_request_id: updatedData.clearance_request_id,
            itemsInData: updatedData.items.length,
            item: clearanceFeeItem
        });
        
        // Auto-advance to step 2
        setTimeout(() => {
            setStep(2);
        }, 100);
        
    }, [clearance_request, residents, clearanceTypes, clearanceTypesDetails, setData]);

    // Handle step navigation
    const handleStepClick = (stepNumber: number): void => {
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

    // SIMPLIFIED PAYER SELECTION HANDLERS
    const handleSelectPayer = (payer: Resident | Household | ClearanceRequest | FeeType): void => {
        console.log('👤 Payer selected from source:', payerSource);
        
        setSelectedPayer(payer);
        
        if (payerSource === 'residents') {
            handleResidentPayer(payer as Resident);
        } else if (payerSource === 'households') {
            handleHouseholdPayer(payer as Household);
        } else if (payerSource === 'clearance') {
            handleClearanceTabPayer(payer as ClearanceRequest);
        } else if (payerSource === 'fees') {
            handleFeeTypePayer(payer as FeeType);
        }
        
        // Auto-advance to step 2
        setTimeout(() => {
            setStep(2);
        }, 100);
    };

    const handleResidentPayer = (resident: Resident) => {
        console.log('👤 Handling resident payer:', {
            residentId: resident.id,
            residentName: resident.name
        });
        
        setPayerOutstandingFees(resident.outstanding_fees || []);
        
        // Check if resident has pending clearance requests
        const residentClearanceRequests = clearance_requests?.filter(cr => 
            cr.resident_id == resident.id && 
            cr.can_be_paid && 
            !cr.already_paid
        ) || [];
        
        const hasClearanceRequests = residentClearanceRequests.length > 0;
        
        // Start with basic payer info
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
        
        // If resident has clearance requests, auto-select the first one
        if (hasClearanceRequests && !clearance_request) {
            const firstRequest = residentClearanceRequests[0];
            const clearanceTypeCode = firstRequest.clearance_type?.code || 'BRGY_CLEARANCE';
            const clearanceTypeDetail = clearanceTypesDetails.find(
                type => type.code === clearanceTypeCode
            );
            
            const feeAmount = typeof firstRequest.fee_amount === 'string' 
                ? parseCurrencyString(firstRequest.fee_amount)
                : Number(firstRequest.fee_amount || 0);
                
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
                    clearance_request_id: firstRequest.id, // FIXED: Include clearance_request_id
                    clearance_type_id: clearanceTypeDetail?.id || firstRequest.clearance_type_id,
                    clearance_type_code: clearanceTypeCode,
                }
            };
            
            // Add clearance-specific fields
            updatedData.clearance_request_id = firstRequest.id; // FIXED: Set clearance_request_id
            updatedData.clearance_type = clearanceTypeCode;
            updatedData.clearance_type_id = clearanceTypeDetail?.id || firstRequest.clearance_type_id;
            updatedData.clearance_code = clearanceTypeCode;
            updatedData.purpose = clearanceTypeDetail?.name || clearanceTypes[clearanceTypeCode] || 'Clearance Fee';
            updatedData.items = [clearanceFeeItem];
            updatedData.subtotal = feeAmount;
            updatedData.total_amount = feeAmount;
            
            console.log('✅ Auto-selected clearance request:', {
                clearance_request_id: firstRequest.id,
                clearance_type: clearanceTypeCode
            });
        } else {
            // No clearance request, start with empty items
            updatedData.items = [];
            updatedData.subtotal = 0;
            updatedData.total_amount = 0;
            // Clear any existing clearance request ID if no clearance requests
            if (!clearance_request) {
                updatedData.clearance_request_id = undefined;
            }
        }
        
        setData(updatedData);
    };

    const handleHouseholdPayer = (household: Household) => {
        setPayerOutstandingFees(household.outstanding_fees || []);
        
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
            clearance_request_id: undefined, // Clear clearance_request_id for household payers
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
        
        const feeAmount = typeof clearancePayer.fee_amount === 'string' 
            ? parseCurrencyString(clearancePayer.fee_amount)
            : Number(clearancePayer.fee_amount || 0);
            
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
                clearance_request_id: clearancePayer.id, // FIXED: Include clearance_request_id
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
            clearance_request_id: clearancePayer.id, // FIXED: Set clearance_request_id
            items: [clearanceFeeItem],
            subtotal: feeAmount,
            total_amount: feeAmount,
        };
        
        console.log('✅ Clearance tab payer processed:', {
            clearance_request_id: updatedData.clearance_request_id,
            items: updatedData.items?.length || 0
        });
        
        setData(updatedData);
        setPayerOutstandingFees(residentPayer.outstanding_fees || []);
    };

    const handleFeeTypePayer = (feeType: FeeType) => {
        const baseAmount = typeof feeType.base_amount === 'string'
            ? parseCurrencyString(feeType.base_amount)
            : Number(feeType.base_amount || 0);
            
        const feeTypeItem: PaymentItem = {
            id: Date.now(),
            fee_id: feeType.id,
            fee_name: feeType.name,
            fee_code: feeType.code,
            description: feeType.description || `Payment for ${feeType.name}`,
            base_amount: baseAmount,
            surcharge: 0,
            penalty: 0,
            discount: 0,
            total_amount: baseAmount,
            category: feeType.category,
            period_covered: '',
            months_late: 0,
        };
        
        const updatedData = {
            ...data,
            payer_type: 'other',
            payer_id: `fee-type-${feeType.id}`,
            payer_name: feeType.name,
            contact_number: '',
            address: '',
            household_number: '',
            purok: '',
            purpose: `Payment for ${feeType.name}`,
            items: [feeTypeItem],
            subtotal: baseAmount,
            total_amount: baseAmount,
            clearance_request_id: undefined, // Clear clearance_request_id for fee type payers
        };
        
        setData(updatedData);
        setPayerOutstandingFees([]);
    };

    // Handle manual payer entry
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
            clearance_request_id: undefined, // Clear clearance_request_id for manual payers
        };
        
        setData(updatedData);
        setSelectedPayer(null);
        setPayerOutstandingFees([]);
        setPayerSource('residents');
        setStep(2);
    };

    // Existing fee handling functions
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
        const feeType = fees.find(f => f.id === fee.fee_type_id);
        
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

    const handleAddOutstandingFeeDirectly = (outstandingFee: OutstandingFee): void => {
        console.log('📦 Adding outstanding fee directly', {
            feeId: outstandingFee.id,
            currentClearanceRequestId: data.clearance_request_id
        });
        
        if (!isValidDate(outstandingFee.due_date)) {
            alert(`Error: Invalid due date format for fee ${outstandingFee.fee_code}`);
            return;
        }
        
        const baseAmount = parseCurrencyString(outstandingFee.base_amount);
        const surchargeAmount = parseCurrencyString(outstandingFee.surcharge_amount);
        const penaltyAmountFromDB = parseCurrencyString(outstandingFee.penalty_amount);
        const discountAmount = parseCurrencyString(outstandingFee.discount_amount);
        
        const dueDate = new Date(outstandingFee.due_date);
        const paymentDate = new Date(data.payment_date);
        const isPaymentLate = paymentDate > dueDate;
        
        const finalPenalty = isPaymentLate ? penaltyAmountFromDB : 0;
        const monthsLateValue = isPaymentLate ? calculateMonthsLate(outstandingFee.due_date, paymentDate) : 0;
        const totalItemAmount = baseAmount + surchargeAmount + finalPenalty - discountAmount;
        
        const feeName = outstandingFee.fee_type_name || outstandingFee.fee_type?.name || 'Fee';
        const feeCategory = outstandingFee.fee_type_category || outstandingFee.fee_type?.category || 'other';
        
        const newItem: PaymentItem = {
            id: Date.now(),
            fee_id: outstandingFee.id,
            fee_name: feeName,
            fee_code: outstandingFee.fee_code,
            description: outstandingFee.purpose || `Payment for ${feeName}`,
            base_amount: baseAmount,
            surcharge: surchargeAmount,
            penalty: finalPenalty,
            discount: discountAmount,
            total_amount: totalItemAmount,
            category: feeCategory,
            period_covered: '',
            months_late: monthsLateValue,
            metadata: {
                is_outstanding_fee: true,
                original_fee_id: outstandingFee.id,
                payer_type: outstandingFee.payer_type,
                payer_id: outstandingFee.payer_id,
            }
        };
        
        // Check if this is a clearance fee
        const isClearanceFee = feeCategory === 'clearance' || 
                              outstandingFee.fee_code?.includes('CLEARANCE') ||
                              feeName?.toLowerCase().includes('clearance') ||
                              feeName?.toLowerCase().includes('certificate');
        
        if (isClearanceFee && !data.clearance_type) {
            let clearanceTypeCode = outstandingFee.fee_code || 'BRGY_CLEARANCE';
            
            if (clearanceTypeCode.includes('_CLEARANCE')) {
                // Already in correct format
            } else if (feeName.toLowerCase().includes('nbi')) {
                clearanceTypeCode = 'NBI_CLEARANCE';
            } else if (feeName.toLowerCase().includes('business')) {
                clearanceTypeCode = 'BUSINESS_CLEARANCE';
            } else if (feeName.toLowerCase().includes('indigency') || feeName.toLowerCase().includes('indigent')) {
                clearanceTypeCode = 'INDIGENCY_CERT';
            } else if (feeName.toLowerCase().includes('barangay') || feeName.toLowerCase().includes('brgy')) {
                clearanceTypeCode = 'BRGY_CLEARANCE';
            }
            
            const clearanceTypeDetail = clearanceTypesDetails.find(
                type => type.code === clearanceTypeCode
            );
            
            if (clearanceTypeDetail) {
                // Preserve existing clearance_request_id if any
                const clearanceRequestId = data.clearance_request_id;
                
                const updatedData = {
                    ...data,
                    clearance_type: clearanceTypeDetail.code,
                    clearance_type_id: clearanceTypeDetail.id,
                    clearance_code: clearanceTypeDetail.code,
                    clearance_request_id: clearanceRequestId, // Preserve existing
                };
                
                if (!userModifiedPurpose) {
                    updatedData.purpose = clearanceTypeDetail.name || feeName;
                }
                
                setData(updatedData);
                
                newItem.metadata = {
                    ...newItem.metadata,
                    is_clearance_fee: true,
                    clearance_type_id: clearanceTypeDetail.id,
                    clearance_type_code: clearanceTypeDetail.code,
                    clearance_request_id: clearanceRequestId, // Include in metadata too
                };
            }
        } else if (isClearanceFee && data.clearance_request_id) {
            // If it's a clearance fee and we already have a clearance_request_id, include it
            newItem.metadata = {
                ...newItem.metadata,
                is_clearance_fee: true,
                clearance_request_id: data.clearance_request_id,
                clearance_type_id: data.clearance_type_id,
                clearance_type_code: data.clearance_code,
            };
        }
        
        const updatedItems = [...paymentItems, newItem];
        console.log('🔄 Adding new item, total items:', {
            newItem: newItem,
            updatedItemsCount: updatedItems.length,
            clearance_request_id: data.clearance_request_id
        });
        
        // Update form data with new items
        updateItems(updatedItems);
        
        if (!userModifiedPurpose && !data.purpose.includes('Clearance')) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            setData('purpose', newPurpose);
        }
    };

    const handleAddOutstandingFeeWithLateSettings = (): void => {
        if (!selectedOutstandingFee) return;
        
        // ... existing code for late payment calculation ...
        
        // After calculation, add the fee
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
        
        const itemToRemove = paymentItems.find(item => item.id === id);
        const updatedItems = paymentItems.filter(item => item.id !== id);
        
        console.log('🔄 Updated items after removal:', {
            removedItem: itemToRemove,
            updatedItemsCount: updatedItems.length,
            currentClearanceRequestId: data.clearance_request_id
        });
        
        // Update form data with removed items
        updateItems(updatedItems);
        
        if (!userModifiedPurpose && updatedItems.length > 0) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            setData('purpose', newPurpose);
        } else if (updatedItems.length === 0) {
            setData('purpose', '');
        }
        
        // If removing a clearance fee and it was the only one, clear clearance request ID
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
                    clearance_request_id: undefined, // Clear clearance_request_id
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
            
            // Update clearance type in all clearance items
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

    // Check if this is a clearance payment
    const isClearancePayment = useMemo(() => {
        const hasClearanceItems = paymentItems.some(item => 
            item.metadata?.is_clearance_fee || 
            item.category === 'clearance' ||
            item.fee_code?.includes('CLEARANCE')
        );
        
        const hasClearanceOutstandingFees = payerOutstandingFees.some(fee => 
            fee.category === 'clearance' || 
            fee.fee_type_category === 'clearance' ||
            fee.fee_code?.includes('CLEARANCE') ||
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
               !!data.clearance_request_id; // ADDED: Check clearance_request_id
        
        console.log('🔍 isClearancePayment check:', {
            isClearance,
            clearance_request_id: data.clearance_request_id,
            pre_filled_clearance_request_id: pre_filled_data?.clearance_request_id,
            hasClearanceItems,
            hasClearanceType: !!data.clearance_type,
            payerSource
        });
        
        return isClearance;
    }, [pre_filled_data, paymentItems, payerOutstandingFees, data.clearance_type, data.clearance_type_id, data.clearance_code, data.clearance_request_id, clearance_request, payerSource]);

    // Handle form submission - ENHANCED VERSION
    const submit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        
        console.log('📤 Form submission triggered');
        console.log('📋 Final form data check:', {
            items: data.items,
            itemsCount: data.items?.length || 0,
            total_amount: data.total_amount,
            payer_id: data.payer_id,
            payer_name: data.payer_name,
            clearance_request_id: data.clearance_request_id, // Added for debugging
            clearance_type: data.clearance_type,
            clearance_type_id: data.clearance_type_id,
            isClearancePayment: isClearancePayment
        });
        
        // Validate form data
        if (!validateFormData()) {
            return;
        }
        
        // Prepare submission data with all necessary fields
        const submissionData = {
            ...data,
            // Ensure clearance_request_id is included if we have one
            clearance_request_id: data.clearance_request_id || null,
            // Include other clearance fields for clearance payments
            ...(isClearancePayment && {
                clearance_type: data.clearance_type || '',
                clearance_type_id: data.clearance_type_id || '',
                clearance_code: data.clearance_code || '',
                is_cleared: data.is_cleared || false,
                validity_date: data.validity_date || '',
            }),
            // Ensure items have proper metadata
            items: data.items?.map(item => ({
                ...item,
                metadata: {
                    ...item.metadata,
                    // Ensure clearance_request_id is in item metadata if we have one
                    ...(data.clearance_request_id && (item.metadata?.is_clearance_fee || item.category === 'clearance') && {
                        clearance_request_id: data.clearance_request_id
                    })
                }
            })) || []
        };
        
        console.log('🚀 Submitting form with data:', {
            ...submissionData,
            itemsCount: submissionData.items?.length || 0
        });
        
        // Submit the form
        post('/payments', submissionData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('✅ Payment submitted successfully');
                resetForm();
            },
            onError: (errors) => {
                console.error('❌ Payment submission errors:', errors);
                console.error('📋 Full errors object:', errors);
                
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

    const validateFormData = (): boolean => {
        console.log('🔍 Validating form data:', {
            items: data.items,
            itemsCount: data.items?.length || 0,
            clearance_request_id: data.clearance_request_id,
            isClearancePayment: isClearancePayment
        });
        
        // Check if we have items
        if (!data.items || data.items.length === 0) {
            alert('Please add at least one payment item');
            return false;
        }
        
        // Check payer information
        if (!data.payer_id || String(data.payer_id).trim() === '') {
            alert('Missing payer information. Please go back to step 1 and select a payer.');
            return false;
        }
        
        if (!data.payer_name || data.payer_name.trim() === '') {
            alert('Missing payer name. Please go back to step 1 and select a payer.');
            return false;
        }
        
        // Check payment date
        if (!data.payment_date || data.payment_date.trim() === '') {
            alert('Payment date is required');
            return false;
        }
        
        // Check total amount
        if (!data.total_amount || data.total_amount <= 0) {
            alert('Total amount must be greater than 0');
            return false;
        }
        
        // Check purpose
        if (!data.purpose || data.purpose.trim() === '') {
            alert('Purpose of payment is required');
            return false;
        }
        
        // For clearance payments, check clearance_request_id if we have clearance items
        if (isClearancePayment) {
            const hasClearanceItems = data.items?.some(item => 
                item.metadata?.is_clearance_fee || 
                item.category === 'clearance'
            );
            
            if (hasClearanceItems && !data.clearance_request_id) {
                console.warn('⚠️ Clearance payment without clearance_request_id:', {
                    hasClearanceItems,
                    clearance_request_id: data.clearance_request_id
                });
                // Don't fail validation, just log warning
            }
        }
        
        console.log('✅ Form validation passed');
        return true;
    };

    const resetForm = () => {
        console.log('🔄 Resetting form');
        
        // Reset form data
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
        
        // Reset other states
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
                            type="button" 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                console.log('📋 Debug Form Data:', {
                                    dataItems: data.items,
                                    dataItemsCount: data.items?.length || 0,
                                    dataItemsArray: data.items,
                                    total_amount: data.total_amount,
                                    clearance_request_id: data.clearance_request_id,
                                    clearance_type: data.clearance_type,
                                    clearance_type_id: data.clearance_type_id,
                                    validation: validateFormData()
                                });
                                alert(`Items in form data: ${data.items?.length || 0}\nTotal amount: ${data.total_amount}\nClearance Request ID: ${data.clearance_request_id || 'None'}`);
                            }}
                        >
                            Debug Form
                        </Button>
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
                            feeTypes={fees}
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
                            feeTypes={fees}
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