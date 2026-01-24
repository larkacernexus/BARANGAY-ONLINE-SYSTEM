import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    ShieldAlert,
    MessageSquare,
    Volume2,
    Trash2,
    Home,
    Car,
    Users,
    Wifi,
    FileWarning
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
    const [activeStep, setActiveStep] = useState(1);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [isButtonsVisible, setIsButtonsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                document.body.style.overflow = 'auto';
            }
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

    // Define hide/show functions
    const hideButtons = useCallback(() => {
        setIsButtonsVisible(false);
    }, []);

    const showButtons = useCallback(() => {
        setIsButtonsVisible(true);
    }, []);

    // Handle scroll to hide/show buttons (SAME LOGIC AS MOBILE FOOTER)
    useEffect(() => {
        if (!isMobile) return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 100; // Same as mobile footer
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);
            
            // Only trigger if significant scroll happened
            if (scrollDelta < 5) return;
            
            if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
                // Scrolling DOWN - hide with slight delay for smoother feel
                setTimeout(() => hideButtons(), 100);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling UP - show immediately
                showButtons();
            }
            
            // Always show buttons when at the top of the page
            if (currentScrollY < 30) {
                showButtons();
            }
            
            setLastScrollY(currentScrollY);
        };

        // Debounced scroll handler for smoother performance
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

    // Handle form step navigation
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

    const complaintTypes = [
        { id: 'noise', name: 'Noise', icon: Volume2, description: 'Loud music, parties', color: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10', iconColor: 'text-orange-600 dark:text-orange-400' },
        { id: 'sanitation', name: 'Sanitation', icon: Trash2, description: 'Garbage, cleanliness', color: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10', iconColor: 'text-amber-600 dark:text-amber-400' },
        { id: 'security', name: 'Security', icon: Shield, description: 'Safety concerns', color: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10', iconColor: 'text-red-600 dark:text-red-400' },
        { id: 'infrastructure', name: 'Infrastructure', icon: Home, description: 'Roads, facilities', color: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10', iconColor: 'text-blue-600 dark:text-blue-400' },
        { id: 'traffic', name: 'Traffic', icon: Car, description: 'Parking, congestion', color: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10', iconColor: 'text-purple-600 dark:text-purple-400' },
        { id: 'neighbor', name: 'Neighbor', icon: Users, description: 'Disputes, conflicts', color: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10', iconColor: 'text-green-600 dark:text-green-400' },
        { id: 'utilities', name: 'Utilities', icon: Wifi, description: 'Water, electricity', color: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-900/10', iconColor: 'text-cyan-600 dark:text-cyan-400' },
        { id: 'others', name: 'Others', icon: AlertCircle, description: 'Other issues', color: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900/10', iconColor: 'text-gray-600 dark:text-gray-400' },
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
            const maxSize = isMobile ? 3 * 1024 * 1024 : 5 * 1024 * 1024; // 3MB for mobile, 5MB for desktop
            
            if (!validTypes.includes(file.type)) {
                toast.error(`Invalid file type: ${file.name}. Please use JPG, PNG, PDF, or MP4.`);
                return false;
            }
            
            if (file.size > maxSize) {
                toast.error(`File too large (max ${isMobile ? '3MB' : '5MB'}): ${file.name}`);
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
    }, [files.length, data.evidence, isMobile]);

    const removeFile = useCallback((id: string) => {
        setFiles(prev => {
            const newFiles = prev.filter(file => file.id !== id);
            const removedFile = prev.find(file => file.id === id);
            
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
                toast.success('Complaint submitted successfully!', {
                    duration: 5000,
                    action: {
                        label: 'View Status',
                        onClick: () => window.location.href = route('my.complaints.index')
                    }
                });
                localStorage.removeItem('complaint_draft');
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
        toast.success('Draft saved', {
            description: 'Your complaint has been saved as a draft.',
            duration: 3000
        });
    }, [data]);

    const handleAnonymousToggle = useCallback(() => {
        const newValue = !anonymous;
        setAnonymous(newValue);
        setData('is_anonymous', newValue);
        
        toast.info(newValue ? 
            'Your complaint will be submitted anonymously.' :
            'Your identity will be visible for follow-up.',
            { duration: 3000 }
        );
    }, [anonymous, setData]);

    // Load draft if exists
    useEffect(() => {
        const savedDraft = localStorage.getItem('complaint_draft');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            const shouldLoad = window.confirm('You have a saved draft. Would you like to continue?');
            
            if (shouldLoad) {
                setData(draft);
                setComplaintType(draft.type);
                setPriority(draft.priority);
                setAnonymous(draft.is_anonymous);
                toast.info('Draft loaded');
            }
        }
    }, [setData]);

    // Progress steps for mobile
    const steps = [
        { number: 1, title: 'Type', description: 'Select complaint type' },
        { number: 2, title: 'Details', description: 'Add information' },
        { number: 3, title: 'Evidence', description: 'Attach files' },
        { number: 4, title: 'Review', description: 'Submit complaint' },
    ];

    // Priority options with mobile-friendly icons
    const priorityOptions = [
        { 
            value: 'low', 
            label: 'Low', 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-50 dark:bg-green-900/20', 
            description: 'Minor issue',
            icon: '📋'
        },
        { 
            value: 'medium', 
            label: 'Medium', 
            color: 'text-amber-600 dark:text-amber-400', 
            bg: 'bg-amber-50 dark:bg-amber-900/20', 
            description: 'Needs attention',
            icon: '⚠️'
        },
        { 
            value: 'high', 
            label: 'High', 
            color: 'text-red-600 dark:text-red-400', 
            bg: 'bg-red-50 dark:bg-red-900/20', 
            description: 'Urgent - act now',
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
            <div className="space-y-4 md:space-y-6">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobile Header with Progress */}
                    {isMobile && (
                        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <Link href="/resident/complaints" className="flex-shrink-0">
                                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold truncate">File Complaint</h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={(activeStep / 4) * 100} className="h-1.5 flex-1" />
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                Step {activeStep} of 4
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowEmergencyModal(true)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Header */}
                    {!isMobile && (
            <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center justify-between">
                               <div className="hidden lg:flex items-center gap-4">
                     <Link href="/my-complaints">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">File a Complaint</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Report issues to barangay officials
                        </p>
                    </div>

                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveDraft}
                                        disabled={isSubmitting}
                                    >
                                        Save Draft
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowEmergencyModal(true)}
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Emergency
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Emergency Modal */}
                    {showEmergencyModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Emergency Contact</h3>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowEmergencyModal(false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ShieldAlert className="h-5 w-5 text-red-600" />
                                                <span className="font-bold">Emergency Hotline</span>
                                            </div>
                                            <a 
                                                href="tel:911" 
                                                className="text-red-600 text-2xl font-bold hover:underline block text-center py-2"
                                            >
                                                911
                                            </a>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                                Life-threatening emergencies only
                                            </p>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Phone className="h-5 w-5 text-blue-600" />
                                                <span className="font-bold">Barangay Office</span>
                                            </div>
                                            <a 
                                                href="tel:02-8123-4567" 
                                                className="text-blue-600 text-xl font-bold hover:underline block text-center py-2"
                                            >
                                                (02) 8123-4567
                                            </a>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setShowEmergencyModal(false)}
                                        className="w-full mt-6"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
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
                                {/* Step 1: Complaint Type (Visible on mobile when activeStep === 1) */}
                                {(!isMobile || activeStep === 1) && (
                            <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    1
                                                </span>
                                                What type of issue?
                                            </h2>
                                        </div>
                                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                                            {complaintTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    className={`relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all text-left border-2 ${
                                                        complaintType === type.id 
                                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-500/20' 
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                                                    }`}
                                                    onClick={() => {
                                                        setComplaintType(type.id);
                                                        setData('type', type.id);
                                                        if (isMobile) nextStep();
                                                    }}
                                                >
                                                    <div className="flex flex-col items-center text-center gap-3">
                                                        <div className={`p-3 rounded-full bg-gradient-to-br ${type.color}`}>
                                                            <type.icon className={`h-5 w-5 ${type.iconColor}`} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">{type.name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {type.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Complaint Details (Visible on mobile when activeStep === 2) */}
                                {(!isMobile || activeStep === 2) && (
                            <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    2
                                                </span>
                                                Tell us more
                                            </h2>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="subject" className="font-medium">
                                                    Brief summary *
                                                </Label>
                                                <Input
                                                    id="subject"
                                                    value={data.subject}
                                                    onChange={e => setData('subject', e.target.value)}
                                                    placeholder="What's the main issue?"
                                                    className="h-12 rounded-lg"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label htmlFor="description" className="font-medium">
                                                        Detailed description *
                                                    </Label>
                                                    <span className="text-xs text-gray-500">
                                                        {data.description.length}/500
                                                    </span>
                                                </div>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    placeholder="Please provide all relevant details..."
                                                    rows={4}
                                                    className="resize-none rounded-lg"
                                                    maxLength={500}
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Include when, where, and how it happened
                                                </p>
                                            </div>

                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="location" className="font-medium flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        Location *
                                                    </Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        onChange={e => setData('location', e.target.value)}
                                                        placeholder="Where did this happen?"
                                                        className="h-12 rounded-lg"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="incident_date" className="font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        When did it happen?
                                                    </Label>
                                                    <Input
                                                        id="incident_date"
                                                        type="datetime-local"
                                                        value={data.incident_date}
                                                        onChange={e => setData('incident_date', e.target.value)}
                                                        className="h-12 rounded-lg"
                                                    />
                                                </div>
                                            </div>

                                            {/* Priority Selection */}
                                            <div className="space-y-2 pt-2">
                                                <Label className="font-medium flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    How urgent is this?
                                                </Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {priorityOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            className={`p-3 rounded-lg border transition-all ${option.bg} ${
                                                                priority === option.value 
                                                                    ? 'ring-2 ring-current border-current' 
                                                                    : 'border-gray-200 dark:border-gray-700'
                                                            }`}
                                                            onClick={() => {
                                                                setPriority(option.value);
                                                                setData('priority', option.value);
                                                            }}
                                                        >
                                                            <div className="text-lg mb-1">{option.icon}</div>
                                                            <div className={`font-semibold text-sm ${option.color}`}>
                                                                {option.label}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Evidence (Visible on mobile when activeStep === 3) */}
                                {(!isMobile || activeStep === 3) && (
                            <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    3
                                                </span>
                                                Add evidence (optional)
                                            </h2>
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                multiple
                                                accept="image/*,.pdf,video/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            
                                            <div 
                                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-600 transition-all active:scale-[0.98] bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                                                    <Upload className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                                                </div>
                                                <p className="font-medium mb-2">Add photos or documents</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    JPG, PNG, PDF, MP4 • Max {isMobile ? '3MB' : '5MB'}
                                                </p>
                                            </div>

                                            {/* File List */}
                                            {files.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Files ({files.length}/10)</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm('Remove all files?')) {
                                                                    files.forEach(file => removeFile(file.id));
                                                                }
                                                            }}
                                                            className="text-sm text-red-600 dark:text-red-400"
                                                        >
                                                            Clear all
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {files.map((file) => (
                                                            <div key={file.id} className="flex items-center justify-between border dark:border-gray-700 rounded-xl p-3">
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    {file.type.startsWith('image/') ? (
                                                                        <img 
                                                                            src={file.preview} 
                                                                            alt={file.name}
                                                                            className="w-12 h-12 object-cover rounded-lg"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                                                            <FileText className="h-6 w-6 text-gray-500" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-medium text-sm truncate">
                                                                            {file.name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {(file.size / 1024 / 1024).toFixed(1)} MB
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => removeFile(file.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Review & Submit (Visible on mobile when activeStep === 4) */}
                                {(!isMobile || activeStep === 4) && (
                            <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    4
                                                </span>
                                                Review & submit
                                            </h2>
                                        </div>
                                        <div className="space-y-6">
                                            {/* Complaint Summary */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                                                    <span className="font-semibold">{selectedType?.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Priority</span>
                                                    <Badge variant={
                                                        priority === 'high' ? 'destructive' :
                                                        priority === 'medium' ? 'secondary' : 'outline'
                                                    }>
                                                        {priority.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Location</span>
                                                    <span className="font-semibold text-right max-w-[200px] truncate">
                                                        {data.location || 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Attachments</span>
                                                    <span className="font-semibold">{files.length} files</span>
                                                </div>
                                            </div>

                                            {/* Anonymous Option */}
                                            <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-xl">
                                                <div className="space-y-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        File anonymously
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Hide your identity from officials
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="anonymous"
                                                    checked={anonymous}
                                                    onCheckedChange={handleAnonymousToggle}
                                                    className="data-[state=checked]:bg-blue-600"
                                                />
                                            </div>

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
                                                            <li>• You understand false reports may have consequences</li>
                                                            <li>• You'll receive updates on your complaint status</li>
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
                                    {/* Summary Card */}
                            <div className="pb-32 lg:pb-0">
                                        <h3 className="text-lg font-bold mb-4">Summary</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Type</span>
                                                    <Badge variant="secondary">{selectedType?.name}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Priority</span>
                                                    <span className={`font-semibold ${
                                                        priority === 'high' ? 'text-red-600' :
                                                        priority === 'medium' ? 'text-amber-600' : 'text-green-600'
                                                    }`}>
                                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Attachments</span>
                                                    <span className="font-semibold">{files.length} files</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Clock className="h-4 w-4" />
                                                    Estimated Response
                                                </div>
                                                <p className={`font-bold ${
                                                    priority === 'high' ? 'text-red-600' :
                                                    priority === 'medium' ? 'text-amber-600' : 'text-green-600'
                                                    }`}>
                                                    {priority === 'high' ? 'Within 24 hours' : 
                                                    priority === 'medium' ? '1-3 business days' : 
                                                    '3-7 business days'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Tips */}
                                    <div className="pb-32 lg:pb-0">
                                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                            <Info className="h-5 w-5" />
                                            Tips
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">Be specific with dates, times, and locations</span>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">Add photos as evidence when possible</span>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">Check complaint status in your dashboard</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation Footer - ABOVE the main mobile footer */}
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
                                    <Link href="/resident/complaints" className="flex-1">
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
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button 
                                        type="submit" 
                                        className="flex-1" 
                                        disabled={isSubmitting || processing}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Complaint'
                                        )}
                                    </Button>
                                )}
                            </div>
                            {activeStep === 4 && (
                                <div className="text-center mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Tap submit to send your complaint
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveDraft}
                                        disabled={isSubmitting}
                                    >
                                        Save as Draft
                                    </Button>
                                    <div className="flex items-center gap-4">
                                        <Link href="/resident/complaints">
                                            <Button type="button" variant="ghost">
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button 
                                            type="submit" 
                                            size="lg" 
                                            className="px-8"
                                            disabled={isSubmitting || processing}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Complaint'
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