// resources/js/components/admin/payment/PaymentDetailsStep.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    CreditCard,
    Calculator,
    Receipt,
    Building,
    FileText,
    AlertCircle,
    Smartphone,
    Banknote,
    Home,
    User,
    Users,
    Phone,
    MapPin,
    FileDigit,
    Lock,
    Check,
    FileBadge,
    RefreshCw,
    UserCircle,
    MapPinHouse,
    Hash,
    IdCard,
    Shield,
    Heart,
    HeartHandshake,
    Baby,
    HandHeart,
    Calendar,
    Award,
    Briefcase,
    UsersRound,
    Eye,
    Tag,
    Percent,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    DollarSign,
    Wallet,
    TrendingUp,
} from 'lucide-react';
import { PaymentItem, PaymentFormData, DiscountRule } from './paymentCreate/types';

interface ClearanceType {
    id: string | number;
    code: string;
    name: string;
    description?: string;
    fee: number | string;
    formatted_fee?: string;
    processing_days?: number;
    validity_days: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    has_senior_discount?: boolean;
    senior_discount_percentage?: number;
    has_pwd_discount?: boolean;
    pwd_discount_percentage?: number;
    has_solo_parent_discount?: boolean;
    solo_parent_discount_percentage?: number;
    has_indigent_discount?: boolean;
    indigent_discount_percentage?: number;
    is_discountable?: boolean;
}

interface FeeType {
    id: string | number;
    name: string;
    code: string;
    base_amount: number | string;
    category: string;
    is_discountable?: boolean;
    has_senior_discount?: boolean;
    senior_discount_percentage?: number;
    has_pwd_discount?: boolean;
    pwd_discount_percentage?: number;
    has_solo_parent_discount?: boolean;
    solo_parent_discount_percentage?: number;
    has_indigent_discount?: boolean;
    indigent_discount_percentage?: number;
    has_surcharge?: boolean;
    surcharge_rate?: number;
    surcharge_fixed?: number;
    has_penalty?: boolean;
    penalty_rate?: number;
    penalty_fixed?: number;
}

interface DiscountEligibility {
    type: string;
    label: string;
    percentage: number;
    id_number?: string;
    has_id?: boolean;
}

interface HouseholdInfo {
    id?: string | number;
    household_number?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    full_address?: string;
    purok?: string;
    purok_id?: string | number;
    member_count?: number;
    head_of_household?: {
        id: string | number;
        name: string;
        contact_number?: string;
        is_current_resident?: boolean;
    };
    head_name?: string;
    head_id?: string | number;
    resident_role?: string;
    is_head?: boolean;
    has_user_account?: boolean;
    members?: any[];
}

interface ResidentDetails {
    id: number | string;
    name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    birthdate?: string;
    age?: number;
    gender?: string;
    civil_status?: string;
    occupation?: string;
    is_voter?: boolean;
    is_senior?: boolean;
    is_pwd?: boolean;
    is_solo_parent?: boolean;
    is_indigent?: boolean;
    senior_id_number?: string;
    pwd_id_number?: string;
    solo_parent_id_number?: string;
    indigent_id_number?: string;
    household_id?: string | number;
    household_number?: string;
    purok?: string;
    purok_id?: string | number;
    is_household_head?: boolean;
    household_info?: HouseholdInfo | null;
    discount_eligibility_list?: DiscountEligibility[];
    has_special_classification?: boolean;
}

interface PaymentDetailsStepProps {
    data: PaymentFormData;
    setData: (data: any) => void;
    setStep: (step: number) => void;
    paymentItems: PaymentItem[];
    selectedDiscountCode: string;
    discountTypes: Record<string, string>;
    discountRules?: DiscountRule[];
    discountCodeToIdMap?: Record<string, number>;
    handleDiscountCodeChange: (code: string) => void;
    processing: boolean;
    handlePurposeChange: (value: string) => void;
    handlePeriodCoveredChange: (value: string) => void;
    handleClearanceTypeChange?: (id: string | number) => void;
    userModifiedPurpose: boolean;
    setUserModifiedPurpose: (value: boolean) => void;
    generatePurpose: () => string;
    clearanceTypes?: ClearanceType[];
    isClearancePayment?: boolean;
    clearanceRequest?: any;
    selectedClearanceType?: ClearanceType | null;
    getClearanceTypeName?: (id: string | number) => string;
    selectedResident?: ResidentDetails | null;
    selectedHousehold?: any;
    payerSource?: 'residents' | 'households' | 'clearance' | 'fees' | 'other';
    feeTypes?: FeeType[];
}

// ========== HELPER FUNCTIONS ==========
function formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

// FIXED: Added null check for percentage
function formatPercentage(percent: number | undefined | null): string {
    if (percent === undefined || percent === null || isNaN(percent)) return '0%';
    return `${percent.toFixed(1)}%`;
}

function generateORNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now();
    const random = String(timestamp % 1000).padStart(3, '0');
    return `BAR-${year}${month}${day}-${random}`;
}

