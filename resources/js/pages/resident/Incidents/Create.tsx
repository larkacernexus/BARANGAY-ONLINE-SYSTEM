import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    FileWarning,
    User,
    Eye,
    EyeOff,
    Clipboard,
    Siren,
    Hand,
    Flame,
    Building,
    AlertOctagon,
    Target
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

export default function FileBlotter() {
    const [incidentType, setIncidentType] = useState('theft');
    const [severity, setSeverity] = useState('medium');
    const [anonymous, setAnonymous] = useState(false);
    const [isWitnessAvailable, setIsWitnessAvailable] = useState(false);
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

    const { data, setData, post, processing, errors } = useForm({
        type: 'theft',
        title: '',
        description: '',
        location: '',
        incident_date: '',
        incident_time: '',
        severity: 'medium',
        is_anonymous: false,
        witness_name: '',
        witness_contact: '',
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

    // Incident Types - Police/Crime related
    const incidentTypes = [
        { id: 'theft', name: 'Theft/Robbery', icon: AlertCircle, description: 'Stolen items, robbery', color: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10', iconColor: 'text-red-600 dark:text-red-400' },
        { id: 'assault', name: 'Assault', icon: Hand, description: 'Physical attack', color: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10', iconColor: 'text-orange-600 dark:text-orange-400' },
        { id: 'vandalism', name: 'Vandalism', icon: Building, description: 'Property damage', color: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10', iconColor: 'text-amber-600 dark:text-amber-400' },
        { id: 'fire', name: 'Fire', icon: Flame, description: 'Fire incident', color: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10', iconColor: 'text-red-600 dark:text-red-400' },
        { id: 'accident', name: 'Accident', icon: Car, description: 'Vehicle accident', color: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10', iconColor: 'text-blue-600 dark:text-blue-400' },
        { id: 'suspicious', name: 'Suspicious', icon: Eye, description: 'Suspicious activity', color: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10', iconColor: 'text-purple-600 dark:text-purple-400' },
        { id: 'nuisance', name: 'Public Nuisance', icon: Volume2, description: 'Public disturbance', color: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10', iconColor: 'text-green-600 dark:text-green-400' },
        { id: 'other', name: 'Other', icon: AlertOctagon, description: 'Other incidents', color: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900/10', iconColor: 'text-gray-600 dark:text-gray-400' },
    ];

    const selectedType = incidentTypes.find(type => type.id === incidentType);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        
        if (selectedFiles.length + files.length > 10) {
            toast.error('Maximum 10 files allowed');
            return;
        }
        
        // Validate file sizes and types
        const validFiles = selectedFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
            const maxSize = isMobile ? 3 * 1024 * 1024 : 5 * 1024 * 1024;
            
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
        if (!data.title.trim()) errors.push('Incident title is required');
        if (!data.description.trim()) errors.push('Description is required');
        if (!data.location.trim()) errors.push('Location is required');
        if (!data.incident_date) errors.push('Date of incident is required');
        if (data.description.trim().length < 30) errors.push('Description should be at least 30 characters');
        return errors;
    }, [data.title, data.description, data.location, data.incident_date]);

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
        
        post(route('my-incidents.store'), {
            onSuccess: () => {
                toast.success('Blotter report submitted successfully!', {
                    duration: 5000,
                    action: {
                        label: 'View Status',
                        onClick: () => window.location.href = route('my-incidents.index')
                    }
                });
                localStorage.removeItem('blotter_draft');
            },
            onError: (errors) => {
                if (errors.server) {
                    toast.error('Server error. Please try again later.');
                } else {
                    toast.error('Failed to submit blotter report. Please check your information.');
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
            title: data.title,
            description: data.description,
            location: data.location,
            incident_date: data.incident_date,
            incident_time: data.incident_time,
            severity: data.severity,
            is_anonymous: data.is_anonymous,
            witness_name: data.witness_name,
            witness_contact: data.witness_contact,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('blotter_draft', JSON.stringify(draft));
        toast.success('Draft saved', {
            description: 'Your blotter report has been saved as a draft.',
            duration: 3000
        });
    }, [data]);

    const handleAnonymousToggle = useCallback(() => {
        const newValue = !anonymous;
        setAnonymous(newValue);
        setData('is_anonymous', newValue);
        
        toast.info(newValue ? 
            'Your report will be submitted anonymously.' :
            'Your identity will be visible for police follow-up.',
            { duration: 3000 }
        );
    }, [anonymous, setData]);

    // Load draft if exists
    useEffect(() => {
        const savedDraft = localStorage.getItem('blotter_draft');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            const shouldLoad = window.confirm('You have a saved draft. Would you like to continue?');
            
            if (shouldLoad) {
                setData(draft);
                setIncidentType(draft.type);
                setSeverity(draft.severity);
                setAnonymous(draft.is_anonymous);
                setIsWitnessAvailable(!!draft.witness_name);
                toast.info('Draft loaded');
            }
        }
    }, [setData]);

    // Progress steps for mobile
    const steps = [
        { number: 1, title: 'Type', description: 'Select incident type' },
        { number: 2, title: 'Details', description: 'Incident information' },
        { number: 3, title: 'Evidence', description: 'Attach evidence' },
        { number: 4, title: 'Review', description: 'Submit report' },
    ];

    // Severity options
    const severityOptions = [
        { 
            value: 'low', 
            label: 'Low', 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-50 dark:bg-green-900/20', 
            description: 'Minor incident',
            icon: '📋'
        },
        { 
            value: 'medium', 
            label: 'Medium', 
            color: 'text-amber-600 dark:text-amber-400', 
            bg: 'bg-amber-50 dark:bg-amber-900/20', 
            description: 'Requires police attention',
            icon: '⚠️'
        },
        { 
            value: 'high', 
            label: 'High', 
            color: 'text-red-600 dark:text-red-400', 
            bg: 'bg-red-50 dark:bg-red-900/20', 
            description: 'Urgent - needs immediate response',
            icon: '🚨'
        },
        { 
            value: 'critical', 
            label: 'Critical', 
            color: 'text-red-700 dark:text-red-300', 
            bg: 'bg-red-100 dark:bg-red-900/30', 
            description: 'Life-threatening emergency',
            icon: '🆘'
        },
    ];

    return (
        <ResidentLayout
            title="File Blotter Report"
            breadcrumbs={[
                { title: 'Dashboard', href: '/residentdashboard' },
                { title: 'My Blotter', href: '/my-incidents' },
                { title: 'File Report', href: '/incidents/report' }
            ]}
        >
            <div className="space-y-4 md:space-y-6">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobile Header with Progress */}
                    {isMobile && (
                        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <Link href="/my-incidents" className="flex-shrink-0">
                                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold truncate">File Blotter</h1>
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
                                    <Link href="/my-incidents">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </Button>
                                    </Link>
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">File Blotter Report</h1>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            Report incidents to barangay and police
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
                                                <Siren className="h-5 w-5 text-red-600" />
                                                <span className="font-bold">Emergency Police</span>
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
                                                <Shield className="h-5 w-5 text-blue-600" />
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
                                {/* Step 1: Incident Type */}
                                {(!isMobile || activeStep === 1) && (
                                    <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    1
                                                </span>
                                                What type of incident?
                                            </h2>
                                        </div>
                                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                                            {incidentTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    className={`relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all text-left border-2 ${
                                                        incidentType === type.id 
                                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-500/20' 
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                                                    }`}
                                                    onClick={() => {
                                                        setIncidentType(type.id);
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

                                {/* Step 2: Incident Details */}
                                {(!isMobile || activeStep === 2) && (
                                    <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    2
                                                </span>
                                                Incident Details
                                            </h2>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="font-medium">
                                                    Incident Title *
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={e => setData('title', e.target.value)}
                                                    placeholder="Brief title of the incident"
                                                    className="h-12 rounded-lg"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label htmlFor="description" className="font-medium">
                                                        Detailed Description *
                                                    </Label>
                                                    <span className="text-xs text-gray-500">
                                                        {data.description.length}/1000
                                                    </span>
                                                </div>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    placeholder="Describe what happened in detail..."
                                                    rows={5}
                                                    className="resize-none rounded-lg"
                                                    maxLength={1000}
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Include sequence of events, people involved, and any injuries
                                                </p>
                                            </div>

                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="location" className="font-medium flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        Incident Location *
                                                    </Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        onChange={e => setData('location', e.target.value)}
                                                        placeholder="Exact location where it happened"
                                                        className="h-12 rounded-lg"
                                                    />
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="incident_date" className="font-medium flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            Date *
                                                        </Label>
                                                        <Input
                                                            id="incident_date"
                                                            type="date"
                                                            value={data.incident_date}
                                                            onChange={e => setData('incident_date', e.target.value)}
                                                            className="h-12 rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="incident_time" className="font-medium flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            Time (approx)
                                                        </Label>
                                                        <Input
                                                            id="incident_time"
                                                            type="time"
                                                            value={data.incident_time}
                                                            onChange={e => setData('incident_time', e.target.value)}
                                                            className="h-12 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Severity Selection */}
                                            <div className="space-y-2 pt-2">
                                                <Label className="font-medium flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Severity Level
                                                </Label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {severityOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            className={`p-3 rounded-lg border transition-all ${option.bg} ${
                                                                severity === option.value 
                                                                    ? 'ring-2 ring-current border-current' 
                                                                    : 'border-gray-200 dark:border-gray-700'
                                                            }`}
                                                            onClick={() => {
                                                                setSeverity(option.value);
                                                                setData('severity', option.value);
                                                            }}
                                                        >
                                                            <div className="text-lg mb-1">{option.icon}</div>
                                                            <div className={`font-semibold text-sm ${option.color}`}>
                                                                {option.label}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {option.description}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Witness Information */}
                                            <div className="space-y-3 pt-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-medium flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        Witness Information
                                                    </Label>
                                                    <Switch
                                                        checked={isWitnessAvailable}
                                                        onCheckedChange={setIsWitnessAvailable}
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                </div>
                                                
                                                {isWitnessAvailable && (
                                                    <div className="space-y-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="witness_name">Witness Name</Label>
                                                            <Input
                                                                id="witness_name"
                                                                value={data.witness_name}
                                                                onChange={e => setData('witness_name', e.target.value)}
                                                                placeholder="Full name of witness"
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="witness_contact">Contact Information</Label>
                                                            <Input
                                                                id="witness_contact"
                                                                value={data.witness_contact}
                                                                onChange={e => setData('witness_contact', e.target.value)}
                                                                placeholder="Phone number or email"
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Evidence */}
                                {(!isMobile || activeStep === 3) && (
                                    <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    3
                                                </span>
                                                Add Evidence
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Evidence is crucial for police investigation
                                            </p>
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
                                                    <Camera className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                                                </div>
                                                <p className="font-medium mb-2">Add Evidence (Photos, Videos, Documents)</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    JPG, PNG, PDF, MP4 • Max {isMobile ? '3MB' : '5MB'}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    Important for police investigation
                                                </p>
                                            </div>

                                            {/* File List */}
                                            {files.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Evidence Files ({files.length}/10)</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm('Remove all evidence?')) {
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

                                {/* Step 4: Review & Submit */}
                                {(!isMobile || activeStep === 4) && (
                                    <div className="pb-32 lg:pb-0">
                                        <div className="pb-3">
                                            <h2 className="text-lg font-bold flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                                    4
                                                </span>
                                                Review & Submit to Police
                                            </h2>
                                        </div>
                                        <div className="space-y-6">
                                            {/* Blotter Summary */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Incident Type</span>
                                                    <span className="font-semibold">{selectedType?.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Severity</span>
                                                    <Badge variant={
                                                        severity === 'critical' ? 'destructive' :
                                                        severity === 'high' ? 'destructive' :
                                                        severity === 'medium' ? 'secondary' : 'outline'
                                                    }>
                                                        {severity.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Location</span>
                                                    <span className="font-semibold text-right max-w-[200px] truncate">
                                                        {data.location || 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <span className="text-gray-600 dark:text-gray-400">Evidence</span>
                                                    <span className="font-semibold">{files.length} files</span>
                                                </div>
                                                {isWitnessAvailable && data.witness_name && (
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                        <span className="text-gray-600 dark:text-gray-400">Witness</span>
                                                        <span className="font-semibold">{data.witness_name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Anonymous Option */}
                                            <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-xl">
                                                <div className="space-y-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        Report Anonymously
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Your identity will be hidden from police records
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="anonymous"
                                                    checked={anonymous}
                                                    onCheckedChange={handleAnonymousToggle}
                                                    className="data-[state=checked]:bg-blue-600"
                                                />
                                            </div>

                                            {/* Legal Warning */}
                                            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-2">
                                                            Important Legal Notice
                                                        </p>
                                                        <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                                                            <li>• This is an official police blotter report</li>
                                                            <li>• False reports may result in legal action</li>
                                                            <li>• All information must be accurate and truthful</li>
                                                            <li>• This report may be used as evidence</li>
                                                            <li>• Police may contact you for investigation</li>
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
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Clipboard className="h-5 w-5" />
                                                Blotter Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Incident Type</span>
                                                    <Badge variant="secondary">{selectedType?.name}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Severity</span>
                                                    <span className={`font-bold ${
                                                        severity === 'critical' ? 'text-red-700 dark:text-red-300' :
                                                        severity === 'high' ? 'text-red-600 dark:text-red-400' :
                                                        severity === 'medium' ? 'text-amber-600 dark:text-amber-400' : 
                                                        'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Evidence</span>
                                                    <span className="font-semibold">{files.length} files</span>
                                                </div>
                                                {isWitnessAvailable && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Witness</span>
                                                        <Badge variant="outline">Available</Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Siren className="h-4 w-4" />
                                                    Police Response Time
                                                </div>
                                                <p className={`font-bold ${
                                                    severity === 'critical' ? 'text-red-700 dark:text-red-300' :
                                                    severity === 'high' ? 'text-red-600 dark:text-red-400' :
                                                    severity === 'medium' ? 'text-amber-600 dark:text-amber-400' : 
                                                    'text-green-600 dark:text-green-400'
                                                }`}>
                                                    {severity === 'critical' ? 'Immediate response (15-30 mins)' : 
                                                     severity === 'high' ? 'Within 1-2 hours' : 
                                                     severity === 'medium' ? 'Within 24 hours' : 
                                                     '1-3 business days'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Police Tips */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5" />
                                                Police Investigation Tips
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">Provide exact time and location for faster investigation</span>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <Camera className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">Clear photos/videos are crucial evidence</span>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">Witness information helps police investigation</span>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">Keep your reference number for follow-up</span>
                                            </div>
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
                                    <Link href="/my-incidents" className="flex-1">
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
                                            'Submit to Police'
                                        )}
                                    </Button>
                                )}
                            </div>
                            {activeStep === 4 && (
                                <div className="text-center mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        This will be submitted as an official police report
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
                                        <Link href="/my-incidents">
                                            <Button type="button" variant="ghost">
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button 
                                            type="submit" 
                                            size="lg" 
                                            className="px-8 bg-red-600 hover:bg-red-700"
                                            disabled={isSubmitting || processing}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Submit to Police
                                                </>
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