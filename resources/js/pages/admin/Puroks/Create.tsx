// pages/admin/puroks/create.tsx
import { router } from '@inertiajs/react';
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
import { MapPin, User, Globe } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/puroks/create/basic-info-tab';
import { LeadershipTab } from '@/components/admin/puroks/create/leadership-tab';
import { LocationTab } from '@/components/admin/puroks/create/location-tab';
import { route } from 'ziggy-js';

interface FormData {
    name: string;
    description: string;
    leader_id: string;
    status: 'active' | 'inactive';
    google_maps_url: string;
    latitude: string;
    longitude: string;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: MapPin, requiredFields: ['name', 'status'] },
    { id: 'leadership', label: 'Leadership', icon: User, requiredFields: [] },
    { id: 'location', label: 'Location', icon: Globe, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'status'],
    leadership: [],
    location: []
};

export default function CreatePurok() {
    const [showPreview, setShowPreview] = useState(true);

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
        goToPrevTab
    } = useFormManager<FormData>({
        initialData: {
            name: '',
            description: '',
            leader_id: '',
            status: 'active',
            google_maps_url: '',
            latitude: '',
            longitude: ''
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            router.post(route('admin.puroks.store'), data as any, {
                onSuccess: () => {
                    toast.success('Purok created successfully');
                    router.visit(route('admin.puroks.index'));
                },
                onError: (errs) => {
                    toast.error('Failed to create purok. Please check the form for errors.');
                },
                onFinish: () => {
                    // setIsSubmitting handled by hook
                }
            });
        }
    });

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        leadership: getTabStatus('leadership'),
        location: getTabStatus('location')
    };

    const missingFields = getMissingFields();
    const requiredFieldsList = [
        { label: 'Purok Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Status', value: !!formData.status, tabId: 'basic' }
    ];

    const tabOrder = ['basic', 'leadership', 'location'];

    return (
        <AppLayout
            title="Create Purok"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Puroks', href: '/admin/puroks' },
                { title: 'Create', href: '/admin/puroks/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Purok"
                    description="Register a new purok/zone in the barangay"
                    onBack={() => router.visit(route('admin.puroks.index'))}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm('Are you sure you want to reset the form?')) {
                                    window.location.reload();
                                }
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Reset Form
                        </button>
                    }
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
                                <FormContainer 
                                    title="Basic Information" 
                                    description="Enter the core details for this purok"
                                >
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.puroks.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    showPrevious={false}
                                    nextLabel="Next: Leadership"
                                />
                            </>
                        )}

                        {activeTab === 'leadership' && (
                            <>
                                <FormContainer 
                                    title="Purok Leadership" 
                                    description="Search and select a resident as the purok leader (optional)"
                                >
                                    <LeadershipTab
                                        formData={formData}
                                        errors={errors}
                                        onLeaderSelect={(id) => handleSelectChange('leader_id', id)}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.puroks.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Location"
                                />
                            </>
                        )}

                        {activeTab === 'location' && (
                            <>
                                <FormContainer 
                                    title="Google Maps Location" 
                                    description="Paste a Google Maps link - coordinates will be extracted automatically"
                                >
                                    <LocationTab
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.puroks.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Leadership"
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
                                
                                {/* Purok Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm border-gray-200 dark:border-gray-700">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                                            Purok Summary
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium dark:text-gray-200 truncate">
                                                    {formData.name || (
                                                        <span className="text-gray-400 dark:text-gray-500 italic">Not set</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {formData.status === 'active' ? (
                                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                                                            {formData.status || 'Inactive'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {formData.description && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {formData.description}
                                                </p>
                                            </div>
                                        )}

                                        {formData.leader_id && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    <span className="font-medium">Leader:</span> Selected
                                                </p>
                                            </div>
                                        )}

                                        {formData.google_maps_url && (
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    <span className="font-medium">Map:</span> Location set
                                                </p>
                                            </div>
                                        )}

                                        {/* Progress indicators */}
                                        <div className="space-y-2 pt-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">Basic Info</span>
                                                <span className={`font-medium ${
                                                    formData.name && formData.status 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`}>
                                                    {formData.name && formData.status ? '✓' : '○'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">Leadership</span>
                                                <span className={`font-medium ${
                                                    formData.leader_id 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`}>
                                                    {formData.leader_id ? '✓' : 'Optional'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">Location</span>
                                                <span className={`font-medium ${
                                                    formData.google_maps_url 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }`}>
                                                    {formData.google_maps_url ? '✓' : 'Optional'}
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