// pages/admin/banners/edit.tsx

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { FormContainer } from '@/components/adminui/form/form-container';
import { FormTabs, type TabConfig } from '@/components/adminui/form/form-tabs';
import { FormProgress } from '@/components/adminui/form/form-progress';
import { FormNavigation } from '@/components/adminui/form/form-navigation';
import { FormHeader } from '@/components/adminui/form/form-header';
import { FormErrors } from '@/components/adminui/form/form-errors';
import { RequiredFieldsChecklist } from '@/components/adminui/form/required-fields-checklist';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { Image, Link2, Users, Calendar, FileText, Smartphone } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/banners/create/basic-info-tab';
import { MediaTab } from '@/components/admin/banners/create/media-tab';
import { TargetingTab } from '@/components/admin/banners/create/targeting-tab';
import { ScheduleTab } from '@/components/admin/banners/create/schedule-tab';
import { route } from 'ziggy-js';
import type { 
    BannerFormData, 
    BannerEditProps,
    Banner,
} from '@/types/admin/banners/banner';

// Form tabs configuration
const tabs: TabConfig[] = [
    { 
        id: 'basic', 
        label: 'Basic Info', 
        icon: FileText, 
        requiredFields: ['title', 'alt_text'] 
    },
    { 
        id: 'media', 
        label: 'Media', 
        icon: Image, 
        requiredFields: ['image_path'] 
    },
    { 
        id: 'targeting', 
        label: 'Targeting', 
        icon: Users, 
        requiredFields: [] 
    },
    { 
        id: 'schedule', 
        label: 'Schedule', 
        icon: Calendar, 
        requiredFields: [] 
    },
];

// Required fields mapping for form validation
const requiredFieldsMap = {
    basic: ['title', 'alt_text'],
    media: ['image_path'],
    targeting: [],
    schedule: [],
};

// Tab navigation order
const tabOrder = ['basic', 'media', 'targeting', 'schedule'];

