import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft,
    FileText,
    Calendar,
    DollarSign,
    Clock,
    AlertCircle,
    Upload,
    CheckCircle,
    Loader2,
    Search,
    User,
    Trash2,
    FileCheck,
    FileWarning,
    ImageIcon,
    FileIcon,
    CheckSquare,
    Square,
    Menu,
    X,
    Smartphone,
    Check,
    ShieldCheck,
    Receipt
} from 'lucide-react';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

// Interfaces
interface DocumentType {
    id: number;
    name: string;
    description: string | null;
    is_required: boolean;
    sort_order: number;
    is_active: boolean;
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number | null;
    description: string | null;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    document_types?: DocumentType[];
    purpose_options: string | null;
}

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    full_name: string;
    address: string;
    contact_number: string;
    purok_name?: string;
    household_id?: number;
}

interface UploadedFile {
    file: File;
    document_type_id: number;
    document_type_name: string;
    previewUrl?: string;
    is_valid: boolean;
    validation_errors: string[];
    is_required: boolean;
    description?: string;
    fulfilledRequirementId?: number;
}

interface PageProps {
    clearanceTypes: ClearanceType[];
    resident: Resident;
    householdMembers?: Resident[];
    errors?: any;
}

// Helper functions
const formatCurrency = (amount: any): string => {
    if (typeof amount === 'number') {
        return `₱${amount.toFixed(2)}`;
    }
    const num = parseFloat(amount);
    return `₱${isNaN(num) ? '0.00' : num.toFixed(2)}`;
};

const getFeeAsNumber = (fee: any): number => {
    if (typeof fee === 'number') {
        return fee;
    }
    const num = parseFloat(fee);
    return isNaN(num) ? 0 : num;
};

const parsePurposeOptions = (options: any): string[] => {
    if (!options) {
        return ['Employment', 'Business Registration', 'School Requirement', 'Government Transaction', 'Bank Loan', 'Other Purpose'];
    }
    
    if (typeof options === 'string') {
        if (options.includes(',')) {
            return options.split(',').map(opt => opt.trim());
        }
        return [options];
    }
    
    if (Array.isArray(options)) {
        return options;
    }
    
    return ['Employment', 'Business Registration', 'School Requirement', 'Government Transaction', 'Bank Loan', 'Other Purpose'];
};

