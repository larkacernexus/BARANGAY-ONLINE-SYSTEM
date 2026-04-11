import { useForm, usePage, Link } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import ResidentLayout from '@/layouts/resident-app-layout';
import {
    FileCheck,
    FileText,
    Upload,
    CheckCircle,
} from 'lucide-react';

// Import components
import { ClearanceTypeStep } from '@/components/portal/request/steps/clearance-type-step';
import { PurposeDetailsStep } from '@/components/portal/request/steps/purpose-details-step';
import { DocumentsStep } from '@/components/portal/request/steps/documents-step';
import { ReviewStep } from '@/components/portal/request/steps/review-step';
import { StepNavigation } from '@/components/portal/request/step-navigation';
import { DesktopHeader } from '@/components/portal/request/desktop-header';
import { MobileHeader } from '@/components/portal/request/mobile-header';
import { RightSidebar } from '@/components/portal/request/right-sidebar';
import { ErrorDisplay } from '@/components/portal/request/error-display';
import { StepProgress } from '@/components/portal/request/step-progress';
import { MobileFooter } from '@/components/portal/request/mobile-footer';
import { DesktopFooter } from '@/components/portal/request/desktop-footer';

// Import hooks and utils
import { useClearanceDraft } from '@/components/portal/request/hooks/use-clearance-draft';
import { useMobileDetection } from '@/components/portal/request/hooks/use-mobile-detection';
import { useScrollHide } from '@/components/portal/request/hooks/use-scroll-hide';
import { useClearanceFilters } from '@/components/portal/request/hooks/use-clearance-filters';
import { useDocumentRequirements } from '@/components/portal/request/hooks/use-document-requirements';
import { usePurposeManagement } from '@/components/portal/request/hooks/use-purpose-management';

// Import types and constants
import type { ClearanceType, Resident, PageProps, UploadedFileWithMetadata, FormData } from '@/components/portal/request/types';

