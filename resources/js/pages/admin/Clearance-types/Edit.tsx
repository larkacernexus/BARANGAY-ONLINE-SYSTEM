import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    FileText,
    DollarSign,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Trash2,
    AlertCircle,
    Copy,
    Loader2,
    File,
    Filter,
    Eye
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';

interface EligibilityCriterion {
    field: string;
    operator: string;
    value: string;
}

interface CommonType {
    name: string;
    code: string;
    description: string;
    fee: number;
    processing_days: number;
    validity_days: number;
    requires_payment?: boolean;
}

interface DocumentType {
    id: number;
    name: string;
    code: string;
    description: string;
    category: string;
    is_required: boolean;
    sort_order: number;
    accepted_formats?: string[];
    max_file_size?: number;
    is_active: boolean;
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number;
    processing_days: number;
    validity_days: number;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    purpose_options: string;
    eligibility_criteria: EligibilityCriterion[];
    document_types: DocumentType[];
}

interface PageProps {
    clearanceType: ClearanceType;
    commonTypes?: Record<string, CommonType>;
    documentTypes?: DocumentType[];
    defaultPurposeOptions?: string[];
    eligibilityOperators?: Array<{ value: string; label: string }>;
}

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
    const num = Number(value);
    return isNaN(num) ? '₱0.00' : `₱${num.toFixed(2)}`;
};

