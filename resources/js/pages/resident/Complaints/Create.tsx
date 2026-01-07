import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    AlertCircle,
    Upload,
    MapPin,
    Shield,
    Camera,
    AlertTriangle,
    CheckCircle,
    X,
    FileText,
    Phone,
    Mail,
    Clock,
    Calendar,
    Info,
    Loader2,
    ShieldAlert
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';

interface FileWithPreview extends File {
    preview: string;
    id: string;
}

export default function FileComplaint() {
    const [complaintType, setComplaintType] = useState('noise');
    const [priority, setPriority] = useState('medium');
    const [anonymous, setAnonymous] = useState(false);
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        type: 'noise',
        subject: '',
        description: '',
        location: '',
        incident_date: '',
        priority: 'medium',
        is_anonymous: false,
        evidence: [] as File[]
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
            // Clean up object URLs
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);

    // Auto-focus first input on mobile for better UX
    useEffect(() => {
        if (isMobile && !data.subject) {
            const firstInput = document.getElementById('subject');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }, [isMobile, data.subject]);

    const complaintTypes = [
        { id: 'noise', name: 'Noise', icon: AlertCircle, description: 'Loud music, parties, construction', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
        { id: 'sanitation', name: 'Sanitation', icon: AlertTriangle, description: 'Garbage, drainage issues', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
        { id: 'infrastructure', name: 'Infrastructure', icon: AlertCircle, description: 'Roads, lights, facilities', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
        { id: 'security', name: 'Security', icon: Shield, description: 'Suspicious activities', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
        { id: 'traffic', name: 'Traffic', icon: AlertTriangle, description: 'Parking, congestion', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
        { id: 'others', name: 'Others', icon: AlertCircle, description: 'Other concerns', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
    ];

    const selectedType = complaintTypes.find(type => type.id === complaintType);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        
        if (selectedFiles.length + files.length > 10) {
            toast.error('Maximum 10 files allowed');
            return;
        }
        
        // Validate file sizes and types
        const validFiles = selectedFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
            const maxSize = 5 * 1024 * 1024; // 5MB for mobile optimization
            
            if (!validTypes.includes(file.type)) {
                toast.error(`Invalid file type: ${file.name}. Please use JPG, PNG, PDF, or MP4.`);
                return false;
            }
            
            if (file.size > maxSize) {
                toast.error(`File too large (max 5MB): ${file.name}`);
                return false;
            }
            
            return true;
        });

        const newFiles = validFiles.map(file => {
            const fileWithPreview = Object.assign(file, {
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
                id: Math.random().toString(36).substr(2, 9)
            });
            return fileWithPreview;
        });

        setFiles(prev => [...prev, ...newFiles]);
        setData('evidence', [...data.evidence, ...validFiles]);
        
        if (validFiles.length > 0) {
            toast.success(`Added ${validFiles.length} file(s)`);
        }
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [files.length, data.evidence]);

    const removeFile = useCallback((id: string) => {
        setFiles(prev => {
            const newFiles = prev.filter(file => file.id !== id);
            const removedFile = prev.find(file => file.id === id);
            
            // Revoke object URL to prevent memory leaks
            if (removedFile?.preview) {
                URL.revokeObjectURL(removedFile.preview);
            }
            
            return newFiles;
        });

        setData('evidence', data.evidence.filter((_, i) => {
            const fileIndex = files.findIndex(f => f.id === id);
            return i !== fileIndex;
        }));
        
        toast.info('File removed');
    }, [data.evidence, files]);

    const validateForm = useCallback(() => {
        const errors = [];
        if (!data.subject.trim()) errors.push('Subject is required');
        if (!data.description.trim()) errors.push('Description is required');
        if (!data.location.trim()) errors.push('Location is required');
        if (data.description.trim().length < 20) errors.push('Description should be at least 20 characters');
        return errors;
    }, [data.subject, data.description, data.location]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        setShowValidation(true);
        const validationErrors = validateForm();
        
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => toast.error(error));
            
            // Scroll to first error
            const firstErrorElement = formRef.current?.querySelector('[aria-invalid="true"]');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        setIsSubmitting(true);
        setIsUploading(true);
        
        post(route('my.complaints.store'), {
            onSuccess: () => {
                toast.success('Complaint submitted successfully! You will receive a confirmation shortly.', {
                    duration: 5000,
                    action: {
                        label: 'View Status',
                        onClick: () => window.location.href = route('my.complaints.index')
                    }
                });
            },
            onError: (errors) => {
                if (errors.server) {
                    toast.error('Server error. Please try again later.');
                } else {
                    toast.error('Failed to submit complaint. Please check your information.');
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
                setIsUploading(false);
                setShowValidation(false);
            },
        });
    }, [data, post, validateForm]);

    const handleSaveDraft = useCallback(() => {
        // Save to localStorage for draft functionality
        const draft = {
            type: data.type,
            subject: data.subject,
            description: data.description,
            location: data.location,
            incident_date: data.incident_date,
            priority: data.priority,
            is_anonymous: data.is_anonymous,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('complaint_draft', JSON.stringify(draft));
        toast.success('Draft saved locally', {
            description: 'Your complaint has been saved as a draft.',
            duration: 3000
        });
    }, [data]);

    const handleAnonymousToggle = useCallback(() => {
        const newValue = !anonymous;
        setAnonymous(newValue);
        setData('is_anonymous', newValue);
        
        toast.info(newValue ? 
            'Your complaint will be submitted anonymously. Your identity will be protected.' :
            'Your identity will be visible to barangay officials for follow-up purposes.',
            { duration: 3000 }
        );
    }, [anonymous, setData]);

    // Handle datetime-local input on mobile (shows native picker)
    const handleDateTimeClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
        if (isMobile) {
            e.currentTarget.showPicker();
        }
    }, [isMobile]);

    // Load draft if exists
    useEffect(() => {
        const savedDraft = localStorage.getItem('complaint_draft');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            const shouldLoad = window.confirm('You have a saved draft. Would you like to load it?');
            
            if (shouldLoad) {
                setData(draft);
                setComplaintType(draft.type);
                setPriority(draft.priority);
                setAnonymous(draft.is_anonymous);
                toast.info('Draft loaded successfully');
            }
        }
    }, [setData]);

    // Priority level options
    const priorityOptions = [
        { 
            value: 'low', 
            label: 'Low Priority', 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-50 dark:bg-green-900/20', 
            description: 'Minor issue, no immediate danger',
            icon: '✅'
        },
        { 
            value: 'medium', 
            label: 'Medium Priority', 
            color: 'text-amber-600 dark:text-amber-400', 
            bg: 'bg-amber-50 dark:bg-amber-900/20', 
            description: 'Needs attention soon',
            icon: '⚠️'
        },
        { 
            value: 'high', 
            label: 'High Priority', 
            color: 'text-red-600 dark:text-red-400', 
            bg: 'bg-red-50 dark:bg-red-900/20', 
            description: 'Urgent - requires immediate action',
            icon: '🚨'
        },
    ];

    return (
        <ResidentLayout
            title="File Complaint"
            breadcrumbs={[
                { title: 'Dashboard', href: '/resident/dashboard' },
                { title: 'My Complaints', href: '/resident/complaints' },
                { title: 'File Complaint', href: '/resident/complaints/create' }
            ]}
        >
            <div className="min-h-screen-safe pb-24 md:pb-6">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobile Header - Sticky */}
                    {isMobile && (
                        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b p-4 flex items-center gap-3">
                            <Link href="/resident/complaints">
                                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div className="flex-1">
                                <h1 className="text-lg font-bold">File Complaint</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Report issues to barangay officials
                                </p>
                            </div>
                            <Badge variant="outline" className="hidden sm:flex">
                                {files.length}/10 files
                            </Badge>
                        </div>
                    )}

                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/resident/complaints">
                                    <Button type="button" variant="ghost" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Complaints
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">File a Complaint</h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Report issues and concerns to the barangay
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="text-sm">
                                    {files.length} file(s) attached
                                </Badge>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveDraft}
                                    disabled={isSubmitting}
                                >
                                    Save Draft
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Quick Action Bar for Mobile */}
                    {isMobile && (
                        <div className="sticky top-16 z-20 bg-white dark:bg-gray-900 border-b p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    priority === 'high' ? 'bg-red-500' :
                                    priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                }`} />
                                <span className="text-sm font-medium">{priority.toUpperCase()} PRIORITY</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleSaveDraft}
                                disabled={isSubmitting}
                            >
                                Save Draft
                            </Button>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Complaint Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Complaint Type - Mobile Optimized */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-blue-500" />
                                        Complaint Type
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        What type of issue are you reporting?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                                        {complaintTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                className={`border-2 rounded-lg p-3 cursor-pointer transition-all text-left ${
                                                    complaintType === type.id 
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 ring-2 ring-blue-500/20' 
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                                                }`}
                                                onClick={() => {
                                                    setComplaintType(type.id);
                                                    setData('type', type.id);
                                                }}
                                                aria-pressed={complaintType === type.id}
                                            >
                                                <div className="flex flex-col items-center text-center gap-2">
                                                    <div className={`p-2 rounded-full ${type.color}`}>
                                                        <type.icon className="h-4 w-4 md:h-5 md:w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm md:text-base">{type.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                            {type.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.type && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.type}</p>}
                                </CardContent>
                            </Card>

                            {/* Complaint Details */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg md:text-xl">Complaint Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="flex items-center gap-1">
                                            Subject *
                                            {showValidation && !data.subject.trim() && (
                                                <span className="text-xs text-red-500">(Required)</span>
                                            )}
                                        </Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                            placeholder="Brief summary of your complaint"
                                            className="dark:bg-gray-700 dark:border-gray-600"
                                            aria-invalid={showValidation && !data.subject.trim()}
                                        />
                                        {errors.subject && <p className="text-sm text-red-600 dark:text-red-400">{errors.subject}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="flex items-center gap-1">
                                            Detailed Description *
                                            <span className="text-xs text-gray-500">
                                                ({data.description.length}/500 characters)
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Please provide detailed information about the issue..."
                                            rows={isMobile ? 4 : 5}
                                            className="dark:bg-gray-700 dark:border-gray-600 resize-y min-h-[120px]"
                                            maxLength={500}
                                            aria-invalid={showValidation && (!data.description.trim() || data.description.length < 20)}
                                        />
                                        <div className="flex justify-between text-xs">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Include specific details like time, frequency, persons involved, etc.
                                            </p>
                                            {showValidation && data.description.length < 20 && (
                                                <p className="text-red-500">At least 20 characters required</p>
                                            )}
                                        </div>
                                        {errors.description && <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="flex items-center gap-1">
                                                Location *
                                                {showValidation && !data.location.trim() && (
                                                    <span className="text-xs text-red-500">(Required)</span>
                                                )}
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={e => setData('location', e.target.value)}
                                                    placeholder="Exact location or address"
                                                    className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                                                    aria-invalid={showValidation && !data.location.trim()}
                                                />
                                            </div>
                                            {errors.location && <p className="text-sm text-red-600 dark:text-red-400">{errors.location}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="incident_date">Date & Time of Incident</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="incident_date"
                                                    type="datetime-local"
                                                    value={data.incident_date}
                                                    onChange={e => setData('incident_date', e.target.value)}
                                                    onClick={handleDateTimeClick}
                                                    className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                                                    max={new Date().toISOString().slice(0, 16)}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                When did this happen?
                                            </p>
                                            {errors.incident_date && <p className="text-sm text-red-600 dark:text-red-400">{errors.incident_date}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Priority - IMPROVED: Direct click to select */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        Priority Level
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        How urgent is this issue?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <Label>Select Priority Level *</Label>
                                        <div className="space-y-3">
                                            {priorityOptions.map((option) => (
                                                <div
                                                    key={option.value}
                                                    className={`flex items-start p-4 rounded-lg cursor-pointer transition-all ${option.bg} ${
                                                        priority === option.value 
                                                            ? 'ring-2 ring-offset-2 ring-current border-2 border-current' 
                                                            : 'border border-transparent hover:border-current/50'
                                                    }`}
                                                    onClick={() => {
                                                        setPriority(option.value);
                                                        setData('priority', option.value);
                                                    }}
                                                    role="radio"
                                                    aria-checked={priority === option.value}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setPriority(option.value);
                                                            setData('priority', option.value);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center justify-center w-6 h-6 mr-3 mt-0.5">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                            priority === option.value 
                                                                ? 'border-current bg-current' 
                                                                : 'border-gray-400 dark:border-gray-600'
                                                        }`}>
                                                            {priority === option.value && (
                                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{option.icon}</span>
                                                            <Label 
                                                                className={`font-semibold cursor-pointer ${option.color} text-lg`}
                                                            >
                                                                {option.label}
                                                            </Label>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.priority && <p className="text-sm text-red-600 dark:text-red-400">{errors.priority}</p>}
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="font-medium">Estimated Response Time:</span>
                                        </div>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li className="text-green-600 dark:text-green-400">
                                                <span className="font-medium">Low Priority:</span> 3-7 business days
                                            </li>
                                            <li className="text-amber-600 dark:text-amber-400">
                                                <span className="font-medium">Medium Priority:</span> 1-3 business days
                                            </li>
                                            <li className="text-red-600 dark:text-red-400">
                                                <span className="font-medium">High Priority:</span> Within 24 hours
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Evidence Upload - Mobile Optimized */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                        <Camera className="h-5 w-5 text-purple-500" />
                                        Evidence & Documents
                                        <Badge variant="outline" className="ml-2">
                                            {files.length}/10
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Add photos, videos, or documents to support your complaint
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        multiple
                                        accept="image/*,.pdf,video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        aria-label="Upload evidence files"
                                    />
                                    
                                    <div 
                                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 md:p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all active:scale-[0.99]"
                                        onClick={() => fileInputRef.current?.click()}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                    >
                                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                                            <Upload className="h-8 w-8 md:h-10 md:w-10 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base font-medium">
                                            Tap to upload evidence
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                            JPG, PNG, PDF, MP4 • Max 5MB each • Max 10 files
                                        </p>
                                        <Button type="button" variant="outline" size={isMobile ? "sm" : "default"}>
                                            <Camera className="h-4 w-4 mr-2" />
                                            Choose Files
                                        </Button>
                                    </div>

                                    {/* File Preview */}
                                    {files.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Uploaded Evidence</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Remove all files?')) {
                                                            files.forEach(file => removeFile(file.id));
                                                        }
                                                    }}
                                                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <div className="grid gap-3">
                                                {files.map((file) => (
                                                    <div key={file.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            {file.type.startsWith('image/') ? (
                                                                <div className="relative">
                                                                    <img 
                                                                        src={file.preview} 
                                                                        alt={file.name}
                                                                        className="w-12 h-12 object-cover rounded"
                                                                        loading="lazy"
                                                                    />
                                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <Camera className="h-3 w-3 text-white" />
                                                                    </div>
                                                                </div>
                                                            ) : file.type === 'application/pdf' ? (
                                                                <div className="relative">
                                                                    <FileText className="w-12 h-12 text-red-500 dark:text-red-400 p-2" />
                                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                                        <span className="text-[10px] font-bold text-white">PDF</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <FileText className="w-12 h-12 text-blue-500 dark:text-blue-400 p-2" />
                                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                                        <span className="text-[10px] font-bold text-white">VID</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-sm truncate">
                                                                    {file.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">•</span>
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {file.type.split('/')[1].toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                                            onClick={() => removeFile(file.id)}
                                                            aria-label={`Remove ${file.name}`}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">
                                                    Tips for effective evidence:
                                                </p>
                                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Take clear, well-lit photos showing the issue</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Include location markers or landmarks if possible</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Add timestamps in photo metadata or description</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>Upload relevant documents like receipts or notices</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.evidence && <p className="text-sm text-red-600 dark:text-red-400">{errors.evidence}</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Summary & Information */}
                        <div className="space-y-6">
                            {/* Emergency Contact */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <ShieldAlert className="h-5 w-5" />
                                        Emergency Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-col gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            <span className="font-medium">Emergency Hotline:</span>
                                        </div>
                                        <a 
                                            href="tel:911" 
                                            className="text-red-600 dark:text-red-400 font-bold text-xl hover:underline"
                                        >
                                            911
                                        </a>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            For life-threatening emergencies only
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <span className="font-medium">Barangay Office:</span>
                                        </div>
                                        <a 
                                            href="tel:02-8123-4567" 
                                            className="text-blue-600 dark:text-blue-400 font-bold text-lg hover:underline"
                                        >
                                            (02) 8123-4567
                                        </a>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-3 w-3 text-gray-500" />
                                            <a 
                                                href="mailto:barangay@example.com" 
                                                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                                            >
                                                barangay@example.com
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Complaint Summary */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        Complaint Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                                <span className="font-medium">{selectedType?.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                                                <span className={`font-semibold ${
                                                    priority === 'high' ? 'text-red-600 dark:text-red-400' :
                                                    priority === 'medium' ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-500'
                                                }`}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Attachments:</span>
                                                <span className="font-medium">{files.length} file(s)</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Anonymous:</span>
                                                <span className="font-medium">{anonymous ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                        <Separator className="dark:bg-gray-700" />
                                        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <Clock className="h-4 w-4" />
                                                Estimated Response Time
                                            </div>
                                            <p className={`text-sm font-bold ${
                                                priority === 'high' ? 'text-red-600 dark:text-red-400' :
                                                priority === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                                            }`}>
                                                {priority === 'high' ? 'Within 24 hours' : 
                                                 priority === 'medium' ? '1-3 business days' : 
                                                 '3-7 business days'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Important Information */}
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                        Important Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>Your complaint will be reviewed by barangay officials</span>
                                        </div>
                                        <div className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>False reports may result in penalties under local ordinances</span>
                                        </div>
                                        <div className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>You'll receive updates via email/SMS on the status</span>
                                        </div>
                                        <div className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>For immediate threats to life or property, call 911 first</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Section with Anonymous Option - Mobile Sticky Bottom */}
                            <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80 backdrop-blur-sm border-t dark:border-gray-800 p-4 z-30' : 'sticky top-6'}`}>
                                <Card className={`${isMobile ? 'shadow-xl border-0' : ''} dark:bg-gray-800 dark:border-gray-700`}>
                                    <CardContent className={`${isMobile ? 'p-3' : 'pt-6'}`}>
                                        <div className="space-y-4">
                                            {/* Anonymous Option */}
                                            <div className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50">
                                                <div className="space-y-0.5 flex-1 min-w-0">
                                                    <div className="font-medium flex items-center gap-2 text-sm md:text-base">
                                                        <Shield className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">File Anonymously</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Your identity will be kept confidential
                                                    </p>
                                                </div>
                                                <div className="cursor-pointer flex-shrink-0">
                                                    <Switch
                                                        id="anonymous"
                                                        checked={anonymous}
                                                        onCheckedChange={handleAnonymousToggle}
                                                        className="data-[state=checked]:bg-blue-600"
                                                        aria-label="File complaint anonymously"
                                                    />
                                                </div>
                                            </div>

                                            {/* Submit Buttons */}
                                            <Button 
                                                type="submit" 
                                                className="w-full h-12 md:h-14 text-base md:text-lg font-semibold" 
                                                disabled={isSubmitting || processing}
                                            >
                                                {isSubmitting || processing ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                        Submitting Complaint...
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-5 w-5 mr-2" />
                                                        Submit Complaint
                                                    </>
                                                )}
                                            </Button>
                                            
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    By submitting, you confirm that all information is accurate and truthful.
                                                </p>
                                                {anonymous && (
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                                                        ✓ This complaint will be submitted anonymously
                                                    </p>
                                                )}
                                                {isMobile && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                        You can save as draft anytime
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Bottom Spacer */}
                    {isMobile && <div className="h-24"></div>}
                </form>
            </div>
        </ResidentLayout>
    );
}