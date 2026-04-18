// pages/admin/officials/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { FormContainer } from '@/components/adminui/form/form-container';
import { FormTabs, TabConfig } from '@/components/adminui/form/form-tabs';
import { FormProgress } from '@/components/adminui/form/form-progress';
import { FormNavigation } from '@/components/adminui/form/form-navigation';
import { FormHeader } from '@/components/adminui/form/form-header';
import { FormErrors } from '@/components/adminui/form/form-errors';
import { RequiredFieldsChecklist } from '@/components/adminui/form/required-fields-checklist';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { UserPlus, Shield, Info, Settings, History } from 'lucide-react';
import { Resident, Position, Committee, User, Official } from '@/types/admin/officials/officials';
import { BasicInfoTab } from '@/components/admin/officials/create/basic-info-tab';
import { PositionTab } from '@/components/admin/officials/create/position-tab';
import { DetailsTab } from '@/components/admin/officials/create/details-tab';
import { SettingsTab } from '@/components/admin/officials/create/settings-tab';
import { route } from 'ziggy-js';

interface FormData {
    resident_id: number | null;
    position_id: number | null;
    committee_id: number | null;
    term_start: string;
    term_end: string;
    status: 'active' | 'inactive' | 'former';
    order: number;
    responsibilities: string;
    contact_number: string;
    email: string;
    achievements: string;
    photo: File | string | null;
    use_resident_photo: boolean;
    is_regular: boolean;
    user_id: number | null;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Resident', icon: UserPlus, requiredFields: ['resident_id'] },
    { id: 'position', label: 'Position & Account', icon: Shield, requiredFields: ['position_id', 'term_start', 'term_end'] },
    { id: 'details', label: 'Details', icon: Info, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['resident_id'],
    position: ['position_id', 'term_start', 'term_end'],
    details: [],
    settings: []
};

interface PageProps {
    official: Official & {
        resident: Resident;
        positionData: Position;
        committeeData?: Committee;
        user?: User;
    };
    positions: Position[];
    committees: Committee[];
    availableResidents: Resident[];
    availableUsers: User[];
    [key: string]: any;
}

export default function EditOfficial() {
    const { props } = usePage<PageProps>();
    const {
        official,
        positions = [],
        committees = [],
        availableResidents = [],
        availableUsers = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(official.resident || null);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(
        positions.find(p => p.id === official.position_id) || null
    );
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Safe date formatting functions
    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'Not set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString?: string | null): string => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleString();
        } catch {
            return 'Invalid date';
        }
    };

    const {
        formData,
        errors,
        isSubmitting,
        activeTab,
        formProgress,
        allRequiredFieldsFilled,
        handleInputChange,
        handleSelectChange,
        handleSubmit,
        setActiveTab,
        getTabStatus,
        getMissingFields,
        goToNextTab,
        goToPrevTab,
        updateFormData,
        resetForm
    } = useFormManager<FormData>({
        initialData: {
            resident_id: official.resident_id ?? null,
            position_id: official.position_id ?? null,
            committee_id: official.committee_id ?? null,
            term_start: official.term_start ?? '',
            term_end: official.term_end ?? '',
            status: official.status ?? 'active',
            order: official.order ?? 0,
            responsibilities: official.responsibilities ?? '',
            contact_number: official.contact_number ?? official.resident?.contact_number ?? '',
            email: official.email ?? official.resident?.email ?? '',
            achievements: official.achievements ?? '',
            photo: null,
            use_resident_photo: !official.photo_url && !!official.resident?.photo_url,
            is_regular: official.is_regular ?? true,
            user_id: official.user_id ?? null,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            const submitData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (key === 'photo' && value instanceof File) {
                        submitData.append(key, value);
                    } else if (typeof value === 'boolean') {
                        submitData.append(key, value ? '1' : '0');
                    } else if (typeof value !== 'object') {
                        submitData.append(key, value.toString());
                    }
                }
            });
            submitData.append('_method', 'PUT');

