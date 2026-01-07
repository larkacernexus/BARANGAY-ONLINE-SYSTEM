import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
    applicable_to?: string[];
}

interface OutstandingFee {
    id: string | number;
    fee_type_id: string | number;
    fee_type?: FeeType;
    fee_code: string;
    payer_name: string;
    issue_date: string;
    due_date: string;
    base_amount: string;
    surcharge_amount: string;
    penalty_amount: string;
    discount_amount: string;
    total_amount: string;
    amount_paid: string;
    balance: string;
    status: string;
    purpose?: string;
    remarks?: string;
    billing_period?: string;
    period_start?: string;
    period_end?: string;
    fee_type_name?: string;
    fee_type_category?: string;
    months_overdue?: number;
}

interface ClearanceType {
    id: string | number;
    name: string;
    code: string;
    description?: string;
    fee: number | string;
    processing_days: number;
    validity_days: number;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
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
}

interface Resident {
    id: string | number;
    name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
    outstanding_fees?: OutstandingFee[];
}

interface Household {
    id: string | number;
    head_name: string;
    contact_number?: string;
    address: string;
    household_number: string;
    purok?: string;
    family_members?: number;
    has_outstanding_fees?: boolean;
    outstanding_fee_count?: number;
    total_outstanding_balance?: string;
    outstanding_fees?: OutstandingFee[];
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
        original_surcharge: number;
        original_penalty: number;
        additional_surcharge: number;
        additional_penalty: number;
        is_late_payment: boolean;
        original_total: number;
        is_future_fee: boolean;
        data_warning: boolean;
        is_clearance_fee?: boolean;
        clearance_request_id?: string | number;
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
    certificate_type: string;
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
    issue_date?: string;
    due_date?: string;
    clearance_request_id?: string | number;
    clearance_type_id?: string | number;
    certificate_type?: string;
}

interface PageProps {
    residents: Resident[];
    households: Household[];
    fees: FeeType[];
    discountTypes?: Record<string, string>;
    errors?: Record<string, string>;
    pre_filled_data?: PreFilledFeeData;
    clearance_request?: ClearanceRequest | null;
    clearance_fee_type?: any;
    clearanceTypes?: Record<string, string>;
    
}