export function PaymentDetailsStep({
    data,
    setData,
    setStep,
    paymentItems,
    selectedDiscountCode,
    discountTypes,
    discountRules = [],
    discountCodeToIdMap = {},
    handleDiscountCodeChange,
    processing,
    handlePurposeChange,
    handlePeriodCoveredChange,
    handleClearanceTypeChange,
    userModifiedPurpose,
    setUserModifiedPurpose,
    generatePurpose,
    clearanceTypes = [],
    isClearancePayment = false,
    clearanceRequest = null,
    selectedClearanceType = null,
    getClearanceTypeName = (id: string | number) => 'Clearance',
    selectedResident = null,
    selectedHousehold = null,
    payerSource = 'residents',
    feeTypes = []
}: PaymentDetailsStepProps) {
    
    // ========== DEBUG LOGGING ==========
    console.log('🔍 PaymentDetailsStep - Data:', {
        subtotal: data.subtotal,
        surcharge: data.surcharge,
        penalty: data.penalty,
        discount: data.discount,
        amount_paid: data.amount_paid,
        total_amount: data.total_amount
    });

    // ========== STATE DECLARATIONS ==========
    const [purposeError, setPurposeError] = useState<string>('');
    const [isCleared, setIsCleared] = useState(data.is_cleared || false);
    const [validityDate, setValidityDate] = useState(data.validity_date || '');
    const [clearanceError, setClearanceError] = useState<string>('');
    const [autoGeneratedOR, setAutoGeneratedOR] = useState<boolean>(false);
    
    // Amount paid state
    const [amountTendered, setAmountTendered] = useState<string>(
        data.amount_paid ? data.amount_paid.toString() : ''
    );
    
    // ========== CORRECTED CALCULATIONS ==========
    // Original amount BEFORE discount (subtotal + surcharge + penalty)
    const originalTotal = (data.subtotal || 0) + (data.surcharge || 0) + (data.penalty || 0);
    
    // Discount amount
    const discountAmount = data.discount || 0;
    
    // Calculate discount percentage for display (with safe division)
    const discountPercentage = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0;
    
    // Amount due AFTER discount (what the payer SHOULD pay)
    const amountDue = originalTotal - discountAmount;
    
    // Amount actually paid (cash received)
    const amountPaid = data.amount_paid || 0;
    
    // Calculate if payment is correct
    const isExactAmount = Math.abs(amountPaid - amountDue) < 0.01;
    const isOverpaid = amountPaid > amountDue + 0.01;
    const isUnderpaid = amountPaid < amountDue - 0.01 && amountPaid > 0;
    const isUnpaid = amountPaid <= 0;
    
    // Calculate balance/change
    const balance = Math.max(0, amountDue - amountPaid);
    const change = Math.max(0, amountPaid - amountDue);
    
    // Payment status
    const paymentStatus = isUnpaid ? 'unpaid' : 
                         (isUnderpaid ? 'partial' : 
                         (isExactAmount ? 'paid' : 
                         (isOverpaid ? 'overpaid' : 'unknown')));
    
    // Log for debugging
    console.log('💰 CORRECTED CALCULATIONS:', {
        originalTotal: originalTotal,
        discount: discountAmount,
        discountPercentage: discountPercentage,
        amountDue: amountDue,
        amountPaid: amountPaid,
        isExactAmount,
        isOverpaid,
        isUnderpaid,
        balance,
        change,
        paymentStatus
    });

    const isClearanceFeePayment = isClearancePayment || paymentItems.some(item => 
        item.metadata?.is_clearance_fee || item.category === 'clearance'
    );

    const isFeePayment = payerSource === 'fees' || paymentItems.some(item => 
        item.metadata?.is_outstanding_fee === true && !item.metadata?.is_clearance_fee
    );

    const clearanceItem = paymentItems.find(item => 
        item.metadata?.is_clearance_fee || item.category === 'clearance'
    );

    const feeItems = paymentItems.filter(item => 
        !(item.metadata?.is_clearance_fee || item.category === 'clearance')
    );

    const selectedDiscountRule = discountRules.find(rule => rule.code === selectedDiscountCode);

    // Get display values with fallbacks
    const displayPayerName = data.payer_name || (selectedResident?.name) || 'Unknown';
    const displayContactNumber = data.contact_number || (selectedResident?.contact_number) || '';
    const displayAddress = data.address || (selectedResident?.address) || '';
    const displayHouseholdNumber = data.household_number || (selectedResident?.household_number) || '';
    const displayPurok = data.purok || (selectedResident?.purok) || '';

    // ========== DISCOUNT ELIGIBILITY CHECKING ==========
    
    const DISCOUNT_PRIORITY: Record<string, number> = {
        'senior': 1,
        'pwd': 2,
        'indigent': 3,
        'solo_parent': 4
    };

    const isFeeTypeDiscountable = useCallback((feeTypeId?: string | number): boolean => {
        if (!feeTypeId) return false;
        const feeType = feeTypes.find(ft => ft.id == feeTypeId);
        return feeType?.is_discountable === true;
    }, [feeTypes]);

    const isResidentEligibleForDiscount = useCallback((
        resident: ResidentDetails | null,
        discountType: string,
        feeTypeId?: string | number
    ): { eligible: boolean; percentage: number; id_number?: string } => {
        if (!resident) return { eligible: false, percentage: 0 };
        
        const feeType = feeTypeId ? feeTypes.find(ft => ft.id == feeTypeId) : null;
        
        switch (discountType) {
            case 'senior':
                if (!resident.is_senior) return { eligible: false, percentage: 0 };
                if (feeType && !feeType.has_senior_discount) return { eligible: false, percentage: 0 };
                return {
                    eligible: true,
                    percentage: feeType?.senior_discount_percentage || 20,
                    id_number: resident.senior_id_number
                };
                
            case 'pwd':
                if (!resident.is_pwd) return { eligible: false, percentage: 0 };
                if (feeType && !feeType.has_pwd_discount) return { eligible: false, percentage: 0 };
                return {
                    eligible: true,
                    percentage: feeType?.pwd_discount_percentage || 20,
                    id_number: resident.pwd_id_number
                };
                
            case 'solo_parent':
                if (!resident.is_solo_parent) return { eligible: false, percentage: 0 };
                if (feeType && !feeType.has_solo_parent_discount) return { eligible: false, percentage: 0 };
                return {
                    eligible: true,
                    percentage: feeType?.solo_parent_discount_percentage || 10,
                    id_number: resident.solo_parent_id_number
                };
                
            case 'indigent':
                if (!resident.is_indigent) return { eligible: false, percentage: 0 };
                if (feeType && !feeType.has_indigent_discount) return { eligible: false, percentage: 0 };
                return {
                    eligible: true,
                    percentage: feeType?.indigent_discount_percentage || 25,
                    id_number: resident.indigent_id_number
                };
                
            default:
                return { eligible: false, percentage: 0 };
        }
    }, [feeTypes]);

    const getBestDiscountForFee = useCallback((feeItem: PaymentItem): DiscountEligibility | null => {
        if (!selectedResident) return null;
        
        const feeTypeId = feeItem.fee_type_id;
        const availableDiscounts: DiscountEligibility[] = [];
        
        const discountTypes = ['senior', 'pwd', 'solo_parent', 'indigent'];
        
        for (const type of discountTypes) {
            const eligibility = isResidentEligibleForDiscount(selectedResident, type, feeTypeId);
            if (eligibility.eligible) {
                availableDiscounts.push({
                    type,
                    label: type === 'senior' ? 'Senior Citizen' :
                           type === 'pwd' ? 'Person with Disability' :
                           type === 'solo_parent' ? 'Solo Parent' : 'Indigent',
                    percentage: eligibility.percentage,
                    id_number: eligibility.id_number,
                    has_id: !!eligibility.id_number
                });
            }
        }
        
        if (availableDiscounts.length === 0) return null;
        
        availableDiscounts.sort((a, b) => 
            (DISCOUNT_PRIORITY[a.type] || 999) - (DISCOUNT_PRIORITY[b.type] || 999)
        );
        
        return availableDiscounts[0];
    }, [selectedResident, isResidentEligibleForDiscount]);

    const getAllPossibleDiscounts = useMemo(() => {
        if (!selectedResident) return [];
        
        const discountSet = new Set<string>();
        const discounts: DiscountEligibility[] = [];
        
        feeItems.forEach(item => {
            const bestDiscount = getBestDiscountForFee(item);
            if (bestDiscount && !discountSet.has(bestDiscount.type)) {
                discountSet.add(bestDiscount.type);
                discounts.push(bestDiscount);
            }
        });
        
        if (clearanceItem && selectedClearanceType) {
            const clearanceDiscounts = [];
            
            if (selectedResident.is_senior && selectedClearanceType.has_senior_discount) {
                clearanceDiscounts.push({
                    type: 'senior',
                    label: 'Senior Citizen',
                    percentage: selectedClearanceType.senior_discount_percentage || 20,
                    id_number: selectedResident.senior_id_number,
                    has_id: !!selectedResident.senior_id_number
                });
            }
            
            if (selectedResident.is_pwd && selectedClearanceType.has_pwd_discount) {
                clearanceDiscounts.push({
                    type: 'pwd',
                    label: 'Person with Disability',
                    percentage: selectedClearanceType.pwd_discount_percentage || 20,
                    id_number: selectedResident.pwd_id_number,
                    has_id: !!selectedResident.pwd_id_number
                });
            }
            
            if (selectedResident.is_solo_parent && selectedClearanceType.has_solo_parent_discount) {
                clearanceDiscounts.push({
                    type: 'solo_parent',
                    label: 'Solo Parent',
                    percentage: selectedClearanceType.solo_parent_discount_percentage || 10,
                    id_number: selectedResident.solo_parent_id_number,
                    has_id: !!selectedResident.solo_parent_id_number
                });
            }
            
            if (selectedResident.is_indigent && selectedClearanceType.has_indigent_discount) {
                clearanceDiscounts.push({
                    type: 'indigent',
                    label: 'Indigent',
                    percentage: selectedClearanceType.indigent_discount_percentage || 25,
                    id_number: selectedResident.indigent_id_number,
                    has_id: !!selectedResident.indigent_id_number
                });
            }
            
            if (clearanceDiscounts.length > 0) {
                clearanceDiscounts.sort((a, b) => 
                    (DISCOUNT_PRIORITY[a.type] || 999) - (DISCOUNT_PRIORITY[b.type] || 999)
                );
                const bestClearanceDiscount = clearanceDiscounts[0];
                if (!discountSet.has(bestClearanceDiscount.type)) {
                    discountSet.add(bestClearanceDiscount.type);
                    discounts.push(bestClearanceDiscount);
                }
            }
        }
        
        discounts.sort((a, b) => 
            (DISCOUNT_PRIORITY[a.type] || 999) - (DISCOUNT_PRIORITY[b.type] || 999)
        );
        
        return discounts;
    }, [selectedResident, feeItems, clearanceItem, selectedClearanceType, getBestDiscountForFee]);

    const isDiscountRuleApplicable = useCallback((rule: DiscountRule): boolean => {
        if (!selectedResident) return true;
        
        const ruleTypeMap: Record<string, string> = {
            'SENIOR': 'senior',
            'SENIOR_CITIZEN': 'senior',
            'PWD': 'pwd',
            'SOLO_PARENT': 'solo_parent',
            'INDIGENT': 'indigent'
        };
        
        const residentType = ruleTypeMap[rule.code];
        if (!residentType) return true;
        
        const eligibility = isResidentEligibleForDiscount(selectedResident, residentType);
        return eligibility.eligible;
    }, [selectedResident, isResidentEligibleForDiscount]);

    const filteredDiscountRules = useMemo(() => {
        return discountRules.filter(rule => isDiscountRuleApplicable(rule));
    }, [discountRules, isDiscountRuleApplicable]);

    const getDiscountWarningMessage = useMemo(() => {
        const possibleDiscounts = getAllPossibleDiscounts;
        
        if (possibleDiscounts.length > 1) {
            return {
                message: `You're eligible for multiple discounts (${possibleDiscounts.map(d => d.label).join(', ')}). Only one discount can be applied.`,
                type: 'warning'
            };
        }
        
        if (possibleDiscounts.length === 1) {
            return {
                message: `You're eligible for ${possibleDiscounts[0].label} discount.`,
                type: 'info'
            };
        }
        
        return null;
    }, [getAllPossibleDiscounts]);

    // ========== EFFECTS ==========
    useEffect(() => {
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('or_number', newOR);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
                }
            }
            setAutoGeneratedOR(true);
        }
    }, []);

    useEffect(() => {
        if (!data.payment_date) {
            const today = new Date().toISOString().split('T')[0];
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('payment_date', today);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, payment_date: today }));
                }
            }
        }
    }, []);

    useEffect(() => {
        if (selectedClearanceType && selectedClearanceType.validity_days && !data.validity_date) {
            const today = new Date();
            const validUntil = new Date(today);
            validUntil.setDate(today.getDate() + selectedClearanceType.validity_days);
            
            const formattedDate = validUntil.toISOString().split('T')[0];
            setValidityDate(formattedDate);
            
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('validity_date', formattedDate);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, validity_date: formattedDate }));
                }
            }
        }
    }, [selectedClearanceType]);

    // Auto-set amount paid to amount due if not set
    useEffect(() => {
        if (!data.amount_paid && amountDue > 0) {
            const dueValue = amountDue.toFixed(2);
            setAmountTendered(dueValue);
            
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('amount_paid', amountDue);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, amount_paid: amountDue }));
                }
            }
        }
    }, [amountDue, data.amount_paid]);

    // ========== HANDLER FUNCTIONS ==========
    const handlePaymentMethodChange = (methodId: string) => {
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('payment_method', methodId);
                setData('reference_number', '');
            } else {
                setData((prev: PaymentFormData) => ({ 
                    ...prev, 
                    payment_method: methodId,
                    reference_number: '' 
                }));
            }
        }
    };

    const handleAmountTenderedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmountTendered(value);
        
        const numericValue = parseFloat(value) || 0;
        
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('amount_paid', numericValue);
            } else {
                setData((prev: PaymentFormData) => ({ ...prev, amount_paid: numericValue }));
            }
        }
    };

    const handleQuickAmount = (amount: number) => {
        const newAmount = amount.toFixed(2);
        setAmountTendered(newAmount);
        
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('amount_paid', amount);
            } else {
                setData((prev: PaymentFormData) => ({ ...prev, amount_paid: amount }));
            }
        }
    };

    const handleExactAmount = () => {
        handleQuickAmount(amountDue);
    };

    const handleClearanceTypeSelect = (value: string) => {
        const id = value;
        if (handleClearanceTypeChange) {
            handleClearanceTypeChange(id);
        }
        setClearanceError('');
    };

    const handleClearedChange = (checked: boolean) => {
        setIsCleared(checked);
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('is_cleared', checked);
            } else {
                setData((prev: PaymentFormData) => ({ ...prev, is_cleared: checked }));
            }
        }
    };

    const handleValidityDateChange = (value: string) => {
        setValidityDate(value);
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('validity_date', value);
            } else {
                setData((prev: PaymentFormData) => ({ ...prev, validity_date: value }));
            }
        }
    };

    const handleRegenerateOR = () => {
        const newOR = generateORNumber();
        if (typeof setData === 'function') {
            if (setData.length === 2) {
                setData('or_number', newOR);
            } else {
                setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
            }
        }
        setAutoGeneratedOR(true);
    };

    const handleDiscountSelect = (code: string) => {
        if (code === 'no_discount') {
            handleDiscountCodeChange('');
            return;
        }
        
        const warning = getDiscountWarningMessage;
        if (warning && warning.type === 'warning' && !selectedDiscountCode) {
            if (!confirm(`${warning.message}\n\nAre you sure you want to apply this discount?`)) {
                return;
            }
        }
        
        handleDiscountCodeChange(code);
    };

    const validateForm = () => {
        let isValid = true;
        
        setPurposeError('');
        setClearanceError('');
        
        if (!data.purpose || data.purpose.trim() === '') {
            setPurposeError('Purpose of payment is required');
            isValid = false;
        }
        
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('or_number', newOR);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
                }
            }
            setAutoGeneratedOR(true);
        }
        
        if (!data.payment_date) {
            const today = new Date().toISOString().split('T')[0];
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('payment_date', today);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, payment_date: today }));
                }
            }
        }
        
        if (isClearanceFeePayment && clearanceTypes.length > 0) {
            if (!data.clearance_type_id || String(data.clearance_type_id).trim() === '') {
                setClearanceError('Please select a clearance type');
                isValid = false;
            }
        }
        
        if (originalTotal <= 0) {
            setPurposeError('Total amount must be greater than 0');
            isValid = false;
        }

        if (selectedDiscountRule?.requires_verification && !data.verification_id_number) {
            alert('This discount requires verification. Please provide ID number.');
            isValid = false;
        }

        if (amountPaid < 0) {
            alert('Amount paid cannot be negative.');
            isValid = false;
        }
        
        return isValid;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.or_number || data.or_number.trim() === '') {
            const newOR = generateORNumber();
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('or_number', newOR);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, or_number: newOR }));
                }
            }
            setAutoGeneratedOR(true);
        }
        
        if (!data.payment_date) {
            const today = new Date().toISOString().split('T')[0];
            if (typeof setData === 'function') {
                if (setData.length === 2) {
                    setData('payment_date', today);
                } else {
                    setData((prev: PaymentFormData) => ({ ...prev, payment_date: today }));
                }
            }
        }
        
        // Show warning if amount paid doesn't match amount due
        if (!isExactAmount && amountPaid > 0) {
            const message = isOverpaid 
                ? `You are overpaying by ${formatCurrency(change)}. Change of ${formatCurrency(change)} will be given. Continue?`
                : `You are underpaying by ${formatCurrency(balance)}. Remaining balance of ${formatCurrency(balance)} will be recorded as partial payment. Continue?`;
            
            if (!confirm(message)) {
                return;
            }
        }
        
        if (validateForm()) {
            const form = document.getElementById('paymentForm') as HTMLFormElement;
            if (form) {
                form.requestSubmit();
            }
        }
    };

    const getPayerTypeIcon = () => {
        switch (data.payer_type) {
            case 'resident': return User;
            case 'household': return Users;
            case 'business': return Building;
            default: return UserCircle;
        }
    };

    const getPayerTypeLabel = () => {
        switch (data.payer_type) {
            case 'resident': return 'Resident';
            case 'household': return 'Household';
            case 'business': return 'Business';
            default: return 'Other';
        }
    };

    const PayerIcon = getPayerTypeIcon();

    const getPaymentTypeEmphasis = () => {
        if (isClearanceFeePayment && isFeePayment) {
            return {
                badge: 'Combined Payment',
                color: 'bg-gradient-to-r from-purple-600 to-blue-600',
                icon: <Receipt className="h-3 w-3 mr-1" />,
                description: 'Clearance + Fees'
            };
        }
        if (isClearanceFeePayment) {
            return {
                badge: 'Clearance Payment',
                color: 'bg-purple-600',
                icon: <FileBadge className="h-3 w-3 mr-1" />,
                description: 'Clearance Certificate'
            };
        }
        if (isFeePayment) {
            return {
                badge: 'Fee Payment',
                color: 'bg-blue-600',
                icon: <Receipt className="h-3 w-3 mr-1" />,
                description: 'Barangay Fees'
            };
        }
        return null;
    };

    const paymentEmphasis = getPaymentTypeEmphasis();

    const getPaymentStatusBadge = () => {
        switch (paymentStatus) {
            case 'paid':
                return {
                    label: 'PAID',
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle2 className="h-3 w-3 mr-1" />
                };
            case 'partial':
                return {
                    label: 'PARTIAL',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <AlertTriangle className="h-3 w-3 mr-1" />
                };
            case 'unpaid':
                return {
                    label: 'UNPAID',
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <XCircle className="h-3 w-3 mr-1" />
                };
            case 'overpaid':
                return {
                    label: 'OVERPAID',
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: <TrendingUp className="h-3 w-3 mr-1" />
                };
            default:
                return {
                    label: 'UNPAID',
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <XCircle className="h-3 w-3 mr-1" />
                };
        }
    };

    const statusBadge = getPaymentStatusBadge();

    // ========== RENDER FUNCTIONS ==========
    const renderResidentClassifications = () => {
        if (!selectedResident) return null;

        const classifications = [];

        if (selectedResident.is_voter) {
            classifications.push({
                icon: <Vote className="h-3 w-3" />,
                label: 'Registered Voter',
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                idNumber: null,
                tooltip: 'Registered Voter'
            });
        }

        if (selectedResident.is_senior) {
            classifications.push({
                icon: <Heart className="h-3 w-3" />,
                label: 'Senior Citizen',
                color: 'bg-green-100 text-green-800 border-green-200',
                idNumber: selectedResident.senior_id_number,
                tooltip: 'Senior Citizen Discount Eligible'
            });
        }

        if (selectedResident.is_pwd) {
            classifications.push({
                icon: <HeartHandshake className="h-3 w-3" />,
                label: 'PWD',
                color: 'bg-purple-100 text-purple-800 border-purple-200',
                idNumber: selectedResident.pwd_id_number,
                tooltip: 'Person with Disability'
            });
        }

        if (selectedResident.is_solo_parent) {
            classifications.push({
                icon: <Baby className="h-3 w-3" />,
                label: 'Solo Parent',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                idNumber: selectedResident.solo_parent_id_number,
                tooltip: 'Solo Parent'
            });
        }

        if (selectedResident.is_indigent) {
            classifications.push({
                icon: <HandHeart className="h-3 w-3" />,
                label: 'Indigent',
                color: 'bg-orange-100 text-orange-800 border-orange-200',
                idNumber: selectedResident.indigent_id_number,
                tooltip: 'Indigent Family'
            });
        }

        if (classifications.length === 0) return null;

        return (
            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                    <Award className="h-3 w-3" />
                    Special Classifications
                </div>
                <div className="flex flex-wrap gap-2">
                    {classifications.map((item, index) => (
                        <Badge 
                            key={index} 
                            variant="outline" 
                            className={`${item.color} flex items-center gap-1 px-2 py-1 cursor-help`}
                            title={item.idNumber ? `ID: ${item.idNumber}` : item.tooltip}
                        >
                            {item.icon}
                            <span className="text-xs">{item.label}</span>
                            {item.idNumber && (
                                <span className="text-[10px] ml-1 opacity-75 font-mono">
                                    #{item.idNumber.split('-').pop()}
                                </span>
                            )}
                        </Badge>
                    ))}
                </div>
            </div>
        );
    };

    const renderDiscountEligibilities = () => {
        if (!selectedResident) return null;
        
        const possibleDiscounts = getAllPossibleDiscounts;
        
        if (possibleDiscounts.length === 0) {
            const hasDiscountableFees = feeItems.some(item => {
                return isFeeTypeDiscountable(item.fee_type_id);
            });
            
            if (hasDiscountableFees) {
                return (
                    <div className="mt-3">
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                            <Percent className="h-3 w-3" />
                            Discount Eligibility
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-gray-400" />
                                Some fees are discountable, but you're not eligible for any discounts.
                            </p>
                        </div>
                    </div>
                );
            }
            
            return null;
        }

        return (
            <div className="mt-3">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                    <Percent className="h-3 w-3" />
                    Available Discounts
                </div>
                <div className="space-y-2">
                    {possibleDiscounts.map((eligibility, index) => {
                        const iconMap: Record<string, JSX.Element> = {
                            senior: <Heart className="h-3 w-3 text-green-600" />,
                            pwd: <HeartHandshake className="h-3 w-3 text-purple-600" />,
                            solo_parent: <Baby className="h-3 w-3 text-yellow-600" />,
                            indigent: <HandHeart className="h-3 w-3 text-orange-600" />
                        };
                        
                        return (
                            <div 
                                key={index} 
                                className={`flex items-center justify-between p-2 rounded-md border ${
                                    index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-75'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {iconMap[eligibility.type as keyof typeof iconMap]}
                                    <span className="text-xs font-medium">{eligibility.label}</span>
                                    <Badge variant="secondary" className={`text-[10px] ${
                                        index === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {formatPercentage(eligibility.percentage)}
                                    </Badge>
                                </div>
                                {eligibility.has_id && eligibility.id_number && (
                                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        ID: {eligibility.id_number}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    
                    {possibleDiscounts.length > 1 && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md mt-2">
                            <p className="text-xs text-yellow-800 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Note: Only one discount can be applied. The highest priority discount will be used.
                            </p>
                        </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                        Select a discount from the dropdown below to apply
                    </p>
                </div>
            </div>
        );
    };

    const renderHouseholdInfo = () => {
        if (!selectedResident?.household_info) return null;

        const household = selectedResident.household_info;

        return (
            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                    <Home className="h-3 w-3" />
                    Household Information
                </div>
                <div className="space-y-2">
                    {household.household_number && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            <Hash className="h-3 w-3 mr-1" />
                            {household.household_number}
                        </Badge>
                    )}
                    {household.purok && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            <MapPinHouse className="h-3 w-3 mr-1" />
                            {household.purok}
                        </Badge>
                    )}

                    {household.head_of_household && (
                        <div className="flex items-center gap-2 text-xs">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">Head:</span>
                            <span className="font-medium text-gray-900">{household.head_of_household.name}</span>
                        </div>
                    )}

                    {household.member_count && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <UsersRound className="h-3 w-3" />
                            <span>{household.member_count} family members</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderFeeItemsWithDiscountInfo = () => {
        if (feeItems.length === 0) return null;

        return (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Receipt className="h-4 w-4" />
                    <span className="text-sm">Fee Items</span>
                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        {feeItems.length} item(s)
                    </Badge>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {feeItems.map((item) => {
                        const isDiscountable = isFeeTypeDiscountable(item.fee_type_id);
                        const bestDiscount = getBestDiscountForFee(item);
                        
                        return (
                            <div key={item.id} className="p-2 bg-white rounded border border-blue-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            {item.fee_name}
                                            {isDiscountable && (
                                                <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    <Tag className="h-2 w-2 mr-1" />
                                                    Discountable
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{item.fee_code}</div>
                                        
                                        {bestDiscount && (
                                            <div className="mt-1">
                                                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">
                                                    Eligible: {bestDiscount.label} ({formatPercentage(bestDiscount.percentage)})
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-medium text-sm">
                                        {formatCurrency(item.total_amount)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ========== MAIN RENDER ==========
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Payment Information */}
            <div className="lg:col-span-2 space-y-6">
                {/* Payment Information Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Receipt className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-semibold">
                                        Payment Details
                                    </CardTitle>
                                    <CardDescription>
                                        Complete the payment information
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {paymentEmphasis && (
                                    <Badge className={`${paymentEmphasis.color} text-white border-0`}>
                                        {paymentEmphasis.icon}
                                        {paymentEmphasis.badge}
                                    </Badge>
                                )}
                                <Badge variant="outline">Step 3 of 3</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Clearance Type Selection */}
                        {isClearanceFeePayment && clearanceTypes.length > 0 && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileBadge className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-medium text-purple-900">Clearance Type</h3>
                                </div>
                                
                                <Select
                                    value={String(data.clearance_type_id || "")}
                                    onValueChange={handleClearanceTypeSelect}
                                >
                                    <SelectTrigger className={`bg-white ${clearanceError ? 'border-red-300' : ''}`}>
                                        <SelectValue placeholder="Select clearance type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clearanceTypes.map((type) => (
                                            <SelectItem key={type.id} value={String(type.id)}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{type.name}</span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {type.formatted_fee || formatCurrency(Number(type.fee))}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                
                                {clearanceError && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {clearanceError}
                                    </p>
                                )}

                                {selectedClearanceType && (
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-gray-500">Valid Until</Label>
                                            <Input
                                                type="date"
                                                value={validityDate}
                                                onChange={(e) => handleValidityDateChange(e.target.value)}
                                                className="mt-1 bg-white"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <Switch
                                                checked={isCleared}
                                                onCheckedChange={handleClearedChange}
                                                className="data-[state=checked]:bg-green-600 mr-2"
                                            />
                                            <Label className="text-xs">Ready to issue</Label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Receipt Details */}
                        <div className="space-y-3">
                            <h3 className="font-medium flex items-center gap-2">
                                <FileDigit className="h-4 w-4" />
                                Receipt Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">OR Number</Label>
                                    <div className="relative">
                                        <Input
                                            value={data.or_number || ''}
                                            onChange={(e) => {
                                                if (typeof setData === 'function') {
                                                    if (setData.length === 2) {
                                                        setData('or_number', e.target.value);
                                                    } else {
                                                        setData((prev: PaymentFormData) => ({ ...prev, or_number: e.target.value }));
                                                    }
                                                }
                                                setAutoGeneratedOR(false);
                                            }}
                                            className="font-mono text-sm pr-20"
                                            placeholder="BAR-YYYYMMDD-XXX"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1 h-7 text-xs"
                                            onClick={handleRegenerateOR}
                                        >
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            New
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Payment Date</Label>
                                    <Input
                                        type="date"
                                        value={data.payment_date || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            if (typeof setData === 'function') {
                                                if (setData.length === 2) {
                                                    setData('payment_date', e.target.value);
                                                } else {
                                                    setData((prev: PaymentFormData) => ({ ...prev, payment_date: e.target.value }));
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Period Covered</Label>
                                <Input
                                    placeholder="e.g., January 2024, Q1 2024"
                                    value={data.period_covered || ''}
                                    onChange={(e) => handlePeriodCoveredChange(e.target.value)}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Amount Paid Section - CORRECTED */}
                        <div className="space-y-3">
                            <h3 className="font-medium flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                Payment Amount
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Summary of charges */}
                                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>{formatCurrency(data.subtotal || 0)}</span>
                                    </div>
                                    {data.surcharge > 0 && (
                                        <div className="flex justify-between text-amber-700">
                                            <span>Surcharge:</span>
                                            <span>+{formatCurrency(data.surcharge)}</span>
                                        </div>
                                    )}
                                    {data.penalty > 0 && (
                                        <div className="flex justify-between text-red-700">
                                            <span>Penalty:</span>
                                            <span>+{formatCurrency(data.penalty)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-medium pt-1 border-t border-gray-200 mt-1">
                                        <span>Original Amount:</span>
                                        <span>{formatCurrency(originalTotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <div className="flex items-center gap-1">
                                                <span>Discount:</span>
                                                {selectedDiscountRule && (
                                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                        {selectedDiscountRule.percentage ? formatPercentage(selectedDiscountRule.percentage) : 
                                                         selectedDiscountRule.formatted_value || 'Fixed'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span>-{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-primary pt-1 border-t border-gray-200 mt-1">
                                        <span>Amount Due:</span>
                                        <span>{formatCurrency(amountDue)}</span>
                                    </div>
                                </div>

                                {/* Amount Tendered Input */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Amount Tendered (Cash Received)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                        <Input
                                            type="text"
                                            value={amountTendered}
                                            onChange={handleAmountTenderedChange}
                                            className={`pl-8 text-lg font-medium ${
                                                !isExactAmount && amountPaid > 0 ? 'border-yellow-500' : ''
                                            }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Enter the cash amount received from the payer
                                    </p>
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        onClick={handleExactAmount}
                                        className="text-xs bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Pay Exact Amount ({formatCurrency(amountDue)})
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickAmount(Math.ceil(amountDue / 100) * 100)}
                                        className="text-xs"
                                    >
                                        Round Up
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickAmount(amountDue + 100)}
                                        className="text-xs"
                                    >
                                        +₱100
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickAmount(amountDue + 500)}
                                        className="text-xs"
                                    >
                                        +₱500
                                    </Button>
                                </div>

                                {/* Payment Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Amount Due:</span>
                                        <span className="font-medium">{formatCurrency(amountDue)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Amount Tendered:</span>
                                        <span className="font-medium text-blue-600">{formatCurrency(amountPaid)}</span>
                                    </div>
                                    
                                    <Separator />
                                    
                                    {isOverpaid ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-blue-700">Change Due:</span>
                                            <span className="text-lg font-bold text-blue-700">{formatCurrency(change)}</span>
                                        </div>
                                    ) : isUnderpaid ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-yellow-700">Remaining Balance:</span>
                                            <span className="text-lg font-bold text-yellow-700">{formatCurrency(balance)}</span>
                                        </div>
                                    ) : isExactAmount ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-green-700">Payment Status:</span>
                                            <span className="text-lg font-bold text-green-700">PAID</span>
                                        </div>
                                    ) : null}

                                    {/* Payment Status Badge */}
                                    <div className="mt-2 flex justify-end">
                                        <Badge className={`${statusBadge.color} flex items-center gap-1`}>
                                            {statusBadge.icon}
                                            {statusBadge.label}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Amount Mismatch Warning */}
                                {!isExactAmount && amountPaid > 0 && (
                                    <div className={`p-3 rounded-md ${
                                        isOverpaid 
                                            ? 'bg-blue-50 border border-blue-200' 
                                            : 'bg-yellow-50 border border-yellow-200'
                                    }`}>
                                        <p className={`text-sm flex items-center gap-2 ${
                                            isOverpaid ? 'text-blue-800' : 'text-yellow-800'
                                        }`}>
                                            {isOverpaid ? (
                                                <>
                                                    <TrendingUp className="h-4 w-4" />
                                                    Overpayment of {formatCurrency(change)}. Change of {formatCurrency(change)} will be given to the payer.
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Underpayment of {formatCurrency(balance)}. Remaining balance will be recorded as partial payment.
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Purpose of Payment */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Purpose of Payment
                                </h3>
                                <Badge variant="outline" className="text-xs">Required</Badge>
                            </div>
                            
                            <Textarea
                                placeholder="Enter the purpose of payment..."
                                value={data.purpose || ''}
                                onChange={(e) => handlePurposeChange(e.target.value)}
                                className={`min-h-[80px] ${purposeError ? 'border-red-300' : ''}`}
                            />
                            
                            {purposeError && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {purposeError}
                                </p>
                            )}

                            {paymentItems.length > 0 && !userModifiedPurpose && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed text-xs"
                                    onClick={() => {
                                        const purpose = generatePurpose();
                                        handlePurposeChange(purpose);
                                        setUserModifiedPurpose(false);
                                    }}
                                >
                                    <Check className="h-3 w-3 mr-2" />
                                    Use "{paymentItems.map(item => item.fee_name).join(', ')}"
                                </Button>
                            )}
                        </div>

                        <Separator />

                        {/* Payment Method */}
                        <div className="space-y-3">
                            <h3 className="font-medium flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payment Method
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'cash', icon: Banknote, name: 'Cash', desc: 'Cash payment' },
                                    { id: 'gcash', icon: Smartphone, name: 'GCash', desc: 'Mobile payment' },
                                ].map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = data.payment_method === method.id;
                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => handlePaymentMethodChange(method.id)}
                                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                                                    : 'hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className={`h-4 w-4 ${method.id === 'cash' ? 'text-green-600' : 'text-blue-600'}`} />
                                                <span className="font-medium text-sm">{method.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{method.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {data.payment_method !== 'cash' && (
                                <div className="space-y-2">
                                    <Label className="text-xs">Reference Number</Label>
                                    <Input
                                        placeholder="Enter transaction reference"
                                        value={data.reference_number || ''}
                                        onChange={(e) => {
                                            if (typeof setData === 'function') {
                                                if (setData.length === 2) {
                                                    setData('reference_number', e.target.value);
                                                } else {
                                                    setData((prev: PaymentFormData) => ({ ...prev, reference_number: e.target.value }));
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Remarks - Optional */}
                        <div className="space-y-2">
                            <Label className="text-xs">Remarks (Optional)</Label>
                            <Textarea
                                placeholder="Additional notes..."
                                rows={2}
                                value={data.remarks || ''}
                                onChange={(e) => {
                                    if (typeof setData === 'function') {
                                        if (setData.length === 2) {
                                            setData('remarks', e.target.value);
                                        } else {
                                            setData((prev: PaymentFormData) => ({ ...prev, remarks: e.target.value }));
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="flex-1"
                                size="lg"
                                onClick={handleFormSubmit}
                            >
                                {processing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Complete Payment
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(2)}
                                size="lg"
                            >
                                Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Summary Only */}
            <div className="space-y-6">
                {/* Payer Summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded">
                                <PayerIcon className="h-4 w-4 text-blue-700" />
                            </div>
                            <CardTitle className="text-base">Payer</CardTitle>
                            <Badge variant="outline" className="ml-auto text-xs">
                                {getPayerTypeLabel()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium text-gray-900">{displayPayerName}</p>
                                {selectedResident?.suffix && (
                                    <span className="text-xs text-gray-500 ml-1">{selectedResident.suffix}</span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{displayContactNumber}</span>
                            </div>
                            
                            {selectedResident?.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs">{selectedResident.email}</span>
                                </div>
                            )}
                            
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <span>{displayAddress}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                                {displayPurok && (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                        <MapPinHouse className="h-3 w-3 mr-1" />
                                        {displayPurok}
                                    </Badge>
                                )}
                                {displayHouseholdNumber && (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                        <Hash className="h-3 w-3 mr-1" />
                                        {displayHouseholdNumber}
                                    </Badge>
                                )}
                            </div>

                            {data.payer_type === 'resident' && selectedResident && (
                                <>
                                    {renderResidentClassifications()}
                                    {renderHouseholdInfo()}
                                    {renderDiscountEligibilities()}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded">
                                    <Calculator className="h-4 w-4 text-blue-700" />
                                </div>
                                <CardTitle className="text-base">Summary</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {paymentItems.length} item{paymentItems.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        {paymentEmphasis && (
                            <div className={`${paymentEmphasis.color} text-white p-3 rounded-lg flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    {paymentEmphasis.icon}
                                    <span className="font-medium text-sm">{paymentEmphasis.badge}</span>
                                </div>
                                <span className="text-xs opacity-90">{paymentEmphasis.description}</span>
                            </div>
                        )}

                        {isClearanceFeePayment && selectedClearanceType && clearanceItem && (
                            <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                                <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                                    <FileBadge className="h-4 w-4" />
                                    <span className="text-sm">Clearance Details</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium text-purple-700">{selectedClearanceType.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <span className="text-gray-600">Code:</span>
                                    <span className="font-mono text-xs text-gray-700">{selectedClearanceType.code}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <span className="text-gray-600">Fee:</span>
                                    <span className="font-medium text-purple-700">{formatCurrency(clearanceItem?.total_amount || 0)}</span>
                                </div>
                                {validityDate && (
                                    <div className="flex justify-between items-center text-sm mt-1">
                                        <span className="text-gray-600">Valid Until:</span>
                                        <span className="text-xs text-gray-700">{new Date(validityDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {feeItems.length > 0 && renderFeeItemsWithDiscountInfo()}

                        {paymentItems.length > 0 && feeItems.length === 0 && !isClearanceFeePayment && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {paymentItems.map((item) => {
                                    const isClearance = item.metadata?.is_clearance_fee || item.category === 'clearance';
                                    return (
                                        <div key={item.id} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <div className="font-medium flex items-center gap-1">
                                                    {item.fee_name}
                                                    {isClearance && (
                                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                            Clearance
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{item.fee_code}</div>
                                            </div>
                                            <div className="font-medium">
                                                {formatCurrency(item.total_amount)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Separator />

                        {/* Totals - CORRECTED */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span>{formatCurrency(data.subtotal || 0)}</span>
                            </div>
                            {data.surcharge > 0 && (
                                <div className="flex justify-between text-sm text-amber-700">
                                    <span>Surcharge</span>
                                    <span>+{formatCurrency(data.surcharge)}</span>
                                </div>
                            )}
                            {data.penalty > 0 && (
                                <div className="flex justify-between text-sm text-red-700">
                                    <span>Penalty</span>
                                    <span>+{formatCurrency(data.penalty)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-200">
                                <span>Original Amount</span>
                                <span>{formatCurrency(originalTotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-700">
                                    <div className="flex items-center gap-1">
                                        <span>Discount</span>
                                        {selectedDiscountRule && (
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                {selectedDiscountRule.percentage ? formatPercentage(selectedDiscountRule.percentage) : 
                                                 selectedDiscountRule.formatted_value || 'Fixed'}
                                            </Badge>
                                        )}
                                    </div>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Payment Status Summary */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Amount Due</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatCurrency(amountDue)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Amount Paid:</span>
                                <span className="font-medium text-blue-600">{formatCurrency(amountPaid)}</span>
                            </div>
                            
                            {isUnderpaid && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Balance:</span>
                                    <span className="font-medium text-yellow-600">{formatCurrency(balance)}</span>
                                </div>
                            )}
                            {isOverpaid && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Change:</span>
                                    <span className="font-medium text-blue-600">{formatCurrency(change)}</span>
                                </div>
                            )}
                            
                            <div className="mt-2">
                                <Badge className={`${statusBadge.color} flex items-center gap-1 w-full justify-center py-1`}>
                                    {statusBadge.icon}
                                    {statusBadge.label}
                                </Badge>
                            </div>
                        </div>

                        {/* Discount Selection */}
                        <div className="pt-2 space-y-2">
                            <Select
                                value={selectedDiscountCode || 'no_discount'}
                                onValueChange={handleDiscountSelect}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="No discount" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no_discount">No Discount</SelectItem>
                                    {filteredDiscountRules.map((rule) => (
                                        <SelectItem key={rule.id} value={rule.code}>
                                            <div className="flex items-center gap-2">
                                                <span>{rule.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {rule.percentage ? formatPercentage(rule.percentage) : 
                                                     rule.formatted_value || 'Fixed amount'}
                                                </Badge>
                                                {rule.requires_verification && (
                                                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                                        <IdCard className="h-3 w-3 mr-1" />
                                                        Requires ID
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {filteredDiscountRules.length === 0 && discountRules.length > 0 && (
                                        <SelectItem value="no_discount" disabled>
                                            No applicable discounts for this resident
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            
                            {selectedDiscountRule?.requires_verification && data.verification_id_number && (
                                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-xs text-green-800 flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        Verified with ID: {data.verification_id_number}
                                    </p>
                                </div>
                            )}
                            
                            {selectedDiscountRule?.minimum_purchase_amount && originalTotal < selectedDiscountRule.minimum_purchase_amount && (
                                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-xs text-yellow-800 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Minimum purchase of {formatCurrency(selectedDiscountRule.minimum_purchase_amount)} required
                                    </p>
                                </div>
                            )}

                            {getDiscountWarningMessage && (
                                <div className={`p-2 ${
                                    getDiscountWarningMessage.type === 'warning' 
                                        ? 'bg-yellow-50 border-yellow-200' 
                                        : 'bg-blue-50 border-blue-200'
                                } border rounded-md mt-2`}>
                                    <p className={`text-xs flex items-center gap-1 ${
                                        getDiscountWarningMessage.type === 'warning'
                                            ? 'text-yellow-800'
                                            : 'text-blue-800'
                                    }`}>
                                        {getDiscountWarningMessage.type === 'warning' ? (
                                            <AlertTriangle className="h-3 w-3" />
                                        ) : (
                                            <CheckCircle2 className="h-3 w-3" />
                                        )}
                                        {getDiscountWarningMessage.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}