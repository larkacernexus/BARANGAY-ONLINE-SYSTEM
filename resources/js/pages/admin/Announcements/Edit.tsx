// pages/admin/announcements/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
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
import { Megaphone, Settings, Users, History, Trash2, Copy, RefreshCw, AlertCircle, Calendar, Wrench, Tag, Bell, MapPin, Home, Briefcase, UserCog, Globe } from 'lucide-react';
import { ContentTab } from '@/components/admin/announcements/create/content-tab';
import { SettingsTab } from '@/components/admin/announcements/create/settings-tab';
import { AudienceTab } from '@/components/admin/announcements/create/audience-tab';
import { route } from 'ziggy-js';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { 
    AnnouncementType, 
    PriorityLevel, 
    AudienceType,
    Role,
    Purok,
    Household,
    Business,
    User
} from '@/types/admin/announcements/announcement.types';
import { LucideIcon } from 'lucide-react';

const tabs: TabConfig[] = [
    { id: 'content', label: 'Content', icon: Megaphone, requiredFields: ['title', 'content'] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] },
    { id: 'audience', label: 'Audience', icon: Users, requiredFields: [] }
];

const requiredFieldsMap = {
    content: ['title', 'content'],
    settings: [],
    audience: []
};

interface AnnouncementData {
    id: number;
    title: string;
    content: string;
    type: AnnouncementType;
    priority: PriorityLevel;
    is_active: boolean;
    audience_type: AudienceType;
    target_roles: number[];
    target_puroks: number[];
    target_households: number[];
    target_businesses: number[];
    target_users: number[];
    start_date: string | null;
    start_time: string | null;
    end_date: string | null;
    end_time: string | null;
    created_at: string;
    updated_at: string;
}

interface FormData {
    title: string;
    content: string;
    type: AnnouncementType;
    priority: PriorityLevel;
    is_active: boolean;
    audience_type: AudienceType;
    target_roles: number[];
    target_puroks: number[];
    target_households: number[];
    target_businesses: number[];
    target_users: number[];
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
}