// Helper function to safely convert to number
const safeNumber = (value: any, defaultValue = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// Helper function to safely format accepted formats
const formatAcceptedFormats = (formats: any): string => {
    if (!formats) return 'None specified';
    if (Array.isArray(formats)) {
        return formats.length > 0 ? formats.join(', ') : 'None specified';
    }
    if (typeof formats === 'string') {
        return formats.split(',').map(f => f.trim()).filter(f => f).join(', ') || 'None specified';
    }
    return 'None specified';
};

// Helper function to safely format file size
const formatFileSize = (size: any): string => {
    const num = Number(size);
    if (isNaN(num) || num <= 0) return 'Not specified';
    return `${num / 1024} MB`;
};

// Helper function to compare numbers with tolerance
const numbersEqual = (a: number, b: number, tolerance = 0.001): boolean => {
    return Math.abs(a - b) < tolerance;
};

export default function EditClearanceType({ 
    clearanceType: initialClearanceType,
    commonTypes = {}, 
    documentTypes: initialDocumentTypes = [],
    defaultPurposeOptions = [],
    eligibilityOperators = []
}: PageProps) {
    // Add loading state
    if (!initialClearanceType) {
        return (
            <AppLayout
                title="Edit Clearance Type"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Clearance Types', href: '/admin/clearance-types' },
                    { title: 'Edit', href: '#' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading clearance type...</span>
                </div>
            </AppLayout>
        );
    }

    const [selectedCommonType, setSelectedCommonType] = useState<string>('');
    const [purposeOptions, setPurposeOptions] = useState<string[]>(
        initialClearanceType.purpose_options ? 
        initialClearanceType.purpose_options.split(',').map(s => s.trim()).filter(s => s) : 
        defaultPurposeOptions
    );
    const [newPurposeOption, setNewPurposeOption] = useState('');
    const [eligibilityCriteria, setEligibilityCriteria] = useState<EligibilityCriterion[]>(
        Array.isArray(initialClearanceType.eligibility_criteria) ? initialClearanceType.eligibility_criteria : []
    );
    const [showEligibilityForm, setShowEligibilityForm] = useState(false);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<number[]>(
        Array.isArray(initialClearanceType.document_types) 
            ? initialClearanceType.document_types.map(doc => doc.id).filter(id => id) 
            : []
    );
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(
        Array.isArray(initialDocumentTypes) ? initialDocumentTypes : []
    );
    const [documentCategory, setDocumentCategory] = useState<string>('all');
    const [searchDocument, setSearchDocument] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        name: initialClearanceType.name || '',
        code: initialClearanceType.code || '',
        description: initialClearanceType.description || '',
        fee: safeNumber(initialClearanceType.fee, 0),
        processing_days: safeNumber(initialClearanceType.processing_days, 1),
        validity_days: safeNumber(initialClearanceType.validity_days, 30),
        is_active: Boolean(initialClearanceType.is_active),
        requires_payment: Boolean(initialClearanceType.requires_payment),
        requires_approval: Boolean(initialClearanceType.requires_approval || false),
        is_online_only: Boolean(initialClearanceType.is_online_only || false),
        document_type_ids: Array.isArray(initialClearanceType.document_types) 
            ? initialClearanceType.document_types.map(doc => doc.id).filter(id => id) 
            : [],
        eligibility_criteria: Array.isArray(initialClearanceType.eligibility_criteria) 
            ? initialClearanceType.eligibility_criteria 
            : [],
        purpose_options: initialClearanceType.purpose_options || defaultPurposeOptions.join(', '),
    });

    // Auto-select common type based on existing data
    useEffect(() => {
        const findMatchingCommonType = () => {
            if (!initialClearanceType) return 'custom';
            
            // First try exact code match
            const exactCodeMatch = Object.entries(commonTypes || {}).find(([_, type]) => 
                type.code === initialClearanceType.code
            );
            
            if (exactCodeMatch) {
                return exactCodeMatch[0];
            }
            
            // Then try name similarity (case-insensitive, ignoring special characters)
            const normalizedName = (initialClearanceType.name || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');
            for (const [key, type] of Object.entries(commonTypes || {})) {
                const normalizedTypeName = (type.name || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');
                
                // Check if names are similar (contains or contained by)
                if (normalizedName.includes(normalizedTypeName) || 
                    normalizedTypeName.includes(normalizedName)) {
                    
                    // Also check if fees are similar (±10% or exact match for free types)
                    const isFreeType = type.fee === 0 && initialClearanceType.fee === 0;
                    const isSimilarFee = numbersEqual(type.fee, initialClearanceType.fee, type.fee * 0.1);
                    
                    if (isFreeType || isSimilarFee) {
                        return key;
                    }
                }
            }
            
            return 'custom';
        };

        const matchedType = findMatchingCommonType();
        setSelectedCommonType(matchedType);
        
        // If we found a match and the current form data is still at initial state,
        // we should pre-fill with the common type data
        if (matchedType !== 'custom' && commonTypes?.[matchedType]) {
            const commonType = commonTypes[matchedType];
            
            // Only pre-fill if the current data matches the initial data (no user modifications yet)
            const isDataUnchanged = 
                data.name === initialClearanceType.name &&
                data.code === initialClearanceType.code &&
                numbersEqual(data.fee, initialClearanceType.fee) &&
                data.processing_days === initialClearanceType.processing_days &&
                data.validity_days === initialClearanceType.validity_days;
            
            if (isDataUnchanged) {
                setData({
                    ...data,
                    name: commonType.name || '',
                    code: commonType.code || '',
                    description: commonType.description || '',
                    fee: commonType.fee || 0,
                    processing_days: commonType.processing_days || 1,
                    validity_days: commonType.validity_days || 30,
                    requires_payment: commonType.requires_payment !== false,
                });
            }
        }
    }, [initialClearanceType, commonTypes]);

    const handleCommonTypeSelect = (typeKey: string) => {
        setSelectedCommonType(typeKey);
        
        if (typeKey === 'custom') {
            // Reset to original values when selecting custom
            setData({
                ...data,
                name: initialClearanceType.name || '',
                code: initialClearanceType.code || '',
                description: initialClearanceType.description || '',
                fee: safeNumber(initialClearanceType.fee, 0),
                processing_days: safeNumber(initialClearanceType.processing_days, 1),
                validity_days: safeNumber(initialClearanceType.validity_days, 30),
                requires_payment: Boolean(initialClearanceType.requires_payment),
            });
            return;
        }

        const commonType = commonTypes?.[typeKey];
        if (commonType) {
            setData({
                ...data,
                name: commonType.name || '',
                code: commonType.code || '',
                description: commonType.description || '',
                fee: commonType.fee || 0,
                processing_days: commonType.processing_days || 1,
                validity_days: commonType.validity_days || 30,
                requires_payment: commonType.requires_payment !== false,
            });
        }
    };

    const handleDocumentTypeToggle = (documentTypeId: number) => {
        setSelectedDocumentTypes(prev => {
            const updatedSelection = prev.includes(documentTypeId)
                ? prev.filter(id => id !== documentTypeId)
                : [...prev, documentTypeId];
            
            setData('document_type_ids', updatedSelection);
            return updatedSelection;
        });
    };

    const handleAddPurposeOption = () => {
        if (newPurposeOption.trim()) {
            const updatedOptions = [...purposeOptions, newPurposeOption.trim()];
            setPurposeOptions(updatedOptions);
            setData('purpose_options', updatedOptions.join(', '));
            setNewPurposeOption('');
        }
    };

    const handleRemovePurposeOption = (index: number) => {
        const updatedOptions = purposeOptions.filter((_, i) => i !== index);
        setPurposeOptions(updatedOptions);
        setData('purpose_options', updatedOptions.join(', '));
    };

    const handleAddEligibilityCriterion = () => {
        const newCriteria = [
            ...eligibilityCriteria,
            { field: '', operator: 'equals', value: '' }
        ];
        setEligibilityCriteria(newCriteria);
        setData('eligibility_criteria', newCriteria);
    };

    const handleUpdateEligibilityCriterion = (index: number, field: keyof EligibilityCriterion, value: string) => {
        const updatedCriteria = [...eligibilityCriteria];
        updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
        setEligibilityCriteria(updatedCriteria);
        setData('eligibility_criteria', updatedCriteria);
    };

    const handleRemoveEligibilityCriterion = (index: number) => {
        const updatedCriteria = eligibilityCriteria.filter((_, i) => i !== index);
        setEligibilityCriteria(updatedCriteria);
        setData('eligibility_criteria', updatedCriteria);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('clearance-types.update', initialClearanceType.id));
    };

    // Safely filter document types
    const filteredDocumentTypes = (Array.isArray(documentTypes) ? documentTypes : []).filter(doc => {
        const matchesCategory = documentCategory === 'all' || (doc.category || '') === documentCategory;
        const matchesSearch = (doc.name || '').toLowerCase().includes((searchDocument || '').toLowerCase()) ||
                            (doc.description || '').toLowerCase().includes((searchDocument || '').toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Get unique categories from document types safely
    const documentCategories = [
        'all', 
        ...Array.from(new Set((Array.isArray(documentTypes) ? documentTypes : [])
            .map(doc => doc.category)
            .filter(category => category) // Remove undefined/null categories
        ))
    ];

    // Resident fields for eligibility criteria
    const residentFields = [
        { value: 'age', label: 'Age' },
        { value: 'civil_status', label: 'Civil Status' },
        { value: 'educational_attainment', label: 'Educational Attainment' },
        { value: 'occupation', label: 'Occupation' },
        { value: 'monthly_income', label: 'Monthly Income' },
        { value: 'is_registered_voter', label: 'Registered Voter' },
        { value: 'years_in_barangay', label: 'Years in Barangay' },
        { value: 'has_pending_case', label: 'Has Pending Case' },
        { value: 'is_senior_citizen', label: 'Senior Citizen' },
        { value: 'is_pwd', label: 'Person with Disability' },
        { value: 'is_single_parent', label: 'Single Parent' },
        { value: 'is_indigent', label: 'Indigent' },
    ];

    return (
        <AppLayout
            title="Edit Clearance Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearance Types', href: '/admin/clearance-types' },
                { title: `Edit: ${initialClearanceType.name || 'Clearance Type'}`, href: `/admin/clearance-types/${initialClearanceType.id}/edit` }
            ]}
        >
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/clearance-types">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Edit Clearance Type</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update clearance type configuration
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/clearance-types/${initialClearanceType.id}`}>
                                <Button variant="outline" type="button">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                </Button>
                            </Link>
                            <Link href="/admin/clearance-types">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Type
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg bg-rose-50 p-4 dark:bg-rose-900/20">
                            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-medium">Please fix the following errors:</span>
                            </div>
                            <ul className="mt-2 ml-7 list-disc text-sm text-rose-700 dark:text-rose-400">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Basic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Start Templates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Copy className="h-5 w-5" />
                                        Quick Start Templates
                                    </CardTitle>
                                    <CardDescription>
                                        Select a common clearance type or keep custom
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(commonTypes || {}).map(([key, type]) => (
                                            <Button
                                                key={key}
                                                type="button"
                                                variant={selectedCommonType === key ? "default" : "outline"}
                                                className="h-auto py-4 px-3 justify-start text-left"
                                                onClick={() => handleCommonTypeSelect(key)}
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        {type.name || 'Unnamed'}
                                                        {selectedCommonType === key && (
                                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {formatCurrency(type.fee)} • {type.processing_days || 1} day{(type.processing_days || 1) !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            variant={selectedCommonType === 'custom' ? "default" : "outline"}
                                            className="h-auto py-4 px-3 justify-start text-left"
                                            onClick={() => handleCommonTypeSelect('custom')}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    Custom Type
                                                    {selectedCommonType === 'custom' && (
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Configure all settings manually
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                    
                                    {/* Current Selection Info */}
                                    {selectedCommonType && selectedCommonType !== 'custom' && commonTypes?.[selectedCommonType] && (
                                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <div className="flex items-center gap-2 text-emerald-800">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-medium">
                                                    Using template: {commonTypes[selectedCommonType].name || 'Unnamed'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-emerald-700 mt-1">
                                                Form fields have been pre-filled with template values. You can modify them as needed.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Core details of the clearance type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Name <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="e.g., Business Clearance"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-rose-600">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="code">
                                                Code <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={e => setData('code', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                                                placeholder="e.g., BUSINESS_CLEARANCE"
                                                required
                                                disabled // Usually codes shouldn't be changed after creation
                                            />
                                            <p className="text-xs text-gray-500">
                                                Unique identifier (cannot be changed)
                                            </p>
                                            {errors.code && (
                                                <p className="text-sm text-rose-600">{errors.code}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Brief description of this clearance type..."
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-rose-600">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fees & Duration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fees & Duration</CardTitle>
                                    <CardDescription>
                                        Configure processing time and validity period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="fee">
                                                Fee (₱) <span className="text-rose-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="fee"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.fee}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        const numValue = value === '' ? 0 : parseFloat(value);
                                                        setData('fee', isNaN(numValue) ? 0 : numValue);
                                                    }}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                            {errors.fee && (
                                                <p className="text-sm text-rose-600">{errors.fee}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="processing_days">
                                                Processing Days <span className="text-rose-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="processing_days"
                                                    type="number"
                                                    min="1"
                                                    value={data.processing_days}
                                                    onChange={e => setData('processing_days', parseInt(e.target.value) || 1)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                            {errors.processing_days && (
                                                <p className="text-sm text-rose-600">{errors.processing_days}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="validity_days">
                                                Validity (Days) <span className="text-rose-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="validity_days"
                                                    type="number"
                                                    min="1"
                                                    value={data.validity_days}
                                                    onChange={e => setData('validity_days', parseInt(e.target.value) || 30)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                            {errors.validity_days && (
                                                <p className="text-sm text-rose-600">{errors.validity_days}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <div className="font-medium">Estimated Completion:</div>
                                        <div>Clearance will be processed within {data.processing_days} business day{data.processing_days !== 1 ? 's' : ''}</div>
                                        <div>Valid for {data.validity_days} day{data.validity_days !== 1 ? 's' : ''} from issue date</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Document Requirements */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <File className="h-5 w-5" />
                                        Document Requirements
                                    </CardTitle>
                                    <CardDescription>
                                        Select required documents for this clearance type from the system database
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Filters */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search documents..."
                                                value={searchDocument}
                                                onChange={(e) => setSearchDocument(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <Select value={documentCategory} onValueChange={setDocumentCategory}>
                                            <SelectTrigger className="w-full sm:w-[180px]">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentCategories.map(category => (
                                                    <SelectItem key={category} value={category}>
                                                        {category === 'all' ? 'All Categories' : category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Selected Documents */}
                                    {selectedDocumentTypes.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Selected Documents ({selectedDocumentTypes.length})</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDocumentTypes.map(docId => {
                                                    const doc = (Array.isArray(documentTypes) ? documentTypes : []).find(d => d.id === docId);
                                                    return doc ? (
                                                        <Badge
                                                            key={doc.id}
                                                            variant="secondary"
                                                            className="flex items-center gap-1"
                                                        >
                                                            {doc.name || 'Unnamed'}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDocumentTypeToggle(doc.id)}
                                                                className="ml-1 hover:text-rose-600"
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Document List */}
                                    <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                                        {filteredDocumentTypes.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                No documents found. Try a different search or category.
                                            </div>
                                        ) : (
                                            filteredDocumentTypes.map((docType) => (
                                                <div
                                                    key={docType.id}
                                                    className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <Checkbox
                                                        checked={selectedDocumentTypes.includes(docType.id)}
                                                        onCheckedChange={() => handleDocumentTypeToggle(docType.id)}
                                                        id={`doc-${docType.id}`}
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <Label
                                                                    htmlFor={`doc-${docType.id}`}
                                                                    className="font-medium cursor-pointer"
                                                                >
                                                                    {docType.name || 'Unnamed Document'}
                                                                    {docType.is_required && (
                                                                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                                                                            Required
                                                                        </span>
                                                                    )}
                                                                </Label>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {docType.description || 'No description provided'}
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline" className="ml-2">
                                                                {docType.category || 'Uncategorized'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            <span>Formats: {formatAcceptedFormats(docType.accepted_formats)}</span>
                                                            <span>Max: {formatFileSize(docType.max_file_size)}</span>
                                                            <span className={docType.is_active ? "text-emerald-600" : "text-rose-600"}>
                                                                {docType.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        <p>Documents are managed in the <Link href="/admin/document-types" className="text-blue-600 hover:underline">Document Types</Link> section.</p>
                                        <p>Selected documents will be required when applying for this clearance type.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purpose Options */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Purpose Options</CardTitle>
                                    <CardDescription>
                                        Common purposes for this clearance type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {purposeOptions.map((option, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="flex items-center gap-1"
                                            >
                                                {option}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePurposeOption(index)}
                                                    className="ml-1 hover:text-rose-600"
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            value={newPurposeOption}
                                            onChange={e => setNewPurposeOption(e.target.value)}
                                            placeholder="Add a new purpose option..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddPurposeOption();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddPurposeOption}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Settings & Eligibility */}
                        <div className="space-y-6">
                            {/* Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Active Status</Label>
                                            <p className="text-sm text-gray-500">
                                                Make this clearance type available for use
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="requires_payment">Requires Payment</Label>
                                            <p className="text-sm text-gray-500">
                                                Must payment be collected for this clearance?
                                            </p>
                                        </div>
                                        <Switch
                                            id="requires_payment"
                                            checked={data.requires_payment}
                                            onCheckedChange={(checked) => setData('requires_payment', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="requires_approval">Requires Approval</Label>
                                            <p className="text-sm text-gray-500">
                                                Needs barangay official approval
                                            </p>
                                        </div>
                                        <Switch
                                            id="requires_approval"
                                            checked={data.requires_approval}
                                            onCheckedChange={(checked) => setData('requires_approval', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_online_only">Online Only</Label>
                                            <p className="text-sm text-gray-500">
                                                Available for online application only
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_online_only"
                                            checked={data.is_online_only}
                                            onCheckedChange={(checked) => setData('is_online_only', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Eligibility Criteria */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Eligibility Criteria</CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowEligibilityForm(!showEligibilityForm)}
                                        >
                                            {showEligibilityForm ? 'Hide' : 'Configure'}
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Define who can apply for this clearance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {showEligibilityForm ? (
                                        <div className="space-y-4">
                                            {eligibilityCriteria.map((criterion, index) => (
                                                <div key={index} className="p-3 border rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-sm">Criterion {index + 1}</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveEligibilityCriterion(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Select
                                                            value={criterion.field || ''}
                                                            onValueChange={(value) => 
                                                                handleUpdateEligibilityCriterion(index, 'field', value)
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select field" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {residentFields.map((field) => (
                                                                    <SelectItem key={field.value} value={field.value}>
                                                                        {field.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select
                                                            value={criterion.operator || ''}
                                                            onValueChange={(value) => 
                                                                handleUpdateEligibilityCriterion(index, 'operator', value)
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select operator" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {(Array.isArray(eligibilityOperators) ? eligibilityOperators : []).map((operator) => (
                                                                    <SelectItem key={operator.value} value={operator.value}>
                                                                        {operator.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            value={criterion.value || ''}
                                                            onChange={(e) => 
                                                                handleUpdateEligibilityCriterion(index, 'value', e.target.value)
                                                            }
                                                            placeholder="Value to compare"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={handleAddEligibilityCriterion}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Criterion
                                            </Button>
                                            <div className="text-xs text-gray-500">
                                                Leave empty if no eligibility restrictions
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500">
                                                {eligibilityCriteria.length > 0 
                                                    ? `${eligibilityCriteria.length} criterion${eligibilityCriteria.length !== 1 ? 's' : ''} configured`
                                                    : 'No eligibility criteria defined'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="font-medium">{data.name || 'Unnamed'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Code:</span>
                                            <span className="font-mono">{data.code || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Fee:</span>
                                            <span className="font-medium">{formatCurrency(data.fee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Processing:</span>
                                            <span>{data.processing_days} day{data.processing_days !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Validity:</span>
                                            <span>{data.validity_days} day{data.validity_days !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Required Documents:</span>
                                            <span>{selectedDocumentTypes.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <span className={data.is_active ? "text-emerald-600" : "text-amber-600"}>
                                                {data.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Actions */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Clearance Type
                                                </>
                                            )}
                                        </Button>
                                        <Link href="/admin/clearance-types">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                Cancel
                                            </Button>
                                        </Link>
                                        <div className="text-xs text-gray-500 text-center pt-2">
                                            ID: {initialClearanceType.id}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}