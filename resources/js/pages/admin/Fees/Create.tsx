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
import { 
    BulkFeeFormData, 
    FeesCreateProps, 
    FeeType, 
    Resident, 
    Household, 
    DocumentCategory,
    DiscountInfo,
    DiscountRule
} from '@/types/fees';
import { 
    formatCurrency, 
    parseNumber, 
    safeString, 
    calculateTotalAmount,
    validateFeeForm,
    getBulkCreationSummary,
    getDiscountsForFeeType,
    getDiscountNote,
    PHILIPPINE_DISCOUNT_LAWS,
    getPhilippineLegalBasis
} from '@/admin-utils/fees/discount-display-utils';

export default function FeesCreate({
    feeTypes,
    residents,
    households,
    discountRules = [],
    preselectedResident,
    preselectedHousehold,
    puroks,
    documentCategories,
    errors,
    initialData,
    duplicateFrom,
}: FeesCreateProps) {
    // Default form data - using simple strings for payer_type (validation expects these)
    const defaultFormData: BulkFeeFormData = {
        fee_type_id: '',
        payer_type: preselectedResident
            ? 'resident'
            : preselectedHousehold
              ? 'household'
              : '',
        resident_id: '',
        household_id: '',
        business_name: '',
        payer_name:
            preselectedResident?.full_name || preselectedHousehold?.name || '',
        contact_number:
            preselectedResident?.contact_number ||
            preselectedHousehold?.contact_number ||
            '',
        address: '',
        purok: preselectedResident?.purok || preselectedHousehold?.purok || '',
        zone: '',
        billing_period: '',
        period_start: '',
        period_end: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
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
        ph_senior_id_verified: false,
        ph_pwd_id_verified: false,
        ph_solo_parent_id_verified: false,
        ph_indigent_id_verified: false,
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
        
        // Convert any model strings to simple strings if present
        let payerType = data.payer_type;
        if (payerType === 'App\\Models\\Resident') {
            payerType = 'resident';
        } else if (payerType === 'App\\Models\\Household') {
            payerType = 'household';
        }
        
        return {
            ...data,
            fee_type_id: safeString(data.fee_type_id),
            payer_type: payerType,
            resident_id: safeString(data.resident_id),
            household_id: safeString(data.household_id),
            business_name: safeString(data.business_name),
            payer_name: safeString(data.payer_name),
            contact_number: safeString(data.contact_number),
            address: safeString(data.address),
            purok: safeString(data.purok),
            zone: safeString(data.zone),
            billing_period: safeString(data.billing_period),
            period_start: safeString(data.period_start),
            period_end: safeString(data.period_end),
            issue_date: safeString(data.issue_date),
            due_date: safeString(data.due_date),
            purpose: safeString(data.purpose),
            property_description: safeString(data.property_description),
            business_type: safeString(data.business_type),
            remarks: safeString(data.remarks),
            base_amount: parseNumber(data.base_amount),
            surcharge_amount: parseNumber(data.surcharge_amount),
            penalty_amount: parseNumber(data.penalty_amount),
            discount_amount: 0,
            total_amount: parseNumber(data.total_amount),
            area: parseNumber(data.area),
            requirements_submitted: Array.isArray(data.requirements_submitted)
                ? data.requirements_submitted
                : [],
            ph_senior_id_verified: false,
            ph_pwd_id_verified: false,
            ph_solo_parent_id_verified: false,
            ph_indigent_id_verified: false,
            ph_legal_compliance_notes: '',
            bulk_type: data.bulk_type || 'none',
            selected_resident_ids: Array.isArray(data.selected_resident_ids) 
                ? data.selected_resident_ids 
                : [],
            selected_household_ids: Array.isArray(data.selected_household_ids) 
                ? data.selected_household_ids 
                : [],
            custom_payers: Array.isArray(data.custom_payers) 
                ? data.custom_payers 
                : [],
            apply_to_all_residents: Boolean(data.apply_to_all_residents),
            apply_to_all_households: Boolean(data.apply_to_all_households),
            filter_purok: safeString(data.filter_purok),
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

    // Filter residents
    const filteredResidents = useMemo(() => {
        let filtered = [...residents];
        
        if (data.filter_purok && data.filter_purok !== 'none') {
            filtered = filtered.filter(resident => 
                resident.purok === data.filter_purok
            );
        }
        
        if (data.filter_discount_eligible) {
            filtered = filtered.filter(resident => 
                resident.is_senior || 
                resident.is_pwd || 
                resident.is_solo_parent || 
                resident.is_indigent
            );
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(resident =>
                resident.full_name.toLowerCase().includes(term) ||
                resident.contact_number?.toLowerCase().includes(term) ||
                resident.purok?.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }, [residents, data.filter_purok, data.filter_discount_eligible, searchTerm]);

    // Filter households
    const filteredHouseholds = useMemo(() => {
        let filtered = [...households];
        
        if (data.filter_purok && data.filter_purok !== 'none') {
            filtered = filtered.filter(household => 
                household.purok === data.filter_purok
            );
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(household =>
                household.name.toLowerCase().includes(term) ||
                household.contact_number?.toLowerCase().includes(term) ||
                household.purok?.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }, [households, data.filter_purok, searchTerm]);

    // Calculate total amount
    useEffect(() => {
        const total = calculateTotalAmount(
            data.base_amount,
            data.surcharge_amount,
            data.penalty_amount
        );
        setData('total_amount', total);
    }, [data.base_amount, data.surcharge_amount, data.penalty_amount]);

    // Initialize form
    useEffect(() => {
        if (data.fee_type_id) {
            const feeType = feeTypes.find(
                (ft) => ft.id.toString() === data.fee_type_id.toString(),
            );
            if (feeType) {
                setSelectedFeeType(feeType);
                setShowSurcharge(feeType.has_surcharge);
                setShowPenalty(feeType.has_penalty);
                
                if (feeType.surcharge_description) {
                    setSurchargeExplanation(feeType.surcharge_description);
                } else if (feeType.has_surcharge && feeType.surcharge_percentage) {
                    setSurchargeExplanation(`A surcharge of ${feeType.surcharge_percentage}% may apply to this fee type.`);
                }
                
                if (feeType.penalty_description) {
                    setPenaltyExplanation(feeType.penalty_description);
                } else if (feeType.has_penalty && feeType.penalty_fixed) {
                    setPenaltyExplanation(`This fee type can have penalties up to ₱${feeType.penalty_fixed} for late payments.`);
                }
            }
        }

        // Handle initial selection of payer
        if (data.payer_type === 'resident' && data.resident_id) {
            const resident = residents.find(
                (r) => r.id.toString() === data.resident_id.toString(),
            );
            if (resident) setSelectedPayer(resident);
        } else if (data.payer_type === 'household' && data.household_id) {
            const household = households.find(
                (h) => h.id.toString() === data.household_id.toString(),
            );
            if (household) setSelectedPayer(household);
        }
    }, []);

    const handleFeeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const feeTypeId = e.target.value;
        const selected = feeTypes.find((ft) => ft.id.toString() === feeTypeId);

        setSelectedFeeType(selected || null);

        if (selected) {
            setData('fee_type_id', feeTypeId);
            setData('base_amount', selected.base_amount);
            
            setShowSurcharge(selected.has_surcharge);
            setShowPenalty(selected.has_penalty);

            if (selected.surcharge_description) {
                setSurchargeExplanation(selected.surcharge_description);
            } else if (selected.has_surcharge && selected.surcharge_percentage) {
                setSurchargeExplanation(`A surcharge of ${selected.surcharge_percentage}% may apply to this fee type.`);
            } else {
                setSurchargeExplanation('');
            }
            
            if (selected.penalty_description) {
                setPenaltyExplanation(selected.penalty_description);
            } else if (selected.has_penalty && selected.penalty_fixed) {
                setPenaltyExplanation(`This fee type can have penalties up to ₱${selected.penalty_fixed} for late payments.`);
            } else {
                setPenaltyExplanation('');
            }

            if (selected.has_surcharge && selected.surcharge_percentage) {
                const surcharge = (selected.base_amount * selected.surcharge_percentage) / 100;
                setData('surcharge_amount', surcharge);
            } else {
                setData('surcharge_amount', 0);
            }

            setData('penalty_amount', 0);
            
        } else {
            setSelectedFeeType(null);
            setData('fee_type_id', '');
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
        // Use the simple string values that the validation expects
        // 'resident', 'business', 'household', 'visitor', 'other'
        setData('payer_type', payerType);
        setData('resident_id', '');
        setData('household_id', '');
        setData('business_name', '');
        setSelectedPayer(null);

        if (payerType === 'resident' && preselectedResident) {
            setData('resident_id', preselectedResident.id);
            setData('payer_name', preselectedResident.full_name);
            setData('contact_number', preselectedResident.contact_number || '');
            setData('purok', preselectedResident.purok || '');
        } else if (payerType === 'household' && preselectedHousehold) {
            setData('household_id', preselectedHousehold.id);
            setData('payer_name', preselectedHousehold.name);
            setData('contact_number', preselectedHousehold.contact_number || '');
            setData('purok', preselectedHousehold.purok || '');
        } else if (!initialData) {
            setData('payer_name', '');
            setData('contact_number', '');
            setData('purok', '');
        }
    };

    const handleResidentSelect = (residentId: string) => {
        const resident = residents.find((r) => r.id.toString() === residentId);
        if (resident) {
            setSelectedPayer(resident);
            setData('resident_id', residentId);
            setData('payer_type', 'resident'); // Use simple string
            setData('payer_name', resident.full_name);
            setData('contact_number', resident.contact_number || '');
            setData('purok', resident.purok || '');
        }
    };

    const handleHouseholdSelect = (householdId: string) => {
        const household = households.find((h) => h.id.toString() === householdId);
        if (household) {
            setSelectedPayer(household);
            setData('household_id', householdId);
            setData('payer_type', 'household'); // Use simple string
            setData('payer_name', household.name);
            setData('contact_number', household.contact_number || '');
            setData('purok', household.purok || '');
        }
    };

    const handleResetForm = () => {
        Object.entries(mergedInitialData).forEach(([key, value]) => {
            setData(key as keyof BulkFeeFormData, value);
        });

        if (mergedInitialData.fee_type_id) {
            const feeType = feeTypes.find(
                (ft) => ft.id.toString() === mergedInitialData.fee_type_id.toString(),
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
                const resident = residents.find(r => r.id.toString() === data.resident_id.toString());
                if (resident) setSelectedPayer(resident);
            } else if (data.payer_type === 'household' && data.household_id) {
                const household = households.find(h => h.id.toString() === data.household_id.toString());
                if (household) setSelectedPayer(household);
            }
        }
        
        if (previousBulkType === 'none' && bulkType !== 'none') {
            setData('resident_id', '');
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
        if (selectedCategory === 'all') return feeTypes;
        return feeTypes.filter(
            (feeType) =>
                feeType.document_category_id &&
                feeType.document_category_id.toString() === selectedCategory,
        );
    }, [selectedCategory, feeTypes]);

    const getSelectedCategoryName = () => {
        if (selectedCategory === 'all') return 'All Categories';
        const category = documentCategories.find(
            (cat) => cat.id.toString() === selectedCategory,
        );
        return category ? category.name : 'Select Category';
    };

    // Get supported discount info (informational only)
    const discountInfo = useMemo((): DiscountInfo | null => {
        if (!selectedFeeType || !selectedFeeType.is_discountable) return null;
        
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
        
        const legalNotes = [];
        if (applicableDiscounts.some(d => d.discount_type === 'SENIOR')) {
            legalNotes.push('Senior Citizen: 20% discount under RA 9994');
        }
        if (applicableDiscounts.some(d => d.discount_type === 'PWD')) {
            legalNotes.push('PWD: 20% discount under RA 10754');
        }
        if (applicableDiscounts.some(d => d.discount_type === 'SOLO_PARENT')) {
            legalNotes.push('Solo Parent: Up to 10% discount under RA 8972 (varies by LGU)');
        }
        
        const discountCodes = applicableDiscounts.map(d => d.discount_type);
        const note = getDiscountNote(discountCodes);
        
        return {
            eligibleDiscounts,
            legalNotes,
            warnings: note.type === 'warning' ? [note.note] : []
        };
    }, [selectedFeeType, discountRules]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateFeeForm(data, data.bulk_type);
        if (validationError) {
            alert(validationError);
            return;
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
                getBulkCreationSummary(
                    totalPayersCount, 
                    totalEstimatedAmount, 
                    data.bulk_type
                )
            );
            
            if (!confirmed) return;
        }

        post('/fees');
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
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Fees', href: '/fees' },
                {
                    title: duplicateFrom ? 'Duplicate Fee' : 'Create Fee',
                    href: '/fees/create',
                },
            ]}
        >
            <Head title={duplicateFrom ? 'Duplicate Fee' : 'Create New Fee'} />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    <HeaderSection
                        duplicateFrom={duplicateFrom}
                        processing={processing}
                        handleResetForm={handleResetForm}
                    />

                    {/* Bulk Creation Summary Banner */}
                    {totalPayersCount > 1 && (
                        <Alert className="border-purple-200 bg-purple-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <div className="font-semibold text-purple-700">
                                            Bulk Fee Creation
                                        </div>
                                        <div className="text-sm text-purple-600">
                                            Creating fees for <span className="font-bold">{totalPayersCount}</span> payers
                                            {data.bulk_type === 'residents' && ' (Residents)'}
                                            {data.bulk_type === 'households' && ' (Households)'}
                                            {data.bulk_type === 'custom' && ' (Custom Payers)'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-purple-600">Total Amount</div>
                                        <div className="text-xl font-bold text-purple-700">
                                            {formatCurrency(totalEstimatedAmount)}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenBulkModal}
                                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                    >
                                        Edit Selection
                                    </Button>
                                </div>
                            </div>
                        </Alert>
                    )}

                    <div className="grid gap-6 lg:grid-cols-2">
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
                            feeTypes={feeTypes}
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
                        />

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
                        />
                    </div>
                </div>
            </form>

            <BulkSelectionModal
                isOpen={showBulkModal}
                onClose={handleCloseBulkModal}
                bulkType={data.bulk_type as 'residents' | 'households' | 'custom'}
                residents={filteredResidents}
                households={filteredHouseholds}
                puroks={puroks}
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