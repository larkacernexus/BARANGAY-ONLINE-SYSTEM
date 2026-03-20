// pages/admin/fees/edit.tsx

import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import HeaderSection from '@/components/admin/feesCreate/feesEdit/HeaderSection';
import LeftColumn from '@/components/admin/feesCreate/feesEdit/LeftColumn';
import RightColumn from '@/components/admin/feesCreate/feesEdit/RightColumn';
import CancelFeeModal from '@/components/admin/feesCreate/feesEdit/CancelFeeModal';
import { 
    FeeEditProps, 
    FeeType, 
    Resident, 
    Household,
    DiscountInfo,
    FeeFormData
} from '@/types/fees';
import { 
    formatCurrency, 
    parseNumber, 
    safeString, 
    calculateTotalAmount,
    validateFeeForm,
    getDiscountsForFeeType,
    getDiscountNote,
    getPhilippineLegalBasis
} from '@/admin-utils/fees/discount-display-utils';

// ========== DYNAMIC PRIVILEGE HELPER FUNCTIONS ==========

/**
 * Get active privileges from resident
 */
function getActivePrivileges(resident: Resident): any[] {
    if (!resident.privileges || !Array.isArray(resident.privileges)) {
        return [];
    }
    
    return resident.privileges.filter((p: any) => 
        p.status === 'active' || p.status === 'expiring_soon'
    );
}

/**
 * Check if resident has any active privileges
 */
function hasAnyPrivilege(resident: Resident): boolean {
    return getActivePrivileges(resident).length > 0;
}