// Helper functions
function generateORNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BAR-${year}${month}${day}-${random}`;
}

// Helper function to parse currency strings
function parseCurrencyString(amountString: string): number {
    if (!amountString || amountString.trim() === '') return 0;
    const parsed = parseFloat(amountString.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
}

// Helper to check if fee type has late payment options
const hasLatePaymentOptions = (feeType: FeeType | undefined): boolean => {
    if (!feeType) return false;
    
    const hasLateSettings = feeType.has_surcharge || feeType.has_penalty || 
                           feeType.surcharge_rate || feeType.penalty_rate ||
                           feeType.surcharge_fixed || feeType.penalty_fixed;
    
    return hasLateSettings;
};

// Helper to format currency
function formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

// Helper to calculate months between dates - FIXED VERSION
function calculateMonthsLate(dueDate: string, currentDate: Date = new Date()): number {
    try {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) {
            console.error('Invalid due date:', dueDate);
            return 0;
        }
        
        // Check if due date is in the FUTURE
        if (due > currentDate) {
            console.log(`Due date ${dueDate} is in the future, not late yet. Current: ${currentDate.toISOString().split('T')[0]}`);
            return 0; // Not late yet!
        }
        
        // Calculate months difference
        const months = (currentDate.getFullYear() - due.getFullYear()) * 12 + 
                      (currentDate.getMonth() - due.getMonth());
        
        // Also consider days for partial months
        const daysLate = Math.max(0, Math.floor((currentDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
        
        // If less than a month but at least 1 day late, count as 1 month
        const result = Math.max(0, months + (daysLate > 0 && months === 0 ? 1 : 0));
        
        console.log(`Months late calculation: Due=${dueDate}, Today=${currentDate.toISOString().split('T')[0]}, Result=${result}, DaysLate=${daysLate}`);
        return result;
    } catch (error) {
        console.error('Error calculating months late:', error, 'dueDate:', dueDate);
        return 0;
    }
}

// Helper to check if a date string is valid
function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// ADD THIS HELPER FUNCTION FOR DEDUPLICATION
const getUniqueWarnings = (fees: OutstandingFee[]): string[] => {
    const seen = new Set<string>();
    const warnings: string[] = [];
    
    fees.forEach(fee => {
        if (!isValidDate(fee.due_date)) {
            const warning = `Fee ${fee.fee_code}: Invalid due date format`;
            if (!seen.has(warning)) {
                seen.add(warning);
                warnings.push(warning);
            }
            return;
        }
        
        const dueDate = new Date(fee.due_date);
        const today = new Date();
        const existingPenalty = parseCurrencyString(fee.penalty_amount);
        
        // Check for future fees with penalty
        if (dueDate > today && existingPenalty > 0) {
            const warning = `Fee ${fee.fee_code}: Penalty applied to future-due fee (due ${fee.due_date})`;
            if (!seen.has(warning)) {
                seen.add(warning);
                warnings.push(warning);
            }
        }
        
        // Check for invalid amounts
        const balance = parseCurrencyString(fee.balance);
        if (balance < 0) {
            const warning = `Fee ${fee.fee_code}: Negative balance (₱${Math.abs(balance).toFixed(2)})`;
            if (!seen.has(warning)) {
                seen.add(warning);
                warnings.push(warning);
            }
        }
    });
    
    return warnings;
};

export default function CreatePayment() {
    const { 
        residents, 
        households, 
        fees, 
        discountTypes = {}, 
        pre_filled_data, 
        clearance_request,
        clearance_fee_type,
        clearanceTypes = {},
        clearance_requests = []
    } = usePage<PageProps>().props;
    
    // State for multi-step process
    const [step, setStep] = useState<number>(pre_filled_data?.fee_id || pre_filled_data?.clearance_request_id ? 2 : 1);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | null>(null);
    const [payerType, setPayerType] = useState<string>(pre_filled_data?.payer_type || 'resident');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
    const [selectedOutstandingFee, setSelectedOutstandingFee] = useState<OutstandingFee | null>(null);
    const [isLatePayment, setIsLatePayment] = useState<boolean>(false);
    const [monthsLate, setMonthsLate] = useState<number>(1);
    const [showLateSettings, setShowLateSettings] = useState<boolean>(false);
    const [selectedDiscountType, setSelectedDiscountType] = useState<string>('');
    const [userModifiedPurpose, setUserModifiedPurpose] = useState<boolean>(false);
    const [dataWarnings, setDataWarnings] = useState<string[]>([]);
    
    // Store payer's outstanding fees
    const [payerOutstandingFees, setPayerOutstandingFees] = useState<OutstandingFee[]>([]);
    
    // Initialize form data
    const { data, setData, post, processing, errors } = useForm<PaymentFormData>({
        // Payer information
        payer_type: pre_filled_data?.payer_type || 'resident',
        payer_id: pre_filled_data?.payer_id || '',
        payer_name: pre_filled_data?.payer_name || '',
        contact_number: pre_filled_data?.contact_number || '',
        address: pre_filled_data?.address || '',
        household_number: pre_filled_data?.household_number || '',
        purok: pre_filled_data?.purok || '',
        
        // Payment items
        items: [],
        
        // Payment details
        payment_date: new Date().toISOString().split('T')[0],
        period_covered: '',
        or_number: generateORNumber(),
        payment_method: 'cash',
        reference_number: '',
        
        // Financial totals
        subtotal: 0,
        surcharge: 0,
        penalty: 0,
        discount: 0,
        discount_type: '',
        total_amount: 0,
        
        // Other details
        purpose: pre_filled_data?.clearance_request_id ? (clearance_request?.purpose || 'Clearance Fee') : '',
        remarks: '',
        is_cleared: false,
        certificate_type: pre_filled_data?.certificate_type || '',
        validity_date: '',
        collection_type: 'manual',
        clearance_request_id: pre_filled_data?.clearance_request_id || undefined,
    });

    // Handle pre-filled data when component mounts
    useEffect(() => {
        // Handle regular fee pre-fill
        if (pre_filled_data?.fee_id && !pre_filled_data?.clearance_request_id) {
            if (pre_filled_data.payer_type === 'resident' && pre_filled_data.payer_id) {
                const residentPayer = residents.find(r => r.id === pre_filled_data.payer_id);
                if (residentPayer) {
                    setSelectedPayer(residentPayer);
                    setPayerOutstandingFees(residentPayer.outstanding_fees || []);
                    
                    setData({
                        ...data,
                        payer_type: 'resident',
                        payer_id: residentPayer.id,
                        payer_name: residentPayer.name,
                        contact_number: residentPayer.contact_number || '',
                        address: residentPayer.address || '',
                        household_number: residentPayer.household_number || '',
                        purok: residentPayer.purok || '',
                    });
                }
            } else if (pre_filled_data.payer_type === 'household' && pre_filled_data.payer_id) {
                const householdPayer = households.find(h => h.id === pre_filled_data.payer_id);
                if (householdPayer) {
                    setSelectedPayer(householdPayer);
                    setPayerOutstandingFees(householdPayer.outstanding_fees || []);
                    
                    setData({
                        ...data,
                        payer_type: 'household',
                        payer_id: householdPayer.id,
                        payer_name: householdPayer.head_name,
                        contact_number: householdPayer.contact_number || '',
                        address: householdPayer.address || '',
                        household_number: householdPayer.household_number || '',
                        purok: householdPayer.purok || '',
                    });
                }
            }
        }
        
        // Handle clearance request data
        if (clearance_request) {
            console.log('Setting up clearance request payment:', clearance_request);
            
            // Find the resident in our existing list
            const residentPayer = residents.find(r => r.id === clearance_request.resident_id);
            
            if (residentPayer) {
                setSelectedPayer(residentPayer);
                setPayerOutstandingFees(residentPayer.outstanding_fees || []);
                
                // Update form data with payer info
                setData({
                    ...data,
                    payer_type: 'resident',
                    payer_id: residentPayer.id,
                    payer_name: residentPayer.name,
                    contact_number: residentPayer.contact_number || clearance_request.resident?.contact_number || '',
                    address: residentPayer.address || clearance_request.resident?.address || '',
                    household_number: residentPayer.household_number || '',
                    purok: residentPayer.purok || '',
                    purpose: clearance_request.clearance_type?.name || clearance_request.purpose || 'Clearance Fee',
                    certificate_type: clearance_request.clearance_type?.code || 'clearance',
                    clearance_request_id: clearance_request.id,
                });
                
                // Create clearance fee item
                const clearanceFeeItem: PaymentItem = {
                    id: Date.now(),
                    fee_id: `clearance-${clearance_request.id}`,
                    fee_name: clearance_request.clearance_type?.name || 'Barangay Clearance',
                    fee_code: 'CLEARANCE',
                    description: clearance_request.specific_purpose || clearance_request.purpose || 'Clearance Fee',
                    base_amount: typeof clearance_request.fee_amount === 'string' 
                        ? parseCurrencyString(clearance_request.fee_amount)
                        : Number(clearance_request.fee_amount || 0),
                    surcharge: 0,
                    penalty: 0,
                    discount: 0,
                    total_amount: typeof clearance_request.fee_amount === 'string'
                        ? parseCurrencyString(clearance_request.fee_amount)
                        : Number(clearance_request.fee_amount || 0),
                    category: 'clearance',
                    period_covered: '',
                    months_late: 0,
                    metadata: {
                        original_surcharge: 0,
                        original_penalty: 0,
                        additional_surcharge: 0,
                        additional_penalty: 0,
                        is_late_payment: false,
                        original_total: typeof clearance_request.fee_amount === 'string'
                            ? parseCurrencyString(clearance_request.fee_amount)
                            : Number(clearance_request.fee_amount || 0),
                        is_future_fee: false,
                        data_warning: false,
                        is_clearance_fee: true,
                        clearance_request_id: clearance_request.id,
                    }
                };
                
                setPaymentItems([clearanceFeeItem]);
                
                // Update totals
                const totals = calculateTotalsFromItems([clearanceFeeItem]);
                setData({
                    ...data,
                    items: [clearanceFeeItem],
                    ...totals,
                });
            } else {
                console.warn('Resident not found for clearance request:', clearance_request.resident_id);
            }
        }
    }, [pre_filled_data, residents, households, clearance_request]);

    // Add data warnings check
    useEffect(() => {
        const warnings = getUniqueWarnings(payerOutstandingFees);
        setDataWarnings(warnings);
    }, [payerOutstandingFees]);

    // Calculate totals from items
    const calculateTotalsFromItems = (items: PaymentItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.base_amount, 0);
        const surcharge = items.reduce((sum, item) => sum + (item.surcharge || 0), 0);
        const penalty = items.reduce((sum, item) => sum + item.penalty, 0);
        const discount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
        
        const total = subtotal + surcharge + penalty - discount;
        
        return {
            subtotal,
            surcharge,
            penalty,
            discount,
            total_amount: total,
        };
    };

    // Handle step navigation
    const handleStepClick = (stepNumber: number): void => {
        if (stepNumber === 1) {
            setStep(1);
        } else if (stepNumber === 2) {
            if (data.payer_id && data.payer_name) {
                setStep(2);
            } else {
                alert('Please select a payer first before proceeding to fees.');
            }
        } else if (stepNumber === 3) {
            if (paymentItems.length > 0) {
                setStep(3);
            } else {
                alert('Please add at least one payment item before proceeding to payment details.');
            }
        }
    };

   const handleSelectPayer = (payer: Resident | Household | ClearanceRequest | FeeType): void => {
    if (payerType === 'clearance' && 'reference_number' in payer) {
        // Handle clearance request selection
        const clearancePayer = payer as ClearanceRequest;
        setSelectedPayer(null);
        
        // Find the resident in our list to get their outstanding fees
        const selectedResident = residents.find(r => r.id === clearancePayer.resident_id);
        
        setData({
            ...data,
            payer_type: 'resident',
            payer_id: clearancePayer.resident_id,
            payer_name: clearancePayer.resident?.name || 'Unknown',
            contact_number: clearancePayer.resident?.contact_number || '',
            address: clearancePayer.resident?.address || '',
            household_number: clearancePayer.resident?.household_number || '',
            purok: clearancePayer.resident?.purok || '',
            purpose: clearancePayer.clearance_type?.name || clearancePayer.purpose || 'Clearance Fee',
            certificate_type: clearancePayer.clearance_type?.code || 'clearance',
            clearance_request_id: clearancePayer.id,
        });
        
        // Store any outstanding fees from the resident
        setPayerOutstandingFees(selectedResident?.outstanding_fees || []);
        
        // Auto-create clearance fee item
        const feeAmount = typeof clearancePayer.fee_amount === 'string' 
            ? parseCurrencyString(clearancePayer.fee_amount)
            : Number(clearancePayer.fee_amount || 0);
            
        const clearanceFeeItem: PaymentItem = {
            id: Date.now(),
            fee_id: `clearance-${clearancePayer.id}`,
            fee_name: clearancePayer.clearance_type?.name || 'Barangay Clearance',
            fee_code: 'CLEARANCE',
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
                original_surcharge: 0,
                original_penalty: 0,
                additional_surcharge: 0,
                additional_penalty: 0,
                is_late_payment: false,
                original_total: feeAmount,
                is_future_fee: false,
                data_warning: false,
                is_clearance_fee: true,
                clearance_request_id: clearancePayer.id,
            }
        };
        
        setPaymentItems([clearanceFeeItem]);
        
        // Update totals
        const totals = calculateTotalsFromItems([clearanceFeeItem]);
        setData({
            ...data,
            items: [clearanceFeeItem],
            ...totals,
        });
        
    } else if (payerType === 'fee_type' && 'base_amount' in payer) {
        // Handle fee type selection
        const feeType = payer as FeeType;
        setSelectedPayer(null);
        
        setData({
            ...data,
            payer_type: 'other',
            payer_id: `fee-type-${feeType.id}`,
            payer_name: feeType.name,
            contact_number: '',
            address: '',
            household_number: '',
            purok: '',
            purpose: `Payment for ${feeType.name}`,
            clearance_request_id: undefined,
        });
        
        // Create fee type item
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
            metadata: {
                original_surcharge: 0,
                original_penalty: 0,
                additional_surcharge: 0,
                additional_penalty: 0,
                is_late_payment: false,
                original_total: baseAmount,
                is_future_fee: false,
                data_warning: false,
                is_fee_type: true,
            }
        };
        
        setPaymentItems([feeTypeItem]);
        
        // Update totals
        const totals = calculateTotalsFromItems([feeTypeItem]);
        setData({
            ...data,
            items: [feeTypeItem],
            ...totals,
        });
        
    } else {
        // Handle resident/household selection (existing code)
        setSelectedPayer(payer as Resident | Household);
        
        // Store the payer's outstanding fees
        setPayerOutstandingFees((payer as any).outstanding_fees || []);
        
        if (payerType === 'resident') {
            const residentPayer = payer as Resident;
            setData({
                ...data,
                payer_type: 'resident',
                payer_id: residentPayer.id,
                payer_name: residentPayer.name,
                contact_number: residentPayer.contact_number || '',
                address: residentPayer.address || '',
                household_number: residentPayer.household_number || '',
                purok: residentPayer.purok || '',
                clearance_request_id: undefined,
            });
        } else {
            const householdPayer = payer as Household;
            setData({
                ...data,
                payer_type: 'household',
                payer_id: householdPayer.id,
                payer_name: householdPayer.head_name,
                contact_number: householdPayer.contact_number || '',
                address: householdPayer.address || '',
                household_number: householdPayer.household_number || '',
                purok: householdPayer.purok || '',
                clearance_request_id: undefined,
            });
        }
    }
    
    setStep(2);
};
    // Handle manual payer entry
    const handleManualPayer = (): void => {
        setSelectedPayer(null);
        setPayerOutstandingFees([]);
        setData({
            ...data,
            payer_type: 'other',
            payer_id: 'manual-' + Date.now(),
            payer_name: '',
            contact_number: '',
            address: '',
            household_number: '',
            purok: '',
        });
        setPayerType('other');
        setStep(2);
    };

    // Handle outstanding fee click
    const handleOutstandingFeeClick = (fee: OutstandingFee): void => {
        console.log('Fee clicked:', fee.fee_code);
        
        // Check if fee is already in payment items
        const isAlreadyAdded = paymentItems.some(item => item.fee_id === fee.id);
        if (isAlreadyAdded) {
            console.log('Fee already added, skipping');
            alert('This fee has already been added to the payment.');
            return;
        }
        
        // Validate dates
        if (!isValidDate(fee.due_date)) {
            alert(`Error: Invalid due date format for fee ${fee.fee_code}`);
            return;
        }
        
        // Calculate actual months late based on REAL dates
        const actualMonthsLate = calculateMonthsLate(fee.due_date);
        const hasExistingPenalty = parseCurrencyString(fee.penalty_amount) > 0;
        const dueDate = new Date(fee.due_date);
        const today = new Date();
        const isFutureFee = dueDate > today;
        
        console.log(`Fee analysis:`, {
            code: fee.fee_code,
            issued: fee.issue_date,
            due: fee.due_date,
            actualMonthsLate,
            hasExistingPenalty,
            isFutureDate: isFutureFee,
            baseAmount: parseCurrencyString(fee.base_amount),
            existingPenalty: parseCurrencyString(fee.penalty_amount),
            existingSurcharge: parseCurrencyString(fee.surcharge_amount),
            balance: parseCurrencyString(fee.balance)
        });
        
        // FIXED: Auto-fix future fees with penalties silently
        if (hasExistingPenalty && isFutureFee) {
            console.log(`Auto-fixing: Removing penalty from future fee ${fee.fee_code}`);
            // Don't show alert - just fix it silently
            // The system will automatically remove the penalty in handleAddOutstandingFeeDirectly
        }
        
        // Try to find the fee type from fees list
        const feeType = fees.find(f => f.id === fee.fee_type_id);
        
        // FIXED: Only show late payment modal if fee is ACTUALLY LATE
        // REMOVED: || isFutureFee - Future fees shouldn't show late payment modal!
        const shouldShowModal = hasLatePaymentOptions(feeType) && actualMonthsLate > 0;
        
        if (shouldShowModal) {
            // Show late payment modal
            setSelectedOutstandingFee(fee);
            setShowLateSettings(true);
            setIsLatePayment(actualMonthsLate > 0);
            setMonthsLate(Math.max(1, actualMonthsLate || 1));
        } else {
            // Add directly without modal
            handleAddOutstandingFeeDirectly(fee);
        }
    };

    // Handle adding outstanding fee directly (without modal)
    const handleAddOutstandingFeeDirectly = (outstandingFee: OutstandingFee): void => {
        // Validate dates first
        if (!isValidDate(outstandingFee.due_date)) {
            alert(`Error: Invalid due date format for fee ${outstandingFee.fee_code}`);
            return;
        }
        
        // Convert string amounts to numbers
        const baseAmount = parseCurrencyString(outstandingFee.base_amount);
        const surchargeAmount = parseCurrencyString(outstandingFee.surcharge_amount);
        const penaltyAmount = parseCurrencyString(outstandingFee.penalty_amount);
        const discountAmount = parseCurrencyString(outstandingFee.discount_amount);
        const balanceAmount = parseCurrencyString(outstandingFee.balance);
        
        // Check data integrity
        const dueDate = new Date(outstandingFee.due_date);
        const today = new Date();
        const isFutureFee = dueDate > today;
        
        // Use fee_type_name if available, otherwise use the fee_type?.name
        const feeName = outstandingFee.fee_type_name || outstandingFee.fee_type?.name || 'Fee';
        const feeCategory = outstandingFee.fee_type_category || outstandingFee.fee_type?.category || 'other';
        
        // Calculate months late
        const monthsLateValue = calculateMonthsLate(outstandingFee.due_date);
        
        // FIXED: Don't flag as data warning - just fix it silently
        const newItem: PaymentItem = {
            id: Date.now(),
            fee_id: outstandingFee.id,
            fee_name: feeName,
            fee_code: outstandingFee.fee_code,
            description: outstandingFee.purpose || `Payment for ${feeName}`,
            base_amount: baseAmount,
            surcharge: surchargeAmount,
            penalty: isFutureFee ? 0 : penaltyAmount, // Remove penalty for future fees
            discount: discountAmount,
            total_amount: isFutureFee ? baseAmount + surchargeAmount - discountAmount : balanceAmount,
            category: feeCategory,
            period_covered: `${outstandingFee.issue_date} to ${outstandingFee.due_date}`,
            months_late: monthsLateValue,
            metadata: {
                original_surcharge: surchargeAmount,
                original_penalty: penaltyAmount,
                additional_surcharge: 0,
                additional_penalty: 0,
                is_late_payment: false,
                original_total: balanceAmount,
                is_future_fee: isFutureFee,
                data_warning: false // FIXED: Don't flag as warning
            }
        };
        
        const updatedItems = [...paymentItems, newItem];
        setPaymentItems(updatedItems);
        
        // Update form data
        setData({
            ...data,
            items: updatedItems,
        });
        
        // Auto-generate purpose if user hasn't modified it and not clearance payment
        if (!userModifiedPurpose && !data.purpose.includes('Clearance')) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            setData('purpose', newPurpose);
        }
        
        // Update totals
        const totals = calculateTotalsFromItems(updatedItems);
        setData({
            ...data,
            ...totals,
            items: updatedItems,
        });
        
        console.log('Added fee directly:', newItem);
    };

    // Handle adding outstanding fee with late payment settings
    const handleAddOutstandingFeeWithLateSettings = (): void => {
        if (!selectedOutstandingFee) {
            console.error('No selected outstanding fee');
            return;
        }
        
        console.log('Adding outstanding fee:', selectedOutstandingFee.fee_code);
        
        // Validate dates
        if (!isValidDate(selectedOutstandingFee.due_date)) {
            alert(`Error: Invalid due date format for fee ${selectedOutstandingFee.fee_code}`);
            setSelectedOutstandingFee(null);
            setShowLateSettings(false);
            return;
        }
        
        // Convert string amounts to numbers
        const baseAmount = parseCurrencyString(selectedOutstandingFee.base_amount);
        const existingSurcharge = parseCurrencyString(selectedOutstandingFee.surcharge_amount);
        const existingPenalty = parseCurrencyString(selectedOutstandingFee.penalty_amount);
        const existingDiscount = parseCurrencyString(selectedOutstandingFee.discount_amount);
        
        // Find the fee type
        const feeType = fees.find(f => f.id === selectedOutstandingFee.fee_type_id);
        
        // Calculate ACTUAL months late based on real dates
        const actualMonthsLate = calculateMonthsLate(selectedOutstandingFee.due_date);
        const dueDate = new Date(selectedOutstandingFee.due_date);
        const today = new Date();
        const isFutureFee = dueDate > today;
        
        console.log(`Actual timing:`, {
            dueDate: selectedOutstandingFee.due_date,
            today: today.toISOString().split('T')[0],
            actualMonthsLate,
            isFutureFee,
            existingPenalty
        });
        
        let finalSurcharge = existingSurcharge;
        let finalPenalty = existingPenalty;
        let additionalSurcharge = 0;
        let additionalPenalty = 0;
        let calculatedMonthsLate = actualMonthsLate;
        
        // Handle different scenarios
        if (isLatePayment && feeType) {
            // Scenario 1: Future fee with penalty (data integrity issue)
            if (isFutureFee && existingPenalty > 0) {
                console.warn('Future fee with existing penalty - removing invalid penalty');
                finalPenalty = 0; // Remove the invalid penalty
                // FIXED: Show user-friendly message instead of alarming warning
                alert(`Note: Fee ${selectedOutstandingFee.fee_name} is not yet due (due ${selectedOutstandingFee.due_date}), so no penalty will be applied.`);
            }
            // Scenario 2: Actually late fee
            else if (actualMonthsLate > 0) {
                // Calculate additional surcharge for the actual late period
                if (feeType.has_surcharge) {
                    const additionalMonths = Math.max(0, monthsLate - actualMonthsLate);
                    if (additionalMonths > 0) {
                        if (feeType.surcharge_rate) {
                            additionalSurcharge = baseAmount * (feeType.surcharge_rate / 100) * additionalMonths;
                        } else if (feeType.surcharge_fixed) {
                            additionalSurcharge = feeType.surcharge_fixed * additionalMonths;
                        }
                    }
                }
                
                // Calculate additional penalty ONLY if no existing penalty
                if (feeType.has_penalty && existingPenalty === 0) {
                    if (feeType.penalty_rate) {
                        additionalPenalty = baseAmount * (feeType.penalty_rate / 100);
                    } else if (feeType.penalty_fixed) {
                        additionalPenalty = feeType.penalty_fixed;
                    }
                }
                
                calculatedMonthsLate = monthsLate;
            }
            // Scenario 3: Future fee marked as late (user override) - THIS SHOULD NOT HAPPEN!
            else if (isFutureFee) {
                console.warn('Future fee marked as late payment - but we fixed the modal trigger');
                // This should not happen since we removed isFutureFee from shouldShowModal
                // But if somehow it does, handle gracefully
                alert(`Note: Fee ${selectedOutstandingFee.fee_name} is not yet due (due ${selectedOutstandingFee.due_date}). Late payment charges will not be applied.`);
                setIsLatePayment(false);
            }
            
            console.log(`Charge calculation:`, {
                scenario: isFutureFee ? 'Future fee' : 'Late fee',
                additionalSurcharge,
                additionalPenalty,
                existingPenalty,
                finalPenalty,
                monthsLate: calculatedMonthsLate
            });
        }
        
        // Calculate final amounts
        finalSurcharge = existingSurcharge + additionalSurcharge;
        finalPenalty = isFutureFee && existingPenalty > 0 ? 0 : existingPenalty + additionalPenalty;
        
        const totalItemAmount = baseAmount + finalSurcharge + finalPenalty - existingDiscount;
        
        // Create new item
        const feeName = selectedOutstandingFee.fee_type_name || selectedOutstandingFee.fee_type?.name || 'Fee';
        const feeCategory = selectedOutstandingFee.fee_type_category || selectedOutstandingFee.fee_type?.category || 'other';
        
        const newItem: PaymentItem = {
            id: Date.now(),
            fee_id: selectedOutstandingFee.id,
            fee_name: feeName,
            fee_code: selectedOutstandingFee.fee_code,
            description: selectedOutstandingFee.purpose || `Payment for ${feeName}`,
            base_amount: baseAmount,
            surcharge: finalSurcharge,
            penalty: finalPenalty,
            discount: existingDiscount,
            total_amount: totalItemAmount,
            category: feeCategory,
            period_covered: `${selectedOutstandingFee.issue_date} to ${selectedOutstandingFee.due_date}`,
            months_late: calculatedMonthsLate,
            metadata: {
                original_surcharge: existingSurcharge,
                original_penalty: existingPenalty,
                additional_surcharge: additionalSurcharge,
                additional_penalty: additionalPenalty,
                is_late_payment: isLatePayment && !isFutureFee, // FIXED: Future fees are not late payments
                original_total: parseCurrencyString(selectedOutstandingFee.balance),
                is_future_fee: isFutureFee,
                data_warning: false // FIXED: Don't flag as warning
            }
        };
        
        const updatedItems = [...paymentItems, newItem];
        setPaymentItems(updatedItems);
        
        // Update form data
        setData({
            ...data,
            items: updatedItems,
        });
        
        // Auto-generate purpose if not clearance payment
        if (!userModifiedPurpose && !data.purpose.includes('Clearance')) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            setData('purpose', newPurpose);
        }
        
        // Update totals
        const totals = calculateTotalsFromItems(updatedItems);
        setData({
            ...data,
            ...totals,
            items: updatedItems,
        });
        
        console.log('Fee added with analysis:', {
            fee: selectedOutstandingFee.fee_code,
            isFutureFee,
            hasExistingPenalty: existingPenalty > 0,
            finalPenalty,
            finalAmount: totalItemAmount,
            warning: isFutureFee && existingPenalty > 0 ? 'FUTURE FEE PENALTY FIXED!' : 'OK'
        });
        
        // Reset modal state
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
    };

    // Cancel late payment settings
    const handleCancelLateSettings = (): void => {
        console.log('Canceling late payment settings');
        setSelectedOutstandingFee(null);
        setShowLateSettings(false);
        setIsLatePayment(false);
        setMonthsLate(1);
    };

    // Generate purpose from items
    const generatePurposeFromItems = (items: PaymentItem[]): string => {
        if (items.length === 0) return '';
        
        const itemNames = items.map(item => item.fee_name);
        
        if (items.length === 1) {
            return itemNames[0];
        }
        
        return itemNames.join(', ');
    };

    // Remove payment item
    const removePaymentItem = (id: number): void => {
        const itemToRemove = paymentItems.find(item => item.id === id);
        const updatedItems = paymentItems.filter(item => item.id !== id);
        setPaymentItems(updatedItems);
        
        // Update form data with items
        setData({
            ...data,
            items: updatedItems,
        });
        
        // Auto-update purpose if user hasn't modified it
        if (!userModifiedPurpose && updatedItems.length > 0) {
            const newPurpose = generatePurposeFromItems(updatedItems);
            setData('purpose', newPurpose);
        } else if (updatedItems.length === 0) {
            setData('purpose', '');
        }
        
        // Clear certificate_type and clearance_request_id if removing clearance fee
        if (itemToRemove?.metadata?.is_clearance_fee) {
            setData('certificate_type', '');
            setData('clearance_request_id', undefined);
        }
        
        // Update totals
        const totals = calculateTotalsFromItems(updatedItems);
        setData({
            ...data,
            ...totals,
            items: updatedItems,
        });
    };

    // Handle discount type change
    const handleDiscountTypeChange = (type: string): void => {
        setSelectedDiscountType(type);
        // Update discount in form data
        const totals = calculateTotalsFromItems(paymentItems);
        setData({
            ...data,
            discount_type: type,
            discount: totals.discount,
            total_amount: totals.total_amount,
        });
    };

    // Handle purpose field change
    const handlePurposeChange = (value: string): void => {
        setData('purpose', value);
        if (value !== generatePurposeFromItems(paymentItems)) {
            setUserModifiedPurpose(true);
        }
    };

    // Handle period covered change
    const handlePeriodCoveredChange = (value: string): void => {
        setData('period_covered', value);
        
        // Update purpose with new period if not manually modified
        if (!userModifiedPurpose && paymentItems.length > 0) {
            const newPurpose = generatePurposeFromItems(paymentItems);
            setData('purpose', newPurpose);
        }
    };

    // Handle certificate type change
    const handleCertificateTypeChange = (value: string): void => {
        setData('certificate_type', value);
        
        // If selecting a certificate type and purpose is empty, set default
        if (value && !data.purpose) {
            setData('purpose', `${value} Certificate`);
        }
    };

    // Validate form data before submission
    const validateFormData = (): boolean => {
        console.log('Validating form data:', data);
        
        const requiredFields = [
            'payer_type', 'payer_id', 'payer_name', 'payment_date', 
            'payment_method', 'total_amount', 'purpose'
        ];
        
        const missingFields = requiredFields.filter(field => {
            const value = data[field as keyof PaymentFormData];
            return value === undefined || value === null || value === '';
        });
        
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            alert(`Missing required fields: ${missingFields.join(', ')}`);
            return false;
        }
        
        if (paymentItems.length === 0) {
            alert('Please add at least one payment item');
            return false;
        }
        
        // FIXED: Don't show confusing warning about data integrity
        // Just proceed with payment - the system already fixed the penalties
        
        return true;
    };

    // Handle form submission
    const submit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        
        console.log('Form submission started...');
        console.log('Current form data:', data);
        console.log('Payment items:', paymentItems);
        
        if (!validateFormData()) {
            return;
        }
        
        // Prepare final data for submission
        const formData: any = {
            // Payer information
            payer_type: data.payer_type,
            payer_id: data.payer_id,
            payer_name: data.payer_name,
            contact_number: data.contact_number,
            address: data.address,
            household_number: data.household_number,
            purok: data.purok,
            
            // Payment items
            items: paymentItems.map(item => ({
                ...item,
                fee_record_id: item.fee_id,
            })),
            
            // Payment details
            payment_date: data.payment_date,
            period_covered: data.period_covered,
            or_number: data.or_number,
            payment_method: data.payment_method,
            reference_number: data.reference_number,
            
            // Financial totals
            subtotal: data.subtotal,
            surcharge: data.surcharge,
            penalty: data.penalty,
            discount: data.discount,
            discount_type: data.discount_type,
            total_amount: data.total_amount,
            
            // Other details
            purpose: data.purpose,
            remarks: data.remarks,
            is_cleared: data.is_cleared,
            certificate_type: data.certificate_type,
            validity_date: data.validity_date,
            collection_type: data.collection_type,
        };
        
        // Add clearance request ID if exists
        if (data.clearance_request_id) {
            formData.clearance_request_id = data.clearance_request_id;
        }
        
        console.log('Submitting payment data:', formData);
        
        post('/payments', formData, {
            onSuccess: () => {
                console.log('Payment submitted successfully');
                setPaymentItems([]);
                setSelectedPayer(null);
                setPayerOutstandingFees([]);
                setSelectedOutstandingFee(null);
                setShowLateSettings(false);
                setIsLatePayment(false);
                setMonthsLate(1);
                setStep(1);
                setUserModifiedPurpose(false);
                setDataWarnings([]);
                setData({
                    ...data,
                    or_number: generateORNumber(),
                    purpose: '',
                    items: [],
                    subtotal: 0,
                    surcharge: 0,
                    penalty: 0,
                    discount: 0,
                    total_amount: 0,
                    certificate_type: '',
                    clearance_request_id: undefined,
                });
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                alert('Failed to submit payment. Please check all required fields and try again.');
            },
        });
    };

    // Create pre-filled fee data for AddFeesStep
    const prefilledFee = useMemo(() => {
        if (!pre_filled_data?.fee_id && !pre_filled_data?.clearance_request_id) return undefined;
        
        // Handle clearance fee
        if (pre_filled_data.clearance_request_id && clearance_request) {
            return {
                id: `clearance-${pre_filled_data.clearance_request_id}`,
                fee_id: `clearance-${pre_filled_data.clearance_request_id}`,
                fee_name: clearance_request.clearance_type?.name || 'Barangay Clearance',
                fee_code: 'CLEARANCE',
                fee_type: clearance_fee_type || clearance_request.clearance_type,
                payer_type: pre_filled_data.payer_type || 'resident',
                payer_id: pre_filled_data.payer_id || clearance_request.resident_id,
                payer_name: pre_filled_data.payer_name || clearance_request.resident?.name || '',
                contact_number: pre_filled_data.contact_number || clearance_request.resident?.contact_number || '',
                address: pre_filled_data.address || clearance_request.resident?.address || '',
                house_number: pre_filled_data.household_number || '',
                purok: pre_filled_data.purok || '',
                total_amount: typeof clearance_request.fee_amount === 'string'
                    ? parseCurrencyString(clearance_request.fee_amount)
                    : Number(clearance_request.fee_amount || 0),
                amount_paid: 0,
                balance: typeof clearance_request.fee_amount === 'string'
                    ? parseCurrencyString(clearance_request.fee_amount)
                    : Number(clearance_request.fee_amount || 0),
                status: 'issued',
                description: clearance_request.specific_purpose || clearance_request.purpose || 'Clearance Fee',
                is_clearance_fee: true,
                clearance_request_id: pre_filled_data.clearance_request_id,
            };
        }
        
        // Handle regular fee
        if (pre_filled_data.fee_id) {
            const feeType = fees.find(f => f.id === pre_filled_data.fee_type_id);
            
            return {
                id: pre_filled_data.fee_id,
                fee_id: pre_filled_data.fee_id,
                fee_name: pre_filled_data.fee_name || 'Fee',
                fee_code: pre_filled_data.fee_code || '',
                fee_type: feeType,
                payer_type: pre_filled_data.payer_type || 'resident',
                payer_id: pre_filled_data.payer_id || 0,
                payer_name: pre_filled_data.payer_name || '',
                contact_number: pre_filled_data.contact_number || '',
                address: pre_filled_data.address || '',
                house_number: pre_filled_data.household_number || '',
                purok: pre_filled_data.purok || '',
                total_amount: pre_filled_data.total_amount || 0,
                amount_paid: 0,
                balance: pre_filled_data.balance || pre_filled_data.total_amount || 0,
                status: 'issued',
                description: pre_filled_data.description
            };
        }
        
        return undefined;
    }, [pre_filled_data, fees, clearance_request, clearance_fee_type]);

    // Check if this is a clearance payment
    const isClearancePayment = useMemo(() => {
        return !!pre_filled_data?.clearance_request_id || 
               paymentItems.some(item => item.metadata?.is_clearance_fee) ||
               !!data.certificate_type;
    }, [pre_filled_data, paymentItems, data.certificate_type]);

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
                                    <span>✓ Clearance Payment</span>
                                    {clearance_request?.reference_number && (
                                        <span className="text-xs">({clearance_request.reference_number})</span>
                                    )}
                                </div>
                            )}
                            {pre_filled_data?.fee_id && !isClearancePayment && (
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    <span>✓ Pre-filled from Fee #{pre_filled_data.fee_code}</span>
                                </div>
                            )}
                        </div>
                    </div>
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

                {/* Data Warnings - FIXED: Show only critical warnings */}
                {dataWarnings.length > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Data Integrity Warnings</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-1 text-sm">
                                {dataWarnings.map((warning, index) => (
                                    <li key={index} className="text-yellow-700 dark:text-yellow-300">
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 text-yellow-600 dark:text-yellow-400 text-sm">
                                Note: Penalties on future-due fees will be automatically removed during payment.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Progress Indicator */}
                <ProgressIndicator step={step} onStepClick={handleStepClick} />

                {/* Clearance Request Info Card */}
                {isClearancePayment && step === 2 && clearance_request && (
                    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center gap-2">
                                <span>Clearance Request Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium text-purple-700 dark:text-purple-300">Reference #:</span>
                                        <p className="text-purple-900 dark:text-purple-200">{clearance_request.reference_number}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-purple-700 dark:text-purple-300">Type:</span>
                                        <p className="text-purple-900 dark:text-purple-200">{clearance_request.clearance_type?.name || 'Clearance'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-purple-700 dark:text-purple-300">Purpose:</span>
                                        <p className="text-purple-900 dark:text-purple-200">{clearance_request.specific_purpose || clearance_request.purpose}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-purple-700 dark:text-purple-300">Fee:</span>
                                        <p className="text-purple-900 dark:text-purple-200">
                                            ₱{typeof clearance_request.fee_amount === 'string' 
                                                ? parseCurrencyString(clearance_request.fee_amount).toFixed(2)
                                                : Number(clearance_request.fee_amount || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                {clearance_request.resident && (
                                    <div>
                                        <span className="font-medium text-purple-700 dark:text-purple-300">Requested by:</span>
                                        <p className="text-purple-900 dark:text-purple-200">
                                            {clearance_request.resident.name}
                                            {clearance_request.resident.contact_number && ` (${clearance_request.resident.contact_number})`}
                                        </p>
                                    </div>
                                )}
                                <p className="text-purple-600 dark:text-purple-400 italic">
                                    This clearance fee has been automatically added to your payment items. You can add additional fees if needed.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pre-filled Fee Info Card */}
                {pre_filled_data?.fee_id && !isClearancePayment && step === 2 && (
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                <span>Pre-filled Fee Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium text-blue-700 dark:text-blue-300">Fee Code:</span>
                                        <p className="text-blue-900 dark:text-blue-200">{pre_filled_data.fee_code}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-700 dark:text-blue-300">Amount:</span>
                                        <p className="text-blue-900 dark:text-blue-200">
                                            ₱{(pre_filled_data.balance || pre_filled_data.total_amount || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-700 dark:text-blue-300">Description:</span>
                                    <p className="text-blue-900 dark:text-blue-200">{pre_filled_data.description}</p>
                                </div>
                                <p className="text-blue-600 dark:text-blue-400 italic">
                                    This fee has been automatically added to your payment items. You can add additional fees if needed.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form id="paymentForm" onSubmit={submit}>
                    {/* Step 1: Select Payer */}
                   {step === 1 && (
    <PayerSelectionStep
        residents={residents}
        households={households}
        clearanceRequests={clearance_requests || []} // Add this
        feeTypes={fees} // Add fee types
        payerType={payerType}
        setPayerType={setPayerType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSelectPayer={handleSelectPayer}
        handleManualPayer={handleManualPayer}
        preSelectedPayerId={pre_filled_data?.payer_id}
        preSelectedPayerType={pre_filled_data?.payer_type}
        isClearancePayment={isClearancePayment}
        clearanceRequest={clearance_request}
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
                            prefilledFee={prefilledFee}
                            feeTypes={fees}
                            dataWarnings={dataWarnings}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                            clearanceFeeType={clearance_fee_type}
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
                            handleCertificateTypeChange={handleCertificateTypeChange}
                            userModifiedPurpose={userModifiedPurpose}
                            setUserModifiedPurpose={setUserModifiedPurpose}
                            generatePurpose={() => generatePurposeFromItems(paymentItems)}
                            clearanceTypes={clearanceTypes}
                            isClearancePayment={isClearancePayment}
                            clearanceRequest={clearance_request}
                        />
                    )}
                </form>
                
                {/* Debug Panel */}
                <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-700 mb-2">Debug Information</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>Current Step: {step}</div>
                        <div>Payer Type: {data.payer_type}</div>
                        <div>Payer ID: {data.payer_id}</div>
                        <div>Payer Name: {data.payer_name}</div>
                        <div>Household Number: {data.household_number || '(not set)'}</div>
                        <div>Address: {data.address || '(not set)'}</div>
                        <div>Payment Items Count: {paymentItems.length}</div>
                        <div>Outstanding Fees Count: {payerOutstandingFees.length}</div>
                        <div>Unique Data Warnings Count: {dataWarnings.length}</div>
                        <div>Is Clearance Payment: <span className={isClearancePayment ? 'text-purple-600 font-bold' : 'text-gray-600'}>{isClearancePayment.toString()}</span></div>
                        {isClearancePayment && (
                            <div>
                                <div>Certificate Type: {data.certificate_type}</div>
                                <div>Clearance Request ID: {data.clearance_request_id || 'None'}</div>
                                {clearance_request && (
                                    <div>
                                        <div>Clearance Reference: {clearance_request.reference_number}</div>
                                        <div>Clearance Purpose: {clearance_request.purpose}</div>
                                        <div>Clearance Fee Amount: {typeof clearance_request.fee_amount === 'string' 
                                            ? parseCurrencyString(clearance_request.fee_amount).toFixed(2)
                                            : Number(clearance_request.fee_amount || 0).toFixed(2)}</div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="font-semibold text-blue-600">Late Payment Modal State:</div>
                        <div>Selected Fee: {selectedOutstandingFee ? selectedOutstandingFee.fee_code : 'None'}</div>
                        <div>Show Late Settings: <span className={showLateSettings ? 'text-green-600 font-bold' : 'text-red-600'}>{showLateSettings.toString()}</span></div>
                        <div>Is Late Payment: {isLatePayment.toString()}</div>
                        <div>Months Late: {monthsLate}</div>
                        {selectedOutstandingFee && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                                <div className="font-semibold">Selected Fee Analysis:</div>
                                <div>Code: {selectedOutstandingFee.fee_code}</div>
                                <div>Issued: {selectedOutstandingFee.issue_date}</div>
                                <div>Due: {selectedOutstandingFee.due_date}</div>
                                <div>Actual Months Late: {calculateMonthsLate(selectedOutstandingFee.due_date)}</div>
                                <div>Is Future Fee: {new Date(selectedOutstandingFee.due_date) > new Date() ? 'YES ⚠️' : 'No'}</div>
                                <div>Base: ₱{parseCurrencyString(selectedOutstandingFee.base_amount).toFixed(2)}</div>
                                <div>Existing Surcharge: ₱{parseCurrencyString(selectedOutstandingFee.surcharge_amount).toFixed(2)}</div>
                                <div>Existing Penalty: ₱{parseCurrencyString(selectedOutstandingFee.penalty_amount).toFixed(2)}</div>
                                <div>Balance: ₱{parseCurrencyString(selectedOutstandingFee.balance).toFixed(2)}</div>
                                {new Date(selectedOutstandingFee.due_date) > new Date() && parseCurrencyString(selectedOutstandingFee.penalty_amount) > 0 && (
                                    <div className="text-red-600 font-bold">⚠️ DATA ERROR: Future fee with penalty!</div>
                                )}
                            </div>
                        )}
                        {paymentItems.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                                <div className="font-semibold">Payment Items ({paymentItems.length}):</div>
                                {paymentItems.map(item => (
                                    <div key={item.id} className="ml-2 mb-2 p-2 bg-gray-100 rounded">
                                        <div className="font-medium">{item.fee_name} - ₱{item.total_amount.toFixed(2)}</div>
                                        <div className="text-xs ml-4">
                                            <div>Base: ₱{item.base_amount.toFixed(2)}, Surcharge: ₱{item.surcharge.toFixed(2)}, Penalty: ₱{item.penalty.toFixed(2)}, Discount: ₱{(item.discount || 0).toFixed(2)}</div>
                                            <div>Months Late: {item.months_late}{item.metadata?.is_late_payment && ' (Late Payment)'}</div>
                                            {item.metadata?.is_future_fee && (
                                                <div className="text-yellow-600">Future fee (due after today)</div>
                                            )}
                                            {item.metadata?.data_warning && (
                                                <div className="text-red-600 font-bold">⚠️ Original had penalty (removed)</div>
                                            )}
                                            {item.metadata?.is_clearance_fee && (
                                                <div className="text-purple-600 font-bold">✓ Clearance Fee</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {dataWarnings.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                                <div className="font-semibold text-yellow-600">Data Warnings ({dataWarnings.length} unique):</div>
                                {dataWarnings.map((warning, index) => (
                                    <div key={index} className="text-xs text-yellow-700 ml-2">• {warning}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}