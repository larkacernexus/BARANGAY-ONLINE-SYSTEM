// pages/admin/announcements/create.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Megaphone, Paperclip, Settings, Users, Sparkles, Copy, RefreshCw, AlertCircle, Bell, Briefcase, Calendar, FileArchive, FileImage, FileSpreadsheet, FileText, Globe, Home, MapPin, Tag, UserCog, Wrench } from 'lucide-react';
import { ContentTab } from '@/components/admin/announcements/create/content-tab';
import { AttachmentsTab } from '@/components/admin/announcements/create/attachments-tab';
import { SettingsTab } from '@/components/admin/announcements/create/settings-tab';
import { AudienceTab } from '@/components/admin/announcements/create/audience-tab';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

const tabs: TabConfig[] = [
    { id: 'content', label: 'Content', icon: Megaphone, requiredFields: ['title', 'content'] },
    { id: 'attachments', label: 'Attachments', icon: Paperclip, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] },
    { id: 'audience', label: 'Audience', icon: Users, requiredFields: [] }
];

const requiredFieldsMap = {
    content: ['title', 'content'],
    attachments: [],
    settings: [],
    audience: []
};

interface Attachment {
    id?: number;
    file: File;
    preview?: string;
    name: string;
    size: number;
    type: string;
    error?: string;
    isImage?: boolean;
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
    attachments: File[];
}

