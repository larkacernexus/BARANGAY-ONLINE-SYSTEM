import { useForm, usePage, Link } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    AlertCircle,
    Upload,
    Camera,
    AlertTriangle,
    CheckCircle,
    X,
    FileText,
    Phone,
    ShieldAlert,
    ArrowRight,
    Loader2,
    Shield,
    Info,
    Clock,
    FileUp,
    Search,
    Check,
    Users,
    Zap,
    Trash2,
    Droplets,
    Wrench,
    Building,
    Megaphone,
    Bell,
    Construction,
    Car,
    PawPrint,
    HeartPulse,
    Store,
    MapPin,
    Calendar,
    Volume,
    UserX,
    Handshake,
    Save,
    Image as ImageIcon,
    Video,
    File,
    Eye,
    Send,
    HelpCircle,
    Briefcase,
    GraduationCap,
    PenSquare,
    Banknote,
    Home as HomeIcon,
    FileCheck,
    FileWarning
} from 'lucide-react';

// Import components
import { ApplicantInfo } from '@/components/resident/request/applicant-info';
import { PurposeDropdown } from '@/components/resident/request/purpose-dropdown';
import { DocumentUpload } from '@/components/resident/request/document-upload';
import { RequirementsStatus } from '@/components/resident/request/requirements-status';
import { ImportantNotes } from '@/components/resident/request/important-notes';
import { DocumentRequirementsCard } from '@/components/resident/request/document-requirements-card';

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

// Local storage key for draft
const CLEARANCE_DRAFT_KEY = 'clearance_request_draft';

// Interface for localStorage draft
interface ClearanceDraft {
    clearance_type_id: string;
    purpose: string;
    purpose_custom: string;
    specific_purpose: string;
    needed_date: string;
    additional_notes: string;
    uploadedFilesMetadata: Array<{
        name: string;
        size: number;
        type: string;
        description: string;
        document_type_id?: number;
    }>;
    selectedDocumentTypes: number[];
    activeStep: number;
    lastSaved: string;
}