            router.post(route('admin.officials.update', official.id), submitData, {
                onSuccess: () => {
                    toast.success('Official updated successfully');
                    router.visit(route('admin.officials.show', official.id));
                },
                onError: (errs) => {
                    toast.error('Failed to update official');
                }
            });
        }
    });

    // Wrapper functions for different value types
    const handleFileChange = (name: string, file: File | null) => {
        if (file instanceof File) {
            updateFormData({ [name]: file } as any);
        } else {
            updateFormData({ [name]: null } as any);
        }
    };

    const handleBooleanChange = (name: string, checked: boolean) => {
        updateFormData({ [name]: checked } as any);
    };

    const handleTextChange = (name: string, value: string) => {
        updateFormData({ [name]: value } as any);
    };

    const handleNumberChange = (name: string, value: number) => {
        updateFormData({ [name]: value } as any);
    };

    // Helper to check if position requires account
    const requiresAccount = selectedPosition?.requires_account === true;
    
    // Helper to check if position requires committee
    const requiresCommittee = selectedPosition?.code === 'KAGAWAD' || 
        selectedPosition?.name?.toLowerCase().includes('kagawad') ||
        selectedPosition?.committee_id !== undefined;

    // Dynamic required fields based on selections
    const dynamicRequiredFields = [...requiredFieldsMap.position];
    if (requiresCommittee) dynamicRequiredFields.push('committee_id');
    if (requiresAccount) dynamicRequiredFields.push('user_id');

    // Get dynamic tab status
    const getDynamicTabStatus = (tabId: string) => {
        if (tabId === 'position') {
            const hasError = dynamicRequiredFields.some(field => errors[field as keyof FormData]);
            if (hasError) return 'error';
            
            const isComplete = dynamicRequiredFields.every(field => {
                const value = formData[field as keyof FormData];
                return value !== null && value !== undefined && value !== '';
            });
            return isComplete ? 'complete' : 'incomplete';
        }
        return getTabStatus(tabId);
    };

    // Handle resident selection with auto-fill
    const handleResidentSelect = (residentId: number | null) => {
        handleSelectChange('resident_id', residentId);
        const resident = availableResidents.find(r => r.id === residentId);
        setSelectedResident(resident || null);
        
        if (resident) {
            if (!formData.contact_number && resident.contact_number) {
                handleTextChange('contact_number', resident.contact_number);
            }
            if (!formData.email && resident.email) {
                handleTextChange('email', resident.email);
            }
            if (resident.photo_url && !formData.use_resident_photo) {
                handleBooleanChange('use_resident_photo', true);
            }
        }
    };

    // Handle position selection
    const handlePositionSelect = (positionId: number | null) => {
        handleSelectChange('position_id', positionId);
        const position = positions.find(p => p.id === positionId);
        setSelectedPosition(position || null);
        
        if (position) {
            handleNumberChange('order', position.order);
            if (position.committee_id) {
                handleSelectChange('committee_id', position.committee_id);
            } else {
                handleSelectChange('committee_id', null);
            }
            if (!position.requires_account) {
                handleSelectChange('user_id', null);
            }
        }
    };

    // Check for unsaved changes
    useEffect(() => {
        const originalData = {
            resident_id: official.resident_id,
            position_id: official.position_id,
            committee_id: official.committee_id || null,
            term_start: official.term_start,
            term_end: official.term_end,
            status: official.status,
            order: official.order || 0,
            responsibilities: official.responsibilities || '',
            contact_number: official.contact_number || official.resident?.contact_number || '',
            email: official.email || official.resident?.email || '',
            achievements: official.achievements || '',
            is_regular: official.is_regular ?? true,
            user_id: official.user_id || null,
        };

        const hasChanges = Object.keys(originalData).some(key => {
            const originalValue = originalData[key as keyof typeof originalData];
            const currentValue = formData[key as keyof FormData];
            
            if (key === 'photo') return formData.photo !== null;
            if (key === 'use_resident_photo') {
                return formData.use_resident_photo !== (!official.photo_url && !!official.resident?.photo_url);
            }
            
            if (originalValue === null && currentValue === null) return false;
            if (originalValue === undefined && currentValue === undefined) return false;
            if (originalValue === '' && currentValue === '') return false;
            
            return String(originalValue) !== String(currentValue);
        });

        setHasUnsavedChanges(hasChanges || formData.photo !== null);
    }, [formData, official]);

    // Handle cancel with unsaved changes check
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.officials.show', official.id));
            }
        } else {
            router.visit(route('admin.officials.show', official.id));
        }
    };

    // Handle reset
    const handleReset = () => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setSelectedResident(official.resident || null);
            setSelectedPosition(positions.find(p => p.id === official.position_id) || null);
            setHasUnsavedChanges(false);
            toast.info('Form reset to original values');
        }
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'inactive': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'former': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        position: getDynamicTabStatus('position'),
        details: getTabStatus('details'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();
    
    const requiredFieldsList = [
        { label: 'Resident', value: !!formData.resident_id, tabId: 'basic' },
        { label: 'Position', value: !!formData.position_id, tabId: 'position' },
        ...(requiresCommittee ? [{ label: 'Committee', value: !!formData.committee_id, tabId: 'position' }] : []),
        { label: 'Term Start Date', value: !!formData.term_start, tabId: 'position' },
        { label: 'Term End Date', value: !!formData.term_end, tabId: 'position' },
        ...(requiresAccount ? [{ label: 'System Account', value: !!formData.user_id, tabId: 'position' }] : [])
    ];

    const tabOrder = ['basic', 'position', 'details', 'settings'];

    // Count changed fields
    const changedFieldsCount = () => {
        let count = 0;
        if (formData.resident_id !== official.resident_id) count++;
        if (formData.position_id !== official.position_id) count++;
        if (formData.committee_id !== official.committee_id) count++;
        if (formData.term_start !== official.term_start) count++;
        if (formData.term_end !== official.term_end) count++;
        if (formData.status !== official.status) count++;
        if (formData.order !== official.order) count++;
        if (formData.responsibilities !== (official.responsibilities || '')) count++;
        if (formData.contact_number !== (official.contact_number || '')) count++;
        if (formData.email !== (official.email || '')) count++;
        if (formData.achievements !== (official.achievements || '')) count++;
        if (formData.is_regular !== official.is_regular) count++;
        if (formData.user_id !== official.user_id) count++;
        if (formData.photo !== null) count++;
        return count;
    };

    return (
        <AppLayout
            title={`Edit Official: ${official.resident?.first_name || ''} ${official.resident?.last_name || ''}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Officials', href: '/admin/officials' },
                { title: `${official.resident?.first_name || ''} ${official.resident?.last_name || ''}`, href: route('admin.officials.show', official.id) },
                { title: 'Edit', href: route('admin.officials.edit', official.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Official"
                    description={`Editing ${official.resident?.first_name || ''} ${official.resident?.last_name || ''} as ${official.positionData?.name || official.position || 'Unknown Position'}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                >
                                    <History className="h-4 w-4" />
                                    Reset
                                </button>
                            )}
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                ID: {official.id}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${getStatusColor(formData.status)}`}>
                                {formData.status}
                            </div>
                        </div>
                    }
                />

                {/* Unsaved Changes Banner */}
                {hasUnsavedChanges && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                    {changedFieldsCount()} field{changedFieldsCount() !== 1 ? 's' : ''} modified
                                </span>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleReset}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                )}

                <FormErrors errors={errors} />

                <div className={`grid ${showPreview ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    <div className={`${showPreview ? 'lg:col-span-2' : 'col-span-1'} space-y-4`}>
                        <FormTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabStatuses={tabStatuses}
                        />

                        {activeTab === 'basic' && (
                            <>
                                <FormContainer title="Resident Assignment" description="Select the resident who will hold the position">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        availableResidents={availableResidents}
                                        selectedResident={selectedResident}
                                        onResidentSelect={handleResidentSelect}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.resident_id}
                                    showPrevious={false}
                                    nextLabel="Next: Position & Account"
                                />
                            </>
                        )}

                        {activeTab === 'position' && (
                            <>
                                <FormContainer 
                                    title="Position Information" 
                                    description="Select the position, committee, and assign system account"
                                >
                                    <PositionTab
                                        formData={formData}
                                        errors={errors}
                                        positions={positions}
                                        committees={committees}
                                        availableUsers={availableUsers}
                                        selectedResident={selectedResident}
                                        selectedPosition={selectedPosition}
                                        requiresAccount={requiresAccount}
                                        requiresCommittee={requiresCommittee}
                                        onPositionChange={handlePositionSelect}
                                        onCommitteeChange={(id) => handleSelectChange('committee_id', id)}
                                        onTermStartChange={(value) => handleSelectChange('term_start', value)}
                                        onTermEndChange={(value) => handleSelectChange('term_end', value)}
                                        onStatusChange={(value) => handleSelectChange('status', value)}
                                        onOrderChange={(value) => handleNumberChange('order', value)}
                                        onResponsibilitiesChange={(value) => handleTextChange('responsibilities', value)}
                                        onUserSelect={(id) => handleSelectChange('user_id', id)}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.position_id}
                                    previousLabel="Back: Resident"
                                    nextLabel="Next: Details"
                                />
                            </>
                        )}

                        {activeTab === 'details' && (
                            <>
                                <FormContainer title="Official Details" description="Additional information about the official">
                                    <DetailsTab
                                        formData={formData}
                                        errors={errors}
                                        selectedResident={selectedResident}
                                        existingPhotoUrl={official.photo_url}
                                        onInputChange={handleInputChange}
                                        onContactNumberChange={(value) => handleTextChange('contact_number', value)}
                                        onEmailChange={(value) => handleTextChange('email', value)}
                                        onAchievementsChange={(value) => handleTextChange('achievements', value)}
                                        onPhotoChange={(file) => handleFileChange('photo', file)}
                                        onUseResidentPhotoChange={(checked) => handleBooleanChange('use_resident_photo', checked)}
                                        onClearPhoto={() => handleFileChange('photo', null)}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Position & Account"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Official Settings" description="Configure the official's flags">
                                    <SettingsTab
                                        formData={formData}
                                        errors={errors}
                                        onIsRegularChange={(checked) => handleBooleanChange('is_regular', checked)}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Details"
                                    showNext={false}
                                    submitLabel="Update Official"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Official Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Official Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                                                <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {selectedResident 
                                                        ? `${selectedResident.first_name} ${selectedResident.last_name}`
                                                        : <span className="text-gray-400 italic">No resident selected</span>
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {selectedPosition?.name || 'Position not selected'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Term:</span>
                                                <span className="font-medium dark:text-gray-300">
                                                    {formData.term_start ? formatDate(formData.term_start) : '?'} - {formData.term_end ? formatDate(formData.term_end) : '?'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`capitalize font-medium ${
                                                    formData.status === 'active' ? 'text-green-600 dark:text-green-400' : 
                                                    formData.status === 'inactive' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'
                                                }`}>
                                                    {formData.status || 'unknown'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Order:</span>
                                                <span className="font-medium dark:text-gray-300">{formData.order ?? 0}</span>
                                            </div>
                                        </div>

                                        {formData.responsibilities && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    <span className="font-medium">Responsibilities:</span> {formData.responsibilities}
                                                </p>
                                            </div>
                                        )}

                                        {/* Last Updated Info */}
                                        <div className="pt-2 border-t dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Last updated: {formatDateTime(official.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}