export default function RequestClearance({ clearanceTypes, resident }: PageProps) {
    const [selectedClearance, setSelectedClearance] = useState<ClearanceType | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileWithMetadata[]>([]);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<Set<number>>(new Set());
    const [activeStep, setActiveStep] = useState(1);
    
    // Custom hooks
    const isMobile = useMobileDetection();
    const { isButtonsVisible } = useScrollHide(isMobile);
    const { hasDraft, currentDraftId, saveDraft, clearDraft, deleteDraft } = useClearanceDraft();
    
    const {
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        categoryFilter,
        setCategoryFilter,
        visibleCount,
        setVisibleCount,
        categorizedTypes,
        hasMore,
        loadMore,
        categories,
        typeListRef,
        searchInputRef,
        showSearch,
        setShowSearch
    } = useClearanceFilters(clearanceTypes);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        clearance_type_id: '',
        purpose: '',
        purpose_custom: '',
        specific_purpose: '',
        needed_date: new Date().toISOString().split('T')[0],
        additional_notes: '',
        resident_id: resident.id.toString(),
        documents: [],
        descriptions: [],
        document_type_ids: [],
        _method: 'post' as 'post' | 'put'
    });

    const {
        availablePurposes,
        isCustomPurpose,
        purposeSearch,
        setPurposeSearch,
        showPurposeDropdown,
        setShowPurposeDropdown,
        getPurposeSuggestions,
        handlePurposeSelect,
        updatePurposes
    } = usePurposeManagement(selectedClearance);

    const {
        requiresDocuments,
        documentRequirements,
        checkDocumentRequirements
    } = useDocumentRequirements(selectedClearance, selectedDocumentTypes);

    // Update purposes when clearance changes
    useEffect(() => {
        updatePurposes();
        setData('purpose', '');
        setData('purpose_custom', '');
        setPurposeSearch('');
        setUploadedFiles([]);
        setSelectedDocumentTypes(new Set());
    }, [selectedClearance]);

    // Auto-save
    useEffect(() => {
        if (hasUnsavedChanges()) {
            saveDraft({
                clearance_type_id: data.clearance_type_id,
                purpose: data.purpose,
                purpose_custom: data.purpose_custom,
                specific_purpose: data.specific_purpose,
                needed_date: data.needed_date,
                additional_notes: data.additional_notes,
                uploadedFiles,
                selectedDocumentTypes,
                activeStep
            });
        }
    }, [data, uploadedFiles, selectedDocumentTypes, activeStep]);

    const hasUnsavedChanges = () => {
        return data.clearance_type_id || 
               data.purpose || 
               data.purpose_custom || 
               data.specific_purpose || 
               data.additional_notes ||
               uploadedFiles.length > 0;
    };

    const handleClearanceTypeChange = (value: string) => {
        setData('clearance_type_id', value);
        const type = clearanceTypes.find(t => t.id.toString() === value);
        setSelectedClearance(type || null);
        if (isMobile && value) {
            setTimeout(() => nextStep(), 100);
        }
    };

    // FIXED: Handle purpose selection properly
    const onPurposeSelect = (value: string, label: string) => {
        // Call handlePurposeSelect which updates the hook's state
        const result = handlePurposeSelect(value, label);
        
        // Update form data based on selection
        if (value === 'custom') {
            setData('purpose', '');
            setData('purpose_custom', '');
        } else {
            setData('purpose', result.value);
            setData('purpose_custom', '');
        }
        
        // Clear specific purpose when purpose changes
        setData('specific_purpose', '');
    };

    const handleFileSelect = (files: File[]) => {
        const newFiles = files.map(file => ({
            file,
            description: '',
            document_type_id: undefined
        }));
        
        setUploadedFiles(prev => [...prev, ...newFiles]);
        setData('documents', [...data.documents, ...files]);
        setData('descriptions', [...data.descriptions, ...newFiles.map(() => '')]);
        setData('document_type_ids', [...data.document_type_ids, ...newFiles.map(() => 0)]);
    };

    const handleFileRemove = (index: number) => {
        const fileToRemove = uploadedFiles[index];
        
        if (fileToRemove.document_type_id) {
            const newSelected = new Set(selectedDocumentTypes);
            newSelected.delete(fileToRemove.document_type_id);
            setSelectedDocumentTypes(newSelected);
        }
        
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        
        setData('documents', newFiles.map(f => f.file));
        setData('descriptions', newFiles.map(f => f.description));
        setData('document_type_ids', newFiles.map(f => f.document_type_id || 0));
    };

    const handleDocumentTypeSelect = (fileIndex: number, documentTypeId: number) => {
        const newFiles = [...uploadedFiles];
        const previousTypeId = newFiles[fileIndex].document_type_id;
        
        newFiles[fileIndex].document_type_id = documentTypeId;
        setUploadedFiles(newFiles);
        
        const newSelected = new Set(selectedDocumentTypes);
        if (previousTypeId) newSelected.delete(previousTypeId);
        newSelected.add(documentTypeId);
        setSelectedDocumentTypes(newSelected);
        
        const newDocumentTypeIds = [...data.document_type_ids];
        newDocumentTypeIds[fileIndex] = documentTypeId;
        setData('document_type_ids', newDocumentTypeIds);
    };

    const handleSubmit = () => {
        if (processing) return;
        
        if (!data.clearance_type_id) {
            toast.error('Please select a clearance type.');
            setActiveStep(1);
            return;
        }

        const finalPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
        if (!finalPurpose) {
            toast.error('Please select or enter the purpose of the clearance.');
            setActiveStep(2);
            return;
        }

        if (!data.needed_date) {
            toast.error('Please select the date needed.');
            setActiveStep(2);
            return;
        }

        if (documentRequirements.requiredCount > 0 && documentRequirements.missing.length > 0) {
            toast.error(`Please upload required documents: ${documentRequirements.missing.join(', ')}`);
            setActiveStep(3);
            return;
        }

        // Update form data with final purpose
        setData('purpose', finalPurpose);
        
        // Update form data with files
        setData('documents', uploadedFiles.map(f => f.file));
        setData('descriptions', uploadedFiles.map(f => f.description));
        setData('document_type_ids', uploadedFiles.map(f => f.document_type_id || 0));

        // Submit using Inertia
        post(route('portal.my.clearances.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Clearance request submitted successfully!');
                clearDraft();
                reset();
                setUploadedFiles([]);
                setSelectedDocumentTypes(new Set());
                setSelectedClearance(null);
                setActiveStep(1);
            },
            onError: (errors) => {
                Object.entries(errors).forEach(([field, message]) => {
                    toast.error(`${field}: ${message}`);
                });
            }
        });
    };

    // Use useMemo for isFormValid
    const isFormValid = useMemo(() => {
        const finalPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
        return Boolean(
            data.clearance_type_id && 
            finalPurpose && 
            data.needed_date && 
            documentRequirements.met
        );
    }, [data.clearance_type_id, data.purpose, data.purpose_custom, data.needed_date, isCustomPurpose, documentRequirements.met]);

    const nextStep = useCallback(() => {
        if (activeStep === 1 && !data.clearance_type_id) {
            toast.error('Please select a clearance type');
            return;
        }
        
        if (activeStep === 2) {
            const finalPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
            if (!finalPurpose) {
                toast.error('Please select or enter a purpose');
                return;
            }
        }
        
        if (activeStep === 3 && documentRequirements.requiredCount > 0 && documentRequirements.missing.length > 0) {
            toast.error('Please upload all required documents');
            return;
        }
        
        if (activeStep < 4) {
            setActiveStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeStep, data.clearance_type_id, data.purpose, data.purpose_custom, isCustomPurpose, documentRequirements]);

    const prevStep = useCallback(() => {
        if (activeStep > 1) {
            setActiveStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeStep]);

    const steps = [
        { id: 1, title: 'Type', description: 'Select clearance type', icon: FileCheck },
        { id: 2, title: 'Details', description: 'Provide information', icon: FileText },
        { id: 3, title: 'Documents', description: 'Upload files', icon: Upload },
        { id: 4, title: 'Review', description: 'Final check', icon: CheckCircle }
    ];

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Clearances', href: '/resident/clearances' },
                { title: 'Request Clearance', href: '#' }
            ]}
        >
            <div className="space-y-4 md:space-y-6">
                <form id="clearance-request-form" className="space-y-6">
                    <MobileHeader isMobile={isMobile} hasDraft={hasDraft} activeStep={activeStep} />
                    <DesktopHeader isMobile={isMobile} hasDraft={hasDraft} />
                    <ErrorDisplay errors={errors} />

                    <div className="px-4 md:px-6 pb-24 md:pb-6">
                        <StepNavigation isMobile={isMobile} steps={steps} activeStep={activeStep} onStepChange={setActiveStep} />
                        <StepProgress isMobile={isMobile} steps={steps} activeStep={activeStep} />

                        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {activeStep === 1 && (
                                   <ClearanceTypeStep
                                        clearanceTypes={clearanceTypes}
                                        selectedClearance={selectedClearance}
                                        dataClearanceTypeId={data.clearance_type_id}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        viewMode={viewMode}
                                        setViewMode={setViewMode}
                                        categoryFilter={categoryFilter}
                                        setCategoryFilter={setCategoryFilter}
                                        visibleCount={visibleCount}
                                        categorizedTypes={categorizedTypes}
                                        hasMore={hasMore}
                                        loadMore={loadMore}
                                        categories={categories}
                                        typeListRef={typeListRef}
                                        searchInputRef={searchInputRef}
                                        isMobile={isMobile}
                                        showSearch={showSearch}
                                        setShowSearch={setShowSearch}
                                        onClearanceTypeChange={handleClearanceTypeChange}
                                        onClearSelection={() => {
                                            setSelectedClearance(null);
                                            setData('clearance_type_id', '');
                                        }}
                                    />
                                )}

                                {activeStep === 2 && (
                                    <PurposeDetailsStep
                                        selectedClearance={selectedClearance}
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        availablePurposes={availablePurposes}
                                        isCustomPurpose={isCustomPurpose}
                                        purposeSearch={purposeSearch}
                                        setPurposeSearch={setPurposeSearch}
                                        showPurposeDropdown={showPurposeDropdown}
                                        setShowPurposeDropdown={setShowPurposeDropdown}
                                        onPurposeSelect={onPurposeSelect}
                                        getPurposeSuggestions={getPurposeSuggestions}
                                    />
                                )}

                                {activeStep === 3 && (
                                    <DocumentsStep
                                        selectedClearance={selectedClearance}
                                        requiresDocuments={requiresDocuments}
                                        uploadedFiles={uploadedFiles}
                                        selectedDocumentTypes={selectedDocumentTypes}
                                        onFileSelect={handleFileSelect}
                                        onFileRemove={handleFileRemove}
                                        onDescriptionChange={(index, description) => {
                                            const newFiles = [...uploadedFiles];
                                            newFiles[index].description = description;
                                            setUploadedFiles(newFiles);
                                            const newDescriptions = [...data.descriptions];
                                            newDescriptions[index] = description;
                                            setData('descriptions', newDescriptions);
                                        }}
                                        onDocumentTypeSelect={handleDocumentTypeSelect}
                                        onClearAll={() => {
                                            setUploadedFiles([]);
                                            setSelectedDocumentTypes(new Set());
                                            setData('documents', []);
                                            setData('descriptions', []);
                                            setData('document_type_ids', []);
                                        }}
                                    />
                                )}

                                {activeStep === 4 && (
                                    <ReviewStep
                                        selectedClearance={selectedClearance}
                                        data={data}
                                        isCustomPurpose={isCustomPurpose}
                                        availablePurposes={availablePurposes}
                                        uploadedFiles={uploadedFiles}
                                        currentDraftId={currentDraftId}
                                        resident={resident}
                                    />
                                )}
                            </div>

                            <RightSidebar
                                isMobile={isMobile}
                                selectedClearance={selectedClearance}
                                steps={steps}
                                activeStep={activeStep}
                                data={data}
                                isCustomPurpose={isCustomPurpose}
                                requiresDocuments={requiresDocuments}
                                documentRequirements={documentRequirements}
                                hasDraft={hasDraft}
                                onDeleteDraft={deleteDraft}
                            />
                        </div>
                    </div>

                    {isMobile ? (
                        <MobileFooter
                            isButtonsVisible={isButtonsVisible}
                            activeStep={activeStep}
                            dataClearanceTypeId={data.clearance_type_id}
                            dataPurpose={data.purpose}
                            isCustomPurpose={isCustomPurpose}
                            requiresDocuments={requiresDocuments}
                            documentRequirements={documentRequirements}
                            processing={processing}
                            isFormValid={isFormValid}
                            onPrev={prevStep}
                            onNext={nextStep}
                            onSubmit={handleSubmit}
                        />
                    ) : (
                        <DesktopFooter
                            activeStep={activeStep}
                            dataClearanceTypeId={data.clearance_type_id}
                            dataPurpose={data.purpose}
                            isCustomPurpose={isCustomPurpose}
                            requiresDocuments={requiresDocuments}
                            documentRequirements={documentRequirements}
                            processing={processing}
                            isFormValid={isFormValid}
                            onPrev={prevStep}
                            onNext={nextStep}
                            onSubmit={handleSubmit}
                            onSaveDraft={() => saveDraft({
                                clearance_type_id: data.clearance_type_id,
                                purpose: data.purpose,
                                purpose_custom: data.purpose_custom,
                                specific_purpose: data.specific_purpose,
                                needed_date: data.needed_date,
                                additional_notes: data.additional_notes,
                                uploadedFiles,
                                selectedDocumentTypes,
                                activeStep
                            })}
                        />
                    )}
                </form>
            </div>
        </ResidentLayout>
    );
}