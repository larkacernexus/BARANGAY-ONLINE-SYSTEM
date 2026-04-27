// pages/admin/officials/create.tsx
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
import { UserPlus, Shield, Info, Settings } from 'lucide-react';
import { Resident, Position, Committee, User } from '@/types/admin/officials/officials';
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
    photo: File | null;
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
    positions: Position[];
    committees: Committee[];
    availableUsers: User[];
    defaultTermStart: string;
    defaultTermEnd: string;
    nextOrder?: number;
    [key: string]: any;
}

export default function CreateOfficial() {
    const { props } = usePage<PageProps>();
    const {
        positions = [],
        committees = [],
        availableUsers = [],
        defaultTermStart = '',
        defaultTermEnd = '',
        nextOrder = 0
    } = props;
    
    const [showPreview, setShowPreview] = useState(true);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

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
        updateFormData
    } = useFormManager<FormData>({
        initialData: {
            resident_id: null,
            position_id: null,
            committee_id: null,
            term_start: defaultTermStart,
            term_end: defaultTermEnd,
            status: 'active',
            order: nextOrder,
            responsibilities: '',
            contact_number: '',
            email: '',
            achievements: '',
            photo: null,
            use_resident_photo: false,
            is_regular: true,
            user_id: null,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            const submitData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'photo' && value instanceof File) {
                        submitData.append(key, value);
                    } else if (typeof value === 'boolean') {
                        submitData.append(key, value ? '1' : '0');
                    } else {
                        submitData.append(key, String(value));
                    }
                }
            });

            router.post(route('admin.officials.store'), submitData, {
                onSuccess: () => {
                    toast.success('Official created successfully');
                    router.visit(route('admin.officials.index'));
                },
                onError: () => {
                    toast.error('Failed to create official');
                }
            });
        }
    });

    const requiresAccount = selectedPosition?.requires_account === true;
    
    const requiresCommittee = selectedPosition?.code === 'KAGAWAD' || 
        selectedPosition?.name?.toLowerCase().includes('kagawad');

    const dynamicRequiredFields = [...requiredFieldsMap.position];
    if (requiresCommittee) dynamicRequiredFields.push('committee_id');
    if (requiresAccount) dynamicRequiredFields.push('user_id');

    const getDynamicTabStatus = (tabId: string) => {
        if (tabId === 'position') {
            const hasError = dynamicRequiredFields.some(field => errors[field]);
            if (hasError) return 'error';
            
            const isComplete = dynamicRequiredFields.every(field => {
                const value = formData[field as keyof FormData];
                return value !== null && value !== undefined && value !== '';
            });
            return isComplete ? 'complete' : 'incomplete';
        }
        return getTabStatus(tabId);
    };

    const handleResidentSelect = (residentId: number | null) => {
        updateFormData({ resident_id: residentId });
        if (residentId) {
            // The resident object comes from the server search response
            // We'll set it in the BasicInfoTab directly
        } else {
            setSelectedResident(null);
        }
    };

    const handlePositionSelect = (positionId: number | null) => {
        updateFormData({ position_id: positionId });
        const position = positions.find(p => p.id === positionId);
        setSelectedPosition(position || null);
        
        if (position) {
            updateFormData({ order: position.order });
            if (position.committee_id) {
                updateFormData({ committee_id: position.committee_id });
            } else {
                updateFormData({ committee_id: null });
            }
            if (!position.requires_account) {
                updateFormData({ user_id: null });
            }
        }
    };

    const handlePhotoChange = (file: File | null) => {
        updateFormData({ photo: file });
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

    return (
        <AppLayout
            title="Create Official"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Officials', href: '/admin/officials' },
                { title: 'Create', href: '/admin/officials/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Official"
                    description="Assign a position to a resident and set up their term"
                    onBack={() => router.visit(route('admin.officials.index'))}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                />

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
                                <FormContainer title="Resident Assignment" description="Search and select the resident who will hold the position">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        selectedResident={selectedResident}
                                        onResidentSelect={(id) => {
                                            handleResidentSelect(id);
                                            if (id) {
                                                // The resident is set inside BasicInfoTab via the search
                                                // We just update the form data here
                                                updateFormData({ resident_id: id });
                                            }
                                        }}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.officials.index'))}
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
                                        onCommitteeChange={(id) => updateFormData({ committee_id: id })}
                                        onTermStartChange={(value) => updateFormData({ term_start: value })}
                                        onTermEndChange={(value) => updateFormData({ term_end: value })}
                                        onStatusChange={(value) => updateFormData({ status: value as 'active' | 'inactive' | 'former' })}
                                        onOrderChange={(value) => updateFormData({ order: value })}
                                        onResponsibilitiesChange={(value) => updateFormData({ responsibilities: value })}
                                        onUserSelect={(id) => updateFormData({ user_id: id })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.officials.index'))}
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
                                        onInputChange={handleInputChange}
                                        onContactNumberChange={(value) => updateFormData({ contact_number: value })}
                                        onEmailChange={(value) => updateFormData({ email: value })}
                                        onAchievementsChange={(value) => updateFormData({ achievements: value })}
                                        onPhotoChange={handlePhotoChange}
                                        onUseResidentPhotoChange={(checked) => updateFormData({ use_resident_photo: checked })}
                                        onClearPhoto={() => updateFormData({ photo: null })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.officials.index'))}
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
                                        onIsRegularChange={(checked) => updateFormData({ is_regular: checked })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.officials.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Details"
                                    showNext={false}
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
                                                    {formData.term_start ? new Date(formData.term_start).toLocaleDateString() : '?'} - {formData.term_end ? new Date(formData.term_end).toLocaleDateString() : '?'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`capitalize font-medium ${
                                                    formData.status === 'active' ? 'text-green-600 dark:text-green-400' : 
                                                    formData.status === 'inactive' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'
                                                }`}>
                                                    {formData.status}
                                                </span>
                                            </div>
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