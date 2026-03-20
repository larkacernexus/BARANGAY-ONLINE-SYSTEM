// pages/admin/clearance-types/create.tsx

import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    Award,
    Shield,
    Heart,
    HeartHandshake,
    Baby,
    HandHeart,
    Users,
    Briefcase,
    Home,
    MapPin,
    User,
    GraduationCap,
    Scale,
    Gavel,
    Wallet,
    Vote,
    Info,
    Hash,
    Tag,
    Settings,
    Eye
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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

// ========== DYNAMIC PRIVILEGE TYPES ==========
interface PrivilegeData {
    id: number;
    name: string;
    code: string;
    description?: string;
    default_discount_percentage?: number;
    requires_id_number?: boolean;
    requires_verification?: boolean;
    validity_years?: number;
    is_active: boolean;
}

interface DiscountConfig {
    privilege_id: number;
    privilege_code: string;
    privilege_name: string;
    discount_percentage: number;
    is_active: boolean;
    requires_verification: boolean;
    requires_id_number: boolean;
}

interface PageProps {
    commonTypes: Record<string, CommonType>;
    documentTypes: DocumentType[];
    defaultPurposeOptions: string[];
    eligibilityOperators: Array<{ value: string; label: string }>;
    // DYNAMIC: All privileges from database
    privileges?: PrivilegeData[];
}

// ========== HELPER FUNCTIONS ==========
function getPrivilegeIcon(code: string): React.ReactNode {
    const firstChar = (code?.[0] || 'A').toUpperCase();
    
    const iconMap: Record<string, React.ReactNode> = {
        'S': <Award className="h-4 w-4" />,
        'P': <HeartHandshake className="h-4 w-4" />,
        'I': <Home className="h-4 w-4" />,
        'F': <Briefcase className="h-4 w-4" />,
        'O': <Users className="h-4 w-4" />,
        '4': <Heart className="h-4 w-4" />,
        'U': <User className="h-4 w-4" />,
        'A': <Award className="h-4 w-4" />,
        'B': <Award className="h-4 w-4" />,
        'C': <Award className="h-4 w-4" />,
        'D': <Award className="h-4 w-4" />,
        'E': <Award className="h-4 w-4" />,
    };
    
    return iconMap[firstChar] || <Award className="h-4 w-4" />;
}

function getPrivilegeColor(code: string): string {
    const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
    const colorIndex = firstChar % 8;
    
    const colors = [
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    ];
    
    return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
}