export default function CreateAnnouncement() {
    const { props } = usePage<{
        types: Record<AnnouncementType, string>;
        priorities: Record<PriorityLevel, string>;
        audience_types: Record<AudienceType, string>;
        roles: Role[];
        puroks: Purok[];
        households: Household[];
        businesses: Business[];
        users: User[];
        maxFileSize: number;
        allowedFileTypes: string[];
        templates: Array<{ title: string; content: string; type: AnnouncementType; priority: PriorityLevel }>;
    }>();

    const {
        types = {} as Record<AnnouncementType, string>,
        priorities = {} as Record<PriorityLevel, string>,
        audience_types = {} as Record<AudienceType, string>,
        roles = [],
        puroks = [],
        households = [],
        businesses = [],
        users = [],
        maxFileSize = 10,
        allowedFileTypes = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
        templates = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previewImage, setPreviewImage] = useState<Attachment | null>(null);

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
            title: '',
            content: '',
            type: 'general' as AnnouncementType,
            priority: 2 as PriorityLevel,
            is_active: true,
            audience_type: 'all' as AudienceType,
            target_roles: [],
            target_puroks: [],
            target_households: [],
            target_businesses: [],
            target_users: [],
            start_date: '',
            start_time: '',
            end_date: '',
            end_time: '',
            attachments: [],
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            const submitData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (key === 'attachments' && Array.isArray(value)) {
                        (value as File[]).forEach((file, index) => {
                            submitData.append(`attachments[${index}]`, file);
                        });
                    } else if (Array.isArray(value)) {
                        (value as number[]).forEach(id => {
                            submitData.append(`${key}[]`, id.toString());
                        });
                    } else if (typeof value === 'boolean') {
                        submitData.append(key, value ? '1' : '0');
                    } else {
                        submitData.append(key, String(value));
                    }
                }
            });

            router.post(route('admin.announcements.store'), submitData, {
                onSuccess: () => {
                    toast.success('Announcement created successfully');
                    router.visit(route('admin.announcements.index'));
                },
                onError: () => {
                    toast.error('Failed to create announcement');
                }
            });
        }
    });

    useEffect(() => {
        setActiveTab('content');
    }, []);

    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const getFileIconComponent = useCallback((attachment: Attachment) => {
        const type = attachment.type;
        const name = attachment.name;
        if (type.includes('image')) return FileImage;
        if (type.includes('pdf')) return FileText;
        if (name.endsWith('.doc') || name.endsWith('.docx')) return FileText;
        if (name.endsWith('.xls') || name.endsWith('.xlsx')) return FileSpreadsheet;
        if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return FileArchive;
        return FileText;
    }, []);

    const getPriorityColor = useCallback((priority: PriorityLevel): string => {
        switch (priority) {
            case 4: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    }, []);

    const getTypeColor = useCallback((type: AnnouncementType): string => {
        switch (type) {
            case 'important': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    }, []);

    const getTypeIcon = useCallback((type: AnnouncementType) => {
        switch (type) {
            case 'important': return AlertCircle;
            case 'event': return Calendar;
            case 'maintenance': return Wrench;
            case 'other': return Tag;
            default: return Bell;
        }
    }, []);

    const getAudienceIcon = useCallback((type: AudienceType) => {
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

    const validateFile = useCallback((file: File): string | null => {
        const maxSizeBytes = maxFileSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${maxFileSize}MB limit`;
        }
        if (allowedFileTypes.length > 0) {
            const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
            const isAllowed = allowedFileTypes.some(type => {
                if (type.includes('/*')) {
                    const mainType = type.split('/')[0];
                    return file.type.startsWith(mainType);
                }
                return type === fileExt || type === file.type;
            });
            if (!isAllowed) {
                return `File type not allowed. Allowed: ${allowedFileTypes.join(', ')}`;
            }
        }
        return null;
    }, [maxFileSize, allowedFileTypes]);

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;
        const newAttachments: Attachment[] = [];
        const newFiles: File[] = [];
        Array.from(files).forEach(file => {
            if (attachments.some(att => att.name === file.name && att.size === file.size)) {
                toast.error(`${file.name} is already added`);
                return;
            }
            const error = validateFile(file);
            const attachment: Attachment = {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                isImage: file.type.startsWith('image/'),
                error: error || undefined
            };
            if (file.type.startsWith('image/')) {
                attachment.preview = URL.createObjectURL(file);
            }
            if (!error) {
                newFiles.push(file);
            }
            newAttachments.push(attachment);
        });
        setAttachments(prev => [...prev, ...newAttachments]);
        updateFormData({ attachments: [...formData.attachments, ...newFiles] });
    }, [attachments, formData.attachments, updateFormData, validateFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeAttachment = useCallback((index: number) => {
        if (attachments[index]?.preview) {
            URL.revokeObjectURL(attachments[index].preview!);
        }
        setAttachments(prev => prev.filter((_, i) => i !== index));
        const updatedAttachments = formData.attachments.filter((_, i) => i !== index);
        updateFormData({ attachments: updatedAttachments });
    }, [attachments, formData.attachments, updateFormData]);

    const clearAttachments = useCallback(() => {
        attachments.forEach(att => {
            if (att?.preview) URL.revokeObjectURL(att.preview);
        });
        setAttachments([]);
        updateFormData({ attachments: [] });
    }, [attachments, updateFormData]);

    useEffect(() => {
        return () => {
            attachments.forEach(att => {
                if (att?.preview) URL.revokeObjectURL(att.preview);
            });
        };
    }, [attachments]);

    const handleMultiSelectChange = useCallback((name: string, value: number[]) => {
        updateFormData({ [name]: value });
    }, [updateFormData]);

    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    const handleAutoFillDates = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        const formattedEndDate = endDate.toISOString().split('T')[0];
        updateFormData({
            start_date: formData.start_date || today,
            end_date: formData.end_date || formattedEndDate,
        });
        if (showStartTime && !formData.start_time) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            updateFormData({ start_time: `${hours}:${minutes}` });
        }
        toast.success('Dates auto-filled');
    }, [formData.start_date, formData.end_date, formData.start_time, showStartTime, updateFormData]);

    const handleToggleTime = useCallback(() => {
        setShowStartTime(!showStartTime);
        setShowEndTime(!showEndTime);
    }, [showStartTime, showEndTime]);

    const applyTemplate = useCallback((template: { title: string; content: string; type: AnnouncementType; priority: PriorityLevel }) => {
        updateFormData({
            title: template.title,
            content: template.content,
            type: template.type,
            priority: template.priority,
        });
        setActiveTab('content');
        toast.success('Template applied');
    }, [updateFormData, setActiveTab]);

    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            clearAttachments();
            setShowStartTime(false);
            setShowEndTime(false);
            setActiveTab('content');
            toast.info('Form reset');
        }
    }, [resetForm, clearAttachments]);

    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.announcements.index'));
            }
        } else {
            router.visit(route('admin.announcements.index'));
        }
    }, [hasUnsavedChanges]);

    const defaultTemplates = [
        {
            title: 'Barangay Assembly',
            content: 'Barangay Assembly will be held on [DATE] at [TIME] at the Barangay Hall. All residents are invited to attend.',
            type: 'event' as AnnouncementType,
            priority: 2 as PriorityLevel,
        },
        {
            title: 'Medical Mission',
            content: 'Free medical mission with dental check-up, blood pressure monitoring, and medicine distribution.',
            type: 'event' as AnnouncementType,
            priority: 3 as PriorityLevel,
        },
        {
            title: 'Clean-Up Drive',
            content: 'Community clean-up drive. Meet at the Barangay Hall at 7 AM. Please bring your own gloves and trash bags.',
            type: 'general' as AnnouncementType,
            priority: 1 as PriorityLevel,
        },
    ];

    const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        content: getTabStatus('content'),
        attachments: getTabStatus('attachments'),
        settings: getTabStatus('settings'),
        audience: getTabStatus('audience')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Title', value: !!formData.title, tabId: 'content' },
        { label: 'Content', value: !!formData.content, tabId: 'content' },
    ];

    const tabOrder = ['content', 'attachments', 'settings', 'audience'];

    return (
        <AppLayout
            title="Create Announcement"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Announcements', href: '/admin/announcements' },
                { title: 'Create', href: '/admin/announcements/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Announcement"
                    description="Create and publish announcements with attachments and targeted audience"
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reset
                            </button>
                        </div>
                    }
                />

                {/* Quick Templates Card */}
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-purple-800 dark:text-purple-300">Quick start with templates</h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                Choose from common announcement templates to get started quickly.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {displayTemplates.map((template, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => applyTemplate(template)}
                                        className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                    >
                                        <Copy className="h-3 w-3" />
                                        {template.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
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
                                    nextLabel="Next: Attachments"
                                />
                            </>
                        )}

                        {activeTab === 'attachments' && (
                            <>
                                <FormContainer title="Attachments" description="Upload files, images, or documents to support your announcement">
                                    <AttachmentsTab
                                        attachments={attachments}
                                        maxFileSize={maxFileSize}
                                        allowedFileTypes={allowedFileTypes}
                                        isDragging={isDragging}
                                        isSubmitting={isSubmitting}
                                        onFileSelect={handleFileSelect}
                                        onRemoveAttachment={removeAttachment}
                                        onClearAttachments={clearAttachments}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onPreviewImage={setPreviewImage}
                                        formatFileSize={formatFileSize}
                                        getFileIcon={getFileIconComponent}
                                        errors={errors}
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
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Attachments"
                                    nextLabel="Next: Audience"
                                />
                            </>
                        )}

                        {activeTab === 'audience' && (
                            <>
                                <FormContainer title="Target Audience" description="Select who should see this announcement">
                                    <AudienceTab
                                        formData={{
                                            audience_type: formData.audience_type,
                                            target_roles: formData.target_roles,
                                            target_puroks: formData.target_puroks,
                                            target_households: formData.target_households,
                                            target_businesses: formData.target_businesses,
                                            target_users: formData.target_users,
                                        }}
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
                                    submitLabel="Publish Announcement"
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

                                        {attachments.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Paperclip className="h-3 w-3" />
                                                <span>{attachments.length} attachment(s)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-4xl dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="dark:text-gray-100">{previewImage?.name || 'Image Preview'}</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            {previewImage && formatFileSize(previewImage.size)}
                        </DialogDescription>
                    </DialogHeader>
                    {previewImage?.preview && (
                        <div className="mt-4 flex justify-center">
                            <img
                                src={previewImage.preview}
                                alt={previewImage.name}
                                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}