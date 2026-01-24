import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
    Upload,
    FileX2,
    ChevronUp,
    X,
    MapPin,
    Calendar,
    Clock,
    Info,
    CheckCircle,
    Phone,
    ShieldAlert,
    FileText,
    AlertTriangle,
    FileWarning,
    ArrowRight,
    ChevronRight,
    Check,
    Search,
    Filter
} from 'lucide-react';
import { Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import { toast } from 'sonner';

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

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && clearanceTypes.length > 8) {
                setShowSearch(true);
            }
            return mobile;
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, [clearanceTypes.length]);

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

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (!data.clearance_type_id) {
            toast.error('Please select a clearance type.');
            return;
        }

        const finalPurpose = isCustomPurpose ? data.purpose_custom : data.purpose;
        if (!finalPurpose) {
            toast.error('Please select or enter the purpose of the clearance.');
            return;
        }

        if (!data.needed_date) {
            toast.error('Please select the date needed.');
            return;
        }

        if (documentRequirements.requiredCount > 0 && documentRequirements.missing.length > 0) {
            toast.error(`Please upload and assign the following required documents: ${documentRequirements.missing.join(', ')}`);
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

        router.post('/my-clearances/store', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Clearance request submitted successfully!');
            },
            onError: (errors) => {
                toast.error('Failed to submit request. Please check your information.');
            },
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
        if (activeStep < 4) {
            setActiveStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeStep]);

    const prevStep = useCallback(() => {
        if (activeStep > 1) {
            setActiveStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeStep]);

    // Progress steps for mobile
    const steps = [
        { number: 1, title: 'Type', description: 'Select clearance type' },
        { number: 2, title: 'Purpose', description: 'Add details' },
        { number: 3, title: 'Documents', description: 'Upload files' },
        { number: 4, title: 'Review', description: 'Submit request' },
    ];

    // Get popular clearance types (if available)
    const popularTypes = clearanceTypes.filter(type => 
        type.is_popular || type.name.toLowerCase().includes('barangay') || type.name.toLowerCase().includes('certificate')
    ).slice(0, 4);

    return (
        <ResidentLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Clearances', href: '/resident/clearances' },
                { title: 'Request Clearance', href: '#' }
            ]}
        >
            <div className="space-y-4 md:space-y-6">
                <form id="clearance-request-form" onSubmit={handleSubmit} className="space-y-6">
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
                                        <h1 className="text-lg font-bold truncate">Request Clearance</h1>
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
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">Request Clearance</h1>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            Submit a request for barangay clearance or certificate
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="mb-4 lg:mb-6 mx-4 lg:mx-0">
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

                    <div className="px-4 md:px-6 pb-24 md:pb-6">
                        {/* Step Navigation for Mobile */}
                        {isMobile && (
                            <div className="flex justify-between mb-6 overflow-x-auto py-2">
                                {steps.map((step) => (
                                    <button
                                        key={step.number}
                                        type="button"
                                        className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                                            activeStep === step.number 
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                        onClick={() => setActiveStep(step.number)}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                                            activeStep === step.number 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-200 dark:bg-gray-800'
                                        }`}>
                                            {step.number}
                                        </div>
                                        <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                            {/* Main Form Area */}
                            <div className={`${isMobile ? '' : 'lg:col-span-2 space-y-6'}`}>
                                {/* Step 1: Clearance Type - IMPROVED FOR MANY TYPES */}
                                {(!isMobile || activeStep === 1) && (
                                    <div className="pb-32 lg:pb-0 space-y-6">
                                        <div className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                            1
                                                        </span>
                                                        What type of clearance do you need?
                                                    </h2>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 ml-8">
                                                        Choose the type you need
                                                    </p>
                                                </div>
                                                {isMobile && clearanceTypes.length > 8 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowSearch(!showSearch)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Search bar for mobile with many types */}
                                        {showSearch && isMobile && (
                                            <div className="mb-4">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        ref={searchInputRef}
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

                                        {/* Popular clearance types (for desktop or when many types exist) */}
                                        {!isMobile && popularTypes.length > 0 && clearanceTypes.length > 8 && (
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Popular</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {popularTypes.map((type) => (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                                data.clearance_type_id === type.id.toString()
                                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-500/20'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                                                            }`}
                                                            onClick={() => handleClearanceTypeChange(type.id.toString())}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FileText className={`h-4 w-4 ${data.clearance_type_id === type.id.toString() ? 'text-blue-600' : 'text-gray-600'}`} />
                                                                <span className="font-semibold text-sm truncate">
                                                                    {type.name}
                                                                </span>
                                                            </div>
                                                            {type.formatted_fee && type.formatted_fee !== '₱0.00' && (
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    {type.formatted_fee}
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Clearance type list - SCROLLABLE for many items */}
                                        <div className={`${isMobile && clearanceTypes.length > 6 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
                                            <div className="space-y-3">
                                                {filteredTypes.map((type) => (
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
                                                                    <FileText className={`h-5 w-5 ${data.clearance_type_id === type.id.toString() ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
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
                                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
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
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Stats and helper text */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <div>
                                                    Showing {filteredTypes.length} of {clearanceTypes.length} clearance types
                                                </div>
                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchQuery('')}
                                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        Clear search
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {!data.clearance_type_id && filteredTypes.length > 0 && (
                                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                                        Select a clearance type to continue
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Purpose & Details */}
                                {(!isMobile || activeStep === 2) && (
                                    <div className="pb-32 lg:pb-0 space-y-6">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    2
                                                </span>
                                                Tell us about your purpose
                                            </h2>
                                        </div>
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

                                {/* Step 3: Documents */}
                                {(!isMobile || activeStep === 3) && (
                                    <div className="pb-32 lg:pb-0 space-y-6">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    3
                                                </span>
                                                {requiresDocuments ? 'Upload required documents' : 'Additional documents (optional)'}
                                            </h2>
                                        </div>
                                        {requiresDocuments ? (
                                            <Card className="rounded-xl">
                                                <CardContent className="p-4 lg:p-6 pt-6">
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
                                        ) : (
                                            <Card className="rounded-xl">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                                                            <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-base font-medium">No Documents Required</p>
                                                            <p className="text-sm text-gray-500">Submit your request directly</p>
                                                        </div>
                                                        <FileX2 className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {/* Step 4: Review */}
                                {(!isMobile || activeStep === 4) && (
                                    <div className="pb-32 lg:pb-0 space-y-6">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    4
                                                </span>
                                                Review your request
                                            </h2>
                                        </div>
                                        <div className="space-y-6">
                                            {/* Clearance Summary */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                                                    <span className="font-semibold">{selectedClearance?.name || 'Not selected'}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Purpose</span>
                                                    <span className="font-semibold text-right max-w-[200px] truncate">
                                                        {isCustomPurpose ? data.purpose_custom : availablePurposes.find(p => p.value === data.purpose)?.label || 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Date Needed</span>
                                                    <span className="font-semibold">
                                                        {data.needed_date ? new Date(data.needed_date).toLocaleDateString() : 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Documents</span>
                                                    <span className="font-semibold">{uploadedFiles.length} files</span>
                                                </div>
                                            </div>

                                            {/* Applicant Info */}
                                            <Card className="rounded-xl">
                                                <CardContent className="p-4">
                                                    <h3 className="font-medium mb-3">Applicant Information</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Name</span>
                                                            <span className="font-medium">{resident.first_name} {resident.last_name}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
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
                                    {/* Requirements Status */}
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
                                        detailsProvided={true}
                                        dateSpecified={!!data.needed_date}
                                    />

                                    {/* Document Requirements Card */}
                                    {selectedClearance && selectedClearance.document_types && requiresDocuments && (
                                        <DocumentRequirementsCard
                                            clearanceName={selectedClearance.name}
                                            documentTypes={selectedClearance.document_types}
                                            selectedDocumentTypes={selectedDocumentTypes}
                                            documentRequirements={documentRequirements}
                                        />
                                    )}

                                    {/* Important Notes */}
                                    <ImportantNotes
                                        processingDays={selectedClearance?.processing_days}
                                        validityDays={selectedClearance?.validity_days}
                                        requiresApproval={selectedClearance?.requires_approval}
                                        requiresDocuments={requiresDocuments}
                                        requiredCount={documentRequirements.requiredCount}
                                    />
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
                                        disabled={activeStep === 1 && !data.clearance_type_id}
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button 
                                        type="submit" 
                                        className="flex-1" 
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

                    {/* Desktop Submit Section */}
                    {!isMobile && (
                        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pt-6 border-t dark:border-gray-800">
                            <div className="px-6 pb-6">
                                <div className="flex items-center justify-between max-w-4xl mx-auto">
                                    <Link href="/resident/clearances">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            type="submit" 
                                            size="lg" 
                                            className="px-8"
                                            disabled={processing || !isFormValid()}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Clearance Request'
                                            )}
                                        </Button>
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