export default function CreateClearanceType({ 
    commonTypes, 
    documentTypes: initialDocumentTypes,
    defaultPurposeOptions,
    eligibilityOperators,
    privileges = [] // DYNAMIC: Get all privileges from database
}: PageProps) {
    const [selectedCommonType, setSelectedCommonType] = useState<string>('');
    const [purposeOptions, setPurposeOptions] = useState<string[]>(defaultPurposeOptions);
    const [newPurposeOption, setNewPurposeOption] = useState('');
    const [eligibilityCriteria, setEligibilityCriteria] = useState<EligibilityCriterion[]>([
        { field: 'age', operator: 'greater_than_or_equal', value: '18' }
    ]);
    const [showEligibilityForm, setShowEligibilityForm] = useState(false);
    const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<number[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
    const [documentCategory, setDocumentCategory] = useState<string>('all');
    const [searchDocument, setSearchDocument] = useState('');
    
    // DYNAMIC: Discount configuration state
    const [discountConfigs, setDiscountConfigs] = useState<DiscountConfig[]>([]);
    const [showDiscounts, setShowDiscounts] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        fee: 0,
        processing_days: 1,
        validity_days: 30,
        is_active: true,
        requires_payment: true,
        requires_approval: false,
        is_online_only: false,
        document_type_ids: [] as number[],
        eligibility_criteria: [] as EligibilityCriterion[],
        purpose_options: defaultPurposeOptions.join(', '),
        // DYNAMIC: Discount fields
        is_discountable: false,
        discount_configs: [] as DiscountConfig[],
        // DYNAMIC: Individual discount flags (will be populated dynamically)
    });

    // Initialize discount configs from privileges
    useEffect(() => {
        if (privileges && privileges.length > 0) {
            const initialConfigs = privileges
                .filter(p => p.is_active)
                .map(p => ({
                    privilege_id: p.id,
                    privilege_code: p.code,
                    privilege_name: p.name,
                    discount_percentage: p.default_discount_percentage || 0,
                    is_active: false,
                    requires_verification: p.requires_verification || false,
                    requires_id_number: p.requires_id_number || false
                }));
            setDiscountConfigs(initialConfigs);
        }
    }, [privileges]);

    const handleCommonTypeSelect = (typeKey: string) => {
        if (typeKey === 'custom') {
            setSelectedCommonType('custom');
            return;
        }

        const commonType = commonTypes[typeKey];
        if (commonType) {
            setSelectedCommonType(typeKey);
            setData({
                ...data,
                name: commonType.name,
                code: commonType.code,
                description: commonType.description,
                fee: commonType.fee,
                processing_days: commonType.processing_days,
                validity_days: commonType.validity_days,
                requires_payment: commonType.requires_payment !== false,
            });
        }
    };

    const handleDocumentTypeToggle = (documentTypeId: number) => {
        setSelectedDocumentTypes(prev => {
            let updatedSelection;
            if (prev.includes(documentTypeId)) {
                updatedSelection = prev.filter(id => id !== documentTypeId);
            } else {
                updatedSelection = [...prev, documentTypeId];
            }
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
        setEligibilityCriteria([
            ...eligibilityCriteria,
            { field: '', operator: 'equals', value: '' }
        ]);
    };

    const handleUpdateEligibilityCriterion = (index: number, field: keyof EligibilityCriterion, value: string) => {
        const updatedCriteria = [...eligibilityCriteria];
        updatedCriteria[index][field] = value;
        setEligibilityCriteria(updatedCriteria);
        setData('eligibility_criteria', updatedCriteria);
    };

    const handleRemoveEligibilityCriterion = (index: number) => {
        const updatedCriteria = eligibilityCriteria.filter((_, i) => i !== index);
        setEligibilityCriteria(updatedCriteria);
        setData('eligibility_criteria', updatedCriteria);
    };

    // DYNAMIC: Handle discount toggle
    const handleDiscountToggle = (index: number, checked: boolean) => {
        const updatedConfigs = [...discountConfigs];
        updatedConfigs[index].is_active = checked;
        setDiscountConfigs(updatedConfigs);
        
        // Update form data with active discounts
        const activeDiscounts = updatedConfigs.filter(c => c.is_active);
        setData('discount_configs', activeDiscounts);
        setData('is_discountable', activeDiscounts.length > 0);
        
        // Create individual fields for each active discount
        activeDiscounts.forEach(config => {
            const code = config.privilege_code.toLowerCase();
            setData(`has_${code}_discount`, true);
            setData(`${code}_discount_percentage`, config.discount_percentage);
        });
    };

    // DYNAMIC: Handle discount percentage change
    const handleDiscountPercentageChange = (index: number, percentage: number) => {
        const updatedConfigs = [...discountConfigs];
        updatedConfigs[index].discount_percentage = percentage;
        setDiscountConfigs(updatedConfigs);
        
        if (updatedConfigs[index].is_active) {
            const code = updatedConfigs[index].privilege_code.toLowerCase();
            setData(`${code}_discount_percentage`, percentage);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('clearance-types.store'));
    };

    // Filter document types based on category and search
    const filteredDocumentTypes = documentTypes.filter(doc => {
        const matchesCategory = documentCategory === 'all' || doc.category === documentCategory;
        const matchesSearch = doc.name.toLowerCase().includes(searchDocument.toLowerCase()) ||
                            (doc.description && doc.description.toLowerCase().includes(searchDocument.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Get unique categories from document types
    const documentCategories = [
        'all', 
        ...Array.from(new Set(
            documentTypes
                .map(doc => doc.category)
                .filter(category => category != null && category !== '')
        ))
    ];

    // Resident fields for eligibility criteria
    const residentFields = [
        { value: 'age', label: 'Age', icon: <Calendar className="h-4 w-4" /> },
        { value: 'civil_status', label: 'Civil Status', icon: <Heart className="h-4 w-4" /> },
        { value: 'educational_attainment', label: 'Educational Attainment', icon: <GraduationCap className="h-4 w-4" /> },
        { value: 'occupation', label: 'Occupation', icon: <Briefcase className="h-4 w-4" /> },
        { value: 'monthly_income', label: 'Monthly Income', icon: <Wallet className="h-4 w-4" /> },
        { value: 'is_registered_voter', label: 'Registered Voter', icon: <Vote className="h-4 w-4" /> },
        { value: 'years_in_barangay', label: 'Years in Barangay', icon: <Clock className="h-4 w-4" /> },
        { value: 'has_pending_case', label: 'Has Pending Case', icon: <Gavel className="h-4 w-4" /> },
        // DYNAMIC: Add privilege-based fields
        ...privileges.map(p => ({
            value: `has_${p.code.toLowerCase()}`,
            label: p.name,
            icon: getPrivilegeIcon(p.code)
        }))
    ];

    return (
        <AppLayout
            title="Create Clearance Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Clearance Types', href: '/admin/clearance-types' },
                { title: 'Create Type', href: '/admin/clearance-types/create' }
            ]}
        >
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/clearance-types">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-700 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Create Clearance Type
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Configure a new type of clearance or certificate
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/clearance-types">
                                <Button variant="outline" type="button" className="dark:border-gray-600 dark:text-gray-300">
                                    Cancel
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white dark:from-teal-700 dark:to-emerald-700"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Type
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            {Object.entries(errors).map(([field, message]) => (
                                                <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                    {message as string}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Basic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Start Templates */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <Copy className="h-3 w-3 text-white" />
                                        </div>
                                        Quick Start Templates
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Select a common clearance type or create custom
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(commonTypes).map(([key, type]) => (
                                            <Button
                                                key={key}
                                                type="button"
                                                variant={selectedCommonType === key ? "default" : "outline"}
                                                className={`h-auto py-4 px-3 justify-start text-left ${
                                                    selectedCommonType === key
                                                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white dark:from-teal-700 dark:to-emerald-700'
                                                        : 'dark:border-gray-600 dark:text-gray-300'
                                                }`}
                                                onClick={() => handleCommonTypeSelect(key)}
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">{type.name}</div>
                                                    <div className="text-xs opacity-80 mt-1">
                                                        ₱{type.fee.toFixed(2)} • {type.processing_days} days
                                                    </div>
                                                </div>
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            variant={selectedCommonType === 'custom' ? "default" : "outline"}
                                            className={`h-auto py-4 px-3 justify-start text-left ${
                                                selectedCommonType === 'custom'
                                                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white dark:from-teal-700 dark:to-emerald-700'
                                                    : 'dark:border-gray-600 dark:text-gray-300'
                                            }`}
                                            onClick={() => handleCommonTypeSelect('custom')}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium">Custom Type</div>
                                                <div className="text-xs opacity-80 mt-1">
                                                    Configure all settings manually
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Basic Information */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                            <FileText className="h-3 w-3 text-white" />
                                        </div>
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Core details of the clearance type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="dark:text-gray-300">
                                                Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="e.g., Business Clearance"
                                                required
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="code" className="dark:text-gray-300">
                                                Code <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    id="code"
                                                    value={data.code}
                                                    onChange={e => setData('code', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                                                    placeholder="e.g., BUSINESS_CLEARANCE"
                                                    required
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Unique identifier for system use
                                            </p>
                                            {errors.code && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Brief description of this clearance type..."
                                            rows={3}
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fees & Duration */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                            <DollarSign className="h-3 w-3 text-white" />
                                        </div>
                                        Fees & Duration
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Configure processing time and validity period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="fee" className="dark:text-gray-300">
                                                Fee (₱) <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    id="fee"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.fee}
                                                    onChange={e => setData('fee', parseFloat(e.target.value) || 0)}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    required
                                                />
                                            </div>
                                            {errors.fee && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.fee}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="processing_days" className="dark:text-gray-300">
                                                Processing Days <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    id="processing_days"
                                                    type="number"
                                                    min="1"
                                                    value={data.processing_days}
                                                    onChange={e => setData('processing_days', parseInt(e.target.value) || 1)}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    required
                                                />
                                            </div>
                                            {errors.processing_days && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.processing_days}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="validity_days" className="dark:text-gray-300">
                                                Validity (Days) <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    id="validity_days"
                                                    type="number"
                                                    min="1"
                                                    value={data.validity_days}
                                                    onChange={e => setData('validity_days', parseInt(e.target.value) || 30)}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    required
                                                />
                                            </div>
                                            {errors.validity_days && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.validity_days}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="font-medium dark:text-gray-300">Estimated Completion:</div>
                                        <div>Clearance will be processed within {data.processing_days} business day{data.processing_days !== 1 ? 's' : ''}</div>
                                        <div>Valid for {data.validity_days} day{data.validity_days !== 1 ? 's' : ''} from issue date</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Document Requirements */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                            <File className="h-3 w-3 text-white" />
                                        </div>
                                        Document Requirements
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Select required documents for this clearance type from the system database
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Filters */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    placeholder="Search documents..."
                                                    value={searchDocument}
                                                    onChange={(e) => setSearchDocument(e.target.value)}
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                        </div>
                                        <Select value={documentCategory} onValueChange={setDocumentCategory}>
                                            <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                {documentCategories.map(category => (
                                                    <SelectItem key={category} value={category} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                        {category === 'all' ? 'All Categories' : category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Selected Documents */}
                                    {selectedDocumentTypes.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="dark:text-gray-300">Selected Documents ({selectedDocumentTypes.length})</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDocumentTypes.map(docId => {
                                                    const doc = documentTypes.find(d => d.id === docId);
                                                    return doc ? (
                                                        <Badge
                                                            key={doc.id}
                                                            variant="secondary"
                                                            className="flex items-center gap-1 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                                        >
                                                            {doc.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDocumentTypeToggle(doc.id)}
                                                                className="ml-1 hover:text-red-600 dark:hover:text-red-400"
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
                                    <div className="border rounded-lg dark:border-gray-700 divide-y dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                                        {filteredDocumentTypes.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                No documents found. Try a different search or category.
                                            </div>
                                        ) : (
                                            filteredDocumentTypes.map((docType) => (
                                                <div
                                                    key={docType.id}
                                                    className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={selectedDocumentTypes.includes(docType.id)}
                                                        onCheckedChange={() => handleDocumentTypeToggle(docType.id)}
                                                        id={`doc-${docType.id}`}
                                                        className="mt-0.5 dark:border-gray-600"
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <Label
                                                                    htmlFor={`doc-${docType.id}`}
                                                                    className="font-medium cursor-pointer dark:text-gray-200"
                                                                >
                                                                    {docType.name}
                                                                    {docType.is_required && (
                                                                        <Badge className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                                            Required
                                                                        </Badge>
                                                                    )}
                                                                </Label>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    {docType.description}
                                                                </p>
                                                            </div>
                                                            {docType.category && (
                                                                <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-300">
                                                                    {docType.category}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                            <span>Formats: {docType.accepted_formats?.length 
                                                                ? docType.accepted_formats.join(', ') 
                                                                : 'PDF, JPG, PNG'}</span>
                                                            <span>Max: {docType.max_file_size 
                                                                ? (docType.max_file_size / 1024).toFixed(1) 
                                                                : 2} MB</span>
                                                            <span className={docType.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                                                {docType.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <p>Documents are managed in the <Link href="/admin/document-types" className="text-blue-600 dark:text-blue-400 hover:underline">Document Types</Link> section.</p>
                                        <p>Selected documents will be required when applying for this clearance type.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purpose Options */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 flex items-center justify-center">
                                            <Tag className="h-3 w-3 text-white" />
                                        </div>
                                        Purpose Options
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Common purposes for this clearance type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {purposeOptions.map((option, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300"
                                            >
                                                {option}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePurposeOption(index)}
                                                    className="ml-1 hover:text-red-600 dark:hover:text-red-400"
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
                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                            className="dark:border-gray-600 dark:text-gray-300"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* DYNAMIC: Discount Configuration Section */}
                            {privileges.length > 0 && (
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-700 dark:to-amber-700 flex items-center justify-center">
                                                    <Award className="h-3 w-3 text-white" />
                                                </div>
                                                Discount Configuration
                                            </CardTitle>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowDiscounts(!showDiscounts)}
                                                className="dark:text-gray-400 dark:hover:text-white"
                                            >
                                                {showDiscounts ? 'Hide' : 'Configure'}
                                            </Button>
                                        </div>
                                        <CardDescription className="dark:text-gray-400">
                                            Configure which privileges are eligible for discounts on this clearance type
                                        </CardDescription>
                                    </CardHeader>
                                    {showDiscounts && (
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                {discountConfigs.map((config, index) => (
                                                    <div
                                                        key={config.privilege_id}
                                                        className={`flex items-center gap-3 p-3 border rounded-lg ${
                                                            config.is_active 
                                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                                                : 'border-gray-200 dark:border-gray-700'
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            checked={config.is_active}
                                                            onCheckedChange={(checked) => 
                                                                handleDiscountToggle(index, checked as boolean)
                                                            }
                                                            id={`discount-${config.privilege_code}`}
                                                            className="dark:border-gray-600"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Label
                                                                    htmlFor={`discount-${config.privilege_code}`}
                                                                    className="font-medium cursor-pointer dark:text-gray-200"
                                                                >
                                                                    {config.privilege_name}
                                                                </Label>
                                                                {config.requires_verification && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Shield className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Requires verification</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                                {config.requires_id_number && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <File className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Requires ID number</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Code: {config.privilege_code}
                                                            </p>
                                                        </div>
                                                        <div className="w-32">
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={config.discount_percentage}
                                                                    onChange={(e) => handleDiscountPercentageChange(
                                                                        index, 
                                                                        parseFloat(e.target.value) || 0
                                                                    )}
                                                                    className="h-8 text-right pr-7 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                                    disabled={!config.is_active}
                                                                    placeholder="%"
                                                                />
                                                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p>Configure which privileges are eligible for discounts on this clearance type.</p>
                                                <p>Discount percentages will be applied during payment calculation.</p>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Settings & Eligibility */}
                        <div className="space-y-6">
                            {/* Settings */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                                            <Settings className="h-3 w-3 text-white" />
                                        </div>
                                        Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="dark:text-gray-300">Active Status</Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Make this clearance type available for use
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                            className="dark:data-[state=checked]:bg-green-600"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="requires_payment" className="dark:text-gray-300">Requires Payment</Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Must payment be collected for this clearance?
                                            </p>
                                        </div>
                                        <Switch
                                            id="requires_payment"
                                            checked={data.requires_payment}
                                            onCheckedChange={(checked) => setData('requires_payment', checked)}
                                            className="dark:data-[state=checked]:bg-green-600"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="requires_approval" className="dark:text-gray-300">Requires Approval</Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Needs barangay official approval
                                            </p>
                                        </div>
                                        <Switch
                                            id="requires_approval"
                                            checked={data.requires_approval}
                                            onCheckedChange={(checked) => setData('requires_approval', checked)}
                                            className="dark:data-[state=checked]:bg-blue-600"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_online_only" className="dark:text-gray-300">Online Only</Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Available for online application only
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_online_only"
                                            checked={data.is_online_only}
                                            onCheckedChange={(checked) => setData('is_online_only', checked)}
                                            className="dark:data-[state=checked]:bg-purple-600"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Eligibility Criteria */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center">
                                                <Scale className="h-3 w-3 text-white" />
                                            </div>
                                            Eligibility Criteria
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowEligibilityForm(!showEligibilityForm)}
                                            className="dark:text-gray-400 dark:hover:text-white"
                                        >
                                            {showEligibilityForm ? 'Hide' : 'Configure'}
                                        </Button>
                                    </div>
                                    <CardDescription className="dark:text-gray-400">
                                        Define who can apply for this clearance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {showEligibilityForm ? (
                                        <div className="space-y-4">
                                            {eligibilityCriteria.map((criterion, index) => (
                                                <div key={index} className="p-3 border rounded-lg dark:border-gray-700 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-sm dark:text-gray-300">Criterion {index + 1}</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveEligibilityCriterion(index)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Select
                                                            value={criterion.field}
                                                            onValueChange={(value) => 
                                                                handleUpdateEligibilityCriterion(index, 'field', value)
                                                            }
                                                        >
                                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                                <SelectValue placeholder="Select field" />
                                                            </SelectTrigger>
                                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                                {residentFields.map((field) => (
                                                                    <SelectItem key={field.value} value={field.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                                        <div className="flex items-center gap-2">
                                                                            {field.icon}
                                                                            <span>{field.label}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select
                                                            value={criterion.operator}
                                                            onValueChange={(value) => 
                                                                handleUpdateEligibilityCriterion(index, 'operator', value)
                                                            }
                                                        >
                                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                                <SelectValue placeholder="Select operator" />
                                                            </SelectTrigger>
                                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                                {eligibilityOperators.map((operator) => (
                                                                    <SelectItem key={operator.value} value={operator.value} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                                        {operator.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            value={criterion.value}
                                                            onChange={(e) => 
                                                                handleUpdateEligibilityCriterion(index, 'value', e.target.value)
                                                            }
                                                            placeholder="Value to compare"
                                                            className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full dark:border-gray-600 dark:text-gray-300"
                                                onClick={handleAddEligibilityCriterion}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Criterion
                                            </Button>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Leave empty if no eligibility restrictions
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
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
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <Eye className="h-3 w-3 text-white" />
                                        </div>
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                            <span className="font-medium dark:text-gray-200">{data.name || 'Unnamed'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Code:</span>
                                            <span className="font-mono dark:text-gray-300">{data.code || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                                            <span className="font-medium dark:text-gray-200">₱{data.fee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Processing:</span>
                                            <span className="dark:text-gray-300">{data.processing_days} day{data.processing_days !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Validity:</span>
                                            <span className="dark:text-gray-300">{data.validity_days} day{data.validity_days !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Required Documents:</span>
                                            <span className="font-medium dark:text-gray-200">{selectedDocumentTypes.length}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Discounts:</span>
                                            <span className="font-medium dark:text-gray-200">{discountConfigs.filter(c => c.is_active).length}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className={data.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                                                {data.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Actions */}
                            <Card className="dark:bg-gray-900">
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <Button 
                                            type="submit" 
                                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white dark:from-teal-700 dark:to-emerald-700"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Create Clearance Type
                                                </>
                                            )}
                                        </Button>
                                        <Link href="/admin/clearance-types">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="w-full dark:border-gray-600 dark:text-gray-300"
                                                disabled={processing}
                                            >
                                                Cancel
                                            </Button>
                                        </Link>
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