const validateFile = (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        errors.push(`File size exceeds maximum of 5MB`);
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const acceptedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    if (!acceptedExtensions.includes(fileExtension)) {
        errors.push(`File type not accepted. Allowed: PDF, JPG, JPEG, PNG, DOC, DOCX`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

const getAcceptedFileTypes = (): string => {
    return '.pdf,.jpg,.jpeg,.png,.doc,.docx';
};

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
    } else if (['pdf'].includes(extension || '')) {
        return <FileText className="h-4 w-4 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
    return <FileIcon className="h-4 w-4 text-gray-500" />;
};

export default function RequestClearance() {
    const { props } = usePage<PageProps>();
    const { clearanceTypes, resident, householdMembers = [], errors } = props;
    
    // Use Inertia's useForm hook
    const { data, setData, post, processing, errors: formErrors, reset } = useForm({
        clearance_type_id: '',
        purpose: '',
        specific_purpose: '',
        urgency: 'normal',
        needed_date: new Date().toISOString().split('T')[0],
        additional_requirements: '',
        resident_id: resident.id.toString(),
        documents: [] as any[],
    });
    
    const [selectedClearanceType, setSelectedClearanceType] = useState<ClearanceType | null>(null);
    const [urgency, setUrgency] = useState('normal');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [purposeOptions, setPurposeOptions] = useState<string[]>([]);
    const [selectedResident, setSelectedResident] = useState<Resident>(resident);
    const [showResidentSearch, setShowResidentSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Resident[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [requiredDocuments, setRequiredDocuments] = useState<DocumentType[]>([]);
    const [optionalDocuments, setOptionalDocuments] = useState<DocumentType[]>([]);
    const [allDocumentTypes, setAllDocumentTypes] = useState<DocumentType[]>([]);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'summary'>('form');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update document types when clearance type changes
    useEffect(() => {
        if (selectedClearanceType?.document_types) {
            const documentTypes = selectedClearanceType.document_types;
            
            const required = documentTypes.filter(doc => doc.is_required === true);
            const optional = documentTypes.filter(doc => doc.is_required === false);
            
            required.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            optional.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            
            setRequiredDocuments(required);
            setOptionalDocuments(optional);
            setAllDocumentTypes([...required, ...optional]);
            
            // Update uploaded files to mark fulfilled requirements
            setUploadedFiles(prev => prev.map(file => {
                const fulfillsRequirement = required.find(req => req.id === file.document_type_id) || 
                                          optional.find(req => req.id === file.document_type_id);
                
                return {
                    ...file,
                    fulfilledRequirementId: fulfillsRequirement?.id
                };
            }));
        } else {
            setRequiredDocuments([]);
            setOptionalDocuments([]);
            setAllDocumentTypes([]);
        }
    }, [selectedClearanceType]);

    // Update purpose options when clearance type changes
    useEffect(() => {
        if (selectedClearanceType) {
            const options = parsePurposeOptions(selectedClearanceType.purpose_options);
            setPurposeOptions(options);
            
            if (!data.purpose && options.length > 0) {
                setData('purpose', options[0]);
            }
        } else {
            setPurposeOptions(['Employment', 'Business Registration', 'School Requirement', 'Government Transaction', 'Bank Loan', 'Other Purpose']);
        }
    }, [selectedClearanceType, data.purpose]);

    // Set default resident
    useEffect(() => {
        setSelectedResident(resident);
        setData('resident_id', resident.id.toString());
    }, [resident]);

    // Update urgency in form data
    useEffect(() => {
        setData('urgency', urgency);
    }, [urgency]);

    // Handle clearance type selection
    const handleSelectClearanceType = (typeId: string) => {
        const type = clearanceTypes.find(t => t.id.toString() === typeId);
        setSelectedClearanceType(type || null);
        setData('clearance_type_id', typeId);
        
        setUploadedFiles(prev => {
            if (!type?.document_types) return prev;
            
            return prev.map(file => {
                const fulfillsRequirement = type.document_types?.find(req => req.id === file.document_type_id);
                return {
                    ...file,
                    fulfilledRequirementId: fulfillsRequirement?.id
                };
            });
        });
    };

    // Handle file upload via button
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => {
                const unfulfilledRequired = requiredDocuments.filter(req => 
                    !uploadedFiles.some(f => f.fulfilledRequirementId === req.id)
                );
                
                const defaultDocType = unfulfilledRequired.length > 0 
                    ? unfulfilledRequired[0] 
                    : requiredDocuments.length > 0 
                    ? requiredDocuments[0] 
                    : optionalDocuments.length > 0 
                    ? optionalDocuments[0] 
                    : { id: 0, name: 'Additional Document', is_required: false } as DocumentType;
                
                const validation = validateFile(file);
                
                return {
                    file,
                    document_type_id: defaultDocType.id,
                    document_type_name: defaultDocType.name,
                    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                    is_valid: validation.isValid,
                    validation_errors: validation.errors,
                    is_required: defaultDocType.is_required || false,
                    description: '',
                    fulfilledRequirementId: defaultDocType.id > 0 ? defaultDocType.id : undefined
                };
            });
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle drag and drop
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).map(file => {
                const unfulfilledRequired = requiredDocuments.filter(req => 
                    !uploadedFiles.some(f => f.fulfilledRequirementId === req.id)
                );
                
                const defaultDocType = unfulfilledRequired.length > 0 
                    ? unfulfilledRequired[0] 
                    : requiredDocuments.length > 0 
                    ? requiredDocuments[0] 
                    : optionalDocuments.length > 0 
                    ? optionalDocuments[0] 
                    : { id: 0, name: 'Additional Document', is_required: false } as DocumentType;
                
                const validation = validateFile(file);
                
                return {
                    file,
                    document_type_id: defaultDocType.id,
                    document_type_name: defaultDocType.name,
                    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                    is_valid: validation.isValid,
                    validation_errors: validation.errors,
                    is_required: defaultDocType.is_required || false,
                    description: '',
                    fulfilledRequirementId: defaultDocType.id > 0 ? defaultDocType.id : undefined
                };
            });
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    };

    // Remove file
    const removeFile = (index: number) => {
        if (uploadedFiles[index].previewUrl) {
            URL.revokeObjectURL(uploadedFiles[index].previewUrl!);
        }
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Update file document type
    const updateFileDocumentType = (index: number, documentTypeId: number) => {
        const docType = allDocumentTypes.find(dt => dt.id === documentTypeId) || 
                       { id: documentTypeId, name: 'Additional Document', is_required: false } as DocumentType;
        
        const file = uploadedFiles[index].file;
        const validation = validateFile(file);
        
        setUploadedFiles(prev => {
            const updated = [...prev];
            updated[index] = { 
                ...updated[index], 
                document_type_id: documentTypeId,
                document_type_name: docType.name,
                is_valid: validation.isValid,
                validation_errors: validation.errors,
                is_required: docType.is_required || false,
                fulfilledRequirementId: docType.id > 0 ? docType.id : undefined
            };
            return updated;
        });
    };

    // Update file description
    const updateFileDescription = (index: number, description: string) => {
        setUploadedFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], description };
            return updated;
        });
    };

    // Handle resident search
    const handleResidentSearch = () => {
        if (searchTerm.trim()) {
            const allMembers = [resident, ...householdMembers];
            const results = allMembers.filter(member => 
                member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.contact_number.includes(searchTerm) ||
                member.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results.filter(member => member.id !== resident.id));
        } else {
            setSearchResults([]);
        }
    };

    // Handle resident selection
    const handleSelectResident = (resident: Resident) => {
        setSelectedResident(resident);
        setData('resident_id', resident.id.toString());
        setShowResidentSearch(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    // Calculate total fee
    const calculateTotal = () => {
        if (!selectedClearanceType) return 0;
        const baseFee = getFeeAsNumber(selectedClearanceType.fee);
        let urgencyMultiplier = 1;
        if (urgency === 'rush') urgencyMultiplier = 1.5;
        if (urgency === 'express') urgencyMultiplier = 2;
        return baseFee * urgencyMultiplier;
    };

    // Calculate processing time
    const getProcessingTime = () => {
        if (!selectedClearanceType) return '';
        const baseDays = selectedClearanceType.processing_days;
        if (urgency === 'rush') {
            return Math.ceil(baseDays * 0.5) + ' days';
        } else if (urgency === 'express') {
            return '1 day';
        }
        return baseDays + ' days';
    };

    // Check if all required documents are uploaded
    const checkRequiredDocumentsUploaded = () => {
        if (requiredDocuments.length === 0) return true;
        
        const uploadedDocumentTypeIds = uploadedFiles.map(file => file.document_type_id);
        return requiredDocuments.every(doc => uploadedDocumentTypeIds.includes(doc.id));
    };

    // Check which requirements are fulfilled
    const getRequirementStatus = (requirement: DocumentType) => {
        const uploadedFilesForRequirement = uploadedFiles.filter(file => 
            file.document_type_id === requirement.id || file.fulfilledRequirementId === requirement.id
        );
        
        if (uploadedFilesForRequirement.length === 0) {
            return { fulfilled: false, files: [] };
        }
        
        return { 
            fulfilled: true, 
            files: uploadedFilesForRequirement,
            allValid: uploadedFilesForRequirement.every(f => f.is_valid)
        };
    };

    // Get files that fulfill a specific requirement
    const getFilesForRequirement = (requirementId: number) => {
        return uploadedFiles.filter(file => 
            file.document_type_id === requirementId || file.fulfilledRequirementId === requirementId
        );
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            uploadedFiles.forEach(file => {
                if (file.previewUrl) {
                    URL.revokeObjectURL(file.previewUrl);
                }
            });
        };
    }, [uploadedFiles]);

    const urgencyOptions = [
        { id: 'normal', name: 'Normal Processing', time: 'Standard processing time', fee: 'No additional fee' },
        { id: 'rush', name: 'Rush Processing', time: '50% faster processing', fee: '+50% additional fee' },
        { id: 'express', name: 'Express Processing', time: 'Next day processing', fee: '+100% additional fee' },
    ];

    // Form sections for mobile navigation
    const formSections = [
        { id: 'applicant', title: 'Applicant Info', icon: <User className="h-4 w-4" /> },
        { id: 'clearance', title: 'Clearance Type', icon: <FileText className="h-4 w-4" /> },
        { id: 'purpose', title: 'Purpose & Details', icon: <Calendar className="h-4 w-4" /> },
        { id: 'processing', title: 'Processing', icon: <Clock className="h-4 w-4" /> },
        { id: 'documents', title: 'Documents', icon: <Upload className="h-4 w-4" /> },
    ];

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Function to check if a file fulfills any requirement
    const getFileFulfillmentStatus = (file: UploadedFile) => {
        if (file.fulfilledRequirementId) {
            const requirement = allDocumentTypes.find(doc => doc.id === file.fulfilledRequirementId);
            return {
                fulfills: true,
                requirementName: requirement?.name || 'Requirement',
                isRequired: requirement?.is_required || false
            };
        }
        return { fulfills: false, requirementName: '', isRequired: false };
    };

    // Handle form submission - SIMPLIFIED
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!data.clearance_type_id) {
            alert('Please select a clearance type.');
            return;
        }

        if (uploadedFiles.length === 0) {
            alert('Please upload at least one document.');
            return;
        }

        if (!data.purpose || !data.specific_purpose || !data.needed_date) {
            alert('Please fill in all required fields.');
            return;
        }

        // Check for invalid files
        const invalidFiles = uploadedFiles.filter(file => !file.is_valid);
        if (invalidFiles.length > 0) {
            alert('Please fix invalid files before submitting.');
            return;
        }

        // Prepare FormData
        const formData = new FormData();
        
        // Basic form fields
        formData.append('clearance_type_id', data.clearance_type_id);
        formData.append('purpose', data.purpose);
        formData.append('specific_purpose', data.specific_purpose);
        formData.append('needed_date', data.needed_date);
        formData.append('resident_id', data.resident_id);
        formData.append('urgency', data.urgency);
        
        if (data.additional_requirements) {
            formData.append('additional_requirements', data.additional_requirements);
        }
        
        // Add files with simple structure - documents[0], documents[1], etc.
        uploadedFiles.forEach((item, index) => {
            formData.append(`documents[${index}]`, item.file);
            if (item.description) {
                formData.append(`descriptions[${index}]`, item.description);
            }
            if (item.document_type_id) {
                formData.append(`document_types[${index}]`, item.document_type_id.toString());
            }
        });

        // Submit
        post('/my-clearances/store', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reset form on success
                setUploadedFiles([]);
                setSelectedClearanceType(null);
                setSelectedResident(resident);
                setUrgency('normal');
                setSearchTerm('');
                setSearchResults([]);
                setShowResidentSearch(false);
                
                // Clean up object URLs
                uploadedFiles.forEach(file => {
                    if (file.previewUrl) {
                        URL.revokeObjectURL(file.previewUrl);
                    }
                });
                
                // Reset form data
                reset();
                setData({
                    clearance_type_id: '',
                    purpose: '',
                    specific_purpose: '',
                    urgency: 'normal',
                    needed_date: new Date().toISOString().split('T')[0],
                    additional_requirements: '',
                    resident_id: resident.id.toString(),
                    documents: [] as any[],
                });
                
                // Show success message
                alert('Clearance request submitted successfully!');
                
                // Redirect to clearances page
                router.visit('/resident/clearances');
            },
            onError: (errors) => {
                console.log('Form submission errors:', errors);
                alert('Please check your form and try again.');
            }
        });
    };

    // Check if form is valid for submission - SIMPLIFIED
    const isFormValid = () => {
        return data.clearance_type_id && 
               uploadedFiles.length > 0 &&
               data.purpose &&
               data.specific_purpose &&
               data.needed_date;
    };

    // Main form content
    const renderFormContent = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {Object.keys(formErrors).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside">
                            {Object.entries(formErrors).map(([key, value]) => (
                                <li key={key}>{value as string}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Applicant Information */}
            <Card id="applicant">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Applicant Information
                    </CardTitle>
                    <CardDescription>
                        Information about the person requesting clearance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="text-sm text-gray-500">
                            Logged in as: <span className="font-medium">{resident.full_name}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedResident(resident);
                                setData('resident_id', resident.id.toString());
                                setSearchTerm('');
                                setSearchResults([]);
                            }}
                            type="button"
                            className="w-full sm:w-auto"
                        >
                            Reset to Me
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <Label>Select Resident</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResidentSearch(!showResidentSearch)}
                                type="button"
                                className="w-full sm:w-auto"
                            >
                                {showResidentSearch ? 'Cancel Search' : 'Select Different Resident'}
                            </Button>
                        </div>

                        {!showResidentSearch ? (
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <div className="w-full">
                                        <div className="font-medium">{selectedResident.full_name}</div>
                                        <div className="text-sm text-gray-500">
                                            ID: {selectedResident.id} • {selectedResident.contact_number}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedResident.id === resident.id ? '(You)' : 'Household Member'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-gray-500">Address</div>
                                        <div className="font-medium">{selectedResident.address}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Purok</div>
                                        <div className="font-medium">{selectedResident.purok_name || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input
                                        placeholder="Search household members..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleResidentSearch())}
                                        className="w-full"
                                    />
                                    <Button variant="outline" size="sm" onClick={handleResidentSearch} className="w-full sm:w-auto">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="border rounded-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                                    <div
                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg cursor-pointer border border-blue-100 bg-blue-50"
                                        onClick={() => {
                                            setSelectedResident(resident);
                                            setData('resident_id', resident.id.toString());
                                            setShowResidentSearch(false);
                                        }}
                                    >
                                        <div className="font-medium flex items-center gap-2">
                                            {resident.full_name}
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {resident.address} • {resident.contact_number}
                                        </div>
                                    </div>

                                    {householdMembers
                                        .filter(member => member.id !== resident.id)
                                        .map(member => (
                                            <div
                                                key={member.id}
                                                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg cursor-pointer border"
                                                onClick={() => handleSelectResident(member)}
                                            >
                                                <div className="font-medium">{member.full_name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {member.address} • {member.contact_number}
                                                </div>
                                            </div>
                                        ))}

                                    {searchResults.length > 0 && (
                                        <>
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide pt-2">
                                                Search Results
                                            </div>
                                            {searchResults.map(member => (
                                                <div
                                                    key={member.id}
                                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg cursor-pointer border border-amber-100 bg-amber-50"
                                                    onClick={() => handleSelectResident(member)}
                                                >
                                                    <div className="font-medium">{member.full_name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {member.address} • {member.contact_number}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {householdMembers.length === 0 && (
                                        <div className="text-center py-4 text-gray-500">
                                            No other household members found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Clearance Type Selection */}
            <Card id="clearance">
                <CardHeader>
                    <CardTitle>Select Clearance Type</CardTitle>
                    <CardDescription>
                        Choose the type of clearance or certificate you need
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {clearanceTypes.map((type) => (
                            <div
                                key={type.id}
                                className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                                    data.clearance_type_id === type.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => handleSelectClearanceType(type.id.toString())}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-4 w-4 rounded-full border ${
                                        data.clearance_type_id === type.id.toString() ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                    }`}>
                                        {data.clearance_type_id === type.id.toString() && (
                                            <div className="h-2 w-2 rounded-full bg-white m-auto mt-1"></div>
                                        )}
                                    </div>
                                    <div className="font-bold text-sm sm:text-base">{type.name}</div>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{type.description || 'No description available'}</div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1">
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Fee: {formatCurrency(type.fee)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {type.processing_days} days
                                    </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Valid for: {type.validity_days || 'N/A'} days
                                </div>
                                {type.document_types && type.document_types.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Requires {type.document_types.filter(d => d.is_required).length} document(s)
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Purpose & Details */}
            <Card id="purpose">
                <CardHeader>
                    <CardTitle>Purpose & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="purpose">
                            Purpose of Clearance <span className="text-rose-500">*</span>
                        </Label>
                        <Select
                            value={data.purpose}
                            onValueChange={value => setData('purpose', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                                {purposeOptions.map((purpose, index) => (
                                    <SelectItem key={index} value={purpose}>
                                        {purpose}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.purpose && (
                            <p className="text-sm text-rose-600">{formErrors.purpose}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specific_purpose">
                            Specific Purpose Details <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea 
                            id="specific_purpose" 
                            value={data.specific_purpose}
                            onChange={e => setData('specific_purpose', e.target.value)}
                            placeholder="Provide specific details about why you need this clearance..."
                            rows={3}
                            className="min-h-[100px]"
                            required
                        />
                        {formErrors.specific_purpose && (
                            <p className="text-sm text-rose-600">{formErrors.specific_purpose}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="additional_requirements">Additional Requirements (Optional)</Label>
                        <Textarea 
                            id="additional_requirements" 
                            value={data.additional_requirements}
                            onChange={e => setData('additional_requirements', e.target.value)}
                            placeholder="List any additional requirements or documents needed..."
                            rows={2}
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="needed_date">
                            Date Needed <span className="text-rose-500">*</span>
                        </Label>
                        <Input 
                            id="needed_date" 
                            type="date"
                            value={data.needed_date}
                            onChange={e => setData('needed_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full"
                        />
                        {formErrors.needed_date && (
                            <p className="text-sm text-rose-600">{formErrors.needed_date}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Processing Options */}
            <Card id="processing">
                <CardHeader>
                    <CardTitle>Processing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {urgencyOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`border rounded-lg p-3 sm:p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                                    urgency === option.id ? 'border-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => setUrgency(option.id)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-4 w-4 rounded-full border ${
                                            urgency === option.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                        }`}>
                                            {urgency === option.id && (
                                                <div className="h-2 w-2 rounded-full bg-white m-auto mt-1"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm sm:text-base">{option.name}</div>
                                            <div className="text-xs sm:text-sm text-gray-500">{option.time}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium">{option.fee}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Document Requirements Display */}
            <Card id="documents">
                <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>
                        Review the documents required for this clearance type
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Required Documents List */}
                    {requiredDocuments.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <Label className="text-lg">Required Documents ({requiredDocuments.length})</Label>
                                <div className="text-sm text-gray-500">
                                    {requiredDocuments.filter(req => getRequirementStatus(req).fulfilled).length} of {requiredDocuments.length} fulfilled
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {requiredDocuments.map((requirement) => {
                                    const status = getRequirementStatus(requirement);
                                    
                                    return (
                                        <div key={requirement.id} className={`border rounded-lg p-3 sm:p-4 ${status.fulfilled ? (status.allValid ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50') : 'border-amber-200 bg-amber-50'}`}>
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`h-5 w-5 rounded-full ${status.fulfilled ? (status.allValid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600') : 'bg-amber-100 text-amber-600'} flex items-center justify-center`}>
                                                            {status.fulfilled ? (
                                                                status.allValid ? (
                                                                    <CheckCircle className="h-3 w-3" />
                                                                ) : (
                                                                    <FileWarning className="h-3 w-3" />
                                                                )
                                                            ) : (
                                                                <FileWarning className="h-3 w-3" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm sm:text-base">{requirement.name}</div>
                                                            {requirement.description && (
                                                                <div className="text-xs sm:text-sm text-gray-600 mt-1">{requirement.description}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Show uploaded files for this requirement */}
                                                    {status.files.length > 0 && (
                                                        <div className="mt-2 space-y-2">
                                                            {status.files.map((file, idx) => (
                                                                <div key={idx} className={`text-xs p-2 rounded ${file.is_valid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                                    <div className="flex items-center gap-1">
                                                                        {getFileIcon(file.file.name)}
                                                                        <span className="truncate">{file.file.name}</span>
                                                                        {!file.is_valid && (
                                                                            <span className="text-rose-600">(Invalid)</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded ${status.fulfilled ? (status.allValid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800') : 'bg-amber-100 text-amber-800'} self-start`}>
                                                    {status.fulfilled ? (status.allValid ? 'Uploaded' : 'Invalid File') : 'Required'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Optional Documents List */}
                    {optionalDocuments.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <Label className="text-lg">Optional Documents ({optionalDocuments.length})</Label>
                                <div className="text-sm text-gray-500">
                                    {optionalDocuments.filter(req => getRequirementStatus(req).fulfilled).length} uploaded
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {optionalDocuments.map((requirement) => {
                                    const status = getRequirementStatus(requirement);
                                    
                                    return (
                                        <div key={requirement.id} className="border rounded-lg p-3 sm:p-4 border-gray-200 bg-gray-50">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-5 w-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                                                            <FileText className="h-3 w-3" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm sm:text-base">{requirement.name}</div>
                                                            {requirement.description && (
                                                                <div className="text-xs sm:text-sm text-gray-600 mt-1">{requirement.description}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Show uploaded files for this requirement */}
                                                    {status.files.length > 0 && (
                                                        <div className="mt-2 space-y-2">
                                                            {status.files.map((file, idx) => (
                                                                <div key={idx} className="text-xs bg-gray-100 text-gray-800 p-2 rounded">
                                                                    <div className="flex items-center gap-1">
                                                                        {getFileIcon(file.file.name)}
                                                                        <span className="truncate">{file.file.name}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded self-start">
                                                    Optional
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* File Upload Area */}
                    <div className="space-y-4">
                        <Label>Upload Documents:</Label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <Upload className={`h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 sm:mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                            <p className="text-sm sm:text-base text-gray-600 mb-2">
                                {isDragging ? 'Drop files here' : 'Drop files here or click to upload'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                                PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
                            </p>
                            <input
                                ref={fileInputRef}
                                id="document-upload"
                                type="file"
                                multiple
                                accept={getAcceptedFileTypes()}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button 
                                variant="outline" 
                                className="mt-2 w-full sm:w-auto"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Select Files
                            </Button>
                        </div>
                        
                        {/* Uploaded Files with Document Type Selection */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <Label>Uploaded Files ({uploadedFiles.length}):</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {uploadedFiles.filter(f => f.is_valid).length} valid
                                        </Badge>
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                            {uploadedFiles.filter(f => f.fulfilledRequirementId).length} fulfilling requirements
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                uploadedFiles.forEach(file => {
                                                    if (file.previewUrl) {
                                                        URL.revokeObjectURL(file.previewUrl);
                                                    }
                                                });
                                                setUploadedFiles([]);
                                            }}
                                            type="button"
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {uploadedFiles.map((item, index) => {
                                        const fulfillmentStatus = getFileFulfillmentStatus(item);
                                        
                                        return (
                                            <div key={index} className={`p-3 sm:p-4 border rounded-lg space-y-3 ${item.is_valid ? 'border-gray-200' : 'border-rose-200 bg-rose-50'}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        {item.previewUrl ? (
                                                            <div className="w-12 h-12 sm:w-16 sm:h-16 border rounded overflow-hidden flex-shrink-0 relative">
                                                                <img 
                                                                    src={item.previewUrl} 
                                                                    alt={item.file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                {/* Fulfillment indicator on image */}
                                                                {fulfillmentStatus.fulfills && (
                                                                    <div className="absolute -top-1 -right-1">
                                                                        <div className={`h-5 w-5 rounded-full ${fulfillmentStatus.isRequired ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center`}>
                                                                            <Check className="h-3 w-3 text-white" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 sm:w-16 sm:h-16 border rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative">
                                                                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                                                {/* Fulfillment indicator on file icon */}
                                                                {fulfillmentStatus.fulfills && (
                                                                    <div className="absolute -top-1 -right-1">
                                                                        <div className={`h-5 w-5 rounded-full ${fulfillmentStatus.isRequired ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center`}>
                                                                            <Check className="h-3 w-3 text-white" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="font-medium text-sm truncate">{item.file.name}</div>
                                                                {/* File fulfillment badge */}
                                                                {fulfillmentStatus.fulfills && (
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className={`text-xs ${fulfillmentStatus.isRequired ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                                                                    >
                                                                        {fulfillmentStatus.isRequired ? 'Fulfills Required' : 'Fulfills Optional'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                                            </div>
                                                            {fulfillmentStatus.fulfills && (
                                                                <div className="text-xs text-gray-600 mt-1">
                                                                    Fulfills: <span className="font-medium">{fulfillmentStatus.requirementName}</span>
                                                                </div>
                                                            )}
                                                            {!item.is_valid && (
                                                                <div className="text-xs text-rose-600 mt-1">
                                                                    {item.validation_errors.map((error, idx) => (
                                                                        <div key={idx}>• {error}</div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(index)}
                                                        type="button"
                                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex-shrink-0 ml-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                
                                                {/* Document Type Selection - Stack on mobile */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`document-type-${index}`} className="text-xs">
                                                            Document Type
                                                        </Label>
                                                        <Select
                                                            value={item.document_type_id.toString()}
                                                            onValueChange={(value) => updateFileDocumentType(index, parseInt(value))}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select document type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {allDocumentTypes.map((docType) => {
                                                                    // Check if this requirement is already fulfilled by another file
                                                                    const isAlreadyFulfilled = docType.is_required && 
                                                                        uploadedFiles.some((f, i) => 
                                                                            i !== index && 
                                                                            f.fulfilledRequirementId === docType.id
                                                                        );
                                                                    
                                                                    return (
                                                                        <SelectItem 
                                                                            key={docType.id} 
                                                                            value={docType.id.toString()}
                                                                            className={isAlreadyFulfilled ? 'bg-green-50 text-green-700' : ''}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                {docType.name} 
                                                                                {docType.is_required ? '(Required)' : '(Optional)'}
                                                                                {isAlreadyFulfilled && (
                                                                                    <Check className="h-3 w-3 text-green-600" />
                                                                                )}
                                                                            </div>
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`desc-${index}`} className="text-xs">
                                                            Description (Optional)
                                                        </Label>
                                                        <Input
                                                            id={`desc-${index}`}
                                                            value={item.description || ''}
                                                            onChange={(e) => updateFileDescription(index, e.target.value)}
                                                            placeholder="e.g., Front side, Back side"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Validation message for required documents */}
                    {selectedClearanceType && requiredDocuments.length > 0 && !checkRequiredDocumentsUploaded() && (
                        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-800">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Missing Required Documents</AlertTitle>
                            <AlertDescription>
                                You need to upload all required documents. See the list above.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </form>
    );

    // Summary sidebar content
    const renderSummaryContent = () => (
        <div className="space-y-6">
            {/* Request Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Clearance Type:</span>
                            <span className="font-medium text-sm">{selectedClearanceType?.name || 'None selected'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Base Fee:</span>
                            <span className="font-medium text-sm">
                                {selectedClearanceType ? formatCurrency(selectedClearanceType.fee) : '₱0.00'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Processing:</span>
                            <span className="font-medium text-sm">
                                {urgencyOptions.find(o => o.id === urgency)?.name}
                            </span>
                        </div>
                        {urgency !== 'normal' && selectedClearanceType && (
                            <div className="flex items-center justify-between text-amber-600 text-sm">
                                <span>Processing Fee:</span>
                                <span className="font-medium">
                                    {urgency === 'rush' && `+${formatCurrency(getFeeAsNumber(selectedClearanceType.fee) * 0.5)}`}
                                    {urgency === 'express' && `+${formatCurrency(getFeeAsNumber(selectedClearanceType.fee))}`}
                                </span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between text-base font-bold">
                            <span>Total Amount:</span>
                            <span>{formatCurrency(calculateTotal())}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Estimated Processing:</span>
                            <span className="font-medium">
                                {getProcessingTime()}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Document Requirements Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Document Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    {(requiredDocuments.length === 0 && optionalDocuments.length === 0) ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            {selectedClearanceType ? 'No specific document requirements' : 'Select a clearance type first'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Required Documents Summary */}
                            {requiredDocuments.length > 0 && (
                                <>
                                    <div className="text-sm font-medium text-gray-700">Required Documents:</div>
                                    {requiredDocuments.map((requirement) => {
                                        const status = getRequirementStatus(requirement);
                                        const filesForReq = getFilesForRequirement(requirement.id);
                                        
                                        return (
                                            <div key={requirement.id} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {status.fulfilled ? (
                                                            status.allValid ? (
                                                                <CheckSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                            ) : (
                                                                <FileWarning className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                                            )
                                                        ) : (
                                                            <Square className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                                        )}
                                                        <span className="truncate">{requirement.name}</span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${status.fulfilled ? (status.allValid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800') : 'bg-gray-100 text-gray-800'}`}>
                                                        {status.fulfilled ? (status.allValid ? '✓' : '⚠') : '✗'}
                                                    </span>
                                                </div>
                                                {/* Show files fulfilling this requirement */}
                                                {filesForReq.length > 0 && (
                                                    <div className="ml-6 space-y-1">
                                                        {filesForReq.map((file, idx) => (
                                                            <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                                <span className="truncate">{file.file.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                            
                            {/* Optional Documents Summary */}
                            {optionalDocuments.length > 0 && (
                                <>
                                    <div className="text-sm font-medium text-gray-700 mt-3">Optional Documents:</div>
                                    {optionalDocuments.map((requirement) => {
                                        const status = getRequirementStatus(requirement);
                                        const filesForReq = getFilesForRequirement(requirement.id);
                                        
                                        return (
                                            <div key={requirement.id} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {status.fulfilled ? (
                                                            <CheckSquare className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                        ) : (
                                                            <Square className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                                        )}
                                                        <span className="truncate">{requirement.name}</span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${status.fulfilled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {status.fulfilled ? '✓' : '○'}
                                                    </span>
                                                </div>
                                                {/* Show files fulfilling this requirement */}
                                                {filesForReq.length > 0 && (
                                                    <div className="ml-6 space-y-1">
                                                        {filesForReq.map((file, idx) => (
                                                            <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                                <span className="truncate">{file.file.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {uploadedFiles.filter(f => f.is_valid).length} of {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} valid
                        </div>
                        {requiredDocuments.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <FileCheck className="h-3 w-3" />
                                {requiredDocuments.filter(req => getRequirementStatus(req).fulfilled).length} of {requiredDocuments.length} required documents fulfilled
                            </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                            <Check className="h-3 w-3" />
                            {uploadedFiles.filter(f => f.fulfilledRequirementId).length} files fulfilling requirements
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Applicant Information Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <div className="text-xs text-gray-500">Name</div>
                        <div className="font-medium text-sm">{selectedResident.full_name}</div>
                        {selectedResident.id === resident.id && (
                            <div className="text-xs text-blue-600">(Logged-in user)</div>
                        )}
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Address</div>
                        <div className="font-medium text-sm">{selectedResident.address}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Contact</div>
                        <div className="font-medium text-sm">{selectedResident.contact_number}</div>
                    </div>
                    {selectedResident.purok_name && (
                        <div>
                            <div className="text-xs text-gray-500">Purok</div>
                            <div className="font-medium text-sm">{selectedResident.purok_name}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Important Notes</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Review document requirements before uploading</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Assign each uploaded file to the correct document type</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>File size limit: 5MB per document</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Accepted formats: PDF, JPG, PNG, DOC, DOCX</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Files with green checkmarks are fulfilling requirements</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button Section */}
            <div className="sticky bottom-6 z-10 lg:relative lg:sticky lg:top-6">
                <Card>
                    <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-3">
                            {/* Submit Button */}
                            <Button 
                                onClick={handleSubmit}
                                disabled={processing || !isFormValid()}
                                className="w-full"
                                type="submit"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Submit Clearance Request
                                    </>
                                )}
                            </Button>
                            
                            {/* Cancel Button */}
                            <Link href="/resident/clearances">
                                <Button variant="outline" className="w-full" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            
                            {/* Validation Summary */}
                            <div className="text-xs text-gray-500 space-y-1">
                                <div className="flex items-center gap-1">
                                    {selectedClearanceType ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <X className="h-3 w-3 text-rose-500" />
                                    )}
                                    <span>Clearance type selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {uploadedFiles.length > 0 ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <X className="h-3 w-3 text-rose-500" />
                                    )}
                                    <span>Files uploaded</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {uploadedFiles.every(f => f.is_valid) ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <X className="h-3 w-3 text-rose-500" />
                                    )}
                                    <span>All files are valid</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {data.purpose.trim() && data.specific_purpose.trim() && data.needed_date ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <X className="h-3 w-3 text-rose-500" />
                                    )}
                                    <span>All required fields filled</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <ResidentLayout
            title="Request Clearance"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Clearances', href: '/resident/clearances' },
                { title: 'Request Clearance', href: '/resident/clearances/request' }
            ]}
        >
            <div className="space-y-6">
                {/* Header with mobile controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/resident/clearances" className="flex-shrink-0">
                            <Button variant="ghost" size="sm" className="p-2 sm:p-0 sm:px-4">
                                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Back to Clearances</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Request Clearance</h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                Submit a request for barangay clearance or certificate
                            </p>
                        </div>
                    </div>
                    
                    {/* Mobile Navigation Toggle */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="flex-1 flex gap-1 overflow-x-auto pb-1">
                            {formSections.map((section) => (
                                <Button
                                    key={section.id}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs px-2 py-1 flex items-center gap-1"
                                    onClick={() => scrollToSection(section.id)}
                                >
                                    {section.icon}
                                    <span className="hidden xs:inline">{section.title}</span>
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                            className="flex-shrink-0"
                        >
                            {showMobileSidebar ? <X className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                            <span className="ml-1 hidden sm:inline">Summary</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile View - Tabbed Interface */}
                <div className="lg:hidden">
                    <div className="flex border-b mb-4">
                        <button
                            type="button"
                            className={`flex-1 py-3 text-center font-medium ${activeMobileTab === 'form' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveMobileTab('form')}
                        >
                            Form
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-3 text-center font-medium ${activeMobileTab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveMobileTab('summary')}
                        >
                            Summary
                        </button>
                    </div>
                    
                    {activeMobileTab === 'form' ? renderFormContent() : renderSummaryContent()}
                </div>

                {/* Desktop View - Side by Side Layout */}
                <div className="hidden lg:grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Request Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {renderFormContent()}
                    </div>

                    {/* Right Column - Summary & Preview */}
                    <div className="space-y-6">
                        {renderSummaryContent()}
                    </div>
                </div>
            </div>
        </ResidentLayout>
    );
}