// Helper to generate draft ID
const generateDraftId = () => {
    return 'clearance_draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export default function RequestClearance({ clearanceTypes, resident }: PageProps) {
    const [selectedClearance, setSelectedClearance] = useState<ClearanceType | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileWithMetadata[]>([]);
    const [availablePurposes, setAvailablePurposes] = useState<Array<{value: string, label: string, icon: any}>>([]);
    const [isCustomPurpose, setIsCustomPurpose] = useState(false);
    const [purposeSearch, setPurposeSearch] = useState('');
    const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<Set<number>>(new Set());
    
    // Mobile state
    const [isMobile, setIsMobile] = useState(false);
    const [isButtonsVisible, setIsButtonsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [activeStep, setActiveStep] = useState(1);
    
    // For handling many clearance types
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTypes, setFilteredTypes] = useState<ClearanceType[]>(clearanceTypes);
    const [showSearch, setShowSearch] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-save state
    const [lastSaveTime, setLastSaveTime] = useState<number>(0);
    const [hasDraft, setHasDraft] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

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

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Load draft from localStorage on component mount
    useEffect(() => {
        const loadDraft = () => {
            try {
                const savedDraft = localStorage.getItem(CLEARANCE_DRAFT_KEY);
                if (savedDraft) {
                    const draft: ClearanceDraft = JSON.parse(savedDraft);
                    
                    // Only load if draft is from today
                    const draftDate = new Date(draft.lastSaved);
                    const today = new Date();
                    const isSameDay = draftDate.getDate() === today.getDate() && 
                                     draftDate.getMonth() === today.getMonth() && 
                                     draftDate.getFullYear() === today.getFullYear();
                    
                    if (isSameDay) {
                        // Load form data
                        setData({
                            clearance_type_id: draft.clearance_type_id,
                            purpose: draft.purpose,
                            purpose_custom: draft.purpose_custom,
                            specific_purpose: draft.specific_purpose,
                            needed_date: draft.needed_date,
                            additional_notes: draft.additional_notes,
                            resident_id: resident.id.toString(),
                            documents: [],
                            descriptions: draft.uploadedFilesMetadata.map(f => f.description),
                            document_type_ids: draft.uploadedFilesMetadata.map(f => f.document_type_id || 0),
                            _method: 'post'
                        });
                        
                        // Load selected clearance type
                        if (draft.clearance_type_id) {
                            const type = clearanceTypes.find(t => t.id.toString() === draft.clearance_type_id);
                            setSelectedClearance(type || null);
                        }
                        
                        // Load uploaded files metadata
                        const filesWithMeta: UploadedFileWithMetadata[] = draft.uploadedFilesMetadata.map(meta => ({
                            file: new File([], meta.name, { type: meta.type, lastModified: Date.now() }),
                            description: meta.description,
                            document_type_id: meta.document_type_id
                        }));
                        setUploadedFiles(filesWithMeta);
                        
                        // Load selected document types
                        const docTypesSet = new Set<number>(draft.selectedDocumentTypes);
                        setSelectedDocumentTypes(docTypesSet);
                        
                        // Load active step
                        setActiveStep(draft.activeStep || 1);
                        
                        setHasDraft(true);
                        setCurrentDraftId(generateDraftId());
                        
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
                console.error('Error loading draft:', error);
                clearDraft();
            }
        };

        loadDraft();
        
        // Auto-save on unload
        const handleBeforeUnload = () => {
            if (hasUnsavedChanges()) {
                saveDraft();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Define hide/show functions
    const hideButtons = useCallback(() => {
        setIsButtonsVisible(false);
    }, []);

    const showButtons = useCallback(() => {
        setIsButtonsVisible(true);
    }, []);

    // Handle scroll to hide/show buttons
    useEffect(() => {
        if (!isMobile) return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 100;
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);
            
            if (scrollDelta < 5) return;
            
            if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
                setTimeout(() => hideButtons(), 100);
            } else if (currentScrollY < lastScrollY) {
                showButtons();
            }
            
            if (currentScrollY < 30) {
                showButtons();
            }
            
            setLastScrollY(currentScrollY);
        };

        let timeoutId: NodeJS.Timeout;
        const debouncedHandleScroll = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(handleScroll, 50);
        };

        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isMobile, lastScrollY, hideButtons, showButtons]);

    // Check if there are unsaved changes
    const hasUnsavedChanges = () => {
        return data.clearance_type_id || 
               data.purpose || 
               data.purpose_custom || 
               data.specific_purpose || 
               data.additional_notes ||
               uploadedFiles.length > 0;
    };

    // Clear draft from localStorage
    const clearDraft = () => {
        localStorage.removeItem(CLEARANCE_DRAFT_KEY);
        setHasDraft(false);
        setCurrentDraftId(null);
        toast.success('Draft cleared');
    };

    // Save draft to localStorage
    const saveDraft = () => {
        try {
            const draftId = currentDraftId || generateDraftId();
            const now = new Date().toISOString();
            
            const draft: ClearanceDraft = {
                clearance_type_id: data.clearance_type_id,
                purpose: data.purpose,
                purpose_custom: data.purpose_custom,
                specific_purpose: data.specific_purpose,
                needed_date: data.needed_date,
                additional_notes: data.additional_notes,
                uploadedFilesMetadata: uploadedFiles.map(file => ({
                    name: file.file.name,
                    size: file.file.size,
                    type: file.file.type,
                    description: file.description,
                    document_type_id: file.document_type_id
                })),
                selectedDocumentTypes: Array.from(selectedDocumentTypes),
                activeStep,
                lastSaved: now
            };
            
            localStorage.setItem(CLEARANCE_DRAFT_KEY, JSON.stringify(draft));
            setHasDraft(true);
            setCurrentDraftId(draftId);
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    // Handle manual save draft
    const handleSaveDraft = async () => {
        try {
            saveDraft();
            toast.success('Draft saved locally');
        } catch (error) {
            toast.error('Failed to save draft locally');
        }
    };

    // DELETE DRAFT FROM LOCALSTORAGE
    const handleDeleteDraft = () => {
        if (!currentDraftId) return;
        
        if (confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
            clearDraft();
            reset();
            setUploadedFiles([]);
            setSelectedDocumentTypes(new Set());
            setSelectedClearance(null);
            setActiveStep(1);
            
            toast.success('Draft deleted successfully');
        }
    };

    // Filter clearance types based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredTypes(clearanceTypes);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = clearanceTypes.filter(type => 
                type.name.toLowerCase().includes(query) ||
                type.description.toLowerCase().includes(query) ||
                type.purpose_options?.some(opt => opt.toLowerCase().includes(query))
            );
            setFilteredTypes(filtered);
        }
    }, [searchQuery, clearanceTypes]);

    // Focus search input when search is opened on mobile
    useEffect(() => {
        if (showSearch && searchInputRef.current && isMobile) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [showSearch, isMobile]);

    // Auto-save on changes
    useEffect(() => {
        if (hasUnsavedChanges()) {
            saveDraft();
        }
    }, [data, uploadedFiles, selectedDocumentTypes, activeStep]);

    // Check document requirements
    const hasDocumentRequirements = () => {
        if (!selectedClearance || !selectedClearance.document_types) {
            return false;
        }
        return selectedClearance.document_types.some(doc => doc.is_required);
    };

    const checkDocumentRequirements = () => {
        if (!selectedClearance || !selectedClearance.document_types) {
            return { met: true, missing: [], fulfilled: [], requiredCount: 0, fulfilledCount: 0 };
        }
        
        const requiredDocuments = selectedClearance.document_types.filter(doc => doc.is_required);
        
        if (requiredDocuments.length === 0) {
            return { 
                met: true, 
                missing: [], 
                fulfilled: [], 
                requiredCount: 0, 
                fulfilledCount: 0 
            };
        }
        
        const fulfilledDocuments = requiredDocuments.filter(doc => 
            selectedDocumentTypes.has(doc.id)
        );
        const missingDocuments = requiredDocuments.filter(doc => 
            !selectedDocumentTypes.has(doc.id)
        ).map(doc => doc.name);
        
        const met = missingDocuments.length === 0 && 
                    fulfilledDocuments.length === requiredDocuments.length;
        
        return {
            met,
            missing: missingDocuments,
            fulfilled: fulfilledDocuments.map(doc => doc.name),
            requiredCount: requiredDocuments.length,
            fulfilledCount: fulfilledDocuments.length
        };
    };

    const documentRequirements = checkDocumentRequirements();
    const requiresDocuments = hasDocumentRequirements();

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
        
        setData('purpose', '');
        setData('purpose_custom', '');
        setIsCustomPurpose(false);
        setPurposeSearch('');
        setUploadedFiles([]);
        setSelectedDocumentTypes(new Set());
    }, [selectedClearance]);

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
        if (isMobile && value) {
            setTimeout(() => {
                nextStep();
            }, 100);
        }
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

    // Form submission - UPDATED
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
            toast.error(`Please upload and assign the following required documents: ${documentRequirements.missing.join(', ')}`);
            setActiveStep(3);
            return;
        }

        const formData = new FormData();
        formData.append('clearance_type_id', data.clearance_type_id);
        formData.append('purpose', finalPurpose);
        formData.append('specific_purpose', data.specific_purpose || '');
        formData.append('needed_date', data.needed_date);
        formData.append('resident_id', data.resident_id);
        
        if (data.additional_notes) {
            formData.append('additional_notes', data.additional_notes);
        }
        
        if (uploadedFiles.length > 0) {
            uploadedFiles.forEach((uploadedFile, index) => {
                formData.append(`documents[]`, uploadedFile.file);
                
                if (uploadedFile.description) {
                    formData.append(`descriptions[]`, uploadedFile.description);
                } else {
                    formData.append(`descriptions[]`, '');
                }
                
                if (uploadedFile.document_type_id) {
                    formData.append(`document_type_ids[]`, uploadedFile.document_type_id.toString());
                } else {
                    formData.append(`document_type_ids[]`, '');
                }
            });
        }

        const routeUrl = route('resident.clearances.store');
        
        post(routeUrl, formData, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Clearance request submitted successfully!');
                
                // Clean up and reset form
                clearDraft();
                reset();
                setUploadedFiles([]);
                setSelectedDocumentTypes(new Set());
                setSelectedClearance(null);
                setActiveStep(1);
            },
            onError: (errors) => {
                if (errors) {
                    Object.entries(errors).forEach(([field, message]) => {
                        toast.error(`${field}: ${message}`);
                    });
                } else {
                    toast.error('An error occurred while submitting the request');
                }
            }
        });
    };

    // Check if form is valid
    const isFormValid = () => {
        const finalPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
        return data.clearance_type_id && 
               finalPurpose &&
               data.needed_date &&
               documentRequirements.met;
    };

    // Mobile navigation functions
    const nextStep = useCallback(() => {
        if (activeStep === 1 && !data.clearance_type_id) {
            toast.error('Please select a clearance type');
            return;
        }
        
        if (activeStep === 2 && (!data.purpose && !isCustomPurpose)) {
            toast.error('Please select or enter a purpose');
            return;
        }
        
        if (activeStep === 3 && documentRequirements.requiredCount > 0 && documentRequirements.missing.length > 0) {
            toast.error('Please upload all required documents');
            return;
        }
        
        if (activeStep < 4) {
            setActiveStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeStep, data.clearance_type_id, data.purpose, isCustomPurpose, documentRequirements]);

    const prevStep = useCallback(() => {
        if (activeStep > 1) {
            setActiveStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeStep]);

    // Steps
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
                    {/* Mobile Header with Progress */}
                    {isMobile && (
                        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <Link href="/resident/clearances" className="flex-shrink-0">
                                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h1 className="text-lg font-bold truncate">Request Clearance</h1>
                                            {hasDraft && (
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                    Draft Saved
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={(activeStep / 4) * 100} className="h-1.5 flex-1" />
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                Step {activeStep} of 4
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Link href="/resident/clearances">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight">Request Clearance</h1>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                Submit a request for barangay clearance or certificate
                                            </p>
                                        </div>
                                        {hasDraft && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                Draft Auto-saved
                                            </Badge>
                                        )}
                                    </div>
                                </div>
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

                    <div className="px-4 md:px-6 pb-24 md:pb-6">
                        {/* Step Navigation for Mobile */}
                        {isMobile && (
                            <div className="flex justify-between mb-6 overflow-x-auto py-2">
                                {steps.map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                                                activeStep === step.id 
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                            onClick={() => setActiveStep(step.id)}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                                                activeStep === step.id 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-gray-200 dark:bg-gray-800'
                                            }`}>
                                                {step.id}
                                            </div>
                                            <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Desktop Step Progress Bar */}
                        {!isMobile && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Step {activeStep}: {steps[activeStep - 1].title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {steps[activeStep - 1].description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            Step {activeStep} of {steps.length}
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={(activeStep / steps.length) * 100} className="h-2" />
                            </div>
                        )}

                        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                            {/* Main Form Area */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* STEP 1: Clearance Type Selection */}
                                {activeStep === 1 && (
                                    <div className="space-y-6">
                                        {/* Search bar */}
                                        {clearanceTypes.length > 8 && (
                                            <div className="mb-4">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        type="text"
                                                        placeholder="Search clearance types..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="pl-10 pr-10 h-11 rounded-lg"
                                                    />
                                                    {searchQuery && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSearchQuery('')}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                        >
                                                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                        </button>
                                                    )}
                                                </div>
                                                {filteredTypes.length === 0 && (
                                                    <div className="text-center py-6 text-gray-500">
                                                        No clearance types found matching "{searchQuery}"
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Clearance type list */}
                                        <div className={`${isMobile && filteredTypes.length > 6 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
                                            <div className="space-y-3">
                                                {filteredTypes.length > 0 ? (
                                                    filteredTypes.map((type) => (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                                data.clearance_type_id === type.id.toString()
                                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-500/20'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                                                            }`}
                                                            onClick={() => handleClearanceTypeChange(type.id.toString())}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    <div className={`p-2 rounded-lg flex-shrink-0 ${data.clearance_type_id === type.id.toString() ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                                        <FileCheck className={`h-5 w-5 ${data.clearance_type_id === type.id.toString() ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="font-semibold text-sm truncate">
                                                                                {type.name}
                                                                            </h3>
                                                                            {type.formatted_fee && type.formatted_fee !== '₱0.00' && (
                                                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                                                    {type.formatted_fee}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                                            {type.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-shrink-0 ml-3">
                                                                    {data.clearance_type_id === type.id.toString() ? (
                                                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                                                            <Check className="h-3 w-3 text-white" />
                                                                        </div>
                                                                    ) : (
                                                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Additional info for selected type */}
                                                            {data.clearance_type_id === type.id.toString() && type.document_types && type.document_types.length > 0 && (
                                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                                        <Info className="h-3 w-3" />
                                                                        <span className="font-medium">Requires:</span>
                                                                        <span className="ml-1">
                                                                            {type.document_types.filter(doc => doc.is_required).length} required document(s)
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                                                            <FileCheck className="h-6 w-6" />
                                                        </div>
                                                        <h4 className="font-medium mb-1">No clearance types found</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {searchQuery 
                                                                ? `Try a different search term or clear the search`
                                                                : `No clearance types are currently available`
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selected Type Summary */}
                                        {selectedClearance && (
                                            <div className="mt-4 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                            <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold flex items-center gap-2">
                                                                {selectedClearance.name}
                                                                {selectedClearance.formatted_fee && selectedClearance.formatted_fee !== '₱0.00' && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {selectedClearance.formatted_fee}
                                                                    </Badge>
                                                                )}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {selectedClearance.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedClearance(null);
                                                            setData('clearance_type_id', '');
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                                                        <div className="font-medium">Processing</div>
                                                        <div className="text-gray-600 dark:text-gray-400">{selectedClearance.processing_days} days</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                                                        <div className="font-medium">Validity</div>
                                                        <div className="text-gray-600 dark:text-gray-400">{selectedClearance.validity_days} days</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                                                        <div className="font-medium">Documents</div>
                                                        <div className={selectedClearance.document_types?.some(doc => doc.is_required) ? 'text-red-600' : 'text-green-600'}>
                                                            {selectedClearance.document_types?.filter(doc => doc.is_required).length || 0} required
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 2: Purpose & Details */}
                                {activeStep === 2 && (
                                    <div className="space-y-6">
                                        <Card className="rounded-xl">
                                            <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="purpose" className="text-sm font-medium">Purpose of Clearance *</Label>
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
                                                            <p className="text-sm text-red-600">{errors.purpose}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="specific_purpose" className="text-sm font-medium flex items-center gap-2">
                                                            <FileText className="h-4 w-4" />
                                                            Specific Details 
                                                            <span className="text-gray-400 ml-1 font-normal">(Optional)</span>
                                                        </Label>
                                                        <Textarea
                                                            id="specific_purpose"
                                                            value={data.specific_purpose}
                                                            onChange={e => setData('specific_purpose', e.target.value)}
                                                            placeholder={getPurposeSuggestions()}
                                                            rows={3}
                                                            disabled={!data.purpose && !isCustomPurpose}
                                                            className="text-sm min-h-[80px] rounded-lg"
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
                                                                className="text-xs h-7 px-3"
                                                                disabled={!data.purpose && !isCustomPurpose}
                                                            >
                                                                Auto-fill
                                                            </Button>
                                                        </div>
                                                        {errors.specific_purpose && (
                                                            <p className="text-sm text-red-600">{errors.specific_purpose}</p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="needed_date" className="text-sm font-medium flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                Date Needed *
                                                            </Label>
                                                            <Input
                                                                id="needed_date"
                                                                type="date"
                                                                value={data.needed_date}
                                                                onChange={e => setData('needed_date', e.target.value)}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                required
                                                                className="h-11 text-sm rounded-lg"
                                                            />
                                                            {errors.needed_date && (
                                                                <p className="text-sm text-red-600">{errors.needed_date}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="additional_notes" className="text-sm font-medium flex items-center gap-2">
                                                                <Info className="h-4 w-4" />
                                                                Additional Notes
                                                            </Label>
                                                            <Input
                                                                id="additional_notes"
                                                                value={data.additional_notes}
                                                                onChange={e => setData('additional_notes', e.target.value)}
                                                                placeholder="Special requirements..."
                                                                className="h-11 text-sm rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* STEP 3: Documents */}
                                {activeStep === 3 && (
                                    <div className="space-y-6">
                                        <Card className="rounded-xl">
                                            <CardContent className="p-4 lg:p-6 pt-6 space-y-6">
                                                {requiresDocuments ? (
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
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                                        </div>
                                                        <h4 className="font-semibold mb-2">No Documents Required</h4>
                                                        <p className="text-sm text-gray-500 mb-4">
                                                            This clearance type does not require any supporting documents
                                                        </p>
                                                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                                            <div className="flex items-start gap-3">
                                                                <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <h5 className="text-sm font-medium mb-1">You can proceed directly to review</h5>
                                                                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                                        <li>• No need to upload any files</li>
                                                                        <li>• Review your information before submitting</li>
                                                                        <li>• Processing time: {selectedClearance?.processing_days} days</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* STEP 4: Review & Submit */}
                                {activeStep === 4 && (
                                    <div className="space-y-6">
                                        <div className="space-y-6">
                                            {/* Clearance Summary */}
                                            <Card className="rounded-xl">
                                                <CardContent className="p-4 lg:p-6">
                                                    <h3 className="font-medium mb-4 text-lg">Clearance Summary</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Type</span>
                                                            <div className="flex items-center gap-2">
                                                                <FileCheck className="h-4 w-4 text-blue-500" />
                                                                <span className="font-medium">{selectedClearance?.name}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Purpose</span>
                                                            <span className="font-medium text-right max-w-[200px] truncate">
                                                                {isCustomPurpose ? data.purpose_custom : availablePurposes.find(p => p.value === data.purpose)?.label || 'Not specified'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Date Needed</span>
                                                            <span className="font-medium">
                                                                {data.needed_date ? new Date(data.needed_date).toLocaleDateString() : 'Not specified'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Processing Time</span>
                                                            <span className="font-medium">{selectedClearance?.processing_days} days</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Validity</span>
                                                            <span className="font-medium">{selectedClearance?.validity_days} days</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Documents</span>
                                                            <span className="font-medium">
                                                                {uploadedFiles.length} files uploaded
                                                            </span>
                                                        </div>
                                                        {currentDraftId && (
                                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                                <span className="text-gray-600 dark:text-gray-400">Draft Status</span>
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                    <Save className="h-3 w-3 mr-1" />
                                                                    Saved in Browser
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Applicant Info */}
                                            <Card className="rounded-xl">
                                                <CardContent className="p-4 lg:p-6">
                                                    <h3 className="font-medium mb-4">Applicant Information</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Name</span>
                                                            <span className="font-medium">{resident.first_name} {resident.last_name}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                            <span className="text-gray-600 dark:text-gray-400">Address</span>
                                                            <span className="font-medium text-right max-w-[200px] truncate">
                                                                {resident.address}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Terms Agreement */}
                                            <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                                            By submitting, you confirm:
                                                        </p>
                                                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                                            <li>• All information is accurate and truthful</li>
                                                            <li>• You have provided all required documents</li>
                                                            <li>• You'll receive updates on your request status</li>
                                                            <li>• You understand the processing timeline</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Summary & Actions (Desktop only) */}
                            {!isMobile && (
                                <div className="space-y-6">
                                    {/* Status Card */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-semibold">Clearance Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {selectedClearance ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Type</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {selectedClearance.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Processing Time</span>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {selectedClearance.processing_days} days
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Validity Period</span>
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            {selectedClearance.validity_days} days
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Fee</span>
                                                        <span className={`text-sm font-medium ${selectedClearance.formatted_fee !== '₱0.00' ? 'text-amber-600' : 'text-green-600'}`}>
                                                            {selectedClearance.formatted_fee !== '₱0.00' ? selectedClearance.formatted_fee : 'Free'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Documents Required</span>
                                                        <span className={`text-sm font-medium ${requiresDocuments ? 'text-red-600' : 'text-green-600'}`}>
                                                            {requiresDocuments ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Select a clearance type to see details</p>
                                            )}
                                            
                                            <Separator />
                                            
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Current Step:</span>
                                                </div>
                                                <p className="font-medium">{steps[activeStep - 1].title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{steps[activeStep - 1].description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Requirements Status */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-semibold">Requirements</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className={`flex items-center justify-between ${data.clearance_type_id ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="text-sm">Clearance Type</span>
                                                {data.clearance_type_id ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs">Required</span>
                                                )}
                                            </div>
                                            <div className={`flex items-center justify-between ${(data.purpose || isCustomPurpose) ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="text-sm">Purpose</span>
                                                {(data.purpose || isCustomPurpose) ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs">Required</span>
                                                )}
                                            </div>
                                            <div className={`flex items-center justify-between ${data.needed_date ? 'text-green-600' : 'text-gray-500'}`}>
                                                <span className="text-sm">Date Needed</span>
                                                {data.needed_date ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs">Required</span>
                                                )}
                                            </div>
                                            {requiresDocuments && (
                                                <div className={`flex items-center justify-between ${documentRequirements.met ? 'text-green-600' : 'text-red-600'}`}>
                                                    <span className="text-sm">Documents</span>
                                                    {documentRequirements.met ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <span className="text-xs">{documentRequirements.fulfilledCount}/{documentRequirements.requiredCount}</span>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Draft Info */}
                                    {hasDraft && (
                                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                    <Save className="h-4 w-4 text-blue-600" />
                                                    Draft Saved Locally
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm space-y-2">
                                                    <p className="text-blue-700 dark:text-blue-300">
                                                        Your draft is saved in your browser's local storage.
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Note: Drafts will be lost if you clear browser data.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleDeleteDraft}
                                                        className="w-full mt-2"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-2" />
                                                        Delete Draft
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Tips */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-semibold">Helpful Tips</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Provide complete and accurate information</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Upload clear copies of required documents</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Plan ahead for processing time</span>
                                                </li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation Footer */}
                    {isMobile && (
                        <div className={`fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${
                            isButtonsVisible 
                                ? "translate-y-0 opacity-100" 
                                : "translate-y-full opacity-0"
                        }`}>
                            <div className="flex items-center justify-between gap-3">
                                {activeStep > 1 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={prevStep}
                                    >
                                        Back
                                    </Button>
                                ) : (
                                    <Link href="/resident/clearances" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                )}
                                
                                {activeStep < 4 ? (
                                    <Button
                                        type="button"
                                        className="flex-1"
                                        onClick={nextStep}
                                        disabled={
                                            (activeStep === 1 && !data.clearance_type_id) ||
                                            (activeStep === 2 && (!data.purpose && !isCustomPurpose)) ||
                                            (activeStep === 3 && requiresDocuments && documentRequirements.requiredCount > 0 && !documentRequirements.met)
                                        }
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button 
                                        type="button"
                                        className="flex-1" 
                                        onClick={handleSubmit}
                                        disabled={processing || !isFormValid()}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Request'
                                        )}
                                    </Button>
                                )}
                            </div>
                            {activeStep === 4 && (
                                <div className="text-center mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {isFormValid() 
                                            ? 'Ready to submit your clearance request'
                                            : 'Please complete all required fields'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pt-6 border-t dark:border-gray-800 z-30">
                            <div className="px-6 pb-6">
                                <div className="flex items-center justify-between max-w-4xl mx-auto">
                                    <div className="flex items-center gap-4">
                                        {activeStep > 1 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={prevStep}
                                                className="gap-2 px-6"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        ) : (
                                            <Link href="/resident/clearances">
                                                <Button type="button" variant="outline" className="px-6">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleSaveDraft}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Draft
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {activeStep < 4 ? (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="gap-2 px-6"
                                                disabled={
                                                    (activeStep === 1 && !data.clearance_type_id) ||
                                                    (activeStep === 2 && (!data.purpose && !isCustomPurpose)) ||
                                                    (activeStep === 3 && requiresDocuments && documentRequirements.requiredCount > 0 && !documentRequirements.met)
                                                }
                                            >
                                                Next Step
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button 
                                                type="button"
                                                size="lg" 
                                                className="px-8 gap-2"
                                                onClick={handleSubmit}
                                                disabled={processing || !isFormValid()}
                                            >
                                                <Send className="h-4 w-4" />
                                                {processing ? 'Submitting...' : 'Submit Request'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </ResidentLayout>
    );
}