import React, { useState, useEffect, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { 
    AlertTriangle, UserPlus, Search, X, ChevronLeft, ChevronRight, Loader2, 
    Save, Send, ArrowLeft, ArrowRight, FileText, MapPin, Calendar, Clock, 
    Camera, Upload, Info, Image as ImageIcon, Video, File, Shield, UserX, 
    Check, HelpCircle, AlertCircle, Megaphone, ShieldAlert, Phone, Trash2,
    Download, Home
} from 'lucide-react';
import { PageProps, ReportType, FileWithPreview, CommunityReportFormData } from '@/types/admin/community-report';

// Import shadcn components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Types
interface UrgencyLevel {
    value: string;
    label: string;
}

// Helper functions
const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type === 'application/pdf') return FileText;
    return File;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isOtherType = (type: ReportType): boolean => {
    return type.name.toLowerCase().includes('other') || 
           type.category?.toLowerCase().includes('other') ||
           type.id === 999;
};

// Icon map
const iconMap: Record<string, any> = {
    'alert-circle': AlertCircle,
    'megaphone': Megaphone,
    'help-circle': HelpCircle,
    default: AlertCircle
};

// Steps configuration
const steps = [
    { number: 1, title: 'Complainant', description: 'Select or add complainant information', icon: UserPlus },
    { number: 2, title: 'Report Type', description: 'Choose the type of report', icon: AlertCircle },
    { number: 3, title: 'Incident Details', description: 'Provide details about the incident', icon: FileText },
    { number: 4, title: 'Evidence', description: 'Upload supporting documents', icon: Camera },
    { number: 5, title: 'Classification', description: 'Set status, priority and impact', icon: Shield },
    { number: 6, title: 'Review', description: 'Review and submit the report', icon: Check },
];

// Organize report types by category
const organizeReportTypes = (types: ReportType[]) => {
    return {
        issues: types.filter(type => 
            type.category?.toLowerCase().includes('issue') || 
            ['issue', 'concern', 'problem'].includes(type.category?.toLowerCase() || '')
        ),
        complaints: types.filter(type => 
            type.category?.toLowerCase().includes('complaint') ||
            ['complaint', 'grievance'].includes(type.category?.toLowerCase() || '')
        )
    };
};

// Pair items for grid display
const pairItems = <T,>(items: T[]): [T | null, T | null][] => {
    const pairs: [T | null, T | null][] = [];
    for (let i = 0; i < items.length; i += 2) {
        pairs.push([items[i] || null, items[i + 1] || null]);
    }
    return pairs;
};

