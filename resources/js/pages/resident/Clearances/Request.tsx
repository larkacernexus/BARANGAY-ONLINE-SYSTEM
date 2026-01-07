import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft,
    PenSquare,
    Loader2,
    AlertCircle,
    Briefcase,
    GraduationCap,
    Building,
    FileCheck,
    Users,
    Car,
    Home as HomeIcon,
    Banknote,
    Upload
} from 'lucide-react';
import { Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, FormEvent, useRef } from 'react';

// Import components
import { ApplicantInfo } from '@/components/resident/request/applicant-info';
import { ClearanceTypeCard } from '@/components/resident/request/clearance-type-card';
import { PurposeDropdown } from '@/components/resident/request/purpose-dropdown';
import { DocumentUpload } from '@/components/resident/request/document-upload';
import { RequirementsStatus } from '@/components/resident/request/requirements-status';
import { MobileHeader } from '@/components/resident/request/mobile-header';
import { ImportantNotes } from '@/components/resident/request/important-notes';
import { DocumentRequirementsCard } from '@/components/resident/request/document-requirements-card';

// Import your existing footer
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';

// Import types
import type { ClearanceType, Resident, PageProps, UploadedFileWithMetadata, FormData } from '@/components/resident/request/types';

// Common purpose options
const COMMON_PURPOSE_OPTIONS = [
    { value: 'employment', label: 'Employment', icon: Briefcase },
    { value: 'education', label: 'Education/School', icon: GraduationCap },
    { value: 'business', label: 'Business Registration', icon: Building },
    { value: 'government', label: 'Government Transaction', icon: FileCheck },
    { value: 'travel', label: 'Travel/Passport', icon: Car },
    { value: 'loan', label: 'Loan Application', icon: Banknote },
    { value: 'marriage', label: 'Marriage License', icon: Users },
    { value: 'housing', label: 'Housing Application', icon: HomeIcon },
    { value: 'vehicle', label: 'Vehicle Registration', icon: Car },
    { value: 'voter', label: 'Voter\'s Registration', icon: Users },
    { value: 'nbi', label: 'NBI Clearance', icon: FileCheck },
    { value: 'police', label: 'Police Clearance', icon: FileCheck },
    { value: 'health', label: 'Health Certificate', icon: FileCheck },
    { value: 'business_permit', label: 'Business Permit', icon: Building },
    { value: 'building_permit', label: 'Building Permit', icon: Building },
    { value: 'property', label: 'Property Transaction', icon: HomeIcon },
    { value: 'insurance', label: 'Insurance Claim', icon: Banknote },
    { value: 'legal', label: 'Legal Document', icon: FileCheck },
    { value: 'scholarship', label: 'Scholarship Application', icon: GraduationCap },
    { value: 'immigration', label: 'Immigration', icon: Users },
    { value: 'custom', label: 'Other/Custom', icon: PenSquare },
];

