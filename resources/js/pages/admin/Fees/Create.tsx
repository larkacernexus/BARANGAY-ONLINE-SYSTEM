// pages/admin/fees/create.tsx

import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { ArrowLeft, Copy, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import HeaderSection from '@/components/admin/feesCreate/HeaderSection';
import LeftColumn from '@/components/admin/feesCreate/LeftColumn';
import RightColumn from '@/components/admin/feesCreate/RightColumn';
import BulkSelectionModal from '@/components/admin/feesCreate/BulkSelectionModal';

// Import types from centralized fees.ts
import { 
    FeeType, 
    Resident, 
    Household, 
    Permissions,
    FeesCreateProps,
    FeeFormData,
    PrivilegeData,
    DiscountRule,
    DocumentCategory,
    DiscountInfo
} from '@/types/admin/fees/fees';

// Bulk Fee Form Data interface
interface BulkFeeFormData extends FeeFormData {
    base_amount: number;
    payer_name: string;
    total_amount: number;
    payer_type: string;
    household_id: string;
    business_name: string;
    address: string;
    zone: string;
    billing_period: string;
    period_start: string;
    period_end: string;
    issue_date: string;
    surcharge_amount: number;
    penalty_amount: number;
    discount_amount: number;
    purpose: string;
    property_description: string;
    business_type: string;
    area: number;
    remarks: string;
    requirements_submitted: string[];
    ph_legal_compliance_notes: string;
    bulk_type: 'none' | 'residents' | 'households' | 'custom';
    selected_resident_ids: string[];
    selected_household_ids: string[];
    custom_payers: Array<{
        id: string;
        name: string;
        contact_number: string;
        purok: string;
        address: string;
        type: 'custom';
    }>;
    apply_to_all_residents: boolean;
    apply_to_all_households: boolean;
    filter_purok: string;
    filter_discount_eligible: boolean;
    contact_number: string;
    purok: string;
}

// Extended props interface
interface ExtendedFeesCreateProps extends FeesCreateProps {
    households: Household[];
    discountRules?: DiscountRule[];
    preselectedResident?: Resident | null;
    preselectedHousehold?: Household | null;
    documentCategories: DocumentCategory[];
    initialData?: Partial<BulkFeeFormData>;
    duplicateFrom?: FeeType | null;
    allPrivileges?: PrivilegeData[];
}

// ========== DYNAMIC PRIVILEGE HELPER FUNCTIONS ==========

/**
 * Get active privileges from resident
 */
function getActivePrivileges(resident: Resident): PrivilegeData[] {
    if (!resident || !resident.privileges || !Array.isArray(resident.privileges)) {
        return [];
    }
    
    return resident.privileges.filter((p: PrivilegeData) => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
}

/**
 * Check if resident has any active privileges
 */
function hasAnyPrivilege(resident: Resident): boolean {
    return getActivePrivileges(resident).length > 0;
}

/**
 * Filter residents by discount eligibility (any privilege)
 */
function filterByDiscountEligibility(residents: Resident[]): Resident[] {
    if (!residents || !Array.isArray(residents)) return [];
    return residents.filter(resident => hasAnyPrivilege(resident));
}

/**
 * Get discounts for fee type
 */
function getDiscountsForFeeType(feeType: FeeType, discountRules: DiscountRule[]): DiscountRule[] {
    if (!discountRules || !Array.isArray(discountRules)) return [];
    return discountRules.filter(rule => 
        rule.applies_to_all_fee_types || 
        rule.applies_to_fee_type_ids?.includes(feeType.id)
    );
}

/**
 * Get discount note
 */
function getDiscountNote(discountCodes: string[]): { type: 'warning' | 'info', note: string } {
    if (discountCodes.includes('senior') && discountCodes.includes('pwd')) {
        return {
            type: 'warning',
            note: 'Note: Only the highest applicable discount will be applied (usually Senior or PWD takes precedence).'
        };
    }
    return {
        type: 'info',
        note: 'Eligible discounts will be automatically applied based on resident privileges.'
    };
}

/**
 * Get Philippine legal basis
 */
function getPhilippineLegalBasis(discountType: string): string {
    const legalBasis: Record<string, string> = {
        senior: 'RA 9994 - Expanded Senior Citizens Act of 2010',
        pwd: 'RA 10754 - Persons with Disability Benefits Act',
        solo_parent: 'RA 8972 - Solo Parents Welfare Act of 2000',
        indigent: 'LGU Ordinance - Based on local government classification'
    };
    return legalBasis[discountType] || 'Local Government Ordinance';
}

/**
 * Format currency helper
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function FeesCreate({
    fee_types = [],
    residents = [],
    households = [],
    discountRules = [],
    preselectedResident,
    preselectedHousehold,
    puroks = [],
    documentCategories = [],
    errors = {},
    initialData,
    duplicateFrom,
    allPrivileges = []
}: ExtendedFeesCreateProps) {
    // Default form data
    const defaultFormData: BulkFeeFormData = {
        fee_type_id: 0,
        resident_id: 0,
        amount: 0,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        payment_method: '',
        payment_reference: '',
        notes: '',
        apply_discounts: false,
        senior_discount: false,
        pwd_discount: false,
        solo_parent_discount: false,
        indigent_discount: false,
        payer_type: preselectedResident
            ? 'resident'
            : preselectedHousehold
              ? 'household'
              : '',
        household_id: '',
        business_name: '',
        payer_name: preselectedResident?.full_name || preselectedHousehold?.name || '',
        contact_number: preselectedResident?.phone || preselectedHousehold?.contact_number || '',
        address: '',
        purok: preselectedResident?.purok || preselectedHousehold?.purok || '',
        zone: '',
        billing_period: '',
        period_start: '',
        period_end: '',
        issue_date: new Date().toISOString().split('T')[0],
        base_amount: 0,
        surcharge_amount: 0,
        penalty_amount: 0,
        discount_amount: 0,
        total_amount: 0,
        purpose: '',
        property_description: '',
        business_type: '',
        area: 0,
        remarks: '',
        requirements_submitted: [],
        ph_legal_compliance_notes: '',
        bulk_type: 'none',
        selected_resident_ids: [],
        selected_household_ids: [],
        custom_payers: [],
        apply_to_all_residents: false,
        apply_to_all_households: false,
        filter_purok: '',
        filter_discount_eligible: false,
    };

    // Clean initial data
    const cleanInitialData = (data: any): Partial<BulkFeeFormData> => {
        if (!data) return {};
        
        let payerType = data.payer_type;
        if (payerType === 'App\\Models\\Resident') {
            payerType = 'resident';
        } else if (payerType === 'App\\Models\\Household') {
            payerType = 'household';
        }
        
        return {
            ...data,
            fee_type_id: data.fee_type_id ? Number(data.fee_type_id) : 0,
            payer_type: payerType,
            resident_id: data.resident_id ? Number(data.resident_id) : 0,
            household_id: data.household_id ? String(data.household_id) : '',
            business_name: data.business_name || '',
            payer_name: data.payer_name || '',
            contact_number: data.contact_number || '',
            address: data.address || '',
            purok: data.purok || '',
            zone: data.zone || '',
            billing_period: data.billing_period || '',
            period_start: data.period_start || '',
            period_end: data.period_end || '',
            issue_date: data.issue_date || '',
            due_date: data.due_date || '',
            purpose: data.purpose || '',
            property_description: data.property_description || '',
            business_type: data.business_type || '',
            remarks: data.remarks || '',
            base_amount: Number(data.base_amount) || 0,
            surcharge_amount: Number(data.surcharge_amount) || 0,
            penalty_amount: Number(data.penalty_amount) || 0,
            discount_amount: Number(data.discount_amount) || 0,
            total_amount: Number(data.total_amount) || 0,
            area: Number(data.area) || 0,
            requirements_submitted: Array.isArray(data.requirements_submitted)
                ? data.requirements_submitted
                : [],
            ph_legal_compliance_notes: data.ph_legal_compliance_notes || '',
            bulk_type: data.bulk_type || 'none',
            selected_resident_ids: Array.isArray(data.selected_resident_ids) 
                ? data.selected_resident_ids.map(String)
                : [],
            selected_household_ids: Array.isArray(data.selected_household_ids) 
                ? data.selected_household_ids.map(String)
                : [],
            custom_payers: Array.isArray(data.custom_payers) 
                ? data.custom_payers 
                : [],
            apply_to_all_residents: Boolean(data.apply_to_all_residents),
            apply_to_all_households: Boolean(data.apply_to_all_households),
            filter_purok: data.filter_purok || '',
            filter_discount_eligible: Boolean(data.filter_discount_eligible),
        };
    };

    const mergedInitialData: BulkFeeFormData = {
        ...defaultFormData,
        ...cleanInitialData(initialData),
    };

    const { data, setData, post, processing } = useForm<BulkFeeFormData>(mergedInitialData);

    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | null>(null);
    const [showSurcharge, setShowSurcharge] = useState(false);
    const [showPenalty, setShowPenalty] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [surchargeExplanation, setSurchargeExplanation] = useState<string>('');
    const [penaltyExplanation, setPenaltyExplanation] = useState<string>('');
    
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectAllResidents, setSelectAllResidents] = useState(false);
    const [selectAllHouseholds, setSelectAllHouseholds] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // FIXED: Filter residents - add safety check for residents array
    const filteredResidents = useMemo(() => {
        // Safety check - ensure residents is an array
        if (!residents || !Array.isArray(residents)) {
            return [];
        }
        
        let filtered = [...residents];
        
        if (data.filter_purok && data.filter_purok !== 'none') {
            filtered = filtered.filter(resident => 
                resident.purok === data.filter_purok
            );
        }
        
        // DYNAMIC: Filter by discount eligibility (any privilege)
        if (data.filter_discount_eligible) {
            filtered = filterByDiscountEligibility(filtered);
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(resident =>
                resident.full_name?.toLowerCase().includes(term) ||
                resident.phone?.toLowerCase().includes(term) ||
                resident.purok?.toLowerCase().includes(term) ||
                // Search in privileges
                resident.privileges?.some((p: PrivilegeData) => 
                    p.name?.toLowerCase().includes(term) ||
                    p.code?.toLowerCase().includes(term)
                )
            );
        }
        
        return filtered;
    }, [residents, data.filter_purok, data.filter_discount_eligible, searchTerm]);

    // FIXED: Filter households - add safety check for households array
    const filteredHouseholds = useMemo(() => {
        // Safety check - ensure households is an array
        if (!households || !Array.isArray(households)) {
            return [];
        }
        
        let filtered = [...households];
        
        if (data.filter_purok && data.filter_purok !== 'none') {
            filtered = filtered.filter(household => 
                household.purok === data.filter_purok
            );
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(household =>
                household.name?.toLowerCase().includes(term) ||
                household.contact_number?.toLowerCase().includes(term) ||
                household.purok?.toLowerCase().includes(term) ||
                // Search in head privileges
                household.head_privileges?.some((p: PrivilegeData) => 
                    p.name?.toLowerCase().includes(term) ||
                    p.code?.toLowerCase().includes(term)
                )
            );
        }
        
        return filtered;
    }, [households, data.filter_purok, searchTerm]);

    // Calculate total amount
    useEffect(() => {
        const total = data.base_amount + data.surcharge_amount + data.penalty_amount - data.discount_amount;
        setData('total_amount', total);
        setData('amount', total);
    }, [data.base_amount, data.surcharge_amount, data.penalty_amount, data.discount_amount, setData]);

    // FIXED: Initialize form with safety checks
    useEffect(() => {
        if (data.fee_type_id) {
            const feeType = fee_types.find(
                (ft) => ft.id === data.fee_type_id
            );
            if (feeType) {
                setSelectedFeeType(feeType);
                setShowSurcharge(feeType.has_surcharge);
                setShowPenalty(feeType.has_penalty);
                
                if (feeType.has_surcharge && feeType.surcharge_percentage) {
                    setSurchargeExplanation(`A surcharge of ${feeType.surcharge_percentage}% may apply to this fee type.`);
                }
                
                if (feeType.has_penalty && feeType.penalty_fixed) {
                    setPenaltyExplanation(`This fee type can have penalties up to ₱${feeType.penalty_fixed} for late payments.`);
                }
            }
        }

        // Handle initial selection of payer - add safety checks
        if (data.payer_type === 'resident' && data.resident_id) {
            const resident = residents && Array.isArray(residents) 
                ? residents.find((r) => r.id === data.resident_id)
                : undefined;
            if (resident) setSelectedPayer(resident);
        } else if (data.payer_type === 'household' && data.household_id) {
            const household = households && Array.isArray(households)
                ? households.find((h) => h.id.toString() === data.household_id.toString())
                : undefined;
            if (household) setSelectedPayer(household);
        }
    }, [data.fee_type_id, data.payer_type, data.resident_id, data.household_id, fee_types, residents, households]);

    const handleFeeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const feeTypeId = parseInt(e.target.value);
        const selected = fee_types.find((ft) => ft.id === feeTypeId);

        setSelectedFeeType(selected || null);

        if (selected) {
            setData('fee_type_id', feeTypeId);
            const baseAmount = typeof selected.base_amount === 'string' 
                ? parseFloat(selected.base_amount) 
                : selected.base_amount;
            setData('base_amount', baseAmount);
            
            setShowSurcharge(selected.has_surcharge);
            setShowPenalty(selected.has_penalty);

            if (selected.has_surcharge && selected.surcharge_percentage) {
                setSurchargeExplanation(`A surcharge of ${selected.surcharge_percentage}% may apply to this fee type.`);
            } else {
                setSurchargeExplanation('');
            }
            
            if (selected.has_penalty && selected.penalty_fixed) {
                setPenaltyExplanation(`This fee type can have penalties up to ₱${selected.penalty_fixed} for late payments.`);
            } else {
                setPenaltyExplanation('');
            }

            if (selected.has_surcharge && selected.surcharge_percentage) {
                const surcharge = (baseAmount * selected.surcharge_percentage) / 100;
                setData('surcharge_amount', surcharge);
            } else {
                setData('surcharge_amount', 0);
            }

            setData('penalty_amount', 0);
            
        } else {
            setSelectedFeeType(null);
            setData('fee_type_id', 0);
            setData('base_amount', 0);
            setShowSurcharge(false);
            setShowPenalty(false);
            setData('surcharge_amount', 0);
            setData('penalty_amount', 0);
            setSurchargeExplanation('');
            setPenaltyExplanation('');
        }
    };

    const handlePayerTypeChange = (payerType: string) => {
        setData('payer_type', payerType);
        setData('resident_id', 0);
        setData('household_id', '');
        setData('business_name', '');
        setSelectedPayer(null);

        if (payerType === 'resident' && preselectedResident) {
            setData('resident_id', preselectedResident.id);
            setData('payer_name', preselectedResident.full_name || '');
            setData('contact_number', preselectedResident.phone || '');
            setData('purok', preselectedResident.purok || '');
        } else if (payerType === 'household' && preselectedHousehold) {
            setData('household_id', preselectedHousehold.id.toString());
            setData('payer_name', preselectedHousehold.name);
            setData('contact_number', preselectedHousehold.contact_number || '');
            setData('purok', preselectedHousehold.purok || '');
        } else if (!initialData) {
            setData('payer_name', '');
            setData('contact_number', '');
            setData('purok', '');
        }
    };

    // FIXED: Update handleResidentSelect with safety check
    const handleResidentSelect = (residentId: string) => {
        const resident = residents && Array.isArray(residents)
            ? residents.find((r) => r.id.toString() === residentId)
            : undefined;
        if (resident) {
            setSelectedPayer(resident);
            setData('resident_id', resident.id);
            setData('payer_type', 'resident');
            setData('payer_name', resident.full_name || '');
            setData('contact_number', resident.phone || '');
            setData('purok', resident.purok || '');
        }
    };

    // FIXED: Update handleHouseholdSelect with safety check
    const handleHouseholdSelect = (householdId: string) => {
        const household = households && Array.isArray(households)
            ? households.find((h) => h.id.toString() === householdId)
            : undefined;
        if (household) {
            setSelectedPayer(household);
            setData('household_id', householdId);
            setData('payer_type', 'household');
            setData('payer_name', household.name);
            setData('contact_number', household.contact_number || '');
            setData('purok', household.purok || '');
        }
    };

    const handleResetForm = () => {
        Object.entries(mergedInitialData).forEach(([key, value]) => {
            setData(key as keyof BulkFeeFormData, value as any);
        });

        if (mergedInitialData.fee_type_id) {
            const feeType = fee_types.find(
                (ft) => ft.id === mergedInitialData.fee_type_id
            );
            if (feeType) {
                setSelectedFeeType(feeType);
                setShowSurcharge(feeType.has_surcharge);
                setShowPenalty(feeType.has_penalty);
            }
        } else {
            setSelectedFeeType(null);
            setShowSurcharge(false);
            setShowPenalty(false);
            setSurchargeExplanation('');
            setPenaltyExplanation('');
        }
        
        setData('penalty_amount', 0);
        setData('selected_resident_ids', []);
        setData('selected_household_ids', []);
        setData('custom_payers', []);
        setData('apply_to_all_residents', false);
        setData('apply_to_all_households', false);
        setData('bulk_type', 'none');
        setSelectAllResidents(false);
        setSelectAllHouseholds(false);
        setSearchTerm('');
    };

    const handleSelectAllResidents = () => {
        if (selectAllResidents) {
            setData('selected_resident_ids', []);
        } else {
            const allIds = filteredResidents.map(resident => resident.id.toString());
            setData('selected_resident_ids', allIds);
        }
        setSelectAllResidents(!selectAllResidents);
    };

    const handleSelectAllHouseholds = () => {
        if (selectAllHouseholds) {
            setData('selected_household_ids', []);
        } else {
            const allIds = filteredHouseholds.map(household => household.id.toString());
            setData('selected_household_ids', allIds);
        }
        setSelectAllHouseholds(!selectAllHouseholds);
    };

    const toggleResidentSelection = (residentId: string | number) => {
        const currentIds = [...data.selected_resident_ids];
        const idStr = residentId.toString();
        
        if (currentIds.includes(idStr)) {
            setData('selected_resident_ids', currentIds.filter(id => id !== idStr));
        } else {
            setData('selected_resident_ids', [...currentIds, idStr]);
        }
    };

    const toggleHouseholdSelection = (householdId: string | number) => {
        const currentIds = [...data.selected_household_ids];
        const idStr = householdId.toString();
        
        if (currentIds.includes(idStr)) {
            setData('selected_household_ids', currentIds.filter(id => id !== idStr));
        } else {
            setData('selected_household_ids', [...currentIds, idStr]);
        }
    };

    const addCustomPayer = () => {
        const newPayer = {
            id: `custom_${Date.now()}`,
            name: '',
            contact_number: '',
            purok: '',
            address: '',
            type: 'custom' as const,
        };
        setData('custom_payers', [...data.custom_payers, newPayer]);
    };

    const removeCustomPayer = (id: string) => {
        setData('custom_payers', data.custom_payers.filter(payer => payer.id !== id));
    };

    const updateCustomPayer = (id: string, field: string, value: string) => {
        setData('custom_payers', data.custom_payers.map(payer => 
            payer.id === id ? { ...payer, [field]: value } : payer
        ));
    };

    const totalPayersCount = useMemo(() => {
        let count = 0;
        
        if (data.bulk_type === 'residents') {
            if (data.apply_to_all_residents) {
                count = filteredResidents.length;
            } else {
                count = data.selected_resident_ids.length;
            }
        } else if (data.bulk_type === 'households') {
            if (data.apply_to_all_households) {
                count = filteredHouseholds.length;
            } else {
                count = data.selected_household_ids.length;
            }
        } else if (data.bulk_type === 'custom') {
            count = data.custom_payers.length;
        } else if (data.bulk_type === 'none') {
            count = (data.payer_type && data.payer_type !== '' && 
                    ((data.payer_type === 'resident' && data.resident_id) ||
                     (data.payer_type === 'household' && data.household_id) ||
                     (data.payer_type === 'business' && data.business_name) ||
                     ((data.payer_type === 'visitor' || data.payer_type === 'other') && data.payer_name))) ? 1 : 0;
        }
        
        return count;
    }, [
        data.bulk_type, data.selected_resident_ids, data.selected_household_ids, 
        data.custom_payers, data.apply_to_all_residents, data.apply_to_all_households,
        data.payer_type, data.resident_id, data.household_id, data.business_name, data.payer_name,
        filteredResidents.length, filteredHouseholds.length
    ]);

    const totalEstimatedAmount = useMemo(() => {
        return data.total_amount * totalPayersCount;
    }, [data.total_amount, totalPayersCount]);

    const handleBulkTypeChange = (bulkType: 'none' | 'residents' | 'households' | 'custom') => {
        const previousBulkType = data.bulk_type;
        setData('bulk_type', bulkType);
        
        if (previousBulkType !== 'none' && bulkType === 'none') {
            if (data.payer_type === 'resident' && data.resident_id) {
                const resident = residents && Array.isArray(residents)
                    ? residents.find(r => r.id === data.resident_id)
                    : undefined;
                if (resident) setSelectedPayer(resident);
            } else if (data.payer_type === 'household' && data.household_id) {
                const household = households && Array.isArray(households)
                    ? households.find(h => h.id.toString() === data.household_id.toString())
                    : undefined;
                if (household) setSelectedPayer(household);
            }
        }
        
        if (previousBulkType === 'none' && bulkType !== 'none') {
            setData('resident_id', 0);
            setData('household_id', '');
            setData('business_name', '');
            setData('payer_name', '');
            setSelectedPayer(null);
            setShowBulkModal(true);
        }
        
        if (bulkType !== 'residents') {
            setData('selected_resident_ids', []);
            setSelectAllResidents(false);
            setData('apply_to_all_residents', false);
        }
        if (bulkType !== 'households') {
            setData('selected_household_ids', []);
            setSelectAllHouseholds(false);
            setData('apply_to_all_households', false);
        }
        if (bulkType !== 'custom') {
            setData('custom_payers', []);
        }
    };

    const handleOpenBulkModal = () => {
        if (data.bulk_type !== 'none') {
            setShowBulkModal(true);
        }
    };

    const handleCloseBulkModal = () => {
        setShowBulkModal(false);
    };

    const filteredFeeTypes = useMemo(() => {
        if (selectedCategory === 'all') return fee_types;
        return fee_types.filter(
            (feeType) =>
                feeType.category && feeType.category.toString() === selectedCategory,
        );
    }, [selectedCategory, fee_types]);

    const getSelectedCategoryName = () => {
        if (selectedCategory === 'all') return 'All Categories';
        const category = documentCategories.find(
            (cat) => cat.id.toString() === selectedCategory,
        );
        return category ? category.name : 'Select Category';
    };

    // Get supported discount info - DYNAMIC with safety
    const discountInfo = useMemo((): DiscountInfo | null => {
        if (!selectedFeeType) return null;
        
        const applicableDiscounts = getDiscountsForFeeType(selectedFeeType, discountRules);
        
        if (applicableDiscounts.length === 0) return null;
        
        const eligibleDiscounts = applicableDiscounts.map(d => ({
            code: d.discount_type,
            name: d.name,
            percentage: d.value_type === 'percentage' ? d.discount_value : 0,
            legalBasis: getPhilippineLegalBasis(d.discount_type),
            description: d.description || '',
            requirements: d.verification_document ? [d.verification_document] : undefined
        }));
        
        const discountCodes = applicableDiscounts.map(d => d.discount_type);
        const note = getDiscountNote(discountCodes);
        
        return {
            eligibleDiscounts,
            legalNotes: [],
            warnings: note.type === 'warning' ? [note.note] : []
        };
    }, [selectedFeeType, discountRules]);

    // Fixed submit function with proper data transformation
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!data.fee_type_id) {
            alert('Please select a fee type');
            return;
        }

        if (data.bulk_type === 'none') {
            if (!data.payer_type) {
                alert('Please select a payer type');
                return;
            }
            
            if (data.payer_type === 'resident' && !data.resident_id) {
                alert('Please select a resident');
                return;
            }
            
            if (data.payer_type === 'household' && !data.household_id) {
                alert('Please select a household');
                return;
            }
            
            if (data.payer_type === 'business' && !data.business_name) {
                alert('Please enter a business name');
                return;
            }
            
            if ((data.payer_type === 'visitor' || data.payer_type === 'other') && !data.payer_name) {
                alert('Please enter a name');
                return;
            }
        }

        if (data.bulk_type === 'custom') {
            const invalidPayers = data.custom_payers.filter(p => !p.name.trim());
            if (invalidPayers.length > 0) {
                alert('Please enter names for all custom payers');
                return;
            }
        }

        if (totalPayersCount > 1) {
            const confirmed = confirm(
                `You are about to create ${totalPayersCount} fees with a total amount of ${formatCurrency(totalEstimatedAmount)}. Do you want to continue?`
            );
            
            if (!confirmed) return;
        }

        // Transform data for submission - only include fields that backend expects
        const submitData: any = {
            // Core fee data
            fee_type_id: data.fee_type_id,
            amount: data.total_amount,
            due_date: data.due_date,
            status: data.status,
            payment_method: data.payment_method,
            payment_reference: data.payment_reference,
            notes: data.notes,
            
            // Financial breakdown
            total_amount: data.total_amount,
            base_amount: data.base_amount,
            surcharge_amount: data.surcharge_amount,
            penalty_amount: data.penalty_amount,
            discount_amount: data.discount_amount,
            
            // Payer information
            payer_type: data.payer_type,
            payer_name: data.payer_name,
            contact_number: data.contact_number,
            purok: data.purok,
            
            // Bulk type
            bulk_type: data.bulk_type,
        };

        // Add conditional fields based on payer type
        if (data.payer_type === 'resident') {
            submitData.resident_id = data.resident_id;
        } else if (data.payer_type === 'household') {
            submitData.household_id = data.household_id;
        } else if (data.payer_type === 'business') {
            submitData.business_name = data.business_name;
            submitData.address = data.address;
            submitData.business_type = data.business_type;
        } else if (data.payer_type === 'visitor' || data.payer_type === 'other') {
            submitData.address = data.address;
        }

        // Add bulk-specific data
        if (data.bulk_type === 'residents') {
            if (data.apply_to_all_residents) {
                submitData.apply_to_all_residents = true;
                submitData.filter_purok = data.filter_purok;
                submitData.filter_discount_eligible = data.filter_discount_eligible;
            } else {
                submitData.selected_resident_ids = data.selected_resident_ids;
            }
        } else if (data.bulk_type === 'households') {
            if (data.apply_to_all_households) {
                submitData.apply_to_all_households = true;
                submitData.filter_purok = data.filter_purok;
            } else {
                submitData.selected_household_ids = data.selected_household_ids;
            }
        } else if (data.bulk_type === 'custom') {
            submitData.custom_payers = data.custom_payers;
        }

        // Add optional fields if they have values
        if (data.issue_date) submitData.issue_date = data.issue_date;
        if (data.billing_period) submitData.billing_period = data.billing_period;
        if (data.period_start) submitData.period_start = data.period_start;
        if (data.period_end) submitData.period_end = data.period_end;
        if (data.purpose) submitData.purpose = data.purpose;
        if (data.property_description) submitData.property_description = data.property_description;
        if (data.area) submitData.area = data.area;
        if (data.remarks) submitData.remarks = data.remarks;
        if (data.requirements_submitted && data.requirements_submitted.length > 0) {
            submitData.requirements_submitted = data.requirements_submitted;
        }
        if (data.ph_legal_compliance_notes) submitData.ph_legal_compliance_notes = data.ph_legal_compliance_notes;
        if (data.zone) submitData.zone = data.zone;
        
        // Add discount flags if applicable
        if (data.apply_discounts) {
            submitData.apply_discounts = true;
            if (data.senior_discount) submitData.senior_discount = true;
            if (data.pwd_discount) submitData.pwd_discount = true;
            if (data.solo_parent_discount) submitData.solo_parent_discount = true;
            if (data.indigent_discount) submitData.indigent_discount = true;
        }

        // Remove any undefined values
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === undefined) {
                delete submitData[key];
            }
        });

        // Send to server
        post('/admin/fees', submitData);
    };

    const feeFormDataForChild = useMemo(() => {
        const { 
            selected_resident_ids,
            selected_household_ids,
            custom_payers,
            apply_to_all_residents,
            apply_to_all_households,
            filter_purok,
            filter_discount_eligible,
            bulk_type,
            ...rest
        } = data;
        
        return rest;
    }, [data]);

    const unifiedSetData = useMemo(() => {
        return (key: keyof typeof feeFormDataForChild, value: any) => {
            setData(key as keyof BulkFeeFormData, value);
        };
    }, [setData]);

    return (
        <AppLayout
            title={duplicateFrom ? 'Duplicate Fee' : 'Create New Fee'}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fees', href: '/admin/fees' },
                {
                    title: duplicateFrom ? 'Duplicate Fee' : 'Create Fee',
                    href: '/admin/fees/create',
                },
            ]}
        >
            <Head title={duplicateFrom ? 'Duplicate Fee' : 'Create New Fee'} />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header Section */}
                    <HeaderSection
                        duplicateFrom={duplicateFrom}
                        processing={processing}
                        handleResetForm={handleResetForm}
                    />

                    {/* Bulk Creation Summary Banner */}
                    {totalPayersCount > 1 && (
                        <Alert className="border-l-4 border-l-purple-500 dark:bg-gray-900 dark:border-purple-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-purple-700 dark:text-purple-300">
                                            Bulk Fee Creation
                                        </div>
                                        <div className="text-sm text-purple-600 dark:text-purple-400">
                                            Creating fees for <span className="font-bold">{totalPayersCount}</span> payers
                                            {data.bulk_type === 'residents' && ' (Residents)'}
                                            {data.bulk_type === 'households' && ' (Households)'}
                                            {data.bulk_type === 'custom' && ' (Custom Payers)'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-purple-600 dark:text-purple-400">Total Amount</div>
                                        <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                            {formatCurrency(totalEstimatedAmount)}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenBulkModal}
                                        className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50"
                                    >
                                        Edit Selection
                                    </Button>
                                </div>
                            </div>
                        </Alert>
                    )}

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column */}
                        <LeftColumn
                            data={feeFormDataForChild}
                            setData={unifiedSetData}
                            selectedFeeType={selectedFeeType}
                            showSurcharge={showSurcharge}
                            showPenalty={showPenalty}
                            surchargeExplanation={surchargeExplanation}
                            penaltyExplanation={penaltyExplanation}
                            errors={errors}
                            handleFeeTypeChange={handleFeeTypeChange}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            filteredFeeTypes={filteredFeeTypes}
                            documentCategories={documentCategories}
                            getSelectedCategoryName={getSelectedCategoryName}
                            feeTypes={fee_types}
                            selectedPayer={selectedPayer}
                            payerType={data.payer_type}
                            formatCurrency={formatCurrency}
                            selectedFeeTypeId={selectedFeeType?.id}
                            discountInfo={discountInfo}
                            bulkType={data.bulk_type}
                            handleBulkTypeChange={handleBulkTypeChange}
                            totalPayersCount={totalPayersCount}
                            totalEstimatedAmount={totalEstimatedAmount}
                            onOpenBulkModal={handleOpenBulkModal}
                            allPrivileges={allPrivileges}
                        />

                        {/* Right Column */}
                        <RightColumn
                            data={feeFormDataForChild}
                            setData={unifiedSetData}
                            selectedPayer={selectedPayer}
                            residents={residents}
                            households={households}
                            puroks={puroks}
                            errors={errors}
                            handlePayerTypeChange={handlePayerTypeChange}
                            handleResidentSelect={handleResidentSelect}
                            handleHouseholdSelect={handleHouseholdSelect}
                            hideIndividualSelection={data.bulk_type !== 'none'}
                            allPrivileges={allPrivileges}
                        />
                    </div>
                </div>
            </form>

            {/* Bulk Selection Modal */}
            <BulkSelectionModal
                isOpen={showBulkModal}
                onClose={handleCloseBulkModal}
                bulkType={data.bulk_type as 'residents' | 'households' | 'custom'}
                residents={filteredResidents}
                households={filteredHouseholds}
                puroks={puroks}
                allPrivileges={allPrivileges}
                selectedResidentIds={data.selected_resident_ids}
                selectedHouseholdIds={data.selected_household_ids}
                customPayers={data.custom_payers}
                filterPurok={data.filter_purok === 'none' ? '' : data.filter_purok}
                filterDiscountEligible={data.filter_discount_eligible}
                applyToAllResidents={data.apply_to_all_residents}
                applyToAllHouseholds={data.apply_to_all_households}
                searchTerm={searchTerm}
                toggleResidentSelection={toggleResidentSelection}
                toggleHouseholdSelection={toggleHouseholdSelection}
                addCustomPayer={addCustomPayer}
                removeCustomPayer={removeCustomPayer}
                updateCustomPayer={updateCustomPayer}
                handleSelectAllResidents={handleSelectAllResidents}
                handleSelectAllHouseholds={handleSelectAllHouseholds}
                setData={setData}
                setSearchTerm={setSearchTerm}
                selectAllResidents={selectAllResidents}
                selectAllHouseholds={selectAllHouseholds}
                totalPayersCount={totalPayersCount}
                totalEstimatedAmount={totalEstimatedAmount}
            />
        </AppLayout>
    );
}