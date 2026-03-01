// pages/resident/community-report.tsx (refactored)

import { useForm, usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

// Import types
import { PageProps, ReportType, UrgencyLevel } from '@/types/portal/community-report';

// Import hooks
import { useMobileNavigation } from '@/types/portal/communityreports/hooks/useMobileNavigation';
import { useFileHandling } from '@/types/portal/communityreports/hooks/useFileHandling';
import { useDraftStorage } from '@/types/portal/communityreports/hooks/useDraftStorage';

// Import components
import { StepProgress } from '@/components/portal/community-report/StepProgress';
import { ReportTypeSelector } from '@/components/portal/community-report/ReportTypeSelector';
import { DetailsForm } from '@/components/portal/community-report/DetailsForm';
import { EvidenceUpload } from '@/components/portal/community-report/EvidenceUpload';
import { ReviewSubmit } from '@/components/portal/community-report/ReviewSubmit';
import { SidebarInfo } from '@/components/portal/community-report/SidebarInfo';
import { PreviewModal } from '@/components/portal/community-report/PreviewModal';
import { EmergencyModal } from '@/components/portal/community-report/EmergencyModal';
import { MobileStepNavigation } from '@/components/portal/community-report/MobileStepNavigation';
import { DesktopNavigation } from '@/components/portal/community-report/DesktopNavigation';

// Import helpers
import { isFile } from '@/types/portal/communityreports/utils/community-report-helpers';

export default function CommunityReport() {
    const { reportTypes = [], auth = {} } = usePage<PageProps>().props;
    
    // Safeguard all data access
    const safeReportTypes = Array.isArray(reportTypes) ? reportTypes : [];
    const safeUser = auth?.user || {};
    
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [anonymous, setAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'issues' | 'complaints'>('issues');
    
    // Mobile state
    const { isMobile, isButtonsVisible } = useMobileNavigation();
    
    // Form data
    const today = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, errors, reset } = useForm({
        report_type_id: null as number | null,
        title: '',
        description: '',
        location: '',
        incident_date: today,
        incident_time: '',
        urgency: 'medium' as UrgencyLevel,
        is_anonymous: false,
        reporter_name: safeUser.name || '',
        reporter_contact: safeUser.phone || safeUser.email || '',
        evidence: [] as File[],
        _method: 'post' as 'post' | 'put'
    });

    // File handling
    const {
        files,
        setFiles,
        existingFiles,
        setExistingFiles,
        previewModal,
        fileInputRef,
        handleFileSelect,
        removeFile,
        removeExistingFile,
        openPreview,
        closePreview,
        clearAllFiles
    } = useFileHandling();

    // Draft storage
    const {
        hasUnsavedChanges,
        saveDraft: saveDraftToStorage,
        clearDraft,
        handleDeleteDraft
    } = useDraftStorage({
        data,
        files,
        existingFiles,
        anonymous,
        currentDraftId,
        setCurrentDraftId,
        setExistingFiles,
        reset,
        setFiles,
        setData,
        setSelectedTypeId,
        setAnonymous
    });

    // Active report types and selected type
    const activeReportTypes = safeReportTypes.filter((type: ReportType) => type.is_active);
    const selectedType = activeReportTypes.find((type: ReportType) => type.id === data.report_type_id);

    // Load draft from localStorage on component mount
    useEffect(() => {
        const loadDraft = () => {
            try {
                const savedDraft = localStorage.getItem('community_report_draft');
                if (savedDraft) {
                    const draft = JSON.parse(savedDraft);
                    
                    // Only load if draft is from today
                    const draftDate = new Date(draft.created_at);
                    const today = new Date();
                    const isSameDay = draftDate.getDate() === today.getDate() && 
                                     draftDate.getMonth() === today.getMonth() && 
                                     draftDate.getFullYear() === today.getFullYear();
                    
                    if (isSameDay) {
                        // Set form data from draft
                        setData({
                            report_type_id: draft.report_type_id,
                            title: draft.title,
                            description: draft.description,
                            location: draft.location,
                            incident_date: draft.incident_date,
                            incident_time: draft.incident_time,
                            urgency: draft.urgency,
                            is_anonymous: draft.is_anonymous,
                            reporter_name: draft.reporter_name,
                            reporter_contact: draft.reporter_contact,
                            evidence: [],
                            _method: 'post'
                        });
                        
                        setSelectedTypeId(draft.report_type_id);
                        setAnonymous(draft.is_anonymous);
                        setCurrentDraftId(draft.id);
                        setExistingFiles(draft.files || []);
                        
                        toast.info('Draft loaded from previous session', {
                            duration: 3000,
                            action: {
                                label: 'Clear',
                                onClick: () => clearDraft()
                            }
                        });
                    } else {
                        clearDraft();
                    }
                }
            } catch (error) {
                console.error('Error loading draft from localStorage:', error);
                clearDraft();
            }
        };

        loadDraft();
        
        // Auto-save on unload
        const handleBeforeUnload = () => {
            if (hasUnsavedChanges()) {
                saveDraftToStorage();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Auto-save on changes
    useEffect(() => {
        if (hasUnsavedChanges()) {
            saveDraftToStorage();
        }
    }, [data, files, existingFiles, anonymous, activeStep]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            files.forEach(file => {
                if (file?.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // Navigation
    const nextStep = () => {
        if (activeStep === 1 && !data.report_type_id) {
            toast.error('Please select a report type');
            return;
        }
        
        if (activeStep === 2) {
            if (!data.title.trim() || !data.description.trim() || !data.location.trim() || !data.incident_date) {
                toast.error('Please fill in all required fields');
                return;
            }
        }
        
        if (activeStep === 3 && selectedType?.requires_evidence && 
            (!Array.isArray(data.evidence) || data.evidence.length === 0) && 
            existingFiles.length === 0) {
            toast.error('Evidence is required for this type of report');
            return;
        }
        
        if (activeStep < 4) {
            setActiveStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (activeStep > 1) {
            setActiveStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle manual save draft
    const handleSaveDraft = async () => {
        if (isSavingDraft || isSubmitting || processing) return;
        
        try {
            setIsSavingDraft(true);
            saveDraftToStorage();
            toast.success('Draft saved locally');
        } catch (error) {
            toast.error('Failed to save draft locally');
        } finally {
            setIsSavingDraft(false);
        }
    };

    // Handle type selection
    const handleTypeSelect = (typeId: number) => {
        setSelectedTypeId(typeId);
        setData('report_type_id', typeId);
        
        const selected = activeReportTypes.find(t => t.id === typeId);
        if (selected && isMobile) {
            setTimeout(() => {
                nextStep();
            }, 100);
        }
    };

    const handleTypeClear = () => {
        setSelectedTypeId(null);
        setData('report_type_id', null);
    };

    // Handle anonymous toggle
    const handleAnonymousToggle = (checked: boolean) => {
        if (selectedType && !selectedType.allows_anonymous) {
            toast.error('This report type does not allow anonymous reporting');
            return;
        }
        
        setAnonymous(checked);
        setData('is_anonymous', checked);
        
        if (checked) {
            toast.info('Your report will be submitted anonymously.');
        }
    };

    // Form submission
    const handleSubmit = async () => {
        if (isSubmitting || processing) {
            return;
        }
        
        // Final validation
        if (!data.report_type_id) {
            toast.error('Please select a report type');
            setActiveStep(1);
            return;
        }
        
        if (!data.title.trim() || !data.description.trim() || !data.location.trim() || !data.incident_date) {
            toast.error('Please fill in all required fields');
            setActiveStep(2);
            return;
        }
        
        if (selectedType?.requires_evidence && 
            (!Array.isArray(data.evidence) || data.evidence.length === 0) && 
            existingFiles.length === 0) {
            toast.error('Evidence is required for this type of report');
            setActiveStep(3);
            return;
        }
        
        if (!anonymous && !data.reporter_contact?.trim()) {
            toast.error('Please provide your contact information');
            return;
        }
        
        try {
            setIsSubmitting(true);
            
            const formData = new FormData();
            
            formData.append('report_type_id', String(data.report_type_id));
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('detailed_description', data.description);
            formData.append('location', data.location);
            formData.append('incident_date', data.incident_date);
            formData.append('incident_time', data.incident_time || '');
            formData.append('urgency_level', data.urgency);
            formData.append('recurring_issue', '0');
            formData.append('affected_people', 'individual');
            formData.append('estimated_affected_count', '1');
            formData.append('is_anonymous', anonymous ? '1' : '0');
            formData.append('has_previous_report', '0');
            formData.append('impact_level', 'moderate');
            formData.append('safety_concern', '0');
            formData.append('environmental_impact', '0');
            formData.append('status', 'pending');
            formData.append('priority', 'medium');
            
            if (!anonymous) {
                formData.append('reporter_name', data.reporter_name || '');
                formData.append('reporter_contact', data.reporter_contact || '');
            }
            
            const evidenceFiles = Array.isArray(data.evidence) ? data.evidence : [];
            if (evidenceFiles.length > 0) {
                evidenceFiles.forEach((file, index) => {
                    if (isFile(file)) {
                        formData.append('evidence[]', file);
                    }
                });
            }
            
            const routeUrl = route('resident.community-reports.store');
            
            await post(routeUrl, formData, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(anonymous 
                        ? 'Anonymous report submitted successfully!' 
                        : 'Report submitted successfully!'
                    );
                    
                    // Clean up
                    files.forEach(file => {
                        if (file?.preview) {
                            URL.revokeObjectURL(file.preview);
                        }
                    });
                    
                    clearDraft();
                    reset();
                    setFiles([]);
                    setExistingFiles([]);
                    setSelectedTypeId(null);
                    setAnonymous(false);
                    setCurrentDraftId(null);
                    setActiveStep(1);
                },
                onError: (errors) => {
                    if (errors) {
                        Object.entries(errors).forEach(([field, message]) => {
                            toast.error(`${field}: ${message}`);
                        });
                    } else {
                        toast.error('An error occurred while submitting the report');
                    }
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
            
        } catch (error) {
            toast.error('An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    // Determine if we can proceed
    const canProceed = {
        step1: !!data.report_type_id,
        step2: !!data.title.trim() && !!data.description.trim() && !!data.location.trim() && !!data.incident_date,
        step3: selectedType?.requires_evidence ? (files.length + existingFiles.length) > 0 : true
    };

    const totalFiles = files.length + existingFiles.length;

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Reports', href: '/resident/community-reports' },
                { title: 'Submit Report', href: '#' }
            ]}
        >
            <div className="space-y-4 md:space-y-6">
                <form id="report-form" className="space-y-6">
                    {/* Mobile Header with Progress */}
                    {isMobile && (
                        <StepProgress 
                            activeStep={activeStep} 
                            isMobile={true}
                            currentDraftId={currentDraftId}
                        />
                    )}

                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Link href="/resident/community-reports">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            Back
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight">Submit Report</h1>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                Report issues or file complaints to help improve our community
                                            </p>
                                        </div>
                                        {currentDraftId && (
                                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs">
                                                Draft Auto-saved
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowEmergencyModal(true)}
                                >
                                    Emergency
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6 mx-4 lg:mx-0">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-red-700 mb-1">Please fix the following errors:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field}>{message}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile Step Navigation Dots */}
                    {isMobile && (
                        <div className="flex justify-between mb-6 overflow-x-auto py-2 px-4">
                            {[1, 2, 3, 4].map((step) => (
                                <button
                                    key={step}
                                    type="button"
                                    className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                                        activeStep === step 
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                    onClick={() => setActiveStep(step)}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                                        activeStep === step 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-800'
                                    }`}>
                                        {step}
                                    </div>
                                    <span className="text-xs font-medium whitespace-nowrap">
                                        {step === 1 ? 'Type' : step === 2 ? 'Details' : step === 3 ? 'Evidence' : 'Review'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Desktop Step Progress Bar */}
                    {!isMobile && (
                        <StepProgress 
                            activeStep={activeStep} 
                            isMobile={false}
                            currentDraftId={currentDraftId}
                        />
                    )}

                    <div className="px-4 md:px-6 pb-24 md:pb-6">
                        {/* STEP 1: Report Type Selection */}
                        {activeStep === 1 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <ReportTypeSelector
                                        reportTypes={safeReportTypes}
                                        selectedTypeId={selectedTypeId}
                                        onTypeSelect={handleTypeSelect}
                                        onTypeClear={handleTypeClear}
                                        activeTab={activeTab}
                                        onTabChange={setActiveTab}
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        isMobile={isMobile}
                                    />
                                </div>

                                {/* Right Column - Summary & Actions (Desktop only) */}
                                {!isMobile && (
                                    <SidebarInfo
                                        activeStep={activeStep}
                                        selectedType={selectedType}
                                        data={data}
                                        filesCount={files.length}
                                        existingFilesCount={existingFiles.length}
                                        currentDraftId={currentDraftId}
                                        onDeleteDraft={handleDeleteDraft}
                                        onSaveDraft={handleSaveDraft}
                                        isSavingDraft={isSavingDraft}
                                    />
                                )}
                            </div>
                        )}

                        {/* STEP 2: Details Form */}
                        {activeStep === 2 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <DetailsForm
                                        data={data}
                                        errors={errors}
                                        setData={setData}
                                        today={today}
                                    />
                                </div>

                                {/* Right Column for Step 2 */}
                                {!isMobile && (
                                    <SidebarInfo
                                        activeStep={activeStep}
                                        selectedType={selectedType}
                                        data={data}
                                        filesCount={files.length}
                                        existingFilesCount={existingFiles.length}
                                        currentDraftId={currentDraftId}
                                        onDeleteDraft={handleDeleteDraft}
                                    />
                                )}
                            </div>
                        )}

                        {/* STEP 3: Evidence Upload */}
                        {activeStep === 3 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <EvidenceUpload
                                        files={files}
                                        existingFiles={existingFiles}
                                        fileInputRef={fileInputRef}
                                        onFileSelect={(e) => handleFileSelect(e, setData, data)}
                                        onRemoveFile={removeFile}
                                        onRemoveExistingFile={removeExistingFile}
                                        onClearAllNew={() => {
                                            if (confirm('Remove all new files?')) {
                                                files.forEach(file => {
                                                    if (file) {
                                                        removeFile(file.id);
                                                    }
                                                });
                                            }
                                        }}
                                        onClearAllExisting={() => {
                                            if (confirm('Remove all saved files?')) {
                                                setExistingFiles([]);
                                                toast.info('All files removed from draft');
                                            }
                                        }}
                                        onOpenPreview={openPreview}
                                        requiresEvidence={selectedType?.requires_evidence}
                                    />
                                </div>

                                {/* Right Column for Step 3 */}
                                {!isMobile && (
                                    <SidebarInfo
                                        activeStep={activeStep}
                                        selectedType={selectedType}
                                        data={data}
                                        filesCount={files.length}
                                        existingFilesCount={existingFiles.length}
                                        currentDraftId={currentDraftId}
                                        onDeleteDraft={handleDeleteDraft}
                                    />
                                )}
                            </div>
                        )}

                        {/* STEP 4: Review & Submit */}
                        {activeStep === 4 && (
                            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <ReviewSubmit
                                        selectedType={selectedType}
                                        data={data}
                                        filesCount={files.length}
                                        existingFilesCount={existingFiles.length}
                                        anonymous={anonymous}
                                        currentDraftId={currentDraftId}
                                        onAnonymousToggle={handleAnonymousToggle}
                                        setData={setData}
                                    />
                                </div>

                                {/* Right Column for Step 4 */}
                                {!isMobile && (
                                    <SidebarInfo
                                        activeStep={activeStep}
                                        selectedType={selectedType}
                                        data={data}
                                        filesCount={files.length}
                                        existingFilesCount={existingFiles.length}
                                        currentDraftId={currentDraftId}
                                        onDeleteDraft={handleDeleteDraft}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Navigation Footer */}
                    {isMobile && (
                        <MobileStepNavigation
                            activeStep={activeStep}
                            isButtonsVisible={isButtonsVisible}
                            onPrevStep={prevStep}
                            onNextStep={nextStep}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            processing={processing}
                            canProceed={canProceed}
                            selectedTypeRequiresEvidence={selectedType?.requires_evidence || false}
                            evidenceCount={totalFiles}
                            anonymous={anonymous}
                            reporterName={data.reporter_name}
                            reporterContact={data.reporter_contact}
                        />
                    )}

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <DesktopNavigation
                            activeStep={activeStep}
                            onPrevStep={prevStep}
                            onNextStep={nextStep}
                            onSubmit={handleSubmit}
                            onSaveDraft={handleSaveDraft}
                            isSavingDraft={isSavingDraft}
                            isSubmitting={isSubmitting}
                            processing={processing}
                            canProceed={canProceed}
                            selectedTypeRequiresEvidence={selectedType?.requires_evidence || false}
                            evidenceCount={totalFiles}
                        />
                    )}
                </form>
            </div>

            {/* Image/File Preview Modal */}
            <PreviewModal
                isOpen={previewModal.isOpen}
                url={previewModal.url}
                type={previewModal.type}
                name={previewModal.name}
                onClose={closePreview}
            />

            {/* Emergency Modal */}
            <EmergencyModal
                isOpen={showEmergencyModal}
                onClose={() => setShowEmergencyModal(false)}
            />
        </ResidentLayout>
    );
}