export default function RequestClearance({ clearanceTypes, resident }: PageProps) {
    const [selectedClearance, setSelectedClearance] = useState<ClearanceType | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileWithMetadata[]>([]);
    const [availablePurposes, setAvailablePurposes] = useState<Array<{value: string, label: string, icon: any}>>([]);
    const [isCustomPurpose, setIsCustomPurpose] = useState(false);
    const [purposeSearch, setPurposeSearch] = useState('');
    const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<'form' | 'summary'>('form');
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const footerRef = useRef<HTMLDivElement>(null);
    const [footerHeight, setFooterHeight] = useState(0);

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
    });

    // Monitor footer visibility changes
    useEffect(() => {
        const checkFooterVisibility = () => {
            if (footerRef.current) {
                const computedStyle = window.getComputedStyle(footerRef.current);
                const transform = computedStyle.transform;
                const opacity = computedStyle.opacity;
                
                // Check if footer is visible based on transform and opacity
                const isVisible = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
                setIsFooterVisible(isVisible && parseFloat(opacity) > 0.5);
                
                // Get footer height
                const height = footerRef.current.offsetHeight;
                setFooterHeight(height);
            }
        };

        // Check initially
        checkFooterVisibility();

        // Set up mutation observer to watch for style changes
        const observer = new MutationObserver(checkFooterVisibility);
        if (footerRef.current) {
            observer.observe(footerRef.current, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }

        // Also check on scroll
        const handleScroll = () => {
            requestAnimationFrame(checkFooterVisibility);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Update available purposes when clearance type changes
    useEffect(() => {
        if (selectedClearance) {
            if (selectedClearance.purpose_options && selectedClearance.purpose_options.length > 0) {
                const mappedPurposes = selectedClearance.purpose_options.map(option => {
                    const commonPurpose = COMMON_PURPOSE_OPTIONS.find(
                        common => common.label.toLowerCase() === option.toLowerCase() || 
                                   common.value.toLowerCase() === option.toLowerCase()
                    );
                    
                    if (commonPurpose) return commonPurpose;
                    
                    return {
                        value: option.toLowerCase().replace(/\s+/g, '_'),
                        label: option,
                        icon: AlertCircle
                    };
                });
                
                setAvailablePurposes([
                    ...mappedPurposes,
                    { value: 'custom', label: 'Other/Custom', icon: PenSquare }
                ]);
            } else {
                setAvailablePurposes(COMMON_PURPOSE_OPTIONS);
            }
        } else {
            setAvailablePurposes([]);
        }
        
        // Reset purpose when clearance type changes
        setData('purpose', '');
        setData('purpose_custom', '');
        setIsCustomPurpose(false);
        setPurposeSearch('');
        setUploadedFiles([]);
        setSelectedDocumentTypes(new Set());
    }, [selectedClearance]);

    // Check document requirements
    const checkDocumentRequirements = () => {
        if (!selectedClearance || !selectedClearance.document_types) {
            return { met: false, missing: [], fulfilled: [], requiredCount: 0, fulfilledCount: 0 };
        }
        
        const requiredDocuments = selectedClearance.document_types.filter(doc => doc.is_required);
        const fulfilledDocuments = requiredDocuments.filter(doc => 
            selectedDocumentTypes.has(doc.id)
        );
        const missingDocuments = requiredDocuments.filter(doc => 
            !selectedDocumentTypes.has(doc.id)
        ).map(doc => doc.name);
        
        return {
            met: missingDocuments.length === 0 && fulfilledDocuments.length > 0,
            missing: missingDocuments,
            fulfilled: fulfilledDocuments.map(doc => doc.name),
            requiredCount: requiredDocuments.length,
            fulfilledCount: fulfilledDocuments.length
        };
    };

    const documentRequirements = checkDocumentRequirements();

    // Get purpose suggestions
    const getPurposeSuggestions = () => {
        if (!data.purpose && !isCustomPurpose) return '';
        
        if (isCustomPurpose) {
            return 'Please provide specific details about your purpose...';
        }
        
        const purpose = availablePurposes.find(p => p.value === data.purpose);
        if (!purpose) return '';
        
        switch (purpose.value) {
            case 'employment':
                return 'e.g., Job application at [Company Name], Requirements for new employment at [Company], Promotion requirements...';
            case 'education':
                return 'e.g., School enrollment at [School Name], Scholarship application, School ID renewal, University admission...';
            case 'business':
                return 'e.g., New business registration at DTI, Business permit renewal, Additional line of business...';
            case 'government':
                return 'e.g., SSS application, PhilHealth registration, NBI clearance, Postal ID application...';
            case 'travel':
                return 'e.g., Passport application, Travel authorization, Visa requirements, Overseas employment...';
            case 'loan':
                return 'e.g., Bank loan application at [Bank Name], SSS loan, Pag-IBIG housing loan, Car loan...';
            case 'marriage':
                return 'e.g., Marriage license application, Church wedding requirements, Civil wedding...';
            case 'housing':
                return 'e.g., Socialized housing application, NHA requirements, Transfer of ownership...';
            case 'vehicle':
                return 'e.g., New vehicle registration, Transfer of ownership, Renewal of registration...';
            case 'voter':
                return 'e.g., Voter\'s registration, Transfer of voting precinct, Election requirements...';
            case 'nbi':
                return 'e.g., NBI clearance for employment, NBI clearance for travel, Renewal of NBI clearance...';
            default:
                return 'Please provide specific details about your purpose...';
        }
    };

    // Handle clearance type change
    const handleClearanceTypeChange = (value: string) => {
        setData('clearance_type_id', value);
        const type = clearanceTypes.find(t => t.id.toString() === value);
        setSelectedClearance(type || null);
    };

    // Handle purpose selection
    const handlePurposeSelect = (value: string, label: string) => {
        if (value === 'custom') {
            setIsCustomPurpose(true);
            setData('purpose', 'custom');
            setData('purpose_custom', '');
        } else {
            setIsCustomPurpose(false);
            setData('purpose', value);
            setData('purpose_custom', '');
            
            // Auto-fill specific purpose with suggestion
            const suggestion = getPurposeSuggestions();
            if (!data.specific_purpose) {
                setData('specific_purpose', suggestion);
            }
        }
        setShowPurposeDropdown(false);
        setPurposeSearch('');
    };

    // Handle file upload
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

    // Handle file removal
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

    // Handle document type selection
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

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!data.clearance_type_id) {
            alert('Please select a clearance type.');
            return;
        }

        const finalPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
        if (!finalPurpose) {
            alert('Please select or enter the purpose of the clearance.');
            return;
        }

        if (!data.specific_purpose) {
            alert('Please provide specific purpose details.');
            return;
        }

        if (!data.needed_date) {
            alert('Please select the date needed.');
            return;
        }

        if (documentRequirements.missing.length > 0) {
            alert(`Please upload and assign the following required documents: ${documentRequirements.missing.join(', ')}`);
            return;
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append('clearance_type_id', data.clearance_type_id);
        formData.append('purpose', finalPurpose);
        formData.append('specific_purpose', data.specific_purpose);
        formData.append('needed_date', data.needed_date);
        formData.append('resident_id', data.resident_id);
        
        if (data.additional_notes) {
            formData.append('additional_notes', data.additional_notes);
        }
        
        uploadedFiles.forEach((uploadedFile, index) => {
            formData.append(`documents[${index}][file]`, uploadedFile.file);
            formData.append(`documents[${index}][description]`, uploadedFile.description || '');
            
            if (uploadedFile.document_type_id) {
                formData.append(`documents[${index}][document_type_id]`, uploadedFile.document_type_id.toString());
            }
        });

        // Submit using Inertia
        post('/my-clearances/store', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setUploadedFiles([]);
                setSelectedClearance(null);
                setAvailablePurposes([]);
                setIsCustomPurpose(false);
                setPurposeSearch('');
                setSelectedDocumentTypes(new Set());
                reset();
                
                router.visit('/resident/clearances', {
                    only: ['clearances', 'flash'],
                });
            },
        });
    };

    // Check if form is valid
    const isFormValid = () => {
        const finalPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
        return data.clearance_type_id && 
               finalPurpose &&
               data.specific_purpose &&
               data.needed_date &&
               documentRequirements.met;
    };

    // Calculate submit button position based on footer visibility
    const submitButtonBottom = isFooterVisible ? `${footerHeight}px` : '0px';

    return (
        <ResidentLayout
            title="Request Clearance"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Clearances', href: '/resident/clearances' },
                { title: 'Request Clearance', href: '#' }
            ]}
        >
            <div className="space-y-6 lg:space-y-8">
                {/* Mobile Header */}
                <MobileHeader 
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/resident/clearances">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Request Clearance</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Submit a request for barangay clearance or certificate
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="mb-4 lg:mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc list-inside space-y-1">
                                {Object.entries(errors).map(([key, value]) => (
                                    <li key={key} className="text-sm">{value as string}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <form id="clearance-request-form" onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column - Form */}
                        <div className={`lg:col-span-2 space-y-6 ${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                            {/* Add bottom padding for fixed elements */}
                            <div className="pb-40 lg:pb-0">
                                <ApplicantInfo resident={resident} />

                                <ClearanceTypeCard
                                    clearanceTypes={clearanceTypes}
                                    selectedClearance={selectedClearance}
                                    selectedDocumentTypes={selectedDocumentTypes}
                                    value={data.clearance_type_id}
                                    error={errors.clearance_type_id}
                                    onSelect={handleClearanceTypeChange}
                                />

                                {/* Purpose & Details Card */}
                                <Card className="lg:rounded-xl">
                                    <CardHeader className="p-4 lg:p-6">
                                        <CardTitle className="text-base lg:text-lg">Purpose & Details</CardTitle>
                                        <CardDescription className="text-xs lg:text-sm">
                                            {selectedClearance 
                                                ? `Select a purpose for ${selectedClearance.name}`
                                                : 'Select a clearance type first'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
                                        <div className="space-y-1 lg:space-y-2">
                                            <Label htmlFor="purpose" className="text-sm">Purpose of Clearance *</Label>
                                            <PurposeDropdown
                                                value={data.purpose}
                                                purposeCustom={data.purpose_custom}
                                                isCustomPurpose={isCustomPurpose}
                                                availablePurposes={availablePurposes}
                                                purposeSearch={purposeSearch}
                                                showPurposeDropdown={showPurposeDropdown}
                                                disabled={!selectedClearance}
                                                onSelect={handlePurposeSelect}
                                                onCustomChange={(value) => setData('purpose_custom', value)}
                                                onSearchChange={setPurposeSearch}
                                                onToggleDropdown={setShowPurposeDropdown}
                                            />
                                            {errors.purpose && (
                                                <p className="text-xs lg:text-sm text-red-600">{errors.purpose}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1 lg:space-y-2">
                                            <Label htmlFor="specific_purpose" className="text-sm">
                                                Specific Purpose Details *
                                            </Label>
                                            <Textarea
                                                id="specific_purpose"
                                                value={data.specific_purpose}
                                                onChange={e => setData('specific_purpose', e.target.value)}
                                                placeholder={getPurposeSuggestions()}
                                                rows={3}
                                                required
                                                disabled={!data.purpose && !isCustomPurpose}
                                                className="text-sm min-h-[80px]"
                                            />
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-500">
                                                    Be specific about where and why
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const suggestion = getPurposeSuggestions();
                                                        if (suggestion) {
                                                            setData('specific_purpose', suggestion);
                                                        }
                                                    }}
                                                    className="text-xs h-7 px-2"
                                                    disabled={!data.purpose && !isCustomPurpose}
                                                >
                                                    Auto-fill
                                                </Button>
                                            </div>
                                            {errors.specific_purpose && (
                                                <p className="text-xs lg:text-sm text-red-600">{errors.specific_purpose}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                            <div className="space-y-1 lg:space-y-2">
                                                <Label htmlFor="needed_date" className="text-sm">Date Needed *</Label>
                                                <Input
                                                    id="needed_date"
                                                    type="date"
                                                    value={data.needed_date}
                                                    onChange={e => setData('needed_date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    required
                                                    className="h-12"
                                                />
                                                {errors.needed_date && (
                                                    <p className="text-xs lg:text-sm text-red-600">{errors.needed_date}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1 lg:space-y-2">
                                                <Label htmlFor="additional_notes" className="text-sm">Additional Notes</Label>
                                                <Input
                                                    id="additional_notes"
                                                    value={data.additional_notes}
                                                    onChange={e => setData('additional_notes', e.target.value)}
                                                    placeholder="Any special requirements..."
                                                    className="h-12"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Document Upload Card */}
                                <Card className="lg:rounded-xl">
                                    <CardHeader className="p-4 lg:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                                            <Upload className="h-4 w-4 lg:h-5 lg:w-5" />
                                            Upload Documents
                                        </CardTitle>
                                        <CardDescription className="text-xs lg:text-sm">
                                            {selectedClearance 
                                                ? `Upload required documents (PDF, JPG, PNG, DOC, max 5MB)`
                                                : 'Select a clearance type to see requirements'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                                        <DocumentUpload
                                            documentTypes={selectedClearance?.document_types || []}
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
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column - Summary */}
                        <div className={`space-y-6 ${activeTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
                            <RequirementsStatus
                                clearanceName={selectedClearance?.name}
                                processingDays={selectedClearance?.processing_days}
                                validityDays={selectedClearance?.validity_days}
                                fee={selectedClearance?.formatted_fee}
                                requiresPayment={selectedClearance?.requires_payment}
                                requiresApproval={selectedClearance?.requires_approval}
                                documentRequirements={documentRequirements}
                                clearanceTypeSelected={!!data.clearance_type_id}
                                purposeSelected={!!data.purpose || isCustomPurpose}
                                detailsProvided={!!data.specific_purpose}
                                dateSpecified={!!data.needed_date}
                            />

                            {selectedClearance && selectedClearance.document_types && (
                                <DocumentRequirementsCard
                                    clearanceName={selectedClearance.name}
                                    documentTypes={selectedClearance.document_types}
                                    selectedDocumentTypes={selectedDocumentTypes}
                                    documentRequirements={documentRequirements}
                                />
                            )}

                            <ImportantNotes
                                processingDays={selectedClearance?.processing_days}
                                validityDays={selectedClearance?.validity_days}
                                requiresApproval={selectedClearance?.requires_approval}
                                requiresDocuments={selectedClearance?.has_required_documents}
                                requiredCount={documentRequirements.requiredCount}
                            />

                            {/* Desktop Submit Button */}
                            <div className="hidden lg:block sticky top-6">
                                <Button
                                    type="submit"
                                    disabled={processing || !isFormValid()}
                                    className="w-full h-12 text-base font-medium"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Clearance Request'
                                    )}
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    By submitting, you agree to the terms and conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                {/* MOBILE LAYOUT WITH DYNAMIC POSITIONING */}
                <div className="lg:hidden">
                    {/* Fixed Footer (your existing component) */}
                    <div ref={footerRef}>
                        <ResidentMobileFooter />
                    </div>
                    
                    {/* Submit Button - Position adjusts based on footer visibility */}
                    <div 
                        className="fixed left-0 right-0 z-50 transition-all duration-300"
                        style={{
                            bottom: submitButtonBottom
                        }}
                    >
                        <div className="p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 border-t shadow-lg">
                            <Button
                                type="submit"
                                form="clearance-request-form"
                                disabled={processing || !isFormValid()}
                                className="w-full h-12 text-sm font-medium"
                                size="lg"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </Button>
                            <p className="text-xs text-gray-500 text-center mt-1">
                                By submitting, you agree to terms and conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ResidentLayout>
    );
}