// Preview Modal Component
const PreviewModal = ({ isOpen, url, type, name, onClose }: {
    isOpen: boolean;
    url: string | null;
    type: string;
    name: string;
    onClose: () => void;
}) => {
    if (!isOpen || !url) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{name}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {type.startsWith('image/') ? (
                        <img src={url} alt={name} className="max-w-full h-auto rounded-lg" />
                    ) : type === 'application/pdf' ? (
                        <iframe src={url} className="w-full h-[70vh]" title={name} />
                    ) : type.startsWith('video/') ? (
                        <video src={url} controls className="w-full rounded-lg">
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Preview not available for this file type</p>
                            <a 
                                href={url} 
                                download={name}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// User Search Component
const UserSearch = ({ 
    users, 
    onSelect,
    selectedUserId 
}: { 
    users: PageProps['users']; 
    onSelect: (user: PageProps['users'][0]) => void;
    selectedUserId: number | null;
}) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-11"
                >
                    {selectedUser ? selectedUser.name : "Search for resident..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput 
                        placeholder="Search by name or email..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>No resident found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                        {filteredUsers.map((user) => (
                            <CommandItem
                                key={user.id}
                                value={user.name}
                                onSelect={() => {
                                    onSelect(user);
                                    setOpen(false);
                                }}
                            >
                                <div className="flex flex-col">
                                    <span>{user.name}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

// Main Component
export default function Create({
    report_types,
    categories,
    puroks,
    users,
    statuses,
    urgencies,
    priorities,
    impact_levels,
    affected_people_options,
    noise_levels,
}: PageProps) {
    const [activeStep, setActiveStep] = useState(1);
    const [selectedType, setSelectedType] = useState<ReportType | null>(null);
    const [selectedUser, setSelectedUser] = useState<PageProps['users'][0] | null>(null);
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        url: string | null;
        type: string;
        name: string;
    }>({
        isOpen: false,
        url: null,
        type: '',
        name: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'issues' | 'complaints'>('issues');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<CommunityReportFormData>({
        user_id: null,
        report_type_id: null,
        title: '',
        description: '',
        detailed_description: '',
        location: '',
        incident_date: today,
        incident_time: '',
        urgency_level: 'medium',
        recurring_issue: false,
        affected_people: 'individual',
        estimated_affected_count: '',
        is_anonymous: false,
        reporter_name: '',
        reporter_contact: '',
        reporter_address: '',
        perpetrator_details: '',
        preferred_resolution: '',
        has_previous_report: false,
        previous_report_id: '',
        impact_level: 'moderate',
        safety_concern: false,
        environmental_impact: false,
        noise_level: '',
        duration_hours: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: null,
    });

    // Handle user selection
    const handleUserSelect = (user: PageProps['users'][0]) => {
        setSelectedUser(user);
        setFormData(prev => ({
            ...prev,
            user_id: user.id,
            reporter_name: user.name,
            reporter_contact: user.phone || user.email || '',
            reporter_address: user.address || '',
        }));
    };

    const handleClearUser = () => {
        setSelectedUser(null);
        setFormData(prev => ({
            ...prev,
            user_id: null,
            reporter_name: '',
            reporter_contact: '',
            reporter_address: '',
        }));
    };

    // Handle type selection
    const handleTypeSelect = (typeId: number) => {
        const type = report_types.find(t => t.id === typeId);
        setSelectedType(type || null);
        setFormData(prev => ({ ...prev, report_type_id: typeId }));
        
        // Auto-advance to next step after selection
        if (type) {
            setTimeout(() => nextStep(), 300);
        }
    };

    const handleTypeClear = () => {
        setSelectedType(null);
        setFormData(prev => ({ ...prev, report_type_id: null }));
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        const validFiles = selectedFiles.filter(file => file.size <= maxSize);
        const invalidFiles = selectedFiles.filter(file => file.size > maxSize);
        
        if (invalidFiles.length > 0) {
            toast.error(`${invalidFiles.length} file(s) exceed the 10MB limit`);
        }
        
        const filesWithPreview = validFiles.map(file => {
            const fileWithPreview = file as FileWithPreview;
            fileWithPreview.id = Math.random().toString(36).substr(2, 9);
            if (file.type.startsWith('image/')) {
                fileWithPreview.preview = URL.createObjectURL(file);
            }
            return fileWithPreview;
        });
        
        setFiles(prev => [...prev, ...filesWithPreview]);
        
        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.preview) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    const clearAllFiles = () => {
        files.forEach(file => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setFiles([]);
    };

    const openPreview = (file: FileWithPreview) => {
        if (file.preview) {
            setPreviewModal({
                isOpen: true,
                url: file.preview,
                type: file.type,
                name: file.name,
            });
        } else {
            // For non-image files, create object URL
            const url = URL.createObjectURL(file);
            setPreviewModal({
                isOpen: true,
                url,
                type: file.type,
                name: file.name,
            });
        }
    };

    const closePreview = () => {
        if (previewModal.url && !previewModal.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewModal.url);
        }
        setPreviewModal({
            isOpen: false,
            url: null,
            type: '',
            name: '',
        });
    };

    // Clean up URLs on unmount
    useEffect(() => {
        return () => {
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, []);

    // Navigation
    const nextStep = () => {
        if (activeStep === 1 && !formData.user_id && !formData.is_anonymous) {
            if (!selectedUser && !formData.reporter_name) {
                toast.error('Please select a resident or fill in complainant information');
                return;
            }
        }
        
        if (activeStep === 2 && !formData.report_type_id) {
            toast.error('Please select a report type');
            return;
        }
        
        if (activeStep === 3) {
            if (!formData.title.trim()) {
                toast.error('Please enter a title');
                return;
            }
            if (!formData.description.trim()) {
                toast.error('Please enter a description');
                return;
            }
            if (!formData.location.trim()) {
                toast.error('Please enter the location');
                return;
            }
        }
        
        if (activeStep === 4 && selectedType?.requires_evidence && files.length === 0) {
            toast.error('Evidence is required for this type of report');
            return;
        }
        
        if (activeStep < 6) {
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

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle checkbox changes
    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Final validation
        if (!formData.report_type_id) {
            toast.error('Please select a report type');
            setActiveStep(2);
            return;
        }

        if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
            toast.error('Please fill in all required fields');
            setActiveStep(3);
            return;
        }

        if (selectedType?.requires_evidence && files.length === 0) {
            toast.error('Evidence is required for this type of report');
            setActiveStep(4);
            return;
        }

        try {
            setIsSubmitting(true);

            const submitData = new FormData();

            // Append all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (typeof value === 'boolean') {
                        submitData.append(key, value ? '1' : '0');
                    } else {
                        submitData.append(key, String(value));
                    }
                }
            });

            // Append files
            files.forEach((file, index) => {
                submitData.append(`evidences[${index}]`, file);
            });

            router.post(route('admin.community-reports.store'), submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Community report created successfully');
                    // Clean up file URLs
                    files.forEach(file => {
                        if (file.preview) {
                            URL.revokeObjectURL(file.preview);
                        }
                    });
                },
                onError: (errors) => {
                    Object.entries(errors).forEach(([field, message]) => {
                        toast.error(`${field}: ${message}`);
                    });
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

    // Check if current step can proceed
    const canProceed = {
        step1: formData.user_id !== null || (formData.reporter_name && formData.reporter_contact),
        step2: formData.report_type_id !== null,
        step3: formData.title.trim() !== '' && formData.description.trim() !== '' && formData.location.trim() !== '',
        step4: selectedType?.requires_evidence ? files.length > 0 : true,
        step5: true,
    };

    // Calculate form completion percentage (matching resident structure)
    const requiredFields = [
        'title', 'description', 'location', 'incident_date'
    ];
    
    const optionalFields = [
        'detailed_description', 'incident_time', 'duration_hours', 
        'perpetrator_details', 'preferred_resolution', 'estimated_affected_count'
    ];

    const completedRequired = requiredFields.filter(field => {
        const value = formData[field as keyof CommunityReportFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length + (formData.report_type_id ? 1 : 0);

    const completedOptional = optionalFields.filter(field => {
        const value = formData[field as keyof CommunityReportFormData];
        return value !== '' && value !== null && value !== undefined;
    }).length;

    const totalProgress = Math.round(
        ((completedRequired + completedOptional) / (requiredFields.length + optionalFields.length + 1)) * 100
    );

    return (
        <AdminLayout
            title="Create Community Report"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Community Reports', href: '/admin/community-reports' },
                { title: 'Create Report', href: '/admin/community-reports/create' }
            ]}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.community-reports.index')}>
                                <Button variant="ghost" size="sm" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Create Community Report</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    File a report on behalf of a resident
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={isSubmitting} size="lg">
                                <Save className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Report'}
                            </Button>
                        </div>
                    </div>

                    {/* Error Messages - Placeholder for server errors */}
                    {/* {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            <p className="font-bold">Please fix the following errors:</p>
                            <ul className="list-disc list-inside mt-2">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field}><strong>{field.replace('_', ' ')}:</strong> {error}</li>
                                ))}
                            </ul>
                        </div>
                    )} */}

                    {/* Step Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Step {activeStep}: {steps[activeStep - 1].title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {steps[activeStep - 1].description}
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Step {activeStep} of {steps.length}
                            </Badge>
                        </div>
                        <Progress value={(activeStep / steps.length) * 100} className="h-2" />
                    </div>

                    {/* Main Content Grid - Matching resident structure */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* STEP 1: Complainant Information */}
                            {activeStep === 1 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserPlus className="h-5 w-5" />
                                            Complainant Information
                                        </CardTitle>
                                        <CardDescription>
                                            Select an existing resident or enter complainant details manually
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* User Search */}
                                        <div className="space-y-2">
                                            <Label>Search Resident</Label>
                                            <UserSearch 
                                                users={users}
                                                onSelect={handleUserSelect}
                                                selectedUserId={formData.user_id}
                                            />
                                            {selectedUser && (
                                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg relative">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-2 right-2 h-6 w-6 p-0"
                                                        onClick={handleClearUser}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <p className="font-medium">{selectedUser.name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                                                    {selectedUser.phone && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {selectedUser.phone}</p>
                                                    )}
                                                    {selectedUser.address && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Address: {selectedUser.address}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Manual Entry */}
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="is_anonymous"
                                                    checked={formData.is_anonymous}
                                                    onCheckedChange={(checked) => 
                                                        handleCheckboxChange('is_anonymous', checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor="is_anonymous">Report anonymously</Label>
                                            </div>

                                            {!formData.is_anonymous && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="reporter_name">Full Name *</Label>
                                                            <Input
                                                                id="reporter_name"
                                                                name="reporter_name"
                                                                value={formData.reporter_name}
                                                                onChange={handleInputChange}
                                                                placeholder="Enter complainant's full name"
                                                                required={!formData.is_anonymous && !selectedUser}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="reporter_contact">Contact Number *</Label>
                                                            <Input
                                                                id="reporter_contact"
                                                                name="reporter_contact"
                                                                value={formData.reporter_contact}
                                                                onChange={handleInputChange}
                                                                placeholder="Phone number or email"
                                                                required={!formData.is_anonymous && !selectedUser}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="reporter_address">Address</Label>
                                                        <Textarea
                                                            id="reporter_address"
                                                            name="reporter_address"
                                                            value={formData.reporter_address}
                                                            onChange={handleInputChange}
                                                            placeholder="Complete address"
                                                            rows={2}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* STEP 2: Report Type Selection */}
                            {activeStep === 2 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Select Report Type
                                        </CardTitle>
                                        <CardDescription>
                                            Choose the type of report that best describes the incident
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search report types..."
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

                                        {/* Tabs */}
                                        <div className="border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex space-x-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('issues')}
                                                    className={`py-2.5 px-4 text-sm font-medium rounded-t-lg transition-all ${
                                                        activeTab === 'issues'
                                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Issues & Concerns</span>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('complaints')}
                                                    className={`py-2.5 px-4 text-sm font-medium rounded-t-lg transition-all ${
                                                        activeTab === 'complaints'
                                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Megaphone className="h-4 w-4" />
                                                        <span>Complaints</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Report Types List */}
                                        <ScrollArea className="h-[400px] pr-4">
                                            <div className="space-y-3">
                                                {report_types
                                                    .filter(type => 
                                                        activeTab === 'issues' 
                                                            ? type.category?.toLowerCase().includes('issue')
                                                            : type.category?.toLowerCase().includes('complaint')
                                                    )
                                                    .filter(type => 
                                                        searchQuery === '' || 
                                                        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        type.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                                    )
                                                    .map((type) => {
                                                        const Icon = iconMap[type.icon || 'default'] || iconMap.default;
                                                        const isSelected = selectedType?.id === type.id;
                                                        
                                                        return (
                                                            <button
                                                                key={type.id}
                                                                type="button"
                                                                className={`w-full text-left p-4 rounded-lg border transition-all ${
                                                                    isSelected
                                                                        ? `border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 ring-2 ring-blue-500/20`
                                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                                }`}
                                                                onClick={() => handleTypeSelect(type.id)}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                                                                        isSelected 
                                                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                                                            : 'bg-gray-100 dark:bg-gray-800'
                                                                    }`}>
                                                                        <Icon className={`h-5 w-5 ${
                                                                            isSelected 
                                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                                : 'text-gray-600 dark:text-gray-400'
                                                                        }`} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h3 className="font-semibold">{type.name}</h3>
                                                                            {type.priority_label && (
                                                                                <Badge 
                                                                                    style={{ backgroundColor: type.priority_color || '#6b7280' }}
                                                                                    className="text-xs"
                                                                                >
                                                                                    {type.priority_label}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {type.description}
                                                                        </p>
                                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                {type.resolution_days || 3} days
                                                                            </span>
                                                                            <span className="flex items-center gap-1">
                                                                                <Camera className="h-3 w-3" />
                                                                                {type.requires_evidence ? 'Required' : 'Optional'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <Check className="h-5 w-5 text-blue-600" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}

                            {/* STEP 3: Incident Details */}
                            {activeStep === 3 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Incident Details
                                        </CardTitle>
                                        <CardDescription>
                                            Provide detailed information about the incident
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title *</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                placeholder="Brief title of the incident"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description *</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Describe what happened"
                                                rows={4}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="detailed_description">Detailed Description</Label>
                                            <Textarea
                                                id="detailed_description"
                                                name="detailed_description"
                                                value={formData.detailed_description}
                                                onChange={handleInputChange}
                                                placeholder="Provide more details about the incident"
                                                rows={4}
                                            />
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="incident_date">Incident Date *</Label>
                                                <Input
                                                    id="incident_date"
                                                    name="incident_date"
                                                    type="date"
                                                    value={formData.incident_date}
                                                    onChange={handleInputChange}
                                                    max={today}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="incident_time">Incident Time</Label>
                                                <Input
                                                    id="incident_time"
                                                    name="incident_time"
                                                    type="time"
                                                    value={formData.incident_time}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location *</Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="Where did it happen?"
                                                list="purok-suggestions"
                                                required
                                            />
                                            <datalist id="purok-suggestions">
                                                {puroks.map((purok) => (
                                                    <option key={purok} value={purok} />
                                                ))}
                                            </datalist>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="urgency_level">Urgency Level</Label>
                                            <Select
                                                value={formData.urgency_level}
                                                onValueChange={(value) => handleSelectChange('urgency_level', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select urgency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {urgencies.map((urgency) => (
                                                        <SelectItem key={urgency.value} value={urgency.value}>
                                                            {urgency.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="font-medium">Additional Details</h3>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="recurring_issue"
                                                    checked={formData.recurring_issue}
                                                    onCheckedChange={(checked) => 
                                                        handleCheckboxChange('recurring_issue', checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor="recurring_issue">This is a recurring issue</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="safety_concern"
                                                    checked={formData.safety_concern}
                                                    onCheckedChange={(checked) => 
                                                        handleCheckboxChange('safety_concern', checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor="safety_concern">This is a safety concern</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="environmental_impact"
                                                    checked={formData.environmental_impact}
                                                    onCheckedChange={(checked) => 
                                                        handleCheckboxChange('environmental_impact', checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor="environmental_impact">This has environmental impact</Label>
                                            </div>

                                            {formData.environmental_impact && (
                                                <div className="ml-6 space-y-2">
                                                    <Label htmlFor="noise_level">Noise Level</Label>
                                                    <Select
                                                        value={formData.noise_level}
                                                        onValueChange={(value) => handleSelectChange('noise_level', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select noise level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {noise_levels.map((level) => (
                                                                <SelectItem key={level.value} value={level.value}>
                                                                    {level.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="perpetrator_details">Perpetrator Details (if applicable)</Label>
                                            <Textarea
                                                id="perpetrator_details"
                                                name="perpetrator_details"
                                                value={formData.perpetrator_details}
                                                onChange={handleInputChange}
                                                placeholder="Information about the person(s) involved"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="preferred_resolution">Preferred Resolution</Label>
                                            <Textarea
                                                id="preferred_resolution"
                                                name="preferred_resolution"
                                                value={formData.preferred_resolution}
                                                onChange={handleInputChange}
                                                placeholder="What resolution does the complainant prefer?"
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* STEP 4: Evidence Upload */}
                            {activeStep === 4 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="h-5 w-5" />
                                            Evidence Upload
                                        </CardTitle>
                                        <CardDescription>
                                            Upload supporting documents, photos, or videos
                                            {selectedType?.requires_evidence && (
                                                <span className="text-red-500 ml-1">* Required for this report type</span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                multiple
                                                accept="image/*,.pdf,video/mp4,video/mov,video/avi"
                                                className="hidden"
                                            />
                                            <div className="space-y-2">
                                                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                                    <Camera className="h-8 w-8 text-blue-500" />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    Click to upload evidence files
                                                </p>
                                                <Button variant="outline" type="button">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Select Files
                                                </Button>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    JPG, PNG, GIF, PDF, MP4, MOV, AVI • Max 10MB per file
                                                </p>
                                            </div>
                                        </div>

                                        {/* File List */}
                                        {files.length > 0 && (
                                            <div className="mt-6 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-sm">Uploaded Files ({files.length})</h4>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearAllFiles}
                                                        className="text-xs h-7 px-3"
                                                    >
                                                        Clear All
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {files.map((file) => {
                                                        const FileIcon = getFileIcon(file.type);
                                                        const isImage = file.type.startsWith('image/');
                                                        return (
                                                            <div key={file.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                                                                <div className="p-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                            <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                                                                isImage ? 'bg-blue-50' : 'bg-gray-100'
                                                                            }`}>
                                                                                <FileIcon className={`h-5 w-5 ${
                                                                                    isImage ? 'text-blue-500' : 'text-gray-500'
                                                                                }`} />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-sm truncate">{file.name}</p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {formatFileSize(file.size)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => openPreview(file)}
                                                                                className="h-8 w-8"
                                                                            >
                                                                                <Search className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeFile(file.id)}
                                                                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    {isImage && file.preview && (
                                                                        <div className="mt-3">
                                                                            <div 
                                                                                className="relative aspect-video rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                                                                                onClick={() => openPreview(file)}
                                                                            >
                                                                                <img 
                                                                                    src={file.preview} 
                                                                                    alt={file.name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Evidence Tips */}
                                        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                                            <div className="flex items-start gap-3">
                                                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h5 className="text-sm font-medium mb-1">What makes good evidence?</h5>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        <li>• Clear photos showing the issue or incident</li>
                                                        <li>• Timestamps and location information</li>
                                                        <li>• Multiple angles and context shots</li>
                                                        <li>• Documents supporting your report</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* STEP 5: Classification */}
                            {activeStep === 5 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Report Classification
                                        </CardTitle>
                                        <CardDescription>
                                            Set status, priority, and other administrative details
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value) => handleSelectChange('status', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statuses.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select
                                                    value={formData.priority}
                                                    onValueChange={(value) => handleSelectChange('priority', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {priorities.map((priority) => (
                                                            <SelectItem key={priority.value} value={priority.value}>
                                                                {priority.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="impact_level">Impact Level</Label>
                                                <Select
                                                    value={formData.impact_level}
                                                    onValueChange={(value) => handleSelectChange('impact_level', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select impact level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {impact_levels.map((level) => (
                                                            <SelectItem key={level.value} value={level.value}>
                                                                {level.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="affected_people">Affected People</Label>
                                                <Select
                                                    value={formData.affected_people}
                                                    onValueChange={(value) => handleSelectChange('affected_people', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select scope" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {affected_people_options.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="estimated_affected_count">Estimated Number of Affected People</Label>
                                            <Input
                                                id="estimated_affected_count"
                                                name="estimated_affected_count"
                                                type="number"
                                                min="0"
                                                value={formData.estimated_affected_count}
                                                onChange={handleInputChange}
                                                placeholder="How many people are affected?"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="previous_report_id">Previous Report ID (if follow-up)</Label>
                                            <Input
                                                id="previous_report_id"
                                                name="previous_report_id"
                                                value={formData.previous_report_id}
                                                onChange={handleInputChange}
                                                placeholder="Enter previous report number"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* STEP 6: Review */}
                            {activeStep === 6 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Check className="h-5 w-5" />
                                            Review & Submit
                                        </CardTitle>
                                        <CardDescription>
                                            Review all information before submitting the report
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Complainant Info */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Complainant Information</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                {formData.is_anonymous ? (
                                                    <p className="text-gray-600">Anonymous Report</p>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <span className="text-gray-500">Name:</span>
                                                        <span>{formData.reporter_name}</span>
                                                        <span className="text-gray-500">Contact:</span>
                                                        <span>{formData.reporter_contact}</span>
                                                        <span className="text-gray-500">Address:</span>
                                                        <span>{formData.reporter_address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Report Type */}
                                        {selectedType && (
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">Report Type</h3>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="font-medium">{selectedType.name}</p>
                                                    {selectedType.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{selectedType.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Incident Details */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Incident Details</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                                <div>
                                                    <span className="text-sm text-gray-500 block">Title:</span>
                                                    <p className="font-medium">{formData.title}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-500 block">Description:</span>
                                                    <p>{formData.description}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-sm text-gray-500 block">Date:</span>
                                                        <p>{formData.incident_date}</p>
                                                    </div>
                                                    {formData.incident_time && (
                                                        <div>
                                                            <span className="text-sm text-gray-500 block">Time:</span>
                                                            <p>{formData.incident_time}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-500 block">Location:</span>
                                                    <p>{formData.location}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Evidence Summary */}
                                        {files.length > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">Evidence Files</h3>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p>{files.length} file(s) attached</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Classification Summary */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Classification</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <span className="text-gray-500">Status:</span>
                                                    <span className="capitalize">{formData.status}</span>
                                                    <span className="text-gray-500">Priority:</span>
                                                    <span className="capitalize">{formData.priority}</span>
                                                    <span className="text-gray-500">Impact Level:</span>
                                                    <span className="capitalize">{formData.impact_level}</span>
                                                    <span className="text-gray-500">Affected People:</span>
                                                    <span className="capitalize">{formData.affected_people}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-4">
                                <div>
                                    {activeStep > 1 ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous Step
                                        </Button>
                                    ) : (
                                        <Link href={route('admin.community-reports.index')}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                                <div>
                                    {activeStep < 6 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!canProceed[`step${activeStep}` as keyof typeof canProceed]}
                                        >
                                            Next Step
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Summary & Progress (1/3 width) */}
                        <div className="space-y-6">
                            {/* Step Progress Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {steps.map((step) => (
                                                <div 
                                                    key={step.number}
                                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                        activeStep === step.number 
                                                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                                                            : step.number < activeStep
                                                            ? 'text-gray-500'
                                                            : 'text-gray-400'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        step.number < activeStep
                                                            ? 'bg-green-100 text-green-600'
                                                            : step.number === activeStep
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {step.number < activeStep ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            step.number
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{step.title}</p>
                                                        <p className="text-xs text-gray-500">{step.description}</p>
                                                    </div>
                                                    {step.number === activeStep && (
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                                            Current
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <Separator />

                                        {/* Form Summary */}
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Required Fields:</span>
                                                <span className={`font-medium ${
                                                    completedRequired === requiredFields.length + 1 
                                                        ? 'text-green-600' 
                                                        : 'text-amber-600'
                                                }`}>
                                                    {completedRequired}/{requiredFields.length + 1} completed
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Optional Fields:</span>
                                                <span className="font-medium">
                                                    {completedOptional}/{optionalFields.length} completed
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t">
                                                <div className="flex items-center justify-between font-medium">
                                                    <span>Total Progress</span>
                                                    <span>{totalProgress}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                            totalProgress === 100 ? 'bg-green-500' : 
                                                            totalProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                                        }`} 
                                                        style={{ width: `${totalProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Report Type Summary */}
                            {selectedType && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Selected Report Type</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    selectedType.category === 'issue'
                                                        ? 'bg-blue-100'
                                                        : 'bg-purple-100'
                                                }`}>
                                                    {selectedType.category === 'issue' ? (
                                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                                    ) : (
                                                        <Megaphone className="h-5 w-5 text-purple-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{selectedType.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{selectedType.description}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="p-2 bg-gray-50 rounded text-center">
                                                    <div className="font-medium">Resolution</div>
                                                    <div className="text-gray-600">{selectedType.resolution_days || 3} days</div>
                                                </div>
                                                <div className="p-2 bg-gray-50 rounded text-center">
                                                    <div className="font-medium">Evidence</div>
                                                    <div className={selectedType.requires_evidence ? 'text-red-600' : 'text-green-600'}>
                                                        {selectedType.requires_evidence ? 'Required' : 'Optional'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start" 
                                        type="button"
                                        onClick={() => window.open('/admin/residents/create', '_blank')}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add New Resident
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start" 
                                        type="button"
                                        onClick={() => window.open('/admin/report-types', '_blank')}
                                    >
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Manage Report Types
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={previewModal.isOpen}
                url={previewModal.url}
                type={previewModal.type}
                name={previewModal.name}
                onClose={closePreview}
            />
        </AdminLayout>
    );
}