export default function FeeEdit({
    fee,
    feeTypes,
    residents,
    households,
    discountRules = [],
    puroks,
    documentCategories,
    errors: serverErrors,
    allPrivileges = []
}: FeeEditProps) {
    // Transform fee data to form format
    const transformFeeToFormData = (fee: any): FeeFormData => {
        let payerType = fee.payer_type;
        if (payerType === 'App\\Models\\Resident') {
            payerType = 'resident';
        } else if (payerType === 'App\\Models\\Household') {
            payerType = 'household';
        }

        return {
            fee_type_id: safeString(fee.fee_type_id),
            payer_type: payerType,
            resident_id: safeString(fee.resident_id),
            household_id: safeString(fee.household_id),
            business_name: safeString(fee.business_name),
            payer_name: safeString(fee.payer_name),
            contact_number: safeString(fee.contact_number),
            address: safeString(fee.address),
            purok: safeString(fee.purok),
            zone: safeString(fee.zone),
            billing_period: safeString(fee.billing_period),
            period_start: safeString(fee.period_start),
            period_end: safeString(fee.period_end),
            issue_date: safeString(fee.issue_date),
            due_date: safeString(fee.due_date),
            base_amount: parseNumber(fee.base_amount),
            surcharge_amount: parseNumber(fee.surcharge_amount),
            penalty_amount: parseNumber(fee.penalty_amount),
            discount_amount: parseNumber(fee.discount_amount),
            total_amount: parseNumber(fee.total_amount),
            purpose: safeString(fee.purpose),
            property_description: safeString(fee.property_description),
            business_type: safeString(fee.business_type),
            area: parseNumber(fee.area),
            remarks: safeString(fee.remarks),
            requirements_submitted: Array.isArray(fee.requirements_submitted) 
                ? fee.requirements_submitted 
                : (fee.requirements_submitted ? JSON.parse(fee.requirements_submitted) : []),
            ph_legal_compliance_notes: safeString(fee.ph_legal_compliance_notes),
        };
    };

    const { data, setData, put, processing, errors } = useForm<FeeFormData>(
        transformFeeToFormData(fee)
    );

    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [selectedPayer, setSelectedPayer] = useState<Resident | Household | null>(null);
    const [showSurcharge, setShowSurcharge] = useState(false);
    const [showPenalty, setShowPenalty] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [surchargeExplanation, setSurchargeExplanation] = useState<string>('');
    const [penaltyExplanation, setPenaltyExplanation] = useState<string>('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Calculate total amount
    useEffect(() => {
        const total = calculateTotalAmount(
            data.base_amount,
            data.surcharge_amount,
            data.penalty_amount,
            data.discount_amount
        );
        
        // Only update if different to avoid infinite loop
        if (total !== data.total_amount) {
            setData('total_amount', total);
        }
    }, [data.base_amount, data.surcharge_amount, data.penalty_amount, data.discount_amount]);

    // Initialize form with fee data
    useEffect(() => {
        if (data.fee_type_id) {
            const feeType = feeTypes.find(
                (ft) => ft.id.toString() === data.fee_type_id.toString()
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

        // Set selected payer
        if (data.payer_type === 'resident' && data.resident_id) {
            const resident = residents.find(
                (r) => r.id.toString() === data.resident_id.toString()
            );
            if (resident) setSelectedPayer(resident);
        } else if (data.payer_type === 'household' && data.household_id) {
            const household = households.find(
                (h) => h.id.toString() === data.household_id.toString()
            );
            if (household) setSelectedPayer(household);
        } else if (data.payer_type === 'business' && data.business_name) {
            // Handle business payer - create a pseudo object
            setSelectedPayer({
                id: 'business',
                name: data.business_name,
                contact_number: data.contact_number,
                purok: data.purok,
                address: data.address
            } as any);
        } else if ((data.payer_type === 'visitor' || data.payer_type === 'other') && data.payer_name) {
            // Handle other payer types
            setSelectedPayer({
                id: 'other',
                name: data.payer_name,
                contact_number: data.contact_number,
                purok: data.purok,
                address: data.address
            } as any);
        }
    }, []);

    const handleFeeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const feeTypeId = e.target.value;
        const selected = feeTypes.find((ft) => ft.id.toString() === feeTypeId);

        setSelectedFeeType(selected || null);

        if (selected) {
            setData('fee_type_id', feeTypeId);
            
            // Only update base amount if it's different from current
            if (selected.base_amount !== data.base_amount) {
                setData('base_amount', selected.base_amount);
            }
            
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

            // Recalculate surcharge if needed
            if (selected.has_surcharge && selected.surcharge_percentage && data.surcharge_amount === 0) {
                const surcharge = (selected.base_amount * selected.surcharge_percentage) / 100;
                setData('surcharge_amount', surcharge);
            }
            
        } else {
            setSelectedFeeType(null);
            setData('fee_type_id', '');
            setShowSurcharge(false);
            setShowPenalty(false);
            setSurchargeExplanation('');
            setPenaltyExplanation('');
        }
    };

    const handlePayerTypeChange = (payerType: string) => {
        setData('payer_type', payerType);
        setData('resident_id', '');
        setData('household_id', '');
        setData('business_name', '');
        setSelectedPayer(null);
        setData('payer_name', '');
        setData('contact_number', '');
        setData('purok', '');
        setData('address', '');
    };

    const handleResidentSelect = (residentId: string) => {
        const resident = residents.find((r) => r.id.toString() === residentId);
        if (resident) {
            setSelectedPayer(resident);
            setData('resident_id', residentId);
            setData('payer_type', 'resident');
            setData('payer_name', resident.full_name);
            setData('contact_number', resident.contact_number || '');
            setData('purok', resident.purok || '');
            setData('address', resident.address || '');
        }
    };

    const handleHouseholdSelect = (householdId: string) => {
        const household = households.find((h) => h.id.toString() === householdId);
        if (household) {
            setSelectedPayer(household);
            setData('household_id', householdId);
            setData('payer_type', 'household');
            setData('payer_name', household.name);
            setData('contact_number', household.contact_number || '');
            setData('purok', household.purok || '');
            setData('address', household.address || '');
        }
    };

    const handleResetForm = () => {
        const initialData = transformFeeToFormData(fee);
        Object.entries(initialData).forEach(([key, value]) => {
            setData(key as keyof FeeFormData, value);
        });

        if (initialData.fee_type_id) {
            const feeType = feeTypes.find(
                (ft) => ft.id.toString() === initialData.fee_type_id.toString()
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
    };

    const filteredFeeTypes = useMemo(() => {
        if (selectedCategory === 'all') return feeTypes;
        return feeTypes.filter(
            (feeType) =>
                feeType.document_category_id &&
                feeType.document_category_id.toString() === selectedCategory
        );
    }, [selectedCategory, feeTypes]);

    const getSelectedCategoryName = () => {
        if (selectedCategory === 'all') return 'All Categories';
        const category = documentCategories?.find(
            (cat) => cat.id.toString() === selectedCategory
        );
        return category ? category.name : 'Select Category';
    };

    // Get supported discount info
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
        
        const discountCodes = applicableDiscounts.map(d => d.discount_type);
        const note = getDiscountNote(discountCodes);
        
        return {
            eligibleDiscounts,
            legalNotes: [],
            warnings: note.type === 'warning' ? [note.note] : []
        };
    }, [selectedFeeType, discountRules]);

    // Check if any payer has privileges
    const hasPrivileges = useMemo(() => {
        if (selectedPayer && 'privileges' in selectedPayer) {
            return hasAnyPrivilege(selectedPayer as Resident);
        }
        return false;
    }, [selectedPayer]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateFeeForm(data);
        if (validationError) {
            alert(validationError);
            return;
        }

        const confirmMessage = `Are you sure you want to update this fee?\n\n` +
            `Fee Code: ${fee.fee_code}\n` +
            `Payer: ${data.payer_name}\n` +
            `Amount: ${formatCurrency(data.total_amount)}\n\n` +
            `This action will update the fee record.`;

        if (!confirm(confirmMessage)) return;

        put(`/admin/fees/${fee.id}`);
    };

    return (
        <AppLayout
            title={`Edit Fee: ${fee.fee_code}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fees', href: '/admin/fees' },
                { title: fee.fee_code, href: `/admin/fees/${fee.id}` },
                { title: 'Edit', href: `/admin/fees/${fee.id}/edit` },
            ]}
        >
            <Head title={`Edit Fee: ${fee.fee_code}`} />

          {/* Status Warning Banner */}
{fee.status !== 'pending' && (
    <Alert className="mb-6 border-l-4 border-l-yellow-500 dark:bg-gray-900 dark:border-yellow-800 flex flex-row"> {/* Added flex directly */}
        <div className="flex items-center gap-3 w-full">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
                <div className="font-semibold text-yellow-700 dark:text-yellow-300">
                    Editing {fee.status} Fee
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    This fee has been {fee.status}. Changes made may affect payment records.
                </div>
            </div>
        </div>
    </Alert>
)}

            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header Section */}
                    <HeaderSection
                        fee={fee}
                        processing={processing}
                        handleResetForm={handleResetForm}
                        onCancel={() => setShowCancelModal(true)}
                    />

                    {/* Horizontal Layout - Changed from grid to flex */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column - Fee Details - 50% width */}
                        <div className="lg:w-1/2">
                            <LeftColumn
                                data={data}
                                setData={setData}
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
                                documentCategories={documentCategories || []}
                                getSelectedCategoryName={getSelectedCategoryName}
                                feeTypes={feeTypes}
                                selectedPayer={selectedPayer}
                                payerType={data.payer_type}
                                formatCurrency={formatCurrency}
                                selectedFeeTypeId={selectedFeeType?.id}
                                discountInfo={discountInfo}
                                hasPrivileges={hasPrivileges}
                                allPrivileges={allPrivileges}
                            />
                        </div>

                        {/* Right Column - Payer Information - 50% width */}
                        <div className="lg:w-1/2">
                            <RightColumn
                                data={data}
                                setData={setData}
                                selectedPayer={selectedPayer}
                                residents={residents}
                                households={households}
                                puroks={puroks || []}
                                errors={errors}
                                handlePayerTypeChange={handlePayerTypeChange}
                                handleResidentSelect={handleResidentSelect}
                                handleHouseholdSelect={handleHouseholdSelect}
                                allPrivileges={allPrivileges}
                            />
                        </div>
                    </div>

                    {/* Philippine Law Compliance Note */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                    Philippine Law Compliance
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    Statutory discounts (Senior Citizens, PWDs, Solo Parents, Indigents) are applied during payment processing upon presentation of valid government-issued IDs. This ensures compliance with RA 9994, RA 10754, and RA 8972.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                        <Link href={`/admin/fees/${fee.id}`}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Fee'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Cancel Fee Modal */}
            <CancelFeeModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                fee={fee}
            />
        </AppLayout>
    );
}