export default function Edit({ banner, puroks = [] }: BannerEditProps) {
    const [showPreview, setShowPreview] = useState(true);

    // Transform banner data to form data format
    const initialFormData: BannerFormData = {
        title: banner.title || '',
        description: banner.description || '',
        image_path: banner.image_path || '',
        mobile_image_path: banner.mobile_image_path || '',
        link_url: banner.link_url || '',
        button_text: banner.button_text || '',
        alt_text: banner.alt_text || '',
        sort_order: banner.sort_order ?? 0,
        is_active: banner.is_active ?? true,
        start_date: banner.start_date || '',
        end_date: banner.end_date || '',
        target_audience: banner.target_audience || 'all',
        target_puroks: banner.target_puroks || [],
    };

    // Initialize form manager
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
    } = useFormManager<BannerFormData>({
        initialData: initialFormData,
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            router.put(route('admin.banners.update', { banner: banner.id }), data as any, {
                onSuccess: () => {
                    toast.success('Banner updated successfully');
                    router.visit(route('admin.banners.index'));
                },
                onError: (errors) => {
                    const errorCount = Object.keys(errors).length;
                    toast.error(`Failed to update banner: ${errorCount} validation ${errorCount === 1 ? 'error' : 'errors'}`);
                },
            });
        },
    });

    // Simple handler for checkbox changes
    const handleCheckboxChange = (name: string, checked: boolean) => {
        // @ts-ignore - handleInputChange accepts partial updates
        handleInputChange({ target: { name, type: 'checkbox', checked } });
    };

    // Simple handler for multi-select changes
    const handleMultiSelectChange = (name: string, values: number[]) => {
        // @ts-ignore - handleInputChange accepts partial updates
        handleInputChange({ target: { name, value: values } });
    };

    // Tab statuses for visual indicators
    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        media: getTabStatus('media'),
        targeting: getTabStatus('targeting'),
        schedule: getTabStatus('schedule'),
    };

    // Missing fields for progress tracking
    const missingFields = getMissingFields();
    
    // Required fields checklist items
    const requiredFieldsList = [
        { label: 'Banner Title', value: !!formData.title, tabId: 'basic' },
        { label: 'Alt Text', value: !!formData.alt_text, tabId: 'basic' },
        { label: 'Desktop Image', value: !!formData.image_path, tabId: 'media' },
    ];

    // Preview image URL generation
    const previewImageUrl = formData.image_path
        ? formData.image_path.startsWith('data:')
            ? formData.image_path
            : formData.image_path.startsWith('/storage/')
                ? formData.image_path
                : `/storage/${formData.image_path}`
        : banner.image_url || null;

    // Get audience display text
    const getAudienceDisplayText = () => {
        switch (formData.target_audience) {
            case 'all':
                return 'Everyone';
            case 'specific_puroks':
                return `${formData.target_puroks.length} purok${formData.target_puroks.length !== 1 ? 's' : ''} selected`;
            default:
                return 'Everyone';
        }
    };

    // Check if banner has schedule
    const hasSchedule = !!(formData.start_date || formData.end_date);
    
    // Format schedule display
    const getScheduleDisplay = () => {
        if (!hasSchedule) return null;
        
        const parts = [];
        if (formData.start_date) {
            parts.push(`From ${new Date(formData.start_date).toLocaleDateString()}`);
        }
        if (formData.end_date) {
            parts.push(`to ${new Date(formData.end_date).toLocaleDateString()}`);
        }
        return parts.join(' ');
    };

    // Get banner status with schedule consideration
    const getBannerStatus = () => {
        if (!formData.is_active) return 'inactive';
        
        const now = new Date();
        const startDate = formData.start_date ? new Date(formData.start_date) : null;
        const endDate = formData.end_date ? new Date(formData.end_date) : null;
        
        if (startDate && startDate > now) return 'scheduled';
        if (endDate && endDate < now) return 'expired';
        
        return 'active';
    };

    const bannerStatus = getBannerStatus();
    
    const statusConfig = {
        active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-600 dark:bg-green-400' },
        inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', dot: 'bg-gray-600 dark:bg-gray-400' },
        scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-600 dark:bg-blue-400' },
        expired: { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-600 dark:bg-red-400' },
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Banners', href: '/admin/banners' },
                { title: `Edit ${banner.title}`, href: `/admin/banners/${banner.id}/edit` },
            ]}
        >
            <Head title={`Edit Banner - ${banner.title}`} />

            <div className="space-y-6">
                <FormHeader
                    title="Edit Banner"
                    description={`Update banner information for "${banner.title}"`}
                    onBack={() => router.visit(route('admin.banners.index'))}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                />

                <FormErrors errors={errors} />

                <div className={`grid ${showPreview ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {/* Main Form Area */}
                    <div className={`${showPreview ? 'lg:col-span-2' : 'col-span-1'} space-y-4`}>
                        <FormTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabStatuses={tabStatuses}
                        />

                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <>
                                <FormContainer
                                    title="Basic Information"
                                    description="Edit the core details for this banner"
                                >
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleCheckboxChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.banners.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    showPrevious={false}
                                    nextLabel="Next: Media"
                                />
                            </>
                        )}

                        {/* Media Tab */}
                        {activeTab === 'media' && (
                            <>
                                <FormContainer
                                    title="Banner Media"
                                    description="Update banner images for desktop and mobile devices"
                                >
                                    <MediaTab
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.banners.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Targeting"
                                />
                            </>
                        )}

                        {/* Targeting Tab */}
                        {activeTab === 'targeting' && (
                            <>
                                <FormContainer
                                    title="Audience Targeting"
                                    description="Choose who can see this banner (optional)"
                                >
                                    <TargetingTab
                                        formData={formData}
                                        errors={errors}
                                        puroks={puroks}
                                        onSelectChange={handleSelectChange}
                                        onMultiSelectChange={handleMultiSelectChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.banners.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Media"
                                    nextLabel="Next: Schedule"
                                />
                            </>
                        )}

                        {/* Schedule Tab */}
                        {activeTab === 'schedule' && (
                            <>
                                <FormContainer
                                    title="Scheduling"
                                    description="Set a display schedule for this banner (optional)"
                                >
                                    <ScheduleTab
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleCheckboxChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={() => router.visit(route('admin.banners.index'))}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Targeting"
                                    showNext={false}
                                    submitLabel="Update Banner"
                                />
                            </>
                        )}
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                {/* Progress Tracker */}
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />

                                {/* Required Fields Checklist */}
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />

                                {/* Banner Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden">
                                    <div className="p-4 border-b dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                                            Banner Preview
                                        </h3>
                                    </div>

                                    {/* Image Preview */}
                                    <div className="p-4">
                                        {previewImageUrl ? (
                                            <div className="relative rounded-lg overflow-hidden border dark:border-gray-700">
                                                <img
                                                    src={previewImageUrl}
                                                    alt={formData.alt_text || 'Banner preview'}
                                                    className="w-full h-40 object-cover"
                                                />
                                                {formData.title && (
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-semibold text-sm">
                                                                {formData.title}
                                                            </h4>
                                                            {formData.description && (
                                                                <p className="text-white/80 text-xs mt-1 line-clamp-2">
                                                                    {formData.description}
                                                                </p>
                                                            )}
                                                            {formData.button_text && formData.link_url && (
                                                                <button className="mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-md border border-white/30">
                                                                    {formData.button_text}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        No image uploaded
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mobile Preview Indicator */}
                                        {formData.mobile_image_path && (
                                            <div className="mt-2 flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Smartphone className="h-3 w-3" />
                                                <span>Mobile version available</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Banner Details */}
                                    <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700">
                                        {/* Title */}
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                Title:
                                            </span>
                                            <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                                                {formData.title || (
                                                    <span className="text-gray-400 italic">Not set</span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {formData.description && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                    Description:
                                                </span>
                                                <span className="text-sm text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
                                                    {formData.description}
                                                </span>
                                            </div>
                                        )}

                                        {/* Link */}
                                        {formData.link_url && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                    Link:
                                                </span>
                                                <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 flex-1 min-w-0">
                                                    <Link2 className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{formData.link_url}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Button Text */}
                                        {formData.button_text && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                    Button:
                                                </span>
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {formData.button_text}
                                                </span>
                                            </div>
                                        )}

                                        {/* Status */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                Status:
                                            </span>
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusConfig[bannerStatus].color}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[bannerStatus].dot}`}></span>
                                                {statusConfig[bannerStatus].label}
                                            </span>
                                        </div>

                                        {/* Audience */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                Audience:
                                            </span>
                                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                                {getAudienceDisplayText()}
                                            </span>
                                        </div>

                                        {/* Schedule */}
                                        {hasSchedule && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                    Schedule:
                                                </span>
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {getScheduleDisplay()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Order */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                Order:
                                            </span>
                                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                                #{formData.sort_order}
                                            </span>
                                        </div>

                                        {/* Alt Text */}
                                        {formData.alt_text && (
                                            <div className="flex items-start gap-2 pt-2 border-t dark:border-gray-700">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                    Alt Text:
                                                </span>
                                                <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 italic">
                                                    "{formData.alt_text}"
                                                </span>
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="flex items-start gap-2 pt-2 border-t dark:border-gray-700">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                Created:
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(banner.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Tips */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                        Banner Tips
                                    </h4>
                                    <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                                        <li>• Recommended desktop size: 1920x600px</li>
                                        <li>• Recommended mobile size: 750x1000px</li>
                                        <li>• Max file size: 5MB</li>
                                        <li>• Supported formats: PNG, JPG, GIF</li>
                                        <li>• Lower order numbers appear first</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}