export default function EditAnnouncement() {
    const { props } = usePage<{
        announcement: AnnouncementData;
        types: Record<AnnouncementType, string>;
        priorities: Record<PriorityLevel, string>;
        audience_types: Record<AudienceType, string>;
        roles: Role[];
        puroks: Purok[];
        households: Household[];
        businesses: Business[];
        users: User[];
    }>();
    
    const announcement = props.announcement;
    const {
        types = {} as Record<AnnouncementType, string>,
        priorities = {} as Record<PriorityLevel, string>,
        audience_types = {} as Record<AudienceType, string>,
        roles = [],
        puroks = [],
        households = [],
        businesses = [],
        users = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [showStartTime, setShowStartTime] = useState<boolean>(!!announcement.start_time);
    const [showEndTime, setShowEndTime] = useState<boolean>(!!announcement.end_time);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

    // Memoized values
    const typeOptions = useMemo(() => Object.entries(types).map(([value, label]) => ({ value: value as AnnouncementType, label })), [types]);
    const priorityOptions = useMemo(() => Object.entries(priorities).map(([value, label]) => ({ value: parseInt(value) as PriorityLevel, label })), [priorities]);
    const audienceOptions = useMemo(() => Object.entries(audience_types).map(([value, label]) => ({ value: value as AudienceType, label })), [audience_types]);

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
        resetForm,
        hasUnsavedChanges
    } = useFormManager<FormData>({
        initialData: {
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            priority: announcement.priority,
            is_active: announcement.is_active,
            audience_type: announcement.audience_type,
            target_roles: announcement.target_roles || [],
            target_puroks: announcement.target_puroks || [],
            target_households: announcement.target_households || [],
            target_businesses: announcement.target_businesses || [],
            target_users: announcement.target_users || [],
            start_date: announcement.start_date || '',
            start_time: announcement.start_time || '',
            end_date: announcement.end_date || '',
            end_time: announcement.end_time || '',
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            const submitData = {
                ...data,
                start_time: showStartTime ? data.start_time : null,
                end_time: showEndTime ? data.end_time : null,
            };
            router.put(route('admin.announcements.update', announcement.id), submitData, {
                onSuccess: () => {
                    toast.success('Announcement updated successfully');
                    router.visit(route('admin.announcements.show', announcement.id));
                },
                onError: (errs) => {
                    toast.error('Failed to update announcement');
                }
            });
        }
    });

    // Get type color
    const getTypeColor = useCallback((type: AnnouncementType): string => {
        switch (type) {
            case 'important': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    }, []);

    // Get priority color
    const getPriorityColor = useCallback((priority: PriorityLevel): string => {
        switch (priority) {
            case 4: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    }, []);

    // Get type icon
    const getTypeIcon = useCallback((type: AnnouncementType): LucideIcon => {
        switch (type) {
            case 'important': return AlertCircle;
            case 'event': return Calendar;
            case 'maintenance': return Wrench;
            case 'other': return Tag;
            default: return Bell;
        }
    }, []);

    // Get audience icon
    const getAudienceIcon = useCallback((type: AudienceType): LucideIcon => {
        switch (type) {
            case 'roles': return Users;
            case 'puroks': return MapPin;
            case 'households': return Home;
            case 'household_members': return Users;
            case 'businesses': return Briefcase;
            case 'specific_users': return UserCog;
            default: return Globe;
        }
    }, []);

    // Handle multi-select changes for audience targets
    const handleMultiSelectChange = useCallback((name: string, value: number[]) => {
        updateFormData({ [name]: value });
    }, [updateFormData]);

    // Handle switch changes
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    // Handle auto-fill dates
    const handleAutoFillDates = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        if (!formData.start_date) {
            updateFormData({ start_date: today });
        }
        if (!formData.end_date) {
            updateFormData({ end_date: formattedEndDate });
        }
        
        toast.success('Dates auto-filled');
    }, [formData.start_date, formData.end_date, updateFormData]);

    // Handle toggle time
    const handleToggleTime = useCallback(() => {
        setShowStartTime(!showStartTime);
        setShowEndTime(!showEndTime);
        
        if (!showStartTime && !showEndTime) {
            toast.info('Time fields enabled');
        } else if (showStartTime && showEndTime) {
            toast.info('Time fields disabled');
        }
    }, [showStartTime, showEndTime]);

    // Format date and time for preview
    const formatDateTimePreview = useCallback((date: string, time: string, showTime: boolean): string => {
        if (!date) return 'Not set';
        
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (showTime && time) {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${formattedDate} at ${displayHour}:${minutes} ${ampm}`;
        }
        
        return formattedDate;
    }, []);

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setShowStartTime(!!announcement.start_time);
            setShowEndTime(!!announcement.end_time);
            toast.info('Form reset to original values');
        }
    }, [resetForm, announcement.start_time, announcement.end_time]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.announcements.show', announcement.id));
            }
        } else {
            router.visit(route('admin.announcements.show', announcement.id));
        }
    }, [hasUnsavedChanges, announcement.id]);

    // Handle duplicate
    const handleDuplicate = useCallback(() => {
        setShowDuplicateDialog(true);
    }, []);

    const confirmDuplicate = useCallback(() => {
        router.post(route('admin.announcements.duplicate', announcement.id), {}, {
            onSuccess: () => {
                toast.success('Announcement duplicated successfully');
                setShowDuplicateDialog(false);
                router.visit(route('admin.announcements.index'));
            },
            onError: () => {
                toast.error('Failed to duplicate announcement');
                setShowDuplicateDialog(false);
            }
        });
    }, [announcement.id]);

    // Handle delete
    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const confirmDelete = useCallback(() => {
        router.delete(route('admin.announcements.destroy', announcement.id), {
            onSuccess: () => {
                toast.success('Announcement deleted successfully');
                router.visit(route('admin.announcements.index'));
            },
            onError: () => {
                toast.error('Failed to delete announcement');
                setShowDeleteDialog(false);
            }
        });
    }, [announcement.id]);

    // Format date
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Count changed fields
    const changedFieldsCount = useCallback(() => {
        let count = 0;
        if (formData.title !== announcement.title) count++;
        if (formData.content !== announcement.content) count++;
        if (formData.type !== announcement.type) count++;
        if (formData.priority !== announcement.priority) count++;
        if (formData.is_active !== announcement.is_active) count++;
        if (formData.audience_type !== announcement.audience_type) count++;
        if (JSON.stringify(formData.target_roles) !== JSON.stringify(announcement.target_roles || [])) count++;
        if (JSON.stringify(formData.target_puroks) !== JSON.stringify(announcement.target_puroks || [])) count++;
        if (JSON.stringify(formData.target_households) !== JSON.stringify(announcement.target_households || [])) count++;
        if (JSON.stringify(formData.target_businesses) !== JSON.stringify(announcement.target_businesses || [])) count++;
        if (JSON.stringify(formData.target_users) !== JSON.stringify(announcement.target_users || [])) count++;
        if (formData.start_date !== (announcement.start_date || '')) count++;
        if (formData.end_date !== (announcement.end_date || '')) count++;
        return count;
    }, [formData, announcement]);

    // Get audience count
    const getAudienceCount = useCallback(() => {
        switch (formData.audience_type) {
            case 'roles': return formData.target_roles.length;
            case 'puroks': return formData.target_puroks.length;
            case 'households':
            case 'household_members': return formData.target_households.length;
            case 'businesses': return formData.target_businesses.length;
            case 'specific_users': return formData.target_users.length;
            default: return 0;
        }
    }, [formData]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        content: getTabStatus('content'),
        settings: getTabStatus('settings'),
        audience: getTabStatus('audience')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Title', value: !!formData.title, tabId: 'content' },
        { label: 'Content', value: !!formData.content, tabId: 'content' },
    ];

    const tabOrder = ['content', 'settings', 'audience'];

    return (
        <AppLayout
            title={`Edit Announcement: ${announcement.title}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Announcements', href: '/admin/announcements' },
                { title: announcement.title, href: route('admin.announcements.show', announcement.id) },
                { title: 'Edit', href: route('admin.announcements.edit', announcement.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Announcement"
                    description={`Editing ${announcement.title}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDuplicate}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                                <Copy className="h-4 w-4" />
                                Duplicate
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            {hasUnsavedChanges && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </button>
                            )}
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                ID: {announcement.id}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${
                                formData.is_active 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {formData.is_active ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    }
                />

                {/* Last Updated & Changes Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Last updated: {formatDate(announcement.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(announcement.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasUnsavedChanges && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">
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
                </div>

                <FormErrors errors={errors} />

                <div className={`grid ${showPreview ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    <div className={`${showPreview ? 'lg:col-span-2' : 'col-span-1'} space-y-4`}>
                        <FormTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabStatuses={tabStatuses}
                        />

                        {activeTab === 'content' && (
                            <>
                                <FormContainer title="Announcement Content" description="What residents will see">
                                    <ContentTab
                                        formData={formData}
                                        errors={errors}
                                        originalTitle={announcement.title}
                                        originalContent={announcement.content}
                                        onInputChange={handleInputChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    showPrevious={false}
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Announcement Settings" description="Configure how and when the announcement appears">
                                    <SettingsTab
                                        formData={formData}
                                        errors={errors}
                                        typeOptions={typeOptions}
                                        priorityOptions={priorityOptions}
                                        showStartTime={showStartTime}
                                        showEndTime={showEndTime}
                                        getTypeIcon={getTypeIcon}
                                        getPriorityColor={getPriorityColor}
                                        onSelectChange={handleSelectChange}
                                        onInputChange={handleInputChange}
                                        onSwitchChange={handleSwitchChange}
                                        onAutoFillDates={handleAutoFillDates}
                                        onToggleTime={handleToggleTime}
                                        onShowStartTimeChange={setShowStartTime}
                                        onShowEndTimeChange={setShowEndTime}
                                        isSubmitting={isSubmitting}
                                        originalType={announcement.type}
                                        originalPriority={announcement.priority}
                                        originalStartDate={announcement.start_date || undefined}
                                        originalEndDate={announcement.end_date || undefined}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Content"
                                    nextLabel="Next: Audience"
                                />
                            </>
                        )}

                        {activeTab === 'audience' && (
                            <>
                                <FormContainer title="Target Audience" description="Select who should see this announcement">
                                    <AudienceTab
                                        formData={formData}
                                        errors={errors}
                                        audienceOptions={audienceOptions}
                                        roles={roles}
                                        puroks={puroks}
                                        households={households}
                                        businesses={businesses}
                                        users={users}
                                        getAudienceIcon={getAudienceIcon}
                                        onSelectChange={handleSelectChange}
                                        onMultiSelectChange={handleMultiSelectChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Settings"
                                    showNext={false}
                                    submitLabel="Update Announcement"
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
                                
                                {/* Announcement Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Announcement Preview</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className={`p-2 rounded-lg ${getTypeColor(formData.type)}`}>
                                                {(() => {
                                                    const IconComponent = getTypeIcon(formData.type);
                                                    return <IconComponent className="h-4 w-4" />;
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {formData.title || <span className="text-gray-400 italic">Untitled</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(formData.priority)}`}>
                                                        {priorities[formData.priority] || 'Normal'} Priority
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                                <span className="font-medium dark:text-gray-300">{types[formData.type] || formData.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                                                <span className="font-medium dark:text-gray-300">{priorities[formData.priority]}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Audience:</span>
                                                <span className="font-medium dark:text-gray-300">{audience_types[formData.audience_type] || 'All Users'}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t dark:border-gray-700">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`font-medium ${
                                                    formData.is_active 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    {formData.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        {formData.content && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
                                                    {formData.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Announcement
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete this announcement? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="bg-gray-50 p-4 rounded dark:bg-gray-800">
                            <p className="font-medium dark:text-white">{announcement.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Created: {formatDate(announcement.created_at)}
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Delete Announcement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Duplicate Confirmation Dialog */}
            <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 dark:text-white">
                            <Copy className="h-5 w-5" />
                            Duplicate Announcement
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Create a copy of this announcement? The duplicate will be created with "(Copy)" appended to the title.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="bg-gray-50 p-4 rounded dark:bg-gray-800">
                            <p className="font-medium dark:text-white">{announcement.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Will be copied to: {announcement.title} (Copy)
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDuplicate}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            Create Duplicate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}